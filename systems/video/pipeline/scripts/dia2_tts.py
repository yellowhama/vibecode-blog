#!/usr/bin/env python3
"""Production TTS using Dia2-1B. Multi-speaker dialogue, GPU required."""
import argparse, json, sys, subprocess, tempfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Dia2-1B production TTS")
    parser.add_argument("--input", required=True, help="Input text file or JSON with beats/shots")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--segments-dir", help="Optional dir for per-segment WAVs")
    parser.add_argument("--sample-rate", type=int, default=48000)
    args = parser.parse_args()

    input_path = Path(args.input)

    try:
        import torch
        import numpy as np
        import scipy.io.wavfile
        from dia2.engine import Dia2
    except ImportError:
        print("ERROR: Install Dia2: pip install -e /home/hugh/dia2_repo  (or git clone https://github.com/nari-labs/dia2)", file=sys.stderr)
        sys.exit(1)

    print("Loading Dia2-1B...")
    model = Dia2(repo="nari-labs/Dia2-1B", device="cuda" if torch.cuda.is_available() else "cpu")
    native_sr = model.sample_rate
    print(f"Dia2-1B loaded (sample_rate={native_sr})")

    def synth_one(text: str, out_path: Path):
        # Add speaker tag if missing
        if "[S1]" not in text and "[S2]" not in text:
            text = f"[S1] {text}"

        result = model.generate(text)
        waveform = result.waveform.cpu().numpy().squeeze()

        if waveform.max() > 1.0:
            waveform = waveform / np.abs(waveform).max()
        audio_int16 = np.int16(np.clip(waveform, -1.0, 1.0) * 32767)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = Path(tmp.name)
        scipy.io.wavfile.write(str(tmp_path), native_sr, audio_int16)

        out_path.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "ffmpeg", "-y", "-i", str(tmp_path),
            "-ar", str(args.sample_rate), "-ac", "1", "-c:a", "pcm_s16le",
            str(out_path),
        ], capture_output=True, check=True)
        tmp_path.unlink(missing_ok=True)

    if input_path.suffix == '.json':
        data = json.loads(input_path.read_text())
        beats = data.get('beats', data.get('segments', data.get('shots', [])))
        segments_dir = Path(args.segments_dir) if args.segments_dir else None
        if segments_dir:
            segments_dir.mkdir(parents=True, exist_ok=True)

        segment_files = []
        for i, beat in enumerate(beats):
            text = beat.get('narration_text', beat.get('text', ''))
            if not text.strip():
                continue
            beat_id = beat.get('beat_id', f'seg_{i:03d}')
            if segments_dir:
                seg_path = segments_dir / f'{beat_id}.wav'
            else:
                seg_path = Path(tempfile.mktemp(suffix='.wav'))
            print(f"  [{i+1}/{len(beats)}] {beat_id}: {text[:60]}...")
            synth_one(text, seg_path)
            segment_files.append(str(seg_path))

        if segment_files:
            out_path = Path(args.output)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            list_file = Path(tempfile.mktemp(suffix='.txt'))
            list_file.write_text('\n'.join(f"file '{f}'" for f in segment_files))
            subprocess.run([
                "ffmpeg", "-y", "-f", "concat", "-safe", "0",
                "-i", str(list_file), "-c:a", "pcm_s16le", str(out_path),
            ], capture_output=True, check=True)
            list_file.unlink(missing_ok=True)
            print(f"Production narration: {out_path} ({len(segment_files)} segments)")
    else:
        text = input_path.read_text()
        synth_one(text, Path(args.output))
        print(f"Production narration: {args.output}")


if __name__ == "__main__":
    main()
