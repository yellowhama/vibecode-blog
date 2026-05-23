---
title: "What Vibe Coding Actually Is: Exploration vs Production"
pubDatetime: 2026-05-10T10:00:00Z
description: "Vibe coding is useful for exploration, but production work starts when intent becomes a technical contract the agent can verify against."
draft: false
featured: true
series: "AI Explainer"
workflow: "packet"
ogImage: "/images/blog/vibe-coding.png"
tags:
  - software-engineering
  - vibe-coding
  - ai-agents
  - agentic-engineering
  - technical-contracts

references:
  - name: "Not all AI-assisted programming is vibe coding"
    url: "https://simonwillison.net/2025/Mar/19/vibe-coding/"
    guru: "Simon Willison"
  - name: "Andrej Karpathy: Software Is Changing Again"
    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ"
    guru: "Andrej Karpathy"
  - name: "Building effective agents"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
    guru: "Anthropic"
---

# What Vibe Coding Actually Is

![Rendered artifact diagram showing vibe coding discovery, contract boundary, and evidence receipt before production](/images/posts/what-vibe-coding-actually-is.png)

Read the rendered artifact as the mode switch, not as a vibe-coding poster. The left side is useful discovery: shape, reaction, steering. The right side is production: `Source`, `Boundary`, `Acceptance check`, `Forbidden changes`, and `Evidence to keep`. The failure is the middle gap, where a prototype quietly becomes public work before the receipt gate exists.

Vibe coding fails in production at the moment confidence arrives before evidence.

The practical move is not to stop exploring. It is to switch modes before a prototype touches users, money, data, deployment behavior, or public trust.

On 2026-05-20, I ran `npm run audit:reference-ceiling -- --json` inside the GitHub-backed `<repo-root>` repo and this article came back last.

```txt
reference_ceiling_weakest=what-vibe-coding-actually-is score=87 grade=strong-but-thin
openingScene: opening needs a named system, date, count, command, or artifact
originalArtifacts: needs more inline file paths, commands, config keys, or artifact names
voice: voice lacks compression or contrast
```

That was a useful humiliation. The code was not broken. The idea was not wrong. The post was too smooth.

Too smooth is exactly how bad vibe coding sneaks into production: no one can find the point where the model should have been rejected.

The first version of this article opened with a generic route failure: a `500`, an agent, three plausible fixes, and a framework contract it did not understand. That was true, but it was still soft. It had the shape of a lesson without the receipt that makes a reader trust the lesson.

So here is the sharper claim: vibe coding is not the enemy. Unreceipted confidence is the enemy. Vibe coding is a good way to discover a shape; it becomes dangerous when everyone forgets that discovery mode has no right to ship.

A route returned 500. The agent tried three fixes. Each answer sounded plausible. None of them touched the actual problem: the framework version had changed the route contract, and the agent was still editing from the old mental model.

That is the line this article cares about. Vibe coding is useful when the job is discovery. It is dangerous when the job is production and the agent does not know which contracts must not move.

The decision is simple: use vibe coding to find the shape of a system; switch to contract-driven agent work before the system has users, money, data, or deployment behavior attached to it.

## The Useful Part

Simon Willison's useful correction is that not all AI-assisted programming is vibe coding. That distinction matters because the word gets used for two different workflows.

Karpathy's Software 3.0 framing points in the same direction from the other side: natural language can become part of the programming surface, but engineering does not disappear. It moves into context, constraints, and verification.

Anthropic's agent/workflow distinction gives the third edge of the comparison. A workflow follows a defined path. An agent chooses more of the path itself. What works is matching the mode to the risk: vibe coding for shape discovery, workflow-like contracts for known production paths, and higher-autonomy agents only when the stop conditions are explicit. The mistake is pretending those are the same because all three involve a model.

The stronger pattern is not "use AI less." The stronger pattern is: name the mode before you judge the output.

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

Not all AI coding is vibe coding. Not all vibe coding belongs in production.

The practical taxonomy is this:

| Mode | Good use | Stop when |
| --- | --- | --- |
| Prompt sketching | Find a shape | Output needs to survive |
| Vibe coding | Explore by reacting to generated code | The system has contracts |
| Agentic engineering | Change a real system | No verifier or receipt exists |

The trap is treating those as maturity levels. They are modes. A senior engineer can vibe-code a disposable prototype. A beginner can damage production with a very serious-sounding prompt.

## The Failure Mode

Here is the kind of bug that exposes the difference.

This is an illustrative Next.js-style route-handler contract example. The exact framework version matters less than the failure shape: the agent edits from an old route-input model while the project expects a newer one.

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

If the route contract expects `params` to be resolved asynchronously, this code can look reasonable while still violating the rule. A prompt like "fix the 500 error" gives the model too much room. It may change error handling, response shape, imports, logging, or file layout while missing the one thing that matters.

The fix is not a better vibe. The fix is a better contract.

```txt
Route contract:
- Treat params as async route input.
- Resolve params before reading id.
- Do not change response shape.
- Add a smoke test that fails if id extraction breaks.
```

Now the agent has a boundary. It can still move quickly, but the output has something to be rejected against.

## The Artifact That Changed The Standard

The important part of the route example is not the route. It is the moment when the operator stops asking for "a fix" and starts giving the model a rejection surface.

Bad prompt:

```txt
Fix the 500 error.
```

Better contract:

```txt
Source:
- Check the framework route-handler contract before editing.

Boundary:
- Only change id extraction.
- Do not change the response JSON shape.
- Do not add new dependencies.

Acceptance check:
- Request /tasks/123.
- Response must be 200.
- Response body must include {"taskId":"123"}.

Forbidden changes:
- No broad error-wrapper rewrite.
- No route folder move.
- No silent fallback id.

Evidence to keep:
- Failing output before.
- Passing smoke result after.
- File path and commit hash.
```

That is the entire difference. The model did not become magically wiser. The work became rejectable.

This is also why a strong agent workflow often feels less glamorous than the demo. The demo asks the agent to build something visible. Production asks the agent to preserve something invisible: a route contract, a schema promise, an approval record, a deployment assumption, a security boundary.

The useful operator move is not "trust the model less." That is too broad. The useful move is: name the hidden contract before the model gets permission to edit.

## A Field Receipt From This Site

The same failure shape showed up in this site, just on the publishing surface instead of a route handler.

Before the hardening loop, a plausible agent run could create a post, attach an image, and call the work done while missing the actual public contract:

```txt
English blog received Korean source text.
Several posts reused generic-looking images.
Product names appeared in posts without release evidence.
Markdown changed without a fresh human publication review record.
```

That was not a cosmetic failure. It was a trust failure.

The compact failure chain was:

```txt
Bad public output:
- Korean source text could leak into an English blog.
- Generic or repeated images could appear beside unrelated posts.
- Unsupported product mentions could make the site look like a brochure.

Gate added:
- Source workflow, image rule, rendered page, public review, and approval record checks.

After:
- A post can be drafted by an agent, but it cannot remain public unless the receipt stack agrees.
```

The repair was not a longer prompt. It was a contract stack in code:

The operational boundary is `scripts/verify-public-page-review.mjs`, `scripts/verify-post-image-contracts.mjs`, `scripts/verify-rendered-pages.mjs`, `scripts/verify-publication-approvals.mjs`, `scripts/verify-reference-ceiling-surface.mjs`, and `npm run verify:site-quality`.

```txt
scripts/verify-public-page-review.mjs
scripts/verify-post-image-contracts.mjs
scripts/verify-rendered-pages.mjs
scripts/verify-publication-approvals.mjs
scripts/verify-reference-ceiling-surface.mjs
npm run verify:site-quality
```

Those files turned the public surface into something the agent could fail.

The relevant commit chain shows the same pattern:

```txt
bc23231 Harden public page review gate
64eece2 Add image rule gate
21c2144 Require packet-backed operator posts
5c94781 Add rendered page audit and deepen post rewrites
bf86204 Require human publication reviews
```

The later writing-quality loop continued the same rule:

```txt
6730995 Improve DESIGN.md article evidence
5f939db Improve Software 3.0 verification mechanism
f7076c0 Correct Software 3.0 approval loop ref
283a6fe Strengthen evidence-backed post surfacing
9bd66bc Improve Vercel writing pulse
0c074f9 Strengthen public article surfacing
```

The baseline receipt for this body repair is concrete, and it is dated because an undated receipt is just a better-looking vibe. On 2026-05-21, after `f89df79`, the site had to prove that public trust was still attached to files, commands, and hashes rather than the agent's summary of what it thought it had done.

```txt
receipt date: 2026-05-21
receipt baseline product commit: f89df79ab748bab40dc876e67652bf7c94b1629e
static pages built: 41 pages
Pagefind indexed: 10 pages / 2188 words
packet_backed_posts=9
source_workflow_posts_checked=9
post_image_contracts_checked=10
rendered viewport checks: 24 viewports
publication_approval_records=10
reference_ceiling_surface_scores_checked=9
rendered_page_surface_evidence_card_routes_first_screen=4/4
reference_blogger_ceiling_candidate_count=7
surface_home_lead=design-is-a-technical-contract blogger_ceiling=112 evidence_strength=321
surface_posts_index_lead=design-is-a-technical-contract blogger_ceiling=112 evidence_strength=321
wiki indexed: 361 files
archive copied: 393 files
```

Read without the code fence, the receipt is still falsifiable: on 2026-05-21, baseline product commit `f89df79ab748bab40dc876e67652bf7c94b1629e` produced 41 pages, 10 posts, 2188 words, 24 viewports, 10 records, 361 files indexed, and 393 files archived.

That receipt changed the review question. A reviewer no longer has to ask whether the site "looks like" an English AI engineering blog. The reviewer can ask whether the source packet count, image rules, rendered first-screen checks, approval records, and public article state all agree on the same publishable object.

That is the production shift. The agent is still allowed to draft, rewrite, and generate images. But the output cannot remain public unless the source packet, image rule, rendered screenshot, and exact Markdown hash agree.

There is a before/after hidden in that receipt:

| Before | After |
| --- | --- |
| "Looks good" | `publication_approval_records_checked=10` |
| "It has images" | `post_image_contracts_checked=10` |
| "The page opens" | `rendered_page_viewports_checked=24` |
| "The writing is probably fine" | `reference_ceiling_surface_scores_checked=9` |
| "Ship it" | `npm run verify:site-quality` |

The second column is not more poetic. It is more useful.

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

The wrong standard is "did the agent make something impressive?" The better standard is "did the agent leave behind a thing I can reject?"

## Reader Decision

Before the next agent session, decide which mode you are in.

Use one decision matrix:

| If the work is... | Use this mode | Required artifact |
| --- | --- | --- |
| Disposable, local, reversible | Vibe coding | A thing to react to |
| Unclear prototype | Vibe coding, then stop | Notes on what changed |
| Product change | Contract-driven agent work | Source, boundary, check |
| Public post | Contract-driven agent work | Packet, image rule, approval record |
| Security, billing, data, deploy | Contract-driven agent work | Failing test or verifier |

Use vibe coding only when all three are true:

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

Then write one contract before the diff:

```txt
Source:
Boundary:
Acceptance check:
Forbidden changes:
Evidence to keep:
```

Accept the output only when those five fields are present and current. Reject it when the agent gives you confidence without source, a diff without boundary, a claim without evidence, or a passing result that no one can reproduce.

That is the operator choice: keep vibe coding for discovery, then make production work boring enough to reject.

## Boundary

A technical contract does not make an agent correct. It only makes the agent's output easier to inspect, test, and reject.

This does not prove that vibe coding is bad. It proves that vibe coding has a boundary. It is useful while the work is cheap to discard and dangerous when the work already has contracts the agent can violate.

The caveat is that teams often cross that boundary gradually. A prototype gets users. A demo becomes a workflow. A local script starts touching real data. That is the moment to stop asking for better vibes and start writing the contract.

That is the point. Vibe coding gets you motion. Contracts decide whether the motion belongs in the system.
