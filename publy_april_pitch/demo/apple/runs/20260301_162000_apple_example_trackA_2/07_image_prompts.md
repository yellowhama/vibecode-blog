# Image Prompts — apple_example_r2 (Track A / Run2)

원칙:
- 제품이 없는데 제품 사진을 새로 만들지 않습니다.
- "당도" 같은 수치는 이미지에 박아넣지 않습니다(근거 없으면 위험).

## 1) 제품 사진 보정(핸드폰 사진이 있을 때)

### [IMG-HERO-01] (박스/구성 정면샷 보정)
- KR: "박스와 사과 구성 사진을 스튜디오 느낌으로 보정. 배경 정리, 자연광 느낌, 색은 현실적으로, 과한 광택 제거. 제품/개수를 바꾸지 말 것."
- EN: "Polish the box-and-apples composition photo into a clean studio look. Remove background clutter, use soft natural light, keep realistic colors, remove harsh reflections. Do not change the product or the count."

### [IMG-USP-01] (사이즈 비교샷 보정)
- KR: "손+자/동전이 보이는 사이즈 비교 사진을 깔끔하게. 초점은 사과에, 기준 물체는 읽히게."
- EN: "Clean up a size-comparison shot with a hand and a ruler/coin. Focus on the apple; keep the reference object readable."

### [IMG-USP-02] (단면 디테일 보정)
- KR: "사과 단면 사진을 자연스럽게 보정. 색/수분감은 과장하지 말고, 노이즈만 줄이기."
- EN: "Enhance a cut-open apple photo naturally. Do not exaggerate color or juiciness; only reduce noise."

### [IMG-PROOF-01] (라벨 사진 보정)
- KR: "원산지/등급 라벨 사진을 읽기 쉽게. 내용은 절대 바꾸지 말고 선명도만 개선."
- EN: "Make the origin/grade label photo readable. Do not alter the content; only improve clarity."

### [IMG-PROOF-02] (당도 측정 사진 보정)
- KR: "당도계 화면이 잘 보이게 밝기/선명도만 조정. 조작 느낌이 나지 않게 자연스럽게."
- EN: "Adjust brightness and sharpness so the brix meter screen is readable. Keep it natural, not manipulated-looking."

### [IMG-CTA-01] (10과 구성샷 보정)
- KR: "사과 10개 구성 사진을 정돈. 위에서 찍은 구도, 간격 정렬, 배경 단순하게."
- EN: "Tidy up a 10-apple composition photo. Top-down view, evenly spaced, minimal background."

## 2) 보조 이미지(사진이 부족할 때)

### [IMG-USP-02] (배경 패턴)
- KR: "부드러운 뉴트럴 톤 배경 패턴. 아주 약한 격자/점 패턴, 저대비, 텍스트 가독성 방해 금지."
- EN: "Create a soft neutral background pattern. Very subtle grid/dots, low contrast, must not hurt text readability."

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
        { "text": "[IMG-PROOF-01] EN: Make the origin/grade label photo readable..." }
      ]
    }
  ]
}
```
