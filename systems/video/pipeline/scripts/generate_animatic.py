#!/usr/bin/env python3
"""Generate an animatic preview from storyboard PNGs + voiceover + subtitles.

Produces a timing-validation MP4 using FFmpeg concat demuxer.
Run this before committing to expensive I2V renders.

Usage:
    python generate_animatic.py \
        --manifest ep01_shot_manifest.json \
        --storyboard-dir ep01_storyboards/ \
        --voiceover tts_full/voiceover_master.wav \
        --subtitles tts_full/subtitles.srt \
        --output EP01_ANIMATIC.mp4
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


def _json_load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _find_storyboard(storyboard_dir: Path, shot_id: str) -> Path | None:
    """Find storyboard PNG for a shot, trying common naming patterns."""
    candidates = [
        storyboard_dir / f"SB_{shot_id}.png",
        storyboard_dir / f"{shot_id}_storyboard.png",
        storyboard_dir / f"{shot_id}_keyframe.png",
        storyboard_dir / f"{shot_id}.png",
    ]
    for c in candidates:
        if c.exists():
            return c
    return None


def _make_placeholder(tmpdir: Path, shot_id: str, duration: float, width: int = 832, height: int = 480) -> Path:
    """Generate a placeholder PNG with shot ID text using FFmpeg."""
    out = tmpdir / f"placeholder_{shot_id}.png"
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i",
            f"color=c=0x1a1a2e:s={width}x{height}:d=1",
            "-vf", f"drawtext=text='{shot_id}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
            "-frames:v", "1",
            str(out),
        ],
        capture_output=True,
    )
    if not out.exists():
        # Ultra-fallback: 1x1 black pixel (FFmpeg without drawtext)
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=black:s={width}x{height}:d=1", "-frames:v", "1", str(out)],
            capture_output=True,
        )
    return out


def build_concat_file(
    shots: list[dict[str, Any]],
    storyboard_dir: Path,
    tmpdir: Path,
) -> tuple[Path, list[str]]:
    """Build FFmpeg concat demuxer file. Returns (concat_path, warnings)."""
    concat_path = tmpdir / "concat.txt"
    warnings: list[str] = []
    lines: list[str] = []

    for shot in shots:
        shot_id = shot.get("shot_id", "UNKNOWN")
        duration = float(shot.get("duration_sec", 5.0))

        img = _find_storyboard(storyboard_dir, shot_id)
        if img is None:
            warnings.append(f"[WARN] Missing storyboard for {shot_id} — using placeholder")
            img = _make_placeholder(tmpdir, shot_id, duration)

        # Escape single quotes for FFmpeg concat format
        img_str = str(img).replace("'", "'\\''")
        lines.append(f"file '{img_str}'")
        lines.append(f"duration {duration:.3f}")

    # FFmpeg concat demuxer bug: duplicate last entry to avoid last-frame drop
    if lines:
        lines.append(lines[-2])  # repeat last file line
        lines.append(lines[-1])  # repeat last duration line

    concat_path.write_text("\n".join(lines), encoding="utf-8")
    return concat_path, warnings


def generate_animatic(
    manifest_path: Path,
    storyboard_dir: Path,
    output: Path,
    voiceover: Path | None = None,
    subtitles: Path | None = None,
    dry_run: bool = False,
) -> None:
    manifest = _json_load(manifest_path)
    shots = manifest.get("shots", [])
    if not shots:
        print("[ERROR] No shots in manifest", file=sys.stderr)
        sys.exit(1)

    total_dur = sum(float(s.get("duration_sec", 5.0)) for s in shots)
    print(f"[ANIMATIC] {len(shots)} shots, total duration: {total_dur:.1f}s")

    with tempfile.TemporaryDirectory(prefix="animatic_") as tmpdir:
        tmpdir_p = Path(tmpdir)
        concat_file, warnings = build_concat_file(shots, storyboard_dir, tmpdir_p)

        for w in warnings:
            print(w)

        # Build FFmpeg command
        cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file)]

        if voiceover and voiceover.exists():
            cmd.extend(["-i", str(voiceover)])

        vf_filters = []
        if subtitles and subtitles.exists():
            # Escape path for FFmpeg subtitle filter
            sub_escaped = str(subtitles).replace("\\", "/").replace(":", "\\:")
            vf_filters.append(f"subtitles='{sub_escaped}':force_style='FontSize=20'")

        if vf_filters:
            cmd.extend(["-vf", ",".join(vf_filters)])

        cmd.extend([
            "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
        ])

        output.parent.mkdir(parents=True, exist_ok=True)
        cmd.append(str(output))

        if dry_run:
            print("[DRY RUN] concat file:")
            print(concat_file.read_text(encoding="utf-8"))
            print()
            print("[DRY RUN] ffmpeg command:")
            print(" ".join(cmd))
            return

        print(f"[ANIMATIC] Rendering → {output}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[ERROR] FFmpeg failed:\n{result.stderr}", file=sys.stderr)
            sys.exit(1)

        print(f"[ANIMATIC] Done — {output} ({total_dur:.1f}s)")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate animatic preview from storyboards + voiceover",
    )
    parser.add_argument("--manifest", type=Path, required=True, help="Shot manifest JSON")
    parser.add_argument("--storyboard-dir", type=Path, required=True, help="T2I storyboard PNG directory")
    parser.add_argument("--voiceover", type=Path, default=None, help="Voiceover WAV/MP3")
    parser.add_argument("--subtitles", type=Path, default=None, help="SRT subtitle file")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "output" / "EP01_ANIMATIC.mp4",
        help="Output MP4 path",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print FFmpeg command without executing")
    args = parser.parse_args()

    generate_animatic(
        manifest_path=args.manifest,
        storyboard_dir=args.storyboard_dir,
        output=args.output,
        voiceover=args.voiceover,
        subtitles=args.subtitles,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
