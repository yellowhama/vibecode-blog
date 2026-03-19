#!/usr/bin/env python3
"""LLM-powered prompt enrichment for shot manifests.

Uses local Ollama (qwen2.5:7b-instruct) to generate rich, context-aware
T2I/I2V prompts instead of simple template concatenation.

Fallback: if Ollama is unavailable, returns None so callers can use
the existing _compose_character_prompt() template path.
"""

import hashlib
import json
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any, Dict, Optional

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5:7b-instruct"
SYSTEM_PROMPT_FILE = Path(__file__).parent / "prompt_enricher_system.md"

# Words that must never appear in generated prompts (style contamination)
BANNED_WORDS = [
    "3d", "photorealistic", "gradient", "shading", "texture", "clay",
    "claymation", "anime", "sketch", "realistic", "render", "octane",
    "unreal", "blender", "cinema4d", "raytracing", "subsurface",
]


def is_available(model: str = DEFAULT_MODEL) -> bool:
    """Check if Ollama is running and the model is loaded."""
    try:
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/tags",
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            models = [m.get("name", "") for m in data.get("models", [])]
            # Match with or without :latest suffix
            return any(model in m or m.startswith(model.split(":")[0]) for m in models)
    except (urllib.error.URLError, OSError, json.JSONDecodeError):
        return False


def _call_ollama(system: str, user: str, model: str = DEFAULT_MODEL) -> Optional[dict]:
    """Call Ollama generate API with JSON output mode."""
    payload = json.dumps({
        "model": model,
        "system": system,
        "prompt": user,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 512,
        },
    }).encode()

    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            response_text = result.get("response", "")
            return json.loads(response_text)
    except (urllib.error.URLError, OSError, json.JSONDecodeError, KeyError) as e:
        print(f"[WARN] Ollama call failed: {e}")
        return None


def _build_system_prompt() -> str:
    """Load system prompt from markdown file."""
    if SYSTEM_PROMPT_FILE.exists():
        return SYSTEM_PROMPT_FILE.read_text(encoding="utf-8")
    # Inline fallback
    return (
        "You are a prompt engineer for 2D flat vector animation. "
        "Always start prompts with 'v3ct0r style, simple flat vector art'. "
        "Output JSON with keys: prompt_positive, camera, motion, color_mood. "
        "Never use: 3D, photorealistic, gradient, shading, texture, clay, anime, sketch."
    )


def _build_user_prompt(
    beat: Dict[str, Any],
    char_prompts: Dict[str, Any],
    shot_context: Dict[str, Any],
) -> str:
    """Build the user prompt with full beat context."""
    parts = [
        f"Shot {shot_context.get('shot_index', 0)+1} of {shot_context.get('total_shots', 30)}",
        f"Segment: {beat.get('segment', 'CORE')}",
        f"Visual goal: {beat.get('visual_goal', '')}",
        f"Narrator VO: {beat.get('narrator_vo', '')}",
        f"Vee expression: {beat.get('vee_expression', 'default')}",
        f"Space: {beat.get('space', 'desk')}",
        f"Characters: {', '.join(beat.get('characters', ['vee']))}",
    ]

    prev = shot_context.get("prev_visual_goal")
    if prev:
        parts.append(f"Previous shot visual: {prev}")
    nxt = shot_context.get("next_visual_goal")
    if nxt:
        parts.append(f"Next shot visual: {nxt}")

    # Character design reference
    trigger = char_prompts.get("trigger_word", "v3ct0r")
    base = char_prompts.get("positive_base", "")
    if base:
        parts.append(f"Character base prompt reference: {base}")

    parts.append(
        "Generate a unique, detailed prompt for this specific shot. "
        "Output JSON with exactly 4 keys: prompt_positive, camera, motion, color_mood."
    )
    return "\n".join(parts)


def _sanitize_prompt(text: str) -> str:
    """Remove banned words from generated prompt."""
    words = text.split(", ")
    cleaned = []
    for word in words:
        word_lower = word.lower().strip()
        if not any(banned in word_lower for banned in BANNED_WORDS):
            cleaned.append(word)
    result = ", ".join(cleaned)
    # Ensure it starts with the style trigger
    if not result.lower().startswith("v3ct0r"):
        result = "v3ct0r style, simple flat vector art, " + result
    return result


def _parse_enrichment(response: dict) -> Optional[Dict[str, str]]:
    """Parse and validate LLM response."""
    required_keys = {"prompt_positive", "camera", "motion", "color_mood"}
    if not isinstance(response, dict):
        return None
    if not required_keys.issubset(response.keys()):
        # Try to salvage partial response
        if "prompt_positive" not in response:
            return None

    result = {}
    for key in required_keys:
        val = response.get(key, "")
        if isinstance(val, str):
            result[key] = val.strip()
        else:
            result[key] = str(val).strip() if val else ""

    # Sanitize the main prompt
    result["prompt_positive"] = _sanitize_prompt(result["prompt_positive"])
    return result


def _cache_key(beat: Dict[str, Any]) -> str:
    """Generate SHA256 cache key from beat content."""
    parts = [
        str(beat.get("visual_goal", "")),
        str(beat.get("narrator_vo", "")),
        str(beat.get("segment", "")),
        str(beat.get("vee_expression", "")),
        str(beat.get("space", "")),
    ]
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def load_cache(path: Path) -> Dict[str, Any]:
    """Load enrichment cache from disk."""
    if path.exists():
        try:
            with path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_cache(path: Path, cache: Dict[str, Any]) -> None:
    """Save enrichment cache to disk."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print(f"[WARN] Failed to save enrichment cache: {e}")


def enrich_shot_prompt(
    beat: Dict[str, Any],
    char_prompts: Dict[str, Any],
    shot_context: Dict[str, Any],
    *,
    model: str = DEFAULT_MODEL,
    cache: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """Enrich a single shot prompt using Ollama LLM.

    Returns the enriched prompt_positive string, or None if LLM fails
    (caller should fall back to template).
    """
    key = _cache_key(beat)

    # Cache hit
    if cache is not None and key in cache:
        cached = cache[key]
        if isinstance(cached, dict) and "prompt_positive" in cached:
            return cached["prompt_positive"]

    system = _build_system_prompt()
    user = _build_user_prompt(beat, char_prompts, shot_context)

    response = _call_ollama(system, user, model=model)
    if response is None:
        return None

    enrichment = _parse_enrichment(response)
    if enrichment is None:
        return None

    # Store full enrichment in cache
    if cache is not None:
        cache[key] = enrichment

    return enrichment["prompt_positive"]
