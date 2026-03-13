#!/usr/bin/env python3
"""Generate explainer infographic PNGs via Inkscape CLI.

Reads a shot manifest, filters for visual_type: "explainer" shots, and generates
SVG infographics programmatically, then exports to PNG via Inkscape CLI.

Output: 832x480 or 1024x1024 PNGs → storyboard pipeline directory.

Usage:
    python generate_explainer_graphics.py \
        --manifest ep01_explainer_manifest.json \
        --output-dir output/renders/ep01_explainer \
        --dry-run

Requires: Inkscape 1.x (set INKSCAPE_PATH or add to PATH)
Fallback: Pure SVG generation + Pillow rasterization if Inkscape unavailable.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


def find_inkscape() -> str | None:
    """Find Inkscape binary via env var or PATH. Returns None if not found."""
    env_path = os.environ.get("INKSCAPE_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path
    path = shutil.which("inkscape")
    if path:
        return path
    return None


def _json_load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


# --- SVG Generation ---

# Kurzgesagt-inspired color palette
PALETTE = {
    "bg_dark": "#0D1B2A",
    "orange": "#FF6B35",
    "cyan": "#00D4FF",
    "green": "#7AE582",
    "purple": "#B388FF",
    "yellow": "#FFD93D",
    "white": "#FFFFFF",
    "gray": "#8899AA",
}


def _color_from_seed(seed: int) -> str:
    """Pick a deterministic accent color from the palette."""
    accents = [PALETTE["orange"], PALETTE["cyan"], PALETTE["green"], PALETTE["purple"], PALETTE["yellow"]]
    return accents[seed % len(accents)]


def _generate_svg(shot: dict[str, Any], width: int, height: int) -> str:
    """Generate a Kurzgesagt-style SVG infographic for a shot."""
    prompt = shot.get("prompt_positive", "")
    purpose = shot.get("purpose", "")
    shot_id = shot.get("shot_id", "unknown")
    seed = shot.get("seed", hash(shot_id)) % 10000

    accent1 = _color_from_seed(seed)
    accent2 = _color_from_seed(seed + 1)
    accent3 = _color_from_seed(seed + 2)

    cx, cy = width / 2, height / 2

    # Generate abstract geometric elements based on content hash
    content_hash = int(hashlib.md5(purpose.encode()).hexdigest()[:8], 16)
    n_circles = 3 + (content_hash % 5)
    n_lines = 4 + (content_hash % 6)

    elements = []

    # Background gradient
    elements.append(f'''
    <defs>
        <radialGradient id="bg_grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#1B2838"/>
            <stop offset="100%" stop-color="{PALETTE['bg_dark']}"/>
        </radialGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
    </defs>
    <rect width="{width}" height="{height}" fill="url(#bg_grad)"/>''')

    # Grid lines (subtle)
    for i in range(n_lines):
        x = (width / (n_lines + 1)) * (i + 1)
        elements.append(
            f'<line x1="{x}" y1="0" x2="{x}" y2="{height}" '
            f'stroke="{PALETTE["gray"]}" stroke-opacity="0.1" stroke-width="1"/>'
        )

    # Geometric shapes — circles with glow
    for i in range(n_circles):
        angle_offset = (content_hash + i * 137) % 360
        import math
        r_dist = 80 + (i * 50) % 200
        sx = cx + r_dist * math.cos(math.radians(angle_offset))
        sy = cy + r_dist * math.sin(math.radians(angle_offset))
        radius = 20 + (content_hash + i * 31) % 60
        color = [accent1, accent2, accent3][i % 3]
        opacity = 0.3 + (i * 0.15) % 0.5

        elements.append(
            f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="{radius}" '
            f'fill="{color}" fill-opacity="{opacity:.2f}" filter="url(#glow)"/>'
        )

    # Connection lines between shapes
    for i in range(min(n_circles - 1, 4)):
        angle1 = (content_hash + i * 137) % 360
        angle2 = (content_hash + (i + 1) * 137) % 360
        import math
        r1 = 80 + (i * 50) % 200
        r2 = 80 + ((i + 1) * 50) % 200
        x1 = cx + r1 * math.cos(math.radians(angle1))
        y1 = cy + r1 * math.sin(math.radians(angle1))
        x2 = cx + r2 * math.cos(math.radians(angle2))
        y2 = cy + r2 * math.sin(math.radians(angle2))
        color = [accent1, accent2][i % 2]

        elements.append(
            f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" '
            f'stroke="{color}" stroke-opacity="0.4" stroke-width="2"/>'
        )

    # Central focal element
    elements.append(
        f'<circle cx="{cx}" cy="{cy}" r="40" '
        f'fill="none" stroke="{accent1}" stroke-width="3" stroke-opacity="0.8"/>'
    )
    elements.append(
        f'<circle cx="{cx}" cy="{cy}" r="15" '
        f'fill="{accent1}" fill-opacity="0.9" filter="url(#glow)"/>'
    )

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
{"".join(elements)}
</svg>'''
    return svg


def _export_with_inkscape(inkscape: str, svg_path: str, png_path: str, width: int, height: int) -> bool:
    """Export SVG to PNG using Inkscape CLI."""
    try:
        result = subprocess.run(
            [inkscape, svg_path, "--export-type=png", f"--export-filename={png_path}",
             f"--export-width={width}", f"--export-height={height}"],
            capture_output=True, text=True, timeout=30,
        )
        return result.returncode == 0 and Path(png_path).exists()
    except (subprocess.TimeoutExpired, OSError):
        return False


def _export_with_pillow(svg_path: str, png_path: str, width: int, height: int) -> bool:
    """Fallback: rasterize SVG using cairosvg or simple Pillow rectangle."""
    try:
        import cairosvg
        cairosvg.svg2png(url=svg_path, write_to=png_path,
                         output_width=width, output_height=height)
        return True
    except ImportError:
        pass

    # Last resort: use Pillow to create a placeholder
    try:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (width, height), color=(13, 27, 42))
        draw = ImageDraw.Draw(img)
        draw.ellipse([width // 2 - 40, height // 2 - 40, width // 2 + 40, height // 2 + 40],
                     outline=(0, 212, 255), width=3)
        draw.text((20, 20), f"Explainer: {Path(svg_path).stem}", fill=(255, 255, 255))
        img.save(png_path)
        return True
    except ImportError:
        return False


def _generate_via_harness(shot: dict[str, Any], output_path: Path, width: int, height: int) -> Path | None:
    """Generate explainer graphic via CLI-Anything Inkscape harness with layer support."""
    try:
        from cli_anything_bridge import AVAILABLE_TOOLS, InkscapeSession
    except ImportError:
        print("  [WARN] cli_anything_bridge not available — use --use-legacy", file=sys.stderr)
        return None

    if "inkscape" not in AVAILABLE_TOOLS:
        print("  [WARN] Inkscape harness not available — use --use-legacy", file=sys.stderr)
        return None

    shot_id = shot.get("shot_id", "unknown")
    purpose = shot.get("purpose", "")
    seed = shot.get("seed", hash(shot_id)) % 10000

    accent1 = _color_from_seed(seed)
    accent2 = _color_from_seed(seed + 1)
    accent3 = _color_from_seed(seed + 2)

    content_hash = int(hashlib.md5(purpose.encode()).hexdigest()[:8], 16)
    n_circles = 3 + (content_hash % 5)
    cx, cy = width / 2, height / 2

    try:
        with InkscapeSession() as sess:
            sess.document_new(width=width, height=height, background=PALETTE["bg_dark"])

            # Layer: background
            sess.layer_add("background")
            sess.object_add("rect", x=0, y=0, width=width, height=height,
                            fill="#1B2838", opacity=1.0)

            # Layer: geometry
            sess.layer_add("geometry")
            import math as _math
            for i in range(n_circles):
                angle_offset = (content_hash + i * 137) % 360
                r_dist = 80 + (i * 50) % 200
                sx = cx + r_dist * _math.cos(_math.radians(angle_offset))
                sy = cy + r_dist * _math.sin(_math.radians(angle_offset))
                radius = 20 + (content_hash + i * 31) % 60
                color = [accent1, accent2, accent3][i % 3]
                opacity = 0.3 + (i * 0.15) % 0.5
                sess.object_add("circle", cx=int(sx), cy=int(sy), r=radius,
                                fill=color, opacity=round(opacity, 2))

            # Layer: glow — central focal element
            sess.layer_add("glow")
            sess.object_add("circle", cx=int(cx), cy=int(cy), r=40,
                            fill="none", stroke=accent1, stroke_width=3)
            sess.object_add("circle", cx=int(cx), cy=int(cy), r=15,
                            fill=accent1, opacity=0.9)

            # Export
            sess.export_png(str(output_path), width=width, height=height)

        if output_path.exists():
            print(f"  [OK/harness] {shot_id} → {output_path}")
            return output_path
        print(f"  [FAIL/harness] {shot_id}: output not found", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  [FAIL/harness] {shot_id}: {e}", file=sys.stderr)
        return None


def render_shot(inkscape: str | None, shot: dict[str, Any], output_dir: Path, dry_run: bool = False) -> Path | None:
    """Render a single explainer shot."""
    shot_id = shot["shot_id"]
    width = shot.get("width", 832)
    height = shot.get("height", 480)
    output_path = output_dir / f"{shot_id}_explainer.png"

    if output_path.exists():
        print(f"  [skip] {shot_id} — already rendered")
        return output_path

    svg_content = _generate_svg(shot, width, height)
    svg_path = output_dir / f"{shot_id}_explainer.svg"

    if dry_run:
        print(f"  [dry-run] {shot_id} → {output_path}")
        return None

    # Write SVG
    svg_path.write_text(svg_content, encoding="utf-8")

    # Try Inkscape first, fall back to Pillow
    success = False
    if inkscape:
        success = _export_with_inkscape(inkscape, str(svg_path), str(output_path), width, height)
        if success:
            print(f"  [OK inkscape] {shot_id} → {output_path}")

    if not success:
        success = _export_with_pillow(str(svg_path), str(output_path), width, height)
        if success:
            print(f"  [OK fallback] {shot_id} → {output_path}")

    if not success:
        print(f"  [FAIL] {shot_id}: no renderer available", file=sys.stderr)
        return None

    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate explainer infographics via Inkscape CLI")
    parser.add_argument("--manifest", required=True, help="Explainer manifest JSON")
    parser.add_argument("--output-dir", required=True, help="Output directory for rendered PNGs")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be rendered")
    parser.add_argument("--use-harness", action="store_true", default=True, help="Use CLI-Anything Inkscape harness (default)")
    parser.add_argument("--use-legacy", dest="use_harness", action="store_false", help="Use legacy SVG generation")
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = _json_load(manifest_path)
    shots = [s for s in manifest.get("shots", []) if s.get("visual_type") == "explainer"]

    if not shots:
        print("No explainer shots found in manifest.")
        return

    print(f"Found {len(shots)} explainer shots")

    inkscape = find_inkscape()
    if inkscape:
        print(f"Using Inkscape: {inkscape}")
    else:
        print("Inkscape not found — using Pillow/cairosvg fallback")

    rendered = []
    for shot in shots:
        if args.use_harness:
            width = shot.get("width", 832)
            height = shot.get("height", 480)
            output_path = output_dir / f"{shot['shot_id']}_explainer.png"
            if not output_path.exists() and not args.dry_run:
                result = _generate_via_harness(shot, output_path, width, height)
            elif output_path.exists():
                print(f"  [skip] {shot['shot_id']} — already rendered")
                result = output_path
            elif args.dry_run:
                print(f"  [dry-run/harness] {shot['shot_id']} → {output_path}")
                result = None
            else:
                result = None
            if result is None and not args.dry_run:
                # Harness failed — fall back to legacy
                result = render_shot(inkscape, shot, output_dir, dry_run=args.dry_run)
        else:
            result = render_shot(inkscape, shot, output_dir, dry_run=args.dry_run)
        if result:
            rendered.append(str(result))

    print(f"\nRendered {len(rendered)}/{len(shots)} shots")

    report_path = output_dir / "explainer_render_report.json"
    report = {
        "manifest": str(manifest_path),
        "total_shots": len(shots),
        "rendered": len(rendered),
        "renderer": "inkscape" if inkscape else "fallback",
        "files": rendered,
    }
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
