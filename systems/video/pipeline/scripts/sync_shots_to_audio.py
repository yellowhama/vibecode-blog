#!/usr/bin/env python3
"""Synchronize shot manifest durations with actual TTS audio timings.

Beats (prepro) and shots use different ID schemes (SEG01_B001 vs H01),
so we match by segment order: beats are grouped by segment in order,
shots are grouped by segment in order, then each shot gets the sum of
its proportional share of beat durations within that segment.

Usage:
    python3 sync_shots_to_audio.py \
        --prepro-manifest ../../preproduction/ep01/ep01_prepro_manifest_v5.json \
        --shot-manifest ../../preproduction/ep01/ep01_shot_manifest_v8.json

    # Or use TTS report directly:
    python3 sync_shots_to_audio.py \
        --tts-report ../../preproduction/ep01/voiceover_tts_report.json \
        --shot-manifest ../../preproduction/ep01/ep01_shot_manifest_v8.json
"""
from __future__ import annotations

import argparse
import json
from collections import OrderedDict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _group_by_segment(items: List[Dict[str, Any]], seg_key: str = "segment") -> OrderedDict:
    """Group items by segment, preserving insertion order."""
    groups: OrderedDict[str, List[Dict[str, Any]]] = OrderedDict()
    for item in items:
        seg = item.get(seg_key, "_unknown")
        groups.setdefault(seg, []).append(item)
    return groups


def sync_manifests(
    shot_manifest_path: Path,
    prepro_manifest_path: Path | None = None,
    tts_report_path: Path | None = None,
    output_path: Path | None = None,
    padding: float = 0.15,
    gap_sec: float = 0.15,
) -> Dict[str, Any]:
    """Sync shot durations from actual TTS beat durations.

    Strategy: distribute beats to shots within each segment proportionally.
    If a segment has N beats and M shots, each shot covers ceil(N/M) beats
    sequentially, and its duration = sum of those beats' actual_duration_sec.
    """
    shots_data = _json_load(shot_manifest_path)
    shots = shots_data.get("shots", [])

    # Load beat durations from prepro manifest or TTS report
    if prepro_manifest_path and prepro_manifest_path.exists():
        prepro = _json_load(prepro_manifest_path)
        beats = prepro.get("beats", [])
        beat_durations = [
            {
                "beat_id": b.get("beat_id", f"B{i}"),
                "segment": b.get("segment", "_unknown"),
                "actual_duration_sec": float(b.get("actual_duration_sec", b.get("duration_sec", 3.0))),
            }
            for i, b in enumerate(beats)
        ]
    elif tts_report_path and tts_report_path.exists():
        report = _json_load(tts_report_path)
        segments = report.get("segments", [])
        # TTS report segments don't have segment labels — need prepro for that
        # Fall back to using scene_id prefix as segment hint
        beat_durations = [
            {
                "beat_id": s.get("beat_id", f"B{i}"),
                "segment": s.get("segment", "_unknown"),
                "actual_duration_sec": float(s.get("actual_duration_sec", 3.0)),
            }
            for i, s in enumerate(segments)
        ]
    else:
        raise SystemExit("[FAIL] Need either --prepro-manifest or --tts-report")

    # Group by segment
    beat_groups = _group_by_segment(beat_durations)
    shot_groups = _group_by_segment(shots)

    sync_log: List[Dict[str, Any]] = []
    total_synced = 0.0
    total_original = 0.0

    for seg_name, seg_shots in shot_groups.items():
        seg_beats = beat_groups.get(seg_name, [])
        n_beats = len(seg_beats)
        n_shots = len(seg_shots)

        if n_beats == 0:
            # No beats for this segment — keep original durations
            for shot in seg_shots:
                total_synced += shot.get("duration_sec", 0)
                total_original += shot.get("duration_sec", 0)
                sync_log.append({
                    "shot_id": shot["shot_id"],
                    "segment": seg_name,
                    "status": "no_beats",
                    "duration_sec": shot.get("duration_sec", 0),
                })
            continue

        # Distribute beats to shots: each shot gets a chunk of beats
        beats_per_shot = max(1, n_beats // n_shots)
        beat_idx = 0

        for i, shot in enumerate(seg_shots):
            original_dur = shot.get("duration_sec", 0)
            total_original += original_dur

            # Last shot in segment gets remaining beats
            if i == n_shots - 1:
                chunk = seg_beats[beat_idx:]
            else:
                chunk = seg_beats[beat_idx : beat_idx + beats_per_shot]
            beat_idx += len(chunk)

            # Sum actual durations + inter-beat gaps + padding
            beat_dur_sum = sum(b["actual_duration_sec"] for b in chunk)
            inter_gaps = max(0, len(chunk) - 1) * gap_sec
            synced_dur = round(beat_dur_sum + inter_gaps + padding, 3)

            shot["duration_sec"] = synced_dur
            shot["beat_ids"] = [b["beat_id"] for b in chunk]
            shot["beat_count"] = len(chunk)
            total_synced += synced_dur

            sync_log.append({
                "shot_id": shot["shot_id"],
                "segment": seg_name,
                "status": "synced",
                "original_duration_sec": round(original_dur, 3),
                "synced_duration_sec": synced_dur,
                "beat_count": len(chunk),
                "beat_ids": [b["beat_id"] for b in chunk],
            })

    # Update manifest metadata
    shots_data["total_duration_sec"] = round(total_synced, 1)
    shots_data["synchronized_with_audio"] = True
    shots_data["sync_timestamp"] = datetime.now().isoformat()

    # Write output
    out = output_path or shot_manifest_path
    _json_dump(out, shots_data)

    # Summary
    report = {
        "generated_at": datetime.now().isoformat(),
        "shot_manifest": str(shot_manifest_path),
        "total_shots": len(shots),
        "total_beats": len(beat_durations),
        "original_total_sec": round(total_original, 1),
        "synced_total_sec": round(total_synced, 1),
        "delta_sec": round(total_synced - total_original, 1),
        "padding_per_shot": padding,
        "gap_sec": gap_sec,
        "log": sync_log,
    }
    report_path = out.parent / f"{out.stem}_sync_report.json"
    _json_dump(report_path, report)

    return report


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Sync shot manifest durations with actual TTS timings"
    )
    parser.add_argument("--shot-manifest", required=True, type=Path)
    parser.add_argument("--prepro-manifest", type=Path, default=None)
    parser.add_argument("--tts-report", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None,
                        help="Output path (default: overwrite shot manifest)")
    parser.add_argument("--padding", type=float, default=0.15,
                        help="Padding per shot (seconds)")
    parser.add_argument("--gap-sec", type=float, default=0.15,
                        help="Inter-beat gap (seconds)")
    args = parser.parse_args()

    if not args.prepro_manifest and not args.tts_report:
        raise SystemExit("[FAIL] Provide --prepro-manifest or --tts-report")
    if not args.shot_manifest.exists():
        raise SystemExit(f"[FAIL] Shot manifest not found: {args.shot_manifest}")

    report = sync_manifests(
        shot_manifest_path=args.shot_manifest,
        prepro_manifest_path=args.prepro_manifest,
        tts_report_path=args.tts_report,
        output_path=args.output,
        padding=args.padding,
        gap_sec=args.gap_sec,
    )

    print(f"[OK] Synced {report['total_shots']} shots ({report['total_beats']} beats)")
    print(f"[OK] Duration: {report['original_total_sec']}s → {report['synced_total_sec']}s (Δ{report['delta_sec']:+.1f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
