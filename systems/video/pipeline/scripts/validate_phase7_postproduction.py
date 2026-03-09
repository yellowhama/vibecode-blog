#!/usr/bin/env python3
"""Smoke validation for Phase 7 postproduction modules.

Runs three synthetic validations:
1. 3-clip xfade assembly
2. VO+BGM ducking mix
3. Color normalization

Outputs a JSON report and exits non-zero on failure.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


from audio_postprocess import mix_with_ducking
from color_normalize import normalize_clips_color
from video_assembler import assemble_with_transitions


def _run(cmd: List[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )


def _run_out(cmd: List[str]) -> str:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )
    return proc.stdout.strip()


def _probe_duration(path: Path) -> float:
    out = _run_out(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ]
    )
    return float(out)


def _extract_frame(video_path: Path, ts_sec: float, output_path: Path) -> Path:
    _run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            f"{ts_sec:.3f}",
            "-i",
            str(video_path),
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(output_path),
        ]
    )
    return output_path


def _mean_rgb(image_path: Path) -> List[float]:
    from PIL import Image  # type: ignore
    import numpy as np  # type: ignore

    img = np.array(Image.open(image_path).convert("RGB"), dtype=np.float32)
    mean = img.mean(axis=(0, 1))
    return [round(float(v), 3) for v in mean]


def _rgb_distance(a: List[float], b: List[float]) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def _segment_mean_volume_db(audio_path: Path, start_sec: float, duration_sec: float) -> float:
    proc = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-ss",
            f"{start_sec:.3f}",
            "-t",
            f"{duration_sec:.3f}",
            "-i",
            str(audio_path),
            "-af",
            "volumedetect",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr)
    match = re.search(r"mean_volume:\s*([-\d.]+)\s*dB", proc.stderr)
    if not match:
        raise RuntimeError(f"Could not parse mean_volume from ffmpeg output: {proc.stderr}")
    return float(match.group(1))


def _make_color_clip(output_path: Path, color: str, label: str, duration_sec: float = 3.0) -> Path:
    vf = (
        f"drawtext=text='{label}':fontsize=56:fontcolor=white:"
        "x=(w-text_w)/2:y=(h-text_h)/2:borderw=3:bordercolor=black"
    )
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"color=c={color}:s=640x360:d={duration_sec:.3f}",
            "-vf",
            vf,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            str(output_path),
        ]
    )
    return output_path


def _make_testsrc_clip(output_path: Path, tint_filter: str | None = None, duration_sec: float = 3.0) -> Path:
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "lavfi",
        "-i",
        f"testsrc2=size=640x360:rate=24:duration={duration_sec:.3f}",
    ]
    if tint_filter:
        cmd.extend(["-vf", tint_filter])
    cmd.extend(
        [
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            str(output_path),
        ]
    )
    _run(cmd)
    return output_path


def _make_voiceover_bursts(output_path: Path, duration_sec: float = 7.0) -> Path:
    expr = "if(between(t,1,3)+between(t,4,6),0.85*sin(2*PI*880*t),0)"
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"aevalsrc=exprs='{expr}':s=24000:d={duration_sec:.3f}",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ]
    )
    return output_path


def _make_bgm_tone(output_path: Path, duration_sec: float = 7.0) -> Path:
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"sine=frequency=220:sample_rate=24000:duration={duration_sec:.3f}",
            "-af",
            "volume=0.6",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ]
    )
    return output_path


def _render_ducked_bgm(
    vo_path: Path,
    bgm_path: Path,
    output_path: Path,
    duration_sec: float,
    duck_threshold: float,
    duck_ratio: float,
) -> Path:
    _run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(vo_path),
            "-stream_loop",
            "-1",
            "-i",
            str(bgm_path),
            "-filter_complex",
            (
                f"[0:a]apad,atrim=duration={duration_sec:.3f},"
                "aformat=sample_fmts=fltp:channel_layouts=stereo[vo];"
                f"[1:a]atrim=duration={duration_sec:.3f},"
                "aformat=sample_fmts=fltp:channel_layouts=stereo[bgm];"
                f"[bgm][vo]sidechaincompress="
                f"threshold={duck_threshold}:ratio={duck_ratio}:"
                "attack=200:release=1000[ducked]"
            ),
            "-map",
            "[ducked]",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ]
    )
    return output_path


def validate_xfade(work_dir: Path) -> Dict[str, Any]:
    xfade_dir = work_dir / "xfade"
    xfade_dir.mkdir(parents=True, exist_ok=True)

    clip1 = _make_color_clip(xfade_dir / "clip1_red.mp4", "red", "Clip 1")
    clip2 = _make_color_clip(xfade_dir / "clip2_green.mp4", "green", "Clip 2")
    clip3 = _make_color_clip(xfade_dir / "clip3_blue.mp4", "blue", "Clip 3")
    output_path = xfade_dir / "xfade_output.mp4"

    assemble_with_transitions(
        [clip1, clip2, clip3],
        transition="fade",
        transition_duration=1.0,
        output_path=output_path,
    )

    duration = _probe_duration(output_path)
    expected_duration = 3.0 + 3.0 + 3.0 - 2.0
    frame_path = _extract_frame(output_path, 2.5, xfade_dir / "transition_mid.jpg")
    mean_rgb = _mean_rgb(frame_path)
    blended = mean_rgb[0] > 40.0 and mean_rgb[1] > 40.0
    duration_ok = abs(duration - expected_duration) <= 0.35

    return {
        "name": "xfade_3clip_smoke",
        "pass": duration_ok and blended,
        "artifacts": {
            "output_video": str(output_path),
            "transition_frame": str(frame_path),
        },
        "metrics": {
            "duration_sec": round(duration, 3),
            "expected_duration_sec": expected_duration,
            "transition_frame_mean_rgb": mean_rgb,
        },
    }


def validate_ducking(work_dir: Path) -> Dict[str, Any]:
    duck_dir = work_dir / "ducking"
    duck_dir.mkdir(parents=True, exist_ok=True)

    vo_path = _make_voiceover_bursts(duck_dir / "voiceover.wav")
    bgm_path = _make_bgm_tone(duck_dir / "bgm.wav")
    ducked_bgm = _render_ducked_bgm(
        vo_path,
        bgm_path,
        duck_dir / "ducked_bgm.wav",
        duration_sec=7.0,
        duck_threshold=0.02,
        duck_ratio=6.0,
    )
    mixed_output = mix_with_ducking(
        vo_path=vo_path,
        bgm_path=bgm_path,
        output_path=duck_dir / "mixed.wav",
        duration=7.0,
        vo_volume=1.0,
        bgm_volume=0.3,
        duck_threshold=0.02,
        duck_ratio=6.0,
    )

    idle_mean_db = _segment_mean_volume_db(ducked_bgm, start_sec=0.1, duration_sec=0.8)
    active_mean_db = _segment_mean_volume_db(ducked_bgm, start_sec=1.2, duration_sec=0.8)
    duration = _probe_duration(mixed_output)
    ducking_delta_db = round(idle_mean_db - active_mean_db, 3)

    return {
        "name": "ducking_smoke",
        "pass": ducking_delta_db >= 2.0 and abs(duration - 7.0) <= 0.1,
        "artifacts": {
            "voiceover": str(vo_path),
            "bgm": str(bgm_path),
            "ducked_bgm": str(ducked_bgm),
            "mixed_output": str(mixed_output),
        },
        "metrics": {
            "idle_mean_db": idle_mean_db,
            "active_mean_db": active_mean_db,
            "ducking_delta_db": ducking_delta_db,
            "mixed_duration_sec": round(duration, 3),
        },
    }


def validate_color_normalize(work_dir: Path) -> Dict[str, Any]:
    color_dir = work_dir / "color"
    color_dir.mkdir(parents=True, exist_ok=True)

    reference = _make_testsrc_clip(color_dir / "reference.mp4")
    warm = _make_testsrc_clip(
        color_dir / "warm.mp4",
        "colorchannelmixer=rr=1.5:gg=0.9:bb=0.6",
    )
    cool = _make_testsrc_clip(
        color_dir / "cool.mp4",
        "colorchannelmixer=rr=0.6:gg=0.9:bb=1.5",
    )

    normalized = normalize_clips_color([reference, warm, cool], method="mkl")
    ref_frame = _extract_frame(reference, 1.5, color_dir / "reference_mid.jpg")
    warm_pre = _extract_frame(warm, 1.5, color_dir / "warm_pre.jpg")
    cool_pre = _extract_frame(cool, 1.5, color_dir / "cool_pre.jpg")
    warm_post = _extract_frame(normalized[1], 1.5, color_dir / "warm_post.jpg")
    cool_post = _extract_frame(normalized[2], 1.5, color_dir / "cool_post.jpg")

    ref_rgb = _mean_rgb(ref_frame)
    warm_pre_dist = _rgb_distance(ref_rgb, _mean_rgb(warm_pre))
    cool_pre_dist = _rgb_distance(ref_rgb, _mean_rgb(cool_pre))
    warm_post_dist = _rgb_distance(ref_rgb, _mean_rgb(warm_post))
    cool_post_dist = _rgb_distance(ref_rgb, _mean_rgb(cool_post))

    return {
        "name": "color_normalize_smoke",
        "pass": warm_post_dist < warm_pre_dist and cool_post_dist < cool_pre_dist,
        "artifacts": {
            "reference": str(reference),
            "warm_normalized": str(normalized[1]),
            "cool_normalized": str(normalized[2]),
        },
        "metrics": {
            "warm_distance_pre": round(warm_pre_dist, 3),
            "warm_distance_post": round(warm_post_dist, 3),
            "cool_distance_pre": round(cool_pre_dist, 3),
            "cool_distance_post": round(cool_post_dist, 3),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke validation for Phase 7 postproduction modules")
    parser.add_argument(
        "--out-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "output" / "logs",
    )
    parser.add_argument("--keep-artifacts", action="store_true")
    args = parser.parse_args()

    run_id = f"phase7_validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    work_dir = args.out_root / run_id
    work_dir.mkdir(parents=True, exist_ok=True)

    results = [
        validate_xfade(work_dir),
        validate_ducking(work_dir),
        validate_color_normalize(work_dir),
    ]

    report = {
        "run_id": run_id,
        "generated_at": datetime.now().isoformat(),
        "pass": all(item["pass"] for item in results),
        "results": results,
    }

    report_path = work_dir / "phase7_validation_report.json"
    with report_path.open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"[OK] validation report: {report_path}")

    if report["pass"] and not args.keep_artifacts:
        # Keep the report, remove bulky media artifacts.
        for subdir in ("xfade", "ducking", "color"):
            shutil.rmtree(work_dir / subdir, ignore_errors=True)

    return 0 if report["pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
