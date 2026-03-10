#!/usr/bin/env python3
"""Assemble video clips with xfade transitions, intro/outro text overlays.

Replaces simple concat-demuxer assembly with broadcast-quality transitions.
All processing uses FFmpeg filters — no additional binary dependencies.
"""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path
from typing import List


# All 44 xfade transitions supported by FFmpeg (as of 6.x)
XFADE_TRANSITIONS = {
    "fade", "wipeleft", "wiperight", "wipeup", "wipedown",
    "slideleft", "slideright", "slideup", "slidedown",
    "circlecrop", "rectcrop", "distance", "fadeblack", "fadewhite",
    "radial", "smoothleft", "smoothright", "smoothup", "smoothdown",
    "circleopen", "circleclose", "vertopen", "vertclose", "horzopen",
    "horzclose", "dissolve", "pixelize", "diagtl", "diagtr",
    "diagbl", "diagbr", "hlslice", "hrslice", "vuslice", "vdslice",
    "hblur", "fadegrays", "wipetl", "wipetr", "wipebl", "wipebr",
    "squeezeh", "squeezev", "zoomin",
}


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
    out = _run_out([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ])
    try:
        return max(0.0, float(out))
    except ValueError:
        return 0.0


def _probe_resolution(path: Path) -> tuple[int, int]:
    """Return (width, height) of the first video stream."""
    out = _run_out([
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=s=x:p=0",
        str(path),
    ])
    parts = out.split("x")
    if len(parts) == 2:
        return int(parts[0]), int(parts[1])
    raise RuntimeError(f"Cannot detect resolution of {path}: got '{out}'")


def normalize_clips(
    clips: List[Path],
    target_w: int = 1920,
    target_h: int = 1080,
) -> List[Path]:
    """Scale + pad all clips to uniform resolution (letterbox if needed).

    Returns list of paths to normalized clips (in a temp directory alongside originals).
    Clips already at target resolution are returned as-is.
    """
    normalized: List[Path] = []
    for clip in clips:
        w, h = _probe_resolution(clip)
        if w == target_w and h == target_h:
            normalized.append(clip)
            continue

        out_path = clip.parent / f"_norm_{clip.name}"
        _run([
            "ffmpeg", "-y",
            "-i", str(clip),
            "-vf", (
                f"scale={target_w}:{target_h}:force_original_aspect_ratio=decrease,"
                f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=black,"
                "setsar=1"
            ),
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-an",
            str(out_path),
        ])
        normalized.append(out_path)
    return normalized


def _build_xfade_filter(
    durations: List[float],
    transition: str = "fade",
    transition_duration: float = 1.0,
) -> str:
    """Build FFmpeg complex filter graph for N-clip xfade chain.

    Each pair of adjacent clips is joined by an xfade filter.
    Offsets are computed from cumulative durations minus transition overlap.
    """
    n = len(durations)
    if n < 2:
        return ""

    parts: List[str] = []
    # Running offset: time at which each xfade starts
    cumulative = 0.0
    prev_label = "[0:v]"

    for i in range(1, n):
        # Offset = cumulative duration of all clips up to current - total overlap so far
        offset = cumulative + durations[i - 1] - transition_duration
        if offset < 0:
            offset = cumulative + durations[i - 1] - 0.1  # fallback for very short clips

        out_label = f"[v{i}]" if i < n - 1 else "[vout]"
        parts.append(
            f"{prev_label}[{i}:v]xfade=transition={transition}"
            f":duration={transition_duration:.3f}:offset={offset:.3f}{out_label}"
        )
        prev_label = out_label
        cumulative = offset  # next offset is relative to the xfade output timeline

    return ";".join(parts)


def _build_drawtext_filter(
    text: str,
    duration: float,
    fade_duration: float = 1.0,
    position: str = "center",
    fontsize: int = 48,
    fontcolor: str = "white",
) -> str:
    """Build drawtext filter with fade-in and fade-out."""
    visible_end = duration
    fade_out_start = max(0, visible_end - fade_duration)

    # Escape special chars for drawtext
    escaped = text.replace("'", "\\'").replace(":", "\\:")

    if position == "center":
        x_expr = "(w-text_w)/2"
        y_expr = "(h-text_h)/2"
    else:  # bottom
        x_expr = "(w-text_w)/2"
        y_expr = "h-text_h-40"

    return (
        f"drawtext=text='{escaped}'"
        f":fontsize={fontsize}:fontcolor={fontcolor}"
        f":x={x_expr}:y={y_expr}"
        f":borderw=3:bordercolor=black"
        f":alpha='if(lt(t,{fade_duration}),t/{fade_duration},"
        f"if(gt(t,{fade_out_start}),(1-(t-{fade_out_start})/{fade_duration}),1))'"
    )


def assemble_narrative_audio(
    manifest: Dict[str, Any],
    vo_path: Path,
    output_path: Path,
    vo_volume: float = 1.0,
    bgm_volume: float = 0.18,
    duck_threshold: float = 0.02,
    duck_ratio: float = 6.0,
) -> Path:
    """Advanced audio assembler: BGM act-switching + SFX keywords + Sidechain Ducking."""
    from audio_catalog import load_catalog, select_bgm_by_stage, select_sfx_by_keywords
    
    catalog = load_catalog()
    shots = manifest.get("shots", [])
    if not shots:
        raise ValueError("No shots in manifest for audio assembly")

    # Build inputs and filter complex
    inputs = ["-i", str(vo_path)]
    filter_parts = [f"[0:a]volume={vo_volume}[vo]"]
    
    # 1. Prepare BGM (Act-based switching)
    # For v2.1, we concatenate BGM clips matching act durations
    bgm_inputs = []
    bgm_filter = ""
    cursor = 0.0
    
    # Group shots by narrative stage to determine BGM segments
    stages = []
    if shots:
        current_stage = shots[0].get("narrative_stage", "GENERAL")
        current_dur = 0.0
        for s in shots:
            if s.get("narrative_stage") == current_stage:
                current_dur += s.get("duration_sec", 5.0)
            else:
                stages.append((current_stage, current_dur))
                current_stage = s.get("narrative_stage", "GENERAL")
                current_dur = s.get("duration_sec", 5.0)
        stages.append((current_stage, current_dur))

    # Add BGM inputs and create a concatenated BGM track
    for idx, (stage, dur) in enumerate(stages):
        bgm_entry = select_bgm_by_stage(catalog, stage)
        if bgm_entry:
            inputs.extend(["-stream_loop", "-1", "-i", bgm_entry["path"]])
            # Trim looped BGM to segment duration and apply volume
            inputs_idx = len(inputs) // 2 - 1
            filter_parts.append(f"[{inputs_idx}:a]atrim=duration={dur:.3f},volume={bgm_volume}[bgm{idx}]")
            bgm_inputs.append(f"[bgm{idx}]")
    
    if bgm_inputs:
        filter_parts.append(f"{''.join(bgm_inputs)}concat=n={len(bgm_inputs)}:v=0:a=1[bgm_full]")
    else:
        # Fallback to silence if no BGM
        filter_parts.append("anullsrc=r=44100:cl=stereo[bgm_full]")

    # 2. SFX Keyword Injection
    sfx_inputs = []
    cursor = 0.0
    for shot in shots:
        visual = shot.get("prompt_positive", "")
        narration = shot.get("narration", "")
        dur = float(shot.get("duration_sec", 5.0))
        
        selected_sfx = select_sfx_by_keywords(catalog, visual, narration)
        for s in selected_sfx:
            sfx_idx = len(inputs) // 2
            inputs.extend(["-i", s["path"]])
            # Delay SFX to its shot start time
            filter_parts.append(f"[{sfx_idx}:a]adelay={int(cursor*1000)}|{int(cursor*1000)}[sfx{len(sfx_inputs)}]")
            sfx_inputs.append(f"[sfx{len(sfx_inputs)}]")
        cursor += dur

    # 3. Mix SFX and then Sidechain Duck BGM
    if sfx_inputs:
        filter_parts.append(f"{''.join(sfx_inputs)}amix=inputs={len(sfx_inputs)}:normalize=0[sfx_all]")
        filter_parts.append("[vo][sfx_all]amix=inputs=2:normalize=0[vo_sfx]")
    else:
        filter_parts.append("[vo]anull[vo_sfx]")

    # Sidechain: [bgm_full] is ducked by [vo_sfx]
    filter_parts.append(
        f"[bgm_full][vo_sfx]sidechaingate=threshold={duck_threshold}:ratio={duck_ratio}:level_in=1[ducked_bgm]"
    )
    filter_parts.append("[vo_sfx][ducked_bgm]amix=inputs=2:normalize=0[outa]")

    cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", ";".join(filter_parts), "-map", "[outa]", str(output_path)]
    _run(cmd)
    return output_path


def assemble_with_transitions(
    clips: List[Path],
    transition: str = "fade",
    transition_duration: float = 1.0,
    intro_text: str | None = None,
    outro_text: str | None = None,
    output_path: Path | None = None,
    target_w: int = 1920,
    target_h: int = 1080,
) -> Path:
    """Assemble clips with xfade transitions and optional text overlays.

    Args:
        clips: Ordered list of video clip paths.
        transition: xfade transition name (default: "fade").
        transition_duration: Transition duration in seconds (default: 1.0).
        intro_text: Text overlay on the first clip (3s fade in/out).
        outro_text: Text overlay on the last clip (3s fade in/out).
        output_path: Output file path (auto-generated if None).
        target_w: Target width for resolution normalization.
        target_h: Target height for resolution normalization.

    Returns:
        Path to the assembled output video.
    """
    if not clips:
        raise ValueError("No clips provided for assembly")

    if transition not in XFADE_TRANSITIONS:
        raise ValueError(
            f"Unknown transition '{transition}'. "
            f"Supported: {sorted(XFADE_TRANSITIONS)}"
        )

    if output_path is None:
        output_path = clips[0].parent / "assembled_output.mp4"

    # Single clip: just copy (with optional text overlay)
    if len(clips) == 1:
        return _assemble_single_clip(
            clips[0], output_path, intro_text, outro_text, target_w, target_h
        )

    # Normalize resolutions
    normed = normalize_clips(clips, target_w, target_h)

    # Get durations
    durations = [_probe_duration(c) for c in normed]
    too_short = [str(path) for path, dur in zip(normed, durations) if dur <= transition_duration]
    if too_short:
        raise ValueError(
            "Transition duration must be shorter than every clip duration. "
            f"transition_duration={transition_duration}, short_clips={too_short}"
        )

    # Build xfade filter chain
    xfade_filter = _build_xfade_filter(durations, transition, transition_duration)

    # Build text overlay filters (applied after xfade)
    text_filters: List[str] = []

    if intro_text:
        text_filters.append(
            _build_drawtext_filter(
                intro_text, duration=3.0, fade_duration=1.0,
                position="center", fontsize=56,
            )
        )

    if outro_text:
        # Calculate total assembled duration
        total_dur = sum(durations) - transition_duration * (len(durations) - 1)
        outro_start = max(0, total_dur - 3.0)
        escaped = outro_text.replace("'", "\\'").replace(":", "\\:")
        text_filters.append(
            f"drawtext=text='{escaped}'"
            f":fontsize=40:fontcolor=white"
            f":x=(w-text_w)/2:y=(h-text_h)/2"
            f":borderw=2:bordercolor=black"
            f":enable='gte(t,{outro_start:.3f})'"
            f":alpha='if(lt(t-{outro_start:.3f},1.0),(t-{outro_start:.3f})/1.0,1)'"
        )

    # Combine filters
    if text_filters:
        full_filter = xfade_filter + ";[vout]" + ",".join(text_filters) + "[final]"
        map_label = "[final]"
    else:
        full_filter = xfade_filter
        map_label = "[vout]"

    # Build ffmpeg command
    cmd = ["ffmpeg", "-y"]
    for clip in normed:
        cmd.extend(["-i", str(clip)])

    cmd.extend([
        "-filter_complex", full_filter,
        "-map", map_label,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(output_path),
    ])

    _run(cmd)
    return output_path


def _assemble_single_clip(
    clip: Path,
    output_path: Path,
    intro_text: str | None,
    outro_text: str | None,
    target_w: int,
    target_h: int,
) -> Path:
    """Handle single-clip assembly with optional text overlays."""
    duration = _probe_duration(clip)
    vf_parts: List[str] = []

    # Normalize resolution
    w, h = _probe_resolution(clip)
    if w != target_w or h != target_h:
        vf_parts.append(
            f"scale={target_w}:{target_h}:force_original_aspect_ratio=decrease,"
            f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1"
        )

    if intro_text:
        vf_parts.append(
            _build_drawtext_filter(
                intro_text, duration=3.0, fade_duration=1.0,
                position="center", fontsize=56,
            )
        )

    if outro_text:
        outro_start = max(0, duration - 3.0)
        escaped = outro_text.replace("'", "\\'").replace(":", "\\:")
        vf_parts.append(
            f"drawtext=text='{escaped}'"
            f":fontsize=40:fontcolor=white"
            f":x=(w-text_w)/2:y=(h-text_h)/2"
            f":borderw=2:bordercolor=black"
            f":enable='gte(t,{outro_start:.3f})'"
        )

    if vf_parts:
        _run([
            "ffmpeg", "-y",
            "-i", str(clip),
            "-vf", ",".join(vf_parts),
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(output_path),
        ])
    else:
        _run([
            "ffmpeg", "-y",
            "-i", str(clip),
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(output_path),
        ])

    return output_path


def concat_hardcut(clips: List[Path], output_path: Path) -> Path:
    """Fallback: simple concat demuxer (no transitions). For --no-transitions."""
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False, encoding="utf-8"
    ) as f:
        f.write("".join(f"file '{p.as_posix()}'\n" for p in clips))
        concat_list = Path(f.name)

    try:
        _run([
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_list),
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(output_path),
        ])
    finally:
        concat_list.unlink(missing_ok=True)

    return output_path
