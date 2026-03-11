#!/usr/bin/env python3
"""Parse a Fountain script with segment annotations into prepro_manifest.json.

Our Fountain format uses custom comment annotations:
    # SEGMENT N: NAME [start-end]
    # visual_type: sitcom|explainer
    # characters: vee, bee   (or empty: [])
    # shorts_candidate: true|false

Character dialogue is extracted as:
    CHARACTER_NAME
    (parenthetical/emotion)
    Dialogue text.

Action lines become visual_goal descriptions.
Synopses (= lines) become scene notes.

Usage:
    python parse_fountain_to_prepro.py \
        --input ep01_script.fountain \
        --output ep01_prepro_manifest.json \
        --project-id ep01 \
        --language en
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Segment header parsing
# ---------------------------------------------------------------------------
SEGMENT_RE = re.compile(
    r"^#\s+SEGMENT\s+(\d+):\s+(.+?)\s*\[(\d+:\d+)-(\d+:\d+)\]\s*$"
)
META_RE = re.compile(r"^#\s+(visual_type|characters|shorts_candidate):\s*(.+)$")
SCENE_HEADING_RE = re.compile(r"^(INT\.|EXT\.|INT\./EXT\.)\s+.+$")
CHARACTER_RE = re.compile(r"^([A-Z][A-Z\s]+?)(?:\s*\(V\.O\.\))?\s*$")
PARENTHETICAL_RE = re.compile(r"^\((.+)\)\s*$")
SYNOPSIS_RE = re.compile(r"^=\s+(.+)$")
TRANSITION_RE = re.compile(r"^>\s+(.+)$")
TIMECODE_RE = re.compile(r"(\d+):(\d+)")

# Language detection: if >30% of characters are CJK, assume Korean
CJK_RE = re.compile(r"[\u3000-\u9fff\uac00-\ud7af]")


def _detect_language(text: str) -> str:
    """Auto-detect language from script text. Returns 'ko' or 'en'."""
    # Only look at dialogue/narration text (skip annotations)
    sample = ""
    for line in text.split("\n"):
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and not stripped.startswith("=") and not stripped.startswith(">"):
            sample += stripped
        if len(sample) > 2000:
            break
    if not sample:
        return "en"
    cjk_count = len(CJK_RE.findall(sample))
    ratio = cjk_count / len(sample)
    return "ko" if ratio > 0.15 else "en"


def _estimate_duration(text: str, language: str) -> float:
    """Estimate speech duration for text.

    Korean: ~2.5 chars/sec (character-dense).
    English: ~150 WPM = 2.5 words/sec.
    """
    if language == "ko":
        return max(1.5, len(text) / 2.5)
    # English: word-based estimation
    words = len(text.split())
    return max(1.5, words / 2.5)


def _parse_timecode(tc: str) -> float:
    """Parse 'M:SS' to seconds."""
    m = TIMECODE_RE.match(tc)
    if not m:
        return 0.0
    return int(m.group(1)) * 60 + int(m.group(2))


def _parse_characters_field(raw: str) -> list[str]:
    """Parse 'vee, bee' or '[]' into list."""
    raw = raw.strip()
    if raw in ("[]", ""):
        return []
    return [c.strip().lower() for c in raw.split(",") if c.strip()]


def parse_fountain(text: str) -> list[dict[str, Any]]:
    """Parse fountain text into a list of segment dicts."""
    lines = text.split("\n")
    segments: list[dict[str, Any]] = []
    current_segment: dict[str, Any] | None = None

    # Dialogue state machine
    in_dialogue = False
    current_speaker = ""
    current_emotion = ""
    dialogue_buffer: list[str] = []

    def _flush_dialogue():
        nonlocal in_dialogue, current_speaker, current_emotion, dialogue_buffer
        if in_dialogue and current_segment and dialogue_buffer:
            text_joined = " ".join(dialogue_buffer).strip()
            if text_joined and text_joined != "...":
                current_segment["dialogue"].append({
                    "speaker": current_speaker.lower().replace(" (v.o.)", ""),
                    "text": text_joined,
                    "emotion": current_emotion,
                })
        in_dialogue = False
        current_speaker = ""
        current_emotion = ""
        dialogue_buffer = []

    for line in lines:
        line_stripped = line.rstrip()

        # Skip empty lines (but flush dialogue)
        if not line_stripped:
            if in_dialogue and dialogue_buffer:
                _flush_dialogue()
            continue

        # Segment header
        seg_match = SEGMENT_RE.match(line_stripped)
        if seg_match:
            _flush_dialogue()
            if current_segment:
                segments.append(current_segment)
            seg_num = int(seg_match.group(1))
            seg_name = seg_match.group(2).strip()
            start_tc = seg_match.group(3)
            end_tc = seg_match.group(4)
            start_sec = _parse_timecode(start_tc)
            end_sec = _parse_timecode(end_tc)
            current_segment = {
                "segment_id": f"SEG{seg_num:02d}",
                "segment_name": seg_name,
                "start_sec": start_sec,
                "end_sec": end_sec,
                "duration_sec": round(end_sec - start_sec, 1),
                "visual_type": "sitcom",
                "characters": ["vee"],
                "shorts_candidate": False,
                "scene_heading": "",
                "synopsis": "",
                "visual_goals": [],
                "dialogue": [],
                "transitions": [],
            }
            continue

        # Segment metadata
        meta_match = META_RE.match(line_stripped)
        if meta_match and current_segment:
            key, val = meta_match.group(1), meta_match.group(2).strip()
            if key == "visual_type":
                current_segment["visual_type"] = val
            elif key == "characters":
                current_segment["characters"] = _parse_characters_field(val)
            elif key == "shorts_candidate":
                current_segment["shorts_candidate"] = val.lower() == "true"
            continue

        # Title block (skip)
        if line_stripped.startswith("Title:") or line_stripped.startswith("Credit:") or \
           line_stripped.startswith("Author:") or line_stripped.startswith("Series:") or \
           line_stripped.startswith("Source:") or line_stripped.startswith("Draft date:") or \
           line_stripped.startswith("Contact:"):
            continue

        # Section break
        if line_stripped == "---":
            _flush_dialogue()
            continue

        if not current_segment:
            continue

        # Synopsis (= lines) → visual goals
        syn_match = SYNOPSIS_RE.match(line_stripped)
        if syn_match:
            _flush_dialogue()
            desc = syn_match.group(1).strip()
            current_segment["visual_goals"].append(desc)
            if not current_segment["synopsis"]:
                current_segment["synopsis"] = desc
            continue

        # Transition (> lines)
        trans_match = TRANSITION_RE.match(line_stripped)
        if trans_match:
            _flush_dialogue()
            current_segment["transitions"].append(trans_match.group(1).strip())
            continue

        # Scene heading
        if SCENE_HEADING_RE.match(line_stripped):
            _flush_dialogue()
            current_segment["scene_heading"] = line_stripped
            continue

        # Character name (start dialogue)
        char_match = CHARACTER_RE.match(line_stripped)
        if char_match and not line_stripped.startswith("("):
            _flush_dialogue()
            in_dialogue = True
            raw_name = char_match.group(0).strip()
            current_speaker = raw_name
            continue

        # Parenthetical (emotion)
        if in_dialogue:
            paren_match = PARENTHETICAL_RE.match(line_stripped)
            if paren_match:
                current_emotion = paren_match.group(1).strip()
                continue
            # Dialogue text
            dialogue_buffer.append(line_stripped)
            continue

        # Action line → visual goal
        if line_stripped and not line_stripped.startswith("#"):
            current_segment["visual_goals"].append(line_stripped)

    # Flush last segment
    _flush_dialogue()
    if current_segment:
        segments.append(current_segment)

    return segments


def segments_to_prepro_manifest(
    segments: list[dict[str, Any]],
    project_id: str,
    title: str = "",
    language: str = "en",
) -> dict[str, Any]:
    """Convert parsed segments into prepro_manifest.json format.

    Each segment becomes a 'phase', and dialogue/visual_goals become 'beats'.
    """
    phases = []
    all_beats = []
    beat_counter = 0

    for seg in segments:
        phase_beats = []

        # Create beats from dialogue lines
        for i, dlg in enumerate(seg["dialogue"]):
            beat_counter += 1
            beat_id = f"{seg['segment_id']}_B{beat_counter:03d}"

            text = dlg["text"]
            est_dur = _estimate_duration(text, language)

            beat = {
                "beat_id": beat_id,
                "scene_id": seg["segment_id"],
                "text": text,
                "narration_text": text,
                "visual_goal": seg["visual_goals"][i] if i < len(seg["visual_goals"]) else text,
                "duration_sec": round(est_dur, 1),
                "visual_type": seg["visual_type"],
                "characters": seg["characters"],
                "dialogue": [dlg],
                "shorts_candidate": seg["shorts_candidate"] and i == 0,
            }
            phase_beats.append(beat)

        # If no dialogue (e.g., pure action/transition), create beats from visual goals
        if not phase_beats and seg["visual_goals"]:
            for i, vg in enumerate(seg["visual_goals"]):
                beat_counter += 1
                beat_id = f"{seg['segment_id']}_B{beat_counter:03d}"
                beat = {
                    "beat_id": beat_id,
                    "scene_id": seg["segment_id"],
                    "text": vg,
                    "narration_text": vg,
                    "visual_goal": vg,
                    "duration_sec": 3.0,
                    "visual_type": seg["visual_type"],
                    "characters": seg["characters"],
                    "dialogue": [],
                    "shorts_candidate": seg["shorts_candidate"] and i == 0,
                }
                phase_beats.append(beat)

        if phase_beats:
            phases.append({
                "phase_id": seg["segment_id"],
                "phase_name": seg["segment_name"],
                "visual_type": seg["visual_type"],
                "target_duration_sec": seg["duration_sec"],
                "beats": phase_beats,
            })
            all_beats.extend(phase_beats)

    return {
        "project_id": project_id,
        "title": title,
        "language": language,
        "total_duration_sec": round(sum(s["duration_sec"] for s in segments), 1),
        "segment_count": len(segments),
        "beat_count": len(all_beats),
        "phases": phases,
        "beats": all_beats,  # Flat list for build_shot_manifest compatibility
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Parse Fountain script to prepro manifest")
    parser.add_argument("--input", required=True, type=Path, help="Fountain script file")
    parser.add_argument("--output", type=Path, default=None, help="Output JSON path")
    parser.add_argument("--project-id", default=None, help="Project ID (default: filename stem)")
    parser.add_argument("--language", default="auto", choices=["auto", "en", "ko"],
                        help="Script language (auto-detected if not specified)")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"[ERROR] Input not found: {args.input}")
        return 1

    text = args.input.read_text(encoding="utf-8")
    segments = parse_fountain(text)

    if not segments:
        print("[ERROR] No segments found in fountain script")
        return 1

    project_id = args.project_id or args.input.stem
    title_line = ""
    for line in text.split("\n"):
        if line.startswith("Title:"):
            title_line = line.replace("Title:", "").strip()
            break

    language = args.language if args.language != "auto" else _detect_language(text)
    print(f"[OK] Language: {language}")

    manifest = segments_to_prepro_manifest(segments, project_id, title_line, language=language)

    output = args.output or args.input.with_suffix(".prepro_manifest.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"[OK] Parsed {len(segments)} segments, {manifest['beat_count']} beats")
    print(f"[OK] Total duration: {manifest['total_duration_sec']}s")
    for seg in segments:
        n_dlg = len(seg['dialogue'])
        n_vg = len(seg['visual_goals'])
        print(f"  {seg['segment_id']} {seg['segment_name']}: {seg['duration_sec']}s, "
              f"{n_dlg} dialogue, {n_vg} visual goals, type={seg['visual_type']}")
    print(f"[OK] Output: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
