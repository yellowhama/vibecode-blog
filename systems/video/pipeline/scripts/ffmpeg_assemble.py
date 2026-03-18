#!/usr/bin/env python3
"""FFmpeg-based final assembly — shot manifest driven.

Reads shot manifest for ordering and duration, finds keyframes/clips per shot,
applies Ken Burns for stills, concatenates with audio and subtitles.
"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path

SYSTEMS = Path("/mnt/e/vibecode-blog/systems/video")


def _find_latest(directory: Path, pattern: str) -> Path | None:
    matches = sorted(directory.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0] if matches else None


def _find_audio(ep_out: Path) -> Path | None:
    for name in ["audio/mixed_audio_v4.wav", "audio/mixed_audio.wav",
                  "audio/narration_v3.wav", "audio/narration.wav"]:
        p = ep_out / name
        if p.exists():
            return p
    return None


def _find_srt(ep_out: Path, ep: str) -> Path | None:
    for name in [f"subtitles/ep{ep}_subtitles.srt", "subtitles/subtitles.srt"]:
        p = ep_out / name
        if p.exists():
            return p
    return None


def _find_shot_asset(shot_id: str, ep_out: Path) -> tuple[str, Path] | None:
    """Find the best visual asset for a shot. Returns (type, path)."""
    # Priority: I2V clip > rendered keyframe > legacy keyframe
    for clips_dir in [ep_out / "renders" / "clips", ep_out / "clips_i2v"]:
        if clips_dir.exists():
            for ext in ["*.mp4", "*.webm"]:
                for f in clips_dir.glob(f"{shot_id}*{ext[1:]}"):
                    return ("clip", f)

    for kf_dir in [ep_out / "renders" / "keyframes", ep_out / "keyframes"]:
        if kf_dir.exists():
            for ext in ["*.png", "*.jpg", "*.webp"]:
                for f in kf_dir.glob(f"{shot_id}*{ext[1:]}"):
                    return ("image", f)

    return None


def _ken_burns_clip(image: Path, duration: float, output: Path, w: int, h: int, fps: int):
    """Create a Ken Burns (zoom+pan) clip from a still image."""
    # Gentle zoom: 1.0 → 1.08 over duration
    vf = (
        f"scale={w*2}:{h*2},"
        f"zoompan=z='min(zoom+0.0008,1.08)':d={int(duration*fps)}:s={w}x{h}:fps={fps},"
        f"format=yuv420p"
    )
    subprocess.run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(image),
        "-vf", vf,
        "-t", f"{duration:.3f}",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-pix_fmt", "yuv420p",
        str(output),
    ], capture_output=True, check=True)


def _color_card_clip(duration: float, output: Path, w: int, h: int, fps: int,
                     text: str = "", color: str = "0x1a1a2e"):
    """Generate a solid color card clip, optionally with text overlay."""
    # Escape text for FFmpeg drawtext filter
    safe_text = text.replace("\\", "\\\\").replace("'", "").replace('"', '').replace(":", "\\:").replace("%", "%%")
    vf = f"drawtext=text='{safe_text}':fontsize=28:fontcolor=white:x=(w-tw)/2:y=(h-th)/2" if safe_text else "null"
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c={color}:s={w}x{h}:d={duration:.3f}:r={fps}",
        "-vf", vf,
        "-t", f"{duration:.3f}",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-pix_fmt", "yuv420p",
        str(output),
    ], capture_output=True, check=True)


def main():
    parser = argparse.ArgumentParser(description="FFmpeg video assembler (shot manifest driven)")
    parser.add_argument("--episode", "-e", required=True)
    parser.add_argument("--shot-manifest", type=Path, default=None,
                        help="Shot manifest JSON (auto-detected if omitted)")
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--resolution", default="1280x720")
    parser.add_argument("--fps", type=int, default=30)
    args = parser.parse_args()

    ep = args.episode.zfill(2)
    outd = Path(args.output_dir)
    outd.mkdir(parents=True, exist_ok=True)
    ep_out = SYSTEMS / "output" / f"ep{ep}"
    ep_prepro = SYSTEMS / "preproduction" / f"ep{ep}"

    w, h = [int(x) for x in args.resolution.split("x")]

    # Find shot manifest (exclude handoff/sync_report variants)
    manifest_path = args.shot_manifest
    if not manifest_path:
        candidates = sorted(
            [p for p in ep_prepro.glob(f"ep{ep}_shot_manifest_v*.json")
             if "handoff" not in p.name and "report" not in p.name and "timed" not in p.name],
            key=lambda p: p.stat().st_mtime, reverse=True
        )
        manifest_path = candidates[0] if candidates else None
    if not manifest_path or not manifest_path.exists():
        print(f"[FAIL] No shot manifest found for ep{ep}", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    shots = manifest.get("shots", [])
    if not shots:
        print("[FAIL] Shot manifest has no shots", file=sys.stderr)
        sys.exit(1)

    audio_file = _find_audio(ep_out)
    srt_file = _find_srt(ep_out, ep)

    print(f"[INFO] ep{ep}: {len(shots)} shots, {args.resolution}@{args.fps}fps")
    print(f"[INFO] audio: {audio_file}")
    print(f"[INFO] srt: {srt_file}")
    print(f"[INFO] manifest: {manifest_path}")

    # Generate per-shot clips
    with tempfile.TemporaryDirectory(prefix=f"assemble_ep{ep}_") as td:
        tmp = Path(td)
        shot_clips: list[Path] = []
        stats = {"clip": 0, "kenburns": 0, "placeholder": 0}

        for i, shot in enumerate(shots):
            shot_id = shot["shot_id"]
            duration = float(shot.get("duration_sec", 5.0))
            clip_path = tmp / f"{i:04d}_{shot_id}.mp4"

            asset = _find_shot_asset(shot_id, ep_out)

            if asset and asset[0] == "clip":
                # Scale existing clip to target resolution + duration
                subprocess.run([
                    "ffmpeg", "-y", "-i", str(asset[1]),
                    "-vf", f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black",
                    "-t", f"{duration:.3f}",
                    "-r", str(args.fps),
                    "-c:v", "libx264", "-preset", "fast", "-an",
                    str(clip_path),
                ], capture_output=True)
                stats["clip"] += 1
            elif asset and asset[0] == "image":
                # Ken Burns from keyframe
                _ken_burns_clip(asset[1], duration, clip_path, w, h, args.fps)
                stats["kenburns"] += 1
            else:
                # Color card placeholder
                desc = shot.get("description", shot_id)[:60]
                _color_card_clip(duration, clip_path, w, h, args.fps, text=desc)
                stats["placeholder"] += 1

            if clip_path.exists():
                shot_clips.append(clip_path)
            else:
                print(f"  [WARN] Failed to create clip for {shot_id}")
                _color_card_clip(duration, clip_path, w, h, args.fps, text=shot_id)
                shot_clips.append(clip_path)
                stats["placeholder"] += 1

        print(f"[INFO] Clips: {stats['clip']} video, {stats['kenburns']} ken-burns, {stats['placeholder']} placeholder")

        if not shot_clips:
            print("[FAIL] No clips generated", file=sys.stderr)
            sys.exit(1)

        # Concat all clips
        concat_txt = tmp / "concat.txt"
        concat_txt.write_text("\n".join(f"file '{c}'" for c in shot_clips))
        concat_raw = tmp / "concat_raw.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(concat_txt), "-c", "copy", str(concat_raw),
        ], capture_output=True, check=True)

        # Add audio + subtitles
        final_path = outd / f"EP{ep}_v4_FINAL.mp4"
        cmd = ["ffmpeg", "-y", "-i", str(concat_raw)]

        if audio_file:
            cmd.extend(["-i", str(audio_file)])

        vf_parts = []
        if srt_file:
            # Escape path for subtitles filter
            srt_escaped = str(srt_file).replace("\\", "/").replace(":", "\\:")
            vf_parts.append(
                f"subtitles='{srt_escaped}':force_style="
                f"'FontSize=20,FontName=Arial,PrimaryColour=&H00FFFFFF,"
                f"OutlineColour=&H00000000,Outline=2,Shadow=1,MarginV=30'"
            )

        if vf_parts:
            cmd.extend(["-vf", ",".join(vf_parts)])

        if audio_file:
            cmd.extend([
                "-map", "0:v", "-map", "1:a",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-c:a", "aac", "-b:a", "192k",
                "-shortest",
            ])
        else:
            cmd.extend(["-c:v", "libx264", "-preset", "medium", "-crf", "18"])

        cmd.extend(["-movflags", "+faststart", str(final_path)])

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[FAIL] Assembly failed: {result.stderr[:500]}", file=sys.stderr)
            sys.exit(1)

    # Probe final
    probe = subprocess.run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size",
        "-of", "default=noprint_wrappers=1", str(final_path),
    ], capture_output=True, text=True)
    print(f"[OK] Final video: {final_path}")
    print(f"  {probe.stdout.strip()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
