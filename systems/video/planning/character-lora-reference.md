# Vee 캐릭터 LoRA 레퍼런스 가이드

> **Date**: 2026-03-19
> **목적**: Vee 캐릭터 디자인 스타일 선정을 위한 LoRA 비교 테스트 레퍼런스
> **Base Model**: Flux.1-dev GGUF (Q5_K_S)

---

## 1. Flat Anime Style

**Civitai**: https://civitai.com/models/1229111/flat-anime-style-flux

| 항목 | 값 |
|------|-----|
| 파일 | `Flat_Anime_Style_-_FLUX-000009.safetensors` (18.4MB) |
| Base | Flux.1 Dev |
| 트리거 워드 | `flat anime style` |
| 권장 weight | 명시 없음 (테스트: 0.85) |
| 훈련 데이터 | ~30장 커스텀 데이터셋 |
| 다운로드 | 477 / 리뷰 87 (매우 긍정) |

### 특성
- 귀여운 플랫 애니메 스타일 — 라인이 깔끔하고 색이 단순
- 제작자가 "SDXL보다 FLUX의 프롬프트 이해력을 선호"해서 FLUX로 훈련
- 다른 LoRA와 조합 미테스트 (제작자 코멘트)
- **Flux.1 [dev] Non-Commercial License** 적용

### 사용법
```
flat anime style, [캐릭터 설명], [표정], [배경], [스타일 앵커]
```

### Vee 프롬프트 예시
```
flat anime style, character design sheet, front view, full body,
young woman, bright yellow oversized hoodie, round black glasses,
brown bob hair shoulder length, warm cream skin, cute friendly expression,
slight smile, white background, clean lines, simple design
```

### 적합한 용도
- 교육용 YouTube 캐릭터
- Kurzgesagt 느낌 유지하면서 애니메 감성 추가
- 심플한 라인 + 플랫 컬러 필요 시

---

## 2. Juaner Cartoon (Cute Manga)

**Civitai**: https://civitai.com/models/681642/illustrationscute-cartoon-cute-manga-flux

| 항목 | 값 |
|------|-----|
| 파일 | `j_cartoon_flux_bf16.safetensors` (146MB) |
| Base | Flux.1 Dev |
| 트리거 워드 | `Juaner_cartoon` |
| 권장 weight | **0.8–1.0** |
| 권장 해상도 | 1024×1024 |
| Clip Skip | 1 |

### 특성
- "귀엽고 기발한 카툰 스타일" — 표정과 액션이 **매우 과장됨**
- 표정/팔다리 액션이 실제 인간과 차이가 커서 **얼굴/동작 왜곡 가능성** 있음
- 안정적 출력을 위해 다른 LoRA나 base 모델과 조합 권장

### 사용법
```
Juaner_cartoon, [캐릭터 설명] + [표정] + [액션] + [환경 설명]
```
자연어 설명을 직접 사용 가능.

### 프롬프트 구조 (제작자 권장)
```
Juaner_cartoon, A determined archaeologist with short blonde hair,
wearing a dusty hat and khaki outfit, uncovering a buried artifact
in a dimly lit ancient temple...
```

### Vee 프롬프트 예시
```
Juaner_cartoon, character design sheet, front view, full body,
young woman, bright yellow oversized hoodie, round black glasses,
brown bob hair shoulder length, warm cream skin, cute friendly expression,
slight smile, white background, clean lines, cute manga style mascot
```

### 주의사항
- **얼굴 왜곡 주의**: 표정이 과장되면서 얼굴이 불안정해질 수 있음
- **동작 왜곡 주의**: 팔다리 포즈가 부자연스러울 수 있음
- weight 0.8에서 시작, 과하면 낮추기
- 상업 사용 시 제작자 이메일 확인: juaner0211@163.com

### 적합한 용도
- 마스코트 캐릭터
- 표정이 과장된 리액션 샷
- 만화적 느낌이 강한 교육 콘텐츠

---

## 3. Ultra Real Anime

**Civitai**: https://civitai.com/models/1131779/ultra-real-anime-flux

| 항목 | 값 |
|------|-----|
| 파일 | `ultra_real_anime_flux_v1.safetensors` (164MB) |
| Base | Flux.1 Dev |
| 트리거 워드 | `ANIMEFLUX` |
| 권장 weight | 명시 없음 (테스트: 0.85) |
| 다운로드 | 1,907 / 리뷰 203 (매우 긍정) |
| 생성 수 | 2,401+ |

### 특성
- **세미리얼리스틱 애니메** — 리얼한 디테일 + 애니메 눈/표현
- PuLID 얼굴 인식과 호환 가능 (리얼한 얼굴 특징이 있으므로)
- 디테일이 풍부해서 캐릭터 일관성 유지에 유리
- 사용 가이드가 최소한 — 트리거 워드와 base 모델 정보만 제공

### 사용법
```
ANIMEFLUX, [캐릭터 설명], [장면], [스타일 수식어]
```

### Vee 프롬프트 예시
```
ANIMEFLUX, character design, front view, full body,
young woman, bright yellow oversized hoodie, round black glasses,
brown bob hair shoulder length, warm cream skin, cute friendly expression,
slight smile, white background, anime style, detailed eyes
```

### 적합한 용도
- 리얼 느낌의 애니메 캐릭터
- PuLID/Kontext로 캐릭터 일관성 유지 파이프라인
- Gen Z 타겟 YouTube 콘텐츠

---

## 4. FC Flux Perfect Busts

**Civitai**: https://civitai.com/models/61099/fluxpony-perfect-full-round-breasts-and-slim-waist

| 항목 | 값 |
|------|-----|
| 파일 | `FC Flux Perfect Busts.safetensors` (1.2GB) |
| Base | Flux.1 Dev (V3.0 R128) |
| 트리거 워드 | `woman` (기본) |
| 추가 키워드 | `slim waist`, `busty breasts`, `cleavage` 등 |
| 권장 base | Flux Perfect Base 또는 Flux.1 Dev |
| 다운로드 | 136K+ / 리뷰 9,457 |
| 생성 수 | 1M+ |

### 버전 이력
| 버전 | Base | 날짜 | 비고 |
|------|------|------|------|
| **Flux V3.0 R128** | Flux.1 Dev | 2025-05 | 최신, 인증 필요 |
| Flux V2 | Flux.1 Dev | 2024-08 | |
| Pony V1.0 | Pony | 2024-08 | |
| wan2.2 T2V | Wan 2.2 | 2025-10 | 비디오 생성용 |
| SD15 V4 | SD 1.5 | 2023-11 | 레거시 |

### 특성
- **체형 특화 LoRA** — 깨끗한 해부학 + 포토리얼리즘 유지
- 4090 GPU에서 훈련
- NSFW 레벨 60 — 성인 콘텐츠 지향
- **Wan 2.2 비디오 버전도 존재** (T2V high/low noise)
- 상업적 사용 허용 (이미지, 렌탈, 판매)

### 사용법
```
woman, [캐릭터 설명], slim waist, [추가 체형 키워드], [장면]
```

### Vee 프롬프트 예시
```
character design, front view, full body, woman, young woman,
bright yellow oversized hoodie, round black glasses,
brown bob hair shoulder length, warm cream skin, slim waist,
cute friendly expression, slight smile, white background, anime style
```

### 적합한 용도
- 체형이 중요한 캐릭터 디자인
- 리얼리스틱 스타일 캐릭터
- Ultra Real Anime와 콤보로 사용 가능

---

## 5. 스타일 비교 요약

| 축 | Flat Anime | Juaner Cartoon | Ultra Real Anime | FC Busts |
|----|-----------|----------------|-----------------|----------|
| **스타일** | 플랫 벡터 | 과장된 만화 | 세미리얼 애니메 | 리얼 체형 |
| **복잡도** | 낮음 | 중간 | 높음 | 높음 |
| **표정 표현력** | 중간 | 최상 (과장) | 높음 | 중간 |
| **캐릭터 일관성** | 중간 | 낮음 (왜곡 가능) | 높음 | 중간 |
| **PuLID 호환** | ✗ (플랫이라 얼굴 인식 불가) | △ (왜곡 시 불가) | ✓ (리얼 얼굴) | ✓ |
| **I2V 궁합** | 좋음 (심플) | 미지수 (왜곡) | 좋음 | 미지수 |
| **파일 크기** | 18MB | 146MB | 164MB | 1.2GB |
| **교육 콘텐츠 적합** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |

## 6. Flux LoRA 공통 세팅 가이드

### Flux.1 Dev 아키텍처 핵심 이해

Flux는 SD/SDXL과 다른 구조:
- **CFG는 항상 1.0 고정** — KSampler의 cfg 파라미터
- **가이던스는 FluxGuidance 노드**에서 별도 처리 (SD의 CFG 역할)
- **네거티브 프롬프트 불필요** — Flux는 positive만 사용
- 트리거 워드 빠지면 Flux 기본 포토리얼리즘으로 폴백됨

### Sampler × Scheduler 최적 조합 (리서치 결과)

Civitai 189장 비교 테스트 + 커뮤니티 검증 결과:

| 조합 | 특성 | 권장 용도 |
|------|------|----------|
| **`euler` + `beta`** | ★★★★★ 가장 안정적, 범용 최강 | **기본 추천** |
| `uni_pc_bh2` + `sgm_uniform` | ★★★★☆ 샤프, 선명한 대비, 디테일 ↑ | GGUF 양자화 모델에 특히 좋음 |
| `deis` + `beta` | ★★★★☆ 현실적 피부, 날카로운 머리카락 | 리얼리즘 계열 LoRA |
| `euler` + `simple` | ★★★☆☆ 무난하지만 블러 가능 | SD 호환 폴백 |
| `dpmpp_2m` + `sgm_uniform` | ★★★★☆ 가장 샤프 | 블러 이슈 해결용 |

> **결론**: 현재 `euler` + `simple` → **`euler` + `beta`로 변경 권장**
> 리얼리즘 계열은 `deis` + `beta` 또는 `uni_pc_bh2` + `sgm_uniform` 시도

### FluxGuidance 값

| 값 | 효과 |
|----|------|
| 1.0~2.0 | 리얼리즘 강화, 스타일 약화 |
| **2.5~3.5** | **균형 (기본 권장)** |
| 4.0~5.0 | 프롬프트 충실도 ↑, 과포화 위험 |

### Steps 가이드

| Steps | 품질 | 시간 | 용도 |
|-------|------|------|------|
| 15~20 | 좋음 | 빠름 | 초안, 스타일 탐색 |
| **25~30** | **최적** | 중간 | **프로덕션 권장** |
| 40~50 | 미세 개선 | 느림 | 최종 품질 필요 시 |

### LoRA별 최적 세팅

| LoRA | Strength | Steps | Sampler | Scheduler | FluxGuidance | 프롬프트 스타일 |
|------|----------|-------|---------|-----------|-------------|----------------|
| Flat Anime | 0.85 | 20 | euler | beta | 3.5 | **짧고 심플**. 색상/라인 위주 |
| Juaner Cartoon | 0.9 | 20 | euler | beta | 3.5 | **자연어 서술형**. 과장 묘사 |
| Ultra Real Anime | 0.85 | 30 | deis | beta | 3.0 | **디테일**. `masterpiece` + 피부/눈 |
| FC Perfect Busts | 0.8 | 25 | euler | beta | 3.5 | **체형 키워드** 선행 |
| Combo (Real+FC) | 0.8+0.6 | 30 | deis | beta | 3.0 | 두 트리거 합침 |

### 주의사항
- **손 왜곡** 발생 시 → strength 0.87~0.8로 낮추기
- **블러 이미지** → sampler를 `dpmpp_2m` + `sgm_uniform`으로 교체
- 스타일 LoRA는 프롬프트 구조가 다름 — **제작자 의도에 맞는 프롬프트 스타일** 사용
- Juaner는 얼굴/동작 왜곡 가능성 있음 (과장된 표현 특성상)
- GGUF 양자화 모델에서는 `uni_pc_bh2` + `sgm_uniform`이 품질 보정에 효과적

### 소스
- [FLUX.1 Dev: Sampler + Scheduler Comparison (Civitai)](https://civitai.com/articles/6582/flux1-dev-sampler-scheduler-comparison) — 189장 비교
- [Sampler and Scheduler Reference (Civitai)](https://civitai.com/articles/16231/sampler-and-scheduler-reference-for-hi-dream-flux-sdxl-illustrious-and-pony)
- [ComfyUI FLUX Complete Guide (aifreeapi)](https://www.aifreeapi.com/en/posts/comfyui-flux)
- [FluxGuidance Node Wiki](https://comfyui-wiki.com/en/comfyui-nodes/advanced/conditioning/flux/flux-guidance)
- [How to Run FLUX Locally (localaimaster)](https://localaimaster.com/blog/flux-local-image-generation)

---

## 7. 테스트 매트릭스

### 테스트 라운드 (v3 — 최종)

각 LoRA별 3장 × 5세트 = **15장**, 파일명 `Vee3_*.png`

| 테스트 | 내용 | 해상도 |
|--------|------|--------|
| `*_front` | 정면 전신 캐릭터 | 832×1216 |
| `*_expr` | 표정 6종 시트 | 832×1216 |
| `*_desk` | 3/4뷰 데스크 장면 | 832×1216 |

### LoRA별 프롬프트 (v3)

**Flat Anime** (짧고 심플):
```
flat anime style, a cute young woman standing, front view full body,
yellow oversized hoodie, round black glasses, brown bob hair, cream skin,
gentle smile, hands in hoodie pockets, plain white background
```

**Juaner Cartoon** (자연어 서술형):
```
Juaner_cartoon, A cheerful young woman with a bright yellow oversized hoodie
and big round black glasses perched on her nose, brown bob hair bouncing at
her shoulders, standing confidently with one hand on her hip and a big warm
smile, full body front view against a clean white background
```

**Ultra Real Anime** (디테일 + 퀄리티 태그):
```
ANIMEFLUX, masterpiece, high quality, a beautiful young woman standing in
front view, full body shot, wearing a bright yellow oversized hoodie, round
black-framed glasses, brown bob hair with subtle highlights, warm cream skin
with soft lighting, gentle friendly smile, detailed expressive eyes with
light reflections, studio lighting, clean white background
```

**FC Perfect Busts** (체형 키워드 선행):
```
woman, full body front view, a young woman with slim waist, wearing a bright
yellow oversized hoodie, round black glasses, brown bob hair, cream skin,
standing confidently, gentle smile, white background, anime style, high quality
```

**Combo — Ultra Real + FC** (듀얼 LoRA 체인):
```
ANIMEFLUX, woman, masterpiece, high quality, full body front view, a beautiful
young woman with slim waist, wearing bright yellow oversized hoodie, round black
glasses, brown bob hair with highlights, warm cream skin, gentle smile, detailed
eyes with light reflections, white background
```

### 이전 라운드 (폐기)
- `VeeTest_*` — 1차 (동일 프롬프트 구조, 스타일 미분화)
- `Vee2_*` — 2차 (트리거만 교체, 프롬프트 구조 동일)

### 출력 경로
```
\\wsl.localhost\Ubuntu-22.04\home\hugh\ComfyUI\app\output\Vee3_*.png
```

---

## 8. 다음 단계

1. Vee3 15장 테스트 결과 육안 비교
2. 스타일 1개 확정
3. 확정된 스타일로 Vee 캐릭터 시트 생성 (턴어라운드 5포즈)
4. Flux Kontext Turnaround Sheet LoRA로 자동 확장
5. 캐릭터 시트를 reference로 30샷 키프레임 재생성
6. (선택) Flux 2로 전환 시 LoRA 호환성 확인
