#!/usr/bin/env python3
"""QA correction agent: diagnoses failed shots and auto-corrects prompts.

Reads evaluation results, classifies failure patterns, applies targeted
prompt corrections, and triggers re-renders for failed shots only.
Maximum 3 correction attempts per shot before escalating to NEEDS_HUMAN_REVIEW.

Usage:
    python qa_correction_agent.py \
        --evaluations output/renders/<run_dir>/evaluations_summary.json \
        --manifest pipeline/manifests/phase1_act1_planned.json \
        --output pipeline/manifests/phase1_act1_corrected.json \
        [--re-render --server http://127.0.0.1:8188 --workflow ... --bindings ...]
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Failure pattern classification
# ---------------------------------------------------------------------------
FAILURE_PATTERNS = {
    "hallucination": {
        "keywords": ["hallucination", "text visible", "watermark", "logo", "speech bubble", "subtitle"],
        "correction": "strengthen_negative",
        "description": "Model generated unwanted elements (text, watermarks, extra objects)",
    },
    "missing_element": {
        "keywords": ["missing", "not present", "absent", "lacks", "no visible"],
        "correction": "strengthen_positive",
        "description": "Required element not generated (character, prop, action)",
    },
    "style_mismatch": {
        "keywords": ["style", "not claymation", "photorealistic", "cgi", "smooth", "plastic"],
        "correction": "reinforce_style",
        "description": "Output doesn't match claymation style",
    },
    "expression_wrong": {
        "keywords": ["expression", "emotion", "face", "eyes", "mouth", "frown", "smile"],
        "correction": "fix_expression",
        "description": "Character expression doesn't match prompt",
    },
    "costume_wrong": {
        "keywords": ["costume", "clothing", "hoodie", "outfit", "wearing", "pants", "blue"],
        "correction": "fix_costume",
        "description": "Character clothing/appearance doesn't match",
    },
    "composition_wrong": {
        "keywords": ["composition", "framing", "camera", "angle", "position", "layout"],
        "correction": "fix_composition",
        "description": "Shot framing or composition is wrong",
    },
    "motion_wrong": {
        "keywords": ["motion", "movement", "action", "animation", "static", "frozen"],
        "correction": "fix_motion",
        "description": "Motion/action doesn't match prompt description",
    },
}

# Correction strategies
NEGATIVE_REINFORCEMENTS = {
    "hallucination": (
        ", absolutely no text of any kind, no letters, no numbers, no symbols, "
        "no watermarks, no logos, no speech bubbles, no UI elements"
    ),
}

STYLE_REINFORCEMENT = (
    "MANDATORY STYLE: Stop-motion claymation with visible clay fingerprint textures, "
    "Aardman studio quality, matte finish, soft studio lighting. "
    "NOT photorealistic, NOT CGI, NOT smooth plastic. "
)

IPADAPTER_WEIGHT_BUMP = 0.1  # from 0.75 → 0.85 on style mismatch


def classify_failure(evaluation: dict) -> list[dict]:
    """Classify evaluation feedback into failure patterns."""
    feedback = evaluation.get("feedback", "").lower()
    failed_metrics = [m.lower() for m in evaluation.get("failed_metrics", [])]
    combined = feedback + " " + " ".join(failed_metrics)

    matches = []
    for pattern_id, pattern in FAILURE_PATTERNS.items():
        if any(kw in combined for kw in pattern["keywords"]):
            matches.append({
                "pattern": pattern_id,
                "correction": pattern["correction"],
                "description": pattern["description"],
            })

    # Default: if no specific pattern matched, classify as general
    if not matches:
        matches.append({
            "pattern": "general",
            "correction": "strengthen_positive",
            "description": "General quality failure — reinforce positive prompt",
        })

    return matches


def apply_correction(shot: dict, failures: list[dict], attempt: int) -> dict:
    """Apply targeted corrections to a shot based on failure patterns."""
    corrected = copy.deepcopy(shot)
    corrections_applied = []

    for failure in failures:
        correction_type = failure["correction"]

        if correction_type == "strengthen_negative":
            # Add stronger negative keywords
            neg = corrected["prompt_negative"]
            reinforcement = NEGATIVE_REINFORCEMENTS.get(failure["pattern"], "")
            if reinforcement and reinforcement not in neg:
                corrected["prompt_negative"] = neg + reinforcement
                corrections_applied.append(f"negative_reinforced:{failure['pattern']}")

        elif correction_type == "strengthen_positive":
            # Emphasize key elements by adding EMPHASIS markers
            pos = corrected["prompt_positive"]
            if "CRITICAL:" not in pos[:50]:
                corrected["prompt_positive"] = f"CRITICAL REQUIREMENT: {pos}"
                corrections_applied.append("positive_emphasized")

        elif correction_type == "reinforce_style":
            # Prepend style reinforcement
            pos = corrected["prompt_positive"]
            if STYLE_REINFORCEMENT not in pos:
                corrected["prompt_positive"] = STYLE_REINFORCEMENT + pos
                corrections_applied.append("style_reinforced")
            # Bump IP-Adapter weight if reference images exist
            refs = corrected.get("reference_images", [])
            for ref in refs:
                if isinstance(ref, dict):
                    old_w = ref.get("weight", 0.75)
                    ref["weight"] = min(1.0, old_w + IPADAPTER_WEIGHT_BUMP)
                    corrections_applied.append(f"ipadapter_weight:{old_w}→{ref['weight']}")

        elif correction_type == "fix_expression":
            # Replace vague expression terms with explicit ones
            pos = corrected["prompt_positive"]
            # Add explicit expression override at the end
            pos += " The character's facial expression must exactly match the described emotion."
            corrected["prompt_positive"] = pos
            corrections_applied.append("expression_explicit")

        elif correction_type == "fix_costume":
            # Reinforce costume description
            pos = corrected["prompt_positive"]
            if "cocoa brown hoodie" not in pos.lower() and "hoodie" in pos.lower():
                pos = pos.replace("hoodie", "muted cocoa brown (#5D4037) hoodie")
                corrected["prompt_positive"] = pos
                corrections_applied.append("costume_color_explicit")

        elif correction_type == "fix_composition":
            # Add explicit framing note
            pos = corrected["prompt_positive"]
            pos += " Camera framing and composition must match the described shot type exactly."
            corrected["prompt_positive"] = pos
            corrections_applied.append("composition_explicit")

        elif correction_type == "fix_motion":
            # Emphasize motion
            pos = corrected["prompt_positive"]
            pos += " All described movements and actions must be clearly visible in the animation."
            corrected["prompt_positive"] = pos
            corrections_applied.append("motion_explicit")

    # On attempt 2+, also change seed for variety
    if attempt >= 2:
        corrected["seed"] = corrected.get("seed", 0) + attempt * 1000
        corrections_applied.append(f"seed_shifted:+{attempt * 1000}")

    # Record correction metadata
    corrected["_correction"] = {
        "attempt": attempt,
        "corrections": corrections_applied,
        "failure_patterns": [f["pattern"] for f in failures],
        "timestamp": datetime.now().isoformat(),
    }

    return corrected


def process_evaluations(
    evaluations_path: Path,
    manifest_path: Path,
    max_attempts: int = 3,
) -> dict:
    """Process evaluation results and generate corrected manifest.

    Returns dict with corrected_shots, passed_shots, needs_review_shots.
    """
    evals = json.loads(evaluations_path.read_text(encoding="utf-8"))
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    # Build shot lookup
    shot_lookup = {s["shot_id"]: s for s in manifest["shots"]}

    passed = []
    corrected = []
    needs_review = []

    for shot_eval in evals.get("shots", []):
        shot_id = shot_eval["shot_id"]
        status = shot_eval.get("status", "FAIL")

        if status == "PASS":
            if shot_id in shot_lookup:
                passed.append(shot_lookup[shot_id])
            continue

        # Load detailed evaluation
        eval_file = shot_eval.get("evaluation_file")
        detailed_eval = {}
        if eval_file:
            eval_path = Path(eval_file)
            if eval_path.exists():
                detailed_eval = json.loads(eval_path.read_text(encoding="utf-8"))

        if shot_id not in shot_lookup:
            needs_review.append({"shot_id": shot_id, "reason": "shot not found in manifest"})
            continue

        shot = shot_lookup[shot_id]

        # Check previous correction attempts
        prev_attempts = shot.get("_correction", {}).get("attempt", 0)
        if prev_attempts >= max_attempts:
            needs_review.append({
                "shot_id": shot_id,
                "reason": f"max_attempts_exceeded ({max_attempts})",
                "last_score": detailed_eval.get("score"),
                "failure_patterns": detailed_eval.get("failed_metrics", []),
            })
            continue

        # Classify and correct
        failures = classify_failure(detailed_eval)
        attempt = prev_attempts + 1
        corrected_shot = apply_correction(shot, failures, attempt)
        corrected.append(corrected_shot)

    return {
        "passed": passed,
        "corrected": corrected,
        "needs_review": needs_review,
        "summary": {
            "total_evaluated": len(evals.get("shots", [])),
            "passed": len(passed),
            "corrected": len(corrected),
            "needs_human_review": len(needs_review),
        },
    }


def build_correction_manifest(
    original_manifest: dict,
    correction_result: dict,
) -> dict:
    """Build a manifest containing only corrected shots for re-rendering."""
    manifest = copy.deepcopy(original_manifest)
    manifest["project_id"] = manifest.get("project_id", "unknown") + "_corrected"
    manifest["shots"] = correction_result["corrected"]
    manifest["_correction_metadata"] = {
        "timestamp": datetime.now().isoformat(),
        "summary": correction_result["summary"],
        "needs_human_review": correction_result["needs_review"],
    }
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="QA correction agent for failed video shots")
    parser.add_argument(
        "--evaluations", type=Path, required=True,
        help="Path to evaluations_summary.json",
    )
    parser.add_argument(
        "--manifest", type=Path, required=True,
        help="Path to original manifest",
    )
    parser.add_argument(
        "--output", type=Path, default=None,
        help="Output path for corrected manifest",
    )
    parser.add_argument(
        "--max-attempts", type=int, default=3,
        help="Max correction attempts per shot (default: 3)",
    )
    parser.add_argument(
        "--re-render", action="store_true",
        help="Automatically re-render corrected shots",
    )
    parser.add_argument("--server", default="http://127.0.0.1:8188", help="ComfyUI server")
    parser.add_argument("--workflow", type=Path, default=None, help="ComfyUI workflow")
    parser.add_argument("--bindings", type=Path, default=None, help="Workflow bindings")
    parser.add_argument("--output-root", type=Path, default=None, help="Render output directory")
    args = parser.parse_args()

    if not args.evaluations.exists():
        print(f"ERROR: evaluations not found: {args.evaluations}", file=sys.stderr)
        sys.exit(1)
    if not args.manifest.exists():
        print(f"ERROR: manifest not found: {args.manifest}", file=sys.stderr)
        sys.exit(1)

    # Process evaluations
    original_manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    result = process_evaluations(args.evaluations, args.manifest, args.max_attempts)

    print(f"[QA] Evaluation results:")
    print(f"     Passed: {result['summary']['passed']}")
    print(f"     Corrected: {result['summary']['corrected']}")
    print(f"     Needs review: {result['summary']['needs_human_review']}")

    if not result["corrected"]:
        if result["summary"]["passed"] == result["summary"]["total_evaluated"]:
            print("[OK] All shots passed! No corrections needed.")
        else:
            print("[WARN] No correctable shots. All failures need human review.")
        if result["needs_review"]:
            print("\n[NEEDS_HUMAN_REVIEW]:")
            for nr in result["needs_review"]:
                print(f"  - {nr['shot_id']}: {nr['reason']}")
        return

    # Build corrected manifest
    corrected_manifest = build_correction_manifest(original_manifest, result)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            json.dumps(corrected_manifest, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"\n[OK] Corrected manifest: {len(corrected_manifest['shots'])} shots → {args.output}")

    # Correction log
    log = {
        "timestamp": datetime.now().isoformat(),
        "evaluations_source": str(args.evaluations),
        "manifest_source": str(args.manifest),
        "corrections": [
            {
                "shot_id": s["shot_id"],
                "attempt": s.get("_correction", {}).get("attempt"),
                "corrections": s.get("_correction", {}).get("corrections", []),
                "failure_patterns": s.get("_correction", {}).get("failure_patterns", []),
            }
            for s in result["corrected"]
        ],
        "needs_human_review": result["needs_review"],
        "summary": result["summary"],
    }

    if args.output:
        log_path = args.output.parent / f"correction_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        log_path.write_text(json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[OK] Correction log → {log_path}")

    # Auto re-render if requested
    if args.re-render and args.output:
        print(f"\n[RENDER] Re-rendering {len(corrected_manifest['shots'])} corrected shots...")
        scripts_dir = Path(__file__).resolve().parent
        video_dir = scripts_dir.parent.parent

        render_cmd = [
            sys.executable,
            str(video_dir / "scripts" / "comfy_batch_render.py"),
            "--manifest", str(args.output),
        ]
        if args.workflow:
            render_cmd.extend(["--workflow", str(args.workflow)])
        if args.bindings:
            render_cmd.extend(["--bindings", str(args.bindings)])
        if args.output_root:
            render_cmd.extend(["--output-root", str(args.output_root)])
        render_cmd.extend(["--server", args.server, "--force-render"])

        result = subprocess.run(render_cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("[OK] Re-render completed successfully")
        else:
            print(f"[FAIL] Re-render failed (code {result.returncode})")
            if result.stderr:
                print(result.stderr[-500:])

    if result["needs_review"]:
        print(f"\n[NEEDS_HUMAN_REVIEW] {len(result['needs_review'])} shots require manual review:")
        for nr in result["needs_review"]:
            print(f"  - {nr['shot_id']}: {nr['reason']}")


if __name__ == "__main__":
    main()
