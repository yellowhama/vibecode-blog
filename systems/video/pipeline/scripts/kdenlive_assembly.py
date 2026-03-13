#!/usr/bin/env python3
"""KDEnlive-based timeline assembler with multi-track support.

Assembles video clips into a multi-track KDEnlive timeline with transitions,
guides at scene boundaries, and MLT XML export for melt rendering.

Falls back to video_assembler.py FFmpeg path on failure.

Usage:
    python3 kdenlive_assembly.py --clips clip1.mp4 clip2.mp4 clip3.mp4 \
        --output final.mp4 --manifest shot_manifest.json --profile hd1080p30
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))


def _probe_duration(path: Path) -> float:
    """Get media duration via ffprobe."""
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
            capture_output=True, text=True, timeout=10,
        )
        return max(0.0, float(out.stdout.strip()))
    except (ValueError, subprocess.TimeoutExpired):
        return 0.0


def _has_kdenlive() -> bool:
    """Check if KDEnlive harness is available."""
    try:
        from cli_anything_bridge import AVAILABLE_TOOLS
        return "kdenlive" in AVAILABLE_TOOLS
    except ImportError:
        return False


def assemble_with_kdenlive(
    clips: list[Path],
    output_path: Path,
    manifest: dict[str, Any] | None = None,
    profile: str = "hd1080p30",
    transition_type: str = "dissolve",
    transition_duration: float = 1.0,
    bgm_path: Path | None = None,
    voiceover_path: Path | None = None,
) -> Path:
    """Assemble clips into a video using KDEnlive harness.

    Multi-track layout:
        V1: Main video clips (sequenced)
        V2: Overlay track (future use)
        A1: Voiceover
        A2: Background music

    Args:
        clips: Ordered list of video clip paths.
        output_path: Final rendered output path.
        manifest: Shot manifest for scene boundary guides.
        profile: KDEnlive profile string.
        transition_type: Transition type between clips.
        transition_duration: Transition duration in seconds.
        bgm_path: Optional background music file.
        voiceover_path: Optional voiceover file.

    Returns:
        Path to rendered output.
    """
    from cli_anything_bridge import KDEnliveSession

    with KDEnliveSession() as sess:
        sess.project_new(profile=profile)

        # Create tracks
        sess.track_add("V1", track_type="video")
        sess.track_add("V2", track_type="video")
        sess.track_add("A1", track_type="audio")
        sess.track_add("A2", track_type="audio")

        # Import all media into bin
        clip_ids: list[str] = []
        for i, clip_path in enumerate(clips):
            result = sess.bin_import(str(clip_path))
            clip_id = result.get("clip_id", f"clip_{i}")
            clip_ids.append(clip_id)

        if voiceover_path and voiceover_path.exists():
            vo_result = sess.bin_import(str(voiceover_path))
            vo_clip_id = vo_result.get("clip_id", "voiceover")
        else:
            vo_clip_id = None

        if bgm_path and bgm_path.exists():
            bgm_result = sess.bin_import(str(bgm_path))
            bgm_clip_id = bgm_result.get("clip_id", "bgm")
        else:
            bgm_clip_id = None

        # Place clips on V1 timeline
        position = 0.0
        clip_positions: list[tuple[float, float]] = []
        for i, (clip_path, clip_id) in enumerate(zip(clips, clip_ids)):
            dur = _probe_duration(clip_path)
            sess.clip_add(
                track_id="V1",
                clip_id=clip_id,
                position=position,
                in_point=0,
                out_point=dur,
            )
            clip_positions.append((position, dur))

            # Add transition between consecutive clips
            if i > 0 and transition_duration > 0:
                sess.transition_add(
                    type=transition_type,
                    track_a="V1",
                    track_b="V1",
                    position=position,
                    duration=transition_duration,
                )

            position += dur
            if i < len(clips) - 1 and transition_duration > 0:
                position -= transition_duration

        # Place voiceover on A1
        if vo_clip_id:
            vo_dur = _probe_duration(voiceover_path)
            sess.clip_add(track_id="A1", clip_id=vo_clip_id,
                          position=0, in_point=0, out_point=vo_dur)

        # Place BGM on A2
        if bgm_clip_id:
            bgm_dur = _probe_duration(bgm_path)
            sess.clip_add(track_id="A2", clip_id=bgm_clip_id,
                          position=0, in_point=0, out_point=min(bgm_dur, position))

        # Add scene boundary guides from manifest
        if manifest:
            _add_scene_guides(sess, manifest, clip_positions, transition_duration)

        # Export MLT XML
        xml_path = output_path.parent / f"{output_path.stem}.mlt"
        sess.export_xml(str(xml_path))

        # Render via melt
        result = sess.render(str(xml_path), str(output_path))

    if output_path.exists():
        print(f"[OK] KDEnlive assembly → {output_path}")
        return output_path

    raise RuntimeError("KDEnlive render output not found")


def _add_scene_guides(
    sess: Any,
    manifest: dict[str, Any],
    clip_positions: list[tuple[float, float]],
    overlap: float,
) -> None:
    """Add timeline guides at scene boundaries from manifest."""
    shots = manifest.get("shots", [])
    current_scene = None
    for i, shot in enumerate(shots):
        scene = shot.get("scene_id", shot.get("scene", ""))
        if scene != current_scene and i < len(clip_positions):
            current_scene = scene
            pos = clip_positions[i][0]
            label = f"Scene: {scene}" if scene else f"Shot {shot.get('shot_id', i+1)}"
            try:
                sess.guide_add(position=pos, comment=label)
            except Exception:
                pass  # Guides are non-critical


def assemble_with_fallback(
    clips: list[Path],
    output_path: Path,
    manifest: dict[str, Any] | None = None,
    profile: str = "hd1080p30",
    transition_type: str = "dissolve",
    transition_duration: float = 1.0,
    bgm_path: Path | None = None,
    voiceover_path: Path | None = None,
) -> Path:
    """Assemble with KDEnlive, falling back to FFmpeg on failure."""
    if _has_kdenlive():
        try:
            return assemble_with_kdenlive(
                clips=clips, output_path=output_path, manifest=manifest,
                profile=profile, transition_type=transition_type,
                transition_duration=transition_duration,
                bgm_path=bgm_path, voiceover_path=voiceover_path,
            )
        except Exception as e:
            print(f"[WARN] KDEnlive assembly failed ({e}) — falling back to FFmpeg")

    from video_assembler import assemble_with_transitions
    print("[POST] FFmpeg fallback assembly...")
    assemble_with_transitions(
        clips=clips,
        transition=transition_type,
        transition_duration=transition_duration,
        output_path=output_path,
    )
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser(description="KDEnlive timeline assembler")
    parser.add_argument("--clips", nargs="+", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--manifest", type=Path, default=None)
    parser.add_argument("--profile", default="hd1080p30")
    parser.add_argument("--transition", default="dissolve")
    parser.add_argument("--transition-duration", type=float, default=1.0)
    parser.add_argument("--bgm", type=Path, default=None)
    parser.add_argument("--voiceover", type=Path, default=None)
    parser.add_argument("--force-ffmpeg", action="store_true")
    args = parser.parse_args()

    manifest = None
    if args.manifest and args.manifest.exists():
        with args.manifest.open("r", encoding="utf-8") as f:
            manifest = json.load(f)

    args.output.parent.mkdir(parents=True, exist_ok=True)

    if args.force_ffmpeg:
        from video_assembler import assemble_with_transitions
        assemble_with_transitions(
            clips=args.clips, transition=args.transition,
            transition_duration=args.transition_duration, output_path=args.output,
        )
    else:
        assemble_with_fallback(
            clips=args.clips, output_path=args.output, manifest=manifest,
            profile=args.profile, transition_type=args.transition,
            transition_duration=args.transition_duration,
            bgm_path=args.bgm, voiceover_path=args.voiceover,
        )

    print(f"[OK] output: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
