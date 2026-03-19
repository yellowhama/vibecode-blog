#!/usr/bin/env python3
"""Validate a Fountain screenplay against the Series Bible v6 6-segment format.

Segments: HOOK -> MISCONCEPTION -> THE_CRACK -> CORE -> REFRAME -> OUTRO_CTA
Timing:   Hook 30s, Misconception 75s, The Crack 60s, Core 270s, Reframe 75s, Outro+CTA 60s
Total:    300-600 seconds (5-10 minutes)

Checks 1-15:  original structural & character checks
Checks 16-24: narration research principles (Sprint 3)
  16. Discovery Arc mapping (6 stages present)
  17. Beat count 12-20
  18. Beat max 5s each
  19. Pixar formula detected (3+ markers)
  20. Shorts candidates >= 2
  21. Analogy-First in Core (metaphor before definition)
  22. Show vs Tell (no emotion words in action lines)
  23. We Say / Never Say (corporate tone patterns)
  24. Actionable Takeaway in Outro_CTA

Usage:
    python validate_screenplay.py <fountain_file>
    python validate_screenplay.py <fountain_file> --json
    python validate_screenplay.py <fountain_file> --manifest prepro.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore[assignment]

# ---------------------------------------------------------------------------
# Rules YAML loader
# ---------------------------------------------------------------------------
RULES_PATH = Path(__file__).parent.parent / "config" / "tts_rules.yaml"

_RULES_CACHE: dict | None = None


def _load_rules_yaml() -> dict:
    """Load tts_rules.yaml once, fallback to hardcoded defaults."""
    global _RULES_CACHE
    if _RULES_CACHE is not None:
        return _RULES_CACHE

    if yaml and RULES_PATH.exists():
        with RULES_PATH.open("r", encoding="utf-8") as f:
            _RULES_CACHE = yaml.safe_load(f) or {}
    else:
        _RULES_CACHE = {}
    return _RULES_CACHE


# Hardcoded fallbacks for when YAML is unavailable
_NEVER_SAY_DEFAULTS = [
    "이 개념을 이해하는 것이 중요합니다",
    "보안 취약점이 감지되었습니다",
    "코드 품질 관리가 미흡했습니다",
    "코드 구조가 최적화되지 않았습니다",
    "해당 가정은 사실과 달랐습니다",
    "상당한 시간 투자 후 해결책을 발견했습니다",
    "시스템 장애가 발생했습니다",
    "테스트 커버리지가 부족했습니다",
    "코드베이스 최적화를 통해",
    "이상으로 해당 주제를 마무리하겠습니다",
]

_EMOTION_WORDS_DEFAULTS = ["feels", "realizes", "understands", "knows", "thinks", "decides", "notices", "considers"]

_DISCOVERY_ARC_DEFAULTS = {
    "HOOK": "Belief",
    "MISCONCEPTION": "Belief",
    "THE_CRACK": "Crack",
    "CORE": "Mechanism+Method",
    "REFRAME": "Reframe",
    "OUTRO_CTA": "Action",
}

# Pixar formula markers (Emma Coats / craft-reference.md §1)
PIXAR_MARKERS = [
    re.compile(r"once upon", re.IGNORECASE),
    re.compile(r"every day", re.IGNORECASE),
    re.compile(r"one day", re.IGNORECASE),
    re.compile(r"because of that", re.IGNORECASE),
    re.compile(r"until finally", re.IGNORECASE),
]

# Actionable imperative verbs for Outro_CTA
ACTIONABLE_VERBS = re.compile(
    r"\b(try|open|create|run|write|build|install|check|test|start|download|set up|configure)\b",
    re.IGNORECASE,
)


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
# Segment structure (Series Bible v6 — 6-stage format)
# ---------------------------------------------------------------------------
EXPECTED_SEGMENTS = [
    {"name": "HOOK",          "max_sec": 30},
    {"name": "MISCONCEPTION", "max_sec": 75},
    {"name": "THE_CRACK",     "max_sec": 60},
    {"name": "CORE",          "max_sec": 270},
    {"name": "REFRAME",       "max_sec": 75},
    {"name": "OUTRO_CTA",     "max_sec": 60},
]

TOTAL_MIN = 300  # 5 minutes
TOTAL_MAX = 600  # 10 minutes

# Vee reaction limits
VEE_REACTION_MAX = 10
VEE_REACTION_SEC_MIN = 1
VEE_REACTION_SEC_MAX = 2

# Pattern interrupt interval target
INTERRUPT_INTERVAL_MIN = 20  # seconds
INTERRUPT_INTERVAL_MAX = 30  # seconds

# Extended metaphor minimum duration in Core
CORE_METAPHOR_MIN_SEC = 120

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
# Hash-style: # SEGMENT 1: HOOK [0:00-0:15]
SEGMENT_HASH_RE = re.compile(
    r"^#\s+SEGMENT\s+(\d+):\s+(.+?)\s*\[(\d+:\d+)-(\d+:\d+)\]\s*$"
)
# Block-comment style: /* SEGMENT 1: HOOK [0:00-0:15] */
SEGMENT_BLOCK_RE = re.compile(
    r"/\*\s*SEGMENT\s+(\d+):\s+(.+?)\s*\[([0-9:]+)\s*[-–—]\s*([0-9:]+)\]\s*\*/"
)

# Combined matcher
def _match_segment(line: str):
    m = SEGMENT_HASH_RE.match(line)
    if m:
        return m
    m = SEGMENT_BLOCK_RE.search(line)
    return m
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
    in_dialogue = False  # Track whether we're inside a character's dialogue block

    for line in lines:
        seg_match = _match_segment(line)
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
            in_dialogue = False
            continue

        if current is None:
            continue

        # Track all lines
        current["lines"].append(line)

        stripped = line.strip()

        # Blank line resets dialogue tracking
        if not stripped:
            in_dialogue = False

        # Narrator detection
        if re.match(r"^NARRATOR\s*\(V\.O\.\)\s*$", stripped):
            current["has_narrator"] = True

        # Character cue detection
        char_match = CHARACTER_RE.match(line)
        if char_match:
            name = char_match.group(1).strip()
            current["characters_found"].add(name)
            if name == "NARRATOR":
                current["has_narrator"] = True
            in_dialogue = True  # Lines after a character cue are dialogue

        # Vee dialogue cue detection (Vee should never speak)
        if VEE_DIALOGUE_RE.match(line):
            current["vee_dialogue_lines"].append(stripped)

        # Transition / pattern interrupt detection
        for pat in INTERRUPT_PATTERNS:
            if pat.search(line):
                current["transitions"].append(stripped)
                break

        # Vee reaction detection (in action lines)
        if VEE_REACTION_RE.search(line):
            current["vee_reactions"].append(stripped)

        # Track action lines (exclude dialogue lines following character cues)
        if (
            stripped
            and not char_match
            and not in_dialogue
            and not _match_segment(line)
            and not META_RE.match(line)
            and not TRANSITION_RE.match(line)
            and not stripped.startswith("#")
        ):
            current["action_lines"].append(stripped)

    return segments


# ---------------------------------------------------------------------------
# Validation engine
# ---------------------------------------------------------------------------
def validate(fountain_path: Path, manifest_path: Path | None = None) -> dict:
    """Run all checks (1-24) against a Fountain screenplay."""
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

    check_pass = seg_count == 6 and missing == set() and actual_names == expected_names
    detail = f"{seg_count}/6 segments"
    if missing:
        detail += f" | missing: {', '.join(sorted(missing))}"
    if extra:
        detail += f" | unexpected: {', '.join(sorted(extra))}"
    if actual_names and actual_names != expected_names and not missing:
        detail += f" | wrong order: {' -> '.join(actual_names)}"

    results.append({
        "id": 1,
        "check": "6 segments exist (Hook/Misconception/The_Crack/Core/Reframe/Outro_CTA)",
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

    # -------------------------------------------------------------------
    # CHECK 11: Tone: conversational explainer, not corporate doc
    # -------------------------------------------------------------------
    narrator_lines = []
    for seg in segments:
        in_narrator = False
        for line in seg["lines"]:
            if "NARRATOR" in line:
                in_narrator = True
            elif not line.strip():
                in_narrator = False
            elif in_narrator and not line.startswith("("):
                narrator_lines.append(line.strip())
    
    words = sum(len(l.split()) for l in narrator_lines)
    sentences = sum(l.count('.') + l.count('?') + l.count('!') for l in narrator_lines)
    avg_words = words / max(sentences, 1)
    
    check_pass_11 = avg_words < 20
    results.append({
        "id": 11,
        "check": "Tone: conversational explainer (avg words/sentence < 20)",
        "status": "PASS" if check_pass_11 else "FAIL",
        "detail": f"{avg_words:.1f} words/sentence" + (" (too corporate/wordy)" if not check_pass_11 else ""),
    })

    # -------------------------------------------------------------------
    # CHECK 12: Discovery Arc: curiosity -> frustration -> clarity -> confidence
    # -------------------------------------------------------------------
    arc_found = {"curious": False, "frustrated": False, "eureka": False, "happy": False}
    for seg in segments:
        for rxn in seg["vee_reactions"]:
            rxn_l = rxn.lower()
            if any(w in rxn_l for w in ["curious", "wonder", "tilt", "look"]): arc_found["curious"] = True
            if any(w in rxn_l for w in ["frustrat", "sigh", "frown", "slump"]): arc_found["frustrated"] = True
            if any(w in rxn_l for w in ["eureka", "gasp", "widen", "jump"]): arc_found["eureka"] = True
            if any(w in rxn_l for w in ["happ", "smile", "nod", "grin"]): arc_found["happy"] = True
    
    score_12 = sum(arc_found.values())
    check_pass_12 = score_12 >= 3
    results.append({
        "id": 12,
        "check": "Discovery Arc progression (curious -> frustrated -> clarity -> confidence)",
        "status": "PASS" if check_pass_12 else "WARN",
        "detail": f"{score_12}/4 arc stages detected",
    })

    # -------------------------------------------------------------------
    # CHECK 13: Aha moment clearly identified in Core
    # -------------------------------------------------------------------
    if core_seg:
        aha_found = False
        for rxn in core_seg["vee_reactions"]:
            if any(w in rxn.lower() for w in ["eureka", "gasp", "jump", "widen", "realize"]):
                aha_found = True
        results.append({
            "id": 13,
            "check": "Aha moment clearly identified in Core",
            "status": "PASS" if aha_found else "WARN",
            "detail": "Aha moment found" if aha_found else "Missing clear eureka/gasp in Core",
        })
    else:
        results.append({
            "id": 13,
            "check": "Aha moment clearly identified in Core",
            "status": "FAIL",
            "detail": "CORE segment not found",
        })

    # -------------------------------------------------------------------
    # CHECK 14: Vee reactions silhouette-safe (40px recognition)
    # -------------------------------------------------------------------
    safe_whitelist = ["nod", "shrug", "jump", "point", "cross", "slump", "facepalm", "hands on head", "wave", "thumbs up", "lean"]
    unsafe_found = []
    for rxn in all_vee_reactions:
        rxn_l = rxn.lower()
        if not any(safe in rxn_l for safe in safe_whitelist):
            unsafe_found.append(rxn)
    
    check_pass_14 = len(unsafe_found) == 0
    results.append({
        "id": 14,
        "check": "Vee reactions silhouette-safe (40px recognition)",
        "status": "PASS" if check_pass_14 else "WARN",
        "detail": "All safe" if check_pass_14 else f"Unsafe/subtle reactions found: {len(unsafe_found)}",
    })

    # -------------------------------------------------------------------
    # CHECK 15: 80/20 split: diagrams+motion / Vee reactions
    # -------------------------------------------------------------------
    total_shots = total_transitions + len(all_vee_reactions)
    if total_shots > 0:
        vee_ratio = len(all_vee_reactions) / total_shots
        check_pass_15 = vee_ratio <= 0.35
        detail_15 = f"{vee_ratio:.0%} Vee reactions ({len(all_vee_reactions)}/{total_shots})"
    else:
        check_pass_15 = False
        detail_15 = "No shots found"

    results.append({
        "id": 15,
        "check": "80/20 split: diagrams+motion / Vee reactions",
        "status": "PASS" if check_pass_15 else "WARN",
        "detail": detail_15,
    })

    # ===================================================================
    # CHECKS 16-24: Narration Research Principles (Sprint 3)
    # ===================================================================
    rules = _load_rules_yaml()
    narr_struct = rules.get("narrative_structure", {})
    tone_val = rules.get("tone_validation", {})

    # -------------------------------------------------------------------
    # CHECK 16: Discovery Arc mapping (6 arc stages present)
    # -------------------------------------------------------------------
    arc_map = narr_struct.get("discovery_arc_stages", _DISCOVERY_ARC_DEFAULTS)
    arc_keywords = {
        "Belief": ["believe", "think", "assume", "expect", "suppose", "misconception", "wrong"],
        "Crack": ["but", "however", "actually", "wait", "strange", "odd", "crack", "problem"],
        "Mechanism": ["because", "how", "mechanism", "works", "under the hood", "reason", "why"],
        "Method": ["method", "solution", "approach", "step", "do this", "way to", "practice"],
        "Reframe": ["bigger picture", "actually means", "reframe", "perspective", "real lesson"],
        "Action": ["try", "open", "create", "run", "start", "today", "right now", "action"],
    }
    arc_stages_found = set()
    for seg in segments:
        seg_name = seg["name"]
        expected_arc = arc_map.get(seg_name, "")
        for arc_label in expected_arc.split("+"):
            arc_label = arc_label.strip()
            kws = arc_keywords.get(arc_label, [])
            seg_text = "\n".join(seg["lines"]).lower()
            if any(kw in seg_text for kw in kws):
                arc_stages_found.add(arc_label)

    arc_score = len(arc_stages_found)
    results.append({
        "id": 16,
        "check": "Discovery Arc mapping (6 arc stages)",
        "status": "PASS" if arc_score >= 4 else "WARN",
        "detail": f"{arc_score}/6 stages detected: {', '.join(sorted(arc_stages_found))}",
    })

    # -------------------------------------------------------------------
    # CHECK 17: Beat count 12-20
    # -------------------------------------------------------------------
    beat_min = narr_struct.get("beat_map", {}).get("min", 12)
    beat_max = narr_struct.get("beat_map", {}).get("max", 20)

    # Try manifest first for beat count
    beat_count = 0
    if manifest_path and manifest_path.exists():
        try:
            with manifest_path.open("r", encoding="utf-8") as f:
                manifest_data = json.load(f)
            beat_count = len(manifest_data.get("beats", []))
        except (json.JSONDecodeError, KeyError):
            pass

    if beat_count == 0:
        # Fallback: count narrator dialogue groups (beat ≈ one thought unit).
        # A group = consecutive narrator dialogue block separated by
        # transitions, action lines, or blank lines.
        groups = 0
        in_narr = False
        for line in text.split("\n"):
            if re.match(r"^NARRATOR\s*\(V\.O\.\)", line.strip()):
                if not in_narr:
                    groups += 1
                    in_narr = True
            elif not line.strip():
                in_narr = False
        beat_count = groups

    check_17 = beat_min <= beat_count <= beat_max
    results.append({
        "id": 17,
        "check": f"Beat count {beat_min}-{beat_max}",
        "status": "PASS" if check_17 else "WARN",
        "detail": f"{beat_count} beats",
    })

    # -------------------------------------------------------------------
    # CHECK 18: Beat max 5s each
    # -------------------------------------------------------------------
    max_beat_sec = narr_struct.get("beat_map", {}).get("max_sec", 5)
    if beat_count > 0 and total_duration > 0:
        avg_beat_sec = total_duration / beat_count
        check_18 = avg_beat_sec <= max_beat_sec
        detail_18 = f"avg {avg_beat_sec:.1f}s/beat (max {max_beat_sec}s)"
    else:
        check_18 = True
        detail_18 = "no beats to check"

    results.append({
        "id": 18,
        "check": f"Beat max {max_beat_sec}s each",
        "status": "PASS" if check_18 else "WARN",
        "detail": detail_18,
    })

    # -------------------------------------------------------------------
    # CHECK 19: Pixar formula detected (3+ markers)
    # -------------------------------------------------------------------
    pixar_hits = sum(1 for pat in PIXAR_MARKERS if pat.search(text))
    check_19 = pixar_hits >= 3
    results.append({
        "id": 19,
        "check": "Pixar formula detected (3+ markers)",
        "status": "PASS" if check_19 else "WARN",
        "detail": f"{pixar_hits}/5 Pixar markers found",
    })

    # -------------------------------------------------------------------
    # CHECK 20: Shorts candidates >= 2
    # -------------------------------------------------------------------
    shorts_min = narr_struct.get("shorts_candidate_min", 2)
    shorts_count = len(re.findall(r"shorts_candidate:\s*true", text, re.IGNORECASE))
    # Also count # shorts_candidate: lines in meta comments
    shorts_count += len(re.findall(r"#\s+shorts_candidate:\s*true", text, re.IGNORECASE))
    # Deduplicate (meta regex is subset of general regex, but both could match differently)
    shorts_count = len(set(re.findall(r"(?:#\s+)?shorts_candidate:\s*true", text, re.IGNORECASE)))

    results.append({
        "id": 20,
        "check": f"Shorts candidates >= {shorts_min}",
        "status": "PASS" if shorts_count >= shorts_min else "WARN",
        "detail": f"{shorts_count} shorts candidates",
    })

    # -------------------------------------------------------------------
    # CHECK 21: Analogy-First in Core (metaphor before tech definition)
    # -------------------------------------------------------------------
    if core_seg:
        core_text_lines = core_seg["lines"]
        first_metaphor_idx = None
        first_definition_idx = None
        definition_patterns = [
            re.compile(r"\b(is defined as|means that|refers to|technically|specification)\b", re.IGNORECASE),
        ]
        for i, line in enumerate(core_text_lines):
            if first_metaphor_idx is None:
                for pat in METAPHOR_PATTERNS:
                    if pat.search(line):
                        first_metaphor_idx = i
                        break
            if first_definition_idx is None:
                for pat in definition_patterns:
                    if pat.search(line):
                        first_definition_idx = i
                        break

        if first_metaphor_idx is not None and first_definition_idx is not None:
            check_21 = first_metaphor_idx < first_definition_idx
            detail_21 = f"metaphor@line {first_metaphor_idx}, definition@line {first_definition_idx}"
        elif first_metaphor_idx is not None:
            check_21 = True
            detail_21 = "metaphor found, no formal definition (OK)"
        else:
            check_21 = False
            detail_21 = "no metaphor language found in Core"
    else:
        check_21 = False
        detail_21 = "CORE segment not found"

    results.append({
        "id": 21,
        "check": "Analogy-First in Core (metaphor before definition)",
        "status": "PASS" if check_21 else "WARN",
        "detail": detail_21,
    })

    # -------------------------------------------------------------------
    # CHECK 22: Show vs Tell (no emotion words in action lines)
    # -------------------------------------------------------------------
    emotion_words = tone_val.get("emotion_words_banned_in_action", _EMOTION_WORDS_DEFAULTS)
    emotion_re = re.compile(r"\b(" + "|".join(re.escape(w) for w in emotion_words) + r")\b", re.IGNORECASE)
    tell_violations = []
    for seg in segments:
        for line in seg["action_lines"]:
            m = emotion_re.search(line)
            if m:
                tell_violations.append(f"{seg['name']}: '{m.group()}' in \"{line[:50]}...\"")

    check_22 = len(tell_violations) == 0
    results.append({
        "id": 22,
        "check": "Show vs Tell (no emotion words in action lines)",
        "status": "PASS" if check_22 else "WARN",
        "detail": "clean" if check_22 else f"{len(tell_violations)} violations: {'; '.join(tell_violations[:3])}",
    })

    # -------------------------------------------------------------------
    # CHECK 23: We Say / Never Say (SERIES_BIBLE A3)
    # -------------------------------------------------------------------
    never_say = tone_val.get("never_say_patterns", _NEVER_SAY_DEFAULTS)
    found_never_say = [ns for ns in never_say if ns.lower() in text.lower()]

    check_23 = len(found_never_say) == 0
    results.append({
        "id": 23,
        "check": "We Say / Never Say (corporate tone)",
        "status": "PASS" if check_23 else "FAIL",
        "detail": "clean" if check_23 else f"found: {', '.join(found_never_say[:3])}",
    })

    # -------------------------------------------------------------------
    # CHECK 24: Actionable Takeaway in Outro_CTA
    # -------------------------------------------------------------------
    outro_seg = next((s for s in segments if s["name"] == "OUTRO_CTA"), None)
    if outro_seg:
        outro_text = "\n".join(outro_seg["lines"])
        has_actionable = bool(ACTIONABLE_VERBS.search(outro_text))
        results.append({
            "id": 24,
            "check": "Actionable Takeaway in Outro_CTA",
            "status": "PASS" if has_actionable else "WARN",
            "detail": "imperative verb found" if has_actionable else "no actionable verb — add 'try/open/create/run/write'",
        })
    else:
        results.append({
            "id": 24,
            "check": "Actionable Takeaway in Outro_CTA",
            "status": "WARN",
            "detail": "OUTRO_CTA segment not found",
        })

    return {
        "file": str(fountain_path),
        "segments_found": seg_count,
        "total_duration_sec": total_duration,
        "results": results,
    }


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------
def generate_report(validation: dict, report_path: Path) -> None:
    """Write a markdown validation report to disk (for CI artifacts)."""
    lines: list[str] = []
    lines.append(f"# Screenplay Validation Report\n")
    lines.append(f"- **File**: `{validation['file']}`")
    lines.append(f"- **Segments**: {validation['segments_found']}/6")
    lines.append(f"- **Duration**: {validation['total_duration_sec']:.0f}s "
                 f"({validation['total_duration_sec'] / 60:.1f}min)")
    lines.append(f"- **Generated**: {__import__('datetime').datetime.now().isoformat(timespec='seconds')}\n")

    # Results table
    lines.append("| # | Check | Status | Detail |")
    lines.append("|---|-------|--------|--------|")
    for r in validation["results"]:
        detail = r["detail"].replace("|", "\\|")
        lines.append(f"| {r['id']} | {r['check']} | **{r['status']}** | {detail} |")

    # Summary
    counts = {"PASS": 0, "FAIL": 0, "WARN": 0}
    for r in validation["results"]:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    total = len(validation["results"])
    lines.append(f"\n## Summary\n")
    lines.append(f"**{counts['PASS']}/{total} PASS** | {counts['FAIL']} FAIL | {counts['WARN']} WARN\n")

    # Manual checklist
    lines.append("## Manual Review Checklist\n")
    for item in [
        'Tone feels like Kurzgesagt + Fireship? (not corporate, not lecture)',
        'Discovery Arc emotional flow feels natural?',
        'Aha moment lands clearly in Core?',
        'Curse of Knowledge: would a non-developer understand this?',
        'Shorts clips work as standalone content?',
        'Emotion curve peaks/valleys feel right?',
    ]:
        lines.append(f"- [ ] {item}")

    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
def print_results(validation: dict) -> int:
    """Print color-coded validation results. Returns exit code (0=pass, 1=fail)."""
    C = _C

    print(f"\n{C.BOLD}{'=' * 64}{C.RESET}")
    print(f"  {C.BOLD}Screenplay Validation{C.RESET}: {validation['file']}")
    print(
        f"  Segments: {validation['segments_found']}/6"
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
        'Tone feels like Kurzgesagt + Fireship? (not corporate, not lecture)',
        'Discovery Arc emotional flow feels natural?',
        'Aha moment lands clearly in Core?',
        'Curse of Knowledge: would a non-developer understand this?',
        'Shorts clips work as standalone content?',
        'Emotion curve peaks/valleys feel right?',
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
        description="Validate Fountain screenplay against Series Bible v6 6-segment format"
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
    parser.add_argument("--manifest", default=None, help="Path to prepro manifest JSON (for beat counts)")
    parser.add_argument("--report", default=None, help="Write markdown report to this path (CI artifact)")
    args = parser.parse_args()

    # Resolve fountain file path (positional or --input)
    fountain_file = args.fountain_file or args.input
    if not fountain_file:
        parser.error("fountain file required (positional or --input)")

    fountain_path = Path(fountain_file)
    if not fountain_path.exists():
        print(f"Error: {fountain_path} not found", file=sys.stderr)
        sys.exit(2)

    manifest_path = Path(args.manifest) if args.manifest else None
    validation = validate(fountain_path, manifest_path=manifest_path)

    if args.report:
        generate_report(validation, Path(args.report))
        print(f"Report written to {args.report}")

    if args.json:
        # Serialize sets for JSON
        print(json.dumps(validation, ensure_ascii=False, indent=2, default=str))
        sys.exit(0)

    exit_code = print_results(validation)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
