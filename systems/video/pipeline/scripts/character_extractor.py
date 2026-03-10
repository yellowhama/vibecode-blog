#!/usr/bin/env python3
"""Extract characters from video script and prompts for anchor frame generation.

Parses the script markdown and video_prompts markdown to build a structured
characters.json with appearance descriptions, scene appearances, and
claymation-ready prompts for character sheet generation.

Usage:
    python character_extractor.py \
        --script planning/full_youtube/phase1_act1_script_and_scenes.md \
        --prompts planning/full_youtube/phase1_act1_video_prompts.md \
        --output pipeline/manifests/characters.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Style constants (from video_prompts.md common rules)
# ---------------------------------------------------------------------------
STYLE_BASE = (
    "Stop-motion claymation, Aardman studio style. "
    "Soft matte studio lighting. Heavy fingerprint textures, matte finish."
)

CRITICAL_NEGATIVES = (
    "CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. "
    "The character is completely silent, mouth closed, no speaking, "
    "nonverbal, nonlingual, no lip-sync."
)

# ---------------------------------------------------------------------------
# Known character definitions (extracted from video_prompts.md §공통 스타일)
# ---------------------------------------------------------------------------
KNOWN_CHARACTERS: list[dict[str, Any]] = [
    {
        "id": "dev_protagonist",
        "name": "개발자 (주인공 / Brown-Hooded Avatar)",
        "appearance": (
            "Aardman style minimalist clay figure, very chubby and stubby "
            "proportions with short legs. Bright Musu Yellow (#FFD166) round "
            "face with wide-set half-closed tired protruding eyes, a tiny "
            "round yellow nose, and a slight frown. Wearing a large oversized "
            "thick muted cocoa brown hoodie (#5D4037) with the hood pulled up "
            "framing the face, and a front kangaroo pocket."
        ),
        "keywords": [
            "character", "avatar", "brown-hooded", "hoodie",
            "캐릭터", "주인공", "아바타",
        ],
        "environment": "real_world",
    },
    {
        "id": "yellow_robot",
        "name": "노란 로봇 (에이전트 / Yellow Clay Robot)",
        "appearance": (
            "Small, cute, stubby Musu Yellow (#FFD166) clay robot with little "
            "round limbs. Smooth matte clay finish with visible fingerprint "
            "textures. Simple geometric body, round head, no facial features "
            "except two tiny black dot eyes."
        ),
        "keywords": [
            "robot", "yellow robot", "clay robot", "로봇", "에이전트",
        ],
        "environment": "inside_screen",
    },
    {
        "id": "spider_monster",
        "name": "거미 괴물 (스파게티 코드 / Black Spider Monster)",
        "appearance": (
            "Massive, terrifying, spiky black clay spider-like monster. "
            "Thick black clay body that twitches uncontrollably. Belly splits "
            "open like a door revealing glowing blood-red clay inside. "
            "Multiple jagged black clay legs."
        ),
        "keywords": [
            "spider", "monster", "black clay", "거미", "괴물", "스파게티",
        ],
        "environment": "inside_screen",
    },
    {
        "id": "whiteboard_stickfigure",
        "name": "화이트보드 졸라맨 (Whiteboard Stick Figures)",
        "appearance": (
            "Simple stick figures drawn with thick black marker on a large "
            "white whiteboard. Rough, hand-drawn style. Two variants: "
            "(1) Relaxed developer with GPS device, (2) Panicked tourist "
            "in a maze with question mark above head."
        ),
        "keywords": [
            "whiteboard", "stick-figure", "marker", "칠판", "졸라맨",
        ],
        "environment": "whiteboard",
    },
    {
        "id": "spec_tablet",
        "name": "스펙 판 (Glowing Spec Tablet)",
        "appearance": (
            "Meticulously flat, smooth, faintly glowing white clay rectangular "
            "tablet. Deeply engraved clean structural lines on its surface, "
            "looking like an ancient spec document or architectural blueprint."
        ),
        "keywords": [
            "spec", "tablet", "blueprint", "스펙", "청사진", "판",
        ],
        "environment": "real_world",
    },
]

# Angle prompts for character sheet generation
ANGLE_TEMPLATES = {
    "front": "Front view, facing camera directly. {style} {appearance} {negatives}",
    "three_quarter": "Three-quarter view, slight angle. {style} {appearance} {negatives}",
    "side": "Side profile view. {style} {appearance} {negatives}",
    "full_body": "Full body view, head to toe. {style} {appearance} {negatives}",
}


def _parse_acts_from_script(script_text: str) -> list[dict[str, str]]:
    """Parse Act headers and content from the script markdown."""
    acts: list[dict[str, str]] = []
    pattern = re.compile(
        r"###\s*\[Act\s*(\d+)\s*[-–—]\s*(.+?)\]\s*\((.+?)\)",
        re.IGNORECASE,
    )
    sections = re.split(r"(?=###\s*\[Act\s)", script_text)
    for section in sections:
        m = pattern.search(section)
        if m:
            acts.append({
                "act_number": int(m.group(1)),
                "title": m.group(2).strip(),
                "timecode": m.group(3).strip(),
                "content": section,
            })
    return acts


def _find_character_in_text(text: str, character: dict) -> bool:
    """Check if character keywords appear in text (case-insensitive)."""
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in character["keywords"])


def _assign_scenes(
    characters: list[dict[str, Any]],
    acts: list[dict[str, str]],
) -> None:
    """Assign each character to the Acts they appear in."""
    for char in characters:
        char["scenes"] = []
        char["shot_count"] = 0
        for act in acts:
            if _find_character_in_text(act["content"], char):
                act_label = f"Act{act['act_number']}"
                char["scenes"].append(act_label)
                char["shot_count"] += 1


def _build_sheet_prompts(character: dict[str, Any]) -> dict[str, str]:
    """Build 4-angle character sheet prompts for ComfyUI generation."""
    prompts = {}
    for angle_name, template in ANGLE_TEMPLATES.items():
        prompts[angle_name] = template.format(
            style=STYLE_BASE,
            appearance=character["appearance"],
            negatives=CRITICAL_NEGATIVES,
        )
    return prompts


def extract_characters(
    script_path: Path,
    prompts_path: Path | None = None,
) -> dict[str, Any]:
    """Main extraction: parse script, match characters, build output."""
    script_text = script_path.read_text(encoding="utf-8")

    # Also read prompts file for richer keyword matching
    if prompts_path and prompts_path.exists():
        prompts_text = prompts_path.read_text(encoding="utf-8")
        combined_text = script_text + "\n" + prompts_text
    else:
        combined_text = script_text

    # Parse acts
    acts = _parse_acts_from_script(combined_text)

    # Build character list
    characters = []
    for i, known in enumerate(KNOWN_CHARACTERS):
        char = dict(known)
        char.pop("keywords", None)
        _assign_scenes([{**known, **char}], acts)
        # Re-assign with proper keyword matching
        char["scenes"] = []
        char["shot_count"] = 0
        for act in acts:
            if _find_character_in_text(act["content"], known):
                act_label = f"Act{act['act_number']}"
                if act_label not in char["scenes"]:
                    char["scenes"].append(act_label)
                    char["shot_count"] += 1
        char["priority"] = i + 1
        char["sheet_prompts"] = _build_sheet_prompts(char)
        characters.append(char)

    # Sort by shot_count descending (most featured first)
    characters.sort(key=lambda c: c["shot_count"], reverse=True)
    for i, char in enumerate(characters):
        char["priority"] = i + 1

    result = {
        "project_id": "phase1_act1_full_youtube",
        "style_base": STYLE_BASE,
        "critical_negatives": CRITICAL_NEGATIVES,
        "total_acts": len(acts),
        "acts": [
            {"act_number": a["act_number"], "title": a["title"], "timecode": a["timecode"]}
            for a in acts
        ],
        "characters": characters,
    }
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract characters from video script")
    parser.add_argument(
        "--script", type=Path, required=True,
        help="Path to script markdown (phase1_act1_script_and_scenes.md)",
    )
    parser.add_argument(
        "--prompts", type=Path, default=None,
        help="Path to video prompts markdown (phase1_act1_video_prompts.md)",
    )
    parser.add_argument(
        "--output", type=Path, default=None,
        help="Output path for characters.json (default: stdout)",
    )
    args = parser.parse_args()

    if not args.script.exists():
        print(f"ERROR: script not found: {args.script}", file=sys.stderr)
        sys.exit(1)

    result = extract_characters(args.script, args.prompts)

    output_json = json.dumps(result, indent=2, ensure_ascii=False)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output_json, encoding="utf-8")
        print(f"[OK] characters extracted: {len(result['characters'])} characters → {args.output}")
    else:
        print(output_json)


if __name__ == "__main__":
    main()
