#!/usr/bin/env python3
"""Validate a Fountain screenplay against the 5-segment episode format.

Runs automated checks and outputs a manual review checklist.

Usage:
    python validate_screenplay.py --input ep01_script.fountain
    python validate_screenplay.py --input ep01_script.fountain --storyform branding/storyform.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Regex patterns (shared with parse_fountain_to_prepro.py)
# ---------------------------------------------------------------------------
SEGMENT_RE = re.compile(
    r"^#\s+SEGMENT\s+(\d+):\s+(.+?)\s*\[(\d+:\d+)-(\d+:\d+)\]\s*$"
)
META_RE = re.compile(r"^#\s+(visual_type|characters|shorts_candidate):\s*(.+)$")
CHARACTER_RE = re.compile(r"^([A-Z][A-Z\s]+?)(?:\s*\(V\.O\.\))?\s*$")
TIMECODE_RE = re.compile(r"(\d+):(\d+)")
TRANSITION_RE = re.compile(r"^>\s+(.+)$")

# ---------------------------------------------------------------------------
# Expected segment structure
# ---------------------------------------------------------------------------
EXPECTED_SEGMENTS = [
    {"name": "HOOK", "visual_type": "sitcom", "min_sec": 15, "max_sec": 30},
    {"name": "SITCOM ACT 1", "visual_type": "sitcom", "min_sec": 60, "max_sec": 90},
    {"name": "EXPLAINER", "visual_type": "explainer", "min_sec": 90, "max_sec": 120},
    {"name": "SITCOM ACT 2", "visual_type": "sitcom", "min_sec": 60, "max_sec": 90},
    {"name": "ENDING", "visual_type": "sitcom", "min_sec": 15, "max_sec": 30},
]

TOTAL_MIN = 240  # 4 minutes
TOTAL_MAX = 480  # 8 minutes


def _parse_timecode(tc: str) -> float:
    m = TIMECODE_RE.match(tc)
    if not m:
        return 0.0
    return int(m.group(1)) * 60 + int(m.group(2))


def _parse_characters_field(raw: str) -> list[str]:
    raw = raw.strip()
    if raw in ("[]", ""):
        return []
    return [c.strip().lower() for c in raw.split(",") if c.strip()]


def parse_segments(text: str) -> list[dict[str, Any]]:
    """Extract segments from fountain text."""
    lines = text.split("\n")
    segments: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for line in lines:
        seg_match = SEGMENT_RE.match(line)
        if seg_match:
            current = {
                "number": int(seg_match.group(1)),
                "name": seg_match.group(2).strip(),
                "start": seg_match.group(3),
                "end": seg_match.group(4),
                "start_sec": _parse_timecode(seg_match.group(3)),
                "end_sec": _parse_timecode(seg_match.group(4)),
                "visual_type": None,
                "characters_field": None,
                "characters_found": set(),
                "has_narrator": False,
                "has_transition": False,
                "lines": [],
            }
            segments.append(current)
            continue

        if current is None:
            continue

        meta_match = META_RE.match(line)
        if meta_match:
            key, val = meta_match.group(1), meta_match.group(2).strip()
            if key == "visual_type":
                current["visual_type"] = val
            elif key == "characters":
                current["characters_field"] = _parse_characters_field(val)
            continue

        char_match = CHARACTER_RE.match(line)
        if char_match:
            name = char_match.group(1).strip()
            current["characters_found"].add(name)
            if name == "NARRATOR":
                current["has_narrator"] = True

        if TRANSITION_RE.match(line):
            current["has_transition"] = True

        current["lines"].append(line)

    return segments


def load_prohibited(storyform_path: Path | None) -> list[str]:
    """Load prohibited expressions from storyform.json."""
    if storyform_path is None or not storyform_path.exists():
        return []
    data = json.loads(storyform_path.read_text(encoding="utf-8"))
    return data.get("voice_constraints", {}).get("prohibited", [])


def check_prohibited(text: str, prohibited: list[str]) -> list[str]:
    """Return list of found prohibited expressions."""
    found = []
    text_lower = text.lower()
    for expr in prohibited:
        if expr.lower() in text_lower:
            found.append(expr)
    return found


def validate(fountain_path: Path, storyform_path: Path | None = None) -> dict:
    """Run all validations, return results dict."""
    text = fountain_path.read_text(encoding="utf-8")
    segments = parse_segments(text)
    prohibited = load_prohibited(storyform_path)

    results: list[dict[str, Any]] = []
    warnings: list[str] = []
    total_duration = 0.0

    # --- Check 1: Segment count ---
    seg_count = len(segments)
    results.append({
        "check": "세그먼트 5개 존재",
        "status": "PASS" if seg_count == 5 else "FAIL",
        "detail": f"{seg_count}개 발견",
    })

    # --- Check 2: Segment order ---
    actual_names = [s["name"] for s in segments]
    expected_names = [e["name"] for e in EXPECTED_SEGMENTS]
    order_ok = actual_names == expected_names
    results.append({
        "check": "올바른 순서 (HOOK → SITCOM1 → EXPLAINER → SITCOM2 → ENDING)",
        "status": "PASS" if order_ok else "FAIL",
        "detail": " → ".join(actual_names) if not order_ok else "OK",
    })

    # --- Check 3-7: Per-segment checks ---
    for i, seg in enumerate(segments):
        duration = seg["end_sec"] - seg["start_sec"]
        total_duration += duration

        if i < len(EXPECTED_SEGMENTS):
            expected = EXPECTED_SEGMENTS[i]

            # Timing range
            in_range = expected["min_sec"] <= duration <= expected["max_sec"]
            results.append({
                "check": f"{seg['name']} 타이밍 ({expected['min_sec']}-{expected['max_sec']}s)",
                "status": "PASS" if in_range else "FAIL",
                "detail": f"{duration:.0f}s",
            })

            # Narrator required in ALL segments (narrator-only format)
            if not seg["has_narrator"]:
                results.append({
                    "check": f"{seg['name']} NARRATOR (V.O.) 존재",
                    "status": "FAIL",
                    "detail": "NARRATOR 없음",
                })
            else:
                results.append({
                    "check": f"{seg['name']} NARRATOR (V.O.) 존재",
                    "status": "PASS",
                    "detail": "OK",
                })

            # No character dialogue in any segment (narrator-only)
            if expected["visual_type"] == "sitcom":
                non_narrator = seg["characters_found"] - {"NARRATOR"}
                if non_narrator:
                    results.append({
                        "check": f"{seg['name']} 캐릭터 대사 없음 (내레이션 온리)",
                        "status": "WARN",
                        "detail": f"캐릭터 음성 발견: {', '.join(non_narrator)} — 비주얼 전용인지 확인",
                    })
                else:
                    results.append({
                        "check": f"{seg['name']} 캐릭터 대사 없음 (내레이션 온리)",
                        "status": "PASS",
                        "detail": "OK",
                    })

            # Explainer: only NARRATOR
            if expected["visual_type"] == "explainer":
                non_narrator = seg["characters_found"] - {"NARRATOR"}
                if non_narrator:
                    results.append({
                        "check": f"{seg['name']} 해설에 NARRATOR만 있음",
                        "status": "FAIL",
                        "detail": f"다른 캐릭터 발견: {', '.join(non_narrator)}",
                    })
                elif not seg["has_narrator"]:
                    results.append({
                        "check": f"{seg['name']} 해설에 NARRATOR만 있음",
                        "status": "WARN",
                        "detail": "NARRATOR 없음 (해설인데 내레이션 없음?)",
                    })
                else:
                    results.append({
                        "check": f"{seg['name']} 해설에 NARRATOR만 있음",
                        "status": "PASS",
                        "detail": "OK",
                    })

            # Explainer characters field = []
            if expected["visual_type"] == "explainer" and seg["characters_field"] is not None:
                chars_empty = len(seg["characters_field"]) == 0
                results.append({
                    "check": f"{seg['name']} 해설 characters = []",
                    "status": "PASS" if chars_empty else "FAIL",
                    "detail": str(seg["characters_field"]) if not chars_empty else "[]",
                })

    # --- Check 8: Total duration ---
    results.append({
        "check": f"총 길이 {TOTAL_MIN}-{TOTAL_MAX}초",
        "status": "PASS" if TOTAL_MIN <= total_duration <= TOTAL_MAX else "FAIL",
        "detail": f"{total_duration:.0f}s ({total_duration/60:.1f}분)",
    })

    # --- Check 9: Prohibited expressions ---
    found_prohibited = check_prohibited(text, prohibited)
    results.append({
        "check": "금지 표현 0개",
        "status": "PASS" if len(found_prohibited) == 0 else "FAIL",
        "detail": ", ".join(found_prohibited) if found_prohibited else "없음",
    })

    # --- Check 10: Transitions at sitcom↔explainer boundaries ---
    transition_checks = []
    for i, seg in enumerate(segments):
        if i > 0:
            prev_type = segments[i - 1].get("visual_type", "")
            curr_type = seg.get("visual_type", "")
            if prev_type != curr_type:
                has_trans = segments[i - 1].get("has_transition", False) or seg.get("has_transition", False)
                transition_checks.append((f"{segments[i-1]['name']}→{seg['name']}", has_trans))

    all_transitions = all(t[1] for t in transition_checks) if transition_checks else False
    missing = [t[0] for t in transition_checks if not t[1]]
    results.append({
        "check": "시트콤↔해설 전환 지시 존재",
        "status": "PASS" if all_transitions else "WARN",
        "detail": f"누락: {', '.join(missing)}" if missing else "OK",
    })

    return {
        "file": str(fountain_path),
        "segments_found": seg_count,
        "total_duration_sec": total_duration,
        "results": results,
        "warnings": warnings,
    }


def print_results(validation: dict) -> int:
    """Print validation results. Returns exit code (0=pass, 1=fail)."""
    print(f"\n{'='*60}")
    print(f"  Screenplay Validation: {validation['file']}")
    print(f"  세그먼트: {validation['segments_found']}개 | 총 길이: {validation['total_duration_sec']:.0f}s")
    print(f"{'='*60}\n")

    has_fail = False
    for r in validation["results"]:
        status = r["status"]
        icon = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️"}.get(status, "?")
        print(f"  {icon} [{status}] {r['check']}: {r['detail']}")
        if status == "FAIL":
            has_fail = True

    # Manual review checklist
    print(f"\n{'─'*60}")
    print("  수동 리뷰 체크리스트")
    print(f"{'─'*60}\n")
    print("  [ ] 서클 클로저: ENDING이 HOOK의 위기를 거울처럼 비추는가?")
    print("      HOOK 위기: ___________")
    print("      ENDING 거울: ___________")
    print()
    print("  [ ] Opening Image ↔ Final Image: 같은 상황, 다른 반응?")
    print("      오프닝 이미지: ___________")
    print("      파이널 이미지: ___________")
    print()
    print("  [ ] Vee 감정 아크: HOOK 감정 ≠ ENDING 감정?")
    print("      시작: _____ → 끝: _____")
    print()
    print("  [ ] 정보 경로: 정보가 순서대로 전달되는가?")
    print("      정보 1: ___________")
    print("      정보 2: ___________")
    print("      정보 N: ___________")
    print()
    print("  [ ] Curse of Knowledge: 바이브코딩 안 해본 사람이 이해하는가?")
    print()
    print("  [ ] 비주얼 코미디: 시트콤 세그먼트마다 비주얼 개그 2개+?")
    print()
    print("  [ ] 내레이션 온리: 모든 음성이 NARRATOR (V.O.)인가?")
    print()
    print("  [ ] 다음편 떡밥: 다음 EP의 HOOK과 연결되는가?")
    print("      떡밥: ___________")
    print("      다음편 HOOK: ___________")
    print()

    # Summary
    pass_count = sum(1 for r in validation["results"] if r["status"] == "PASS")
    fail_count = sum(1 for r in validation["results"] if r["status"] == "FAIL")
    warn_count = sum(1 for r in validation["results"] if r["status"] == "WARN")
    total = len(validation["results"])

    print(f"{'='*60}")
    print(f"  결과: {pass_count}/{total} PASS | {fail_count} FAIL | {warn_count} WARN")
    print(f"{'='*60}\n")

    return 1 if has_fail else 0


def main():
    parser = argparse.ArgumentParser(description="Fountain 대본 구조 검증")
    parser.add_argument("--input", required=True, help="Fountain 파일 경로")
    parser.add_argument(
        "--storyform",
        default=None,
        help="storyform.json 경로 (금지 표현 검증용)",
    )
    parser.add_argument("--json", action="store_true", help="JSON 출력")
    args = parser.parse_args()

    fountain_path = Path(args.input)
    if not fountain_path.exists():
        print(f"Error: {fountain_path} not found", file=sys.stderr)
        sys.exit(2)

    storyform_path = Path(args.storyform) if args.storyform else None

    # Auto-detect storyform.json relative to script location
    if storyform_path is None:
        candidates = [
            fountain_path.parent / "../../../../branding/storyform.json",
            Path(__file__).parent / "../../../../branding/storyform.json",
        ]
        for c in candidates:
            resolved = c.resolve()
            if resolved.exists():
                storyform_path = resolved
                break

    validation = validate(fountain_path, storyform_path)

    if args.json:
        print(json.dumps(validation, ensure_ascii=False, indent=2))
        sys.exit(0)

    exit_code = print_results(validation)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
