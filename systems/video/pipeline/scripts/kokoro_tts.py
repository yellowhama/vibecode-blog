#!/usr/bin/env python3
"""Quick-draft TTS using Kokoro-82M. Ultra-fast, CPU-friendly."""
import argparse, json, sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Kokoro-82M draft TTS")
    parser.add_argument("--input", required=True, help="Input text file or JSON (with 'beats' array)")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--voice", default="af_heart", help="Kokoro voice (default: af_heart)")
    parser.add_argument("--lang", default="a", help="Language code: a=US, b=UK")
    parser.add_argument("--segments-dir", help="Optional dir for per-segment WAVs")
    args = parser.parse_args()

    # If input is JSON with beats array, synthesize each beat separately then concat
    # If input is plain text, synthesize entire file
    input_path = Path(args.input)

    try:
        from kokoro import KPipeline
        import soundfile as sf
        import numpy as np
    except ImportError:
        print("ERROR: pip install kokoro>=0.9 soundfile", file=sys.stderr)
        sys.exit(1)

    pipeline = KPipeline(lang_code=args.lang)

    if input_path.suffix == '.json':
        data = json.loads(input_path.read_text())
        beats = data.get('beats', data.get('segments', data.get('shots', [])))
        all_audio = []
        segments_dir = Path(args.segments_dir) if args.segments_dir else None
        if segments_dir:
            segments_dir.mkdir(parents=True, exist_ok=True)

        for i, beat in enumerate(beats):
            text = beat.get('narration_text', beat.get('text', ''))
            if not text.strip():
                continue
            audio_chunks = []
            for gs, ps, audio in pipeline(text, voice=args.voice):
                if audio is not None:
                    audio_chunks.append(audio)
            if audio_chunks:
                segment_audio = np.concatenate(audio_chunks)
                all_audio.append(segment_audio)
                if segments_dir:
                    beat_id = beat.get('beat_id', f'seg_{i:03d}')
                    sf.write(str(segments_dir / f'{beat_id}.wav'), segment_audio, 24000)
                # Add 0.3s silence between segments
                all_audio.append(np.zeros(int(24000 * 0.3), dtype=np.float32))

        if all_audio:
            final = np.concatenate(all_audio)
            out_path = Path(args.output)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            sf.write(str(out_path), final, 24000)
            print(f"Draft narration: {out_path} ({len(final)/24000:.1f}s, {len(beats)} segments)")
    else:
        text = input_path.read_text()
        audio_chunks = []
        for gs, ps, audio in pipeline(text, voice=args.voice):
            if audio is not None:
                audio_chunks.append(audio)
        if audio_chunks:
            final = np.concatenate(audio_chunks)
            out_path = Path(args.output)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            sf.write(str(out_path), final, 24000)
            print(f"Draft narration: {out_path} ({len(final)/24000:.1f}s)")

if __name__ == "__main__":
    main()
