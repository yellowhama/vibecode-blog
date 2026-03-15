"""TTS backend registry — pluggable synthesis engines."""

from __future__ import annotations

from typing import Any, Dict

from .base import Backend

# Registry of available backends
_REGISTRY: Dict[str, Dict[str, Any]] = {
    "edge": {
        "module": "tts_backends.edge",
        "class": "EdgeBackend",
        "description": "Microsoft Edge Neural Voices (online)",
        "is_local": False,
    },
    "chatterbox": {
        "module": "tts_backends.chatterbox_be",
        "class": "ChatterboxBackend",
        "description": "Resemble AI Chatterbox — local neural TTS with emotion control",
        "is_local": True,
    },
    "kokoro": {
        "module": "tts_backends.kokoro_be",
        "class": "KokoroBackend",
        "description": "Kokoro-82M — ultrafast local TTS for draft iteration",
        "is_local": True,
    },
}


def list_backend_names() -> list[str]:
    """Return available backend names."""
    return list(_REGISTRY.keys())


def backend_info() -> Dict[str, Dict[str, Any]]:
    """Return metadata for all registered backends."""
    return dict(_REGISTRY)


def make_backend(name: str) -> Backend:
    """Instantiate a TTS backend by name."""
    if name not in _REGISTRY:
        raise ValueError(f"Unknown TTS backend: {name}. Available: {list_backend_names()}")

    entry = _REGISTRY[name]
    import importlib
    mod = importlib.import_module(entry["module"])
    cls = getattr(mod, entry["class"])
    return cls()
