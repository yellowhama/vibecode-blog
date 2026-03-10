#!/usr/bin/env python3
"""Project Profile: persistent knowledge store for the video production pipeline.

The project profile serves as the pipeline's "system prompt" — a single JSON file
that accumulates render QA learnings, prompt rules, character-specific fixes, and
proven configs. Every pipeline script can read from it, and QA scripts auto-update it.

Location: pipeline/learning/project_profile.json
"""

from __future__ import annotations

import json
import re
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any


PROFILE_SCHEMA = "project_profile_v1"

DEFAULT_PROFILE_PATH = Path(
    "/mnt/e/vibecode-blog/content/video/pipeline/learning/project_profile.json"
)


# ---------------------------------------------------------------------------
# Load / Save
# ---------------------------------------------------------------------------

def load_profile(path: Path | None = None) -> dict[str, Any]:
    """Load profile from JSON. Returns empty skeleton if file doesn't exist."""
    path = path or DEFAULT_PROFILE_PATH
    if not path.exists():
        return _empty_profile()
    with path.open("r", encoding="utf-8") as f:
        profile = json.load(f)
    if profile.get("$schema") != PROFILE_SCHEMA:
        raise ValueError(f"Unknown profile schema: {profile.get('$schema')}")
    return profile


def save_profile(profile: dict[str, Any], path: Path | None = None) -> None:
    """Atomically save profile (write tmp → rename). Bumps version and timestamp."""
    path = path or DEFAULT_PROFILE_PATH
    profile["$schema"] = PROFILE_SCHEMA
    profile["version"] = profile.get("version", 0) + 1
    profile["updated_at"] = datetime.now().isoformat()
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)
    tmp.replace(path)


def _empty_profile() -> dict[str, Any]:
    return {
        "$schema": PROFILE_SCHEMA,
        "project_id": "",
        "updated_at": datetime.now().isoformat(),
        "version": 0,
        "baseline_config": {},
        "prompt_rules": {
            "always_include": [],
            "always_exclude": [],
            "anti_patterns": [],
        },
        "character_rules": {},
        "scene_type_rules": {},
        "failure_patterns": [],
        "config_history": [],
    }


# ---------------------------------------------------------------------------
# Read helpers (for shot_planner, qa_correction_agent)
# ---------------------------------------------------------------------------

def get_baseline_config(profile: dict) -> dict[str, Any]:
    """Return baseline config dict (model, steps, cfg, etc.)."""
    return profile.get("baseline_config", {})


def get_prompt_rules_for_shot(
    profile: dict, shot: dict
) -> tuple[str, str]:
    """Return (additional_positive, additional_negative) for a shot.

    Aggregates:
    1. Global always_include / always_exclude
    2. Character-specific modifiers for detected characters
    3. Scene-type modifiers for the shot's environment
    """
    rules = profile.get("prompt_rules", {})
    add_pos_parts: list[str] = []
    add_neg_parts: list[str] = []

    # Global rules
    for rule in rules.get("always_include", []):
        if rule.get("target") == "positive":
            add_pos_parts.append(rule["text"])
        elif rule.get("target") == "negative":
            add_neg_parts.append(rule["text"])

    for rule in rules.get("always_exclude", []):
        if rule.get("target") == "negative":
            add_neg_parts.append(rule["text"])

    # Character rules
    char_rules = profile.get("character_rules", {})
    for cid in shot.get("characters", []):
        cr = char_rules.get(cid, {})
        add_pos_parts.extend(cr.get("positive_modifiers", []))
        add_neg_parts.extend(cr.get("negative_modifiers", []))

    # Scene-type rules
    env = shot.get("environment", "")
    scene_rules = profile.get("scene_type_rules", {}).get(env, {})
    add_pos_parts.extend(scene_rules.get("positive_modifiers", []))
    add_neg_parts.extend(scene_rules.get("negative_modifiers", []))

    return " ".join(add_pos_parts), " ".join(add_neg_parts)


def get_character_rules(profile: dict, character_id: str) -> dict[str, Any] | None:
    """Return character-specific rules or None."""
    return profile.get("character_rules", {}).get(character_id)


def get_scene_config_overrides(profile: dict, environment: str) -> dict[str, Any]:
    """Return config overrides for a scene type (e.g., whiteboard → mode=t2v)."""
    return (
        profile.get("scene_type_rules", {})
        .get(environment, {})
        .get("config_overrides", {})
    )


def check_anti_patterns(profile: dict, prompt_text: str) -> list[dict]:
    """Check prompt text against known anti-patterns. Returns matching patterns."""
    matches = []
    for ap in profile.get("prompt_rules", {}).get("anti_patterns", []):
        pattern = ap.get("pattern", "")
        if pattern and re.search(pattern, prompt_text, re.IGNORECASE):
            matches.append(ap)
    return matches


def find_matching_failure_fix(
    profile: dict, evaluation: dict
) -> dict[str, Any] | None:
    """Match an evaluation's feedback against known failure patterns.

    Returns the best-matching pattern (highest confidence) or None.
    """
    feedback = evaluation.get("feedback", "").lower()
    failed_metrics = [m.lower() for m in evaluation.get("failed_metrics", [])]
    combined = feedback + " " + " ".join(failed_metrics)

    best_match = None
    best_confidence = 0.0

    for fp in profile.get("failure_patterns", []):
        keywords = fp.get("detection_keywords", [])
        if not keywords:
            # Try matching by symptom text
            if fp.get("symptom", "").lower() in combined:
                if fp.get("confidence", 0) > best_confidence:
                    best_match = fp
                    best_confidence = fp["confidence"]
            continue

        hits = sum(1 for kw in keywords if kw.lower() in combined)
        if hits > 0:
            confidence = fp.get("confidence", 0.5)
            score = confidence * (hits / len(keywords))
            if score > best_confidence:
                best_match = fp
                best_confidence = score

    return best_match


# ---------------------------------------------------------------------------
# Write helpers (for learn_from_run, qa_correction_agent)
# ---------------------------------------------------------------------------

def update_baseline_config(
    profile: dict,
    new_config: dict[str, Any],
    pass_rate: float,
    run_id: str,
) -> bool:
    """Update baseline config if pass_rate improves over current.

    Returns True if baseline was updated.
    """
    current = profile.get("baseline_config", {})
    current_confidence = current.get("confidence", 0.0)

    # Only update if new config has better pass rate
    if pass_rate > current_confidence:
        profile["baseline_config"] = {
            **new_config,
            "confidence": round(pass_rate, 3),
            "validated_runs": current.get("validated_runs", 0) + 1,
            "source": f"run:{run_id}",
            "last_validated": datetime.now().isoformat(),
        }
        return True

    # Same config, just bump validated_runs
    if _configs_match(current, new_config) and pass_rate >= current_confidence:
        profile["baseline_config"]["validated_runs"] = (
            current.get("validated_runs", 0) + 1
        )
        profile["baseline_config"]["last_validated"] = datetime.now().isoformat()
        return False

    return False


def record_config_result(
    profile: dict,
    config: dict[str, Any],
    pass_rate: float,
    noise_rate: float,
    run_id: str,
    notes: str = "",
) -> None:
    """Append to config_history."""
    history = profile.setdefault("config_history", [])
    entry = {
        "config_hash": _config_hash(config),
        "config": {k: v for k, v in config.items() if k not in ("confidence", "validated_runs", "source", "last_validated")},
        "result": "pass" if pass_rate >= 0.5 else "fail",
        "pass_rate": round(pass_rate, 3),
        "noise_collapse_rate": round(noise_rate, 3),
        "run_id": run_id,
        "tested_at": datetime.now().isoformat(),
        "notes": notes,
    }
    # Deduplicate: update existing entry with same config_hash + run_id
    for i, existing in enumerate(history):
        if existing.get("run_id") == run_id:
            history[i] = entry
            return
    history.append(entry)
    # Keep last 100 entries
    if len(history) > 100:
        profile["config_history"] = history[-100:]


def record_successful_fix(
    profile: dict,
    pattern_id: str | None,
    fix_description: dict[str, Any],
    run_id: str,
) -> None:
    """Increment confidence on existing pattern or create new one."""
    patterns = profile.setdefault("failure_patterns", [])

    if pattern_id:
        for fp in patterns:
            if fp.get("id") == pattern_id:
                fp["occurrences"] = fp.get("occurrences", 0) + 1
                fp["confidence"] = min(0.99, fp.get("confidence", 0.5) + 0.05)
                fp["last_seen"] = datetime.now().isoformat()
                fp.setdefault("validated_by", []).append(run_id)
                return

    # Pattern not found — create new one
    record_new_failure_pattern(
        profile,
        symptom=fix_description.get("symptom", "unknown"),
        keywords=fix_description.get("keywords", []),
        fix=fix_description,
        source=f"fix_success:{run_id}",
    )


def record_new_failure_pattern(
    profile: dict,
    symptom: str,
    keywords: list[str],
    fix: dict[str, Any],
    source: str,
) -> str:
    """Add a new failure pattern with confidence=0.5. Returns the new pattern id."""
    patterns = profile.setdefault("failure_patterns", [])
    # Generate id
    existing_ids = {fp.get("id", "") for fp in patterns}
    idx = len(patterns) + 1
    while f"fp_{idx}" in existing_ids:
        idx += 1
    pattern_id = f"fp_{idx}"

    patterns.append({
        "id": pattern_id,
        "symptom": symptom,
        "detection_keywords": keywords,
        "fix_type": fix.get("fix_type", "prompt_patch"),
        "fix": fix,
        "confidence": 0.5,
        "occurrences": 1,
        "first_seen": datetime.now().isoformat(),
        "last_seen": datetime.now().isoformat(),
        "source": source,
    })
    return pattern_id


def add_prompt_rule(
    profile: dict,
    rule_id: str,
    text: str,
    target: str,  # "positive" or "negative"
    rule_type: str = "always_include",  # "always_include", "always_exclude", "anti_patterns"
    confidence: float = 0.5,
    source: str = "",
    **kwargs: Any,
) -> None:
    """Add or update a prompt rule."""
    rules = profile.setdefault("prompt_rules", {})
    bucket = rules.setdefault(rule_type, [])

    # Update existing
    for r in bucket:
        if r.get("id") == rule_id:
            r["text"] = text
            r["target"] = target
            r["confidence"] = confidence
            r["source"] = source
            r.update(kwargs)
            return

    # New rule
    entry = {"id": rule_id, "text": text, "target": target, "confidence": confidence, "source": source}
    entry.update(kwargs)
    bucket.append(entry)


def add_character_rule(
    profile: dict,
    character_id: str,
    positive_modifiers: list[str] | None = None,
    negative_modifiers: list[str] | None = None,
    known_issues: list[dict] | None = None,
    anchor_path: str | None = None,
) -> None:
    """Add or merge character-specific rules."""
    chars = profile.setdefault("character_rules", {})
    existing = chars.setdefault(character_id, {
        "positive_modifiers": [],
        "negative_modifiers": [],
        "known_issues": [],
    })

    if positive_modifiers:
        existing_pos = set(existing.get("positive_modifiers", []))
        for m in positive_modifiers:
            if m not in existing_pos:
                existing.setdefault("positive_modifiers", []).append(m)

    if negative_modifiers:
        existing_neg = set(existing.get("negative_modifiers", []))
        for m in negative_modifiers:
            if m not in existing_neg:
                existing.setdefault("negative_modifiers", []).append(m)

    if known_issues:
        existing_issues = existing.setdefault("known_issues", [])
        existing_issue_ids = {ki.get("issue") for ki in existing_issues}
        for ki in known_issues:
            if ki.get("issue") not in existing_issue_ids:
                existing_issues.append(ki)

    if anchor_path:
        existing["anchor_path"] = anchor_path


# ---------------------------------------------------------------------------
# AI System Prompt Generation
# ---------------------------------------------------------------------------

def generate_ai_system_prompt(profile: dict) -> str:
    """Render profile as a natural-language system prompt for AI agents."""
    lines = []
    v = profile.get("version", 0)
    pid = profile.get("project_id", "unknown")
    lines.append(f"# Video Pipeline Project Profile (v{v}) — {pid}")
    lines.append("")

    # Baseline
    bc = profile.get("baseline_config", {})
    if bc:
        lines.append("## Proven Baseline Config")
        model = bc.get("model", "?")
        lines.append(f"- Model: `{model}`")
        for key in ("weight_dtype", "model_sampling_shift", "steps", "cfg", "sampler", "scheduler", "resolution"):
            val = bc.get(key)
            if val is not None:
                lines.append(f"- {key}: `{val}`")
        conf = bc.get("confidence", 0)
        runs = bc.get("validated_runs", 0)
        lines.append(f"- Confidence: {conf:.0%} (validated across {runs} runs)")
        lines.append("")

    # Prompt rules
    rules = profile.get("prompt_rules", {})
    always_inc = rules.get("always_include", [])
    always_exc = rules.get("always_exclude", [])
    anti = rules.get("anti_patterns", [])
    if always_inc or always_exc or anti:
        lines.append("## Mandatory Prompt Rules")
        for r in always_inc:
            lines.append(f"- ALWAYS {r['target']}: \"{r['text']}\"")
        for r in always_exc:
            lines.append(f"- ALWAYS {r['target']}: \"{r['text']}\"")
        for ap in anti:
            lines.append(f"- AVOID pattern `{ap.get('pattern', '')}`: {ap.get('reason', '')} → {ap.get('fix', '')}")
        lines.append("")

    # Character rules
    chars = profile.get("character_rules", {})
    if chars:
        lines.append("## Character Rules")
        for cid, cr in chars.items():
            lines.append(f"### {cid}")
            for m in cr.get("positive_modifiers", []):
                lines.append(f"  + {m}")
            for m in cr.get("negative_modifiers", []):
                lines.append(f"  - {m}")
            for ki in cr.get("known_issues", []):
                conf = ki.get("confidence", 0)
                lines.append(f"  KNOWN ISSUE ({conf:.0%}): {ki['issue']} → {ki.get('fix', '?')}")
            lines.append("")

    # Failure patterns
    fps = profile.get("failure_patterns", [])
    if fps:
        lines.append("## Failure Registry")
        for fp in sorted(fps, key=lambda x: x.get("confidence", 0), reverse=True):
            conf = fp.get("confidence", 0)
            occ = fp.get("occurrences", 0)
            fix_note = fp.get("fix", {}).get("note", str(fp.get("fix", "")))
            lines.append(f"- **{fp.get('symptom', '?')}** ({conf:.0%}, {occ}x): {fix_note}")
        lines.append("")

    # Config graveyard
    history = profile.get("config_history", [])
    failed = [h for h in history if h.get("result") == "fail"]
    if failed:
        lines.append("## Config Graveyard (DO NOT retry)")
        for h in failed[-10:]:
            notes = h.get("notes", "")
            lines.append(f"- `{h.get('config_hash', '?')}`: {notes}")
        lines.append("")

    return "\n".join(lines)


def generate_markdown_summary(profile: dict) -> str:
    """Generate a concise markdown summary for human review."""
    return generate_ai_system_prompt(profile)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _configs_match(a: dict, b: dict) -> bool:
    """Check if two configs match on key rendering parameters."""
    keys = ("model", "steps", "cfg", "weight_dtype", "model_sampling_shift", "sampler", "scheduler", "resolution")
    for k in keys:
        if a.get(k) != b.get(k):
            return False
    return True


def _config_hash(config: dict) -> str:
    """Generate a human-readable hash for a config."""
    model = config.get("model", "unknown")
    # Shorten model name
    short = model.split("/")[-1].replace(".safetensors", "")
    if len(short) > 30:
        short = short[:15] + ".." + short[-10:]
    dtype = config.get("weight_dtype", "?")
    shift = config.get("model_sampling_shift", "?")
    steps = config.get("steps", "?")
    cfg = config.get("cfg", "?")
    return f"{short}_{dtype}_s{shift}_st{steps}_c{cfg}"
