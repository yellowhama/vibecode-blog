# v3 고도화 종합 리서치 리포트

## 작성일: 2026-03-21 | 범위: 퍼블리 트렌드, AI 기본법, Pencil 고급 워크플로우, 해외 사례

---

## 1. 퍼블리 트렌드 & 경쟁 콘텐츠

### 퍼블리 플랫폼 현황 (2026 Q1)

- **주 독자층**: 마케터, 기획자, PM, 1인 사업자 (25~45세)
- **인기 콘텐츠 유형**: "~하는 법" 실무 가이드 > 케이스 스터디 > 인사이트 에세이
- **최근 AI 관련 인기글**: 프롬프트 엔지니어링, AI 마케팅 도구 리뷰, 자동화 워크플로우
- **경쟁 대비 차별점 필요**: 대부분 "ChatGPT로 카피 쓰기" 수준 → **시스템/공장** 관점은 희소

### 경쟁 콘텐츠 분석

| 유형 | 내용 | 한계 |
|------|------|------|
| "AI로 상세페이지 만들기" 류 | ChatGPT/Claude에 프롬프트 → 카피 출력 | 1회성, 재현 불가 |
| "Canva로 상세페이지" 류 | 템플릿 선택 → 수동 편집 | 자동화 없음, 매번 수동 |
| "에디봇/망고보드" 류 | 사진 → AI 페이지 자동 생성 | 커스터마이징 제한, 공장 아님 |
| **이 글 (v3)** | **재료 → 기획 → 조립 → 검수 자동 파이프라인** | **스타일 분기까지 자동** |

### 핵심 포지셔닝

> "도구 소개가 아니라 **시스템 설계도**를 준다."
> "1회용 결과물이 아니라 **반복 가능한 공장**을 세운다."
> "카피만이 아니라 **디자인까지** 자동으로 나온다."

---

## 2. AI 기본법 최신 집행 동향 (2026.01.22 시행 이후)

### 시행 2개월 현황

- **계도기간**: 시행 후 6개월 (2026.07.21까지) — 즉시 과태료 아님, 시정명령 우선
- **과학기술정보통신부 가이드라인**: "AI 생성물 표시 지침" 발표 (2026.02)
  - 텍스트: 본문 하단 또는 콘텐츠 시작부에 "AI로 생성된 콘텐츠 포함" 명시
  - 이미지: 워터마크 또는 캡션으로 "AI 생성 이미지" 표시
  - 위치: 소비자가 인지 가능한 곳 (hidden metadata만으로는 부족)
- **현실적 대응**: 대기업은 이미 표시 시스템 구축, 중소·1인 셀러는 아직 미비

### 표시광고법 강화 동향

- 공정거래위원회: AI 생성 광고에 대한 **사업자 책임 강조** (2026.01 보도자료)
- "AI가 만들었든 사람이 만들었든, 허위·과장 광고 책임은 사업자에게"
- 징벌적 손해배상 (손해액 5배) 조항은 악의적 허위·조작에 한정

### v3 글에 반영할 포인트

1. 계도기간이라도 **시스템은 미리 세워야** — "나중에"는 없다
2. AI 생성 표시는 **자동화 가능** — 공장의 검수 단계에 포함
3. 1인 셀러도 예외 아님 — "몰랐다"는 항변 불가

---

## 3. Pencil 스타일 가이드 시스템 완전 분석

### 아키텍처

```
[사용자 입력]                    [Pencil 시스템]
   │                                │
   ├─ style_tags: 5~10개 ──────► get_style_guide(tags)
   │                                │
   │                          ┌─────┴─────┐
   │                          │ 사양서 반환 │
   │                          └─────┬─────┘
   │                                │
   │   ┌────────────────────────────┤
   │   │ 1. Color System (HEX)     │
   │   │ 2. Typography (font/size) │
   │   │ 3. Spacing (gap/padding)  │
   │   │ 4. Corner Radius          │
   │   │ 5. Icons (set/size)       │
   │   └────────────────────────────┘
   │                                │
   ├─ set_variables(tokens) ◄───────┘
   │
   └─ batch_design(components)
```

### 검증된 스타일 가이드 5개 (실제 호출 결과)

| 이름 | 태그 | 컬러 | 폰트 | 느낌 |
|------|------|------|------|------|
| `webapp-01-monochrometype_light` | editorial, monochrome, typography | #FAFAFA/#1A1A1A | Instrument Serif + Inter | 흑백 에디토리얼 |
| `mobile-02-swissexpressive_light` | swiss, bold, dark-mode, red | #0A0A0A/#FF3B30 | Sora Bold | 피트니스 앱 |
| `webapp-03-elegantluxury_light` | luxury, gold, dark-mode, serif | #0D0D0D/#C9A962 | Cormorant Garamond + Inter | 럭셔리 골드 |
| `mobile-02-cleanminimal_light` | scandinavian, clean, pastel, organic | #FBF8F4/#4A7C59 | Outfit | 스칸디 웰니스 |
| `mobile-03-darkbold_light` | neon, dark-mode, bold, electric | #0D0D0D/#C4F82A | Space Grotesk | 네온 에너지 |

### `get_style_guide_tags` 버그 해결 (#31855)

- **이전**: 호출 시 빈 배열 또는 에러 반환 → "호출 금지" 권고
- **현재**: 정상 작동 → 200+ 태그 전체 조회 가능
- **의미**: 태그 기반 자동 분기 파이프라인이 실현 가능해짐

### 태그 조합 전략

| 목적 | 필수 태그 | 선택 태그 | 결과 |
|------|----------|----------|------|
| 따뜻한 식품 | cream, organic, warm | japanese, minimal, soft-corners | 자연스러운 내추럴 |
| 깔끔한 IT | modern, clean, whitespace | blue-accent, sharp-corners, webapp | 신뢰감 클린 |
| 고급 프리미엄 | luxury, dark-mode, serif | gold-accent, elegant, premium | 럭셔리 다크 |
| 에너지 넘치는 | bold, neon, dark-mode | electric, vibrant, rounded | 네온 에너지 |
| 부드러운 웰니스 | scandinavian, pastel, calm | soft-corners, friendly, organic | 스칸디 캄 |

---

## 4. landing-page 가이드라인 핵심 요약

### Hero 섹션 (가장 중요)

- **원칙**: 전체 제품을 한 화면에 압축. 하나의 아이디어만.
- **헤드라인 위계**: Transformation > Outcome > Benefit > Feature
  - Best: "산지의 아침을 식탁에" (Transformation)
  - Good: "세척 없이 바로 한 입" (Outcome)
  - OK: "경북 부사 사과 2kg" (Feature)
- **비주얼**: Hero 이미지 = 변신 이미지 > 사용 맥락 > 제품 환경 > 고립된 제품

### 섹션 흐름 (권장 순서)

```
Hero → Benefits → How It Works → Social Proof → Features → Pricing → FAQ → CTA → Footer
```

- 상세페이지용 축약: **Hero → USP → Proof → FAQ → CTA** (5섹션)

### AI 이미지 규칙

- "배경 fill로 쓰지 말고 별도 프레임에"
- 이미지 의도 위계: 변신 이미지 > 사용 맥락 > 제품 환경 > 고립된 제품

### Anti-slop 규칙

- 매번 다른 폰트, 다른 레이아웃 — 금지 (일관성 유지)
- flat 배경 — 금지 (depth 필요)
- 스톡 사진 느낌 — 최소화

---

## 5. 해외 제품 페이지 자동화 사례

### Shopify + AI

- **Shopify Magic (2025~)**: 상품 설명 자동 생성, SEO 메타데이터 자동
- **한계**: 텍스트만. 디자인/레이아웃 자동화 없음. 스타일 분기 없음.

### Amazon A+ Content

- **A+ Content Manager**: 모듈식 상세페이지 빌더
- **패턴**: 미리 정의된 모듈 12종 → 조합 → 상세페이지
- **유사점**: "모듈 조합 = 공장" 개념 — 이 글의 "섹션 프레임" 접근과 동일
- **차이점**: 수동 조합 vs. AI 자동 조립

### Webflow + AI (Jasper, Copy.ai)

- **패턴**: AI가 카피 생성 → 사람이 Webflow에서 수동 배치
- **한계**: 카피↔디자인 분리. 파이프라인 없음.

### 이 글의 차별점

| 기존 접근 | 이 글의 공장 |
|-----------|-------------|
| AI = 카피 생성기 | AI = 시스템 빌더 |
| 텍스트만 자동 | 텍스트 + 디자인 + 검수 자동 |
| 1회성 결과 | 반복 가능한 파이프라인 |
| 스타일 = 수동 선택 | 스타일 = 태그로 자동 분기 |

---

## 6. Claude Code + Pencil 고급 워크플로우

### MCP 기반 자동화 파이프라인

```
Claude Code (오케스트레이터)
    │
    ├── 기획실 (텍스트 생성)
    │   ├── ssot.yaml 읽기
    │   ├── 11개 기획 파일 생성
    │   └── 검수 리포트 자동 생성
    │
    ├── 스타일 분기 (NEW in v3)
    │   ├── style_tags 읽기
    │   ├── get_style_guide(tags) → 사양서
    │   ├── get_guidelines(page_type) → 구조 규칙
    │   └── set_variables → 디자인 토큰 적용
    │
    └── 조립라인 (Pencil MCP)
        ├── batch_design → 프레임/텍스트/색 생성
        ├── G() 오퍼레이션 → AI 이미지 생성
        └── get_screenshot → 결과 캡처
```

### 핵심 MCP 도구 체인

| 순서 | 도구 | 역할 |
|------|------|------|
| 1 | `get_style_guide_tags` | 사용 가능한 태그 전체 조회 |
| 2 | `get_style_guide(tags)` | 태그 → 완전한 디자인 사양서 |
| 3 | `get_guidelines("landing-page")` | 페이지 유형별 구조 규칙 |
| 4 | `set_variables` | .pen 파일에 디자인 토큰 적용 |
| 5 | `batch_design` | 프레임 생성/수정/삭제 |
| 6 | `get_screenshot` | 결과물 시각 확인 |

### set_variables 활용 패턴

스타일 가이드에서 받은 Color System을 .pen의 변수로 매핑:

```
스타일 가이드 Color System → set_variables 매핑
───────────────────────────────────────────
Core Background    → $--background
Surface           → $--card
Text              → $--foreground
Muted Text        → $--muted-foreground
Accent            → $--primary
Border            → $--border
```

---

## 7. v2 → v3 개선 매트릭스

| 영역 | v2 상태 | v3 개선 |
|------|---------|---------|
| §2 공장이 필요하다 | 상세페이지 한정 | Apple.com/SaaS 확장 증명 |
| §9 조립라인 | 수동 빌드 설명 | 스타일 가이드 자동 분기 시연 |
| §11 단계 | 8단계 | 9단계 (스타일 선택 추가) |
| 디자인 증거 | 3 변형 (수동) | + 3 자동 분기 (E/F/G) |
| 부록 | A~G | + H (스타일 프리셋 카탈로그) |
| Pencil 설명 | "AI가 조작한다" | 3가지 이유 명시 (AI네이티브/스타일가이드/하이브리드) |
| 워크플로우 | 수동 컬러 선택 | 태그 기반 자동 결정 |

---

## 8. 핵심 인용/문구 (v3 삽입용)

### §2 강화용
> "사과 상세페이지에만 쓸 수 있는 공장은 공장이 아니다.
> Apple.com도 같은 구조다. SaaS 랜딩 페이지도 같은 구조다.
> 재료(카피)는 같고, 뼈대(템플릿)만 다르다. 이게 공장이다."

### §9 강화용
> "Pencil에 200가지 디자인 방향이 내장돼 있다.
> 태그 5개면 컬러부터 폰트, 간격까지 전부 나온다.
> 같은 사과 카피에 태그만 바꿨다. 3가지 전혀 다른 페이지가 나왔다."

### 핵심 한 줄
> "매뉴얼 하나 바꾸면 분위기가 바뀐다. 공장은 그대로다."

---

## 9. 결론

v3 고도화의 핵심은 **"자동 분기"**다.

v2: "같은 카피, 다른 컬러 → 수동 변형 3개"
v3: "같은 카피, 다른 태그 → 자동 분기 3개 + 기존 3개"

증거가 3개에서 6개로 늘고, 자동화 수준이 한 단계 올라간다.
퍼블리 독자에게 "따라 할 수 있다"는 확신을 주는 결정적 차이.
