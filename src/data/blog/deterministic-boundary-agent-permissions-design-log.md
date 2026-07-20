---
slug: deterministic-boundary-agent-permissions-design-log
title: "Before You Hand an Agent the Keys: A Deterministic Boundary Design Log"
description: "A practical log of designing permission boundaries for autonomous agents — allow/ask/deny rules, PreToolUse hooks, and policy-as-code — before letting them touch production."
pubDatetime: 2026-07-20T00:00:00Z
tags: [agent-permissions, deterministic-boundary, claude-code, policy-as-code, tool-gating]
series: Field Log
draft: false
references:
  - name: Claude Code Settings (permissions, allow/ask/deny)
    url: https://docs.claude.com/en/docs/claude-code/settings
  - name: Claude Code Hooks Reference
    url: https://docs.claude.com/en/docs/claude-code/hooks
  - name: Model Context Protocol Specification
    url: https://modelcontextprotocol.io/specification
  - name: Open Policy Agent Documentation
    url: https://www.openpolicyagent.org/docs/latest/
---

## The question that actually matters

"How much autonomy should the agent have?" is the wrong question. The right one is: **what happens the one time it's wrong?**

An agent that's correct 999 times out of 1000 and, on the 1000th, force-pushes over a shared branch or runs `rm -rf` on the wrong directory hasn't earned autonomy — it has earned a blast radius. Before granting any agent write access to something that matters, the job isn't to make the model more careful. It's to build a boundary the model cannot talk its way past.

That boundary has to be deterministic. A system prompt that says "don't do X" is a suggestion the model reads probabilistically, same as everything else in context. A deterministic boundary is code that runs outside the model's token stream and returns allow or deny before the tool call ever executes.

## Where the boundary actually lives

In Claude Code, the boundary has three layers, and conflating them is the most common design mistake:

1. **Permission modes** — `default`, `plan`, `acceptEdits`, `bypassPermissions`. This is a coarse dial, not a policy. `bypassPermissions` should never be the answer to "the agent keeps getting stopped for things I trust it to do" — that's a signal to write a rule, not to remove the gate.
2. **allow/ask/deny rules in `settings.json`** — pattern-matched per tool, evaluated before the tool runs. This is the actual policy layer.
3. **Hooks** — `PreToolUse` shell commands that inspect the proposed tool call and can block it with a non-zero exit code, independent of what the model "decided."

Only layers 2 and 3 are deterministic. Layer 1 is a mode switch that a user — or a misconfigured agent — can flip.

| Layer | Deterministic? | Role |
|---|---|---|
| Permission modes | No | Coarse dial for how much friction the whole session carries |
| allow/ask/deny rules | Yes | Per-tool policy, evaluated before execution |
| `PreToolUse` hooks | Yes | Parses the actual command; blocks on non-zero exit code |

## What a real rule set looks like

Here is the shape of the settings we actually run for an agent allowed to touch this repo's deploy scripts, but not to push to `master` or read secrets:

```json
{
 "permissions": {
 "allow": [
 "Read(*)",
 "Bash(git status)",
 "Bash(git diff *)",
 "Bash(pnpm test *)"
 ],
 "ask": [
 "Bash(git commit *)",
 "Edit(deploy/**)"
 ],
 "deny": [
 "Bash(git push --force *)",
 "Bash(git push origin master)",
 "Read(.env*)",
 "Read(config/secrets/**)"
 ]
 }
}
```

The `deny` list is the actual contract. `allow` and `ask` are convenience — they shape friction, not safety. If a rule isn't in `deny`, assume a sufficiently motivated, or sufficiently confused, agent will eventually trigger it.

## The gap `settings.json` can't close

Pattern matching on tool invocations breaks against syntactic variation. `git push --force`, `git push -f`, and `git push --force-with-lease` are three different strings expressing the same intent, and a glob has to enumerate all three to catch them.

This is where `PreToolUse` hooks earn their keep: a hook is a real program that parses the actual command, not a pattern matching its surface form.

```bash
#!/usr/bin/env bash
# hooks/pre-tool-use-git-guard.sh
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // ""')

if echo "$cmd" | grep -qE '(--force|-f\b).*push|push.*(--force|-f\b)'; then
 echo "blocked: force-push variants are denied by policy" >&2
 exit 2
fi
exit 0
```

Exit code 2 on a `PreToolUse` hook blocks the call and returns the hook's stderr to the model as the reason. The agent sees *why* it was stopped — which is what lets it try a compliant alternative instead of retrying the same blocked call.

## Why this generalizes past Claude Code

This isn't specific to Claude Code. The Model Context Protocol's tool-permission model rests on the same premise: a client gates tool invocation independent of what the server, or the model calling it, requests. The protocol assumes the boundary sits at the client, not inside the reasoning loop.

Infrastructure settled a version of this question years ago. Open Policy Agent exists because policy embedded in application code doesn't scale or audit well. Policy belongs as a separate, versioned, testable artifact that the runtime consults — not logic interleaved with business code.

An agent's tool-call boundary is the same problem with a nondeterministic caller instead of a deterministic one. That makes the external policy layer more necessary, not less.

## What this costs

A deterministic boundary isn't free. Three costs recur in practice:

- **Friction from `ask` rules.** A human has to be present to approve each one, which caps how much of the operation can run unattended.
- **Maintenance from `deny` rules.** New tools and new command shapes mean the deny list needs revisiting — or it silently stops covering what it was written for.
- **Latency and a new failure mode from hooks.** A hook that hangs stalls the entire tool call.

The trade is explicit: give up some autonomy and some speed for a boundary that holds when the model is wrong — which, run against production long enough, it eventually will be.

## The one-line lesson

Autonomy is not something you grant by trusting the model more. It's something you grant by shrinking the set of ways it can hurt you, in code that runs whether or not the model agrees with it.