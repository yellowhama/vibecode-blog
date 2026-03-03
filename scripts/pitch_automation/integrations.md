# MCP/API로 “진짜 자동화” 붙이는 지점

이 문서는 “기능 소개 -> 조합 -> 자동화”에서 **도구 연결**만 따로 정리했습니다.

## 1) 디자인: pencil.dev (MCP)

목표는 “완성 디자인”이 아니라, 아래를 자동으로 뽑는 것입니다.

- 섹션 블록(프레임) 5개 생성: Hero/USP/Proof/FAQ/CTA
- 각 블록에 텍스트 슬롯/이미지 슬롯을 넣기
- `runs/.../06_colors.json`을 토대로 색/타이포 기준을 통일하기

이걸 해주는 게 `pencil` MCP입니다.

## 2) 이미지: 나노바나나(Nano Banana) = Gemini 이미지 생성

핸드폰 사진이 별로일 때 AI가 할 수 있는 건 “새 제품을 창조”가 아니라 **보정/정리**입니다.

- 제품 사진 보정: 조명/배경/색감 통일, 먼지 제거, 그림자 정돈
- 보조 이미지 생성: 배경 패턴, 아이콘, 컨셉 일러스트

Gemini API(나노바나나)로 REST 호출을 붙이면 자동화가 됩니다.

### REST 예시(키는 환경변수로)

```bash
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "Create a clean studio-style product photo background. Keep the product shape realistic."}
      ]
    }]
  }'
```

## 3) 컬러: 트렌드 + 안전 팔레트 조합

자동화에서 컬러는 “예쁜 취향”이 아니라 **선택지를 파일로 남기는 것**이 목표입니다.

- 안전 세트: `colors_default.json`의 `default_ui`
- 트렌드 영감: `colors_default.json`의 `trend_neutral`

실전에서는 아래 방식이 제일 편합니다.
- 브랜드 컬러가 있으면 그걸 `accent`로 고정
- 없으면 기본 팔레트로 시작하고, 트렌드는 “두 번째 옵션”으로만 둠

## 4) 조합: 오케스트레이터 1개로 묶기

최종적으로는 아래가 한 번에 돌아가야 합니다.

- SSOT 읽기 -> 기획 JSON -> 카피 -> 와이어프레임 -> 색 -> 이미지 프롬프트 -> QA -> runs/에 저장

이 역할을 `prompts/00_orchestrator.md`가 합니다.
