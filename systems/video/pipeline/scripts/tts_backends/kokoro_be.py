"""Kokoro-82M TTS backend — ultrafast local neural TTS for draft iteration."""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any, Dict

from .base import Backend, SynthOptions, TTSError, ffprobe_duration_sec, run


class KokoroBackend(Backend):
    """TTS backend using Kokoro-82M (local CPU/GPU, 96x realtime on CPU)."""

    is_local = True

    def __init__(self) -> None:
        self._pipeline = None

    def healthcheck(self) -> tuple[bool, str]:
        try:
            import kokoro  # noqa: F401
            import soundfile  # noqa: F401
            return True, "kokoro available"
        except ImportError:
            return False, "kokoro not installed (pip install kokoro>=0.9 soundfile)"
        except Exception as exc:
            return False, f"kokoro healthcheck failed: {exc}"

    def _get_pipeline(self, lang_code: str = "a"):
        if self._pipeline is None or self._lang_code != lang_code:
            from kokoro import KPipeline

            self._pipeline = KPipeline(lang_code=lang_code)
            self._lang_code = lang_code
        return self._pipeline

    def synthesize_to_wav(self, text: str, wav_path: Path, opts: SynthOptions) -> Dict[str, Any]:
        import numpy as np
        import soundfile as sf

        # Map language option to Kokoro lang_code
        lang_code = "a"  # default: American English
        if opts.language:
            lang_lower = opts.language.lower()
            if lang_lower in ("b", "british", "en-gb"):
                lang_code = "b"
            elif lang_lower in ("a", "american", "en-us"):
                lang_code = "a"
            # Pass through single-letter codes directly
            elif len(lang_lower) == 1:
                lang_code = lang_lower

        pipeline = self._get_pipeline(lang_code)
        voice = opts.voice or "af_heart"

        try:
            # Collect all audio chunks from the generator
            audio_chunks = []
            for _gs, _ps, audio in pipeline(text, voice=voice):
                if audio is not None:
                    audio_chunks.append(audio)

            if not audio_chunks:
                raise TTSError("Kokoro produced no audio output")

            full_audio = np.concatenate(audio_chunks)
        except TTSError:
            raise
        except Exception as exc:
            raise TTSError(f"Kokoro synthesis failed: {exc}") from exc

        wav_path.parent.mkdir(parents=True, exist_ok=True)

        # Save to temp WAV at native 24000 Hz
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        sf.write(str(tmp_path), full_audio, 24000)

        # Convert to target sample rate + mono PCM via ffmpeg
        run([
            "ffmpeg", "-y", "-i", str(tmp_path),
            "-ar", str(opts.sample_rate), "-ac", "1", "-c:a", "pcm_s16le",
            str(wav_path),
        ])
        tmp_path.unlink(missing_ok=True)

        duration = ffprobe_duration_sec(wav_path)
        return {
            "backend": "kokoro",
            "duration_sec": round(duration, 4),
            "voice": voice,
            "lang_code": lang_code,
        }
