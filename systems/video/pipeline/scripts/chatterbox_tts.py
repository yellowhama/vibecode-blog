#!/usr/bin/env python3
"""Production TTS using Chatterbox. GPU required."""
import argparse, json, sys, subprocess, tempfile
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Chatterbox production TTS")
    parser.add_argument("--input", required=True, help="Input text file or JSON with beats")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--emotion", type=float, default=0.5, help="Exaggeration (0-1)")
    parser.add_argument("--cfg", type=float, default=0.5, help="CFG weight")
    parser.add_argument("--speaker-wav", help="Speaker reference WAV for voice cloning")
    parser.add_argument("--segments-dir", help="Optional dir for per-segment WAVs")
    parser.add_argument("--sample-rate", type=int, default=48000)
    args = parser.parse_args()

    input_path = Path(args.input)

    try:
        import torch
        import numpy as np
        import scipy.io.wavfile
        from chatterbox.tts import ChatterboxTTS
    except ImportError:
        print("ERROR: pip install chatterbox-tts", file=sys.stderr)
        sys.exit(1)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading Chatterbox on {device}...")
    model = ChatterboxTTS.from_pretrained(device=device)

    def synth_one(text: str, out_path: Path):
        gen_kwargs = {"text": text, "exaggeration": args.emotion, "cfg_weight": args.cfg}
        if args.speaker_wav:
            gen_kwargs["audio_prompt"] = Path(args.speaker_wav)
        wav_tensor = model.generate(**gen_kwargs)
        audio_np = wav_tensor.squeeze().cpu().numpy()
        audio_int16 = np.int16(np.clip(audio_np, -1.0, 1.0) * 32767)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = Path(tmp.name)
        scipy.io.wavfile.write(str(tmp_path), model.sr, audio_int16)

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

        # Concat all segments
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
