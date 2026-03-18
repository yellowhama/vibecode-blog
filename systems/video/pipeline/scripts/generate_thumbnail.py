#!/usr/bin/env python3
"""Generate YouTube thumbnail from EP keyframes (v2 — Series Bible v6).

Layout:
  - Left 60%: core visual (keyframe, scaled & cropped)
  - Right 40%: title text (4 words max, Space Grotesk Bold) on theme color bg
  - Bottom-right: Vee expression overlay (small)

Fonts: Space Grotesk Bold (title), Inter (subtitle)
Fallback: system sans-serif if Space Grotesk not available.

Usage:
    python generate_thumbnail.py \
        --keyframes output/ep01/keyframes/ \
        --manifest preproduction/ep01/ep01_shot_manifest_v6.json \
        --title "스펙이 뭔가?" \
        --output output/ep01/final/EP01_thumbnail.png

    python generate_thumbnail.py \
        --keyframes output/ep02/keyframes/ \
        --manifest preproduction/ep02/ep02_shot_manifest_v6.json \
        --title "왼팔이 28개" \
        --theme-color "#FF6B35" \
        --vee-expression expressions/vee_expr_frustrated_front_00001_.png \
        --output output/ep02/final/EP02_thumbnail.png
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path


# Series Bible color defaults
DEFAULT_BG_COLOR = "#0D1B2A"  # dark navy
DEFAULT_THEME_COLOR = "#FF6B35"  # orange accent

# Per-episode theme colors (from Series Bible)
EPISODE_THEME_COLORS = {
    "ep01": "#3B82F6",  # blue — clarity
    "ep02": "#FF6B35",  # orange — confusion
    "ep03": "#7AE582",  # green — structure
    "ep04": "#EF4444",  # red — fear
    "ep05": "#06B6D4",  # cyan — discovery
    "ep06": "#8B5CF6",  # purple — creation
    "ep07": "#F59E0B",  # amber — understanding
    "ep08": "#EC4899",  # pink — mistakes
    "ep09": "#10B981",  # emerald — meta
    "ep10": "#FFD93D",  # vee yellow — growth
}

# Font paths (try multiple locations)
FONT_PATHS = {
    "space_grotesk": [
        "/usr/share/fonts/truetype/space-grotesk/SpaceGrotesk-Bold.ttf",
        "/usr/local/share/fonts/SpaceGrotesk-Bold.ttf",
        "~/.local/share/fonts/SpaceGrotesk-Bold.ttf",
        "/mnt/e/vibecode-blog/systems/video/assets/fonts/SpaceGrotesk-Bold.ttf",
    ],
    "inter": [
        "/usr/share/fonts/truetype/inter/Inter-Medium.ttf",
        "/usr/local/share/fonts/Inter-Medium.ttf",
        "~/.local/share/fonts/Inter-Medium.ttf",
        "/mnt/e/vibecode-blog/systems/video/assets/fonts/Inter-Medium.ttf",
    ],
}


def _find_font(font_key: str) -> str | None:
    """Find first available font path."""
    for p in FONT_PATHS.get(font_key, []):
        expanded = Path(p).expanduser()
        if expanded.exists():
            return str(expanded)
    return None


def main():
    parser = argparse.ArgumentParser(description="YouTube thumbnail generator (v2)")
    parser.add_argument("--keyframes", required=True, help="Keyframes directory")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--title", required=True, help="Episode title (4 words max)")
    parser.add_argument("--subtitle", default="", help="Optional subtitle")
    parser.add_argument("--output", required=True, help="Output PNG path")
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--theme-color", default=None, help="Theme color hex (auto-detected from episode)")
    parser.add_argument("--vee-expression", default=None, help="Path to Vee expression PNG for overlay")
    parser.add_argument("--prefer-shot", help="Prefer specific shot ID for base image")
    parser.add_argument("--episode", default=None, help="Episode ID (ep01, ep02...) for auto theme color")
    args = parser.parse_args()

    keyframes_dir = Path(args.keyframes)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Auto-detect episode from manifest path
    episode = args.episode
    if not episode:
        manifest_name = Path(args.manifest).stem.lower()
        for ep_id in EPISODE_THEME_COLORS:
            if ep_id in manifest_name:
                episode = ep_id
                break

    # Theme color: explicit > episode auto > default
    theme_color = args.theme_color or EPISODE_THEME_COLORS.get(episode or "", DEFAULT_THEME_COLOR)

    # Select best keyframe
    base_image = _select_best_keyframe(keyframes_dir, args.manifest, args.prefer_shot)
    if not base_image:
        print("No suitable keyframe found", file=sys.stderr)
        sys.exit(1)

    print(f"Base image: {base_image.name}")
    print(f"Theme color: {theme_color}")

    # Find fonts
    title_font = _find_font("space_grotesk")
    sub_font = _find_font("inter")

    # Build the composite thumbnail using FFmpeg
    # Layout: left 60% = keyframe visual, right 40% = colored panel with title
    visual_w = int(args.width * 0.6)
    panel_w = args.width - visual_w

    # Build filter complex
    filter_parts = []

    # Input 0: base keyframe image
    # Scale and crop to fill left 60%
    filter_parts.append(
        f"[0:v]scale={visual_w}:{args.height}:force_original_aspect_ratio=increase,"
        f"crop={visual_w}:{args.height},"
        f"eq=brightness=0.03:contrast=1.1:saturation=1.15[left]"
    )

    # Create right panel with theme color
    filter_parts.append(
        f"color=c={theme_color}:s={panel_w}x{args.height}:d=1[panel]"
    )

    # Overlay dark gradient on panel for readability
    filter_parts.append(
        f"[panel]drawbox=x=0:y=0:w={panel_w}:h={args.height}:color={theme_color}@0.85:t=fill[rpanel]"
    )

    # Add title text to right panel
    title_escaped = args.title.replace("'", "'\\''").replace(":", "\\:")
    font_size = 64
    if len(args.title) > 8:
        font_size = 52
    if len(args.title) > 12:
        font_size = 44

    if title_font:
        font_spec = f"fontfile='{title_font}'"
    else:
        font_spec = "font='Impact'"

    filter_parts.append(
        f"[rpanel]drawtext=text='{title_escaped}'"
        f":{font_spec}:fontsize={font_size}:fontcolor=white"
        f":borderw=3:bordercolor=black@0.5"
        f":x=(w-text_w)/2:y=(h-text_h)/2-20[titled]"
    )

    # Add subtitle if provided
    if args.subtitle:
        sub_escaped = args.subtitle.replace("'", "'\\''").replace(":", "\\:")
        sub_size = max(font_size // 2, 24)
        if sub_font:
            sub_font_spec = f"fontfile='{sub_font}'"
        else:
            sub_font_spec = "font='Arial'"

        filter_parts.append(
            f"[titled]drawtext=text='{sub_escaped}'"
            f":{sub_font_spec}:fontsize={sub_size}:fontcolor=white@0.8"
            f":x=(w-text_w)/2:y=(h/2)+40[titled2]"
        )
        right_label = "titled2"
    else:
        right_label = "titled"

    # Stack left visual + right panel horizontally
    filter_parts.append(
        f"[left][{right_label}]hstack=inputs=2[thumb]"
    )

    # If Vee expression overlay provided
    inputs = ["-i", str(base_image)]
    final_label = "thumb"

    if args.vee_expression:
        vee_path = Path(args.vee_expression)
        if not vee_path.exists():
            # Try relative to assets dir
            assets_dir = Path("/mnt/e/vibecode-blog/systems/video/assets/characters/vee")
            vee_path = assets_dir / args.vee_expression
        if vee_path.exists():
            inputs.extend(["-i", str(vee_path)])
            vee_size = int(args.height * 0.35)
            vee_x = args.width - int(panel_w * 0.7)
            vee_y = args.height - vee_size - 20
            filter_parts.append(
                f"[1:v]scale={vee_size}:-1:flags=lanczos[vee_scaled]"
            )
            filter_parts.append(
                f"[thumb][vee_scaled]overlay=x={vee_x}:y={vee_y}[final]"
            )
            final_label = "final"

    filter_str = ";".join(filter_parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_str,
        "-map", f"[{final_label}]",
        "-frames:v", "1",
        str(output_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Composite thumbnail failed, trying fallback: {result.stderr[:200]}", file=sys.stderr)
        _fallback_thumbnail(base_image, output_path, args.width, args.height, args.title, title_font)
        return

    size_kb = output_path.stat().st_size // 1024
    print(f"Thumbnail: {output_path} ({args.width}x{args.height}, {size_kb}KB)")


def _select_best_keyframe(keyframes_dir: Path, manifest_path: str, prefer_shot: str | None) -> Path | None:
    """Select the best keyframe for thumbnail.

    Priority:
    1. User-specified shot (--prefer-shot)
    2. Character reaction shots from HOOK segment (most engaging)
    3. Character reaction shots from REFRAME/MISCONCEPTION segment
    4. Any character reaction shot
    5. Largest file (usually most detail)
    """
    if not keyframes_dir.exists():
        return None

    all_kf = sorted(keyframes_dir.glob("*.png"))
    if not all_kf:
        return None

    if prefer_shot:
        match = [f for f in all_kf if prefer_shot in f.stem]
        if match:
            return match[0]

    try:
        manifest = json.loads(Path(manifest_path).read_text())
        shots = manifest.get("shots", [])

        scored = []
        for shot in shots:
            shot_id = shot.get("shot_id", "")
            visual_type = shot.get("visual_type", "")
            segment = shot.get("segment", "")

            kf = keyframes_dir / f"{shot_id}_keyframe.png"
            if not kf.exists():
                continue

            score = 0
            if visual_type == "character_reaction":
                score += 10
            if segment == "HOOK":
                score += 5
            elif segment in ("REFRAME", "MISCONCEPTION", "APPLICATION"):
                score += 3
            elif segment in ("OUTRO_CTA", "OUTRO"):
                score += 2
            score += min(kf.stat().st_size / 100000, 5)

            scored.append((score, kf))

        if scored:
            scored.sort(key=lambda x: x[0], reverse=True)
            return scored[0][1]
    except Exception:
        pass

    return max(all_kf, key=lambda f: f.stat().st_size)


def _fallback_thumbnail(base_image: Path, output_path: Path, width: int, height: int,
                        title: str = "", title_font: str | None = None):
    """Simple full-frame thumbnail with optional title overlay."""
    filters = [
        f"scale={width}:{height}:force_original_aspect_ratio=increase",
        f"crop={width}:{height}",
        "eq=brightness=0.05:contrast=1.15:saturation=1.2",
    ]
    if title:
        escaped = title.replace("'", "'\\''").replace(":", "\\:")
        if title_font:
            font_spec = f"fontfile='{title_font}'"
        else:
            font_spec = "font='Impact'"
        filters.append(
            f"drawtext=text='{escaped}'"
            f":{font_spec}:fontsize=72:fontcolor=white"
            f":borderw=4:bordercolor=black"
            f":x=(w-text_w)/2:y=h-text_h-60"
        )

    cmd = [
        "ffmpeg", "-y",
        "-i", str(base_image),
        "-vf", ",".join(filters),
        "-frames:v", "1",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Thumbnail (fallback): {output_path}")
    else:
        print(f"Fallback also failed: {result.stderr[:200]}", file=sys.stderr)


if __name__ == "__main__":
    main()
