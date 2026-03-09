# musu.pro Web Technical Stack Audit

> Date: 2026-02-22
> Last Updated: 2026-02-22 (전체 하드닝 완료)
> Stack: Next.js 16.1.6 + React 19 + TypeScript + Tailwind CSS v4
> Domain: musu.pro (Vercel production)
> Overall Score: 108/120 (90%) ← was 52/120 → 78/120 → 108/120

---

## Scoring Summary

| Feature | Score | Notes |
|---------|-------|-------|
| SEO & Meta | 10/10 | ✅ Complete metadata, OG, Twitter, canonical |
| Structured Data | 10/10 | ✅ 4 JSON-LD schemas (Organization, WebSite, SoftwareApplication, BreadcrumbList) |
| Performance | 8/10 | ✅ Font opt + loading skeletons + Suspense. no next/image |
| PWA | **8/10** | ✅ manifest.ts (standalone, SVG icon). No service worker |
| Accessibility | **8/10** | ✅ sr-only + skip link + focus reveal + aria labels + reduced motion |
| Analytics | **10/10** | ✅ Vercel Analytics + Speed Insights (Web Vitals 자동 수집) |
| Security Headers | 10/10 | ✅ CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| API/MCP | 10/10 | ✅ Triple-layer (REST + HTTP MCP + Web MCP) |
| Error Handling | **10/10** | ✅ Custom 404 + error boundary + global-error + 5 loading.tsx |
| OG Image | 10/10 | ✅ Dynamic ImageResponse, 1200x630, headline + CTA + brand |
| i18n | 0/10 | English only, no locale routing (불필요) |
| RSS/Feed | **8/10** | ✅ RSS 2.0 at /rss.xml (notes + posts, 50 limit). No Atom |
| Web Vitals | **6/10** | ✅ Speed Insights로 자동 수집. 커스텀 모니터링 없음 |

---

## Completed (This Session)

### ✅ Security Headers (Commit `7af3a23`)
- **File**: `next.config.ts`
- 7개 헤더 추가: CSP, HSTS (2yr preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control
- CSP: `'unsafe-inline'` (Framer Motion), `*.supabase.co` (API + WebSocket), `'unsafe-eval'` (Next.js hydration)
- `curl -I https://musu.pro` 로 전체 검증 완료

### ✅ OG Image (Commit `7af3a23` + `1031edd`)
- **File**: `src/app/opengraph-image.tsx`
- 1200×630 PNG, Edge runtime, Next.js ImageResponse API
- 디자인: 無數 + musu 로고 → "AI proposes. MUSU enforces." 헤드라인 → tagline → gradient bar → "Get started free · musu.pro" CTA
- Inter 폰트 Google Fonts CDN fetch (실패 시 시스템 폰트 폴백)
- `og:image` 메타태그 자동 생성 확인됨

### ✅ Error Pages (Commit `7af3a23`)
- `src/app/not-found.tsx` — Server Component, MusuLogo + Search 아이콘 + "Back to home"
- `src/app/error.tsx` — Client Component, AlertTriangle + digest ref + "Try again" / "Back to home"
- `src/app/global-error.tsx` — Client Component, 인라인 스타일만 (globals.css 미로드 대비), "Reload" 버튼

### ✅ Title Optimization (Commit `1031edd`)
- 47자 → 55자: "MUSU — AI proposes. MUSU enforces. Build safe, ship fast."
- OG + Twitter 메타데이터 동기화

---

## What EXISTS (Strengths)

### SEO & Meta (10/10)
- Root metadata in `src/app/layout.tsx`: title template, metadataBase, OG, Twitter card, canonical, robots
- Per-page generateMetadata: products, docs, community, market, os
- robots.txt: `public/robots.txt` (Allow all, Disallow /api/ + /login)
- sitemap.xml: `src/app/sitemap.xml/route.ts` (static + Supabase dynamic, 1h cache)
- OG Image: `src/app/opengraph-image.tsx` (dynamic 1200×630)

### Structured Data (10/10)
- JSON-LD component: `src/components/seo/JsonLd.tsx`
- 4 schemas: Organization, WebSite, SoftwareApplication, BreadcrumbList
- Used in root layout + product pages

### Security Headers (10/10)
- `next.config.ts` headers() function
- CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Supabase API/WebSocket 허용, Framer Motion inline styles 허용

### API/MCP Architecture (10/10)
- REST API: `/api/v1/health`, `/api/v1/products`, `/api/v1/listings`, `/api/v1/posts`
- OpenAPI 3.1.0: `src/app/api/openapi/route.ts` (6 endpoints, component schemas, CORS)
- HTTP MCP Server: `src/app/api/[transport]/route.ts` (10 tools, 2 resources, 2 prompts)
- Web MCP Registry: `src/lib/tools/registry.ts` + `src/lib/tools/schemas.ts`
- AI Plugin Manifest: `public/.well-known/ai-plugin.json`

### Error Handling (8/10)
- `src/app/not-found.tsx` — 커스텀 404, MUSU 브랜드
- `src/app/error.tsx` — Error boundary with retry
- `src/app/global-error.tsx` — Root error boundary (인라인 스타일)
- Missing: loading.tsx, Suspense boundaries

### Performance (Partial)
- 5 Google Fonts via `next/font/google` with `display: "swap"`
- generateStaticParams in 3 dynamic routes
- Tailwind CSS v4 with design system tokens

### Other
- Supabase auth via `src/proxy.ts` (Next.js 16 proxy pattern)
- CSS custom properties: dark/light themes, 5 MUSU product color palettes
- Path alias: `@/*` → `./src/*`

---

## What's Still MISSING (Next Steps)

### Medium Priority

#### 1. Analytics
- No Vercel Analytics, GA, or Plausible
- No conversion or performance tracking
- **Fix**: `npm i @vercel/analytics @vercel/speed-insights` + add to layout
- **Effort**: ~10분

#### 2. PWA Manifest
- No manifest.json/manifest.ts
- Cannot be installed as app
- **Fix**: Create `src/app/manifest.ts`
- **Effort**: ~10분

#### 3. Accessibility
- No sr-only utility, no skip-to-content link
- No keyboard navigation indicators, no ARIA live regions
- Basic semantic HTML only (header/nav/main/footer)
- **Effort**: ~30분

### Low Priority

#### 4. Loading States
- No loading.tsx files
- No Suspense boundaries
- No skeleton screens
- **Effort**: ~20분

#### 5. RSS Feed
- No RSS/Atom for docs/blog content
- Sitemap exists but no feed alternative
- **Effort**: ~15분

#### 6. Web Vitals
- No reportWebVitals, no web-vitals package
- No CLS/LCP/FID monitoring
- **Effort**: Vercel Analytics 설치로 자동 해결

#### 7. i18n
- English only, `lang="en"` hardcoded
- No locale routing
- **Effort**: 큰 작업. 당분간 불필요.

---

## Key File Paths

### Configuration
- `next.config.ts` — security headers + turbopack
- `tsconfig.json` — standard
- `package.json` — dependencies

### SEO & OG
- `src/app/layout.tsx` — root metadata + JSON-LD
- `src/app/opengraph-image.tsx` — dynamic OG image (Edge)
- `src/components/seo/JsonLd.tsx` — structured data
- `src/app/sitemap.xml/route.ts` — dynamic sitemap
- `public/robots.txt` — crawler rules

### Error Pages
- `src/app/not-found.tsx` — 404
- `src/app/error.tsx` — error boundary
- `src/app/global-error.tsx` — root error boundary

### API & MCP
- `src/app/api/openapi/route.ts` — OpenAPI 3.1.0 spec
- `src/app/api/[transport]/route.ts` — HTTP MCP server
- `src/lib/tools/registry.ts` — tool registry (single source of truth)
- `src/lib/tools/schemas.ts` — Zod schemas
- `public/.well-known/ai-plugin.json` — AI plugin manifest

### Styling
- `src/app/globals.css` — Tailwind v4 + design system tokens

### Auth
- `src/proxy.ts` — Supabase auth middleware (Next.js 16)

### Public
- `public/favicon.ico`, `public/favicon.svg`

---

## Next Priority Order

1. **Vercel Analytics + Speed Insights** — 트래픽/성능 모니터링 (10분)
2. **PWA Manifest** — 설치 가능한 앱 경험 (10분)
3. **Accessibility** — skip link, focus indicators (30분)
4. **Loading States** — loading.tsx, Suspense (20분)
5. **RSS Feed** — docs/blog 피드 (15분)
