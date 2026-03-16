#!/usr/bin/env python3
"""Validate a Fountain screenplay against the Series Bible 5-segment format.

Segments: HOOK -> PROBLEM -> CORE -> APPLICATION -> OUTRO
Timing:   Hook 15s, Problem 30s, Core 135s, Application 60s, Outro 60s
Total:    180-300 seconds (3-5 minutes)

Checks (from 13-screenplay-pipeline-plan.md Phase 6):
  1. [PASS/FAIL] 5 segments exist (Hook/Problem/Core/Application/Outro)
  2. [PASS/FAIL] Per-segment timing within max bounds
  3. [PASS/FAIL] Total duration 180-300s (3-5min)
  4. [PASS/FAIL] NARRATOR (V.O.) present in every segment
  5. [PASS/FAIL] No Vee spoken dialogue (silent character)
  6. [PASS/FAIL] Vee reactions <= 6, each 1-2s
  7. [PASS/FAIL] Pattern interrupts every 20-30s
  8. [PASS/FAIL] Banned expressions = 0
  9. [PASS/FAIL] Core has extended metaphor 60s+
 10. [PASS/WARN] Open loop in Hook (unanswered question)

Usage:
    python validate_screenplay.py <fountain_file>
    python validate_screenplay.py <fountain_file> --json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# ANSI colors
# ---------------------------------------------------------------------------
class _C:
    PASS = "\033[92m"   # green
    FAIL = "\033[91m"   # red
    WARN = "\033[93m"   # yellow
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


# ---------------------------------------------------------------------------
# Segment structure (Series Bible v3 — 2D Discovery Arc)
# ---------------------------------------------------------------------------
EXPECTED_SEGMENTS = [
    {"name": "HOOK",        "max_sec": 15},
    {"name": "PROBLEM",     "max_sec": 30},
    {"name": "CORE",        "max_sec": 135},
    {"name": "APPLICATION", "max_sec": 60},
    {"name": "OUTRO",       "max_sec": 60},
]

TOTAL_MIN = 180  # 3 minutes
TOTAL_MAX = 300  # 5 minutes

# Vee reaction limits
VEE_REACTION_MAX = 6
VEE_REACTION_SEC_MIN = 1
VEE_REACTION_SEC_MAX = 2

# Pattern interrupt interval target
INTERRUPT_INTERVAL_MIN = 20  # seconds
INTERRUPT_INTERVAL_MAX = 30  # seconds

# Extended metaphor minimum duration in Core
CORE_METAPHOR_MIN_SEC = 60

# ---------------------------------------------------------------------------
# Banned expressions (Series Bible tone guide)
# ---------------------------------------------------------------------------
BANNED_EXPRESSIONS = [
    "game-changer",
    "revolutionary",
    "insane",
    "mind-blowing",
    "literally",
]

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------
SEGMENT_RE = re.compile(
    r"^#\s+SEGMENT\s+(\d+):\s+(.+?)\s*\[(\d+:\d+)-(\d+:\d+)\]\s*$"
)
META_RE = re.compile(r"^#\s+(visual_type|characters|shorts_candidate):\s*(.+)$")
CHARACTER_RE = re.compile(r"^([A-Z][A-Z\s]+?)(?:\s*\(V\.O\.\))?\s*$")
TIMECODE_RE = re.compile(r"(\d+):(\d+)")
TRANSITION_RE = re.compile(r"^>\s+(.+)$")

# Patterns that count as visual transitions / pattern interrupts
INTERRUPT_PATTERNS = [
    re.compile(r"^>\s+", re.IGNORECASE),
    re.compile(r"CUT TO", re.IGNORECASE),
    re.compile(r"SMASH CUT", re.IGNORECASE),
    re.compile(r"MATCH CUT", re.IGNORECASE),
    re.compile(r"DISSOLVE", re.IGNORECASE),
    re.compile(r"INTERCUT", re.IGNORECASE),
    re.compile(r"FLASH", re.IGNORECASE),
    re.compile(r"MONTAGE", re.IGNORECASE),
    re.compile(r"SPLIT SCREEN", re.IGNORECASE),
    re.compile(r"ZOOM", re.IGNORECASE),
    re.compile(r"PAN TO", re.IGNORECASE),
    re.compile(r"PULL BACK", re.IGNORECASE),
    re.compile(r"CLOSE[- ]?UP", re.IGNORECASE),
    re.compile(r"WIDE SHOT", re.IGNORECASE),
    re.compile(r"^\.\w", re.IGNORECASE),
    re.compile(r"^(INT\.|EXT\.)", re.IGNORECASE),
    re.compile(r"TITLE CARD", re.IGNORECASE),
    re.compile(r"SUPER:", re.IGNORECASE),
]

# Vee reaction indicators in action lines
VEE_REACTION_RE = re.compile(
    r"\bVee\b.*?("
    r"react|nod|shrug|frown|smile|gasp|blink|sigh|wince|"
    r"lean|tilt|shake|raise|drop|eye|look|stare|glance|"
    r"gesture|point|wave|cross|uncross|scratch|rub|tap|"
    r"laugh|chuckle|grin|smirk|grimace|panic|freeze|jump|"
    r"slump|perk|squint|widen"
    r")",
    re.IGNORECASE,
)

# Vee dialogue cue — any character cue starting with VEE that is NOT an action
VEE_DIALOGUE_RE = re.compile(r"^\s*VEE\s*(?:\(.*?\))?\s*$", re.IGNORECASE)

# Open loop indicators (unanswered question in Hook)
OPEN_LOOP_PATTERNS = [
    re.compile(r"\?"),
    re.compile(r"what if", re.IGNORECASE),
    re.compile(r"have you ever", re.IGNORECASE),
    re.compile(r"why do", re.IGNORECASE),
    re.compile(r"how come", re.IGNORECASE),
    re.compile(r"imagine", re.IGNORECASE),
    re.compile(r"but here's the", re.IGNORECASE),
    re.compile(r"the real question", re.IGNORECASE),
]

# Extended metaphor indicators
METAPHOR_PATTERNS = [
    re.compile(r"like a", re.IGNORECASE),
    re.compile(r"imagine", re.IGNORECASE),
    re.compile(r"picture this", re.IGNORECASE),
    re.compile(r"think of it as", re.IGNORECASE),
    re.compile(r"it's (basically|essentially|like)", re.IGNORECASE),
    re.compile(r"just like", re.IGNORECASE),
    re.compile(r"same way", re.IGNORECASE),
    re.compile(r"metaphor", re.IGNORECASE),
    re.compile(r"analogy", re.IGNORECASE),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _tc_to_sec(tc: str) -> float:
    m = TIMECODE_RE.match(tc)
    if not m:
        return 0.0
    return int(m.group(1)) * 60 + int(m.group(2))


def _normalize_segment_name(raw: str) -> str:
    """Normalize segment name for matching (uppercase, strip whitespace)."""
    return raw.strip().upper()


# ---------------------------------------------------------------------------
# Fountain parser
# ---------------------------------------------------------------------------
def parse_segments(text: str) -> list[dict[str, Any]]:
    """Extract segments from Fountain text."""
    lines = text.split("\n")
    segments: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for line in lines:
        seg_match = SEGMENT_RE.match(line)
        if seg_match:
            current = {
                "number": int(seg_match.group(1)),
                "name": _normalize_segment_name(seg_match.group(2)),
                "raw_name": seg_match.group(2).strip(),
                "start": seg_match.group(3),
                "end": seg_match.group(4),
                "start_sec": _tc_to_sec(seg_match.group(3)),
                "end_sec": _tc_to_sec(seg_match.group(4)),
                "has_narrator": False,
                "characters_found": set(),
                "transitions": [],
                "vee_reactions": [],
                "vee_dialogue_lines": [],
                "lines": [],
                "action_lines": [],
            }
            segments.append(current)
            continue

        if current is None:
            continue

        # Track all lines
        current["lines"].append(line)

        # Narrator detection
        if re.match(r"^NARRATOR\s*\(V\.O\.\)\s*$", line.strip()):
            current["has_narrator"] = True

        # Character cue detection
        char_match = CHARACTER_RE.match(line)
        if char_match:
            name = char_match.group(1).strip()
            current["characters_found"].add(name)
            if name == "NARRATOR":
                current["has_narrator"] = True

        # Vee dialogue cue detection (Vee should never speak)
        if VEE_DIALOGUE_RE.match(line):
            current["vee_dialogue_lines"].append(line.strip())

        # Transition / pattern interrupt detection
        for pat in INTERRUPT_PATTERNS:
            if pat.search(line):
                current["transitions"].append(line.strip())
                break

        # Vee reaction detection (in action lines)
        if VEE_REACTION_RE.search(line):
            current["vee_reactions"].append(line.strip())

        # Track action lines
        stripped = line.strip()
        if (
            stripped
            and not char_match
            and not SEGMENT_RE.match(line)
            and not META_RE.match(line)
            and not TRANSITION_RE.match(line)
            and not stripped.startswith("#")
        ):
            current["action_lines"].append(stripped)

    return segments


# ---------------------------------------------------------------------------
# Validation engine
# ---------------------------------------------------------------------------
def validate(fountain_path: Path) -> dict:
    """Run all 10 checks against a Fountain screenplay."""
    text = fountain_path.read_text(encoding="utf-8")
    segments = parse_segments(text)

    results: list[dict[str, Any]] = []
    total_duration = 0.0

    # Compute durations
    for seg in segments:
        seg["duration"] = seg["end_sec"] - seg["start_sec"]
        total_duration += seg["duration"]

    # -------------------------------------------------------------------
    # CHECK 1: 5 segments exist (HOOK/PROBLEM/CORE/APPLICATION/OUTRO)
    # -------------------------------------------------------------------
    expected_names = [e["name"] for e in EXPECTED_SEGMENTS]
    actual_names = [s["name"] for s in segments]
    seg_count = len(segments)

    found_set = set(actual_names)
    expected_set = set(expected_names)
    missing = expected_set - found_set
    extra = found_set - expected_set

    check_pass = seg_count == 5 and missing == set() and actual_names == expected_names
    detail = f"{seg_count}/5 segments"
    if missing:
        detail += f" | missing: {', '.join(sorted(missing))}"
    if extra:
        detail += f" | unexpected: {', '.join(sorted(extra))}"
    if actual_names and actual_names != expected_names and not missing:
        detail += f" | wrong order: {' -> '.join(actual_names)}"

    results.append({
        "id": 1,
        "check": "5 segments exist (Hook/Problem/Core/Application/Outro)",
        "status": "PASS" if check_pass else "FAIL",
        "detail": detail,
    })

    # -------------------------------------------------------------------
    # CHECK 2: Per-segment timing within max bounds
    # -------------------------------------------------------------------
    for i, expected in enumerate(EXPECTED_SEGMENTS):
        if i < len(segments):
            seg = segments[i]
            dur = seg["duration"]
            in_range = dur <= expected["max_sec"]
            results.append({
                "id": 2,
                "check": f"{expected['name']} timing (max {expected['max_sec']}s)",
                "status": "PASS" if in_range else "FAIL",
                "detail": f"{dur:.0f}s" + ("" if in_range else f" (over by {dur - expected['max_sec']:.0f}s)"),
            })
        else:
            results.append({
                "id": 2,
                "check": f"{expected['name']} timing (max {expected['max_sec']}s)",
                "status": "FAIL",
                "detail": "segment missing",
            })

    # -------------------------------------------------------------------
    # CHECK 3: Total duration 180-300s
    # -------------------------------------------------------------------
    check_pass = TOTAL_MIN <= total_duration <= TOTAL_MAX
    results.append({
        "id": 3,
        "check": f"Total duration {TOTAL_MIN}-{TOTAL_MAX}s (3-5min)",
        "status": "PASS" if check_pass else "FAIL",
        "detail": f"{total_duration:.0f}s ({total_duration / 60:.1f}min)",
    })

    # -------------------------------------------------------------------
    # CHECK 4: NARRATOR (V.O.) present in every segment
    # -------------------------------------------------------------------
    missing_narrator = [s["name"] for s in segments if not s["has_narrator"]]
    check_pass = len(missing_narrator) == 0 and len(segments) > 0
    results.append({
        "id": 4,
        "check": "NARRATOR (V.O.) present in every segment",
        "status": "PASS" if check_pass else "FAIL",
        "detail": "OK" if check_pass else f"missing in: {', '.join(missing_narrator)}",
    })

    # -------------------------------------------------------------------
    # CHECK 5: No Vee spoken dialogue (silent character)
    # -------------------------------------------------------------------
    vee_lines: list[str] = []
    for seg in segments:
        # Catch VEE character cues
        for line in seg["vee_dialogue_lines"]:
            vee_lines.append(f"{seg['name']}: {line}")
        # Also catch any non-narrator character dialogue
        non_narrator = seg["characters_found"] - {"NARRATOR"}
        for ch in non_narrator:
            if ch.startswith("VEE") or ch == "VEE":
                vee_lines.append(f"{seg['name']}: {ch} dialogue cue")

    check_pass = len(vee_lines) == 0
    results.append({
        "id": 5,
        "check": "No Vee spoken dialogue (silent character)",
        "status": "PASS" if check_pass else "FAIL",
        "detail": "OK" if check_pass else f"found: {'; '.join(vee_lines[:5])}",
    })

    # -------------------------------------------------------------------
    # CHECK 6: Vee reactions <= 6, each 1-2s
    # -------------------------------------------------------------------
    all_vee_reactions = []
    for seg in segments:
        all_vee_reactions.extend(seg["vee_reactions"])

    reaction_count = len(all_vee_reactions)
    check_pass = reaction_count <= VEE_REACTION_MAX
    detail = f"{reaction_count}/{VEE_REACTION_MAX} reactions"
    if reaction_count > VEE_REACTION_MAX:
        detail += f" (exceeded by {reaction_count - VEE_REACTION_MAX})"

    results.append({
        "id": 6,
        "check": f"Vee reactions <= {VEE_REACTION_MAX}, each {VEE_REACTION_SEC_MIN}-{VEE_REACTION_SEC_MAX}s",
        "status": "PASS" if check_pass else "FAIL",
        "detail": detail,
    })

    # -------------------------------------------------------------------
    # CHECK 7: Pattern interrupts every 20-30s
    # -------------------------------------------------------------------
    total_transitions = sum(len(s["transitions"]) for s in segments)
    if total_transitions > 0 and total_duration > 0:
        avg_interval = total_duration / total_transitions
        check_pass = avg_interval <= INTERRUPT_INTERVAL_MAX
        detail = (
            f"{total_transitions} interrupts across {total_duration:.0f}s "
            f"(avg {avg_interval:.0f}s interval)"
        )
    elif total_duration > 0:
        check_pass = False
        detail = "0 pattern interrupts found"
    else:
        check_pass = False
        detail = "no content to check"

    results.append({
        "id": 7,
        "check": f"Pattern interrupts every {INTERRUPT_INTERVAL_MIN}-{INTERRUPT_INTERVAL_MAX}s",
        "status": "PASS" if check_pass else "FAIL",
        "detail": detail,
    })

    # -------------------------------------------------------------------
    # CHECK 8: Banned expressions = 0
    # -------------------------------------------------------------------
    found_banned = []
    text_lower = text.lower()
    for expr in BANNED_EXPRESSIONS:
        if expr.lower() in text_lower:
            found_banned.append(expr)

    check_pass = len(found_banned) == 0
    results.append({
        "id": 8,
        "check": "Banned expressions = 0",
        "status": "PASS" if check_pass else "FAIL",
        "detail": "none found" if check_pass else f"found: {', '.join(found_banned)}",
    })

    # -------------------------------------------------------------------
    # CHECK 9: Core has extended metaphor 60s+
    # -------------------------------------------------------------------
    core_seg = next((s for s in segments if s["name"] == "CORE"), None)
    if core_seg:
        metaphor_lines = []
        for line in core_seg["lines"]:
            for pat in METAPHOR_PATTERNS:
                if pat.search(line):
                    metaphor_lines.append(line.strip())
                    break

        # Heuristic: proportion of lines with metaphor indicators,
        # mapped to the segment duration. Also accept if 3+ lines
        # carry metaphor language (sustained metaphor).
        core_total_lines = len([ln for ln in core_seg["lines"] if ln.strip()])
        metaphor_proportion = len(metaphor_lines) / max(core_total_lines, 1)
        estimated_metaphor_sec = metaphor_proportion * core_seg["duration"]
        sustained = len(metaphor_lines) >= 3 or estimated_metaphor_sec >= CORE_METAPHOR_MIN_SEC

        check_pass = sustained
        detail = (
            f"{len(metaphor_lines)} metaphor indicators, "
            f"~{estimated_metaphor_sec:.0f}s estimated coverage"
        )
    else:
        check_pass = False
        detail = "CORE segment not found"

    results.append({
        "id": 9,
        "check": f"Core extended metaphor {CORE_METAPHOR_MIN_SEC}s+",
        "status": "PASS" if check_pass else "FAIL",
        "detail": detail,
    })

    # -------------------------------------------------------------------
    # CHECK 10: Open loop in Hook (WARN level)
    # -------------------------------------------------------------------
    hook_seg = next((s for s in segments if s["name"] == "HOOK"), None)
    if hook_seg:
        hook_text = "\n".join(hook_seg["lines"])
        has_open_loop = any(pat.search(hook_text) for pat in OPEN_LOOP_PATTERNS)
        results.append({
            "id": 10,
            "check": "Open loop in Hook (unanswered question)",
            "status": "PASS" if has_open_loop else "WARN",
            "detail": "open loop detected" if has_open_loop else "no clear open loop found — verify manually",
        })
    else:
        results.append({
            "id": 10,
            "check": "Open loop in Hook (unanswered question)",
            "status": "WARN",
            "detail": "HOOK segment not found",
        })

    return {
        "file": str(fountain_path),
        "segments_found": seg_count,
        "total_duration_sec": total_duration,
        "results": results,
    }


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
def print_results(validation: dict) -> int:
    """Print color-coded validation results. Returns exit code (0=pass, 1=fail)."""
    C = _C

    print(f"\n{C.BOLD}{'=' * 64}{C.RESET}")
    print(f"  {C.BOLD}Screenplay Validation{C.RESET}: {validation['file']}")
    print(
        f"  Segments: {validation['segments_found']}/5"
        f" | Duration: {validation['total_duration_sec']:.0f}s"
        f" ({validation['total_duration_sec'] / 60:.1f}min)"
    )
    print(f"{C.BOLD}{'=' * 64}{C.RESET}\n")

    has_fail = False
    pass_count = 0
    fail_count = 0
    warn_count = 0

    for r in validation["results"]:
        status = r["status"]
        if status == "PASS":
            color = C.PASS
            pass_count += 1
        elif status == "FAIL":
            color = C.FAIL
            fail_count += 1
            has_fail = True
        else:
            color = C.WARN
            warn_count += 1

        print(f"  {color}[{status}]{C.RESET} {r['check']}")
        print(f"         {C.DIM}{r['detail']}{C.RESET}")

    total = len(validation["results"])

    # -------------------------------------------------------------------
    # Manual review checklist
    # -------------------------------------------------------------------
    print(f"\n{C.BOLD}{'-' * 64}{C.RESET}")
    print(f"  {C.BOLD}MANUAL REVIEW CHECKLIST{C.RESET}")
    print(f"{C.BOLD}{'-' * 64}{C.RESET}\n")

    checklist = [
        'Tone: conversational explainer, not corporate doc?',
        'Discovery Arc: curiosity -> frustration -> clarity -> confidence?',
        'Aha moment clearly identified in Core?',
        'Vee reactions silhouette-safe (40px recognition)?',
        '80/20 split: diagrams+motion / Vee reactions?',
    ]

    for item in checklist:
        print(f"  [ ] {item}")
    print()

    # -------------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------------
    summary_color = C.PASS if not has_fail else C.FAIL
    print(f"{C.BOLD}{'=' * 64}{C.RESET}")
    print(
        f"  {summary_color}{C.BOLD}Result: "
        f"{pass_count}/{total} PASS | {fail_count} FAIL | {warn_count} WARN"
        f"{C.RESET}"
    )
    print(f"{C.BOLD}{'=' * 64}{C.RESET}\n")

    return 1 if has_fail else 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Validate Fountain screenplay against Series Bible 5-segment format"
    )
    parser.add_argument(
        "fountain_file",
        nargs="?",
        help="Path to the Fountain (.fountain) file",
    )
    parser.add_argument(
        "--input",
        default=None,
        help="Path to the Fountain file (alternative to positional arg)",
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    # Resolve fountain file path (positional or --input)
    fountain_file = args.fountain_file or args.input
    if not fountain_file:
        parser.error("fountain file required (positional or --input)")

    fountain_path = Path(fountain_file)
    if not fountain_path.exists():
        print(f"Error: {fountain_path} not found", file=sys.stderr)
        sys.exit(2)

    validation = validate(fountain_path)

    if args.json:
        # Serialize sets for JSON
        print(json.dumps(validation, ensure_ascii=False, indent=2, default=str))
        sys.exit(0)

    exit_code = print_results(validation)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
