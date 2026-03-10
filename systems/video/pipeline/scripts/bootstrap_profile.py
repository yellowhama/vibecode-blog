#!/usr/bin/env python3
"""Bootstrap project_profile.json from existing pipeline data.

Reads experiment_history.jsonl, character_index.json, and current render config
to seed the initial project profile.

Usage:
    python bootstrap_profile.py [--output pipeline/learning/project_profile.json]
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

# Add scripts dir to path for local imports
sys.path.insert(0, str(Path(__file__).parent))
from project_profile import (
    _empty_profile,
    add_character_rule,
    add_prompt_rule,
    record_config_result,
    record_new_failure_pattern,
    save_profile,
)

BASE_DIR = Path("/mnt/e/vibecode-blog/content/video")
HISTORY_PATH = BASE_DIR / "pipeline/learning/experiment_history.jsonl"
CHARACTER_INDEX_PATH = BASE_DIR / "assets/characters/character_index.json"


def _load_history(path: Path) -> list[dict]:
    entries = []
    if not path.exists():
        return entries
    for line in path.read_text(encoding="utf-8").strip().splitlines():
        if line.strip():
            entries.append(json.loads(line))
    return entries


def _bootstrap_from_history(profile: dict, history: list[dict]) -> None:
    """Analyze experiment history to set baseline and config_history."""
    if not history:
        return

    # Classify runs
    pass_runs = []
    fail_runs = []
    for entry in history:
        summary = entry.get("summary", {})
        config = entry.get("config", {})
        fail_rate = summary.get("visual_fail_rate", 0)
        noise_rate = summary.get("noise_collapse_rate", 0)
        black_rate = summary.get("black_collapse_rate", 0)

        record_config_result(
            profile,
            config=config,
            pass_rate=1.0 - fail_rate,
            noise_rate=noise_rate,
            run_id=entry.get("run_id", "unknown"),
            notes="; ".join(entry.get("root_causes", [])),
        )

        if fail_rate == 0.0:
            pass_runs.append(entry)
        else:
            fail_runs.append(entry)

    # Find most common passing config → baseline
    if pass_runs:
        config_counter: Counter[str] = Counter()
        config_map: dict[str, dict] = {}
        for entry in pass_runs:
            c = entry.get("config", {})
            key = f"{c.get('model', '')}|{c.get('weight_dtype', '')}|{c.get('model_sampling_shift', '')}"
            config_counter[key] += 1
            config_map[key] = c

        best_key, best_count = config_counter.most_common(1)[0]
        best_config = config_map[best_key]
        total_pass = len(pass_runs)

        profile["baseline_config"] = {
            "model": best_config.get("model", ""),
            "resolution": best_config.get("resolution", "832x480"),
            "steps": best_config.get("steps", 20),
            "cfg": best_config.get("cfg", 1.0),
            "sampler": best_config.get("sampler", "euler"),
            "scheduler": best_config.get("scheduler", "simple"),
            "weight_dtype": best_config.get("weight_dtype", "default"),
            "model_sampling_shift": best_config.get("model_sampling_shift"),
            "has_model_sampling_sd3": best_config.get("has_model_sampling_sd3", True),
            "confidence": round(best_count / max(len(history), 1), 3),
            "validated_runs": best_count,
            "source": f"bootstrap from {len(history)} experiment_history entries",
        }

    # Extract failure patterns from failed runs
    for entry in fail_runs:
        summary = entry.get("summary", {})
        config = entry.get("config", {})
        causes = entry.get("root_causes", [])

        if summary.get("noise_collapse_rate", 0) > 0.5:
            record_new_failure_pattern(
                profile,
                symptom="noise collapse (random pixel noise instead of image)",
                keywords=["noise", "collapse", "static", "random pixels"],
                fix={
                    "fix_type": "config_change",
                    "note": "; ".join(causes),
                    "config_context": {
                        "model": config.get("model"),
                        "weight_dtype": config.get("weight_dtype"),
                    },
                },
                source=f"history:{entry.get('run_id', '')}",
            )

        if summary.get("black_collapse_rate", 0) > 0.5:
            record_new_failure_pattern(
                profile,
                symptom="black frame collapse (all-black output)",
                keywords=["black", "blank", "empty", "dark"],
                fix={
                    "fix_type": "config_change",
                    "note": "; ".join(causes),
                    "config_context": {
                        "model": config.get("model"),
                        "weight_dtype": config.get("weight_dtype"),
                    },
                },
                source=f"history:{entry.get('run_id', '')}",
            )


def _bootstrap_from_characters(profile: dict, char_index_path: Path) -> None:
    """Seed character_rules from character_index.json."""
    if not char_index_path.exists():
        return
    data = json.loads(char_index_path.read_text(encoding="utf-8"))
    profile["project_id"] = data.get("project_id", profile.get("project_id", ""))

    for cid, cdata in data.get("characters", {}).items():
        appearance = cdata.get("appearance", "")
        anchor = cdata.get("primary_anchor", "")

        # Extract key visual descriptors from appearance text
        positive_mods = []
        if appearance:
            positive_mods.append(appearance)

        add_character_rule(
            profile,
            character_id=cid,
            positive_modifiers=positive_mods,
            anchor_path=anchor,
        )


def _add_known_prompt_rules(profile: dict) -> None:
    """Add proven prompt rules from our render experience."""
    # Clay texture enforcement (from render alignment backlog)
    add_prompt_rule(
        profile,
        rule_id="clay_texture",
        text="Heavily textured handmade clay. Visible fingerprint marks. Uneven matte clay surface.",
        target="positive",
        rule_type="always_include",
        confidence=0.9,
        source="render_alignment_backlog_2026-03-07",
    )
    add_prompt_rule(
        profile,
        rule_id="nonverbal",
        text="Silent, mouth closed, nonverbal, no speaking pose.",
        target="positive",
        rule_type="always_include",
        confidence=0.8,
        source="render_alignment_backlog_2026-03-07",
    )

    # Anti-patterns (negative prompts)
    add_prompt_rule(
        profile,
        rule_id="anti_smooth",
        text="smooth 3d render, polished surface, plastic skin, pixar style, CGI, photorealistic",
        target="negative",
        rule_type="always_exclude",
        confidence=0.9,
        source="render_alignment_backlog_2026-03-07",
    )

    # Known anti-patterns in positive prompts
    rules = profile.setdefault("prompt_rules", {})
    anti = rules.setdefault("anti_patterns", [])
    anti.append({
        "id": "avoid_explosion",
        "pattern": r"explosion|burst|erupts|detonates",
        "reason": "causes character occlusion with smoke/fire effects in mid-frames",
        "fix": "replace with 'sudden movement' or 'dramatic reaction' or 'sudden flash'",
        "confidence": 0.6,
        "source": "A07 series QA 2026-03-08",
    })
    anti.append({
        "id": "avoid_overexposure",
        "pattern": r"blinding light|intense glow|white flash",
        "reason": "causes overexposure washing out character details",
        "fix": "use 'soft glow' or 'gentle illumination' instead",
        "confidence": 0.5,
        "source": "A07_01 f16 QA 2026-03-08",
    })


def _add_scene_type_rules(profile: dict) -> None:
    """Add scene-type specific rules."""
    profile["scene_type_rules"] = {
        "real_world": {
            "positive_modifiers": [
                "boundless off-white background, no horizon line",
                "toy-like white clay computer, white clay desk",
            ],
            "negative_modifiers": [
                "realistic monitor, floor line, room interior, real furniture",
            ],
            "config_overrides": {},
        },
        "whiteboard": {
            "positive_modifiers": [],
            "negative_modifiers": [],
            "config_overrides": {
                "mode": "t2v",
            },
        },
        "inside_screen": {
            "positive_modifiers": [
                "digital environment, glowing interface elements",
            ],
            "negative_modifiers": [],
            "config_overrides": {},
        },
        "action": {
            "positive_modifiers": [],
            "negative_modifiers": [],
            "config_overrides": {
                "steps": 24,
            },
            "notes": "Higher steps for complex motion scenes to reduce artifacts",
        },
    }


def _add_known_character_issues(profile: dict) -> None:
    """Add known character-specific issues from previous QA sessions."""
    chars = profile.setdefault("character_rules", {})

    # dev_protagonist known issues
    dp = chars.setdefault("dev_protagonist", {})
    dp.setdefault("known_issues", []).extend([
        {
            "issue": "eyes tend to render blue instead of black",
            "fix": "add 'black pupils only, no blue eyes' to positive prompt",
            "confidence": 0.85,
            "source": "S01_03_v2 visual QA correction",
        },
        {
            "issue": "hood falls down revealing hair",
            "fix": "add 'hood stays up at all times, no hair visible' to positive prompt",
            "confidence": 0.8,
            "source": "S02_02_v2 visual QA correction",
        },
        {
            "issue": "separate visible feet appear",
            "fix": "add 'no separate feet, short stubby merged limbs' to positive prompt",
            "confidence": 0.7,
            "source": "S01_03_v2 visual QA",
        },
    ])
    dp.setdefault("negative_modifiers", []).extend([
        "blue eyes, wide open eyes, smile, open mouth",
        "hair visible, pants, shoes, visible separate feet",
    ])
    dp.setdefault("positive_modifiers", []).extend([
        "wide-set half-closed tired eyes with black pupils",
        "hood up at all times, oversized cocoa brown hoodie",
        "short stubby limbs, no separate feet",
    ])

    # Add model corruption as a known failure (from today's session)
    fp = profile.setdefault("failure_patterns", [])
    fp.append({
        "id": "fp_model_corruption",
        "symptom": "persistent noise/static regardless of settings (all configs produce noise)",
        "detection_keywords": ["noise", "static", "all settings fail", "every config"],
        "fix_type": "infrastructure",
        "fix": {
            "note": "Check for .aria2 files alongside model. Verify model integrity by sampling binary blocks for zero-filled regions. Re-download if corrupted.",
            "commands": [
                "ls -la <model_path>.aria2",
                "python3 -c 'check zero blocks in model file'",
                "huggingface-cli download <model_repo>",
            ],
        },
        "confidence": 0.95,
        "occurrences": 1,
        "first_seen": "2026-03-08",
        "last_seen": "2026-03-08",
        "source": "manual:session_2026-03-08_wan14b_corruption",
    })


def _add_current_wan_i2v_baseline(profile: dict) -> None:
    """Add current working Wan I2V 14B config from today's successful batch.

    This supplements the Hunyuan baseline from history with the Wan I2V config
    that is actively being used for the 50-shot render.
    """
    # The Wan I2V config that produced clean renders today
    wan_config = {
        "model": "wan2.1_i2v_720p_14B_bf16.safetensors",
        "resolution": "848x480",
        "steps": 20,
        "cfg": 6,
        "sampler": "uni_pc",
        "scheduler": "simple",
        "weight_dtype": "fp8_e4m3fn",
        "has_model_sampling_sd3": True,
        "model_sampling_shift": 8.0,
    }

    # Add to config history as a passing config
    history = profile.setdefault("config_history", [])
    history.append({
        "config_hash": "wan14b_fp8_shift8_clean_model",
        "config": wan_config,
        "result": "pass",
        "pass_rate": 0.5,  # 3/6 PASS, 3/6 PARTIAL so far
        "noise_collapse_rate": 0.0,
        "run_id": "phase1_act1_planned_20260308_batch",
        "tested_at": "2026-03-08T22:00:00",
        "notes": "Clean model (re-downloaded). 50-shot batch in progress. A02 series PASS, A07 series PARTIAL (prompt issues not config).",
    })

    # Update baseline to current active config (Wan I2V is what we're actually using)
    profile["baseline_config"] = {
        **wan_config,
        "confidence": 0.7,
        "validated_runs": 1,
        "source": "phase1_act1_planned_20260308 batch render (6/50 checked, 3 PASS 3 PARTIAL)",
        "notes": "Active config for 50-shot batch. PARTIAL shots are prompt issues, not config issues.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap project profile from existing data")
    parser.add_argument(
        "--output", type=Path,
        default=BASE_DIR / "pipeline/learning/project_profile.json",
        help="Output path for project_profile.json",
    )
    parser.add_argument("--history", type=Path, default=HISTORY_PATH)
    parser.add_argument("--characters", type=Path, default=CHARACTER_INDEX_PATH)
    args = parser.parse_args()

    print(f"Bootstrapping project profile...")
    profile = _empty_profile()

    # Step 1: Load experiment history
    history = _load_history(args.history)
    print(f"  Loaded {len(history)} experiment history entries")
    _bootstrap_from_history(profile, history)

    # Step 2: Load character data
    _bootstrap_from_characters(profile, args.characters)
    print(f"  Loaded character data from {args.characters}")

    # Step 3: Add known prompt rules
    _add_known_prompt_rules(profile)
    print(f"  Added proven prompt rules")

    # Step 4: Add scene type rules
    _add_scene_type_rules(profile)
    print(f"  Added scene type rules")

    # Step 5: Add known character issues
    _add_known_character_issues(profile)
    print(f"  Added known character issues")

    # Step 6: Add current Wan I2V config
    _add_current_wan_i2v_baseline(profile)
    print(f"  Added current Wan I2V 14B baseline")

    # Save
    save_profile(profile, args.output)

    # Stats
    n_patterns = len(profile.get("failure_patterns", []))
    n_chars = len(profile.get("character_rules", {}))
    n_history = len(profile.get("config_history", []))
    n_rules = sum(
        len(profile.get("prompt_rules", {}).get(k, []))
        for k in ("always_include", "always_exclude", "anti_patterns")
    )

    print(f"\nProfile saved to: {args.output}")
    print(f"  Version: {profile.get('version', 0)}")
    print(f"  Baseline: {profile.get('baseline_config', {}).get('model', '?')}")
    print(f"  Prompt rules: {n_rules}")
    print(f"  Character rules: {n_chars}")
    print(f"  Failure patterns: {n_patterns}")
    print(f"  Config history entries: {n_history}")

    # Also generate AI system prompt preview
    from project_profile import generate_ai_system_prompt
    prompt = generate_ai_system_prompt(profile)
    print(f"\n{'='*60}")
    print("AI SYSTEM PROMPT PREVIEW:")
    print(f"{'='*60}")
    print(prompt)


if __name__ == "__main__":
    main()
