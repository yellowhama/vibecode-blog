# musu.pro 웹사이트 카피 — v6.1 (AI Boundary Layer + 메커니즘)

> **상태**: ✅ **배포됨** (musu.pro, 커밋 `36877af` + `ed79624`)
>
> **대상**: AI로 코드 짜는 사람 (Cursor, Claude Code, Codex 유저)
> **원칙**: 내부 용어 금지. 모르는 사람이 읽어도 이해되는 글.
>
> **핵심 철학 (v6.1)**:
> - "너의 AI 그대로 써. 우리가 구조를 얹는다."
> - 경쟁이 아니라 공존. 대체가 아니라 보완.
> - AI is probabilistic. Structure is deterministic.
> - **MUSU = AI Boundary Layer** (새 카테고리 생성)
>
> **3단 설득 구조**: 철학 → 구조 → 메커니즘
> - 철학: "Keep your AI. Add structure."
> - 구조: 5개 책임 레이어 + 4개 구조 레이어
> - 메커니즘: "그래서 실제로 이렇게 돌아간다" (사기 냄새 제거)
>
> **MUSU = 하나의 제품. 내부에 세 레이어.**
>
> **가격 정책**: "Free/Open Source" 전면 금지. "Included" / "Local Execution" 사용. 유료 전환 예정.

---

## 페이지 구조 (10섹션)

```
 1. Hero                — "Keep your AI. Add structure."
 2. Category Definition — "AI tools generate. MUSU governs."
 3. What MUSU Is        — The boundary layer 정의
 4. Why Structure       — 구조 부재가 진짜 문제
 5. The Structure       — 4개 구조 레이어 (철학)
 6. How It Actually Works — 4단계 메커니즘 (구체적 동사)
 7. Five Responsibilities — 5개 레이어의 책임 (기술→역할→결과)
 8. Why This Works      — "We don't compete. We contain."
 9. CPU Layer           — 비용 절감 + 실행 분리
10. Inside + CTA        — 내부 구조 + 행동 유도
```

---

## 1. Hero

**배지**: AI Boundary Layer

**헤드라인**:
```
Keep your AI.
Add structure.
```

**서브카피**:
```
Use Claude. Use Cursor. Use whatever you want.

MUSU doesn't replace your tools.
It adds boundaries, validation, and persistent structure on top —
so what AI builds can actually run in the real world.
```

**정체성 문장** (Hero 아래):
```
Probabilistic AI.
Deterministic structure.
```

**CTA 버튼**:
- Primary: `See the Structure` → #the-structure
- Secondary: `View on GitHub` → github

---

## 2. Category Definition

**헤드라인**:
```
AI tools generate.
MUSU governs.
```

**본문**:
```
AI models are powerful.
They are also unpredictable.

They forget context.
They drift from intent.
They break silently.

The problem isn't your prompt.
It's the absence of a system around the AI.

MUSU is that system.
```

---

## 3. What MUSU Is

**헤드라인**:
```
The boundary layer for AI-built software.
```

**본문**:
```
MUSU sits above your AI tools and adds:

• Structural boundaries
• Enforced lifecycle stages
• Automatic validation loops
• Persistent project state
• Safe execution defaults

You keep your AI.
We add the guardrails.
```

---

## 4. Why Structure Matters

**헤드라인**:
```
You don't have a prompt problem.
You have a structure problem.
```

**본문**:
```
Everyone is chasing better prompts.
Better models.
Bigger context windows.

But demos fail in production
not because the AI wasn't smart enough,
but because nothing contained it.

No intent tracking.
No staged execution.
No automatic validation.
No persistent memory.

Structure is the difference between a demo and a product.
```

**하단 (슬로건)**:
```
AI is probabilistic.
Structure is deterministic.
```

---

## 5. The Structure (4 Layers)

**배지**: THE STRUCTURE

**헤드라인**:
```
Four structural layers above your AI.
```

**서브카피**:
```
MUSU doesn't modify how your AI works.
It adds a deterministic layer on top.
```

**시각 다이어그램** (수직 흐름):
```
       Your AI Tool (Claude, Cursor, Codex...)
            ↓
   ┌─────────────────┐
   │  Intent Layer   │  What you meant to build. Locked in.
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │  Lifecycle      │  Work happens in stages. Not chaos.
   │  Enforcement    │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │  Validation     │  Mistakes don't ship.
   │  Loop           │
   └────────┬────────┘
            ↓
   ┌─────────────────┐
   │  Persistent     │  Memory that outlives chat.
   │  State          │
   └────────┬────────┘
            ↓
      Production-Ready Software
```

**4개 레이어 설명 카드**:

### Layer 1 — Intent
**"What you meant to build. Locked in."**

Before code is written, intent is recorded.
Decisions are structured.
Future changes are measured against it.

No re-explaining your project every session.

*This replaces: manual context setup, re-explaining to AI every time, lost decisions.*

### Layer 2 — Lifecycle Enforcement
**"Work happens in stages. Not chaos."**

Plan → Build → Control → Operate → Maintain → Ship.

Each stage has clear inputs and outputs.
Drift is caught between stages, not by your users.

*This replaces: hoping the AI gets it right in one pass.*

### Layer 3 — Validation Loop
**"Mistakes don't ship."**

Every change is reviewed automatically.
Pass, fix, or block — three outcomes.

If fixable, it auto-retries.
If not, it stops and tells you why.

Your prompt doesn't need to be perfect.
The system compensates.

*This replaces: manual code review, debugging in production, "it works on my machine."*

### Layer 4 — Persistent State
**"Memory that outlives chat."**

Every decision. Every run. Every change.
Structured. Searchable. Permanent.

Come back in six months.
The full history is there.

*This replaces: fragile chat history, manual documentation, "why did we build it this way?"*

**하단**:
```
This is not a framework. It's a running boundary layer.
It doesn't change your AI.
It contains what your AI produces.
```

---

## 6. How It Actually Works (메커니즘 섹션)

**[의도]**:
섹션 5까지는 "철학 + 구조"다. 여기가 없으면 "말만 그럴싸한 사기"처럼 보인다.
이 섹션이 "아 그래서 진짜로 이렇게 돌아가는구나"를 보여준다.
핵심은 **구체적 동사**: 검사한다, diff를 본다, 멈춘다, 재시도한다.

**헤드라인**:
```
What actually happens when you use MUSU.
```

**서브카피**:
```
AI proposes.
MUSU enforces.
```

### Step 1 — Intent becomes a constraint

```
You define what you're building once.

MUSU converts that into structured project state:
scope boundaries, allowed modification zones,
success criteria, active lifecycle stage.

This state is stored independently of any chat session.

From that moment:
every change is evaluated against declared intent.

AI output is not trusted by default.
It must conform to project constraints.
```

**킬러 라인**:
```
MUSU does not remember intent.
It enforces it.
```

### Step 2 — Work is stage-gated

**일반 AI 흐름 vs MUSU 흐름 (시각 비교)**:
```
Normal:  Prompt → Output → Accept
MUSU:    Intent → Draft → Structural Check → Policy Check → State Update → Accept
```

```
Work cannot skip stages.

Each stage enforces:
input validation, boundary verification,
explicit state transition.

Nothing jumps ahead.
Nothing slips through.
```

### Step 3 — Every change is deterministically evaluated

```
When AI generates output:

A diff is computed.
Scope boundaries are verified.
Intent alignment is checked.
Policy rules are applied.

The result is not subjective.
It produces one of three deterministic outcomes:

GO — accepted
FIX — retry with correction
BLOCK — halt

If fixable, the system retries automatically.
If not, it stops and tells you why.

Your prompt doesn't need to be perfect.
The pipeline compensates.
```

### Step 4 — State outlives context

```
Chat sessions end.
Project state does not.

MUSU maintains:
intent history, decision log,
change history, execution outcomes.

This allows deterministic reconstruction
of the project at any point in time.

No prompt reconstruction.
No manual RAG assembly.

Structure is persistent by default.
```

**하단**:
```
This is not philosophy.
This is a deterministic validation pipeline
that every AI change passes through
before it is accepted into project state.
```

---

## 7. Five Responsibilities (아키텍처)

**[의도]**:
기술 내부 용어(OODA, CRDT, BitNet, pgvector)는 /architecture 페이지에만.
랜딩에서는 **각 레이어가 무엇을 "책임지는가"**만 보여준다.
"기술 → 역할 → 결과" 구조.

**헤드라인**:
```
Five layers. One responsibility each.
```

**서브카피**:
```
Together, they turn AI output into stable software.
```

### Prime — Direction

**What it does**
Keeps the whole system aligned with intent.

**Why it matters**
Without coordination, AI agents drift.
Prime makes sure every task moves toward the same goal.

**Result**
No silent divergence. No chaotic agent behavior.

### Engine — Execution

**What it does**
Runs the operational workload locally.

**Why it matters**
Most AI work isn't thinking. It's execution.
Execution should be fast, predictable, and cheap.

**Result**
Low latency. Zero API cost for routine operations.

### Mesh — Distribution

**What it does**
Connects your machines into one execution surface.

**Why it matters**
AI-built systems shouldn't depend on a single laptop.

**Result**
Your work can scale across your own hardware — securely.

### Control — Judgment

**What it does**
Evaluates every action before it becomes permanent.

**Why it matters**
AI makes mistakes. Control prevents them from shipping.

**Result**
GO, FIX, or BLOCK — nothing slips through silently.

### Memory — Continuity

**What it does**
Persists intent, decisions, and state across time.

**Why it matters**
Chat sessions end. Products don't.

**Result**
Come back in six months. The system still knows why it exists.

**하단**:
```
This is not a stack of tools.
It's a system of responsibilities.
```

링크: `Explore the full architecture →`

---

## 8. Why This Works

**헤드라인**:
```
We don't compete with AI.
We contain it.
```

**서브카피**:
```
AI tools plug into MUSU.
Not the other way around.
```

**본문**:
```
Models can change.
APIs can update.
Prompts can wobble.

The structure remains.

MUSU doesn't try to make AI smarter.
It makes the environment around AI stable.

Context isn't rebuilt every time.
It's embedded into the project structure.

Memory isn't an add-on you bolt on later.
It's part of how the boundary layer operates.

A lightweight local AI handles routine enforcement —
so cloud AI only gets called for real reasoning.
```

**마감 문장**:
```
Your AI doesn't need to be perfect.
Your system does.
```

---

## 9. CPU Layer

**배지**: ZERO COST OPS

**헤드라인**:
```
Most of the work. Zero API bill.
```

**서브카피**:
```
Most AI work isn't thinking.
It's checking, validating, enforcing structure.

MUSU runs a lightweight execution layer on your machine
that handles routine enforcement for free.

Cloud AI only handles real reasoning.
```

**3-Tier 시각**:
```
☁️  Cloud AI — The thinker. Pay per token.
🖥️  MUSU    — The boundary layer. Free.
💻  CPU AI  — The enforcer. $0/month.
```

**왼쪽 큰 카드 (CPU AI)**:
**"The enforcer. Runs on your laptop."**
- Validates code against intent boundaries
- Detects when output drifts from the plan
- Checks dependencies and scores risk
- Pre-processes before calling cloud AI
- Post-processes and validates cloud AI output
- Works offline — no internet required

**$0/month — runs on hardware you already own**

**오른쪽 작은 카드 (Cloud AI)**:
**"The thinker. For the hard problems."**
- Complex reasoning and architecture
- Creative problem solving
- Novel code generation

**Pay per token (Claude, GPT, Gemini, etc.)**

**하단**:
```
Cloud AI is expensive for repetition. Your laptop isn't.

The CPU layer doesn't replace your AI.
It enforces the boundaries that make your AI production-safe.
```

**스탯**:
```
849 tests (Rust core)  ·  5,400+ tests (TypeScript)  ·  40,000+ lines of Rust
```

---

## 10. Inside MUSU + What MUSU Is Not + CTA

### Inside MUSU

**헤드라인**:
```
One system. Three internal layers.
```

**서브카피**:
```
You install one thing. You run one thing.
```

### Planning & Control
Captures decisions before code is written.
Reviews every change with automated gates.
Keeps your AI aligned with your intent.

### Execution Engine
Runs lightweight AI directly on your CPU.
Validates, routes, and enforces boundaries.
Cloud AI only handles the hard thinking.

### Private Mesh
Connects your machines into one secure network.
Run jobs across devices without sending data to anyone else's cloud.

**하단**:
```
You don't install three products.
You run one boundary layer.
```

---

### What MUSU Is Not

```
Not a model.
Not a prompt tool.
Not another agent framework.
Not a cloud service.
```

```
MUSU is the structural layer
that turns AI output into real software.
```

---

### CTA

**헤드라인**:
```
Build once. Run it properly.
```

**서브카피**:
```
If you're already building with AI,
this is the missing layer.

Open source. Self-hosted.
From idea to production — day one.
```

**버튼**:
- Primary: `View on GitHub`
- Ghost: `Read the Docs`

**배지**: In Active Development

---

### 보조: Developer Flow
**소개**: `This is what the boundary layer looks like in practice.`
**헤드라인**: `Up and running in four commands.`

```
$ musu init
→ Project initialized. Boundary layer active.

$ musu run --agent claude
→ Agent connected. Intent capture ready.

$ musu status
→ Stage: OPERATE | Validation: PASS | State: persistent | 2 peers connected

$ musu gate
→ Last review: PASS (3 checks passed, 0 issues)
```

하단: `Works with Claude Code, Cursor, Codex, and any agent that speaks MCP.`

---

## 네비게이션

### Header
```
[MUSU]  The Structure  Inside  Architecture  Docs  Pricing  [GitHub] [Sign In]
```

### Footer
**태그라인**: "The boundary layer for AI-built software."

**컬럼**:
- The Structure: Boundary Layer, 4 Layers, CPU AI, Pricing
- Inside MUSU: Planning & Control, Execution Engine, Private Mesh
- Developers: Documentation, API Reference, GitHub
- Community: Marketplace, Forum, npm

**하단**: "MUSU doesn't replace your AI. It makes it safe to use in production."

---

## 톤 & 원칙

1. **"Keep your AI. Add structure."**: 사이트 전체의 중심 축. 충돌하지 않는 포지셔닝.
2. **내부 용어 전면 금지**: CRDT, pgvector, QUIC, TLS, OODA, BitNet, Gateway, Pico — /architecture 에서만.
3. **3단 설득**: 철학 (왜?) → 구조 (뭐가 있나?) → 메커니즘 (어떻게 돌아가나?)
4. **하나의 제품**: Vibe PM / HiveLink / Musu Engine 외부 노출 안 함.
5. **경쟁자 없음**: "우리는 경쟁하지 않는다. 우리는 기존 도구 위에 얹는다."
6. **카테고리 정의**: "AI Boundary Layer" — 새로운 카테고리를 만든다.
7. **사기 냄새 제거**: "How It Actually Works" 섹션이 구체적 동사로 메커니즘을 보여준다.
8. **킬러 라인 3개**:
   - "MUSU doesn't replace your AI. It makes it safe to use in production."
   - "AI proposes. MUSU enforces."
   - "MUSU does not remember intent. It enforces it."

---

## 변경 이력

| 버전 | 핵심 |
|------|------|
| v1 | 최초 초안. 내부 용어 제거. |
| v2 | 3-Tier, "습관이 경쟁자", CPU AI 구체화 |
| v3 | Hero→Version A, Products→Inside MUSU, 하나의 제품 |
| v4 | 철학 전환: 운영→비즈니스 현실화. "Why This Works" 신설. |
| v5 | **"It's the structure, stupid."** Problem 재정의. 4개 구조 레이어. 선언 섹션. |
| v5.1 | 전환율 미세 조정. Hero 타겟 직접 호출. 감정 밀도 강화. |
| v6 | **"AI Boundary Layer."** 카테고리 재정의. 대결→협력 톤. |
| v6.1 | **메커니즘 추가 + 책임 아키텍처.** "How It Actually Works" 신설. Five Responsibilities. 사기 냄새 제거. |

---

## v6 → v6.1 핵심 변경

| 항목 | v6 | v6.1 |
|------|-----|------|
| **설득 구조** | 철학 + 구조 | **철학 + 구조 + 메커니즘** (3단) |
| **신규 섹션** | — | **"How It Actually Works"** (4단계 메커니즘) |
| **아키텍처** | 기술 용어 (OODA, CRDT...) | **Five Responsibilities** (역할→결과) |
| **사기 냄새** | 있음 (철학만) | **제거** (구체적 동사: 검사, diff, 멈춤, 재시도) |
| **킬러 라인 추가** | — | **"AI proposes. MUSU enforces."** |
| **킬러 라인 추가** | — | **"MUSU does not remember intent. It enforces it."** |
| **페이지 구성** | 8섹션 | **10섹션** (메커니즘 + 책임 추가) |
| **Normal vs MUSU** | 없음 | **시각 비교** (Prompt→Accept vs Intent→...→Accept) |
| **검증 파이프라인** | 암시적 | **명시적** ("deterministic validation pipeline") |
