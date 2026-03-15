#!/usr/bin/env python3
"""Generate background music using ACE-Step 1.5 (local, GPU)."""
import argparse, subprocess, sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="ACE-Step BGM generator")
    parser.add_argument("--prompt", required=True, help="Music description prompt")
    parser.add_argument("--duration", type=int, default=300, help="Duration in seconds")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--acestep-dir", default="/home/hugh/ACE-Step-1.5", help="ACE-Step install dir")
    parser.add_argument("--lyrics", default="[inst]", help="Lyrics (default: instrumental)")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    acestep_dir = Path(args.acestep_dir)
    if not acestep_dir.exists():
        print("ACE-Step not found. Install:", file=sys.stderr)
        print(f"  git clone https://github.com/ace-step/ACE-Step-1.5 {acestep_dir}", file=sys.stderr)
        print(f"  cd {acestep_dir} && pip install -e .", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # ACE-Step generates via its CLI or Python API
    # Using the gradio-based inference script
    cmd = [
        sys.executable, str(acestep_dir / "infer.py"),
        "--prompt", args.prompt,
        "--lyrics", args.lyrics,
        "--duration", str(args.duration),
        "--output", str(output_path),
        "--seed", str(args.seed),
    ]

    print(f"Generating {args.duration}s BGM...")
    print(f"Prompt: {args.prompt}")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(acestep_dir))

    if result.returncode != 0:
        # Fallback: try Python API directly
        print("CLI failed, trying Python API...", file=sys.stderr)
        try:
            _generate_via_api(args, output_path, acestep_dir)
        except Exception as e:
            print(f"BGM generation failed: {e}", file=sys.stderr)
            print("Generating silence placeholder instead...")
            subprocess.run([
                "ffmpeg", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=48000:cl=mono",
                "-t", str(args.duration), "-c:a", "pcm_s16le",
                str(output_path),
            ], capture_output=True)

    if output_path.exists():
        print(f"BGM: {output_path}")
    else:
        print("BGM generation failed.", file=sys.stderr)
        sys.exit(1)


def _generate_via_api(args, output_path, acestep_dir):
    """Fallback: use ACE-Step Python API directly."""
    sys.path.insert(0, str(acestep_dir))
    # ACE-Step API varies by version — this is a best-effort wrapper
    import torch
    import soundfile as sf

    from acestep.pipeline import ACEStepPipeline

    pipe = ACEStepPipeline.from_pretrained("ACE-Step/ACE-Step-v1-3.5B")
    pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

    audio = pipe(
        prompt=args.prompt,
        lyrics=args.lyrics,
        duration=args.duration,
        seed=args.seed,
    )

    sf.write(str(output_path), audio["audio"][0], audio["sample_rate"])


if __name__ == "__main__":
    main()
