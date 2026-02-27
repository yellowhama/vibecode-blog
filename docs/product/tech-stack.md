# MUSU Technology Stack

## Languages

| Language | Usage | LOC (approx) |
|----------|-------|--------------|
| Rust | Engine, Prime, Mesh, Control, Memory | ~40k |
| TypeScript | Vibe PM, Desktop UI, MCP tools | ~10k+ |
| Dart/Flutter | Mobile client (Android) | — |
| SQL | Migrations, ChromaDB, pgvector | — |

## Rust Ecosystem

| Crate | Version | Purpose |
|-------|---------|---------|
| tokio | 1.x | Async runtime |
| axum | 0.7 | HTTP server (Prime, Engine) |
| quinn | 0.11 | QUIC transport (Mesh, Engine) |
| rustls | 0.23 | TLS 1.3 |
| ring | 0.17 | Cryptography |
| sqlx | — | PostgreSQL async driver |
| rusqlite | 0.31 | SQLite (NeuralFS FTS5) |
| sysinfo | — | System telemetry |
| mdns-sd | 0.11 | mDNS service discovery |
| igd-next | 0.14 | UPnP NAT traversal |
| portable-pty | 0.8 | Terminal sessions |
| webrtc | 0.17.1 | Video streaming (Windows) |
| flutter_rust_bridge | 2.11.1 | Mobile FFI |
| metrics + prometheus | — | Observability |
| rcgen | — | Self-signed TLS certificates |
| clap | — | CLI argument parsing |

## TypeScript Ecosystem

| Package | Purpose |
|---------|---------|
| @modelcontextprotocol/sdk | MCP server/client |
| fastify | HTTP server (Vibe PM Hub) |
| vitest | Testing framework (5,411 tests) |
| pg | PostgreSQL client |
| vercel-ai-sdk | AI provider abstraction |

## AI Models

| Model | Type | Usage |
|-------|------|-------|
| BitNet b1.58-2B-4T | 1-bit quantized LLM | Edge inference (Tier 3) |
| Ollama (any model) | Local LLM runtime | On-premise inference (Tier 2) |
| Claude / GPT / Gemini | Cloud API | Corporate AI (Tier 1) |
| ONNX Runtime | Inference engine | Optional local backend |

## Protocols

| Protocol | Layer | Usage |
|----------|-------|-------|
| QUIC (RFC 9000) | Transport | Primary transport (Mesh, Engine) |
| TLS 1.3 | Security | All QUIC connections |
| HTTP/1.1 + HTTP/2 | Transport | Fallback, REST APIs |
| mTLS | Security | Production inter-service auth |
| TOFU | Security | Trust On First Use (Mesh peers) |
| MCP (stdio + HTTP) | Application | AI tool protocol (Vibe PM) |
| JSON-RPC 2.0 | Application | MCP wire format |
| mDNS | Discovery | LAN node auto-discovery |
| UPnP / STUN | NAT | NAT traversal |
| WebRTC | Media | Video streaming (Windows) |
| SSE | Events | Cockpitd real-time events |

## Infrastructure

| Tool | Usage |
|------|-------|
| Kubernetes | Orchestration (4 overlays: local/staging/prod/canary) |
| Helm | Package management (vibepm chart) |
| GHCR | Container registry |
| GitHub Actions | CI/CD (fmt, clippy, test, audit) |
| Podman / Docker | Container runtime |
| Railway | Vibe-coordinator deployment ($5/month) |
| Vercel | musu.pro website |
| Supabase | Auth + Device Registry |

## Desktop & Mobile

| Platform | Stack |
|----------|-------|
| Desktop (all OS) | Tauri v2 + React 19 + TypeScript + Vite |
| Desktop UI libs | XTerm.js 6.0, xyflow 12.10, framer-motion 11, lucide-react |
| Android | Flutter + flutter_rust_bridge (43 FFI functions) |
| Design System | Pencil.dev (14 screens), Lunaris components (100+) |

## Build & Release

```bash
# Rust (release build)
cargo build -p hive_link --release --features full-v14
# → opt-level="z", LTO, codegen-units=1, panic="abort", strip

# TypeScript (Vibe PM)
npm run build  # tsc → build/

# Desktop
cd desktop && npm run tauri build

# K8s deploy
bash scripts/run-pilot.sh  # 9-step automated checklist
```

## Ports Summary

| Port | Service | Protocol |
|------|---------|----------|
| 3001 | Cockpitd (Control) | HTTP + SSE |
| 3100 | Vibe PM Hub | HTTP |
| 4433 | HiveLink (Mesh) | QUIC |
| 8080+ | Engine instances | HTTP (OpenAI-compatible) |
| 8791 | Prime API | HTTP |
| 9791 | Prime API | QUIC |
