# Pencil.dev 디자인 리소스 종합 리포트

## 작성일: 2026-03-21 | 조사 범위: 공식 문서, MCP 도구, 웹 리서치

---

## 핵심 발견

1. **스타일 가이드 시스템이 핵심 자산** — 200+ 태그 조합으로 사실상 무한한 디자인 방향 생성
2. **4개 빌트인 UI 킷** — Shadcn UI, Halo, Lunaris, Nitro
3. **8개 가이드라인 토픽** — landing-page, web-app, mobile-app, slides, design-system, table, code, tailwind
4. **.pen 파일 마켓플레이스는 아직 없음** — 커뮤니티 공유는 Git 기반
5. **Figma 양방향 플러그인 4개+** — .pen ↔ .fig 변환 가능

---

## 1. 빌트인 UI 킷 (4개)

| UI 킷 | 설명 | 특성 |
|--------|------|------|
| **Shadcn UI** | React 컴포넌트 라이브러리 기반 | 가장 많이 사용. 코드 생성 시 shadcn/ui와 1:1 매핑 |
| **Halo** | 모던 디자인 시스템 | 깔끔하고 현대적 |
| **Lunaris** | 디자인 시스템 | 체계적 컴포넌트 구조 (100개 컴포넌트 확인) |
| **Nitro** | 디자인 시스템 | 고성능/고밀도 인터페이스용 |

### 공통 컴포넌트 패턴

- **Button/** — Primary, Secondary, Outline, Ghost, Destructive + Large 변형
- **Input Group/** — Default, Filled
- **Card** — Header/Content/Actions 3슬롯 구조 (Card, Card Image, Card Action, Card Plain)
- **Sidebar** — Header + Content Slot + Footer (Section Title, Item/Active, Item/Default)
- **Table / Data Table** — Header Row + Data Row + Cell + Footer
- **Alert/** — Error, Success, Warning, Info
- **Modal/Dialog** — Left, Center, Center Icon
- **Accordion/** — Open, Closed
- **Tabs** — Active/Inactive Item
- **Dropdown** — Search, Divider, Title, List Item
- **Pagination** — Active/Default/Ellipsis Item
- **Breadcrumbs** — Default/Active/Separator/Ellipsis
- **Label/** — Success, Orange, Violet, Secondary
- **Icon Label/** — Secondary, Success, Violet, Orange
- **Avatar/** — Text, Image
- **Checkbox/** — Default, Checked, Description 변형
- **Radio/** — Default, Selected, Description 변형
- **Switch/** — Default, Checked
- **Progress** — 진행 표시줄
- **Tooltip** — 툴팁
- **Search Box/** — Default, Filled
- **Textarea/** — Default, Filled

### 아이콘 세트 (5종)

| 폰트 | 스타일 |
|------|--------|
| **Lucide** | 아웃라인, 라운드 |
| **Feather** | 아웃라인 |
| **Material Symbols Outlined** | 아웃라인 |
| **Material Symbols Rounded** | 라운드 |
| **Material Symbols Sharp** | 샤프 |
| **Phosphor** | 다양한 |

---

## 2. 스타일 가이드 시스템 (Style Guide)

### 작동 원리

1. `get_style_guide_tags` → **200+ 태그** 반환
2. 태그 5~10개 조합 → `get_style_guide` 호출
3. **완전한 스타일 사양서** 반환 (색상 HEX, 타이포, 간격, 반경, 아이콘까지)

### 태그 카테고리 (200+)

**미학/분위기:** constructivist, brutalist, minimal, pastel, noir, neon, luxury, elegant, cozy, zen, bauhaus, scandinavian, japanese, industrial, urban, organic, classical, modern, playful, austere

**색상 계열:** monochrome, vibrant, colorful, dual-tone, dark-mode, light-mode, earth-tones, warm-tones, cream, champagne, ivory, parchment

**악센트 색상:** lime-accent, gold-accent, orange-accent, red-accent, blue-accent, cyan-accent, green-accent, navy-accent, yellow-accent, burgundy-accent, sage-accent, purple

**타이포그래피:** serif, monospace, condensed, bold-typography, italic, uppercase, serif-display, dual-font, single-font, typography-only

**구조/레이아웃:** bento-grid, sidebar, icon-sidebar, dark-sidebar, floating-nav, icon-nav, icon-rail, numbered-nav, flush-layout, sharp-corners, soft-corners, rounded

**용도:** webapp, mobile, dashboard, data-dashboard, devtools, terminal, fintech, editorial, magazine, poster, slides

**느낌:** professional, premium, high-end, corporate, enterprise, friendly, approachable, high-contrast, functional, rational, technical

### 스타일 가이드에 포함되는 내용

1. **Style Summary** — 설명, 핵심 미학, 태그
2. **Color System** — Core Backgrounds, Text Colors, Accent Colors, Border Colors (전부 HEX)
3. **Typography** — Font Families, Type Scale (px), Font Weights, Letter Spacing, Line Height
4. **Spacing System** — Gap Scale, Padding Scale, Layout Pattern (구체적 수치)
5. **Corner Radius** — 요소별 라운드 값
6. **Icons** — 아이콘 세트, 아이콘 이름, 크기, 색상

### 스타일 가이드 이름 패턴

- `webapp-01-japaneseswiss_light`
- `webapp-03-monochrometype_light`
- `mobile-01-minimalplayful_light`
- `mobile-02-brutalistluxury_light`

---

## 3. 가이드라인 시스템 (8개 토픽)

| 토픽 | 내용 | 분량 |
|------|------|------|
| **landing-page** | 전환율 최적화. Hero~Footer 10개 섹션. 슈퍼팬 시뮬레이션 | ~500줄 |
| **web-app** | 기능적 웹앱 UI. 16개 핵심 원칙 (Purpose First, Progressive Disclosure 등) | ~200줄 |
| **mobile-app** | 모바일 최적화. Status Bar 62px, Tab Bar 3~5탭, 원핸드 최적화 | ~300줄 |
| **slides** | 프레젠테이션. 20개 레이아웃, 1920×1080, 최소 28px | ~300줄 |
| **design-system** | 컴포넌트 조합. 슬롯, Sidebar/Card/Tab/Table 패턴, 디자인 토큰 | ~500줄 |
| **table** | 테이블 구조. Header Row + Data Row + Cell | ~50줄 |
| **code** | 디자인→코드 5단계 변환 워크플로 | ~400줄 |
| **tailwind** | Tailwind v4 전용 구현. CSS 변수, fill_container 변환 | ~400줄 |

### 핵심 하이라이트

**landing-page** — "사람들은 제품을 사지 않는다. 더 나은 버전의 자신을 산다." Transformation > Outcome > Benefit > Feature 헤드라인 위계.

**web-app** — "한 화면에 하나의 주요 목적." 밀도는 의도적 (Compact/Medium/Airy).

**mobile-app** — 주요 액션 하단 배치. Tab Bar 최대 5개.

**slides** — 슬라이드당 하나의 아이디어. 20개 레이아웃 계약.

---

## 4. 프롬프트 갤러리 (12개)

### 생성형

| 프롬프트 | 유형 |
|---------|------|
| "Design a web app for managing rocket launches. Technical style." | 웹앱 |
| "Design a website for a specialty cafe in San Francisco." | 웹사이트 |
| "Design a mobile app for tracking music royalties. Scandinavian." | 모바일 |

### 반복/수정형

| 프롬프트 | 작업 |
|---------|------|
| "Explore a totally different design direction." | 방향 전환 |
| "Explore a different layout, keep the design direction." | 레이아웃 변형 |
| "Change it to light mode." | 테마 전환 |
| "Let's go more bold and rock'n'roll." | 스타일 강화 |
| "Change fonts to something more classy." | 폰트 정제 |
| "Now use a sidenav." | 네비게이션 변경 |
| "Change to a simpler and cleaner design direction." | 단순화 |

---

## 5. 레이아웃 패턴 (4개 핵심)

| 패턴 | 구조 | 용도 |
|------|------|------|
| **A: Sidebar + Content** | 280px 사이드바 + fill 메인 | 대시보드 |
| **B: Header + Content** | 64px 헤더 + 스크롤 콘텐츠 | 일반 웹앱 |
| **C: Two-Column** | 메인(2/3) + 사이드(1/3) | 상세 페이지 |
| **D: Card Grid** | 수평 카드 배열 | 개요/갤러리 |

---

## 6. Figma 통합

### 플러그인

| 플러그인 | 방향 | 비고 |
|---------|------|------|
| Pencil.dev .pen file import | Figma → Pencil | 공식 |
| Pencil to Figma PRO | Pencil → Figma | 유료 |
| Pencil PEN Importer | .pen → Figma | 자동 변환 |
| Pencil to Figma (무료) | Pencil → Figma | 무료 |

### 제한사항

- Figma 이미지는 전송 안 됨 → SVG로 내보내기
- 1단계 프레임만 정상 임포트 → 중첩 시 플래튼
- 복사/붙여넣기로 벡터, 텍스트, 스타일 보존 가능

---

## 7. 디자인 토큰

### 색상

- Core: `$--background`, `$--foreground`, `$--card`, `$--border`
- 브랜드: `$--primary`, `$--secondary`, `$--destructive`
- 시맨틱: `$--color-success`, `$--color-warning`, `$--color-error`, `$--color-info`

### 타이포

- `$--font-primary` (헤딩, 레이블)
- `$--font-secondary` (본문, 설명)

### 반경

- `$--radius-none`, `$--radius-m`, `$--radius-pill`

---

## 8. 요약 매트릭스

| 리소스 | 수량 | 접근 방법 |
|--------|------|----------|
| 빌트인 UI 킷 | **4개** | Libraries 패널 |
| 스타일 가이드 태그 | **200+** | `get_style_guide_tags` MCP |
| 스타일 가이드 조합 | **무한** (태그 조합 생성) | `get_style_guide` MCP |
| 가이드라인 토픽 | **8개** | `get_guidelines` MCP |
| 프롬프트 갤러리 | **12개** | pencil.dev/prompts |
| 아이콘 세트 | **5~6종** | icon_font 타입 |
| 레이아웃 패턴 | **4개 핵심** + 슬라이드 20개 | 가이드라인 내 |
| Figma 플러그인 | **4+** (양방향) | Figma Community |
| 컴포넌트 (Lunaris 기준) | **100개** | batch_get reusable |
| .pen 마켓플레이스 | **없음** | Git 기반 공유 |
