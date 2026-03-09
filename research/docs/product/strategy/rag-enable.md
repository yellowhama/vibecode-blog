# MUSU-027 RAG Enable — 아키텍처 현황 보고

> 최종 업데이트: 2026-02-20
> 소스 위치: `/mnt/f/Aisaak/Projects/Musu-new/`
> 스펙 위치: `work/active/MUSU-027-rag-enable_2026-02-14/`
> 상태: **구현 완료 (pgvector + Hybrid Search)**

---

## 한줄 요약

Knowledge 제출 시 자동으로 벡터 인덱싱하고, Dense(벡터) + Sparse(키워드) 하이브리드 검색을 제공하는 RAG 시스템. **현재는 스텁 임베딩(SHA-256)으로 파이프라인만 가동 중 — 시맨틱 검색은 ML 임베더 교체 후 작동 예정.** 실질 검색은 Sparse(키워드)에 의존.

---

## 해결하는 문제

기존 Knowledge 시스템(`/v1/knowledge/submit`)은:
- 포스트를 DB에 저장만 함
- `/v1/rag/search` 호출 시 `rag_not_configured` 에러 반환
- 검색 = 키워드 ILIKE 뿐, 시맨틱 검색 없음

MUSU-027 이후:
- 제출 즉시 **자동 벡터 인덱싱** (비동기, 논블로킹)
- **3가지 검색 전략**: Dense(벡터), Sparse(키워드), Hybrid(60/40 혼합)
- 서버 시작 시 최근 200개 포스트 **백필** (즉시 검색 가능)

---

## 시스템 아키텍처

```
POST /v1/knowledge/submit
    ↓
DB 저장 (knowledge_posts)
    ↓ tokio::spawn (비동기, 논블로킹)
┌───────────────────────────────────┐
│  Text Chunking (512 chars)        │
│  → title + summary + problem_sig  │
│  → 공백 경계 분할                 │
│           ↓                       │
│  Embedding Provider               │
│  → StubEmbeddingProvider (SHA256) │
│  → 384차원 벡터, L2 정규화       │
│           ↓                       │
│  PgRagStore.index_post()          │
│  → knowledge_embeddings 테이블    │
│  → pgvector vector(384)           │
└───────────────────────────────────┘

POST /v1/rag/search
    ↓
┌───────────────────────────────────┐
│  Strategy 선택                    │
│  ├→ DenseOnly:  pgvector <=>     │
│  ├→ SparseOnly: ts_rank()        │
│  └→ Hybrid:     0.6×dense +      │
│                  0.4×sparse       │
│           ↓                       │
│  Results: post_id, chunk_text,    │
│           scores, metadata        │
└───────────────────────────────────┘
```

---

## Trait 아키텍처 (도메인 레이어)

### RagStoreBackend

```rust
// 위치: src/crates/musu-prime/src/domain/rag_store.rs
trait RagStoreBackend {
    fn index_post()            // 청크 + 임베딩 + 저장
    fn search()                // 벡터 유사도 검색
    fn delete_post_embeddings() // 포스트 삭제 시 정리
    fn count_embeddings()      // 모니터링
}
```

### EmbeddingProvider

```rust
// 위치: src/crates/musu-prime/src/domain/embedding.rs
trait EmbeddingProvider {
    fn embed()       // 단일 텍스트 → 벡터
    fn embed_batch() // 배치 처리
    fn model_name()  // 식별자
    fn dimension()   // 384 (all-MiniLM-L6-v2 호환)
}
```

### StubEmbeddingProvider (현재 구현)

| 항목 | 내용 |
|------|------|
| **방식** | SHA-256 해시 → 384차원 벡터 |
| **특성** | 결정론적 (같은 입력 → 같은 벡터), L2 정규화 |
| **교체 계획** | all-MiniLM-L6-v2 또는 BitNet 기반 임베더 |

**한계 (정직하게):**
- SHA-256은 한 글자만 달라도 **완전히 다른 벡터**를 생성한다. 시맨틱 유사도가 아님.
- Dense 검색(pgvector `<=>`)은 사실상 **exact match에 가깝다.** "비슷한 글"은 못 찾는다.
- 현재 실질적으로 **Sparse(ts_rank 키워드) 검색에 의존**하는 상태.
- 따라서 현재는 **"RAG 파이프라인 가동"이지 "시맨틱 RAG 가동"은 아니다.**
- 졸업 조건: [system-data-flow.md](system-data-flow.md#stub-embedding-졸업-조건) 참조.

---

## DB 스키마 (pgvector)

```sql
-- 마이그레이션: 002_pgvector_rag.sql (멱등, 자동 실행)

knowledge_embeddings:
  embedding_id    PK
  post_id         FK → knowledge_posts
  chunk_index     정수 (포스트 내 위치)
  chunk_text      텍스트
  embedding       vector(384)  -- pgvector 타입
  model_name      텍스트 (e.g., "stub-sha256")

인덱스:
  idx_ke_post_id    → 빠른 포스트 조회
  idx_kp_search_tsv → 풀텍스트 검색 (GIN)
```

---

## 런타임 와이어링

### 서버 시작 시퀀스 (`start_prime_server`)

```
1. Feature 확인: cfg!(feature = "postgres") && MUSU_RAG_ENABLED=1 && DATABASE_URL 존재?
   → No: 경고 로그, RAG = None (크래시 안 함)
   → Yes: 계속

2. PgPool 생성: 5 커넥션, 5초 타임아웃

3. 마이그레이션 실행: 002_pgvector_rag.sql (멱등)

4. 상태 와이어링:
   state.rag_store  = Arc<RwLock<Option<Arc<dyn RagStoreBackend>>>>
   state.embedder   = Arc<RwLock<Option<Arc<dyn EmbeddingProvider>>>>

5. 백필: 최근 200개 포스트 비동기 인덱싱 (MUSU_RAG_BACKFILL_LIMIT)
```

### 지식 제출 시 자동 인덱싱

```rust
// knowledge.rs:236-247
// DB 저장 후 즉시 tokio::spawn()
// → 제출 API 응답을 절대 블로킹하지 않음
// → 실패 시 로그만 남기고 무시 (graceful degradation)
```

---

## 빌드 & 배포

### Feature Gate

```toml
# Cargo.toml
[features]
postgres = ["dep:sqlx", "dep:pgvector"]
```

```dockerfile
# Containerfile.musu
ARG MUSU_CARGO_FEATURES=""
RUN if [ -n "$MUSU_CARGO_FEATURES" ]; then \
      cargo build --release --features "$MUSU_CARGO_FEATURES"; \
    fi
```

### 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|------|:----:|--------|------|
| `MUSU_RAG_ENABLED` | RAG 사용 시 | `0` | `1`로 설정 시 RAG 활성화 |
| `DATABASE_URL` | RAG 사용 시 | — | PostgreSQL 연결 문자열 |
| `MUSU_RAG_BACKFILL_LIMIT` | 아니오 | `200` | 시작 시 인덱싱할 최근 포스트 수 |

### 검증 체크리스트

1. **빌드**: `strings /app/musu | grep pgvector` → 존재 확인
2. **배포**: Pod에 `MUSU_RAG_ENABLED=1` + `DATABASE_URL` 존재
3. **기능**: `/v1/knowledge/submit` → `/v1/rag/search` → HTTP 200 + `ok: true` + results 비어있지 않음

---

## 검색 전략

| 전략 | 방식 | 용도 |
|------|------|------|
| **DenseOnly** | pgvector `<=>` (코사인 거리) | ⬚ Stub 환경에서는 exact match에 가까움. ML 임베더 교체 후 시맨틱 검색으로 전환 |
| **SparseOnly** | PostgreSQL `ts_rank()` | ✅ 현재 유일하게 실질적인 검색 경로 |
| **Hybrid** (기본값) | 60% Dense + 40% Sparse | 기본값으로 유지 — 아래 설계 결정 #6 참조 |

---

## 설계 결정

1. **결정론적 스텁 임베딩 먼저**: ML 인프라 없이 파이프라인 가동 → 나중에 모델 교체 (API 변경 없음)
2. **논블로킹 인덱싱**: `tokio::spawn()` — 제출 API 절대 실패 안 함
3. **Feature Gate**: `--features postgres` 없으면 RAG 코드 컴파일조차 안 됨 (런타임 페널티 0)
4. **Hybrid 기본값**: 시맨틱 + 키워드 혼합으로 안전한 기본 동작
5. **백필 전략**: 시작 시 최근 N개 인덱싱 → 즉시 검색 가능
6. **Stub에서도 Hybrid 기본값 유지**: 현재 Dense 60%는 사실상 노이즈이지만, ML 임베더 교체 시 설정 변경 없이 즉시 시맨틱 검색이 활성화되도록 의도적으로 유지. Sparse 40%만으로도 키워드 검색은 정상 동작.

---

## 테스트 커버리지

| 컴포넌트 | 테스트 | 비고 |
|----------|:------:|------|
| `embedding.rs` (StubProvider) | 4 | 결정론성, 차원, 정규화, 배치 |
| `pg_rag_store.rs` (인덱싱/검색) | 8 | 청킹, 3개 전략 검색, 삭제, 마이그레이션 |
| `rag.rs` (API 라우트) | 5 | 인증, store 없음, embedder 없음, 정상 검색 |
| `knowledge.rs` (자동 인덱싱) | 3 | 논블로킹 spawn, graceful degradation |
| `server.rs` (와이어링) | 4 | feature gate, env 체크, 백필 |
| **합계** | **~24** | |

---

## Block Store와의 관계

Block Store(TF-IDF, 로컬 파일)와 RAG(pgvector, PostgreSQL)는 **의도적으로 분리된 두 개의 검색 경로**다. 상세 비교는 [system-data-flow.md](system-data-flow.md#block-store--rag-tf-idf-vs-pgvector-관계) 참조.

---

## BitNet 통합 포인트

현재는 BitNet과 직접 연결되지 않음. `EmbeddingProvider` 트레이트가 교체 경계.

| 항목 | 현재 (Stub) | 교체 후 (BitNet/ML) |
|------|------------|-------------------|
| **임베더** | StubEmbeddingProvider (SHA-256) | BitNet 기반 또는 all-MiniLM-L6-v2 |
| **벡터 차원** | 384 (all-MiniLM-L6-v2 호환으로 표준화) | 384 유지 (스키마 변경 없음) |
| **Dense 검색** | exact match에 가까움 (무의미) | 시맨틱 유사도 (의미 있는 결과) |
| **임베딩 비용** | CPU ~0 (해시만) | 추론 필요 → 캐싱으로 재계산 방지 |
| **API 변경** | — | 없음. `EmbeddingProvider` 구현체만 교체 |
| **마이그레이션** | — | `knowledge_embeddings` 전체 재인덱싱 필요 |

교체 시 Swarm Manager(`musu-engine/src/swarm/`)가 BitNet 인스턴스를 관리하므로, 임베딩 요청도 기존 EnginePool을 통해 라우팅 가능.

---

## 소스 위치 맵

```
Musu-new/src/crates/musu-prime/
├── src/domain/
│   ├── rag_store.rs          ← RAG Store 트레이트
│   ├── pg_rag_store.rs       ← PostgreSQL 구현 (#[cfg(feature = "postgres")])
│   └── embedding.rs          ← Embedding Provider 트레이트 + StubProvider
│
├── src/api/
│   ├── routes/rag.rs         ← POST /v1/rag/search
│   ├── routes/knowledge.rs   ← 제출 시 자동 인덱싱 (lines 236-247)
│   ├── server.rs             ← 런타임 와이어링 (lines 85-162)
│   └── state.rs              ← rag_store + embedder 상태 (lines 100-101)
│
├── migrations/
│   └── 002_pgvector_rag.sql  ← 스키마 마이그레이션
│
├── Cargo.toml                ← postgres feature 정의
│
└── src/Containerfile.musu    ← Docker 빌드 (feature arg)
```

---

## 관련 문서

- **[system-data-flow.md](system-data-flow.md) — RAG↔Block Store 관계, Stub 졸업 조건, 전체 데이터 플로우**
- [block-chain-chunking.md](block-chain-chunking.md) — Block Store + 시맨틱 청킹
- [p15-prime-system.md](p15-prime-system.md) — Prime System 전체 아키텍처
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — /architecture 페이지 스펙
