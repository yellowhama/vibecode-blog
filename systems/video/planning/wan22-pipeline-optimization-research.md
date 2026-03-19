# Wan 2.2 I2V Pipeline 고도화 리서치

> **Date**: 2026-03-19
> **Status**: Phase 8 구현 완료 (sa_solver + TeaCache + LLM Prompt Enrichment)
> **현재 상태**: RTX 5070 Ti 16GB, Wan 2.2 MoE 14B GGUF Q3_K_M, 샷당 ~7-12분 (4 steps, sa_solver + FBCache + TeaCache + RIFE)
> **달성**: 50분/샷 → 7-12분/샷 (~5-7x), LLM 프롬프트 강화 옵션 추가

---

## 1. 속도 최적화 (현재 50분/샷 → 목표 10-15분/샷)

### 1.1 Lightning/Distill LoRA — 10 steps → 4 steps (★★★★★ 최우선)

**핵심**: FastWan LoRA 또는 Lightning LoRA를 적용하면 steps를 10→4로 줄여도 동일 수준 품질 유지.

| LoRA | Steps | 품질 | 속도 향상 |
|------|-------|------|----------|
| 없음 (현재) | 10 | Baseline | 1x |
| FastWan LoRA | 4 | ≈ Baseline | **2.5x** |
| Lightning LoRA (lightx2v) | 4 | ≈ Baseline | **2.5x** |
| Distill LoRA (Seko) | 4 | 약간 낮음 | **2.5x** |

**적용 방법**:
- FastWan LoRA: Wan2GP에 내장, ComfyUI에서는 별도 LoRA 노드로 로드
- Lightning LoRA: [lightx2v/Wan2.2-Lightning](https://huggingface.co/lightx2v/Wan2.2-Lightning) — `guidance=1.0`으로 설정
- 4 steps에서 안정적, 8 steps에서 미세 개선 (시간 대비 무의미)

**예상 효과**: 50분 → **~20분/샷**

### 1.2 FBCache (First Block Cache) — 추가 1.5-2x (★★★★☆)

**핵심**: 첫 번째 transformer block의 residual output 변화가 작으면 나머지 블록 계산을 스킵.

**적용**:
- ComfyUI 노드: [Comfy-WaveSpeed](https://github.com/chengzeyi/Comfy-WaveSpeed)의 `Apply First Block Cache`
- threshold: `0.12` (Wan 2.2 MoE 권장값)
- 두 expert 모델 모두에 적용

**예상 효과**: Lightning LoRA + FBCache 조합 시 50분 → **~10-15분/샷**

### 1.3 MagCache (Magnitude-Aware Cache) — 1.5-2x (★★★☆☆)

**핵심**: 프레임 간 유사도가 높으면 렌더링을 스킵하는 스마트 캐싱. NeurIPS 2025 논문.

**적용**:
- ComfyUI 노드: [ComfyUI-MagCache](https://github.com/Zehong-Ma/ComfyUI-MagCache)
- Wan 2.2 공식 지원 확인됨 (Issue #27 해결)
- FBCache와 택일 (둘 다 쓰면 충돌 가능)

### 1.4 Torch Compile — 추가 20% (★★★☆☆)

**핵심**: PyTorch 2.x의 `torch.compile()`로 모델 최적화. 첫 실행만 느림.

**적용**:
- Wan2GP에서는 Triton 설치 시 자동 적용
- ComfyUI에서는 WaveSpeed 노드에 통합

### 1.5 종합 속도 로드맵

```
현재: 10 steps, 캐시 없음, compile 없음
  → 50분/샷

Phase A: Lightning LoRA (4 steps)
  → ~20분/샷 (2.5x)

Phase B: + FBCache (threshold 0.12)
  → ~12분/샷 (4x)

Phase C: + Torch Compile
  → ~10분/샷 (5x)

총 30샷 렌더 시간: 500분(8.3시간) → 100분(1.7시간) → 300분 → 60분(1시간)
```

---

## 2. 품질 최적화

### 2.1 CFGZeroStar — 아티팩트 감소 (★★★★☆)

**핵심**: 낮은 CFG에서 출력을 블렌딩하여 플리커/할루시네이션 감소.

**주의**: 과도 사용 시 contrast/detail 감소. 기본 활성화 후 시각적 확인 필요.

### 2.2 NAG (Normalized Attention Guidance) — 플리커 감소 (★★★★★)

**핵심**: Attention 정규화로 프레임 간 일관성 향상. CFG를 올리지 않고 품질 개선.

**권장 설정**:
- Scale: 11
- Alpha: 0.25
- Tau: 2.5
- 두 expert 모델 모두에 적용

**효과**: 머리카락, 손가락 등 세부 움직임의 일관성 대폭 개선.

### 2.3 Negative Prompt 강화 (★★★☆☆)

현재 negative prompt에 추가 권장:
```
"no flicker, consistent lighting, stable camera, no morphing artifacts"
```

2D flat vector 스타일에 특화:
```
"3D, photorealistic, gradient, shading, texture, live action, realistic skin,
no flicker, stable composition, consistent proportions"
```

### 2.4 Block Swap — 장기 샷 Identity Drift 방지 (★★☆☆☆)

긴 클립(5초+)에서 캐릭터 얼굴이 점진적으로 변하는 문제.
`WanVideoSetBlockSwap` 노드로 Identity Drift 감소.

---

## 3. 후처리 파이프라인

### 3.1 RIFE 프레임 보간 — 16fps → 30fps (★★★★★)

**핵심**: AI 프레임 보간으로 부드러운 모션 생성.

**권장**:
- RIFE v4.7 또는 v4.9 (rife47/rife49)
- 16fps → 30fps (x2 보간)
- ComfyUI 노드: `ComfyUI-Frame-Interpolation` → `RIFE VFI`

**효과**: 모션이 "슬라이드쇼 느낌"에서 "영상 느낌"으로 전환. **반드시 적용.**

### 3.2 업스케일 — 720p → 1080p (★★★☆☆)

**권장 파이프라인**:
1. Wan 2.2로 480p 또는 720p 생성 (VRAM 절약)
2. RIFE 프레임 보간 (16→30fps)
3. Real-ESRGAN 또는 SeedVR2로 2x 업스케일

**주의**: 2D flat vector 스타일에서는 업스케일 효과가 제한적. 라인이 이미 깨끗하므로.

### 3.3 오디오 동기화 — MMAudio (★★☆☆☆)

Wan 2.6에서 네이티브 오디오 생성 지원되지만, 2.2에서는 별도 파이프라인.
우리는 TTS 나레이션이 메인이므로 SFX 자동 생성 용도로만 고려.

---

## 4. 모델 업그레이드 경로

### 4.1 Wan 2.6 (★★★★☆ — 중기)

| 항목 | Wan 2.2 | Wan 2.6 |
|------|---------|---------|
| 최대 길이 | 5-10초 | **15초** |
| 멀티샷 | 불가 | **자동 전환 + 트랜지션** |
| 캐릭터 일관성 | PuLID 외부 의존 | **비디오 레퍼런스 내장** |
| 오디오 | 없음 | **립싱크 + 음성 클론** |
| 로컬 실행 | GGUF 지원 | ComfyUI 지원 확인 필요 |

**마이그레이션 계획**: Wan 2.6 GGUF가 ComfyUI에서 안정되면 전환. 워크플로 구조 동일.

### 4.2 Wan 2.7 (★★☆☆☆ — 장기)

Wan 2.7 프리뷰 발표됨. 전방위 업그레이드 예고. 릴리즈 대기.

### 4.3 대안: Wan2GP (★★★☆☆)

[Wan2GP](https://github.com/deepbeepmeep/Wan2GP) — ComfyUI 대안. "GPU Poor" 최적화.
- 6GB VRAM에서 720p 121프레임 생성
- FastWan LoRA 내장
- Triton 컴파일 자동
- **단점**: ComfyUI 워크플로 호환 안 됨, 별도 CLI

현재 ComfyUI 파이프라인이 잘 구축되어 있으므로, Wan2GP는 백업 옵션.

---

## 5. GGUF 양자화 비교 (16GB RTX 기준)

| 양자화 | 크기 | VRAM | 품질 | 권장 |
|--------|------|------|------|------|
| FP16 | 28GB | 불가 | 최고 | ✗ |
| Q8_0 | 15.4GB | 빠듯 | 최고에 근접 | △ (여유 없음) |
| **Q5_K_M** | **10.8GB** | **여유** | **거의 동일** | **✓ 현재 사용 중** |
| Q4_K_S | 8.5GB | 넉넉 | 약간 열화 | △ (속도 우선 시) |

**결론**: Q5_K_M이 16GB에서 최적 선택. 변경 불필요.

---

## 6. 적용 현황 (Phase 7.5 + Phase 8)

### ✅ 완료 (Phase 7.5 — 2026-03-19)

| # | 액션 | 효과 | 상태 |
|---|------|------|------|
| 1 | **RIFE 프레임 보간** (16→32fps) | 모션 품질 대폭 향상 | ✅ `wan22_moe_i2v_optimized.json` |
| 2 | **Lightning LoRA** (20→4 steps) | 렌더 시간 5x 절감 | ✅ Seko V1 LoRA |
| 5 | **FBCache** (threshold 0.12) | 추가 30-40% 캐시 히트 | ✅ WaveSpeed |

### ✅ 완료 (Phase 8 — 2026-03-19)

| # | 액션 | 효과 | 상태 |
|---|------|------|------|
| A1 | **sa_solver** 샘플러 교체 | 저스텝 수렴 개선 | ✅ euler→sa_solver |
| A2 | **TeaCache** (threshold 0.3) | 추가 ~30% 속도 | ✅ 노드 16/17 추가 |
| B1 | **LLM 프롬프트 강화** | 샷별 고유 프롬프트 | ✅ `--enrich` 플래그 |
| B2 | **시스템 프롬프트** | 세그먼트 무드맵 | ✅ `prompt_enricher_system.md` |

### 미적용 (다음 단계 후보)

| # | 액션 | 효과 | 우선순위 |
|---|------|------|----------|
| 3 | **NAG** (플리커 감소) | 프레임 일관성 향상 | ★★★★★ |
| 6 | **CFGZeroStar** | 아티팩트 감소 | ★★★★☆ |
| 7 | **Torch Compile** | 추가 20% 속도 | ★★★☆☆ |
| 8 | **Wan 2.6** 마이그레이션 | 15초, 멀티샷, 캐릭터 일관성 | ★★★★☆ |
| 9 | **업스케일** (720p→1080p) | 해상도 향상 | ★★★☆☆ |

---

## 7. 워크플로 변경 계획

### 현재 워크플로 (`wan22_moe_i2v_full.json`)
```
LoadImage → CLIPTextEncode → WanImageToVideo (10 steps, CFG 6) → VAEDecode → SaveVideo
```

### 최적화 워크플로 (`wan22_moe_i2v_optimized.json`) — 현재 상태
```
LoadImage → CLIPTextEncode → WanImageToVideo
                                  ↓
UnetGGUF(HighNoise) → LoRA(Lightning) → FBCache(0.12) → TeaCache(0.3) → ModelSamplingSD3(shift 5)
                                                                              ↓
                                                          KSamplerAdvanced(sa_solver, 0→2, cfg 1.0)
                                                                              ↓
UnetGGUF(LowNoise) → LoRA(Lightning) → FBCache(0.12) → TeaCache(0.3) → ModelSamplingSD3(shift 5)
                                                                              ↓
                                                          KSamplerAdvanced(sa_solver, 2→4, cfg 1.0)
                                                                              ↓
                                                          VAEDecode → RIFE x2 (32fps) → SaveVideo(MP4)
```

**실제 결과**: 50분/샷 → 7-12분/샷, 품질 A/B 검증 필요, 32fps 부드러운 모션

---

## Sources

### 속도 최적화
- [FastWan LoRA Guide](https://fastwan.app/fastwan-lora)
- [Wan2.2-Lightning (lightx2v)](https://huggingface.co/lightx2v/Wan2.2-Lightning)
- [Wan2.2-Distill-Loras](https://huggingface.co/lightx2v/Wan2.2-Distill-Loras)
- [Lightning LoRA 4-step collection](https://huggingface.co/collections/marlow/fast-4-steps-wan-22-i2v-14b-with-lightning-lora)
- [Comfy-WaveSpeed (FBCache)](https://github.com/chengzeyi/Comfy-WaveSpeed)
- [MagCache (NeurIPS 2025)](https://github.com/Zehong-Ma/ComfyUI-MagCache)
- [Wan2GP (GPU Poor)](https://github.com/deepbeepmeep/Wan2GP)

### 품질 최적화
- [Wan 2.2 ComfyUI Official Tutorial](https://docs.comfy.org/tutorials/video/wan/wan2_2)
- [Wan 2.2 I2V Step-by-Step Guide (Civitai)](https://civitai.com/articles/18271/step-by-step-guide-series-comfyui-wan-22-img-to-video)
- [Wan 2.2 8GB Daily Workflow + RIFE (Civitai)](https://civitai.com/models/2470813/wan-22-i2v-gguf-my-8gb-daily-workflow-or-upscale-rife)
- [Wan 2.2 Complete Workflow Guide (ComfyUI Wiki)](https://comfyui-wiki.com/en/tutorial/advanced/video/wan2.2/wan2-2)
- [Wan 2.2 Usage Guide Definitive Edition (Civitai)](https://civitai.com/articles/20293/darksidewalkers-wan-22-14b-i2v-usage-guide-definitive-edition)

### 모델 비교
- [Wan 2.6 vs 2.5 vs 2.2 Complete Guide](https://wanvideogenerator.com/blog/wan26-vs-wan25-vs-wan22)
- [Wan 2.6 vs 2.5 (fal.ai)](https://fal.ai/learn/biz/wan-2-6-vs-wan-2-5-comprehensive-comparison)
- [Wan 2.7 Preview (WaveSpeed)](https://wavespeed.ai/blog/posts/wan-2-7-coming-soon-major-upgrade/)
- [Wan 2.2 I2V 14B GGUF (Bullerwins)](https://huggingface.co/bullerwins/Wan2.2-I2V-A14B-GGUF)
- [Wan 2.2 I2V 14B GGUF (QuantStack)](https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF)

### 파이프라인 & 배치
- [ComfyUI-Distributed (Multi-GPU)](https://github.com/robertvoy/ComfyUI-Distributed)
- [ComfyUI-ParallelAnything](https://github.com/FearL0rd/ComfyUI-ParallelAnything)
- [NVIDIA RTX + ComfyUI 4K Video (CES 2026)](https://blogs.nvidia.com/blog/rtx-ai-garage-ces-2026-open-models-video-generation/)
- [ComfyUI Batch Processing Guide 2026](https://apatero.com/blog/comfyui-batch-processing-workflow-automation-2026)

### 후처리
- [RIFE Frame Interpolation](https://github.com/hzwer/ECCV2022-RIFE)
- [Wan 2.2 GGUF + RIFE Workflow](https://comfyui.org/en/boost-video-creation-with-rife-upsampling)
- [Wan 2.6 I2V Tutorial (CrePal)](https://crepal.ai/blog/aivideo/wan-2-6-image-to-video/)
- [Wan 2.2 Setup with GGUF (Segmind)](https://blog.segmind.com/wan-comfyui-setup-gguf-workflow-tutorial/)
