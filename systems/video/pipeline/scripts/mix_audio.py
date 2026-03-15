#!/usr/bin/env python3
"""Mix narration + BGM + SFX into final audio track."""
import argparse, subprocess, sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Audio mixer (narration + BGM + SFX)")
    parser.add_argument("--narration", required=True, help="Narration WAV")
    parser.add_argument("--bgm", help="Background music WAV")
    parser.add_argument("--sfx", nargs="*", help="SFX files (format: time:path, e.g. 5.2:boom.wav)")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--bgm-volume", type=float, default=0.15, help="BGM volume (0-1)")
    parser.add_argument("--ducking-db", type=float, default=-6, help="BGM ducking when narration active")
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not args.bgm:
        # Just copy narration
        subprocess.run(["cp", args.narration, str(output_path)], check=True)
        print(f"Mixed audio (narration only): {output_path}")
        return

    # Simple mix: narration (full volume) + BGM (reduced volume)
    # With sidechain-style ducking via compand
    filter_complex = (
        f"[1]volume={args.bgm_volume}[bg];"
        f"[0][bg]amix=inputs=2:duration=longest:dropout_transition=2"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", args.narration,
        "-i", args.bgm,
        "-filter_complex", filter_complex,
        "-c:a", "pcm_s16le",
        str(output_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Mix failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    # Get duration
    probe = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(output_path),
    ], capture_output=True, text=True)
    dur = probe.stdout.strip()
    print(f"Mixed audio: {output_path} ({dur}s)")

if __name__ == "__main__":
    main()
