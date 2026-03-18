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
| 1. TTS | `kokoro_tts.py` / `dia2_tts.py` | Kokoro-82M / Dia2-1B | 0-7.4GB | 1-5min | **Dia2 production tested** — EP01 narration ✅ |
| 2. Timing | `whisper_timing.py` | Whisper medium | 2GB | 3min | **Tested** — 87 entries SRT + timing.json ✅ |
| 3. Keyframes | `render_keyframes.py` | Flux LoRA T2I (SimpleVectorFlux) | ~12GB | 30min | **EP01 complete** — 32 keyframes via `--workflow lora` ✅ |
| 4. Animation | `animate_shots.py` | Wan 2.2 I2V-14B GGUF Q5 (ComfyUI) | 12-16GB | 60min | Available, deferred to v2 (Ken Burns v1) |
| 5. Diagrams | Motion Canvas (`vibecode-diagrams/`) | TypeScript | 0 | 120min | **Active** — Dynamic 2D rendering routed for >=60% of CORE shots |
| 6. BGM | `acestep_bgm.py` + `mix_audio.py` | ACE-Step 1.5 | <4GB | 1min | **Mixer upgraded** ✅ (ducking, crossfade, sfx) |
| 7. Assembly | `ffmpeg_assemble.py` | FFmpeg | 0 | 10min | **EP01 complete** — concat + audio overlay ✅ |

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

## EP01 Production Outputs (v1 COMPLETE — 2026-03-17)

**Final**: `output/ep01/final/EP01_v2_FINAL.mp4` — 3:22, 1280x720, 30fps, 14MB

```
output/ep01/keyframes/*.png              — 32 keyframes (SimpleVectorFlux LoRA T2I)
output/ep01/clips/*.mp4                  — 32 clips (Ken Burns zoom/pan)
output/ep01/audio/narration_v2.wav       — Dia2-1B narration
output/ep01/audio/bgm_looped.wav         — BGM (looped from bgm_real.wav)
output/ep01/audio/mixed_v2.wav           — Final mix (narration + BGM -18dB)
output/ep01/subtitles/subtitles.srt      — 87 entries (Whisper medium)
output/ep01/subtitles/timing.json        — word-level timestamps
output/ep01/final/EP01_v2_FINAL.mp4      — Final assembled video
```

### Key Decisions
- **Kontext abandoned for keyframes** — Flux Kontext drifts to photorealism regardless of style prompts
- **All keyframes via LoRA T2I** — SimpleVectorFlux enforces v3ct0r flat vector style consistently
- **Ken Burns v1** — Wan 2.2 I2V deferred to v2 for faster first completion
- **BGM looped** — ACE-Step failed due to GPU contention, used existing bgm_real.wav looped

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

## Next Steps

### EP01 v3 Upgrade (Current State)
1. **Script Validation** — `validate_screenplay.py` enforces 15 rules (Tone, Discovery Arc, 80/20 diagram ratio).
2. **Audio Mix** — `mix_audio.py` features sidechain ducking, multiple BGM crossfades, and 6 new SFX synced.
3. **Motion Canvas** — `build_shot_manifest_from_prepro.py` forces >=60% motion canvas routing for CORE beats.

### EP02 Production
4. Script writing → Fountain format
5. Shot manifest generation
6. Full pipeline run (same 7-stage flow)

## Prerequisites

- Python: kokoro>=0.9, dia-tts, soundfile, openai-whisper
- Node: @motion-canvas/core@3, remotion@4
- System: FFmpeg, ComfyUI, rhubarb-lip-sync
- Models: Flux.1-dev (GGUF Q5), Wan 2.2 14B (GGUF Q5), ACE-Step 1.5
