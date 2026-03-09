# Musu Engine — Distributed AI Inference

## One Line

Rust-based AI inference runtime with BitNet edge computing and capability-based orchestration.

## The Problem

Cloud AI is expensive and requires internet. Local AI (Ollama) runs on one machine. There's no way to pool multiple machines' compute for AI inference, route jobs by GPU capability, or run zero-cost edge models alongside cloud APIs — all through a single interface.

## The Solution

Musu Engine provides a unified inference layer across three AI tiers. BitNet b1.58-2B-4T runs on consumer hardware at zero cost. Ollama handles local models. Cloud APIs (Claude, GPT) handle complex tasks. The Gateway Protocol routes each job to the most capable available node.

## Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| BitNet EnginePool | Production | N instances, GPU-first, least-loaded routing |
| Gateway Protocol | Production | Capability-based job dispatch (6 endpoints) |
| QUIC + HTTP Dual Transport | Production | Primary QUIC, HTTP fallback |
| Pico Interceptor | Alpha | 6 sandboxed profiles (Scout/Build/Test/Lint/Risk/Replay) |
| RAG Knowledge Base | Beta | pgvector + SQLite backends |
| Prometheus Metrics | Production | /metrics endpoint |
| mTLS | Production | Mutual TLS for inter-service auth |
| Node Bridge | Beta | N-API bridge for TypeScript interop |

## Rust Crates

| Crate | LOC | Tests | Purpose |
|-------|-----|------:|---------|
| musu-engine | ~24,500 | 444 | BitNet inference, swarm, EnginePool |
| musu-prime | ~9,000 | 121 | Gateway orchestrator, RAG, auth |
| musu-common | ~3,900 | 65 | Shared types (CRDT, merkle, bloom) |
| musu-interceptor | ~2,400 | 8+ | Pico agent runtime (oppa-micro) |
| musu-node-bridge | — | — | Node.js/N-API bridge |
| **Total** | **~40,000** | **849** | |

## Triple AI Tiers

| Tier | Provider | Cost | Use Case |
|------|----------|------|----------|
| Corporate (T1) | Claude, GPT, Gemini | Pay-per-use | Complex reasoning |
| Local (T2) | Ollama, LocalAI, ONNX | Hardware only | Privacy-first, offline |
| Edge (T3) | BitNet b1.58-2B-4T | Zero | Always-on, lightweight |

## Gateway Protocol

6 endpoints for job lifecycle:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dispatch` | POST | Submit job |
| `/result/{id}` | GET | Poll result |
| `/pull-job` | POST | Worker pulls job |
| `/register` | POST | Register capabilities |
| `/heartbeat` | POST | Keep-alive |
| `/capabilities` | GET | List capabilities |

See [Gateway Protocol spec](../specs/gateway-protocol.md).

## Stats

| Metric | Value |
|--------|-------|
| Language | Rust |
| Rust LOC | ~40,000 |
| Rust tests | 849 passing |
| Crates | 5 |
| Ports | :8791 (Prime HTTP), :9791 (Prime QUIC), :8080+ (Engine) |
| Pain points resolved | 15/15 |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `MUSU_PRIME_URL` | — | Prime API URL |
| `VIBE_BITNET` | — | Enable BitNet |
| `MUSU_RAG_ENABLED` | `0` | Enable RAG |
| `MUSU_KNOWLEDGE_POSTGRES` | `0` | PostgreSQL backend |
| `MUSU_ENV` | — | `production` for mTLS |

## GitHub

- **Monorepo**: yellowhama/Musu (`src/crates/`)
