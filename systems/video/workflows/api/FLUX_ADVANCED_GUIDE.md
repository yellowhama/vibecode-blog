# Flux.1-dev 고급 가이드

2026-03-11 작성. RTX 5070 Ti (16GB VRAM) + ComfyUI GGUF 기준.

---

## 1. 프롬프트 엔지니어링

### T5-XXL 특성

Flux의 텍스트 인코더 T5-XXL은 **NLP 모델**이다. SD/SDXL의 CLIP과 근본이 다름.

| 항목 | Flux (T5-XXL) | SD/SDXL (CLIP) |
|------|---------------|----------------|
| 프롬프트 스타일 | **자연어 문장** | 쉼표 구분 키워드 |
| 가중치 문법 | ❌ 없음 | `(word:1.2)` 지원 |
| 공간 이해 | 좋음 ("on the left") | 약함 |
| 최적 길이 | **200토큰 이하** | 77토큰 |

### 프롬프트 작성 규칙

```
✅ 좋은 예:
"A clay figure of a woman named Vee standing at her desk.
She has dark brown wavy hair and wears an oversized yellow hoodie.
Her round black glasses sit slightly crooked on her nose.
Soft studio lighting from the left. White background."

❌ 나쁜 예:
"clay figure, woman, brown hair, yellow hoodie, glasses, studio lighting, white background"
```

- **자연어 문장**으로 쓸 것 — T5는 문맥을 이해함
- **가중치 문법 안 먹힘** — `(yellow hoodie:1.3)` 대신 "with emphasis on her bright yellow hoodie" 사용
- **공간/위치 명시** — "behind the desk", "to her left", "in the foreground"
- **모순 금지** — 한 프롬프트 안에 상충하는 지시 넣지 말 것
- **주체 먼저** — 첫 문장에 메인 캐릭터/주제 배치

### Guidance 설정

| 값 | 용도 |
|----|------|
| **1.0-1.5** | 창의적/자유로운 생성. 긴 프롬프트 |
| **3.0-4.0** | ⭐ 스위트스팟. 프롬프트 충실 + 자연스러움 |
| **5.0+** | 프롬프트 강제. 캐릭터 시트에 적합 |
| **7.0+** | ⚠️ 과포화, 아티팩트 발생. 사용 금지 |

### 해상도

| 해상도 | 용도 |
|--------|------|
| 1024×1024 | 기본 (정사각) |
| 1344×768 | 가로형 (16:9에 가까움) |
| 768×1344 | 세로형 (인물 전신) |
| 1536×1024 | 와이드샷 (최대 권장) |

> ⚠️ 1920 이상은 하얀 후광(white halo) 아티팩트 발생 가능.

---

## 2. 캐릭터 일관성 유지

### 방법 A: LoRA 학습 (가장 확실)

Flux 캐릭터 LoRA는 SDXL보다 **훨씬 빨리 학습**된다.

| 설정 | 값 | 비고 |
|------|-----|------|
| 데이터셋 | **20-40장** | 다양한 앵글, 조명, 표정 |
| Network rank | **16-32** | 높으면 오버핏 위험 |
| Learning rate | **0.001-0.004** | SDXL의 10배 (0.002 추천) |
| Steps | **500-1500** | SDXL 대비 절반 이하 |
| 도구 | ai-toolkit (Ostris) 또는 Kohya_ss | |

**학습 데이터 준비**:
1. Flux T2I로 캐릭터 시트 다양하게 생성 (앵글, 표정, 포즈)
2. 좋은 결과물 20-40장 선별
3. 각 이미지에 캡션 파일 (.txt) 작성
4. 학습 실행 → `vee_v1.safetensors` LoRA 생성

### 방법 B: Flux Kontext (학습 없이)

Black Forest Labs 공식 모델. 레퍼런스 이미지 + 텍스트 지시로 캐릭터 유지.

- 모델: `FLUX.1-Kontext-dev`
- ComfyUI 네이티브 워크플로우 있음
- LoRA 학습 없이 즉시 사용 가능
- 정확도는 LoRA보다 낮지만 빠르고 유연

### 방법 C: IP-Adapter Flux

XLabs-AI 제공. 레퍼런스 이미지에서 스타일/외형 추출하여 적용.

- 노드: `ComfyUI-IPAdapter-Flux` (ComfyUI Manager에서 `x-flux-comfyui` 검색)
- Strength: 0.8-1.0
- 정확한 얼굴 재현보다는 전체적 분위기/스타일 전이에 적합

---

## 3. 포즈 컨트롤 — ControlNet

### Flux ControlNet Union Pro 2.0

Shakker Labs 제공. **하나의 모델로 여러 컨트롤 타입 지원.**

- **모델**: `FLUX.1-dev-ControlNet-Union-Pro-2.0` (3.98GB)
- **경로**: `ComfyUI/models/controlnet/`
- **지원 모드**: Canny, Depth, Soft Edge, **OpenPose**, Grayscale

### 워크플로우 구조

```
레퍼런스 이미지
    ↓
OpenPosePreprocessor (comfyui_controlnet_aux)
    ↓ pose map
ControlNet Union Pro 2.0
    ↓ conditioning
Flux KSampler ← 텍스트 프롬프트 (Vee 디자인)
    ↓
결과: 같은 포즈 + Vee 캐릭터
```

### 필요 설치

| 컴포넌트 | 설치 방법 |
|----------|-----------|
| `comfyui_controlnet_aux` | ComfyUI Manager → 검색 설치 |
| ControlNet Union Pro 2.0 모델 | HuggingFace에서 다운로드 → `models/controlnet/` |

### VRAM 주의

Flux (9GB) + ControlNet (4GB) = **~13GB**. 16GB에서 돌아가지만 빡빡함.
- `--lowvram` 옵션 또는 sequential model loading 필요할 수 있음

---

## 4. 얼굴/디테일 개선

### 업스케일 워크플로우

1. Flux T2I → 1024×1024 생성
2. `Upscale Image By` 노드 (scale_by: 2.0) → 2048×2048
3. KSampler 2차 패스 (denoise 0.3-0.5) → 디테일 보강
4. **TTP Tile** 노드 사용 시 얼굴 왜곡도 같이 수정됨

### 얼굴 인페인팅 (Flux Fill)

얼굴만 다시 그리기:
1. 생성된 이미지 로드
2. MaskEditor로 얼굴 영역 마스크
3. `GrowMask` 노드로 마스크 약간 확장 (블렌딩용)
4. KSampler denoise **0.95** + 얼굴 설명 프롬프트
5. 결과: 얼굴만 고퀄리티로 재생성

- **모델**: `flux1-fill-dev` (GGUF Q5 버전 권장 — 16GB에서 구동)
- **노드**: `ComfyUI-Flux-Inpainting` (rubi-du)

---

## 5. 유용한 커스텀 노드

| 노드/패키지 | 용도 | 설치 |
|-------------|------|------|
| `ComfyUI-GGUF` (city96) | GGUF 모델 로드 | ✅ 설치됨 |
| `ComfyUI-IPAdapter-Flux` | 레퍼런스 이미지 기반 생성 | Manager → `x-flux-comfyui` |
| `comfyui_controlnet_aux` | 포즈/뎁스/캐니 전처리 | Manager 검색 |
| `RES4LYF` | FluxRegionalPrompt (영역별 프롬프트) | Manager 검색 |
| `ComfyUI-Flux-Inpainting` | 저VRAM 인페인팅 | Manager 검색 |
| `ComfyUI-Fluxtapoz` | 이미지 합성/병치 | Manager 검색 |

---

## 6. GGUF Q5 양자화 참고

| 양자화 | VRAM | 품질 |
|--------|------|------|
| Q4_K_M | ~7GB | 90% |
| **Q5_K_S** | **~9GB** | **95%** ← 현재 사용 |
| Q6_K | ~11GB | 97% |
| Q8 | ~13GB | 99% |
| FP16 | ~24GB | 100% (16GB 불가) |

- DiT 모델(Flux)은 양자화에 **강함** — Q5에서도 충분한 품질
- **T5 텍스트 인코더 품질이 더 중요** — T5는 가능하면 FP8+ 유지
- 복잡한 다중 주체 프롬프트에서 Q5가 약간 약할 수 있음

---

## 7. 생성 세팅 요약 (현재 파이프라인)

```
모델: flux1-dev-Q5_K_S.gguf
텍스트 인코더: T5-XXL Q5_K_M + CLIP-L
VAE: ae.safetensors
해상도: 1024×1024
Steps: 20
CFG: 1.0 (고정)
Guidance: 3.5 (FluxGuidance 노드)
Sampler: euler
Scheduler: simple
```

---

## 부록: 현재 미설치 / 향후 추가 예정

| 컴포넌트 | 상태 | 용도 |
|----------|------|------|
| ControlNet Union Pro 2.0 | 미설치 | 포즈 컨트롤 |
| IP-Adapter Flux | 미설치 | 레퍼런스 기반 생성 |
| Flux Fill (인페인팅) | 미설치 | 얼굴 디테일 수정 |
| Flux Kontext | 미설치 | 학습 없는 캐릭터 일관성 |
| Vee LoRA | 미학습 | 캐릭터 고정 (최종 목표) |
