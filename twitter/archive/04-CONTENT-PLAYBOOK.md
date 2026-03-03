# 콘텐츠 플레이북: 뭘 올리는가

> **이 문서가 답하는 질문**: "X에 뭘 올릴 건데?"
> **이전 문서들이 답한 것**: 왜 하는가(00), 팩트(01), 전략(02), 실행 순서(03)
> **검증**: 05-STRATEGY-VALIDATION.md (비율 수정 + 영상 추가 반영)
> **03의 '독립 트윗 소재 은행'을 대체한다.** 캐릭터 시트 복붙은 콘텐츠가 아니다.

---

## 0. 핵심 구분: 캐릭터 ≠ 콘텐츠

| | 캐릭터 (HOW) | 콘텐츠 (WHAT) |
|--|--|--|
| 정체 | 말투, 톤, 비유, 태도 | 전달하는 **기술적 실체** |
| 예시 | 직설적, 빡침 기반, 자기비하, 짧은 문장 | "5,405 테스트 통과했는데 프로덕션 갭 69개" |
| 역할 | 같은 내용도 이 사람답게 들리게 만든다 | 읽는 사람이 **가져가는 가치** |
| 없으면 | 아무나 쓴 글 | 잘 쓰여도 빈 깡통 |

**규칙: 캐릭터로 콘텐츠를 전달하지, 캐릭터 자체를 콘텐츠로 올리지 않는다.**

"도자기 비유가 멋있으니까 도자기 트윗을 올리자" = 틀림.
"QUIC 프로덕션 도입 삽질기를 도자기 비유의 톤으로 쓰자" = 맞음.

---

## 1. 블루오션 3개 × 보유 재료 매핑

리서치에서 확인된 3개 빈 자리(01-DEEP-RESEARCH):

| 블루오션 | 왜 비어있나 | 우리가 가진 재료 |
|---------|-----------|---------------|
| **(A) 프로토→프로덕션 갭** | "만들기"만 가르치고 "굴리기"를 안 가르침 | 블로그 11개 + MUSU-026/027/028/036 |
| **(B) MCP / Context Engineering** | 전용 뉴스레터/블로그 = 0개 | 블로그 14개 + MUSU-029/094 |
| **(C) Build-in-Public (증거)** | "진짜 만드는 사람"을 증명 | MUSU work 전체 + 테스트 숫자 |

---

## 2. 콘텐츠 카테고리 정의

### 카테고리 A: "프로토타입은 프로덕션이 아니다" 시리즈

> **블루오션 (A)에 직격. 이게 메인 콘텐츠.**

**이 카테고리가 전달하는 가치**: AI로 만든 코드를 실제로 운영하려면 뭘 해야 하는지.

| # | 콘텐츠 소재 | 출처 | 핵심 인사이트 (남이 가져가는 것) | 형태 |
|---|-----------|------|---------------------------|------|
| A1 | 테스트 5,405개 통과 → 프로덕션 갭 69개 | MUSU-026 | "테스트 통과 ≠ 프로덕션 준비 완료. 환경변수 이름 불일치 하나로 인증이 꺼진다." | 스레드 |
| A2 | Shell injection → execFile 전환 | MUSU-026 Phase A | "AI가 생성한 `exec()` 호출 — 프로덕션에서는 command injection 벡터. execFile()로 바꿔라." | 단독 트윗 + 코드 스크린샷 |
| A3 | 보안 감사 B- → B+ (5일) | MUSU-036 | "보안 기능이 많아도 경계가 열려있으면 소용없다. mTLS 있는데 env 불일치로 인증 꺼짐." | 스레드 |
| A4 | 10,847줄 → 3,562줄 리팩토링 | refactoring-case-study.md | "5개 AI 에이전트가 만든 스파게티. 30% 실패율 → 3%. 비결: Spec Kit + Rust 부분 재작성." | 스레드 |
| A5 | 45분 → 12분 런타임 | refactoring-case-study.md | "Python 데이터 수집 → Rust: 45분 → 1.5분 (30x). 메모리 500MB → 100MB." | 단독 트윗 + 벤치마크 |
| A6 | Auth fail-closed 패턴 | MUSU-026 Phase A | "MUSU_ENV=production일 때 시크릿 없으면 panic. Fail-open은 프로덕션에서 죽는다." | 단독 트윗 |
| A7 | Idempotency race → LRU+TTL cache | MUSU-026 Phase B | "HashMap으로 중복 요청 막았다가 레이스 컨디션. 원자적 check_and_insert + TTL 24h." | 단독 트윗 + 코드 |
| A8 | 스펙 없이 만들면 일어나는 일 | what-vibe-coding-is.md + nightmare-boss.md | "바이브 코딩의 진짜 문제: '이 변경이 사소한 수정인지 방향 전환인지' 비개발자는 구분 못 한다." | 스레드 |
| A9 | "구현은 공짜, 오케스트레이션이 비용" | implementation-is-free.md | "AI가 같은 기능을 왜 또 만드는가? SSOT가 없으니까. 스펙 1개인데 결과물 30개." | 스레드 |
| A10 | Typed language가 바이브 코딩에 나은 이유 | typescript-rust.md | "Python: 실행해야 에러. TS: 컴파일러가 즉시 잡음. Rust: 컴파일러가 때림. 타입 = 안전장치." | 스레드 |
| A11 | "짜증이 곧 스펙이다" | frustration-is-the-spec.md | "불편함을 질문으로 바꾸면 재료가 된다. 4칸: 목적/이유/방법/수단." | 단독 트윗 |
| A12 | Spec Kit 실전 리포트 | spec-kit-field-report.md | "계획 20개 중 8개 구현(40%). 근데 안정성 200%. 계획의 가치는 완성률이 아니라 방향." | 스레드 |
| A13 | Google OAuth 웹+데스크톱 통합 삽질 | MUSU-099 | "Google OAuth custom URL scheme 미지원 → localhost:8089 임시 HTTP 서버. PKCE는 필수." | 단독 트윗 + 코드 |

### 카테고리 B: "Context Engineering" 시리즈

> **블루오션 (B)에 직격. 기존 블로그 14개가 탄약.**

**이 카테고리가 전달하는 가치**: 프롬프트 공식이 아니라 AI가 일하는 환경을 설계하는 법.

| # | 콘텐츠 소재 | 출처 | 핵심 인사이트 | 형태 |
|---|-----------|------|-----------|------|
| B1 | CLAUDE.md 500줄 → 87줄 | claude-md.md | "87줄이 수백 번의 반복 설명을 죽였다. AI에게 기억을 주는 게 아니라 습관을 심는 것." | 스레드 |
| B2 | 프롬프트 시대는 끝났다 | end-of-prompting.md | "프로젝트는 폴더지, 채팅이 아니다. 터미널 AI는 폴더를 읽고, 파일을 만들고, 세션이 바뀌어도 맥락이 남는다." | 스레드 |
| B3 | 환경설계 > 프롬프트 | environment-design.md | "말은 증발한다. 환경은 남는다. Rust 스캐폴딩 = AI가 따를 수밖에 없는 구조." | 스레드 |
| B4 | 8단계 컨텍스트 순서 | splitting-decisions.md | "AI에게 한 번에 다 주지 마라. 한 입씩 줘라. 8단계 시퀀스." | 스레드 |
| B5 | Claude Code 2.1 멀티에이전트 | claude-code-2-1.md | "1,096 커밋. 싱글 에이전트 → 멀티에이전트. 테스트+문서+빌드 동시 = 25분 → 10분." | 스레드 |
| B6 | RAG = 생성 전 검색 | rag-basics.md | "AI가 거짓말하는 이유 2개: (1) 파일 안 읽고 말함 (2) 연결 관계 모르고 수정함. 해결: 먼저 찾고." | 스레드 |
| B7 | RAG는 검색이 아니라 선택 | rag-choices.md | "3개 파일 붙이면 그 3개가 AI의 세계. 범용 RAG가 아니라 목적 기반 RAG." | 단독 트윗 |
| B8 | 3-tier 검색 아키텍처 | three-tier-search.md | "일상복(JSON+TF-IDF) / 외출복(ChromaDB) / 금고 양복(pgvector 하이브리드). 위에서부터 시작." | 스레드 + 다이어그램 |
| B9 | 1,624쪽 PDF → 3초 검색 | rag-in-practice.md | "37분 수동 검색 → 3초. 리서치 시간 91% 감소. 글 생산량 4배." | 단독 트윗 + 숫자 |
| B10 | MCP 허브 = 컨텍스트 비용 | MUSU-094 | "MCP 도구 52개 기본 + 11개 env-gated. 컨텍스트 ≠ 공짜. 프로파일 + 게이트로 표면 줄여라." | 단독 트윗 |
| B11 | Schema SSOT + CI 드리프트 게이트 | MUSU-029 | "코드 복제 2개가 '우연히 일치'. JSON Schema 1개로 통합 → CI가 불일치를 잡는다." | 단독 트윗 + 코드 |
| B12 | Anthropic GitHub 53개 레포 분석 | anthropic-github.md | "블로그 팁 그만 읽어라. Claude에게 Anthropic GitHub 53개 레포를 먹여라. 30분 후 자기 매뉴얼을 쓴다." | 스레드 |
| B13 | 벡터 DB 핵심 | vector-databases.md | "LLM은 문장 이어쓰기 머신이지 검색 머신이 아니다. 시맨틱 갭을 벡터 임베딩이 메운다." | 스레드 |

### 카테고리 C: "숫자로 증명" (Build-in-Public)

> **블루오션 (C). 위 A, B의 신뢰 기반.**

**이 카테고리가 전달하는 가치**: "이 사람은 진짜 만들고 있다"는 증거.

| # | 콘텐츠 | 핵심 숫자 | 형태 |
|---|--------|---------|------|
| C1 | Rust 849 + TS 5,411 테스트 | 6,260 | 단독 트윗 |
| C2 | 15 pain points 전부 해결 | 15/15 | 단독 트윗 |
| C3 | Worker 26.6K LoC — public 표면적 73% 축소 | 54→14 re-exports | 단독 트윗 |
| C4 | QUIC primary + HTTP fallback 프로덕션 투입 | 실패 3회→폴백, 성공 5회→복구 | 단독 트윗 |
| C5 | P2P 경제학: 서버 비용 95% 절감 | $40K → $2K/100만 유저 | 단독 트윗 |
| C6 | 월간 메트릭 (구독자, 트래픽, 팔로워) | 실시간 | 월 1회 스레드 |
| C7 | CONDITIONAL GO → FULL GO 판정 과정 | 3개 블로커 | 스레드 |
| C8 | 44 MCP 도구 / 7 팩 구조 | 44/7/31/13 | 단독 트윗 |

---

## 3. 콘텐츠 비율

| 카테고리 | 비율 | 왜 |
|---------|------|-----|
| **(A) 프로토→프로덕션** | **40%** | 메인 포지셔닝. 경쟁자 없음. 가장 큰 빈 자리. |
| **(B) Context Engineering** | **30%** | 두 번째 빈 자리. 블로그 글 14개가 탄약. |
| **(C) Build-in-Public 숫자** | **15%** | A, B의 신뢰 기반. 숫자 없으면 말만 하는 사람. |
| **(D) 영상 콘텐츠** | **15%** | Month 2-3부터 도입. X 영상 +29% YoY 성장. 전환율 +41%. |

> **비율 변경 근거**: 05-STRATEGY-VALIDATION §3.1 — 영상 콘텐츠 전환율이 텍스트 대비 41% 높음.
> Month 1은 A/B/C 텍스트에 집중, Month 2-3부터 D(영상) 15% 도입.

**리플라이는 비율 밖.** 리플라이는 위 A/B/C/D 내용을 기반으로 다른 사람 대화에 기여하는 것이지, 별도 카테고리가 아니다.

---

## 4. 형태별 가이드

### 4.1 스레드 (주 3회 — 월/수/금)

**용도**: 블로그 글 변환. 깊이 있는 기술 인사이트 전달.

**구조**:
```
트윗 1: 구체적 숫자 or 반직관적 사실로 시작
        "5,405 tests passed. Still found 69 production gaps."
        "87 lines of CLAUDE.md killed hundreds of repeated explanations."

트윗 2-9: 문제 → 시도 → 실패 → 해결 → 교훈
          트윗당 인사이트 1개. 250자 이내.
          코드 스크린샷 or 다이어그램 1-2장.

트윗 10-11: 교훈 (= 남이 가져가는 것)
           "Tests ≠ Safety. Tests prove features work.
            Safety proves features don't break others."

트윗 12: CTA → "매주 더 깊은 내용 → vibecode.town"
         링크는 리플라이에.
```

**훅 규칙** (character.md 패턴이 아니라 내용 기반):
- 구체적 숫자로 시작 ("10,847 lines → 3,562 lines")
- 반직관적 사실 ("Tests passed. Production broke.")
- 문제 선언 ("AI-generated code has a ~45% security vulnerability rate.")
- **절대 안 하는 것**: "Here's what nobody tells you about..." (클리셰)

### 4.2 단독 트윗 (매일 1-2개)

**용도**: 하나의 기술 인사이트를 짧게.

**구조**:
```
사실 or 경험 (1-2문장)
→ 왜 그런가 or 어떻게 해결했는가 (1-2문장)
→ 교훈 (1문장)

코드 스크린샷 있으면 붙인다.
```

**예시 (소재 A2 — Shell injection)**:
```
AI generated exec() calls in our codebase.

In development: works fine.
In production: command injection vector.

Fix: execFile() — no shell interpretation.

One function name. Security gap closed.
```

**예시 (소재 B9 — RAG 시간 절감)**:
```
1,624 pages of research PDFs.
37 minutes to find 3 useful paragraphs.

Built a RAG pipeline:
- 2,157 chunks
- Auto-tagged (War 427, Diplomacy 213, Economy 189)
- SQLite FTS5

Same search: 3 seconds.
Research output: 3 articles/week → 12.
```

**예시 (소재 C5 — P2P 경제학)**:
```
P2P ≠ zero server cost.
P2P = 95% cost reduction.

Our numbers:
- 85% traffic: direct P2P (LAN mDNS → NAT hole punching)
- 15% traffic: relay fallback

1M users: ~$2,000/mo
Slack equivalent: ~$40,000/mo

Trade server cost for NAT complexity.
```

### 4.3 코드 스크린샷 트윗

**용도**: 실제 코드로 기술 포인트 증명.

**도구**: Carbon (carbon.now.sh) or Ray.so
**규칙**:
- 코드만 올리지 않음. 위에 "이게 왜 중요한지" 1-2줄.
- 접근성: 리플라이에 GitHub gist 링크.
- 10줄 이내. 핵심만.

**예시 (소재 A7 — Idempotency)**:
```
HashMap for deduplication?
Race condition waiting to happen.

[코드 스크린샷: LRU+TTL atomic check_and_insert]

10K max entries. 24h TTL.
Atomic insert-or-reject.

No more duplicate requests in production.
```

### 4.4 리플라이

**용도**: 다른 사람 대화에 **위 A/B/C 내용으로** 기여.

**예시 상황**: @mckaywrigley가 "just shipped a vibe coded app!" 올림
**리플라이**:
```
Nice.
Now the real work starts.

We ran a production gap audit on our AI-generated codebase.
5,400+ tests passing. Still found 69 gaps.

Biggest surprise: env var naming mismatch
silently disabled auth in production mode.

Tests prove features work.
They don't prove features are safe.
```

→ "Great post!" 가 아니라 **A1 소재의 구체적 인사이트**로 대화에 기여.

---

## 5. 8주 콘텐츠 캘린더

### 발행 규칙
- 월/수/금: 스레드 (10AM EST)
- 화/목: 단독 트윗 + 코드 스크린샷 (오전 10시 전후)
- 매일: 리플라이 **30-50개** (A/B/C 내용 기반)
- 금: BIP 숫자 트윗 (C 카테고리) + 주간 리뷰

### Week 1-8 스레드 큐 (주 3회)

| Week | 월 (A카테고리) | 수 (B카테고리) | 금 (C/핫테이크) |
|------|-------------|-------------|-------------|
| 1 | A4: 10,847줄→3,562줄 리팩토링 | B1: CLAUDE.md 500→87줄 | A1: 테스트 5,405개 → 갭 69개 |
| 2 | A8: 스펙 없이 만들면 생기는 일 | B2: 프롬프트 시대 끝 | C7: CONDITIONAL GO→FULL GO |
| 3 | A3: 보안 감사 B-→B+ (5일) | B4: 8단계 컨텍스트 순서 | A9: 구현은 공짜, 오케스트레이션 |
| 4 | A10: 타입 언어가 바이브코딩에 나은 이유 | B5: Claude Code 멀티에이전트 | C6: 월간 메트릭 리뷰 |
| 5 | A12: Spec Kit 실전 40%→안정성 200% | B6: RAG = 생성 전 검색 | A2: Shell injection→execFile |
| 6 | A5: 45분→12분 런타임 Rust 전환 | B8: 3-tier 검색 아키텍처 | B12: Anthropic GitHub 53개 레포 |
| 7 | A13: Google OAuth 통합 삽질 | B3: 환경설계 > 프롬프트 | B13: 벡터 DB 핵심 |
| 8 | A6: Auth fail-closed 패턴 | B9: 1,624쪽→3초 RAG | C5: P2P 경제학 95% 절감 |

### 단독 트윗 로테이션 (화/목)

| 화 | 목 |
|----|-----|
| A 소재 1개 (코드 스크린샷) | B 소재 1개 |
| C 숫자 1개 | A 보충 1개 |

---

## 6. 콘텐츠 생산 워크플로우

### 스레드 생산 (AI 편집장)

```
입력:
  1. 블로그 글 원문 OR MUSU work 문서
  2. character.md (톤 참조)
  3. 이 문서의 카테고리별 "핵심 인사이트" 컬럼

프로세스:
  1. 원문에서 기술적 실체 추출 (숫자, 코드, before/after)
  2. 훅 작성: 구체적 숫자 or 반직관적 사실
  3. 본문: 문제 → 시도 → 결과 → 교훈
  4. 톤 체크: character.md 스펙트럼 안에 있는가?
  5. CTA + 링크(리플라이에)

체크:
  - [ ] 남이 가져가는 기술적 가치가 있는가?
  - [ ] 캐릭터 시트를 콘텐츠로 올리고 있지는 않은가?
  - [ ] 구체적 숫자 or 코드가 포함되어 있는가?
  - [ ] 링크가 메인 트윗에 없는가? (리플라이에만)
```

### 단독 트윗 생산 (AI 편집장)

```
입력:
  1. 위 소재 목록 (A1-A13, B1-B13, C1-C8)
  2. character.md

프로세스:
  1. 소재 1개 선택
  2. 핵심 인사이트 1개만 추출
  3. 3-5문장으로 압축
  4. 코드 스크린샷 필요하면 준비
  5. 톤 체크

체크:
  - [ ] 인사이트 1개만 전달하는가? (2개 이상 = 스레드로)
  - [ ] 도자기 비유나 사기꾼 저격 "자체"가 콘텐츠가 되고 있지 않은가?
```

---

## 7. 리플라이 가이드

### 리플라이 = 위 소재를 대화에 녹이는 것

**상황별 매핑:**

| 타겟이 올린 내용 | 꺼낼 소재 | 리플라이 방향 |
|---------------|---------|-----------|
| "바이브 코딩으로 앱 만들었다!" | A1, A8 | "프로토타입 다음이 진짜. 우리도 테스트 5K 통과 후 갭 69개 발견." |
| "프롬프트 엔지니어링 팁" | B1, B2, B3 | "프롬프트보다 CLAUDE.md 87줄이 낫다. 환경이 남고 말은 증발한다." |
| "RAG 구현 질문" | B6, B7, B8, B9 | "목적 기반 RAG로 37분→3초. 범용 RAG는 함정." |
| "AI 보안 우려" | A2, A3, A6 | "직접 감사해봤다. B- → B+ 5일. 가장 큰 구멍: env 불일치로 인증 무효화." |
| "MCP 서버 만들었다" | B10, B11, C8 | "우리는 44개 도구 / 7팩. 컨텍스트 비용이 진짜 문제. 프로파일로 표면 줄여라." |
| "인디해커 서버 비용 고민" | C5 | "P2P = 95% 비용 절감. 1M 유저 $2K/월. 다만 NAT 복잡도 트레이드오프." |
| "Rust vs TypeScript" | A5, A10 | "Python 45분 → Rust 1.5분. 30x. 타입 시스템 = 바이브 코딩의 안전장치." |
| "Claude Code 팁" | B1, B5, B12 | "Anthropic GitHub 53개 레포 먹여봐라. 30분 후 자기 매뉴얼 쓴다." |

---

## 8. 영상 콘텐츠 소재 (카테고리 D) — 검증 후 추가

> **근거**: X 영상 +29% YoY, 전환율 +41%. (05-STRATEGY-VALIDATION §3.1)
> **시작**: Month 2-3. Month 1은 텍스트 집중.

### D 소재 목록

| # | 영상 소재 | 출처 | 형태 | 길이 |
|---|---------|------|------|------|
| D1 | Rust 빌드 터미널 스크린캐스트 | MUSU Work | 터미널 녹화 | 30초 |
| D2 | 코드 리팩토링 before/after | refactoring-case-study.md | 스플릿 스크린 | 45초 |
| D3 | MCP 3개 서버 동시 실행 | MUSU-094 | 터미널 녹화 | 30초 |
| D4 | RAG 파이프라인: 37분→3초 | rag-in-practice.md | 스크린캐스트 | 45초 |
| D5 | MUSU Bee 데스크톱 앱 미리보기 | Tauri 앱 | 앱 데모 | 60초 |
| D6 | Claude Code 멀티에이전트 동시 작업 | claude-code-2-1.md | 터미널 녹화 | 45초 |
| D7 | QUIC→HTTP 폴백 실시간 | MUSU-020 | 네트워크 모니터 | 30초 |
| D8 | 보안 감사 diff: B-→B+ | MUSU-036 | 코드 diff | 45초 |

### 영상 규칙

- **30-60초.** 그 이상은 YouTube로.
- **자막 필수** — 70% 무음 시청.
- **마지막 5초**: "Full breakdown in the newsletter → vibecode.town" CTA.
- **텍스트 트윗이 이미지보다 참여율 30% 높음.** 영상은 일상용이 아니라 **전환용(CTA)**에 집중.
- 영상 단독 발행보다 **텍스트 트윗 + 영상 리플라이** 조합이 효과적.

---

## 9. 금지 사항 (갱신)

| 금지 | 이유 |
|------|------|
| 도자기 비유 트윗 (비유 자체가 콘텐츠) | 캐릭터 ≠ 콘텐츠. 비유는 톤이지 내용이 아니다. |
| 사기꾼 저격 트윗 (저격 자체가 콘텐츠) | 적 정의는 포지셔닝 도구지 콘텐츠가 아니다. |
| 기술적 실체 없는 의견 트윗 | "AI is overhyped" = 빈 깡통. 숫자/코드/경험 없으면 안 올린다. |
| character.md 훅 패턴을 그대로 트윗 | 패턴 A~G는 글쓰기 도구지 콘텐츠가 아니다. |

**대신 하는 것:**
기술적 인사이트(A/B/C)를 character.md의 톤으로 전달한다.
도자기 비유가 필요하면 기술적 내용을 설명하는 **비유로** 쓴다, 비유 **자체를** 쓰지 않는다.

---

## 마지막: 콘텐츠의 진짜 테스트

모든 트윗/스레드를 올리기 전에 이 질문:

**"이 트윗을 읽은 개발자가 가져가는 기술적 가치가 뭔가?"**

답이 없으면 올리지 않는다.
답이 "재밌다" "공감한다"뿐이면 올리지 않는다.
답이 "이걸 내 프로젝트에 적용할 수 있다"면 올린다.

캐릭터는 그 가치를 **이 사람답게** 전달하는 옷이다.
옷만 걸치고 알몸으로 나가지 마라.
