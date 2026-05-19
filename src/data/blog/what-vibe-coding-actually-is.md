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
  - name: "Andrej Karpathy: Software Is Changing Again"
    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ"
    guru: "Andrej Karpathy"
---

# What Vibe Coding Actually Is

![Vibe coding hype to contract to evidence diagram](/images/posts/what-vibe-coding-actually-is.png)

The failure did not look dramatic.

A route returned 500. The agent tried three fixes. Each answer sounded plausible. None of them touched the actual problem: the framework version had changed the route contract, and the agent was still editing from the old mental model.

That is the line this article cares about. Vibe coding is useful when the job is discovery. It is dangerous when the job is production and the agent does not know which contracts must not move.

The decision is simple: use vibe coding to find the shape of a system; switch to contract-driven agent work before the system has users, money, data, or deployment behavior attached to it.

## The Useful Part

Simon Willison's useful correction is that not all AI-assisted programming is vibe coding. That distinction matters because the word gets used for two different workflows.

Karpathy's Software 3.0 framing points in the same direction from the other side: natural language can become part of the programming surface, but engineering does not disappear. It moves into context, constraints, and verification.

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

The practical taxonomy is this:

| Mode | Good use | Stop when |
| --- | --- | --- |
| Prompt sketching | Find a shape | Output needs to survive |
| Vibe coding | Explore by reacting to generated code | The system has contracts |
| Agentic engineering | Change a real system | No verifier or receipt exists |

The trap is treating those as maturity levels. They are modes. A senior engineer can vibe-code a disposable prototype. A beginner can damage production with a very serious-sounding prompt.

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

## A Field Receipt From This Site

The same failure shape showed up in this site, just on the publishing surface instead of a route handler.

Before the hardening loop, a plausible agent run could create a post, attach an image, and call the work done while missing the actual public contract:

```txt
English blog received Korean source text.
Several posts reused generic-looking images.
Product names appeared in posts without release evidence.
Markdown changed without a fresh human publication approval hash.
```

The repair was not a longer prompt. It was a contract stack in code:

The operational boundary is `scripts/verify-public-page-review.mjs`, `scripts/verify-post-image-contracts.mjs`, `scripts/verify-rendered-pages.mjs`, `scripts/verify-publication-approvals.mjs`, and `npm run verify:site-quality`.

```txt
scripts/verify-public-page-review.mjs
scripts/verify-post-image-contracts.mjs
scripts/verify-rendered-pages.mjs
scripts/verify-publication-approvals.mjs
npm run verify:site-quality
```

Those files turned the public surface into something the agent could fail.

The relevant commit chain shows the same pattern:

```txt
bc23231 Harden public page review gate
64eece2 Add post image contract gate
21c2144 Require packet-backed operator posts
5c94781 Add rendered page audit and deepen post rewrites
bf86204 Require human publication approvals
```

The later writing-quality loop continued the same rule:

```txt
6730995 Improve DESIGN.md article evidence
5f939db Improve Software 3.0 verification mechanism
f7076c0 Correct Software 3.0 approval loop ref
```

The current receipt is concrete:

```txt
packet_backed_posts=9
packet_files=54
post_image_contracts_checked=10
rendered_viewport_checks=24
publication_approval_records=10
```

That is the production shift. The agent is still allowed to draft, rewrite, and generate images. But the output cannot remain public unless the source packet, image contract, rendered screenshot, and exact Markdown hash agree.

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

Use this decision matrix:

| If the work is... | Use this mode | Required artifact |
| --- | --- | --- |
| Disposable, local, reversible | Vibe coding | A thing to react to |
| Unclear prototype | Vibe coding, then stop | Notes on what changed |
| Product change | Contract-driven agent work | Source, boundary, check |
| Public post | Contract-driven agent work | Packet, image contract, approval hash |
| Security, billing, data, deploy | Contract-driven agent work | Failing test or verifier |

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

This does not prove that vibe coding is bad. It proves that vibe coding has a boundary. It is useful while the work is cheap to discard and dangerous when the work already has contracts the agent can violate.

The caveat is that teams often cross that boundary gradually. A prototype gets users. A demo becomes a workflow. A local script starts touching real data. That is the moment to stop asking for better vibes and start writing the contract.

That is the point. Vibe coding gets you motion. Contracts decide whether the motion belongs in the system.
