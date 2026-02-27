# MUSU 통합 랜딩 페이지 설계도 v7.0

> 작성일: 2026-02-22
> 소스: VibePM 분석 + 대표 피드백 + 기존 전략 문서 종합
> 용도: musu.pro 메인 랜딩 + /os 페이지 통합 리디자인 스펙
> 상태: 설계 완료, 구현 대기

---

## 핵심 전략: 두 페이지를 하나의 퍼널로

### 현재 문제

- `musu.pro`: 입문자용. "I just wanted to build something" — 감성적이지만 MUSU가 뭔지 구체적으로 안 보임
- `musu.pro/os`: 파워유저용. 기능 설명은 있지만 "깔면 뭐가 달라지는지" 사용 시나리오 없음
- **두 페이지 다 "그래서 내가 뭘 하는 건데?"라는 질문에 답 못함**

### 해결: Progressive Disclosure (점진적 공개)

한 페이지 안에서:
- **상단 (0~30%)**: 직관적 유혹 — 비유로 "아하" 시키기
- **중단 (30~70%)**: 기술적 확신 — 기능/아키텍처로 "와 미쳤네" 시키기
- **하단 (70~100%)**: 보안/신뢰 — 불안 제거 후 다운로드

---

## 통합 섹션 설계 (7섹션)

### Section 1. Hero: The Great Split (뇌와 손발의 분리)

- **Main Copy:** "The AI thinks. MUSU acts."
- **Sub Copy:** "Your genius AI needs a partner who keeps it safe, catches its mistakes, and cuts your bill by 95%."
- **비주얼:** 어두운 배경에 AI 도구 로고들(작게) + MUSU 헥스 로고(크게)
- **CTA:** `[ Coming Soon ]` (disabled)
- **아래 작은 글씨:** 도구 나열 — Cursor · Claude Code · Windsurf · Codex CLI · OpenClaw...

### Section 2. The Partner: 히어로와 사이드킥

- **Concept:** "왜 당신의 천재 AI에게 파트너가 필요한가?"
- **3단 비교 카드:**

| 히어로 (AI) | 사이드킥 (MUSU) | 유저 이득 |
|------------|----------------|----------|
| 고차원 추론, 코드 생성 | 위험 명령 차단 (Warden) | 시스템 안전 |
| 100MB 로그 통째로 읽으려 함 | 필요한 5줄만 추출 (Holodeck) | 토큰 95% 절감 |
| 목표 이탈, 삼천포 | 원래 의도 고정 (Intent) | 계획대로 진행 |

- **Uncle line:** "I gave my AI unsupervised access for a week. Lost two projects. Built the partner the next day."

### Section 3. How It Works: 3단계 시나리오

유저가 MUSU를 깔고 나서 실제로 겪는 흐름:

**Step 1: Install & Import**
- MUSU .exe 더블클릭
- "Found Cursor, 4 MCP servers" 팝업
- [Import All] 클릭 → 끝

**Step 2: Code as Usual**
- 평소처럼 Cursor/Claude Code로 코딩
- AI가 코드 제안 → MUSU가 백그라운드에서 시뮬레이션
- 검증된 결과만 디스크에 기록

**Step 3: Approve from Anywhere**
- AI가 위험 행동 시도 → 폰에 푸시 알림
- [Approve] / [Reject] 한 번 탭
- 끝. 커피 계속 마시면 됨

### Section 4. The Mechanism: 조수의 매뉴얼 (기존 Layer 1-4 활용)

기존의 4단계 레이어 아키텍처를 "조수가 업무를 처리하는 4가지 원칙"으로 리프레이밍:

1. **Intent (의도 잠금):** 보스의 명령이 변질되지 않게 고정
2. **Lifecycle (단계 집행):** 건너뛰기 없는 철저한 공정 관리
3. **Validation (시뮬레이션):** 실수가 배포되지 않게 가상 공간에서 먼저 실행
4. **State (영구 기억):** 모든 행동을 기록하여 잊지 않는 조력자

### Section 5. The Superpowers: P15 Engine (기존 3카드 활용)

기존 P15 Engine 카드를 유지하되, 카피를 "작은 AI의 초능력"으로 리프레이밍:

- **Holodeck (토큰 95% 삭감):** "Your AI was feeding on 100MB logs. I taught it to grep."
- **Time Stone (시뮬레이션):** "Mistakes don't ship. Only the simulated-and-verified version does."
- **Block Chain Chunking:** "Other tools chop code into 500-char blocks. I split at meaning boundaries."

### Section 6. Security: Zero Data Leak + Mobile Warden

기존 Zero Data Leak + 모바일 승인 통합:

- **Copy:** "The only thing we collect is your billing email. That's it."
- **보안 배지:** HMAC-SHA256 · Fail-Closed · DLP Built-in
- **모바일 목업:** 폰에 뜬 [Approve] / [Reject] 푸시 알림 UI
- **P2P:** "No relay server. Device-to-device. QUIC encrypted."

### Section 7. Final: 다운로드

- **Copy:** "Keep your tools. Just swap the rules beneath them."
- **CTA:** `[ Coming Soon ]` (disabled)
- **캡션:** "Windows · macOS · Linux"

---

## `/os` 페이지의 새 역할

통합 메인이 완성되면, 기존 `/os`는:
- **"Technical Deep-Dive"** 페이지로 전환
- **공식 정체성: "The World's First On-premise Protected AI Orchestration System"**
  - On-premise: 데이터가 유저의 로컬 기기를 떠나지 않음
  - Protected: Warden 샷건 + Sandbox 시뮬레이션 + DLP
  - AI Orchestration: 여러 AI 도구를 MUSU가 지휘/통제
- 메인에서 "Want the technical deep-dive?" 링크로 연결
- P15 상세 스펙, Warden 에러 코드, HiveLink 프로토콜 등 엔지니어/CISO용 콘텐츠
- 메인 랜딩은 "로빈/왓슨" 쉬운 비유, 딥다이브는 엔터프라이즈 격식 용어

---

## 기존 콘텐츠 처리 방침

### musu.pro (현재 Landing 1)에서 가져올 것

| 기존 요소 | 처리 |
|-----------|------|
| "I just wanted to build something" 감성 Hero | → Section 1에 톤 흡수 |
| "One .exe file. That's the whole setup." | → Section 3 Step 1로 이동 |
| "Auto-restart, Rollback, 24/7 uptime" | → Section 5 또는 별도 Production Mode로 |
| "Build what you meant to" | → Section 7 closing copy 후보 |

### musu.pro/os (현재 Landing 2)에서 가져올 것

| 기존 요소 | 처리 |
|-----------|------|
| "The AI thinks. MUSU acts." Hero | → Section 1 메인 카피 확정 |
| Vampire (설정 흡수) UI 목업 | → Section 3 Step 1 비주얼 |
| P15 Engine 3카드 | → Section 5 유지 |
| Warden 3카드 | → Section 2 파트너 카드로 통합 |
| Zero Data Leak + 보안 배지 | → Section 6 유지 |
| HiveLink 다이어그램 | → Section 6 또는 별도 |

### 버리는 것

- 없음. 전부 재배치.

---

## 퍼널 심리 흐름

```
Section 1 (Hero)     → "오, 뭔가 다른데?" (호기심)
Section 2 (Partner)  → "아, AI 옆에 파트너를 붙여주는 거구나" (이해)
Section 3 (How)      → "깔면 이렇게 되는 거구나" (구체적 그림)
Section 4 (Layers)   → "와, 체계적이네" (신뢰)
Section 5 (P15)      → "미친, 토큰 95% 절감?" (탐욕)
Section 6 (Security) → "데이터도 안전하네" (안심)
Section 7 (Download) → "깔아야겠다" (행동)
```

---

## 관련 문서

- [user-scenario-copy.md](user-scenario-copy.md) — 시나리오 카피 + 히어로&사이드킥
- [ux-scenario-gap.md](ux-scenario-gap.md) — UX 시나리오 부재 분석
- [competitive-landscape.md](competitive-landscape.md) — 경쟁 지형도
- [os-pivot-strategy.md](os-pivot-strategy.md) — v7 투트랙 전략 (이전 버전)
- [website-copy-draft.md](website-copy-draft.md) — v6.1 카피 (이전 버전)
