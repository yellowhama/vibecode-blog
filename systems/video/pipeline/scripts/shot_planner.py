#!/usr/bin/env python3
"""Intelligent shot planner: generates optimized manifests with character batching.

Takes a script, characters.json, and video_prompts.md to produce a manifest that:
1. Calculates YouTube-optimal pacing (8-12 shots/min)
2. Groups shots by character for generation consistency
3. Auto-assigns reference images from character sheets
4. Prioritizes hero shots (longest/most prominent first)
5. Plans transitions at scene boundaries

Usage:
    python shot_planner.py \
        --script planning/full_youtube/phase1_act1_script_and_scenes.md \
        --prompts planning/full_youtube/phase1_act1_video_prompts.md \
        --characters pipeline/manifests/characters.json \
        --character-assets assets/characters/character_index.json \
        --target-duration 300 \
        --output pipeline/manifests/phase1_act1_planned.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_MODEL_HUNYUAN = "hunyuanvideo1.5_480p_i2v_step_distilled_fp8_scaled.safetensors"
DEFAULT_MODEL_WAN_T2V = "wan2.1_t2v_1.3B_fp16.safetensors"
DEFAULT_RESOLUTION = "832x480"
WHITEBOARD_RESOLUTION = "832x480"

STYLE_BASE = (
    "Stop-motion claymation, Aardman studio style. "
    "Soft matte studio lighting. Heavy fingerprint textures, matte finish."
)
CRITICAL_NEGATIVES = (
    "text, subtitles, watermark, logo, speech bubble, blurry, deformed, "
    "ugly, oversaturated, photorealistic, CGI, smooth animation, live action, "
    "plastic sheen, multiple views, turnaround sheet"
)

# YouTube pacing targets
MIN_SHOTS_PER_MIN = 8
MAX_SHOTS_PER_MIN = 12
MIN_SHOT_DURATION = 3
MAX_SHOT_DURATION = 8
DEFAULT_SHOT_DURATION = 5


def _parse_prompts_file(prompts_path: Path) -> dict[str, list[dict]]:
    """Parse video_prompts.md to extract per-act prompt blocks."""
    text = prompts_path.read_text(encoding="utf-8")
    acts: dict[str, list[dict]] = {}

    # Split by Act headers
    act_pattern = re.compile(
        r"##\s*🎬\s*Act\s*(\d+)\s*[-–—]\s*(.+?)(?:\s*\(.*?\))?\s*$",
        re.MULTILINE,
    )
    matches = list(act_pattern.finditer(text))

    for i, m in enumerate(matches):
        act_num = int(m.group(1))
        act_key = f"Act{act_num}"
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[start:end]

        # Extract prompt blocks (> **Prompt:** `...`)
        prompt_pattern = re.compile(
            r"\*\*\d+\.\s*프롬프트\s*\((.+?)\)\*\*\s*\n>\s*\*\*Prompt:\*\*\s*`(.+?)`",
            re.DOTALL,
        )
        shots = []
        for pm in prompt_pattern.finditer(section):
            shot_label = pm.group(1).strip()
            prompt_text = pm.group(2).strip()
            mode = "i2v" if "img2vid" in shot_label.lower() else "t2v"
            shots.append({
                "label": shot_label,
                "prompt": prompt_text,
                "mode": mode,
            })

        if shots:
            acts[act_key] = shots

    return acts


def _parse_script_acts(script_path: Path) -> list[dict]:
    """Parse script to get act metadata (timing, narration length)."""
    text = script_path.read_text(encoding="utf-8")
    acts = []
    pattern = re.compile(
        r"###\s*\[Act\s*(\d+)\s*[-–—]\s*(.+?)\]\s*\((.+?)\)",
        re.IGNORECASE,
    )
    sections = re.split(r"(?=###\s*\[Act\s)", text)
    for section in sections:
        m = pattern.search(section)
        if m:
            act_num = int(m.group(1))
            timecode = m.group(3).strip()
            # Parse timecode range "M:SS ~ M:SS"
            times = re.findall(r"(\d+):(\d+)", timecode)
            start_sec = int(times[0][0]) * 60 + int(times[0][1]) if times else 0
            end_sec = int(times[1][0]) * 60 + int(times[1][1]) if len(times) > 1 else start_sec + 30
            duration = end_sec - start_sec

            # Extract narration text
            narr_match = re.search(r'\*\*Narration:\*\*\s*"(.+?)"', section, re.DOTALL)
            narration = narr_match.group(1).strip() if narr_match else ""

            acts.append({
                "act_number": act_num,
                "title": m.group(2).strip(),
                "start_sec": start_sec,
                "end_sec": end_sec,
                "duration_sec": duration,
                "narration": narration,
                "narration_word_count": len(narration.split()),
            })
    return acts


def _determine_environment(prompt: str) -> str:
    """Guess environment from prompt keywords."""
    prompt_lower = prompt.lower()
    if "whiteboard" in prompt_lower or "marker" in prompt_lower:
        return "whiteboard"
    if "off-white" in prompt_lower or "empty background" in prompt_lower:
        return "inside_screen"
    return "real_world"


def _find_characters_in_prompt(prompt: str, characters: list[dict]) -> list[str]:
    """Identify which characters appear in a prompt."""
    found = []
    prompt_lower = prompt.lower()
    # Character detection heuristics
    char_markers = {
        "dev_protagonist": ["brown-hooded", "hoodie", "avatar character", "character ref"],
        "yellow_robot": ["yellow clay robot", "yellow robot", "stubby yellow"],
        "spider_monster": ["spider", "black clay monster", "spider monster"],
        "whiteboard_stickfigure": ["stick-figure", "stick figure", "marker draw"],
        "spec_tablet": ["spec tablet", "glowing white clay", "blueprint"],
    }
    for char_id, markers in char_markers.items():
        if any(m in prompt_lower for m in markers):
            found.append(char_id)
    return found if found else ["dev_protagonist"]  # default


def _calculate_pacing(
    target_duration: int,
    acts: list[dict],
) -> dict[str, Any]:
    """Calculate optimal shot distribution across acts."""
    total_script_duration = sum(a["duration_sec"] for a in acts)
    scale_factor = target_duration / total_script_duration if total_script_duration > 0 else 1.0

    target_shots_per_min = (MIN_SHOTS_PER_MIN + MAX_SHOTS_PER_MIN) / 2  # 10
    total_target_shots = int(round(target_duration / 60 * target_shots_per_min))

    # Distribute shots proportionally to act duration
    act_pacing = []
    for act in acts:
        scaled_duration = act["duration_sec"] * scale_factor
        act_shots = max(1, int(round(scaled_duration / 60 * target_shots_per_min)))
        act_pacing.append({
            "act_number": act["act_number"],
            "target_duration_sec": round(scaled_duration, 1),
            "target_shots": act_shots,
        })

    # Adjust to match total
    current_total = sum(a["target_shots"] for a in act_pacing)
    diff = total_target_shots - current_total
    # Add/remove from longest acts first
    sorted_acts = sorted(act_pacing, key=lambda a: a["target_duration_sec"], reverse=True)
    for i in range(abs(diff)):
        idx = i % len(sorted_acts)
        sorted_acts[idx]["target_shots"] += 1 if diff > 0 else -1
        sorted_acts[idx]["target_shots"] = max(1, sorted_acts[idx]["target_shots"])

    return {
        "target_duration": target_duration,
        "total_target_shots": sum(a["target_shots"] for a in act_pacing),
        "shots_per_minute": round(sum(a["target_shots"] for a in act_pacing) / (target_duration / 60), 1),
        "act_pacing": sorted(act_pacing, key=lambda a: a["act_number"]),
    }


def _build_shots(
    act_prompts: dict[str, list[dict]],
    script_acts: list[dict],
    pacing: dict,
    characters: list[dict],
    character_assets: dict | None,
) -> list[dict]:
    """Build the full shot list with reference images and generation groups."""
    shots = []
    seed_base = 3000000

    for act_pace in pacing["act_pacing"]:
        act_num = act_pace["act_number"]
        act_key = f"Act{act_num}"
        target_shots = act_pace["target_shots"]
        target_duration = act_pace["target_duration_sec"]

        # Get existing prompts for this act
        existing_prompts = act_prompts.get(act_key, [])

        # Calculate per-shot duration
        if target_shots > 0:
            per_shot_dur = round(target_duration / target_shots, 1)
            per_shot_dur = max(MIN_SHOT_DURATION, min(MAX_SHOT_DURATION, per_shot_dur))
        else:
            per_shot_dur = DEFAULT_SHOT_DURATION

        for si in range(target_shots):
            shot_idx = si + 1
            shot_id = f"A{act_num:02d}_{shot_idx:02d}"

            # Use existing prompt if available, otherwise generate placeholder
            if si < len(existing_prompts):
                prompt_info = existing_prompts[si]
                prompt_text = prompt_info["prompt"]
                mode = prompt_info["mode"]
            else:
                # Additional shots beyond what's in prompts file
                # Clone last prompt with variation or use generic
                if existing_prompts:
                    base = existing_prompts[-1]
                    prompt_text = base["prompt"]
                    mode = "t2v"
                else:
                    prompt_text = f"{STYLE_BASE} Act {act_num} continuation shot."
                    mode = "t2v"

            # Detect environment and model
            env = _determine_environment(prompt_text)
            if env == "whiteboard":
                model = DEFAULT_MODEL_WAN_T2V
                resolution = WHITEBOARD_RESOLUTION
            else:
                model = DEFAULT_MODEL_HUNYUAN
                resolution = DEFAULT_RESOLUTION

            # Detect characters in this shot
            char_ids = _find_characters_in_prompt(prompt_text, characters)
            primary_char = char_ids[0] if char_ids else "dev_protagonist"

            # Assign reference images from character assets
            reference_images = []
            if character_assets:
                chars_data = character_assets.get("characters", {})
                for cid in char_ids:
                    if cid in chars_data:
                        anchor = chars_data[cid].get("primary_anchor")
                        if anchor:
                            reference_images.append({
                                "path": anchor,
                                "weight": 0.75,
                                "character_id": cid,
                            })

            shot = {
                "shot_id": shot_id,
                "scene": act_key,
                "purpose": f"Act {act_num} shot {shot_idx}",
                "prompt_positive": prompt_text,
                "prompt_negative": CRITICAL_NEGATIVES,
                "duration_sec": per_shot_dur,
                "aspect_ratio": "16:9",
                "resolution": resolution,
                "seed": seed_base + act_num * 100 + si,
                "model": model,
                "mode": mode,
                "input_image": None,
                "output_name": f"A{act_num:02d}_{shot_idx:02d}.mp4",
                "environment": env,
                "characters": char_ids,
                "generation_group": primary_char,
                "reference_images": reference_images,
                "transition_type": "fade" if si == 0 and act_num > 1 else None,
            }
            shots.append(shot)

    return shots


def _apply_generation_order(shots: list[dict]) -> list[dict]:
    """Reorder shots by character group for batch generation consistency.

    Within each group, hero shots (longest duration) come first.
    """
    from collections import defaultdict
    groups: dict[str, list[dict]] = defaultdict(list)

    for shot in shots:
        group = shot.get("generation_group", "unknown")
        groups[group].append(shot)

    # Sort each group: longest duration first (hero shots)
    for group_shots in groups.values():
        group_shots.sort(key=lambda s: s["duration_sec"], reverse=True)

    # Order groups by total shot count (most frequent character first)
    sorted_groups = sorted(groups.items(), key=lambda kv: len(kv[1]), reverse=True)

    ordered = []
    gen_order = 1
    for _group_name, group_shots in sorted_groups:
        for shot in group_shots:
            shot["generation_order"] = gen_order
            gen_order += 1
            ordered.append(shot)

    return ordered


def plan_shots(
    script_path: Path,
    prompts_path: Path,
    characters_path: Path,
    character_assets_path: Path | None,
    target_duration: int,
) -> dict:
    """Main planning function."""
    # Parse inputs
    script_acts = _parse_script_acts(script_path)
    act_prompts = _parse_prompts_file(prompts_path)

    chars_data = json.loads(characters_path.read_text(encoding="utf-8"))
    characters = chars_data.get("characters", [])

    character_assets = None
    if character_assets_path and character_assets_path.exists():
        character_assets = json.loads(character_assets_path.read_text(encoding="utf-8"))

    # Calculate pacing
    pacing = _calculate_pacing(target_duration, script_acts)

    # Build shots
    shots = _build_shots(act_prompts, script_acts, pacing, characters, character_assets)

    # Apply generation order (character batching)
    shots = _apply_generation_order(shots)

    # Calculate total duration
    total_duration = sum(s["duration_sec"] for s in shots)

    # Build manifest
    manifest = {
        "project_id": "phase1_act1_planned",
        "style_lock": f"{STYLE_BASE} Planned manifest, {target_duration}s target.",
        "delivery_target": f"16:9, 480p, ~{target_duration}s total",
        "model_policy": {
            "primary": DEFAULT_MODEL_HUNYUAN,
            "t2v_alt": DEFAULT_MODEL_WAN_T2V,
        },
        "pacing": pacing,
        "total_shots": len(shots),
        "total_duration_sec": total_duration,
        "generation_groups": _summarize_groups(shots),
        "shots": shots,
    }
    return manifest


def _summarize_groups(shots: list[dict]) -> dict:
    """Summarize generation groups for manifest metadata."""
    from collections import Counter
    groups = Counter(s.get("generation_group", "unknown") for s in shots)
    return {k: v for k, v in groups.most_common()}


def main() -> None:
    parser = argparse.ArgumentParser(description="Intelligent shot planner")
    parser.add_argument("--script", type=Path, required=True, help="Script markdown")
    parser.add_argument("--prompts", type=Path, required=True, help="Video prompts markdown")
    parser.add_argument("--characters", type=Path, required=True, help="characters.json")
    parser.add_argument(
        "--character-assets", type=Path, default=None,
        help="character_index.json (from character_sheet_generator.py)",
    )
    parser.add_argument("--target-duration", type=int, default=300, help="Target video duration in seconds")
    parser.add_argument("--output", type=Path, default=None, help="Output manifest path")
    args = parser.parse_args()

    for p, label in [(args.script, "script"), (args.prompts, "prompts"), (args.characters, "characters")]:
        if not p.exists():
            print(f"ERROR: {label} not found: {p}", file=sys.stderr)
            sys.exit(1)

    manifest = plan_shots(
        script_path=args.script,
        prompts_path=args.prompts,
        characters_path=args.characters,
        character_assets_path=args.character_assets,
        target_duration=args.target_duration,
    )

    output_json = json.dumps(manifest, indent=2, ensure_ascii=False)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output_json, encoding="utf-8")
        print(f"[OK] Planned manifest: {manifest['total_shots']} shots, "
              f"{manifest['total_duration_sec']}s → {args.output}")
        print(f"     Pacing: {manifest['pacing']['shots_per_minute']} shots/min")
        print(f"     Groups: {manifest['generation_groups']}")
    else:
        print(output_json)


if __name__ == "__main__":
    main()
