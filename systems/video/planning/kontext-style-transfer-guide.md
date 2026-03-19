# Flux Kontext 스타일 변환 가이드

> **Date**: 2026-03-20
> **소스**: Civitai (Caocao2025), YouTube 튜토리얼, 실제 테스트 결과

---

## 1. 개요

Flux Kontext = 레퍼런스 이미지 기반 편집 모델. 얼굴/포즈/의상 유지하면서 **스타일만 변환** 가능.

**파이프라인**: 실사 사진 → Kontext → 애니메/지브리/코믹/망가

---

## 2. 스타일별 프롬프트 (검증됨)

### 일본 애니메
```
Convert to Japanese anime style
```

### 플랫 애니메 (디테일)
```
Convert this photo into a cute flat anime illustration style. Clean bold outlines,
flat cel-shaded colors, simple shading, large expressive anime eyes.
Keep her yellow hoodie, round glasses, hair, and pose exactly the same.
Anime character design sheet style, white background.
```

### 지브리
```
Transform the image into a Ghibli anime style
```

### 90s 카툰
```
Make this a 90s cartoon
```

### 망가 (흑백)
```
In the style of a manga panel, black and white, detailed line art
```

### 레트로 코믹 (벤데이 닷)
```
Convert to a retro comic book style, Ben-Day dots
```
> 벤데이 닷 싫으면 해당 부분 삭제

### 미국 슈퍼히어로 코믹
```
Transform the image into an American superhero comic style
```

---

## 3. Kontext 세팅 가이드

### Guidance 값

| 값 | 효과 |
|----|------|
| 1.5 | 원본 얼굴 최대 보존. 스타일 변환 약함 |
| **2.0** | **균형 — 얼굴 유지 + 스타일 변환** |
| 2.5 | 스타일 변환 강함. 얼굴 변형 가능 |
| 3.0+ | 프롬프트 최우선. 원본 많이 바뀜 |

### 프롬프트 규칙

1. **변경할 것만 명시** — "Change only X to Y"
2. **유지할 것 강조** — "Keep everything else exactly the same"
3. **변경 지시가 적을수록 얼굴 보존 ↑**
4. **매력 키워드 추가 가능** — `slim, charming, lovely, sweet smile`
5. **의상 변경 시 구체적으로** — "bright yellow oversized hoodie" > "hoodie"

### 미녀 보존 팁

- guidance 2.5에서 못생겨지는 현상 → **2.0으로 낮추기**
- 프롬프트에 **slim, charming, lovely** 추가
- 배경/포즈/조명 동시 변경 ❌ → **의상만 변경** 후 별도 단계로 배경 변경

---

## 4. 실사 → 애니메 2-Step 파이프라인

### Step 1: 레퍼런스 얼굴 + Vee 의상

```
프롬프트:
Change only her clothes to a bright yellow oversized hoodie.
Add round black glasses. She looks slim, charming, and lovely
with a warm sweet smile. Keep her face and hair exactly the same.

Guidance: 2.0
```

### Step 2: 실사 → 애니메 변환

```
프롬프트:
Convert to Japanese anime style

또는 (디테일):
Convert this photo into a cute flat anime illustration style.
Clean bold outlines, flat cel-shaded colors, simple shading,
large expressive anime eyes. Keep her yellow hoodie, round glasses,
hair, and pose exactly the same.

Guidance: 2.5
```

---

## 5. 테스트 결과 (2026-03-20)

### Guidance 비교 (의상 변경)

| 레퍼런스 | v1 (2.5) | v2 (1.5) | v3 (2.0 + 매력 키워드) |
|----------|----------|----------|----------------------|
| 장나라 | 못생겨짐 | 얼굴 유지 OK | ✅ 자연스러운 미소 |
| 송지효 | 서양화 | 선글라스됨 | ✅ 둥근 안경 OK |
| 이채영 | 원본 텍스트 유지 | 얼굴 유지 | ✅ 밝은 표정 |

**결론**: guidance 2.0 + `slim, charming, lovely` = 최적 밸런스

### 애니메 변환 결과

| 레퍼런스 | 평가 |
|----------|------|
| 장나라 → 애니메 | 귀여운 캐릭터, 눈 색 파란색으로 변경됨 |
| 송지효 → 애니메 | 밝은 분위기, 후드티+안경 유지 |
| 이채영 → 애니메 | ✅ 최고 — 원본 특징 살린 깔끔한 애니메 |

---

## 6. 워크플로 파일

### API 워크플로 (파이프라인용)
- `workflows/api/flux_kontext_edit.json` — Kontext 편집 (API format)
- `workflows/api/flux_kontext_edit_bindings.json` — 바인딩

### 레퍼런스 워크플로 (GUI용)
```
workflows/reference/kontext_anime_styles/
├── convert to anime and retro comic book.json
├── convert to ghibli and 90s cartoon.json
└── convert to manga and american super hero comic.json
```

### 레퍼런스 이미지
```
E:\download\장나라\          — ~100장
E:\download\송지효\          — ~100장
E:\download\프로미스나인 이채영\  — ~130장
```

ComfyUI input에 복사된 레퍼런스:
```
ComfyUI/app/input/
├── ref_jangnara.png
├── ref_songjihyo.jpg
├── ref_chaeyoung.jpg
├── vee_jangnara_real.png    (Kontext v3 실사 결과)
├── vee_songjihyo_real.png
└── vee_chaeyoung_real.png
```

---

## 7. 소스

- [Convert Photos to Anime/Ghibli/Comic — Civitai](https://civitai.com/models/2293857/convert-photos-to-anime-ghibli-or-retro-comic-with-flux1-kontext)
- [YouTube 튜토리얼 (Caocao2025)](https://www.youtube.com/watch?v=rHFiDbE7EoQ)
- 프롬프트 6종 검증 완료
