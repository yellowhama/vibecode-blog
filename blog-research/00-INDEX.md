# vibecode.town Blog Research — Master Index

> **Date:** 2026-02-27
> **Purpose:** vibecode.town을 독립 AI 테크 블로그로 전환하기 위한 종합 리서치

## Reports

| # | File | Topic | Key Insight |
|---|------|-------|------------|
| 1 | [01-guru-psychology.md](01-guru-psychology.md) | 인터넷 구루 심리학 & 롤모델 | 1,000 True Fans + Build in Public + Named Framework = 합법적 "교주" |
| 2 | [02-tech-stack.md](02-tech-stack.md) | 블로그 기술 스택 & 인프라 | Next.js 16 + MDX + Velite + Pagefind + Giscus + Buttondown |
| 3 | [03-market-research.md](03-market-research.md) | AI 블로그 시장 & 니치 분석 | "Vibe Coding → Agentic Engineering" 전환 = 최대 기회 |
| 4 | [04-growth-playbook.md](04-growth-playbook.md) | 0→1,000 구독자 성장 플레이북 | 4개월 (Arvid Kahl) ~ 12개월 (현실적), 주간 일관성이 핵심 |
| 5 | [05-content-pipeline.md](05-content-pipeline.md) | AI 활용 콘텐츠 생산 파이프라인 | Gary Vee 역피라미드 + AI 리서치/초안 + 인간 편집/보이스 |
| 6 | [06-twitter-strategy.md](06-twitter-strategy.md) | Twitter/X 테크 크리에이터 성장 전략 | Reply 27x > Like, 70% 참여 30% 콘텐츠, Premium 필수 |
| 7 | [07-visual-branding.md](07-visual-branding.md) | 비주얼 브랜딩 & 디자인 시스템 | "Neon Terminal Garden" 미학 + Coral/Violet/Mint 팔레트 + Space Grotesk |
| 8 | [08-english-voice-guide.md](08-english-voice-guide.md) | 영어 보이스 가이드 | Bukowski 리듬 + Paul Graham 명료 + Bourdain 솔직 = 번역 아닌 재창작 |
| 9 | [09-decisions.md](09-decisions.md) | 기술 결정 장단점 비교 | 7개 결정사항 × 3-4 옵션 비교표 |

## Key Decision Points

### 포지셔닝
- **하지 말 것**: 또 다른 "AI 뉴스레터" (TLDR, Rundown, Superhuman 포화)
- **해야 할 것**: "실용 교육 플랫폼 — vibe coding에서 agentic engineering까지"

### 기술 스택 (확정 추천)
```
Framework:       Next.js 16 (App Router) — 이미 보유
Content:         MDX + Velite (Zod 스키마)
Syntax:          Shiki via rehype-pretty-code
Search:          Pagefind (빌드 후 인덱싱)
Comments:        Giscus (GitHub Discussions)
Newsletter:      Buttondown (Markdown-native) 또는 Beehiiv (성장 도구)
Analytics:       Vercel Analytics + Umami
Monetization:    Stripe (구독 + 일회성)
Auth:            Supabase Auth (이미 보유)
Hosting:         Vercel
SEO:             JSON-LD BlogPosting + GEO 최적화
Distribution:    POSSE → Dev.to, Hashnode, Medium, LinkedIn, Twitter/X
```

### 브랜드 아키텍처
```
musu.pro        = 제품/비즈니스 (MUSU Agent Runtime)
vibecode.town   = 콘텐츠/커뮤니티/교육 (AI Tech Blog)
```

### 수익 모델 우선순위
1. 무료 블로그 + 뉴스레터 (신뢰 구축)
2. YouTube (발견 엔진)
3. 스폰서십 (10K+ 구독자 후)
4. 디지털 제품 ($29 ebook → $99 미니코스 → $299 풀코스)
5. 커뮤니티 (Discord/유료 티어)
6. 코호트 워크숍 ($499-$999)

### 12개월 타임라인
| Phase | 기간 | 목표 |
|-------|------|------|
| Pre-launch | 2주 | 랜딩페이지 + 리드마그넷 + 5개 글 준비 |
| Launch | Month 1-3 | 100-200 구독자, 주간 발행 |
| Acceleration | Month 4-6 | 200-500 구독자, 크로스프로모션 |
| Scale | Month 7-12 | 500-1,000 구독자, 첫 유료 제품 |

### 비주얼 아이덴티티 (확정 추천)
```
미학:          "Neon Terminal Garden" — 따뜻한 다크 + 비비드 액센트
기본 모드:     Dark (개발자 80%+ 선호)
Primary:       Warm Coral #FF6E6E (musu.pro Blue와 확실히 구분)
Secondary:     Electric Violet #7C3AED
Tertiary:      Mint Green #06D6A0
Highlight:     Amber #FBBF24 (musu.pro Gold 메아리)
Background:    Deep Space #0F0E17 (바이올렛 틴트)
Headlines:     Space Grotesk (800)
Body:          Inter (400-500)
Code:          JetBrains Mono (400)
Logo:          "Vibe Wave" Modified Wordmark (Concept A)
```

---

*Next step: vibecode.town 코드베이스 실제 전환 (musu.pro → 블로그)*
