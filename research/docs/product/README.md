# MUSU Product Documentation

> Single Source of Truth for musu.pro website content.
> All facts sourced from actual code in HiveLink (v1.5.0) and Musu-new monorepo.

---

## Platform

| Document | Description |
|----------|-------------|
| [Platform Overview](./platform-overview.md) | What MUSU is, Triple AI System, key numbers |
| [Five-Layer Architecture](./five-layers.md) | Real implementations mapped to brand layers |
| [Technology Stack](./tech-stack.md) | Rust/TypeScript/QUIC/BitNet details |

## Runtime Layers

| Layer | Document | Implementation |
|-------|----------|----------------|
| Prime | [runtime/prime.md](./runtime/prime.md) | musu-prime crate + Vibe PM dispatch |
| Engine | [runtime/engine.md](./runtime/engine.md) | musu-engine crate + BitNet EnginePool |
| Mesh | [runtime/mesh.md](./runtime/mesh.md) | HiveLink v1.5 (QUIC P2P) |
| Control | [runtime/control.md](./runtime/control.md) | Cockpitd + Ralph Loop + Interceptor |
| Memory | [runtime/memory.md](./runtime/memory.md) | CRDT + ChromaDB + pgvector |

## Products

| Product | Document | Stack |
|---------|----------|-------|
| Vibe PM | [products/vibe-pm.md](./products/vibe-pm.md) | TypeScript, MCP, npm |
| HiveLink | [products/hivelink.md](./products/hivelink.md) | Rust, QUIC, Tauri |
| Musu Engine | [products/musu-engine.md](./products/musu-engine.md) | Rust, BitNet, Axum |

## Strategy

| Document | Description |
|----------|-------------|
| [Positioning Brief](./strategy/positioning-brief.md) | Strategic direction, competitive positioning, messaging framework |

## Technical Specs

| Spec | Document |
|------|----------|
| Gateway Protocol | [specs/gateway-protocol.md](./specs/gateway-protocol.md) |
| Triple Verdict System | [specs/triple-verdict.md](./specs/triple-verdict.md) |
| MCP Tool Catalog | [specs/mcp-tools.md](./specs/mcp-tools.md) |

---

## Website Mapping

| Website Page | Source Documents |
|--------------|------------------|
| Landing (Hero, Problem, Solution) | platform-overview.md |
| /architecture | five-layers.md + runtime/*.md |
| /runtime/[slug] | runtime/*.md |
| /products/[slug] | products/*.md |
| /docs | specs/*.md |
| /pricing | platform-overview.md |

---

## Source Repositories

| Repo | Path | GitHub |
|------|------|--------|
| Musu (monorepo) | `/mnt/f/Aisaak/Projects/Musu-new/` | yellowhama/Musu |
| HiveLink | `/mnt/f/Aisaak/Projects/HiveLink/` | yellowhama/hive_link |
| Vibe PM (npm) | `Musu-new/release/mvp_core_clinic/` | yellowhama/vibe-pm |

## Status Legend

- **Production** — Shipped, tested, stable
- **Beta** — Working, needs polish
- **Alpha** — Implemented, experimental
- **Planned** — Designed, not coded
