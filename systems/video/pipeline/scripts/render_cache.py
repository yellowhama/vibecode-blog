#!/usr/bin/env python3
"""Content-addressable render cache for incremental shot rendering.

Each shot config is hashed (prompt + seed + resolution + steps + cfg + input_image SHA).
If the hash matches a previous render and the output file exists, the shot is skipped.

Cache file: {run_dir}/.render_cache.json
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Optional


def compute_shot_hash(shot: Dict[str, Any]) -> str:
    """Compute a deterministic SHA256 hash for a shot config.

    Hashes the fields that affect render output:
    prompt_positive, prompt_negative, seed, resolution, duration_sec,
    mode, model, input_image content (if exists), and workflow_overrides.
    """
    m = hashlib.sha256()
    for key in (
        "prompt_positive",
        "prompt_negative",
        "seed",
        "resolution",
        "duration_sec",
        "aspect_ratio",
        "mode",
        "model",
    ):
        m.update(str(shot.get(key, "")).encode("utf-8"))

    # Hash input image content if it exists (for i2v mode)
    input_image = shot.get("input_image", "")
    if input_image:
        img_path = Path(input_image)
        if img_path.exists():
            m.update(hashlib.sha256(img_path.read_bytes()).digest())
        else:
            m.update(input_image.encode("utf-8"))

    # Hash workflow overrides if present
    overrides = shot.get("workflow_overrides", [])
    if overrides:
        m.update(json.dumps(overrides, sort_keys=True).encode("utf-8"))

    return m.hexdigest()


def load_cache(cache_path: Path) -> Dict[str, Dict[str, Any]]:
    """Load render cache from JSON file."""
    if cache_path.exists():
        with cache_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache_path: Path, cache: Dict[str, Dict[str, Any]]) -> None:
    """Save render cache to JSON file."""
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    with cache_path.open("w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def check_cache_hit(
    cache: Dict[str, Dict[str, Any]],
    shot_id: str,
    shot_hash: str,
) -> Optional[str]:
    """Check if a shot has a valid cache hit.

    Returns the cached output path if hash matches and file exists, else None.
    """
    entry = cache.get(shot_id)
    if entry is None:
        return None
    if entry.get("hash") != shot_hash:
        return None
    output_path = entry.get("output_path")
    if not output_path:
        return None
    # Verify the output file still exists
    if not Path(output_path).exists():
        return None
    return output_path


def update_cache(
    cache: Dict[str, Dict[str, Any]],
    shot_id: str,
    shot_hash: str,
    output_path: str,
) -> None:
    """Update cache entry for a shot."""
    from datetime import datetime

    cache[shot_id] = {
        "hash": shot_hash,
        "output_path": output_path,
        "cached_at": datetime.now().isoformat(),
    }
