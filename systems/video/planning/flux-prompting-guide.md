# Flux.1 Dev + UltraReal 프롬프팅 가이드

> **Date**: 2026-03-19
> **소스**: Civitai 리서치, BFL 공식 가이드, 커뮤니티 검증 결과 종합

---

## 1. Flux vs SD/SDXL — 핵심 차이

| 항목 | SD/SDXL | Flux.1 Dev |
|------|---------|------------|
| 네거티브 프롬프트 | 지원 | ❌ 미지원 — 원하는 것만 서술 |
| CFG Scale | 7-11 | **1.0 고정** (distilled model) |
| 프롬프트 웨이트 | `(word:1.5)` | ❌ 미지원 — 자연어 강조 사용 |
| 프롬프트 스타일 | 태그 기반, 콤마 구분 | **자연어 서술** 선호 |
| 토큰 우선순위 | 대체로 균등 | **앞쪽 토큰이 더 중요** — 핵심 요소 선행 배치 |
| 텍스트 렌더링 | 불량 | 양호 (T5-XXL 덕분) |

### Guidance vs CFG — 두 개의 다른 파라미터

- **CFG (KSampler)**: **1.0 고정**. 올리면 과포화.
- **FluxGuidance**: 기본 **3.5**, 범위 0.0~100.0
  - 1.0~2.0: 자유로운 창작, 리얼리즘 ↑
  - **2.5~3.5**: 균형 (권장)
  - 4.0~5.0: 프롬프트 충실도 ↑, 과포화 위험
  - UltraReal 파인튠: **2.5~3.0** 권장

---

## 2. 프롬프트 구조

### 기본 공식
```
[핵심 주제] + [행동/포즈] + [스타일] + [환경/배경]
```

### 레이어드 프레임워크 (고급)
1. **Foundation**: 주제 + 행동 + 스타일 + 컨텍스트
2. **Visual**: 조명, 색상 팔레트, 구도
3. **Technical**: 카메라 설정, 렌즈, 품질 마커
4. **Atmospheric**: 분위기, 감정 톤

### 장르별 템플릿

**인물 포트레이트**:
```
[인물 묘사], [포즈/표정], [스타일], [조명], [배경]
```

**제품**:
```
[제품 디테일], [배치], [조명 셋업], [스타일], [분위기]
```

**풍경**:
```
[장소/배경], [시간/날씨], [카메라 앵글], [스타일], [분위기]
```

### 핵심 규칙: 앞쪽 토큰이 더 중요!

```
# ✅ 좋은 예 — 핵심 요소 선행
high-resolution, professional portrait, a young Korean woman, soft studio lighting...

# ❌ 나쁜 예 — 핵심이 뒤에
a photo taken in a studio with professional equipment of a young Korean woman...
```

---

## 3. 프롬프트 웨이트 대체 기법

Flux는 `(word:1.5)` 문법을 **무시**합니다. 대신:

| 기법 | 예시 |
|------|------|
| 자연어 강조 | "with emphasis on detailed eyes" |
| 초점 서술 | "the most prominent feature is her smile" |
| 선행 배치 | 중요한 요소를 프롬프트 맨 앞에 |
| 반복 (변형) | 같은 개념을 다른 표현으로 반복 |

---

## 4. 실사 사진 프롬프팅

### 카메라/기술 용어가 출력에 큰 영향

```
# 카메라 모델 지정
shot on Canon EOS R5 with 85mm f/1.4 lens

# 조명 묘사
golden hour backlighting with rim light, soft fill from reflector

# 기술 파라미터
shallow depth of field, f/2.8, ISO 100, natural grain
```

### 리얼리즘 키워드
`raw photo`, `dynamic contrast`, `DSLR photo`, `crisp photo`, `photorealistic`, `detailed skin texture`

### "high-resolution" 추가 필수
UltraReal v4에서 간헐적 저해상도 출력 발생 → 프롬프트에 `high-resolution` 포함 권장

---

## 5. 애니메/일러스트 프롬프팅

- 스타일 명시: `anime style`, `manga illustration`, `watercolor painting`
- 기술 카메라 용어 대신 구도/디자인에 집중
- 스타일 용어: `cel shading`, `flat colors`, `ink linework`
- 전용 파인튠 (Illustrious, NoobAI) 사용이 더 효과적

---

## 6. Sampler × Scheduler 조합

### Flux.1 Dev 최적 조합 (리서치 검증)

| Sampler | Scheduler | 특성 | 용도 |
|---------|-----------|------|------|
| **euler** | simple | 가장 빠르고 안정적 | 기본 폴백 |
| **euler a** | simple | 전반적 최고 평가 | 범용 |
| **dpmpp_2m** | beta | **가장 샤프** — "Flux face" 아티팩트 감소 | 실사 |
| deis | beta | DPM++과 HEUN 사이 | 균형 |
| heun | beta | DPM++보다 약간 더 디테일, 느림 | 최고 품질 |
| deis | kl_optimal / sgm_uniform | 대안 고품질 | 실험용 |

### Steps 가이드

| Steps | 품질 | 시간 | 용도 |
|-------|------|------|------|
| 20 | 좋음 | 빠름 | 초안, 스타일 탐색 |
| **25~30** | **최적** | 중간 | **프로덕션** |
| 40~50 | 미세 개선 | 느림 | UltraReal 최종 품질 |

---

## 7. UltraReal Fine-Tune v4 전용 가이드

### 최적 세팅

| 파라미터 | 값 |
|----------|-----|
| Sampler | **dpmpp_2m** |
| Scheduler | **beta** |
| Steps | **30~50** (30 기본, 50 최고품질) |
| FluxGuidance | **2.5~3.0** |
| CFG (KSampler/CFGGuider) | 1.0 (또는 0.9 시도) |

### 추천 컴패니언 LoRA

| LoRA | 강도 | 트리거 | URL |
|------|------|--------|-----|
| **Realism Amplifier** | 0.5~0.7 (subtle) / 0.9~1.0 (aggressive) | 없음 | civitai.com/models/1200242 |
| **2000s Analog Core v3** | 0.8~1.0 | `v8s` | civitai.com/models/1134895 |
| **UltraRealistic LoRA v2** | 0.8~1.0 (손 이슈 시 0.87) | 없음 | civitai.com/models/796382 |
| ~~UltraRealPhoto~~ | ❌ 사용 금지 | — | 오버베이크 |

### 2000s Analog Core 세팅
- `dpmpp_2m` + `beta` + 40 steps + guidance 2.5~3.0
- 트리거: **`v8s`** (필수)
- VHS 느낌: `amateur quality, low resolution` 추가, 0.5MP (704x704)
- Hi8 느낌 (클린 아날로그): 1MP (896x1152)

### 프롬프트 스타일

UltraReal은 **복잡하고 디테일한 콤마 구분 프롬프트**에 최적화:

```
high-resolution, professional photography, a beautiful Korean woman in her late 20s,
soft round face, bright doe eyes, small nose, sweet warm smile,
long straight dark brown hair with subtle layers, fair luminous skin,
wearing a cream knit sweater, natural makeup with rosy cheeks,
soft studio lighting, shallow depth of field, 85mm lens, photorealistic
```

### 흔한 실수

1. **저해상도 출력** → `high-resolution` 프롬프트에 추가
2. **손 왜곡** → LoRA strength 0.87로 낮추기
3. **과포화** → LoRA 스택 줄이기, Realism Amplifier만 moderate 강도
4. **텍스트 아티팩트** → T5-XXL fp16 사용
5. **"white background" 사용** → Flux Dev에서 블러 발생. 대신 "clean studio backdrop" 등 구체적 배경

---

## 8. 캐릭터 일관성 팁

1. **참조 명확히**: "This person..." 또는 "The woman with short black hair..."
2. **신원 마커 지정**: "maintain the exact same face, hairstyle, and distinctive features"
3. **일관된 비율**: 1:1 정방형이 비율 유지에 최적
4. **단색 배경**: 모델이 캐릭터에 집중
5. **최소 1024×1024**: 참조 이미지 해상도
6. **Flux Kontext**: 캐릭터 일관 편집에 최적 — 변경/유지 분리 서술
7. **LoRA 훈련**: 다수 이미지 일관성에는 커스텀 LoRA가 궁극

---

## 소스

### UltraReal
- [UltraReal Fine-Tune v4](https://civitai.com/models/978314/ultrareal-fine-tune)
- [Realism Amplifier](https://civitai.com/models/1200242/realistic-amplifier-for-ultrareal-fine-tune)
- [2000s Analog Core v3](https://civitai.com/models/1134895/2000s-analog-core)
- [UltraRealistic LoRA v2](https://civitai.com/models/796382/ultrarealistic-lora-project)

### Flux 프롬프팅
- [BFL Official Prompting Guide](https://docs.bfl.ml/guides/prompting_summary)
- [Flux Prompt Guide — getimg.ai](https://getimg.ai/blog/flux-1-prompt-guide-pro-tips-and-common-mistakes-to-avoid)
- [Flux.1 Dev Sampler+Scheduler Comparison — Civitai](https://civitai.com/articles/6582/flux1-dev-sampler-scheduler-comparison)
- [Scheduler+Sampler Combinations — Civitai](https://civitai.com/articles/7400/scheduler-sampler-combinations-for-flux1-dev)
- [Flux Prompting Ultimate Guide — Skywork](https://skywork.ai/blog/flux-prompting-ultimate-guide-flux1-dev-schnell/)
- [Ambience AI Flux Guide (2026)](https://www.ambienceai.com/tutorials/flux-prompting-guide)
