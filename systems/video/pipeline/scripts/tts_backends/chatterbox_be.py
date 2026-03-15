"""Chatterbox TTS backend — local neural TTS with emotion control and voice cloning."""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any, Dict

from .base import Backend, SynthOptions, TTSError, ffprobe_duration_sec, run


class ChatterboxBackend(Backend):
    """TTS backend using Resemble AI Chatterbox (local GPU)."""

    is_local = True

    def __init__(self) -> None:
        self._model = None

    def healthcheck(self) -> tuple[bool, str]:
        try:
            import torch
            if not torch.cuda.is_available():
                return False, "CUDA not available for Chatterbox"
            # Try import without loading model
            from chatterbox.tts import ChatterboxTTS  # noqa: F401
            return True, f"chatterbox available, CUDA device: {torch.cuda.get_device_name(0)}"
        except ImportError:
            return False, "chatterbox-tts not installed (pip install chatterbox-tts)"
        except Exception as exc:
            return False, f"chatterbox healthcheck failed: {exc}"

    def _get_model(self, device: str = "auto"):
        if self._model is None:
            import torch
            from chatterbox.tts import ChatterboxTTS

            if device == "auto":
                device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = ChatterboxTTS.from_pretrained(device=device)
        return self._model

    def synthesize_to_wav(self, text: str, wav_path: Path, opts: SynthOptions) -> Dict[str, Any]:
        import numpy as np
        import torch

        model = self._get_model(opts.device)

        # Generate with optional speaker reference and emotion control
        gen_kwargs: Dict[str, Any] = {"text": text}

        if opts.speaker_wav and opts.speaker_wav.exists():
            gen_kwargs["audio_prompt"] = opts.speaker_wav

        gen_kwargs["exaggeration"] = opts.exaggeration
        gen_kwargs["cfg_weight"] = opts.cfg_weight

        try:
            wav_tensor = model.generate(**gen_kwargs)
        except Exception as exc:
            raise TTSError(f"Chatterbox synthesis failed: {exc}") from exc

        wav_path.parent.mkdir(parents=True, exist_ok=True)

        # Save to temp WAV via scipy (avoids torchaudio torchcodec dependency)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        import scipy.io.wavfile
        audio_np = wav_tensor.squeeze().cpu().numpy()
        # Normalize to int16 range
        audio_int16 = np.int16(np.clip(audio_np, -1.0, 1.0) * 32767)
        scipy.io.wavfile.write(str(tmp_path), model.sr, audio_int16)

        # Convert to target sample rate + mono PCM
        run([
            "ffmpeg", "-y", "-i", str(tmp_path),
            "-ar", str(opts.sample_rate), "-ac", "1", "-c:a", "pcm_s16le",
            str(wav_path),
        ])
        tmp_path.unlink(missing_ok=True)

        duration = ffprobe_duration_sec(wav_path)
        return {
            "backend": "chatterbox",
            "duration_sec": round(duration, 4),
            "exaggeration": opts.exaggeration,
            "cfg_weight": opts.cfg_weight,
            "speaker_wav": str(opts.speaker_wav) if opts.speaker_wav else None,
        }
