#!/usr/bin/env python3
"""Batch image post-processing using GIMP harness with Pillow fallback.

Processes rendered PNG frames: resize, color correction, watermark, format conversion.

Usage:
    python3 image_postprocess.py --input-dir renders/ --output-dir processed/ \
        --width 1920 --height 1080 --watermark "MUSU" --format png
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"}


def _use_gimp() -> bool:
    """Check if GIMP harness is available."""
    try:
        from cli_anything_bridge import AVAILABLE_TOOLS
        return "gimp" in AVAILABLE_TOOLS
    except ImportError:
        return False


def process_image_gimp(
    input_path: Path,
    output_path: Path,
    width: int | None = None,
    height: int | None = None,
    brightness: float = 0.0,
    contrast: float = 0.0,
    saturation: float = 0.0,
    watermark_text: str | None = None,
    watermark_x: int = 20,
    watermark_y: int = 20,
    watermark_font_size: int = 36,
    watermark_opacity: float = 0.5,
    output_format: str = "png",
    quality: int = 95,
) -> dict[str, Any]:
    """Process a single image using GimpSession."""
    from cli_anything_bridge import GimpSession

    with GimpSession() as sess:
        sess.project_new(width=width or 1920, height=height or 1080)
        sess.open_image(str(input_path))

        if width and height:
            sess.canvas_scale(width, height)

        if any([brightness, contrast, saturation]):
            sess.color_correct(
                brightness=brightness,
                contrast=contrast,
                saturation=saturation,
            )

        if watermark_text:
            sess.watermark(
                text=watermark_text,
                x=watermark_x,
                y=watermark_y,
                font_size=watermark_font_size,
                opacity=watermark_opacity,
            )

        sess.flatten()
        result = sess.export(str(output_path), fmt=output_format, quality=quality)

    return {"engine": "gimp", "input": str(input_path), "output": str(output_path), **result}


def process_image_pillow(
    input_path: Path,
    output_path: Path,
    width: int | None = None,
    height: int | None = None,
    brightness: float = 0.0,
    contrast: float = 0.0,
    saturation: float = 0.0,
    watermark_text: str | None = None,
    watermark_x: int = 20,
    watermark_y: int = 20,
    watermark_font_size: int = 36,
    watermark_opacity: float = 0.5,
    output_format: str = "png",
    quality: int = 95,
) -> dict[str, Any]:
    """Process a single image using Pillow (fallback)."""
    from PIL import Image, ImageDraw, ImageEnhance, ImageFont

    img = Image.open(input_path).convert("RGBA")

    if width and height:
        img = img.resize((width, height), Image.LANCZOS)

    if brightness:
        img = ImageEnhance.Brightness(img).enhance(1.0 + brightness / 100.0)
    if contrast:
        img = ImageEnhance.Contrast(img).enhance(1.0 + contrast / 100.0)
    if saturation:
        img = ImageEnhance.Color(img).enhance(1.0 + saturation / 100.0)

    if watermark_text:
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        try:
            font = ImageFont.truetype("DejaVuSans.ttf", watermark_font_size)
        except (OSError, IOError):
            font = ImageFont.load_default()
        alpha = int(255 * watermark_opacity)
        draw.text((watermark_x, watermark_y), watermark_text,
                   fill=(255, 255, 255, alpha), font=font)
        img = Image.alpha_composite(img, overlay)

    # Convert to RGB for non-PNG formats
    if output_format.lower() in ("jpg", "jpeg", "webp"):
        img = img.convert("RGB")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    save_kwargs: dict[str, Any] = {}
    if output_format.lower() in ("jpg", "jpeg"):
        save_kwargs["quality"] = quality
    elif output_format.lower() == "webp":
        save_kwargs["quality"] = quality
    img.save(output_path, **save_kwargs)

    return {
        "engine": "pillow",
        "input": str(input_path),
        "output": str(output_path),
        "size": os.path.getsize(output_path),
    }


def batch_process(
    input_dir: Path,
    output_dir: Path,
    width: int | None = None,
    height: int | None = None,
    brightness: float = 0.0,
    contrast: float = 0.0,
    saturation: float = 0.0,
    watermark_text: str | None = None,
    output_format: str = "png",
    quality: int = 95,
    use_gimp: bool | None = None,
) -> list[dict[str, Any]]:
    """Process all images in a directory.

    Args:
        use_gimp: None=auto-detect, True=force GIMP, False=force Pillow
    """
    if use_gimp is None:
        use_gimp = _use_gimp()

    processor = process_image_gimp if use_gimp else process_image_pillow
    engine_name = "gimp" if use_gimp else "pillow"
    print(f"[POST] image post-processing with {engine_name}")

    output_dir.mkdir(parents=True, exist_ok=True)
    images = sorted(p for p in input_dir.iterdir() if p.suffix.lower() in IMAGE_EXTS)

    results = []
    for img_path in images:
        out_name = img_path.stem + f".{output_format}"
        out_path = output_dir / out_name
        try:
            result = processor(
                input_path=img_path,
                output_path=out_path,
                width=width, height=height,
                brightness=brightness, contrast=contrast, saturation=saturation,
                watermark_text=watermark_text,
                output_format=output_format,
                quality=quality,
            )
            results.append(result)
            print(f"  [OK] {img_path.name} → {out_path.name}")
        except Exception as e:
            print(f"  [FAIL] {img_path.name}: {e}")
            # If GIMP fails, try Pillow fallback
            if use_gimp:
                try:
                    result = process_image_pillow(
                        input_path=img_path, output_path=out_path,
                        width=width, height=height,
                        brightness=brightness, contrast=contrast, saturation=saturation,
                        watermark_text=watermark_text,
                        output_format=output_format, quality=quality,
                    )
                    results.append(result)
                    print(f"  [OK] {img_path.name} → {out_path.name} (pillow fallback)")
                except Exception as e2:
                    results.append({"error": str(e2), "input": str(img_path)})

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Batch image post-processing")
    parser.add_argument("--input-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--width", type=int, default=None)
    parser.add_argument("--height", type=int, default=None)
    parser.add_argument("--brightness", type=float, default=0.0)
    parser.add_argument("--contrast", type=float, default=0.0)
    parser.add_argument("--saturation", type=float, default=0.0)
    parser.add_argument("--watermark", default=None)
    parser.add_argument("--format", default="png", choices=["png", "jpg", "webp"])
    parser.add_argument("--quality", type=int, default=95)
    parser.add_argument("--force-gimp", action="store_true")
    parser.add_argument("--force-pillow", action="store_true")
    args = parser.parse_args()

    use_gimp = None
    if args.force_gimp:
        use_gimp = True
    elif args.force_pillow:
        use_gimp = False

    results = batch_process(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
        width=args.width, height=args.height,
        brightness=args.brightness, contrast=args.contrast, saturation=args.saturation,
        watermark_text=args.watermark,
        output_format=args.format,
        quality=args.quality,
        use_gimp=use_gimp,
    )

    ok_count = sum(1 for r in results if "error" not in r)
    print(f"\n[OK] processed {ok_count}/{len(results)} images")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
