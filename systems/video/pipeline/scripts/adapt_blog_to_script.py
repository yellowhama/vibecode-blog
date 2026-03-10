#!/usr/bin/env python3
"""Adapt a blog post into a narration script using LLM-based conversion.

Takes a raw prepro manifest (from build_blog_to_video_prepro.py) and the original
blog markdown, then produces a narration_manifest.json with MUSU 5-Act structure,
spoken-tone narration text, and claymation visual direction.

Supports providers: anthropic (Claude), openai (GPT-4o), mock (test mode).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


SCRIPTS_DIR = Path(__file__).resolve().parent
PIPELINE_DIR = SCRIPTS_DIR.parent
PROMPTS_DIR = PIPELINE_DIR / "prompts"
DEFAULT_SYSTEM_PROMPT_PATH = PROMPTS_DIR / "script_adaptation_system.md"

VALID_PHASES = ["HOOK", "TRAP", "BREAK", "REVELATION", "CHANGE"]
PHASE_BEAT_LIMITS = {
    "HOOK": (1, 3),
    "TRAP": (2, 5),
    "BREAK": (3, 7),
    "REVELATION": (2, 5),
    "CHANGE": (1, 3),
}
TOTAL_BEAT_RANGE = (12, 24)


# ── Utilities ──────────────────────────────────────────────────────────


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _extract_json_object(raw_text: str) -> Dict[str, Any]:
    """Extract first JSON object from LLM response text."""
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*", "", raw_text)
    cleaned = re.sub(r"```\s*$", "", cleaned)

    decoder = json.JSONDecoder()
    for idx, ch in enumerate(cleaned):
        if ch != "{":
            continue
        try:
            obj, _ = decoder.raw_decode(cleaned[idx:])
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            return obj
    raise ValueError("No JSON object found in LLM output")


def _estimate_duration_sec(text: str) -> float:
    """Estimate spoken duration for a narration text."""
    if re.search(r"[가-힣]", text):
        # Korean: ~350 syllables/min → ~5.8 chars/sec
        return max(2.0, round(len(text) / 5.8, 1))
    else:
        # English: ~150 WPM → 2.5 words/sec
        words = max(1, len(text.split()))
        return max(2.0, round(words / 2.5, 1))


# ── Load inputs ────────────────────────────────────────────────────────


def load_prepro_manifest(path: Path) -> Dict[str, Any]:
    """Load raw prepro manifest."""
    if not path.exists():
        raise FileNotFoundError(f"Prepro manifest not found: {path}")
    return _json_load(path)


def load_blog_source(path: Path) -> str:
    """Load original blog markdown."""
    if not path.exists():
        raise FileNotFoundError(f"Blog source not found: {path}")
    return path.read_text(encoding="utf-8")


def load_system_prompt(path: Path = DEFAULT_SYSTEM_PROMPT_PATH) -> str:
    """Load system prompt template."""
    if not path.exists():
        raise FileNotFoundError(f"System prompt not found: {path}")
    return path.read_text(encoding="utf-8")


# ── Prompt building ───────────────────────────────────────────────────


def build_adaptation_prompt(
    blog_text: str,
    beats: List[Dict[str, Any]],
    language: str,
    target_duration_sec: float,
) -> str:
    """Build the user prompt for the LLM."""
    # Summarize raw beats for context
    beat_summary = []
    for b in beats:
        beat_summary.append(f"- {b['beat_id']}: \"{b['text']}\" ({b.get('duration_sec', 0)}s)")
    beat_list = "\n".join(beat_summary[:60])  # Cap at 60 to stay within context
    if len(beats) > 60:
        beat_list += f"\n... ({len(beats) - 60} more beats omitted)"

    prompt = f"""## Blog Post (Full Text)

{blog_text}

## Raw Beats from Preproduction ({len(beats)} total)

{beat_list}

## Instructions

Language: {language}
Target total duration: {target_duration_sec} seconds ({target_duration_sec / 60:.1f} minutes)

Adapt this blog post into a narration script following the MUSU 5-Act Template.
Compress the {len(beats)} raw beats into 12-24 narration beats.
Rewrite each beat for spoken narration ({language}).
Assign visual direction for claymation animation.

Return ONLY the JSON object as specified in the system prompt."""

    return prompt


# ── LLM providers ─────────────────────────────────────────────────────


def _call_anthropic(
    system_prompt: str,
    user_prompt: str,
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 8192,
    temperature: float = 0.3,
) -> str:
    """Call Anthropic Claude API."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }

    req = urllib.request.Request(
        url="https://api.anthropic.com/v1/messages",
        method="POST",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Anthropic API error ({exc.code}): {detail}") from exc

    data = json.loads(body.decode("utf-8"))
    # Extract text from Claude response
    for block in data.get("content", []):
        if block.get("type") == "text":
            return block.get("text", "")
    raise RuntimeError("Anthropic response contained no text content")


def _call_openai(
    system_prompt: str,
    user_prompt: str,
    model: str = "gpt-4o",
    max_tokens: int = 8192,
    temperature: float = 0.3,
) -> str:
    """Call OpenAI API."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set")

    payload = {
        "model": model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    req = urllib.request.Request(
        url="https://api.openai.com/v1/chat/completions",
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error ({exc.code}): {detail}") from exc

    data = json.loads(body.decode("utf-8"))
    choices = data.get("choices", [])
    if choices:
        return choices[0].get("message", {}).get("content", "")
    raise RuntimeError("OpenAI response contained no choices")


def _mock_adaptation(beats: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
    """Mock adaptation for testing: distribute beats evenly across 5 phases."""
    # Take ~15 beats evenly distributed
    take = min(15, len(beats))
    step = max(1, len(beats) // take)
    selected = [beats[i * step] for i in range(take) if i * step < len(beats)]
    if len(selected) < 15 and len(beats) > 0:
        selected = selected[:15]

    # Distribute across phases: 2, 3, 4, 3, 3
    distribution = [2, 3, 4, 3, 3]
    phases = []
    idx = 0
    for phase_name, count in zip(VALID_PHASES, distribution):
        phase_beats = []
        for j in range(count):
            if idx < len(selected):
                b = selected[idx]
                phase_beats.append({
                    "beat_id": f"N{idx + 1:03d}",
                    "source_beats": [b["beat_id"]],
                    "narration_text": b["text"],
                    "emotional_direction": "neutral",
                    "visual_goal": b.get("visual_goal", "Claymation scene."),
                    "visual_intensity": "medium",
                })
                idx += 1
        phases.append({"phase": phase_name, "beats": phase_beats})

    return {"phases": phases}


def call_llm(
    system_prompt: str,
    user_prompt: str,
    provider: str,
    beats: List[Dict[str, Any]],
    language: str,
) -> Dict[str, Any]:
    """Call LLM and parse structured output."""
    if provider == "mock":
        return _mock_adaptation(beats, language)

    if provider == "anthropic":
        raw_text = _call_anthropic(system_prompt, user_prompt)
    elif provider == "openai":
        raw_text = _call_openai(system_prompt, user_prompt)
    else:
        raise ValueError(f"Unknown provider: {provider}")

    return _extract_json_object(raw_text)


# ── Validation ─────────────────────────────────────────────────────────


def validate_narration(
    narration: Dict[str, Any],
    source_beat_ids: List[str],
    target_duration_sec: float,
) -> tuple[bool, List[str]]:
    """Validate narration manifest structure. Returns (pass, warnings)."""
    warnings: List[str] = []
    errors: List[str] = []

    phases = narration.get("phases", [])
    if not phases:
        errors.append("No phases found")
        return False, errors

    # Check all 5 phases exist
    found_phases = [p.get("phase") for p in phases]
    for required in VALID_PHASES:
        if required not in found_phases:
            errors.append(f"Missing phase: {required}")

    # Check beat counts
    total_beats = 0
    for phase in phases:
        phase_name = phase.get("phase", "UNKNOWN")
        beats = phase.get("beats", [])
        count = len(beats)
        total_beats += count

        limits = PHASE_BEAT_LIMITS.get(phase_name)
        if limits and (count < limits[0] or count > limits[1]):
            warnings.append(
                f"{phase_name}: {count} beats (expected {limits[0]}-{limits[1]})"
            )

        # Check required fields
        for b in beats:
            if not b.get("narration_text", "").strip():
                errors.append(f"Beat {b.get('beat_id', '?')}: empty narration_text")
            if not b.get("visual_goal", "").strip():
                warnings.append(f"Beat {b.get('beat_id', '?')}: empty visual_goal")

    lo, hi = TOTAL_BEAT_RANGE
    if total_beats < lo or total_beats > hi:
        warnings.append(f"Total beats: {total_beats} (expected {lo}-{hi})")

    # Estimate total duration
    total_dur = 0.0
    for phase in phases:
        for b in phase.get("beats", []):
            total_dur += _estimate_duration_sec(b.get("narration_text", ""))
    if target_duration_sec > 0:
        ratio = total_dur / target_duration_sec
        if ratio < 0.5 or ratio > 1.5:
            warnings.append(
                f"Estimated duration {total_dur:.1f}s vs target {target_duration_sec}s "
                f"(ratio: {ratio:.2f})"
            )

    passed = len(errors) == 0
    return passed, errors + warnings


# ── Output writers ─────────────────────────────────────────────────────


def build_narration_manifest(
    narration: Dict[str, Any],
    prepro_manifest: Dict[str, Any],
    blog_source_path: str,
    language: str,
    target_duration_sec: float,
    provider: str,
) -> Dict[str, Any]:
    """Build the full narration_manifest.json structure."""
    total_beats = 0
    source_beat_count = len(prepro_manifest.get("beats", []))

    for phase in narration.get("phases", []):
        for beat in phase.get("beats", []):
            total_beats += 1
            # Add estimated duration
            text = beat.get("narration_text", beat.get("text", ""))
            beat["estimated_duration_sec"] = _estimate_duration_sec(text)
            # Copy narration_text to text for downstream compatibility
            if "narration_text" in beat and "text" not in beat:
                beat["text"] = beat["narration_text"]

    # Calculate phase target durations
    for phase in narration.get("phases", []):
        phase_dur = sum(
            b.get("estimated_duration_sec", 3.0) for b in phase.get("beats", [])
        )
        phase["estimated_duration_sec"] = round(phase_dur, 1)

    project_id = prepro_manifest.get("project_id", "unknown") + "_script"

    return {
        "project_id": project_id,
        "created_at": datetime.now().isoformat(),
        "source_prepro": str(prepro_manifest.get("_source_path", "")),
        "source_blog": blog_source_path,
        "language": language,
        "target_duration_sec": target_duration_sec,
        "template": "MUSU_5ACT",
        "provider": provider,
        "phases": narration["phases"],
        "total_beats": total_beats,
        "compression_ratio": f"{source_beat_count}:{total_beats}",
    }


def write_narration_script_md(manifest: Dict[str, Any], output_path: Path) -> Path:
    """Write human-readable narration script markdown."""
    lines = [
        f"# Narration Script — {manifest.get('project_id', 'unknown')}",
        "",
        f"- Language: {manifest.get('language', '?')}",
        f"- Target duration: {manifest.get('target_duration_sec', 0)}s",
        f"- Total beats: {manifest.get('total_beats', 0)}",
        f"- Compression: {manifest.get('compression_ratio', '?')}",
        f"- Template: {manifest.get('template', '?')}",
        "",
        "---",
        "",
    ]

    for phase in manifest.get("phases", []):
        phase_name = phase.get("phase", "UNKNOWN")
        phase_dur = phase.get("estimated_duration_sec", 0)
        lines.append(f"## {phase_name} (~{phase_dur}s)")
        lines.append("")

        for beat in phase.get("beats", []):
            beat_id = beat.get("beat_id", "?")
            dur = beat.get("estimated_duration_sec", 0)
            lines.append(f"### {beat_id} ({dur}s) — {beat.get('emotional_direction', '')}")
            lines.append("")
            lines.append(f"**Narration:** {beat.get('narration_text', '')}")
            lines.append("")
            lines.append(f"**Visual:** {beat.get('visual_goal', '')}")
            lines.append(f"**Intensity:** {beat.get('visual_intensity', 'medium')}")
            sources = beat.get("source_beats", [])
            if sources:
                lines.append(f"**Source beats:** {', '.join(sources)}")
            lines.append("")

        lines.append("---")
        lines.append("")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path


def write_adaptation_report(
    manifest: Dict[str, Any],
    raw_beat_count: int,
    validation_pass: bool,
    validation_messages: List[str],
    provider: str,
    output_path: Path,
) -> Path:
    """Write adaptation quality report."""
    phase_durations = {}
    for phase in manifest.get("phases", []):
        phase_durations[phase.get("phase", "?")] = phase.get("estimated_duration_sec", 0)

    total_dur = sum(phase_durations.values())
    total_beats = manifest.get("total_beats", 0)

    # Calculate source beat coverage
    all_source_beats: set[str] = set()
    for phase in manifest.get("phases", []):
        for beat in phase.get("beats", []):
            all_source_beats.update(beat.get("source_beats", []))
    coverage_pct = round(len(all_source_beats) / max(1, raw_beat_count) * 100, 1)

    report = {
        "created_at": datetime.now().isoformat(),
        "compression_ratio": manifest.get("compression_ratio", "?"),
        "raw_beat_count": raw_beat_count,
        "narration_beat_count": total_beats,
        "coverage_pct": coverage_pct,
        "source_beats_used": len(all_source_beats),
        "estimated_total_duration_sec": round(total_dur, 1),
        "target_duration_sec": manifest.get("target_duration_sec", 0),
        "phase_durations": phase_durations,
        "validation_pass": validation_pass,
        "validation_messages": validation_messages,
        "provider": provider,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    _json_dump(output_path, report)
    return output_path


# ── Flatten for downstream compatibility ───────────────────────────────


def flatten_beats(manifest: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatten phases into a flat beats list for TTS/shot manifest compatibility.

    This produces a list that looks like the original prepro_manifest beats
    but with narration_text, narrative_phase, and visual metadata added.
    """
    flat: List[Dict[str, Any]] = []
    cursor = 0.0
    for phase in manifest.get("phases", []):
        phase_name = phase.get("phase", "")
        for beat in phase.get("beats", []):
            dur = beat.get("estimated_duration_sec", 3.0)
            start = round(cursor, 3)
            end = round(cursor + dur, 3)
            flat.append({
                "beat_id": beat.get("beat_id", ""),
                "scene_id": beat.get("beat_id", "").replace("N", "S"),
                "text": beat.get("narration_text", beat.get("text", "")),
                "narration_text": beat.get("narration_text", ""),
                "duration_sec": dur,
                "start_sec": start,
                "end_sec": end,
                "visual_goal": beat.get("visual_goal", ""),
                "narrative_phase": phase_name,
                "emotional_direction": beat.get("emotional_direction", ""),
                "visual_intensity": beat.get("visual_intensity", "medium"),
                "source_beats": beat.get("source_beats", []),
            })
            cursor = end
    return flat


# ── Main ───────────────────────────────────────────────────────────────


def adapt_blog_to_script(
    prepro_manifest_path: Path,
    blog_source_path: Path,
    output_dir: Path,
    language: str = "en",
    target_duration_sec: float = 180.0,
    provider: str = "anthropic",
    system_prompt_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Main adaptation function. Returns the narration manifest dict."""
    # Load inputs
    prepro = load_prepro_manifest(prepro_manifest_path)
    prepro["_source_path"] = str(prepro_manifest_path)
    blog_text = load_blog_source(blog_source_path)
    system_prompt = load_system_prompt(system_prompt_path or DEFAULT_SYSTEM_PROMPT_PATH)

    beats = prepro.get("beats", [])
    if not beats:
        raise ValueError("Prepro manifest has no beats")

    # Build prompt
    user_prompt = build_adaptation_prompt(blog_text, beats, language, target_duration_sec)

    # Call LLM
    print(f"[ADAPT] Provider: {provider}, {len(beats)} raw beats → target {target_duration_sec}s")
    narration = call_llm(system_prompt, user_prompt, provider, beats, language)

    # Validate
    source_beat_ids = [b["beat_id"] for b in beats]
    passed, messages = validate_narration(narration, source_beat_ids, target_duration_sec)
    status = "PASS" if passed else "WARN"
    print(f"[ADAPT] Validation: {status}")
    for msg in messages:
        print(f"  - {msg}")

    # Build manifest
    manifest = build_narration_manifest(
        narration, prepro, str(blog_source_path), language, target_duration_sec, provider,
    )

    # Write outputs
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest_path = output_dir / "narration_manifest.json"
    _json_dump(manifest_path, manifest)
    print(f"[OK] narration manifest: {manifest_path}")

    script_path = write_narration_script_md(manifest, output_dir / "narration_script.md")
    print(f"[OK] narration script: {script_path}")

    # Also write a flattened beats manifest for TTS compatibility
    flat_beats = flatten_beats(manifest)
    flat_manifest = dict(prepro)
    flat_manifest.pop("_source_path", None)
    flat_manifest["beats"] = flat_beats
    flat_manifest["project_id"] = manifest["project_id"]
    flat_manifest["estimated_total_duration_sec"] = round(
        sum(b["duration_sec"] for b in flat_beats), 1
    )
    flat_manifest["adaptation"] = {
        "template": "MUSU_5ACT",
        "provider": provider,
        "compression_ratio": manifest["compression_ratio"],
    }
    flat_path = output_dir / "prepro_manifest_adapted.json"
    _json_dump(flat_path, flat_manifest)
    print(f"[OK] adapted prepro manifest (flat): {flat_path}")

    report_path = write_adaptation_report(
        manifest, len(beats), passed, messages, provider,
        output_dir / "adaptation_report.json",
    )
    print(f"[OK] adaptation report: {report_path}")

    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Adapt blog post to narration script using LLM"
    )
    parser.add_argument(
        "--prepro-manifest", required=True, type=Path,
        help="Path to raw prepro_manifest.json from build_blog_to_video_prepro.py",
    )
    parser.add_argument(
        "--blog-source", required=True, type=Path,
        help="Path to original blog markdown file",
    )
    parser.add_argument(
        "--output-dir", type=Path, default=None,
        help="Output directory (default: same dir as prepro manifest + /script/)",
    )
    parser.add_argument(
        "--language", default="en", choices=["en", "ko"],
        help="Target language for narration (default: en)",
    )
    parser.add_argument(
        "--target-duration", type=float, default=180.0,
        help="Target total narration duration in seconds (default: 180)",
    )
    parser.add_argument(
        "--provider", default="anthropic", choices=["anthropic", "openai", "mock"],
        help="LLM provider (default: anthropic)",
    )
    parser.add_argument(
        "--system-prompt", type=Path, default=None,
        help="Custom system prompt file (default: pipeline/prompts/script_adaptation_system.md)",
    )
    args = parser.parse_args()

    output_dir = args.output_dir or (args.prepro_manifest.parent / "script")

    adapt_blog_to_script(
        prepro_manifest_path=args.prepro_manifest,
        blog_source_path=args.blog_source,
        output_dir=output_dir,
        language=args.language,
        target_duration_sec=args.target_duration,
        provider=args.provider,
        system_prompt_path=args.system_prompt,
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
