#!/usr/bin/env python3
"""Generate Kontext keyframes for all shots using a golden reference image.

Reads a shot manifest, builds a temporary Kontext-specific manifest where every
shot uses the golden reference as input_image, then delegates to
comfy_batch_render.py.  After rendering, copies output PNGs into ComfyUI's
input/ folder so subsequent Wan I2V renders can pick them up.

Usage:
    python generate_kontext_keyframes.py \
        --manifest shots_planned.json \
        --golden-ref ivy_burr_golden_ref.png \
        --output-dir output/renders/kontext_keyframes \
        --comfy-input /home/hugh/ComfyUI/app/input \
        --guidance 2.5 \
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
STYLE_ANCHOR = "3D Pixar-like render style."
IDENTITY_LOCK = "Keep her exact face, hair, glasses, and yellow hoodie unchanged."

DEFAULT_GUIDANCE = 2.5
DEFAULT_SEED_BASE = 5000000


def _json_load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _compose_kontext_prompt(raw_prompt: str) -> str:
    """Append style anchor and identity lock to a raw Kontext prompt."""
    prompt = raw_prompt.rstrip(". ")
    return f"{prompt}. {STYLE_ANCHOR} {IDENTITY_LOCK}"


def _build_kontext_manifest(
    shots: list[dict[str, Any]],
    golden_ref: str,
    guidance: float,
    seed_base: int,
) -> dict[str, Any]:
    """Build a temporary manifest for Kontext keyframe generation."""
    kontext_shots = []
    for i, shot in enumerate(shots):
        # Prefer kontext_prompt, fall back to visual_goal or purpose
        raw_prompt = (
            shot.get("kontext_prompt")
            or shot.get("visual_goal")
            or shot.get("purpose")
            or "Same character in a different scene."
        )
        shot_id = shot.get("shot_id", f"KX_{i:03d}")

        kontext_shots.append({
            "shot_id": f"KX_{shot_id}",
            "positive_prompt": _compose_kontext_prompt(raw_prompt),
            "input_image": golden_ref,
            "seed": shot.get("kontext_seed", seed_base + i),
            "guidance": shot.get("kontext_guidance", guidance),
            "filename_prefix": f"KX_{shot_id}",
        })

    return {
        "project_id": "kontext_keyframes",
        "style_lock": "Flux Kontext scene editing — character consistency from golden reference",
        "shots": kontext_shots,
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


def generate_kontext_keyframes(
    manifest_path: Path,
    golden_ref: str,
    output_dir: Path,
    comfy_input: Path | None = None,
    server: str = "http://127.0.0.1:8188",
    guidance: float = DEFAULT_GUIDANCE,
    seed_base: int = DEFAULT_SEED_BASE,
    dry_run: bool = False,
    shots_filter: list[str] | None = None,
    update_manifest: bool = True,
) -> dict[str, Any]:
    """Generate Kontext keyframes and optionally update the source manifest.

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

    # Build Kontext-specific manifest
    kontext_manifest = _build_kontext_manifest(shots, golden_ref, guidance, seed_base)

    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    tmp_manifest_path = output_dir / "_kontext_manifest.json"
    _json_dump(tmp_manifest_path, kontext_manifest)

    print(f"[KONTEXT] {len(kontext_manifest['shots'])} shots, golden_ref={golden_ref}, guidance={guidance}")

    if dry_run:
        print("[DRY-RUN] Kontext manifest written, skipping render.")
        print(f"  Manifest: {tmp_manifest_path}")
        for s in kontext_manifest["shots"]:
            print(f"  {s['shot_id']}: {s['positive_prompt'][:80]}...")
        return {"status": "dry_run", "manifest": str(tmp_manifest_path), "shots": kontext_manifest["shots"]}

    # Resolve workflow and bindings
    video_dir = Path(__file__).resolve().parent.parent.parent  # systems/video
    workflow = video_dir / "workflows" / "api" / "flux_kontext_edit.json"
    bindings = video_dir / "workflows" / "api" / "flux_kontext_edit_bindings.json"
    render_script = video_dir / "scripts" / "comfy_batch_render.py"

    render_output = output_dir / "_renders"

    render_cmd = [
        sys.executable, str(render_script),
        "--manifest", str(tmp_manifest_path),
        "--workflow", str(workflow),
        "--bindings", str(bindings),
        "--output-dir", str(render_output),
        "--server", server,
    ]

    print(f"[KONTEXT] Rendering via {render_script.name}...")
    result = subprocess.run(render_cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.returncode != 0:
        print(f"[ERROR] Render failed (code {result.returncode})")
        if result.stderr:
            print(result.stderr[-500:])
        return {"status": "render_failed", "returncode": result.returncode}

    # Post-process: copy outputs to ComfyUI input/ and build results
    results = []
    for shot in shots:
        shot_id = shot.get("shot_id", "unknown")
        kx_shot_id = f"KX_{shot_id}"
        keyframe_name = f"{shot_id}_keyframe.png"

        src = _find_render_output(render_output, kx_shot_id)
        if src is None:
            print(f"  [SKIP] No render found for {kx_shot_id}")
            results.append({"shot_id": shot_id, "status": "missing"})
            continue

        # Copy to output dir with standardized name
        dst = output_dir / keyframe_name
        shutil.copy2(src, dst)
        print(f"  [OK] {keyframe_name}")

        # Copy to ComfyUI input/ folder if specified
        if comfy_input:
            comfy_dst = comfy_input / keyframe_name
            shutil.copy2(src, comfy_dst)
            print(f"       → {comfy_dst}")

        results.append({"shot_id": shot_id, "status": "ok", "keyframe": str(dst)})

    # Update original manifest's input_image fields
    if update_manifest:
        manifest_bak = manifest_path.with_suffix(".bak")
        shutil.copy2(manifest_path, manifest_bak)
        print(f"[KONTEXT] Manifest backup: {manifest_bak}")

        ok_ids = {r["shot_id"] for r in results if r["status"] == "ok"}
        for shot in manifest_data["shots"]:
            sid = shot.get("shot_id")
            if sid in ok_ids:
                shot["input_image"] = f"{sid}_keyframe.png"

        _json_dump(manifest_path, manifest_data)
        print(f"[KONTEXT] Updated input_image for {len(ok_ids)} shots in {manifest_path}")

    ok_count = sum(1 for r in results if r["status"] == "ok")
    print(f"\n[KONTEXT] Done: {ok_count}/{len(results)} keyframes generated.")
    return {"status": "ok", "total": len(results), "ok": ok_count, "results": results}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate Kontext keyframes from golden reference for character consistency"
    )
    parser.add_argument("--manifest", required=True, type=Path,
                        help="Shot manifest JSON (will be updated with keyframe paths)")
    parser.add_argument("--golden-ref", required=True,
                        help="Golden reference image filename (must be in ComfyUI input/)")
    parser.add_argument("--output-dir", type=Path, default=None,
                        help="Output directory for keyframes")
    parser.add_argument("--comfy-input", type=Path, default=None,
                        help="ComfyUI input/ directory (keyframes copied here)")
    parser.add_argument("--server", default="http://127.0.0.1:8188",
                        help="ComfyUI server address")
    parser.add_argument("--guidance", type=float, default=DEFAULT_GUIDANCE,
                        help=f"Kontext guidance (default: {DEFAULT_GUIDANCE})")
    parser.add_argument("--seed-base", type=int, default=DEFAULT_SEED_BASE,
                        help=f"Base seed for Kontext shots (default: {DEFAULT_SEED_BASE})")
    parser.add_argument("--dry-run", action="store_true",
                        help="Build manifest only, skip rendering")
    parser.add_argument("--shots", nargs="*", default=None,
                        help="Only process specific shot IDs")
    parser.add_argument("--no-update-manifest", action="store_true",
                        help="Don't update original manifest with keyframe paths")
    args = parser.parse_args()

    if not args.manifest.exists():
        print(f"[ERROR] Manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    if args.output_dir is None:
        video_dir = Path(__file__).resolve().parent.parent.parent
        args.output_dir = video_dir / "output" / "renders" / "kontext_keyframes"

    result = generate_kontext_keyframes(
        manifest_path=args.manifest,
        golden_ref=args.golden_ref,
        output_dir=args.output_dir,
        comfy_input=args.comfy_input,
        server=args.server,
        guidance=args.guidance,
        seed_base=args.seed_base,
        dry_run=args.dry_run,
        shots_filter=args.shots,
        update_manifest=not args.no_update_manifest,
    )

    return 0 if result.get("status") in ("ok", "dry_run") else 1


if __name__ == "__main__":
    raise SystemExit(main())
