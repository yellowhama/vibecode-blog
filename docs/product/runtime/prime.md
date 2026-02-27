# MUSU Prime — Orchestrator

> Every task finds its home.

## Overview

MUSU Prime is the central orchestrator that receives all incoming requests and routes them to the most capable node. It implements the Gateway Protocol — a capability-based job routing system that connects Vibe PM, Musu Engine, and HiveLink into a unified execution fabric.

## Implementation

- **Crate**: `musu-prime` (Rust)
- **LOC**: ~9,000
- **Tests**: 121 passing
- **Source**: `Musu-new/src/crates/musu-prime/`

## Gateway Protocol

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dispatch` | POST | Submit job for routing |
| `/result/{id}` | GET | Poll job result |
| `/pull-job` | POST | Worker pulls next available job |
| `/register` | POST | Worker registers capabilities |
| `/heartbeat` | POST | Worker heartbeat |
| `/capabilities` | GET | List registered capabilities |

### Routing Modes

- **Push**: Prime dispatches immediately to online capable node
- **Pull**: Job queued, next capable node pulls it

### Capability Types

| Capability | Provider |
|------------|----------|
| `code_inspection` | Vibe PM |
| `gate` | Cockpitd |
| `briefing` | Vibe PM |
| `inference` | Musu Engine (BitNet) |
| `scout` | Pico Interceptor |
| `sys_admin` | Pico Interceptor |
| `remote_compute` | HiveLink |
| `file_transfer` | HiveLink |
| `terminal` | HiveLink |

## Knowledge Base (RAG)

- **Default**: SQLite (local, zero-config)
- **Optional**: PostgreSQL + pgvector (`MUSU_RAG_ENABLED=1`, `MUSU_KNOWLEDGE_POSTGRES=1`)
- Full-text search with vector similarity
- Used for context retrieval in agentic workflows

## Observability

- Prometheus metrics at `/metrics`
- Health check at `/health`

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `MUSU_PRIME_URL` | — | Base URL for Prime API |
| `MUSU_RAG_ENABLED` | `0` | Enable RAG knowledge search |
| `MUSU_KNOWLEDGE_POSTGRES` | `0` | Use PostgreSQL (else SQLite) |
| `DATABASE_URL` | — | PostgreSQL connection string |

## Ports

- `:8791` — HTTP API
- `:9791` — QUIC transport

## Status

**Production** — 121 tests passing, smoke test 52/52 phases verified.
