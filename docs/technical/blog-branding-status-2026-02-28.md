# vibecode.town 블로그 브랜딩 현황

> Date: 2026-02-28
> Context: MUSU V2 브랜딩 기반 형제 브랜드, 이름/아이콘만 분리

---

## 1. 브랜드 관계

```
MUSU (musu.pro)          vibecode (vibecode.town)
━━━━━━━━━━━━━━           ━━━━━━━━━━━━━━━━━━━━━
제품 브랜드                미디어/교육 브랜드
AI Runtime 판매            블로그 + 뉴스레터
"Chief of Staff"          "AI-native dev insights"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ↓ 공유 ↓                ↓ 분리 ↓
  컬러, 폰트, 질감           이름, 아이콘, 톤
```

**원칙:** 처음에는 비슷하게 간다. 색상/폰트/스타일은 MUSU V2 그대로. 이름과 아이콘만 다르게.

---

## 2. MUSU V2 브랜딩 (소스: `design_work/branding/`)

### 2.1 3색 팔레트 — 예외 없음

| # | 이름 | HEX | 역할 |
|---|------|-----|------|
| ① | **Cocoa Brown** | `#2D1D19` | Primary Dark — 텍스트, 다크 배경, 테두리 |
| ② | **Musu Yellow** | `#FFD166` | Primary Accent — CTA, 강조, 브랜드 포인트 |
| ③ | **Off-White** | `#FDFCF0` | Secondary — 라이트 배경, 캔버스 |

파생값:
- bg-secondary: `#F8F7E8`
- bg-tertiary: `#F0EFE0`
- bg-elevated: `#FFFFFF` (유일한 순수 흰색 허용)
- text-secondary: `rgba(45, 29, 25, 0.7)`
- text-muted: `rgba(45, 29, 25, 0.5)`
- border-muted: `rgba(44, 26, 22, 0.2)`
- accent-dim: `#E1B655`
- accent-glow: `rgba(255, 209, 102, 0.3)`

### 2.2 금지 색상

| 색상 | 이유 |
|------|------|
| `#000000` (순수 검정) | Cocoa Brown `#2D1D19` 사용 |
| `#FFFFFF` (순수 흰색) | Off-White `#FDFCF0` 사용 (elevated 예외) |
| `#3B82F6` (Electric Blue) | **V1 폐기** |
| `#118AB2` (Crew Blue) | **V1 폐기** |
| `#F4A261` (Wood Orange) | **V1 폐기** |
| `#06D6A0` (Done Green) | **V1 폐기** |
| `#EF476F` (Oops Red) | **V1 폐기** |
| `#0E1117` (Deep Graphite) | **V1 폐기** |

### 2.3 폰트

| 용도 | 폰트 | Weight |
|------|------|--------|
| Display / Headlines | **Nunito** | 700, 800, 900 |
| Body / UI | **Nunito** | 400, 600 |
| Code / Mono | **JetBrains Mono** | 400 |
| Logo 한자 (無數) | **Noto Sans SC** | 900 (로고 전용) |

금지 폰트: Inter, Roboto, Space Grotesk, Comic Mono, Pretendard

### 2.4 스타일

- **Soft Neobrutalism** — 굵은 테두리(3px solid) + 오프셋 그림자 + 따뜻한 색감
- **Claymorphism** — inner shadow로 찰흙처럼 푹신한 입체감
- Border radius: 카드 24px, 버튼 pill(9999px), 입력 12px
- Shadow: `4px 4px 0px rgba(45, 29, 25, 1)` (blur 0 — 단단한 오프셋)
- 60-30-10: Off-White 60% / Cocoa Brown 30% / Yellow 10%

### 2.5 보이스 & 톤

| 채널 | 보이스 | 설명 |
|------|--------|------|
| musu.pro 웹사이트 | "Sassy English" | 건방지지만 매력적, 직설, 자신감 |
| 데스크톱 앱 | "프라임 실장님" | 피곤한 베테랑 비서실장, 친근한 경어체 |
| 기술 문서 | 중립 영어 | 정확한 기술 설명 |

---

## 3. 현재 블로그 적용 상태

### 3.1 적용 완료 (코드에 반영됨)

| 항목 | 값 | 파일 |
|------|---|------|
| Light 배경 | `#FDFCF0` (Off-White) | `src/styles/global.css` |
| Light 텍스트 | `#2D1D19` (Cocoa Brown) | `src/styles/global.css` |
| Light 액센트 | `#FFD166` (Musu Yellow) | `src/styles/global.css` |
| Light muted | `#F0EFE0` (bg-tertiary) | `src/styles/global.css` |
| Light border | `rgba(44, 26, 22, 0.2)` | `src/styles/global.css` |
| Dark 배경 | `#2D1D19` (Cocoa Brown) | `src/styles/global.css` |
| Dark 텍스트 | `#F8F7E8` (bg-secondary) | `src/styles/global.css` |
| Dark 액센트 | `#FFD166` (Musu Yellow) | `src/styles/global.css` |
| Dark muted | `rgba(255, 255, 255, 0.05)` | `src/styles/global.css` |
| Dark border | `rgba(255, 209, 102, 0.2)` | `src/styles/global.css` |
| 본문 폰트 | Nunito (400-900) | `astro.config.ts` |
| OG 이미지 폰트 | Nunito (400, 700) | `src/utils/loadGoogleFont.ts` |
| 사이트 이름 | "vibecode" | `src/config.ts` |
| 도메인 | vibecode.town | `src/config.ts` |
| 저자 | Hama | `src/config.ts` |
| 타임존 | Asia/Seoul | `src/config.ts` |
| 소셜 | GitHub + X (@yellowhama) | `src/constants.ts` |

### 3.2 미적용 / 미결정

| 항목 | 상태 | 비고 |
|------|------|------|
| **파비콘** | AstroPaper 기본 | vibecode 전용 아이콘 필요 |
| **로고** | 없음 | 텍스트만 → 나중에 제작 |
| **코드 폰트 (JetBrains Mono)** | Astro 기본 shiki 코드 블록 사용 중 | 별도 웹폰트 로드 미설정 |
| **한국어 폰트** | 미결정 | 한국어 글 쓸 경우 필요 |
| **블로그 문체 (한국어)** | **아예 없음** | MUSU의 "프라임 실장님"은 앱용 — 블로그용 별도 가이드 필요 |
| **블로그 문체 (영어)** | 리서치만 | Bukowski+PG+Bourdain 가이드 (`blog-research/08`) |
| **콘텐츠 언어** | 미결정 | 영어? 한국어? 병행? |
| **태그/카테고리 체계** | 미결정 | 현재 `meta` 1개만 |
| **글 시리즈 구조** | 미결정 | "Vibe Coding 110" 같은 시리즈? |
| **다크모드 기본** | 리서치 추천: Dark-first | 현재 시스템 설정 따름 |
| **댓글 (Giscus)** | 리서치 추천만 | 미구현 |
| **뉴스레터 (Buttondown)** | 리서치 추천만 | 미구현 |
| **Neobrutalism 스타일** | 미적용 | AstroPaper 기본 미니멀 스타일 유지 중 — 3px border, clay shadow 등 미반영 |
| **OG 이미지 디자인** | AstroPaper 기본 템플릿 | MUSU 스타일로 커스터마이징 필요 |

---

## 4. 블로그 리서치 문서 (blog-research/)

| 파일 | 내용 | 결정 상태 |
|------|------|----------|
| `07-visual-branding.md` | "Neon Terminal Garden" 팔레트, Space Grotesk 폰트 | **폐기** — MUSU V2 3색으로 대체 |
| `08-english-voice-guide.md` | 영어 문체 가이드 (Bukowski+PG+Bourdain) | **유효** — 블로그 영어 글에 적용 가능 |
| `09-decisions.md` | 7가지 기술 결정 비교 | **부분 폐기** — 컬러/폰트 결정은 MUSU V2로 대체, 댓글/뉴스레터/로고 결정은 유효 |

### 07-visual-branding.md 폐기 사항

| 추천 | 상태 | 이유 |
|------|------|------|
| "Neon Terminal Garden" 팔레트 | 폐기 | MUSU V2 3색 팔레트 사용 |
| Coral `#FF6E6E` + Violet `#7C3AED` + Mint `#06D6A0` | 폐기 | 3색 외 금지 |
| Space Grotesk + Inter | 폐기 | Nunito + JetBrains Mono 사용 |
| Dark-first 기본 | 검토 필요 | MUSU는 Light-first (Off-White 60%) |
| musu.pro ↔ vibecode 분리 매트릭스 | **수정** | 형제 브랜드로 통일, 이름/아이콘만 분리 |

### 09-decisions.md 유효 사항

| # | 항목 | 결정 |
|---|------|------|
| 5 | 댓글 | Giscus 추천 — 유효 |
| 6 | 뉴스레터 | Buttondown → Beehiiv — 유효 |
| 7 | 로고 | 텍스트만 → 나중에 제작 — 유효 |

---

## 5. 다음 결정 필요

### 즉시 (글 쓰기 전)

1. **콘텐츠 언어** — 영어? 한국어? 병행?
2. **한국어 말투** — MUSU "프라임 실장님"은 앱용. 블로그용 톤은?
3. **태그 체계** — 어떤 태그들을 쓸 건지

### 곧 (첫 5개 글 이후)

4. **파비콘** — vibecode 전용 아이콘 (Pencil.dev로 제작)
5. **다크모드 기본** — Dark-first vs 시스템 따름
6. **Neobrutalism 스타일** — AstroPaper에 3px border + clay shadow 적용할 건지

### 나중에

7. 댓글 (Giscus)
8. 뉴스레터 (Buttondown)
9. 로고 (Vibe Wave 워드마크)
10. OG 이미지 커스터마이징

---

## 6. 소스 문서

| 문서 | 위치 |
|------|------|
| MUSU V2 브랜딩 전체 | `F:\Aisaak\Projects\design_work\branding\` (01~11 + README) |
| 블로그 리서치 | `vibecode-blog/blog-research/` (01~09) |
| 호스팅 비교 | `vibecode-blog/docs/technical/blog-hosting-comparison-2026-02-28.md` |
| 템플릿 비교 | `vibecode-blog/docs/technical/blog-opensource-templates-2026-02-28.md` |
| 성능 최적화 | `vibecode-blog/docs/technical/nextjs-performance-optimization-2026-02-28.md` |
