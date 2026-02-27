# HiveLink — P2P Compute Mesh

## One Line

Secure P2P networking that turns multiple machines into one computer.

## The Problem

You have a desktop, a laptop, a Raspberry Pi, and a cloud VM. Each one runs alone. Moving work between them means SSH, SCP, VPN tunnels. There's no unified way to orchestrate compute across your own machines, especially for AI workloads that need GPU routing.

## The Solution

HiveLink connects all your machines via encrypted QUIC/TLS 1.3. A Prime node talks to you via chat; Worker nodes execute tasks. Mesh routing (v1.5) lets nodes forward jobs directly to each other based on GPU availability. Discovery is automatic (mDNS), NAT is handled (UPnP/STUN), and everything is end-to-end encrypted.

## Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| QUIC Transport | Production | TLS 1.3, TOFU auth, 90+ OpCodes |
| Remote Work Execution | Production | Allowlist-based, real-time stdout/stderr |
| Mesh Routing (v1.5) | Production | GPU-aware cross-node job forwarding |
| mDNS Discovery | Production | Auto LAN discovery every 30s |
| NAT Traversal | Production | UPnP + STUN fallback |
| Telemetry | Production | CPU, RAM, disk, network metrics |
| Desktop App | Beta | Tauri v2, chat interface, terminal |
| Mobile App | Beta | Flutter Android, 43 FFI functions |
| AI/LLM Jobs | Production | Ollama + external command backends |
| Hive Swarm | Beta | DAG task decomposition + fan-out |
| WebRTC Video | Beta | Screen streaming (Windows only) |
| Terminal Sync | Production | Remote PTY (max 4 sessions) |
| NeuralFS Search | Beta | SQLite FTS5, BM25 ranking |
| HiveGuard DNS | Beta | Policy-based DNS filtering |
| DLP File Access | Production | Secret scanning on transfers |
| Audit Logging | Production | JSONL + syslog rotation |

## Architecture

```
User → PRIME (controller)
         ├→ Worker 1 (GPU)
         ├→ Worker 2 (Storage)
         ├→ Worker 3 (Build)
         └→ Worker N...
```

With Mesh (v1.5): Workers can route jobs directly to each other.

## Platforms

| Platform | Status | Stack |
|----------|--------|-------|
| Linux x86_64 | Production | Rust binary |
| Windows x86_64 | Production | MSVC, system tray |
| Raspberry Pi ARM | Beta | Cross-compile |
| Android | Beta | Flutter + rust_bridge |
| Desktop (all OS) | Beta | Tauri v2 + React 19 |

## Security

- TLS 1.3 mutual authentication (TOFU)
- SHA-256 fingerprint verification (constant-time)
- Pairing tokens with expiry/revocation
- Rate limiting (5 failures/300s → lockout)
- DLP secret scanning (PEM, AWS, GitHub tokens)
- JSONL audit logging (10 MiB rotation)

## CLI

21 visible commands + 5 hidden. Key commands:

```bash
hive_link serve              # Start QUIC server
hive_link connect <invite>   # Connect to node
hive_link discover           # mDNS LAN scan
hive_link doctor             # Run diagnostics
hive_link security brief     # Security report
```

## Stats

| Metric | Value |
|--------|-------|
| Version | v1.5.0 |
| Language | Rust |
| Commits | 337 (329 in 2026) |
| OpCodes | 90+ (17 categories) |
| CLI commands | 21 visible + 5 hidden |
| Mobile FFI | 43 functions |
| Feature flags | 9 (mesh, llm, gpu, orchestrator, terminal, file-access, neuralfs, audio, full-v14) |
| Config fields | 53 |
| QUIC port | :4433 |

## GitHub

- **Repo**: yellowhama/hive_link
