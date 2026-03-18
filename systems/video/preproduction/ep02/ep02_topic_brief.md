# Topic Brief — EP02: Spec-Driven Dev가 뭔대 (What Is Spec-Driven Dev?)

> Phase 0.5 산출물. `/screenplay-research` 실행 결과.
> 이 문서는 Phase 1 (Story Design)과 Phase 2 (Fountain 집필)의 필수 입력이다.
> **v6.0**: 시리즈 리프레임 — EP02는 "스펙이 뭔가?"를 비개발자 눈높이로 재정의

---

## Part 1: Research Summary

### 정의 & 기원
**Spec-Driven Development (SDD)**: 코드를 쓰기 전에 "뭘 만들 건지"를 먼저 적는 것. 100페이지 문서가 아니다. **3줄이면 된다**: Goal (뭘 만드나) / Constraints (뭘 안 하나) / Done-when (언제 끝인가).

2025-26년 AI 코딩 시대에 재부상. GitHub spec-kit, AWS Kiro가 이 접근법을 도구화. Kiro: "Vibe coding can require too much guidance on complex tasks" → spec-driven dev가 "fewer shots for complex tasks."

### 왜 중요한가
- **스펙 없이 AI를 쓰면**: 5개 세션이 5가지 다른 결과를 만듦
- **스펙 있이 AI를 쓰면**: 결과가 수렴함
- **Boehm 비용 곡선 (1981)**: 프로덕션에서 발견한 버그 수정 비용 = 요구사항 단계의 **100x**
- **Standish CHAOS 2020**: IT 프로젝트 **66%** 부분/완전 실패. #1 원인 = 불완전 요구사항
- **블로그 실증**: 10,847줄 코드 중 4,200줄(39%) 중복 — 스펙 없이 5개 에이전트가 독립 빌드

### 베스트 프랙티스: 3줄 스펙
```
Goal: [뭘 만드나 — 한 줄]
Constraints: [뭘 안 하나 / 제약 조건]
Done-when: [이게 되면 끝이다]
```

### 도구
1. **CLAUDE.md** — Claude Code의 프로젝트 컨텍스트 파일. AI가 매 세션마다 읽음.
2. **.cursorrules** — Cursor의 프로젝트 규칙 파일. 코딩 스타일, 제약 조건 정의.
3. **spec-kit (GitHub)** — Specify → Plan → Tasks → Implement. 4단계 워크플로우.
4. **Kiro (AWS)** — EARS 표기법으로 자연어→요구사항→아키텍처→태스크 자동 분해.

### 바이브코더 안티패턴
1. **"자세히 말하면 되겠지"** — 프롬프트를 길게 쓸수록 AI가 더 혼란. 방향이 아니라 디테일만 늘어남.
2. **매번 새 세션** — 이전 맥락을 잊음. 5개 세션 = 5명의 낯선 사람이 같은 건물을 각각 짓는 것.
3. **스펙 = 거창한 문서** — 100페이지를 상상하고 포기함. 3줄이면 충분.

### 케이스 스터디
1. **블로그 저자의 실증** (058): 좌절→질문→대화→리서치→스펙→MVP. "Frustration. UX. Questions. Conversation. Research. Spec. MVP."
2. **10,847줄 사례** (act1): 스펙 없이 쌓은 코드 10,847줄, 4,200줄 중복, 5개 에이전트 독립 빌드.
3. **GitHub spec-kit**: "Intent is source of truth, not code" — 의도가 진실의 원천.

---

## Part 2: Blog Evidence Table

| # | 데이터 포인트 | 값 | 소스 파일 | 대본 배치 |
|---|-------------|---|----------|----------|
| 1 | 코드 총 줄수 | **10,847줄** | act1-en.md | THE_CRACK |
| 2 | 중복 줄수 | **4,200줄 (39%)** | act1-en.md | THE_CRACK |
| 3 | 독립 빌드 에이전트 수 | **5개** | act1-en.md | MISCONCEPTION |
| 4 | 좌절→스펙 과정 | 짜증→UX→질문→대화→리서치→스펙→MVP | 058 | CORE |
| 5 | 4분면 프레임워크 | 목적/이유/방법/수단 | 058 | CORE |
| 6 | spec-kit 4단계 | Specify→Plan→Tasks→Implement | 004 | CORE |
| 7 | "Intent is source of truth" | 코드가 아니라 의도가 진실의 원천 | 004 | REFRAME |
| 8 | Kiro SDD | "fewer shots for complex tasks" | 리서치 | CORE |
| 9 | Boehm 비용 곡선 | 프로덕션 수정 비용 100x | 리서치 | CORE |
| 10 | CHAOS 실패율 | 66% 실패, #1 원인 = 불완전 요구사항 | 리서치 | CORE |

### 아하 모먼트
> "좌절이 곧 스펙이다. 네 짜증을 정리하면 그게 설계도다."
- 소스: 058-frustration-is-the-spec.md
- 대본 배치: CORE → REFRAME 전환점

### 감정 여정 비트
1. **자신감**: EP01에서 배웠으니 이제 잘 할 수 있다!
2. **혼란**: AI에게 시켰더니 5가지 다른 게 나왔다
3. **좌절**: 자세히 말할수록 더 꼬인다
4. **명확함**: 3줄이면 된다 — Goal / Constraints / Done-when
5. **자신감**: 이 템플릿을 쓸 수 있겠다

---

## Part 3: Explainer Script Seeds

### Seed 1: "Five Sessions, Five Buildings"
- **연구 근거**: AI 세션 간 컨텍스트 단절, 재작업 15-25%
- **블로그 근거**: 10,847줄, 4,200줄 중복, 5개 에이전트
- **내레이션 초안**:
> "Ten thousand eight hundred forty-seven lines of code. Almost half — duplicates. Five AI sessions built the same thing five different ways, because none of them knew about the others. No shared blueprint. Five construction crews on the same lot, each with their own plan."

### Seed 2: "Three Lines Is Enough"
- **연구 근거**: Agile user stories, spec-kit 4단계
- **블로그 근거**: 058 좌절→스펙 과정, 004 spec-kit
- **내레이션 초안**:
> "A spec isn't a hundred pages. It's three lines. Goal: what are you building? Constraints: what are you NOT building? Done-when: how do you know it's finished? That's it. Three lines. Write them before you write a single prompt."

### Seed 3: "Frustration IS the Spec"
- **연구 근거**: 058 좌절→스펙 전환
- **내레이션 초안**:
> "Here's what nobody tells you. That frustration you feel when AI makes the wrong thing? That's not failure. That's data. Write down what annoyed you. 'It should have done X but did Y.' Congratulations — you just wrote a requirement. Organize your frustrations and you've got a spec."

### Seed 4: "Before and After"
- **연구 근거**: Boehm 비용 곡선, Kiro SDD 결과
- **내레이션 초안**:
> "Without a spec: five attempts, five different results, three hours wasted. With a spec: first attempt lands close, second attempt nails it, twenty minutes total. The spec didn't make AI smarter. It made your instructions clearer."

---

## Part 4: Recommended Sources

| 소스 | 유형 | 관련성 |
|------|------|--------|
| 058-frustration-is-the-spec.md | blog | 좌절→스펙 여정 원본 |
| 004-github-spec-kit.md | blog | spec-kit 도구 소개 |
| act1-en.md | blog | 10,847줄 실증 데이터 |
| Barry Boehm, "Software Engineering Economics" | book | 비용 곡선 |
| Standish CHAOS Report 2020 | report | 프로젝트 실패율 |
| AWS Kiro Launch Blog | article | Spec-driven dev IDE |
| GitHub spec-kit README | docs | 4단계 워크플로우 |

---

## Phase 0.5 Gate

- [x] 웹 리서치 5가지 질문 전부 답변
- [x] 증거 테이블에 구체적 데이터 포인트 10개 (목표 5개+)
- [x] 아하 모먼트 정확한 소스와 함께 식별
- [x] Explainer Script Seeds 4개, 각각 연구+블로그 근거 보유
- [ ] **유저 승인**
