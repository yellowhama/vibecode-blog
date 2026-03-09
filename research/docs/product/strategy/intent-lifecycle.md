# Intent & Lifecycle — 아키텍처 현황 보고

> 최종 업데이트: 2026-02-20
> 소스 위치: `/mnt/f/Aisaak/Projects/Musu-new/`
> 상태: **부분 구현 — 캡처는 있으나 강제(enforcement)는 없음**

---

## 한줄 요약

인텐트를 파싱하고 저장하는 코드는 있다. 인텐트를 런타임에 강제하는 코드는 없다. 웹사이트 킬러 라인 "MUSU does not remember intent. It enforces it."는 **아직 약속이지 사실이 아니다.**

---

## 왜 이 문서가 필요한가

웹사이트(v6.1)는 4개 구조 레이어를 약속한다:

```
Layer 1  Intent             "What you meant to build. Locked in."
Layer 2  Lifecycle           "Work happens in stages. Not chaos."
Layer 3  Validation Loop     "Mistakes don't ship."
Layer 4  Persistent State    "Memory that outlives chat."
```

기존 아키텍처 문서는 Layer 3-4를 다룬다:
- [p15-prime-system.md](p15-prime-system.md) — Validation (Reviewer, TimeStone)
- [block-chain-chunking.md](block-chain-chunking.md) — Persistent State (Block Store)
- [rag-enable.md](rag-enable.md) — Persistent State (RAG)
- [system-data-flow.md](system-data-flow.md) — 전체 순환

**Layer 1(Intent)과 Layer 2(Lifecycle)는 어디에도 없었다.** 이 문서가 그 간극을 메운다.

---

## 전체 플로우에서의 위치

```
사용자 자연어 목표
    ↓
┌──────────────────────────────────────────────────────┐
│  ⓪ INTENT CAPTURE (이 문서)                          │
│  자연어 → ParsedIntent (scope, constraints, criteria)│
│  → .vibe/runs/<run_id>/intent/intent.v1.json         │
│                                                      │
│  ✅ 파싱 구현됨                                       │
│  ❌ 프로젝트 레벨 인텐트 없음                          │
│  ❌ 미션 연결 없음                                    │
└──────────────────────┬───────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  ⓪' LIFECYCLE ENFORCEMENT (이 문서)                   │
│  RunPhase: INTAKE → SPEC_LOCKED → PLAN_LOCKED →      │
│            EXEC_ALLOWED → REVIEWED → FINALIZED       │
│                                                      │
│  ✅ 파일 기반 페이즈 전이 구현됨                       │
│  ❌ 웹사이트 스테이지와 매핑 안 됨                     │
│  ❌ 스테이지 간 인텐트 유효성 검증 없음                │
└──────────────────────┬───────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  ①~④ P15 PIPELINE (상세: p15-prime-system.md)        │
│  Planner → HiveMind → TimeStone → IronMan            │
└──────────────────────┬───────────────────────────────┘
                       ↓
              ⑤⑥ 저장 → ⑦ Context Assembly → ① 순환
              (상세: system-data-flow.md)
```

---

## Intent Capture: 구현 현황

### A2A Intent Interpreter (✅ 구현됨)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/a2a/intent/` |
| **파일** | `types.ts` (타입), `interpreter.ts` (파서) |
| **방식** | 키워드 기반 분류 + 정규식 추출 (LLM 불필요) |
| **출력** | `.vibe/runs/<run_id>/intent/intent.v1.json` |

### ParsedIntent 구조

```typescript
interface ParsedIntent {
  schema_version: "1.0";
  type: IntentType;           // feature | fix | refactor | test | docs | ...
  priority: "low" | "medium" | "high" | "critical";
  confidence: number;         // 파싱 신뢰도

  goal: {
    summary: string;
    description: string;
    success_criteria: string[];  // "should/must/needs to" 패턴 추출
  };

  scope: {
    include: string[];        // 수정 허용 경로
    exclude: string[];        // 수정 금지 경로
    impact_area: "small" | "medium" | "large";
  };

  constraints: {
    do_not_touch: string[];   // 절대 변경 금지 파일
    technical: string[];      // 기술적 제약
    business: string[];       // 비즈니스 제약
  };

  risks: Array<{
    description: string;
    severity: "low" | "medium" | "high";
    mitigation: string;
  }>;

  metadata: {
    captured_at: string;
    source: string;
    dev_mode: boolean;
  };
}
```

**강점**: 데이터 구조가 잘 설계되어 있다. scope, constraints, risks까지 — 웹사이트가 약속하는 "scope boundaries, modification zones, success criteria"의 타입이 전부 있다.

**문제**: 이 타입이 **채워지기만 하고 소비되지 않는다.** 인텐트 파일은 `.vibe/runs/`에 저장되지만, 이후 파이프라인(Planner, Director, Reviewer)이 이 파일을 읽지 않는다.

### 인텐트 파싱 방식

```
사용자 자연어 목표
    ↓
키워드 분류 ("add" → feature, "fix" → fix, "refactor" → refactor)
    ↓
정규식 추출:
    "should/must/needs to..." → success_criteria[]
    파일 경로 패턴 → scope.include[]
    "don't touch/leave/keep" → constraints.do_not_touch[]
    ↓
리스크 평가:
    intent_type + 위험 키워드(delete, remove, drop) → risk severity
    ↓
ParsedIntent → intent.v1.json 저장
```

---

## Lifecycle Enforcement: 구현 현황

### RunPhase 상태 머신 (✅ 구현됨)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/tools/vibe_pm/phase.ts` |
| **방식** | SSOT 파일 존재 여부로 페이즈 결정 (선언적) |
| **게이트** | "No Spec + No Plan → No Work" |

```
INTAKE            ticket 없음
    ↓ ticket.v1.json 생성
SPEC_LOCKED       ticket + spec 존재
    ↓ plan.v1.json 생성
PLAN_LOCKED       ticket + spec + plan 존재
    ↓ approval
EXEC_ALLOWED      실행 허가
    ↓ verdict.v1.json 생성
REVIEWED          검증 완료
    ↓ decision.v1.json 생성
FINALIZED         완결
```

**게이트 규칙**: 각 전이는 이전 단계의 산출물(파일)이 존재해야만 가능. 건너뛰기 불가.

### 웹사이트 스테이지와의 매핑

| 웹사이트 (v6.1) | RunPhase | 매핑 상태 |
|-----------------|----------|:---------:|
| **Plan** | INTAKE → SPEC_LOCKED | 🟡 근사 |
| **Build** | PLAN_LOCKED → EXEC_ALLOWED | 🟡 근사 |
| **Control** | REVIEWED | 🟡 근사 |
| **Operate** | FINALIZED | 🟡 근사 |
| **Maintain** | — | ❌ 없음 |

**문제**: RunPhase는 **런(작업 단위)** 레벨이고, 웹사이트 스테이지는 **프로젝트** 레벨이다. 런이 FINALIZED 되어도 프로젝트는 계속 OPERATE 상태여야 하는데, 이 상위 상태 머신이 없다.

---

## Constitutional Enforcer: 스펙은 있으나 미구현

### Intent Envelope (스펙만 존재)

| 항목 | 내용 |
|------|------|
| **스펙 위치** | `docs/specs/contracts/intent_envelope.v1.json` |
| **구현 위치** | `src/crates/musu-engine/src/autopilot/prime_ticket/validation.rs` (부분) |

```
모드:
  STRICT          — 인텐트 변이 절대 불가
  BOUNDED_L5      — shadow proof 있으면 제한적 변이 허용

불변 규칙 (Global Invariants):
  never_relax_security
  never_skip_shadow_proof
  never_reduce_evidence
  never_expand_network_scope
  never_change_primary_goal_semantics    ← 핵심

허용 변이 (Allowlisted Mutations):
  retry_budget 조정
  resource_caps 변경
  model_routing 변경
  success_criteria 강화 (약화 불가)

금지 변이 (Forbidden Mutations):
  보안 완화
  검증 생략
  에비던스 축소
  주 목표 시맨틱 변경                     ← 핵심
```

**Rust 구현 상태**:
- ✅ `IntentEnvelopeMode` enum (Strict, BoundedL5)
- ✅ `BoundedL5Context` 파싱
- ✅ Shadow proof HMAC 검증
- ❌ `never_change_primary_goal_semantics` 강제 없음 (intent_hash 비교 미구현)
- ❌ 허용/금지 변이 목록 런타임 적용 없음

### Intent Mutation Record (스펙만 존재)

| 항목 | 내용 |
|------|------|
| **스펙 위치** | `docs/specs/contracts/intent_mutation_record.v1.json` |
| **구현** | ❌ 없음 |

```
예정된 구조:
  before_intent_hash: string
  after_intent_hash: string
  diff_summary: string
  shadow_proof_id: string
  approval: { approved_by, timestamp }

저장 위치: .vibe/runs/<run_id>/evidence/intent_mutation.v1.json
```

이 파일이 구현되면 "인텐트가 런 중에 변했는지" 감지할 수 있다. 현재는 감지 수단이 없다.

---

## Scope Enforcement: Path Security (부분 구현)

### Rust Scope 구조체 (✅ 구현됨)

| 항목 | 내용 |
|------|------|
| **위치** | `src/crates/musu-engine/src/work/path_security.rs` |
| **기능** | 작업 요청의 파일 경로가 workspace 내에 있는지 검증 |

```rust
pub struct Scope {
    pub workspace: String,
    pub paths: Vec<String>,         // 허용 경로
    pub globs: Vec<String>,          // 허용 글로브 패턴
    pub exclude_globs: Vec<String>,  // 금지 패턴
    pub max_files: u32,
    pub max_lines_per_file: u32,
}
```

**검증 항목**: 경로 탈출(`../`), 절대 경로, null 바이트, 심링크 — 전부 차단.

### Airlock Policy (✅ 구현됨)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/security/path-policy.ts` |
| **설정** | `.vibe/config/airlock_policy.v1.json` |

```
경로 분류:
  PROTECTED   — 읽기만 (예: .git/, node_modules/)
  MANAGED     — 읽기+쓰기 (예: src/)
  OPEN        — 모든 작업 허용
  FORBIDDEN   — 접근 불가
```

### 연결 격차

| 연결 | 상태 | 설명 |
|------|:----:|------|
| ParsedIntent.scope → Rust Scope | ❌ | 인텐트의 include/exclude가 실행 Scope에 주입 안 됨 |
| ParsedIntent.constraints → Airlock | ❌ | "don't touch" 제약이 경로 정책에 반영 안 됨 |
| 런타임 범위 초과 감지 | ❌ | 인텐트 scope 밖 파일 수정 시 경고/차단 없음 |

**핵심**: Path Security와 Airlock Policy는 **정적 정책**(설정 파일 기반)이다. 인텐트는 **동적 정책**(매 미션마다 다름)인데, 이 둘이 연결되지 않았다.

---

## 기존 파이프라인과의 격차

### 현재 `start_mission` 흐름

```
사용자: vibe_pm.start_mission({ goal: "Add login page" })
    ↓
classifyGoal(goal)                        ← 예산 분류만 (인텐트 무시)
    ↓
PrimeDirector.startMission(goal, type)    ← goal은 평문 string
    ↓
Planner.decompose(goal) → MissionTask[]  ← ParsedIntent 참조 없음
    ↓
실행 시작                                  ← scope 제약 없음
```

### 있어야 할 흐름

```
사용자: vibe_pm.start_mission({ goal: "Add login page" })
    ↓
IntentInterpreter.parse(goal) → ParsedIntent
    ↓
프로젝트 인텐트 로드 (.vibe/project_intent.v1.json)
    → 프로젝트 제약과 미션 인텐트 병합
    ↓
인텐트 유효성 검증:
    → 미션 scope ⊆ 프로젝트 허용 범위?
    → constraints 충돌 없음?
    ↓
intent_hash 계산 + 미션 context에 저장
    ↓
PrimeDirector.startMission(goal, type, intent)
    ↓
Planner.decompose(goal, intent.scope, intent.constraints)
    → Task[] 생성 시 scope 내 파일만 타겟
    ↓
실행 중 매 파일 변경마다:
    → intent.scope.include 내인가?
    → intent.constraints.do_not_touch 아닌가?
    → 위반 시 BLOCK
```

---

## 구현 로드맵 (제안)

| 우선순위 | 항목 | 현재 | 목표 | 왜 |
|:--------:|------|------|------|-----|
| **P0** | 인텐트 → 미션 연결 | ParsedIntent 저장만 | Planner가 intent.scope/constraints 참조 | 킬러 라인 "enforces it"의 최소 구현 |
| **P1** | 프로젝트 레벨 인텐트 | 런 단위만 | `.vibe/project_intent.v1.json` | 프로젝트 전체 scope 없으면 런마다 scope 재정의 |
| **P1** | intent_hash 변이 감지 | 미구현 | 미션 시작/종료 해시 비교 | 목표 변이를 감지할 수 없으면 "locked in" 아님 |
| **P2** | scope → 실행 강제 | Path Security 정적만 | 인텐트 scope → Rust Scope 동적 주입 | 인텐트 밖 파일 수정 차단 |
| **P2** | 프로젝트 스테이지 머신 | RunPhase만 | ProjectStage (Plan/Build/Control/Operate/Maintain) | 웹사이트 약속과 코드 일치 |
| **P2** | success_criteria → 게이트 | 파싱만 | Reviewer가 criteria 대비 검증 | "성공 기준"이 실제 게이트가 되어야 의미 |
| **P3** | Constitutional Enforcer 완성 | 스펙 + 부분 구현 | intent_envelope 전체 런타임 적용 | L5 prevention 완성 |
| **P3** | 스테이지별 인텐트 정책 | 없음 | Plan=유연, Build=잠금, Maintain=bounded | 스테이지에 따라 허용 변이 수준 변경 |

---

## 웹사이트 카피 vs 구현 현실 (정직하게)

| 웹사이트 약속 | 코드 현실 | 격차 |
|-------------|----------|:----:|
| "Intent is recorded. Future changes are measured against it." | 인텐트 파싱 + 저장 ✅, 측정 ❌ | 🔴 |
| "MUSU does not remember intent. It enforces it." | 기억만 함 (저장), 강제 안 함 | 🔴 |
| "Every change is evaluated against declared intent." | 변경 시 인텐트 대비 평가 없음 | 🔴 |
| "Work cannot skip stages." | RunPhase 게이트 존재 (파일 기반) | 🟡 |
| "Stage transitions are logged and enforced." | 전이 강제 ✅, 로깅 🟡 (events.jsonl) | 🟡 |
| "Scope boundaries, allowed modification zones" | ParsedIntent.scope 타입 ✅, 런타임 강제 ❌ | 🔴 |
| "Success criteria" | 파싱 ✅, 게이트 연결 ❌ | 🔴 |
| "Deterministic reconstruction of project at any point" | Block Store + RAG + missions 테이블 | 🟡 |

**요약**: 데이터 구조(타입, 스펙, 저장 형식)는 **잘 설계되어 있다**. 런타임 강제 경로가 **빠져 있다**. 파이프라인의 "읽기" 쪽이 없는 상태 — 쓰기만 있고 소비자가 없다.

---

## 소스 위치 맵

```
Musu-new/
├── release/mvp_core_clinic/src/
│   ├── mcp/a2a/intent/
│   │   ├── types.ts              ← ParsedIntent 타입 정의
│   │   └── interpreter.ts        ← 자연어 → ParsedIntent 파서
│   │
│   ├── mcp/tools/vibe_pm/
│   │   └── phase.ts              ← RunPhase 상태 머신
│   │
│   ├── mcp/security/
│   │   └── path-policy.ts        ← Airlock 경로 정책
│   │
│   └── domains/prime/
│       ├── planner.ts            ← 목표 분해 (인텐트 미참조)
│       ├── director.ts           ← 미션 시작 (인텐트 미연결)
│       └── mission_store.ts      ← PostgreSQL 미션 저장
│
├── src/crates/musu-engine/src/
│   ├── work/path_security.rs     ← Scope 구조체 + 경로 검증
│   └── autopilot/prime_ticket/
│       └── validation.rs         ← IntentEnvelopeMode (부분 구현)
│
└── docs/specs/contracts/
    ├── intent_envelope.v1.json   ← Constitutional Enforcer 스펙
    └── intent_mutation_record.v1.json ← 변이 기록 스펙
```

---

## 테스트 커버리지

| 컴포넌트 | 테스트 | 비고 |
|----------|:------:|------|
| Intent Interpreter (TS) | ~12 | 타입 분류, 키워드 추출, scope 파싱 |
| RunPhase (TS) | ~8 | 페이즈 전이, 게이트 규칙 |
| Path Security (Rust) | ~18 | 경로 검증, 탈출 차단, 심링크 |
| Airlock Policy (TS) | ~6 | 정책 로드, 경로 분류 |
| **합계** | **~44** | 인텐트 강제 테스트 0건 (구현 없으므로) |

---

## 웹사이트 카피 정합 전략

웹사이트(v6.1)가 약속하는 수준과 실제 구현을 맞추는 방법은 **두 가지** — 코드를 카피에 맞추거나, 카피를 코드에 맞추거나.

### 방향: 코드를 카피에 맞춘다 (추천)

카피의 약속이 **기술적으로 건전**하기 때문이다. ParsedIntent 타입, Constitutional Enforcer 스펙, Intent Mutation Record 스펙이 이미 설계되어 있고, 구현만 빠져 있다. 카피를 약화시키면 포지셔닝의 핵심("enforces, not remembers")을 잃는다.

### 단기: 카피에서 과장 제거 (즉시 가능)

현재 카피 중 구현 없이는 유지할 수 없는 표현:

| 카피 원문 | 문제 | 수정 제안 |
|----------|------|----------|
| "Every change is evaluated against declared intent." | 평가 로직 없음 | "Changes are scoped to declared boundaries." (scope은 있음) |
| "MUSU does not remember intent. It enforces it." | 기억만 함 | /architecture에서만 사용. 랜딩에서는 "Intent is captured and persisted." |
| "Intent violations are deterministic events, not interpretation." | violation 감지 없음 | /architecture 전용 유지, "coming soon" 표기 불필요 — L3 Proof 계층은 엔지니어 대상이므로 정직하게 |

**원칙**: L1(Identity), L2(Mechanism) 카피는 **방향성**이므로 유지. L3(Proof) 카피는 **증거**이므로 구현 상태와 일치해야 한다.

### 중기: P0-P1 구현으로 카피 정당화 (1-2 스프린트)

로드맵 P0-P1 항목 구현 시 카피의 핵심 약속이 사실이 된다:

```
P0: 인텐트 → 미션 연결
    → Planner가 intent.scope/constraints 참조
    → "Intent becomes a constraint" 최소 구현
    → 킬러 라인 정당화: "enforces it"

P1: 프로젝트 레벨 인텐트 + intent_hash 변이 감지
    → ".vibe/project_intent.v1.json"
    → "What you meant to build. Locked in." 정당화
    → "Future changes are measured against it." 정당화
```

P0+P1 완료 후 카피 수정 불필요. 현재 카피가 그대로 사실이 됨.

### 장기: P2-P3 구현으로 /architecture 페이지 정당화

```
P2: scope → 실행 강제 + ProjectStage 상태 머신
    → "Every change is evaluated against declared intent." 정당화
    → "Work cannot skip stages." 완전 정당화

P3: Constitutional Enforcer 완성
    → "Intent violations are deterministic events" 정당화
    → /architecture 페이지 Section 6 전체 정당화
```

### 결론

카피는 **건드리지 않아도 된다**. 코드가 따라가면 된다. 구현 순서:

1. **P0** — Planner가 ParsedIntent를 읽는다 (최소 연결)
2. **P1** — 프로젝트 인텐트 + 변이 감지 (잠금 메커니즘)
3. **P2** — 런타임 scope 강제 + 스테이지 머신 (풀 강제)
4. **P3** — Constitutional Enforcer (불변 규칙 강제)

각 단계가 완료될 때마다 웹사이트의 해당 약속이 **사실**로 전환된다.

---

## 관련 문서

- **[system-data-flow.md](system-data-flow.md) — ⓪→①~④→⑤⑥→⑦ 전체 순환 (이 문서가 ⓪ 단계)**
- [p15-prime-system.md](p15-prime-system.md) — ①~④ Planner가 인텐트를 소비해야 할 지점
- [block-chain-chunking.md](block-chain-chunking.md) — 인텐트 scope 내 파일만 청킹 대상?
- [rag-enable.md](rag-enable.md) — 인텐트 기반 검색 필터링 가능성
- [website-copy-draft.md](website-copy-draft.md) — Layer 1 Intent 약속 원문
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — Section 6 Intent Model 스펙
