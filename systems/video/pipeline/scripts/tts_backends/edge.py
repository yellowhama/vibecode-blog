"""Edge TTS backend — Microsoft Edge Neural Voices via edge-tts library."""

from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path
from typing import Any, Dict

from .base import Backend, SynthOptions, TTSError, ffprobe_duration_sec, run


class EdgeBackend(Backend):
    """TTS backend using Microsoft Edge Neural Voices (online)."""

    is_local = False

    def healthcheck(self) -> tuple[bool, str]:
        try:
            import edge_tts  # noqa: F401
            return True, "edge_tts available"
        except ImportError:
            return False, "edge_tts not installed (pip install edge-tts)"

    def synthesize_to_wav(self, text: str, wav_path: Path, opts: SynthOptions) -> Dict[str, Any]:
        import edge_tts

        voice = opts.voice or "en-US-AriaNeural"
        communicate = edge_tts.Communicate(text, voice=voice, rate=opts.rate, volume=opts.volume, pitch=opts.pitch)

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_mp3 = Path(tmp.name)

        try:
            asyncio.run(communicate.save(str(tmp_mp3)))
        except Exception as exc:
            tmp_mp3.unlink(missing_ok=True)
            raise TTSError(f"edge_tts synthesis failed: {exc}") from exc

        wav_path.parent.mkdir(parents=True, exist_ok=True)
        run([
            "ffmpeg", "-y", "-i", str(tmp_mp3),
            "-ar", str(opts.sample_rate), "-ac", "1", "-c:a", "pcm_s16le",
            str(wav_path),
        ])
        tmp_mp3.unlink(missing_ok=True)

        duration = ffprobe_duration_sec(wav_path)
        return {"backend": "edge", "voice": voice, "duration_sec": round(duration, 4)}
