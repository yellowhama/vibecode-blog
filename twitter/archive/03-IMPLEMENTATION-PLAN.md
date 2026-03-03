# 구현 계획: vibecode.town 콘텐츠 배포 파이프라인

> **기반**: 00-INTENT.md (목적), 01-DEEP-RESEARCH.md (팩트), 02-STRATEGY.md (전략)
> **검증**: 05-STRATEGY-VALIDATION.md (수치 수정 반영)
> **작성일**: 2026-03-01 | **최종 수정**: 2026-03-01 (검증 결과 반영)
> **원칙**: 전략은 끝났다. 이제 행동만 남았다.

---

## 0. 이 문서의 목적

| 항목 | 내용 |
|------|------|
| **이유** | 전략 문서(02-STRATEGY.md)가 "무엇을 하라"는 말했지만 "구체적으로 언제, 어떤 순서로, 어떤 재료로"를 안 정했다 |
| **의도** | Week 0~4 행동을 시간 단위로 쪼개서, 편집장(AI)과 저자(사람)가 오늘부터 실행할 수 있게 만든다 |
| **목적** | 이 문서를 읽고 나면 "다음에 뭐 하지?"라는 질문이 사라진다 |
| **수단** | 콘텐츠 자산 매핑 + 스레드 변환 큐 + 일별 실행표 + MCP 자동화 워크플로우 |

---

## 1. 콘텐츠 자산 인벤토리

### 1.1 블로그 글 47개 — 스레드 변환 우선순위

#### Tier 1: 바이럴 탄약 (핫테이크/의견) — 첫 2주 사용

| # | 파일 | 예상 훅 | 훅 패턴 | 스레드 길이 |
|---|------|---------|---------|-----------|
| 1 | `ai-lies.md` | "AI가 거짓말 한다고? 아니, 너가 길을 안 깔아줬을 뿐이다." | C (구조전환) | 8-10 |
| 2 | `prompt-formulas.md` | "프롬프트 '비밀 공식'에 10만원 쓰셨습니까?" | G (냉소) | 8-10 |
| 3 | `ai-gold-rush.md` | "골드러시에서 돈 번 건 곡괭이 판 사람이다. 근데 지금은 가짜 보물지도를 판다." | F (계보) | 10-12 |
| 4 | `vibe-coding-failure.md` | "'5분 만에 만들었어요!' 근데 그거 누구한테 팔 건데?" | A (도발) | 8-10 |
| 5 | `what-vibe-coding-is.md` | "바이브 코딩 = 프롬프트 + 엔터? 아니다. 결정을 교환하며 만드는 것이다." | A (도발) | 10-12 |
| 6 | `can-ai-have-wisdom.md` | "AI는 How를 안다. 근데 What/Why는?" | D (도자기) | 8-10 |
| 7 | `nightmare-boss.md` | "AI는 말 안 듣는 신입이다. 근데 너는 관리해본 적이 있냐?" | B (경험고백) | 8-10 |
| 8 | `splitting-decisions.md` | "코딩의 핵심은 코드가 아니다. 결정이다." | C (구조전환) | 8-10 |

#### Tier 2: 니치 정합 (바이브코딩/AI 개발 실전) — Week 3-6

| # | 파일 | 예상 훅 | 훅 패턴 |
|---|------|---------|---------|
| 9 | `claude-md.md` | "CLAUDE.md 한 줄이 프롬프트 공식 100개보다 낫다" | E (숫자펀치) |
| 10 | `claude-code-prep.md` | "Claude Code 쓰기 전에 할 일이 있다" | B (경험고백) |
| 11 | `claude-code-2-1.md` | "Claude Code 2.1이 바꾼 것" | E (숫자펀치) |
| 12 | `environment-design.md` | "프롬프팅이 아니다. 환경 설계다." | C (구조전환) |
| 13 | `spec-kit-field-report.md` | "스펙 킷으로 실제 프로젝트 돌려봤다" | B (경험고백) |
| 14 | `github-spec-kit.md` | "GitHub에 올린 스펙 킷 — 왜, 어떻게" | B (경험고백) |
| 15 | `10x-claude.md` | "10x는 코딩 속도가 아니다. 세팅 속도다." | A (도발) |
| 16 | `anthropic-github.md` | "Anthropic이 GitHub에서 하고 있는 것" | E (숫자펀치) |
| 17 | `end-of-prompting.md` | "프롬프팅의 시대는 끝났다" | A (도발) |
| 18 | `prompting-wrong.md` | "프롬프트 잘못 쓰고 있다" | A (도발) |

#### Tier 3: MCP/RAG 딥다이브 — Month 2+ (SEO 무풍지대 공략)

| # | 파일 | 예상 훅 |
|---|------|---------|
| 19 | `rag-basics.md` | "RAG = 생성 전 검색. 이거 모르면 AI 앱 다 터진다." |
| 20 | `rag-choices.md` | "RAG 기술 선택지 — 뭘 골라야 하나" |
| 21 | `rag-in-practice.md` | "RAG 실전. 이론이 아니라 삽질기." |
| 22 | `vector-databases.md` | "벡터 DB 뭘 써야 하나" |
| 23 | `three-tier-search.md` | "3-tier 검색 아키텍처" |

#### Tier 4: Build-in-Public / 삽질기 — 상시 사용

| # | 파일 | 용도 |
|---|------|------|
| 24 | `refactoring-case-study.md` | "1만줄 → 3천줄 리팩토링 경험" |
| 25 | `frustration-is-the-spec.md` | "짜증이 곧 스펙이다" |
| 26 | `hello-vibecode.md` | 블로그 소개 (핀 트윗 소재) |
| 27 | `stock-screener.md` | "주식 스크리너 만들어봤다" |
| 28 | `game-in-30-hours.md` | "30시간 만에 게임 만들기" |
| 29 | `typescript-rust.md` | "TypeScript에서 Rust로" |

#### Tier 5: SEO/기타 — 필요 시

| # | 파일 | 비고 |
|---|------|------|
| 30-47 | 나머지 | `about.md`, `kidlin-law.md`, `google-*`, `codex-cli-review.md`, `hinton-job-warning.md`, `openai-code-red.md`, `ai-seven-parts.md`, `ai-wont-replace-storytellers.md`, `ai-efficiency-trap.md`, `age-of-context.md`, `five-minute-docs.md`, `git-save.md`, `implementation-is-free.md`, `three-stages-vs-speckit.md`, `vibe-coding.md`, `github-lego-store.md`, `google-opal.md`, `catching-ai-hallucinations.md` |

---

### 1.2 MUSU Work 문서 — Build-in-Public 콘텐츠 소재

> `Musu-new/work/active/` 폴더 = **프로토타입 → 프로덕션** 실전 기록.
> 이 자체가 블로그 포지셔닝의 증거물이다.

#### 즉시 쓸 수 있는 소재 (스레드 or 블로그 글)

| 소재 | 출처 | 콘텐츠 유형 | 왜 쓸 만한가 |
|------|------|-----------|-----------|
| **Production Gap Analysis** | MUSU-026 (4개 문서) | 스레드 + 블로그 | "AI로 만든 코드의 프로덕션 갭 — 직접 감사해봤다" → 바이럴 잠재력 최고 |
| **15 Pain Points → 전부 해결** | MUSU-026~031 | BIP 스레드 | "15개 프로덕션 문제. 하나도 안 빼고 다 잡았다." → 숫자 펀치 |
| **Rust 849 + TS 5,411 테스트** | INDEX.md | BIP 트윗 | 구체적 숫자 = 신뢰. "테스트 6,260개. 이게 프로덕션이다." |
| **QUIC + HTTP 폴백** | MUSU-020 | 기술 스레드 | "HTTP/3(QUIC) 프로덕션 도입기 — 삽질과 폴백" |
| **Worker Facade 정리** | MUSU-029 Track B | BIP 트윗 | "26.6K LoC에서 public 표면적 줄이기" |
| **Schema SSOT + CI 드리프트 게이트** | MUSU-029 Track A | 기술 스레드 | "JSON Schema로 API 계약 깨짐 방지하기" |
| **mTLS + Production Readiness** | MUSU-028 | 기술 스레드 | "CONDITIONAL GO 판정에서 FULL GO까지" |
| **pgvector 백엔드 전환** | MUSU-028, MUSU-091 | 기술 스레드 | "SQLite → pgvector — 왜, 어떻게, 그리고 삽질" |
| **Desktop App (Tauri 2.0)** | MUSU-023, 041-044, 072, 080, 095 | BIP 시리즈 | "Tauri 2.0으로 데스크톱 앱 만들기 — 진짜 프로덕션" |
| **Security Audit 시리즈** | MUSU-036, 037, 055 | 기술 스레드 | "AI 생성 코드 보안 감사 — 45% 결함률의 현실" |
| **K8s Production Wiring** | MUSU-034, 035 | 기술 스레드 | "K8s에 올리기 전에 알았으면 좋았을 것들" |
| **MCP Hub Bridge Audit** | MUSU-094 | MCP 딥다이브 | "44 MCP 도구 / 7 팩 — 실전 아키텍처" |
| **Google OAuth 구현** | MUSU-099 | 기술 트윗 | "OAuth 구현, 또." |
| **P2P Security Warden** | MUSU_BEE_P2P_SECURITY | 기술 스레드 | "P2P 메쉬의 보안 — 검증된 패턴" |

#### 콘텐츠 변환 규칙

| Work 문서 유형 | → 콘텐츠 형태 | 톤 |
|-------------|------------|-----|
| Gap Analysis / Audit Report | 블로그 글 + 스레드 | 모드 B (각잡기) |
| Pain Points / 삽질기 | 스레드 + 독립 트윗 | 모드 A (싸지르기) |
| 테스트 결과 / 숫자 | BIP 트윗 | 숫자 펀치 (패턴 E) |
| 아키텍처 결정 | 스레드 | 모드 B |
| 보안 감사 | 블로그 글 (가치 높음) | 모드 B |

---

## 2. Week 0: 인프라 세팅 (Day 1)

> **원칙**: 세팅이 90%다. 여기서 삐끗하면 나머지 전부 무의미.

### 체크리스트

| # | 행동 | 담당 | 소요 | 의존성 | 검증 |
|---|------|------|------|--------|------|
| 0-1 | **X Premium 가입** ($8/월) | 사람 | 2분 | 없음 | 프로필에 체크마크 표시 |
| 0-2 | **Beehiiv 계정 생성** | 사람 | 5분 | 없음 | Publication ID 확보 |
| 0-3 | **바이오 작성** | 사람+AI | 10분 | 0-1 | 아래 초안 참조 |
| 0-4 | **핀 트윗 작성+발행** | AI 초안 → 사람 검토 | 10분 | 0-1 | 프로필 최상단에 고정 |
| 0-5 | **타겟 리스트 생성** (X 프라이빗 리스트) | 사람 | 20분 | 0-1 | 15-20명 리스트 |
| 0-6 | **첫 3 스레드 초안** (Tier 1 글 3개) | AI 초안 → 사람 검토 | 1시간 | 없음 | 완성 초안 3개 |
| 0-7 | **블로그에 뉴스레터 구독 CTA 확인** | 사람 | 5분 | 0-2 | 구독 폼 작동 확인 |
| 0-8 | **Bluesky 계정 생성 + 프로필 미러링** | 사람 | 10분 | 없음 | 프로필 완성 |

### 0-3. 바이오 초안

```
I build production systems with AI agents.
Writing about the gap between "it works" and "it handles 10K users."
Weekly deep dives → vibecode.town
```

**규칙**: 160자 이내. 링크 1개. "I help X achieve Y" 공식.

### 0-4. 핀 트윗 초안

```
I spent 6 months building an AI agent runtime.

849 Rust tests. 5,411 TypeScript tests.
15 production pain points found and killed.

Now I'm writing about everything that breaks
between "it works on my machine" and "it handles real users."

Deep dives on production-grade vibe coding,
MCP architecture, and context engineering.

→ vibecode.town
```

**규칙**: 구체적 숫자. 무슨 사람인지 명확. CTA는 블로그 URL.

### 0-5. 리플라이 타겟 리스트

**Tier A (핵심 — 매일 체크)**:
1. @mckaywrigley — 바이브 코딩 대표 (225K+)
2. @swyx — MCP/context engineering (120K+)
3. @simonw — 높은 S/N 비율 (130K+)
4. @alexalbert__ — Anthropic, Claude
5. @amasad — Replit CEO

**Tier B (보조 — 격일)**:
6. @levelsio — 인디해커 (422K+) → "근데 프로덕션은?" 관점
7. @GergelyOrosz — 시니어 엔지니어 (300K+)
8. @kaboroevich — AI dev tools
9. @sdnts — Claude Code 관련
10. @dhh — 개발 철학 (반 AI 관점 활용)

**Tier C (니치 — 주 2-3회)**:
11-15. MCP 서버 제작자들 (PulseMCP 팀, 주요 서버 작성자)
16-20. r/ClaudeAI 활성 유저 중 X 계정 보유자

---

## 3. Week 1: 첫 발사

### Day 1 (월) — 첫 스레드 발사

| 시간 | 행동 | 상세 |
|------|------|------|
| 09:00-09:30 | 타겟 리스트 Tier A 체크 + 리플라이 **15-20개** | **가치 있는 추가 인사이트만.** "Great post!" = 죽음. |
| **10:00** | **스레드 #1 발행** (A카테고리) | `ai-lies.md` 변환 |
| 10:05 | 스레드 리플라이에 블로그 링크 | 링크는 반드시 리플라이에. 본문 금지. |
| 17:00-17:30 | 리플라이 **15-20개** 추가 | Tier A + Tier B 계정 |
| 21:00-21:20 | Bluesky 크로스포스트 + 반응 체크 | 스레드 → Bluesky 재가공 |
| **총 소요** | **90분** | |

### Day 2 (화)

| 시간 | 행동 | 상세 |
|------|------|------|
| 09:00-09:30 | 리플라이 15-20개 | |
| 10:00-10:10 | 독립 트윗 1-2개 발행 | 코드 스크린샷 or TIL |
| 17:00-17:30 | 리플라이 15-20개 | |
| 21:00-21:20 | Bluesky + 반응 체크 | |

### Day 3 (수) — 스레드 #2

| 시간 | 행동 | 상세 |
|------|------|------|
| 09:00-09:30 | 리플라이 15-20개 | |
| **10:00** | **스레드 #2 발행** (B카테고리) | `prompt-formulas.md` 변환 |
| 17:00-17:30 | 리플라이 15-20개 + 스레드 반응 체크 | |
| 21:00-21:20 | Bluesky + 반응 체크 | |

### Day 4 (목)

| 시간 | 행동 | 상세 |
|------|------|------|
| 09:00-09:30 | 리플라이 15-20개 | |
| 10:00-10:10 | 독립 트윗 + BIP 트윗 (MUSU 숫자) | |
| 17:00-17:30 | 리플라이 15-20개 | |
| 21:00-21:20 | Bluesky + 반응 체크 | |

### Day 5 (금) — 스레드 #3 + 주간 리뷰

| 시간 | 행동 | 상세 |
|------|------|------|
| 09:00-09:30 | 리플라이 15-20개 | |
| **10:00** | **스레드 #3 발행** (C카테고리/핫테이크) | `ai-gold-rush.md` 변환 |
| 17:00-17:30 | 리플라이 + **주간 리뷰** (Section 8 체크리스트) | |
| 21:00-21:20 | Bluesky + 반응 체크 | |

### Day 6-7 (토-일)

| 행동 | 상세 |
|------|------|
| 다음 주 스레드 **3개** 초안 | Tier 1에서 #4, #5, #6 변환 |
| 리플라이 퍼포먼스 체크 | 어떤 리플라이가 프로필 클릭 유도했나 |
| 스레드 훅 A/B 검토 | 어떤 훅이 dwell 높았나 |

---

## 4. 스레드 변환 큐 (Week 1-8)

> 주 3개씩 발행 (월/수/금). 8주면 24개 소화. Tier 1~2 전부 커버 + Tier 3 시작.

| Week | 월 스레드 (A카테고리) | 수 스레드 (B카테고리) | 금 스레드 (C/핫테이크) |
|------|---------------------|---------------------|---------------------|
| 1 | `ai-lies.md` — C | `prompt-formulas.md` — G | `ai-gold-rush.md` — F |
| 2 | `vibe-coding-failure.md` — A | `what-vibe-coding-is.md` — A | `can-ai-have-wisdom.md` — D |
| 3 | `nightmare-boss.md` — B | `splitting-decisions.md` — C | `claude-md.md` — E |
| 4 | `environment-design.md` — C | `end-of-prompting.md` — A | `10x-claude.md` — A |
| 5 | `claude-code-prep.md` — B | `spec-kit-field-report.md` — B | `prompting-wrong.md` — A |
| 6 | `anthropic-github.md` — E | `claude-code-2-1.md` — E | `github-spec-kit.md` — B |
| 7 | `refactoring-case-study.md` — B | `rag-basics.md` — C | `rag-choices.md` — C |
| 8 | `rag-in-practice.md` — B | `vector-databases.md` — C | `three-tier-search.md` — C |

### 스레드 변환 프로세스 (AI 편집장 워크플로우)

```
1. Read: 원본 블로그 글 읽기
2. Read: character.md 재확인
3. Extract: 핵심 인사이트 8-12개 추출
4. Hook: 패턴 A~G 중 택 1로 첫 트윗 작성
5. Body: 트윗당 인사이트 1개, 250자 이내
6. Image: 코드 스크린샷 or 다이어그램 1-2개 선정
7. CTA: 마지막 트윗 = 뉴스레터 구독 유도
8. Review: 사람 검토 → 톤 스펙트럼 체크
9. Publish: mcp__twitter__post_tweet → 스레드 발행
10. Link: 리플라이에 블로그 원문 URL 추가
```

---

## 5. Build-in-Public 트윗 큐 (Week 1-8)

> MUSU Work 문서에서 추출. 매주 금요일 or 수요일 발행.

| Week | BIP 트윗 | 소재 출처 | 숫자 |
|------|---------|----------|------|
| 1 | "6,260 tests. 849 Rust + 5,411 TypeScript." | INDEX.md | 6,260 |
| 2 | "Found 15 production pain points in AI-generated code. Fixed all 15." | MUSU-026~031 | 15/15 |
| 3 | "Went from CONDITIONAL GO to FULL GO. Here's what was blocking." | MUSU-028 | 3 blockers |
| 4 | "Month 1 recap: X followers, Y newsletter subs, Z blog visits." | 자체 메트릭 | 실시간 |
| 5 | "26.6K lines of Rust. Cut the public API surface by 40%." | MUSU-029B | 26.6K → -40% |
| 6 | "6 JSON schemas + 10 golden fixtures = 0 API contract drift." | MUSU-029A | 6+10 |
| 7 | "HTTP/3 (QUIC) in production. Fallback to HTTP when it breaks." | MUSU-020 | - |
| 8 | "44 MCP tools. 7 packs. 31 default-active. 13 env-gated." | MUSU-094 | 44/7/31/13 |

---

## 6. 독립 트윗 소재 은행

> 매일 3-5개 중 1-2개 사용. 30분 이상 간격.

### 도자기 비유 (패턴 D)

```
"That viral video of someone making a cup in 30 seconds?

They didn't show you the 3 hours of kneading clay to remove air bubbles.

That's vibe coding courses in 2026.
They sell you the 30-second wheel spin.
The 3 hours of setup? They've never done it."
```

```
"The kiln temperature decides if your pottery survives or shatters.

In AI development, the kiln is:
- Error handling
- Production config
- Database migrations
- Auth flows

The prompt is just the shape you make on the wheel.
The kiln is everything else."
```

### 사기꾼 저격 (패턴 A/F/G)

```
"'Build Spotify in 10 minutes with AI!'

Cool. Now:
- Handle 10K concurrent streams
- Manage music licensing APIs
- Process payments across 40 countries
- Deal with content moderation

Still 10 minutes?"
```

```
"The prompt engineering grift:
- Sell a $200 PDF of ChatGPT screenshots
- Call yourself a 'prompt architect'
- Gate-keep knowledge that's free in the docs

Meanwhile, one CLAUDE.md file does more than 100 'prompt templates.'"
```

### TIL / 숫자 펀치 (패턴 E)

```
"Today's X algorithm fact (verified from source code):

The ranking model predicts 19 engagement signals simultaneously.
18 discrete actions + 1 continuous metric (dwell time).

Candidates CANNOT see each other during scoring.
Your tweet's score depends only on YOU + the viewer.

Not on what else is in their feed."
```

```
"AI-generated code has a ~45% security vulnerability rate.

Not a theory. We audited our own AI-generated codebase.
MUSU-036: security posture audit.
Found. Fixed. Documented.

This is the gap nobody talks about."
```

---

## 7. MCP 자동화 워크플로우

### 스레드 발행 자동화 (Claude Code)

```bash
# 편집장이 실행하는 워크플로우

# Step 1: 원본 글 읽기
# Read tool → /mnt/f/Aisaak/Projects/vibecode-blog/src/data/blog/{파일}.md

# Step 2: character.md 기반 스레드 초안 생성
# AI가 캐릭터 시트 참조하여 8-12 트윗 스레드 작성

# Step 3: 사람 검토/수정
# 톤 스펙트럼 체크: 막걸리에 새우깡 ~ 감튀에 맥주

# Step 4: 트윗 발행
# mcp__twitter__post_tweet → 첫 트윗
# mcp__twitter__post_tweet (reply_to) → 스레드 연결

# Step 5: 리플라이에 링크
# mcp__twitter__post_tweet (reply_to=마지막트윗) → 블로그 URL
```

### 자동화하는 것 / 안 하는 것

| 자동화 O | 자동화 X |
|---------|---------|
| 스레드 초안 생성 | 리플라이 (사람 판단 필수) |
| 스레드 발행 (MCP) | 핫테이크 톤 결정 |
| BIP 트윗 포맷팅 | DM 대화 |
| 블로그 글 → 훅 추출 | 팔로우/언팔로우 |
| 주간 리뷰 데이터 수집 | - |

---

## 8. 주간 리뷰 체크리스트

매주 금요일, 이 체크리스트로 점검한다.

### 수치 기록

| 지표 | Week 1 | Week 2 | Week 3 | Week 4 |
|------|--------|--------|--------|--------|
| 뉴스레터 구독자 (누적) | | | | **목표: 40** |
| 블로그 유입 (from X) | | | | |
| 프로필 클릭 | | | | |
| 왕복 대화 (3+ 리플) | | | | |
| 팔로워 (허영, 참고만) | | | | |

### 질적 점검

- [ ] 이번 주 톤이 character.md 범위 안에 있었나?
- [ ] "Great post!" 리플 안 썼나?
- [ ] 링크를 메인 트윗에 넣은 적 없나?
- [ ] 트윗 간 30분+ 간격 지켰나?
- [ ] 하루 5개 이상 트윗 안 했나?
- [ ] 특정 개인 저격 안 했나? (구조/현상만 저격)

### 판단

| 상태 | 행동 |
|------|------|
| 구독자 증가 속도 < 주 5명 | 리플라이 타겟 재검토. 스레드 훅 변경. 멀티채널 확대. |
| 프로필 클릭 낮음 | 리플라이 내용 점검 — 인사이트 부족할 수 있음 |
| 왕복 대화 0 | 리플라이 대상 재선정. 더 작은 계정 (5K-20K)으로 |
| 블로그 유입 < 50/주 | CTA 위치/문구 점검. 바이오 링크 확인. |

---

## 9. Phase 2 이행 조건 (Month 1 끝)

### 진입 조건

| 조건 | 임계값 |
|------|--------|
| 뉴스레터 구독자 | 20명 이상 (멀티채널 합산) |
| 왕복 대화 | 주 5회 이상 발생 |
| 프로필 클릭 | 증가 추세 |

### Phase 2에서 추가할 것

| 행동 | 이유 |
|------|------|
| Lead Magnet 제작 | "The Vibe Coder's Production Checklist" — 기존 글에서 추출 |
| Dev.to 크로스포스팅 | canonical URL로 SEO 분산 없이 도달 확장 |
| Reddit 참여 | r/ClaudeAI, r/vibecoding — 직접 링크 금지, 가치 먼저 |
| Beehiiv Referral | 구독자가 구독자를 데려오는 루프 |
| MCP 딥다이브 시리즈 | Tier 3 블로그 글 + 새 글 → 주간 시리즈화 |

---

## 10. 비용 & 리소스

### Phase 1 (Month 1)

| 항목 | 비용 | 비고 |
|------|------|------|
| X Premium | $8/월 | 필수. 이거 없이 전략 불가. |
| X API 크레딧 | ~$5-10/월 | 스레드 발행 + 간헐적 검색 |
| Beehiiv | $0 | Free (2,500명까지) |
| **합계** | **~$18/월** | |

### 시간

| 활동 | 소요 |
|------|------|
| 일일 루틴 (리플+트윗+Bluesky) | **90분/일** |
| 주간 스레드 준비 (3개) | **3시간/주** |
| 주간 리뷰 | 30분/주 |
| **주간 총** | **~14시간** |

---

## 11. 즉시 실행 가능한 첫 3개 행동

이 문서를 닫기 전에, **오늘** 할 수 있는 3가지:

### 1. X Premium 가입
→ x.com/i/premium_sign_up → $8/월 결제

### 2. Beehiiv 계정 생성
→ beehiiv.com → Free 플랜 → Publication 생성 → Pub ID 확보

### 3. 첫 스레드 초안 (AI 편집장 작업)
→ `ai-lies.md` 읽기 → character.md 참조 → 8-10 트윗 스레드 초안 → 사람 검토

---

## 편집장의 마지막 말

전략은 끝났다. 3개 문서(00, 01, 02)가 "왜, 뭘, 어떻게"를 다 말했다.
이 문서(03)는 "언제, 어떤 순서로"를 말했다.

이제 남은 건 **X Premium 가입 버튼 누르는 것**뿐이다.

그 버튼을 안 누르면 이 4개 문서 전부 종이 위의 글씨.
누르면 내일부터 리플라이 시작이다.

첫 달 목표는 단 하나: **뉴스레터 구독자 40명 (멀티채널 합산).**

> Month 1은 실패처럼 느껴지는 게 정상이다.
> 100 팔로워까지 ~1,200 코멘트가 필요하다.
> 이건 마라톤이지 스프린트가 아니다. (05-STRATEGY-VALIDATION)
