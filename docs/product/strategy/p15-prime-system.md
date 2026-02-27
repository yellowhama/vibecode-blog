# P15 Prime System — 아키텍처 현황 보고

> 최종 업데이트: 2026-02-20
> 소스 위치: `/mnt/f/Aisaak/Projects/Musu-new/`
> 아카이브 스펙: `work/archived/p15_prime_system_2026-02-11/`
> 상태: **설계 = 구현 1:1 매칭 확인**

---

## 한줄 요약

설계한 대로 다 만들어져 있고, 빠진 건 거의 없다. 다만 Rust와 TypeScript 두 곳에 나뉘어 있어서 전체 그림을 한눈에 보기 어려웠을 뿐.

---

## 시스템 개요

P15 Prime System은 **Think → Simulate → Act** 파이프라인을 구현하는 다계층 인지 아키텍처다.

```
User Request
    ↓
[Prime Commander] ← 미션 컨트롤, 전략 메모리
    ├→ [Planner]   ← 목표 분해
    ├→ [Hive Mind]  ← MAP_REDUCE / Tree of Thoughts / Lookahead
    ├→ [Director]   ← 태스크 위임, 모드 전환
    ├→ [Reviewer]   ← 결과 검증
    ↓
[Execution Layer]
    ├→ [Time Stone]  ← N개 전략 시뮬레이션 + Exit Gate
    ├→ [Holodeck]    ← 가상 Bash 샌드박스 (95% 토큰 절감)
    ├→ [Iron Man]    ← Rust 화이트리스트 시스템 실행
```

---

## Rust vs TypeScript 역할 분담

이 분리는 **의도적이고 합리적**이다.

| 축 | Rust (`musu-prime` + `musu-engine`) | TypeScript (Vibe PM) |
|------|------|------|
| **성격** | Stateful control plane | Stateless tool layer |
| **핵심** | 누가 어디서 무얼 실행 중인지 관리 | 사용자 명령을 해석해서 위임 |
| **예시** | Agent 프로세스 스폰, Gateway job 큐잉, Knowledge 평판 계산 | Goal 분해, 시뮬레이션, 코드 검수 |
| **독립성** | TS가 꺼져도 HTTP API로 독립 동작 | 인퍼런서 없어도 rule-based fallback |

**기여자 가이드**: "이 로직 어디에 넣지?"
- **상태 관리, 프로세스 제어, 네트워크** → Rust
- **LLM 연동, 추론 로직, 사용자 도구** → TypeScript

---

## 컴포넌트별 구현 현황

### 1. Prime Commander (Rust)

| 항목 | 내용 |
|------|------|
| **위치** | `src/crates/musu-prime/src/orchestrator/prime_loop.rs` |
| **역할** | 6-phase tick cycle: Ingest → Chunk → Signals → Mode → Schedule → Queue |
| **포트** | HTTP `8791/TCP` + QUIC `9791/UDP` |
| **모드** | Normal / Eco / Burst |
| **상태** | ✅ 구현 완료 |

### 2. Prime Trinity — Planner / Director / Reviewer (TypeScript)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/prime/` (planner.ts, director.ts, reviewer.ts) |
| **Planner** | 자연어 목표 → Task[] 분해 (rule-based + LLM) |
| **Director** | 상태 머신 IDLE → PLANNING → EXECUTING → REVIEWING |
| **Reviewer** | 결과 검증 + APPROVE/REJECT |
| **테스트** | 18개 (trinity.test.ts) |
| **상태** | ✅ 구현 완료 |

Rust 쪽에는 `/api/routes/decide.rs`에 LOOP/DIAGNOSE/CONTINUE/CANCEL 결정 메커니즘이 별도로 존재.

### 3. Hive Mind — 병렬 추론 (TypeScript + Rust)

| 항목 | 내용 |
|------|------|
| **TS 위치** | `release/mvp_core_clinic/src/mcp/prime/hive_mind.ts` |
| **Rust 위치** | `src/crates/musu-prime/src/hive/` (mDNS 피어 디스커버리) |
| **전략** | MAP_REDUCE (3 병렬), TREE_OF_THOUGHTS (N 후보 투표), LOOKAHEAD (프리페치) |
| **Ouroboros** | 페르소나 주입 (conservative, optimizer, innovator) — 엔트로피 정규화 |
| **테스트** | 21개 |
| **상태** | ✅ 구현 완료 |

### 4. Holodeck — 가상 쉘 (TypeScript)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/prime/holodeck.ts` (just-bash 기반) |
| **지원 명령** | cat, grep, awk, jq, sqlite3, curl (화이트리스트), 파이프, 리디렉트 |
| **핵심 가치** | 100MB 로그 → 133,000 토큰 vs Holodeck → 6,000 토큰 (**95% 절감**) |
| **MCP 도구** | `vibe_pm.virtual_shell` |
| **테스트** | 18개 |
| **상태** | ✅ 구현 완료 |

Rust 쪽(`musu-engine/src/work/`)에도 workspace 격리 + path zone enforcement(BLACK/RED/YELLOW/GREEN) 존재.

### 5. Time Stone — 시뮬레이션 엔진 (TypeScript)

| 항목 | 내용 |
|------|------|
| **위치** | `release/mvp_core_clinic/src/mcp/prime/time_stone.ts` |
| **흐름** | HiveMind.think() → N개 전략 → 격리 Holodeck에서 병렬 시뮬 → 점수 → 최적 선택 |
| **점수** | base 100 + 에러(-100), 안전(+50), 목표달성(+50), 속도, 부작용(-30) |
| **Exit Gate** | minCandidates, exitQuantile(0.9), maxTotalMs(60s), stallWindow(2), stallMinDelta(5) |
| **MCP 도구** | `vibe_pm.simulate` |
| **테스트** | 16개 |
| **상태** | ✅ 구현 완료 (TS). Rust 쪽은 throttle 수준만 — 아래 제한사항 #5 참조 |

### 6. Iron Man — 시스템 실행기 (Rust)

| 항목 | 내용 |
|------|------|
| **위치** | `src/crates/musu-engine/src/sys_admin/` |
| **파일** | `mod.rs`, `commands.rs`, `executor.rs`, `types.rs` |
| **방식** | Enum 기반 화이트리스트 (임의 쉘 실행 절대 불가) |
| **커맨드** | UPDATE_PKG, UPGRADE_PKG, PRUNE_CONTAINER, RESTART_SERVICE, GIT_PULL |
| **인증** | X-Musu-Secret 헤더 + Bearer 토큰, localhost 전용 |
| **테스트** | 27개 (Rust) |
| **상태** | ✅ 구현 완료 |

### 7. Neural Bridge — Node↔Rust 통신 (Rust)

| 항목 | 내용 |
|------|------|
| **위치** | `src/crates/musu-node-bridge/src/` |
| **방식** | localhost HTTP (FFI/napi-rs 대신 — 격리성, 디버깅, 독립 업그레이드) |
| **특수 기능** | Merkle 기반 상태 동기화, Bloom 필터, 블록 기반 데이터 |
| **테스트** | 15개 |
| **상태** | ✅ 구현 완료 |

### 8. BitNet 인퍼런서 (Rust)

| 항목 | 내용 |
|------|------|
| **위치** | `engines/bitnet-musu/` + `src/crates/musu-engine/src/swarm/` |
| **모델** | BitNet 1.58-bit (2B params, ~1.2GB) |
| **서버** | `vibe-bitnet-server` (HTTP 상주, CLI 대비 120x 성능) |
| **핵심 파일** | `engine_pool.rs` (N개 웜 인스턴스), `inference_relay.rs`, `localai_bridge.rs` |
| **스케일** | 업: 12코어 → 3 인스턴스 (cpuset), 아웃: QUIC + Gossip |
| **상태** | ✅ 구현 완료 |

### 9. Dual-Mode — 활동 감지 (TypeScript)

| 항목 | 내용 |
|------|------|
| **CARETAKER** | 30분 유휴 → 시스템 관리 (30% 리소스) |
| **COMPANION** | 활동 감지 → 개발 지원 (100% 리소스) |
| **선점** | 관리 작업 일시정지 → 개발 우선 |
| **테스트** | 8개 |
| **상태** | ✅ 구현 완료 |

---

## Rust API 성숙도

50개 이상 엔드포인트가 12개 라우트 파일에 정리됨:

| 영역 | 기능 |
|------|------|
| **Agent Lifecycle** | 등록 → 시작 → 중지 → 재시작 → 로그 |
| **Gateway Dispatch** | Push/Pull 하이브리드, 9개 Capability 라우팅 |
| **Knowledge Network** | 포스트, 투표, 평판, RAG |
| **Interceptor Fleet** | 가중치 라우팅, 집계 |

9개 Capability: `inference`, `scout`, `sys_admin`, `code_inspection`, `gate`, `briefing`, `remote_compute`, `file_transfer`, `terminal`

---

## MCP 도구 표면 (VIBE_PRIME=1 게이팅)

| 도구 | 입력 | 출력 | 기능 |
|------|------|------|------|
| `vibe_pm.start_mission` | `{ goal: string, mode?: string }` | `{ mission_id, status, tasks[] }` | 자연어 목표 → 미션 생성 + 태스크 분해 |
| `vibe_pm.mission_status` | `{ mission_id: string }` | `{ status, tasks[], progress }` | 미션 상태 + 태스크별 진행률 |
| `vibe_pm.set_mode` | `{ mode: "CARETAKER" \| "COMPANION" }` | `{ previous, current }` | Caretaker/Companion 전환 |
| `vibe_pm.virtual_shell` | `{ command: string, files?: {} }` | `{ stdout, stderr, exitCode }` | Holodeck 가상 쉘 (OS 영향 없음) |
| `vibe_pm.hive_think` | `{ goal: string, strategy?: string }` | `{ results[], merged }` | 병렬 추론 (MAP_REDUCE/ToT/Lookahead) |
| `vibe_pm.simulate` | `{ goal: string, mockFs?: {} }` | `{ best, all_results[], scores }` | N개 전략 시뮬레이션 → 최적 선택 |
| `vibe_pm.hybrid_status` | `{}` | `{ host, containers[], network }` | 하이브리드 배포 상태 |

---

## 테스트 커버리지

| 영역 | 파일 수 | 테스트 수 | 비고 |
|------|---------|----------|------|
| **TypeScript** | 15 파일, 3,202줄 | 163 | 전부 통과 |
| **Rust (Gateway)** | — | 16 | E2E |
| **Rust (sys_admin)** | — | 27 | 단위 |
| **합계** | — | **190+** | Rust 쪽 개별 테스트 파일 분해 미완으로 근사치 |

주요 통합 테스트:
- `neural_link_check.test.ts` — 3-stage 통합
- `ceremony_e2e.test.ts` — 전체 워크플로우
- `mixed_goal_e2e.test.ts` — 조기 종료 정책 검증

---

## BitNet 활용 전략

**핵심 원리**: 작은 모델(2B) + 구조적 보상 = 큰 모델 성능

Ouroboros 논문("Scaling Latent Reasoning via Looped Language Models")의 핵심 발견:
- 작은 모델 + 루프 = 큰 모델 성능 (2.6B + loops ≈ 12B+)
- 지식 **저장**(검색)은 1 루프, **조작**(추론)은 3-4 루프 최적

P15에 적용된 3가지:
1. **Holodeck Error Loop** — 최대 3회 재시도 (`holodeck.ts:executeWithRetry()`)
2. **Worker Persona Entropy** — 다양성 강제 (`hive_mind.ts:buildPersonaPrompts()`, conservative/optimizer/innovator)
3. **Budget Classifier** — RETRIEVAL(1 루프) vs MANIPULATION(3-4 루프) 자동 분류 (`planner.ts:classifyComplexity()`)

---

## 알려진 제한사항

| # | 항목 | 심각도 | 비고 |
|---|------|--------|------|
| 1 | Inferencer 주입 패턴 미문서화 | 🔴 | 프로덕션 블로커. 테스트는 mock/null, 실제 BitNet 연결 경로 명시 필요 |
| 2 | 설정값 하드코딩 | 🟡 | timeout, 병렬 수, idle 임계값 환경변수화 필요 |
| 3 | Holodeck 메모리 제한 없음 | 🟡 | 큰 레포 마운트 시 OOM 가능 |
| 4 | QUIC E2E 미검증 | 🟡 | 멀티노드 물리 테스트 필요 |
| 5 | TimeStone Rust 쪽 미완 | 🟡 | 본격 시뮬레이션은 TS에만, Rust는 throttle 수준 |

---

## 소스 위치 맵

```
Musu-new/
├── src/crates/
│   ├── musu-prime/          ← Prime Commander + HiveLink + Gateway
│   │   ├── src/orchestrator/prime_loop.rs
│   │   ├── src/hive/        ← mDNS 피어 디스커버리
│   │   ├── src/gateway/     ← 노드 등록, Capability 라우팅
│   │   └── src/api/routes/  ← 50+ 엔드포인트
│   │
│   ├── musu-engine/         ← Worker + IronMan + Swarm
│   │   ├── src/sys_admin/   ← 화이트리스트 시스템 실행
│   │   ├── src/work/        ← Workspace 격리 + Path Zone
│   │   ├── src/swarm/       ← EnginePool + Inference Relay
│   │   ├── src/autopilot/   ← 자동 분류 + 강제
│   │   └── src/sync/        ← Gossip + QUIC Transport
│   │
│   ├── musu-node-bridge/    ← Node↔Rust HTTP 브릿지
│   │   ├── src/scout.rs     ← Merkle 상태 추적
│   │   └── src/bloom.rs     ← Bloom 필터
│   │
│   ├── musu-interceptor/    ← OPPA 마이크로 런타임
│   │   └── src/prime_client.rs ← QUIC→HTTP 폴백
│   │
│   └── musu-common/         ← 공유 타입
│
├── engines/
│   └── bitnet-musu/         ← BitNet 추론 엔진
│       ├── src/core/engine.rs   ← llama.cpp 프로세스 라이프사이클
│       └── src/api/musu_api.rs  ← OpenAI 호환 API
│
└── work/archived/
    └── p15_prime_system_2026-02-11/  ← 설계 스펙 (11개 문서)
```

---

## 관련 문서

- **[system-data-flow.md](system-data-flow.md) — P15 실행 결과가 Block Store/RAG로 이어지는 전체 흐름**
- [block-chain-chunking.md](block-chain-chunking.md) — Block Store + 시맨틱 청킹
- [rag-enable.md](rag-enable.md) — RAG 벡터 검색
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — /architecture 페이지 14섹션 스펙
- [tech-fact-check.md](tech-fact-check.md) — 사이트 콘텐츠 vs 실제 코드 기술 팩트체크
- 스펙 원본: `Musu-new/work/archived/p15_prime_system_2026-02-11/`
