#!/usr/bin/env python3
import json
import subprocess
import argparse
from pathlib import Path
import os

def _run(cmd):
    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

def finalize(run_dir):
    run_dir = Path(run_dir)
    manifest_path = run_dir / "shots_synchronized.json"
    vo_path = run_dir / "voiceover_master.wav"
    srt_path = run_dir / "subtitles.srt"
    output_video = run_dir / "FINAL_CONTENT_BOSS_v2.mp4"

    if not manifest_path.exists():
        raise FileNotFoundError(f"Missing manifest: {manifest_path}")
    
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    print(f"[FINALIZE] Assembling video for {run_dir.name}")

    # 1. Collect clips
    # Heuristic: Find files starting with N001, N002... in the run_dir or output subfolders
    clips = []
    for shot in manifest['shots']:
        shot_id = shot['shot_id']
        # Look for .mp4, .webm, or .png/.jpg sequences
        found = list(run_dir.glob(f"{shot_id}*"))
        if not found:
            # Try searching in the main output root too
            found = list(Path("/mnt/e/vibecode-blog/systems/video/output").glob(f"**/{shot_id}*"))
        
        if found:
            # Prefer mp4 over others
            best_match = sorted(found, key=lambda x: x.suffix == ".mp4", reverse=True)[0]
            clips.append(best_match)
            print(f"  - Linked {shot_id} -> {best_match.name}")
        else:
            print(f"  - [WARN] {shot_id} not found! Video will be incomplete.")

    # 2. Concatenate Clips using FFmpeg
    concat_file = run_dir / "concat_list.txt"
    with open(concat_file, 'w') as f:
        for c in clips:
            f.write(f"file '{c.absolute()}'\n")

    raw_assembled = run_dir / "assembled_raw.mp4"
    _run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(raw_assembled)
    ])

    # 3. Final Mux with Audio and Subtitles
    # Using simple mix for now, can use advanced audio engine if audio_catalog is ready
    print("[FINALIZE] Burning subtitles and adding audio...")
    
    # FFmpeg command to mix VO + BGM (simple loop) + Burn Subtitles
    # Note: Assumes BGM exists at standard path
    bgm_path = "/mnt/e/vibecode-blog/systems/video/assets/audio/bgm/cynical_indie_hacker.wav"
    
    filter_complex = (
        f"[1:a]volume=1.0[vo];"
        f"[2:a]stream_loop=-1,volume=0.15[bgm];"
        f"[vo][bgm]amix=inputs=2:duration=first[a]"
    )
    
    # Subtitle filter needs escaped path
    srt_escaped = str(srt_path).replace("\\", "/").replace(":", "\\:")
    
    cmd = [
        "ffmpeg", "-y",
        "-i", str(raw_assembled),
        "-i", str(vo_path),
    ]
    
    # Add BGM if exists
    if Path(bgm_path).exists():
        cmd.extend(["-i", bgm_path])
        cmd.extend(["-filter_complex", filter_complex, "-map", "0:v", "-map", "[a]"])
    else:
        cmd.extend(["-map", "0:v", "-map", "1:a"])

    cmd.extend([
        "-vf", f"subtitles='{srt_escaped}'",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        str(output_video)
    ])
    
    _run(cmd)
    print(f"\n[SUCCESS] Final video created: {output_video}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-dir", required=True)
    args = parser.parse_args()
    finalize(args.run_dir)
