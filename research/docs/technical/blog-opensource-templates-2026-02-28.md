# 블로그 오픈소스 템플릿 비교 — Astro / Next.js / Zola

> Date: 2026-02-28
> Context: Paddle 결제 연동 예정, 한국 크리에이터, 멤버십 블로그

---

## 1. Astro 블로그 템플릿

Astro = JS 0 기본, 필요한 곳만 아일랜드. Cloudflare가 2026년 1월 코어 팀 인수 → 장기 안정성 보장.

### Top 템플릿

| 이름 | 스타 | Lighthouse | 디자인 | 핵심 특징 |
|------|------|-----------|--------|----------|
| **AstroWind** | 5,400+ | 100/100 | 다목적 | SaaS + 블로그 + 랜딩, RTL, 이미지 최적화 |
| **AstroPaper** | 4,200+ | 100/100 | 미니멀 | 퍼지 검색(Fuse.js), 접근성 최강, 스크린리더 테스트 |
| **Fuwari** | 3,800+ | 95+ | 모던 | **다국어 i18n**, View Transitions, 커스텀 컬러 |
| **Astroship** | 1,900+ | 높음 | SaaS | 스타트업/SaaS 랜딩, 마케팅 섹션 |
| **Astro Cactus** | 1,400+ | 100/100 | 심플 | Pagefind 검색, 문서+블로그, Astro 5 + Tailwind v4 |
| **Astrofy** | 1,300+ | 90-100 | 포트폴리오 | 이력서 + 프로젝트 + 블로그 + 스토어 |
| **Astroplate** | 1,000+ | 95+ | 다목적 | 15+ 페이지, 다국어, 랜딩+블로그 |
| **Astro Ink** | 589 | 높음 | 미니멀 | GitHub Actions 예약 발행, Svelte 인터랙티브 |
| **Astro Sphere** | 516 | 높음 | 우주 테마 | 파티클 애니메이션, 포트폴리오+블로그 |
| **Astro Micro** | 468 | 100/100 | 미니멀 | Pagefind 검색 + Giscus 댓글, Nano 포크 |
| **Astro Nano** | — | 100/100 | 극한 미니멀 | 프레임워크 0, **렌더 40ms**, 가장 가벼움 |

### 데모 링크

- AstroWind: astrowind.vercel.app
- AstroPaper: astro-paper.pages.dev
- Fuwari: fuwari.vercel.app
- Astro Cactus: astro-cactus.chriswilliams.dev
- Astro Nano: astro-nano-demo.vercel.app

### Astro 공통 기능

모든 주요 템플릿에 포함:
- Markdown + MDX
- 다크/라이트 모드
- SEO (sitemap, RSS, canonical, OG)
- Content Collections (타입 안전 frontmatter)
- 코드 하이라이팅 (Shiki)
- 페이지네이션
- 태그/카테고리
- 반응형

### 차별화 기능

| 기능 | 포함 템플릿 |
|------|------------|
| **검색** | Cactus, Micro (Pagefind), AstroPaper (Fuse.js), Ink (Lunr.js) |
| **다국어** | Fuwari, Astroplate, Starlight |
| **댓글** | Micro (Giscus) |
| **포트폴리오** | Astrofy, Sphere, Nano |
| **문서** | Starlight (공식, 8,000+ 스타), Cactus |
| **SaaS/마케팅** | AstroWind, Astroship |
| **예약 발행** | Ink (GitHub Actions) |
| **JS 0** | Nano, Blogster Minimal |

---

## 2. Next.js 블로그 템플릿

Next.js = SSG+SSR+ISR 하이브리드, API Route 네이티브, Paddle Webhook 직접 처리 가능.

### Top 템플릿

| 이름 | 스타 | 핵심 특징 | CMS |
|------|------|----------|-----|
| **Nextra** | 13,600+ | 문서+블로그, i18n, 검색, 18K+ 프로젝트 사용 | MDX 파일 |
| **Tailwind Starter Blog** | 10,400+ | 가장 기능 풍부 (댓글, 뉴스레터, 분석, KaTeX, 다중 레이아웃) | MDX + Contentlayer |
| **Fumadocs** | 10,900+ | 멀티 프레임워크, headless 모드, 2026년 2월 활발 | MDX |
| **Notion Starter Kit** | 7,000+ | Notion이 CMS, config 하나로 5분 세팅, CMD+K 검색 | **Notion** |
| **Taxonomy** (shadcn) | 19,200+ | 레퍼런스 구현 (템플릿 아님), Auth+DB+결제+MDX | MDX + Prisma |
| **Outstatic** | 3,100+ | **관리자 UI 내장**, AI 자동완성, Git 기반, DB 불필요 | **Git CMS** |
| **morethan-log** | 2,300+ | Notion CMS, **한국 개발자 인기**, OG 자동, 커밋 없이 글 발행 | **Notion** |

### 데모 링크

- Nextra: nextra.site
- Tailwind Starter Blog: timlrx.github.io/tailwind-nextjs-starter-blog
- Fumadocs: fumadocs.dev
- Notion Starter Kit: transitivebullsh.it
- Outstatic: outstatic.com

### Next.js 템플릿 기능 비교

| 기능 | Tailwind Starter | Nextra | Notion Kit | Outstatic | morethan-log |
|------|-----------------|--------|------------|-----------|-------------|
| MDX | O | O | X (Notion) | O | X (Notion) |
| 검색 | X | O | O (CMD+K) | X | X |
| 다크모드 | O | O | O | O | O |
| 댓글 | O (Giscus, Utterances, Disqus) | X | X | X | O (플러그인) |
| 뉴스레터 | O (다중 제공자) | X | X | X | X |
| 분석 | O (Umami, Plausible, GA) | X | O (Fathom, PostHog) | X | O (GA) |
| 수학 (KaTeX) | O | O | O | X | X |
| TOC | O | O | O | X | X |
| 읽기 시간 | O | X | X | X | X |
| OG 이미지 | O | O | O (자동) | X | O (자동) |
| 관리자 UI | X | X | Notion | **O** | Notion |
| i18n | X | O | X | X | X |
| AI 기능 | X | X | X | **O** | X |

### Contentlayer 경고

**Contentlayer는 2026년 현재 deprecated** (Stackbit이 Netlify에 인수 → 유지보수 중단).
Tailwind Starter Blog 등 많은 인기 템플릿이 아직 사용 중이지만 리스크.

**대안**:
- **Content Collections** — Zod 기반, 드롭인 교체
- **Velite** — 최신 대안
- **Fumadocs** — 자체 콘텐츠 레이어

---

## 3. Zola (Rust) 블로그 테마

Zola = Rust 바이너리 하나, 의존성 0, 50페이지 36ms 빌드. 순수 정적 생성.

### Top 테마

| 이름 | 스타 | Lighthouse | 핵심 특징 | 유지보수 |
|------|------|-----------|----------|---------|
| **Terminimal** | 511 | 최상 | **JS 0**, 레트로 터미널, 의존성 0 | 2024 |
| **Serene** | 316 | 높음 | 미니멀, TOC, 읽기 시간, 콜아웃, 다국어 | **2026.02 활발** |
| **Tabi** | 240 | **100/100** | 풀텍스트 검색, 다국어, 시리즈, 스킨 커스텀 | **2025 활발** |
| **Apollo** | 235 | 높음 | 분석(GoatCounter, Umami, GA), Mermaid, 프로젝트 | 2024-2025 |
| **Abridge** | 227 | **만점** (3개 도구) | PWA, 다중 검색 라이브러리, JS 없이도 동작, 비디오 임베드 | 2024 |
| **Juice** | 201 | 높음 | **제품 사이트 전용** (히어로, 피처, 랜딩) | 2024 |
| **Anemone** | 198 | 최상 | 극한 미니멀, JS 0, 번개 로딩 | 2024 |
| **DeepThought** | 189 | 높음 | Bulma CSS, 검색, KaTeX, 차트, 지도, 갤러리 | ⚠️ 2022 중단 |
| **Archie-Zola** | 91 | 높음 | 깔끔 미니멀, KaTeX, GA | 2025 활발 |
| **Blow** | 31 | 높음 | **Tailwind CSS** 기반 유일, 검색, 다국어 | 2024 |

### 데모 링크

- Terminimal: terminimal.vercel.app
- Serene: serene-demo.pages.dev
- Tabi: welpo.github.io/tabi
- Apollo: not-matthias.github.io/apollo
- Abridge: abridge.netlify.app

### Zola 내장 기능 (테마 무관)

| 기능 | 상태 |
|------|------|
| Sitemap | 내장 (30K 페이지 자동 분할) |
| RSS/Atom | 내장 |
| 이미지 최적화 | 내장 (리사이즈, WebP/AVIF 변환, lazy loading) |
| 코드 하이라이팅 | 내장 (40+ 테마, JS 불필요) |
| 검색 인덱스 | 내장 (elasticlunr.js 생성) |
| Sass/SCSS | 내장 |
| TOC | 내장 |
| 읽기 시간 | 내장 |
| 분류 (태그/카테고리) | 내장 |
| 페이지네이션 | 내장 |
| i18n | 내장 |

### Zola 커스터마이징

- **Tera 템플릿** — Jinja2와 거의 동일, Hugo Go 템플릿보다 훨씬 쉬움
- 테마 파일 오버라이드: `templates/` 또는 `static/`에 같은 경로 파일 생성하면 끝
- **JS 위젯 삽입 가능**: Paddle.js, 분석, 댓글 등 `<script>` 태그로 추가

### Zola 한계

- **순수 정적** — SSR 불가, API Route 없음
- Paddle Webhook 수신 → **별도 서버 필요** (VPS에 간단한 API 서버)
- 멤버십 콘텐츠 게이팅 → 클라이언트 JS로 처리하거나 별도 인증 서버

---

## 4. 빌드 속도 벤치마크

```
50페이지 기준:

Zola (Rust)     ██ 36ms
Hugo (Go)       █████████ 178ms
Eleventy (JS)   ████████████ ~250ms
Astro (JS)      █████████████████ ~400ms
Next.js (React) █████████████████████████████ ~800ms
Gatsby (React)  ████████████████████████████████████████ ~1,500ms
```

Zola가 Hugo보다 4배, Next.js보다 22배 빠름.

---

## 5. 3개 스택 최종 비교

| 항목 | Astro | Next.js | Zola |
|------|-------|---------|------|
| **빌드 속도** | ~400ms | ~800ms | **36ms** |
| **기본 JS 크기** | 0 (아일랜드만) | 번들 필수 | **0** |
| **Lighthouse** | 95~100 | 설정 의존 | **100** |
| **Paddle 체크아웃** | 아일랜드로 가능 | **네이티브** | `<script>` 삽입 |
| **Webhook 처리** | 서버리스 함수 | **API Route 네이티브** | 불가 (별도 서버) |
| **SSR/동적** | 가능 (아일랜드) | **네이티브** | 불가 (순수 정적) |
| **콘텐츠 게이팅** | 미들웨어로 가능 | **미들웨어 네이티브** | 클라이언트 JS 또는 별도 서버 |
| **학습 곡선** | 중간 | 이미 알고 있음 | 낮음 |
| **테마 생태계** | ~50개 | 큼 | ~150개 |
| **CMS 옵션** | MDX, Notion | MDX, Notion, Outstatic, 외부 | 마크다운만 |
| **배포** | Vercel/Netlify/정적 | Vercel/VPS | **어디든** (정적 파일) |
| **한국어 지원** | Fuwari (i18n) | morethan-log (한국 커뮤니티) | Tabi, Serene (다국어) |

---

## 6. 용도별 추천

### Paddle 결제 + 멤버십 게이팅이 필요하면

→ **Next.js** (API Route로 Webhook, 미들웨어로 게이팅, 이미 아는 스택)

| 템플릿 | 추천 이유 |
|--------|----------|
| **Tailwind Starter Blog** | 가장 기능 풍부, 댓글+뉴스레터+분석 내장, 10K+ 스타 |
| **Outstatic** | 관리자 UI 있어서 글쓰기 편함, AI 자동완성 |
| **morethan-log** | Notion으로 글 관리, 한국 커뮤니티 |

### 순수 콘텐츠 블로그 (결제는 오버레이만)

→ **Astro** (JS 0, 성능 최강, 프레임워크 자유)

| 템플릿 | 추천 이유 |
|--------|----------|
| **AstroPaper** | 미니멀 + 검색 + 접근성 최강 |
| **Fuwari** | 다국어 + 예쁜 디자인 |
| **Astro Cactus** | 문서+블로그 하이브리드 |

### Rust 쓰고 싶고, 극한 성능

→ **Zola** + 별도 API 서버 (Webhook용)

| 테마 | 추천 이유 |
|------|----------|
| **Tabi** | Lighthouse 100/100, 검색, 다국어, 시리즈 |
| **Serene** | 2026년 활발, 미니멀, 깔끔 |
| **Abridge** | 만점 3관왕, PWA, 기능 최다 |

---

## 7. 주의사항

### Contentlayer deprecated (2026)
Next.js 블로그 템플릿 중 Contentlayer 사용하는 것 많음 (Tailwind Starter Blog 포함).
유지보수 중단됨. **Content Collections** 또는 **Velite**로 마이그레이션 필요.

### Zola + Paddle Webhook
Zola는 순수 정적이라 Webhook 수신 불가. VPS에 간단한 Rust/Node API 서버를 별도로 돌려야 함.
아키텍처가 분리되므로 관리 포인트 증가.

### Astro 아일랜드
Astro에서 Paddle.js 같은 인터랙티브 요소는 React/Svelte 아일랜드로 감싸야 함.
Webhook은 Astro 서버리스 함수(Vercel/Netlify Functions)로 처리 가능하지만,
Next.js API Route만큼 네이티브하지는 않음.

### 테마 생태계 vs 커스텀
- 테마 그대로 쓰면: 1~2시간이면 블로그 런칭
- 결제/멤버십 붙이면: 어차피 커스텀 필요 → 테마는 **뼈대**로만 사용
- 테마 위에 Paddle 체크아웃 + 구독 상태 체크 + 콘텐츠 게이팅 추가하는 작업은 동일
