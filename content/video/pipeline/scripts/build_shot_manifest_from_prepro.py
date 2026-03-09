#!/usr/bin/env python3
"""Convert blog preproduction manifest into a Comfy shot manifest."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Sequence


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


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


def _allocate_durations_tts_actual(
    beats: Sequence[Dict[str, Any]],
    lo: float,
    hi: float,
    target: float | None,
    padding_default: float = 0.5,
    padding_min: float = 0.2,
    padding_max: float = 2.0,
) -> List[float]:
    """Allocate shot durations based on actual TTS durations with adaptive padding.

    Each shot = max(actual_duration_sec + padding, lo), clamped to hi.
    Padding adapts if total exceeds or falls short of target.
    """
    actual_durs = [float(b.get("actual_duration_sec", b.get("duration_sec", lo))) for b in beats]

    # First pass: default padding
    durations = [min(hi, max(lo, d + padding_default)) for d in actual_durs]

    if not target or target <= 0:
        return [round(x, 2) for x in durations]

    total = sum(durations)
    overshoot = total - target

    if abs(overshoot) < 1e-6:
        return [round(x, 2) for x in durations]

    # Adaptive padding: shrink if over target, expand if under
    if overshoot > 0:
        # Reduce padding toward padding_min
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
        # Expand padding toward padding_max
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

    # Small balancing pass to approach target while honoring bounds.
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


def _scene_label(idx: int) -> str:
    return f"Scene{math.floor((idx - 1) / 4) + 1}"


def _compose_positive_prompt(text: str, visual_goal: str, camera_style: str, shot_mode: str) -> str:
    motion = "Static camera with gentle micro motion." if shot_mode == "i2v" else "Natural cinematic motion."
    return (
        f"{camera_style} {motion} Minimalist stop-motion claymation, Aardman studio style. "
        "Vast Off-White background, soft matte studio lighting. "
        f"Primary action goal: {visual_goal} "
        f"Narrative reference for action direction: {text} "
        "CRITICAL: NO TEXT, NO LETTERS, NO SUBTITLES, NO WATERMARK, NO LOGO, NO SPEECH BUBBLES. "
        "Character is silent, mouth closed, nonverbal, nonlingual, no lip-sync."
    )


def _short_purpose(text: str, limit: int = 90) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) <= limit:
        return cleaned
    return f"{cleaned[: limit - 3].rstrip()}..."


def main() -> int:
    parser = argparse.ArgumentParser(description="Build Comfy shot manifest from prepro manifest")
    parser.add_argument("--prepro-manifest", required=True, type=Path)
    parser.add_argument("--out-manifest", default=None, type=Path)
    parser.add_argument("--project-id", default=None)
    parser.add_argument("--max-shots", type=int, default=24)
    parser.add_argument("--target-duration-sec", type=float, default=180.0)
    parser.add_argument("--min-shot-sec", type=float, default=3.0)
    parser.add_argument("--max-shot-sec", type=float, default=8.0)
    parser.add_argument("--resolution", default="832x480")
    parser.add_argument("--aspect-ratio", default="16:9")
    parser.add_argument(
        "--mode",
        choices=["i2v", "t2v"],
        default="i2v",
        help="i2v requires keyframes named <shot_id>_keyframe.png unless absolute input_image is provided later",
    )
    parser.add_argument(
        "--model",
        default="hunyuanvideo1.5_480p_i2v_step_distilled_fp8_scaled.safetensors",
    )
    parser.add_argument(
        "--timing-source",
        choices=["estimate", "tts_actual"],
        default="estimate",
        help="estimate: scale raw durations to target. tts_actual: use actual_duration_sec from TTS feedback.",
    )
    parser.add_argument("--tts-padding", type=float, default=0.5, help="Padding after TTS duration (tts_actual mode)")
    parser.add_argument("--tts-padding-min", type=float, default=0.2, help="Min padding (tts_actual mode)")
    parser.add_argument("--tts-padding-max", type=float, default=2.0, help="Max padding (tts_actual mode)")
    parser.add_argument("--seed-base", type=int, default=1300001)
    parser.add_argument(
        "--style-lock",
        default="nonlingual claymation + no text overlays + action-first storytelling",
    )
    parser.add_argument(
        "--delivery-target",
        default="16:9, 480p, short scene clips for YouTube assembly",
    )
    parser.add_argument(
        "--camera-style",
        default="Medium/wide framing, readable silhouette, playful but controlled pacing.",
    )
    parser.add_argument(
        "--prompt-negative",
        default="text, subtitles, watermark, logo, speech bubble, lip-sync, deformed anatomy, low quality",
    )
    args = parser.parse_args()

    if not args.prepro_manifest.exists():
        raise SystemExit(f"[FAIL] prepro manifest not found: {args.prepro_manifest}")
    if args.max_shots < 1:
        raise SystemExit("[FAIL] --max-shots must be >= 1")
    if args.min_shot_sec <= 0 or args.max_shot_sec < args.min_shot_sec:
        raise SystemExit("[FAIL] invalid shot duration bounds")

    prepro = _json_load(args.prepro_manifest)
    beats = prepro.get("beats", [])
    if not beats:
        raise SystemExit("[FAIL] prepro manifest has no beats")

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

    project_id = args.project_id or f"{prepro.get('project_id', 'blog')}_auto"
    shots: List[Dict[str, Any]] = []
    for i, beat in enumerate(selected, start=1):
        shot_id = f"S{i:02d}_{i:02d}"
        text = str(beat.get("text", "")).strip()
        visual_goal = str(beat.get("visual_goal", "")).strip() or "Symbolic clay action with clear emotional intent."
        shots.append(
            {
                "shot_id": shot_id,
                "scene": _scene_label(i),
                "purpose": _short_purpose(text),
                "prompt_positive": _compose_positive_prompt(
                    text=text,
                    visual_goal=visual_goal,
                    camera_style=args.camera_style,
                    shot_mode=args.mode,
                ),
                "prompt_negative": args.prompt_negative,
                "duration_sec": shot_durations[i - 1],
                "aspect_ratio": args.aspect_ratio,
                "resolution": args.resolution,
                "seed": args.seed_base + i - 1,
                "model": args.model,
                "mode": args.mode,
                "input_image": f"{shot_id}_keyframe.png" if args.mode == "i2v" else None,
                "output_name": f"{shot_id}.mp4",
                "source_beat_id": beat.get("beat_id"),
                "source_scene_id": beat.get("scene_id"),
            }
        )

    manifest: Dict[str, Any] = {
        "project_id": project_id,
        "style_lock": args.style_lock,
        "delivery_target": args.delivery_target,
        "model_policy": {"primary": args.model, "fallback": []},
        "shots": shots,
        "source_preproduction": str(args.prepro_manifest),
        "selection_summary": {
            "total_beats": len(beats),
            "selected_beats": len(selected),
            "target_duration_sec": args.target_duration_sec,
            "actual_duration_sec": round(sum(shot_durations), 2),
            "timing_source": args.timing_source,
            "mode": args.mode,
        },
    }

    if args.out_manifest:
        out_manifest = args.out_manifest
    else:
        out_manifest = (
            Path("/mnt/e/vibecode-blog/content/video/pipeline/manifests")
            / f"{project_id}_auto_manifest.json"
        )
    _json_dump(out_manifest, manifest)

    handoff = {
        "project_id": project_id,
        "manifest": str(out_manifest),
        "notes": [
            "If mode=i2v, prepare keyframes named <shot_id>_keyframe.png before render.",
            "Use sync_manifest_keyframes_to_comfy_input.py to copy keyframes into Comfy input.",
        ],
    }
    handoff_path = out_manifest.with_suffix(".handoff.json")
    _json_dump(handoff_path, handoff)

    print(f"[OK] auto shot manifest: {out_manifest}")
    print(f"[OK] selected beats: {len(selected)} / {len(beats)}")
    print(f"[OK] duration sec: {round(sum(shot_durations), 2)}")
    print(f"[OK] handoff: {handoff_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
