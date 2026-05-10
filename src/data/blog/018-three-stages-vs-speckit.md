---
title: '018 Three-Stage Vibe Coding vs GitHub Spec Kit'
description: 'Field notes from the trenches: Exploring 018 three-stage vibe coding'
pubDatetime: 2026-05-09 08:19:15+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of 018 three-stage vibe coding vs github spec kit. Real scars, no slop.

# Structuring AI Vibe Coding: Three-Stage Approach vs GitHub Spec Kit

## TL;DR

**Problem**: "Hey, build this" → AI makes something → it's a mess → start over.

**Solution 1**: Ryan Carson's **Three-Stage Vibe Coding** (PRD → Task List → Feedback loop)

**Solution 2**: GitHub's **Spec Kit** (Constitution → Specify → Plan → Tasks → Implement)

Both turn "winging it" into a system. But they approach it differently.

**Bottom line**: Solo founder? Three stages. Team or complex project? Spec Kit.

---

## A Five-Time Founder and His "Three-File Secret"

Was digging through YouTube. Found an interesting video.

A guy named Ryan Carson said this:

> "I've started five companies. Built Treehouse, where we taught coding to hundreds of thousands. After AI hit, I realized: developers didn't become unnecessary. Development itself changed."

He proposed something called the **"3-File System."**

First thought: "Three files? Big deal."

Watched the whole thing. It hit hard.

This guy was the real deal.

### Who Is Ryan Carson?

- **Treehouse founder**: 500,000 people learned to code on his platform.
- **Five-time founder**: All successful exits.
- **Solo founder evangelist**: "One person is enough."
- **Current focus**: Building products with AI, no engineering team.

His claim: most people use AI **wrong.**

"ChatGPT, build me a store" → 2,000 lines of code → doesn't run → try again → still broken...

That's the trap of **Vibe Coding.** Andrej Karpathy coined the term. "Coding by feel."

Ryan Carson put **structure** on top of it. That's the **3-File System.**

Here's the interesting part. Around the same time, GitHub spotted the same problem and built **Spec Kit.**

**Both solving the same problem. Different approaches.**

This post compares them.

---

## Method 1: Ryan Carson's Three-Stage Vibe Coding

Built by a five-time founder. Designed for **solo creators.**

### The Core: "3-File System"

```
PRD.md (Product Requirements Document)
TASKS.md (Atomic Task List)
TESTS.md (TDD Test File)
```

### The Three Stages

### Stage 1: Define Clear Context

```markdown
# Bad
"Build me a store"

# Good (PRD)
## Product: Used Textbook Marketplace for High Schoolers
- Target: Students age 15-18
- Core features: List books, price offers, in-school trades
- Constraints: No payments (meet in person only), no anonymity
- Style: Simple like Craigslist
```

**The key move: Make AI ask questions.**

> "Read this PRD. If anything's missing, ask me."

AI asks:

- "How do you handle trade cancellations?"
- "Is a report function needed?"
- "Max number of photos per listing?"

### Stage 2: Break Down and Systematize

Split the PRD into **atomic tasks.**

```markdown
# TASKS.md

## Phase 1: Auth
- [ ] T1.1: Email signup API
- [ ] T1.2: Login JWT issuance
- [ ] T1.3: Password reset flow

## Phase 2: Book Listing
- [ ] T2.1: Book info input form
- [ ] T2.2: Photo upload (max 3)
- [ ] T2.3: Price offer toggle
```

**Atomic means:**

- Completable one at a time
- Minimal dependencies on other tasks
- Finishable in 30 minutes to 2 hours

### Stage 3: Iterative Feedback

```
Me: "Implement T1.1"
AI: (generates code)
Me: "Run the tests"
AI: "Failed: no email duplicate check"
Me: "Add duplicate check"
AI: (fixes)
Me: "Commit it"
```

**Key rules:**

- Commit at every milestone (Git)
- Treat AI like "a brilliant PhD student"
- Clear, repeated instructions

---

## Method 2: GitHub Spec Kit

Built by GitHub. Designed for **teams and complex projects.** Open source.

### The Core: "Specs become AI's long-term memory"

```
.specify/
├── constitution.md       # AI's rule book
├── specs/               # Feature specs
│   ├── auth.md
│   └── payment.md
├── plans/               # Technical plans
└── tasks/               # Implementation tasks
```

### Four Stages (+ Constitution)

### Stage 0: Constitution — Rules for the AI

```bash
/constitution
```

```markdown
# Project Constitution

## Hard Rules
- Python 3.11+
- All APIs via FastAPI
- Test coverage 80%+
- Never touch existing UserAuth system
- 60fps on Galaxy A32

## Coding Style
- Type hints required
- Docstrings: Google style
- Function names start with verbs
```

**Why this matters:**

AI reads these rules **every time.** No more "built it in Python 3.9 yesterday, rebuilt in 3.12 today."

### Stage 1: Specify — What to Build

```bash
/specify
```

```markdown
# Feature: Used Textbook Marketplace

## User Journey
1. Student takes photo of book
2. Enters price (or "accept offers")
3. Only visible to students at same school
4. Chat to negotiate trade

## Success Criteria
- Registration done in 30 seconds
- Photo upload under 5 seconds
- Search results in 1 second
```

**No tech talk.** Just "what" and "why."

### Stage 2: Plan — How to Build It

```bash
/plan
```

AI generates the technical plan:

```markdown
# Technical Plan

## Architecture
- Backend: FastAPI + PostgreSQL
- Frontend: React Native
- Images: S3 + CloudFront
- Auth: Extend existing UserAuth

## Constraints
- Keep existing DB schema
- iOS/Android simultaneous builds
- GDPR compliance (student data)

## Security
- Email verification required
- School accounts (@school.edu) only
- Strip photo EXIF data
```

### Stage 3: Tasks — Break It Down

```bash
/tasks
```

```markdown
# Task List

## T1: Auth Extension
- T1.1: Add school email verification
- T1.2: Add school field to profile
- T1.3: Filter by same school only

## T2: Book Listing
- T2.1: Book info schema design
- T2.2: Image upload API (S3)
- T2.3: Listing form UI (React Native)

[P] = Parallelizable
[T1.1] → [T1.2] → [T1.3] (sequential)
[T2.1] [P] [T2.3] (parallel)
```

**Auto-detected dependencies:**

- Sequential tasks: connected by arrows.
- Parallelizable: marked [P].

### Stage 4: Implement

```bash
/implement T1.1
```

AI:

1. Checks Constitution (Python 3.11? Yes.)
2. Checks Spec (school email only? Yes.)
3. Checks Plan (extend existing UserAuth? Yes.)
4. **Reads existing code and extends it** (doesn't rebuild from scratch.)

```python
# AI-generated code
# Extending existing UserAuth

def validate_school_email(email: str) -> bool:
    """Verify school email. (Constitution: Google Style Docstring)"""
    valid_domains = ["school.edu", "university.edu"]
    return any(email.endswith(domain) for domain in valid_domains)
```

---

## The Key Differences

| Aspect | Three-Stage Vibe Coding | GitHub Spec Kit |
| --- | --- | --- |
| **For** | Solo founders, small projects | Teams, medium-to-large projects |
| **Philosophy** | "Build fast, iterate" | "Specs are the source of truth" |
| **Files** | 3 (PRD, Tasks, Tests) | 10+ (Constitution, Specs, Plans, Tasks) |
| **AI Memory** | None (re-explain every time) | Constitution = long-term memory |
| **Setup Time** | 5 minutes | 30 minutes |
| **Learning Curve** | Low (start immediately) | Medium (learn the commands) |
| **Duplicate Prevention** | Manual (you check) | Automatic (AI reads existing code) |
| **Parallel Work** | No | Yes ([P] flag) |
| **Best For** | MVPs, prototypes, solo dev | Production, team collab, long-term maintenance |

---

## Real-World Comparison

### Case 1: Football Management Game (30 hours)

**Three-stage approach:**

```
Day 1: Write PRD (1 hour)
Day 2-3: Implement tasks one by one
- "Build training system"
- "Add match simulation"
- "Display player stats"
Result: Prototype done fast.

Problems:
- Tactics system built 3 different ways
- Lost track of where FormationController lives
- Same feature scattered across 4 files
```

**Spec Kit approach:**

```
Day 1:
- /constitution (Godot 4.4 + Rust rules)
- /specify (football management game spec)
- /plan (Godot/Rust architecture)

Day 2-3:
- /tasks (20 tasks auto-generated)
- /implement T1 T2 T3 --parallel

Result: Systematic build. No duplicates.

Advantages:
- AI found existing CoachSystem and extended it
- All tactics code unified in one place
- Constitution enforced "Rust performance optimization" rules
```

### Case 2: Stock Screener (2 days)

**Three-stage wins here:**

```
Goal: Build fast, use it myself.
Scale: Small (under 1000 lines)
Team: Just me.

PRD: "Find US stocks with P/E under 10"
Tasks:
- [ ] Yahoo Finance API connection
- [ ] P/E calculation logic
- [ ] Save results to CSV

Done in 2 days. Would've spent that time just learning Spec Kit.
```

---

## When to Use What

### Use Three-Stage Vibe Coding when:

- Solo developer
- MVP or prototype
- Small project (~5,000 lines or less)
- Finishing in under 2 weeks
- No existing codebase
- "Build fast, throw it away if needed"

**Examples:** Toy projects, idea validation MVPs, personal automation scripts, hackathons.

### Use Spec Kit when:

- Working on a team
- Building for production
- Medium-to-large project (5,000+ lines)
- Long-term maintenance needed
- Complex existing codebase
- "This can never break"

**Examples:** App store releases, team projects, legacy system upgrades, regulated industries (finance, healthcare).

---

## The Hybrid Strategy: What I Actually Do

Truth is, **I use both.** Depends on the situation.

```
Phase 1 (Prototype): Three-Stage Vibe Coding
└─ Build fast, validate
└─ MVP done

Phase 2 (Production): Switch to Spec Kit
└─ Document existing code as Specs
└─ Write Constitution
└─ Add features systematically
```

**How to transition:**

```bash
# 1. Install Spec Kit on existing project
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 2. Initialize
cd my-existing-project
specify init . --ai claude --force

# 3. Generate Constitution
/constitution analyze existing README and code

# 4. Proceed with Spec Kit from here
/specify [new feature]
/plan
/tasks
/implement
```

---

## Practical Tips

### For Three-Stage Vibe Coding

**1. Keep the PRD short and sharp.**

```markdown
Bad:
"Our service is an innovative AI-based recommendation system..."

Good:
"Netflix-style movie recs. Based on watched history. Show top 5."
```

**2. Tasks as checkboxes.**

```markdown
- [ ] Store watch history
- [ ] Similarity calc (cosine)
- [ ] Recommend top 5
```

**3. Make AI ask you questions.**

```
"Read this PRD. Ask me 10 questions about anything that's missing."
```

### For Spec Kit

**1. Constitution: rules only.**

```markdown
Bad:
"We prioritize user experience above all..."

Good:
"60fps on Galaxy A32. Non-negotiable."
```

**2. Use parallel tasks.**

```bash
# Run [P]-tagged tasks simultaneously
/implement T1 T2 T3 --parallel

# Time: 30min → 10min
```

**3. Don't throw away existing code.**

```
/specify Extend existing UserAuth to add school verification

# AI handles the integration
```

---

## It's Not About the Tool. It's the Mindset.

Three stages or Spec Kit, the point is **structure.**

**Before (winging it):**

```
"Hey build me a store" → mess → redo → still a mess → give up
```

**After (structured):**

```
Plan → break down → build one at a time → verify → done
```

**"It's still Vibe Coding. Just with a system."**

---

## Start in 10 Minutes

### Three-Stage Start

```markdown
1. Create PRD.md (5 min)
   - Who is this for?
   - What problem does it solve?
   - How do they use it?

2. Have AI generate Tasks (3 min)
   "Read this PRD and create an atomic task list"

3. Start first Task (2 min)
   "Implement T1"

Done.
```

### Spec Kit Start

```bash
# 1. Install (30 sec)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 2. Initialize (1 min)
specify init my-project --ai claude

# 3. Constitution (3 min)
/constitution organize project rules

# 4. First feature (5 min)
/specify [what you want to build]
/plan
/tasks
/implement

Done.
```

---

## References

**Three-Stage Vibe Coding:**
- Ryan Carson: @rcarson
- Concept: "3-File System for Solo Founders"

**GitHub Spec Kit:**
- Repository: https://github.com/github/spec-kit
- Blog: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai
- Supported AI: Claude Code, GitHub Copilot, Gemini CLI, Cursor, Windsurf, and more.

**From this series:**
- Post 008: Making a Game with Vibe Coding (30 hours)
- Post 011: Upgrading Game Dev with Spec Kit
- Post 012: Spec Kit Field Report (Mike Tyson's wisdom)
