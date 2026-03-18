#!/usr/bin/env python3
"""Mix narration + BGM + SFX into final audio track.
Upgraded config with: BGM crossfade, SFX placement via adelay, sidechain ducking.
"""
import argparse, subprocess, sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Audio mixer (narration + BGM + SFX)")
    parser.add_argument("--narration", required=True, help="Narration WAV")
    parser.add_argument("--bgm", nargs="*", help="Background music WAV files (can be multiple for crossfade, or time:path)")
    parser.add_argument("--sfx", nargs="*", help="SFX files (format: time_sec:path, e.g. 5.2:boom.wav)")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--bgm-volume", type=float, default=0.15, help="BGM volume (0-1)")
    parser.add_argument("--ducking-db", type=float, default=-15, help="BGM ducking threshold in dB")
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not args.bgm and not args.sfx:
        # Just copy narration
        subprocess.run(["cp", args.narration, str(output_path)], check=True)
        print(f"Mixed audio (narration only): {output_path}")
        return

    cmd = ["ffmpeg", "-y", "-i", args.narration]
    
    # Process BGM inputs
    bgm_files = args.bgm or []
    bgm_parsed = []
    for b in bgm_files:
        if ":" in b and not b.startswith("C:") and not b.startswith("D:") and not b.startswith("E:"):
            try:
                t_str, p_str = b.split(":", 1)
                bgm_parsed.append((float(t_str), p_str))
            except:
                bgm_parsed.append((0.0, b))
        else:
            bgm_parsed.append((0.0, b))
    
    # Add BGM inputs to ffmpeg
    for _, p in bgm_parsed:
        cmd.extend(["-i", p])
        
    bgm_start_idx = 1
    bgm_count = len(bgm_parsed)
    
    # Add SFX inputs to ffmpeg
    sfx_items = args.sfx or []
    sfx_parsed = []
    for s in sfx_items:
        if ":" in s and not s.startswith("C:") and not s.startswith("D:") and not s.startswith("E:"):
            t_str, p_str = s.split(":", 1)
            sfx_parsed.append((float(t_str), p_str))
        else:
            sfx_parsed.append((0.0, s))

    for _, p in sfx_parsed:
        cmd.extend(["-i", p])
        
    sfx_start_idx = 1 + bgm_count
    
    filter_complex = []
    
    # 1. BGM Crossfade or mix
    bgm_out = "[bgm_mixed]"
    if bgm_count == 0:
        pass
    elif bgm_count == 1:
        # Just one BGM, apply delay if needed and volume
        delay_ms = int(bgm_parsed[0][0] * 1000)
        filter_complex.append(f"[{bgm_start_idx}:a]volume={args.bgm_volume},adelay={delay_ms}|{delay_ms}{bgm_out}")
    else:
        # Multiple BGMs: chain with acrossfade
        last_out = f"[{bgm_start_idx}:a]"
        for i in range(1, bgm_count):
            curr = f"[{bgm_start_idx + i}:a]"
            next_out = f"[bgm_cf_{i}]"
            # crossfade duration 2 seconds
            filter_complex.append(f"{last_out}{curr}acrossfade=d=2:c1=tri:c2=tri{next_out}")
            last_out = next_out
        filter_complex.append(f"{last_out}volume={args.bgm_volume}{bgm_out}")

    # 2. SFX Mix with Narration
    vox_sfx_mix = "[vox_sfx]"
    if len(sfx_parsed) == 0:
        filter_complex.append(f"[0:a]anull{vox_sfx_mix}")
    else:
        sfx_labels = []
        for i, (t_sec, _) in enumerate(sfx_parsed):
            delay_ms = int(t_sec * 1000)
            lbl = f"[sfx_d_{i}]"
            sfx_labels.append(lbl)
            filter_complex.append(f"[{sfx_start_idx + i}:a]adelay={delay_ms}|{delay_ms}{lbl}")
        
        inputs = "".join(sfx_labels)
        filter_complex.append(f"[0:a]{inputs}amix=inputs={len(sfx_parsed)+1}:duration=first:dropout_transition=0{vox_sfx_mix}")

    # 3. Sidechain Ducking
    if bgm_count > 0:
        # threshold in linear or dB format depending on ffmpeg version. acompressor works well.
        # [bgm][vox_sfx]sidechaincompress
        ratio = 4.0
        threshold = 0.08  # ~ -22dB
        filter_complex.append(f"{bgm_out}{vox_sfx_mix}sidechaincompress=threshold={threshold}:ratio={ratio}:attack=5:release=300[bgm_ducked]")
        filter_complex.append(f"{vox_sfx_mix}[bgm_ducked]amix=inputs=2:duration=first:dropout_transition=2[final]")
    else:
        filter_complex.append(f"{vox_sfx_mix}anull[final]")

    # Join filtergraph
    filters = "; ".join(filter_complex)
    
    cmd.extend(["-filter_complex", filters, "-map", "[final]", "-c:a", "pcm_s16le", str(output_path)])

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Mix failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    probe = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(output_path),
    ], capture_output=True, text=True)
    dur = probe.stdout.strip()
    print(f"Mixed audio: {output_path} ({dur}s)")

if __name__ == "__main__":
    main()
