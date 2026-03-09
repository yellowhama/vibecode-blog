# MUSU 기술 팩트체크 — 사이트 콘텐츠 vs 실제 코드

> 검증일: 2026-02-20
> 검증 범위: `/mnt/f/Aisaak/Projects/Musu-new/src/` (Rust), `/mnt/f/Aisaak/Projects/Musu-new/work/` (워크 문서), `/mnt/f/Aisaak/Projects/HiveLink/` (HiveLink)
> 목적: musu.pro 사이트 콘텐츠의 기술적 정확성 검증

---

## 1. 검증 결과 요약

| 기술 | 사이트 주장 | 실제 상태 | 위치 | 판정 |
|------|------------|-----------|------|------|
| CRDT (4종) | 프로덕션 | 완전 구현, 65 테스트 | `musu-common/src/crdt/` | ✅ 정확 |
| GO/FIX/BLOCK 베딕 | API 전체 적용 | Signal enum, 전체 통합 | `musu-common/src/ai_native.rs` | ✅ 정확 |
| Gateway Protocol | 프로덕션 | 6개 엔드포인트 완전 구현 | `musu-prime/src/gateway/` | ✅ 정확 |
| QUIC Transport | 프로덕션 | quinn + rustls 완전 구현 | `musu-engine/src/sync/quic_*.rs` | ✅ 정확 |
| mDNS Discovery | MUSU 기능 | 구현됨 (Linux/macOS, Windows 폴백) | `musu-prime/src/hive/discovery.rs` | ✅ 정확 |
| BitNet b1.58 | CPU AI 엔진 | 외부 바이너리(bitnet.cpp) 래퍼 | `musu-engine/src/work/handlers.rs` | ⚠️ 부분 (래퍼) |
| **ChromaDB** | Memory 레이어 | **Rust에 없음. pgvector 사용** | `musu-prime/src/domain/knowledge_store.rs` | ❌ 불일치 |
| **NAT Traversal** | MUSU Mesh | **HiveLink에만 구현** | `hive_link/src/infrastructure/nat.rs` | ❌ 불일치 |
| **90+ OpCodes** | MUSU 스탯 | **104개, HiveLink 프로젝트** | `hive_link/src/domain/protocol.rs` | ❌ 불일치 |
| Pico Interceptors | Engine 기능 | 프로필 레지스트리만 존재 | `musu-prime/src/domain/interceptors.rs` | ⚠️ 부분 |

---

## 2. 상세 분석

### 2.1 ChromaDB → pgvector

**사이트 기존 주장**: "ChromaDB integration for semantic search"

**실제**:
- Rust 소스 전체에 ChromaDB 참조 **0건**
- `musu-prime/src/domain/knowledge_store.rs`에서 **PostgreSQL pgvector** 사용
- ChromaDB는 TypeScript 레거시 레이어(`.vibe/cache/chroma/chroma.sqlite3`)에만 존재
- 프로덕션 타겟은 Postgres + pgvector extension

**work 폴더 근거**:
- `work/active/block_chain_chunking_2026-02-06/` — Block Store + TF-IDF 벡터 인덱스 + pgvector
- `work/active/MUSU-027-rag-enable_2026-02-14/` — RAG 백엔드로 pgvector 확정
- KnowledgeStoreBackend 트레이트: SQLite(dev) / Postgres(prod)

**수정**: 사이트 전체에서 "ChromaDB" → "pgvector" 교체

### 2.2 NAT Traversal

**사이트 기존 주장**: MUSU Mesh의 기능으로 "NAT traversal"

**실제**:
- MUSU Rust 소스에 NAT 핸들링 코드 **0건**
- **HiveLink**에 완전 구현:
  - STUN: `discover_public_addr()` (Google STUN 서버)
  - UPnP: `map_udp_port_upnp()` (igd-next 크레이트)
  - 폴백: UPnP 실패 시 STUN 주소 사용
- MUSU의 Mesh는 **QUIC + mDNS**로 직접 연결, NAT traversal은 HiveLink가 제공

**수정**: "NAT traversal" → "HiveLink NAT traversal" 또는 제거. Mesh 설명에서 mDNS 강조.

### 2.3 OpCodes

**사이트 기존 주장**: "90+ OpCodes" (CpuAi 스탯)

**실제**:
- MUSU Rust 소스에 OpCode 구현 **0건**
- **HiveLink**에 **104개** OpCode 변형 구현 (`hive_link/src/domain/protocol.rs`)
- 카테고리: Auth, Work, Service, Window, Mouse/Keyboard, WebRTC, DNS, AI Jobs, File, NeuralFS, Audio, Terminal, Tunnel, Telemetry, Task, Mesh, Node, Swarm, Anomaly, Semantic, Utility

**수정**: "OpCodes 90+" → "HiveLink OpCodes 104"로 레이블 변경하여 프로젝트 귀속 명확화

### 2.4 BitNet 통합 방식

**사이트 주장**: "BitNet 1-bit CPU inference" (네이티브 엔진 느낌)

**실제**:
- BitNet은 **외부 바이너리**(bitnet.cpp / llama-cli)를 프로세스로 실행
- 모델: `BitNet-b1.58-2B-4T` (GGUF 포맷)
- 경로: `~/.vibe/cache/bitnet/BitNet-b1.58-2B-4T/ggml-model-i2_s.gguf`
- SwarmManager가 프로세스 라이프사이클 관리
- 결과: evidence JSON으로 `.../evidence/bitnet/`에 저장

**판정**: 기능적으로 정확하지만 "네이티브 Rust 추론"이 아닌 "외부 프로세스 래핑". 현재 사이트 문구는 허용 범위.

### 2.5 Pico Interceptors

**사이트 주장**: "Pico interceptors" (Engine 레이어)

**실제**:
- `musu-prime/src/domain/interceptors.rs`에 InterceptorProfile enum 존재
- 7개 프로필: Scout, Build, Test, Lint, Risk, Replay, Generic
- WeightGrade 시스템: Gold/Silver/Bronze/Unknown
- 실제 샌드박스 실행은 별도 `musu-interceptor` 바이너리 크레이트
- 완전한 실행 엔진이라기보다는 **라우팅 + 프로필 레지스트리**

**판정**: 부분 구현. 사이트 문구 "Pico interceptors"는 유지 가능하나 과장 주의.

---

## 3. 실제 아키텍처 (work 폴더 기반)

### 4-레이어 스택 (코드 기반 실체)

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Main Brain (Claude/OpenCode/External LLM)          │
│ 역할: 의사결정 + 코드 생성 (mutation 권한)                    │
│ 인터페이스: MCP 도구 (vibe_pm.create_work_order 등)           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/IPC
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 3: Vibe PM Hub (TypeScript MCP Server)                │
│ 역할: 오케스트레이션, 도구 디스패치, 결과 집계                  │
│ 기능: Block store, chunking, vector index, Pico tools        │
│ 상태: .vibe/config/, .vibe/cache/bitnet/, .vibe/blocks/      │
└──────────────────────┬──────────────────────────────────────┘
                       │ QUIC (primary) / HTTP (fallback)
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 2: Musu Prime (Rust control plane)                    │
│ 역할: 태스크 분배, 워커 오케스트레이션, 게이트 판정              │
│ 권한: 워크 상태의 단일 작성자 (Single Writer)                  │
│ API: /v1/work, /v1/status, /v1/prime/**, /v1/gateway/**     │
│ 트랜스포트: 8791/TCP (HTTP), 9791/UDP (QUIC)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 1: Musu Workers (Rust data plane)                     │
│ 역할: 태스크 실행, 증거 생산, 스웜 스케일링                     │
│ BitNet.cpp: 코어 추론 엔진 (외부 프로세스)                     │
│ Bee: 시맨틱 스캐닝 (grep, sanity check, doc draft)           │
│ Ant: 검증 & 시그널 생성                                       │
│ 기능: SwarmManager, BlockStoreReader, SignalBus              │
└──────────────────────────────────────────────────────────────┘
```

### 핵심 설계 원칙

1. **Main Brain = 결정자, MUSU = 실행자**: MUSU는 코드를 쓰지 않고, 증거(evidence)를 생산
2. **쓰기 경계**: MUSU는 `.vibe/**`에만 쓸 수 있음
3. **Pull 모델**: 워커가 Prime에서 태스크를 가져감 (push 아님)
4. **Postgres SSOT**: 분산 상태의 단일 진실 소스는 Postgres (CRDT는 로컬 상태용)

---

## 4. 프로젝트 경계: MUSU vs HiveLink

| 기능 | MUSU | HiveLink |
|------|------|----------|
| QUIC Transport | ✅ (quinn) | ✅ (자체 구현) |
| mDNS Discovery | ✅ | ✅ |
| NAT Traversal | ❌ | ✅ (STUN + UPnP) |
| OpCodes | ❌ | ✅ (104개) |
| BitNet Inference | ✅ (외부 프로세스) | ❌ |
| CRDT | ✅ (4종) | ❌ |
| Gateway Protocol | ✅ (6 엔드포인트) | ❌ |
| GO/FIX/BLOCK | ✅ | ❌ |
| Block Store | ✅ (Rust reader + TS writer) | ❌ |
| Swarm Scaling | ✅ (Dynamic 5-100) | ❌ |
| pgvector Search | ✅ | ❌ |

---

## 5. 테스트 커버리지 (실측)

| 프로젝트 | 영역 | 테스트 수 | 비고 |
|----------|------|-----------|------|
| MUSU | Rust (전체) | 849 | musu-prime 121, workspace 838 |
| MUSU | TypeScript | 5,411 | mvp_core_clinic 기준 |
| HiveLink | Rust | 별도 | OpCodes, NAT 등 |

**사이트 스탯 vs 실측**:
- "849 Rust Tests" → ✅ 정확
- "5,654 TS Tests" → 실측 5,411 (차이 243, 추가 테스트 포함 가능)
- "40,000+ Rust LOC" → 미검증 (추정 정확)
- "90+ OpCodes" → ❌ HiveLink의 104개 (수정함)

---

## 6. 사이트 수정 내역

### 수정된 파일

| 파일 | 변경 | 이유 |
|------|------|------|
| `LifecycleSection.tsx` | ChromaDB → pgvector | Rust에 ChromaDB 없음 |
| `LifecycleSection.tsx` | "QUIC + TLS 1.3 with NAT traversal" → "QUIC + TLS 1.3 encrypted transport" | NAT은 HiveLink |
| `CpuAiSection.tsx` | "OpCodes 90+" → "HiveLink OpCodes 104" | 프로젝트 귀속 명확화 |
| `ArchitectureSection.tsx` (랜딩) | Mesh: "NAT traversal" → "mDNS discovery" | 정확한 MUSU 기능 |
| `architecture/page.tsx` | Memory: ChromaDB → pgvector (3곳) | 실제 백엔드 |
| `architecture/page.tsx` | Mesh: "NAT traversal" → "NAT traversal via HiveLink" | 귀속 명확화 |
| `architecture/page.tsx` | Tech Stack: "CRDT + ChromaDB" → "CRDT + pgvector" | 실제 백엔드 |
| `architecture/page.tsx` | Lifecycle mapping: ChromaDB/NAT 수정 | 정합성 |

---

## 7. 향후 확인 필요

1. **TS 테스트 수**: 사이트 5,654 vs 실측 5,411 → 최신 카운트 확인 필요
2. **Rust LOC**: `tokei` 등으로 정확한 수치 확인
3. **Pico 실행 엔진**: `musu-interceptor` 크레이트 독립 검증 필요
4. **BitNet 모델**: 현재 2B-4T 모델만 확인, 다른 모델 지원 범위 확인
