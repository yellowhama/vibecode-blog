#!/usr/bin/env python3
"""ComfyUI API batch renderer.

Reads a shot manifest + workflow + bindings, injects per-shot parameters,
submits to ComfyUI /prompt API, polls /history for completion, and
downloads outputs.

Usage:
    python comfy_batch_render.py \
        --manifest manifests/shots_planned.json \
        --workflow workflows/v2_standard_workflow.json \
        --bindings workflows/v2_standard_bindings.json \
        --dry-run

    python comfy_batch_render.py \
        --manifest manifests/shots_planned.json \
        --workflow workflows/v2_standard_workflow.json \
        --bindings workflows/v2_standard_bindings.json \
        --output-dir output/renders/my_run
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


DEFAULT_SERVER = "http://127.0.0.1:8188"
POLL_INTERVAL = 5  # seconds
MAX_POLL_TIME = 1800  # 30 minutes per shot


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _api_get(server: str, endpoint: str, timeout: int = 30) -> Any:
    url = f"{server}{endpoint}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _api_post(server: str, endpoint: str, payload: Dict, timeout: int = 30) -> Any:
    url = f"{server}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _download_file(server: str, filename: str, subfolder: str, folder_type: str, dest: Path) -> Path:
    params = urllib.parse.urlencode({
        "filename": filename,
        "subfolder": subfolder,
        "type": folder_type,
    })
    url = f"{server}/view?{params}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, str(dest))
    return dest


import urllib.parse  # noqa: E402


def _check_server(server: str) -> bool:
    try:
        _api_get(server, "/queue", timeout=5)
        return True
    except Exception:
        return False


def _build_api_prompt(workflow: Dict, bindings: Dict, shot: Dict) -> Dict:
    """Build ComfyUI API prompt from workflow + bindings + shot data.

    Injection strategy:
    1. Special-case keys that require transformation (video_duration, input_image).
    2. Generic fallback: any other key in node_mappings is injected directly
       from the matching shot field (supports ControlNet, LoRA, etc.).
    """
    # Deep copy — handle both {"prompt": {…}} and {"nodes": {…}} and flat
    raw = workflow.get("prompt") or workflow.get("nodes") or workflow
    nodes = copy.deepcopy(raw)

    mappings = bindings.get("node_mappings", {})

    # --- Special-case mappings (need value transformation) ---

    # video_duration: convert seconds → frame count, or use raw frame count
    if "video_duration" in mappings:
        node_id = mappings["video_duration"]["node_id"]
        field = mappings["video_duration"]["field"]
        if shot.get("video_duration"):
            # Direct frame count (e.g., 33, 81)
            frame_count = int(shot["video_duration"])
        elif shot.get("duration_sec"):
            fps = 16
            frame_count = max(17, int(shot["duration_sec"] * fps) + 1)
        else:
            frame_count = None
        if frame_count and node_id in nodes:
            nodes[node_id]["inputs"][field] = frame_count

    # input_image: map from shot["keyframe"] or shot["input_image"]
    img_value = shot.get("keyframe") or shot.get("input_image")
    if "input_image" in mappings and img_value:
        node_id = mappings["input_image"]["node_id"]
        field = mappings["input_image"]["field"]
        if node_id in nodes:
            nodes[node_id]["inputs"][field] = img_value

    SPECIAL_KEYS = {"video_duration", "input_image", "filename_prefix"}

    # --- Generic injection for all other mappings ---
    # Maps binding key → shot data key. Tries exact match first, then common aliases.
    SHOT_ALIASES = {
        "positive_prompt": ["prompt_positive", "positive_prompt", "prompt"],
        "negative_prompt": ["prompt_negative", "negative_prompt"],
        "seed": ["seed"],
        "guidance": ["guidance"],
        "width": ["width"],
        "height": ["height"],
        "pose_image": ["pose_image", "pose_ref"],
        "controlnet_strength": ["controlnet_strength", "cn_strength"],
        "pulid_ref_image": ["pulid_ref_image", "ref_face", "face_ref"],
        "pulid_weight": ["pulid_weight"],
        "pulid_start_at": ["pulid_start_at"],
        "pulid_end_at": ["pulid_end_at"],
        "lora_name": ["lora_name", "lora"],
        "lora_strength_model": ["lora_strength_model", "lora_strength"],
        "lora_strength_clip": ["lora_strength_clip"],
        "denoise": ["denoise"],
        "steps": ["steps"],
        "sampler_name": ["sampler_name", "sampler"],
        "scheduler": ["scheduler"],
    }

    for mapping_key, mapping_def in mappings.items():
        if mapping_key in SPECIAL_KEYS:
            continue
        node_id = mapping_def.get("node_id")
        field = mapping_def.get("field")
        if not node_id or not field or node_id not in nodes:
            continue

        # Find value from shot data
        value = None
        aliases = SHOT_ALIASES.get(mapping_key, [mapping_key])
        for alias in aliases:
            if alias in shot and shot[alias] is not None:
                value = shot[alias]
                break

        # Also check mapping_def for static defaults (e.g. model_file)
        if value is None and "default" in mapping_def:
            value = mapping_def["default"]
        if value is None and "model_file" in mapping_def:
            value = mapping_def["model_file"]

        if value is not None:
            # Type coercion for known numeric fields
            if field in ("seed", "noise_seed"):
                value = int(value)
            elif field in ("strength", "denoise", "guidance", "cfg",
                           "lora_strength_model", "lora_strength_clip",
                           "controlnet_strength",
                           "weight", "start_at", "end_at"):
                value = float(value)
            nodes[node_id]["inputs"][field] = value

    # Set filename prefix
    for nid, node in nodes.items():
        if node.get("class_type") in ("VHS_VideoCombine", "SaveImage"):
            if "filename_prefix" in node.get("inputs", {}):
                node["inputs"]["filename_prefix"] = shot.get("shot_id", "shot")

    return {"prompt": nodes}


def _compute_shot_hash(shot: Dict, workflow: Dict, bindings: Dict) -> str:
    """SHA256 hash for incremental render cache."""
    content = json.dumps({
        "shot": {k: v for k, v in shot.items() if k != "narration"},
        "workflow_version": workflow.get("version", "unknown"),
        "bindings_version": bindings.get("version", "unknown"),
    }, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def _load_render_cache(cache_path: Path) -> Dict[str, Any]:
    if cache_path.exists():
        return _json_load(cache_path)
    return {}


def _save_render_cache(cache_path: Path, cache: Dict[str, Any]) -> None:
    _json_dump(cache_path, cache)


def render_shot(
    server: str,
    api_prompt: Dict,
    shot_id: str,
    output_dir: Path,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Submit one shot to ComfyUI and wait for result."""
    result = {
        "shot_id": shot_id,
        "status": "pending",
        "error": None,
        "saved_files": [],
        "artifact_count": 0,
    }

    if dry_run:
        print(f"  [DRY-RUN] {shot_id}: prompt validated, would submit to {server}")
        result["status"] = "dry_run"
        return result

    # Submit
    try:
        resp = _api_post(server, "/prompt", api_prompt)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        result["status"] = "error"
        result["error"] = f"HTTP Error {exc.code}: {detail[:500]}"
        print(f"  [FAIL] {shot_id}: {result['error']}")
        return result
    except Exception as exc:
        result["status"] = "error"
        result["error"] = str(exc)
        print(f"  [FAIL] {shot_id}: {exc}")
        return result

    prompt_id = resp.get("prompt_id")
    if not prompt_id:
        result["status"] = "error"
        result["error"] = f"No prompt_id in response: {resp}"
        return result

    print(f"  [QUEUED] {shot_id}: prompt_id={prompt_id}")

    # Poll for completion
    start = time.time()
    while time.time() - start < MAX_POLL_TIME:
        time.sleep(POLL_INTERVAL)
        try:
            history = _api_get(server, f"/history/{prompt_id}")
        except Exception:
            continue

        if prompt_id not in history:
            continue

        entry = history[prompt_id]
        status = entry.get("status", {})
        status_str = status.get("status_str", "")

        if status_str == "error":
            result["status"] = "error"
            messages = status.get("messages", [])
            result["error"] = f"ComfyUI error: {json.dumps(messages)[:500]}"
            print(f"  [FAIL] {shot_id}: {result['error']}")
            return result

        outputs = entry.get("outputs", {})
        if not outputs:
            continue

        # Download outputs
        shot_dir = output_dir / shot_id
        shot_dir.mkdir(parents=True, exist_ok=True)

        for node_id, node_output in outputs.items():
            # Video outputs (VHS_VideoCombine)
            for vid in node_output.get("gifs", []):
                fname = vid.get("filename", "")
                subfolder = vid.get("subfolder", "")
                ftype = vid.get("type", "output")
                dest = shot_dir / fname
                try:
                    _download_file(server, fname, subfolder, ftype, dest)
                    result["saved_files"].append(str(dest))
                    result["artifact_count"] += 1
                    print(f"  [SAVED] {shot_id}: {fname}")
                except Exception as exc:
                    print(f"  [WARN] {shot_id}: download failed for {fname}: {exc}")

            # Image outputs (SaveImage)
            for img in node_output.get("images", []):
                fname = img.get("filename", "")
                subfolder = img.get("subfolder", "")
                ftype = img.get("type", "output")
                dest = shot_dir / fname
                try:
                    _download_file(server, fname, subfolder, ftype, dest)
                    result["saved_files"].append(str(dest))
                    result["artifact_count"] += 1
                    print(f"  [SAVED] {shot_id}: {fname}")
                except Exception as exc:
                    print(f"  [WARN] {shot_id}: download failed for {fname}: {exc}")

        if result["artifact_count"] > 0:
            result["status"] = "ok"
        else:
            result["status"] = "error"
            result["error"] = "Completed but no artifacts downloaded"

        print(f"  [DONE] {shot_id}: {result['status']} ({result['artifact_count']} files)")
        return result

    result["status"] = "error"
    result["error"] = f"Timeout after {MAX_POLL_TIME}s"
    print(f"  [FAIL] {shot_id}: timeout")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="ComfyUI batch renderer")
    parser.add_argument("--manifest", required=True, type=Path, help="Shot manifest JSON")
    parser.add_argument("--workflow", required=True, type=Path, help="ComfyUI workflow JSON")
    parser.add_argument("--bindings", required=True, type=Path, help="Bindings JSON")
    parser.add_argument("--output-dir", type=Path, default=None, help="Output directory")
    parser.add_argument("--server", default=DEFAULT_SERVER, help="ComfyUI server URL")
    parser.add_argument("--dry-run", action="store_true", help="Validate without rendering")
    parser.add_argument("--force-render", action="store_true", help="Ignore render cache")
    parser.add_argument("--shots", nargs="*", help="Render specific shot IDs only")
    args = parser.parse_args()

    # Load files
    manifest = _json_load(args.manifest)
    workflow = _json_load(args.workflow)
    bindings = _json_load(args.bindings)

    shots = manifest.get("shots", [])
    if not shots:
        print("[FAIL] No shots in manifest")
        return 1

    # Filter shots if specified
    if args.shots:
        shots = [s for s in shots if s.get("shot_id") in args.shots]
        if not shots:
            print(f"[FAIL] No matching shots for: {args.shots}")
            return 1

    # Output directory
    if args.output_dir:
        output_dir = args.output_dir
    else:
        project_id = manifest.get("project_id", "batch")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = Path("systems/video/output/renders") / f"{project_id}_{timestamp}"

    output_dir.mkdir(parents=True, exist_ok=True)

    # Check server
    if not args.dry_run and not _check_server(args.server):
        print(f"[FAIL] ComfyUI server not responding at {args.server}")
        print("  Start with: bash systems/video/scripts/run_comfy_server.sh --detach")
        return 1

    # Render cache
    cache_path = output_dir / ".render_cache.json"
    cache = _load_render_cache(cache_path) if not args.force_render else {}

    # Render log
    render_log = {
        "manifest": str(args.manifest),
        "workflow": str(args.workflow),
        "bindings": str(args.bindings),
        "server": args.server,
        "started_at": datetime.now().isoformat(),
        "summary": {"total": len(shots), "ok": 0, "errors": 0, "cached": 0, "dry_run": 0},
        "shots": [],
    }

    print(f"[START] {len(shots)} shots → {output_dir}")
    print(f"[SERVER] {args.server}")
    if args.dry_run:
        print("[MODE] dry-run")
    print()

    for idx, shot in enumerate(shots, 1):
        shot_id = shot.get("shot_id", f"shot_{idx:03d}")
        print(f"[{idx}/{len(shots)}] {shot_id}")

        # Check cache
        shot_hash = _compute_shot_hash(shot, workflow, bindings)
        cached = cache.get(shot_id)
        if cached and cached.get("hash") == shot_hash and not args.force_render:
            # Verify files still exist
            files_exist = all(Path(f).exists() for f in cached.get("saved_files", []))
            if files_exist and cached.get("saved_files"):
                print(f"  [CACHED] {shot_id}: hash={shot_hash[:8]}")
                render_log["shots"].append({
                    "shot_id": shot_id,
                    "status": "cached",
                    "saved_files": cached["saved_files"],
                })
                render_log["summary"]["cached"] += 1
                continue

        # Build API prompt
        api_prompt = _build_api_prompt(workflow, bindings, shot)

        # Render
        result = render_shot(
            server=args.server,
            api_prompt=api_prompt,
            shot_id=shot_id,
            output_dir=output_dir,
            dry_run=args.dry_run,
        )

        render_log["shots"].append(result)

        if result["status"] == "ok":
            render_log["summary"]["ok"] += 1
            cache[shot_id] = {
                "hash": shot_hash,
                "saved_files": result["saved_files"],
                "rendered_at": datetime.now().isoformat(),
            }
            _save_render_cache(cache_path, cache)
        elif result["status"] == "dry_run":
            render_log["summary"]["dry_run"] += 1
        else:
            render_log["summary"]["errors"] += 1

        print()

    render_log["finished_at"] = datetime.now().isoformat()

    # Write render log
    log_path = output_dir / "render_log.json"
    _json_dump(log_path, render_log)

    s = render_log["summary"]
    print(f"[DONE] total={s['total']} ok={s['ok']} cached={s['cached']} errors={s['errors']} dry_run={s['dry_run']}")
    print(f"[LOG] {log_path}")

    return 1 if s["errors"] > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
