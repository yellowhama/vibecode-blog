#!/usr/bin/env python3
"""Sync keyframe images referenced in a shot manifest to ComfyUI's input/ folder.

Reads each shot's input_image field, searches for the file in one or more
directories, and copies it to ComfyUI's input/ folder so the render can find it.

Usage:
    python sync_manifest_keyframes_to_comfy_input.py \
        --manifest shots.json \
        --search-dir output/renders/kontext_keyframes \
        --search-dir systems/video/assets/characters/vee \
        --comfy-input /home/hugh/ComfyUI/app/input
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path


DEFAULT_COMFY_INPUT = Path("/home/hugh/ComfyUI/app/input")

DEFAULT_SEARCH_DIRS = [
    Path(__file__).resolve().parent.parent.parent / "output" / "renders" / "kontext_keyframes",
    Path(__file__).resolve().parent.parent.parent / "output" / "renders",
    Path(__file__).resolve().parent.parent.parent / "assets" / "characters" / "vee",
]


def sync_keyframes(
    manifest_path: Path,
    search_dirs: list[Path],
    comfy_input: Path,
) -> dict[str, str]:
    """Copy keyframe images to ComfyUI input/ folder.

    Returns dict mapping shot_id -> status ("synced", "exists", "not_found", "no_image").
    """
    with manifest_path.open("r", encoding="utf-8") as f:
        manifest = json.load(f)

    shots = manifest.get("shots", [])
    if not shots:
        print("[WARN] No shots in manifest.")
        return {}

    comfy_input.mkdir(parents=True, exist_ok=True)
    results = {}

    for shot in shots:
        shot_id = shot.get("shot_id", "unknown")
        input_image = shot.get("input_image")

        if not input_image:
            results[shot_id] = "no_image"
            continue

        filename = Path(input_image).name
        dst = comfy_input / filename

        # Already in ComfyUI input/?
        if dst.exists():
            results[shot_id] = "exists"
            continue

        # Search for the file
        found = False
        for search_dir in search_dirs:
            src = search_dir / filename
            if src.exists():
                shutil.copy2(src, dst)
                print(f"  [SYNC] {filename} → {dst}")
                results[shot_id] = "synced"
                found = True
                break

            # Also check if input_image is a relative path
            src_rel = search_dir / input_image
            if src_rel.exists():
                shutil.copy2(src_rel, dst)
                print(f"  [SYNC] {input_image} → {dst}")
                results[shot_id] = "synced"
                found = True
                break

        if not found:
            # Check if it's an absolute path that exists
            abs_path = Path(input_image)
            if abs_path.is_absolute() and abs_path.exists():
                shutil.copy2(abs_path, dst)
                print(f"  [SYNC] {abs_path} → {dst}")
                results[shot_id] = "synced"
            else:
                print(f"  [MISS] {filename} not found in any search directory")
                results[shot_id] = "not_found"

    synced = sum(1 for v in results.values() if v == "synced")
    exists = sum(1 for v in results.values() if v == "exists")
    missing = sum(1 for v in results.values() if v == "not_found")
    print(f"\n[SYNC] {synced} copied, {exists} already present, {missing} not found")
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync manifest keyframes to ComfyUI input/")
    parser.add_argument("--manifest", required=True, type=Path,
                        help="Shot manifest JSON")
    parser.add_argument("--search-dir", action="append", type=Path, default=None,
                        help="Directory to search for keyframe images (repeatable)")
    parser.add_argument("--comfy-input", type=Path, default=DEFAULT_COMFY_INPUT,
                        help=f"ComfyUI input directory (default: {DEFAULT_COMFY_INPUT})")
    args = parser.parse_args()

    if not args.manifest.exists():
        print(f"[ERROR] Manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    search_dirs = args.search_dir if args.search_dir else DEFAULT_SEARCH_DIRS
    # Filter to only existing directories
    search_dirs = [d for d in search_dirs if d.exists()]
    if not search_dirs:
        print("[WARN] No search directories exist. Nothing to sync.")
        return 0

    results = sync_keyframes(args.manifest, search_dirs, args.comfy_input)

    not_found = sum(1 for v in results.values() if v == "not_found")
    return 1 if not_found > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
