# Next.js 성능 최적화 — musu.pro 케이스 스터디 + 추가 권장 기법

> Date: 2026-02-28
> Stack: Next.js 16.1.6 + React 19 + Tailwind CSS v4
> Domain: musu.pro (Vercel production)

---

## Part 1: 실제 작업 — musu.pro에서 한 것들

### 결과 요약

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| FCP (Desktop) | 3.98s | 0.5s | **87% ↓** |
| LCP (Desktop) | 4.95s | 0.8s | **84% ↓** |
| FCP (Mobile) | — | 1.4s | — |
| LCP (Mobile) | 5.2s | 2.9s | **44% ↓** |
| Performance (Mobile) | — | **95** | — |
| Accessibility | — | **96** | — |
| Best Practices | — | **100** | — |
| SEO | — | **100** | — |
| JS 번들 (critical) | ~762KB | ~540KB | **29% ↓** (-220KB) |

---

### 1. framer-motion 제거 → CSS 애니메이션 대체

**문제**: `page.tsx`가 `"use client"` — framer-motion (~220KB gzipped) 로딩 후에야 첫 렌더.
브라우저가 JS 전체를 다운로드 → 파싱 → 실행한 뒤에야 HTML이 그려진다.

**framer-motion이 하던 일 (5가지)**:

1. `FadeIn` — 스크롤 시 fade-in + slide-up (whileInView)
2. `StaggerChildren/StaggerItem` — 스크롤 시 순차 fade-in
3. Hero 섹션 — 페이지 로드 시 entrance animation
4. `FAQAccordion` — 열기/닫기 (AnimatePresence)
5. Header 모바일 메뉴 — 열기/닫기 (AnimatePresence)

**대체 방법**:

#### CSS Scroll Reveal (IntersectionObserver)

```css
/* globals.css */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```tsx
// ScrollReveal.tsx — ~30줄, ~500 bytes (framer-motion 대비 99.8% 감소)
"use client";
import { useEffect, useRef, useState } from "react";

export function ScrollReveal({ children, className, delay = 0, stagger }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "-80px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className ?? ""}`}
         style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
```

#### Hero Entrance (CSS @keyframes)

```css
@keyframes hero-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-animate { animation: hero-in 0.6s ease-out both; }
.hero-delay-1 { animation-delay: 0.1s; }
.hero-delay-2 { animation-delay: 0.4s; }
.hero-delay-3 { animation-delay: 0.6s; }
/* ... */
```

```tsx
// Before (framer-motion):
<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
  <MusuLogo size="hero" />
</motion.div>

// After (CSS):
<div className="hero-animate hero-delay-1">
  <Image src="/images/logos/hero-light.png" ... />
</div>
```

#### FAQ Accordion (CSS grid-template-rows)

```css
.faq-content {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.2s;
}
.faq-content.open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.faq-content > div { overflow: hidden; }
```

AnimatePresence 없이 `grid-template-rows: 0fr → 1fr` 전환으로 동일한 효과.
높이를 `auto`로 애니메이션하는 가장 깔끔한 CSS-only 방법.

#### 모바일 메뉴 (같은 grid 기법)

```css
.mobile-menu {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.2s ease-out, opacity 0.2s ease-out;
}
.mobile-menu.open { grid-template-rows: 1fr; opacity: 1; }
.mobile-menu > div { overflow: hidden; }
```

**핵심 인사이트**: framer-motion의 AnimatePresence가 하는 일의 80%는 `grid-template-rows: 0fr ↔ 1fr`로 대체 가능. 나머지 20%(exit animation)는 대부분의 사이트에서 불필요.

---

### 2. 서버 컴포넌트 전환 (가장 큰 임팩트)

**Before**: `page.tsx`에 `"use client"` → 전체 페이지가 클라이언트 번들
**After**: `"use client"` 제거 → 서버에서 HTML 스트리밍, 클라이언트 JS는 아일랜드만

```tsx
// Before — 클라이언트 컴포넌트 (JS 전체 다운로드 후 렌더)
"use client";
import { motion } from "framer-motion";
// ... 590줄 전부 클라이언트

// After — 서버 컴포넌트 (HTML 즉시 스트리밍)
import { FadeIn } from "@/components/motion/FadeIn"; // "use client" 아일랜드
import { StaggerChildren } from "@/components/motion/StaggerChildren"; // "use client" 아일랜드
// 나머지는 전부 서버에서 렌더
```

**왜 이게 FCP 3.98s → 0.5s를 만드는가**:
- 서버 컴포넌트는 JS 번들에 포함 안 됨
- HTML이 서버에서 바로 스트리밍 → 브라우저는 JS 없이도 화면을 그림
- 인터랙티브 부분(`FadeIn`, `FAQAccordion`)만 클라이언트 아일랜드로 하이드레이션

---

### 3. Nonce 기반 CSP (Content Security Policy)

**Before**: 정적 CSP + `'unsafe-inline'` (Lighthouse 경고)
```
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com
```

**After**: 매 요청마다 랜덤 nonce 생성
```typescript
// proxy.ts (Next.js 16에서 middleware.ts 대체)
const nonce = Buffer.from(
  crypto.getRandomValues(new Uint8Array(16))
).toString("base64");

const csp = [
  "default-src 'self'",
  `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https: http:`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co ...",
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join("; ");
```

**핵심**: `'strict-dynamic'`이 있으면 모던 브라우저는 `'unsafe-inline'`과 호스트 allowlist를 무시하고 nonce만 체크. `'unsafe-inline'`과 `https: http:`는 레거시 브라우저 폴백용.

```tsx
// layout.tsx — nonce를 Script 태그에 전달
const nonce = (await headers()).get("x-nonce") ?? undefined;
<Script src="https://www.googletagmanager.com/gtag/js?id=G-..." nonce={nonce} />
```

---

### 4. 이미지 최적화 — sizes + fetchPriority

**sizes prop 누락 문제**:
```tsx
// Before — sizes 없음 → Next.js가 828w 이미지 서빙 (실제 224px 표시)
<Image src={src} width={224} height={56} priority />

// After — 정확한 크기 지정
<Image src={src} width={224} height={56} sizes={`${224}px`} priority />
```

**fetchPriority 명시**:
Next.js 16의 `priority` prop이 `fetchpriority="high"` 속성을 자동으로 안 넣는 문제 발견.
```tsx
<Image
  src={src}
  priority={size === "hero"}
  fetchPriority={size === "hero" ? "high" : undefined}
/>
```

---

### 5. 색상 대비 (Accessibility)

**금색 텍스트 가독성**: 흰 배경에 `#FFD166`(금색)은 WCAG 실패.
```css
.accent-outlined {
  -webkit-text-stroke: 1px var(--text-primary);
  paint-order: stroke fill;
}
```
`paint-order: stroke fill`이 핵심 — stroke가 fill 뒤로 가서 텍스트가 깔끔하게 보임.

**뮤트 텍스트 대비**: `opacity: 0.5` → `0.65` (4.5:1 WCAG AA 충족)

---

### 6. 추가 보안 헤더

```typescript
// next.config.ts
{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
{ key: "X-Content-Type-Options", value: "nosniff" },
{ key: "X-Frame-Options", value: "DENY" },
{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
```

`COOP: same-origin` — 크로스 오리진 팝업에서 `window.opener` 접근 차단.

---

### 변경 파일 전체 목록

| # | 파일 | 변경 내용 |
|---|------|-----------|
| 1 | `globals.css` | `.reveal`, `hero-animate`, `.faq-content`, `.mobile-menu`, `.accent-outlined` CSS 추가 |
| 2 | `ScrollReveal.tsx` | **신규** — IntersectionObserver 기반 (~30줄) |
| 3 | `FadeIn.tsx` | framer-motion → ScrollReveal 래퍼 |
| 4 | `StaggerChildren.tsx` | framer-motion → IO + CSS stagger 클래스 |
| 5 | `FAQAccordion.tsx` | AnimatePresence → CSS grid-template-rows |
| 6 | `Header.tsx` | AnimatePresence → CSS mobile-menu 클래스 |
| 7 | `page.tsx` | `"use client"` 제거, motion.div → CSS, 서버 컴포넌트 |
| 8 | `how-it-works/page.tsx` | `"use client"` 제거 |
| 9 | `MusuLogo.tsx` | `sizes` prop + `fetchPriority="high"` |
| 10 | `proxy.ts` | Nonce 기반 CSP 생성 |
| 11 | `next.config.ts` | 정적 CSP 제거, COOP 추가 |
| 12 | `layout.tsx` | nonce 읽기 + Script nonce 전달 |
| 13 | `package.json` | framer-motion 제거 |

---

## Part 2: 아직 안 했지만, 하면 좋은 것들

### Tier 1 — Quick Wins (높은 효과, 낮은 노력)

#### 1. `content-visibility: auto` (렌더링 7배 빠르게)

스크롤 밖 콘텐츠의 렌더링을 브라우저가 스킵. 가상 스크롤링의 CSS 버전.

```css
.section-below-fold {
  content-visibility: auto;
  contain-intrinsic-size: 600px; /* 공간 예약 */
}
```

**적용 대상**: 랜딩 페이지의 Features, How It Works, FAQ 등 스크롤 아래 섹션들.
**효과**: 초기 렌더링 작업 80% 감소 (825ms → 172ms, web.dev 벤치마크).
**주의**: Above-the-fold에는 절대 사용 금지 (LCP 지연 유발).

#### 2. Barrel File 제거 (번들 40-85% 감소)

```tsx
// ❌ 나쁨 — 전체 모듈 임포트
import { Button } from '@/components'

// ✅ 좋음 — 직접 임포트
import { Button } from '@/components/ui/Button'
```

Next.js `optimizePackageImports`로 외부 라이브러리는 자동 처리:
```javascript
// next.config.ts
optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
```

**실제 사례**: 한 개발자가 barrel file 정리만으로 First Load JS 1.5MB → 200KB (85% 감소).

#### 3. Image Blur Placeholder (CLS 방지 + 체감 속도)

```tsx
import heroImage from './hero.jpg'

<Image
  src={heroImage}
  alt="Hero"
  placeholder="blur"  // 정적 import 시 자동 생성
/>
```

동적 이미지는 `plaiceholder` 라이브러리로 빌드 타임에 base64 생성.

#### 4. 경량 애널리틱스 대체 (GA4 45KB → Plausible <1KB)

| 도구 | 크기 | 쿠키 | GDPR |
|------|------|------|------|
| Google Analytics 4 | ~45KB | 있음 | 동의 필요 |
| **Plausible** | **<1KB** | 없음 | 자동 준수 |
| **Umami** | **<2KB** | 없음 | 셀프호스트 |

```tsx
<Script defer data-domain="musu.pro"
  src="https://plausible.io/js/script.js" strategy="afterInteractive" />
```

쿠키 없음 = 동의 배너 불필요. 97% 스크립트 크기 감소.

---

### Tier 2 — High Impact (중간 노력)

#### 5. AVIF 이미지 (JPEG 대비 50% 작음)

```html
<picture>
  <source type="image/avif" srcSet="hero.avif" />
  <source type="image/webp" srcSet="hero.webp" />
  <img src="hero.jpg" alt="Hero" />
</picture>
```

Next.js Image는 자동으로 WebP 서빙하지만, AVIF는 `next.config.ts`에서 활성화 필요:
```javascript
images: { formats: ['image/avif', 'image/webp'] }
```

**효과**: AVIF는 WebP보다 20% 더 작음. 모바일 LCP에 직접적 영향.

#### 6. Dynamic Import로 무거운 컴포넌트 지연 로딩

```tsx
import dynamic from 'next/dynamic'

// 차트, 에디터 같은 무거운 컴포넌트
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
})

// 모달 — 트리거 전까지 로딩 안 함
const PricingModal = dynamic(() => import('./PricingModal'))
```

**언제 쓰나**: 차트, 코드 에디터, 지도, 모달, 인증 전용 컴포넌트
**언제 안 쓰나**: Above-the-fold, 작은 독립 컴포넌트

#### 7. Suspense 경계로 스트리밍 최적화

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <Header />       {/* 즉시 렌더 */}
      <Hero />          {/* 즉시 렌더 */}

      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />    {/* 데이터 준비되면 스트리밍 */}
      </Suspense>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials /> {/* 독립적으로 스트리밍 */}
      </Suspense>
    </>
  )
}
```

**핵심**: 각 Suspense 경계는 독립적으로 스트리밍. 느린 데이터 소스가 다른 섹션을 블로킹하지 않음.

#### 8. INP (Interaction to Next Paint) 최적화

2024년 3월부터 Core Web Vital의 FID를 대체. 사이트의 43%가 200ms 기준 실패.

```tsx
import { startTransition } from 'react'

function handleFilter() {
  // 무거운 상태 업데이트를 low-priority로
  startTransition(() => {
    setResults(expensiveFilter(data))
  })
}
```

**3가지 최적화 축**:
1. **Input Delay**: 이벤트 핸들러 시작까지 대기 → 번들 크기 줄이기
2. **Processing Time**: 핸들러 실행 시간 → `startTransition`, debounce
3. **Presentation Delay**: 페인트까지 시간 → DOM 변경 최소화

---

### Tier 3 — 아키텍처 레벨 (높은 노력, 높은 효과)

#### 9. Partial Prerendering (PPR) — Next.js 실험적

정적 셸을 빌드 타임에 렌더하고, 동적 콘텐츠만 요청 시 스트리밍.

```tsx
export const experimental_ppr = true

export default function Page() {
  return (
    <>
      <Header />        {/* 정적 — 빌드 타임 렌더 */}
      <Hero />           {/* 정적 */}
      <Suspense fallback={<Skeleton />}>
        <DynamicPricing /> {/* 동적 — 요청 시 스트리밍 */}
      </Suspense>
      <Footer />         {/* 정적 */}
    </>
  )
}
```

**단일 HTTP 요청**으로 정적 + 동적을 합침. Next.js 16+에서 기본 렌더링 모델이 될 예정.

#### 10. CJK(한국어) 폰트 서브세팅 (95% 감소)

전체 한글 폰트: 5-20MB → 서브셋: 100-500KB

```css
@font-face {
  font-family: 'Noto Sans KR';
  src: url('/fonts/noto-sans-kr-subset.woff2') format('woff2');
  unicode-range: U+AC00-D7AF; /* 한글 음절만 */
  font-display: swap;
}
```

`pyftsubset`으로 필요한 글리프만 추출:
```bash
pyftsubset NotoSansKR.otf --output-file=NotoSansKR-subset.woff2 \
  --flavor=woff2 --unicodes="U+AC00-D7AF,U+0020-007E"
```

#### 11. Edge Runtime + 병렬 데이터 페칭 (TTFB 60% 감소)

```tsx
// 순차적 — 150ms
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// 병렬 — 50ms
const [user, posts, comments] = await Promise.all([
  fetchUser(), fetchPosts(), fetchComments()
])
```

Edge Runtime은 전 세계 CDN 엣지에서 실행:
```tsx
export const runtime = 'edge'
```

#### 12. Vercel Edge 캐싱 전략

```typescript
// 정적 에셋 — 영구 캐시
'Cache-Control': 'public, max-age=31536000, immutable'

// ISR 스타일 — 60초 신선, 120초 stale 서빙 + 백그라운드 갱신
'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'

// 개인 데이터 — 캐시 금지
'Cache-Control': 'private, no-cache, no-store, must-revalidate'
```

`stale-while-revalidate`가 핵심: 유저는 항상 즉시 응답, 백그라운드에서 갱신.

---

### Tier 4 — CLS (Cumulative Layout Shift) 방지

#### 이미지 — 반드시 width/height 또는 aspect-ratio

```tsx
// ❌ CLS 유발
<img src="/hero.jpg" alt="Hero" />

// ✅ CLS 방지
<Image src="/hero.jpg" width={1200} height={630} sizes="100vw" />

// ✅ 또는 aspect-ratio
<img src="/hero.jpg" style={{ aspectRatio: '16/9', width: '100%' }} />
```

#### 폰트 — 폴백 메트릭 맞추기

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: optional; /* CLS 0 보장 */
  size-adjust: 95%;
  ascent-override: 105%;
  descent-override: 35%;
}
```

`font-display: optional` = CLS 0 보장 (100ms 내 로드 안 되면 시스템 폰트 유지).
`font-display: swap` = 텍스트 항상 보임, but 폰트 로드 시 깜빡임 가능.

#### 동적 콘텐츠 — 공간 예약

```tsx
<div style={{ minHeight: '250px' }}>
  <AdComponent />  {/* 로딩 후에도 레이아웃 안 밀림 */}
</div>
```

---

## Part 3: 우선순위 매트릭스

### 즉시 적용 (1일)

| # | 최적화 | 효과 | 노력 |
|---|--------|------|------|
| 1 | `content-visibility: auto` 추가 | 렌더링 7배 ↑ | CSS 5줄 |
| 2 | AVIF 포맷 활성화 | 이미지 50% ↓ | config 1줄 |
| 3 | blur placeholder | CLS 방지 | 이미지별 1줄 |
| 4 | `font-display: optional` | CLS 0 | CSS 1줄 |

### 1주 내 (중간 노력)

| # | 최적화 | 효과 | 노력 |
|---|--------|------|------|
| 5 | barrel import 정리 | 번들 40-85% ↓ | import문 수정 |
| 6 | Suspense 경계 추가 | 스트리밍 최적화 | 컴포넌트 래핑 |
| 7 | dynamic import (무거운 것) | 초기 번들 ↓ | 컴포넌트별 |
| 8 | GA4 → Plausible | 스크립트 97% ↓ | 교체 |

### 장기 (아키텍처)

| # | 최적화 | 효과 | 노력 |
|---|--------|------|------|
| 9 | PPR 실험 | 정적+동적 최적 | 실험적 |
| 10 | 한글 폰트 서브세팅 | 95% ↓ | 빌드 파이프라인 |
| 11 | Edge Runtime | TTFB 60% ↓ | 아키텍처 |
| 12 | Edge 캐싱 최적화 | 즉시 응답 | 헤더 설정 |

---

## Part 4: 핵심 원칙

### 1. "JS를 보내지 마라"
서버 컴포넌트가 핵심. 클라이언트에 보내는 JS가 적을수록 FCP/LCP가 빠름.
`"use client"`는 반드시 필요한 곳(이벤트 핸들러, 브라우저 API)에만.

### 2. "CSS가 할 수 있으면 CSS로"
framer-motion 220KB vs CSS 500bytes. `grid-template-rows: 0fr ↔ 1fr`로
AnimatePresence의 80%를 대체 가능. IntersectionObserver 30줄로 whileInView 대체.

### 3. "번들 크기 = 시간"
모바일 3G에서 1KB ≈ 10ms. framer-motion 220KB 제거 = 모바일에서 ~2초 절약.
lighthouse가 "Reduce unused JavaScript"라고 하면, 그건 번들에 안 쓰는 코드가 있다는 뜻.

### 4. "측정 → 최적화 → 측정"
PageSpeed Insights로 Before/After 반드시 측정.
체감이 아니라 수치로 검증. FCP, LCP, INP, CLS — 4대 지표 추적.

### 5. "보안은 성능을 방해하지 않는다"
Nonce CSP는 `'unsafe-inline'`보다 안전하면서 성능에 영향 없음.
COOP, HSTS 등 보안 헤더는 오버헤드 0. 안 하는 게 손해.
