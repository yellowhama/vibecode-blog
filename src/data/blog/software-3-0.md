---
title: "Software 3.0 Is a Verification Problem"
pubDatetime: 2026-05-13T12:00:00Z
description: "The useful Software 3.0 lesson is not that LLMs replace engineering. It is that faster generation moves the bottleneck to context, review, and evidence."
draft: false
series: "AI Explainer"
workflow: "packet"
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

The easy take on Software 3.0 is that natural language became code. That is the least useful part of the idea.

The part that changes daily engineering is harsher: generation got cheaper, so verification became the bottleneck.

An agent can produce a diff faster than a human can understand its consequences. That does not remove engineering work. It moves the work from typing implementation to deciding what evidence would make the implementation acceptable.

If your process still treats "the agent wrote code" as the hard part, the process is behind the tooling.

## What Actually Changed

The old workflow assumed that writing code was the expensive step. The new workflow often makes writing the cheapest step and review the scarce step.

```txt
Before:
read docs -> design -> write code -> test -> ship

With agents:
read docs -> define contract -> generate diff -> inspect evidence -> accept or reject
```

The agent may create the implementation. The operator still owns the contract.

That contract has to answer five questions before the diff exists:

```txt
Which source is authoritative?
What behavior must stay unchanged?
What command proves the claim?
What artifact survives the session?
What condition makes the agent stop?
```

## The Mechanism

Software 3.0 fails in a repeatable shape:

```txt
prompt expands intent
agent creates a plausible diff
diff touches more surfaces than the prompt named
operator sees the result after the blast radius already exists
team argues about taste, safety, or correctness by inspection
```

The fix is not a longer prompt. The fix is moving the rejection path earlier:

```txt
source -> contract -> diff -> verifier -> durable receipt -> approval
```

That sequence matters because each step changes who is allowed to guess.

| Step | What it prevents |
| --- | --- |
| Source | The agent inventing authority from memory |
| Contract | The feature becoming an open-ended rewrite |
| Diff | The change hiding outside the named surface |
| Verifier | A plausible result becoming accepted without evidence |
| Receipt | The next session losing what was actually proven |
| Approval | The agent silently publishing its own work |

The practical rule: generation can be probabilistic, but acceptance cannot be.

A useful test is whether the next operator can reject the change without asking the original agent what it meant. If the answer is no, the system is still running on conversation memory. That is fine for a demo. It is not fine for a product surface.

## The Work Shift

| Old center of gravity | New center of gravity |
| --- | --- |
| Writing lines | Defining boundaries |
| Holding context in your head | Supplying source notes |
| Reviewing after the fact | Designing checks first |
| Asking for "the feature" | Naming criteria and failure modes |
| Trusting one green result | Keeping repeatable gates |

That table is the useful Software 3.0 model. Not "the LLM is literally the operating system." The useful model is that the model has become a fast execution surface, and every fast execution surface needs contracts.

## A Concrete Example

On this site, the agent was allowed to create posts, images, API output, and build artifacts. The speed was useful. It also created failures that did not look like normal coding bugs:

```txt
English blog receiving Korean content
generic images reused across posts
public product mentions appearing before the product was ready
stale generated JSON drifting from source posts
archive counts becoming part of handoff truth
```

Those failures were not solved by asking for "better writing" or "cleaner output." They were solved by adding gates that could reject public work:

```txt
verify:editorial-contract
verify:public-surface
verify:content
verify:dist
reindex_wiki.py
archive_completed_artifacts.ps1
```

The agent can still move fast. The difference is that every public surface now has a checker that can say no.

That is the practical meaning of Software 3.0 for an operator: do not celebrate faster generation until the rejection path is at least as real as the creation path.

## The Receipt

One verified Vibecode Town receipt is small enough to inspect:

```txt
published posts checked: 10
packet-backed posts: 9
post image contracts checked: 10
rendered viewport checks: 24
publication approval records: 10
reference-writing average score: 94
```

The before/after is the important part.

| Before | After |
| --- | --- |
| Post changed silently | `verify:publication-approvals` checks Markdown SHA256 |
| Image existed but did not fit the post | `verify:post-image-contracts` checks path, size, uniqueness, and anchors |
| Page built but broke when rendered | `verify:rendered-pages` captures desktop and mobile screenshots |
| Source trail was skipped | `verify:source-workflow` requires packet files |
| Product mention leaked by habit | `verify:public-page-review` rejects forbidden public product mentions |

This is what changed: generation became cheap enough that the site needed an explicit rejection path for writing, images, rendering, and approval.

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

Then require the run to leave a receipt:

```txt
commands run
files changed
checks passed or failed
known boundary
next action
```

## Boundary

Software 3.0 is a useful frame, not a license to mystify the work. LLMs are not magic operating systems. They are fast, probabilistic execution partners.

This does not prove that every task needs a heavy agent harness. A throwaway prototype, a one-off script, or a visual sketch may still be better served by fast generation and human inspection.

The limit appears when the output has to survive contact with users, money, security, deployment, or another agent session. At that point, speed without a rejection path becomes a liability.

The engineering discipline is still the same shape: define the system, constrain the change, verify the result. The difference is that now the unverified output arrives much faster.
