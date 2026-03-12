#!/usr/bin/env python3
"""Interactive QA checkpoint gate for the video production pipeline.

Pauses pipeline execution for manual review of artifacts at each stage.
Displays artifact summaries (file counts, durations, quality scores) and
prompts the operator to approve, retry, or abort.

Exit codes:
    0 = approved (continue)
    1 = rejected (abort)
    2 = retry (re-run current stage)

Usage:
    python qa_checkpoint.py --stage "T2I PuLID Storyboards" \
        --artifacts-dir output/renders/ep01_storyboards_v3 \
        --artifact-type image

    python qa_checkpoint.py --stage "I2V Renders" \
        --artifacts-dir output/renders/ep01_i2v_v3 \
        --artifact-type video \
        --report-json evaluations_summary.json
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Artifact discovery
# ---------------------------------------------------------------------------
EXTENSIONS = {
    "image": (".png", ".jpg", ".jpeg", ".webp", ".bmp"),
    "audio": (".wav", ".mp3", ".flac", ".ogg", ".m4a"),
    "video": (".mp4", ".webm", ".mov", ".avi", ".mkv"),
}


def _find_artifacts(artifacts_dir: Path, artifact_type: str) -> list[Path]:
    exts = EXTENSIONS.get(artifact_type, ())
    if not exts:
        return sorted(artifacts_dir.iterdir())
    files = []
    for ext in exts:
        files.extend(artifacts_dir.rglob(f"*{ext}"))
    return sorted(set(files))


# ---------------------------------------------------------------------------
# Audio duration via ffprobe
# ---------------------------------------------------------------------------
def _audio_duration(path: Path) -> str:
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries",
             "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True, text=True, timeout=10,
        )
        secs = float(r.stdout.strip())
        mins = int(secs // 60)
        remaining = secs - mins * 60
        return f"{mins}m{remaining:05.2f}s ({secs:.2f}s)"
    except Exception:
        return "duration unknown"


# ---------------------------------------------------------------------------
# Report summary
# ---------------------------------------------------------------------------
def _summarize_report(report_path: Path) -> None:
    try:
        with report_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"  [WARN] Could not read report: {e}")
        return

    if isinstance(data, dict):
        _print_report_dict(data)
    elif isinstance(data, list):
        passed = sum(1 for r in data if r.get("pass") or r.get("status") == "pass")
        failed = len(data) - passed
        print(f"  Results: {passed} passed, {failed} failed (of {len(data)} total)")
        scores = [r.get("score", r.get("overall_score")) for r in data
                  if r.get("score") is not None or r.get("overall_score") is not None]
        if scores:
            avg = sum(s for s in scores if s is not None) / len(scores)
            print(f"  Average score: {avg:.1f}")


def _print_report_dict(data: dict[str, Any]) -> None:
    for key in ("summary", "overall", "status"):
        if key in data:
            print(f"  {key}: {data[key]}")

    if "pass_count" in data or "fail_count" in data:
        p = data.get("pass_count", "?")
        f = data.get("fail_count", "?")
        print(f"  pass={p}  fail={f}")

    if "average_score" in data:
        print(f"  Average score: {data['average_score']}")

    if "results" in data and isinstance(data["results"], list):
        failed = [r for r in data["results"]
                  if r.get("status") == "fail" or r.get("pass") is False]
        if failed:
            print(f"  Failed items ({len(failed)}):")
            for r in failed[:10]:
                sid = r.get("shot_id", r.get("name", "?"))
                score = r.get("score", r.get("overall_score", "?"))
                print(f"    - {sid}: score={score}")


# ---------------------------------------------------------------------------
# Main review display
# ---------------------------------------------------------------------------
def display_review(
    stage: str,
    artifacts: list[Path],
    artifact_type: str,
    summary: str | None,
    report_path: Path | None,
) -> None:
    print()
    print("=" * 60)
    print(f"  REVIEW POINT: {stage}")
    print("=" * 60)
    print()
    print(f"  Artifact type : {artifact_type}")
    print(f"  Total files   : {len(artifacts)}")
    print()

    if summary:
        print(f"  Summary: {summary}")
        print()

    # List artifacts (truncate if many)
    show = artifacts[:30]
    for p in show:
        line = f"    {p.name}"
        if artifact_type == "audio":
            line += f"  [{_audio_duration(p)}]"
        elif artifact_type == "video":
            line += f"  [{_audio_duration(p)}]"
        print(line)
    if len(artifacts) > 30:
        print(f"    ... and {len(artifacts) - 30} more")
    print()

    if report_path and report_path.exists():
        print("  --- Quality Report ---")
        _summarize_report(report_path)
        print()


def prompt_approval() -> int:
    """Interactive prompt. Returns exit code."""
    try:
        answer = input("  Approve? [y/N/r(retry)]: ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        print("\n  [ABORT] No input received.")
        return 1

    if answer == "y":
        print("  [APPROVED] Proceeding to next stage.")
        return 0
    elif answer == "r":
        print("  [RETRY] Re-run this stage.")
        return 2
    else:
        print("  [REJECTED] Pipeline halted.")
        return 1


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(
        description="Interactive QA checkpoint for video pipeline stages"
    )
    parser.add_argument("--stage", required=True,
                        help="Stage name (e.g. 'T2I PuLID Storyboards')")
    parser.add_argument("--artifacts-dir", required=True, type=Path,
                        help="Directory containing artifacts to review")
    parser.add_argument("--artifact-type", choices=["image", "audio", "video"],
                        default="image", help="Type of artifacts (default: image)")
    parser.add_argument("--summary", type=str, default=None,
                        help="Optional one-line summary to display")
    parser.add_argument("--report-json", type=Path, default=None,
                        help="Optional quality report JSON to summarize")
    parser.add_argument("--auto-approve", action="store_true",
                        help="Skip interactive prompt (for CI/batch)")
    args = parser.parse_args()

    if not args.artifacts_dir.exists():
        print(f"[ERROR] Artifacts directory not found: {args.artifacts_dir}",
              file=sys.stderr)
        return 1

    artifacts = _find_artifacts(args.artifacts_dir, args.artifact_type)
    if not artifacts:
        print(f"[WARN] No {args.artifact_type} artifacts found in {args.artifacts_dir}")

    display_review(
        stage=args.stage,
        artifacts=artifacts,
        artifact_type=args.artifact_type,
        summary=args.summary,
        report_path=args.report_json,
    )

    if args.auto_approve:
        print("  [AUTO-APPROVED] --auto-approve flag set.")
        return 0

    return prompt_approval()


if __name__ == "__main__":
    raise SystemExit(main())
