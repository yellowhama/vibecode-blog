---
slug: agent-memory-persistence-boundaries
title: Agents Don't Have Memory. They Have Four Boundaries That Decide What Survives.
description: A working agent doesn't "remember" across sessions — it writes state through four deterministic boundaries before the context window resets. Here's how to design them so nothing important gets silently dropped.
pubDatetime: 2026-07-19T00:00:00Z
tags: [agent-memory, state-management, context-engineering, agentic-software, checkpointing]
series: AI Explainer
draft: false
references:
  - name: Model Context Protocol Specification
    url: https://modelcontextprotocol.io
  - name: LangGraph — Persistence Concepts
    url: https://langchain-ai.github.io/langgraph/concepts/persistence/
---

## The Question Behind "Just Use RAG"

Every team that ships an agent past the demo stage hits the same wall. The agent performs well across a 20-turn session; then the session ends, context resets, and the next run behaves as if it has never seen the codebase before.

The instinct is to reach for a vector store and call it "memory." That fixes retrieval — but not the underlying problem: **nothing was ever committed to durable state in the first place**, so there was nothing to retrieve.

Memory isn't a feature you bolt onto an agent. It's a set of boundaries where ephemeral context (the LLM's token window — lossy, probabilistic, subject to summarization or truncation) crosses into durable state (files, databases, commits — deterministic, addressable, diffable). If you don't design those boundaries explicitly, the model decides for you, and it decides badly: it has no incentive to persist anything unless the prompt tells it to.

Below are the four boundaries that matter. Skip any one of them and you get a specific, reproducible failure mode.

## Boundary 1: The Compaction Contract

Long-running agent sessions get summarized — this session itself works that way. The failure isn't that summarization happens; it's that most teams let it happen implicitly, with no contract over what must survive.

The fix is to define, in writing, what a compaction pass must preserve: open decisions, unresolved blockers, file paths touched, and any explicit user constraints. Everything else is compressible.

```python
COMPACTION_CONTRACT = {
 "must_preserve": ["open_decisions", "pending_approvals", "touched_paths", "user_constraints"],
 "compressible": ["exploratory_reasoning", "tool_output_verbose_logs"],
 "verify": "post_compaction_diff_must_include_all(must_preserve)"
}
```

Without this contract, the classic failure mode is an agent that "forgets" a constraint the user stated 40 turns earlier because compaction discarded it as noise. A contract turns "the summary looks fine" from a feeling into something you can actually assert against.

## Boundary 2: The Filesystem (or Repo) as Ground Truth

The highest-leverage fix in this whole pipeline: stop treating the chat transcript as the source of truth, and treat **the repository** as the source of truth instead. The agent's job becomes reading and writing to it.

`CLAUDE.md`, `AGENTS.md`, ADRs, TODO trackers checked into git — these aren't documentation for humans, they're the agent's actual long-term memory. A commit is a memory write with a diff, a timestamp, and an author. A chat message is not.

If a fact matters past this session, it needs to land in a file before the session ends — not survive on the hope that the summarizer preserves it. This is also why file-based state composes so much better than a memory API: you get `git log`, `git blame`, and `git diff` for free as your memory's audit trail.

## Boundary 3: The Schema Gate Before Persistence

This is where "contracts over state" stops being a slogan. An LLM output should never write directly to a durable store — it should write to a validator first, and only a passing validation becomes state.

```python
class MemoryFact(BaseModel):
 key: str
 value: str
 source_session: str
 confidence: Literal["verified", "inferred"]

def commit_fact(raw_llm_output: str) -> None:
 fact = MemoryFact.model_validate_json(raw_llm_output) # raises on malformed/missing fields
 store.write(fact)
```

If the model hallucinates a fact shape that doesn't match the schema, it doesn't get silently written as garbage state that the next session then trusts. It **fails loudly, in this session**, where you can see it. The alternative — no gate — means corrupted memory compounds silently across sessions until an agent confidently acts on a fact nobody ever verified.

This is the same discipline the Model Context Protocol (MCP) builds in at the tool-call boundary — though the spec's actual requirement is narrower than it's often described. MCP requires every server-exposed tool to declare an `inputSchema` (JSON Schema) describing its expected arguments; that declaration is a hard requirement of the protocol. What the spec does *not* mandate as a strict MUST is that a client validate every call against that schema and reject it before dispatch — client-side argument validation sits closer to a SHOULD in the spec's normative language. In practice, most serious implementations validate anyway, because skipping it means passing unchecked model output straight into a stateful tool.

`MemoryFact` above does the analogous job one layer downstream: instead of gating a *tool call* against a declared schema, it gates a *memory write*. If you're already running MCP servers, this isn't new infrastructure — it's the same declare-a-schema-and-validate-before-you-mutate discipline MCP establishes for tool arguments, applied to the write path into your own durable state.

## Boundary 4: The Checkpoint/Replay Log

The last boundary is about resumption, not just storage. When a session dies mid-task (crash, timeout, rate limit), you want to resume from the last committed checkpoint, not replay the raw conversation and hope the model reconstructs the same state.

LangGraph's persistence layer is a decent reference implementation of this pattern: it checkpoints graph state at each step and lets you resume from a specific checkpoint ID rather than the full history. The principle generalizes even if you're not using LangGraph — an append-only event log with checkpoint markers, where each checkpoint is a validated state snapshot (Boundary 3's output), gives you deterministic resumption.

Replaying raw chat turns to "get the model back into the same headspace" is not deterministic — you'll get *a* plausible headspace, not *the same* one.

## What This Buys You

Put together, the four boundaries form a pipeline: raw context → compaction contract → durable write (repo) → schema gate → checkpoint log. Each arrow is a place where you can write a test.

"The agent remembered" stops being a vibe you evaluate by rereading a transcript, and becomes an assertion: does the file exist, does it match the schema, does the checkpoint replay produce the same state.

## The Trade-off Nobody Advertises

This is more upfront engineering than "throw it in a vector store and hope." You're writing schemas, contracts, and checkpoint logic instead of shipping a demo in an afternoon.

The payoff shows up later. When an agent has been running for weeks across dozens of sessions, teams with explicit boundaries can tell you exactly what the agent knows and why. Teams without them are debugging by reading chat logs and guessing.

If you're building an agent that's supposed to outlive a single session, the memory system isn't optional infrastructure — it's the first thing to design, not the thing you retrofit after the demo works.