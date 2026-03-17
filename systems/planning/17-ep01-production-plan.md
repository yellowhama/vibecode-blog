# EP01 Production Plan — "What's a Spec?" 2D Flat Vector

**Created**: 2026-03-17
**Status**: v1 COMPLETE
**Target**: Complete EP01 video, 3:00-4:00, 2D flat vector style
**Result**: EP01_v2_FINAL.mp4 — 3:22, 1280x720, 30fps, 14MB

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
