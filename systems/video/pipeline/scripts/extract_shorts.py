#!/usr/bin/env python3
"""Extract YouTube Shorts from episode renders based on manifest shorts_candidate tags.

Produces 9:16 vertical clips with smart reframing:
- Character shots: center on Vee
- Diagram shots: center crop
- Adds 0.5s intro bumper + 1s outro CTA

Usage:
    python extract_shorts.py \
        --manifest preproduction/ep01/ep01_shot_manifest_v6.json \
        --clips-dir output/ep01/renders/clips/ \
        --output-dir output/ep01/shorts/ \
        --episode ep01

    python extract_shorts.py \
        --manifest preproduction/ep01/ep01_shot_manifest_v6.json \
        --clips-dir output/ep01/renders/clips/ \
        --output-dir output/ep01/shorts/ \
        --episode ep01 \
        --bumper-text "Vibecode Town" \
        --cta-text "풀 에피소드 보기 →"
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List


# Shorts spec
SHORTS_WIDTH = 1080
SHORTS_HEIGHT = 1920
SHORTS_MAX_SEC = 60
BUMPER_SEC = 0.5
CTA_SEC = 1.0

# Font fallbacks
FONT_CANDIDATES = [
    "/mnt/e/vibecode-blog/systems/video/assets/fonts/SpaceGrotesk-Bold.ttf",
    "~/.local/share/fonts/SpaceGrotesk-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def _find_font() -> str:
    for p in FONT_CANDIDATES:
        expanded = Path(p).expanduser()
        if expanded.exists():
            return str(expanded)
    return ""


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _probe_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    try:
        return max(0.0, float(result.stdout.strip()))
    except ValueError:
        return 0.0


def _run(cmd: List[str], label: str = "") -> bool:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [FAIL] {label}: {result.stderr[:200]}", file=sys.stderr)
        return False
    return True


def extract_shorts(
    manifest_path: Path,
    clips_dir: Path,
    output_dir: Path,
    episode: str,
    bumper_text: str = "Vibecode Town",
    cta_text: str = "풀 에피소드 보기 →",
    theme_color: str = "#0D1B2A",
    max_shorts: int = 5,
) -> List[Dict[str, Any]]:
    """Extract shorts from candidate shots in manifest.

    Returns list of extracted short metadata dicts.
    """
    manifest = _json_load(manifest_path)
    shots = manifest.get("shots", [])
    output_dir.mkdir(parents=True, exist_ok=True)

    # Find shorts candidates
    candidates = [s for s in shots if s.get("shorts_candidate", False)]
    if not candidates:
        print("[WARN] No shorts_candidate shots found in manifest")
        # Fallback: pick HOOK shot + best character reaction
        hook_shots = [s for s in shots if s.get("segment", "").upper() in ("HOOK", "H")]
        char_shots = [s for s in shots if s.get("visual_type") == "character_reaction"]
        candidates = (hook_shots[:1] + char_shots[:2])[:max_shorts]

    candidates = candidates[:max_shorts]
    font_path = _find_font()
    results = []

    for i, shot in enumerate(candidates):
        shot_id = shot.get("shot_id", f"S{i:02d}")
        visual_type = shot.get("visual_type", "diagram")
        duration = shot.get("duration_sec", 5.0)

        # Find source clip
        clip_path = clips_dir / f"{shot_id}.mp4"
        if not clip_path.exists():
            # Try alternate naming
            alt = clips_dir / f"{shot_id}_clip.mp4"
            if alt.exists():
                clip_path = alt
            else:
                print(f"  [SKIP] {shot_id}: clip not found at {clip_path}")
                continue

        actual_dur = _probe_duration(clip_path)
        if actual_dur <= 0:
            print(f"  [SKIP] {shot_id}: zero duration")
            continue

        # Ensure total doesn't exceed 60s
        content_dur = min(actual_dur, SHORTS_MAX_SEC - BUMPER_SEC - CTA_SEC)
        if content_dur <= 0:
            continue

        output_file = output_dir / f"{episode}_short_{i + 1:02d}_{shot_id}.mp4"

        # Build reframing filter based on visual type
        if visual_type == "character_reaction":
            # Character shot: crop right-center (Vee is usually centered or right)
            crop_filter = (
                f"crop=ih*9/16:ih:iw/2-ih*9/32:0,"
                f"scale={SHORTS_WIDTH}:{SHORTS_HEIGHT}:flags=lanczos"
            )
        else:
            # Diagram/explainer: center crop
            crop_filter = (
                f"crop=ih*9/16:ih:(iw-ih*9/16)/2:0,"
                f"scale={SHORTS_WIDTH}:{SHORTS_HEIGHT}:flags=lanczos"
            )

        # Compose filter with bumper + CTA
        # Method: create bumper color + content + CTA color, then concat
        bumper_filter = (
            f"color=c={theme_color}:s={SHORTS_WIDTH}x{SHORTS_HEIGHT}:d={BUMPER_SEC}:r=30[bumper]"
        )
        cta_filter = (
            f"color=c={theme_color}:s={SHORTS_WIDTH}x{SHORTS_HEIGHT}:d={CTA_SEC}:r=30[cta_bg]"
        )

        filter_parts = [
            f"[0:v]{crop_filter}[content]",
            bumper_filter,
            cta_filter,
        ]

        # Add text to bumper
        if font_path:
            bumper_escaped = bumper_text.replace("'", "'\\''").replace(":", "\\:")
            filter_parts.append(
                f"[bumper]drawtext=text='{bumper_escaped}'"
                f":fontfile='{font_path}':fontsize=48:fontcolor=white"
                f":x=(w-text_w)/2:y=(h-text_h)/2[bumper_txt]"
            )
            bumper_label = "bumper_txt"

            cta_escaped = cta_text.replace("'", "'\\''").replace(":", "\\:")
            filter_parts.append(
                f"[cta_bg]drawtext=text='{cta_escaped}'"
                f":fontfile='{font_path}':fontsize=40:fontcolor=white"
                f":x=(w-text_w)/2:y=(h-text_h)/2[cta_txt]"
            )
            cta_label = "cta_txt"
        else:
            bumper_label = "bumper"
            cta_label = "cta_bg"

        # Concat bumper + content + CTA
        filter_parts.append(
            f"[{bumper_label}][content][{cta_label}]concat=n=3:v=1:a=0[out]"
        )

        filter_complex = ";".join(filter_parts)

        cmd = [
            "ffmpeg", "-y",
            "-i", str(clip_path),
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-c:v", "libx264", "-preset", "fast",
            "-pix_fmt", "yuv420p",
            "-movflags", "faststart",
            str(output_file),
        ]

        if _run(cmd, f"Short {i + 1}"):
            total_dur = BUMPER_SEC + content_dur + CTA_SEC
            size_kb = output_file.stat().st_size // 1024
            print(f"  [OK] {output_file.name} ({total_dur:.1f}s, {size_kb}KB)")
            results.append({
                "short_number": i + 1,
                "shot_id": shot_id,
                "segment": shot.get("segment", ""),
                "visual_type": visual_type,
                "duration_sec": round(total_dur, 1),
                "source_clip": str(clip_path),
                "output": str(output_file),
                "size_kb": size_kb,
            })

    # Write extraction report
    report = {
        "episode": episode,
        "manifest": str(manifest_path),
        "total_shorts": len(results),
        "candidates_found": len(candidates),
        "shorts": results,
    }
    report_path = output_dir / f"{episode}_shorts_report.json"
    with report_path.open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n[OK] Extracted {len(results)} shorts → {output_dir}")
    print(f"[OK] Report: {report_path}")

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract YouTube Shorts from episode renders")
    parser.add_argument("--manifest", required=True, type=Path, help="Shot manifest JSON (v6)")
    parser.add_argument("--clips-dir", required=True, type=Path, help="Rendered clips directory")
    parser.add_argument("--output-dir", required=True, type=Path, help="Output shorts directory")
    parser.add_argument("--episode", required=True, help="Episode ID (e.g., ep01)")
    parser.add_argument("--bumper-text", default="Vibecode Town", help="Intro bumper text")
    parser.add_argument("--cta-text", default="풀 에피소드 보기 →", help="Outro CTA text")
    parser.add_argument("--theme-color", default="#0D1B2A", help="Theme background color")
    parser.add_argument("--max-shorts", type=int, default=5, help="Max shorts to extract")
    args = parser.parse_args()

    if not args.manifest.exists():
        print(f"Manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    if not args.clips_dir.exists():
        print(f"Clips directory not found: {args.clips_dir}", file=sys.stderr)
        return 1

    extract_shorts(
        manifest_path=args.manifest,
        clips_dir=args.clips_dir,
        output_dir=args.output_dir,
        episode=args.episode,
        bumper_text=args.bumper_text,
        cta_text=args.cta_text,
        theme_color=args.theme_color,
        max_shorts=args.max_shorts,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
