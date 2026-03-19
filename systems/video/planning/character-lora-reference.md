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

## 5. UltraReal Fine-Tune v4 (실사 체크포인트)

**Civitai**: https://civitai.com/models/978314/ultrareal-fine-tune

| 항목 | 값 |
|------|-----|
| 파일 | `ultrarealFineTune_v4.gguf` (12GB) |
| 타입 | **파인튠 체크포인트** (LoRA 아님 — UNET 교체) |
| Base | Flux.1 Dev |
| 트리거 워드 | 없음 |
| 데이터셋 | 1800+ 이미지 |

### v4 변경사항
- 미감(aesthetic) 향상
- 나이 다양성 + 아시안 피처 개선
- **손이 약간 불안정해짐** (v3 대비)

### 제작자 권장 세팅

| 파라미터 | 값 | 비고 |
|----------|-----|------|
| Sampler | **DPM++ 2M** | smooth/consistent |
| Scheduler | **Beta** | 필수 |
| Steps | **30–50** | 40 권장 |
| CFG Scale | **3.0** (FluxGuidance) | v3부터 2.5→3.0 상향 |
| CFG (KSampler) | 1.0 | Flux 고정 |

### LoRA 호환

| LoRA | 호환 | 비고 |
|------|------|------|
| **Realism Amplifier** | ✅ 권장 | 리얼리즘 강화 |
| **2000s Analog Core** | ✅ 권장 | 빈티지 스타일 |
| ~~UltraRealPhoto~~ | ❌ 사용 금지 | 오버베이크됨 (효과가 이미 체크포인트에 내장) |
| 스타일 LoRA 일반 | ✅ | 스타일 베이스로 설계됨 |

### 사용법
UNET을 `flux1-dev-Q5_K_S.gguf` 대신 `ultrarealFineTune_v4.gguf` 로 교체.
나머지 파이프라인 (DualCLIP, VAE, FluxGuidance) 동일.

```
# 프롬프트 스타일: 복잡하고 디테일한 콤마 구분
high-resolution, a young woman sitting at a desk, warm ambient lighting,
soft shadows, detailed skin texture, brown bob hair with subtle highlights,
round black glasses, yellow hoodie, natural expression, bokeh background,
professional photography, 85mm lens
```

### 적합한 용도
- 실사 캐릭터 렌더링 (Vee 리얼 버전)
- 포토리얼 키프레임 (I2V 입력으로 최적)
- 스타일 LoRA의 베이스 체크포인트

### 워크플로
- `workflows/api/flux1_ultrareal_t2i.json`
- `workflows/api/flux1_ultrareal_t2i_bindings.json`

---

## 6. Blue Archive Style (블루아카이브 애니메)

**Civitai**: https://civitai.com/models/677392/flux-anime-blue-archive-style

| 항목 | 값 |
|------|-----|
| 파일 | `BastylrV2_blue_archive.safetensors` (74MB) |
| Base | Flux.1 Dev |
| 트리거 워드 | **없음** |
| 권장 해상도 | 숏사이드 1152+, 롱사이드 1920+ |
| 훈련 | kohya-ss/sd-scripts, 200 epoch, 자동 파이프라인 |

### 특성
- 블루아카이브 게임 스타일 — 깔끔한 셀쉐이딩, 밝은 색감, 대형 눈
- 가로: 배경/씬 중심, 세로: 캐릭터 중심
- Hires repair 1.5~2x 옵션 (선택)
- 100% 자동 훈련 파이프라인 (DeepGHS Team)
- 아트 스타일 재현 정확도는 수동 훈련 대비 낮을 수 있음

### 사용법
```
# 트리거 워드 없음 — 프롬프트만으로 스타일 적용
a cute young woman, yellow oversized hoodie, round black glasses,
brown bob hair, gentle smile, school hallway background,
bright lighting, anime illustration
```

### 권장 해상도
| 방향 | 해상도 | 용도 |
|------|--------|------|
| 세로 (캐릭터) | 1152×1920 | 캐릭터 시트, 전신 |
| 가로 (씬) | 1920×1152 | 배경 중심 장면 |
| 정방 | 1152×1152 | 범용 |

### 적합한 용도
- 게임 스타일 캐릭터 일러스트
- 밝고 깔끔한 애니메 스타일 Vee
- 블루아카이브/학원물 느낌 키프레임

---

## 스타일 비교 요약

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

## Flux LoRA 공통 세팅 가이드

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

## 테스트 매트릭스

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

## 캐릭터 ID 보존 기술 종합 가이드

캐릭터를 한 번 디자인하면, 30+ 샷에서 **동일 인물로 인식**되어야 함.
아래는 오픈소스 기술을 난이도순으로 정리한 것.

### Tier 1: 제로샷 (훈련 불필요, 레퍼런스 이미지만)

| 기술 | 원리 | 일관성 | Flux 지원 | ComfyUI 노드 |
|------|------|--------|-----------|-------------|
| **Flux Kontext** | 레퍼런스 이미지를 latent로 인코딩, 편집 지시문으로 장면 변경 | ★★★★☆ (70-85%) | ✅ 네이티브 | `FluxKontextImageScale` + `ReferenceLatent` |
| **IP-Adapter** | 레퍼런스에서 시각 특징 추출 → cross-attention 주입 | ★★★☆☆ (70-80%) | △ 개발 중 | `ComfyUI-IPAdapter-Flux` |
| **PuLID** | InsightFace 얼굴 임베딩 → 모델 가중치 수정 | ★★★★☆ (80-85%) | ✅ | `ComfyUI-PuLID-Flux` (설치됨) |
| **InstantID** | 얼굴 임베딩 + IdentityNet (공간 제어) | ★★★★☆ (80-85%) | △ SDXL 중심 | `ComfyUI-InstantID` |

> **Vee 문제**: PuLID/InstantID는 **실사 얼굴만 인식** → 2D 애니메 캐릭터에서 작동 안 함
> **해결**: Ultra Real Anime LoRA로 실사형 캐릭터 생성 → PuLID 작동 가능

### Tier 2: 캐릭터 시트 기반 (턴어라운드)

| 기술 | 방법 | 일관성 |
|------|------|--------|
| **Flux Kontext Turnaround Sheet LoRA** | 1장 일러스트 → 5포즈 자동 생성 (front/3q/side/back/3q) | ★★★★☆ |
| **Flux Consistent Character Sheet** | 프롬프트로 "character sheet, multiple views" 생성 | ★★★☆☆ |
| **ControlNet OpenPose** | 포즈 스켈레톤 + 캐릭터 레퍼런스 조합 | ★★★★☆ |

**Kontext Turnaround 워크플로**:
1. 스타일 LoRA로 Vee 기본 일러스트 1장 생성 (정면, 전신)
2. Kontext Turnaround Sheet LoRA 적용 → 5포즈 시트 자동 생성
3. 시트를 Kontext reference로 모든 키프레임에서 참조

소스: [Flux Kontext Character Turnaround Sheet LoRA](https://civitai.com/models/1753109/flux-kontext-character-turnaround-sheet-lora) — Ostris AI Toolkit으로 훈련됨

### Tier 3: 커스텀 LoRA 훈련 (최강 일관성)

**일관성 85-95%** — 가장 높지만 훈련 필요.

| 항목 | 값 |
|------|-----|
| 필요 이미지 | 15~30장 (다양한 포즈, 표정, 각도) |
| 배경 | 흰 배경 권장 |
| 캡셔닝 | 자연어 서술 (Flux 특화) |
| 훈련 도구 | **SimpleTuner** (안정, 문서 최고) / **AI-Toolkit** (빠름) / **Kohya SS** (GUI) |
| 훈련 스텝 | 1,500~2,000 (캐릭터 LoRA 기준) |
| network_dim | 32 (캐릭터 스위트스팟) |
| GPU | 12GB+ (RTX 5070 Ti 16GB → 충분) |
| 훈련 시간 | 2~6시간 |
| 결과 파일 | ~18-150MB .safetensors |

**훈련 파이프라인**:
```
1. 스타일 LoRA로 Vee 이미지 30장 생성 (다양한 포즈/표정/각도)
2. 수동 큐레이션 → 일관된 15~25장 선별
3. 자연어 캡셔닝 (각 이미지별 묘사)
4. SimpleTuner/Kohya로 Vee 전용 LoRA 훈련
5. 훈련된 LoRA = Vee의 "얼굴 ID"
```

**장점**: 트리거 워드만 넣으면 어떤 장면에서든 Vee로 생성
**단점**: 훈련 시간 + 이미지 준비 필요

소스:
- [Flux 2 LoRA Training Guide (SimpleTuner & AI-Toolkit)](https://apatero.com/blog/flux-2-lora-training-complete-guide-2025)
- [Kohya SS LoRA Training on 8GB GPU](https://github.com/FurkanGozukara/Stable-Diffusion/wiki/FLUX-LoRA-Training-Simplified-From-Zero-to-Hero-with-Kohya-SS-GUI-8GB-GPU-Windows-Tutorial-Guide)
- [Train Cartoon Style LoRA Guide](https://apatero.com/blog/train-cartoon-lora-complete-guide-2025)

### Tier 4: 멀티 레퍼런스 (Flux 2 전용)

Flux 2는 **레퍼런스 이미지 최대 10장**을 네이티브로 지원:
- 별도 노드/LoRA 불필요
- 캐릭터 시트 여러 장을 직접 입력
- 가장 간단하면서 높은 일관성

> **현재 상태**: Flux 2 GGUF Q2_K 다운로드 중 (12.9GB)
> 16GB VRAM에서 사용 가능하나, LoRA 호환성 미확인

### 기술별 비교 요약

| 기술 | 훈련 | 일관성 | 난이도 | 애니메 호환 | Flux 지원 |
|------|------|--------|--------|-----------|-----------|
| Flux Kontext (ref) | 불필요 | ★★★★☆ | 낮음 | ✅ | ✅ |
| PuLID | 불필요 | ★★★★☆ | 낮음 | ❌ (실사만) | ✅ |
| IP-Adapter | 불필요 | ★★★☆☆ | 낮음 | ✅ | △ |
| Turnaround Sheet | 불필요 | ★★★★☆ | 중간 | ✅ | ✅ |
| **커스텀 LoRA** | **2-6시간** | **★★★★★** | **높음** | **✅** | **✅** |
| Flux 2 멀티레퍼런스 | 불필요 | ★★★★☆ | 낮음 | ✅ | Flux 2 전용 |

### 우리 파이프라인 추천 경로

```
[지금] 스타일 LoRA 확정 (Vee3 테스트)
  ↓
[단기] Kontext Turnaround Sheet → 5포즈 캐릭터 시트
  ↓
[단기] Kontext reference로 30샷 키프레임 (훈련 불필요)
  ↓
[중기] 키프레임 30장 큐레이션 → Vee 전용 LoRA 훈련 (SimpleTuner)
  ↓
[중기] Vee LoRA + 스타일 LoRA 듀얼로 모든 에피소드 일관성 확보
  ↓
[장기] Flux 2 전환 시 멀티레퍼런스로 단순화
```

---

## Flux 2 Klein 9B 셋업 (Phase 9.5 — 2026-03-19)

### Klein 9B vs Flux 1 핵심 차이

| 항목 | Flux 1 Dev | Flux 2 Klein 9B |
|------|-----------|-----------------|
| UNET | `flux1-dev-Q5_K_S.gguf` (7.8GB) | `flux-2-klein-9b-Q5_K_M.gguf` (7GB) |
| Text Encoder | DualCLIPLoaderGGUF (T5-XXL + CLIP-L, type="flux") | CLIPLoader (Qwen 3 8B FP8, type="flux2") |
| Guidance | FluxGuidance 노드 (3.5), cfg=1.0 고정 | CFGGuider (cfg=5.0) — 실제 CFG 사용 |
| Latent | EmptySD3LatentImage | EmptyFlux2LatentImage |
| Scheduler | KSampler 내장 (scheduler="simple") | Flux2Scheduler → SamplerCustomAdvanced |
| Sampler | KSampler | SamplerCustomAdvanced + KSamplerSelect + RandomNoise |
| VAE | `ae.safetensors` (320MB) | `flux2-vae.safetensors` (321MB) |
| LoRA 호환 | Flux 1 전용 LoRA만 | **Klein 전용 LoRA만** (Flux 1 LoRA 호환 안 됨!) |
| 속도 | 베이스라인 | ~47x 빠름 (step-distilled) |

### Klein 9B 모델 파일

| 파일 | 경로 | 크기 | 소스 |
|------|------|------|------|
| UNET | `unet/flux-2-klein-9b-Q5_K_M.gguf` | 7GB | [unsloth/FLUX.2-klein-9B-GGUF](https://huggingface.co/unsloth/FLUX.2-klein-9B-GGUF) |
| Text Encoder | `text_encoders/qwen_3_8b_fp8mixed.safetensors` | 8.7GB | [Comfy-Org/vae-text-encorder-for-flux-klein-9b](https://huggingface.co/Comfy-Org/vae-text-encorder-for-flux-klein-9b) |
| VAE | `vae/flux2-vae.safetensors` | 321MB | ✅ 이미 다운됨 |

> **참고**: Flux 2 Dev 모델 (`flux2-dev-Q2_K.gguf` + `mistral_3_small_flux2_fp8.safetensors`)은 Klein과 별개. 삭제하지 말 것.

### Klein용 LoRA 후보

| LoRA | 트리거 | Base | 용도 | URL |
|------|--------|------|------|-----|
| Flat Anime Style (Klein) | `F14TV3CT0R` | Flux2Klein_9B | 플랫 벡터 애니메 | civitai.com/models/2472987 |
| AniEdit (Klein) | TBD | Flux2Klein | 애니메 편집 | civitai.com/models/2332320 |
| Klein Anime/Real Slider | TBD | Flux2Klein | 애니메↔리얼 조절 | civitai.com/models/2332657 |

> ⚠️ Civitai LoRA는 수동 다운로드 필요 (인증)

### Klein 워크플로

- `workflows/api/flux2_klein_9b_t2i.json` — T2I + LoRA (API format)
- `workflows/api/flux2_klein_9b_t2i_bindings.json` — 바인딩 + Flux1↔Klein 비교표

### Klein 최적 세팅 (리서치 + 공식 템플릿 기반)

| 파라미터 | 값 | 비고 |
|----------|-----|------|
| Sampler | `euler` | KSamplerSelect |
| CFG | 5.0 | CFGGuider (FluxGuidance 아님) |
| Steps | 20 | Flux2Scheduler |
| 해상도 | 832×1216 (세로) / 1024×1024 (정방) | EmptyFlux2LatentImage |
| LoRA strength | 0.85 | Klein 전용 LoRA |

---

## 다음 단계

1. ~~Vee3 15장 테스트 결과 육안 비교~~ ✅ (13/15 완료)
2. Klein 9B + Klein Flat Anime LoRA 테스트 (3장)
3. Flux 1 vs Klein 비교 → 최종 모델 확정
4. 확정된 모델로 Vee 기본 일러스트 1장 생성 (최고 품질)
5. Flux Kontext Turnaround Sheet LoRA로 5포즈 시트 자동 생성
6. Kontext reference로 30샷 키프레임 재생성
7. (중기) 키프레임 큐레이션 → Vee 전용 LoRA 훈련
8. (장기) Flux 2 멀티레퍼런스 전환
