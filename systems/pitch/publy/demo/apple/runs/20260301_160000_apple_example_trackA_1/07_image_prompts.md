# Image Prompts — apple_example (Track A / Run1)

원칙:
- 제품 사진이 "아예 없을 때"는 제품을 새로 만들어내지 않습니다.
- 대신 배경/패턴/아이콘 같은 보조 이미지로 빈자리를 채우고, 필요한 촬영은 `08_shot_list.md`로 넘깁니다.

## 1) 제품 사진 보정(핸드폰 사진이 있을 때)

### [IMG-HERO-01] (제품 정면샷 보정)
- KR: "제공된 핸드폰 사과 정면 사진을 스튜디오 제품 사진처럼 보정. 배경은 깨끗한 흰색/연회색 무배경, 자연광 느낌의 부드러운 조명, 과한 광택 제거, 색은 현실적으로 유지, 제품 형태는 절대 바꾸지 말 것."
- EN: "Edit the provided smartphone front photo of a red apple to look like a clean studio product photo. Use a seamless white/light-gray background, soft natural light, clean shadows, remove harsh reflections, keep realistic colors, and do not change the product's shape."

### [IMG-USP-01] (손/사이즈 비교샷 보정)
- KR: "손에 든 사과 사진을 깔끔하게 보정. 피부톤은 자연스럽게, 배경 잡동사니 제거, 초점은 사과에, 그림자 부드럽게."
- EN: "Clean up a hand-holding-apple photo. Keep natural skin tones, remove background clutter, focus on the apple, and keep soft shadows."

### [IMG-USP-02] (디테일 샷 보정)
- KR: "사과 표면 디테일(질감/색)을 선명하게. 노이즈만 줄이고, 과한 샤픈 금지, 색은 현실적으로."
- EN: "Enhance the apple surface detail (texture and color) with clarity. Reduce noise only, avoid over-sharpening, keep realistic colors."

### [IMG-USP-03] (라벨/포장 문구 사진 보정)
- KR: "포장 라벨 사진을 읽기 쉽게 보정. 흔들림/왜곡 최소화, 글자가 선명하게, 과한 대비 금지."
- EN: "Improve readability of a package label photo. Reduce blur and distortion, keep text sharp, avoid overly high contrast."

### [IMG-PROOF-01] (원산지/표기 라벨 보정)
- KR: "원산지/등급 표기 라벨을 사실 그대로 또렷하게. 텍스트가 읽히게만 보정하고 내용은 바꾸지 말 것."
- EN: "Make the origin/grade label crisp and readable. Only enhance clarity; do not alter the content."

### [IMG-PROOF-02] (구성/중량 증명샷 보정)
- KR: "저울/구성 증명 사진을 깔끔하게. 숫자가 잘 보이게 밝기만 조정하고, 조작 느낌이 나지 않게 자연스럽게."
- EN: "Clean up a scale/composition proof photo. Adjust brightness for readability, keep it natural and not manipulated-looking."

### [IMG-CTA-01] (구성샷 보정)
- KR: "사과 여러 개/박스 구성 사진을 정돈. 배경 정리, 색감 통일, 제품이 잘 보이게."
- EN: "Tidy up a multi-apple or box composition shot. Clean background, unify color grading, make the product clearly visible."

## 2) 보조 이미지(사진이 부족할 때)

### [IMG-USP-03] (아이콘/패턴 보조 이미지)
- KR: "상세페이지용 심플한 라인 아이콘 3개(세척/보관/배송). 단색, 동일한 두께, 배경 투명 느낌."
- EN: "Create 3 simple line icons for a product detail page (wash, storage, shipping). Monochrome, consistent stroke width, transparent-style background."

## 3) API 자동화용 템플릿(gemini-2.5-flash-image, 예시)

주의: 아래는 "형식 예시"입니다. 실제 API 엔드포인트/필드는 제공 서비스 문서를 따르세요.

### curl 예시(텍스트만 넣는 버전)

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request.json
```

### request.json 예시

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "[IMG-HERO-01] EN: Edit the provided smartphone front photo of a red apple to look like a clean studio product photo..."
        }
      ]
    }
  ]
}
```
