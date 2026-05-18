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
ogImage: "/images/posts/pencil-technical-contract.png"
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

A 200-line Markdown plan appears. The PR explanation gets longer. The research summary includes tables, diffs, timelines, snippets, and caveats. The human scrolls, nods, and moves to the next prompt.

That is not a writing problem. It is a review-surface problem.

![Technical contract sketch](/images/posts/pencil-technical-contract.png)

## The Skipped Plan Problem

Thariq Shihipar argues for using HTML artifacts with Claude Code because HTML can carry more information density: tables, SVG diagrams, layouts, interactive controls, code snippets, visual grouping, and shareable browser pages.

The point is not that HTML is prettier than Markdown.

The point is that some agent outputs need to be compared, scanned, manipulated, and reviewed visually. Markdown is excellent for durable text. It is weaker when the reviewer needs a module map, annotated diff, incident timeline, design variant grid, or small throwaway editor.

When the review surface is wrong, the artifact may be technically complete and still operationally useless.

## Keep Markdown As Canon

The wrong conclusion is: "Replace Markdown with HTML."

Vibecode's rule is narrower:

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

Those files need to be searchable, reviewable in Git, and reusable by the next agent. Generated HTML is noisy in version control, especially once CSS and JavaScript are mixed into the document.

So HTML should sit above the contract, not replace it.

## Where HTML Wins

HTML is useful when the human needs to do one of these:

```txt
compare options side by side
inspect a flow visually
review annotated diffs
scan an incident timeline
tune a prompt or animation with controls
share a readable report with another person
```

For example, "write a PR description" can be Markdown. But "explain streaming and backpressure to a reviewer who does not know this subsystem" is often better as an HTML artifact with callouts, diagrams, and highlighted code snippets.

Planning works the same way. Six onboarding directions in Markdown force the reader to imagine six screens. Six directions in an HTML grid let the reader compare density, tone, layout, and tradeoff at once.

That is not decoration. It is decision speed.

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
Create a single HTML review artifact for this PR.
Read the source files and show the data flow, the risky diff chunks, and the acceptance checks.
Add a copy button that exports the final review notes as Markdown.
Do not make the HTML the source of truth.
```

That last sentence is the important part.

## Technical Verdict

Agent output needs UX. If people do not read the plan, the plan is not doing its job.

But visual polish can hide weak evidence. A beautiful timeline with no source inventory is still a guess. A dashboard with no export path is still hidden state.

Vibecode accepts HTML artifacts as review tools because they make complex agent output easier to inspect. It does not accept them as the contract.

That is the same standard we use for [MUSU Pro](https://musu.pro): the interface can be rich, but the proof has to return to evidence, manifests, and verifiable boundaries.
