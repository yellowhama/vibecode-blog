#!/usr/bin/env python3
"""Generate SRT subtitles from TTS report JSON (actual timing data)."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def _format_srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate SRT from TTS report")
    parser.add_argument("--report", required=True, type=Path, help="TTS report JSON")
    parser.add_argument("--output", required=True, type=Path, help="Output .srt file")
    parser.add_argument("--gap-sec", type=float, default=0.15, help="Gap between beats (must match TTS generation)")
    args = parser.parse_args()

    with args.report.open("r", encoding="utf-8") as f:
        report = json.load(f)

    segments = report.get("segments", [])
    if not segments:
        raise SystemExit("[FAIL] No segments in report")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    cursor = 0.0
    idx = 1

    for seg in segments:
        text = seg.get("text", "").strip()
        dur = float(seg.get("actual_duration_sec", 0.0))

        if not text:
            cursor += dur + args.gap_sec
            continue

        start = cursor
        end = cursor + dur
        lines.append(f"{idx}")
        lines.append(f"{_format_srt_time(start)} --> {_format_srt_time(end)}")
        lines.append(text)
        lines.append("")
        idx += 1
        cursor = end + args.gap_sec

    args.output.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] SRT: {args.output} ({idx - 1} entries, {cursor:.1f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
