---
slug: field-ops-for-agentic-software
title: "Field Ops: The Missing Discipline for Production Agentic Software"
description: A definition and a manifesto. Production agents fail silently, compound across stateful runs, and make cost a reliability variable — yet they ship without a named ops discipline. Here is the proposed one, built against the SRE precedent.
pubDatetime: 2026-06-16T00:00:00Z
tags: [field-ops, agentic-software, sre, observability, reliability]
series: About
draft: false
references:
  - name: "Google SRE Book — Introduction (Benjamin Treynor Sloss)"
    url: https://sre.google/sre-book/introduction/
  - name: "Anthropic Engineering — How we built our multi-agent research system"
    url: https://www.anthropic.com/engineering/built-multi-agent-research-system
  - name: "Anthropic Engineering — Building effective agents"
    url: https://www.anthropic.com/engineering/building-effective-agents
  - name: "Chip Huyen — Agents"
    url: https://huyenchip.com/2025/01/07/agents.html
---

Every prior generation of software earned a named operations discipline once it hit production scale. The web got SRE. ML got MLOps. Agents are in production right now — taking irreversible actions, spending real money, writing real rows — without one. This is a proposal for that missing discipline, and an argument for why the older ops models cannot cover it.

## The precedent: SRE was an answer to a structural conflict

The cleanest definition of an ops discipline I know comes from Benjamin Treynor Sloss, who coined SRE at Google in 2003: *"SRE is what happens when you ask a software engineer to design an operations team."* SRE didn't appear because servers were hard. It appeared to resolve a structural conflict — developers want to ship fast, traditional ops wants stability through change restriction — and the resolution was to make operations itself an engineering problem. The book is blunt about the stakes: *"the team tasked with managing a service needs to code or it will drown."*

Borrow the frame exactly. **Field Ops is what happens when you ask a software engineer to design an operations team for non-deterministic agents.** The conflict is new but no less structural: autonomy ships capability, yet every unit of autonomy is also a unit of unbounded, probabilistically-wrong behavior in production. You cannot restriction-manage your way out of that. You cannot prompt your way out of it either. You engineer the operating surface around it.

## The one number that kills the old ops model

Deterministic-era ops assumes a step either passes or pages you. Agent steps don't divide that cleanly. The math, from Chip Huyen's writeup, is the whole manifesto in one line: *"the overall accuracy decreases as the number of steps increases."* At 95% per-step accuracy, you get roughly **60% success over 10 steps and about 0.6% over 100 steps.**

Sit with that. A 95%-reliable step — which sounds production-grade — compounds into a **~99% failure rate over a 100-step run** (0.6% success is a 99.4% failure rate).

And the failures aren't loud. Huyen catalogs the modes: invalid tool calls, valid tools with invalid parameters, valid tools with plausible-but-wrong parameter values, and planning failures — including reflection error, the agent *"convinced that it's accomplished a task when it hasn't."*

This is where the SRE mental model breaks. A fault in an agent run is rarely a crash. Anthropic's production note is explicit that *"agents can run for long periods of time, maintaining state across many tool calls"* — so a fault is a **poisoned context the agent confidently builds on for fifty more steps.** Silent-wrong, not loud-wrong, compounded across stateful runs. That is the threat model Field Ops exists to contain.

## The four field contracts

A discipline needs principles you can re-cite. Here are four — each mapped to a documented failure mode and to one real operating surface, the `musu-website-co` publishing daemon.

### 1. Failures are silent — so tracing is the primary instrument, not metrics

A metrics dashboard tells you a step "succeeded." It cannot tell you the step succeeded with a wrong value. Anthropic's finding was direct: *"adding full production tracing let us diagnose why agents failed and fix issues systematically."*

Field Ops puts tracing first, then adds a layer SRE never needed: a **contract gate** — a deterministic assertion the agent's output must pass before it becomes project state. Gates convert silent-wrong into loud-fail *before* it ships downstream. In our pipeline, a draft is not a publishable post until it clears schema validation, link checks, and policy gates. Output is a proposal; the gate is what promotes it to state.

### 2. Runs are long and stateful — so resume, don't restart

When a tool fails mid-run, discarding the whole run throws away an expensive, hard-to-reproduce context. Anthropic's pattern is to let the agent *"adapt"* and resume rather than restart, and the substrate for that is a write-ahead log.

Our publishing daemon runs a **crash-safe WAL queue**: a tenant job that dies — process crash, redeploy, transient API error — replays from the log instead of starting over. The deployment corollary is **rainbow deployments**, *"gradually shifting traffic from old to new versions while keeping both running simultaneously"* — how you redeploy a daemon without killing in-flight jobs. Resumption and rainbow shipping are the same rule at two timescales: never let a fault destroy work in progress.

### 3. Cost is a reliability variable — so budget is an SLO

Autonomy is not free. Anthropic measured agents using *~4× more tokens* than chat, and multi-agent systems *~15× more* — the payoff, in their case, being a multi-agent setup that beat single-agent Opus 4 by **90.2%** on an internal research eval.

When a runaway loop can 15× your spend, the token budget is a reliability boundary, not an accounting footnote. Field Ops owns a **cost budget as an SLO**, with hard caps that page and halt — the agent-era equivalent of an error budget.

### 4. Autonomy needs bounded authority — so change management is a contract

SRE's answer to dev-versus-ops was the error budget. Field Ops' answer to autonomy-versus-stability is bounded authority: guardrails, human-in-the-loop on irreversible actions, and Anthropic's discipline of adding complexity *"only when it demonstrably improves outcomes,"* validated with *"extensive testing in sandboxed environments."* Agents *"trade latency and cost for better task performance"* — an operational tradeoff you choose deliberately, not a property you get for free.

### How the contracts map

| Failure mode | Field contract | Operating surface |
|---|---|---|
| Silent-wrong output | Tracing first + contract gate | schema/link/policy gates before state |
| Long stateful run dies mid-flight | Resume, don't restart | crash-safe WAL queue, rainbow deploys |
| Runaway token spend | Cost budget as an SLO | hard caps that page and halt |
| Unbounded autonomy | Bounded authority | guardrails, human-in-the-loop, sandboxed testing |

## Where the boundary is

A named discipline is only useful if it has edges. Field Ops is **not prompt engineering** — that's authoring the input. It is **not MLOps** — that's training and serving the model. Field Ops begins the moment an agent takes an irreversible action in production: the API call that can't be unmade, the row written, the message sent, the money moved. Everything upstream is authoring. Everything from that action onward — the tracing, the gates, the WAL, the budget, the bounded authority — is Field Ops.

The name and the SRE analogy here are my editorial coinage, not established industry terminology. But the gap is real and the evidence is primary: production agents fail silently, compound across stateful runs, and make cost a reliability variable — and the field already reaches for tracing, resumption, rainbow deploys, and gates to contain it. That is not a bag of tricks. It is a discipline waiting for a name. If you operate agents in production, you are already doing Field Ops. Start by writing down your gates — then tell me where this definition breaks.