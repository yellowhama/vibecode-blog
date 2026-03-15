#!/usr/bin/env python3
"""FFmpeg-based final assembly (fallback when Remotion not available)."""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path

SYSTEMS = Path("/mnt/e/vibecode-blog/systems/video")

def main():
    parser = argparse.ArgumentParser(description="FFmpeg video assembler")
    parser.add_argument("--episode", "-e", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--resolution", default="1920x1080")
    parser.add_argument("--fps", type=int, default=30)
    args = parser.parse_args()

    ep = args.episode.zfill(2)
    outd = Path(args.output_dir)
    outd.mkdir(parents=True, exist_ok=True)

    ep_out = SYSTEMS / "output" / f"ep{ep}"
    clips_dir = ep_out / "renders" / "clips"
    explainer_dir = ep_out / "renders" / "explainer"
    audio_file = ep_out / "audio" / "mixed_audio.wav"
    if not audio_file.exists():
        audio_file = ep_out / "audio" / "narration.wav"
    srt_file = ep_out / "subtitles" / "subtitles.srt"

    w, h = args.resolution.split("x")

    # Collect all video clips in order
    clips = sorted(clips_dir.glob("*.mp4")) if clips_dir.exists() else []

    # Also collect explainer images if they exist
    explainer_frames = sorted(explainer_dir.glob("*.png")) if explainer_dir.exists() else []

    if not clips and not explainer_frames:
        print("No clips or explainer frames found. Nothing to assemble.", file=sys.stderr)
        sys.exit(1)

    # Build concat file
    scaled_clips = []
    for i, clip in enumerate(clips):
        scaled = Path(tempfile.mktemp(suffix=".mp4"))
        subprocess.run([
            "ffmpeg", "-y", "-i", str(clip),
            "-vf", f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black",
            "-r", str(args.fps), "-c:v", "libx264", "-preset", "fast",
            str(scaled),
        ], capture_output=True)
        scaled_clips.append(scaled)

    # If we have explainer frames, make a video from them
    if explainer_frames:
        explainer_video = Path(tempfile.mktemp(suffix=".mp4"))
        # Use image sequence to video
        subprocess.run([
            "ffmpeg", "-y", "-framerate", str(args.fps),
            "-i", str(explainer_dir / "%04d.png"),
            "-vf", f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black",
            "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
            str(explainer_video),
        ], capture_output=True)
        scaled_clips.append(explainer_video)

    if not scaled_clips:
        print("No processable content.", file=sys.stderr)
        sys.exit(1)

    # Concat all clips
    concat_file = Path(tempfile.mktemp(suffix=".txt"))
    concat_file.write_text('\n'.join(f"file '{c}'" for c in scaled_clips))

    concat_video = Path(tempfile.mktemp(suffix=".mp4"))
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_video),
    ], capture_output=True)

    # Add audio and subtitles
    final_path = outd / f"EP{ep}_FINAL.mp4"
    cmd = ["ffmpeg", "-y", "-i", str(concat_video)]

    if audio_file.exists():
        cmd.extend(["-i", str(audio_file)])

    filter_parts = []
    if srt_file.exists():
        cmd.extend(["-vf", f"subtitles={srt_file}:force_style='FontSize=24,PrimaryColour=&H00FFFFFF'"])

    if audio_file.exists():
        cmd.extend([
            "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
        ])
    else:
        cmd.extend(["-c:v", "libx264", "-preset", "medium", "-crf", "18"])

    cmd.append(str(final_path))

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Assembly failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    # Cleanup temp files
    for f in scaled_clips:
        f.unlink(missing_ok=True)
    concat_file.unlink(missing_ok=True)
    concat_video.unlink(missing_ok=True)

    print(f"Final video: {final_path}")

    # Also generate shorts cuts
    _generate_shorts(final_path, outd, ep)


def _generate_shorts(final_path: Path, outd: Path, ep: str):
    """Extract potential shorts clips (vertical 9:16, 60s max)."""
    # Simple: take first 60s as a short
    shorts_path = outd / f"EP{ep}_SHORTS_01.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(final_path),
        "-t", "58", "-vf", "crop=ih*9/16:ih,scale=1080:1920",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "aac", "-b:a", "128k",
        str(shorts_path),
    ], capture_output=True)
    if shorts_path.exists():
        print(f"Shorts: {shorts_path}")


if __name__ == "__main__":
    main()
