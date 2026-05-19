---
title: "Software 3.0 Is a Verification Problem"
pubDatetime: 2026-05-13T12:00:00Z
description: "The useful Software 3.0 lesson is not that LLMs replace engineering. It is that faster generation moves the bottleneck to context, review, and evidence."
draft: false
series: "AI Explainer"
workflow: "legacy"
tags: ["engineering", "software-3.0", "agentic-engineering", "verification"]
ogImage: "/images/posts/software-3-0.png"
references:
  - name: "Andrej Karpathy: Software Is Changing Again"
    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ"
    guru: "Andrej Karpathy"
  - name: "Not all AI-assisted programming is vibe coding"
    url: "https://simonwillison.net/2025/Mar/19/vibe-coding/"
    guru: "Simon Willison"
---

# Software 3.0 Is a Verification Problem

![Software 3.0 kernel contract diagram](/images/posts/software-3-0.png)

The easy take on Software 3.0 is that natural language became code.

That is catchy, but it is not the part that changes day-to-day engineering. The practical shift is harsher: generation got cheaper, so verification became the bottleneck.

An agent can produce a diff faster than a human can understand its consequences. That does not remove engineering work. It moves the work from typing implementation to defining context, checking boundaries, and proving the output belongs in the system.

## What Actually Changed

The old workflow assumed that writing code was the expensive step. The new workflow often makes writing the cheapest step.

```txt
Before:
read docs -> design -> write code -> test -> ship

With agents:
read docs -> define contract -> generate diff -> inspect evidence -> reject or ship
```

The agent may create the implementation, but the operator still owns the contract.

## The Work Shift

| Old center of gravity | New center of gravity |
| --- | --- |
| Writing every line | Defining the boundary the generated diff must satisfy |
| Remembering project context in your head | Supplying source notes, specs, and handoffs |
| Reviewing code after the fact | Designing checks before the agent starts |
| Asking for "the feature" | Giving acceptance criteria, failure modes, and test commands |
| Trusting a green local result | Keeping build, content, archive, and evidence gates repeatable |

That table is the useful Software 3.0 model. Not "the LLM is literally the operating system." The useful metaphor is that the model has become a powerful execution surface, and every powerful execution surface needs contracts.

## A Concrete Example

On this site, the agent was allowed to create posts, images, API output, and build artifacts. That speed created new failure modes:

```txt
English blog receiving Korean content
generic images reused across posts
public product mentions appearing before the product was ready
stale generated JSON drifting from source posts
archive counts becoming part of handoff truth
```

The fix was not a better prompt. The fix was gates:

```txt
verify:editorial-contract
verify:public-surface
verify:content
verify:dist
reindex_wiki.py
archive_completed_artifacts.ps1
```

The agent can still move fast. The difference is that every public surface has a checker that can say no.

## Reader Decision

If an agent is only producing disposable prototypes, a prompt may be enough.

If the agent is changing a product, publishing a post, touching deployment behavior, or producing evidence, ask for the contract before the implementation:

```txt
What source is authoritative?
What must not change?
What command proves the result?
What artifact survives for the next session?
What boundary makes the agent stop?
```

## Boundary

Software 3.0 is a useful frame, not a license to mystify the work. LLMs are not magic operating systems. They are fast, probabilistic execution partners.

The engineering discipline is still the same shape: define the system, constrain the change, verify the result. The difference is that now the unverified output arrives much faster.
