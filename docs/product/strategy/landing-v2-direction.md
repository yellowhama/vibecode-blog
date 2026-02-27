# Landing v2 — "The Operator Beneath Your AI"

> 상태: v2.2 최종 정밀 다듬기, 구현 대기
> 결정일: 2026-02-20
> 최종 수정: 2026-02-20 (밀도 조정 + 톤 정제)

---

## 배경

기존 랜딩(v6.1)은 철학·구조 설명에 매우 좋다.
하지만 "타겟을 찌르는 랜딩"은 아니다.

**방향**: 기존 랜딩에서 좋은 것만 추출 → 타겟 중심 버전으로 재조합.
**기존 랜딩**: `/structure` 페이지로 이동 (철학·구조 상세).

---

## 핵심 결정

| 항목 | 결정 |
|------|------|
| 타겟 | 바이브 코더 전체 |
| 포지션 | 안전장치 + 운영자 |
| 톤 | 차분하지만 강하게 — 운영자 톤 |
| 카테고리 | AI Operator Layer |
| 메인 문장 | "Keep your AI. Add an operator." |
| 킬러 카피 | "AI writes code. MUSU decides if it lives." (절대 건드리지 않음) |
| 한 줄 정의 | "A deterministic operator beneath your AI." |
| 기존 랜딩 처리 | → `/structure` 페이지로 이동 |
| 프라이싱 노출 | 유료/무료 구분 웹사이트에 적지 않음 |

---

## 톤 원칙

### "책임" 단어 사용 금지

MUSU는 보증자가 아니다. 보험이 아니다. SLA를 보장하는 클라우드도 아니다.

| ❌ 쓰지 않는다 | ⭕ 이렇게 쓴다 |
|---------------|--------------|
| 책임을 진다 | 운영을 안정화한다 |
| AI 대신 결정한다 | 결정이 구조를 통과하도록 만든다 |
| 보장한다 | 예측 가능하게 만든다 |

### 운영자의 정확한 정의

운영자는:
- 방향을 정하지 않는다
- 결과를 보장하지 않는다
- 대신 시스템을 **일관되게 유지한다**

> AI는 행동합니다.
> MUSU는 그 행동이 구조 안에서 이루어지게 합니다.

### 운영자가 실제로 하는 것

1. 승인한다 (GO)
2. 차단한다 (BLOCK)
3. 기록한다 (State)
4. 되돌린다 (Rollback)
5. 감시한다 (Drift Detection)

이 5개가 카피에 구체적으로 드러나야 한다.

---

## 포지셔닝

### MUSU는 무엇인가

> 당신의 기존 워크플로우, AI, IDE.
> 그 아래에 얹을 안전장치이자, 운영자다.

### MUSU는 무엇이 아닌가

- IDE가 아니다
- AI 모델이 아니다
- 에이전트 프레임워크가 아니다
- 클라우드가 아니다

### 이 포지션이 강한 이유

1. **기존 도구와 싸우지 않는다** — Cursor, Claude, Copilot 계속 써라. 빼앗지 않는다. 얹는다.
2. **교체 비용이 없다** — "갈아타세요"가 아니라 "그 위에 얹으세요"
3. **카테고리 충돌이 없다** — IDE, 모델, SaaS와 경쟁 안 함

---

## 진짜 차별점 5가지

### 1. 판정 중심 (생성이 아니라)

다른 툴: "어떻게 더 잘 생성할까?"
MUSU: "무엇을 통과시킬 것인가?"

GO / FIX / BLOCK는 단순 UX가 아니라 **권한 구조**.
AI는 권한이 없다. MUSU만이 집행 권한을 가진다.

### 2. Intent Fixation (의도 고정)

의도를 선언 → 해시로 고정 → 이후 모든 변경을 그 기준으로 평가.
AI를 제약 조건 하에서 작동시키는 구조.

### 3. Stage-Gated Execution

```
일반: Prompt → Output → Accept
MUSU: Intent → Draft → Structural Check → Policy Check → State Update → Accept
```

워크플로우 툴이 아니라 결정론적 파이프라인.

### 4. CPU Enforcement Layer

- Cloud AI는 사고한다
- 로컬 CPU는 감시하고 통제한다
- 토큰 소모 없이 검증

이 구조는 거의 없다.

### 5. Build vs Run 경계

다른 툴: 무료 + SaaS, 사용량 과금
MUSU: Build는 생성, Run은 운영

---

## 차별화가 안 보이는 이유 + 해결

### 문제

표면 언어가 겹친다: "자동화", "에이전트", "로컬 실행", "AI OS"
카피가 추상적이다: "구조", "경계", "거버넌스"

### 해결: 행동 단위 차별화

추상 대신 구체적 행동으로:

- MUSU는 AI가 멋대로 파일을 바꾸지 못하게 막는다.
- MUSU는 의도와 다른 변경을 차단한다.
- MUSU는 실수한 코드를 자동으로 되돌린다.

### 킬러 카피

> AI writes code. MUSU decides if it lives.

이 문장이 이번 기획의 알파이자 오메가. Hero 섹션에 풀스크린 타이포로 박아야 한다.

---

## 기존 랜딩에서 반드시 살려야 할 것

| # | 문장 | 용도 |
|---|------|------|
| 1 | Probabilistic AI. Deterministic structure. | 정체성 |
| 2 | AI tools generate. MUSU governs. | 카테고리 |
| 3 | Intent / Lifecycle / Validation / Persistent State | 4-Layer |
| 4 | You don't have a prompt problem. You have a structure problem. | 타겟 직격 |
| 5 | This is not a framework. It's a running boundary layer. | 차별화 |
| 6 | Enforcement that doesn't consume tokens. | CPU AI |

---

## 줄여야 할 것

- Five Responsibilities (Prime/Engine/Mesh/Control/Memory) → 타겟에게 너무 아키텍처적
- 내부 포트, 테스트 숫자 → 기술 문서에 남기고 랜딩에서 제거
- 철학 반복 → 더 직설적으로

---

## 페이지 구조 변경

```
현재                              v2
─────                             ──
/           랜딩 (10섹션, 철학)   → /structure (기존 랜딩 이동)
                                  → / (새 랜딩 v2, 타겟 중심)
/architecture  아키텍처 (v6.1)    → 유지
/pricing       프라이싱           → 유지 (유료/무료 구분 없이)
/docs          문서               → 유지
```

---

## 새 랜딩 카피 (v2.1 확정본)

### 톤 비율

- 철학 30%
- 감정 40%
- 구조 설명 30%

### 스크롤 플로우

```
1. Hero         — "Keep your AI. Add an operator." + 다운로드 버튼
2. Hook         — "AI writes code. MUSU decides if it lives." (풀스크린 타이포)
3. Problem      — 문제는 AI가 아닙니다 (감정 자극)
4. Verdict      — GO / FIX / BLOCK (권한 구조)
5. Stack        — 당신의 스택 아래에 놓입니다 (4-Layer)
6. CPU          — 감시와 통제는 당신의 컴퓨터가 처리합니다
7. Production   — Build는 생성, Run은 운영
8. Closing      — Under your AI. In control of execution.
9. Deep Dive    — 구조가 궁금하다면 → /structure
```

---

### 1. Hero

**Keep your AI. Add an operator.**

Claude, Cursor, GPT — 그대로 쓰십시오.

MUSU는 당신의 워크플로우를 바꾸지 않습니다.
그 아래에서, AI가 만든 결과를 판정하고 집행하는 운영자가 됩니다.

AI는 제안합니다.
MUSU는 결정합니다.

**Probabilistic AI. Deterministic operation.**

`[ Download MUSU for Windows (.exe) ]`

---

### 2. Hook (풀스크린 타이포)

> **AI writes code.**
> **MUSU decides if it lives.**
> **Nothing runs without structure.**

---

### 3. Problem — 문제는 AI가 아닙니다

AI는 실수를 합니다.
문제는 실수 자체가 아닙니다.

문제는:

- 누가 승인했는지 모른다는 것
- 무엇이 바뀌었는지 기록되지 않는다는 것
- 왜 그 결정을 했는지 남지 않는다는 것

AI가 코드를 쓸 수는 있습니다.
하지만 그 코드를 운영할 수는 없습니다.

**그 운영을 구조화하는 것이 MUSU입니다.**

---

### 4. Verdict — GO / FIX / BLOCK

MUSU는 생성하지 않습니다.
승인합니다.

AI가 코드를 제안하면, MUSU는 세 가지 중 하나를 반환합니다:

- **GO** — 승인. 의도와 일치, 집행 가능.
- **FIX** — 수정 후 재검토.
- **BLOCK** — 거부. 경계 위반, 즉시 중단.

이 세 단어는 기능이 아니라 구조입니다.

AI는 권한이 없습니다.
MUSU만이 집행 권한을 가집니다.

모든 변경은 이 파이프라인을 통과해야 합니다.
AI의 속도는 유지합니다. 결과의 안정성은 강화합니다.

---

### 5. Stack — 당신의 스택 아래에 놓입니다

```
Your IDE
Your AI
Your Prompt
────────────
MUSU (Operator)
────────────
Execution
State
Production
```

MUSU는 위를 대체하지 않습니다.
아래를 안정화합니다.

- 의도를 고정합니다. (Intent Lock)
- 작업을 단계별로 제한합니다. (Lifecycle Enforcement)
- 변경을 자동 판정합니다. (Validation Loop)
- 상태를 영구 보존합니다. (Persistent State)

이것은 프레임워크가 아닙니다.
실행 중인 경계 계층입니다.

복잡한 세팅 없이, 더블클릭 한 번으로 설치됩니다.

---

### 6. CPU — 감시와 통제

Cloud AI는 사고합니다.
MUSU는 감시합니다.

- 의도와 다른 변경을 즉시 감지하고
- 승인되지 않은 파일 수정을 차단하고
- 위험도를 계산하고
- 필요한 경우 자동으로 되돌립니다

이 계층은 추론이 아닙니다.
**통제입니다.**

대부분의 AI 도구는 생각에 모든 비용을 씁니다.
MUSU는 생각과 집행을 분리합니다.

일상적인 감시와 통제는 당신의 컴퓨터가 처리합니다.
AI API 비용 없이. 설치된 파일이 조용하고 완벽하게.

코드를 짜는 복잡한 생각에만 Cloud AI를 쓰십시오.
나머지는 MUSU가 로컬에서 처리합니다.

---

### 7. Production — Build와 Run의 경계

구축(Build)은 무료입니다.

AI와 함께 만들고,
구조 안에서 검증하십시오.

그러나 그 코드가 실제 서비스가 되는 순간,
운영의 성격이 달라집니다.

그때 켜는 것이 **Production Mode**입니다.

- 크래시 자동 복구
- 롤백 히스토리
- 드리프트 모니터링
- 무제한 오토파일럿

Build는 생성입니다.
Run은 운영입니다.

MUSU는 그 경계를 명확히 합니다.

---

### 8. Closing

AI는 점점 더 많은 것을 만들 것입니다.

당신에게 필요한 것은
AI를 더 똑똑하게 만드는 도구가 아니라,

**AI의 결과가 구조 안에서만 동작하도록 만드는 운영 계층입니다.**

MUSU.
Under your AI. In control of execution.

---

### 9. Deep Dive Link

> 이 결정론적 엔진의 속이 궁금하다면?

`[ /structure 확인하기 ]`

---

## 킬러 카피 정리

| 순위 | 문장 | 용도 |
|------|------|------|
| 1 | AI writes code. MUSU decides if it lives. | Hook (풀스크린) |
| 2 | Keep your AI. Add an operator. | Hero 메인 |
| 3 | Probabilistic AI. Deterministic operation. | Hero 하단 |
| 4 | AI proposes. MUSU enforces structure. | 대안 서브카피 |
| 5 | AI generates output. MUSU decides what becomes state. | 엔지니어 톤 대안 |

---

## 다음 단계

- [ ] 기존 랜딩 → `/structure` 페이지 이동
- [ ] 새 랜딩 v2 구현 (9섹션)
- [ ] Header 네비게이션 업데이트
- [ ] `/structure` 페이지에서 Inside MUSU 섹션 통합
- [ ] .exe 다운로드 링크 준비 (GitHub Releases)
