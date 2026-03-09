---
description: "슬라이드 설계 기반 숏폼 스크립트 JSON 생성"
argument-hint: ""
allowed-tools: ["Read", "Glob", "Grep", "Write", "Task"]
---

# Shorts Draft — 슬라이드 스크립트 작성

`/shorts-plan`에서 설계한 슬라이드 시퀀스(또는 대화 컨텍스트의 설계)를 바탕으로 슬라이드 스크립트 JSON을 생성한다.

## 프로세스

1. 대화 컨텍스트에서 슬라이드 설계를 확인한다 (없으면 `/shorts-plan`을 먼저 실행하라고 안내)
2. 소스 파일을 읽는다
3. 아래 레퍼런스 파일을 **반드시** 읽는다:
   - `branding/voice.md` — 톤 SSOT (§4 영문 톤, §5 문장 규칙)
   - `branding/visual.md` — 시각 아이덴티티 (클레이메이션 스타일)
4. `systems/analytics/feedback-context.md` 존재 시 읽기 — hook 패턴 적용
5. 슬라이드 스크립트 JSON을 생성한다
6. `systems/shorts/scripts/` 에 JSON 파일을 저장한다
7. 사용자에게 결과를 제시한다

## JSON 포맷

```json
{
  "id": "shorts-{source-id}-NNN",
  "source": "소스 파일 상대경로",
  "format": "vertical_slides",
  "aspect_ratio": "9:16",
  "slides": [
    {
      "order": 1,
      "role": "hook",
      "text_overlay": "텍스트 오버레이 (40자 이내)",
      "image_description": "이미지 설명 (클레이메이션 비주얼)",
      "duration_seconds": 3,
      "beat": "frustration"
    }
  ],
  "total_duration_seconds": 35,
  "music_mood": "tense_buildup",
  "status": "draft"
}
```

## 작성 규칙

### 텍스트 오버레이
- 40자 이내 (한국어 기준, 영어는 60자)
- 한 줄 = 한 생각. 줄바꿈으로 리듬.
- 큰 글씨 → 감정/행동, 작은 글씨 → 보조 설명
- voice.md 톤: 싸지르기 모드, 3-7단어 펀치

### 이미지 설명
- 클레이메이션 스타일: Aardman-style clay figure
- 배경: 오프화이트 `#FDFCF0`
- 캐릭터: 다크브라운 `#2D1D19` clay
- 강조색: MUSU Yellow `#FFD166`
- 감정이 보이는 포즈/표정

### 음악 분위기 (music_mood)
- `tense_buildup` — 긴장 고조
- `hopeful_resolve` — 희망적 해결
- `chill_ambient` — 차분한 배경
- `energetic_punch` — 에너지 펀치

### 절대 금지
- 링크, URL, CTA, 제품명, 블로그 유도
- 시간 참조
- 금지 표현 (voice.md §7)

## 파일 명명

`systems/shorts/scripts/YYYY-wNN-{id}.json`

예: `systems/shorts/scripts/2026-w10-act1-1.json`

## 출력

`systems/shorts/scripts/` 에 JSON 파일을 생성하고 사용자에게 내용을 제시한다.
검증은 `/shorts-check`로 별도 실행한다.
