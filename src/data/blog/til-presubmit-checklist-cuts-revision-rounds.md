---
slug: til-presubmit-checklist-cuts-revision-rounds
title: "TIL: A pre-submit self-check checklist cut writer revision rounds 4→2"
description: Moving the reviewer's rejection criteria upstream into a fixed, checkable list inside the writer prompt halved revision rounds — without the open-ended self-correction that degrades output.
pubDatetime: 2026-06-18T00:00:00Z
tags: [til, agent-orchestration, self-correction, gate-contract]
series: Field Log
draft: false
references:
  - name: "Self-Refine: Iterative Refinement with Self-Feedback (Madaan et al.)"
    url: https://arxiv.org/abs/2303.17651
  - name: "Large Language Models Cannot Self-Correct Reasoning Yet (Huang et al., ICLR 2024)"
    url: https://arxiv.org/abs/2310.01798
  - name: "Chain-of-Verification Reduces Hallucination (Dhuliawala et al.)"
    url: https://arxiv.org/abs/2309.11495
  - name: "Anthropic — Chain complex prompts (prompt engineering docs)"
    url: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/chain-prompts
---

## The bounce loop

Our writer node kept failing the *same* downstream checks: a missing frontmatter field, a claim with no source. Each failure cost a full round-trip through the reviewer gate.

The log averaged **4 revision rounds per post** — same model, same gate, the same defects bounced back each time. Pure rework.

## What I did not do

I did not add "double-check your work." Open-ended self-correction is a known trap: without an external signal, a model can't reliably judge its own correctness, and the second pass can *degrade* the first (Huang et al., 2023).

The literature points one way. Self-Refine, Chain-of-Verification, and Anthropic's own prompt-chaining docs all converge on the same thing — not vague reflection, but verification *against concrete criteria*.

So I copied the reviewer's exact rejection criteria into a fixed checklist and appended it to the writer prompt. The gate contract, moved upstream into the producer:

```
Before you emit, verify against EACH item. If any fails, fix and re-verify:
- [ ] frontmatter has slug, title, description, pubDatetime, tags
- [ ] every factual claim maps to a reference URL
- [ ] series is exactly one of the 5 allowed values
```

## Result

Over the next ~20 posts, revision rounds dropped **4 → 2**. First-party field metric, not a benchmark.

The win is in the shape, not the willpower. It works only because every item is *objective and checkable* — a binary the writer can settle alone. Add one subjective line ("is it good?") and it regresses to the failure mode above: self-judgment with no external signal.

A pre-submit self-check is not reflection. It's the gate contract, honored once before the queue instead of discovered after it.