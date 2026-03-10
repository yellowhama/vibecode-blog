#!/usr/bin/env python3
"""Generate character anchor frames using Flux T2I via ComfyUI.

For each character in characters.json, generates 4 angle images
(front, three_quarter, side, full_body) via Flux.1-dev text-to-image,
and selects the best as primary_anchor.

Usage:
    python character_sheet_generator.py \
        --characters pipeline/manifests/characters.json \
        --output-dir assets/characters \
        --server http://127.0.0.1:8188

Requires: comfy_batch_render.py (delegated via shim)
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
ANGLES = ["front", "three_quarter", "side", "full_body"]

DEFAULT_RESOLUTION = "1024x1024"
DEFAULT_GUIDANCE = 3.5


def _build_sheet_manifest(
    characters: list[dict[str, Any]],
    resolution: str,
) -> dict[str, Any]:
    """Build a temporary manifest for character sheet renders."""
    shots = []
    seed_base = 9000000

    for ci, char in enumerate(characters):
        sheet_prompts = char.get("sheet_prompts", {})
        for ai, angle in enumerate(ANGLES):
            prompt = sheet_prompts.get(angle, "")
            if not prompt:
                continue
            shot_id = f"char_{char['id']}_{angle}"
            w, h = resolution.split("x")
            shots.append({
                "shot_id": shot_id,
                "scene": f"CharSheet_{char['id']}",
                "purpose": f"Character sheet {angle} view for {char['name']}",
                "prompt_positive": prompt,
                "seed": seed_base + ci * 100 + ai,
                "guidance": DEFAULT_GUIDANCE,
                "width": int(w),
                "height": int(h),
            })

    return {
        "project_id": "character_sheets",
        "style_lock": "Flux T2I character sheet generation for anchor frames",
        "delivery_target": f"1:1, {resolution}, direct PNG output",
        "shots": shots,
    }


def _compute_color_variance(png_path: Path) -> float:
    """Compute color variance of an image (higher = more visually interesting)."""
    try:
        from PIL import Image
        import numpy as np
        img = np.array(Image.open(png_path).convert("RGB"), dtype=float)
        return float(np.var(img))
    except ImportError:
        return float(png_path.stat().st_size)


def _find_render_outputs(run_dir: Path, shot_id: str) -> Path | None:
    """Find the rendered PNG for a given shot_id in the run directory."""
    # Check shot subdirectory first (batch renderer creates shot_id/ dirs)
    shot_dir = run_dir / shot_id
    if shot_dir.exists():
        for png in shot_dir.glob("*.png"):
            return png
    # Flat structure fallback
    for png in run_dir.glob(f"**/{shot_id}*.png"):
        return png
    return None


def generate_character_sheets(
    characters_path: Path,
    output_dir: Path,
    server: str = "http://127.0.0.1:8188",
    workflow: Path | None = None,
    bindings: Path | None = None,
    resolution: str = DEFAULT_RESOLUTION,
    skip_render: bool = False,
    render_output: Path | None = None,
) -> dict[str, Any]:
    """Generate character sheets and select primary anchors."""
    import subprocess

    chars_data = json.loads(characters_path.read_text(encoding="utf-8"))
    characters = chars_data["characters"]

    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = _build_sheet_manifest(characters, resolution)

    if not skip_render:
        manifest_path = output_dir / "_sheet_manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        # Resolve workflow and bindings — default to Flux T2I
        scripts_dir = Path(__file__).resolve().parent
        video_dir = scripts_dir.parent.parent  # systems/video

        if workflow is None:
            workflow = video_dir / "workflows" / "api" / "flux_dev_t2i.json"
        if bindings is None:
            bindings = video_dir / "workflows" / "api" / "flux_dev_t2i_bindings.json"

        # Use the canonical batch renderer (shim will delegate)
        render_script = video_dir / "scripts" / "comfy_batch_render.py"

        render_output = output_dir / "_renders"

        print(f"[RENDER] Generating {len(manifest['shots'])} character sheet shots via Flux T2I...")
        render_cmd = [
            sys.executable, str(render_script),
            "--manifest", str(manifest_path),
            "--workflow", str(workflow),
            "--bindings", str(bindings),
            "--output-dir", str(render_output),
            "--server", server,
        ]
        result = subprocess.run(render_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[WARN] Render returned code {result.returncode}")
            if result.stderr:
                print(result.stderr[-500:])
            if result.stdout:
                print(result.stdout[-500:])

    # Build character index from render outputs
    character_index = {
        "project_id": chars_data.get("project_id", "unknown"),
        "generated_with": "character_sheet_generator.py (Flux T2I)",
        "characters": {},
    }

    for char in characters:
        char_id = char["id"]
        char_dir = output_dir / char_id
        char_dir.mkdir(parents=True, exist_ok=True)

        best_variance = -1.0
        best_angle = None
        angle_paths = {}

        for angle in ANGLES:
            shot_id = f"char_{char_id}_{angle}"
            png_path = char_dir / f"{angle}.png"

            if not skip_render and render_output:
                # Flux T2I outputs PNGs directly — no frame extraction needed
                src = _find_render_outputs(render_output, shot_id)
                if src and src != png_path:
                    import shutil
                    shutil.copy2(src, png_path)
                    print(f"  [OK] {char_id}/{angle}.png")
                elif not src:
                    print(f"  [SKIP] no render found for {shot_id}")

            if png_path.exists():
                angle_paths[angle] = str(png_path.relative_to(output_dir))
                variance = _compute_color_variance(png_path)
                if variance > best_variance:
                    best_variance = variance
                    best_angle = angle

        # Symlink or copy primary_anchor
        if best_angle and (char_dir / f"{best_angle}.png").exists():
            primary = char_dir / "primary_anchor.png"
            if primary.exists() or primary.is_symlink():
                primary.unlink()
            try:
                primary.symlink_to(f"{best_angle}.png")
            except OSError:
                import shutil
                shutil.copy2(char_dir / f"{best_angle}.png", primary)
            angle_paths["primary_anchor"] = f"{char_id}/primary_anchor.png"
            print(f"  [OK] {char_id}/primary_anchor.png → {best_angle}.png (variance={best_variance:.0f})")

        character_index["characters"][char_id] = {
            "name": char["name"],
            "appearance": char["appearance"],
            "environment": char.get("environment", "unknown"),
            "scenes": char.get("scenes", []),
            "priority": char.get("priority", 99),
            "angles": angle_paths,
            "primary_anchor": angle_paths.get("primary_anchor"),
        }

    index_path = output_dir / "character_index.json"
    index_path.write_text(
        json.dumps(character_index, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\n[OK] Character index → {index_path}")
    print(f"     {len(character_index['characters'])} characters, "
          f"{sum(len(v['angles']) for v in character_index['characters'].values())} total frames")

    return character_index


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate character anchor frames via Flux T2I")
    parser.add_argument("--characters", type=Path, required=True,
                        help="Path to characters.json")
    parser.add_argument("--output-dir", type=Path, default=None,
                        help="Output directory for character assets")
    parser.add_argument("--server", default="http://127.0.0.1:8188",
                        help="ComfyUI server address")
    parser.add_argument("--workflow", type=Path, default=None,
                        help="ComfyUI workflow JSON (default: flux_dev_t2i.json)")
    parser.add_argument("--bindings", type=Path, default=None,
                        help="Workflow bindings JSON (default: flux_dev_t2i_bindings.json)")
    parser.add_argument("--resolution", default=DEFAULT_RESOLUTION,
                        help=f"Resolution WxH (default: {DEFAULT_RESOLUTION})")
    parser.add_argument("--skip-render", action="store_true",
                        help="Skip rendering, only process existing outputs")
    parser.add_argument("--render-output", type=Path, default=None,
                        help="Existing render output directory (with --skip-render)")
    args = parser.parse_args()

    if not args.characters.exists():
        print(f"ERROR: characters.json not found: {args.characters}", file=sys.stderr)
        sys.exit(1)

    if args.output_dir is None:
        video_dir = Path(__file__).resolve().parent.parent.parent
        args.output_dir = video_dir / "assets" / "characters"

    generate_character_sheets(
        characters_path=args.characters,
        output_dir=args.output_dir,
        server=args.server,
        workflow=args.workflow,
        bindings=args.bindings,
        resolution=args.resolution,
        skip_render=args.skip_render,
        render_output=args.render_output,
    )


if __name__ == "__main__":
    main()
