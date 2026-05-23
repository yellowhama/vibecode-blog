---
title: "Use HTML to Review Agent Output, Not to Replace the Contract"
pubDatetime: 2026-05-18T15:00:00Z
description: "HTML is great for reviewing complex AI agent outputs, but dangerous as a system of record. Learn why the final decision must always export back to Markdown or JSON."
ogImage: /images/thumbnails/thumbnail_retro_risograph_1779564793673.png
draft: false
featured: false
series: "AI Tool Note"
workflow: "packet"
lang: "en"
tags:
  - ai-agents
  - software-engineering
  - claude-code
  - ui-design
  - technical-contracts
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

On 2026-05-20, I opened the DESIGN.md review artifact in Chrome, put the LLM wiki source packet beside it, and checked whether the browser page could survive one ugly risk question: **if I deleted the HTML file, would the decision still exist?**

That is the test most HTML-for-agents posts skip.

Before accepting a polished agent-made HTML file, run that delete test. Ask where the sources are, where the rejection criteria are, where the exported decision lands, and which hash-bound receipt would still prove the decision tomorrow.

![HTML review artifact export loop diagram](/images/posts/html-review-artifacts-for-agents.png)

AI coding agents no longer struggle to write plans. The newer failure mode is that they write plans nobody reads. A 200-line Markdown plan appears. The PR explanation gets longer. The research summary includes tables, diffs, timelines, snippets, and caveats. The human scrolls, nods, and moves to the next prompt without actually reviewing the work.

The useful example was a `DESIGN.md` spec review. The canon stayed in Markdown under the LLM wiki. The browser-readable artifact lived separately at:

```txt
<wiki-root>\companies\vibecode-town\html-artifacts\design-md-spec-operating-review-2026-05-18.html
```

That file was useful because it showed source cards, token swatches, a risk table, and a copyable decision record in one screen. It would have been dangerous if it became the only place the decision lived.

That is not a writing problem. It is a review-surface problem.

HTML helps when the human decision depends on layout, comparison, sequence, or annotation. It fails when the team starts treating a polished artifact as the source of truth.

Pretty is not proof. A browser view without export is not a review artifact. It is a hidden contract with better typography.

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

The stricter Vibecode version is:

```txt
Markdown/JSON/file evidence is the system of record.
HTML is a temporary review interface.
The decision must export back to canon.
The artifact must be deletable without losing the decision.
```

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

## A Real Artifact Shape

The `DESIGN.md` review artifact had a concrete source inventory, not just a pretty page.

The portable part is not the Windows path. The portable part is the receipt shape: source note, processed extract, rendered review surface, export target, and a place where the final decision returns to canon.

```txt
HTML artifact:
companies/vibecode-town/html-artifacts/design-md-spec-operating-review-2026-05-18.html

Canon source note:
sources/raw/2026-05-18_design-md-spec-update-transcript-note.md

Processed extract:
sources/processed/design-md-spec-update-function-extract.md

Template:
companies/vibecode-town/html-review-artifact-template.md

Current rendered receipt:
<rendered-audit-root>\summary.json
```

The page did four jobs that plain Markdown would have made easy to skip:

| HTML section | Review job |
| --- | --- |
| Source cards | Show what was read before the reviewer trusts the summary |
| Decision surface | Separate adopt/hold-back choices |
| Risk table | Make stale-spec and HTML-as-canon risks visible |
| Export textarea | Return the decision to Markdown/structured canon |

The important part was not that the page looked better. The important part was that it made the approval question harder to dodge:

```txt
Are we adopting DESIGN.md as an operating pattern?
What did we verify upstream?
What are we refusing to claim?
Where does the decision go after review?
```

That last line is the line that keeps HTML useful instead of decorative.

In the actual file, the useful controls were boring and inspectable: `design-md-spec-operating-review-2026-05-18.html` declared its source cards, the export lived in `exportText`, the copy action was a tiny `copyExport()` function, and the required pattern was preserved in `html-review-artifact-template.md`.

That is the level of implementation detail a review artifact needs. If the only artifact you can name is "the page," you do not have a review system. You have a nice screenshot.

## Approval Proof Chain

Here is the failure pattern to reject before an HTML artifact reaches a teammate.

**Bad output:**

```txt
The agent produces a polished local HTML page.
The reviewer says it looks good.
No source inventory is exported.
No negative condition is written down.
No Markdown or JSON decision record receives the approval.
The next agent treats the page as canon because it is the prettiest artifact in the folder.
```

**Gate added:**

```txt
npm run verify:rendered-pages
npm run verify:reference-blogger-review-manifest
npm run verify:reported-proof
```

Then ask the artifact to prove four boring things:

```txt
Source: exact files, links, diffs, packets, and screenshots used.
Accept only when: the HTML names those sources, shows what would make the reviewer say no, and exports the decision back to Markdown, JSON, a prompt, or a patch checklist.
Reject when: the page is the only proof, the copy button exports only praise, or the approval cannot be found after deleting the HTML file.
Boundary: HTML may be the review surface; it may not be the approval state.
```

**After:**

```txt
accepted review result exists
zero-item revision plan exists
publication review record matches the current content digest
rendered desktop/mobile receipts still pass
the exported decision survives without the HTML page
```

That chain is the difference between "the artifact looked impressive" and "the approval state is recoverable." The cost of skipping it is review debt: a public article, PR, or design decision can inherit a polished page with no rejection criteria and no durable record of what was actually approved.

## The Before/After

**Before the artifact**, the review path looked like this:

```txt
read transcript note
read processed extract
read operating recommendation
remember which parts are verified
write a decision somewhere else
hope the next agent finds it
```

**After the artifact**, the review path looked like this:

```txt
open design-md-spec-operating-review-2026-05-18.html
scan source cards
compare token/reasoning claims
read the risk table
copy the decision record
paste the decision back into Markdown canon
```

That is the practical gain. HTML did not make the decision more official. It made the review less lossy.

The old path asked the reviewer to hold the whole system in working memory. The new path put the comparison on screen and forced the decision back through `copy-as-Markdown`, `exportText`, `copyExport()`, `sources/raw/2026-05-18_design-md-spec-update-transcript-note.md`, `sources/processed/design-md-spec-update-function-extract.md`, and `companies/vibecode-town/html-review-artifact-template.md`.

The rule is less smooth, more reviewable.

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

The current writing-pulse repair kept the same standard and added a fresh receipt: product commit `3ad3512`, 10 posts, 41 pages, 24 viewports, 10 Pagefind pages, 2113 words, 349 files indexed in the wiki, 381 files archived, and zero rendered-page failures. The `html-review-artifacts-for-agents` approval now points at the current Markdown hash, so the article cannot silently drift away from its own proof chain.

The summary records the decision surface:

```txt
postsChecked=10
indexRoutesChecked=2
viewportsChecked=24
failures=[]
postDetailDesktopExpectedImagesInFirstScreen=10/10
surfaceExpectedImagesInFirstScreen=2/2
surfaceContractImageRoutesInFirstScreen=2/2
surfaceEvidenceCardRoutesInFirstScreen=2/2
```

That is why review artifacts matter. A human no longer has to trust a paragraph that says the posts have images. The reviewer can inspect the desktop and mobile screenshots and see whether the expected image actually appeared.

The same rule applies to generated HTML explainers: the artifact should make a review decision easier, and the result has to return to a durable receipt.

The receipt is the difference between:

```txt
Looks good.
```

and:

```txt
summary.json exists.
desktop/mobile screenshots exist.
expected image appeared.
evidence card appeared beside the matching image.
approval manifest hash still matches.
```

One is a mood. The other is reviewable.

## Decision Matrix

| Use case | Best surface | Why |
| --- | --- | --- |
| Durable spec | Markdown | Diffable, searchable, easy for agents to ingest |
| Evidence packet | JSON or files | Machine-checkable and repeatable |
| PR or incident explainer | HTML | Diagrams, annotations, timelines, and links reduce review load |
| Design variant comparison | HTML | Multiple options can be seen side by side |
| Prompt or config tuning | HTML with export | Controls help exploration, but output must return to canon |

This is where HTML wins: it makes the review faster without pretending to be the system of record.

Forward this rule: **HTML is for noticing; Markdown, JSON, and evidence files are for remembering.**

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

For Vibecode, the template makes those inputs explicit:

```txt
Artifact job:
Canonical source files:
Repo files inspected:
External sources checked:
Private sources excluded or sanitized:
Intended reviewer:
Decision needed:
Export target:
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

If the artifact cannot answer those questions, it is presentation, not review.

## The Export Rule

Interactive HTML artifacts need one hard requirement: **export.**

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

The `DESIGN.md` artifact used a plain `textarea` export:

```txt
Decision: Adopt DESIGN.md as a visual contract pattern for Vibecode, not as a final public recommendation yet.

Canon:
- sources/raw/2026-05-18_design-md-spec-update-transcript-note.md
- sources/processed/design-md-spec-update-function-extract.md

Rules:
- DESIGN.md carries reasoning plus token values.
- Tokens are named decisions and roles.
- HTML is only a review surface; decisions export back to Markdown or structured data.
```

That is enough. A fancy export system is optional. A return path is not.

## Failure Test

Before accepting an HTML artifact, run this small test:

| Question | Reject if |
| --- | --- |
| Can I delete the HTML file after export? | No durable Markdown/JSON decision remains |
| Can I name the sources read? | The page has no source inventory |
| Can I see what would make me say no? | The page only has positive framing |
| Can I paste the decision into the next agent session? | No copy/export section exists |
| Can I verify claims outside the browser? | The page is the only proof |

This is the practical boundary. HTML can help a reviewer see. It cannot be the only thing the system remembers.

The failure cost is not theoretical. If a tech lead approves the polished page but no Markdown or JSON decision is exported, the next agent inherits a phantom approval: no source list, no rejected caveat, no hash-bound receipt, and no way for a reviewer to tell whether the decision was inspected or merely admired. That is how one nice report becomes three extra review passes and a stale claim on the public site.

## Prompt Pattern

Ask for the review surface and the return path:

Send this pattern to the teammate who says, "The agent already made a polished HTML plan, can we approve it?" The answer is yes only if the HTML names its sources, shows what would make the reviewer say no, and exports the final decision back to the durable contract.

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

For a design or research artifact, add the source inventory directly to the prompt:

```txt
Canonical sources:
- companies/vibecode-town/sources/processed/design-md-spec-update-function-extract.md
- companies/vibecode-town/html-review-artifact-template.md

Output:
- local single-file HTML review artifact
- copy-as-Markdown decision record
- explicit non-claims section
```

## Boundary

HTML can make weak evidence look finished. A polished timeline with no source inventory is still a guess. A dashboard with no export path is still hidden state.

Vibecode accepts HTML artifacts as review tools because they make complex agent output easier to inspect. It does not accept them as the contract.

The interface can be rich, but the proof has to return to evidence, manifests, and verifiable boundaries.
