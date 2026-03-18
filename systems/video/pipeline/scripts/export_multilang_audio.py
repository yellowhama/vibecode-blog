#!/usr/bin/env python3
"""Export multi-language audio tracks for YouTube upload.

Pads or trims each language's mixed audio to exactly match the final video
duration, ensuring perfect sync for YouTube's multi-language audio feature.

Usage:
    python export_multilang_audio.py --episode 01 --video output/ep01/final/EP01_v4_FINAL.mp4
    python export_multilang_audio.py --episode 03 --video output/ep03/final/EP03_v4_FINAL.mp4 --languages ko,en
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

SYSTEMS = Path("/mnt/e/vibecode-blog/systems/video")

# Episode primary language mapping
EPISODE_LANGUAGE = {
    "01": "en",
    "02": "en",
    "03": "ko",
    "04": "en",
}


def _ffprobe_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def _pad_trim_audio(input_wav: Path, output_wav: Path, target_duration: float) -> bool:
    """Pad (with silence) or trim audio to exactly match target duration."""
    output_wav.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run([
        "ffmpeg", "-y", "-i", str(input_wav),
        "-af", f"apad,atrim=0:{target_duration:.6f}",
        "-c:a", "pcm_s16le",
        str(output_wav),
    ], capture_output=True, text=True)
    return result.returncode == 0


def _find_audio_for_lang(ep: str, lang: str) -> Path | None:
    """Find the mixed or narration audio for a specific language."""
    ep_out = SYSTEMS / "output" / f"ep{ep}"
    ep_prepro = SYSTEMS / "preproduction" / f"ep{ep}"
    primary = EPISODE_LANGUAGE.get(ep, "en")

    if lang == primary:
        # Primary language: use existing mixed audio
        candidates = [
            ep_out / "audio" / "mixed_audio_v4.wav",
            ep_out / "audio" / "mixed_audio.wav",
            ep_prepro / "voiceover_master_tts.wav",
            ep_out / "audio" / "narration_v3.wav",
        ]
    else:
        # Alternate language: look for language-specific files
        candidates = [
            ep_out / "audio" / f"mixed_audio_v4_{lang}.wav",
            ep_out / "audio" / f"narration_{lang}.wav",
            ep_prepro / f"voiceover_master_tts_{lang}.wav",
        ]

    for c in candidates:
        if c.exists():
            return c
    return None


def export_multilang(
    ep: str,
    video_path: Path,
    languages: List[str],
) -> Dict[str, Any]:
    """Export language-specific audio tracks padded to video duration."""
    video_dur = _ffprobe_duration(video_path)
    if video_dur <= 0:
        print(f"[FAIL] Cannot probe video duration: {video_path}", file=sys.stderr)
        sys.exit(1)

    ep_out = SYSTEMS / "output" / f"ep{ep}"
    primary = EPISODE_LANGUAGE.get(ep, "en")
    results: List[Dict[str, Any]] = []

    print(f"[INFO] Video: {video_path} ({video_dur:.3f}s)")
    print(f"[INFO] Primary language: {primary}")
    print(f"[INFO] Export languages: {', '.join(languages)}")

    for lang in languages:
        source = _find_audio_for_lang(ep, lang)
        output = ep_out / "audio" / f"mixed_audio_v4_{lang}.wav"

        if source is None:
            print(f"  [{lang}] [WARN] No audio source found — skipping")
            results.append({
                "language": lang,
                "status": "skipped",
                "reason": "no_source_audio",
            })
            continue

        source_dur = _ffprobe_duration(source)
        delta = video_dur - source_dur

        ok = _pad_trim_audio(source, output, video_dur)
        if not ok:
            print(f"  [{lang}] [FAIL] pad/trim failed")
            results.append({"language": lang, "status": "failed"})
            continue

        final_dur = _ffprobe_duration(output)
        size_mb = output.stat().st_size / (1024 * 1024)

        action = "padded" if delta > 0.01 else ("trimmed" if delta < -0.01 else "exact")
        print(f"  [{lang}] [OK] {output.name} — {final_dur:.3f}s ({action}, Δ{delta:+.3f}s, {size_mb:.1f}MB)")

        results.append({
            "language": lang,
            "status": "ok",
            "source": str(source),
            "output": str(output),
            "video_duration_sec": round(video_dur, 3),
            "audio_duration_sec": round(final_dur, 3),
            "delta_sec": round(delta, 3),
            "action": action,
            "size_mb": round(size_mb, 1),
            "is_primary": lang == primary,
        })

    # Write report
    report = {
        "generated_at": datetime.now().isoformat(),
        "episode": f"ep{ep}",
        "video": str(video_path),
        "video_duration_sec": round(video_dur, 3),
        "primary_language": primary,
        "exports": results,
    }
    report_path = ep_out / "audio" / "multilang_export_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] Report: {report_path}")

    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Export multi-language audio for YouTube")
    parser.add_argument("--episode", "-e", required=True, help="Episode number (01, 02, ...)")
    parser.add_argument("--video", required=True, type=Path, help="Final video MP4")
    parser.add_argument("--languages", default="en,ko", help="Comma-separated languages to export")
    args = parser.parse_args()

    ep = args.episode.zfill(2)
    if not args.video.exists():
        print(f"[FAIL] Video not found: {args.video}", file=sys.stderr)
        return 1

    langs = [l.strip() for l in args.languages.split(",")]
    export_multilang(ep, args.video, langs)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
