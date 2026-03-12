#!/usr/bin/env python3
"""Generate T2I storyboards for all shots using Flux PuLID.

Reads a shot manifest, builds a T2I-specific manifest with 16:9 framing
and PuLID face-identity injection, then delegates to comfy_batch_render.py.
After rendering, copies output PNGs into ComfyUI's input/ folder so
Kontext and I2V can pick them up.

Default workflow is flux_pulid_t2i.json which injects a golden reference
face via PuLID for character consistency across all shots.

Usage:
    python generate_t2i_storyboards.py \\
        --manifest ep01_shot_manifest.json \\
        --output-dir output/renders/ep01_storyboards_v3 \\
        --comfy-input /home/hugh/ComfyUI/app/input \\
        --pulid-ref ivy_burr_golden_ref.png \\
        --pulid-weight 0.9 \\
        --guidance 3.5 \\
        --dry-run
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_GUIDANCE = 3.5
DEFAULT_SEED_BASE = 4000000
DEFAULT_WIDTH = 832
DEFAULT_HEIGHT = 480
DEFAULT_WORKFLOW = "flux_pulid_t2i.json"
DEFAULT_BINDINGS = "flux_pulid_t2i_bindings.json"
DEFAULT_PULID_REF = "ivy_burr_golden_ref.png"
DEFAULT_PULID_WEIGHT = 0.9


def _json_load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _build_t2i_manifest(
    shots: list[dict[str, Any]],
    guidance: float,
    seed_base: int,
    pulid_ref: str | None = None,
    pulid_weight: float = DEFAULT_PULID_WEIGHT,
) -> dict[str, Any]:
    """Build a manifest for Flux PuLID T2I storyboard generation.

    Every shot gets a 16:9 scene render with PuLID face-identity injection
    for character consistency.
    """
    t2i_shots = []
    for i, shot in enumerate(shots):
        shot_id = shot.get("shot_id", f"SB_{i:03d}")
        prompt = shot.get("prompt_positive", shot.get("visual_goal", ""))
        if not prompt:
            print(f"  [WARN] No prompt for {shot_id}, using purpose as fallback")
            prompt = shot.get("purpose", "A scene from an animated show.")

        entry: dict[str, Any] = {
            "shot_id": f"SB_{shot_id}",
            "positive_prompt": prompt,
            "width": shot.get("width", DEFAULT_WIDTH),
            "height": shot.get("height", DEFAULT_HEIGHT),
            "seed": seed_base + i,
            "guidance": guidance,
            "filename_prefix": f"SB_{shot_id}",
        }

        if pulid_ref:
            entry["pulid_ref_image"] = pulid_ref
            entry["pulid_weight"] = pulid_weight
            entry["pulid_start_at"] = 0.0
            entry["pulid_end_at"] = 1.0

        t2i_shots.append(entry)

    style = "Flux PuLID T2I" if pulid_ref else "Flux Dev T2I"
    return {
        "project_id": "t2i_storyboards",
        "style_lock": f"{style} — 16:9 scene storyboards for I2V pipeline",
        "shots": t2i_shots,
    }


def _find_render_output(run_dir: Path, shot_id: str) -> Path | None:
    """Find the rendered PNG for a given shot_id."""
    # Check shot subdirectory first
    shot_dir = run_dir / shot_id
    if shot_dir.exists():
        for png in sorted(shot_dir.glob("*.png")):
            return png
    # Flat structure fallback
    for png in sorted(run_dir.glob(f"**/{shot_id}*.png")):
        return png
    return None


def generate_t2i_storyboards(
    manifest_path: Path,
    output_dir: Path,
    comfy_input: Path | None = None,
    server: str = "http://127.0.0.1:8188",
    guidance: float = DEFAULT_GUIDANCE,
    seed_base: int = DEFAULT_SEED_BASE,
    dry_run: bool = False,
    shots_filter: list[str] | None = None,
    update_manifest: bool = False,
    workflow_path: Path | None = None,
    bindings_path: Path | None = None,
    pulid_ref: str | None = DEFAULT_PULID_REF,
    pulid_weight: float = DEFAULT_PULID_WEIGHT,
) -> dict[str, Any]:
    """Generate T2I storyboards and optionally update the source manifest.

    Returns a summary dict with per-shot results.
    """
    manifest_data = _json_load(manifest_path)
    shots = manifest_data.get("shots", [])

    if not shots:
        print("[WARN] No shots in manifest, nothing to do.")
        return {"status": "empty", "shots": []}

    # Filter shots if requested
    if shots_filter:
        shots = [s for s in shots if s.get("shot_id") in shots_filter]
        if not shots:
            print(f"[WARN] No shots matched filter: {shots_filter}")
            return {"status": "filtered_empty", "shots": []}

    # Build T2I manifest
    t2i_manifest = _build_t2i_manifest(
        shots, guidance, seed_base,
        pulid_ref=pulid_ref, pulid_weight=pulid_weight,
    )

    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    tmp_manifest_path = output_dir / "_t2i_manifest.json"
    _json_dump(tmp_manifest_path, t2i_manifest)

    n_shots = len(t2i_manifest["shots"])
    print(f"[T2I] {n_shots} storyboard shots, guidance={guidance}, seed_base={seed_base}")

    if dry_run:
        print("[DRY-RUN] T2I manifest written, skipping render.")
        print(f"  Manifest: {tmp_manifest_path}")
        for s in t2i_manifest["shots"]:
            w, h = s.get("width", DEFAULT_WIDTH), s.get("height", DEFAULT_HEIGHT)
            print(f"  {s['shot_id']}: {w}x{h} seed={s['seed']}  {s['positive_prompt'][:70]}...")
        return {
            "status": "dry_run",
            "manifest": str(tmp_manifest_path),
            "shots": t2i_manifest["shots"],
        }

    # Resolve workflow and bindings
    video_dir = Path(__file__).resolve().parent.parent.parent  # systems/video
    workflow = workflow_path or (video_dir / "workflows" / "api" / DEFAULT_WORKFLOW)
    bindings = bindings_path or (video_dir / "workflows" / "api" / DEFAULT_BINDINGS)
    render_script = video_dir / "scripts" / "comfy_batch_render.py"

    if pulid_ref:
        print(f"[T2I] PuLID enabled: ref={pulid_ref}, weight={pulid_weight}")

    for p in (workflow, bindings, render_script):
        if not p.exists():
            print(f"[ERROR] Required file not found: {p}", file=sys.stderr)
            return {"status": "missing_dep", "path": str(p)}

    render_output = output_dir / "_renders"

    render_cmd = [
        sys.executable, str(render_script),
        "--manifest", str(tmp_manifest_path),
        "--workflow", str(workflow),
        "--bindings", str(bindings),
        "--output-dir", str(render_output),
        "--server", server,
    ]

    print(f"[T2I] Rendering {n_shots} shots via {render_script.name}...")
    result = subprocess.run(render_cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.returncode != 0:
        print(f"[ERROR] Render failed (code {result.returncode})")
        if result.stderr:
            print(result.stderr[-500:])
        return {"status": "render_failed", "returncode": result.returncode}

    # Post-process: copy outputs and build results
    results = []
    for shot in shots:
        shot_id = shot.get("shot_id", "unknown")
        sb_shot_id = f"SB_{shot_id}"
        storyboard_name = f"{shot_id}_storyboard.png"

        src = _find_render_output(render_output, sb_shot_id)
        if src is None:
            print(f"  [MISS] No render found for {sb_shot_id}")
            results.append({"shot_id": shot_id, "status": "missing"})
            continue

        # Copy to output dir with standardized name
        dst = output_dir / storyboard_name
        shutil.copy2(src, dst)
        print(f"  [OK] {storyboard_name}")

        # Copy to ComfyUI input/ folder if specified
        if comfy_input:
            comfy_dst = comfy_input / storyboard_name
            shutil.copy2(src, comfy_dst)
            print(f"       → {comfy_dst}")

        results.append({"shot_id": shot_id, "status": "ok", "storyboard": str(dst)})

    # Optionally update manifest with storyboard_image field
    if update_manifest:
        manifest_bak = manifest_path.with_suffix(".bak")
        shutil.copy2(manifest_path, manifest_bak)
        print(f"[T2I] Manifest backup: {manifest_bak}")

        ok_ids = {r["shot_id"] for r in results if r["status"] == "ok"}
        for shot in manifest_data["shots"]:
            sid = shot.get("shot_id")
            if sid in ok_ids:
                shot["storyboard_image"] = f"{sid}_storyboard.png"

        _json_dump(manifest_path, manifest_data)
        print(f"[T2I] Updated storyboard_image for {len(ok_ids)} shots in {manifest_path}")

    ok_count = sum(1 for r in results if r["status"] == "ok")
    print(f"\n[T2I] Done: {ok_count}/{len(results)} storyboards generated.")
    return {"status": "ok", "total": len(results), "ok": ok_count, "results": results}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate T2I storyboards (16:9 scene images) via Flux PuLID"
    )
    parser.add_argument("--manifest", required=True, type=Path,
                        help="Shot manifest JSON")
    parser.add_argument("--output-dir", type=Path, default=None,
                        help="Output directory for storyboard PNGs")
    parser.add_argument("--comfy-input", type=Path, default=None,
                        help="ComfyUI input/ directory (storyboards copied here)")
    parser.add_argument("--server", default="http://127.0.0.1:8188",
                        help="ComfyUI server address")
    parser.add_argument("--guidance", type=float, default=DEFAULT_GUIDANCE,
                        help=f"T2I guidance scale (default: {DEFAULT_GUIDANCE})")
    parser.add_argument("--seed-base", type=int, default=DEFAULT_SEED_BASE,
                        help=f"Base seed for T2I shots (default: {DEFAULT_SEED_BASE})")
    parser.add_argument("--dry-run", action="store_true",
                        help="Build manifest only, skip rendering")
    parser.add_argument("--shots", nargs="*", default=None,
                        help="Only process specific shot IDs")
    parser.add_argument("--update-manifest", action="store_true",
                        help="Add storyboard_image field to source manifest")
    parser.add_argument("--workflow", type=Path, default=None,
                        help=f"Workflow JSON path (default: {DEFAULT_WORKFLOW})")
    parser.add_argument("--bindings", type=Path, default=None,
                        help=f"Bindings JSON path (default: {DEFAULT_BINDINGS})")
    parser.add_argument("--pulid-ref", type=str, default=DEFAULT_PULID_REF,
                        help=f"PuLID reference image filename (default: {DEFAULT_PULID_REF})")
    parser.add_argument("--pulid-weight", type=float, default=DEFAULT_PULID_WEIGHT,
                        help=f"PuLID face weight 0.0-1.5 (default: {DEFAULT_PULID_WEIGHT})")
    parser.add_argument("--no-pulid", action="store_true",
                        help="Disable PuLID (use vanilla Flux Dev T2I)")
    args = parser.parse_args()

    if not args.manifest.exists():
        print(f"[ERROR] Manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    if args.output_dir is None:
        video_dir = Path(__file__).resolve().parent.parent.parent
        args.output_dir = video_dir / "output" / "renders" / "ep01_storyboards"

    pulid_ref = None if args.no_pulid else args.pulid_ref

    result = generate_t2i_storyboards(
        manifest_path=args.manifest,
        output_dir=args.output_dir,
        comfy_input=args.comfy_input,
        server=args.server,
        guidance=args.guidance,
        seed_base=args.seed_base,
        dry_run=args.dry_run,
        shots_filter=args.shots,
        update_manifest=args.update_manifest,
        workflow_path=args.workflow,
        bindings_path=args.bindings,
        pulid_ref=pulid_ref,
        pulid_weight=args.pulid_weight,
    )

    return 0 if result.get("status") in ("ok", "dry_run") else 1


if __name__ == "__main__":
    raise SystemExit(main())
