#!/usr/bin/env python3
"""Generate YouTube thumbnail from EP keyframes.

Selects the best character keyframe and overlays episode title text.
Output: 1280x720 PNG thumbnail.

Usage:
    python generate_thumbnail.py \
        --keyframes output/ep01/keyframes/ \
        --manifest preproduction/ep01/ep01_shot_manifest_v5.json \
        --title "What's a Spec?" \
        --output output/ep01/final/EP01_thumbnail.png
"""
import argparse, json, subprocess, sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="YouTube thumbnail generator")
    parser.add_argument("--keyframes", required=True, help="Keyframes directory")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--title", required=True, help="Episode title text")
    parser.add_argument("--subtitle", default="", help="Optional subtitle text")
    parser.add_argument("--output", required=True, help="Output PNG path")
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--font", default="Impact", help="Title font")
    parser.add_argument("--font-size", type=int, default=72, help="Title font size")
    parser.add_argument("--font-color", default="white", help="Title font color")
    parser.add_argument("--border-width", type=int, default=4, help="Text border width")
    parser.add_argument("--prefer-shot", help="Prefer specific shot ID for base image")
    args = parser.parse_args()

    keyframes_dir = Path(args.keyframes)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Select best keyframe
    base_image = _select_best_keyframe(keyframes_dir, args.manifest, args.prefer_shot)
    if not base_image:
        print("No suitable keyframe found", file=sys.stderr)
        sys.exit(1)

    print(f"Base image: {base_image.name}")

    # Build FFmpeg drawtext filter
    filters = []

    # Scale/crop to exact thumbnail size
    filters.append(f"scale={args.width}:{args.height}:force_original_aspect_ratio=increase")
    filters.append(f"crop={args.width}:{args.height}")

    # Slight brightness/contrast boost for thumbnail pop
    filters.append("eq=brightness=0.05:contrast=1.15:saturation=1.2")

    # Title text with border (bottom-center area)
    escaped_title = args.title.replace("'", "'\\''").replace(":", "\\:")
    filters.append(
        f"drawtext=text='{escaped_title}'"
        f":fontfile='':fontsize={args.font_size}:fontcolor={args.font_color}"
        f":borderw={args.border_width}:bordercolor=black"
        f":x=(w-text_w)/2:y=h-text_h-60"
        f":font='{args.font}'"
    )

    # Optional subtitle
    if args.subtitle:
        escaped_sub = args.subtitle.replace("'", "'\\''").replace(":", "\\:")
        sub_size = max(args.font_size // 2, 28)
        filters.append(
            f"drawtext=text='{escaped_sub}'"
            f":fontfile='':fontsize={sub_size}:fontcolor=yellow"
            f":borderw=2:bordercolor=black"
            f":x=(w-text_w)/2:y=h-{sub_size}-20"
            f":font='{args.font}'"
        )

    filter_str = ",".join(filters)

    cmd = [
        "ffmpeg", "-y",
        "-i", str(base_image),
        "-vf", filter_str,
        "-frames:v", "1",
        str(output_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Thumbnail generation failed: {result.stderr}", file=sys.stderr)
        # Fallback: try without drawtext (font issues)
        _fallback_thumbnail(base_image, output_path, args.width, args.height)
        return

    size_kb = output_path.stat().st_size // 1024
    print(f"Thumbnail: {output_path} ({args.width}x{args.height}, {size_kb}KB)")


def _select_best_keyframe(keyframes_dir: Path, manifest_path: str, prefer_shot: str | None) -> Path | None:
    """Select the best keyframe for thumbnail.

    Priority:
    1. User-specified shot (--prefer-shot)
    2. Character reaction shots from HOOK segment (most engaging)
    3. Character reaction shots from APPLICATION segment
    4. Any character reaction shot
    5. Largest file (usually most detail)
    """
    if not keyframes_dir.exists():
        return None

    all_kf = sorted(keyframes_dir.glob("*.png"))
    if not all_kf:
        return None

    # If user specified a shot
    if prefer_shot:
        match = [f for f in all_kf if prefer_shot in f.stem]
        if match:
            return match[0]

    # Try to use manifest for intelligent selection
    try:
        manifest = json.loads(Path(manifest_path).read_text())
        shots = manifest.get("shots", [])

        # Score shots by thumbnail suitability
        scored = []
        for shot in shots:
            shot_id = shot.get("shot_id", "")
            visual_type = shot.get("visual_type", "")
            segment = shot.get("segment", "")

            kf = keyframes_dir / f"{shot_id}_keyframe.png"
            if not kf.exists():
                continue

            score = 0
            # Character shots are best for thumbnails
            if visual_type == "character_reaction":
                score += 10
            # Hook segment = most engaging
            if segment == "HOOK":
                score += 5
            elif segment == "APPLICATION":
                score += 3
            elif segment == "OUTCOME":
                score += 2
            # Larger files usually have more detail
            score += min(kf.stat().st_size / 100000, 5)

            scored.append((score, kf))

        if scored:
            scored.sort(key=lambda x: x[0], reverse=True)
            return scored[0][1]
    except Exception:
        pass

    # Fallback: largest file
    return max(all_kf, key=lambda f: f.stat().st_size)


def _fallback_thumbnail(base_image: Path, output_path: Path, width: int, height: int):
    """Simple thumbnail without text overlay (font fallback)."""
    cmd = [
        "ffmpeg", "-y",
        "-i", str(base_image),
        "-vf", f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},eq=brightness=0.05:contrast=1.15:saturation=1.2",
        "-frames:v", "1",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Thumbnail (no text): {output_path}")
    else:
        print(f"Fallback also failed: {result.stderr}", file=sys.stderr)


if __name__ == "__main__":
    main()
