# Topic Brief — EP01: 스펙 (Spec)

> Phase 0.5 산출물. `/screenplay-research` 실행 결과.
> 이 문서는 Phase 1 (Story Design)과 Phase 2 (Fountain 집필)의 필수 입력이다.

---

## Part 1: Research Summary

### 정의 & 기원
소프트웨어 스펙(Software Specification)은 시스템이 무엇을 해야 하는지 — 요구사항, 동작, 제약, 인터페이스 — 를 코드 작성 전에 기술하는 구조화된 문서. 1984년 IEEE 830으로 최초 표준화, 2001년 Agile Manifesto가 경량 스펙(user story, PRD)으로 전환. 2025-26년 AI 코딩 시대에 "Spec-Driven Development(SDD)"가 재부상 — GitHub spec-kit, AWS Kiro 등.

### 왜 중요한가
- **Barry Boehm 비용 곡선 (1981)**: 요구사항 단계에서 발견한 버그 수정 비용 = **1x**. 프로덕션에서 발견 = **100x**. (TRW/IBM 워터폴 프로젝트 데이터)
- **Standish CHAOS 2020**: IT 프로젝트 **66%**가 부분 또는 완전 실패. #1 실패 원인 = **불완전한 요구사항 (13.1%)**. "요구사항 변경"(8.7%) 합산 시 **21.8%** — 최대 실패 카테고리.
- **1994 CHAOS 원본**: 프로젝트 16.2%만 예산/일정/기능 전부 충족. 31.1%는 완전 취소.

### 베스트 프랙티스
1. **스펙이 먼저, 코드가 나중** — 비즈니스 문제, 성공 메트릭, 입출력, 제약, 엣지 케이스, scope-out 명시
2. **테스트를 스펙에 포함** — 모든 테스트가 요구사항에 매핑 (추적 가능)
3. **살아있는 문서** — 코드와 함께 진화. 변경은 의도적으로 (스펙 수정 = 몇 키스트로크, 프로덕션 코드 수정 = 비싸고 위험)
4. **Markdown + 버전 관리** — IDE에서 렌더, git 추적, AI 에이전트도 파싱 가능
5. **4분면 프레임워크** (058 블로그 원본): 목적(뭘 하려는지) → 이유(왜 안 되는지) → 방법(어떻게 만들지) → 수단(무슨 기술로)

### 바이브코더 안티패턴
1. **세션 간 컨텍스트 단절** — AI 코딩 에이전트는 세션 안에서만 기억. 컨텍스트 창이 닫히면 모든 결정을 잊음. 5개 에이전트가 독립적으로 빌드하면 서로 모순되는 아키텍처, 중복 기능, 비일관적 API 생산.
2. **대규모 코드 중복** — LLM은 대규모 코드베이스 전체를 메모리에 담을 수 없음. 이미 있는 유틸 함수를 모르고 새로 만듦. AI 생산성 30-40% 향상 중 15-25%가 재작업에 소비.
3. **AI는 "왜"를 모름** — 스펙 없는 AI 코드: 결정 이유 기록 없음, 일관된 패턴 없음, 패러다임 랜덤 혼용, 트레이드오프 설명 불가.
4. **보안 사각지대** — 초기 Copilot 연구: 생성 프로그램 **~40%**에 취약점. AI 코드 취약점 발생률은 인간 작성 대비 **1.5-2x** (CodeRabbit 2025). 스펙에 보안 요구사항이 없으면 AI는 auth, input validation, encryption을 넣지 않음.
5. **피드백 루프 보안 열화** — AI와 반복 대화 시 각 이터레이션이 보안을 *악화*시킬 수 있음 (IEEE 2025).

### 케이스 스터디
1. **Healthcare.gov (2013)** — 2011년 계약 체결, 실질 스펙 전달은 2013년 3월 (런칭 7개월 전). 핵심 기술 요구사항(지원 주 수, 사용자 수, 성능 목표) 미정인 상태로 발주. 총 비용 **$1.7B+**. 런칭 2시간 만에 크래시.
2. **Ariane 5 Flight 501 (1996)** — Ariane 4 소프트웨어를 Ariane 5에 재사용하되 새 비행 프로파일에 맞게 스펙을 재검증하지 않음. 64비트→16비트 정수 변환 오버플로. 발사 37초 만에 폭발. **$370M** 손실.
3. **Knight Capital (2012)** — 폐기된 플래그 비트를 재사용하되 스펙/문서 없음. 배포 스크립트도 미검증. 10대 서버 중 1대가 구버전 실행. **45분 만에 $440M 손실**, 회사 매각.

---

## Part 2: Blog Evidence Table

| # | 데이터 포인트 | 값 | 소스 파일 | 정확한 인용/맥락 | 대본 배치 |
|---|-------------|---|----------|----------------|----------|
| 1 | 스펙 없이 쌓인 코드 총 줄수 | **10,847줄** | act1-2-en.md:32 | "Over ten thousand lines. 10,847 to be exact." | SITCOM1 / EXPLAINER |
| 2 | 중복 코드 줄수 | **4,200줄 (≈39%)** | act1-2-en.md:50 | "Almost half was duplicated. 4,200 lines." | EXPLAINER |
| 3 | 독립적으로 빌드한 에이전트 수 | **5개** | act1-2-en.md:52 | "Five agents had built the same function five different ways." | EXPLAINER |
| 4 | 날짜 포맷터 변종 | **3종** (YYYY-MM-DD, MM/DD/YYYY, Unix) | act1-2-en.md:54-56 | "Three date formatters... All three built by different agents. None of them knew about the others." | EXPLAINER |
| 5 | Config 파서 변종 | **2종** (JSON vs env vars) | act1-2-en.md:59-61 | "Two config parsers. One reads JSON. One reads environment variables." | EXPLAINER |
| 6 | 입력 검증 방식 변종 | **4가지** | act1-2-en.md:63-64 | "Four ways to validate input. Every agent had its own way." | EXPLAINER |
| 7 | 보안 취약점 위치 | **847번 줄, 쉘 인젝션** | act1-2-en.md:98-99 | "Line 847. Shell injection." | SITCOM2 |
| 8 | ChatGPT vs Claude Code 시간 | **3시간 vs 5분** | act1-1-en.md:55-56 | "What took three hours with ChatGPT took five minutes." | HOOK/SITCOM1 |
| 9 | 스펙 4분면 프레임워크 | **목적/이유/방법/수단** | 058:392-418 | "Purpose. Reason. Method. Means. ... That's the spec." | EXPLAINER |
| 10 | 스펙 발견 과정 | **짜증→UX→질문→대화→리서치→스펙→MVP** | 058:509-527 | "Frustration. UX. Questions. Conversation. Research. Spec. MVP." | EXPLAINER/ENDING |

### 아하 모먼트
> "What the hell am I even building?"
- 소스: act1-2-en.md:159
- 대본 배치: SITCOM ACT 1 → ACT 2 전환점. Vee가 10,847줄을 스크롤하다 멈추는 순간.

### 감정 여정 비트
1. **자신만만**: "Am I a genius?" — 5분 만에 앱 완성 (act1-1-en.md:106-107)
2. **불안**: "The scariest part? I couldn't tell if it was correct." — 뭐가 맞는지 판단 불가 (act1-1-en.md:153)
3. **붕괴**: "Monday morning. Nothing works." — 전체 시스템 사망 (act1-2-en.md:1-6)
4. **공포**: "Line 847. Shell injection. That's not a bug. That's a door." — 보안 구멍 발견 (act1-2-en.md:98-127)
5. **깨달음**: "What the hell am I even building?" — 첫 번째 진짜 질문 (act1-2-en.md:159)

---

## Part 3: Explainer Script Seeds

### Seed 1: "The Cost of No Spec"
- **연구 근거**: Boehm 비용 곡선 — 프로덕션 버그 수정 비용 100x. Standish: IT 프로젝트 66% 실패, #1 원인 불완전 요구사항.
- **블로그 근거**: 증거 #1(10,847줄), #2(4,200줄 중복), #3(5개 에이전트 독립 빌드)
- **내레이션 초안**:
> "Ten thousand eight hundred forty-seven lines. Almost half of them — duplicates. Five AI agents built the same function five different ways, because nobody wrote down what they were building. Industry data says fixing a requirements mistake in production costs a hundred times more than catching it at the start. Vee didn't know that. She was about to find out."

### Seed 2: "What a Spec Actually Is"
- **연구 근거**: IEEE 830 표준, Agile user stories, 4분면 프레임워크(목적/이유/방법/수단)
- **블로그 근거**: 증거 #9(4분면 프레임워크), #10(짜증→스펙 과정)
- **내레이션 초안**:
> "A spec isn't a hundred-page document nobody reads. It's answering one question first: what are we building, and why? Purpose, reason, method, means — four boxes. The frustration Vee felt? That frustration, organized, IS the spec."

### Seed 3: "Five Agents, Zero Context"
- **연구 근거**: AI 세션 간 컨텍스트 단절, LLM 메모리 한계, 재작업으로 생산성 15-25% 소비
- **블로그 근거**: 증거 #3(5개 에이전트), #4(3개 날짜 포맷터), #5(2개 config 파서), #6(4개 검증 방식)
- **내레이션 초안**:
> "Three date formatters. Two config parsers. Four ways to validate the same input. Every agent started fresh, built from scratch, never asked 'does this already exist?' Without a shared spec, five workers build five different houses on the same lot."

### Seed 4: "Line 847 — The Open Door"
- **연구 근거**: AI 생성 코드 ~40% 취약점 (Copilot 연구), AI 취약점 인간 대비 1.5-2x (CodeRabbit 2025)
- **블로그 근거**: 증거 #7(쉘 인젝션), #8(코드 못 읽어서 발견 지연)
- **내레이션 초안**:
> "Line eight forty-seven. A shell injection. Type the right command into a username field, and the server obeys. Studies show forty percent of AI-generated code contains vulnerabilities. If the spec doesn't say 'validate all input,' AI won't add it. Vee's spec said nothing about security. So line 847 became an open door."

---

## Part 4: Recommended Sources

| 소스 | 유형 | 관련성 |
|------|------|--------|
| Barry Boehm, "Software Engineering Economics" (1981) | book | 비용 곡선 원본 데이터 |
| IEEE 830-1998 / ISO/IEC/IEEE 29148:2018 | standard | SRS 표준 정의 |
| Standish Group CHAOS Report (1994, 2020) | report | 프로젝트 실패율 + 원인 통계 |
| Addy Osmani, "How to write a good spec for AI agents" | article | 2026 SDD 실무 가이드 |
| Martin Fowler, "SDD Tools" | article | spec-kit, Kiro, Tessl 비교 |
| Healthcare.gov GAO Report (GAO-14-694) | report | 스펙 실패 케이스 공식 분석 |
| Ariane 5 Inquiry Board Report (ESA) | report | 스펙 재검증 실패 사례 |
| GitHub Copilot Security Study (~40% vulnerability rate) | paper | AI 코드 보안 통계 |

---

## Phase 0.5 Gate

- [x] 웹 리서치 5가지 질문 전부 답변 (정의, 중요성, 모범사례, 안티패턴, 사례)
- [x] 증거 테이블에 구체적 데이터 포인트 10개 (목표 5개+)
- [x] 아하 모먼트 정확한 소스와 함께 식별 (act1-2-en.md:159)
- [x] Explainer Script Seeds 4개, 각각 연구+블로그 근거 보유
- [ ] **유저 승인**
