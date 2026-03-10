#!/usr/bin/env python3
"""Audio catalog loader for BGM and SFX assets.

Loads and validates audio_catalog.json, provides lookup by ID/mood/category.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional


DEFAULT_CATALOG_PATH = Path(__file__).resolve().parent.parent / "audio_catalog.json"
DEFAULT_ASSETS_ROOT = Path(__file__).resolve().parent.parent.parent


def load_catalog(
    path: Path = DEFAULT_CATALOG_PATH,
    assets_root: Path = DEFAULT_ASSETS_ROOT,
    validate_files: bool = False,
) -> Dict[str, List[Dict[str, Any]]]:
    """Load and optionally validate audio catalog.

    Args:
        path: Path to audio_catalog.json.
        assets_root: Root directory for resolving relative asset paths.
        validate_files: If True, check that all referenced files exist.

    Returns:
        Catalog dict with "bgm" and "sfx" lists.

    Raises:
        FileNotFoundError: If catalog file doesn't exist.
        ValueError: If validation fails.
    """
    if not path.exists():
        raise FileNotFoundError(f"Audio catalog not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        catalog = json.load(f)

    if "bgm" not in catalog:
        catalog["bgm"] = []
    if "sfx" not in catalog:
        catalog["sfx"] = []

    if validate_files:
        missing = []
        for section in ("bgm", "sfx"):
            for entry in catalog[section]:
                full_path = assets_root / entry["path"]
                if not full_path.exists():
                    missing.append(f"{section}/{entry['id']}: {full_path}")
        if missing:
            raise ValueError(
                f"Audio catalog validation failed — {len(missing)} missing file(s):\n"
                + "\n".join(f"  - {m}" for m in missing)
            )

    return catalog


def select_bgm_by_stage(
    catalog: Dict[str, List[Dict[str, Any]]],
    stage: str,
    assets_root: Path = DEFAULT_ASSETS_ROOT,
) -> Optional[Dict[str, Any]]:
    """Select a BGM entry based on the narrative stage (HOOK, FURY, MESS, INSIGHT)."""
    entries = catalog.get("bgm", [])
    stage_upper = stage.upper()
    
    # Mapping stages to the narrative_stage field in our JSON
    stage_map = {
        "HOOK": "Act 3: Declaration", # Use cleaner sound for result hook
        "FURY": "Act 1: Frustration",
        "MESS": "Act 2: The Mess",
        "INSIGHT": "Act 3: Declaration"
    }
    
    target_stage = stage_map.get(stage_upper, "General / B-roll")
    
    def _resolve(entry: Dict[str, Any]) -> Dict[str, Any]:
        resolved = dict(entry)
        resolved["path"] = str(assets_root / entry["path"])
        return resolved

    # Search for matching narrative_stage
    for e in entries:
        if e.get("narrative_stage") == target_stage:
            return _resolve(e)
            
    # Fallback to general mood search if stage match fails
    return select_bgm(catalog, mood="cool_nonchalant", assets_root=assets_root)


def select_bgm(
    catalog: Dict[str, List[Dict[str, Any]]],
    bgm_id: Optional[str] = None,
    mood: Optional[str] = None,
    tags: Optional[List[str]] = None,
    assets_root: Path = DEFAULT_ASSETS_ROOT,
) -> Optional[Dict[str, Any]]:
    """Select a BGM entry from the catalog.

    Priority: exact ID match > mood match > tag match > first entry.

    Args:
        catalog: Loaded catalog dict.
        bgm_id: Exact BGM ID to look up.
        mood: Filter by mood.
        tags: Filter by any matching tag.
        assets_root: Root for resolving relative paths to absolute.

    Returns:
        BGM entry dict with resolved absolute "path", or None if empty catalog.
    """
    entries = catalog.get("bgm", [])
    if not entries:
        return None

    def _resolve(entry: Dict[str, Any]) -> Dict[str, Any]:
        resolved = dict(entry)
        resolved["path"] = str(assets_root / entry["path"])
        return resolved

    if bgm_id:
        for e in entries:
            if e["id"] == bgm_id:
                return _resolve(e)
        return None

    if mood:
        for e in entries:
            if e.get("mood") == mood:
                return _resolve(e)

    if tags:
        tag_set = set(tags)
        for e in entries:
            if tag_set & set(e.get("tags", [])):
                return _resolve(e)

    return _resolve(entries[0])


def select_sfx_by_keywords(
    catalog: Dict[str, List[Dict[str, Any]]],
    visual_text: str,
    narration_text: str,
    assets_root: Path = DEFAULT_ASSETS_ROOT,
) -> List[Dict[str, Any]]:
    """Select appropriate SFX based on keywords in visual/narration text."""
    combined = (visual_text + " " + narration_text).lower()
    selected = []
    
    # Map keywords to SFX tags in our catalog
    keyword_map = {
        "clay_squish_movement": ["clay", "squish", "move", "walk", "grab"],
        "system_explosion_glitch": ["error", "crash", "broken", "injection", "fail"],
        "fury_typing_mechanical": ["type", "code", "agent", "keyboard", "writing"],
        "meditative_hum_success": ["insight", "done", "success", "clear", "clean"]
    }
    
    for sfx_id, keywords in keyword_map.items():
        if any(k in combined for k in keywords):
            matches = select_sfx(catalog, sfx_id=sfx_id, assets_root=assets_root)
            if matches:
                selected.append(matches[0])
                
    return selected


def select_sfx(
    catalog: Dict[str, List[Dict[str, Any]]],
    sfx_id: Optional[str] = None,
    category: Optional[str] = None,
    assets_root: Path = DEFAULT_ASSETS_ROOT,
) -> List[Dict[str, Any]]:
    """Select SFX entries from the catalog.

    Args:
        catalog: Loaded catalog dict.
        sfx_id: Exact SFX ID to look up (returns single-item list).
        category: Filter by category (returns all matches).
        assets_root: Root for resolving relative paths to absolute.

    Returns:
        List of matching SFX entry dicts with resolved absolute "path".
    """
    entries = catalog.get("sfx", [])
    if not entries:
        return []

    def _resolve(entry: Dict[str, Any]) -> Dict[str, Any]:
        resolved = dict(entry)
        resolved["path"] = str(assets_root / entry["path"])
        return resolved

    if sfx_id:
        return [_resolve(e) for e in entries if e["id"] == sfx_id]

    if category:
        return [_resolve(e) for e in entries if e.get("category") == category]

    return [_resolve(e) for e in entries]


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Audio catalog utility")
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG_PATH)
    parser.add_argument("--validate", action="store_true", help="Validate that all files exist")
    parser.add_argument("--list-bgm", action="store_true")
    parser.add_argument("--list-sfx", action="store_true")
    parser.add_argument("--select-bgm", default=None, help="Select BGM by ID")
    parser.add_argument("--select-sfx", default=None, help="Select SFX by ID")
    parser.add_argument("--mood", default=None, help="Filter BGM by mood")
    parser.add_argument("--category", default=None, help="Filter SFX by category")
    args = parser.parse_args()

    cat = load_catalog(args.catalog, validate_files=args.validate)

    if args.validate:
        print("[OK] All catalog files exist")

    if args.list_bgm:
        for e in cat["bgm"]:
            print(f"  bgm/{e['id']}: {e['path']} (mood={e.get('mood')}, bpm={e.get('bpm')})")

    if args.list_sfx:
        for e in cat["sfx"]:
            print(f"  sfx/{e['id']}: {e['path']} (cat={e.get('category')}, dur={e.get('duration_sec')}s)")

    if args.select_bgm:
        result = select_bgm(cat, bgm_id=args.select_bgm)
        print(json.dumps(result, indent=2) if result else "[WARN] not found")

    if args.mood:
        result = select_bgm(cat, mood=args.mood)
        print(json.dumps(result, indent=2) if result else "[WARN] no match")

    if args.select_sfx:
        results = select_sfx(cat, sfx_id=args.select_sfx)
        print(json.dumps(results, indent=2))

    if args.category:
        results = select_sfx(cat, category=args.category)
        print(json.dumps(results, indent=2))
