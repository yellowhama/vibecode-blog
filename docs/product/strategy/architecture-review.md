# 아키텍처 문서 정성적 리뷰 + 잔여 개선사항

> 최종 리뷰: 2026-02-20
> 대상: 5개 아키텍처 현황 문서 (3차 리뷰)
> 리뷰 방법: 소스 코드 대조 검증 → 1차 수정 → 2차 수정 → 3차 최종 평가

---

## 리뷰 이력

| 차수 | 대상 | 발견 | 수정 | 커밋 |
|:----:|------|:----:|:----:|------|
| **1차** | 4개 (P15, Block Chain, RAG, Data Flow) | 12건 | 12건 | `7045904` |
| **2차** | 4개 | 12건 | 12건 | `62c261f` |
| **3차** | 5개 (+intent-lifecycle.md 신규) | 3건 | — | **이 문서에 기록** |

---

## 최종 등급

| 문서 | 등급 | 레이어 역할 | 1차 → 2차 → 3차 |
|------|:----:|------------|:----------------:|
| `intent-lifecycle.md` | **A** | Layer 1-2 (Intent + Lifecycle) | — → — → A |
| `system-data-flow.md` | **A+** | 교차 연결 (⓪→①~④→⑤⑥→⑦→①) | A → A+ → A+ |
| `p15-prime-system.md` | **A+** | Layer 3 파이프라인 (①~④) | A → A+ → A+ |
| `block-chain-chunking.md` | **A** | Layer 4 저장 (⑤) | A- → A → A |
| `rag-enable.md` | **A** | Layer 4 검색 (⑥) | A- → A → A |

---

## 세트 완성도

웹사이트 v6.1이 약속하는 4개 레이어가 **전부 커버됨:**

```
Layer 1 Intent       → intent-lifecycle.md ✅
Layer 2 Lifecycle     → intent-lifecycle.md ✅
Layer 3 Validation    → p15-prime-system.md ✅
Layer 4 State         → block-chain-chunking.md + rag-enable.md ✅
교차 연결             → system-data-flow.md ✅
```

5개 문서가 서로를 참조하면서 빈틈 없이 전체 아키텍처를 커버한다. intent-lifecycle.md가 추가되면서 "캡처만 있고 강제가 없다"는 핵심 격차가 정직하게 드러났고, 이것이 오히려 세트 전체의 신뢰도를 높인다.

---

## 잔여 개선사항 (3건)

3차 리뷰에서 발견된 미수정 항목. 모두 경미(cosmetic/clarity)하며 정확성에는 영향 없음.

### 1. `intent-lifecycle.md` — 테스트 수 근사치

**현재**: ~12, ~8, ~18, ~6 (근사치 4개)
**문제**: 다른 4개 문서는 정확한 숫자를 기재한다 (예: Block Chain Chunking의 282개 분해표). `~` 근사치는 일관성을 깨뜨린다.
**수정 방법**: Musu-new 소스의 테스트 파일을 직접 확인하여 정확한 테스트 수로 교체.

```
대상 파일 → 확인 필요 위치:
  Intent Interpreter  → release/mvp_core_clinic/src/mcp/a2a/intent/ 테스트
  RunPhase           → release/mvp_core_clinic/src/mcp/tools/vibe_pm/ 테스트
  Path Security      → src/crates/musu-engine/src/work/ 테스트
  Airlock Policy     → release/mvp_core_clinic/src/mcp/security/ 테스트
```

**심각도**: 🟢 경미 (정확성 무관, 일관성 개선)

### 2. `intent-lifecycle.md` — Constitutional Enforcer 코드 위치 정밀도

**현재**: `validation.rs` (부분) — 어떤 함수가 있고 어떤 함수가 빠졌는지 행 번호 없음
**문제**: 다른 문서들은 `knowledge.rs:236-247` 수준의 정밀 참조를 한다. 이 문서만 파일 이름만 기재.
**수정 방법**: `validation.rs`에서 `IntentEnvelopeMode` enum, `BoundedL5Context` 파싱, HMAC 검증 함수의 행 번호 확인 후 추가.

```
확인 필요:
  src/crates/musu-engine/src/autopilot/prime_ticket/validation.rs
  → IntentEnvelopeMode enum (몇 행?)
  → BoundedL5Context 파싱 (몇 행?)
  → Shadow proof HMAC 검증 (몇 행?)
```

**심각도**: 🟢 경미 (정확성 무관, 정밀도 개선)

### 3. `intent-lifecycle.md` — Scope↔Airlock 연결 방향 스케치 부재

**현재**: "연결 안 됨 ❌" 3줄 (ParsedIntent.scope → Rust Scope, constraints → Airlock, 범위 초과 감지)
**문제**: "안 됨"만 기술하고, **어떻게 연결할 수 있는지**에 대한 방향 스케치가 없다. 로드맵 P2에 해당하지만, 한 줄짜리 접근 방식이라도 있으면 구현자가 참고할 수 있다.
**수정 방법**: 연결 격차 테이블 아래에 간략한 접근 방식 추가:

```
예시:
  ParsedIntent.scope.include → start_mission() 시 Rust Scope.paths에 동적 주입
  ParsedIntent.constraints.do_not_touch → Airlock FORBIDDEN 경로로 런타임 추가
  범위 초과 감지 → Iron Man/Holodeck 실행 전 intent.scope 교차 검증
```

**심각도**: 🟢 경미 (현재 기술이 틀린 것은 아님, 방향성 보강)

---

## 문서별 상세 평가

### intent-lifecycle.md — A

**신규 문서. 5개 세트에서 가장 중요한 역할.**

강점:
- **한줄 요약이 핵심을 찌름**: "아직 약속이지 사실이 아니다." — 이 정직함이 문서 전체의 신뢰도를 세운다
- **"왜 이 문서가 필요한가" 섹션이 완벽**: Layer 1-2 간극을 정확히 짚고, 기존 4개 문서가 Layer 3-4를 다루고 있었음을 명시
- **ParsedIntent 타입 전문 수록**: 코드를 열지 않아도 데이터 구조를 파악할 수 있다
- **"현재 vs 있어야 할" 플로우 대비**: `classifyGoal(goal) ← 예산 분류만 (인텐트 무시)` 같은 인라인 주석이 격차를 한눈에 보여준다
- **카피 정합 전략이 실용적**: "카피를 건드리지 않아도 된다. 코드가 따라가면 된다." — P0~P3 단계별로 어떤 약속이 사실이 되는지 명확
- **웹사이트 카피 vs 구현 현실 테이블(🔴/🟡)**: 약속 8개를 각각 정직하게 평가

아쉬운 점: 위 잔여 개선사항 #1, #2, #3

### system-data-flow.md — A+

**교차 연결 문서. 세트의 허브.**

강점:
- **⓪ Intent 단계 추가로 전체 플로우 완성**: `사용자 자연어 목표 → ⓪ INTENT → ①~④ P15 → ⑤⑥ → ⑦ → ① loop` — 끝에서 끝까지
- **Context Assembly 3소스 구조**: Block Store / RAG / Mission History의 역할 구분 + 제안된 우선순위 + 실행 주체 + 미구현 상태
- **졸업 조건 2개(Dual-Write, Stub Embedding)가 측정 가능한 체크리스트**
- **권한 경계 테이블**: 5개 주체 × 3개 저장소 — 한눈에 누가 뭘 읽고 쓰는지
- **저장소 위상 분리**(파일시스템 vs PostgreSQL)가 핵심 차이와 함께 명확히 기술

아쉬운 점: 없음. 1-2차 리뷰 지적사항 전부 반영 완료.

### p15-prime-system.md — A+

**Layer 3 파이프라인. 가장 방대한 문서.**

강점:
- 9개 컴포넌트를 일관된 테이블 포맷으로 기술
- Ouroboros 코드 경로 3개 명시 (`holodeck.ts:executeWithRetry()`, `hive_mind.ts:buildPersonaPrompts()`, `planner.ts:classifyComplexity()`)
- Rust vs TypeScript 역할 분담 + 기여자 가이드 ("이 로직 어디에 넣지?")
- 제한사항 5개가 심각도 분류 + 비고와 함께 정직하게 기록
- TimeStone ⚠️ → 제한사항 #5 양방향 연결

아쉬운 점: 없음. 1-2차 리뷰 지적사항 전부 반영 완료.

### block-chain-chunking.md — A

**Layer 4 저장. 가장 성숙한 구현.**

강점:
- BlockType → 청킹 프로파일 매핑 테이블 (6타입 → 3프로파일 + 경계 감지 방식)
- 추론 파이프라인의 ✅/⬚ 상태 표시 — 어디까지 되고 어디서 끊기는지 명확
- 282개 테스트 상세 분해표 (TS 195 + Rust 87, 13개 컴포넌트)
- Main Brain ↔ MUSU 경계 테이블 — 코드베이스 vs `.vibe/**` 쓰기 권한 분리
- 설계 원칙 4개 (콘텐츠 주소 지정, 의미 체인, 증분 업데이트, 이중 기록)

아쉬운 점:
- Swarm Manager 섹션이 이 문서에 있는 이유에 대한 한 줄 설명이 있으면 자연스러움 (현재는 P15 참조만). 다만 이건 경미하여 잔여 개선사항에 포함하지 않음.

### rag-enable.md — A

**Layer 4 검색. Stub의 한계를 가장 정직하게 다루는 문서.**

강점:
- "한계 (정직하게)" 섹션 — Stub의 실질적 동작과 한계를 숨김 없이 기술
- 설계 결정 6개가 각각 "왜"를 설명 (특히 #6 Stub에서도 Hybrid 유지 이유)
- BitNet 통합 비교표 (현재 vs 교체 후, 6행) — 교체 시 무엇이 변하고 안 변하는지
- Feature Gate → 환경변수 → 검증 체크리스트의 운영 가이드 성격
- Trait 아키텍처로 교체 경계가 명확 (`EmbeddingProvider` 구현체만 바꾸면 됨)

아쉬운 점: 없음. 1-2차 리뷰 지적사항 전부 반영 완료.

---

## 1-2차에서 수정된 항목 전체 기록 (24건)

### 1차 리뷰 수정 (12건, commit `7045904`)

| # | 문서 | 항목 | 수정 내용 |
|---|------|------|----------|
| 1 | system-data-flow | Context Assembly 섹션 빈약 | 3소스 구조 + 우선순위 + 실행 주체 + ⬚ 상태 추가 |
| 2 | system-data-flow | ①~④ P15 단계별 기술 중복 | P15 문서 참조로 통합, 연결 지점만 기술 |
| 3 | system-data-flow | 권한 테이블 "외부 API" 빈 컬럼 | 컬럼 제거 |
| 4 | system-data-flow | PostgreSQL 저장소 위상 혼재 | 파일시스템/PostgreSQL 분리 + 핵심 차이 설명 |
| 5 | system-data-flow | 로드맵 "왜" 컬럼 없음 | 전체 로드맵에 "왜" 컬럼 추가 |
| 6 | p15-prime-system | Trinity 코드 경로 미기재 | planner.ts, director.ts, reviewer.ts 위치 추가 |
| 7 | p15-prime-system | MCP 도구 I/O 스키마 없음 | 7개 도구 입력/출력 스키마 테이블 추가 |
| 8 | p15-prime-system | Inferencer 주입 패턴 미문서화 | 🔴 제한사항으로 명시 |
| 9 | block-chain-chunking | MCP Interface 화살표 방향 불명 | `(쓰기↓ 읽기↑)` 추가 |
| 10 | rag-enable | Stub 임베딩 한계 미기술 | "한계 (정직하게)" 섹션 추가 |
| 11 | rag-enable | Feature Gate 설명 부족 | Cargo.toml + Containerfile + 환경변수 + 검증 체크리스트 |
| 12 | rag-enable | Block Store와의 관계 미기술 | system-data-flow 참조 + 한 줄 요약 |

### 2차 리뷰 수정 (12건, commit `62c261f`)

| # | 문서 | 항목 | 수정 내용 |
|---|------|------|----------|
| 1 | p15-prime-system | Ouroboros 코드 경로 미명시 | `holodeck.ts:executeWithRetry()`, `hive_mind.ts:buildPersonaPrompts()`, `planner.ts:classifyComplexity()` 추가 |
| 2 | p15-prime-system | TimeStone ⚠️와 제한사항 #5 이중 기술 | 양방향 참조로 연결 |
| 3 | p15-prime-system | 테스트 190+ 근사치 설명 없음 | "Rust 쪽 개별 테스트 파일 분해 미완으로 근사치" 비고 추가 |
| 4 | block-chain-chunking | MCP Interface 양방향 미표시 | `(쓰기↓ 읽기↑)` 레이블 추가 |
| 5 | block-chain-chunking | "기존 RAG" 비교 대상 불명확 | "업계 표준 RAG(LangChain, LlamaIndex 등)" 으로 명시 |
| 6 | block-chain-chunking | BlockType→프로파일 매핑 누락 | 6타입 → 3프로파일 + 경계 감지 방식 테이블 추가 |
| 7 | rag-enable | DenseOnly 설명이 Stub 현실과 불일치 | "⬚ Stub 환경에서는 exact match에 가까움" 수정 |
| 8 | rag-enable | Hybrid 기본값 유지 이유 미설명 | 설계 결정 #6 추가 |
| 9 | rag-enable | BitNet 통합 섹션 3줄로 빈약 | 6행 비교표로 확장 (임베더, 차원, Dense, 비용, API, 마이그레이션) |
| 10 | system-data-flow | 우선순위가 확정/제안 불명확 | "제안된 소스 우선순위" 명시 |
| 11 | system-data-flow | block-chain-chunking 파이프라인 크로스 참조 없음 | 추론 파이프라인 상세 참조 추가 |
| 12 | system-data-flow | Block↔RAG 통합 방향 미결 | 3번(분리) 기본 + P2에서 1번 시도 방침 명시 |

---

## 관련 문서

- [intent-lifecycle.md](intent-lifecycle.md) — Layer 1-2 아키텍처
- [system-data-flow.md](system-data-flow.md) — 교차 연결
- [p15-prime-system.md](p15-prime-system.md) — Layer 3 파이프라인
- [block-chain-chunking.md](block-chain-chunking.md) — Layer 4 저장
- [rag-enable.md](rag-enable.md) — Layer 4 검색
