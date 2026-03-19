# ComfyUI API Workflow Templates

2026-03-11 동작 확인 완료. RTX 5070 Ti (16GB VRAM) 기준.

## 모델 2종 체제

| 모델 | 용도 | 비고 |
|------|------|------|
| **Flux.1-dev GGUF** | 이미지 생성 (캐릭터시트, 키프레임, 컨셉아트) | T2I 전용 |
| **Wan 2.2 MoE GGUF** | 영상 생성 (I2V 프로덕션 샷) | I2V 전용 |

> **원칙: 이미지는 Flux, 영상은 Wan.** 영상 모델로 이미지를 찍지 않는다.

---

## Flux.1-dev (이미지 생성)

### 워크플로우

| 파일 | 용도 | 해상도 | VRAM | 소요시간 |
|------|------|--------|------|----------|
| `flux_dev_t2i.json` | 기본 T2I (캐릭터시트, 컨셉아트) | 1024x1024 | ~9GB | ~2분 |
| `flux_controlnet_t2i.json` | T2I + ControlNet 포즈 제어 | 1024x1024 | ~13GB | ~3분 |
| `flux_lora_t2i.json` | T2I + LoRA 캐릭터 고정 | 1024x1024 | ~9.2GB | ~2분 |
| `flux_lora_controlnet_t2i.json` | T2I + LoRA + ControlNet 결합 | 1024x1024 | ~13.2GB | ~3분 |
| `flux_kontext_edit.json` | **Kontext 씬 편집 (캐릭터 일관성)** | 자동 | ~12GB | ~3분 |
| `flux_pulid_t2i.json` | T2I + PuLID 얼굴 일관성 | 1024x1024 | ~11.6GB | ~3분 |
| `flux_pulid_controlnet_t2i.json` | T2I + PuLID + ControlNet 포즈 | 1024x1024 | ~15.6GB | ~4분 |
| `flux_face_inpaint.json` | 얼굴 인페인팅 (Flux Fill) | 원본 유지 | ~9GB | ~2분 |

### 바인딩

| 파일 | 대상 |
|------|------|
| `flux_dev_t2i_bindings.json` | 기본 T2I |
| `flux_controlnet_t2i_bindings.json` | ControlNet 포즈 |
| `flux_lora_t2i_bindings.json` | LoRA 캐릭터 |
| `flux_lora_controlnet_t2i_bindings.json` | LoRA + ControlNet |
| `flux_kontext_edit_bindings.json` | **Kontext 씬 편집** |
| `flux_pulid_t2i_bindings.json` | PuLID 얼굴 일관성 |
| `flux_pulid_controlnet_t2i_bindings.json` | PuLID + ControlNet |
| `flux_face_inpaint_bindings.json` | 얼굴 인페인팅 |

### 노드 구조 (기본 T2I)

```
UnetLoaderGGUF(flux1-dev-Q5_K_S)
DualCLIPLoaderGGUF(T5-XXL Q5_K_M + CLIP-L, type="flux")
VAELoader(ae.safetensors)
         ↓
CLIPTextEncode → FluxGuidance(3.5)
         ↓
EmptySD3LatentImage(1024x1024)
         ↓
KSampler(cfg=1.0, euler/simple, 20 steps)
         ↓
VAEDecode → SaveImage
```

### 노드 구조 (Kontext 씬 편집) — 캐릭터 일관성 추천

```
LoadImage(golden_ref) → FluxKontextImageScale → VAEEncode ─┬→ KSampler latent_image
                                                            │
DualCLIPLoaderGGUF → CLIPTextEncode(편집 지시문) ──┐        │
                                                    ├→ ReferenceLatent → FluxGuidance(2.5) → KSampler positive
                     CLIPTextEncode → ConditioningZeroOut ──────────────────────────────────→ KSampler negative

UnetLoaderGGUF(kontext-Q5_K_S) ─────────────────────────────────────────────────────────────→ KSampler model
                                                                                                │
                                                                                          VAEDecode → SaveImage
```

### 노드 구조 (PuLID T2I)

```
UnetLoaderGGUF(flux1-dev) ───────────────────────────────┐
                                                          │
PulidFluxModelLoader(pulid_v0.9.1) ──┐                   │
PulidFluxInsightFaceLoader(CPU) ─────┤                   │
PulidFluxEvaClipLoader ──────────────┤                   │
LoadImage(golden_ref) ───────────────┤                   │
                          ApplyPulidFlux(weight=1.0) ←───┘
                                  │ (modified model)
DualCLIPLoaderGGUF → CLIPTextEncode → FluxGuidance(3.5)
                                  │
EmptySD3LatentImage(1024x1024) ───┴── KSampler(cfg=1.0, euler/simple, 20 steps)
                                          │
                                    VAEDecode → SaveImage
```

### 노드 구조 (PuLID + ControlNet)

```
UnetLoaderGGUF(flux1-dev) → ApplyPulidFlux(weight=1.0)
                                    │ (PuLID modified model)
DualCLIPLoaderGGUF → CLIPTextEncode → FluxGuidance(3.5)
                                    │
LoadImage(pose_ref) → OpenPose ──→ ControlNetApplySD3(0.7)
ControlNetLoader(Union-Pro) ────→       │
                                  KSampler(PuLID model + CN conditioning) → VAEDecode → SaveImage
```

### 노드 구조 (LoRA + ControlNet)

```
UnetLoaderGGUF(flux1-dev) → LoraLoader(vee_v1, 0.8)
DualCLIPLoaderGGUF ──────→ LoraLoader (clip도 함께)
                                    ↓
                CLIPTextEncode → FluxGuidance(3.5)
                                    ↓
LoadImage(pose_ref) → OpenPose ──→ ControlNetApplyAdvanced(0.7)
ControlNetLoader(Union-Pro-2.0) ─→       ↓
                                    KSampler → VAEDecode → SaveImage
```

### 추가 모델 경로 (설치 필요)

```
ComfyUI/app/models/
├── unet/flux1-kontext-dev-Q5_K_S.gguf                               (8.3GB, Kontext 씬 편집)
├── pulid/pulid_flux_v0.9.1.safetensors                              (1.1GB, Phase A — PuLID)
├── controlnet/xinsir-controlnet-union-sdxl-1.0-promax.safetensors  (3.98GB, Phase 1)
├── loras/vee_v1.safetensors                                        (학습 후, Phase 2)
└── unet/flux1-fill-dev-Q5_K_S.gguf                                 (7.8GB, Phase 3)
```

### Flux 세팅
- **cfg=1.0 고정** — guidance는 `FluxGuidance` 노드에서 처리 (기본 3.5)
- sampler: `euler`, scheduler: `simple`, 20 steps
- **네거티브 프롬프트 불필요** — Flux는 positive만 사용
- `KSampler`의 `seed` 필드 사용 (`noise_seed` 아님)
- `EmptySD3LatentImage` 사용 (`EmptyLatentImage` 아님)

### Flux 모델 경로

```
ComfyUI/app/models/
├── unet/flux1-dev-Q5_K_S.gguf              (7.8GB)
├── clip/t5-v1_1-xxl-encoder-Q5_K_M.gguf    (3.2GB)
├── clip/clip_l.safetensors                  (235MB)
└── vae/ae.safetensors                       (320MB)
```

---

## Wan 2.2 MoE (영상 생성)

### 워크플로우

| 파일 | 용도 | 해상도 | 프레임 | 출력 FPS | 소요시간 |
|------|------|--------|--------|----------|----------|
| `wan22_moe_i2v_short.json` | 짧은 영상 (모션테스트) | 768x768 | 33 (2초) | 16 | ~5분 |
| `wan22_moe_i2v_full.json` | 프로덕션 영상 (기본) | 832x480 | 81 (5초) | 16 | ~50분 |
| `wan22_moe_i2v_optimized.json` | **프로덕션 영상 (최적화)** | 832x480 | 81 (5초) | **32** | **~10-15분** |
| `wan22_moe_t2i.json` | ~~이미지~~ **(사용 금지 — Flux 사용)** | 1024x1024 | 1 | - | ~3분 |

> **권장: `wan22_moe_i2v_optimized.json`** — Lightning LoRA(8 steps) + FBCache + RIFE(32fps)

### 바인딩

| 파일 | 대상 |
|------|------|
| `wan22_moe_i2v_bindings.json` | I2V 워크플로우 (short/full 공용) |
| `wan22_moe_i2v_optimized_bindings.json` | **I2V 최적화 워크플로우** (Lightning + FBCache + RIFE 매핑 포함) |
| `wan22_moe_t2i_bindings.json` | T2I (레거시, Flux로 대체) |

### MoE 노드 구조

```
UnetLoaderGGUF(HighNoise) → ModelSamplingSD3(shift=8)
                                    ↓
LoadImage → WanImageToVideo → KSamplerAdvanced (Stage 1: 구조)
                                    ↓
UnetLoaderGGUF(LowNoise) → ModelSamplingSD3(shift=8)
                                    ↓
                            KSamplerAdvanced (Stage 2: 디테일)
                                    ↓
                              VAEDecode → SaveImage
```

### I2V 세팅

**기본 (full.json)**:
- sampler: `euler`, scheduler: `simple`
- 20 steps (Stage1: 0→10, Stage2: 10→20)
- cfg: 3.5 (양 stage 동일)
- `KSamplerAdvanced`의 `noise_seed` 필드 사용

**최적화 (optimized.json)**:
- sampler: `euler`, scheduler: `simple`
- **4 steps** (Stage1: 0→2, Stage2: 2→4) — Lightning LoRA (Seko V1)
- **cfg: 1.0**, **shift: 5.0** — Lightning LoRA 필수 설정
- 별도 LoRA: `high_noise_model.safetensors` + `low_noise_model.safetensors`
- FBCache threshold: 0.12 (WaveSpeed)
- RIFE rife49 x2 → 16fps→32fps 출력
- 예상 속도: **~10-15분/샷** (기존 ~50분)

### 프레임 수 참고 (16fps)

| frames | 초 | 용도 |
|--------|-----|------|
| 17 | 1초 | 스틸 추출 |
| 33 | 2초 | 모션 테스트 |
| 49 | 3초 | 짧은 액션 |
| 65 | 4초 | 중간 샷 |
| 81 | 5초 | 표준 샷 |

### Wan 모델 경로

```
ComfyUI/app/models/unet/
├── Wan2.2-I2V-A14B-HighNoise-Q3_K_M.gguf  (6.7GB)
├── Wan2.2-I2V-A14B-LowNoise-Q3_K_M.gguf   (6.7GB)
└── Wan2.2-Animate-14B-Q3_K_M.gguf          (8.1GB, 미사용)

ComfyUI/app/models/loras/wan22_lightning/
└── Wan2.2-I2V-A14B-4steps-lora-rank64-Seko-V1/
    ├── high_noise_model.safetensors         (1.2GB, Lightning LoRA)
    └── low_noise_model.safetensors          (1.2GB, Lightning LoRA)
```

> Q5_K_M GGUF는 현재 HuggingFace에 미존재. Q3_K_M 사용 중.

---

### PuLID 세팅
- PuLID는 **model을 수정** (LoRA와 같은 패턴). ControlNet은 conditioning을 수정. 서로 독립적으로 결합 가능.
- `InsightFace`: **CPU 모드** (`provider: "CPU"`) — GPU VRAM 절약. 첫 실행 시 antelopev2 자동 다운로드 (~350MB).
- `EVA-CLIP`: 첫 실행 시 자동 다운로드 (~430MB). 이후 캐시 사용.
- `weight`: 클레이모션 0.8-1.0, 리얼리스틱 1.2-1.5. 너무 높으면 스타일이 레퍼런스에 끌려감.
- PuLID + ControlNet 동시 사용 시 ~15.6GB VRAM. OOM 시 `--lowvram` 또는 Flux Q4_K_M 다운그레이드.

---

## 프로덕션 파이프라인 (권장 순서)

```
0. Flux T2I                    →  Golden Reference 생성 (캐릭터 기준 이미지)
1. **Flux Kontext**            →  씬별 키프레임 (얼굴+스타일 일관성 최강)
2. Flux T2I (+ ControlNet)    →  포즈 제어가 필요한 경우 (Kontext로 부족할 때)
3. Flux Face Inpaint           →  얼굴 디테일 수정 (필요 시)
4. Wan I2V                     →  키프레임 → 5초 영상 렌더링
5. ffmpeg                      →  영상 + VO + BGM 최종 조립
```

### 자동화된 Kontext → I2V 2-pass 파이프라인

```bash
# 풀 파이프라인 (Kontext 키프레임 자동 생성 → Wan I2V 렌더)
python run_end_to_end_video_pipeline.py \
    --manifest shots.json \
    --workflow wan22_moe_i2v_full.json \
    --bindings wan22_moe_i2v_bindings.json \
    --golden-ref ivy_burr_golden_ref.png \
    --kontext-guidance 2.5

# Kontext 단독 실행 (키프레임만 생성)
python generate_kontext_keyframes.py \
    --manifest shots.json \
    --golden-ref ivy_burr_golden_ref.png \
    --output-dir output/renders/kontext_keyframes \
    --comfy-input /home/hugh/ComfyUI/app/input \
    --dry-run
```

**흐름**: `shot_manifest` → `generate_kontext_keyframes.py` (Flux Kontext) → `{shot_id}_keyframe.png` → `comfy_batch_render.py` (Wan I2V) → 영상

- `--golden-ref` 안 주면 Kontext 스테이지 스킵 (하위 호환)
- `--skip-kontext` 로 이미 생성된 키프레임 재사용
- shot manifest에 `kontext_prompt` 필드 사용 (I2V `prompt_positive`와 분리)

## 배치 렌더러 (comfy_batch_render.py)

- **정본**: `systems/video/scripts/comfy_batch_render.py` (generic binding injection)
- **파이프라인 심**: `systems/video/pipeline/scripts/comfy_batch_render.py` (정본으로 위임)
- `node_mappings`의 모든 키를 shot 데이터에서 자동 주입 (ControlNet/LoRA/Inpaint 확장 대비)
- `--dry-run`, `--force-render`, `--shots` 지원

## 주의사항

- **Wan `ModelSamplingSD3`**: `shift`만 설정. width/height 넣으면 에러.
- **Flux `KSampler`**: `seed` 필드. `noise_seed` 아님.
- **Flux `EmptySD3LatentImage`**: `EmptyLatentImage` 아님.
- `VHS_VideoCombine` 미설치 — `SaveImage`로 PNG 시퀀스 출력.
- I2V 입력 이미지는 `ComfyUI/app/input/` 폴더에 위치해야 함.
