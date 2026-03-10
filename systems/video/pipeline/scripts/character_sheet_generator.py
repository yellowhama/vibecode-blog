#!/usr/bin/env python3
"""Generate character anchor frames using ComfyUI T2V rendering.

For each character in characters.json, generates 4 angle images
(front, three_quarter, side, full_body) via Wan T2V short-duration render,
extracts the first frame as a PNG, and selects the best as primary_anchor.

Usage:
    python character_sheet_generator.py \
        --characters pipeline/manifests/characters.json \
        --output-dir assets/characters \
        --server http://127.0.0.1:8188

Requires: comfy_batch_render.py (existing), ffmpeg
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
ANGLES = ["front", "three_quarter", "side", "full_body"]

DEFAULT_MODEL = "wan2.1_t2v_1.3B_fp16.safetensors"
DEFAULT_RESOLUTION = "768x768"
DEFAULT_DURATION_SEC = 1  # minimal duration → extract frame 0

NEGATIVE_PROMPT = (
    "text, subtitles, watermark, logo, speech bubble, blurry, deformed, "
    "ugly, oversaturated, photorealistic, CGI, smooth animation, live action, "
    "plastic sheen, multiple characters, crowd"
)


def _build_sheet_manifest(
    characters: list[dict[str, Any]],
    model: str,
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
            shots.append({
                "shot_id": shot_id,
                "scene": f"CharSheet_{char['id']}",
                "purpose": f"Character sheet {angle} view for {char['name']}",
                "prompt_positive": prompt,
                "prompt_negative": NEGATIVE_PROMPT,
                "duration_sec": DEFAULT_DURATION_SEC,
                "aspect_ratio": "1:1",
                "resolution": resolution,
                "seed": seed_base + ci * 100 + ai,
                "model": model,
                "mode": "t2v",
                "input_image": None,
                "output_name": f"{shot_id}.mp4",
            })

    return {
        "project_id": "character_sheets",
        "style_lock": "Character sheet generation for anchor frames",
        "delivery_target": f"1:1, {resolution}, single-frame extraction",
        "model_policy": {"primary": model},
        "shots": shots,
    }


def _extract_first_frame(video_path: Path, output_png: Path) -> bool:
    """Extract the first frame from a video as PNG."""
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vframes", "1", "-q:v", "2",
        str(output_png),
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=30)
        return output_png.exists()
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return False


def _compute_color_variance(png_path: Path) -> float:
    """Compute color variance of an image (higher = more visually interesting)."""
    try:
        from PIL import Image
        import numpy as np
        img = np.array(Image.open(png_path).convert("RGB"), dtype=float)
        return float(np.var(img))
    except ImportError:
        # Fallback: file size as proxy for visual complexity
        return float(png_path.stat().st_size)


def _find_render_outputs(run_dir: Path, shot_id: str) -> Path | None:
    """Find the rendered video for a given shot_id in the run directory."""
    shot_dir = run_dir / shot_id
    if shot_dir.exists():
        for mp4 in shot_dir.glob("*.mp4"):
            return mp4
    # Also check flat structure
    for mp4 in run_dir.glob(f"**/{shot_id}*.mp4"):
        return mp4
    return None


def generate_character_sheets(
    characters_path: Path,
    output_dir: Path,
    server: str = "http://127.0.0.1:8188",
    workflow: Path | None = None,
    bindings: Path | None = None,
    model: str = DEFAULT_MODEL,
    resolution: str = DEFAULT_RESOLUTION,
    skip_render: bool = False,
    render_output: Path | None = None,
) -> dict[str, Any]:
    """Generate character sheets and select primary anchors.

    Returns character_index.json content.
    """
    chars_data = json.loads(characters_path.read_text(encoding="utf-8"))
    characters = chars_data["characters"]

    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    # Build manifest
    manifest = _build_sheet_manifest(characters, model, resolution)

    if not skip_render:
        # Write temporary manifest
        manifest_path = output_dir / "_sheet_manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        # Determine workflow and bindings paths
        scripts_dir = Path(__file__).resolve().parent
        video_dir = scripts_dir.parent.parent  # content/video

        if workflow is None:
            workflow = video_dir / "workflows" / "api" / "wan_t2v_api.json"
        if bindings is None:
            bindings = video_dir / "pipeline" / "bindings" / "wan_t2v_text_to_video_bindings.json"

        render_script = scripts_dir / "comfy_batch_render.py"
        if not render_script.exists():
            # Try parent scripts dir
            render_script = video_dir / "scripts" / "comfy_batch_render.py"

        render_output = output_dir / "_renders"

        print(f"[RENDER] Generating {len(manifest['shots'])} character sheet shots...")
        render_cmd = [
            sys.executable, str(render_script),
            "--manifest", str(manifest_path),
            "--workflow", str(workflow),
            "--bindings", str(bindings),
            "--output-root", str(render_output),
            "--server", server,
        ]
        result = subprocess.run(render_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[WARN] Render returned code {result.returncode}")
            print(result.stderr[-500:] if result.stderr else "")

        # Find actual run directory (most recent)
        if render_output.exists():
            run_dirs = sorted(render_output.iterdir(), key=lambda p: p.name, reverse=True)
            render_output = run_dirs[0] if run_dirs else render_output

    # Extract frames and build index
    character_index = {
        "project_id": chars_data.get("project_id", "unknown"),
        "generated_with": f"character_sheet_generator.py (model={model})",
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
                # Find rendered video
                video_path = _find_render_outputs(render_output, shot_id)
                if video_path:
                    if _extract_first_frame(video_path, png_path):
                        print(f"  [OK] {char_id}/{angle}.png extracted")
                    else:
                        print(f"  [FAIL] frame extraction failed: {video_path}")
                else:
                    print(f"  [SKIP] no render found for {shot_id}")

            if png_path.exists():
                angle_paths[angle] = str(png_path.relative_to(output_dir))
                variance = _compute_color_variance(png_path)
                if variance > best_variance:
                    best_variance = variance
                    best_angle = angle

        # Symlink primary_anchor
        if best_angle and (char_dir / f"{best_angle}.png").exists():
            primary = char_dir / "primary_anchor.png"
            if primary.exists() or primary.is_symlink():
                primary.unlink()
            try:
                primary.symlink_to(f"{best_angle}.png")
            except OSError:
                # Windows/WSL symlink fallback: copy
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

    # Write index
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
    parser = argparse.ArgumentParser(description="Generate character anchor frames via ComfyUI")
    parser.add_argument(
        "--characters", type=Path, required=True,
        help="Path to characters.json (from character_extractor.py)",
    )
    parser.add_argument(
        "--output-dir", type=Path, default=None,
        help="Output directory for character assets (default: assets/characters/)",
    )
    parser.add_argument(
        "--server", default="http://127.0.0.1:8188",
        help="ComfyUI server address",
    )
    parser.add_argument(
        "--workflow", type=Path, default=None,
        help="ComfyUI workflow JSON (default: wan_t2v_api.json)",
    )
    parser.add_argument(
        "--bindings", type=Path, default=None,
        help="Workflow bindings JSON (default: wan_t2v_text_to_video_bindings.json)",
    )
    parser.add_argument(
        "--model", default=DEFAULT_MODEL,
        help=f"T2V model checkpoint (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--resolution", default=DEFAULT_RESOLUTION,
        help=f"Resolution WxH (default: {DEFAULT_RESOLUTION})",
    )
    parser.add_argument(
        "--skip-render", action="store_true",
        help="Skip rendering, only extract frames from existing outputs",
    )
    parser.add_argument(
        "--render-output", type=Path, default=None,
        help="Existing render output directory (with --skip-render)",
    )
    args = parser.parse_args()

    if not args.characters.exists():
        print(f"ERROR: characters.json not found: {args.characters}", file=sys.stderr)
        sys.exit(1)

    if args.output_dir is None:
        video_dir = Path(__file__).resolve().parent.parent.parent  # content/video
        args.output_dir = video_dir / "assets" / "characters"

    generate_character_sheets(
        characters_path=args.characters,
        output_dir=args.output_dir,
        server=args.server,
        workflow=args.workflow,
        bindings=args.bindings,
        model=args.model,
        resolution=args.resolution,
        skip_render=args.skip_render,
        render_output=args.render_output,
    )


if __name__ == "__main__":
    main()
