# 2D Flat Vector Animation Pipeline

100% local. CLI-driven. No cloud APIs.

## Quick Start

```bash
cd /mnt/e/vibecode-blog/systems/video/pipeline/scripts

# Draft (Kokoro TTS, ~30s)
python assemble_episode.py -e 01 --draft --skip-gpu

# Production (Chatterbox + GPU stages)
python assemble_episode.py -e 01

# Single stage
python assemble_episode.py -e 01 --stage 1 --draft
```

## 7-Stage Pipeline

| Stage | Script | Tool | VRAM | Time |
|-------|--------|------|------|------|
| 1. TTS | `kokoro_tts.py` / `chatterbox_tts.py` | Kokoro-82M / Chatterbox | 0-8GB | 1-5min |
| 2. Timing | `whisper_timing.py` | Whisper medium | 2GB | 3min |
| 3. Keyframes | `render_keyframes.py` | Flux + LoRA (ComfyUI) | ~12GB | 30min |
| 4. Animation | `animate_shots.py` | Wan 2.1 I2V (ComfyUI) | 8-10GB | 60min |
| 5. Diagrams | Motion Canvas (`vibecode-diagrams/`) | TypeScript | 0 | 120min |
| 6. BGM | `acestep_bgm.py` + `mix_audio.py` | ACE-Step | <4GB | 1min |
| 7. Assembly | Remotion (`vibecode-assembler/`) / `ffmpeg_assemble.py` | React/FFmpeg | 0 | 10min |

## Directory Layout

```
preproduction/ep{NN}/        # Inputs
  ep{NN}_script.fountain
  ep{NN}_tts_input.json
  ep{NN}_shot_manifest.json

output/ep{NN}/               # Outputs
  audio/narration.wav
  audio/segments/*.wav
  audio/bgm.wav
  audio/mixed_audio.wav
  subtitles/subtitles.srt
  subtitles/timing.json
  renders/keyframes/*.png
  renders/clips/*.mp4
  renders/explainer/*.png
  final/EP{NN}_FINAL.mp4
```

## TTS Backends

```bash
# Draft iteration (CPU, 96x realtime)
python kokoro_tts.py --input script.txt --output draft.wav

# Production (GPU, emotion control)
python chatterbox_tts.py --input ep01_tts_input.json --output narration.wav --emotion 0.7

# Via pluggable backend system
python generate_tts_from_prepro.py --tts-backend kokoro ...
python generate_tts_from_prepro.py --tts-backend chatterbox ...
```

## Projects

- `vibecode-diagrams/` — Motion Canvas (Kurzgesagt-style diagrams)
- `vibecode-assembler/` — Remotion (programmatic video composition)

## Prerequisites

- Python: kokoro>=0.9, soundfile, chatterbox-tts, openai-whisper
- Node: @motion-canvas/core, remotion
- System: FFmpeg, ComfyUI
- Models: Flux.1-dev, Kurzgesagt LoRA, Wan 2.1 14B Q4
