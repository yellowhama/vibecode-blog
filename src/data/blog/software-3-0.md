---
title: "Software 3.0 Is a Verification Problem"
pubDatetime: 2026-05-13T12:00:00Z
description: "The useful Software 3.0 lesson is not that LLMs replace engineering. It is that faster generation moves the bottleneck to context, review, and evidence."
draft: false
series: "AI Explainer"
workflow: "packet"
ogImage: /images/posts/software-3-0.webp
tags:
  - software-engineering
  - ai-agents
  - software-3.0
  - agentic-engineering
  - verification
  - technical-contracts

references:
  - name: "Andrej Karpathy: Software Is Changing Again"
    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ"
    guru: "Andrej Karpathy"
  - name: "Not all AI-assisted programming is vibe coding"
    url: "https://simonwillison.net/2025/Mar/19/vibe-coding/"
    guru: "Simon Willison"
  - name: "Building effective agents"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
    guru: "Anthropic"
---

# Software 3.0 Is a Verification Problem

On 2026-05-20, I opened GitHub commit `20f4834`, ran `npm run audit:reference-ceiling`, and found this article at the bottom of the report: `software-3-0 score=85 grade=strong-but-thin`.

The code was fine. The essay was the failure.

![Proof diagram showing source, contract, verifier, receipt, and approval gates for Software 3.0 work](/images/posts/software-3-0.webp)

Read the image as a rejection diagram, not a decoration. The useful path is `source -> contract -> diff -> verifier -> receipt -> approval`; the dangerous path is `prompt -> plausible output -> social pressure to accept`. The diagram exists to make that gap visible before the agent starts editing files like `src/data/blog/software-3-0.md` or records like `src/data/publication-approvals.json`.

The easy take on Software 3.0 is that natural language became code. That is the least useful part of the idea.

The part that changes daily engineering is harsher: generation got cheaper, so verification became the bottleneck. The agent can produce the next version. The operator still has to know what would make it true enough to publish.

The problem is not that agents are too weak to write. The problem is that they are strong enough to produce confident, coherent, almost-right work faster than the team can inspect it.

An agent can produce a diff faster than a human can understand its consequences. That does not remove engineering work. It moves the work from typing implementation to deciding what evidence would make the implementation acceptable.

If your process still treats "the agent wrote code" as the hard part, the process is behind the tooling.

The wrong standard is "did the agent make the thing?" The useful standard is "can the team reject the thing before it touches users?"

## What Actually Changed

The old workflow assumed that writing code was the expensive step. The new workflow often makes writing the cheapest step and review the scarce step.

```txt
Before:
read docs -> design -> write code -> test -> ship

With agents:
read docs -> define contract -> generate diff -> inspect evidence -> accept or reject
```

The agent may create the implementation. The operator still owns the contract.

That is the trap in Software 3.0: the output arrives with the emotional shape of completion. It has files, screenshots, tests, maybe even a nice commit message. But if the rejection path was invented after the diff, the team is already negotiating with a finished-looking object.

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

The rule is blunt: if you cannot name the source, boundary, verifier, receipt, and approval owner before the agent starts, the agent is not accelerating engineering. It is accelerating ambiguity.

## The Work Shift

| Old center of gravity | New center of gravity |
| --- | --- |
| Writing lines | Defining boundaries |
| Holding context in your head | Supplying source notes |
| Reviewing after the fact | Designing checks first |
| Asking for "the feature" | Naming criteria and failure modes |
| Trusting one green result | Keeping repeatable gates |

That table is the useful Software 3.0 model. Not "the LLM is literally the operating system." The useful model is that the model has become a fast execution surface, and every fast execution surface needs contracts.

Karpathy's Software 3.0 frame is useful because it names the shift in the medium. Willison's vibe-coding boundary is useful because it refuses to call every AI-assisted edit the same thing. Anthropic's agent/workflow distinction is useful because it asks whether the system is following a defined path or choosing its own next step. Put those together and the stronger pattern is obvious: do not argue about whether the work is "AI code." Ask which path produced it, which boundary constrained it, and which verifier can reject it.

The weaker pattern is content about agents that stops at vocabulary. The stronger pattern turns the vocabulary into an operating rule.

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

The cost was not theoretical. A source-language mismatch on an English blog would have made the site look unattended. Reused images would have told the reader the evidence was decorative. A premature product mention would have turned a technical article into a sales leak. A stale approval record would have made the next operator trust a version no one had actually approved.

That is the expensive part of cheap generation: the mistake arrives looking finished. Without a rejection path, the team pays for it later as rereading time, cleanup work, and lost credibility.

The agent can still move fast. The difference is that every public surface now has a checker that can say no.

That is the practical meaning of Software 3.0 for an operator: do not celebrate faster generation until the rejection path is at least as real as the creation path.

On the current site, that rejection path is no longer a diagram. The latest proof packet checked 9 non-About posts, 10 public pages, 24 rendered viewports, 10 approval records, 348 indexed wiki markdown files, and 380 archived files before the site could keep the current article state.

The 2026-05-21 receipt is intentionally small: 9 posts, 10 pages, 24 viewports, 10 records, 348 files indexed, and 380 files archived. Those counts make the claim inspectable instead of theatrical.

## The Case File

The concrete case is this article's own repair loop.

Before the reference-ceiling pass, the article had already passed the normal publication gate. It had references, an image, a source packet, and a human approval. It was publishable. It was not yet strong.

The above-gate audit made that difference visible:

```txt
report=<artifact-root>\\vibecode-reference-ceiling-audit\latest.json
slug=software-3-0
score=85
grade=strong-but-thin
gaps=opening scene, named system/date/artifact, inline artifacts, length
```

That is the Software 3.0 shift in one file. The first gate asks, "Can this ship without obvious damage?" The second gate asks, "Would a serious reader keep reading?"

Different question. Different verifier.

The repair did not require the agent to be more inspired. It required the system to point at the exact missing proof:

```txt
src/data/blog/software-3-0.md
src/data/publication-approvals.json
scripts/audit-reference-ceiling.mjs
scripts/audit-reference-writing.mjs
scripts/verify-rendered-pages.mjs
<rendered-audit-root>\summary.json
<wiki-root>\companies\vibecode-town\plans\software-3-0-evidence-bundle.md
```

That list is the new engineering object. Not the prompt. Not the chat. The object is the contract around the generated work.

## Before/After For The Operator

The shallow Software 3.0 workflow says:

```txt
ask agent -> get output -> skim output -> ship
```

The usable workflow says:

```txt
name source -> name boundary -> generate diff -> run verifier -> inspect receipt -> approve hash
```

The second workflow is slower in the moment and faster over the week. It prevents the hidden tax: rereading old chats, guessing why a file changed, fixing image drift after publish, or discovering that an approval no longer matches the Markdown hash.

The best Software 3.0 systems will not feel like magic. They will feel like fewer mysteries.

The point is not to slow the agent down. The point is to stop turning every fast output into a human archaeology project.

## The Receipt

One verified Vibecode Town receipt is small enough to inspect:

```txt
published posts checked: 10
packet-backed posts: 9
image rules checked: 10
rendered viewport checks: 24
publication review records: 10
reference-writing average score: 100
reference-ceiling average score before this pass: 96
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

Use this as the acceptance line: accept generated work only when the rejection path is visible before the result. Reject it when the only reason to accept is that the output looks complete.

## Reader Decision

If an agent is only producing disposable prototypes, a prompt may be enough.

Forward this article to the teammate who says, "the agent already made it, can we ship it?" The decision it should help them make is simple: if the change touches users, deployment, money, security, or another operator's future context, the first review is not taste. The first review is whether the rejection path exists.

Next time an agent hands you a finished-looking diff, do not start by reading the prettiest part. Start by looking for the thing that could have stopped it.

Before accepting the diff, ask for the contract:

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

Before shipping agent-written work, ask one final question: "What would have stopped this output?" If the answer is "I would have noticed," the process is still Software 2.0 review wearing Software 3.0 speed. If the answer is a source, boundary, verifier, receipt, and approval record, the system has a real contract.
