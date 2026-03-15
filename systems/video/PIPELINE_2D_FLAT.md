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

| Stage | Script | Tool | VRAM | Time | Status |
|-------|--------|------|------|------|--------|
| 1. TTS | `kokoro_tts.py` / `dia2_tts.py` | Kokoro-82M / Dia2-1B | 0-7.4GB | 1-5min | **Kokoro tested** — 287.9s EP01, 43 segments |
| 2. Timing | `whisper_timing.py` | Whisper medium | 2GB | 3min | **Tested** — 74 segments, SRT + timing.json |
| 3. Keyframes | `render_keyframes.py` | Flux.1-dev + Kontext + LoRA (ComfyUI) | ~12GB | 30min | Script ready, needs ComfyUI |
| 4. Animation | `animate_shots.py` | Wan 2.2 I2V-14B GGUF Q5 (ComfyUI) | 12-16GB | 60min | Script ready, needs model download |
| 5. Diagrams | Motion Canvas (`vibecode-diagrams/`) | TypeScript | 0 | 120min | **Project scaffolded** — 6 components, `vite build` ✅ |
| 6. BGM | `acestep_bgm.py` + `mix_audio.py` | ACE-Step 1.5 | <4GB | 1min | **Mixer tested**, ACE-Step needs install |
| 7. Assembly | Remotion (`vibecode-assembler/`) / `ffmpeg_assemble.py` | React/FFmpeg | 0 | 10min | **Project scaffolded** — `tsc` ✅ |

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

## Validated Test Outputs (EP01)

```
output/ep01/audio/narration_draft.wav    — 287.9s, 43 segments (Kokoro)
output/ep01/audio/segments/*.wav         — 43 individual WAVs
output/ep01/audio/mixed_test.wav         — 300s (narration + BGM placeholder)
output/ep01/subtitles/subtitles.srt      — 74 entries (Whisper medium)
output/ep01/subtitles/timing.json        — word-level timestamps
```

## Scripts Inventory (12 pipeline scripts)

| Script | Lines | Purpose |
|--------|-------|---------|
| `assemble_episode.py` | 200 | Master orchestrator (7 stages) |
| `animate_shots.py` | 178 | ComfyUI I2V (Wan 2.2 MoE) |
| `render_keyframes.py` | 142 | ComfyUI T2I (Flux Kontext) |
| `ffmpeg_assemble.py` | 135 | FFmpeg final assembly + shorts |
| `whisper_timing.py` | 98 | Whisper → SRT + timing.json |
| `dia2_tts.py` | 94 | Dia2-1B production TTS |
| `chatterbox_tts.py` | 91 | Chatterbox backup TTS |
| `acestep_bgm.py` | 86 | ACE-Step BGM generation |
| `kokoro_tts.py` | 74 | Kokoro-82M draft TTS |
| `mix_audio.py` | 55 | FFmpeg narration + BGM mixer |
| `tts_backends/kokoro_be.py` | 95 | Pluggable Kokoro backend |
| `tts_backends/dia2_be.py` | 89 | Pluggable Dia2 backend |

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

## TTS Backends (4 registered)

```bash
# Draft narration (CPU, instant)
python kokoro_tts.py --input script.txt --output draft.wav

# Production dialogue (GPU, multi-speaker)
python dia2_tts.py --input ep01_tts_input.json --output narration.wav

# Via pluggable backend system
python generate_tts_from_prepro.py --tts-backend kokoro ...
python generate_tts_from_prepro.py --tts-backend dia2 ...
python generate_tts_from_prepro.py --tts-backend chatterbox ...
python generate_tts_from_prepro.py --tts-backend edge ...
```

## Projects

- `vibecode-diagrams/` — Motion Canvas 3.x + Vite 5 (Kurzgesagt-style diagrams)
- `vibecode-assembler/` — Remotion 4.x (programmatic video composition)

## Next: Model Downloads & EP01 Pilot

### P1: Install remaining tools
1. `pip install dia-tts` — Dia2-1B TTS (7.4GB VRAM)
2. `git clone ace-step/ACE-Step-1.5` — BGM generation
3. Kurzgesagt LoRA (Civitai #777200) → `ComfyUI/models/loras/`

### P2: Model downloads
4. Wan 2.2 I2V-14B GGUF Q5_K_M (~8GB) → `ComfyUI/models/diffusion_models/`
5. Wan 2.2 5B (draft, ~5GB) → same dir

### P3: EP01 pilot test
6. Flux Kontext → 1 Vee keyframe (style check)
7. Wan 2.2 → 5s I2V from keyframe (2D preservation check)
8. Motion Canvas → simple diagram (workflow check)
9. Full assembly → 30s prototype

## Prerequisites

- Python: kokoro>=0.9, dia-tts, soundfile, openai-whisper
- Node: @motion-canvas/core@3, remotion@4
- System: FFmpeg, ComfyUI, rhubarb-lip-sync
- Models: Flux.1-dev (GGUF Q5), Wan 2.2 14B (GGUF Q5), ACE-Step 1.5
