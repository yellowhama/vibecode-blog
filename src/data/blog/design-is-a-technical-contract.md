---
title: "DESIGN.md Turns Visual Taste Into an Agent Contract"
pubDatetime: 2026-05-13T18:00:00Z
description: "DESIGN.md works because it keeps design reasoning and token values together, then gives agents a file they can read, edit, and lint."
draft: false
featured: true
series: "Field Log"
workflow: "legacy"
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

That is why DESIGN.md matters. It turns design taste into a technical contract the agent can read.

![Design contract token and component diagram](/images/posts/design-is-a-technical-contract.png)

## The Real Problem

Design systems usually split reasoning from values.

```txt
style guide: why the design feels this way
config file: hex values, font sizes, spacing, component tokens
```

Those two files drift. A human can sometimes repair the gap by memory. An agent cannot. It needs the reason and the value close enough that the next decision can use both.

DESIGN.md solves that by keeping prose and tokens in one persistent file.

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

That turns design from a preference conversation into an inspectable workflow. If an agent picks a low-contrast foreground/background pair, the linter can catch the failure before the choice becomes production UI.

## Reader Decision

Use DESIGN.md when a design decision needs to survive more than one prompt.

Good candidates:

```txt
brand color roles
type hierarchy
spacing rhythm
component variants
accessibility requirements
design tone and forbidden patterns
```

Bad candidates:

```txt
one-off screenshot guesses
temporary mood boards
visual polish that has not been decided yet
```

## Boundary

DESIGN.md does not replace design review, browser screenshots, or implementation QA. It gives agents a shared design contract so their first pass starts from the same rules as the humans.

The contract is not the final UI. It is the memory that keeps the next UI from starting over.
