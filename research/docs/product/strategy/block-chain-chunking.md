# Block Chain Chunking — 아키텍처 현황 보고

> 최종 업데이트: 2026-02-20
> 소스 위치: `/mnt/f/Aisaak/Projects/Musu-new/`
> 스펙 위치: `work/active/block_chain_chunking_2026-02-06/`
> 상태: **구현 완료 (282+ 테스트)**

---

## 한줄 요약

문서를 토큰 단위로 자르는 대신, **의미 단위 블록으로 분해하고 부모-자식 체인으로 연결**하는 콘텐츠 관리 아키텍처. 블록체인 기술이 아니라 "블록의 체인" — 의미의 계보를 보존한다.

---

## 해결하는 문제

업계 표준 RAG(LangChain, LlamaIndex 등)는 문서를 500토큰씩 잘라서 AI에 넣는다. 이러면:
- AI가 이게 서론인지 결론인지 반론인지 모름
- 컨텍스트가 런 단위로 사라짐 (재사용 불가)
- 같은 문서를 매번 다시 처리

Block Chain Chunking은:
- **의미 경계**에서 분할 (마크다운 헤더, 코드 함수 선언, 로그 타임스탬프)
- **부모-자식 링크**로 문서 위상(topology) 보존
- **콘텐츠 주소 지정** (SHA256) — 같은 내용 = 같은 ID (중복 제거 + 캐싱)
- **레포 전역 블록 스토어** — 런 간 재사용 가능한 자산

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────┐
│         Main Brain (Claude/LLM)         │
│    결정, 변경, CLI — MCP를 통해 접근    │
└──────────────────┬──────────────────────┘
                   │ MCP Interface (쓰기↓ 읽기↑)
┌──────────────────▼──────────────────────┐
│       MUSU Engine (BitNet + Swarm)      │
│    스캐닝, 청킹, 에비던스 생성          │
├─────────────────────────────────────────┤
│  Chunking Pipeline (TS)                 │
│  → 의미 경계 감지 → 프로파일 분할      │
│  → 토큰 추정 + 윈도잉                  │
│           ↓                             │
│  Block Store (.vibe/blocks/)            │
│  → 콘텐츠 주소 지정 (SHA256)            │
│  → 체인 링크 (parent_hash, root_hash)   │
│  → 레거시 청크 이중 기록                │
│           ↓                             │
│  Swarm Manager (Rust)                   │
│  → BitNet 프로세스 라이프사이클         │
│  → S0(Dormant)→S1(Warm)→S2(Active)     │
│  → 오토스케일링 (Bee/Ant/Balanced)      │
└─────────────────────────────────────────┘
```

---

## 핵심 데이터 타입

### SemanticBlock

```typescript
interface SemanticBlock {
  schema_version: "semantic_block.v1";
  block_id: string;           // blk_<sha256_16>
  parent_hash: string | null; // 이전 블록 링크
  root_hash: string;          // 문서 루트 (doc_<hash>)
  content: string;
  block_type: BlockType;      // 아래 매핑 표 참조
  source_ref: string;         // "file:line_start-line_end"
  token_estimate: number;
  created_at: number;
  metadata?: Record<string, unknown>;
}
```

**BlockType → 청킹 프로파일 매핑:**

| BlockType | 청킹 프로파일 | 경계 감지 방식 |
|-----------|:------------:|---------------|
| `code` | reasoning | `fn/class/struct/impl` 선언 |
| `reasoning` | reasoning | 분석 구조 (헤더, 결론) |
| `doc` | reference | Markdown `#` 헤더 |
| `reference` | reference | Markdown `#` 헤더 |
| `log` | extraction | 타임스탬프 패턴 |
| `extraction` | extraction | 데이터 경계 (JSON, CSV) |

### BlockChain

```typescript
interface BlockChain {
  schema_version: "block_chain.v1";
  root_hash: string;
  source_path: string;
  blocks: Array<{ block_id: string; seq: number }>;
  created_at: number;
  updated_at: number;
}
```

---

## 컴포넌트별 구현 현황

### 1. Chunking Pipeline (TypeScript)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/chunking/chunking.ts` |
| **알고리즘** | 토큰 추정 → 경계 감지 → 세그먼트 분할 → 윈도우 스플릿 → 소청크 병합 |
| **경계 감지** | Markdown: `#` 헤더, Code: `fn/class/struct/impl`, Logs: 타임스탬프 |
| **프로파일** | extraction(로그/데이터), reasoning(코드/분석), reference(문서/스펙) |
| **정책** | `.vibe/config/chunk_policy.v1.json` (min/max 토큰, overlap ratio) |
| **상태** | ✅ 구현 완료 |

### 2. Block Store (TypeScript + Rust)

| 항목 | 내용 |
|------|------|
| **TS 위치** | `release/mvp_core_clinic/src/mcp/blocks/` |
| **Rust 위치** | `src/crates/musu-common/src/block_types.rs` (타입) + `musu-node-bridge/src/block_writer.rs` (I/O) |
| **저장소** | `.vibe/blocks/` (해시 프리픽스 디렉토리) |
| **ID 생성** | `SHA256(content + sourceRef).slice(0,16)` → `blk_` 프리픽스 |
| **이중 기록** | `.vibe/blocks/` (신규) + `.vibe/runs/<run_id>/chunks/` (레거시 호환) |
| **상태** | ✅ 구현 완료 |

**TS 모듈 구성:**
- `store.ts` — BlockStore CRUD + 인덱싱
- `chain.ts` — ChainManager (부모-자식 링크 관리)
- `hasher.ts` — 콘텐츠 주소 해시
- `vector.ts` — TF-IDF 시맨틱 검색
- `policy.ts` — 블록 정책 로드/저장
- `migration.ts` — 레거시 청크 → Block Store 마이그레이션

### 3. Swarm Manager — 블록 생성 워크로드 처리 (Rust)

Block Store의 청킹/스캐닝 워크로드를 BitNet 인스턴스가 처리한다. Swarm Manager가 이 인스턴스의 라이프사이클을 관리.

| 항목 | 내용 |
|------|------|
| **위치** | `src/crates/musu-engine/src/swarm/` |
| **블록 관련 역할** | Scout Runner가 파일 변경 감지 → Swarm에 스캔 작업 제출 → 결과가 Block Store에 저장 |
| **상태 머신** | S0(Dormant, CPU 0%) → S1(Warm, 모델 로드) → S2(Active, 처리 중) |
| **스케일링 모드** | Bee(개발), Ant(간헐), Balanced(적응), AlwaysHot(전용 서버) |
| **오토스케일러** | 큐 깊이 모니터링 → WarmUp/CoolDown/Hold/Queue 결정 |
| **테스트** | 36개 |
| **상태** | ✅ 구현 완료 |

> Swarm Manager의 전체 아키텍처(EnginePool, Inference Relay 등)는 [p15-prime-system.md](p15-prime-system.md)의 BitNet 인퍼런서 섹션에서 다룬다.

### 4. Vector Search (TypeScript)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/blocks/vector.ts` |
| **방식** | TF-IDF (로컬, 외부 ML 모델 불필요) |
| **용도** | 유사 블록 검색 → 컨텍스트 조립 |
| **테스트** | 35개 |
| **상태** | ✅ 구현 완료 |

---

## 추론 파이프라인

```
✅ 구현됨                              ⬚ 미구현
──────────                             ──────────

Input Document                          ✅
    ↓
Preprocess (airlock → router)           ✅
    ↓
buildChunks() → ChunkData[]            ✅ (chunking.ts)
    ↓
ChainManager.createChain()             ✅ (chain.ts)
    ↓
SemanticBlock[] → BlockStore.put()     ✅ (store.ts)
    ↓
.vibe/blocks/ (+ .vibe/runs/ 호환)     ✅ (이중 기록)
    ↓
Signal Bus → block.created 이벤트      ✅ (events)
    ↓
─ ─ ─ ─ ─ ─ 여기서부터 소비자 ─ ─ ─ ─ ─ ─
    ↓
getAncestors(blockId)                  ✅ (chain.ts)
    ↓
Vector Search (TF-IDF 유사 블록)       ✅ (vector.ts)
    ↓
Context Assembly (조상 + 유사 블록)     ⬚ 자동 조립 미구현, 수동 MCP 호출
    ↓
LLM Inference (출처 추적 가능)          ⬚ P15 Planner 자동 주입 미구현
```

> Context Assembly → Planner 자동 주입 경로는 [system-data-flow.md](system-data-flow.md)에서 다룬다.

---

## Main Brain ↔ MUSU 경계

| | Main Brain (Claude) | MUSU (BitNet/Swarm) |
|---|---|---|
| **역할** | 결정, 변경 | 스캐닝, 청킹, 에비던스 생성 |
| **코드베이스** | 읽기+쓰기 | **읽기 전용** |
| **`.vibe/**`** | 읽기 전용 | **쓰기 전용** |
| **src/, docs/** | 직접 변경 | 절대 변경 안 함 |

---

## 테스트 커버리지

| 컴포넌트 | TS 테스트 | Rust 테스트 | 상태 |
|----------|:---------:|:----------:|:----:|
| Hasher | 22 | — | ✅ |
| Store | 26 | 12 | ✅ |
| Policy | 14 | — | ✅ |
| Chain | 24 | — | ✅ |
| Migration | 17 | — | ✅ |
| Integration | 13 | — | ✅ |
| Vector | 35 | — | ✅ |
| GC | 19 | — | ✅ |
| Events | 25 | — | ✅ |
| Swarm | — | 36 | ✅ |
| SignalBus | — | 11 | ✅ |
| BlockStoreWriter | — | 16 | ✅ |
| WarmResidentPool | — | 12 | ✅ |
| **합계** | **195** | **87** | **282** |

---

## 설계 원칙

1. **콘텐츠 주소 지정**: 같은 내용 + 같은 위치 = 같은 ID → 중복 제거, 캐싱
2. **의미 체인 링크**: parent_hash(직전 블록) + root_hash(문서 루트) → 변경 전파, 버전 추적
3. **증분 업데이트**: 문서 변경 시 영향받는 블록만 재생성, 나머지는 ID 유지
4. **이중 기록 호환**: 신규 Block Store + 레거시 runs/ 동시 기록 (WriteOptions로 제어). 졸업 조건은 [system-data-flow.md](system-data-flow.md#dual-write-졸업-조건) 참조.

---

## 알려진 제한사항

| # | 항목 | 심각도 |
|---|------|--------|
| 1 | BitNet.cpp E2E 통합 미완 | 🟡 |
| 2 | MCP-Signal 어댑터 미구현 | 🟡 |
| 3 | 스냅샷/복원 (전체 Block Store 백업) 미구현 | 🟡 |
| 4 | 분산 멀티노드 클러스터링 미구현 | 🟡 |

---

## 소스 위치 맵

```
Musu-new/
├── release/mvp_core_clinic/src/
│   ├── mcp/blocks/           ← Block Store (TS)
│   │   ├── store.ts, chain.ts, hasher.ts
│   │   ├── vector.ts, policy.ts, migration.ts
│   │   └── types.ts
│   ├── mcp/chunking/
│   │   └── chunking.ts       ← 청킹 알고리즘
│   ├── mcp/runtime/
│   │   └── musu_adapter.ts   ← BitNet HTTP 어댑터
│   └── tier/
│       └── scout_runner.ts   ← 파일 변경 감지 + 스캔
│
├── src/crates/
│   ├── musu-common/src/
│   │   └── block_types.rs    ← 블록 타입 (Rust)
│   ├── musu-engine/src/swarm/
│   │   ├── manager.rs        ← Swarm Manager
│   │   ├── process.rs        ← BitNet 프로세스
│   │   └── systemd_generator.rs
│   └── musu-node-bridge/src/
│       └── block_writer.rs   ← 블록 I/O (Rust)
│
└── work/active/
    └── block_chain_chunking_2026-02-06/  ← 설계 스펙 (12개 문서)
```

---

## 관련 문서

- **[system-data-flow.md](system-data-flow.md) — Block Store와 RAG의 관계, TF-IDF vs pgvector 비교**
- [p15-prime-system.md](p15-prime-system.md) — Prime System (Think→Simulate→Act)
- [rag-enable.md](rag-enable.md) — MUSU-027 RAG 활성화 (pgvector)
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — /architecture 페이지 스펙
