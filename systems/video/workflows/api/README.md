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
| `flux_face_inpaint.json` | 얼굴 인페인팅 (Flux Fill) | 원본 유지 | ~9GB | ~2분 |

### 바인딩

| 파일 | 대상 |
|------|------|
| `flux_dev_t2i_bindings.json` | 기본 T2I |
| `flux_controlnet_t2i_bindings.json` | ControlNet 포즈 |
| `flux_lora_t2i_bindings.json` | LoRA 캐릭터 |
| `flux_lora_controlnet_t2i_bindings.json` | LoRA + ControlNet |
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

| 파일 | 용도 | 해상도 | 프레임 | 소요시간 |
|------|------|--------|--------|----------|
| `wan22_moe_i2v_short.json` | 짧은 영상 (모션테스트) | 768x768 | 33 (2초) | ~5분 |
| `wan22_moe_i2v_full.json` | 프로덕션 영상 (본편 샷) | 768x768 | 81 (5초) | ~12분 |
| `wan22_moe_t2i.json` | ~~이미지~~ **(사용 금지 — Flux 사용)** | 1024x1024 | 1 | ~3분 |

### 바인딩

| 파일 | 대상 |
|------|------|
| `wan22_moe_i2v_bindings.json` | I2V 워크플로우 (short/full 공용) |
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
- sampler: `euler`, scheduler: `simple`
- 20 steps (Stage1: 0→10, Stage2: 10→20)
- cfg: 3.5 (양 stage 동일)
- `KSamplerAdvanced`의 `noise_seed` 필드 사용

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
```

---

## 프로덕션 파이프라인 (권장 순서)

```
1. Flux T2I (+ LoRA)          →  캐릭터 시트 (정면/측면/전신)
2. Flux T2I (+ LoRA + CN)     →  씬별 키프레임 (포즈 제어)
3. Flux Face Inpaint           →  얼굴 디테일 수정 (필요 시)
4. Wan I2V                     →  키프레임 → 5초 영상 렌더링
5. ffmpeg                      →  영상 + VO + BGM 최종 조립
```

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
