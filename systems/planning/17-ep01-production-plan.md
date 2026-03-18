# EP01 Production Plan — "What's a Spec?" 2D Flat Vector

**Created**: 2026-03-17
**Status**: v2 IN PROGRESS — 7:30 expansion
**Target**: Complete EP01 video, 7:00-7:30, 2D flat vector style
**v1 Result**: EP01_v2_FINAL.mp4 — 3:22, 1280x720, 30fps, 14MB (3:55 version, superseded)
**v2 Target**: EP01 v5 script (53 beats, 450s) — needs full pipeline re-run

## Phase 1: Workflow + Asset Fix ✅ COMPLETE

### 1.1 Kontext Workflow GGUF Conversion ✅
- `pipeline/workflows/flux_kontext_2d_edit.json` — converted to UnetLoaderGGUF + DualCLIPLoaderGGUF + VAELoader
- Now matches `api/flux_kontext_edit.json` pattern with FluxKontextImageScale + ReferenceLatent
- Model: `flux1-kontext-dev-Q5_K_S.gguf` (confirmed in unet/ directory)

### 1.2 Golden Front Reference
- `golden/vee_2d_golden_front.png` — already exists
- `golden/vee_2d_golden_3q.png` — already exists
- `golden/vee_2d_golden_full.png` — already exists
- `character_design_2d.json` status updated: GENERATED

### 1.3 generate_kontext_keyframes.py 2D Update ✅
- `STYLE_ANCHOR` changed from "3D Pixar-like render style." to "2D flat vector style, v3ct0r style, simple flat colors, thin outline, no gradients."

### 1.4 Shot Manifest kontext_prompt Fields ✅
- 13 character shots updated with kontext_prompt: H01-H03, P01-P04, C15, A01-A02, A04, O01-O02

## Phase 2: EP01 Keyframe Render ✅ COMPLETE

### Shot Classification

| Strategy | Shot IDs | Count |
|----------|----------|-------|
| **Kontext** (character) | H01-H03, P01-P04, C15, A01-A02, A04, O01-O02 | 13 |
| **T2I LoRA** (diagram/title) | H04, P05, C11-C13, A03, O03 | 7 |
| **Motion Canvas** (animated diagram) | C01-C10, C14, C16 | 12 |

### Render Commands
```bash
# Kontext character keyframes
python3 generate_kontext_keyframes.py \
  --manifest ep01_shot_manifest_v5.json \
  --golden-ref vee_2d_golden_front.png \
  --output-dir output/ep01/keyframes/ \
  --comfy-input /home/hugh/ComfyUI/app/input

# T2I diagram keyframes
python3 render_keyframes.py \
  --manifest ep01_shot_manifest_v5.json \
  --output output/ep01/keyframes/ \
  --workflow t2i
```

## Phase 3: Audio Pipeline ✅ COMPLETE

1. Fountain → TTS input parsing
2. Dia2 narration generation
3. Whisper timing + SRT
4. ACE-Step BGM
5. Audio mixing

## Phase 4: I2V Animation ✅ COMPLETE (Ken Burns fallback)

- Wan 2.2 MoE I2V for character + diagram shots
- Motion Canvas for C01-C10
- Ken Burns fallback for remaining diagrams

## Phase 5: Assembly + QC ✅ COMPLETE

- FFmpeg shot-audio sync
- Final assembly 1280x720
- Shorts extraction (2x)
- QC checklist

---

## Phase 6: 7:30 Expansion (2026-03-18) — IN PROGRESS

### 6.0 Infrastructure ✅ COMPLETE
- `validate_screenplay.py` — timing constants updated (TOTAL 300-600s, CORE 270s, VEE 10, METAPHOR 120s)
- `SERIES_BIBLE.md` — format 5-10min target 7:30, segment timing table, beats 24-40
- `CONTENT_EVALUATION_FRAMEWORK.md` — Axis 4 + Pacing Targets updated

### 6.1 EP01-04 Script Expansion ✅ COMPLETE
| EP | Version | Beats | Duration | Commit |
|----|---------|-------|----------|--------|
| EP01 | v4→v5 | 30→53 | 3:55→7:30 | `1b7994f` |
| EP02 | v6→v7 | 36→46 | 3:55→7:30 | `1b7994f` |
| EP03 | v5→v6 | 24→38 | 3:55→7:30 | `1b7994f` |
| EP04 | v5→v6 | 25→41 | 3:55→7:30 | `1b7994f` |

### 6.2 Pipeline Artifacts ✅ COMPLETE
- prepro_manifest: EP01 v5, EP02 v7, EP03 v7, EP04 v7
- shot_manifest v8: all 4 episodes (30 shots each)
- source_index.json: updated to new versions
- Validation: 0 timing FAILs (pattern interrupt avg interval is expected for 7:30)

### 6.3 TTS Pre-processing ✅ COMPLETE
- `prepare_tts_script.py` — pronunciation, pause, emotion curve preprocessing
- `tts_rules.yaml` — 18 exact pronunciation fixes + 2 regex patterns + 6 pivot pauses + 7 emotion curves
- EP01: 52/53 beats modified (98.1%), exagg 0.40-0.98
- EP02: 42/46 beats modified (91.3%), exagg 0.40-1.00
- EP04: 39/41 beats modified (95.1%), exagg 0.40-0.94
- All 6 segments active: HOOK, MISCONCEPTION, THE_CRACK, CORE, REFRAME, OUTRO_CTA
- `generate_tts_from_prepro.py` updated: reads `tts_text` + per-beat `tts_exaggeration`
- `tts_backends/base.py` cache_key now includes exaggeration + cfg_weight
- Commit: `(this commit)`

### 6.3b TTS Re-generation ⬜ PENDING
- Chatterbox TTS with preprocessed text for all 4 episodes
- Target: 390-510s TTS total per episode

### 6.4 Keyframe + I2V Re-render ⬜ PENDING
- Shot count nearly doubled — all keyframes need re-rendering
- Kontext (character), T2I (diagram), Motion Canvas (animated diagram)

### 6.5 Assembly + QC ⬜ PENDING
- FFmpeg assembly per new shot manifests
- Shorts re-extraction
- QC against 7:30 target

## Timeline

```
Phase 1 (workflow+assets)  ████████████████ DONE
Phase 2 (keyframes)        ████████ (~1h GPU)
Phase 3 (audio)            ████ (~30min, after Phase 2)
Phase 4 (I2V)              ████████████████████████ (~6-8h)
Phase 5 (assembly)         ████ (~1h)
                           Total remaining: ~9-11h
```

## Files Modified

| File | Change |
|------|--------|
| `pipeline/workflows/flux_kontext_2d_edit.json` | GGUF nodes + proper Kontext pattern |
| `pipeline/scripts/generate_kontext_keyframes.py` | STYLE_ANCHOR 3D→2D |
| `preproduction/ep01/ep01_shot_manifest_v5.json` | kontext_prompt fields for 13 shots |
| `assets/characters/vee/character_design_2d.json` | golden_references.status → GENERATED |
| `pipeline/config/tts_rules.yaml` | **NEW** pronunciation/pause/emotion rules |
| `pipeline/scripts/prepare_tts_script.py` | **NEW** TTS preprocessing (~185 lines) |
| `pipeline/scripts/generate_tts_from_prepro.py` | tts_text + per-beat exaggeration support |
| `pipeline/scripts/tts_backends/base.py` | cache_key includes exaggeration + cfg_weight |
