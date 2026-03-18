#!/usr/bin/env python3
"""Annotate shot manifest with narrative_stage fields.

Maps source_scene_id (e.g. SEG01) to v6 narrative stages:
    HOOK, MISCONCEPTION, THE_CRACK, CORE, REFRAME, OUTRO_CTA
so that audio_catalog.py's select_bgm_by_stage() can pick the right BGM per act.

Usage:
    python annotate_manifest_stages.py \
        --manifest ep01_shot_manifest.json \
        --mapping '{"SEG01":"HOOK","SEG02":"MISCONCEPTION","SEG03":"THE_CRACK","SEG04":"CORE","SEG05":"REFRAME","SEG06":"OUTRO_CTA"}'

    python annotate_manifest_stages.py \
        --manifest ep01_shot_manifest.json \
        --mapping-file ep01_stage_mapping.json \
        --dry-run
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def _json_load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def annotate_stages(
    manifest: dict[str, Any],
    mapping: dict[str, str],
) -> tuple[int, int]:
    """Add narrative_stage to each shot based on source_scene_id mapping.

    Returns (annotated_count, skipped_count).
    """
    annotated = 0
    skipped = 0
    for shot in manifest.get("shots", []):
        scene_id = shot.get("source_scene_id", "")
        stage = mapping.get(scene_id)
        if stage:
            shot["narrative_stage"] = stage
            annotated += 1
        else:
            skipped += 1
    return annotated, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description="Annotate manifest shots with narrative_stage")
    parser.add_argument("--manifest", type=Path, required=True, help="Shot manifest JSON")
    parser.add_argument("--mapping", default=None, help="JSON string: {scene_id: stage}")
    parser.add_argument("--mapping-file", type=Path, default=None, help="JSON file with scene_id→stage mapping")
    parser.add_argument("--dry-run", action="store_true", help="Print mapping without writing")
    args = parser.parse_args()

    if args.mapping:
        mapping = json.loads(args.mapping)
    elif args.mapping_file:
        mapping = _json_load(args.mapping_file)
    else:
        print("[ERROR] Provide --mapping or --mapping-file", file=sys.stderr)
        sys.exit(1)

    manifest = _json_load(args.manifest)
    annotated, skipped = annotate_stages(manifest, mapping)

    print(f"[STAGES] {annotated} shots annotated, {skipped} skipped (no mapping)")

    if args.dry_run:
        for shot in manifest.get("shots", []):
            sid = shot.get("shot_id", "?")
            scene = shot.get("source_scene_id", "?")
            stage = shot.get("narrative_stage", "(none)")
            print(f"  {sid}  {scene} → {stage}")
        return

    _json_dump(args.manifest, manifest)
    print(f"[STAGES] Written → {args.manifest}")


if __name__ == "__main__":
    main()
