# MUSU Memory — Persistent Storage

> Nothing is forgotten.

## Overview

MUSU Memory provides distributed state management and knowledge storage across all nodes. It combines CRDTs for conflict-free replication, vector stores for semantic search, and full-text indexing for fast retrieval.

## Implementation

### musu-common (Rust Crate)

- **LOC**: ~3,900
- **Tests**: 65 passing
- **Source**: `Musu-new/src/crates/musu-common/`

### ChromaDB (Local Vector Store)

- **Location**: `.vibe/chroma/chroma.sqlite3`
- **Manifest**: `.vibe/kce/chroma_manifest.json`
- **Sync**: `vibe_pm.memory_sync` MCP tool
- **Status check**: `vibe_pm.memory_status` MCP tool

### pgvector (PostgreSQL)

- **Requirement**: PostgreSQL with pgvector extension
- **Activation**: `MUSU_RAG_ENABLED=1` + `MUSU_KNOWLEDGE_POSTGRES=1`

## CRDT Types

Conflict-free Replicated Data Types for distributed state without coordination:

| Type | Purpose | Semantics |
|------|---------|-----------|
| `GSet` | Grow-only set | Elements can be added, never removed |
| `OrSet` | Observed-Remove set | Elements can be added and removed |
| `LwwRegister` | Last-Writer-Wins register | Most recent write wins (timestamp-based) |
| `PnCounter` | Positive-Negative counter | Distributed increment/decrement |

## Sync Mechanisms

### Merkle Tree

- Used for state reconciliation between nodes
- Efficiently identifies diverged subtrees
- Minimal data transfer for sync

### Bloom Filter

- Probabilistic membership testing
- Fast "definitely not in set" queries
- Used for distributed deduplication

## Storage Backends

### 1. ChromaDB (Default)

- Local SQLite-based vector database
- Embedding storage for semantic search
- Zero external dependencies
- MCP tools: `vibe_pm.memory_sync`, `vibe_pm.memory_status`, `vibe_pm.memory_retrieve`

### 2. pgvector (Optional)

- PostgreSQL vector similarity search
- Requires `DATABASE_URL` connection string
- Better for multi-node deployments
- Cosine similarity / L2 distance / inner product

### 3. NeuralFS (HiveLink)

- SQLite FTS5 full-text search
- BM25 relevance ranking
- Walkdir-based file indexing
- Part of HiveLink's `neuralfs` feature flag

## Data Flow

```
AI Agent action
  → Decision logged (decision log, JSONL)
  → State updated (CRDT merge)
  → Embeddings stored (ChromaDB / pgvector)
  → Indexed for search (NeuralFS FTS5)
  → Synced across nodes (Merkle tree)
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `vibe_pm.memory` | Store memory entry |
| `vibe_pm.memory_retrieve` | Search stored memories |
| `vibe_pm.memory_sync` | Trigger sync with remote |
| `vibe_pm.memory_status` | Check memory health |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `MUSU_RAG_ENABLED` | `0` | Enable RAG knowledge search |
| `MUSU_KNOWLEDGE_POSTGRES` | `0` | Use PostgreSQL (else SQLite) |
| `DATABASE_URL` | — | PostgreSQL connection string |

## Status

- **CRDT (musu-common)**: Production (65 tests)
- **ChromaDB**: Beta (local vector store working)
- **pgvector**: Alpha (requires PostgreSQL setup)
- **NeuralFS**: Beta (HiveLink feature-gated)
