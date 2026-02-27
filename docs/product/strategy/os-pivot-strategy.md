# MUSU OS Pivot Strategy — "곡괭이 전략"

> 상태: 전략 확정, 구현 대기
> 결정일: 2026-02-22
> 이전 버전: landing-v2-direction.md (v2.2, "The Operator Beneath Your AI")

---

## 핵심 통찰: 제품이 아니라 운영체제

VibePM으로 시작한 프로젝트에서 MUSU Engine과 HiveLink가 파생되었으나,
실제 가치는 파생물(인프라)에 집중되어 있다.

```
시작: VibePM (AI 프로젝트 매니저)
  → MUSU Engine (VibePM을 제대로 굴리려고 만듦)
    → HiveLink (집 밖에서도 쓰려고 만듦)

가치 역전:
  VibePM = 앱 (대체 가능, 레드오션)
  MUSU + HiveLink = OS/인프라 (대체 불가, 플랫폼)
```

### 역사적 선례

| 회사 | 원래 제품 | 파생 인프라 | 결과 |
|------|----------|-----------|------|
| Amazon | 온라인 서점 | 내부 서버 인프라 → AWS | 영업이익 70%가 AWS |
| Slack | Glitch (게임) | 내부 메신저 | 게임 폐기, 메신저가 본업 |
| MUSU | VibePM (AI PM) | MUSU Engine + HiveLink | **인프라가 본업** |

---

## 전략적 재정의

### 이전

> "AI 프로젝트 관리 툴(VibePM)을 만듭니다."

### 이후

> "AI 에이전트들을 통제하고 연결하는 운영체제(MUSU OS)를 만듭니다."

### VibePM의 새 역할

VibePM은 버리지 않는다. **Apple 전략**을 취한다.

- **MUSU OS** = 진짜 상품 (플랫폼)
- **VibePM** = MUSU OS에 기본 탑재되는 **킬러 앱 1호** (쇼케이스)

Apple이 iPhone에 Safari/카메라를 기본 탑재하듯,
MUSU를 깔면 VibePM이 기본 제공되어 OS의 위력을 증명한다.

유저는 VibePM을 쓰려고 들어왔다가 → MUSU의 통제력과 HiveLink 원격망에 갇히고 →
나중에는 자기들의 다른 AI 에이전트들까지 전부 MUSU 위에 올려놓게 된다.

---

## 곡괭이 전략 (The Pick and Shovel Strategy)

금광 캐는 놈들한테 곡괭이를 팔아라.

- **VibePM (드릴)**: AI 앱. ChatGPT, Claude, Cursor 등 수만 개의 드릴이 매일 쏟아지는 레드오션.
- **MUSU + HiveLink (발전소)**: 이 수많은 드릴들에 전기를 공급하고, 헛돌지 않게 제어하고, 원격으로 통제하는 **운영체제**.

사람들은 특정 AI 앱에 질리면 갈아타지만,
"내 컴퓨터를 AI의 완벽한 샌드박스로 만들어주는 MUSU"는 한번 깔면 지우지 못한다.
플랫폼이 되어버렸기 때문이다.

---

## 핵심 포지셔닝 전환

### 절대 원칙: 대체가 아니라 통합

> **MUSU OS는 기존 프로그램들을 대체하지 않는다.**
> **버리는 게 아니다.**
> **저것들을 더 쉽고 간편하게, 그리고 더 안전하게 쓸 수 있는 OS다.**

이 문장이 유저가 결제 버튼 직전에 느끼는 가장 큰 심리적 장벽
("또 새로운 툴 배워야 해? 내 Cursor 버려야 해?")을 1초 만에 박살 낸다.

Windows가 Chrome을 대체하지 않고 품어주듯,
MUSU는 기존 툴들을 대체하는 게 아니라 **품고 굴리는 운영체제**다.

### 경쟁 구도의 소멸

타사 AI 툴과 경쟁하지 않는다.
오히려 그 툴들이 유명해질수록 "그걸 제일 잘 굴려주는 건 MUSU"라는 공식이 성립되어
모든 AI 트래픽을 무임승차시킬 수 있다.

---

## 투트랙 랜딩 전략

### Landing 1: 입문자용 (현재 `musu.pro`, 유지)

- **타겟**: AI 툴 써보려다 Docker, WSL 설정하다가 빡친 사람들
- **메시지**: "세팅 개빡치지? 그냥 `.exe` 하나 깔고 더블클릭해."
- **기존 카피**: "I just wanted to build something. Not study AI."
- **SEO 키워드**: "AI 에이전트 쉬운 설치", "도커 없이 AI 돌리기"
- **처리**: 기존 그대로 유지. 절대 건드리지 않음.

### Landing 2: 파워 유저용 (새로 만듦 `musu.pro/os`)

- **타겟**: 이미 Cursor, Claude Desktop, MCP를 쓰면서 세팅 지옥과 기기 파편화에 지친 헤비 유저
- **메시지**: "니들 AI 툴 10개 쓰면 뭐해? 통제도 안 되고 폰으론 안 돌아가는데. 기존 세팅 1초 만에 훔쳐 와서 하나로 묶어줄게."
- **SEO 키워드**: "MCP 라우터", "Cursor 설정 동기화", "원격 AI 실행"
- **구현**: `src/app/os/page.tsx`
- **와이어프레임**: `strategy/landing-os-wireframe.md` 참조

### Landing 1 → Landing 2 연결

현재 메인 페이지 스크롤 중간에 도발적 배너 삽입:

> **"혹시 이미 Cursor나 Claude Desktop을 쓰고 계십니까?"**
> 고생해서 맞춰둔 MCP 설정과 스킬(.cursorrules)들,
> 전환 비용 제로로 1초 만에 흡수해서 통제망을 씌워드립니다.
> **[ MUSU OS가 타사 AI 툴을 흡수하는 방법 보기 →  ]**

또는 상단 네비게이션에 `[For Power Users]` / `[MUSU OS]` 탭 추가.

---

## 킬러 카피 (확정)

| 순위 | 문장 | 용도 | 비고 |
|------|------|------|------|
| 1 | AI writes code. MUSU decides if it lives. | Hook (풀스크린) | v2에서 계승 |
| 2 | 대체하지 않습니다. 지휘합니다. | OS 랜딩 핵심 | 신규 |
| 3 | Cursor, Claude Code, OpenDevin... 이 중 2개 이상을 섞어 쓰고 계십니까? | OS 랜딩 Hook | 신규 |
| 4 | 당신의 툴은 그대로 쓰십시오. 그 밑바닥의 룰(Rule)만 MUSU로 갈아 끼우시면 됩니다. | OS 랜딩 Closing | 신규 |
| 5 | Keep your AI. Add an operator. | 메인 랜딩 Hero | v2에서 계승 |

---

## 유저 심리 변화 (퍼널)

1. **호기심**: "어? 나 Cursor 쓰는데... 이게 더 좋은가?"
2. **솔깃함**: "내가 세팅해 둔 거 버튼 한 번에 다 가져온다고?"
3. **신뢰**: "AI가 가끔 미쳐 날뛰는데, 얘가 중간에서 막아주네."
4. **결제**: "밖에서 똥컴으로 집 컴터 자원을 다 끌어쓴다고?"

---

## 가격 정책

- **랜딩 페이지에서 돈 얘기 하지 않음** (확정)
- 가격 구분은 별도 페이지 또는 앱 내에서만 노출
- Production Mode에만 과금하는 방향 (Build = 무료, Run = 유료)

---

## 기존 v2 랜딩과의 관계

| 항목 | v2 (landing-v2-direction.md) | v7 (이 문서) |
|------|---------------------------|-------------|
| 스코프 | 메인 랜딩 1개 | 투트랙 (Landing 1 유지 + Landing 2 신설) |
| 타겟 | 바이브 코더 전체 | 입문자 (L1) + 파워 유저 (L2) 분리 |
| 포지션 | Operator (운영자) | OS (운영체제) — Operator를 포함하는 상위 개념 |
| 핵심 카피 | "Keep your AI. Add an operator." | "대체하지 않습니다. 지휘합니다." |
| 킬러 앱 | 언급 없음 | VibePM = 기본 탑재 쇼케이스 |
| HiveLink | 언급 없음 | 핵심 기능 (원격 분산망) |

**v2의 내용은 Landing 1에 유지**. 이 문서는 v2를 대체하는 것이 아니라 **상위 전략 + Landing 2를 추가**하는 것.

---

## 다음 단계

- [ ] Landing 2 와이어프레임 확정 → `landing-os-wireframe.md`
- [ ] `src/app/os/page.tsx` 구현
- [ ] Landing 1에 파워 유저 배너 삽입
- [ ] 상단 네비에 `[MUSU OS]` 탭 추가
- [ ] positioning-evolution.md에 v7 기록
- [ ] VibePM → "기본 탑재 앱" 리브랜딩 반영 (products 문서)

---

## 관련 문서

- [landing-v2-direction.md](landing-v2-direction.md) — v2 "The Operator Beneath Your AI" (Landing 1용)
- [landing-os-wireframe.md](landing-os-wireframe.md) — Landing 2 와이어프레임
- [security-posture-summary.md](security-posture-summary.md) — 보안 감사 기술 요약
- [security-whitepaper.md](security-whitepaper.md) — 보안 백서 (정식 + 동네 아저씨 번역)
- [positioning-evolution.md](positioning-evolution.md) — 포지셔닝 진화 타임라인
- [positioning-brief.md](positioning-brief.md) — 전략적 방향, 경쟁 포지셔닝
