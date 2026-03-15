"""Base classes and utilities for TTS backends."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional


class TTSError(RuntimeError):
    """Raised when a TTS operation fails."""


@dataclass
class SynthOptions:
    language: str = "en"
    voice: str = ""
    rate: str = "+0%"
    volume: str = "+0%"
    pitch: str = "+0Hz"
    sample_rate: int = 48000
    model_id: Optional[str] = None
    model_dir: Optional[Path] = None
    device: str = "auto"
    speaker: Optional[str] = None
    speaker_wav: Optional[Path] = None
    cache_dir: Optional[Path] = None
    exaggeration: float = 0.5
    cfg_weight: float = 0.5


class Backend(ABC):
    """Abstract TTS backend."""

    is_local: bool = False

    @abstractmethod
    def healthcheck(self) -> tuple[bool, str]:
        ...

    @abstractmethod
    def synthesize_to_wav(self, text: str, wav_path: Path, opts: SynthOptions) -> Dict[str, Any]:
        ...


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a subprocess, raising TTSError on failure."""
    result = subprocess.run(cmd, capture_output=True, text=True)
    if check and result.returncode != 0:
        raise TTSError(f"Command failed: {' '.join(cmd)}\nstderr: {result.stderr}")
    return result


def ffprobe_duration_sec(path: Path) -> float:
    """Get audio duration in seconds via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True,
        text=True,
    )
    try:
        return float(result.stdout.strip())
    except (ValueError, TypeError):
        return 0.0


def generate_silence(path: Path, duration_sec: float, sample_rate: int = 48000) -> None:
    """Generate a silent WAV file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anullsrc=r={sample_rate}:cl=mono",
        "-t", f"{duration_sec:.4f}",
        "-c:a", "pcm_s16le",
        str(path),
    ])


def copy_file(src: Path, dst: Path) -> None:
    """Copy file, creating parent dirs."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def cache_key(text: str, backend_name: str, opts: SynthOptions) -> str:
    """Deterministic cache key from text + backend + options."""
    blob = json.dumps(
        {"text": text, "backend": backend_name, "voice": opts.voice, "rate": opts.rate,
         "volume": opts.volume, "pitch": opts.pitch, "sample_rate": opts.sample_rate,
         "language": opts.language},
        sort_keys=True,
    )
    return hashlib.sha256(blob.encode()).hexdigest()[:24]


# Default voice lookup per backend + language
_DEFAULT_VOICES: Dict[str, Dict[str, str]] = {
    "edge": {
        "en": "en-US-AriaNeural",
        "ko": "ko-KR-HyunsuNeural",
    },
    "chatterbox": {
        "en": "narrator",
        "ko": "narrator",
    },
}


def default_voice(language: str, backend: str = "edge") -> str:
    """Return default voice for a given language and backend."""
    lang_key = language[:2].lower() if language else "en"
    backend_map = _DEFAULT_VOICES.get(backend, _DEFAULT_VOICES.get("edge", {}))
    return backend_map.get(lang_key, backend_map.get("en", "en-US-AriaNeural"))
