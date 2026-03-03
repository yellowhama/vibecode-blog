# Image Prompts — apple_example (Track B / RAG / Run1)

원칙:
- 제품 사진이 없으면 제품을 새로 만들어내지 않습니다.
- 대신 배경/패턴/아이콘으로 "레이아웃"을 먼저 완성하고, 샷리스트로 촬영을 붙입니다.

## 1) 제품 사진 보정(핸드폰 사진이 있을 때)

### [IMG-HERO-01] (제품 정면샷 보정)
- KR: "제공된 핸드폰 사과 사진을 깨끗한 스튜디오 제품 사진처럼 보정. 무배경(흰/연회색), 자연광 느낌, 그림자 부드럽게, 과한 반사 제거, 색은 현실적으로, 제품 형태는 절대 바꾸지 말 것."
- EN: "Edit the provided smartphone apple photo into a clean studio product shot. Seamless white/light-gray background, soft natural light, clean shadows, remove harsh reflections, keep realistic colors, and do not change the product shape."

### [IMG-USP-01] (사용 장면 보정)
- KR: "손에 든 사과/씻는 장면 사진을 깔끔하게. 배경 잡동사니 제거, 초점은 사과에, 피부톤 자연스럽게."
- EN: "Clean up a hand-holding or washing-apple photo. Remove clutter, focus on the apple, keep natural skin tones."

### [IMG-USP-02] (디테일 보정)
- KR: "사과 표면 디테일을 선명하게. 과한 샤픈 금지, 색 과장 금지."
- EN: "Enhance the apple surface detail. Avoid over-sharpening and avoid exaggerated colors."

### [IMG-USP-03] (라벨 보정)
- KR: "라벨 사진을 읽기 쉽게. 내용은 바꾸지 말고 선명도만."
- EN: "Make the label photo readable. Do not alter the content; only improve clarity."

### [IMG-PROOF-01] (원산지 표기 라벨 보정)
- KR: "원산지 표기가 있는 라벨을 또렷하게. 조작 느낌 없이 자연스럽게."
- EN: "Make the origin label crisp and readable, naturally without looking manipulated."

### [IMG-PROOF-02] (구성/중량 증명샷 보정)
- KR: "저울/구성 증명샷은 숫자가 보이게만 정리. 내용 변경 금지."
- EN: "For a scale/composition proof shot, improve readability only. Do not change the content."

### [IMG-CTA-01] (구성샷 보정)
- KR: "사과 구성샷을 정돈. 배경 단순, 정렬, 색감 통일."
- EN: "Tidy up the apple composition shot. Minimal background, aligned layout, unified color grading."

## 2) 보조 이미지(사진이 부족할 때)

### [IMG-USP-02] (배경 패턴)
- KR: "상세페이지 배경용 아주 옅은 뉴트럴 패턴(점/격자). 저대비, 텍스트 가독성 방해 금지."
- EN: "Create a very subtle neutral background pattern (dots or grid) for a product detail page. Low contrast, must not hurt text readability."

### [IMG-USP-03] (아이콘 세트)
- KR: "세척/보관/배송을 의미하는 라인 아이콘 3개. 단색, 동일한 선 두께."
- EN: "Create 3 monochrome line icons for wash, storage, and shipping. Consistent stroke width."

## 3) API 자동화용 템플릿(gemini-2.5-flash-image, 예시)

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request.json
```

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "[IMG-HERO-01] EN: Edit the provided smartphone apple photo into a clean studio product shot..." }
      ]
    }
  ]
}
```
