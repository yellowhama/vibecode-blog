---
title: "What Vibe Coding Actually Is"
pubDatetime: 2026-05-10T10:00:00Z
description: "Vibe coding is useful for exploration, but production work starts when intent becomes a technical contract the agent can verify against."
draft: false
featured: true
series: "AI Explainer"
workflow: "packet"
tags: ["engineering", "vibe-coding", "agentic-engineering", "technical-contracts"]
ogImage: "/images/posts/what-vibe-coding-actually-is.png"
references:
  - name: "Not all AI-assisted programming is vibe coding"
    url: "https://simonwillison.net/2025/Mar/19/vibe-coding/"
    guru: "Simon Willison"
---

# What Vibe Coding Actually Is

![Vibe coding hype to contract to evidence diagram](/images/posts/what-vibe-coding-actually-is.png)

The failure did not look dramatic.

A route returned 500. The agent tried three fixes. Each answer sounded plausible. None of them touched the actual problem: the framework version had changed the route contract, and the agent was still editing from the old mental model.

That is the line this article cares about. Vibe coding is useful when the job is discovery. It is dangerous when the job is production and the agent does not know which contracts must not move.

The decision is simple: use vibe coding to find the shape of a system; switch to contract-driven agent work before the system has users, money, data, or deployment behavior attached to it.

## The Useful Part

Simon Willison's useful correction is that not all AI-assisted programming is vibe coding. That distinction matters because the word gets used for two different workflows.

The first workflow is exploration:

```txt
I have an idea.
I do not know the shape yet.
Generate something I can react to.
I will inspect, steer, or throw it away.
```

That workflow is often the right one for:

```txt
rough prototypes
throwaway UI directions
small scripts
first-pass copy
scaffolding a workflow you plan to inspect
```

The second workflow is production:

```txt
The system already has contracts.
The output must preserve them.
The agent needs the source, boundary, and verifier before it edits.
```

Most failed "vibe coding" stories are really a mode error. The operator kept behaving as if the work was exploratory after the work had become contractual.

## The Failure Mode

Here is the kind of bug that exposes the difference.

```ts
// Wrong contract for a newer route API.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  return Response.json({ taskId });
}
```

If the framework expects `params` to be resolved asynchronously, this code can look reasonable while still violating the route contract. A prompt like "fix the 500 error" gives the model too much room. It may change error handling, response shape, imports, logging, or file layout while missing the one rule that matters.

The fix is not a better vibe. The fix is a better contract.

```txt
Route contract:
- Treat params as async route input.
- Resolve params before reading id.
- Do not change response shape.
- Add a smoke test that fails if id extraction breaks.
```

Now the agent has a boundary. It can still move quickly, but the output has something to be rejected against.

## The Production Shift

The production workflow is not this:

```txt
prompt -> code -> hope
```

It is this:

```txt
intent
-> source check
-> contract
-> implementation
-> verification
```

That middle part is the craft. The contract can be a migration note, a route rule, a schema, a design token file, a deployment checklist, or a failing test. The format matters less than the function: it turns vague intent into a reviewable boundary.

This is why "AI slop" is often a process problem. The model may be wrong, but the operator also failed to define what correctness meant before asking for the diff.

## Reader Decision

Before the next agent session, decide which mode you are in.

Use vibe coding when all three are true:

```txt
the cost of being wrong is low
the output is easy to throw away
the main goal is to discover shape
```

Switch to contract-driven agent work when any of these become true:

```txt
the code touches production data
the fix depends on a specific framework version
the output must survive deployment
another agent will continue the work
security, billing, or user trust is involved
```

Then write the contract first:

```txt
Source:
Boundary:
Acceptance check:
Forbidden changes:
Evidence to keep:
```

## Boundary

A technical contract does not make an agent correct. It only makes the agent's output easier to inspect, test, and reject.

That is the point. Vibe coding gets you motion. Contracts decide whether the motion belongs in the system.
