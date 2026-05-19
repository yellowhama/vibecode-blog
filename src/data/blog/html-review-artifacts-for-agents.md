---
title: "Use HTML to Review Agent Output, Not to Replace the Contract"
pubDatetime: 2026-05-18T15:00:00Z
description: "Claude Code can make long plans, PR explainers, and reports easier to read as HTML. The source of truth still has to return to Markdown, JSON, or evidence files."
draft: false
featured: false
series: "AI Tool Note"
workflow: "packet"
lang: "en"
tags: ["ai-tools", "claude-code", "agentic-engineering", "technical-contracts"]
ogImage: "/images/posts/html-review-artifacts-for-agents.png"
references:
  - name: "Thariq X post"
    url: "https://x.com/trq212/status/2052809885763747935"
    guru: "Thariq Shihipar"
  - name: "HTML effectiveness examples"
    url: "https://thariqs.github.io/html-effectiveness/"
    guru: "Thariq Shihipar"
  - name: "Simon Willison link post"
    url: "https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/"
    guru: "Simon Willison"
---

# Use HTML to Review Agent Output, Not to Replace the Contract

AI coding agents no longer struggle to write plans. The newer failure mode is that they write plans nobody reads.

A 200-line Markdown plan appears. The PR explanation gets longer. The research summary includes tables, diffs, timelines, snippets, and caveats. The human scrolls, nods, and moves to the next prompt without actually reviewing the work.

That is not a writing problem. It is a review-surface problem.

HTML helps when the human decision depends on layout, comparison, sequence, or annotation. It fails when the team starts treating a polished artifact as the source of truth.

![HTML review artifact export loop diagram](/images/posts/html-review-artifacts-for-agents.png)

## The Skipped Plan Problem

Thariq Shihipar's HTML examples make the point in the medium itself: some agent outputs are easier to review when they can use tables, SVG diagrams, tabs, grids, annotations, and small interactive controls.

The useful conclusion is not "HTML is better than Markdown." The useful conclusion is narrower:

```txt
Markdown is the contract.
HTML is the review surface.
```

Canon still belongs in durable, diffable formats:

```txt
source note
brief
evidence bundle
acceptance criteria
decision record
manifest
runtime evidence JSON
```

Generated HTML is allowed to help the human see. It is not allowed to become hidden truth.

## Where HTML Actually Changes the Review

HTML is worth the extra generation time when it changes what the reviewer can notice.

```txt
Markdown: a paragraph says module A calls module B.
HTML: a diagram shows A, B, retry path, backpressure, and the risky edge.

Markdown: a list says three design options exist.
HTML: the options sit side by side at the same viewport size.

Markdown: a PR summary says one diff is risky.
HTML: the diff is annotated in the margin with the exact concern.
```

That is the bar. If HTML only turns a memo into a nicer memo, keep the Markdown. If it makes the decision visible, use HTML.

## A Rendered Review Receipt

The current site hardening loop used HTML's older cousin: rendered browser proof.

Markdown alone could say:

```txt
All public posts have images and render correctly.
```

That is not enough. The rendered audit left inspectable artifacts:

```txt
vibecode-rendered-audit/latest/summary.json
vibecode-rendered-audit/latest/*-desktop.png
vibecode-rendered-audit/latest/*-mobile.png
```

The summary records the decision surface:

```txt
postsChecked=10
viewportsChecked=20
failures=[]
expectedImageVisible=true for each rendered result
```

That is why review artifacts matter. A human no longer has to trust a paragraph that says the posts have images. The reviewer can inspect the desktop and mobile screenshots and see whether the expected image actually appeared.

The same rule applies to generated HTML explainers: the artifact should make a review decision easier, and the result has to return to a durable receipt.

## Decision Matrix

| Use case | Best surface | Why |
| --- | --- | --- |
| Durable spec | Markdown | Diffable, searchable, easy for agents to ingest |
| Evidence packet | JSON or files | Machine-checkable and repeatable |
| PR or incident explainer | HTML | Diagrams, annotations, timelines, and links reduce review load |
| Design variant comparison | HTML | Multiple options can be seen side by side |
| Prompt or config tuning | HTML with export | Controls help exploration, but output must return to canon |

This is where HTML wins: it makes the review faster without pretending to be the system of record.

## The Review Artifact Contract

A useful HTML artifact should declare its own inputs.

```txt
source files read
diffs inspected
wiki packets used
external links included
files intentionally excluded
secrets redacted
network calls disabled
```

Then it should make the human decision easier:

```txt
module map
annotated risky snippets
timeline
before/after comparison
open questions
copyable review notes
```

For example, "write a PR description" can be Markdown. But "explain streaming and backpressure to a reviewer who does not know this subsystem" is often better as an HTML artifact with callouts, a data-flow diagram, and the three code snippets that matter.

The reviewer should be able to answer two questions within a minute:

```txt
What am I being asked to approve?
Which evidence would make me say no?
```

## The Export Rule

Interactive HTML artifacts need one hard requirement: export.

If a slider tunes animation timing, if a drag-and-drop board reprioritizes tickets, or if a prompt editor previews filled templates, the final decision cannot stay trapped in the browser.

Every interactive review artifact should export one of these:

```txt
copy as Markdown
copy as JSON
copy as prompt
copy as patch checklist
copy as decision record
```

Without export, HTML becomes hidden state. With export, the human can decide in the browser and send the result back into the durable contract.

## Prompt Pattern

Ask for the review surface and the return path:

```txt
Create a single local HTML review artifact for this PR.
Read the source files and list the exact files used.
Show the data flow, risky diff chunks, acceptance checks, and unresolved questions.
Do not make network calls.
Do not embed secrets.
Add a copy button that exports the final review notes as Markdown.
Do not make the HTML the source of truth.
```

That last sentence is the important part.

## Boundary

HTML can make weak evidence look finished. A polished timeline with no source inventory is still a guess. A dashboard with no export path is still hidden state.

Vibecode accepts HTML artifacts as review tools because they make complex agent output easier to inspect. It does not accept them as the contract.

The interface can be rich, but the proof has to return to evidence, manifests, and verifiable boundaries.
