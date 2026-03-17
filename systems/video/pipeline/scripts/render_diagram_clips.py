#!/usr/bin/env python3
"""Render diagram/motion_graphic shots as animated clips using FFmpeg.

For C01-C10 building metaphor and other diagram shots, generates
animated clips from keyframes with more dynamic motion than Ken Burns.

Techniques:
  - Slide-in: elements slide from edges
  - Build-up: progressive reveal (bottom to top for building)
  - Collapse: shake + drop for destruction
  - Zoom-pulse: zoom in/out cycle for emphasis
  - Pan-reveal: horizontal pan across wide diagrams

Usage:
    python render_diagram_clips.py \
        --keyframes output/ep01/keyframes/ \
        --manifest ep01_shot_manifest_v5.json \
        --output output/ep01/clips_diagram/
"""
import argparse, json, subprocess, sys
from pathlib import Path


# Animation presets per shot narrative function
ANIMATION_PRESETS = {
    # Building metaphor sequence
    "C01": "fade_zoom",       # Empty lot → zoom in
    "C02": "slide_left",      # Blueprint unfolds
    "C03": "build_up",        # Foundation slides in
    "C04": "build_up",        # Frame rises
    "C05": "build_up",        # Walls form
    "C06": "zoom_pulse",      # Completed house + checkmark
    "C07": "shake_fade",      # Blueprint gone, red X
    "C08": "drop_blocks",     # Blocks fall randomly
    "C09": "shake",           # Absurd construction wobbles
    "C10": "collapse",        # Tower collapses
    # Other diagram shots
    "C11": "slide_left",      # Skateboard → bicycle → car
    "C12": "slide_left",      # Progression
    "C13": "zoom_pulse",      # Random pile of parts
    "C14": "fade_zoom",       # Three benefits
    "C15": "fade_zoom",       # Character + filter
    "C16": "fade_zoom",       # Stacking blocks
    # Default
    "default": "ken_burns",
}


def main():
    parser = argparse.ArgumentParser(description="Diagram clip renderer")
    parser.add_argument("--keyframes", required=True, help="Keyframes directory")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--output", required=True, help="Output directory for clips")
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--only-diagrams", action="store_true",
                        help="Only render diagram/motion_graphic shots")
    args = parser.parse_args()

    keyframes_dir = Path(args.keyframes)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(Path(args.manifest).read_text())
    shots = manifest.get("shots", [])

    rendered = 0
    skipped = 0

    for i, shot in enumerate(shots):
        shot_id = shot.get("shot_id", f"shot_{i:03d}")
        visual_type = shot.get("visual_type", "")
        duration = shot.get("duration_sec", 5)

        # Filter to diagrams only if requested
        if args.only_diagrams and visual_type not in ("diagram", "motion_graphic"):
            continue

        kf = keyframes_dir / f"{shot_id}_keyframe.png"
        if not kf.exists():
            continue

        output_file = output_dir / f"{shot_id}.mp4"
        if output_file.exists():
            print(f"  [{i+1}/{len(shots)}] {shot_id}: CACHED")
            skipped += 1
            continue

        preset = ANIMATION_PRESETS.get(shot_id, ANIMATION_PRESETS["default"])
        print(f"  [{i+1}/{len(shots)}] {shot_id} [{preset}]: {duration}s")

        success = _render_clip(kf, output_file, duration, preset, args.fps, args.width, args.height)
        if success:
            rendered += 1
        else:
            skipped += 1

    print(f"\nDiagram clips: {rendered} rendered, {skipped} cached/skipped")


def _render_clip(keyframe: Path, output: Path, duration: float, preset: str,
                 fps: int, width: int, height: int) -> bool:
    """Render an animated clip from a keyframe using FFmpeg filters."""
    frames = int(duration * fps)
    vf = _build_filter(preset, frames, fps, width, height)

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(keyframe),
        "-t", str(duration),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-r", str(fps),
        str(output),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"    FAILED: {result.stderr[:200]}", file=sys.stderr)
        return False
    return True


def _build_filter(preset: str, frames: int, fps: int, w: int, h: int) -> str:
    """Build FFmpeg video filter for animation preset."""

    if preset == "ken_burns":
        # Classic slow zoom
        return (
            f"scale=1920:-1,zoompan=z='min(zoom+0.0008,1.25)'"
            f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={frames}:fps={fps}:s={w}x{h}"
        )

    elif preset == "fade_zoom":
        # Fade in + slow zoom from center
        return (
            f"scale=1920:-1,zoompan=z='if(lte(on,{fps}),1+on/{fps}*0.15,min(zoom+0.0005,1.2))'"
            f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={frames}:fps={fps}:s={w}x{h}"
            f",fade=in:0:{fps}"
        )

    elif preset == "slide_left":
        # Pan from right to left (reveal)
        return (
            f"scale=1920:-1,zoompan=z='1.15'"
            f":x='iw*0.1*(1-on/{frames})'"
            f":y='ih/2-(ih/zoom/2)'"
            f":d={frames}:fps={fps}:s={w}x{h}"
        )

    elif preset == "build_up":
        # Pan from bottom to top (building rising)
        return (
            f"scale=-1:1080,zoompan=z='1.1'"
            f":x='iw/2-(iw/zoom/2)'"
            f":y='ih*0.15*(1-on/{frames})'"
            f":d={frames}:fps={fps}:s={w}x{h}"
        )

    elif preset == "zoom_pulse":
        # Zoom in then slight pull back (emphasis)
        mid = frames // 2
        return (
            f"scale=1920:-1,zoompan="
            f"z='if(lte(on,{mid}),1+on/{mid}*0.2,1.2-(on-{mid})/{mid}*0.05)'"
            f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={frames}:fps={fps}:s={w}x{h}"
        )

    elif preset == "shake":
        # Subtle shake effect (instability)
        return (
            f"scale={w+40}:{h+40},"
            f"crop={w}:{h}:"
            f"'20+8*sin(n*0.5)':'20+6*cos(n*0.7)'"
        )

    elif preset == "shake_fade":
        # Shake + fade out at end
        return (
            f"scale={w+40}:{h+40},"
            f"crop={w}:{h}:"
            f"'20+5*sin(n*0.4)':'20+4*cos(n*0.6)',"
            f"fade=out:st={max(0, frames/fps-1)}:d=1"
        )

    elif preset == "collapse":
        # Start stable, then increasing shake, then drop
        third = frames // 3
        return (
            f"scale={w+60}:{h+60},"
            f"crop={w}:{h}:"
            f"'30+if(gt(n,{third}),min((n-{third})*0.3,25),0)*sin(n*0.8)':"
            f"'30+if(gt(n,{2*third}),min((n-{2*third})*0.8,{h//3}),if(gt(n,{third}),min((n-{third})*0.2,15),0)*cos(n*0.9))',"
            f"fade=out:st={max(0, frames/fps-0.5)}:d=0.5"
        )

    elif preset == "drop_blocks":
        # Start with slight zoom, then shake (blocks falling)
        return (
            f"scale=1920:-1,zoompan="
            f"z='if(lte(on,{frames//3}),1+on/{frames}*0.1,1.1)'"
            f":x='iw/2-(iw/zoom/2)+if(gt(on,{frames//3}),6*sin(on*0.6),0)'"
            f":y='ih/2-(ih/zoom/2)+if(gt(on,{frames//3}),4*cos(on*0.8),0)'"
            f":d={frames}:fps={fps}:s={w}x{h}"
        )

    else:
        # Fallback to ken_burns
        return _build_filter("ken_burns", frames, fps, w, h)


if __name__ == "__main__":
    main()
