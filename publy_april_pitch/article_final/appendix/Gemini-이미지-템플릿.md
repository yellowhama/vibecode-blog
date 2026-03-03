# 부록 F: Gemini 이미지 템플릿

이미지 프롬프트 파일(`07_image_prompts.md`)의 각 IMG-* 항목을 Gemini API로 보내서 이미지를 생성합니다.

---

## 사용법 1: Claude Code에서 (가장 쉬움)

레이아웃이 만들어진 상태에서 아래 프롬프트를 Claude Code에 붙여넣습니다.

```
[RUN_PATH]/07_image_prompts.md를 읽고,
각 IMG-* 항목에 대해 Pencil의 해당 이미지 슬롯에 AI 이미지를 생성해줘.

규칙:
- 실사 사진 스타일로 생성해. 일러스트/만화 금지.
- 제품이 직접 등장하는 사진은 만들지 마. 배경/분위기/보조 이미지만.
- 촬영 목록에서 "사람이 찍어야 함"으로 표시된 건 건너뛰어.
- 건너뛴 슬롯은 회색 플레이스홀더로 남기고 "촬영 필요"라고 표시해.
```

---

## 사용법 2: API 직접 호출 (개발자용)

### 환경 설정

```bash
# .env 파일에 API 키 저장
GEMINI_API_KEY=your_api_key_here
```

### 기본 호출

```bash
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "여기에 이미지 프롬프트를 넣습니다"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

### 응답에서 이미지 추출

응답의 `candidates[0].content.parts` 중 `inlineData`가 있는 파트에서 base64 이미지를 추출합니다.

```bash
# 응답을 파일로 저장하고 이미지 추출 (jq 필요)
cat response.json | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' | base64 -d > image.png
```

---

## 프롬프트 작성 팁

### 좋은 프롬프트

```
Top-down view of a cardboard box with fresh red apples,
warm natural lighting, clean white kitchen countertop,
product photography style, soft shadows, no text overlay
```

- 구도를 명시 (Top-down, close-up, flat lay)
- 조명을 명시 (natural lighting, studio light)
- 스타일을 명시 (product photography, editorial)
- "no text"를 추가 (이미지에 글자가 들어가는 걸 방지)

### 나쁜 프롬프트

```
사과 사진 만들어줘
```

- 구도, 조명, 스타일이 없음
- 결과가 매번 다르게 나옴

---

## 안전 원칙

1. **제품 사진을 만들어내지 마라.** AI가 생성한 제품 사진은 실제와 다를 수 있다. 보조 이미지(배경, 분위기)만 생성한다.
2. **라벨/인증 사진을 만들지 마라.** GAP 인증, 원산지 라벨 등은 실물을 촬영해야 한다.
3. **수치가 포함된 이미지를 만들지 마라.** "당도 13 brix" 같은 측정 이미지는 근거가 있을 때만.
4. **생성한 이미지는 표시하라.** 어떤 이미지가 AI 생성인지, 실제 촬영인지 구분이 가능해야 한다.
