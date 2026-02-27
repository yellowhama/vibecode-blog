# 2. Blog Tech Stack & Infrastructure

## 1. 플랫폼 비교

### Tier 1: Full Control (Self-Hosted / Custom)

**Next.js + MDX** (추천 — 이미 보유)
- Next.js 16 전문성 + Vercel 배포 이미 있음
- MDX로 라이브 React 컴포넌트를 블로그 포스트 안에 임베드 가능
- 무료 Vercel CDN 호스팅

**Astro** (강력한 대안)
- 기본 Zero JavaScript — 순수 HTML 배포
- Next.js 대비 콘텐츠 사이트에서 2-3x 빠름
- 단점: 새 프레임워크 학습 필요

**Ghost** (배터리 포함 옵션)
- 멤버십, 뉴스레터, SEO, 분석 내장
- 헤드리스 CMS로 Next.js 프론트엔드와 사용 가능
- $9/월 또는 자체 호스팅

### Tier 2: Managed Platforms
- Hashnode: 무료 커스텀 도메인, SEO 90+ 기본
- Substack: 뉴스레터 퍼스트, 10% 수수료, SEO 약함
- Dev.to: 신디케이션 타겟으로 사용

### 결론: Next.js 16 + MDX 확정

---

## 2. MDX 블로그 아키텍처

### Content Layer: Velite (추천)
- ContentLayer는 2026년 사실상 유지보수 중단
- Velite = 후계자: Zod 스키마, TypeScript 타입 생성, 빌드타임
- 프레임워크 무관 (Next.js 16 App Router 호환)

### Frontmatter Schema (Velite + Zod)
```typescript
const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s.object({
    title: s.string().max(120),
    slug: s.slug('posts'),
    description: s.string().max(260),
    date: s.isodate(),
    updated: s.isodate().optional(),
    author: s.string().default('Hugh'),
    tags: s.array(s.string()),
    category: s.enum(['ai', 'vibe-coding', 'tools', 'tutorial', 'opinion']),
    image: s.image().optional(),
    draft: s.boolean().default(false),
    featured: s.boolean().default(false),
  }),
})
```

### 코드 하이라이팅: Shiki + rehype-pretty-code
- VS Code TextMate 엔진 사용 — 정확한 하이라이팅
- 빌드타임 렌더링 — 클라이언트 JS 0
- 라인 하이라이팅, 라인 넘버, diff 지원

### Full-Text Search: Pagefind
- next build 후 실행, 모든 HTML 인덱싱
- 10,000 페이지 < 300KB 네트워크 페이로드
- 서버 불필요 — 브라우저에서 실행

### RSS Feed
- `app/feed.xml/route.ts`로 Route Handler 구현
- `feed` npm 패키지 사용

### Comments: Giscus
- GitHub Discussions 기반
- 오픈소스, 트래킹/광고 없음
- GitHub OAuth 인증 (타겟 오디언스 이미 GitHub 계정 보유)
- Lazy-loaded, 다크/라이트 모드 지원

---

## 3. 뉴스레터 통합

| 플랫폼 | 가격 | 장점 | 단점 |
|--------|------|------|------|
| Buttondown | 100구독자 무료, $9/월 | Markdown 네이티브, RSS-to-email, 프라이버시 | 소규모 |
| Beehiiv | 2,500 무료 | 성장 도구, 레퍼럴, A/B 테스트, 0% 수수료 | 자동화 약함 |
| Substack | 무제한 무료 | 네트워크 효과, 단순 | 10% 수수료, 커스텀 약함 |
| Ghost | $15/월~ | 풀 소유, Stripe 직결, 0% 수수료 | 무료 티어 없음 |
| Kit (ConvertKit) | 10,000 무료 | 자동화, 디지털 제품 판매 | beehiiv보다 성장 도구 약함 |

추천: **Buttondown** (Markdown 네이티브) 또는 **Beehiiv** (성장 도구)

---

## 4. 분석 (Analytics)

| 도구 | 가격 | 장점 |
|------|------|------|
| Vercel Analytics | 무료 (Vercel 포함) | 제로 셋업, SOC 2 |
| Umami | 무료 (자체 호스팅) | 오픈소스, 프라이버시, 쿠키 없음 |
| Plausible | $9/월 | 가장 심플, EU 호스팅 |
| PostHog | 1M 이벤트 무료 | 제품 분석 + 웹 분석 |

추천: Vercel Analytics (기본) + Umami (보조)

---

## 5. 수익화 인프라

### Free + Premium 모델
```
/blog/free-post      → 공개, Google 인덱싱
/blog/premium-post   → 티저 + 게이팅
/courses/...         → 코스 플랫폼
/membership          → 구독 가격 페이지
```

### Stripe 결제 흐름
1. Stripe Checkout → 구독 가입
2. Stripe Webhooks → Supabase 구독 상태 동기화
3. Server Component에서 `user.subscription_tier` 확인

### 수익 스트림
1. 프리미엄 아티클 (Stripe 구독)
2. 코스/튜토리얼 (일회성 또는 번들)
3. 뉴스레터 스폰서십 (5K+ 구독자)
4. 어필리에이트 (AI 도구 20-30% 커미션)
5. 컨설팅 CTA (musu.pro 연결)

---

## 6. SEO 기술 체크리스트 (2026)

### Traditional SEO
- robots.txt + XML sitemap (lastmod)
- Canonical URL + Clean URL `/blog/[slug]`
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- JSON-LD BlogPosting schema
- BreadcrumbList, WebSite, Organization

### GEO (Generative Engine Optimization) — 2026 NEW
- BLUF 포맷: 결론을 글 상단에
- 키워드보다 토픽 커버리지
- 통계/인용 포함 (AI가 선호)
- 구조화된 콘텐츠 (헤딩, 불릿, 짧은 단락)
- 코너스톤 콘텐츠 정기 업데이트
- 저자 권위 시그널

---

## 7. 콘텐츠 배포: POSSE 전략

**Publish on Own Site, Syndicate Everywhere**

| 플랫폼 | 방법 | Canonical | 오디언스 |
|--------|------|-----------|---------|
| Dev.to | RSS import/API | O | 1M+ 개발자 |
| Hashnode | Import/API | O | 442K/월 |
| Medium | Import tool | O | 광범위 |
| LinkedIn | 네이티브 아티클 | X | 프로페셔널 |
| Twitter/X | 스레드 요약 | 링크 | 실시간 |
| HN | 링크 제출 | 링크 | 고품질 트래픽 |

규칙: 원본 발행 후 2-7일 대기 → 각 플랫폼에 맞게 리포맷

---

## 8. 최종 추천 스택

```
Framework:       Next.js 16 (App Router)
Content:         MDX files managed by Velite
Styling:         Tailwind CSS v4
Syntax:          Shiki via rehype-pretty-code
Search:          Pagefind (post-build indexing)
Comments:        Giscus (GitHub Discussions)
Newsletter:      Buttondown or Beehiiv
Analytics:       Vercel Analytics + Umami
Monetization:    Stripe
Auth:            Supabase Auth
Hosting:         Vercel
SEO:             JSON-LD BlogPosting + GEO
Distribution:    POSSE to Dev.to, Hashnode, Medium, LinkedIn, X
```

---

## 9. 구현 우선순위

### Phase 1 (MVP — 2주)
- [x] Velite 설정 + Frontmatter 스키마
- [x] 첫 5개 포스트 작성 (MDX)
- [x] Shiki 코드 하이라이팅 통합
- [x] RSS feed Route Handler
- [x] JSON-LD BlogPosting schema

### Phase 2 (Polish — 2주)
- [ ] Pagefind 인덱싱 설정
- [ ] Giscus 댓글 통합
- [ ] Vercel Analytics 리뷰
- [ ] SEO 감사 (Lighthouse + Unlighthouse)

### Phase 3 (Growth — 1개월)
- [ ] Buttondown/Beehiiv 선택 + 구독자 모금
- [ ] Stripe 프리미엄 게이팅 (1-2개 포스트)
- [ ] POSSE 배포 스크립트 (Dev.to, Hashnode)
- [ ] 코너스톤 콘텐츠 업데이트 (매주)

### Phase 4 (Advanced — 진행중)
- [ ] 코스 플랫폼 (Gumroad/Podia)
- [ ] 어필리에이트 링크 관리
- [ ] Umami 자체 호스팅
- [ ] 뉴스레터 스폰서십 판매 (5K+ 구독자)

---

## 10. 예상 비용 (월간 USD)

| 항목 | 가격 | 설명 |
|------|------|------|
| Vercel | $0-20 | Analytics Pro = $9, 트래픽 기반 |
| Buttondown | $0-9 | 초기 무료, 100+ 구독자 $9 |
| Stripe | 2.9% + $0.30 | 결제 수수료 |
| Umami (선택) | $6 | 클라우드 호스팅 |
| **합계** | **$8-45** | **초기 < $10, 스케일 시 $30-50** |

---

## 11. 성공 지표

- 월간 블로그 트래픽: 5K (3개월) → 20K (6개월) → 100K (12개월)
- 뉴스레터 구독자: 100 (1개월) → 1K (3개월) → 5K (6개월)
- 프리미엄 구독자: 10 (3개월) → 50 (6개월)
- 소셜 공유: 평균 포스트당 100+ (LinkedIn), 50+ (X)
- SEO: 타겟 키워드 Google Top 3 (6개월)
