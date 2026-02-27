# 아키텍처 페이지 (`/architecture`)

> 상태: ✅ v6.1 구현됨
> 소스: `src/app/architecture/page.tsx`
> 스펙: `docs/product/strategy/architecture-deep-dive-spec.md`

---

## 시작

You don't need to read this.
But if you want proof, it's all here.

Deterministic Structure on Top of Probabilistic AI

---

## 1. The Map

The landing page showed four structural layers.
Here are the five components that build them.

```
Structure              Built by
─────────              ────────
Intent                 Prime + Control
Lifecycle              Prime + Control
Validation             Control + Engine
Persistent State       Memory + Engine

                       Mesh (spans all layers)
```

The landing page shows what MUSU does.
This page shows how.

---

## 2. Intent

You define what you're building.
MUSU parses it into scope, constraints, and success criteria.

That becomes a constraint — not a suggestion.

Every file change is checked against declared scope.
Out-of-scope changes are blocked.
Goal mutations are tracked by hash.
If the intent drifts without authorization, the system stops.

---

## 3. Lifecycle

Work happens in stages. Each stage requires the previous stage's artifact.

No spec → no plan.
No plan → no execution.
No review → no finalization.

File-based. Declarative. No way to skip.

Projects persist across runs.
A run ends. The project stage doesn't reset.

---

## 4. Validation

Every AI-generated change enters a pipeline before it touches project state:

```
Draft → Diff → Scope Check → Policy Check → Verdict
```

Three outcomes:
- **GO** — accepted
- **FIX** — auto-retry (bounded)
- **BLOCK** — halt

Before picking a strategy, multiple candidates are simulated in sandboxes.
Scored. Best one wins. Then it still goes through the pipeline.

Nothing enters state without a verdict.

---

## 5. State

Chat memory is volatile. Project state is not.

Content is decomposed into semantic blocks — not arbitrary token chunks.
Same content, same location → same ID. Deduplication is structural.

Blocks are chained: parent-child links preserve document topology.
Knowledge is vectorized and searchable across runs.

Reopen a project in six months.
The full history reconstructs automatically.

---

## 6. The Loop

The system feeds its own output back into the next run:

```
Intent → Plan → Execute → Store → Search → Plan → ...
```

Three sources inform each new mission:
1. What the code looks like now (block search)
2. How similar problems were solved before (knowledge search)
3. What was tried last time and failed (mission history)

Each run makes the next one better informed.

---

## 7. The Five Components

**Prime** — The brain.
Coordinates everything. Captures intent. Decomposes goals. Routes tasks by capability.
Does not generate code. Governs how generated code is processed.

**Engine** — The enforcer.
Runs locally on CPU. Validates, retries, simulates.
95% of routine work never touches cloud AI.
BitNet 1.58-bit. No GPU required.

**Control** — The gate.
GO, FIX, or BLOCK — every action gets a verdict.
Configurable policies. Full audit trail.

**Memory** — The record.
Semantic blocks. Content-addressable. Conflict-free replication.
State survives model updates, node restarts, and long pauses.

**Mesh** — The network.
Peer-to-peer. Encrypted. No central relay.
Your machines become one execution surface.

---

## 8. Why This Works

AI drifts. Structure doesn't.

MUSU doesn't make AI smarter.
It makes the system around AI stable.

The model proposes.
The structure decides.

---

## 9. What MUSU Is Not

Not a model. Not a prompt tool.
Not an agent framework. Not a cloud service.

It's the boundary layer above them.

---

## 10. For Engineers

If you're evaluating this, ask:

- How is intent enforced at runtime?
- What prevents stages from being skipped?
- What constitutes a deterministic verdict?
- How is project state reconstructed?
- What happens when the model misbehaves?

MUSU answers structurally, not rhetorically.

Rust core · MCP interface · QUIC + TLS 1.3
Block Store + pgvector · BitNet 1.58-bit · CRDT

---

## 11. Close

AI alone produces output.

MUSU produces systems.
