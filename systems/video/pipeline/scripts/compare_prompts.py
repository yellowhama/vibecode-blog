#!/usr/bin/env python3
"""Compare prompt quality across multiple shot manifests.

Evaluates i2v shots on 5 axes:
1. Prompt Diversity — Jaccard distance between prompts
2. Style Consistency — trigger word + banned word check
3. Context Awareness — expression match + segment mood colors
4. Camera Variety — distinct camera specifications
5. Motion Specificity — concrete motion verbs

Usage:
    python compare_prompts.py \
        --baseline ep01_shot_manifest_v9.json \
        --method-a ep01_shot_manifest_v9_promptA_claude.json \
        --method-b ep01_shot_manifest_v9_promptB_7b.json \
        --method-c ep01_shot_manifest_v9_promptC_14b.json \
        --output ep01_prompt_comparison_report.md
"""

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

BANNED_WORDS = [
    "3d", "photorealistic", "gradient", "shading", "texture", "clay",
    "claymation", "anime", "sketch", "realistic", "render", "octane",
    "unreal", "blender", "cinema4d", "raytracing", "subsurface",
]

CAMERA_TERMS = [
    "close-up", "medium close-up", "medium shot", "wide shot",
    "bird's eye", "top-down", "over-the-shoulder", "low angle",
    "high angle", "side angle", "three-quarter", "front-facing",
    "centered", "rule of thirds", "off-center",
]

MOTION_VERBS = [
    "lean", "tilt", "nod", "turn", "swivel", "blink", "widen",
    "narrow", "scan", "type", "tap", "reach", "lift", "drop",
    "slump", "gesture", "point", "shift", "pull", "push", "write",
    "place", "press", "shake",
]

SEGMENT_MOOD_COLORS = {
    "HOOK": ["#FFD93D", "#FF9F43", "yellow", "orange", "warm", "amber"],
    "MISCONCEPTION": ["#4A90D9", "#9CA3AF", "blue", "grey", "cool", "muted", "navy"],
    "THE_CRACK": ["#EF4444", "#FF6B35", "red", "orange", "tension", "dramatic"],
    "CORE": ["balanced", "white", "cream", "clean", "educational"],
    "REFRAME": ["#F59E0B", "gold", "amber", "warm", "bright"],
    "OUTRO_CTA": ["#FFD93D", "vibrant", "bright", "yellow", "full palette"],
}


def _load_manifest(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _i2v_shots(manifest: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [s for s in manifest["shots"] if s["render_method"] == "i2v"]


def _jaccard(a: str, b: str) -> float:
    sa = set(a.lower().split(", "))
    sb = set(b.lower().split(", "))
    if not sa and not sb:
        return 0.0
    return 1.0 - len(sa & sb) / len(sa | sb)


def _avg_pairwise_jaccard(prompts: List[str]) -> float:
    n = len(prompts)
    if n < 2:
        return 0.0
    total = 0.0
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            total += _jaccard(prompts[i], prompts[j])
            count += 1
    return total / count


def _count_banned(text: str) -> int:
    lower = text.lower()
    count = 0
    for w in BANNED_WORDS:
        if w in lower:
            # Exclude negated forms like "no gradients"
            idx = lower.find(w)
            prefix = lower[max(0, idx - 3):idx].strip()
            if prefix.endswith("no"):
                continue
            count += 1
    return count


def _has_trigger(text: str) -> bool:
    return text.lower().startswith("v3ct0r")


def _count_camera_terms(text: str) -> List[str]:
    lower = text.lower()
    return [t for t in CAMERA_TERMS if t in lower]


def _count_motion_verbs(text: str) -> List[str]:
    lower = text.lower()
    return [v for v in MOTION_VERBS if v in lower]


def _segment_mood_match(prompt: str, segment: str) -> bool:
    lower = prompt.lower()
    colors = SEGMENT_MOOD_COLORS.get(segment, [])
    return any(c.lower() in lower for c in colors)


def evaluate_method(
    shots: List[Dict[str, Any]], label: str
) -> Dict[str, Any]:
    prompts = [s["prompt_positive"] for s in shots]

    # 1. Diversity
    diversity = round(_avg_pairwise_jaccard(prompts), 3)

    # 2. Style consistency
    trigger_rate = sum(1 for p in prompts if _has_trigger(p)) / len(prompts)
    banned_total = sum(_count_banned(p) for p in prompts)

    # 3. Context awareness
    mood_matches = sum(
        1 for s in shots
        if _segment_mood_match(s["prompt_positive"], s["segment"])
    )
    mood_rate = mood_matches / len(shots)

    # 4. Camera variety
    all_cameras = set()
    camera_shots = 0
    for s in shots:
        cam = s.get("camera", "") or ""
        prompt_cam = _count_camera_terms(s["prompt_positive"] + " " + cam)
        all_cameras.update(prompt_cam)
        if prompt_cam:
            camera_shots += 1
    camera_variety = len(all_cameras)
    camera_rate = camera_shots / len(shots)

    # 5. Motion specificity
    motion_shots = 0
    all_motions = set()
    for s in shots:
        mot = s.get("motion", "") or ""
        motion_verbs = _count_motion_verbs(s["prompt_positive"] + " " + mot)
        all_motions.update(motion_verbs)
        if motion_verbs:
            motion_shots += 1
    motion_variety = len(all_motions)
    motion_rate = motion_shots / len(shots)

    # Avg prompt length (tokens, comma-separated)
    avg_tokens = round(sum(len(p.split(", ")) for p in prompts) / len(prompts), 1)

    return {
        "label": label,
        "diversity": diversity,
        "trigger_rate": round(trigger_rate, 2),
        "banned_total": banned_total,
        "mood_rate": round(mood_rate, 2),
        "camera_variety": camera_variety,
        "camera_rate": round(camera_rate, 2),
        "motion_variety": motion_variety,
        "motion_rate": round(motion_rate, 2),
        "avg_tokens": avg_tokens,
    }


def generate_report(
    baseline_path: Path,
    methods: List[Tuple[str, Path]],
    output_path: Path,
) -> None:
    baseline = _load_manifest(baseline_path)
    baseline_shots = _i2v_shots(baseline)
    base_eval = evaluate_method(baseline_shots, "Baseline (v9 template)")

    evals = [base_eval]
    method_shots = {}
    for label, path in methods:
        m = _load_manifest(path)
        shots = _i2v_shots(m)
        method_shots[label] = shots
        evals.append(evaluate_method(shots, label))

    lines = [
        "# EP01 Prompt Comparison Report",
        "",
        f"Baseline: `{baseline_path.name}` | Methods: {len(methods)}",
        f"i2v shots evaluated: {len(baseline_shots)}",
        "",
        "## Summary",
        "",
        "| Metric | " + " | ".join(e["label"] for e in evals) + " |",
        "|--------|" + "|".join("-----" for _ in evals) + "|",
    ]

    metrics = [
        ("Diversity (Jaccard avg)", "diversity", True),
        ("Trigger word rate", "trigger_rate", True),
        ("Banned words total", "banned_total", False),
        ("Mood color match rate", "mood_rate", True),
        ("Camera terms (distinct)", "camera_variety", True),
        ("Camera coverage rate", "camera_rate", True),
        ("Motion verbs (distinct)", "motion_variety", True),
        ("Motion coverage rate", "motion_rate", True),
        ("Avg prompt tokens", "avg_tokens", None),
    ]

    for name, key, higher_better in metrics:
        vals = [e[key] for e in evals]
        # Find best
        if higher_better is True:
            best_val = max(vals)
        elif higher_better is False:
            best_val = min(vals)
        else:
            best_val = None

        cells = []
        for v in vals:
            s = str(v)
            if best_val is not None and v == best_val and len(evals) > 1:
                s = f"**{v}**"
            cells.append(s)
        lines.append(f"| {name} | " + " | ".join(cells) + " |")

    lines.extend(["", "## Shot-by-Shot Comparison", ""])

    shot_ids = [s["shot_id"] for s in baseline_shots]
    for sid in shot_ids:
        lines.append(f"### {sid}")
        lines.append("")
        for ev_label, ev_path in [("Baseline", baseline_path)] + methods:
            if ev_label == "Baseline":
                m = baseline
            else:
                m = _load_manifest(ev_path)
            shot = next((s for s in m["shots"] if s["shot_id"] == sid), None)
            if not shot:
                continue
            prompt = shot["prompt_positive"][:120]
            camera = shot.get("camera", "—") or "—"
            motion = shot.get("motion", "—") or "—"
            color = shot.get("color_mood", "—") or "—"
            lines.append(f"**{ev_label}**:")
            lines.append(f"- Prompt: `{prompt}...`")
            lines.append(f"- Camera: {camera}")
            lines.append(f"- Motion: {motion}")
            lines.append(f"- Color: {color}")
            lines.append("")

    # Winner summary
    lines.extend(["## Winner by Metric", ""])
    for name, key, higher_better in metrics:
        if higher_better is None:
            continue
        vals = [(e["label"], e[key]) for e in evals]
        if higher_better:
            winner = max(vals, key=lambda x: x[1])
        else:
            winner = min(vals, key=lambda x: x[1])
        lines.append(f"- **{name}**: {winner[0]} ({winner[1]})")

    lines.extend(["", "---", f"Generated by `compare_prompts.py`", ""])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Report: {output_path} ({len(lines)} lines)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare prompt quality across manifests")
    parser.add_argument("--baseline", required=True, type=Path)
    parser.add_argument("--method-a", type=Path, default=None)
    parser.add_argument("--method-b", type=Path, default=None)
    parser.add_argument("--method-c", type=Path, default=None)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    methods = []
    if args.method_a and args.method_a.exists():
        methods.append(("A: Claude", args.method_a))
    if args.method_b and args.method_b.exists():
        methods.append(("B: Ollama 7b", args.method_b))
    if args.method_c and args.method_c.exists():
        methods.append(("C: Ollama 14b", args.method_c))

    if not methods:
        print("[WARN] No method manifests found, only evaluating baseline")

    generate_report(args.baseline, methods, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
