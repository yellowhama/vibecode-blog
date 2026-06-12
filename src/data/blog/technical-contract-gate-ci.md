---
slug: technical-contract-gate-ci
title: "Valid JSON Is Not Valid Output: Wiring a Technical Contract Gate into CI for AI-Generated Changes"
description: "How to validate LLM output in CI: a six-layer contract gate — constrained decoding, agent-loop hooks, schema and policy checks, branch protection, exit-code deploy gates, and provenance — that decides what becomes project state."
pubDatetime: 2026-06-12T00:00:00Z
tags: [ci, contract-testing, llm-validation, policy-as-code, agentic-engineering, branch-protection]
series: Field Log
draft: false
references:
  - name: GitHub Docs — About protected branches
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - name: Claude Code — Best practices for agentic coding
    url: https://code.claude.com/docs/en/best-practices
  - name: Claude API — Structured outputs
    url: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
  - name: JSON Schema — Specification
    url: https://json-schema.org/specification
  - name: Pact — Introduction
    url: https://docs.pact.io/
  - name: Pact Broker — can-i-deploy
    url: https://docs.pact.io/pact_broker/can_i_deploy
  - name: Open Policy Agent — Documentation
    url: https://www.openpolicyagent.org/docs/latest/
  - name: SLSA — Security levels
    url: https://slsa.dev/spec/v1.0/levels
---

If you are putting an agent into production, you have already asked the question this post answers: *how do I validate LLM output before it touches anything that matters?* The answer is not "review it harder." The answer is to treat AI output the way you would treat a PR from an external contributor you have never met: nothing it produces becomes project state until it passes a technical contract — and the contract is enforced by exit codes, not by judgment.

This is a field note from running that setup. The core finding is simple and slightly uncomfortable: the gate everyone reaches for first — schema-constrained generation — is the cheapest layer and also the leakiest. "Valid JSON" and "valid output" are two different contracts, and the gap between them is exactly what your CI has to close.

## The failure mode: trusting the generation-time guarantee

Claude's structured outputs are genuinely strong at what they do. With `output_config.format` for JSON outputs or `strict: true` on a tool definition, the schema is compiled into a grammar that constrains token generation itself — the model is physically unable to emit a token that violates it. If your mental model of validation stops here, the problem feels solved at the source.

It isn't, and the documentation says so plainly. Constrained decoding does not support recursive schemas, numeric `minimum`/`maximum`, `minLength`/`maxLength`, or external `$ref`. A safety refusal can come back with `stop_reason: "refusal"` and skip the schema entirely. Hitting `max_tokens` can truncate the output mid-structure. Strict tools cap out at **20 per request**, and grammar compilation has its own timeout.

Read that list as a contract lawyer would: the generation-time guarantee covers *shape*, not *meaning*. It cannot promise that `quantity` is non-negative, that `summary` fits your 280-character UI field, or that the output is semantically coherent at all. Anthropic's own agentic-coding guidance names this failure pattern the trust-then-verify gap — the model produces a plausible-looking implementation that doesn't handle edge cases — and prescribes a blunt fix: always provide verification. *"If you can't verify it, don't ship it."*

Everything the grammar cannot express is therefore a liability that some downstream gate must absorb. That is the design principle for the rest of the pipeline.

## Six gates, ordered by distance from the model

The architecture that has held up for us is a series of gates at increasing distance from generation. Inner gates exist for fast feedback; outer gates are the actual contract.

| # | Gate | Runs at | What it guarantees |
|---|------|---------|--------------------|
| 1 | Constrained decoding | Generation | Shape only |
| 2 | Agent-loop verification | In-session | Fast feedback — overridable |
| 3 | CI checks | Pull request | Schema + tests + policy, by exit code |
| 4 | Merge mechanics | Repository | Required status checks, merge queue |
| 5 | Deploy gate | Release | `can-i-deploy`, exit 0/1 |
| 6 | Provenance | Audit | Who/what/how attestation |

### Gate 2 — verification inside the agent loop

Claude Code's best-practices guide describes an escalation ladder: verification instructions in the prompt, then goal conditions, then a Stop hook — "a deterministic gate: runs your check as a script and blocks the turn from ending until it passes." This is the right place to catch most defects, because the agent can self-correct while it still has context.

But note the fine print: after **8 consecutive blocks**, the hook is overridden and the turn ends anyway. That override is by design — it prevents infinite loops — and it tells you exactly what this gate is: a quality amplifier, not a security boundary. An agent-internal gate that can be exhausted is not your last line of defense.

### Gate 3 — the CI contract

This is where "the output looked fine" gets replaced by machine-checkable assertions. Three checks, each a separate job so failures are legible:

```yaml
# .github/workflows/contract-gate.yml
jobs:
  schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # JSON Schema 2020-12: enforce what constrained decoding cannot —
      # numeric ranges, string lengths, recursive structures
      # (the CLI lives in the ajv-cli package; the ajv package ships no executable)
      - run: |
          npx --yes ajv-cli validate -s contracts/event.schema.json \
            -d "generated/**/*.json" --spec=draft2020 --strict=true

  policy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # OPA: organizational rules a schema can't express —
      # "this diff must not touch migration folders or IMMUTABLE contracts"
      - run: opa exec --decision ci/deny --bundle policy/ diff-manifest.json

  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test -- --grep "consumer contract"
```

The division of labor matters. JSON Schema (the current 2020-12 dialect) handles everything structured outputs left on the table: ranges, lengths, recursion. OPA handles policy — it is a general-purpose policy engine that unifies enforcement across the stack, and Rego rules like "no AI-authored diff may modify `migrations/` or the schemas marked IMMUTABLE" belong here, with structured violation messages instead of a bare deny.

Pact-style consumer contracts handle integration shape. Because the contract is generated from the consumer's own tests, the AI-produced provider change is verified against what real consumers actually need — not against what the agent assumed they need.

### Gate 4 — making the gate physics, not policy

A CI check that a human can merge around is a suggestion. GitHub's branch protection turns it into a mechanism: required status checks must report `successful`, `skipped`, or `neutral` before anyone — agent or human — can change the protected branch.

Turn on strict mode ("require branches to be up to date before merging") so a check that passed against a stale base can't sneak in, and use a merge queue so the branch is never broken by two individually-green but mutually-incompatible changes. This layer is what makes the whole scheme honest: the contract holds even when the reviewer is tired, the deadline is close, or the diff is **4,000 lines** of plausible-looking generated code.

### Gate 5 — the deploy decision as an exit code

Pact's `can-i-deploy` is the cleanest expression of the pattern: query the verification matrix, and return **exit code 0** only when all required verification results are published and successful — otherwise exit 1 and the pipeline stops. No meeting, no judgment call, no "it's probably fine." The deploy question is answered by a binary that cannot be argued with.

### Gate 6 — provenance

Once agents author a meaningful share of your changes, "what is this artifact and where did it come from" becomes an audit requirement. SLSA provenance is an attestation recording what entity built the artifact, what process it used, and what the inputs were.

The build levels are a useful maturity ladder: **L1** provenance exists but is trivial to forge; **L2** adds a hosted build platform with signing; **L3** hardens the build against tampering. For AI-generated changes, this is the layer that lets you answer, six months later, "which agent run produced this file, from which prompt, through which pipeline."

## The gate doesn't care who wrote the code

Here is the operational detail that made this click for us. Our multi-tenant publishing daemon runs the same pattern on content: every piece enters a write-ahead queue, and nothing transitions to published state until a validation gate — schema check plus a deterministic checklist — exits 0. The gate's code has no branch for "was this written by an agent?" It is structurally incapable of caring. Authorship is metadata; contract compliance is the only state-transition condition.

That indifference is the whole point. The moment your pipeline has a softer path for AI output ("a human glanced at it") or a harsher one ("AI changes need two approvals"), you are encoding trust assumptions instead of verifying properties. Encode the properties. Then the provenance layer records who did what, and the contract layer decides what counts — two separate concerns, two separate gates.

## Where to start Monday

If you have nothing today, build outside-in, not inside-out:

1. Write the JSON Schema (2020-12) for whatever your agent emits, including the ranges and lengths constrained decoding can't enforce. Validate it in a CI job.
2. Make that job a required status check on a protected branch, strict mode on. This single step converts your gate from advice to physics.
3. Add an OPA policy for the paths and contracts agents must never touch.
4. Only then invest in the inner layers — Stop hooks for fast feedback, structured outputs for cheap shape guarantees — knowing they accelerate the loop but don't hold the line.

The discipline fits in one sentence: AI output is a proposal, and a proposal becomes project state only by surviving a contract whose verdict is an exit code. Everything else — the model's confidence, the diff's plausibility, your reviewer's intuition — is input to the gate, never a substitute for it.