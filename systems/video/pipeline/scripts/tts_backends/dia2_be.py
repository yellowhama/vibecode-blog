"""Dia2 TTS backend — multi-speaker dialogue TTS with streaming (Nari Labs)."""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any, Dict

from .base import Backend, SynthOptions, TTSError, ffprobe_duration_sec, run


class Dia2Backend(Backend):
    """TTS backend using Nari Labs Dia2 (local GPU, multi-speaker dialogue)."""

    is_local = True

    def __init__(self) -> None:
        self._model = None

    def healthcheck(self) -> tuple[bool, str]:
        try:
            import torch
            if not torch.cuda.is_available():
                return False, "CUDA not available for Dia2"
            from dia.model import Dia  # noqa: F401
            return True, f"dia2 available, CUDA device: {torch.cuda.get_device_name(0)}"
        except ImportError:
            return False, "dia2 not installed (pip install dia-tts or git clone nari-labs/dia2)"
        except Exception as exc:
            return False, f"dia2 healthcheck failed: {exc}"

    def _get_model(self, device: str = "auto"):
        if self._model is None:
            import torch
            from dia.model import Dia

            if device == "auto":
                device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = Dia.from_pretrained("nari-labs/Dia2-1B", compute_dtype="float16")
            self._model = self._model.to(device)
        return self._model

    def synthesize_to_wav(self, text: str, wav_path: Path, opts: SynthOptions) -> Dict[str, Any]:
        import numpy as np

        model = self._get_model(opts.device)

        # Dia2 uses [S1] and [S2] tags for multi-speaker dialogue
        # If text doesn't have speaker tags, wrap it as [S1]
        if "[S1]" not in text and "[S2]" not in text:
            text = f"[S1] {text}"

        try:
            output = model.generate(
                text,
                use_torch_compile=False,
                verbose=False,
            )
        except Exception as exc:
            raise TTSError(f"Dia2 synthesis failed: {exc}") from exc

        wav_path.parent.mkdir(parents=True, exist_ok=True)

        # Save via scipy
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        import scipy.io.wavfile
        audio_np = np.array(output, dtype=np.float32)
        if audio_np.max() > 1.0:
            audio_np = audio_np / np.abs(audio_np).max()
        audio_int16 = np.int16(np.clip(audio_np, -1.0, 1.0) * 32767)
        # Dia2 outputs at 44100 Hz
        scipy.io.wavfile.write(str(tmp_path), 44100, audio_int16)

        # Convert to target sample rate + mono PCM
        run([
            "ffmpeg", "-y", "-i", str(tmp_path),
            "-ar", str(opts.sample_rate), "-ac", "1", "-c:a", "pcm_s16le",
            str(wav_path),
        ])
        tmp_path.unlink(missing_ok=True)

        duration = ffprobe_duration_sec(wav_path)
        return {
            "backend": "dia2",
            "duration_sec": round(duration, 4),
            "model": "Dia2-1B",
        }
