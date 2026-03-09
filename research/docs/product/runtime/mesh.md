# MUSU Mesh — Distributor

> One computer made of many.

## Overview

MUSU Mesh is the P2P compute networking layer, implemented as HiveLink. It connects multiple machines into a single unified system using QUIC/TLS 1.3 encrypted transport, with GPU-aware job routing, automatic discovery, and NAT traversal.

## Implementation

- **Crate**: `hive_link` (Rust)
- **Version**: v1.5.0
- **Commits**: 337 (329 in 2026)
- **Source**: `/mnt/f/Aisaak/Projects/HiveLink/`
- **GitHub**: yellowhama/hive_link

## Transport

- **Protocol**: QUIC over TLS 1.3
- **ALPN**: `hive-link/quic/v1`
- **Auth**: TOFU (Trust On First Use) — SHA-256 TLS fingerprint verification
- **Frame format**: 4-byte length prefix + JSON/MessagePack body (max 8 MiB)
- **OpCodes**: 90+ across 17 categories

## Architecture

### Prime-Worker Model

```
User (chat interface)
    ↓
  PRIME (controller)
    ↓
  ┌─────┬─────┬─────┐
  W1    W2    W3    Wn
  GPU  Storage Build ...
```

- **Prime**: Orchestrates tasks, talks to user
- **Workers**: Execute tasks, report results
- **Mesh** (v1.5): Workers route jobs directly to each other

### Discovery & Routing

- **mDNS**: `_hivelink._udp.local.` — auto-discovery every 30 seconds
- **Telemetry exchange**: every 10 seconds between mesh peers
- **GPU scoring**: Node score based on GPU utilization + available VRAM
- **Fail-safe**: Mesh failure → local execution fallback

### NAT Traversal

- **UPnP**: Automatic port mapping via `igd-next`
- **STUN**: Fallback for NAT hole-punching

## Features (Rust Feature Flags)

| Flag | Feature |
|------|---------|
| `mesh` | Cross-node AI job routing (v1.5) |
| `llm` | AI/LLM job management (Ollama, external) |
| `gpu` | GPU monitoring (nvidia-smi parsing) |
| `orchestrator` | Multi-node orchestration + Hive Swarm |
| `terminal` | Remote PTY sessions (max 4/host) |
| `file-access` | DLP-protected file server |
| `neuralfs` | SQLite FTS5 search (BM25) |
| `audio` | Audio session management |
| `full-v14` | All features enabled |

## Hive Swarm (DAG Tasks)

- DAG-based task decomposition
- Fan-out dispatch to multiple workers
- Aggregation strategies: `CollectAll`, `FirstSuccess`, `Merge`
- Partial success support (`min_success_ratio`)

## Security

- **TLS 1.3 mutual auth** (TOFU)
- **Pairing**: SHA-256 token hashing + expiry/revocation
- **Rate limiting**: 5 failures / 300 seconds → lockout
- **Audit logging**: JSONL (10 MiB rotation) + syslog (Linux)
- **DLP**: Secret scanning on file transfers (PEM, AWS keys, GitHub tokens)
- **HiveGuard**: DNS filtering (home/dorm/lockdown modes)

## Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Linux x86_64 | Production | Primary target |
| Windows x86_64 | Production | MSVC, system tray, WebRTC |
| Raspberry Pi (ARM) | Beta | Cross-compile (`setup.sh`) |
| Android | Beta | Flutter client (43 FFI functions) |

## Desktop App (Tauri v2)

- React 19 + TypeScript + Vite
- Chat interface (Prime-first UX)
- Multi-terminal (XTerm.js)
- Node topology visualization (xyflow)
- Device metrics dashboard
- WebRTC viewer

## CLI Commands (21 visible + 5 hidden)

Key commands:
- `serve [addr]` — Start QUIC server
- `connect <invite>` — Connect to node
- `discover` — mDNS LAN scan
- `doctor [--json]` — Diagnostics
- `security brief` — Security posture report

## Port

- `:4433` — QUIC transport

## Status

**Production** (v1.5.0) — Mesh routing, GPU-aware orchestration, multi-platform.
