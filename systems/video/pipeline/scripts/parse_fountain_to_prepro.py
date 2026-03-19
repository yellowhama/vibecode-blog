#!/usr/bin/env python3
"""Parse a Fountain script (Series Bible v6 format) into prepro_manifest.json.

Our v2 Fountain format uses block-comment annotations:

    /* ================================================================ */
    /* SEGMENT N: NAME [start-end]                                       */
    /* emotion_curve: EXCITEMENT                                         */
    /* narrative_stage: HOOK                                              */
    /* ================================================================ */

    /* visual_type: character_reaction | space: desk */
    /* vee_reaction: 3/6 */
    /* extended_metaphor_start */
    /* extended_metaphor_end */
    /* shorts_candidate */

v6 segments: HOOK, MISCONCEPTION, THE_CRACK, CORE, REFRAME, OUTRO_CTA
Backward compat: PROBLEM→MISCONCEPTION, APPLICATION→REFRAME, OUTRO→OUTRO_CTA
                  SITCOM ACT 1→MISCONCEPTION, EXPLAINER→CORE, SITCOM ACT 2→REFRAME, ENDING→OUTRO_CTA

Usage:
    python parse_fountain_to_prepro.py \
        --input ep01_script_v2.fountain \
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
# v6 Segments
# ---------------------------------------------------------------------------
V6_SEGMENTS = {"HOOK", "MISCONCEPTION", "THE_CRACK", "CORE", "REFRAME", "OUTRO_CTA"}

# Backward-compat mapping from old segment names
SEGMENT_NAME_MAP = {
    # v5 → v6
    "PROBLEM": "MISCONCEPTION",
    "APPLICATION": "REFRAME",
    "OUTRO": "OUTRO_CTA",
    # v3/sitcom era → v6
    "SITCOM ACT 1": "MISCONCEPTION",
    "SITCOM ACT 2": "REFRAME",
    "SITCOM": "MISCONCEPTION",
    "EXPLAINER": "CORE",
    "ENDING": "OUTRO_CTA",
    # v4 narrative stages → v6
    "FURY": "MISCONCEPTION",
    "MESS": "CORE",
    "INSIGHT": "REFRAME",
}

# ---------------------------------------------------------------------------
# Regex patterns — v2 Fountain with /* */ block comment annotations
# ---------------------------------------------------------------------------

# Segment header inside block comments:
# /* SEGMENT 3: CORE [0:45–3:00]  */
SEGMENT_BLOCK_RE = re.compile(
    r"/\*\s*SEGMENT\s+(\d+):\s+(.+?)\s*\[([0-9:]+)\s*[-–—]\s*([0-9:]+)\]\s*\*/"
)

# Old-style hash segment header (v1 compat)
SEGMENT_HASH_RE = re.compile(
    r"^#\s+SEGMENT\s+(\d+):\s+(.+?)\s*\[(\d+:\d+)-(\d+:\d+)\]\s*$"
)

# Inline metadata: /* visual_type: X | space: Y */
VISUAL_SPACE_RE = re.compile(
    r"/\*\s*visual_type:\s*(\S+)\s*\|\s*space:\s*(\S+)\s*\*/"
)

# Standalone visual_type (no space field)
VISUAL_ONLY_RE = re.compile(r"/\*\s*visual_type:\s*(\S+)\s*\*/")

# Vee reaction: /* vee_reaction: N/M */
VEE_REACTION_RE = re.compile(r"/\*\s*vee_reaction:\s*(\d+)/(\d+)\s*\*/")

# Extended metaphor markers
EXT_META_START_RE = re.compile(r"/\*\s*extended_metaphor_start\s*\*/")
EXT_META_END_RE = re.compile(r"/\*\s*extended_metaphor_end\s*\*/")

# Shorts candidate: /* shorts_candidate */
SHORTS_RE = re.compile(r"/\*\s*shorts_candidate\s*\*/")

# Narrative stage: /* narrative_stage: X */
NARRATIVE_STAGE_RE = re.compile(r"/\*\s*narrative_stage:\s*(\S+)\s*\*/")

# Emotion curve: /* emotion_curve: X */
EMOTION_CURVE_RE = re.compile(r"/\*\s*emotion_curve:\s*(.+?)\s*\*/")

# Old-style hash metadata (v1 compat) + v4 visual_mode/space
META_HASH_RE = re.compile(r"^#\s+(visual_type|visual_mode|characters|shorts_candidate|space):\s*(.+)$")

# Standard Fountain patterns
SCENE_HEADING_RE = re.compile(r"^(INT\.|EXT\.|INT\./EXT\.)\s+.+$")
CHARACTER_RE = re.compile(r"^([A-Z][A-Z\s]+?)(?:\s*\(V\.O\.\))?\s*$")
PARENTHETICAL_RE = re.compile(r"^\((.+)\)\s*$")
SYNOPSIS_RE = re.compile(r"^=\s+(.+)$")
TRANSITION_RE = re.compile(r"^>\s+(.+)$")
TIMECODE_RE = re.compile(r"(\d+):(\d+)")

# Title block fields
TITLE_FIELDS = {"Title:", "Credit:", "Author:", "Series:", "Source:", "Draft date:",
                "Contact:", "Duration:", "Notes:"}

# Language detection: CJK characters
CJK_RE = re.compile(r"[\u3000-\u9fff\uac00-\ud7af]")


def _detect_language(text: str) -> str:
    """Auto-detect language from script text. Returns 'ko' or 'en'."""
    sample = ""
    for line in text.split("\n"):
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and not stripped.startswith("/*") \
                and not stripped.startswith("=") and not stripped.startswith(">"):
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
    words = len(text.split())
    return max(1.5, words / 2.5)


def _parse_timecode(tc: str) -> float:
    """Parse 'M:SS' to seconds."""
    m = TIMECODE_RE.match(tc)
    if not m:
        return 0.0
    return int(m.group(1)) * 60 + int(m.group(2))


def _normalize_segment_name(raw_name: str) -> str:
    """Map segment name to v5 canonical name."""
    upper = raw_name.strip().upper()
    if upper in V6_SEGMENTS:
        return upper
    mapped = SEGMENT_NAME_MAP.get(upper)
    if mapped:
        return mapped
    # Try partial matching
    for old, new in SEGMENT_NAME_MAP.items():
        if old in upper:
            return new
    return upper


def _parse_characters_field(raw: str) -> list[str]:
    """Parse 'vee, bee' or '[]' into list."""
    raw = raw.strip()
    if raw in ("[]", ""):
        return []
    return [c.strip().lower() for c in raw.split(",") if c.strip()]


def parse_fountain(text: str) -> list[dict[str, Any]]:
    """Parse v2 Fountain text into a list of segment dicts (v5 format)."""
    lines = text.split("\n")
    segments: list[dict[str, Any]] = []
    current_segment: dict[str, Any] | None = None

    # Track state
    in_dialogue = False
    current_speaker = ""
    current_emotion = ""
    dialogue_buffer: list[str] = []
    in_extended_metaphor = False

    # Per-beat tracking for visual_type/space overrides
    pending_visual_type: str | None = None
    pending_space: str | None = None
    pending_vee_reaction: int | None = None
    pending_shorts: bool = False

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

    def _flush_pending_to_beat(beat: dict[str, Any]):
        nonlocal pending_visual_type, pending_space, pending_vee_reaction, pending_shorts
        if pending_visual_type:
            beat["visual_type"] = pending_visual_type
        if pending_space:
            beat["space"] = pending_space
        if pending_vee_reaction is not None:
            beat["vee_reaction_number"] = pending_vee_reaction
        if pending_shorts:
            beat["shorts_candidate"] = True
        beat["extended_metaphor"] = in_extended_metaphor
        # Reset pending
        pending_visual_type = None
        pending_space = None
        pending_vee_reaction = None
        pending_shorts = False

    for line in lines:
        line_stripped = line.rstrip()

        # Skip empty lines (flush dialogue)
        if not line_stripped:
            if in_dialogue and dialogue_buffer:
                _flush_dialogue()
            continue

        # Skip pure comment separator lines
        if re.match(r"^/\*\s*=+\s*\*/\s*$", line_stripped):
            continue

        # --- Block comment annotations ---

        # Segment header in block comment
        seg_block = SEGMENT_BLOCK_RE.search(line_stripped)
        if seg_block:
            _flush_dialogue()
            if current_segment:
                segments.append(current_segment)
            seg_num = int(seg_block.group(1))
            seg_name_raw = seg_block.group(2).strip()
            seg_name = _normalize_segment_name(seg_name_raw)
            start_tc = seg_block.group(3)
            end_tc = seg_block.group(4)
            start_sec = _parse_timecode(start_tc)
            end_sec = _parse_timecode(end_tc)
            current_segment = {
                "segment_id": f"SEG{seg_num:02d}",
                "segment_name": seg_name,
                "start_sec": start_sec,
                "end_sec": end_sec,
                "duration_sec": round(end_sec - start_sec, 1),
                "visual_type": "character_reaction",
                "space": "desk",
                "characters": ["vee"],
                "shorts_candidate": False,
                "vee_expression": "default",
                "vee_reaction_number": None,
                "extended_metaphor": False,
                "narrator_vo": "",
                "emotion_curve": "",
                "narrative_stage": seg_name,
                "scene_heading": "",
                "synopsis": "",
                "visual_goals": [],
                "dialogue": [],
                "transitions": [],
                "beats": [],
            }
            continue

        # Narrative stage
        ns_match = NARRATIVE_STAGE_RE.search(line_stripped)
        if ns_match and current_segment:
            current_segment["narrative_stage"] = ns_match.group(1).strip()
            continue

        # Emotion curve
        ec_match = EMOTION_CURVE_RE.search(line_stripped)
        if ec_match and current_segment:
            current_segment["emotion_curve"] = ec_match.group(1).strip()
            continue

        # Visual type + space (inline)
        vs_match = VISUAL_SPACE_RE.search(line_stripped)
        if vs_match:
            pending_visual_type = vs_match.group(1).strip()
            pending_space = vs_match.group(2).strip()
            if current_segment:
                # Set segment-level defaults on first occurrence
                if current_segment["visual_type"] == "character_reaction" and not current_segment["beats"]:
                    current_segment["visual_type"] = pending_visual_type
                    current_segment["space"] = pending_space
            continue

        # Visual type only
        vo_match = VISUAL_ONLY_RE.search(line_stripped)
        if vo_match and not vs_match:
            pending_visual_type = vo_match.group(1).strip()
            continue

        # Vee reaction
        vr_match = VEE_REACTION_RE.search(line_stripped)
        if vr_match:
            pending_vee_reaction = int(vr_match.group(1))
            continue

        # Extended metaphor markers
        if EXT_META_START_RE.search(line_stripped):
            in_extended_metaphor = True
            continue
        if EXT_META_END_RE.search(line_stripped):
            in_extended_metaphor = False
            continue

        # Shorts candidate
        if SHORTS_RE.search(line_stripped):
            pending_shorts = True
            continue

        # Skip other block comments (open_loop, duration, etc.)
        if line_stripped.strip().startswith("/*") and line_stripped.strip().endswith("*/"):
            continue

        # --- Old-style hash segment header (v1 backward compat) ---
        seg_hash = SEGMENT_HASH_RE.match(line_stripped)
        if seg_hash:
            _flush_dialogue()
            if current_segment:
                segments.append(current_segment)
            seg_num = int(seg_hash.group(1))
            seg_name_raw = seg_hash.group(2).strip()
            seg_name = _normalize_segment_name(seg_name_raw)
            start_tc = seg_hash.group(3)
            end_tc = seg_hash.group(4)
            start_sec = _parse_timecode(start_tc)
            end_sec = _parse_timecode(end_tc)
            current_segment = {
                "segment_id": f"SEG{seg_num:02d}",
                "segment_name": seg_name,
                "start_sec": start_sec,
                "end_sec": end_sec,
                "duration_sec": round(end_sec - start_sec, 1),
                "visual_type": "character_reaction",
                "space": "desk",
                "characters": ["vee"],
                "shorts_candidate": False,
                "vee_expression": "default",
                "vee_reaction_number": None,
                "extended_metaphor": False,
                "narrator_vo": "",
                "emotion_curve": "",
                "narrative_stage": seg_name,
                "scene_heading": "",
                "synopsis": "",
                "visual_goals": [],
                "dialogue": [],
                "transitions": [],
                "beats": [],
            }
            continue

        # Old-style hash metadata (v1 compat) + v4 visual_mode/space
        meta_hash = META_HASH_RE.match(line_stripped)
        if meta_hash and current_segment:
            key, val = meta_hash.group(1), meta_hash.group(2).strip()
            if key == "visual_type":
                current_segment["visual_type"] = val
            elif key == "visual_mode":
                # v4 visual_mode: A=character_reaction, B=diagram, C=screen_demo
                mode_map = {"A": "character_reaction", "B": "diagram", "C": "screen_demo"}
                current_segment["visual_type"] = mode_map.get(val.upper(), "character_reaction")
            elif key == "space":
                current_segment["space"] = val
            elif key == "characters":
                current_segment["characters"] = _parse_characters_field(val)
            elif key == "shorts_candidate":
                current_segment["shorts_candidate"] = val.lower() == "true"
            continue

        # Title block (skip)
        if any(line_stripped.startswith(f) for f in TITLE_FIELDS):
            continue

        # Section break
        if line_stripped == "---":
            _flush_dialogue()
            continue

        if not current_segment:
            continue

        # Synopsis (= lines) → visual goals + beats
        syn_match = SYNOPSIS_RE.match(line_stripped)
        if syn_match:
            _flush_dialogue()
            desc = syn_match.group(1).strip()
            beat = {
                "type": "action",
                "text": desc,
                "visual_type": pending_visual_type or current_segment["visual_type"],
                "space": pending_space or current_segment["space"],
                "vee_reaction_number": pending_vee_reaction,
                "shorts_candidate": pending_shorts,
                "extended_metaphor": in_extended_metaphor,
            }
            _flush_pending_to_beat(beat)
            current_segment["beats"].append(beat)
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

        # Action line → visual goal + beat
        if line_stripped and not line_stripped.startswith("#"):
            beat = {
                "type": "action",
                "text": line_stripped,
                "visual_type": pending_visual_type or current_segment["visual_type"],
                "space": pending_space or current_segment["space"],
                "vee_reaction_number": pending_vee_reaction,
                "shorts_candidate": pending_shorts,
                "extended_metaphor": in_extended_metaphor,
            }
            _flush_pending_to_beat(beat)
            current_segment["beats"].append(beat)
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
    """Convert parsed segments into v5 prepro_manifest.json format.

    Each segment becomes a 'phase', and dialogue/visual_goals become 'beats'.
    Output includes v5 fields: segment, visual_type, space, vee_expression,
    vee_reaction_number, extended_metaphor, shorts_candidate, narrator_vo.
    """
    phases = []
    all_beats = []
    beat_counter = 0

    for seg in segments:
        phase_beats = []

        # Create beats from dialogue lines (narrator V.O.)
        for i, dlg in enumerate(seg["dialogue"]):
            beat_counter += 1
            beat_id = f"{seg['segment_id']}_B{beat_counter:03d}"

            text = dlg["text"]
            est_dur = _estimate_duration(text, language)

            # Find matching beat annotation if available
            beat_anno = seg["beats"][i] if i < len(seg["beats"]) else {}

            beat = {
                "beat_id": beat_id,
                "scene_id": seg["segment_id"],
                "text": text,
                "narration_text": text,
                "narrator_vo": text,
                "visual_goal": seg["visual_goals"][i] if i < len(seg["visual_goals"]) else text,
                "duration_sec": round(est_dur, 1),
                "segment": seg["segment_name"],
                "visual_type": beat_anno.get("visual_type", seg["visual_type"]),
                "space": beat_anno.get("space", seg.get("space", "desk")),
                "characters": seg["characters"],
                "vee_expression": seg.get("vee_expression", "default"),
                "vee_reaction_number": beat_anno.get("vee_reaction_number"),
                "extended_metaphor": beat_anno.get("extended_metaphor", seg.get("extended_metaphor", False)),
                "shorts_candidate": beat_anno.get("shorts_candidate", False),
                "narrative_stage": seg.get("narrative_stage", seg["segment_name"]),
                "emotion_curve": seg.get("emotion_curve", ""),
                "dialogue": [dlg],
            }
            phase_beats.append(beat)

        # If no dialogue, create beats from visual goals
        if not phase_beats and seg["visual_goals"]:
            for i, vg in enumerate(seg["visual_goals"]):
                beat_counter += 1
                beat_id = f"{seg['segment_id']}_B{beat_counter:03d}"

                beat_anno = seg["beats"][i] if i < len(seg["beats"]) else {}

                beat = {
                    "beat_id": beat_id,
                    "scene_id": seg["segment_id"],
                    "text": vg,
                    "narration_text": vg,
                    "narrator_vo": "",
                    "visual_goal": vg,
                    "duration_sec": 3.0,
                    "segment": seg["segment_name"],
                    "visual_type": beat_anno.get("visual_type", seg["visual_type"]),
                    "space": beat_anno.get("space", seg.get("space", "desk")),
                    "characters": seg["characters"],
                    "vee_expression": seg.get("vee_expression", "default"),
                    "vee_reaction_number": beat_anno.get("vee_reaction_number"),
                    "extended_metaphor": beat_anno.get("extended_metaphor", seg.get("extended_metaphor", False)),
                    "shorts_candidate": beat_anno.get("shorts_candidate", False),
                    "narrative_stage": seg.get("narrative_stage", seg["segment_name"]),
                    "emotion_curve": seg.get("emotion_curve", ""),
                    "dialogue": [],
                }
                phase_beats.append(beat)

        if phase_beats:
            phases.append({
                "phase_id": seg["segment_id"],
                "phase_name": seg["segment_name"],
                "segment": seg["segment_name"],
                "visual_type": seg["visual_type"],
                "space": seg.get("space", "desk"),
                "emotion_curve": seg.get("emotion_curve", ""),
                "narrative_stage": seg.get("narrative_stage", seg["segment_name"]),
                "target_duration_sec": seg["duration_sec"],
                "beats": phase_beats,
            })
            all_beats.extend(phase_beats)

    return {
        "project_id": project_id,
        "version": "6.0",
        "title": title,
        "language": language,
        "total_duration_sec": round(sum(s["duration_sec"] for s in segments), 1),
        "segment_count": len(segments),
        "beat_count": len(all_beats),
        "segments": [s["segment_name"] for s in segments],
        "phases": phases,
        "beats": all_beats,  # Flat list for build_shot_manifest compatibility
    }


def apply_cut_manifest(manifest: dict[str, Any], cut_path: Path) -> dict[str, Any]:
    """Apply a cut manifest to filter beats and adjust timing for shorter versions.

    Cut manifest format:
    {
      "target_duration_sec": 300,
      "segment_adjustments": {
        "HOOK": { "target_sec": 20, "skip_narrator_indices": [] },
        "CORE": { "target_sec": 120, "skip_narrator_indices": [5, 8, 12] }
      }
    }

    skip_narrator_indices: 0-indexed narrator beat positions within each segment to remove.
    """
    cut = json.loads(cut_path.read_text(encoding="utf-8"))
    adjustments = cut.get("segment_adjustments", {})

    new_beats = []
    for phase in manifest.get("phases", []):
        seg_name = phase.get("segment", phase.get("phase_name", ""))
        adj = adjustments.get(seg_name)
        if not adj:
            new_beats.extend(phase["beats"])
            continue

        skip = set(adj.get("skip_narrator_indices", []))
        if skip:
            narrator_idx = 0
            kept = []
            for beat in phase["beats"]:
                speaker = beat.get("dialogue", [{}])[0].get("speaker", "") if beat.get("dialogue") else ""
                is_narrator = speaker == "narrator" or beat.get("narrator_vo", "")
                if is_narrator:
                    if narrator_idx not in skip:
                        kept.append(beat)
                    narrator_idx += 1
                else:
                    kept.append(beat)
            phase["beats"] = kept
        else:
            kept = phase["beats"]

        # Adjust target duration
        if "target_sec" in adj:
            phase["target_duration_sec"] = adj["target_sec"]

        new_beats.extend(phase["beats"])

    # Recalculate totals
    manifest["beats"] = new_beats
    manifest["beat_count"] = len(new_beats)
    manifest["total_duration_sec"] = round(
        sum(p.get("target_duration_sec", 0) for p in manifest["phases"]), 1
    )
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Parse Fountain script to v6 prepro manifest")
    parser.add_argument("--input", required=True, type=Path, help="Fountain script file")
    parser.add_argument("--output", type=Path, default=None, help="Output JSON path")
    parser.add_argument("--project-id", default=None, help="Project ID (default: filename stem)")
    parser.add_argument("--language", default="auto", choices=["auto", "en", "ko"],
                        help="Script language (auto-detected if not specified)")
    parser.add_argument("--cut-manifest", type=Path, default=None,
                        help="Cut manifest JSON for shorter versions (filters beats, adjusts timing)")
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

    if args.cut_manifest and args.cut_manifest.exists():
        manifest = apply_cut_manifest(manifest, args.cut_manifest)
        print(f"[OK] Applied cut manifest: {args.cut_manifest.name}")
        print(f"[OK] Cut duration: {manifest['total_duration_sec']}s, {manifest['beat_count']} beats")

    output = args.output or args.input.with_suffix(".prepro_manifest.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"[OK] Parsed {len(segments)} segments, {manifest['beat_count']} beats")
    print(f"[OK] Total duration: {manifest['total_duration_sec']}s")
    print(f"[OK] Segments: {', '.join(manifest['segments'])}")
    for seg in segments:
        n_dlg = len(seg["dialogue"])
        n_vg = len(seg["visual_goals"])
        print(f"  {seg['segment_id']} {seg['segment_name']}: {seg['duration_sec']}s, "
              f"{n_dlg} dialogue, {n_vg} visual goals, type={seg['visual_type']}, "
              f"space={seg.get('space', 'desk')}")
    print(f"[OK] Output: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
