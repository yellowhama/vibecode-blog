#!/usr/bin/env python3
"""Validate pre-production artifacts (topic card, topic brief, evaluation).

7 checks (P1-P7) enforce Phase 0 + 0.5 gates before screenplay writing.

Usage:
    python validate_preproduction.py --episode 01
    python validate_preproduction.py --episode 01 --json
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
# Paths
# ---------------------------------------------------------------------------
REPO = Path("/mnt/e/vibecode-blog")
SYSTEMS = REPO / "systems" / "video"
PREPRO = SYSTEMS / "preproduction"
RULES_PATH = SYSTEMS / "pipeline" / "config" / "tts_rules.yaml"


# ---------------------------------------------------------------------------
# ANSI colors (shared with validate_screenplay.py)
# ---------------------------------------------------------------------------
class _C:
    PASS = "\033[92m"
    FAIL = "\033[91m"
    WARN = "\033[93m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


# ---------------------------------------------------------------------------
# Config loader
# ---------------------------------------------------------------------------
_DEFAULTS = {
    "topic_card_required_sections": ["실패", "3-5분 후", "내러티브 구조"],
    "topic_brief_min_data_points": 5,
    "evaluation_min_score": 18,
}


def _load_gates_config() -> dict[str, Any]:
    """Load preproduction_gates from tts_rules.yaml, fallback to defaults."""
    if yaml and RULES_PATH.exists():
        with RULES_PATH.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return data.get("preproduction_gates", _DEFAULTS)
    return _DEFAULTS


# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------
def _find_file(ep_dir: Path, pattern: str) -> Path | None:
    """Find the latest file matching a glob pattern."""
    matches = sorted(ep_dir.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0] if matches else None


def _find_topic_card(ep_dir: Path, ep: str) -> Path | None:
    return _find_file(ep_dir, f"ep{ep}_topic_card*.md") or _find_file(ep_dir, "*topic_card*.md")


def _find_topic_brief(ep_dir: Path, ep: str) -> Path | None:
    return _find_file(ep_dir, f"ep{ep}_topic_brief*.md") or _find_file(ep_dir, "*topic_brief*.md")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _has_section(text: str, keyword: str) -> bool:
    """Check if a markdown heading or bold list item contains the keyword."""
    escaped = re.escape(keyword)
    # Match headings: ## Foo / ### Foo
    heading = re.compile(r"^#{1,4}\s+.*" + escaped, re.MULTILINE | re.IGNORECASE)
    if heading.search(text):
        return True
    # Match bold list items: - **keyword** or * **keyword**
    bold_item = re.compile(r"^[-*]\s+\*\*.*" + escaped, re.MULTILINE | re.IGNORECASE)
    return bool(bold_item.search(text))


def _count_subheadings(text: str, parent_heading: str) -> int:
    """Count ### subheadings under a ## parent heading."""
    lines = text.split("\n")
    in_section = False
    count = 0
    for line in lines:
        if re.match(r"^##\s+" + re.escape(parent_heading), line, re.IGNORECASE):
            in_section = True
            continue
        if in_section and re.match(r"^##\s+", line) and not re.match(r"^###", line):
            break  # next ## section
        if in_section and re.match(r"^###\s+", line):
            count += 1
    return count


def _count_table_rows(text: str, parent_heading: str) -> int:
    """Count markdown table data rows under a ## parent heading."""
    lines = text.split("\n")
    in_section = False
    count = 0
    header_seen = False
    for line in lines:
        if re.match(r"^##\s+" + re.escape(parent_heading), line, re.IGNORECASE):
            in_section = True
            continue
        if in_section and re.match(r"^##\s+", line) and not re.match(r"^###", line):
            break
        if in_section and "|" in line:
            stripped = line.strip()
            if re.match(r"^\|[-\s|:]+\|$", stripped):
                header_seen = True
                continue
            if header_seen and stripped.startswith("|"):
                count += 1
            elif not header_seen and stripped.startswith("|"):
                # Could be header row, skip
                continue
    return count


def _extract_eval_score(text: str) -> int | None:
    """Extract evaluation score like '18/25' or '20 / 25'."""
    m = re.search(r"(\d{1,2})\s*/\s*25", text)
    if m:
        return int(m.group(1))
    return None


def _has_narrative_structure_check(text: str) -> bool:
    """Check if a narrative structure is selected ([x] Problem-Solution or [x] Mystery-Reveal)."""
    return bool(re.search(r"\[x\]\s*(Problem-Solution|Mystery-Reveal)", text, re.IGNORECASE))


# ---------------------------------------------------------------------------
# Validation engine
# ---------------------------------------------------------------------------
def validate(ep: str) -> dict[str, Any]:
    """Run 7 pre-production checks (P1-P7)."""
    ep = ep.zfill(2)
    ep_dir = PREPRO / f"ep{ep}"
    config = _load_gates_config()
    results: list[dict[str, Any]] = []

    # --- Find files ---
    topic_card_path = _find_topic_card(ep_dir, ep)
    topic_brief_path = _find_topic_brief(ep_dir, ep)

    topic_card_text = ""
    topic_brief_text = ""
    if topic_card_path and topic_card_path.exists():
        topic_card_text = topic_card_path.read_text(encoding="utf-8")
    if topic_brief_path and topic_brief_path.exists():
        topic_brief_text = topic_brief_path.read_text(encoding="utf-8")

    required_sections = config.get("topic_card_required_sections", _DEFAULTS["topic_card_required_sections"])
    min_data_points = config.get("topic_brief_min_data_points", _DEFAULTS["topic_brief_min_data_points"])
    min_score = config.get("evaluation_min_score", _DEFAULTS["evaluation_min_score"])

    # -------------------------------------------------------------------
    # P1: Topic Card 실패 장면 존재
    # -------------------------------------------------------------------
    if not topic_card_text:
        p1_pass = False
        p1_detail = f"topic card not found in {ep_dir}"
    else:
        # Accept bilingual headings: 실패 / Failure / 착각 / 실패 장면
        p1_keywords = [required_sections[0], "Failure", "착각", "실패 장면"]
        p1_pass = any(_has_section(topic_card_text, kw) for kw in p1_keywords)
        matched = next((kw for kw in p1_keywords if _has_section(topic_card_text, kw)), None)
        p1_detail = f"'{matched}' section found" if p1_pass else f"none of {p1_keywords} found"

    results.append({"id": "P1", "check": "Topic Card: failure scene exists", "status": "PASS" if p1_pass else "FAIL", "detail": p1_detail})

    # -------------------------------------------------------------------
    # P2: Topic Card 결과 한 줄 존재
    # -------------------------------------------------------------------
    if not topic_card_text:
        p2_pass = False
        p2_detail = "topic card not found"
    else:
        # Accept bilingual headings: 3-5분 후 / Outcome / 깨달음 / 알게 되는 것 / After 3-5
        p2_keywords = [required_sections[1], "Outcome", "깨달음", "알게 되는 것", "After 3-5"]
        p2_pass = any(_has_section(topic_card_text, kw) for kw in p2_keywords)
        matched = next((kw for kw in p2_keywords if _has_section(topic_card_text, kw)), None)
        p2_detail = f"'{matched}' section found" if p2_pass else f"none of {p2_keywords} found"

    results.append({"id": "P2", "check": "Topic Card: outcome one-liner exists", "status": "PASS" if p2_pass else "FAIL", "detail": p2_detail})

    # -------------------------------------------------------------------
    # P3: Topic Card 내러티브 구조 선택
    # -------------------------------------------------------------------
    if not topic_card_text:
        p3_pass = False
        p3_detail = "topic card not found"
    else:
        p3_pass = _has_narrative_structure_check(topic_card_text)
        p3_detail = "narrative structure " + ("selected" if p3_pass else "not selected — mark [x] Problem-Solution or [x] Mystery-Reveal")

    results.append({"id": "P3", "check": "Topic Card: narrative structure selected", "status": "PASS" if p3_pass else "WARN", "detail": p3_detail})

    # -------------------------------------------------------------------
    # P4: Topic Brief 5+ 리서치 답변
    # -------------------------------------------------------------------
    if not topic_brief_text:
        p4_pass = False
        p4_detail = "topic brief not found"
    else:
        sub_count = _count_subheadings(topic_brief_text, "Part 1")
        if sub_count == 0:
            # Fallback: count all ### headings in the doc
            sub_count = len(re.findall(r"^###\s+", topic_brief_text, re.MULTILINE))
        p4_pass = sub_count >= 5
        p4_detail = f"{sub_count} research answers (need >= 5)"

    results.append({"id": "P4", "check": "Topic Brief: 5+ research answers", "status": "PASS" if p4_pass else "FAIL", "detail": p4_detail})

    # -------------------------------------------------------------------
    # P5: Topic Brief 5+ 데이터 포인트
    # -------------------------------------------------------------------
    if not topic_brief_text:
        p5_pass = False
        p5_detail = "topic brief not found"
    else:
        data_rows = _count_table_rows(topic_brief_text, "Part 2")
        if data_rows == 0:
            # Fallback: count bullet points with numbers/metrics
            data_rows = len(re.findall(r"^\s*[-*]\s+.*\d+", topic_brief_text, re.MULTILINE))
        p5_pass = data_rows >= min_data_points
        p5_detail = f"{data_rows} data points (need >= {min_data_points})"

    results.append({"id": "P5", "check": f"Topic Brief: {min_data_points}+ data points", "status": "PASS" if p5_pass else "FAIL", "detail": p5_detail})

    # -------------------------------------------------------------------
    # P6: Evaluation 점수 존재
    # -------------------------------------------------------------------
    # Check both topic card and topic brief for eval score
    combined_text = topic_card_text + "\n" + topic_brief_text
    eval_score = _extract_eval_score(combined_text)

    p6_pass = eval_score is not None
    p6_detail = f"score: {eval_score}/25" if eval_score is not None else "no /25 score found"

    results.append({"id": "P6", "check": "Evaluation score exists", "status": "PASS" if p6_pass else "WARN", "detail": p6_detail})

    # -------------------------------------------------------------------
    # P7: Evaluation >= 18/25 (B+)
    # -------------------------------------------------------------------
    if eval_score is not None:
        p7_pass = eval_score >= min_score
        p7_detail = f"{eval_score}/25 {'≥' if p7_pass else '<'} {min_score} (B+)"
    else:
        p7_pass = False
        p7_detail = f"no score to evaluate (need >= {min_score}/25)"

    results.append({"id": "P7", "check": f"Evaluation >= {min_score}/25 (B+)", "status": "PASS" if p7_pass else "FAIL", "detail": p7_detail})

    return {
        "episode": ep,
        "topic_card": str(topic_card_path) if topic_card_path else None,
        "topic_brief": str(topic_brief_path) if topic_brief_path else None,
        "results": results,
    }


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
def print_results(validation: dict) -> int:
    """Print color-coded results. Returns 0 if all pass, 1 if any fail."""
    C = _C

    print(f"\n{C.BOLD}{'=' * 64}{C.RESET}")
    print(f"  {C.BOLD}Pre-Production Validation{C.RESET}: EP{validation['episode']}")
    print(f"  Topic Card: {validation['topic_card'] or 'NOT FOUND'}")
    print(f"  Topic Brief: {validation['topic_brief'] or 'NOT FOUND'}")
    print(f"{C.BOLD}{'=' * 64}{C.RESET}\n")

    has_fail = False
    counts = {"PASS": 0, "FAIL": 0, "WARN": 0}

    for r in validation["results"]:
        status = r["status"]
        counts[status] = counts.get(status, 0) + 1
        if status == "FAIL":
            has_fail = True
            color = C.FAIL
        elif status == "WARN":
            color = C.WARN
        else:
            color = C.PASS

        print(f"  {color}[{status}]{C.RESET} {r['id']}: {r['check']}")
        print(f"         {C.DIM}{r['detail']}{C.RESET}")

    total = len(validation["results"])
    summary_color = C.PASS if not has_fail else C.FAIL
    print(f"\n{C.BOLD}{'=' * 64}{C.RESET}")
    print(
        f"  {summary_color}{C.BOLD}Result: "
        f"{counts['PASS']}/{total} PASS | {counts['FAIL']} FAIL | {counts['WARN']} WARN"
        f"{C.RESET}"
    )
    print(f"{C.BOLD}{'=' * 64}{C.RESET}\n")

    return 1 if has_fail else 0


# ---------------------------------------------------------------------------
# Public API (for import by manifest_validator.py)
# ---------------------------------------------------------------------------
def validate_preproduction_gate(ep: str) -> bool:
    """Run pre-production validation, return True if passed."""
    result = validate(ep)
    fails = [r for r in result["results"] if r["status"] == "FAIL"]
    return len(fails) == 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Validate pre-production artifacts (topic card + brief + evaluation)"
    )
    parser.add_argument("--episode", "-e", required=True, help="Episode number (01, 02, ...)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    validation = validate(args.episode)

    if args.json:
        print(json.dumps(validation, ensure_ascii=False, indent=2, default=str))
        sys.exit(0)

    exit_code = print_results(validation)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
