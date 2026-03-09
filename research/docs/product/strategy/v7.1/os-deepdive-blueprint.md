# MUSU OS Deep-dive Page Blueprint (/os)

> Date: 2026-02-22
> Status: Draft
> Context: /os page is the "technical trust" destination. Maintains founder voice but switches to Functional Mode (dry, fact-based).

---

## Design Principles

- Voice: "Fellow builder who got there first" (not sales, not marketing)
- Content: Functional Mode (dry facts, verifiable specs)
- Transparency: Honest Status Badges (Implemented / In Progress / Planned)
- The "In Progress" labels make "Implemented" labels credible

---

## Accordion-based Tech Specs UI

### Category 1: AI & Inference Layer
| Spec | Value | Status |
|------|-------|--------|
| Core Model | BitNet 1.58-bit (2B params, ~1.2GB VRAM) | Implemented |
| Embedding | ONNX Runtime + all-MiniLM-L6-v2 (Local) | Implemented |
| Performance | HTTP Resident Server (120x faster than CLI) | Implemented |

### Category 2: Production-grade Compliance RAG
| Spec | Value | Status |
|------|-------|--------|
| Vector DB | PostgreSQL + pgvector (384-dim) | Implemented |
| Search Strategy | Hybrid (0.6 Dense + 0.4 Sparse) | Implemented |
| Semantic Chunking | TS SemanticBlock / Prime Fixed(512B) | Implemented |
| Lineage Tracking | parent_hash / root_hash chain | In Progress |

### Category 3: P15 Execution Pipeline
| Spec | Value | Status |
|------|-------|--------|
| Holodeck | Just-Bash in-memory virtual shell | Implemented |
| Time Stone | N-strategy simulation & auto-scoring | Implemented |
| Hive Mind | Map-Reduce / Tree of Thoughts / Lookahead | Implemented |

### Category 4: Zero-Trust Warden
| Spec | Value | Status |
|------|-------|--------|
| Privilege Broker | SingleUse / SessionToken (15m) | Implemented |
| Fail-Closed | Instant block on PRV-401/010/001 violations | Implemented |
| Audit Trail | Append-only hash chain with redaction | Implemented |

### Category 5: Infrastructure & MUSU Mesh
| Spec | Value | Status |
|------|-------|--------|
| Control Plane | Rust Axum + Tokio (50+ REST endpoints) | Implemented |
| Service Mesh | P2P QUIC protocol + mDNS discovery | Implemented |
| HW Support | Raspberry Pi 4+ / 24-7 Caretaker mode | Implemented |

---

## Verification Policy (Bottom Section)

- "MUSU RAG has applied hybrid search (0.6 dense + 0.4 sparse) to its production path."
- "We are currently progressing through the integration phase to extend the semantic lineage system into the Prime runtime."
- Last Verified date shown

---

## Reference Code

See user-provided reference implementation in conversation history (2026-02-22).
Uses accordion UI with ChevronDown/Up, status badges (green=Implemented, yellow=In Progress).
Adapt to existing design system (Card, Badge, Section, FadeIn components).
