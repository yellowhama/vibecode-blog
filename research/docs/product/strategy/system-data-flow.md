# MUSU 시스템 데이터 플로우 — 교차 연결 문서

> 최종 업데이트: 2026-02-20
> 이 문서는 [P15 Prime System](p15-prime-system.md), [Block Chain Chunking](block-chain-chunking.md), [RAG Enable](rag-enable.md) 세 문서를 관통하는 **전체 데이터 흐름**을 정의한다.

---

## 왜 이 문서가 필요한가

세 아키텍처 문서는 각자 완결적이지만, **시스템을 관통하는 흐름**은 어디에도 없었다.

- P15는 "Think → Simulate → Act"를 설명하지만, 실행 결과가 어디에 저장되는지 안 다룬다.
- Block Chain Chunking은 블록 저장을 설명하지만, 누가 블록을 소비하는지 안 다룬다.
- RAG는 벡터 검색을 설명하지만, Block Store의 TF-IDF와 어떻게 공존하는지 안 다룬다.

이 문서가 그 간극을 메운다.

---

## 전체 데이터 플로우

```
사용자 자연어 목표
    ↓
┌──────────────────────────────────────────────────────┐
│  ⓪ INTENT + LIFECYCLE (상세: intent-lifecycle.md)     │
│  IntentInterpreter → ParsedIntent → RunPhase 게이트  │
│                                                      │
│  ✅ 파싱/저장  ❌ 런타임 강제  ❌ 미션 연결            │
└──────────────────────┬───────────────────────────────┘
                       ↓ 구조화된 목표 + 인텐트
┌──────────────────────────────────────────────────────┐
│  ①~④ P15 PIPELINE (상세: p15-prime-system.md)        │
│  Planner → HiveMind → TimeStone → IronMan            │
└──────────────────────┬───────────────────────────────┘
                       ↓ 실행 결과
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌─────────────────┐      ┌─────────────────────┐
│ ⑤ BLOCK STORE   │      │ ⑥ KNOWLEDGE + RAG   │
│ (.vibe/blocks/) │      │ (PostgreSQL)         │
│                 │      │                      │
│ 실행 아티팩트    │      │ 지식 포스트           │
│ 코드 분석, 스캔  │      │ 문제 해결 기록        │
│ 검증 로그        │      │ 패턴, 인사이트        │
│                 │      │                      │
│ 검색: TF-IDF    │      │ 검색: Hybrid          │
│ (구조적 추적)    │      │ (시맨틱 + 키워드)     │
└────────┬────────┘      └──────────┬────────────┘
         │                          │
         └──────────┬───────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  ⑦ CONTEXT ASSEMBLY (상세: 아래)                      │
│  세 소스 쿼리 → 토큰 예산 내 조립 → Planner 주입     │
└──────────────────────┬───────────────────────────────┘
                       ↓
                  ① 로 순환
```

이 문서의 핵심은 **⓪→① 인텐트 주입**, **④→⑤⑥ 저장 분기**, **⑦→① 순환** — Intent/Lifecycle(⓪)은 [intent-lifecycle.md](intent-lifecycle.md), P15 내부(①~④)는 [p15-prime-system.md](p15-prime-system.md) 참조.

---

## 연결 지점 상세

### P15 → Block Store: 실행 결과가 블록이 되는 경로

```
Iron Man/Holodeck 실행 완료
    ↓
Scout Runner (파일 변경 감지)
    ↓
Chunking Pipeline: buildChunks()
    → 의미 경계 감지 (Markdown #, Code fn/class)
    → 프로파일 분류 (extraction/reasoning/reference)
    ↓
ChainManager.createChain()
    → SemanticBlock[] 생성 (blk_<sha256>)
    → parent_hash/root_hash 링크
    ↓
BlockStore.put()
    → .vibe/blocks/ (신규)
    → .vibe/runs/<run_id>/chunks/ (레거시, 이중 기록)
    ↓
Signal Bus: block.created, block.chained 이벤트
```

**핵심**: P15의 실행 결과는 **Scout Runner가 파일 변경을 감지**하면서 자동으로 Block Store에 유입된다. P15가 직접 블록을 쓰는 게 아니라, 파일 시스템 변경을 매개로 한 **간접 연결**이다.

> 이 경로의 상세 파이프라인(✅/⬚ 구현 상태 포함)은 [block-chain-chunking.md의 추론 파이프라인](block-chain-chunking.md#추론-파이프라인)에서 다룬다. 여기서는 P15와의 연결 지점만 기술한다.

### Block Store ↔ RAG: TF-IDF vs pgvector 관계

이 둘은 **의도적으로 분리된 두 개의 검색 경로**다.

| 구분 | Block Store (TF-IDF) | RAG (pgvector) |
|------|---------------------|----------------|
| **저장소** | `.vibe/blocks/` (파일시스템) | `knowledge_embeddings` (PostgreSQL) |
| **대상** | 코드, 로그, 문서 — **실행 아티팩트** | 문제 해결 기록, 인사이트 — **지식 포스트** |
| **인덱싱** | 자동 (Scout Runner 감지) | 자동 (submit 시 tokio::spawn) |
| **검색 방식** | TF-IDF (로컬, 외부 의존 없음) | Hybrid: Dense(벡터) + Sparse(키워드) |
| **임베딩** | 불필요 (키워드 기반) | StubProvider(SHA-256) → 향후 ML 모델 |
| **스케일** | 레포 단위 (로컬 파일) | 서버 단위 (PostgreSQL) |
| **용도** | "이 코드 블록의 조상은?" — **구조적 추적** | "비슷한 문제 해결한 기록?" — **시맨틱 검색** |

**통합 계획**: 현재는 **3번(분리 유지)을 기본 방침**으로 한다. 실행 아티팩트(Block Store)와 지식(RAG)은 수명 주기가 다르기 때문이다 — 블록은 코드 변경마다 재생성되지만, 지식 포스트는 장기 축적된다.

향후 로드맵 P2에서 1번을 시도할 예정:
1. **P2 예정**: Block Store의 시맨틱 블록을 RAG에도 인덱싱 → 코드 블록의 벡터 검색 가능
2. **검토 중**: RAG 검색 결과에 Block Store 조상 추적 결합 → 출처 증명
3. **현재 기본**: 의도적 분리 유지

### ⑦ Context Assembly: 세 소스 → Planner 주입

Context Assembly는 다음 미션을 시작하기 전에 **세 가지 소스에서 관련 정보를 모아 Planner에 주입**하는 단계다.

```
P15 Planner: 새 미션 목표 수신
    ↓
Context Assembly 단계:
    ├→ ① Block Store 쿼리 (TF-IDF)
    │     관련 코드 블록 + getAncestors() 조상 체인
    │     → "이 코드가 어디서 왔는지" 구조적 맥락
    │
    ├→ ② RAG 쿼리 (POST /v1/rag/search, Hybrid)
    │     유사 지식 포스트 (문제 해결 기록, 패턴)
    │     → "비슷한 문제를 과거에 어떻게 풀었는지"
    │
    └→ ③ 미션 히스토리 (missions 테이블)
          이전 미션 결과 + 실패 기록
          → "직전에 뭘 시도했고 뭐가 안 됐는지"
    ↓
토큰 예산 내 조립 (소스별 우선순위로 트리밍)
    ↓
조립된 컨텍스트 → Planner의 Task[] 분해에 주입
    ↓
HiveMind: 컨텍스트 기반 병렬 추론
```

**제안된 소스 우선순위** (구현 시 적용 예정, 토큰 예산 초과 시 트리밍 순서):
1. 미션 히스토리 — 직전 실패를 반복하지 않기 위해 최우선
2. Block Store — 현재 코드 상태의 구조적 맥락
3. RAG — 유사 경험 (가장 먼저 트리밍됨)

**실행 주체**: Planner (`release/mvp_core_clinic/src/mcp/prime/planner.ts`)가 미션 목표를 받으면 Context Assembly를 트리거한다. HiveMind의 개별 워커에도 관련 지식이 프롬프트로 전달되어, "과거에 비슷한 문제를 어떻게 풀었는지"를 참조하면서 전략을 생성한다.

**구현 상태**: ⬚ **자동 조립 미구현** — 현재는 MCP 도구(`block_search`, `/v1/rag/search`)를 수동 호출하여 컨텍스트를 구성한다. Planner가 자동으로 세 소스를 쿼리하고 토큰 예산 내에서 조립하는 파이프라인은 향후 구현 예정.

---

## 권한 경계 (전 시스템 공통)

| 주체 | 코드베이스 (src/, docs/) | .vibe/** | PostgreSQL |
|------|:------------------------:|:--------:|:----------:|
| **Main Brain (Claude)** | 읽기+쓰기 | 읽기 전용 | — |
| **P15 Prime (Rust)** | — | — | 읽기+쓰기 |
| **MUSU Engine (BitNet)** | **읽기 전용** | **쓰기 전용** | — |
| **Iron Man (Rust)** | 화이트리스트만 | — | — |
| **RAG (Rust)** | — | — | 읽기+쓰기 |

**불변 규칙:**
- MUSU Engine은 `src/`, `docs/`를 **절대 변경하지 않음** — 읽기만
- `.vibe/**`에는 **MUSU Engine만 쓰기** — Main Brain은 읽기만
- Iron Man은 **Enum 화이트리스트 커맨드만** — 임의 쉘 실행 불가
- 모든 시스템 간 통신은 **localhost HTTP** — 외부 노출 없음

---

## 저장소 위상 (전 시스템)

### 파일시스템 (로컬, 레포 단위)

```
프로젝트 루트/
│
├── src/, docs/           ← Main Brain 영역 (Claude가 읽고 씀)
│
└── .vibe/                ← MUSU Engine 영역 (BitNet이 씀, Claude가 읽음)
    ├── blocks/           ← Block Store (시맨틱 블록, 체인)
    │   ├── index.json
    │   ├── ab/cdef...json
    │   └── chains/doc_xxx.json
    ├── runs/<run_id>/    ← 런 아티팩트 (레거시 호환)
    │   └── chunks/
    └── config/           ← 정책 (chunk_policy, block_policy)
```

### PostgreSQL (서버, Supabase)

```
PostgreSQL
├── ssot.missions              ← P15 미션 + 태스크 (Prime 읽기+쓰기)
├── knowledge_posts            ← 지식 포스트 (Prime 읽기+쓰기)
└── knowledge_embeddings       ← RAG 벡터 인덱스 (RAG 읽기+쓰기, pgvector)
```

**핵심 차이**: 파일시스템은 레포마다 독립 (`.vibe/`는 git에 포함되지 않음). PostgreSQL은 서버 단위로 공유되며 모든 레포의 지식이 축적된다.

---

## Dual-Write 졸업 조건

Block Store는 현재 `.vibe/blocks/` + `.vibe/runs/chunks/` 이중 기록 중.

**레거시 중단 조건** (세 가지 모두 충족 시):
1. Block Store 마이그레이션 완료: 기존 모든 `runs/chunks/`가 `blocks/`로 이전됨
2. 소비자 전환 완료: Block Store를 읽는 모든 코드가 `blocks/` 경로만 사용
3. 2주 관찰 기간: 이중 기록 비활성화 후 2주간 장애 없음

졸업 후 `WriteOptions.writeLegacyChunks = false`를 기본값으로 변경.

---

## Stub Embedding 졸업 조건

RAG의 StubEmbeddingProvider(SHA-256)는 **파이프라인 검증용**이지 프로덕션 시맨틱 검색이 아니다.

**현재 실질 동작:**
- Dense 검색: exact match에 가까움 (한 글자 차이 → 완전 다른 벡터)
- 실제 시맨틱 검색은 Sparse(ts_rank 키워드)에 의존
- "RAG 파이프라인 가동" 상태이지, "시맨틱 RAG 가동"은 아님

**졸업 조건:**
1. `EmbeddingProvider` 교체: `all-MiniLM-L6-v2` 또는 BitNet 기반 임베더
2. 기존 `knowledge_embeddings` 재인덱싱 (모델 교체 시 전체 벡터 재생성 필요)
3. Dense 검색 품질 테스트: 유사 쿼리 → 관련 결과 반환 검증

교체 시 API 변경 없음 — `EmbeddingProvider` 트레이트 구현체만 교체.

---

## 미구현 연결 (향후 작업)

| 우선순위 | 연결 | 현재 | 목표 | 왜 |
|:--------:|------|------|------|-----|
| **P1** | Stub → ML 임베더 | SHA-256 해시 | all-MiniLM-L6-v2 또는 BitNet | Dense 검색이 사실상 exact match — 시맨틱 검색 불가 |
| **P1** | MCP-Signal 어댑터 | 미구현 | Block 이벤트 → MCP 도구 노출 | Main Brain이 블록 변경을 실시간 감지 못함 — 폴링 필요 |
| **P2** | Context Assembly 자동화 | 수동 MCP 호출 | Planner 자동 쿼리 + 토큰 예산 조립 | ⑦→① 순환의 핵심인데 수동 — 자율 운영 불가 |
| **P2** | Block → RAG 크로스 인덱싱 | 분리 운영 | 블록을 RAG에도 벡터 인덱싱 | 코드 블록의 시맨틱 검색 불가 — TF-IDF만으로 한계 |
| **P3** | Block Store 스냅샷/복원 | 미구현 | 전체 블록 백업 + 복원 | 장애 시 블록 히스토리 복구 수단 없음 |
| **P3** | 멀티노드 QUIC 동기화 E2E | 미검증 | 2+ 물리 노드 테스트 | 분산 환경 신뢰성 미검증 — 단일 노드만 확인됨 |

---

## 관련 문서

- **[intent-lifecycle.md](intent-lifecycle.md) — ⓪ Intent Capture + Lifecycle Enforcement**
- [p15-prime-system.md](p15-prime-system.md) — ①②③④ Prime 파이프라인
- [block-chain-chunking.md](block-chain-chunking.md) — ⑤ Block Store + 청킹
- [rag-enable.md](rag-enable.md) — ⑥ RAG 벡터 검색
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — /architecture 페이지 스펙
