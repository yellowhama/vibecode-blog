# 랜딩 페이지 (`/`)

> 상태: ✅ v6.1 배포됨
> 소스: `src/app/page.tsx` → 10개 섹션 컴포넌트

---

## 1. Hero

**Badge**: AI Boundary Layer

### Keep your AI. Add structure.

Use Claude. Use Cursor. Use whatever you want.

MUSU doesn't replace your tools.
It adds boundaries, validation, and persistent structure on top —
so what AI builds can actually run in the real world.

Probabilistic AI.
Deterministic structure.

- **See the Structure** → `#the-structure`
- View on GitHub → github.com/yellowhama/Musu

---

## 2. Category Definition

### AI tools generate. MUSU governs.

AI models are powerful.
They are also unpredictable.

They forget context.
They drift from intent.
They break silently.

The problem isn't your prompt.
It's the absence of a system around the AI.

MUSU is that system.

---

## 3. What MUSU Is

### The boundary layer for AI-built software.

MUSU sits above your AI tools and adds:

- Structural boundaries
- Enforced lifecycle stages
- Automatic validation loops
- Persistent project state
- Safe execution defaults

You keep your AI.
We add the guardrails.

---

## 4. Problem

### You don't have a prompt problem. You have a structure problem.

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

AI is probabilistic.
Structure is deterministic.

---

## 5. The Structure

**Badge**: THE STRUCTURE
**id**: `the-structure`

### Four structural layers above your AI.

MUSU doesn't modify how your AI works.
It adds a deterministic layer on top.

**시각 다이어그램**: Your AI Tool → Intent → Lifecycle → Validation → Persistent State → Production-Ready Software

#### Layer 1 — Intent
**"What you meant to build. Locked in."**

Before code is written, intent is recorded.
Decisions are structured.
Future changes are measured against it.

No re-explaining your project every session.

*This replaces: manual context setup, re-explaining to AI every time, lost decisions.*

#### Layer 2 — Lifecycle Enforcement
**"Work happens in stages. Not chaos."**

Plan → Build → Control → Operate → Maintain → Ship.

Each stage has clear inputs and outputs.
Drift is caught between stages, not by your users.

*This replaces: hoping the AI gets it right in one pass.*

#### Layer 3 — Validation Loop
**"Mistakes don't ship."**

Every change is reviewed automatically.
Pass, fix, or block — three outcomes.

If fixable, it auto-retries.
If not, it stops and tells you why.

Your prompt doesn't need to be perfect.
The system compensates.

*This replaces: manual code review, debugging in production, "it works on my machine."*

#### Layer 4 — Persistent State
**"Memory that outlives chat."**

Every decision. Every run. Every change.
Structured. Searchable. Permanent.

Come back in six months.
The full history is there.

*This replaces: fragile chat history, manual documentation, "why did we build it this way?"*

This is not a framework. It's a running boundary layer.
It doesn't change your AI.
It contains what your AI produces.

---

## 6. Mechanism

### What actually happens when you use MUSU.

AI proposes.
MUSU enforces.

#### Step 1 — Intent becomes a constraint

You define what you're building once.

MUSU converts that into structured project state:
scope boundaries, allowed modification zones,
success criteria, active lifecycle stage.

This state is stored independently of any chat session.

From that moment:
every change is evaluated against declared intent.

AI output is not trusted by default.
It must conform to project constraints.

**MUSU does not remember intent. It enforces it.**

#### Step 2 — Work is stage-gated

```
Normal:  Prompt → Output → Accept
MUSU:    Intent → Draft → Structural Check → Policy Check → State Update → Accept
```

Work cannot skip stages.

Each stage enforces:
input validation, boundary verification,
explicit state transition.

Nothing jumps ahead.
Nothing slips through.

#### Step 3 — Every change is deterministically evaluated

When AI generates output:

A diff is computed.
Scope boundaries are verified.
Intent alignment is checked.
Policy rules are applied.

The result is not subjective.
It produces one of three deterministic outcomes:

**GO** — accepted
**FIX** — retry with correction
**BLOCK** — halt

If fixable, the system retries automatically.
If not, it stops and tells you why.

Your prompt doesn't need to be perfect.
The pipeline compensates.

#### Step 4 — State outlives context

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

This is not philosophy.
This is a deterministic validation pipeline
that every AI change passes through
before it is accepted into project state.

---

## 7. Five Responsibilities

### Five layers. One responsibility each.

Together, they turn AI output into stable software.

#### Prime — Direction

**What it does**: Keeps the whole system aligned with intent.
**Why it matters**: Without coordination, AI agents drift. Prime makes sure every task moves toward the same goal.
**Result**: No silent divergence. No chaotic agent behavior.

#### Engine — Execution

**What it does**: Runs the operational workload locally.
**Why it matters**: Most AI work isn't thinking. It's execution. Execution should be fast, predictable, and cheap.
**Result**: Low latency. Zero API cost for routine operations.

#### Mesh — Distribution

**What it does**: Connects your machines into one execution surface.
**Why it matters**: AI-built systems shouldn't depend on a single laptop.
**Result**: Your work can scale across your own hardware — securely.

#### Control — Judgment

**What it does**: Evaluates every action before it becomes permanent.
**Why it matters**: AI makes mistakes. Control prevents them from shipping.
**Result**: GO, FIX, or BLOCK — nothing slips through silently.

#### Memory — Continuity

**What it does**: Persists intent, decisions, and state across time.
**Why it matters**: Chat sessions end. Products don't.
**Result**: Come back in six months. The system still knows why it exists.

This is not a stack of tools. It's a system of responsibilities.

→ Explore the full architecture (`/architecture`)

---

## 8. Why This Works

### We don't compete with AI. We contain it.

AI tools plug into MUSU.
Not the other way around.

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

Your AI doesn't need to be perfect.
Your system does.

---

## 9. CPU AI

**Badge**: LOCAL EXECUTION

### Enforcement that doesn't consume tokens.

Most AI work isn't thinking.
It's checking, validating, enforcing structure.

MUSU runs a lightweight execution layer on your machine
that handles routine enforcement for free.

Cloud AI only handles real reasoning.

**CPU AI — The enforcer. Runs on your laptop.**
- Validates code against intent boundaries
- Detects when output drifts from the plan
- Checks dependencies and scores risk
- Pre-processes before calling cloud AI
- Post-processes and validates cloud AI output
- Works offline — no internet required

$0/month — runs on hardware you already own

**Cloud AI — The thinker. For the hard problems.**
- Complex reasoning and architecture
- Creative problem solving
- Novel code generation

Pay per token (Claude, GPT, Gemini, etc.)

Cloud AI is expensive for repetition. Local execution isn't.

The CPU layer doesn't replace your AI.
It enforces the boundaries that make your AI production-safe.

849 tests (Rust core) · 5,400+ tests (TypeScript) · 40,000+ lines of Rust

---

## 10. Inside MUSU + What MUSU Is Not + CTA

### One system. Three internal layers.

You install one thing. You run one thing.

**Planning & Control**
Captures decisions before code is written.
Reviews every change with automated gates.
Keeps your AI aligned with your intent.

**Execution Engine**
Runs lightweight AI directly on your CPU.
Validates, routes, and enforces boundaries.
Cloud AI only handles the hard thinking.

**Private Mesh**
Connects your machines into one secure network.
Run jobs across devices without sending data to anyone else's cloud.

You don't install three products.
You run one boundary layer.

---

### What MUSU Is Not

Not a model.
Not a prompt tool.
Not another agent framework.
Not a cloud service.

MUSU is the structural layer
that turns AI output into real software.

---

### CTA

### Build once. Run it properly.

If you're already building with AI,
this is the missing layer.

Self-hosted.
From idea to production — day one.

- **View on GitHub**
- Read the Docs

**Badge**: In Active Development
