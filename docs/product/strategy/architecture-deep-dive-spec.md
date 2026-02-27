# Architecture Deep Dive — /architecture 페이지 스펙

> 최종 업데이트: 2026-02-20
> 위치: /architecture (별도 페이지)
> 계층: L3 Proof Layer
> 톤: v6.1 카피와 동일 — 짧은 문장, 구체적 동사, 기술은 증거로만
> 방향: 비전 (목표 아키텍처를 확신으로 기술)

---

## 설계 원칙

- 랜딩의 **"See the full architecture →"** 을 눌렀을 때 도착하는 페이지
- 랜딩이 이미 한 이야기를 **반복하지 않는다** — 한 단계만 더 깊이
- 각 섹션 **5~10줄** — 벽 같은 텍스트 금지
- 기술 키워드는 **증거일 때만** 등장 (CRDT, pgvector, BitNet 등)
- 코드 블록은 **구조를 보여줄 때만** — 구현 상세는 docs에

---

## 시작

```
You don't need to read this.
But if you want proof, it's all here.
```

```
Deterministic Structure on Top of Probabilistic AI
```

---

## 11섹션 구조

### 1. The Map

랜딩에서 본 4개 구조 레이어. 여기서는 그걸 만드는 5개 컴포넌트.

```
Structure              Built by
─────────              ────────
Intent                 Prime + Control
Lifecycle              Prime + Control
Validation             Control + Engine
Persistent State       Memory + Engine

                       Mesh (모든 레이어에 걸침)
```

The landing page shows what MUSU does.
This page shows how.

---

### 2. Intent

You define what you're building.
MUSU parses it into scope, constraints, and success criteria.

That becomes a constraint — not a suggestion.

Every file change is checked against declared scope.
Out-of-scope changes are blocked.
Goal mutations are tracked by hash.
If the intent drifts without authorization, the system stops.

---

### 3. Lifecycle

Work happens in stages. Each stage requires the previous stage's artifact.

```
No spec → no plan.
No plan → no execution.
No review → no finalization.
```

File-based. Declarative. No way to skip.

Projects persist across runs.
A run ends. The project stage doesn't reset.

---

### 4. Validation

Every AI-generated change enters a pipeline before it touches project state:

```
Draft → Diff → Scope Check → Policy Check → Verdict
```

Three outcomes:
- **GO** — accepted
- **FIX** — auto-retry (bounded)
- **BLOCK** — halt

Before picking a strategy, multiple candidates are simulated in sandboxes.
Scored. Best one wins. Then it still goes through the pipeline.

Nothing enters state without a verdict.

---

### 5. State

Chat memory is volatile. Project state is not.

Content is decomposed into semantic blocks — not arbitrary token chunks.
Same content, same location → same ID. Deduplication is structural.

Blocks are chained: parent-child links preserve document topology.
Knowledge is vectorized and searchable across runs.

Reopen a project in six months.
The full history reconstructs automatically.

---

### 6. The Loop

The system feeds its own output back into the next run:

```
Intent → Plan → Execute → Store → Search → Plan → ...
```

Three sources inform each new mission:
1. What the code looks like now (block search)
2. How similar problems were solved before (knowledge search)
3. What was tried last time and failed (mission history)

Each run makes the next one better informed.

---

### 7. The Five Components

**Prime** — The brain.
Coordinates everything. Captures intent. Decomposes goals. Routes tasks by capability.
Does not generate code. Governs how generated code is processed.

**Engine** — The enforcer.
Runs locally on CPU. Validates, retries, simulates.
95% of routine work never touches cloud AI.
BitNet 1.58-bit. No GPU required.

**Control** — The gate.
GO, FIX, or BLOCK — every action gets a verdict.
Configurable policies. Full audit trail.

**Memory** — The record.
Semantic blocks. Content-addressable. Conflict-free replication.
State survives model updates, node restarts, and long pauses.

**Mesh** — The network.
Peer-to-peer. Encrypted. No central relay.
Your machines become one execution surface.

---

### 8. Why This Works

AI drifts. Structure doesn't.

MUSU doesn't make AI smarter.
It makes the system around AI stable.

The model proposes.
The structure decides.

---

### 9. What MUSU Is Not

Not a model. Not a prompt tool.
Not an agent framework. Not a cloud service.

It's the boundary layer above them.

---

### 10. For Engineers

If you're evaluating this, ask:

- How is intent enforced at runtime?
- What prevents stages from being skipped?
- What constitutes a deterministic verdict?
- How is project state reconstructed?
- What happens when the model misbehaves?

MUSU answers structurally, not rhetorically.

```
Rust core · MCP interface · QUIC + TLS 1.3
Block Store + pgvector · BitNet 1.58-bit · CRDT
```

---

### 11. Close

AI alone produces output.

MUSU produces systems.

---

## 구현 참고

### 현재 /architecture 페이지
- 기존 v5.1 아키텍처 콘텐츠가 있음 (`src/app/architecture/page.tsx`)
- 이 스펙으로 교체 필요

### v5.1 → v6.1 변경 요약

| 항목 | v5.1 (현재 페이지) | v6.1 (이 스펙) |
|------|-------------------|----------------|
| **프레임** | "Five layers. One operating system." | "Four structures. Five components." |
| **구조** | 5 레이어 카드만 | 4 구조 + 5 컴포넌트 + 매핑 |
| **라이프사이클** | 6단계 (→Distribute) | 5단계 (→Maintain) + RunPhase |
| **인텐트** | 없음 | Section 2 (scope, constraints, hash tracking) |
| **피드백 루프** | 없음 | Section 6 (3소스 → Planner) |
| **검증** | "intent zones" 한 줄 | Section 4 (파이프라인 + 시뮬레이션) |
| **톤** | 기술 나열 | v6.1 톤 (짧은 문장, 구체 동사) |

### 시각 구현 가이드

| 섹션 | 시각 요소 |
|------|----------|
| 1. The Map | 좌→우 매핑 다이어그램, 컬러 코딩 (prime/engine/control/memory/mesh) |
| 2. Intent | scope/constraints/criteria 3칸 카드 |
| 3. Lifecycle | 수직 상태 머신 (INTAKE→FINALIZED), 화살표 + 게이트 아이콘 |
| 4. Validation | 수평 파이프라인 (Draft→Verdict), GO/FIX/BLOCK 컬러 |
| 5. State | 블록 체인 시각 (parent→child), 검색 아이콘 |
| 6. The Loop | 순환 다이어그램 |
| 7. The Five | 5개 카드 (현재 페이지와 유사하되 카피 교체) |

### 기술 키워드 (이 페이지에서만 허용)
- Rust, BitNet 1.58-bit, CRDT, QUIC, TLS 1.3, pgvector, MCP

---

## 관련 문서

- [website-copy-draft.md](website-copy-draft.md) — v6.1 랜딩 카피 (이 페이지의 상위 계층)
- [information-architecture.md](information-architecture.md) — L1/L2/L3 계층 모델
- [intent-lifecycle.md](intent-lifecycle.md) — Intent & Lifecycle 아키텍처 상세
- [p15-prime-system.md](p15-prime-system.md) — Prime System 상세
- [block-chain-chunking.md](block-chain-chunking.md) — Block Store 상세
- [rag-enable.md](rag-enable.md) — RAG 상세
- [system-data-flow.md](system-data-flow.md) — 전체 데이터 플로우
- [architecture-review.md](architecture-review.md) — 문서 세트 리뷰
