# MUSU Five-Layer Architecture — Fact Sheet

## Overview

MUSU's five layers map directly to real Rust crates, TypeScript modules, and running binaries. This document lists what actually exists in code, not aspirational design.

---

## Layer 1: Prime — Orchestrator

> Every task finds its home.

**Implementation**: `musu-prime` Rust crate (9k LOC, 121 tests)

**What it does**:
- Gateway Protocol: capability-based job routing across all MUSU nodes
- 6 HTTP endpoints: `/dispatch`, `/result/{id}`, `/pull-job`, `/register`, `/heartbeat`, `/capabilities`
- Push mode (immediate dispatch) and Pull mode (queue for next capable node)
- RAG knowledge base with pgvector (optional PostgreSQL backend)
- Prometheus metrics at `/metrics`

**Capabilities routed**:
- `code_inspection` — Vibe PM
- `gate` — Cockpitd
- `inference` — Musu Engine
- `scout`, `sys_admin` — Pico Interceptor
- `remote_compute`, `file_transfer`, `terminal` — HiveLink

**Ports**: `:8791` (HTTP) / `:9791` (QUIC)

**Status**: Production (121 tests passing)

→ [Full spec](./runtime/prime.md)

---

## Layer 2: Engine — Executor

> Raw compute, orchestrated.

**Implementation**: `musu-engine` Rust crate (24.5k LOC, 444 tests)

**What it does**:
- BitNet EnginePool: N instances of BitNet b1.58-2B-4T with least-loaded routing
- GPU-first backend selection: CUDA → Metal → CPU fallback
- Auto-scaling: `calculate_max_slots() = (RAM × 0.5 / model_size)` capped by CPU cores
- OpenAI-compatible API at each instance (`/v1/chat/completions`)
- QUIC primary + HTTP fallback dual transport

**Routing score**: `active_requests × 100 + avg_latency_ms` (lowest wins)

**Ports**: `:8080`, `:8081`, ... (N instances)

**Status**: Production (444 tests passing)

→ [Full spec](./runtime/engine.md)

---

## Layer 3: Mesh — Distributor

> One computer made of many.

**Implementation**: HiveLink v1.5.0 (`hive_link` Rust crate, 337 commits)

**What it does**:
- QUIC/TLS 1.3 encrypted transport (ALPN: `hive-link/quic/v1`)
- 90+ OpCodes across 17 categories
- Prime-Worker architecture with mesh routing (v1.5)
- mDNS auto-discovery every 30 seconds
- GPU-aware node scoring for job placement
- NAT traversal: UPnP auto port mapping + STUN fallback
- TOFU authentication (Trust On First Use, SHA-256 fingerprint)

**Platforms**:
- Linux x86_64 (production)
- Windows x86_64 (production, MSVC)
- Raspberry Pi ARM (beta)
- Android (Flutter client, beta)

**Features** (feature-gated):
- `mesh` — Cross-node AI job routing
- `llm` — AI/LLM job management (Ollama, external)
- `gpu` — GPU monitoring (nvidia-smi)
- `orchestrator` — Multi-node orchestration + Hive Swarm
- `terminal` — Remote PTY sessions
- `file-access` — DLP-protected file server
- `neuralfs` — SQLite FTS5 semantic search

**Port**: `:4433` (QUIC)

**Status**: Production (v1.5.0, 337 commits)

→ [Full spec](./runtime/mesh.md)

---

## Layer 4: Control — Gatekeeper

> Every action is judged.

**Implementation**: `cockpitd` Rust binary + `musu-interceptor` crate (8+ tests)

**What it does**:
- Triple Verdict System: **GO** (proceed) / **FIX** (course-correct) / **BLOCK** (re-decide)
- Ralph Loop: auto-correction engine, 3 retry attempts, 300s timeout
- Cockpitd: Rust sidecar with SSE event stream
- SSE events: `gate_check`, `healing`, `re_gate`, `done`, `blocked`, `timeout`
- Fallback: if Cockpitd unreachable, Vibe PM uses local TypeScript inspection

**Pico Interceptor** (6 execution profiles):
1. Scout — Code scan, change detection
2. Build — Remote build
3. Test — Remote test
4. Lint — Style check
5. Risk — Security scan
6. Replay — Bug reproduction

**Observer FSM** (4 states):
`IDLE → OBSERVE_ONLY → INTERVENE → DORMANT`

**Port**: `:3001` (HTTP + SSE)

**Status**: Production (Cockpitd), Alpha (Pico Interceptor)

→ [Full spec](./runtime/control.md)

---

## Layer 5: Memory — Persistent Storage

> Nothing is forgotten.

**Implementation**: `musu-common` Rust crate (3.9k LOC, 65 tests) + ChromaDB + pgvector

**What it does**:
- CRDT types for distributed state:
  - `GSet` — Grow-only set
  - `OrSet` — Observed-Remove set
  - `LwwRegister` — Last-Writer-Wins register
  - `PnCounter` — Positive-Negative counter
- Merkle tree sync for state reconciliation
- Bloom filter for membership testing
- ChromaDB local vector store (`.vibe/chroma/`)
- pgvector PostgreSQL backend (optional, `MUSU_RAG_ENABLED=1`)
- NeuralFS (HiveLink): SQLite FTS5 full-text search with BM25 ranking

**Status**: Production (CRDT 65 tests), Beta (ChromaDB), Alpha (pgvector)

→ [Full spec](./runtime/memory.md)

---

## Integration Flow

```
User request
  → Prime receives, routes by capability
    → Engine runs inference (BitNet/Ollama)
    → Mesh distributes to remote nodes (HiveLink)
    → Control gates every action (GO/FIX/BLOCK)
    → Memory persists state (CRDT sync)
  → Prime aggregates results
→ User receives structured response with signal + next_action
```

## Test Coverage Summary

| Layer | Crate | Tests |
|-------|-------|------:|
| Prime | musu-prime | 121 |
| Engine | musu-engine | 444 |
| Mesh | hive_link | separate repo |
| Control | musu-interceptor | 8+ |
| Memory | musu-common | 65 |
| **Rust Total** | | **849** |
| **TypeScript** | Vibe PM | **5,411** |
| **Grand Total** | | **6,260+** |
