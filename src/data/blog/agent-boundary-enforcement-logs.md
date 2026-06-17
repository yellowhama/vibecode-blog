---
slug: agent-boundary-enforcement-logs
title: "The Agent Crossed the Line: Publishing the Guardrail Logs That Blocked It"
description: An agent will eventually reach for rm -rf, a prod push, or ~/.ssh. Here are the real permission and scope guardrails that block it — enforced by the harness, not the model — shown as actual block records.
pubDatetime: 2026-06-17T00:00:00Z
tags: [agent-guardrails, permissions, multi-tenancy, security, deterministic-boundary]
series: Field Log
draft: false
references:
  - name: Claude Code — Permissions
    url: https://code.claude.com/docs/en/permissions
  - name: Claude Code — Hooks
    url: https://code.claude.com/docs/en/hooks
  - name: OpenAI Agents SDK — Guardrails
    url: https://openai.github.io/openai-agents-python/guardrails/
  - name: Simon Willison — The lethal trifecta
    url: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
---

## The line you cannot move with a prompt

A prompt cannot move the boundary. The single most important sentence in the Claude Code permission docs says why, quoted verbatim:

> Permission rules are enforced by Claude Code, **not by the model**. Instructions in your prompt or `CLAUDE.md` shape what Claude tries to do, but they don't change what Claude Code allows.

This inverts how most people reason about agent safety. Your system prompt, your alignment work, your carefully worded "do not touch production" — all of it shapes *intent*. None of it shapes *permission*. The harness is the thing that says no; the model is only the thing that asks.

And the model will ask. Give an agent a broad enough task and you will eventually watch it reach for `rm -rf`, a `git push` to main, or a read of `~/.ssh/id_rsa` — not out of malice, but because that path looked locally reasonable in context. **The team that wrote its boundary into a prompt learns, at exactly that moment, that the boundary was never load-bearing.**

## Evaluation order is the whole game

The permission system evaluates rules in a fixed order — **deny → ask → allow** — and first match wins. The part people get wrong: specificity does not change the order. A broad `Bash(aws *)` deny blocks everything beneath it even if you also wrote a narrower `Bash(aws s3 ls)` allow. The narrow allow never gets a turn.

```
deny  → ask  → allow
 │       │       │
 │       │       └─ last resort, easily overridden
 │       └───────── prompts the human
 └───────────────── wins outright; specificity cannot save you
```

Deny is not only first — it is final across levels. An allow at any level cannot override a deny at any other level, and a deny in managed (enterprise) settings cannot be punched through with `--allowedTools` on the CLI. The precedence runs managed → CLI → project → user, with managed-deny sitting on top of all of it.

For a single developer this is a convenience. For a multi-tenant system it is the load-bearing wall. By analogy with our own publishing daemon: tenant-isolation rules belong in managed-settings deny, where neither an operator nor a writer agent can relax them. If the rule keeping tenant A's queue away from tenant B's data lives anywhere an allow can reach, it is decoration, not isolation.

## What a "block" actually looks like on disk

A block is a record, not a vibe. When a `PreToolUse` hook decides to stop a call, it receives `tool_name`, `tool_input`, and `permission_mode`, and it returns this:

```json
{"hookSpecificOutput": {
  "hookEventName": "PreToolUse",
  "permissionDecision": "deny",
  "permissionDecisionReason": "Destructive command blocked by hook"}}
```

That `permissionDecisionReason` field is why this post can exist. The block is not a silent failure or a model apologizing in prose — it is a structured decision with a stated cause, emitted *before* the tool runs. The valid `permissionDecision` values are `allow`, `deny`, `ask`, and `defer`. A hook can also force the same outcome with exit code **2**, which forwards stderr to the agent as an error and blocks the call, equivalent to the JSON `deny`.

Picture the analogous line in a multi-tenant publishing gate: an agent on tenant A's job reaches to write into tenant B's WAL segment. The path doesn't match its tenant scope, so the gate denies and the reason string names exactly why. That single JSON object is now an audit record. You can grep it, count it, alert on it, and — as I'm doing here — publish it, because it carries its own justification.

## Defense in depth, written as code not as trust

Worth stating precisely, because it separates layered defense from a single point of failure: **hook decisions do not bypass permission rules.** If a hook returns `allow` but a matching deny rule exists, the deny still blocks the call. An exit-code-2 block likewise takes precedence over allow rules. Neither layer can quietly unlock the other — defense in depth expressed as evaluation precedence, not as a hopeful comment.

Scope enforcement is not naive filename matching either. Deny and ask rules match on input *parameters* — `Agent(model:opus)`, `Agent(isolation:worktree)`, `Bash(run_in_background:true)` — and symlinks are checked on both sides: the link path *and* its target. A symlink sitting inside an allowed directory but pointing at `~/.ssh/id_rsa` still trips the deny, because the resolver follows it. For a queue-based system this is what stops link-escape: a path inside the sanctioned work dir that secretly aims at another tenant's WAL is caught at resolution time, not after the write. Even `bypassPermissions` mode keeps a circuit breaker — `rm -rf /` and `rm -rf ~` still prompt.

## Where the gate fires, across frameworks

The Claude Code gate fires at `PreToolUse` — immediately before the tool call, so the default is "blocked before any side effect." The OpenAI Agents SDK reaches the same goal from a different angle: a guardrail raises `tripwire_triggered` and the run halts by throwing `InputGuardrailTripwireTriggered` or `OutputGuardrailTripwireTriggered`.

One nuance matters if you adopt it. Input guardrails run in parallel by default, so tokens and tools may already be consumed by the time the tripwire fires; you can opt into blocking mode to complete the check before the agent starts. Two designs, one contract — stop execution at a deterministic checkpoint, not after the damage.

## Why this is structure, not configuration

It is tempting to treat all of this as tuning: tighten a regex, add a deny, ship. Simon Willison's **lethal trifecta** is why you cannot. His point about prompt injection is structural:

> LLMs are unable to reliably distinguish the importance of instructions based on where they came from.

If the model cannot reliably tell a trusted instruction from untrusted content embedded in the data it is reading, then no amount of prompt hardening *removes* the failure mode — it only lowers the rate. In a security context, "blocks 95% of attacks" is a failure, not a feature. The durable fix is to remove the *capability*, not coach the model: take away the agent's ability to exfiltrate, or its exposure to untrusted input, so the dangerous combination cannot assemble at all. A deterministic boundary does exactly that — the harness refusing, every time, regardless of how persuasive the context was.

## The contract, stated plainly

If you are deciding how to constrain agent autonomy before putting it in front of real data, gate on this checklist:

1. **The harness enforces permission, not the model.** If your only boundary is a prompt, you have no boundary. Verify that enforcement lives below the model.
2. **Deny-first, managed-locked.** Put tenant and production boundaries in the highest-precedence deny, where no allow at any level can reach them.
3. **Every block is an observable record.** A denied action must emit a structured reason (`permissionDecisionReason`) you can audit and publish — not a model apologizing in prose.
4. **Remove the capability, don't detect the intent.** Where the lethal trifecta can assemble, break one leg structurally instead of trusting a classifier to catch it.

The agent in our logs crossed the line. That is fine — that is what agents do. What made it a non-event instead of an incident is that the line was enforced one layer below the model, and the crossing left a record with its own reason attached. Build the gate first. Then let the agent be as ambitious as it likes.