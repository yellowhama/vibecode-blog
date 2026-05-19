---
title: "What Vibe Coding Actually Is"
pubDatetime: 2026-05-10T10:00:00Z
description: "Vibe coding is useful for exploration, but production work starts when intent becomes a technical contract the agent can verify against."
draft: false
featured: true
series: "AI Explainer"
workflow: "legacy"
tags: ["engineering", "vibe-coding", "agentic-engineering", "technical-contracts"]
ogImage: "/images/posts/what-vibe-coding-actually-is.png"
references:
  - name: "Not all AI-assisted programming is vibe coding"
    url: "https://simonwillison.net/2025/Mar/19/vibe-coding/"
    guru: "Simon Willison"
---

# What Vibe Coding Actually Is

![Vibe coding hype to contract to evidence diagram](/images/posts/what-vibe-coding-actually-is.png)

The failure did not look dramatic. A route returned 500, the agent tried three different fixes, and each answer sounded plausible.

The real problem was simpler: the agent did not know the contract of the framework version it was editing. I kept asking it to fix a symptom. It kept guessing inside the wrong mental model.

That is the line between vibe coding and engineering with agents. Vibe coding is intent-first exploration. You describe the shape of a thing and let the model push pixels, routes, and files around until a prototype appears. It is fast, useful, and sometimes exactly the right move.

It is not a production method by itself.

## The Useful Part

Simon Willison makes the important distinction: not all AI-assisted programming is vibe coding. The useful version of vibe coding is exploratory. You are trying to find the shape of an idea before you know the hard constraints.

That mode is good for:

```txt
rough prototypes
throwaway UI directions
small scripts
first-pass copy
scaffolding a workflow you plan to inspect
```

The mistake is carrying that same posture into a system with versions, auth, migrations, routes, data ownership, and deployment behavior. Once a system has contracts, the agent needs those contracts in front of it.

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

If the framework expects `params` to be resolved asynchronously, this code can look reasonable while still violating the route contract. A prompt like "fix the 500 error" gives the model too much room to guess. It may change error handling, response shape, imports, or logging while missing the one thing that matters.

The fix is not a better vibe. The fix is a better contract.

```txt
Route contract:
- Treat params as async route input.
- Resolve params before reading id.
- Do not change response shape.
- Add a smoke test that fails if id extraction breaks.
```

Now the agent has a boundary. It can still implement quickly, but the output has something to be checked against.

## The Production Shift

The production workflow is not:

```txt
prompt -> code -> hope
```

It is:

```txt
intent -> source check -> contract -> implementation -> verification
```

That middle part is the craft. The contract can be a migration note, a route rule, a schema, a design token file, a deployment checklist, or a failing test. The format matters less than the function: it turns vague intent into a reviewable boundary.

This is why "AI slop" is often a process problem. The model may be wrong, but the operator also failed to define what correctness meant.

## Reader Decision

Use vibe coding when the cost of being wrong is low and discovery is the goal.

Switch to contract-driven agent work when any of these become true:

```txt
the code touches production data
the fix depends on a specific framework version
the output must survive deployment
another agent will continue the work
security, billing, or user trust is involved
```

## Boundary

A technical contract does not make an agent correct. It only makes the agent's output easier to inspect, test, and reject.

That is the point. Vibe coding gets you motion. Contracts decide whether the motion belongs in the system.
