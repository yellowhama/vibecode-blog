# 2D Flat Vector Animation Pipeline

100% local. CLI-driven. No cloud APIs.

## Quick Start

```bash
cd /mnt/e/vibecode-blog/systems/video/pipeline/scripts

# Draft (Kokoro TTS, ~30s)
python assemble_episode.py -e 01 --draft --skip-gpu

# Production (Dia2 + GPU stages)
python assemble_episode.py -e 01

# Single stage
python assemble_episode.py -e 01 --stage 1 --draft
```

## 7-Stage Pipeline

| Stage | Script | Tool | VRAM | Time |
|-------|--------|------|------|------|
| 1. TTS | `kokoro_tts.py` / `dia2_tts.py` | Kokoro-82M / Dia2-1B | 0-7.4GB | 1-5min |
| 2. Timing | `whisper_timing.py` | Whisper medium | 2GB | 3min |
| 3. Keyframes | `render_keyframes.py` | Flux.1-dev + Kontext + LoRA (ComfyUI) | ~12GB | 30min |
| 4. Animation | `animate_shots.py` | Wan 2.2 I2V-14B GGUF Q5 (ComfyUI) | 12-16GB | 60min |
| 5. Diagrams | Motion Canvas (`vibecode-diagrams/`) | TypeScript | 0 | 120min |
| 6. BGM | `acestep_bgm.py` + `mix_audio.py` | ACE-Step 1.5 | <4GB | 1min |
| 7. Assembly | Remotion (`vibecode-assembler/`) / `ffmpeg_assemble.py` | React/FFmpeg | 0 | 10min |

## Model Stack (2026-03)

| Category | Model | Params | VRAM | License | Notes |
|----------|-------|--------|------|---------|-------|
| TTS Draft | **Kokoro-82M** | 82M | <1GB | Apache 2.0 | 96x realtime, narration |
| TTS Prod | **Dia2-1B** | 1B | 7.4GB | Apache 2.0 | Multi-speaker dialogue, streaming |
| TTS Backup | Chatterbox-Turbo | 350M | 4-6GB | MIT | Voice cloning SOTA |
| T2I | **Flux.1-dev + Kontext** | 12B | 12GB (GGUF Q5) | Dev | Best LoRA ecosystem |
| I2V | **Wan 2.2 I2V-14B MoE** | 14B | 12-16GB (GGUF Q5) | Apache 2.0 | MoE, 2D style preservation |
| I2V Draft | Wan 2.2 5B | 5B | 8GB | Apache 2.0 | Fast iteration |
| Music | **ACE-Step 1.5** | ~1B | <4GB | Apache 2.0 | ComfyUI native, full songs |
| Lip Sync | **Rhubarb** | CPU | CPU | MIT | Phoneme-based, 2D optimal |

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
# Draft narration (CPU, instant)
python kokoro_tts.py --input script.txt --output draft.wav

# Production dialogue (GPU, multi-speaker)
python dia2_tts.py --input ep01_tts_input.json --output narration.wav

# Via pluggable backend system
python generate_tts_from_prepro.py --tts-backend kokoro ...
python generate_tts_from_prepro.py --tts-backend dia2 ...
```

## Projects

- `vibecode-diagrams/` — Motion Canvas (Kurzgesagt-style diagrams)
- `vibecode-assembler/` — Remotion (programmatic video composition)

## Prerequisites

- Python: kokoro>=0.9, dia2, soundfile, openai-whisper
- Node: @motion-canvas/core, remotion
- System: FFmpeg, ComfyUI, rhubarb-lip-sync
- Models: Flux.1-dev (GGUF Q5), Wan 2.2 14B (GGUF Q5), ACE-Step 1.5
