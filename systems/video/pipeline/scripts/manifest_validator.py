#!/usr/bin/env python3
"""Spec-driven manifest validation gates for the video pipeline.

Each pipeline stage has required manifest fields. validate_for_stage()
checks before execution and blocks with clear diagnostics if anything
is missing or marked as needing clarification.

Inspired by SpecKit's gated-phase approach: the manifest is the SSOT,
and stages cannot proceed without validated inputs.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Stage requirements schema
# ---------------------------------------------------------------------------

# "beats[].<field>" means every beat must have that field
# "shots[].<field>" means every shot must have that field
# top-level keys checked directly

STAGE_REQUIREMENTS: Dict[int, Dict[str, Any]] = {
    1: {
        "label": "TTS Narration",
        "manifest_type": "prepro",
        "required": ["language", "beats"],
        "beat_fields": ["narration_text"],
    },
    2: {
        "label": "Whisper Timing",
        "manifest_type": "shot",
        "required": ["shots"],
        "shot_fields": ["shot_id", "duration_sec"],
    },
    3: {
        "label": "T2I Keyframes",
        "manifest_type": "shot",
        "required": ["shots"],
        "shot_fields": ["shot_id", "prompt_positive", "render_method"],
    },
    4: {
        "label": "I2V Animation",
        "manifest_type": "shot",
        "required": ["shots"],
        "shot_fields": ["shot_id", "duration_sec"],
    },
    6: {
        "label": "Audio Mixing",
        "manifest_type": "prepro",
        "required": ["language"],
        "beat_fields": [],
    },
    7: {
        "label": "Final Assembly",
        "manifest_type": "shot",
        "required": ["shots"],
        "shot_fields": ["shot_id", "duration_sec"],
    },
    8: {
        "label": "Multi-Language Export",
        "manifest_type": "prepro",
        "required": ["language"],
        "beat_fields": [],
    },
}

# Values that signal "needs clarification" (spec-driven principle)
PLACEHOLDER_VALUES = {"TODO", "TBD", "FIXME", "PLACEHOLDER", ""}


@dataclass
class ValidationIssue:
    field: str
    issue_type: str  # "missing" | "needs_clarification" | "invalid"
    message: str
    item_id: str = ""  # beat_id or shot_id if applicable


@dataclass
class ValidationResult:
    stage: int
    label: str
    ok: bool = True
    issues: List[ValidationIssue] = field(default_factory=list)

    def block_message(self) -> str:
        if self.ok:
            return f"[PASS] Stage {self.stage} ({self.label}): all fields validated"
        lines = [f"[BLOCKED] Stage {self.stage} ({self.label}): {len(self.issues)} issue(s)"]
        for issue in self.issues[:15]:
            prefix = {"missing": "MISSING", "needs_clarification": "NEEDS_CLARIFICATION", "invalid": "INVALID"}.get(issue.issue_type, "ISSUE")
            ctx = f" ({issue.item_id})" if issue.item_id else ""
            lines.append(f"  [{prefix}] {issue.field}{ctx}: {issue.message}")
        if len(self.issues) > 15:
            lines.append(f"  ... and {len(self.issues) - 15} more")
        return "\n".join(lines)


def _is_placeholder(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and value.strip().upper() in PLACEHOLDER_VALUES:
        return True
    if isinstance(value, (int, float)) and value == 0:
        return True
    return False


def validate_for_stage(manifest: Dict[str, Any], stage: int) -> ValidationResult:
    """Validate manifest has all required fields for a given pipeline stage."""
    spec = STAGE_REQUIREMENTS.get(stage)
    if not spec:
        return ValidationResult(stage=stage, label=f"Stage {stage}", ok=True)

    result = ValidationResult(stage=stage, label=spec["label"])

    # Check top-level required fields
    for fld in spec.get("required", []):
        val = manifest.get(fld)
        if val is None:
            result.issues.append(ValidationIssue(
                field=fld, issue_type="missing",
                message=f"Required top-level field '{fld}' not found",
            ))
        elif _is_placeholder(val):
            result.issues.append(ValidationIssue(
                field=fld, issue_type="needs_clarification",
                message=f"Field '{fld}' has placeholder value: {repr(val)}",
            ))

    # Check per-beat fields
    beats = manifest.get("beats", [])
    for fld in spec.get("beat_fields", []):
        for i, beat in enumerate(beats):
            beat_id = beat.get("beat_id", f"beat_{i}")
            val = beat.get(fld)
            if val is None:
                result.issues.append(ValidationIssue(
                    field=f"beats[].{fld}", issue_type="missing",
                    message=f"Beat missing '{fld}'", item_id=beat_id,
                ))
            elif isinstance(val, str) and _is_placeholder(val):
                result.issues.append(ValidationIssue(
                    field=f"beats[].{fld}", issue_type="needs_clarification",
                    message=f"Beat has placeholder '{fld}'", item_id=beat_id,
                ))

    # Check per-shot fields
    shots = manifest.get("shots", [])
    for fld in spec.get("shot_fields", []):
        for i, shot in enumerate(shots):
            shot_id = shot.get("shot_id", f"shot_{i}")
            val = shot.get(fld)
            if val is None:
                result.issues.append(ValidationIssue(
                    field=f"shots[].{fld}", issue_type="missing",
                    message=f"Shot missing '{fld}'", item_id=shot_id,
                ))
            elif isinstance(val, str) and _is_placeholder(val):
                result.issues.append(ValidationIssue(
                    field=f"shots[].{fld}", issue_type="needs_clarification",
                    message=f"Shot has placeholder '{fld}'", item_id=shot_id,
                ))

    result.ok = len(result.issues) == 0
    return result


def validate_manifest_file(path: Path, stage: int) -> ValidationResult:
    """Load a manifest file and validate it for a stage."""
    if not path.exists():
        result = ValidationResult(stage=stage, label=f"Stage {stage}")
        result.ok = False
        result.issues.append(ValidationIssue(
            field="file", issue_type="missing",
            message=f"Manifest file not found: {path}",
        ))
        return result

    with path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)
    return validate_for_stage(manifest, stage)


def write_pipeline_status(
    manifest_path: Path,
    stage: int,
    status: str = "complete",
    elapsed_sec: float = 0.0,
    artifacts: Optional[List[str]] = None,
) -> None:
    """Write stage completion status back to manifest (SSOT write-back)."""
    with manifest_path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest.setdefault("pipeline_status", {})
    manifest["pipeline_status"][f"stage_{stage}"] = {
        "status": status,
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "elapsed_sec": round(elapsed_sec, 1),
        "artifacts": artifacts or [],
    }

    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Validate manifest for pipeline stage")
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--stage", required=True, type=int)
    args = parser.parse_args()

    result = validate_manifest_file(args.manifest, args.stage)
    print(result.block_message())
    return 0 if result.ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
