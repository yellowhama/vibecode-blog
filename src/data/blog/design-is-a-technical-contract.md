---
title: "DESIGN.md Turns Visual Taste Into an Agent Contract"
pubDatetime: 2026-05-13T18:00:00Z
description: "DESIGN.md works because it keeps design reasoning and token values together, then gives agents a file they can read, edit, and lint."
draft: false
featured: true
series: "Field Log"
workflow: "packet"
tags: ["engineering", "design-md", "agentic-design", "technical-contracts"]
ogImage: "/images/posts/design-is-a-technical-contract.png"
references:
  - name: "Google Labs Stitch DESIGN.md announcement"
    url: "https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/"
    guru: "Google Labs"
  - name: "DESIGN.md specification"
    url: "https://github.com/google-labs-code/design.md/blob/main/docs/spec.md"
    guru: "Google Labs Code"
  - name: "DESIGN.md repository"
    url: "https://github.com/google-labs-code/design.md"
    guru: "Google Labs Code"
---

# DESIGN.md Turns Visual Taste Into an Agent Contract

The problem with the normal design handoff is that it fails agents for the same reason vague prompts fail them: too much context lives in someone's head.

A screenshot says what a screen looked like. It does not reliably say why the primary color exists, which type scale owns body copy, what a button hover variant is allowed to change, or which contrast rule should block a bad component.

That is why DESIGN.md matters. It turns design taste into a technical contract the agent can read, edit, and lint.

The point is not to make every agent a designer. The point is to stop every new design pass from starting with a blank visual memory.

For Vibecode, the current source packet is not a mood-board note. It is a dated operating snapshot:

```txt
source packet: companies/vibecode-town/sources/processed/design-md-spec-update-function-extract.md
agent contract: global/specs/design-md-agent-contract.md
HTML review: companies/vibecode-town/html-artifacts/design-md-spec-operating-review-2026-05-18.html
verified upstream date: 2026-05-19
package snapshot: @google/design.md
current lifecycle: alpha
```

That inventory is what keeps the post honest. The article can recommend the pattern, but it cannot pretend the upstream spec is finished.

![Design contract token and component diagram](/images/posts/design-is-a-technical-contract.png)

## The Real Problem

Design systems usually split reasoning from values.

```txt
style guide: why the design feels this way
config file: hex values, font sizes, spacing, component tokens
```

Those two files drift. A human can sometimes repair the gap by memory. An agent cannot. It needs the reason and the value close enough that the next decision can use both.

DESIGN.md solves that by keeping prose and tokens in one persistent file.

That changes the prompt from this:

```txt
Make it look like the reference.
```

to this:

```txt
Use the primary ink role for headlines.
Use the accent role for action.
Keep body copy on the defined type role.
Do not invent a new component variant unless the token file gets updated.
```

## Tokens Are Decisions

The important idea is not "put hex codes in Markdown." The important idea is that tokens are named roles.

```txt
primary: the main ink for text and headlines
neutral: the canvas or emotionally quiet surface
accent: the action color
body.main: the default body-copy role
button.primary: the component role that consumes token roles
```

The current value can change. The role survives.

That matters for agents because the instruction is no longer "make it greenish." The instruction is "use the primary ink role" or "do not create a new accent unless the system needs a new decision."

## Components Need References, Not Guesswork

The DESIGN.md spec direction is especially useful for components. A button token can point to a color role instead of hard-coding another hex value.

```txt
button.primary.background -> color.accent
button.primary.text -> color.neutral
button.primary.hover.background -> color.accent.hover
```

Now a component is not a pile of style values. It is a small dependency graph. If the role changes, the component follows the role.

That is exactly the kind of structure agents need. They are good at applying explicit relationships. They are much worse at inferring unstated taste from a screenshot.

## The Linter Loop

The strongest part of the DESIGN.md update is not the file name. It is the validation loop.

```txt
agent reads DESIGN.md
agent edits a token or component
CLI lints the file
contrast or format issue is caught
agent repairs the decision or documents an override
```

The verified CLI snapshot in the current Vibecode packet is date-stamped for a reason:

```txt
npm install @google/design.md
npx @google/design.md lint DESIGN.md
npx @google/design.md diff DESIGN.md DESIGN-v2.md
npx @google/design.md export --format json-tailwind DESIGN.md
npx @google/design.md spec --rules
```

Do not treat those commands as permanent API law. Treat them as the 2026-05-19 snapshot that makes the current article concrete.

That turns design from a preference conversation into an inspectable workflow. If an agent picks a low-contrast foreground/background pair, the linter can catch the failure before the choice becomes production UI.

This is the operator value: the agent can be creative inside the roles, but it cannot silently replace the roles.

## The Small Contract Shape

A useful `DESIGN.md` should be small enough that a reviewer can see the roles and strict enough that an agent cannot invent around them.

```md
---
tokens:
  color:
    primary:
      value: "#21170f"
      role: "main ink for headlines and durable body emphasis"
    neutral:
      value: "#f8f1e7"
      role: "paper-like canvas"
    accent:
      value: "#b95b36"
      role: "action and editorial emphasis"
  typography:
    body-main:
      family: "serif"
      size: "18px"
      role: "long-form reading"
  component:
    button-primary:
      background: "{color.accent}"
      color: "{color.neutral}"
---

# Visual Reasoning
Vibecode should feel like an engineer's annotated notebook:
dense enough to trust, quiet enough to read, and never generic SaaS gloss.
```

That snippet does two jobs. The token block gives the agent values. The prose tells it why those values exist. Splitting those into separate files is where drift starts.

## A Small Operator Loop

The same pattern is now used for Vibecode post imagery.

On 2026-05-20, this site had 10 public post image contracts and 10 hash-bound publication approvals. That is not a giant design system. It is small enough to inspect by hand, which makes it a useful test case: if the contract cannot keep 10 posts honest, it definitely will not keep a 200-screen product honest.

The public image contract is not "make the post look nice." It lives in `src/data/post-image-contracts.json` as structured data:

```json
{
  "slug": "design-is-a-technical-contract",
  "image": "/images/posts/design-is-a-technical-contract.png",
  "signal": "roles -> components -> lint",
  "motif": "tokens",
  "anchors": ["design md", "tokens", "linter"]
}
```

Two scripts then check the contract instead of taste:

```txt
scripts/verify-post-image-contracts.mjs
scripts/verify-rendered-pages.mjs
```

The checks are boring in the exact way useful contracts are boring:

```txt
body image must match ogImage
image must be 1200x630
image must not be reused by another post
semantic anchors must appear in the post text
expected image should render on the post page
```

The latest full site-quality run after the reference-ceiling surface upgrade reported this receipt:

```txt
npm run verify:site-quality=pass
post_image_contracts_checked=10
rendered_page_viewports_checked=24
publication_approval_records_checked=10
rendered_page_surface_contract_image_routes_first_screen=4/4
rendered_page_surface_evidence_card_routes_first_screen=4/4
reference_writing_average_score=100
reference_ceiling_average_score=100
latest_gate_commit=4df981a
```

That is a design-system lesson in miniature. A visual decision becomes a named role, the role becomes data, and the data becomes lintable. The agent can still generate the image, but it cannot silently use a generic asset that has no relationship to the article.

Without the contract, a generic "abstract design system" hero could pass a human glance. With the contract, it has to match the slug, the `ogImage`, the dimensions, the anchors, the rendered page, and the approval hash. That is the difference between taste as a suggestion and taste as an operating surface.

## Design Review Still Has Two Surfaces

The contract is not the review. It is the memory that review uses.

For the DESIGN.md source packet, Vibecode keeps the split explicit:

| Surface | File | Job |
| --- | --- | --- |
| Canonical extract | `design-md-spec-update-function-extract.md` | Durable source interpretation |
| Agent contract | `design-md-agent-contract.md` | Rules the next agent should obey |
| HTML review | `design-md-spec-operating-review-2026-05-18.html` | Human-readable decision surface |
| Public article | `design-is-a-technical-contract.md` | Reader-facing explanation |

That split is important. A generated HTML review can show token swatches and risk tables. The final decision still has to return to `DESIGN.md`, Markdown, JSON, or a patch checklist.

If a design decision only exists in a screenshot, it is not a contract. If it only exists in a pretty HTML review page, it is still not a contract.

## Accept/Reject Review

Use DESIGN.md when a design decision needs to survive more than one prompt. Do not use it as a fancy place to hide undecided taste.

Accept a decision into DESIGN.md when at least two of these are true:

```txt
The same role will be reused across more than one screen.
The agent needs the rule before generation, not after review.
The decision has a named role, not just a hex value or screenshot vibe.
A linter, token diff, screenshot review, or component check can catch drift.
Changing the value later should update every component that points at the role.
```

Reject it from DESIGN.md when the input is only:

```txt
a one-off screenshot guess
a temporary mood board
a color the founder liked in one review
visual polish that has not been decided yet
a component variant with no agreed behavior
an HTML mockup that cannot round-trip back into tokens or implementation
```

That last rejection matters. If an agent makes a gorgeous HTML review page but the decision cannot return to `DESIGN.md`, Tailwind tokens, component props, or a patch checklist, the artifact is presentation, not memory.

The practical review matrix is this:

| Situation | Decision | Reason |
| --- | --- | --- |
| Reused brand, type, spacing, or component role | Accept | Durable decision. |
| More pages in the same visual system | Accept | Shared memory before generation. |
| Hover or variant changes one property | Accept | Token reference keeps lineage. |
| Screenshot with no agreed rules | Reject for now | Decide before encoding. |
| Final in-browser quality judgment | Reject | Use screenshots, review, and QA. |
| One-off mood exploration | Reject | Do not store temporary sketches. |
| HTML with no token/export path | Reject | Review surface, not source of truth. |

The review question is blunt:

```txt
If another agent reads this file tomorrow, will it know what to preserve, what to change, and what to refuse?
```

If the answer is yes, encode the role. If the answer is no, keep the artifact in review until the decision becomes specific enough to lint.

## Boundary

DESIGN.md does not prove that the resulting interface is good. A weak brand system written in a tidy file is still a weak brand system.

It also does not replace design review, browser screenshots, or implementation QA. The file can tell an agent which roles exist, but it cannot decide whether the final screen feels trustworthy, whether the hierarchy lands in the browser, or whether a component works under real content.

The limit is simple: use DESIGN.md to preserve decisions, not to avoid making them. If the team has not agreed on the role, token, or component behavior, the file should expose that gap instead of letting an agent invent taste silently.

The contract is not the final UI. It is the memory that keeps the next UI from starting over.
