# MUSU 정보 아키텍처 — 3계층 모델 + Progressive Disclosure

> 최종 업데이트: 2026-02-20
> 원칙: 랜딩은 설교가 아니라 **레이어링**이다.

---

## 3계층 모델 개요

| 레벨 | 이름 | 질문 | 대상 |
|------|------|------|------|
| **L1** | Identity (철학) | "이게 뭐지?" | 의사결정자 |
| **L2** | Mechanism (구조) | "그래서 어떻게 되는데?" | 기술 리더 |
| **L3** | Proof (증거) | "진짜냐?" | 엔지니어 |

---

## L1 — Identity Layer (철학 계층)

### 목적
- 카테고리 정의
- 문제 재정의
- 세계관 고정
- "우리는 도구가 아니다"

### 랜딩 페이지 상단 구성

#### 1. Hero
```
Keep your AI. Add structure.
```

#### 2. Category Definition
```
AI tools generate.
MUSU governs.
```

#### 3. The Real Problem
```
You don't have a prompt problem.
You have a structure problem.
```

### L1 규칙
- 기술 용어 금지
- crate 이름 금지
- BitNet 금지
- CRDT 금지
- 감정과 철학으로만 구성

### 카테고리 고정 문장 (L1에 반드시 포함)
```
MUSU is not part of your AI stack.
It is the layer above it.
```

---

## L2 — Mechanism Layer (구조 계층)

### 목적
"그래서 실제로 어떻게 되는데?"에 답하기

### 섹션 구성

#### 4. The Structure (구조 설명)
- Intent becomes constraint
- Stage-gated lifecycle
- Deterministic validation
- Persistent project state
- Execution separation

각 레이어는 다음 형태:
```
What it does
Why it matters
What it replaces
```

#### 5. How It Actually Works (작동 흐름)

시나리오 기반. 구체적 동사 필수.

```
Prompt → Draft → Structural Check → Policy Check → State Update → Accept
```

**이 부분이 사기 냄새를 제거한다.**

#### 6. Five Responsibilities (책임 아키텍처)
- Prime → Direction
- Engine → Execution
- Mesh → Distribution
- Control → Judgment
- Memory → Continuity

### L2 규칙
- "기술 → 역할 → 결과" 패턴
- 내부 구현 디테일 없음
- 역할과 책임 중심
- 구체적 동사 사용 (검사한다, diff를 본다, 멈춘다, 재시도한다)

---

## L3 — Proof Layer (증거 계층)

### 목적
"이거 진짜냐?"에 답하기

### 섹션 구성

#### 7. Inside MUSU
여기서 내부 구조 공개:
- Planning & Control
- Execution Engine
- Private Mesh

여기부터 기술 키워드 등장 가능.

#### 8. Architecture Deep Dive (/architecture 별도 페이지)
- Prime / Engine / Mesh / Control / Memory
- Rust crate 이름
- BitNet 1.58-bit
- QUIC 프로토콜
- CRDT
- pgvector
- 테스트 수치

#### 9. Code / GitHub
- 실제 코드 링크
- 예제 프로젝트
- 실행 영상

### L3 규칙
- 모든 기술 디테일 허용
- 증거 기반 (숫자, 코드, 테스트)
- 회의론자를 위한 구성

---

## 사이트맵 (최종 구조)

```
/
 ├─ L1: Identity
 │   ├─ Hero
 │   ├─ Problem
 │   └─ Category Definition
 │
 ├─ L2: Mechanism
 │   ├─ The Structure (4 Layers)
 │   ├─ How It Actually Works (4 Steps)
 │   └─ Five Responsibilities
 │
 ├─ L3: Proof
 │   ├─ Inside MUSU
 │   ├─ CPU Layer
 │   ├─ /architecture (Deep Dive)
 │   └─ GitHub / Code
 │
 ├─ /docs
 ├─ /pricing
 └─ /architecture
```

---

## Progressive Disclosure (점진적 공개) 전략

### 정의

정보를 단계별로 제시하는 전략:
1. 처음엔 **철학** (Identity)
2. 스크롤하면 **구조** (Mechanism)
3. 더 보면 **코드** (Proof)

### 방문자 유형별 깊이

| 방문자 유형 | 원하는 답변 | 머물 위치 |
|-----------|-----------|---------|
| 의사결정자 | "이게 뭐지?" | L1 Identity |
| 기술 리더 | "실제로 어떻게 되는데?" | L2 Mechanism |
| 엔지니어 | "진짜냐?" | L3 Proof |

### 스크롤 흐름

```
① Hero & Problem (철학)
   ↓
② How It Works (구조)
   ↓
③ How It Actually Runs (실행 흐름)
   ↓
[Optional] Deep Dive 링크
   ↓
④ /architecture 별도 페이지 (전체 증거)
```

### 각 섹션 하단 버튼 패턴

```
Why this layer exists →        (L1→L2 연결)
How it works technically →     (L2→L3 연결)
See code →                     (L3→GitHub 연결)
```

---

## 일반 랜딩 vs 계층형 랜딩

### 일반 랜딩 (도구형)
```
기능 설명
기능 설명
기능 설명
가격표
CTA
```

### 계층형 랜딩 (MUSU)
```
문제 재정의       ← L1
  ↓
세계관 선언       ← L1
  ↓
작동 구조        ← L2
  ↓
[선택] 증거      ← L3
```

### 계층형 구조의 효과
- 신뢰 상승
- 깊이감 전달
- "허세"로 안 보임
- 각 방문자가 자신의 깊이만큼 읽을 수 있다는 안도감

---

## Architecture 페이지 시작 문장

```
You don't need to read this.
But if you want proof, it's all here.
```

이게 자신감이다.

---

## 관련 문서

- [positioning-evolution.md](positioning-evolution.md) — v1→v6.1 포지셔닝 진화
- [website-copy-draft.md](website-copy-draft.md) — v6.1 전체 카피
- [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) — /architecture 페이지 스펙
- [musu-haerye.md](musu-haerye.md) — 훈민정음 해례본 구조
