# MUSU 전략 문서 인덱스

> musu.pro 웹사이트의 포지셔닝, 카피, 아키텍처 전략 문서

---

## 문서 목록

| 문서 | 설명 | 상태 |
|------|------|------|
| [website-copy-draft.md](website-copy-draft.md) | v6.1 전체 랜딩 페이지 카피 (10섹션) | **확정** |
| [positioning-evolution.md](positioning-evolution.md) | v1→v6.1 포지셔닝 진화 기록 | 기록 |
| [positioning-brief.md](positioning-brief.md) | MUSU 포지셔닝 브리프 (Rev.2) | 승인 |
| [information-architecture.md](information-architecture.md) | 3계층 IA 모델 (L1/L2/L3) + Progressive Disclosure | 확정 |
| [architecture-deep-dive-spec.md](architecture-deep-dive-spec.md) | /architecture 페이지 14섹션 스펙 | 확정 |
| [musu-haerye.md](musu-haerye.md) | 훈민정음 해례본 구조 + MUSU 해례본 초안 | 내부용 |
| [tech-fact-check.md](tech-fact-check.md) | 사이트 콘텐츠 vs 실제 코드 기술 팩트체크 | 검증 완료 |
| [p15-prime-system.md](p15-prime-system.md) | P15 Prime System 아키텍처 현황 (Think→Simulate→Act) | 검증 완료 |
| [block-chain-chunking.md](block-chain-chunking.md) | Block Chain Chunking 아키텍처 (의미 블록 + 체인 링크) | 검증 완료 |
| [rag-enable.md](rag-enable.md) | MUSU-027 RAG 활성화 (pgvector + Hybrid Search) | 검증 완료 |
| **[intent-lifecycle.md](intent-lifecycle.md)** | **Intent Capture + Lifecycle Enforcement (캡처 ✅, 강제 ❌)** | **검증 완료** |
| **[system-data-flow.md](system-data-flow.md)** | **전체 시스템 데이터 플로우 (Intent↔P15↔Block Store↔RAG 교차 연결)** | **검증 완료** |
| **[architecture-review.md](architecture-review.md)** | **5개 아키텍처 문서 정성적 리뷰 + 잔여 개선사항 3건** | **리뷰 완료** |
| **[os-pivot-strategy.md](os-pivot-strategy.md)** | **v7 OS 피벗 전략 — 곡괭이 전략, 투트랙 랜딩, VibePM→킬러앱** | **확정** |
| **[landing-os-wireframe.md](landing-os-wireframe.md)** | **Landing 2 (`/os`) 와이어프레임 6블록** | **확정** |
| **[security-posture-summary.md](security-posture-summary.md)** | **MUSU-036 보안 감사 기술 요약 (P0/P1/P2 전량 완료)** | **확정** |
| **[security-whitepaper.md](security-whitepaper.md)** | **보안 백서 — 정식 + 동네 아저씨 번역 (B2B/랜딩용)** | **확정** |
| **[architecture-marketing-points.md](architecture-marketing-points.md)** | **아키텍처→마케팅 매핑 — 뇌/손발 분리, 토큰 경제학, Time Stone, 아재 번역** | **확정** |
| **[security-landing-copy-raw.md](security-landing-copy-raw.md)** | **보안 카피 원본 — Zero Data Leak, 백서 + 동네 아저씨 번역, 샷건 드립** | **원본 보존** |
| **[landing-os-copy-raw-v2.md](landing-os-copy-raw-v2.md)** | **Landing 2 카피 원본 V2 — 와이어프레임 V2, P15 마케팅, 벤 삼촌 철학, Warden 샷건 UI** | **원본 보존** |
| **[os-deepdive-wireframe.md](os-deepdive-wireframe.md)** | **/os 딥다이브 v2 — 담백 톤 재작성 + Air-Gapped/BYOM 블록 추가** | **와이어프레임 확정** |
| **[landing-v7-integration.md](landing-v7-integration.md)** | **v7.0 통합 랜딩 설계도 — 7섹션, Progressive Disclosure, 두 페이지 통합** | **구현 완료** |
| **[user-scenario-copy.md](user-scenario-copy.md)** | **사용 시나리오 카피 — 3단계 흐름 + 작은 AI 조수/교도관 + 히어로&사이드킥 비유** | **확정** |
| **[ux-scenario-gap.md](ux-scenario-gap.md)** | **UX 시나리오 부재 분석 — "이게 뭔지" → "쓰면 뭐가 달라지는지"** | **분석 완료** |
| **[competitive-landscape.md](competitive-landscape.md)** | **전체 경쟁 지형도 — AI Agent/IDE/CLI/Platform vs MUSU 레이어** | **확정** |
| **[competitive-openclaw.md](competitive-openclaw.md)** | **OpenClaw 상세 분석 — "AI가 도구를 쓴다" vs "AI가 도구가 된다"** | **확정** |
| [landing-v2-direction.md](landing-v2-direction.md) | Landing 1 v2.2 카피 — "The Operator Beneath Your AI" | 확정 |

---

## 현재 상태

- **배포됨 (musu.pro)**: v6.1 카피 — "Keep your AI. Add structure." (AI Boundary Layer)
- **v7 (구현 대기)**: OS Pivot — 투트랙 랜딩 (L1 유지 + L2 `/os` 신설)
- v5.1 ("You don't need to master AI. You need to ship.") → 폐기
- **가격 정책**: "Free/Open Source" 표현 전면 제거. 랜딩에서 돈 얘기 금지.
- **로고**: `public/logo-musu.svg` (투명), `public/logo-musu-dark.svg` (다크) — 헥스 마크 + Inter ExtraBold 아웃라인

---

## 완료된 작업

- [x] v6.1 카피 → React 컴포넌트 구현 (10섹션) — `36877af`
- [x] 네비게이션 업데이트 (Header/Footer v6.1) — `36877af`
- [x] Free/Open Source 메시징 제거 + Footer 정리 — `ed79624`
- [x] 정적 MUSU 로고 SVG 생성 — `ed79624`
- [x] v7 OS 피벗 전략 문서화 (2026-02-22)
- [x] Landing 2 와이어프레임 문서화 (2026-02-22)
- [x] 보안 감사 요약 + 백서 문서화 (2026-02-22)
- [x] 아키텍처→마케팅 포인트 매핑 문서화 (2026-02-22) — MUSU-040/038 기반
- [x] Landing 2 (`/os`) 구현 완료 + 빌드 검증 (2026-02-22)

## 다음 단계

1. ~~Landing 2 구현: `src/app/os/page.tsx` (6블록)~~ ✅ 완료
2. ~~상단 네비에 `[MUSU OS]` 탭 추가~~ ✅ 완료
3. **Hero 카피 업그레이드**: "생각은 Gemini Pro가. 행동은 MUSU가." 반영 검토
4. Landing 1에 파워 유저 배너 삽입
5. /architecture 페이지 → 14섹션 Deep Dive로 교체
6. Progressive Disclosure UX 구현

---

## 핵심 원칙 요약

```
v6.1 (배포됨):
  카테고리:    AI Boundary Layer
  포지셔닝:    Keep your AI. Add structure.
  설득 구조:   철학 → 구조 → 메커니즘
  킬러 라인:   "AI proposes. MUSU enforces."

v7 (구현됨 — /os 라이브):
  카테고리:    AI Operating System
  포지셔닝:    대체하지 않습니다. 지휘합니다.
  설득 구조:   호기심 → 솔깃함 → 신뢰 → 안심 → 결심
  킬러 라인:   "당신의 툴은 그대로 쓰십시오. 그 밑바닥의 룰만 MUSU로 갈아 끼우시면 됩니다."
  뇌/손발:     "생각은 Gemini Pro가. 행동은 MUSU가."
  투트랙:      L1(입문자, 기존) + L2(파워유저, /os)
  보안:        Zero Data Leak 전면 강조
```
