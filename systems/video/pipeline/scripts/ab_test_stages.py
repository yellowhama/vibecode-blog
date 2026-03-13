#!/usr/bin/env python3
"""A/B test stage comparators: legacy (FFmpeg/Pillow) vs CLI-Anything harness.

Registers 6 comparison stages:
    1. audio_postprocess: FFmpeg loudnorm vs AudacitySession
    2. video_assembly: FFmpeg xfade vs ShotcutSession
    3. thumbnail: FFmpeg+Pillow vs GimpSession
    4. explainer: Pillow vs InkscapeSession
    5. 3d_scene: raw bpy script vs BlenderSession
    6. timeline: FFmpeg concat vs KDEnliveSession

Usage:
    python3 ab_test_stages.py --stage audio_postprocess --input voice.wav --output-dir results/
    python3 ab_test_stages.py --all --input-dir assets/ --output-dir results/
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ab_test_runner import ABTestRunner, ABResult, measure_lufs, measure_ssim, measure_blackdetect, generate_html_report


# ---------------------------------------------------------------------------
# Stage 1: Audio post-processing
# ---------------------------------------------------------------------------

def _audio_legacy(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """FFmpeg loudnorm two-pass normalization."""
    # First pass: measure
    proc = subprocess.run(
        ["ffmpeg", "-i", str(input_path), "-af",
         "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True, timeout=60,
    )
    stderr = proc.stderr
    start = stderr.rfind("{")
    end = stderr.rfind("}") + 1
    measured = {}
    if start >= 0 and end > start:
        measured = json.loads(stderr[start:end])

    # Second pass: apply
    il = measured.get("input_i", "-14")
    tp = measured.get("input_tp", "-1.5")
    lra = measured.get("input_lra", "11")
    offset = measured.get("target_offset", "0")

    subprocess.run(
        ["ffmpeg", "-y", "-i", str(input_path), "-af",
         f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={il}:measured_TP={tp}"
         f":measured_LRA={lra}:measured_thresh={measured.get('input_thresh', '-24')}"
         f":offset={offset}:linear=true",
         str(output_path)],
        capture_output=True, text=True, timeout=60, check=True,
    )

    lufs = measure_lufs(output_path) or {}
    return {"lufs_integrated": lufs.get("integrated", -70), "engine": "ffmpeg"}


def _audio_harness(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """Audacity harness normalization."""
    from cli_anything_bridge import AudacitySession

    with AudacitySession() as sess:
        sess.project_new()
        sess.track_add("mono")
        sess.clip_add(str(input_path))
        sess.effect_add("loudness-normalize", target=-14, standard="LUFS")
        sess.effect_add("limiter", limit=-1.5)
        sess.export(str(output_path))

    lufs = measure_lufs(output_path) or {}
    return {"lufs_integrated": lufs.get("integrated", -70), "engine": "audacity"}


# ---------------------------------------------------------------------------
# Stage 2: Video assembly
# ---------------------------------------------------------------------------

def _video_legacy(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """FFmpeg xfade assembly."""
    clips_dir = input_path if input_path.is_dir() else input_path.parent
    clips = sorted(clips_dir.glob("*.mp4"))[:5]
    if len(clips) < 2:
        return {"error": "Need at least 2 clips", "engine": "ffmpeg"}

    from video_assembler import assemble_with_transitions
    assemble_with_transitions(clips=clips, transition="fade",
                              transition_duration=1.0, output_path=output_path)

    blacks = measure_blackdetect(output_path)
    return {"black_frames": len(blacks), "engine": "ffmpeg"}


def _video_harness(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """Shotcut/melt assembly via harness."""
    clips_dir = input_path if input_path.is_dir() else input_path.parent
    clips = sorted(clips_dir.glob("*.mp4"))[:5]
    if len(clips) < 2:
        return {"error": "Need at least 2 clips", "engine": "shotcut"}

    from cli_anything_bridge import ShotcutSession
    with ShotcutSession() as sess:
        sess.project_new(profile="hd1080p30")
        sess.track_add("video")
        for clip_path in clips:
            sess.clip_add(str(clip_path), track=1)
        if len(clips) > 1:
            sess.transition_add("fade", duration=1.0)
        sess.export_render(str(output_path), preset="h264-high")

    blacks = measure_blackdetect(output_path)
    return {"black_frames": len(blacks), "engine": "shotcut"}


# ---------------------------------------------------------------------------
# Stage 3: Thumbnail
# ---------------------------------------------------------------------------

def _thumbnail_legacy(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """FFmpeg frame extract + Pillow resize/title."""
    # Extract middle frame
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(input_path)],
        capture_output=True, text=True, timeout=10,
    )
    dur = float(proc.stdout.strip()) if proc.stdout.strip() else 5.0
    mid = dur / 2.0

    raw_frame = output_path.parent / f"{output_path.stem}_raw.png"
    subprocess.run(
        ["ffmpeg", "-y", "-ss", f"{mid:.3f}", "-i", str(input_path),
         "-frames:v", "1", "-q:v", "2", str(raw_frame)],
        capture_output=True, timeout=30, check=True,
    )

    # Resize with Pillow
    from PIL import Image, ImageDraw, ImageFont
    img = Image.open(raw_frame).resize((1280, 720), Image.LANCZOS)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)
    except (OSError, IOError):
        font = ImageFont.load_default()
    title = kw.get("title", "Thumbnail")
    draw.text((40, 620), title, fill="white", font=font)
    img.save(output_path, quality=95)

    raw_frame.unlink(missing_ok=True)
    return {"engine": "pillow+ffmpeg"}


def _thumbnail_harness(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """GIMP harness thumbnail creation."""
    # Extract frame first
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(input_path)],
        capture_output=True, text=True, timeout=10,
    )
    dur = float(proc.stdout.strip()) if proc.stdout.strip() else 5.0
    mid = dur / 2.0

    raw_frame = output_path.parent / f"{output_path.stem}_raw.png"
    subprocess.run(
        ["ffmpeg", "-y", "-ss", f"{mid:.3f}", "-i", str(input_path),
         "-frames:v", "1", "-q:v", "2", str(raw_frame)],
        capture_output=True, timeout=30, check=True,
    )

    from cli_anything_bridge import GimpSession
    with GimpSession() as sess:
        sess.project_new(width=1280, height=720)
        sess.open_image(str(raw_frame))
        sess.canvas_scale(1280, 720)
        sess.color_correct(brightness=5, contrast=10, saturation=10)
        title = kw.get("title", "Thumbnail")
        sess.watermark(text=title, x=40, y=620, font_size=48, opacity=1.0)
        sess.flatten()
        sess.export(str(output_path), fmt="jpg", quality=95)

    raw_frame.unlink(missing_ok=True)
    return {"engine": "gimp"}


# ---------------------------------------------------------------------------
# Stage 4: Explainer graphics
# ---------------------------------------------------------------------------

def _explainer_legacy(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """Pillow-based explainer graphic."""
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new("RGB", (832, 480), "#0D1B2A")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 32)
    except (OSError, IOError):
        font = ImageFont.load_default()
    draw.text((40, 40), "Explainer Graphic", fill="white", font=font)
    draw.rectangle([60, 100, 772, 420], outline="#3B82F6", width=2)
    img.save(output_path)
    return {"engine": "pillow"}


def _explainer_harness(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """Inkscape harness explainer graphic."""
    from cli_anything_bridge import InkscapeSession
    with InkscapeSession() as sess:
        sess.document_new(width=832, height=480, background="#0D1B2A")
        sess.object_add("rect", x=60, y=100, width=712, height=320,
                         stroke="#3B82F6", stroke_width=2, fill="none")
        sess.text_add("Explainer Graphic", x=40, y=40, font_size=32, fill="white")
        sess.export_png(str(output_path), width=832, height=480)
    return {"engine": "inkscape"}


# ---------------------------------------------------------------------------
# Stage 5: 3D scene
# ---------------------------------------------------------------------------

def _3d_legacy(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """Raw bpy script render (requires Blender in PATH)."""
    script = f"""
import bpy
bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.mesh.primitive_uv_sphere_add(location=(0,0,1))
bpy.ops.object.camera_add(location=(0,-5,3))
cam = bpy.context.object
cam.rotation_euler = (1.1, 0, 0)
bpy.context.scene.camera = cam
bpy.ops.object.light_add(type='AREA', location=(2,-2,4))
bpy.context.scene.render.filepath = "{output_path}"
bpy.context.scene.render.resolution_x = 832
bpy.context.scene.render.resolution_y = 480
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
"""
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        f.write(script)
        script_path = f.name

    try:
        subprocess.run(
            ["blender", "--background", "--python", script_path],
            capture_output=True, timeout=120, check=True,
        )
    finally:
        Path(script_path).unlink(missing_ok=True)

    return {"engine": "blender-bpy"}


def _3d_harness(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """Blender harness render."""
    from cli_anything_bridge import BlenderSession
    with BlenderSession() as sess:
        sess.scene_new(engine="CYCLES", samples=64)
        sess.object_add("sphere", location=(0, 0, 1))
        sess.object_add("camera", location=(0, -5, 3))
        sess.object_add("light", light_type="AREA", location=(2, -2, 4))
        sess.render_execute(str(output_path), width=832, height=480)
    return {"engine": "blender-harness"}


# ---------------------------------------------------------------------------
# Stage 6: Timeline (full episode)
# ---------------------------------------------------------------------------

def _timeline_legacy(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """FFmpeg concat demuxer."""
    clips_dir = input_path if input_path.is_dir() else input_path.parent
    clips = sorted(clips_dir.glob("*.mp4"))
    if not clips:
        return {"error": "No clips found", "engine": "ffmpeg-concat"}

    import tempfile
    concat_file = Path(tempfile.mktemp(suffix=".txt"))
    try:
        concat_file.write_text(
            "\n".join(f"file '{c}'" for c in clips), encoding="utf-8"
        )
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
             "-i", str(concat_file), "-c", "copy", str(output_path)],
            capture_output=True, timeout=120, check=True,
        )
    finally:
        concat_file.unlink(missing_ok=True)

    blacks = measure_blackdetect(output_path)
    return {"black_frames": len(blacks), "engine": "ffmpeg-concat"}


def _timeline_harness(input_path: Path, output_path: Path, **kw) -> dict[str, Any]:
    """KDEnlive harness timeline assembly."""
    clips_dir = input_path if input_path.is_dir() else input_path.parent
    clips = sorted(clips_dir.glob("*.mp4"))
    if not clips:
        return {"error": "No clips found", "engine": "kdenlive"}

    from kdenlive_assembly import assemble_with_kdenlive
    assemble_with_kdenlive(
        clips=clips, output_path=output_path,
        transition_type="dissolve", transition_duration=0.5,
    )

    blacks = measure_blackdetect(output_path)
    return {"black_frames": len(blacks), "engine": "kdenlive"}


# ---------------------------------------------------------------------------
# Runner registration
# ---------------------------------------------------------------------------

def create_runner() -> ABTestRunner:
    """Create and configure the A/B test runner with all 6 stages."""
    runner = ABTestRunner()

    runner.register_stage(
        "audio_postprocess", _audio_legacy, _audio_harness,
        metrics=["time_sec", "file_size_kb", "lufs_integrated"],
        description="FFmpeg loudnorm vs Audacity harness",
    )
    runner.register_stage(
        "video_assembly", _video_legacy, _video_harness,
        metrics=["time_sec", "file_size_kb", "black_frames"],
        description="FFmpeg xfade vs Shotcut/melt harness",
    )
    runner.register_stage(
        "thumbnail", _thumbnail_legacy, _thumbnail_harness,
        metrics=["time_sec", "file_size_kb"],
        description="FFmpeg+Pillow vs GIMP harness thumbnail",
    )
    runner.register_stage(
        "explainer", _explainer_legacy, _explainer_harness,
        metrics=["time_sec", "file_size_kb"],
        description="Pillow vs Inkscape harness explainer graphics",
    )
    runner.register_stage(
        "3d_scene", _3d_legacy, _3d_harness,
        metrics=["time_sec", "file_size_kb"],
        description="Raw bpy script vs Blender harness 3D render",
    )
    runner.register_stage(
        "timeline", _timeline_legacy, _timeline_harness,
        metrics=["time_sec", "file_size_kb", "black_frames"],
        description="FFmpeg concat vs KDEnlive harness timeline",
    )

    return runner


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="A/B test: legacy vs CLI-Anything harness")
    parser.add_argument("--stage", default=None, help="Run single stage (or --all)")
    parser.add_argument("--all", action="store_true", help="Run all stages")
    parser.add_argument("--input", type=Path, default=None, help="Input file/directory for single stage")
    parser.add_argument("--input-dir", type=Path, default=None, help="Base input directory for --all")
    parser.add_argument("--output-dir", type=Path, required=True, help="Output directory for results")
    parser.add_argument("--title", default="Test", help="Title for thumbnail tests")
    args = parser.parse_args()

    runner = create_runner()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    if args.stage and args.input:
        cases = [{
            "name": args.input.stem,
            "input_path": str(args.input),
            "output_dir": str(args.output_dir / args.stage),
            "extra": {"title": args.title},
        }]
        results = runner.run_stage(args.stage, cases)
    elif args.all and args.input_dir:
        # Auto-discover test cases per stage
        cases_by_stage: dict[str, list] = {}

        # Audio: look for WAV files
        wavs = list(args.input_dir.glob("**/*.wav"))
        if wavs:
            cases_by_stage["audio_postprocess"] = [{
                "name": w.stem, "input_path": str(w),
                "output_dir": str(args.output_dir / "audio_postprocess"),
            } for w in wavs[:3]]

        # Video/timeline: look for directories with MP4s
        mp4_dirs = set()
        for mp4 in args.input_dir.glob("**/*.mp4"):
            mp4_dirs.add(mp4.parent)
        for d in sorted(mp4_dirs)[:2]:
            for stage in ("video_assembly", "timeline"):
                cases_by_stage.setdefault(stage, []).append({
                    "name": d.name, "input_path": str(d),
                    "output_dir": str(args.output_dir / stage),
                })

        # Thumbnail: use first video
        videos = list(args.input_dir.glob("**/*.mp4"))
        if videos:
            cases_by_stage["thumbnail"] = [{
                "name": videos[0].stem, "input_path": str(videos[0]),
                "output_dir": str(args.output_dir / "thumbnail"),
                "extra": {"title": args.title},
            }]

        # Explainer + 3d: use a dummy input
        for stage in ("explainer", "3d_scene"):
            cases_by_stage[stage] = [{
                "name": "default", "input_path": str(args.input_dir),
                "output_dir": str(args.output_dir / stage),
            }]

        results = runner.run_all(cases_by_stage)
    else:
        parser.print_help()
        return 1

    report = runner.generate_report(results)

    # Save JSON report
    json_path = args.output_dir / "ab_test_report.json"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] JSON report: {json_path}")

    # Save HTML report
    html_path = args.output_dir / "ab_test_report.html"
    generate_html_report(report, html_path)
    print(f"[OK] HTML report: {html_path}")

    # Print summary
    s = report["summary"]
    print(f"\n=== A/B Test Summary ===")
    print(f"Total: {s['total_tests']} | Harness: {s['harness_wins']} | Legacy: {s['legacy_wins']} | Ties: {s['ties']}")
    print(f"Recommendation: {s['recommendation']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
