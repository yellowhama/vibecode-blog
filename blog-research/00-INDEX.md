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
| 10 | [10-editor-in-chief-strategy.md](10-editor-in-chief-strategy.md) | **편집장 상업화 마스터 플랜** | 5단계 수익 사다리, 12개월 타임라인, 0→10K 성장 전략 |
| 11 | [11-detailpage-automation-rag.md](11-detailpage-automation-rag.md) | 상세페이지 자동화 Prep + Small RAG | “한 번 만들기”가 아니라 “계속 만드는 시스템” 운영 루틴 |

### Twitter 실행 전략 (2026-03-01 작성)

| # | File | Topic | Key Insight |
|---|------|-------|------------|
| T0 | [twitter/00-INTENT.md](../twitter/00-INTENT.md) | **Intent Document** | 편집장 역할/블로그 목적/트위터 목적/제약조건 — intent-driven |
| T1 | [twitter/01-DEEP-RESEARCH-2026.md](../twitter/01-DEEP-RESEARCH-2026.md) | **팩트 베이스** | X 알고리즘 소스코드 검증, 블로거 주장 팩트체크, 시장 데이터 |
| T2 | [twitter/02-STRATEGY.md](../twitter/02-STRATEGY.md) | **실행 전략** | 알고리즘 대응, 콘텐츠 비율, 퍼널, 루틴, Phase 1-4 로드맵 |
| T3 | [twitter/03-IMPLEMENTATION-PLAN.md](../twitter/03-IMPLEMENTATION-PLAN.md) | **구현 계획** | Week 0-8 캘린더, 스레드 변환 큐, 자동화 워크플로우 |
| T4 | [twitter/04-CONTENT-PLAYBOOK.md](../twitter/04-CONTENT-PLAYBOOK.md) | **콘텐츠 플레이북** | 소재 42개(A13+B13+C8+D8), 캐릭터≠콘텐츠 원칙, 리플라이 매핑 |
| T5 | [twitter/05-STRATEGY-VALIDATION.md](../twitter/05-STRATEGY-VALIDATION.md) | **전략 검증 리포트** | Month 1 100→40, 리플라이 50/일, 스레드 3/주, 영상/Bluesky 추가 |

## Key Decision Points

### 포지셔닝
- **하지 말 것**: 또 다른 "AI 뉴스레터" (TLDR, Rundown, Superhuman 포화)
- **해야 할 것**: "실용 교육 플랫폼 — vibe coding에서 agentic engineering까지"

### 기술 스택 (확정 — 실제 구현)
```
Framework:       Astro 5.16 + AstroPaper (정적 사이트)
Content:         Astro Content Collections (glob loader)
Syntax:          Shiki (min-light / night-owl)
Search:          Pagefind (빌드 후 인덱싱)
Comments:        Giscus (GitHub Discussions) ✅ 구현 완료
Newsletter:      Beehiiv (확정) ✅ 컴포넌트 완료
Analytics:       Vercel Analytics ✅ 구현 완료
Hosting:         Vercel
SEO:             JSON-LD BlogPosting + sitemap
Distribution:    POSSE → Dev.to, Hashnode, X/Twitter
Twitter MCP:     @enescinar/twitter-mcp ✅ 연동 완료
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

## 구현 진행 상태 (2026-02-28)

### ✅ 완료 (~2026-02-28)
- 디자인 리디자인 (editorial B+C hybrid, Lora serif)
- Beehiiv 뉴스레터 signup (홈 + 포스트 하단)
- Vercel Analytics 연동
- Reading time (remark 플러그인)
- Giscus 댓글 (다크모드 동기화)
- About 페이지 업데이트
- Twitter/X MCP 연동 (@lazy_genius2025)
- 편집장 상업화 전략 수립

### ✅ 완료 (2026-03-01)
- X Premium 가입 ($8/월)
- Beehiiv 계정 생성 + API 키 확보
- Twitter 전략 문서 **6종** 작성 (`twitter/` 폴더 — 05-STRATEGY-VALIDATION 추가)
- X 알고리즘 소스코드 검증 (`xai-org/x-algorithm` 클론 + 분석)
- 블로그 글 27개 콘텐츠 분석 → 블루오션 매핑 완료
- MUSU Work 문서 7건 콘텐츠 소재 추출 완료
- 전략 검증 + 수치 수정 (Month 1: 100→40, 리플라이 50/일, 스레드 3/주, 영상/Bluesky 추가)
- **트윗 자동 발행 시스템 구현 완료** (`twitter/scripts/` + GitHub Actions cron)
  - `post-queue.mjs` + `twitter-client.mjs` + `queue-manager.mjs`
  - 주간 JSON 큐 (`twitter/queue/YYYY-wWW.json`) + 30분 cron
  - 드라이런 테스트 + 실제 발행 테스트 (단독 트윗 + 3트윗 스레드) 성공

### ⬜ 다음 단계 (Week 0 잔여 → Week 1)
1. **GitHub Secrets 설정** — `yellowhama/vibecode-blog` 레포에 4개 Twitter API 키 추가
2. **바이오 작성 + 핀 트윗** — 04-CONTENT-PLAYBOOK.md 참조
3. **타겟 리스트 15-20명** — X 프라이빗 리스트 생성
4. **첫 주간 배치 세션** — Claude Code로 Week 10 콘텐츠 생성 → queue JSON
5. **Bluesky 계정 생성** + 프로필 미러링
6. GitHub Discussions + Giscus ID 설정
7. Google Search Console 등록
8. 첫 뉴스레터 발송
9. Week 1 리플라이 시작 (매일 30-50개)
