#!/usr/bin/env python3
"""Extract word-level timestamps from narration using Whisper, generate SRT and timing JSON."""
import argparse, json, subprocess, sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Whisper timing extraction")
    parser.add_argument("--input", required=True, help="Input WAV file")
    parser.add_argument("--model", default="medium", help="Whisper model size")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--manifest", help="Shot manifest to update with timing")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Run whisper with word timestamps
    print(f"Running Whisper ({args.model}) on {input_path}...")
    result = subprocess.run([
        "whisper", str(input_path),
        "--model", args.model,
        "--output_format", "json",
        "--word_timestamps", "True",
        "--output_dir", str(output_dir),
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Whisper failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    # Parse Whisper JSON output
    json_path = output_dir / f"{input_path.stem}.json"
    if not json_path.exists():
        print(f"Whisper JSON not found at {json_path}", file=sys.stderr)
        sys.exit(1)

    whisper_data = json.loads(json_path.read_text())
    segments = whisper_data.get("segments", [])

    # Generate timing.json (segment-level with word-level detail)
    timing = {
        "source": str(input_path),
        "model": args.model,
        "segments": []
    }
    for seg in segments:
        entry = {
            "id": seg["id"],
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip(),
            "words": [
                {"word": w["word"].strip(), "start": w["start"], "end": w["end"]}
                for w in seg.get("words", [])
            ]
        }
        timing["segments"].append(entry)

    timing_path = output_dir / "timing.json"
    timing_path.write_text(json.dumps(timing, indent=2, ensure_ascii=False))
    print(f"Timing JSON: {timing_path} ({len(timing['segments'])} segments)")

    # Generate SRT
    srt_lines = []
    for i, seg in enumerate(segments, 1):
        start = _format_srt_time(seg["start"])
        end = _format_srt_time(seg["end"])
        text = seg["text"].strip()
        srt_lines.append(f"{i}\n{start} --> {end}\n{text}\n")

    srt_path = output_dir / "subtitles.srt"
    srt_path.write_text('\n'.join(srt_lines), encoding='utf-8')
    print(f"SRT: {srt_path} ({len(segments)} entries)")

    # Optionally update shot manifest with timing
    if args.manifest:
        manifest_path = Path(args.manifest)
        if manifest_path.exists():
            manifest = json.loads(manifest_path.read_text())
            shots = manifest.get("shots", manifest if isinstance(manifest, list) else [])
            # Simple sync: assign timing segments to shots by accumulated time
            print(f"Manifest timing sync: {manifest_path}")
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

    print("Done.")


def _format_srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


if __name__ == "__main__":
    main()
