#!/usr/bin/env python3
"""Pre-process prepro manifest for TTS: pronunciation fixes, pause insertion, emotion curves.

Adds tts_text, tts_exaggeration, tts_cfg_weight fields to each beat.
Idempotent: always regenerates from narration_text (ignores prior tts_text).
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _load_yaml(path: Path) -> Dict[str, Any]:
    """Load YAML rules file. Uses PyYAML if available, falls back to simple parser."""
    try:
        import yaml
        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except ImportError:
        # Minimal fallback: try json if yaml unavailable
        raise SystemExit(
            "[FAIL] PyYAML not installed. Install with: pip install pyyaml"
        )


# ---------------------------------------------------------------------------
# Core transformation functions
# ---------------------------------------------------------------------------

def apply_pronunciation(text: str, rules: Dict[str, Any], lang: str = "en") -> str:
    """Apply pronunciation fixes: exact matches first, then regex patterns.

    Uses locale-specific rules when available (e.g. pronunciation_ko for Korean).
    """
    if lang == "ko":
        pron = rules.get("pronunciation_ko", rules.get("pronunciation", {}))
    else:
        pron = rules.get("pronunciation", {})

    # Exact replacements (case-sensitive)
    for old, new in pron.get("exact", {}).items():
        text = text.replace(old, new)

    # Regex replacements
    for r in pron.get("regex", []):
        text = re.sub(r["pattern"], r["replacement"], text)

    return text


def apply_pauses(text: str, rules: Dict[str, Any], lang: str = "en") -> str:
    """Insert pauses after quotes and before pivot words.

    Uses locale-specific pivot_words when available (e.g. pivot_words_ko for Korean).
    """
    pause_rules = rules.get("pauses", {})

    # After closing quote: "something" → "something"...
    after_pause = pause_rules.get("after_quote_pause", "...")
    if after_pause:
        # Match both curly and straight quotes, plus Korean-style quotes
        text = re.sub(
            r'(\u201c[^\u201d]+?\u201d|\u0022[^\u0022]+?\u0022|\u300c[^\u300d]+?\u300d)',
            lambda m: m.group(0) + after_pause,
            text,
        )

    # Select locale-specific pivot words
    if lang == "ko":
        pivot_words = rules.get("pivot_words_ko", pause_rules.get("pivot_words", []))
    else:
        pivot_words = pause_rules.get("pivot_words", [])

    for p in pivot_words:
        word = p["word"]
        prefix = p.get("prefix", "... ")
        # Only add prefix if not already present
        text = text.replace(word, prefix + word)
        # Clean up double pauses (e.g., "... ... But")
        text = text.replace(prefix + prefix, prefix)

    return text


def interpolate_exaggeration(
    curve_type: str, position: float, range_vals: List[float]
) -> float:
    """Compute exaggeration value based on curve type and beat position (0.0-1.0).

    Curve types:
    - flat: constant midpoint
    - rising: linear lo→hi
    - falling: linear hi→lo (range[0] > range[1])
    - peak: parabolic with max at position=0.5
    """
    lo, hi = range_vals[0], range_vals[1]

    if curve_type == "flat":
        return (lo + hi) / 2
    elif curve_type == "rising":
        return lo + position * (hi - lo)
    elif curve_type == "falling":
        # For falling, lo is the start (high), hi is the end (low)
        return lo + position * (hi - lo)
    elif curve_type == "peak":
        # Parabolic peak at midpoint
        return lo + (hi - lo) * (1 - (2 * position - 1) ** 2)
    else:
        return (lo + hi) / 2


def get_segment_label(beat: Dict[str, Any]) -> str:
    """Extract segment label from beat metadata."""
    # Try common field names for segment/section identification
    for key in ("segment", "section", "stage", "act", "segment_label"):
        val = beat.get(key)
        if val and isinstance(val, str):
            return val.upper().replace(" ", "_")
    return "_default"


def apply_emphasis_pauses(text: str, rules: Dict[str, Any]) -> str:
    """Insert micro-pauses before emphasis-marked words (SERIES_BIBLE A3: 0.3s pause)."""
    narr = rules.get("narration", {})
    markers = narr.get("emphasis_markers", [])
    for marker in markers:
        pattern = marker.get("pattern", "")
        action = marker.get("action", "")
        if action == "prefix_pause" and pattern:
            # For **bold** markers, strip markdown and add pause
            if "\\*\\*" in pattern or "**" in pattern:
                text = re.sub(
                    r'\*\*([^*]+)\*\*',
                    lambda m: f"... {m.group(1)}",
                    text,
                )
            else:
                text = re.sub(
                    pattern,
                    lambda m: f"... {m.group(0)}",
                    text,
                    flags=re.IGNORECASE,
                )
    # Clean up double pauses
    text = re.sub(r'\.{3}\s*\.{3}', '...', text)
    return text


def estimate_wpm(text: str, duration_sec: float, lang: str = "en") -> float:
    """Estimate words-per-minute from text length and target duration."""
    if duration_sec <= 0:
        return 0.0
    # Strip pause markers for word count
    clean = re.sub(r'\.{3}', '', text).strip()
    if lang == "ko":
        # Korean: count syllable blocks (separated by spaces)
        words = len(clean.split())
    else:
        words = len(clean.split())
    return (words / duration_sec) * 60


def check_sentence_length(text: str, lang: str, rules: Dict[str, Any]) -> List[str]:
    """Check for sentences exceeding max word count (one sentence = one idea)."""
    narr = rules.get("narration", {})
    max_words = narr.get(f"max_words_per_sentence_{lang}", 25 if lang == "en" else 35)
    warnings = []
    # Split on sentence-ending punctuation
    sentences = re.split(r'[.!?。]+', text)
    for sent in sentences:
        words = sent.strip().split()
        if len(words) > max_words:
            warnings.append(f"Long sentence ({len(words)} words > {max_words}): \"{sent.strip()[:60]}...\"")
    return warnings


def check_jargon(text: str, lang: str, rules: Dict[str, Any]) -> List[str]:
    """Flag jargon terms that may violate Curse of Knowledge principle."""
    narr = rules.get("narration", {})
    watchlist = narr.get(f"jargon_watchlist_{lang}", [])
    found = []
    text_lower = text.lower()
    for term in watchlist:
        if term.lower() in text_lower:
            found.append(f"Jargon detected: \"{term}\" — ensure context provided")
    return found


def compute_beat_position(beat_index: int, segment_beats: List[int]) -> float:
    """Compute normalized position (0.0-1.0) of a beat within its segment."""
    if len(segment_beats) <= 1:
        return 0.5
    try:
        idx_in_seg = segment_beats.index(beat_index)
        return idx_in_seg / max(1, len(segment_beats) - 1)
    except ValueError:
        return 0.5


def process_manifest(
    manifest: Dict[str, Any], rules: Dict[str, Any]
) -> Dict[str, Any]:
    """Process all beats in manifest, returning a report dict."""
    beats = manifest.get("beats", [])
    lang = manifest.get("language", "en")
    emotion_curves = rules.get("emotion_curves", {})
    default_curve = emotion_curves.get("_default", {"base": 0.5, "curve": "flat", "range": [0.5, 0.5]})

    # Group beats by segment for position calculation
    segment_groups: Dict[str, List[int]] = {}
    for i, beat in enumerate(beats):
        seg = get_segment_label(beat)
        segment_groups.setdefault(seg, []).append(i)

    modifications: List[Dict[str, Any]] = []
    total = len(beats)

    for i, beat in enumerate(beats):
        # Always start from narration_text (idempotent)
        original_text = str(beat.get("narration_text", beat.get("text", ""))).strip()
        if not original_text:
            continue

        # Apply transformations (locale-aware)
        text = original_text
        text = apply_pronunciation(text, rules, lang=lang)
        text = apply_pauses(text, rules, lang=lang)
        text = apply_emphasis_pauses(text, rules)

        # Compute emotion curve
        seg_label = get_segment_label(beat)
        curve_def = emotion_curves.get(seg_label, default_curve)
        curve_type = curve_def.get("curve", "flat")
        range_vals = curve_def.get("range", [0.5, 0.5])
        seg_beats = segment_groups.get(seg_label, [i])
        position = compute_beat_position(i, seg_beats)
        exaggeration = interpolate_exaggeration(curve_type, position, range_vals)
        exaggeration = round(exaggeration, 3)

        # Write fields to beat
        beat["tts_text"] = text
        beat["tts_exaggeration"] = exaggeration
        beat["tts_cfg_weight"] = 0.5

        # --- Narration quality checks (SERIES_BIBLE + craft-reference) ---
        beat_warnings: List[str] = []

        # WPM estimate
        duration = float(beat.get("duration_sec", 0))
        if duration > 0:
            wpm = estimate_wpm(text, duration, lang)
            beat["tts_estimated_wpm"] = round(wpm, 1)
            narr = rules.get("narration", {})
            wpm_cfg = narr.get("wpm", {})
            wpm_min = wpm_cfg.get(f"min_{lang}", wpm_cfg.get("min_en", 140))
            wpm_max = wpm_cfg.get(f"max_{lang}", wpm_cfg.get("max_en", 190))
            if wpm > wpm_max:
                beat_warnings.append(f"WPM too fast ({wpm:.0f} > {wpm_max}): consider splitting beat or slowing")
            elif wpm < wpm_min and len(text.split()) > 3:
                beat_warnings.append(f"WPM too slow ({wpm:.0f} < {wpm_min}): text may be too short for duration")

        # Sentence length check
        sent_warnings = check_sentence_length(text, lang, rules)
        beat_warnings.extend(sent_warnings)

        # Jargon / Curse of Knowledge
        jargon_warnings = check_jargon(text, lang, rules)
        beat_warnings.extend(jargon_warnings)

        if beat_warnings:
            beat["tts_warnings"] = beat_warnings

        # Track modifications
        text_changed = text != original_text
        exagg_changed = exaggeration != 0.5
        if text_changed or exagg_changed or beat_warnings:
            mod = {
                "beat_id": beat.get("beat_id", f"B{i+1:03d}"),
                "segment": seg_label,
                "position": round(position, 3),
                "exaggeration": exaggeration,
            }
            if text_changed:
                mod["text_diff"] = {
                    "original": original_text[:120],
                    "transformed": text[:120],
                }
            if beat_warnings:
                mod["warnings"] = beat_warnings
            modifications.append(mod)

    # Aggregate quality warnings
    all_warnings = [w for mod in modifications for w in mod.get("warnings", [])]
    wpm_values = [b.get("tts_estimated_wpm", 0) for b in beats if b.get("tts_estimated_wpm")]
    avg_wpm = round(sum(wpm_values) / max(1, len(wpm_values)), 1) if wpm_values else 0

    report = {
        "generated_at": datetime.now().isoformat(),
        "rules_version": rules.get("version", "unknown"),
        "language": lang,
        "total_beats": total,
        "beats_modified": len(modifications),
        "modification_rate": round(len(modifications) / max(1, total), 4),
        "narration_quality": {
            "avg_wpm": avg_wpm,
            "wpm_range": [round(min(wpm_values), 1), round(max(wpm_values), 1)] if wpm_values else [0, 0],
            "total_warnings": len(all_warnings),
            "warning_types": {
                "wpm": len([w for w in all_warnings if "WPM" in w]),
                "sentence_length": len([w for w in all_warnings if "Long sentence" in w]),
                "jargon": len([w for w in all_warnings if "Jargon" in w]),
            },
        },
        "modifications": modifications,
    }
    return report


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pre-process prepro manifest for TTS (pronunciation, pauses, emotion curves)"
    )
    parser.add_argument("--prepro-manifest", required=True, type=Path,
                        help="Path to prepro manifest JSON")
    parser.add_argument("--rules", required=True, type=Path,
                        help="Path to tts_rules.yaml")
    parser.add_argument("--report", type=Path, default=None,
                        help="Output report JSON path (default: beside manifest)")
    args = parser.parse_args()

    if not args.prepro_manifest.exists():
        raise SystemExit(f"[FAIL] manifest not found: {args.prepro_manifest}")
    if not args.rules.exists():
        raise SystemExit(f"[FAIL] rules file not found: {args.rules}")

    manifest = _json_load(args.prepro_manifest)
    rules = _load_yaml(args.rules)

    report = process_manifest(manifest, rules)
    report["prepro_manifest"] = str(args.prepro_manifest)
    report["rules_file"] = str(args.rules)

    # Write updated manifest in-place
    _json_dump(args.prepro_manifest, manifest)
    print(f"[OK] manifest updated: {args.prepro_manifest}")
    print(f"[OK] beats modified: {report['beats_modified']}/{report['total_beats']}")

    # Write report
    report_path = args.report or (args.prepro_manifest.parent / "tts_prep_report.json")
    _json_dump(report_path, report)
    print(f"[OK] report: {report_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
