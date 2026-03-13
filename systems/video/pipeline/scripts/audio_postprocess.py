#!/usr/bin/env python3
"""Audio post-processing and quality analysis helpers."""

from __future__ import annotations

import json
import math
import re
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict, List

from tts_backends.base import TTSError, ffprobe_duration_sec, run


def _run_capture(cmd: list[str]) -> tuple[str, str]:
    import subprocess

    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise TTSError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )
    return proc.stdout, proc.stderr


def concat_segments_wav(inputs: List[Path], out_wav: Path, crossfade_sec: float = 0.0) -> None:
    if not inputs:
        raise TTSError("concat_segments_wav called with empty input list")
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    if len(inputs) == 1:
        shutil.copy2(inputs[0], out_wav)
        return

    if crossfade_sec <= 0:
        with tempfile.TemporaryDirectory(prefix="concat_wav_") as td:
            txt = Path(td) / "concat.txt"
            txt.write_text("".join(f"file '{p.as_posix()}'\n" for p in inputs), encoding="utf-8")
            run(
                [
                    "ffmpeg",
                    "-y",
                    "-f",
                    "concat",
                    "-safe",
                    "0",
                    "-i",
                    str(txt),
                    "-c:a",
                    "pcm_s16le",
                    str(out_wav),
                ]
            )
        return

    # Single ffmpeg call using complex filter graph for all crossfades
    cmd = ["ffmpeg", "-y"]
    for p in inputs:
        cmd.extend(["-i", str(p)])

    n = len(inputs)
    filter_parts = []
    prev_label = "[0:a]"
    for i in range(1, n):
        out_label = f"[a{i:03d}]" if i < n - 1 else "[aout]"
        filter_parts.append(
            f"{prev_label}[{i}:a]acrossfade=d={crossfade_sec}:c1=tri:c2=tri{out_label}"
        )
        prev_label = out_label

    filter_graph = ";".join(filter_parts)
    cmd.extend(["-filter_complex", filter_graph, "-map", "[aout]", "-c:a", "pcm_s16le", str(out_wav)])
    run(cmd)


def apply_silence_trim(in_wav: Path, out_wav: Path, silence_db: float = -45.0, min_silence_sec: float = 0.2) -> None:
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(in_wav),
            "-af",
            (
                "silenceremove="
                f"start_periods=1:start_duration={min_silence_sec:.3f}:start_threshold={silence_db:.1f}dB:"
                f"stop_periods=1:stop_duration={min_silence_sec:.3f}:stop_threshold={silence_db:.1f}dB"
            ),
            "-c:a",
            "pcm_s16le",
            str(out_wav),
        ]
    )


def _extract_loudnorm_json(stderr: str) -> Dict[str, Any] | None:
    blocks = re.findall(r"\{[\s\S]*?\}", stderr)
    for raw in reversed(blocks):
        try:
            data = json.loads(raw)
        except Exception:  # noqa: BLE001
            continue
        if "input_i" in data or "output_i" in data:
            return data
    return None


def loudnorm_measure(in_wav: Path, target_i: float, target_lra: float, target_tp: float) -> Dict[str, Any]:
    _, stderr = _run_capture(
        [
            "ffmpeg",
            "-hide_banner",
            "-y",
            "-i",
            str(in_wav),
            "-af",
            f"loudnorm=I={target_i}:LRA={target_lra}:TP={target_tp}:print_format=json",
            "-f",
            "null",
            "-",
        ]
    )
    data = _extract_loudnorm_json(stderr)
    if not data:
        raise TTSError("failed to parse loudnorm measurement")
    return data


def apply_loudnorm_two_pass(in_wav: Path, out_wav: Path, target_i: float, target_lra: float, target_tp: float) -> Dict[str, Any]:
    m = loudnorm_measure(in_wav, target_i=target_i, target_lra=target_lra, target_tp=target_tp)
    def _finite_number(value: Any) -> bool:
        try:
            f = float(value)
            return math.isfinite(f)
        except Exception:  # noqa: BLE001
            return False

    required = [
        m.get("input_i"),
        m.get("input_lra"),
        m.get("input_tp"),
        m.get("input_thresh"),
        m.get("target_offset"),
    ]
    if not all(_finite_number(v) for v in required):
        # Fallback for near-silent clips where first pass returns inf/-inf.
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(in_wav),
                "-af",
                f"loudnorm=I={target_i}:LRA={target_lra}:TP={target_tp}",
                "-c:a",
                "pcm_s16le",
                str(out_wav),
            ]
        )
        return {**m, "second_pass_mode": "single_pass_fallback"}

    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(in_wav),
            "-af",
            (
                f"loudnorm=I={target_i}:LRA={target_lra}:TP={target_tp}:"
                f"measured_I={m.get('input_i')}:"
                f"measured_LRA={m.get('input_lra')}:"
                f"measured_TP={m.get('input_tp')}:"
                f"measured_thresh={m.get('input_thresh')}:"
                f"offset={m.get('target_offset')}:linear=true:print_format=summary"
            ),
            "-c:a",
            "pcm_s16le",
            str(out_wav),
        ]
    )
    return {**m, "second_pass_mode": "two_pass"}


def _volumedetect(in_wav: Path) -> Dict[str, Any]:
    _, stderr = _run_capture(
        [
            "ffmpeg",
            "-hide_banner",
            "-y",
            "-i",
            str(in_wav),
            "-af",
            "volumedetect",
            "-f",
            "null",
            "-",
        ]
    )
    mean_m = re.search(r"mean_volume:\s*([-\d.]+)\s*dB", stderr)
    max_m = re.search(r"max_volume:\s*([-\d.]+)\s*dB", stderr)
    return {
        "mean_volume_db": float(mean_m.group(1)) if mean_m else None,
        "max_volume_db": float(max_m.group(1)) if max_m else None,
    }


def mix_with_ducking(
    vo_path: Path,
    bgm_path: Path,
    output_path: Path,
    duration: float,
    vo_volume: float = 1.0,
    bgm_volume: float = 0.3,
    duck_threshold: float = 0.02,
    duck_ratio: float = 6.0,
    attack: float = 200.0,
    release: float = 1000.0,
) -> Path:
    """Mix voiceover + BGM with sidechain ducking.

    When the voiceover is active, BGM volume automatically ducks down.
    When voiceover is silent, BGM returns to normal level.

    Args:
        vo_path: Voiceover audio file.
        bgm_path: Background music audio file.
        output_path: Output mixed audio file.
        duration: Target duration in seconds (trims/pads to match video).
        vo_volume: Voiceover volume multiplier (default 1.0).
        bgm_volume: BGM base volume multiplier (default 0.3).
        duck_threshold: Sidechain compressor threshold (0.0-1.0, default 0.02).
        duck_ratio: Compression ratio when ducking (default 6.0).
        attack: Attack time in ms (default 200).
        release: Release time in ms (default 1000).

    Returns:
        Path to the mixed output audio.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    filter_complex = (
        f"[0:a]volume={vo_volume},apad,atrim=duration={duration:.3f},"
        "aformat=sample_fmts=fltp:channel_layouts=stereo,"
        "asplit=2[vo_sc][vo_mix];"
        f"[1:a]volume={bgm_volume},atrim=duration={duration:.3f},"
        "aformat=sample_fmts=fltp:channel_layouts=stereo[bgm];"
        f"[bgm][vo_sc]sidechaincompress="
        f"threshold={duck_threshold}:ratio={duck_ratio}:"
        f"attack={attack:.0f}:release={release:.0f}[ducked];"
        f"[vo_mix][ducked]amix=inputs=2:normalize=0[aout]"
    )

    run([
        "ffmpeg", "-y",
        "-i", str(vo_path),
        "-stream_loop", "-1",
        "-i", str(bgm_path),
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-c:a", "pcm_s16le",
        str(output_path),
    ])
    return output_path


def apply_audacity_effect_chain(in_wav: Path, out_wav: Path, effects: list[dict]) -> Dict[str, Any]:
    """Apply a chain of Audacity effects via CLI-Anything harness.

    Args:
        in_wav: Input WAV file.
        out_wav: Output WAV file.
        effects: List of effect dicts, e.g. [{"name": "compress", "params": {"threshold": -20, "ratio": 4}}]

    Returns:
        Dict with status and applied effects list.
    """
    try:
        from cli_anything_bridge import AVAILABLE_TOOLS, AudacitySession
    except ImportError:
        raise RuntimeError("cli_anything_bridge not found — ensure it is on PYTHONPATH")

    if "audacity" not in AVAILABLE_TOOLS:
        import logging
        logging.warning("Audacity harness not available — falling back to FFmpeg loudnorm")
        result = apply_loudnorm_two_pass(in_wav, out_wav, target_i=-16.0, target_lra=11.0, target_tp=-1.5)
        return {"fallback": "ffmpeg_loudnorm", **result}

    out_wav.parent.mkdir(parents=True, exist_ok=True)
    with AudacitySession() as sess:
        sess.project_new()
        sess.track_add("mono")
        sess.clip_add(str(in_wav))
        applied = []
        for fx in effects:
            name = fx["name"]
            params = fx.get("params", {})
            sess.effect_add(name, **params)
            applied.append(name)
        sess.export(str(out_wav))
    return {"status": "ok", "engine": "audacity", "effects_applied": applied}


def apply_podcast_master(in_wav: Path, out_wav: Path) -> Dict[str, Any]:
    """Apply podcast mastering chain: noise_reduction → high_pass(80) → compress → normalize → limit."""
    return apply_audacity_effect_chain(in_wav, out_wav, effects=[
        {"name": "noise_reduction", "params": {}},
        {"name": "high_pass", "params": {"frequency": 80}},
        {"name": "compress", "params": {"threshold": -18, "ratio": 3}},
        {"name": "normalize", "params": {"level": -1}},
        {"name": "limit", "params": {"threshold": -1}},
    ])


def apply_youtube_voice_master(in_wav: Path, out_wav: Path) -> Dict[str, Any]:
    """Apply YouTube voice mastering chain: noise_reduction → high/low pass → compress → normalize."""
    return apply_audacity_effect_chain(in_wav, out_wav, effects=[
        {"name": "noise_reduction", "params": {}},
        {"name": "high_pass", "params": {"frequency": 100}},
        {"name": "low_pass", "params": {"frequency": 12000}},
        {"name": "compress", "params": {"threshold": -20, "ratio": 4}},
        {"name": "normalize", "params": {"level": -1}},
    ])


def build_quality_report(in_wav: Path, target_i: float = -16.0, target_lra: float = 11.0, target_tp: float = -1.5) -> Dict[str, Any]:
    duration = ffprobe_duration_sec(in_wav)
    loud = loudnorm_measure(in_wav, target_i=target_i, target_lra=target_lra, target_tp=target_tp)
    vol = _volumedetect(in_wav)
    return {
        "audio_path": str(in_wav),
        "duration_sec": round(duration, 4),
        "target": {
            "integrated_lufs": target_i,
            "lra": target_lra,
            "true_peak_dbtp": target_tp,
        },
        "loudnorm_measurement": loud,
        "volumedetect": vol,
    }
