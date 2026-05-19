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

## The Work Shift

| Old center of gravity | New center of gravity |
| --- | --- |
| Writing every line | Defining the boundary the generated diff must satisfy |
| Remembering project context in your head | Supplying source notes, specs, and handoffs |
| Reviewing code after the fact | Designing checks before the agent starts |
| Asking for "the feature" | Giving acceptance criteria, failure modes, and test commands |
| Trusting a green local result | Keeping build, content, archive, and evidence gates repeatable |

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

The current Vibecode Town receipt is small enough to inspect:

```txt
current commit: bf86204 Require human publication approvals
published posts checked: 10
packet-backed posts: 9
source workflow packet files: 54
rendered page screenshots: 20
publication approval records: 10
```

The before/after is the important part.

| Before | After |
| --- | --- |
| A public post could change without a matching approval record | `verify:publication-approvals` checks the current Markdown SHA256 |
| An image could exist without proving it matched the post | `verify:post-image-contracts` checks path, dimensions, byte size, uniqueness, and semantic anchors |
| A page could build while the rendered article still broke on mobile | `verify:rendered-pages` captures desktop and mobile screenshots |
| A source-inspired post could skip the packet trail | `verify:source-workflow` requires six packet files per non-About post |
| A product mention could leak into every post by habit | `verify:public-page-review` rejects forbidden public product mentions |

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

The engineering discipline is still the same shape: define the system, constrain the change, verify the result. The difference is that now the unverified output arrives much faster.
