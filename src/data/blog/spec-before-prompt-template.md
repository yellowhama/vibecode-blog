---
slug: spec-before-prompt-template
title: "Write the Spec Before the Prompt: A Copy-Paste Template for Spec-Driven Agent Work Orders"
description: "Prompts are one-shot utterances; specs are contracts. Here is the minimal spec template we hand to coding agents — plus the scaling rules for when one page is enough and when you need four files."
pubDatetime: 2026-06-12T00:00:00Z
tags: [spec-driven-development, ai-agents, agent-orchestration, templates, claude-code]
series: Field Log
draft: false
references:
  - name: GitHub Spec Kit (repository)
    url: https://github.com/github/spec-kit
  - name: GitHub Spec Kit releases
    url: https://github.com/github/spec-kit/releases
  - name: Spec-Driven Development methodology (spec-kit)
    url: https://raw.githubusercontent.com/github/spec-kit/main/spec-driven.md
  - name: "Spec-driven development with AI: get started with a new open source toolkit (GitHub Blog)"
    url: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
  - name: Kiro Specs documentation
    url: https://kiro.dev/docs/specs/
  - name: Kiro Specs best practices
    url: https://kiro.dev/docs/specs/best-practices/
  - name: "Exploring Generative AI: Three SDD tools compared (Birgitta Böckeler, martinfowler.com)"
    url: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
---

You typed a careful three-paragraph prompt, the agent produced something plausible, and on re-run it produced something *different*. That is not an agent problem. It is an interface problem: a prompt is a one-shot utterance, and the agent fills every unstated requirement with a guess. This is the failure mode GitHub's announcement post attributes to vibe-coding — paraphrasing their framing, code that looks right but doesn't behave reliably. The fix is not a better prompt. It is a spec the agent must satisfy before its output becomes project state.

This post gives you the template we actually use, sized in three tiers, plus the rules for when each tier applies. Copy it. The interesting part is not the markdown — it is why each field exists.

## What broke in our pipeline

Retried agent jobs diverged because natural-language instructions left gaps, and the model filled those gaps differently on every run. Our publishing daemon runs agent jobs from a queue, and for months those jobs carried prose instructions: "write the weekly digest, keep the tone consistent, don't break the frontmatter." When a job failed validation and got retried, the second attempt routinely diverged from the first — different structure, different scope, sometimes a different deliverable entirely.

A caveat before the claim: we have not run a formal audit of the gate-pipeline rejections — no rejection counts, no measured failure-class ratios. What follows is a qualitative read from triaging those failures by hand.

In that triage, the recurring category was not "agent did the task badly." It was "agent did something the instruction never asked for": invented frontmatter fields, restructured sections that were supposed to be stable, silently widened scope. The instruction had gaps; the model filled them. Every retry re-rolled the dice on which gaps got filled how.

A queue is only safe to retry when the work unit is deterministic with respect to its inputs. Natural-language prompts are not. Specs can be.

## Specs are interface contracts, not documentation

The framing that made this click for us comes from the spec-kit methodology doc: "Specifications don't serve code—code serves specifications." A spec is not a description you write after deciding what to build. It is the contract the agent's output is checked against — the same role a JSON schema plays for an API response.

The tooling landscape converged on roughly the same shape from two directions:

- **GitHub Spec Kit** (v0.10.2, released 2026-06-11; supports 30+ coding agents including Copilot, Claude Code, Gemini CLI, and Cursor CLI) structures work as four artifacts — `constitution.md`, `spec.md`, `plan.md`, `tasks.md` — driven by nine slash commands: six core (`/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.taskstoissues`, `/speckit.implement`) plus three optional (`/speckit.clarify`, `/speckit.analyze`, `/speckit.checklist`).
- **Kiro** (AWS) uses exactly three files per spec — `requirements.md` (or `bugfix.md`) → `design.md` → `tasks.md` — and analyzes the dependencies in your task list so that independent tasks at the same level run concurrently, in dependency-ordered "waves."

GitHub's blog post describes the workflow as four phases: Specify (user journeys, success criteria) → Plan (stack, architecture, constraints) → Tasks (small, reviewable units) → Implement. The line that matters operationally: "Specifications become the source of truth. When something doesn't make sense, you go back to the spec." Disagreements get resolved by editing a file under version control, not by re-prompting and hoping.

Two mechanisms in these templates do most of the work, and both are gates rather than prose.

### The `[NEEDS CLARIFICATION]` marker

Spec Kit's templates force the agent to tag every ambiguity explicitly instead of resolving it silently. The methodology doc describes the templates as guardrails that turn the AI "from a creative writer into a disciplined specification engineer." This is the same control we already had in our publishing pipeline — validation failure blocks publication — moved upstream to the requirements phase. Ambiguity doesn't pass the gate; it surfaces as a marker a human must resolve.

### EARS notation for requirements

Kiro's best-practice docs write acceptance criteria as `WHEN [condition] THEN the system SHALL [behavior]`. The value is machine-checkable granularity: each clause is one testable assertion. For bugfixes, Kiro adds the clause that earns its keep on retries: `SHALL CONTINUE TO [existing behavior]` — an explicit regression guard naming what must *not* change. That clause is the answer to our "agent restructured the stable sections" failure class.

## The template (tier 2: feature work)

This is the contract we hand to an agent for a feature-sized task. One file, three sections, every field load-bearing.

```markdown
# Work Order: <feature name>

## 1. Requirements (the WHAT and WHY — no implementation details)
Intent: <one sentence: what the user gets and why it matters>

Acceptance criteria (EARS notation):
- WHEN <condition> THEN the system SHALL <observable behavior>
- WHEN <condition> THEN the system SHALL <observable behavior>
- The system SHALL CONTINUE TO <existing behavior that must not regress>

Out of scope: <explicit list — anything not listed here is also out of scope>
Open questions: [NEEDS CLARIFICATION: <ambiguity the author could not resolve>]

## 2. Plan (constraints the implementation must respect)
Stack / boundaries: <languages, frameworks, modules that may be touched>
Must not touch: <files, schemas, public interfaces that are frozen>
Verification: <command(s) that must pass: tests, linters, build>

## 3. Tasks (small, reviewable, independently retryable)
- [ ] T1: <task with its own done-condition> (depends on: —)
- [ ] T2: <task with its own done-condition> (depends on: T1)
- [ ] T3: <task with its own done-condition> (depends on: T1)
```

Rules of use, in priority order:

- **Section 1 contains zero implementation detail.** Spec Kit's template phrasing — "Focus on WHAT users need and WHY" — exists to keep design decisions out of requirements, where they calcify before anyone has evaluated alternatives.
- **An empty `Open questions` section must be earned, not defaulted.** If the agent (or you) cannot fill a field, write `[NEEDS CLARIFICATION]` and stop. An ambiguity that passes the gate becomes a guess in the code.
- **Every task gets its own done-condition.** This is what makes retries safe. When T2 fails, you re-run T2 against its stated condition — not the whole job against a vibe. Kiro's wave execution depends on exactly this property: tasks with declared dependencies and local completion criteria can run concurrently and retry in isolation.
- **`Must not touch` is not optional.** In our hand-triage of gate failures, the most common way agents failed was by exceeding scope, not by missing it.

## Scaling rules: don't ship a constitution for a typo fix

Match artifact weight to blast radius: one file for a bugfix, one page for a feature, four files only for a new system. This is where most SDD advocacy goes wrong, and where the strongest critique lands. Birgitta Böckeler, comparing Kiro, spec-kit, and Tessl on martinfowler.com, found spec-kit's artifacts "repetitive" and "very verbose," overkill even for medium-sized features: "To be honest, I'd rather review code than all these markdown files." She also documents Kiro inflating a simple bugfix into 16 acceptance criteria — a template mismatched to problem size — and cases where agents ignored elaborate specs or over-applied them into duplicated implementations.

We take that critique at face value, because we hit the same wall: if the markdown review burden exceeds the code review burden, the spec is net-negative. The template is not a liturgy. It scales:

| Tier | Problem size | Artifacts |
|------|--------------|-----------|
| 1 | Bugfix, config change | One `bugfix.md`: defect, one-to-three EARS criteria, one `SHALL CONTINUE TO` regression clause |
| 2 | Feature in an existing system | The one-page work order above |
| 3 | New system or service | Tier 2 split into `spec.md` / `plan.md` / `tasks.md`, plus a `constitution.md` of standing rules |

Tier 1 is deliberately tiny. A regression clause plus a done-condition is the whole contract, and it already eliminates the failure mode that bit us — the agent "improving" things nobody asked about.

The constitution appears only at tier 3 because standing rules are project-lifetime invariants, not per-task instructions. Spec Kit's own constitution shows the register these should be written in: Article III declares test-first development "NON-NEGOTIABLE"; Article IX says "Prefer real databases over mocks." Short, falsifiable, checkable at review time. Write yours once; reference it from every work order instead of restating it.

And on Böckeler's other finding — agents sometimes ignore the spec entirely — the honest answer is that the template alone does not fix this. The spec is only half the contract; the other half is enforcement. A verification command in section 2 that actually runs, and a review that diffs the output against the EARS criteria, is what makes the contract binding. A spec without a gate is just longer vibe-coding.

## Where this leaves you

Since switching our queue jobs from prose instructions to tier-1/tier-2 work orders, retried jobs have stopped surprising us: the regression clause pins what must not move, and per-task done-conditions make partial re-runs meaningful. To be precise about the strength of that claim: we did not instrument it — we have no count of retried jobs and no before/after comparison of gate pass rates — so read it as an operator's qualitative observation, not a measured result.

We did not adopt the full four-artifact ceremony for daily work — Böckeler is right that it is too heavy there. We did adopt the two gate mechanisms (`[NEEDS CLARIFICATION]`, EARS criteria) everywhere, because they cost three lines and catch the guess-filling failure class outright.

Steal the tier-2 template above as-is. Demote to tier 1 by default; promote to tier 3 only when you are creating a system that will outlive the task. If you want the fully tooled version with slash commands and agent integrations, Spec Kit and Kiro both ship working implementations of the same idea. Either way, the principle holds: the agent's output is a proposal. The spec decides whether it becomes state.