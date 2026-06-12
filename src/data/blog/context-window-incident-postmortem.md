---
slug: context-window-incident-postmortem
title: "The Day Our Agent's Context Window Filled Up: A Postmortem"
description: "A long-running agent daemon degraded into incoherence as its context window saturated. Here is what broke, why monitoring missed it, and the three-contract architecture that fixed it."
pubDatetime: 2026-06-12T00:00:00Z
tags: [context-engineering, agent-architecture, postmortem, context-window, claude-api, kv-cache]
series: Field Log
draft: false
references:
  - name: "Anthropic — Effective Context Engineering for AI Agents"
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - name: "Chroma Research — Context Rot"
    url: https://www.trychroma.com/research/context-rot
  - name: "Anthropic — How We Built Our Multi-Agent Research System"
    url: https://www.anthropic.com/engineering/multi-agent-research-system
  - name: "Claude API Docs — Context Editing"
    url: https://platform.claude.com/docs/en/build-with-claude/context-editing
  - name: "Manus — Context Engineering for AI Agents: Lessons from Building Manus"
    url: https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
  - name: "MemGPT: Towards LLMs as Operating Systems (arXiv:2310.08560)"
    url: https://arxiv.org/abs/2310.08560
  - name: "Cognition — Don't Build Multi-Agents"
    url: https://cognition.ai/blog/dont-build-multi-agents
---

If you run an agent for more than an hour of real work, you have seen this failure. The agent doesn't crash. It gets *worse* — slowly, then completely. It re-runs a step it finished twenty minutes ago. It ignores a constraint stated at the top of the session. It hallucinates a file path assembled from three real paths in its tool-result history. Then the plan evaporates and the run is unrecoverable.

This is the postmortem of the day that happened to our publishing daemon — and the three contracts we shipped so that it fails differently now.

## The incident

Over roughly 90 minutes, our publishing daemon degraded from correct work to confident, planless execution — while every dashboard stayed green.

The daemon is a long-running agent loop: it picks jobs off a WAL-backed queue, researches, drafts, runs validation gates, and publishes. A typical job involves dozens of tool calls — search results, fetched pages, schema validation output — each appending its result to the conversation. That shape is normal, not pathological: Manus reports that a typical agent task runs around 50 tool calls, and Anthropic's production data shows agents consuming roughly 4× the tokens of a chat interaction, with multi-agent systems closer to 15×.

The run that died looked healthy on every metric we collected. Process up. Tool calls succeeding. Latency normal. What no dashboard could see was the conversation itself filling with tool-result sediment. The failure timeline, reconstructed from the transcript:

```
[t+0:14] Agent drafts section 2. Correct.
[t+0:41] Agent re-fetches a source it already fetched at t+0:09.
         (First duplicate. We didn't notice.)
[t+1:03] Agent cites a URL that appears nowhere in any tool result —
         a splice of two real URLs from earlier fetches.
[t+1:22] Agent violates a formatting constraint stated in the system
         prompt. The constraint is still *in* the context. It just
         doesn't bind anymore.
[t+1:30] Context exceeds the window. Truncation. The plan — written
         in turn 1 — is the oldest content, so it's the first to go.
[t+1:31 →] Agent continues executing, confidently, with no plan.
```

The last line is the one that matters. After truncation the agent didn't stop; it kept producing plausible work that belonged to no plan. Anthropic hit exactly this failure in their multi-agent research system — contexts exceeding 200,000 tokens get truncated — which is why their guidance is blunt: *retain the plan* outside the window, because truncation will eventually eat everything else.

## What actually broke: a gradient, not a cliff

Context saturation degrades performance along a gradient, not at a threshold — and that distinction is why our monitoring missed it. My first instinct was to treat the incident like an OOM: find the limit, alert at 80%, done. The data says that mental model is wrong.

Anthropic's context-engineering guidance describes the mechanism. Attention must service n² pairwise relationships across n tokens, so as the window fills, the model's ability to accurately recall information from it decreases — a stretched attention budget. Critically, they characterize the result as "a performance gradient rather than a hard cliff."

Chroma's *Context Rot* study put numbers on that gradient across 18 models, including Claude Opus 4, Sonnet 4, GPT-4.1, o3, Gemini 2.5 Pro, and Qwen3. Holding the task trivially simple and increasing only input length, performance degrades non-uniformly: recall drops faster when the question is less lexically similar to the needle, a *single* distractor measurably hurts, and hallucination rates rise in long contexts. Even refusals creep in — Claude Opus 4 refused 2.89% of a repeated-word task at length, GPT-4.1 2.55%. Their LongMemEval comparison is the cleanest illustration: every model family scored significantly better on a focused ~300-token prompt than on the full ~113k-token version *of the same task*.

Map those findings back to our timeline and every symptom resolves:

- **Duplicate work** — degraded recall over the agent's own earlier tool calls.
- **Spliced-URL hallucination** — the distractor effect: dozens of near-identical fetch results competing in attention.
- **Ignored constraint** — lost-in-the-middle. The instruction was present but no longer salient.
- **Total collapse** — truncation deleting the plan, the one piece of state everything else depended on.

This also explains why no alert fired: there was no error to catch. The agent degraded like a cache with a falling hit rate, not like a process with a leak.

One thing this postmortem will not give you is the token count where rot begins. The honest answer — per both Anthropic and Chroma — is that no universal threshold exists; degradation varies by task and model. If your architecture depends on knowing the threshold, your architecture is wrong.

## The reframe: context is a budgeted cache, not an append-only log

The fix starts with a reframe: the context window is a working set over an external source of truth, not the source of truth itself.

Our queue already embodied this pattern, and I had failed to apply it to the agent sitting on top of it. The WAL treats disk as the source of truth; memory holds only a working window. The agent inverted that: the conversation *was* the state, and the filesystem was an afterthought.

Manus states the corrected model plainly — treat the filesystem as external memory: "unlimited in size, persistent by nature, and directly operable by the agent itself." The lineage runs back to MemGPT (2023), which framed this as virtual context management: OS-style memory tiers with paging between fast (in-context) and slow (external) storage, letting an agent handle material that "far exceed[s]" the window.

Once you accept "budgeted cache," the engineering question becomes a familiar one: what is the eviction policy, and what contract makes eviction safe? We wrote three.

## Contract 1: Eviction — what gets cleared, when, and the model is told

Eviction must be explicit, parameterized, and visible to the model. Evicting silently is how you get an agent that re-fetches pages because it can no longer see that it already did.

The Claude API now ships this server-side as context editing. The `clear_tool_uses_20250919` strategy clears old tool results when the context crosses a trigger (default 100,000 input tokens), keeps the most recent tool use/result pairs (default 3), and replaces cleared content with a placeholder so the model *knows* something was removed. Our configuration:

```json
{
  "context_management": {
    "edits": [{
      "type": "clear_tool_uses_20250919",
      "trigger": { "type": "input_tokens", "value": 80000 },
      "keep": { "type": "tool_uses", "value": 5 },
      "clear_at_least": { "type": "input_tokens", "value": 10000 },
      "exclude_tools": ["read_plan", "validate_schema"]
    }]
  }
}
```

(Beta header: `context-management-2025-06-27`.)

Two parameters carry the operational weight. `exclude_tools` protects load-bearing results: our validation-gate outputs are contracts, not sediment, so they are never evicted. `clear_at_least` exists because eviction is not free — any edit to the prompt prefix invalidates the KV cache from that point forward. Manus calls KV-cache hit rate "the single most important metric for a production-stage AI agent"; at the time of their writing, cached tokens on Claude Sonnet cost $0.30/MTok versus $3.00/MTok uncached, a 10× spread. Clearing 200 tokens and paying a full cache invalidation is a terrible trade. `clear_at_least` forces every invalidation to buy back enough space to be worth its price.

The response reports what was edited via `applied_edits` — cleared tool-use count, cleared input tokens. We log that into the daemon's run record, which makes eviction *observable* for the first time:

```
[ctx-edit] applied_edits: cleared_tool_uses=12, cleared_input_tokens=41,302
[ctx-edit] window after edit: 61,447 input tokens
```

## Contract 2: Restoration — never evict what you can't get back

Eviction is lossy compression, and the contract that makes it safe is restorability: every byte that leaves the window must leave behind a reference sufficient to reconstruct it. This is Manus's restorable-compression rule — drop the web page body, keep the URL; drop the document text, keep the file path.

In practice this changed our tool design more than our prompts. Tools that used to return full payloads inline now write the payload to disk and return a reference plus a short summary:

```
fetch_source(url) →
  { "artifact": "artifacts/run-4412/source-07.md",
    "summary": "Pricing table + changelog, 2026-03 edition",
    "url": "https://..." }
```

When the eviction pass clears that result, nothing is lost — the agent can re-read the artifact on demand. This is the same artifact-handoff pattern Anthropic uses between subagents: store the work product in an external system, pass "lightweight references" back to the coordinator, and spawn fresh contexts that pick up continuity from stored state rather than inherited transcripts.

The inverse rule is the one that bit us: anything *not* restorable must not be evictable. Hence `exclude_tools` on the gate outputs.

## Contract 3: Plan persistence — the state that must survive truncation

The plan died in our incident because it lived at the oldest end of an append-only log — exactly where truncation and attention decay both strike first. So the plan moved out of the conversation entirely, into a file the agent re-reads and rewrites on every loop iteration.

This is Manus's recitation pattern: maintaining a `todo.md` and updating it each step "pushes the global plan into the model's recent attention span," counteracting lost-in-the-middle with zero model or architecture changes. The plan is now always the *newest* content in the window, and its durable copy on disk survives any truncation event. Anthropic's multi-agent system reaches the same conclusion from the truncation side: when contexts blow past 200k and get cut, the persisted plan is what lets a fresh context resume instead of restart.

```markdown
# run-4412 plan          <- rewritten into context every iteration
- [x] research: 7 sources fetched -> artifacts/run-4412/
- [x] draft sections 1-2
- [ ] draft section 3 (CURRENT)
- [ ] gate: schema validation
- [ ] gate: link check
- [ ] publish
constraints: no pricing claims without artifact ref; EN only
```

We then added the piece our existing pipeline made obvious: a **context-budget gate**. Our publishing flow already refuses to ship a post that fails schema validation; the agent loop now refuses to *continue* if the post-eviction window exceeds budget, or if `plan.md` fails to round-trip (write, re-read, match). Contract over state — the same principle, applied one layer down.

## The unresolved tension: split or compress?

One honest caveat: the field does not agree on the endgame here.

Cognition's position is that splitting work across multiple agents to dodge context limits makes things worse — "decision-making ends up being too dispersed and context isn't able to be shared thoroughly enough." Their prescription is a single thread plus a dedicated model "whose key purpose is to compress a history of actions & conversation into key details, events, and decisions" — while admitting that building such a model is genuinely hard. Anthropic's production system takes the opposite bet: split, but route handoffs through external memory and artifacts rather than shared transcripts.

What both camps agree on is the part we built: **compression is lossy, and loss must be governed by contract.** Whether the window belongs to one agent or many, something decides what gets forgotten — and that decision needs a policy, a restoration path, and an audit trail, not vibes.

## Takeaways

- Context saturation fails like dementia, not like OOM. Process monitors stay green the entire time. Instrument the *window*: input tokens per turn, `applied_edits`, duplicate-tool-call rate.
- There is no universal "it breaks at X tokens." Degradation is a gradient (Anthropic), measured across 18 models (Chroma). Design for the gradient, not a threshold.
- Treat context as a budgeted cache over an external source of truth. Three contracts make it safe: **eviction** (explicit, parameterized, reported), **restoration** (every evicted byte leaves a reference), and **plan persistence** (durable plan, recited into recent attention every step).
- Eviction itself has a price — cache invalidation at a 10× token-cost spread, per Manus's then-current Sonnet pricing. Budget for it with `clear_at_least`; don't pretend deletion is free.

The daemon has since run jobs well past the point where the old version collapsed — not because the model got smarter, but because the architecture stopped asking the context window to be a database. If your agent gets dumber the longer it runs, don't tune your prompts. Audit what is allowed to live in the window, and write down the contract for everything that isn't.