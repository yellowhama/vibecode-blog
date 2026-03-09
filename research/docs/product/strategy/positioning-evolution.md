# MUSU 포지셔닝 진화 기록

> 최종 업데이트: 2026-02-22
> 현재 배포 버전: v6.1 (https://musu.pro)
> 다음 버전: v7 OS Pivot (Landing 2, 구현 대기)
> 이전 배포 버전: v5.1 (폐기)

---

## 진화 타임라인

| 버전 | 핵심 포지셔닝 | 상태 |
|------|-------------|------|
| v1 | 최초 초안. 내부 용어 제거. | 폐기 |
| v2 | 3-Tier, "습관이 경쟁자", CPU AI 구체화 | 폐기 |
| v3 | Hero→Version A, Products→Inside MUSU, 하나의 제품 | 폐기 |
| v4 | 철학 전환: 운영→비즈니스 현실화. "Why This Works" 신설. | 폐기 |
| v5 | **"It's the structure, stupid."** Problem 재정의. 4개 구조 레이어. 선언 섹션. | 폐기 |
| v5.1 | 전환율 미세 조정. Hero 타겟 직접 호출. 감정 밀도 강화. | 폐기 |
| v6 | **"AI Boundary Layer."** 카테고리 재정의. 대결→협력 톤. | v6.1로 대체 |
| v6.1 | **메커니즘 추가 + 책임 아키텍처.** "How It Actually Works" 신설. Five Responsibilities. 사기 냄새 제거. | **배포됨** |
| v7 | **OS Pivot.** 투트랙 랜딩(입문자 L1 + 파워유저 L2). VibePM→킬러앱 1호. "대체하지 않습니다. 지휘합니다." Zero Data Leak. | 구현 대기 |

---

## v5.1 → v6 핵심 전환

### 무엇이 바뀌었나

**이전 (v5.1):**
- "You don't need to master AI. You need to ship."
- 경쟁적 톤 ("프롬프트가 문제다")
- 구조 > 프롬프트 (대결 구도)
- 4개 구조 레이어 (Intent / Lifecycle / Validation / State)

**이후 (v6):**
- "Keep your AI. Add structure."
- 비경쟁 톤 ("너의 AI 그대로 써")
- 공존 포지셔닝 ("우리는 위에 얹는다")
- **AI Boundary Layer** 카테고리 생성

### 왜 바뀌었나

시장의 모든 AI 도구가 "Replace X / Better than Y / Faster than Z" 경쟁을 하고 있다.

MUSU는 다른 방향:
> Keep X. Keep Y. Keep Z. Add structure.

이건 **충돌하지 않는 포지셔닝**이다. 기존 도구를 밀어내지 않고, 그 위에 얹는다.

### 카테고리 정의

MUSU는:
- ❌ AI 모델
- ❌ IDE
- ❌ 에이전트 프레임워크
- ❌ 워크플로우 도구

**MUSU = AI Boundary Layer**
> Deterministic Structure on Top of Probabilistic AI

---

## v6 → v6.1 핵심 전환

### "사기 냄새" 진단

v6까지는 철학 + 구조만 있었다. 문제:
- "구조가 있다", "경계가 있다" — 뻔지르르한 AI 스타트업 카피처럼 들림
- "그래서 실제로 뭐가 돌아가는데?" 에 답이 없음
- 기술자가 납득할 수 없음

### 해결: 3단 설득 구조

| 단계 | 역할 | 핵심 질문 |
|------|------|---------|
| **철학** | 카테고리 정의 | "이게 뭐지?" |
| **구조** | 레이어 설명 | "뭐가 있는데?" |
| **메커니즘** | 작동 원리 | "그래서 어떻게 돌아가는데?" |

v6.1에서 추가된 것:
1. **"How It Actually Works"** — 4단계 메커니즘 (구체적 동사: 검사, diff, 멈춤, 재시도)
2. **"Five Responsibilities"** — 기술→역할→결과 구조
3. **GO / FIX / BLOCK** — 결정론적 판정 시스템 명시

### 사기처럼 들리는 카피 vs 진짜 구조 설명

| 사기 냄새 | 진짜 메커니즘 |
|----------|------------|
| "We add structure." | "Every AI change passes through a deterministic validation pipeline before it is accepted into project state." |
| "We govern AI." | "A diff is computed. Scope boundaries are verified. Intent alignment is checked. Policy rules are applied." |
| "Intent is locked." | "Intent is stored as structured project metadata. Changes are diff-evaluated against declared scope." |

---

## v6.1 페이지 구조 (10섹션)

```
 1. Hero                — "Keep your AI. Add structure."
 2. Category Definition — "AI tools generate. MUSU governs."
 3. What MUSU Is        — The boundary layer 정의
 4. Why Structure       — 구조 부재가 진짜 문제
 5. The Structure       — 4개 구조 레이어 (철학)
 6. How It Actually Works — 4단계 메커니즘 (구체적 동사)
 7. Five Responsibilities — 5개 레이어의 책임 (기술→역할→결과)
 8. Why This Works      — "We don't compete. We contain."
 9. CPU Layer           — 비용 절감 + 실행 분리
10. Inside + CTA        — 내부 구조 + 행동 유도
```

---

## 킬러 라인 3개

1. **"MUSU doesn't replace your AI. It makes it safe to use in production."**
   — 전환 + 신뢰 + 포지셔닝 동시 잡기

2. **"AI proposes. MUSU enforces."**
   — 관계 정의. 말장난이 아니라 작동 원리.

3. **"MUSU does not remember intent. It enforces it."**
   — 사기 냄새 제거. 채팅 컨텍스트가 아닌 구조적 제약.

---

## 톤 & 원칙 (v6.1 확정)

1. **"Keep your AI. Add structure."**: 사이트 전체의 중심 축
2. **내부 용어 전면 금지**: CRDT, pgvector, QUIC, TLS, OODA, BitNet — `/architecture`에서만
3. **3단 설득**: 철학 → 구조 → 메커니즘
4. **하나의 제품**: Vibe PM / HiveLink / Musu Engine 외부 노출 안 함
5. **경쟁자 없음**: "우리는 경쟁하지 않는다. 우리는 기존 도구 위에 얹는다."
6. **카테고리 정의**: "AI Boundary Layer" — 새로운 카테고리를 만든다
7. **사기 냄새 제거**: "How It Actually Works"가 구체적 동사로 메커니즘을 보여준다

8. **"Free/Open Source" 금지**: 유료 전환 예정. "Included" / "Local Execution"으로 표현. "$0", "zero cost", "open source" 전면 제거.

---

## v6.1 배포 후 추가 변경

### 가격 메시징 전환 (2026-02-20)

유료 전환을 대비해 "무료" 강조 전면 제거:

| 이전 | 이후 |
|------|------|
| "Free" (pricing) | "Included" |
| "Free forever (open source)" | 삭제 |
| "Open Source Agent OS" | "The Boundary Layer for AI-Built Software" |
| "$0/month", "Zero Cost" | "No token consumption", "Local Execution" |
| "ZERO COST OPS" (badge) | "LOCAL EXECUTION" |

### 사이트 정리

- **Footer**: 죽은 링크 제거, 5컬럼 → 4컬럼 (Brand + The Structure / Developers / Community)
- **로고**: 정적 SVG 2종 (`public/logo-musu.svg`, `public/logo-musu-dark.svg`) — 3중 헥사곤 마크 + Inter ExtraBold 아웃라인 워드마크

---

## v6.1 → v7 핵심 전환

### 무엇이 바뀌었나

**이전 (v6.1):**
- "Keep your AI. Add structure."
- 단일 랜딩, 바이브 코더 전체 타겟
- MUSU = AI Boundary Layer
- HiveLink 외부 미노출, VibePM 외부 미노출

**이후 (v7):**
- "대체하지 않습니다. 지휘합니다."
- **투트랙 랜딩**: Landing 1(입문자, 기존 유지) + Landing 2(파워 유저, `/os` 신설)
- MUSU = **AI Operating System** (Boundary Layer를 포함하는 상위 개념)
- HiveLink → 핵심 기능으로 전면 노출 (원격 분산 실행)
- VibePM → MUSU OS의 **기본 탑재 킬러 앱 1호** (쇼케이스)

### 왜 바뀌었나

**곡괭이 전략(Pick and Shovel)**: VibePM(앱)보다 MUSU+HiveLink(인프라)에 가치가 집중되어 있다는 인사이트.

- 앱(VibePM)은 대체 가능, 레드오션
- 인프라(MUSU OS)는 대체 불가, 플랫폼

역사적 선례: Amazon(서점→AWS), Slack(게임→메신저)

### 핵심 포지셔닝 전환

| 항목 | v6.1 | v7 |
|------|------|-----|
| 정체성 | Boundary Layer | Operating System |
| 타겟 | 바이브 코더 전체 | 입문자(L1) + 파워유저(L2) 분리 |
| 경쟁 관계 | 비경쟁 ("위에 얹는다") | 비경쟁 강화 ("품고 굴린다") |
| HiveLink | 내부 레이어 | 킬러 기능 전면 노출 |
| VibePM | 미노출 | 기본 탑재 쇼케이스 |
| 보안 | 암묵적 | **Zero Data Leak** 전면 강조 |
| 가격 | 랜딩에 미노출 | 랜딩에서 돈 얘기 금지 (확정) |

### 킬러 카피 추가

| 문장 | 용도 |
|------|------|
| 대체하지 않습니다. 지휘합니다. | OS 랜딩 핵심 |
| 2개 이상을 섞어 쓰고 계십니까? | OS 랜딩 Hook |
| 당신의 소스코드는 단 1바이트도 우리 서버로 올라가지 않습니다. | Zero Data Leak |
| 당신의 툴은 그대로 쓰십시오. 그 밑바닥의 룰만 MUSU로 갈아 끼우시면 됩니다. | Closing |

### 보안 감사 (MUSU-036)

v7과 동시에 보안 감사 완료. P0/P1/P2 전량 조치 완료.
- RCE 차단 (sh -c 제거)
- HMAC-SHA256 mesh 인증
- Fail-Closed 강제화
- 상세: [security-posture-summary.md](security-posture-summary.md)

---

## 관련 문서

- [os-pivot-strategy.md](os-pivot-strategy.md) — v7 OS 피벗 전략 (곡괭이 전략, 투트랙)
- [landing-os-wireframe.md](landing-os-wireframe.md) — Landing 2 와이어프레임 (`/os`)
- [security-posture-summary.md](security-posture-summary.md) — 보안 감사 요약
- [landing-v2-direction.md](landing-v2-direction.md) — Landing 1 카피 (v2.2, "The Operator Beneath Your AI")
- [website-copy-draft.md](website-copy-draft.md) — v6.1 전체 카피
- [information-architecture.md](information-architecture.md) — 3계층 IA + Progressive Disclosure
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — /architecture 페이지 14섹션 스펙
- [musu-haerye.md](musu-haerye.md) — 훈민정음 해례본 구조 + MUSU 해례본 초안
