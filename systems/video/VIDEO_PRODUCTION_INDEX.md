# Video Production Index

Central hub for the vibecode-town video production pipeline.

Last updated: 2026-03-17

---

## Quick Links

| What | Where |
|---|---|
| **This index** | `systems/video/VIDEO_PRODUCTION_INDEX.md` |
| **Content evaluation framework** | `systems/video/planning/CONTENT_EVALUATION_FRAMEWORK.md` |
| **Pipeline scripts** | `systems/video/pipeline/scripts/` |
| **Audio catalog** | `systems/video/pipeline/audio_catalog.json` |
| **Preproduction runs** | `systems/video/preproduction/` |
| **Render outputs** | `systems/video/output/renders/` |
| **YouTube packages** | `systems/video/output/youtube_packages/` |
| **Visual assets guide** | `systems/video/planning/03-visual_assets_guide.md` |
| **Animation directing guide** | `systems/video/planning/04-animation_directing_guide.md` |

---

## 1. Source Content Inventory

Blog posts available for video production. Phase 1: "Vibe Coding Journey"

### English (Primary for video production)

| Act | File | Lines | Title | Eval Score |
|---|---|---|---|---|
| Act 1 | `content/blog/phase1/en/act1-en.md` | 322 | "I Didn't Know What a Spec Was" | **23/25** |
| Act 1-1 | `content/blog/phase1/en/act1-1-en.md` | 196 | "I Thought It Worked" | - |
| Act 1-2 | `content/blog/phase1/en/act1-2-en.md` | 159 | - | - |
| Act 1-3 | `content/blog/phase1/en/act1-3-en.md` | 184 | - | - |
| Act 1-4 | `content/blog/phase1/en/act1-4-en.md` | 353 | - | - |
| Act 2 | `content/blog/phase1/en/act2-en.md` | 354 | - | - |
| Act 2-1~4 | `content/blog/phase1/en/act2-{1..4}-en.md` | 611 | - | - |
| Act 3 | `content/blog/phase1/en/act3-en.md` | 349 | - | - |
| Act 3-1~4 | `content/blog/phase1/en/act3-{1..4}-en.md` | 542 | - | - |
| Act 4 | `content/blog/phase1/en/act4-en.md` | 202 | - | - |
| Act 4-1~4 | `content/blog/phase1/en/act4-{1..4}-en.md` | 616 | - | - |
| Act 5 | `content/blog/phase1/en/act5-en.md` | 117 | - | - |
| Act 5-1~4 | `content/blog/phase1/en/act5-{1..4}-en.md` | 563 | - | - |

### Korean (Original, used in smoke tests)

| Act | File | Lines |
|---|---|---|
| Act 1~5 | `content/blog/phase1/act{1..5}-ko.md` | ~1500 total |
| Sub-chapters | `content/blog/phase1/act{1..5}-{1..4}-ko.md` | ~3000 total |

---

## 2. Pipeline Architecture

### E2E Flow (as of 2026-03-10)

```
[Source Blog]
     │
     ▼
Stage 0: Preproduction ─────────────────────────────────
  ├─ build_blog_to_video_prepro.py    → prepro_manifest.json
  ├─ generate_tts_from_prepro.py      → voiceover WAV + actual_duration_sec feedback
  └─ build_shot_manifest_from_prepro.py --timing-source tts_actual
                                       → timing-synced shot manifest
     │
     ▼
Stage 1: Render ─────────────────────────────────────────
  ├─ sync_manifest_keyframes_to_comfy_input.py
  └─ comfy_batch_render.py            → rendered shot clips (.mp4)
     │
     ▼
Stage 2: Learning ───────────────────────────────────────
  └─ learn_from_run.py                → learning analysis
     │
     ▼
Stage 3: Vision QA ─────────────────────────────────────
  └─ evaluate_renders.py              → evaluations_summary.json
     │
     ▼
Stage 4: Auto-Correction (opt-in) ──────────────────────
  └─ qa_correction_agent.py           → corrected_manifest.json + re-render
     │
     ▼
Stage 5: Audio & Subtitle Assembly ─────────────────────
  ├─ subtitle_pipeline.py --output-format both → ASS burn-in + SRT files
  └─ audio_catalog.py                 → BGM/SFX resolution
     │
     ▼
Stage 6: YouTube Packaging ─────────────────────────────
  └─ package_for_youtube.py
       ├─ Phase A: Video assembly (transitions)
       ├─ Phase B: Subtitle burn-in
       ├─ Phase C: Audio ducking (VO + BGM sidechain)
       ├─ Phase D: Color normalization
       └─ Phase E: Quality checks + upload checklist
```

### Key Scripts

| Script | Role | Key Args |
|---|---|---|
| `run_end_to_end_video_pipeline.py` | Full E2E orchestrator | `--prepro-manifest`, `--manifest`, `--workflow`, `--bindings` |
| `build_shot_manifest_from_prepro.py` | Prepro → shot manifest | `--timing-source tts_actual\|estimate` |
| `generate_tts_from_prepro.py` | TTS narration | `--backend edge\|eleven_labs\|xtts\|mms` |
| `subtitle_pipeline.py` | Alignment + ASS/SRT | `--output-format ass\|srt\|both` |
| `audio_catalog.py` | BGM/SFX catalog | `--select-bgm`, `--mood`, `--validate` |
| `package_for_youtube.py` | Final packaging | `--bgm-id`, `--subtitle-format`, `--subtitles` |
| `comfy_batch_render.py` | ComfyUI render | `--manifest`, `--workflow` |
| `evaluate_renders.py` | Vision QA | `--provider gemini\|openai\|mock` |

### Recent Pipeline Changes (2026-03-10, commit `d61e0b9`)

1. **Timing Reconciliation**: `--timing-source tts_actual` — shot duration synced to actual TTS length + adaptive padding (0.2~2.0s)
2. **SRT Export**: `generate_srt()` via pysubs2 + `--output-format both` for YouTube external subtitles
3. **Audio Catalog**: `audio_catalog.json` + `audio_catalog.py` — BGM/SFX lookup by ID/mood/category
4. **E2E Stage 0+5**: Preproduction (TTS + timing sync) and Audio/Subtitle assembly integrated into single pipeline run

---

## 3. Preproduction Runs

### Smoke Tests (1-beat, pipeline verification)

| Run | Backend | Status | Has actual_duration_sec |
|---|---|---|---|
| `phase1_act1_ko_smoke_20260305_040832` | default | TTS+QA done | Yes |
| `phase1_act1_ko_ttsdry_20260305_043328` | dry run | TTS report | Yes |
| `phase1_act1_ko_mms_edge_fallback_20260305_063011` | mms→edge | TTS+QA done | Yes |
| `phase1_act1_ko_final_smoke_20260305_064040` | final | TTS+QA done | Yes |
| `phase1_act1_ko_xttsdry_final_20260305_064207` | xtts dry | TTS+QA done | Yes |
| `phase1_act1_one_shot_smoke_20260307_014857` | latest | TTS+QA done | **Yes** ✅ |

### Full Runs (12-beat)

| Run | Beats | Status | Has actual_duration_sec |
|---|---|---|---|
| `phase1_act1_ko_20260305_040151` | 12 | prepro only | No |
| `phase1_act1_ko_20260305_040631` | 12 | prepro + VO assembly | No |
| `phase1_act1_ko_v2_20260305_040756` | 12 | prepro only | No |

### TODO: English full prepro not yet created

---

## 4. Production Status

### EP01 "What's a Spec?" — v1 COMPLETE ✅ (2026-03-17)

**Output**: `output/ep01/final/EP01_v2_FINAL.mp4` — 3:22, 1280x720, 30fps, 14MB

| Asset | Count | Path |
|-------|-------|------|
| Keyframes | 32 PNG | `output/ep01/keyframes/` |
| Clips | 32 MP4 (Ken Burns) | `output/ep01/clips/` |
| Narration | 1 WAV (Dia2-1B) | `output/ep01/audio/narration_v2.wav` |
| BGM | 1 WAV (looped) | `output/ep01/audio/bgm_looped.wav` |
| Mixed audio | 1 WAV | `output/ep01/audio/mixed_v2.wav` |
| Subtitles | 87 entries SRT | `output/ep01/subtitles/subtitles.srt` |

**Style**: 2D flat vector (SimpleVectorFlux LoRA T2I for all keyframes)
**Animation**: Ken Burns zoom/pan fallback (v1 — Wan 2.2 I2V planned for v2)
**Production plan**: `systems/planning/17-ep01-production-plan.md`

### Pipeline Capabilities ✅

- ComfyUI batch render (Flux LoRA T2I, Kontext I2I, Wan 2.2 I2V)
- Vision QA evaluation (Gemini/OpenAI/mock)
- Auto-correction agent (re-render failed shots)
- Video assembly with xfade transitions
- Subtitle burn-in (ko/en/dual, ASS format)
- Audio ducking (VO + BGM sidechain compress)
- TTS generation (Dia2/Kokoro/Chatterbox/edge backends)
- Whisper timing → SRT + timing.json
- Ken Burns animation from keyframes
- Audio catalog system

### What's Next 🔲

- [ ] **EP01 v2 — Wan 2.2 I2V animation** — replace Ken Burns with real I2V (~6-8h GPU)
- [ ] **EP01 v2 — ACE-Step BGM** — custom BGM generation (failed v1 due to GPU contention)
- [ ] **Thumbnail pipeline** — best-frame selection + title overlay
- [ ] **EP02 production** — next episode in the vibecode series
- [ ] **YouTube upload integration** — credentials + publish_log
- [ ] **Motion Canvas diagrams** — replace Ken Burns for C01-C10 diagram shots

---

## 5. Visual Style Guide (Summary)

- **Aesthetic**: 2D flat vector, v3ct0r LoRA style
- **Background**: Clean flat colors, no gradients
- **Character**: Vee — yellow hoodie, round black glasses, brown bob hair, dot eyes
- **Style anchor**: `v3ct0r style, 2D flat vector, simple flat colors, thin outline, no gradients`
- **LoRA**: SimpleVectorFlux (`simplevector_flux_v2.safetensors`)
- **Rules**: NO 3D, NO photorealistic, NO gradients in character renders
- **Narration**: VO track + SRT subtitles burned in post

Full guide: `planning/03-visual_assets_guide.md`

---

## 6. Directory Map

```
systems/video/
├── VIDEO_PRODUCTION_INDEX.md          ← YOU ARE HERE
├── assets/
│   ├── audio/bgm/                     ← BGM files (TODO: add WAVs)
│   ├── audio/sfx/                     ← SFX files (TODO: add WAVs)
│   └── fonts/                         ← Subtitle fonts
├── output/
│   ├── renders/                       ← ComfyUI render outputs
│   ├── youtube_packages/              ← Final packaged videos
│   ├── qa_frames/                     ← QA frame extracts
│   └── logs/                          ← Pipeline logs
├── pipeline/
│   ├── audio_catalog.json             ← BGM/SFX registry
│   ├── scripts/                       ← All pipeline Python scripts
│   ├── bindings/                      ← ComfyUI workflow bindings
│   ├── learning/                      ← Learning analysis data
│   └── manifests/                     ← Generated shot manifests
├── planning/
│   ├── CONTENT_EVALUATION_FRAMEWORK.md ← Evaluation rubric
│   ├── 03-visual_assets_guide.md      ← Visual style bible
│   └── 04-animation_directing_guide.md ← Animation direction
├── preproduction/                     ← TTS + prepro manifest runs
├── scripts/                           ← ComfyUI server/render scripts
└── workflows/                         ← ComfyUI workflow JSONs
```
