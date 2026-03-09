# MUSU Platform Overview

## What is MUSU?

MUSU (Multi-Unit Swarm Utility) is a distributed AI agent runtime that enables autonomous AI workflows across cloud, on-premise, and edge infrastructure. It connects three products — Vibe PM, Musu Engine, and HiveLink — into a unified system where AI agents collaborate through capability-based routing, gate enforcement, and persistent memory.

## Triple AI System

MUSU operates across three AI tiers, each serving a different purpose:

### Tier 1: Corporate AI (Cloud)
- Claude Code, Codex CLI, OpenAI API
- Entry point via MCP (Model Context Protocol)
- High-capability, pay-per-use

### Tier 2: Local AI (On-Premise)
- Ollama, LocalAI, ONNX Runtime
- Used by HiveLink nodes for offline/private workloads
- Full data sovereignty

### Tier 3: Edge AI (Zero-Cost)
- BitNet b1.58-2B-4T quantized model
- Pico Interceptor (oppa-micro) with 6 execution profiles
- Runs on consumer hardware, no API cost

## Four AI-Native Principles

1. **Truth Up Front**: Every response has a signal (`GO | FIX | BLOCK | INFO | WAIT`)
2. **Common-Sense Naming**: Tool names read like verbs (`hive.run_command`, not `hivelink_remote_compute_dispatch`)
3. **Two Audiences**: AI reads structured JSON, humans read summary text
4. **Always Answer "What Next?"**: Every response includes `next_action` field

## Key Numbers

| Metric | Value |
|--------|-------|
| Rust tests | 849 passing |
| TypeScript tests | 5,411 passing |
| Total tests | 6,260+ |
| Pain points resolved | 15/15 |
| HiveLink commits | 337 (329 in 2026) |
| HiveLink version | v1.5.0 |
| Vibe PM npm version | v1.4.0 |
| MCP tools | 46 across 5 namespaces |
| HiveLink OpCodes | 90+ across 17 categories |
| Rust crates | 5 (engine, prime, common, interceptor, node-bridge) |
| Platforms | Linux, Windows, Raspberry Pi, Android |

## Three Products

### Vibe PM — AI Project Manager
- TypeScript MCP server (`@vibecodetown/mcp-server`)
- 30+ tools for code review, decision tracking, gate enforcement
- Observer pattern with skill packs (TDD_GUARD, etc.)
- Cockpitd Rust sidecar for Ralph Loop auto-correction

### Musu Engine — Distributed Inference
- 5 Rust crates forming the core runtime
- BitNet EnginePool with GPU/CPU auto-detection
- Gateway Protocol for capability-based job routing
- Pico Interceptor with 6 sandboxed execution profiles

### HiveLink — P2P Compute Mesh
- QUIC/TLS 1.3 encrypted transport
- Prime-Worker architecture with mesh routing (v1.5)
- Multi-platform: Desktop (Tauri), Mobile (Flutter), CLI
- mDNS auto-discovery, NAT traversal, GPU-aware routing

## Architecture: Five Layers

| Layer | Role | Implementation |
|-------|------|----------------|
| **Prime** | Orchestrator | musu-prime + Vibe PM dispatch |
| **Engine** | Executor | musu-engine + BitNet EnginePool |
| **Mesh** | Distributor | HiveLink QUIC P2P |
| **Control** | Gatekeeper | Cockpitd + Ralph Loop |
| **Memory** | Storage | CRDT + ChromaDB + pgvector |

See [Five-Layer Architecture](./five-layers.md) for details.

## Current Status

- **Code**: Complete, all tests passing
- **K8s Deployment**: Phase 0 complete (image drift fix + pilot script), Phases 1-5 pending
- **Production Readiness**: Conditional GO (mTLS + MUSU_ENV=production required)
- **Smoke Test**: Musu Engine 11/13 OK, Vibe PM Hub 9/9 OK, MCP 31 tools registered
