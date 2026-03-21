# 스타일 프리셋 카탈로그

> 태그 조합 하나로 디자인 방향이 결정된다.
> Pencil `get_style_guide(tags)`에 넘기면 컬러, 폰트, 간격, 반경까지 전부 나온다.

---

## 프리셋 5종

### 1. `fresh-organic` — 따뜻하고 자연스러운

| 항목 | 값 |
|------|---|
| **태그** | `japanese`, `minimal`, `cream`, `organic`, `warm`, `soft-corners` |
| **용도** | 식품, 뷰티, 라이프스타일, 건강식품 |
| **느낌** | 따뜻한 크림색 + 자연 그린. 부드러운 곡선. |
| **폰트 계열** | Outfit, Noto Sans KR (둥글고 친근한) |
| **컬러 방향** | 배경: 크림 #FBF8F4 / 텍스트: 다크 #2D2D2D / 악센트: 올리브 #4A7C59 / 포인트: 테라코타 #C26A5A |
| **코너** | 12~16px (부드러운 곡선) |
| **참고 스타일 가이드** | `mobile-02-cleanminimal_light` |

### 2. `tech-clean` — 깔끔하고 신뢰감

| 항목 | 값 |
|------|---|
| **태그** | `modern`, `clean`, `blue-accent`, `whitespace`, `webapp`, `sharp-corners` |
| **용도** | IT, SaaS, 전자제품, 테크 액세서리 |
| **느낌** | 흰색 + 블루 악센트. 넓은 여백. 직선적. |
| **폰트 계열** | Inter, Pretendard (깔끔한 산세리프) |
| **컬러 방향** | 배경: 흰색 #FFFFFF / 텍스트: 다크 #1A1A2E / 악센트: 블루 #3B82F6 / 보조: 그레이 #6B7280 |
| **코너** | 4~8px (직선적) |
| **참고 스타일 가이드** | — (커스텀 조합) |

### 3. `luxury-dark` — 고급스러운

| 항목 | 값 |
|------|---|
| **태그** | `luxury`, `dark-mode`, `gold-accent`, `serif`, `elegant`, `premium` |
| **용도** | 프리미엄, 명품, 고가 식품, 와인, 주얼리 |
| **느낌** | 검정 + 골드. 세리프 헤드라인. 무게감. |
| **폰트 계열** | Cormorant Garamond (헤드), Inter (본문) |
| **컬러 방향** | 배경: 다크 #0D0D0D / 텍스트: 크림 #F5F0E8 / 악센트: 골드 #C9A962 / 보조: 그레이 #8A8A8A |
| **코너** | 0~4px (직선적, 고급) |
| **참고 스타일 가이드** | `webapp-03-elegantluxury_light` |

### 4. `bold-energy` — 에너지 넘치는

| 항목 | 값 |
|------|---|
| **태그** | `bold`, `neon`, `dark-mode`, `electric`, `vibrant`, `rounded` |
| **용도** | 피트니스, 게임, 스트리트웨어, 스포츠 |
| **느낌** | 다크 + 네온 악센트. 볼드 타이포. 글로우. |
| **폰트 계열** | Space Grotesk (헤드), Inter (본문) |
| **컬러 방향** | 배경: 다크 #0D0D0D / 텍스트: 흰색 #FFFFFF / 악센트: 라임 #C4F82A / 보조: 시안 #06B6D4 |
| **코너** | 12~20px (둥글고 역동적) |
| **참고 스타일 가이드** | `mobile-03-darkbold_light` |

### 5. `scandi-calm` — 부드럽고 안정적인

| 항목 | 값 |
|------|---|
| **태그** | `scandinavian`, `pastel`, `calm`, `soft-corners`, `friendly`, `organic` |
| **용도** | 웰니스, 키즈, 홈 인테리어, 문구 |
| **느낌** | 파스텔 + 둥근 곡선. 편안하고 안정적. |
| **폰트 계열** | Outfit, DM Sans (부드러운 산세리프) |
| **컬러 방향** | 배경: 라이트 #F8F6F3 / 텍스트: 다크 #3D3D3D / 악센트: 세이지 #7FA87F / 포인트: 피치 #F4A896 |
| **코너** | 16~24px (매우 부드러운) |
| **참고 스타일 가이드** | `mobile-02-cleanminimal_light` |

---

## 사용법

### SSOT (제품 정보 한 장)에 추가할 필드

```yaml
# ssot.yaml에 추가
style_preset: fresh-organic   # 프리셋 이름
page_type: landing-page       # landing-page | web-app | mobile-app
```

### 자동 분기 흐름

```
1. ssot.yaml의 style_preset 읽기
2. 프리셋 → 태그 매핑 (이 카탈로그 참조)
3. get_style_guide(tags) → 사양서 수신
4. set_variables → .pen 파일에 디자인 토큰 적용
5. get_guidelines(page_type) → 섹션 구조 규칙 수신
6. batch_design → 규칙 + 토큰 기반으로 빌드
```

### 커스텀 프리셋 만들기

프리셋 5개로 부족하면? 태그를 직접 조합한다.

```yaml
# 커스텀 예시: 일본식 미니멀 카페
style_tags: ["japanese", "zen", "cream", "monochrome", "serif", "soft-corners"]
page_type: landing-page
```

`get_style_guide_tags`로 200+ 태그 전체 목록을 조회하고, 5~10개를 골라 조합하면 된다.

---

## 프리셋 선택 가이드

| 제품 | 추천 프리셋 | 이유 |
|------|-----------|------|
| 사과, 과일, 건강식품 | `fresh-organic` | 따뜻하고 자연스러운 느낌이 식품과 맞음 |
| 노트북, 이어폰, SaaS | `tech-clean` | 깔끔하고 신뢰감이 전자제품/IT와 맞음 |
| 와인, 주얼리, 선물세트 | `luxury-dark` | 고급스러움이 프리미엄 가격대와 맞음 |
| 운동기구, 게임패드 | `bold-energy` | 에너지와 역동성이 액티브 제품과 맞음 |
| 아로마, 키즈 식기, 인테리어 | `scandi-calm` | 부드러움이 웰니스/홈 카테고리와 맞음 |
