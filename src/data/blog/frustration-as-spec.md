---
title: "Frustration Is a Signal, Not the Specification"
pubDatetime: 2026-05-10T10:00:00Z
description: "The useful move is not to vent at the agent. It is to turn repeated irritation into a contract, a verifier, and evidence."
draft: false
series: "Field Log"
workflow: "legacy"
tags: ["engineering", "observability", "debugging", "slop-detection"]
ogImage: "/images/posts/frustration-as-spec.png"
references:
  - name: "LLMs Demand Observability-Driven Development"
    url: "https://www.honeycomb.io/blog/llms-demand-observability-driven-development"
    guru: "Charity Majors"
  - name: "Creating a search and discovery engine for LLM evals"
    url: "https://hamel.dev/blog/posts/evals/"
    guru: "Hamel Husain"
---

# Frustration Is a Signal, Not the Specification

![Frustration into specification signal diagram](/images/posts/frustration-as-spec.png)

The problem is not that the agent makes a mistake. The useful moment is when you correct the same mistake twice.

That is the point where frustration stops being a mood and starts being telemetry. Something in the system is under-specified. The agent is not seeing a boundary that the operator assumed was obvious.

In the last site hardening pass, the repeated corrections were blunt:

```txt
Do not use C when the active archive is on F.
Do not publish Korean text into the English blog.
Do not reuse the same image across posts.
Do not insert product mentions into every article.
Do not call a clean-looking essay good if it has no evidence.
```

Those complaints were not specs. They were signals pointing at missing specs.

## From Complaint to Contract

The repair pattern is simple:

| Friction | Contract | Verifier or evidence |
| --- | --- | --- |
| Files kept landing in the wrong place | Archive and temp roots must resolve to the F-drive operating archive | archive sync counts and temp-root scripts |
| English blog received Korean content | Public posts must be English-only | editorial/public-surface gates |
| Images were blank or reused | Each post needs one visible slug-specific image | image byte checks, public-surface gate, browser screenshot |
| Product names appeared by default | No public product mention until proof/release context exists | public product mention scan |
| Essays sounded polished but weak | Public posts need source, evidence, artifact, boundary, and reader decision | per-post quality critique |

That table is the real specification work. The feeling points to the gap; the contract closes it.

## Why Observability Matters

Observability-driven development is useful here because agent failures are often process failures, not single-line bugs. A vague "the output is bad" complaint does not help the next session. A recorded failure mode does.

Instead of asking the agent to "do better," capture:

```txt
what the agent did
why it was wrong
which boundary was missing
which checker should fail next time
what evidence proves the repair
```

This is also how eval thinking helps. The point is not to invent a magical score. The point is to turn a repeated subjective complaint into a repeatable test or review gate.

## The Frustration-to-Spec Pipeline

Use this pipeline when a workflow keeps producing the same correction:

```txt
1. Name the friction in plain language.
2. Find the hidden assumption behind it.
3. Convert the assumption into a contract.
4. Add a verifier, checklist, or review gate.
5. Store the result in operating memory.
6. Re-run the workflow and check whether the correction disappears.
```

Example:

```txt
Friction: "The post has an image, but it does not match the article."
Hidden assumption: The image contract only checked existence.
Contract: One body image must match ogImage, live under /images/posts/<slug>.png, be non-reused, and be visually meaningful.
Verifier: editorial contract plus public-surface gate plus browser screenshot.
```

The second version is actionable. Another agent can enforce it without guessing your mood.

## Boundary

Frustration is not proof. Sometimes the operator is wrong. Sometimes the correction belongs in taste, not code. Sometimes the fix is documentation, not a test.

But repeated frustration is a high-signal input. Do not leave it as a chat complaint. Convert it into a contract the system can carry forward.

The goal is not to manage the agent's vibe. The goal is to make the next failure harder to repeat.
