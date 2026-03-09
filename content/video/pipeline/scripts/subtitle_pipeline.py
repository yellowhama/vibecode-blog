#!/usr/bin/env python3
"""Subtitle pipeline: speech alignment, ASS generation, and FFmpeg burn-in.

Dependencies: pip install stable-ts pysubs2
Both are MIT-licensed.

3-stage pipeline:
  1. Align audio to text via stable-ts → word-level timestamps
  2. Generate styled ASS subtitle file via pysubs2
  3. Burn subtitles into video via FFmpeg ass filter
"""

from __future__ import annotations

import argparse
import subprocess
import tempfile
import re
from pathlib import Path
from typing import Any, Dict, List


DEFAULT_SUBTITLE_FONTS_DIR = Path("/mnt/e/vibecode-blog/content/video/assets/fonts")
FONT_EXTS = {".ttf", ".otf", ".ttc"}


def _run(cmd: List[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )


def _normalize_font_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def _font_installed(font_name: str) -> bool:
    proc = subprocess.run(
        ["fc-list", ":", "family"],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        return False
    haystack = proc.stdout.lower()
    return font_name.lower() in haystack


def _font_available_in_dir(font_name: str, fonts_dir: Path | None) -> bool:
    if fonts_dir is None or not fonts_dir.exists():
        return False
    target = _normalize_font_token(font_name)
    for path in fonts_dir.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in FONT_EXTS:
            continue
        if target in _normalize_font_token(path.stem):
            return True
    return False


def _font_available(font_name: str, fonts_dir: Path | None) -> bool:
    return _font_installed(font_name) or _font_available_in_dir(font_name, fonts_dir)


def _ensure_required_fonts(
    text_ko: str | None,
    text_en: str | None,
    font_ko: str,
    font_en: str,
    fonts_dir: Path | None,
) -> None:
    if text_ko and not _font_available(font_ko, fonts_dir):
        raise RuntimeError(
            f"Korean subtitle font not installed: '{font_ko}'. "
            "Install a Korean font (for example 'Noto Sans CJK KR'), "
            "run ensure_subtitle_fonts.py, or pass --subtitle-font-ko with an installed font."
        )
    if text_en and not _font_available(font_en, fonts_dir):
        raise RuntimeError(
            f"English subtitle font not installed: '{font_en}'. "
            "Install the font or pass --subtitle-font-en with an installed font."
        )


def align_text_to_audio(
    audio_path: Path,
    text: str,
    language: str = "ko",
) -> List[Dict[str, Any]]:
    """Align text to audio using stable-ts. Returns word-level segments.

    Each segment: {"start": float, "end": float, "text": str}
    """
    import stable_whisper  # type: ignore

    model = stable_whisper.load_model("base")
    result = model.align(str(audio_path), text, language=language)

    segments: List[Dict[str, Any]] = []
    for seg in result.segments:
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip(),
        })
    return segments


def generate_ass(
    segments: List[Dict[str, Any]],
    output_path: Path,
    font_name: str = "Noto Sans CJK KR",
    font_size: int = 28,
    style_name: str = "Default",
    margin_v: int = 50,
    alignment: int = 2,
) -> Path:
    """Generate ASS subtitle file from aligned segments.

    Args:
        segments: List of {"start", "end", "text"} dicts.
        output_path: Where to write the .ass file.
        font_name: Font family name.
        font_size: Font size in points.
        style_name: ASS style name.
        margin_v: Vertical margin (distance from bottom).
        alignment: ASS alignment (2 = bottom-center).

    Returns:
        Path to generated ASS file.
    """
    import pysubs2  # type: ignore

    subs = pysubs2.SSAFile()

    style = pysubs2.SSAStyle(
        fontname=font_name,
        fontsize=font_size,
        primarycolor=pysubs2.Color(255, 255, 255, 0),   # white, opaque
        outlinecolor=pysubs2.Color(0, 0, 0, 0),          # black outline
        backcolor=pysubs2.Color(0, 0, 0, 128),            # semi-transparent shadow
        outline=2.0,
        shadow=1.0,
        alignment=alignment,
        marginv=margin_v,
        bold=False,
    )
    subs.styles[style_name] = style

    for seg in segments:
        if not seg.get("text", "").strip():
            continue
        event = pysubs2.SSAEvent(
            start=pysubs2.make_time(s=seg["start"]),
            end=pysubs2.make_time(s=seg["end"]),
            text=seg["text"].strip(),
            style=style_name,
        )
        subs.events.append(event)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    subs.save(str(output_path))
    return output_path


def generate_srt(
    segments: List[Dict[str, Any]],
    output_path: Path,
) -> Path:
    """Generate SRT subtitle file from aligned segments.

    Args:
        segments: List of {"start", "end", "text"} dicts.
        output_path: Where to write the .srt file.

    Returns:
        Path to generated SRT file.
    """
    import pysubs2  # type: ignore

    subs = pysubs2.SSAFile()
    for seg in segments:
        if not seg.get("text", "").strip():
            continue
        subs.append(pysubs2.SSAEvent(
            start=pysubs2.make_time(s=seg["start"]),
            end=pysubs2.make_time(s=seg["end"]),
            text=seg["text"].strip(),
        ))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    subs.save(str(output_path), format_="srt")
    return output_path


def generate_dual_ass(
    ko_segments: List[Dict[str, Any]],
    en_segments: List[Dict[str, Any]],
    output_path: Path,
    font_ko: str = "Noto Sans CJK KR",
    font_en: str = "DejaVu Sans",
    font_size: int = 28,
) -> Path:
    """Generate dual-language ASS subtitle (KO main bottom, EN above).

    Args:
        ko_segments: Korean subtitle segments.
        en_segments: English subtitle segments.
        output_path: Where to write the .ass file.
        font_ko: Korean font family.
        font_en: English font family.
        font_size: Base font size.

    Returns:
        Path to generated ASS file.
    """
    import pysubs2  # type: ignore

    subs = pysubs2.SSAFile()

    # Korean: bottom center
    ko_style = pysubs2.SSAStyle(
        fontname=font_ko,
        fontsize=font_size,
        primarycolor=pysubs2.Color(255, 255, 255, 0),
        outlinecolor=pysubs2.Color(0, 0, 0, 0),
        backcolor=pysubs2.Color(0, 0, 0, 128),
        outline=2.0,
        shadow=1.0,
        alignment=2,  # bottom-center
        marginv=50,
        bold=False,
    )
    subs.styles["KO"] = ko_style

    # English: above Korean (higher marginv)
    en_style = pysubs2.SSAStyle(
        fontname=font_en,
        fontsize=font_size - 4,
        primarycolor=pysubs2.Color(220, 220, 220, 0),  # slightly dimmer
        outlinecolor=pysubs2.Color(0, 0, 0, 0),
        backcolor=pysubs2.Color(0, 0, 0, 128),
        outline=1.5,
        shadow=1.0,
        alignment=2,
        marginv=100,  # above KO subtitles
        bold=False,
    )
    subs.styles["EN"] = en_style

    for seg in ko_segments:
        if not seg.get("text", "").strip():
            continue
        subs.events.append(pysubs2.SSAEvent(
            start=pysubs2.make_time(s=seg["start"]),
            end=pysubs2.make_time(s=seg["end"]),
            text=seg["text"].strip(),
            style="KO",
        ))

    for seg in en_segments:
        if not seg.get("text", "").strip():
            continue
        subs.events.append(pysubs2.SSAEvent(
            start=pysubs2.make_time(s=seg["start"]),
            end=pysubs2.make_time(s=seg["end"]),
            text=seg["text"].strip(),
            style="EN",
        ))

    # Sort by start time for proper rendering
    subs.events.sort(key=lambda e: e.start)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    subs.save(str(output_path))
    return output_path


def burn_subtitles(
    video_path: Path,
    ass_path: Path,
    output_path: Path,
    fonts_dir: Path | None = DEFAULT_SUBTITLE_FONTS_DIR,
) -> Path:
    """Burn ASS subtitles into video using FFmpeg ass filter.

    Args:
        video_path: Input video.
        ass_path: ASS subtitle file.
        output_path: Output video with burned-in subtitles.

    Returns:
        Path to output video.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Escape the ass path for FFmpeg filter (backslash colons and backslashes)
    ass_escaped = str(ass_path).replace("\\", "/").replace(":", "\\:")

    vf = f"ass='{ass_escaped}'"
    if fonts_dir and fonts_dir.exists():
        fonts_escaped = str(fonts_dir).replace("\\", "/").replace(":", "\\:")
        vf += f":fontsdir='{fonts_escaped}'"

    _run([
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-movflags", "+faststart",
        str(output_path),
    ])
    return output_path


def subtitle_pipeline(
    video_path: Path,
    audio_path: Path,
    text_ko: str | None = None,
    text_en: str | None = None,
    language: str = "ko",
    output_path: Path | None = None,
    font_ko: str = "Noto Sans CJK KR",
    font_en: str = "DejaVu Sans",
    font_size: int = 28,
    fonts_dir: Path | None = DEFAULT_SUBTITLE_FONTS_DIR,
    output_format: str = "ass",
    srt_output_dir: Path | None = None,
) -> Path:
    """Full subtitle pipeline: align → ASS/SRT → burn-in.

    Args:
        video_path: Input assembled video.
        audio_path: Audio track for alignment (VO/narration).
        text_ko: Korean text to align (None to skip KO subtitles).
        text_en: English text to align (None to skip EN subtitles).
        language: Primary alignment language.
        output_path: Output video path (auto-generated if None).
        font_ko: Korean subtitle font.
        font_en: English subtitle font.
        font_size: Base subtitle font size.
        output_format: "ass" | "srt" | "both". ASS is always used for burn-in.
            When "srt" or "both", SRT files are written to srt_output_dir.
        srt_output_dir: Directory for SRT file output (defaults to video parent dir).

    Returns:
        Path to video with burned-in subtitles.
    """
    if not text_ko and not text_en:
        raise ValueError("At least one of text_ko or text_en must be provided")

    if output_path is None:
        output_path = video_path.parent / f"{video_path.stem}_subtitled{video_path.suffix}"

    _ensure_required_fonts(text_ko, text_en, font_ko, font_en, fonts_dir)

    srt_dir = srt_output_dir or video_path.parent

    with tempfile.TemporaryDirectory(prefix="subtitle_") as td:
        td_path = Path(td)

        ko_segments: List[Dict[str, Any]] = []
        en_segments: List[Dict[str, Any]] = []

        if text_ko:
            ko_segments = align_text_to_audio(audio_path, text_ko, language="ko")
        if text_en:
            en_segments = align_text_to_audio(audio_path, text_en, language="en")

        # Generate SRT if requested
        if output_format in ("srt", "both"):
            srt_dir.mkdir(parents=True, exist_ok=True)
            if ko_segments:
                srt_ko = srt_dir / f"{video_path.stem}_ko.srt"
                generate_srt(ko_segments, srt_ko)
                print(f"[OK] SRT (ko): {srt_ko}")
            if en_segments:
                srt_en = srt_dir / f"{video_path.stem}_en.srt"
                generate_srt(en_segments, srt_en)
                print(f"[OK] SRT (en): {srt_en}")

        # ASS generation for burn-in (always needed unless format is srt-only with no burn)
        if text_ko and text_en:
            ass_path = td_path / "dual_subtitles.ass"
            generate_dual_ass(
                ko_segments, en_segments, ass_path,
                font_ko=font_ko, font_en=font_en, font_size=font_size,
            )
        elif text_ko:
            ass_path = td_path / "subtitles_ko.ass"
            generate_ass(
                ko_segments, ass_path,
                font_name=font_ko, font_size=font_size, style_name="Default",
            )
        else:
            ass_path = td_path / "subtitles_en.ass"
            generate_ass(
                en_segments, ass_path,
                font_name=font_en, font_size=font_size, style_name="Default",
            )

        return burn_subtitles(video_path, ass_path, output_path, fonts_dir=fonts_dir)


def _load_text_arg(direct_text: str | None, text_file: Path | None) -> str | None:
    if direct_text:
        return direct_text
    if text_file:
        return text_file.read_text(encoding="utf-8").strip()
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Align narration text and burn ASS subtitles into a video")
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--text-ko", default=None)
    parser.add_argument("--text-en", default=None)
    parser.add_argument("--text-ko-file", type=Path, default=None)
    parser.add_argument("--text-en-file", type=Path, default=None)
    parser.add_argument("--language", choices=["ko", "en"], default="ko")
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--font-ko", default="Noto Sans CJK KR")
    parser.add_argument("--font-en", default="DejaVu Sans")
    parser.add_argument("--font-size", type=int, default=28)
    parser.add_argument("--fonts-dir", type=Path, default=DEFAULT_SUBTITLE_FONTS_DIR)
    parser.add_argument(
        "--output-format",
        choices=["ass", "srt", "both"],
        default="ass",
        help="Subtitle output format: ass (burn-in only), srt (external file), both",
    )
    parser.add_argument("--srt-output-dir", type=Path, default=None, help="Directory for SRT output files")
    args = parser.parse_args()

    output_path = subtitle_pipeline(
        video_path=args.video,
        audio_path=args.audio,
        text_ko=_load_text_arg(args.text_ko, args.text_ko_file),
        text_en=_load_text_arg(args.text_en, args.text_en_file),
        language=args.language,
        output_path=args.output,
        font_ko=args.font_ko,
        font_en=args.font_en,
        font_size=args.font_size,
        fonts_dir=args.fonts_dir,
        output_format=args.output_format,
        srt_output_dir=args.srt_output_dir,
    )
    print(f"[OK] subtitled video: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
