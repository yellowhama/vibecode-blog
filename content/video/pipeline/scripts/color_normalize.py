#!/usr/bin/env python3
"""Color normalization across video clips using color-matcher.

Dependencies: pip install color-matcher (MIT license)

Process:
  1. Extract reference frame (from first clip or specified image)
  2. Extract representative frame from each clip
  3. Compute color transfer → generate 3D LUT (.cube)
  4. Apply LUT to each clip via FFmpeg lut3d filter

Applied BEFORE xfade assembly (Phase D runs before Phase A).
"""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path
from typing import List


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


def _extract_mid_frame(video_path: Path, output_path: Path) -> Path:
    """Extract the middle frame of a video as a PNG."""
    duration = _probe_duration(video_path)
    mid = max(0.0, duration / 2.0)
    _run([
        "ffmpeg", "-y",
        "-ss", f"{mid:.3f}",
        "-i", str(video_path),
        "-frames:v", "1",
        "-q:v", "2",
        str(output_path),
    ])
    return output_path


def _compute_lut(
    reference_frame: Path,
    source_frame: Path,
    lut_path: Path,
    method: str = "mkl",
    lut_size: int = 33,
) -> Path:
    """Compute a 3D LUT that transfers color from source to reference appearance.

    Uses color_matcher library for the transfer computation,
    then writes a .cube LUT file for FFmpeg lut3d.
    """
    import numpy as np  # type: ignore
    from color_matcher import ColorMatcher  # type: ignore
    from color_matcher.io_handler import load_img_file  # type: ignore

    ref_img = load_img_file(str(reference_frame))
    src_img = load_img_file(str(source_frame))

    cm = ColorMatcher()
    # Build identity 3D LUT, then warp it by the color transfer
    # This approach: sample the transfer function at LUT grid points
    size = lut_size
    lut_path.parent.mkdir(parents=True, exist_ok=True)

    # Create identity lattice in .cube write order: R fastest, then G, then B.
    grid_flat = []
    for bi in range(size):
        for gi in range(size):
            for ri in range(size):
                grid_flat.append(
                    [
                        ri / (size - 1),
                        gi / (size - 1),
                        bi / (size - 1),
                    ]
                )
    grid_flat = np.array(grid_flat, dtype=np.float64)

    # Create a small synthetic image from grid colors for transfer
    side = int(np.ceil(np.sqrt(len(grid_flat))))
    synth = np.zeros((side, side, 3), dtype=np.float64)
    synth_flat = synth.reshape(-1, 3)
    synth_flat[:len(grid_flat)] = grid_flat
    synth = synth_flat.reshape(side, side, 3)

    # Apply the same transfer
    matched_synth = cm.transfer(src=synth, ref=ref_img, method=method)
    matched_flat = np.clip(matched_synth.reshape(-1, 3).astype(np.float64), 0.0, 1.0)

    # Write .cube file
    with open(lut_path, "w") as f:
        f.write(f"TITLE \"color_normalize_{method}\"\n")
        f.write(f"LUT_3D_SIZE {size}\n")
        f.write(f"DOMAIN_MIN 0.0 0.0 0.0\n")
        f.write(f"DOMAIN_MAX 1.0 1.0 1.0\n\n")

        for idx, (rv, gv, bv) in enumerate(matched_flat):
            if idx >= size ** 3:
                break
            f.write(f"{rv:.6f} {gv:.6f} {bv:.6f}\n")

    return lut_path


def _apply_lut(video_path: Path, lut_path: Path, output_path: Path) -> Path:
    """Apply a 3D LUT to a video clip via FFmpeg lut3d filter."""
    # Escape the LUT path for FFmpeg filter syntax
    lut_escaped = str(lut_path).replace("\\", "/").replace(":", "\\:")

    _run([
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-vf", f"lut3d='{lut_escaped}'",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-movflags", "+faststart",
        str(output_path),
    ])
    return output_path


def normalize_clips_color(
    clip_paths: List[Path],
    reference_frame: Path | None = None,
    method: str = "mkl",
) -> List[Path]:
    """Normalize color across all clips to match a reference.

    Args:
        clip_paths: List of video clip paths to normalize.
        reference_frame: Reference image (PNG/JPG). If None, extracts
            the middle frame of the first clip as reference.
        method: Color matching method ("mkl", "reinhard", "pdf").

    Returns:
        List of paths to color-normalized clips.
        The first clip is returned as-is if it's the reference source.
    """
    if not clip_paths:
        return []

    if len(clip_paths) == 1:
        return list(clip_paths)

    with tempfile.TemporaryDirectory(prefix="color_norm_") as td:
        td_path = Path(td)

        # Get or extract reference frame
        if reference_frame is None:
            reference_frame = td_path / "reference.png"
            _extract_mid_frame(clip_paths[0], reference_frame)

        if not reference_frame.exists():
            raise FileNotFoundError(f"Reference frame not found: {reference_frame}")

        normalized: List[Path] = []

        for i, clip in enumerate(clip_paths):
            # First clip is the reference source — skip LUT application
            if i == 0 and reference_frame == td_path / "reference.png":
                normalized.append(clip)
                continue

            # Extract representative frame from this clip
            src_frame = td_path / f"src_frame_{i:03d}.png"
            _extract_mid_frame(clip, src_frame)

            # Compute LUT
            lut_path = td_path / f"lut_{i:03d}.cube"
            _compute_lut(reference_frame, src_frame, lut_path, method=method)

            # Apply LUT to clip
            out_path = clip.parent / f"_color_{clip.name}"
            _apply_lut(clip, lut_path, out_path)
            normalized.append(out_path)

        return normalized
