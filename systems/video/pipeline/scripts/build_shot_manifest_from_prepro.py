#!/usr/bin/env python3
"""Convert v5 prepro manifest into a v5 shot manifest for ComfyUI pipeline.

Outputs the v5 manifest format matching ep01_shot_manifest_v5.json:
- Header: version "5.0", resolution "1280x720", pipeline spec block
- Shot fields: shot_id (H/P/C/A/O prefix), segment, visual_type, space,
  vee_expression, vee_reaction_number, extended_metaphor, narrator_vo
- Prompts: v3ct0r style trigger word, 2D flat vector (no 3D Pixar references)

Usage:
    python build_shot_manifest_from_prepro.py \
        --prepro-manifest ep01_prepro_manifest.json \
        --character-design ../../assets/characters/vee/character_design_2d.json \
        --out-manifest ep01_shot_manifest_v5.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Sequence


# ---------------------------------------------------------------------------
# Segment prefix mapping for shot IDs
# ---------------------------------------------------------------------------
SEGMENT_PREFIX = {
    "HOOK": "H",
    "PROBLEM": "P",
    "CORE": "C",
    "APPLICATION": "A",
    "OUTRO": "O",
}

# Default pipeline spec (Series Bible v5 D13)
DEFAULT_PIPELINE = {
    "t2i": "Flux dev + SimpleVectorFlux LoRA",
    "edit": "Flux Kontext",
    "i2v": "Wan 2.2 MoE GGUF",
    "tts": "Dia2-1B",
    "bgm": "ACE-Step 1.5",
    "diagrams": "Motion Canvas",
    "assembly": "FFmpeg",
}

# Default negative prompt (from character_design_2d.json)
DEFAULT_NEGATIVE = (
    "3D, photorealistic, gradient, shading, texture, clay, claymation, "
    "fingerprint, detailed, complex, thin lines, realistic hands, fingers, "
    "text, watermark, speech bubble, multiple characters, anime, sketch, rough"
)


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _load_character_prompts(char_design_path: Path | None) -> Dict[str, Any]:
    """Load character design JSON for prompt generation."""
    if char_design_path and char_design_path.exists():
        data = _json_load(char_design_path)
        return data.get("comfyui_prompts", {})
    # Fallback defaults from Series Bible D15
    return {
        "trigger_word": "v3ct0r",
        "lora": "SimpleVectorFlux",
        "positive_base": (
            "v3ct0r style, simple flat vector art, isolated on white bg, "
            "young woman character, bright yellow hoodie, round black glasses, "
            "brown bob hair, warm cream skin, minimal detail, clean design, "
            "character asset, clip art, educational animation character, "
            "friendly approachable design, no gradients, flat color fill, thin outline"
        ),
        "negative_base": DEFAULT_NEGATIVE,
        "expression_prompts": {
            "default": "slight smile, relaxed pose, one hand on hip",
            "curious": "head tilted, eyes wide, leaning forward slightly",
            "frustrated": "hood pulled up over head, arms crossed, hunched",
            "eureka": "both arms raised, eyes wide with star highlight, excited jump",
            "coding_zone": "sitting at desk, leaning forward, half-closed eyes, intense focus",
            "happy": "big smile, pushing glasses up, standing straight with energy",
        },
    }


def _segment_prefix(segment_name: str) -> str:
    """Get shot ID prefix for a segment."""
    return SEGMENT_PREFIX.get(segment_name.upper(), "X")


def _compose_character_prompt(
    visual_goal: str,
    vee_expression: str,
    space: str,
    char_prompts: Dict[str, Any],
) -> str:
    """Compose v3ct0r style prompt for character shots."""
    base = char_prompts.get("positive_base", "v3ct0r style, simple flat vector art")
    expr_prompt = char_prompts.get("expression_prompts", {}).get(vee_expression, "")

    # Space-specific background
    bg_map = {
        "desk": "at desk with glowing monitor, warm room",
        "screen": "dark background, digital interface elements, code",
        "whiteboard": "clean white background, educational diagram space",
        "digital": "clean background, geometric accent shapes",
    }
    bg = bg_map.get(space, "clean background")

    parts = [base]
    if expr_prompt:
        parts.append(expr_prompt)
    parts.append(bg)
    if visual_goal:
        parts.append(visual_goal)
    parts.append("flat color fill, thin outline, clean design, no gradients")

    return ", ".join(parts)


def _compose_diagram_prompt(visual_goal: str, space: str) -> str:
    """Compose v3ct0r style prompt for diagram/motion graphic shots (no characters)."""
    bg_map = {
        "whiteboard": "clean white background",
        "screen": "dark navy background (#0D1B2A)",
        "digital": "clean white background, geometric accent shapes",
        "desk": "warm desk background",
    }
    bg = bg_map.get(space, "clean white background")

    return (
        f"v3ct0r style, simple flat vector art, {bg}, "
        f"{visual_goal}, "
        "bold saturated colors, educational animation, "
        "flat color fill, no gradients"
    )


def _compose_negative_prompt(has_characters: bool, char_prompts: Dict[str, Any]) -> str:
    """Compose negative prompt based on shot type."""
    base_neg = char_prompts.get("negative_base", DEFAULT_NEGATIVE)
    if not has_characters:
        return base_neg + ", characters, people, faces"
    return base_neg


def _allocate_durations_tts_actual(
    beats: Sequence[Dict[str, Any]],
    lo: float,
    hi: float,
    target: float | None,
    padding_default: float = 0.5,
    padding_min: float = 0.2,
    padding_max: float = 2.0,
) -> List[float]:
    """Allocate shot durations based on actual TTS durations with adaptive padding."""
    actual_durs = [float(b.get("actual_duration_sec", b.get("duration_sec", lo))) for b in beats]
    durations = [min(hi, max(lo, d + padding_default)) for d in actual_durs]

    if not target or target <= 0:
        return [round(x, 2) for x in durations]

    total = sum(durations)
    overshoot = total - target

    if abs(overshoot) < 1e-6:
        return [round(x, 2) for x in durations]

    if overshoot > 0:
        for i in range(len(durations)):
            actual = actual_durs[i]
            current_pad = durations[i] - actual
            min_pad = max(padding_min, lo - actual) if actual < lo else padding_min
            reducible = max(0, current_pad - min_pad)
            reduction = min(reducible, overshoot)
            durations[i] -= reduction
            overshoot -= reduction
            if overshoot <= 1e-6:
                break
    else:
        shortfall = -overshoot
        for i in range(len(durations)):
            actual = actual_durs[i]
            current_pad = durations[i] - actual
            expandable = min(padding_max - current_pad, hi - durations[i])
            expansion = min(max(0, expandable), shortfall)
            durations[i] += expansion
            shortfall -= expansion
            if shortfall <= 1e-6:
                break

    return [round(min(hi, max(lo, x)), 2) for x in durations]


def _allocate_durations(raw: Sequence[float], target: float | None, lo: float, hi: float) -> List[float]:
    """Scale raw durations to fit target while respecting bounds."""
    base = [min(hi, max(lo, float(x))) for x in raw]
    if not target or target <= 0:
        return [round(x, 2) for x in base]

    cur = sum(base)
    if cur <= 0:
        return [round(lo, 2) for _ in base]

    scaled = [x * (target / cur) for x in base]
    clamped = [min(hi, max(lo, x)) for x in scaled]
    rem = target - sum(clamped)
    if abs(rem) < 1e-6:
        return [round(x, 2) for x in clamped]

    steps = 0
    while abs(rem) > 1e-6 and steps < 10000:
        steps += 1
        moved = False
        for i in range(len(clamped)):
            if rem > 0 and clamped[i] < hi:
                delta = min(0.01, hi - clamped[i], rem)
                clamped[i] += delta
                rem -= delta
                moved = True
            elif rem < 0 and clamped[i] > lo:
                delta = min(0.01, clamped[i] - lo, -rem)
                clamped[i] -= delta
                rem += delta
                moved = True
            if abs(rem) <= 1e-6:
                break
        if not moved:
            break
    return [round(x, 2) for x in clamped]


def _pick_even_indices(total: int, take: int) -> List[int]:
    if take >= total:
        return list(range(total))
    if take <= 1:
        return [0]
    out = sorted({int(round(i * (total - 1) / (take - 1))) for i in range(take)})
    while len(out) < take:
        for i in range(total):
            if i not in out:
                out.append(i)
                if len(out) == take:
                    break
    return sorted(out[:take])


def _short_purpose(text: str, limit: int = 90) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) <= limit:
        return cleaned
    return f"{cleaned[:limit - 3].rstrip()}..."


def _infer_vee_expression(beat: Dict[str, Any]) -> str | None:
    """Infer Vee expression from beat data."""
    # Direct field
    expr = beat.get("vee_expression")
    if expr and expr != "default":
        return expr

    # From dialogue emotion
    for dlg in beat.get("dialogue", []):
        emotion = dlg.get("emotion", "")
        if emotion:
            # Map common narration emotions to Vee expressions
            emotion_map = {
                "curious": "curious",
                "wonder": "curious",
                "frustrated": "frustrated",
                "angry": "frustrated",
                "eureka": "eureka",
                "excited": "eureka",
                "happy": "happy",
                "joy": "happy",
                "focused": "coding_zone",
                "determined": "coding_zone",
            }
            mapped = emotion_map.get(emotion.lower())
            if mapped:
                return mapped

    return beat.get("vee_expression", "default")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build v5 shot manifest from prepro manifest")
    parser.add_argument("--prepro-manifest", required=True, type=Path)
    parser.add_argument("--out-manifest", default=None, type=Path)
    parser.add_argument("--character-design", default=None, type=Path,
                        help="Path to character_design_2d.json for prompt templates")
    parser.add_argument("--project-id", default=None)
    parser.add_argument("--max-shots", type=int, default=30)
    parser.add_argument("--target-duration-sec", type=float, default=210.0)
    parser.add_argument("--min-shot-sec", type=float, default=2.0)
    parser.add_argument("--max-shot-sec", type=float, default=18.0)
    parser.add_argument("--resolution", default="1280x720")
    parser.add_argument("--aspect-ratio", default="16:9")
    parser.add_argument(
        "--mode",
        choices=["i2v", "t2v", "t2i"],
        default="i2v",
        help="Primary generation mode",
    )
    parser.add_argument(
        "--timing-source",
        choices=["estimate", "tts_actual"],
        default="estimate",
    )
    parser.add_argument("--tts-padding", type=float, default=0.5)
    parser.add_argument("--tts-padding-min", type=float, default=0.2)
    parser.add_argument("--tts-padding-max", type=float, default=2.0)
    parser.add_argument("--seed-base", type=int, default=1500001)
    args = parser.parse_args()

    if not args.prepro_manifest.exists():
        raise SystemExit(f"[FAIL] prepro manifest not found: {args.prepro_manifest}")

    prepro = _json_load(args.prepro_manifest)
    beats = prepro.get("beats", [])
    if not beats:
        raise SystemExit("[FAIL] prepro manifest has no beats")

    # Load character design prompts
    char_prompts = _load_character_prompts(args.character_design)

    take = min(len(beats), args.max_shots)
    pick_idx = _pick_even_indices(len(beats), take)
    selected = [beats[i] for i in pick_idx]

    if args.timing_source == "tts_actual":
        shot_durations = _allocate_durations_tts_actual(
            beats=selected,
            lo=args.min_shot_sec,
            hi=args.max_shot_sec,
            target=args.target_duration_sec,
            padding_default=args.tts_padding,
            padding_min=args.tts_padding_min,
            padding_max=args.tts_padding_max,
        )
    else:
        raw_durations = [float(b.get("duration_sec", args.min_shot_sec)) for b in selected]
        shot_durations = _allocate_durations(
            raw=raw_durations,
            target=args.target_duration_sec,
            lo=args.min_shot_sec,
            hi=args.max_shot_sec,
        )

    project_id = args.project_id or f"{prepro.get('project_id', 'blog')}_v5"

    # Track shot counts per segment for ID numbering
    seg_counters: Dict[str, int] = {}
    shots: List[Dict[str, Any]] = []

    for i, beat in enumerate(selected):
        segment = beat.get("segment", beat.get("narrative_stage", "CORE")).upper()
        prefix = _segment_prefix(segment)

        # Increment per-segment counter
        seg_counters[prefix] = seg_counters.get(prefix, 0) + 1
        shot_id = f"{prefix}{seg_counters[prefix]:02d}"

        text = str(beat.get("text", "")).strip()
        visual_goal = str(beat.get("visual_goal", "")).strip() or text
        visual_type = str(beat.get("visual_type", "character_reaction"))
        space = str(beat.get("space", "desk"))
        characters = beat.get("characters", [])
        narrator_vo = str(beat.get("narrator_vo", beat.get("narration_text", text)))
        vee_expression = _infer_vee_expression(beat)
        vee_reaction_number = beat.get("vee_reaction_number")
        extended_metaphor = bool(beat.get("extended_metaphor", False))
        shorts_candidate = bool(beat.get("shorts_candidate", False))

        has_vee = "vee" in characters
        has_characters = len(characters) > 0

        # Compose prompts based on visual type
        if visual_type in ("diagram", "motion_graphic") and not has_characters:
            prompt_positive = _compose_diagram_prompt(visual_goal, space)
        elif has_vee:
            prompt_positive = _compose_character_prompt(
                visual_goal, vee_expression or "default", space, char_prompts,
            )
        else:
            prompt_positive = _compose_diagram_prompt(visual_goal, space)

        prompt_negative = _compose_negative_prompt(has_characters, char_prompts)

        shot: Dict[str, Any] = {
            "shot_id": shot_id,
            "segment": segment,
            "visual_type": visual_type,
            "space": space,
            "description": _short_purpose(visual_goal, 200),
            "narrator_vo": narrator_vo,
            "characters": characters,
            "vee_expression": vee_expression if has_vee else None,
            "vee_reaction_number": vee_reaction_number,
            "extended_metaphor": extended_metaphor,
            "shorts_candidate": shorts_candidate,
            "duration_sec": shot_durations[i],
            "prompt_positive": prompt_positive,
            "prompt_negative": prompt_negative,
            "seed": args.seed_base + i,
            "input_image": f"{shot_id}_keyframe.png",
            "output_name": f"{shot_id}.mp4",
        }
        shots.append(shot)

    manifest: Dict[str, Any] = {
        "project_id": project_id,
        "version": "5.0",
        "style_lock": "2D flat vector Level 2.5 + narrator V.O. only + Vee silent",
        "delivery_target": f"16:9, {args.resolution}, YouTube",
        "resolution": args.resolution,
        "pipeline": DEFAULT_PIPELINE,
        "shots": shots,
        "source_preproduction": str(args.prepro_manifest),
        "selection_summary": {
            "total_beats": len(beats),
            "selected_beats": len(selected),
            "target_duration_sec": args.target_duration_sec,
            "actual_duration_sec": round(sum(shot_durations), 2),
            "timing_source": args.timing_source,
        },
    }

    if args.out_manifest:
        out_manifest = args.out_manifest
    else:
        out_manifest = (
            Path(__file__).resolve().parent.parent / "manifests"
            / f"{project_id}_shot_manifest_v5.json"
        )
    _json_dump(out_manifest, manifest)

    handoff = {
        "project_id": project_id,
        "version": "5.0",
        "manifest": str(out_manifest),
        "notes": [
            "v5 format: 2D flat vector, v3ct0r LoRA trigger, 1280x720.",
            "Segment prefixes: H=HOOK, P=PROBLEM, C=CORE, A=APPLICATION, O=OUTRO.",
            "T2I keyframes: Flux dev + SimpleVectorFlux LoRA.",
            "Character edits: Flux Kontext (golden reference based).",
            "I2V animation: Wan 2.2 MoE GGUF.",
            "Diagrams go to Motion Canvas, not I2V.",
        ],
    }
    handoff_path = out_manifest.with_suffix(".handoff.json")
    _json_dump(handoff_path, handoff)

    print(f"[OK] v5 shot manifest: {out_manifest}")
    print(f"[OK] selected beats: {len(selected)} / {len(beats)}")
    print(f"[OK] duration sec: {round(sum(shot_durations), 2)}")
    print(f"[OK] resolution: {args.resolution}")
    # Segment summary
    for prefix_name, prefix_char in SEGMENT_PREFIX.items():
        count = seg_counters.get(prefix_char, 0)
        if count > 0:
            print(f"  {prefix_name}: {count} shots ({prefix_char}01-{prefix_char}{count:02d})")
    print(f"[OK] handoff: {handoff_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
