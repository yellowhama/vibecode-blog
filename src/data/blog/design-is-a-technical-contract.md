---
title: "DESIGN.md: Turning Visual Taste Into a Strict Agent Contract"
pubDatetime: 2026-05-13T18:00:00Z
description: "Visual design for AI agents fails when built on screenshots and vibes. Learn how DESIGN.md turns UI taste into an inspectable, lintable technical contract."
draft: false
featured: true
series: "Field Log"
workflow: "packet"
tags:
  - ai-agents
  - ui-design
  - design-systems
  - technical-contracts
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

On 2026-05-21, I reopened the DESIGN.md packet, the public article, and the rendered image audit because the post had a familiar problem: it was correct, but the first screen still read too much like a principle. That matters because design memory is a trust surface; if the next reviewer cannot inspect the role, the agent will fill the gap with taste-shaped guesswork.

That is exactly how design handoffs fail agents. Too much context lives in someone's head, then everyone acts surprised when the agent invents the missing part.

Before you ask an agent to copy a visual style, write the reusable roles into `DESIGN.md` tokens or reject the screenshot as review material. Do not accept "it looks close" as proof.

A screenshot says what a screen looked like. It does not reliably say why the primary color exists, which type scale owns body copy, what a button hover variant is allowed to change, or which contrast rule should block a bad component.

The mistake is not using screenshots. The mistake is letting screenshots become memory.

That is why `DESIGN.md` matters. **It turns design taste into a technical contract the agent can read, edit, lint, and refuse.**

The point is not to make every agent a designer. The point is to stop every new design pass from starting with a blank visual memory.

The wrong standard is "can the agent imitate the screenshot?" The better question is "can the next reviewer name the role, value, lint check, and refusal condition without asking the original designer what they meant?"

The stronger pattern is to compare every design reference against four reusable functions: role, value, validator, and refusal condition.

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

![rendered evidence diagram for DESIGN.md roles, component references, and lint gate](/images/posts/design-is-a-technical-contract.png)

Read the image as a proof object, not decoration. The left side is the durable role/value memory; the middle is the component dependency graph; the right side is the lint/review gate that can reject a bad agent decision before it becomes another screenshot to imitate.

## The Real Problem

Design systems usually split reasoning from values.

```txt
style guide: why the design feels this way
config file: hex values, font sizes, spacing, component tokens
```

Those two files drift. A human can sometimes repair the gap by memory. An agent cannot. It needs the reason and the value close enough that the next decision can use both.

The cost shows up one review later. Someone pastes a finished-looking Stitch screenshot into the next prompt, the agent makes a plausible button, and now the reviewer is not checking a token diff or a contrast lint result. They are hunting through screenshots trying to remember whether this orange was the accent role, a hover state, or one lucky mockup.

That is the trap: the screenshot can look specific while the decision is still missing. A visual reference is not enough proof when the job is to preserve a system across the next five prompts.

`DESIGN.md` solves that by keeping prose and tokens in one persistent file.

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

The `DESIGN.md` spec direction is especially useful for components. A button token can point to a color role instead of hard-coding another hex value.

```txt
button.primary.background -> color.accent
button.primary.text -> color.neutral
button.primary.hover.background -> color.accent.hover
```

Now a component is not a pile of style values. It is a small dependency graph. If the role changes, the component follows the role.

That is exactly the kind of structure agents need. They are good at applying explicit relationships. They are much worse at inferring unstated taste from a screenshot.

## The Linter Loop

The strongest part of the `DESIGN.md` update is not the file name. It is the validation loop.

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

The rule is blunt: **if a design decision cannot be linted, diffed, rendered, or rejected later, it is not ready to become agent memory.**

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

On 2026-05-20, this site had 10 public image rules and 10 current publication records. That is not a giant design system. It is small enough to inspect by hand, which makes it a useful test case: if the contract cannot keep 10 posts honest, it definitely will not keep a 200-screen product honest.

The public image rule is not "make the post look nice." It lives in `src/data/post-image-contracts.json` as structured data:

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

The latest full site-quality run after the writing-pulse surface upgrade reported this receipt:

```txt
npm run verify:site-quality=pass
post_image_contracts_checked=10
rendered_page_viewports_checked=24
publication_approval_records_checked=10
rendered_page_surface_contract_image_routes_first_screen=4/4
rendered_page_surface_evidence_card_routes_first_screen=4/4
reference_writing_average_score=100
reference_ceiling_average_score=100
writing_pulse_average_score=91
writing_pulse_surface_commit=466e312
```

That 2026-05-21 run built 41 pages, indexed 10 pages and 2067 words, checked 24 viewports, kept 10 records current, and forced 4/4 first-screen surface evidence cards to show the matching image plus writing-pulse score. Those counts are small on purpose. They make the claim inspectable instead of impressive.

That is a design-system lesson in miniature. A visual decision becomes a named role, the role becomes data, and the data becomes lintable. The agent can still generate the image, but it cannot silently use a generic asset that has no relationship to the article.

Without the contract, a generic "abstract design system" hero could pass a human glance. With the contract, it has to match the slug, the `ogImage`, the dimensions, the anchors, the rendered page, and the approval record. That is the difference between taste as a suggestion and taste as an operating surface.

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

## Accept/Reject Decision Checklist

Use `DESIGN.md` when a design decision needs to survive more than one prompt. Do not use it as a fancy place to hide undecided taste.

Next time an agent hands you a polished design, run this review before you ask for more variants.

**Accept a decision into DESIGN.md when at least two of these are true:**

```txt
The same role will be reused across more than one screen.
The agent needs the rule before generation, not after review.
The decision has a named role, not just a hex value or screenshot vibe.
A linter, token diff, screenshot review, or component check can catch drift.
Changing the value later should update every component that points at the role.
```

**Reject it from DESIGN.md when the input is only:**

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

## Proof Chain

Here is the design chain as proof, not a mood-board mood:

**Bad output:**
- A Stitch screenshot looks good.
- The agent copies the surface.
- The next prompt asks for "the same style."
- No one can say which color role, type role, component variant, or contrast rule must survive.

**Gate added:**
- Name the reusable role before encoding it.
- Put the token value and the reasoning in DESIGN.md.
- Run `npx @google/design.md lint DESIGN.md`.
- Reject any visual decision that cannot round-trip into tokens, component props, or a patch checklist.

**After:**
- The current accepted review, zero-item revision plan, approval record, and current content digest point at the revised article.
- The article has a source packet, agent contract, HTML review surface, CLI snapshot, and public image-contract receipt.
- The next agent gets a role to preserve instead of a screenshot to imitate.

The practical template is deliberately small:

```txt
Source: screenshot, mockup, DESIGN.md, token diff, or component implementation.
Accept only when: the decision has a named role, a lintable value, and at least one reuse path.
Reject when: the artifact is only a mood, one-off screenshot guess, or HTML review with no token/export path.
Boundary: DESIGN.md preserves decisions; it does not prove final UI quality.
```

Forward this to the builder who says, "just paste the Stitch screenshot into the next prompt." The decision is narrow: can this visual choice become a named role with a lintable value, or is it still review material that should stay outside the durable design memory?

If the answer is yes, encode the role. If the answer is no, keep the artifact in review until the decision becomes specific enough to lint.

## Boundary

`DESIGN.md` does not prove that the resulting interface is good. A weak brand system written in a tidy file is still a weak brand system.

It also does not replace design review, browser screenshots, or implementation QA. The file can tell an agent which roles exist, but it cannot decide whether the final screen feels trustworthy, whether the hierarchy lands in the browser, or whether a component works under real content.

The limit is simple: use `DESIGN.md` to preserve decisions, not to avoid making them. If the team has not agreed on the role, token, or component behavior, the file should expose that gap instead of letting an agent invent taste silently.

The contract is not the final UI. It is the memory that keeps the next UI from starting over.
