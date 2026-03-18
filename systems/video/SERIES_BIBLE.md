# Vibecode Town — Series Production Bible

> **Version**: 1.0
> **Date**: 2026-03-17
> **Status**: SSOT — 이 문서가 이후 모든 제작의 단일 진실 원천(Single Source of Truth)
> **Style**: 2D Flat Vector (Kurzgesagt level)

---

## PART A: IDENTITY

---

### A1. 시리즈 콘셉트

**로그라인**
코딩 모르는 Vee가 AI로 뭔가 만들려다 매번 망하고, 그 과정에서 진짜 원리를 배우는 2D 애니메이션.

**콤프**
"Kurzgesagt meets Claudius Papirus, starring a Duolingo-style character"

**레퍼런스 티어**

| Tier | 채널 | 가져오는 것 |
|------|------|------------|
| **S (핵심 DNA)** | Kurzgesagt | 2D flat vector 비주얼 기준, 에피소드별 팔레트, 캐릭터 브랜딩 |
| | Claudius Papirus | 마스코트+다크배경, 소스 기반 스크립트, 속보+깊이 |
| **A (기법 채택)** | Veritasium | 오해-먼저 구조 (misconception-first), 색 코딩 오답/정답 |
| | PolyMatter | 역설 훅, 미드포인트 리프레임, 솔로 flat vector 증명 |
| **B (참고)** | Johnny Harris | 앵커-브릿지 사이클, 음악 3모드(thinky/feely/fun) |
| | Wendover | 캐스케이드 리빌, 점진적 다이어그램 빌드 |
| | RealLifeLore | 프랜차이즈 시리즈, "What If" 훅, 볼륨 전략 |

> 상세: `systems/planning/09-youtube-channel-research-v2.md`

**포맷**
- 3-5분 에피소드 (타겟: 3분 30초)
- 80% 다이어그램 / 모션그래픽 + 20% Vee 리액션 컷 (1-2초씩)
- 나레이터 보이스오버 + Vee 무언극
- 주 1회 롱폼 + 주 3-4회 Shorts

**핵심 가치**
1. 실패로 가르친다 — 강의하지 않는다
2. 보여준다 — 설명하지 않는다
3. 재밌다 — 유익한 건 덤이다

---

### A2. 교육 철학

**"실패 스토리로 가르친다, 강의하지 않는다"**

Veritasium 방식을 채택한다:
1. **오해를 먼저 보여준다** — "AI가 다 해주니까 스펙 필요 없지?"
2. **왜 틀린지 체감시킨다** — 월요일 아침, 아무것도 안 돌아감
3. **진짜 답을 발견하게 한다** — 시청자가 답을 스스로 깨닫는 느낌

**Mayer 멀티미디어 학습 원칙 적용**

| 원칙 | 적용 |
|------|------|
| Coherence | 장식 금지. 모든 비주얼은 내러티브에 기여해야 함 |
| Modality | 나레이션(청각) + 비주얼(시각) 동시. 텍스트 오버레이 최소화 |
| Personalization | 대화체 나레이션. "여러분"이 아니라 "너" |
| Signaling | 핵심 개념에 시각적 강조 (색 변화, 줌, 느린 모션) |
| Segmenting | 20-30초 단위 비트로 쪼갬. 각 비트 = 하나의 씬 |

**3Blue1Brown 발견 구조**
- 정의로 시작하지 않는다. 정의는 도착점이다
- "이상하지 않아?" → "왜 그럴까?" → "아, 그래서!" 순서
- Aha 모먼트를 향해 빌드한다

---

### A3. 톤 & 보이스 가이드

**나레이터 페르소나**
"똑똑한 친구가 술집에서 설명하는 느낌"
— 전문적이지만 격식 없고, 위트 있지만 냉소적이지 않고, 직설적이지만 무례하지 않다.

**We Say / Never Say**

| O (이렇게 말한다) | X (절대 이렇게 안 한다) |
|-------------------|------------------------|
| "망했어. 왜인지 알아보자." | "이 개념을 이해하는 것이 중요합니다." |
| "847번째 줄이 열린 문이었다." | "보안 취약점이 감지되었습니다." |
| "AI가 만들었고, 나는 승인했고, 서버가 터졌다." | "코드 품질 관리가 미흡했습니다." |
| "스파게티가 됐어. 맛없는 스파게티." | "코드 구조가 최적화되지 않았습니다." |
| "이거 보면 알겠지만, 완전 뻥이었어." | "해당 가정은 사실과 달랐습니다." |
| "3일 걸렸어. 답은 한 줄이었고." | "상당한 시간 투자 후 해결책을 발견했습니다." |
| "월요일 아침. 아무것도 안 돌아감." | "시스템 장애가 발생했습니다." |
| "테스트? 그게 뭔데?" | "테스트 커버리지가 부족했습니다." |
| "코드 10,000줄. 쓸모있는 건 3,000줄." | "코드베이스 최적화를 통해 70% 감소했습니다." |
| "알겠지? 그럼 다음 거." | "이상으로 해당 주제를 마무리하겠습니다." |

**Vee 보이스 규칙**
- Vee는 말하지 않는다. 절대.
- 나레이터가 전부 설명한다.
- Vee는 감정만 시각적으로 표현한다 (표정 + 몸짓).
- Vee 리액션 컷: 에피소드당 최대 6번, 각 1-2초.

**나레이션 스타일 수치**
- 속도: 150-180 WPM (Fireship보다 약간 느림, 명확성 우선)
- 톤: Conversational, slightly conspiratorial
- 강조: 핵심 단어에 약간의 피치 변화 + 0.3초 pause
- 유머: 드라이 위트, 자기비하, 언더스테이트먼트

---

### A4. 타겟 오디언스

**페르소나: "바이브 코더"**

AI로 빌드하지만 코드를 읽지 못하는 사람. ChatGPT에게 "앱 만들어줘"라고 말하고, 돌아가면 성공이라 생각하는 사람. 그리고 월요일 아침에 아무것도 안 돌아가는 걸 발견하는 사람.

**데모그래픽**
- 25-45세
- ChatGPT / Claude / Cursor / Copilot 일상 사용자
- 개발자가 아닌 사람 (디자이너, PM, 창업자, 마케터)
- 또는 주니어 개발자 중 AI 의존도 높은 사람

**그들의 고통**
- "돌아가는데 왜 터지지?"
- "코드를 못 읽는데 어떻게 고치지?"
- "AI가 매번 다른 답을 줘"
- "파일이 30개인데 뭐가 뭔지 모르겠어"

**그들이 원하는 것**
- AI를 더 잘 쓰는 법 (프롬프트 아님, 프로세스)
- 코드를 읽지 않고도 문제를 파악하는 방법
- "이런 식으로 하면 안 터진다"는 확신

**검색 키워드 (SEO)**
- "vibe coding tutorial"
- "build app without code"
- "AI coding for beginners"
- "why does my AI code break"
- "how to use cursor/copilot effectively"
- "no code app development AI"

---

## PART B: WORLD & CHARACTERS

---

### B5. 비주얼 스타일 바이블

**스타일 포지셔닝**
```
Kurzgesagt ←——[Vibecode Town]——→ Duolingo
(초미니멀)      (Level 2.5)        (게이미피케이션)
```

2D flat vector, Level 2-2.5. 기본 도형 조합. 얇은 균일 아웃라인.

**색상 시스템**

캐릭터 팔레트 (불변):

| 요소 | Hex | 이름 |
|------|-----|------|
| 후디 | `#FFD93D` | Vee Yellow |
| 머리카락 | `#6D4C2F` | Cocoa Brown |
| 피부 | `#FDEBD0` | Warm Cream |
| 안경/아웃라인 | `#2D2D2D` | Near Black |

에피소드 테마 컬러 (가변):

| 용도 | 예시 | 규칙 |
|------|------|------|
| 배경 주색 | `#0D1B2A` (다크 네이비) | 에피소드 주제에 맞춰 변경 가능 |
| 다이어그램 액센트 1 | `#FF6B35` (오렌지) | 캐릭터 팔레트와 충돌하지 않는 색 |
| 다이어그램 액센트 2 | `#00D4FF` (시안) | 최대 3색 액센트 |
| 다이어그램 액센트 3 | `#7AE582` (그린) | |

**타이포그래피** (후처리 전용 — AI 생성 안 함)

| 용도 | 폰트 | 비고 |
|------|------|------|
| 타이틀/헤딩 | Space Grotesk Bold | 썸네일, 인트로 타이틀 |
| 본문/캡션 | Inter Regular/Medium | 설명 텍스트, 자막 |
| 코드/터미널 | JetBrains Mono | 코드 스니펫 표시 |

**금지 목록**

절대 사용하지 않는 것:
- 3D 렌더링 / 3D 효과
- 그라디언트 셰이딩
- 포토리얼리즘
- 복잡한 디테일 배경
- 가는 선 (1px 미만)
- 사실적인 손 / 손가락
- 텍스트를 AI로 생성 (항상 후처리)
- 그림자 / 드롭섀도

---

### B6. Vee 캐릭터 프로필

> 전체 스펙: `systems/video/assets/characters/vee/character_design_2d.json`

**이름**: Ivy Burr (아이비 버) — 별칭 "Vee"
**버전**: 5.0 (2D flat vector)

**외형 요약**
- 원형 머리, 둥근 검정 안경 (항상 약간 삐뚤어짐)
- 노란 후디 (#FFD93D), 오버사이즈, 소매가 손을 반쯤 덮음
- 갈색 머리 (#6D4C2F), 어깨 길이, 단색 실루엣
- 원형/미튼 손 (손가락 없음)
- 3.5-4등신

**성격**
- 호기심 많고 엉뚱함 — 고개를 기울이고 뭔가를 발견하면 눈이 커짐
- 조용히 유능함 — 산만해 보이지만 집중하면 무서운 몰입력
- 좌절을 표현력 있게 보여줌 — 후드를 뒤집어쓰고 웅크리기, 팔짱 끼고 모니터 노려보기

**역할**
시청자의 감정 대리인. 시청자가 느껴야 할 감정을 Vee가 먼저 보여준다.
- 새로운 걸 발견할 때 → 시청자보다 먼저 흥분
- 코드가 터질 때 → 시청자보다 먼저 좌절
- 해결됐을 때 → 시청자보다 먼저 안도

**표정 시스템**
3요소 (눈썹 곡선 + 입 곡선 + 눈 크기) × 6감정:
default, curious, frustrated, eureka, coding_zone, happy

---

### B7. 세계관 규칙

**3개 공간**

| 공간 | 설명 | 비주얼 스타일 |
|------|------|--------------|
| Vee의 책상 | 현실 세계. 모니터, 키보드, 커피잔. | 따뜻한 톤, #FDEBD0 계열 배경 |
| 화면 안 | 디지털 세계. 코드, 에러, 데이터. | 다크 배경 (#0D1B2A), 네온 액센트 |
| 화이트보드 | 개념 설명 공간. 다이어그램, 메타포. | 밝은 배경, 볼드 컬러 도형 |

전환 규칙:
- 책상 → 화면: Vee가 모니터를 바라보면 카메라가 화면 안으로 줌인
- 화면 → 화이트보드: 개념 설명이 시작되면 배경이 밝아지며 전환
- 화이트보드 → 책상: 설명 끝나면 Vee 리액션 컷으로 복귀

**비주얼 메타포 시스템**

시리즈 전체에서 반복 사용하는 공통 메타포:

| 개념 | 비주얼 메타포 | 설명 |
|------|-------------|------|
| 스파게티 코드 | 엉킨 컬러 실 | 빨/파/초 실이 뒤엉킨 덩어리 |
| 에러/버그 | 위에서 떨어지는 빨간 블록 | 적재된 블록이 빨갛게 변하며 떨어짐 |
| 스펙/설계 | 빛나는 청사진 | 파란 빛이 나는 흰색 패널/도면 |
| AI 에이전트 | 작은 컬러 로봇 | 둥글고 단순한 로봇, 각각 다른 색 |
| 보안 구멍 | 열린 문 | 벽에 활짝 열린 문, 바깥이 빨갛게 빛남 |
| 성공/통과 | 녹색 체크마크 파티클 | 초록색 빛 입자가 터짐 |
| 실패/추락 | 블록 타워 붕괴 | 쌓인 블록이 흔들리다 무너짐 |
| 컨텍스트 | 말풍선 (텍스트 없는) | 빈 말풍선이 사라짐 = 컨텍스트 손실 |

**에피소드별 확장 메타포 규칙**
- 매 에피소드마다 하나의 핵심 메타포를 60초 이상 확장한다 (Kurzgesagt 방식)
- EP01: 건물 = 코드 (청사진 O → 순서대로, 청사진 X → 무작위 쌓기 → 붕괴)
- EP03: 아파트 = 코드 구조 (벽 없는 아파트에서 요리하면 침대에 기름)
- 확장 메타포는 해당 에피소드의 시각적 시그니처가 된다

---

## PART C: CONTENT ENGINE

---

### C8. 에피소드 포맷 템플릿

**기반 구조: 오해-먼저 (Veritasium) + 역설 훅 (PolyMatter)**

매 에피소드는 시청자의 잘못된 가정을 먼저 보여주고, 깨뜨리고, 올바른 방법을 보여준다.

| 세그먼트 | 시간 | 용도 | 비주얼 | 기법 출처 |
|----------|------|------|--------|-----------|
| **Hook** | 0:00-0:15 | 역설적 사실 또는 반직관적 결과 | 강렬한 오프닝 이미지 또는 Vee 리액션 | PolyMatter 역설 훅 |
| **Misconception** | 0:15-0:45 | Vee의 잘못된 가정 → 실패 | Vee가 "당연히 되겠지" → 터짐 (빨간 색조) | Veritasium 오해-먼저 |
| **The Crack** | 0:45-1:15 | 인지부조화 — "근데 이렇게 하면?" | 전환 장면, 색조 변화 (빨강→중립) | Veritasium |
| **Core** | 1:15-3:00 | 올바른 방법, 비주얼 메타포 | 화이트보드 공간, 다이어그램 (초록 색조) | Wendover 점진적 빌드 |
| **Reframe** | 3:00-3:30 | "사실 더 큰 그림은..." | 줌아웃, 시스템 뷰 | PolyMatter 미드포인트 리프레임 |
| **Outro+CTA** | 3:30-4:00 | Vee eureka + 구독 + 다음 에피소드 | Vee 리액션 + 시리즈 엔드카드 | — |

**패턴 인터럽트**
- 20-30초마다 비주얼 전환, 사운드 큐, 또는 Vee 리액션
- 같은 공간에 30초 이상 머무르지 않는다
- 유형: 씬 전환 / SFX 힛 / Vee 리액션 컷 / 줌인아웃 / 비주얼 개그

**Vee 리액션 가이드**
- 에피소드당 최대 6번
- 각 1-2초 (절대 3초 넘지 않음)
- 배치: Hook 직후 1회 + Problem 중 1-2회 + Core 중 2회 + Outro 1회
- 목적: 시청자의 감정을 확인/공유하는 "감정 앵커"

**비트 구조**
- 하나의 비트 = 하나의 나레이션 문장 + 하나의 비주얼 액션
- 비트 길이: 2-5초
- 에피소드당 12-20 비트
- 비트마다 결정: 비주얼 액션은? 감정 방향은? SFX 있나? 전환 타입은?

---

### C9. 콘텐츠 필라 & 주제 선정

**4개 콘텐츠 필라**

| 필라 | 비중 | 설명 | 예시 |
|------|------|------|------|
| AI 기초 | 40% | 바이브 코딩의 핵심 원리 | 스펙, SDD, DDD, TDD |
| 실전 활용 | 25% | 따라하기/빌드위드미 | AI 에이전트 만들기, 프롬프트 엔지니어링 |
| 트렌드 | 20% | 뜨는 도구/기술/뉴스 | 새 모델 출시, 도구 비교 |
| 비하인드 | 15% | 메타/제작 과정 | 이 영상은 AI가 만들었다 |

**3H 프레임워크**

| 유형 | 비중 | 목적 | 빈도 |
|------|------|------|------|
| Hero | 10% | 대규모 도달, 바이럴 | 분기 1회 |
| Hub | 60% | 구독자 유지, 시리즈 | 주 1회 |
| Help | 30% | 검색 트래픽, 에버그린 | 주 1회 |

**주제 검증 프레임워크**

모든 에피소드 주제는 5축 평가 (각 5점, 총 25점)를 거친다:
1. Hook & Retention Structure
2. Narrative Arc & Emotional Curve
3. Visual Metaphor Density
4. Beat Pacing & Duration Fit
5. Target Audience Resonance

> 상세 루브릭: `systems/video/planning/CONTENT_EVALUATION_FRAMEWORK.md`

| 등급 | 점수 | 판정 |
|------|------|------|
| A | 22-25 | 즉시 프로덕션 진입 |
| B+ | 18-21 | 소규모 수정 후 진입 |
| C | 14-17 | 리라이트 또는 시각적 재해석 필요 |
| D 이하 | 13- | 프로덕션 진입 불가 |

**B+ (18점) 이상만 프로덕션 진입.**

---

### C10. 시즌1 에피소드 가이드

> 전체 상세: `systems/video/planning/season1_episode_guide.md`

**10에피소드 라인업**

| EP | 제목 | 필라 | 점수 | 등급 |
|----|------|------|------|------|
| 01 | "스펙이 뭔가?" | AI기초 | 23/25 | A |
| 02 | "왼팔이 28개" | AI기초 | 22/25 | A |
| 03 | "벽 없는 아파트" | AI기초 | 23/25 | A |
| 04 | "열기 무서운 상자" | AI기초 | 21/25 | B+ |
| 05 | "바이브코딩이 뭔데?" | AI기초 | — | Help |
| 06 | "10분만에 AI 에이전트" | 실전활용 | — | Tutorial |
| 07 | "AI는 왜 헛소리를 하나" | AI기초 | — | Concept |
| 08 | "바이브코더 5대 실수" | AI기초 | — | Listicle |
| 09 | "이 영상은 AI가 만들었다" | 비하인드 | — | BTS |
| 10 | "좌절에서 시스템으로" | AI기초 | 16/25 | C→편집 |

**배치 순서** (스토리 EP과 독립 EP 교차):
```
EP01 → EP05 → EP02 → EP06 → EP03 → EP07 → EP04 → EP08 → EP09 → EP10
```

---

### C11. 내러티브 구조

**기본 구조: Problem-Solution**
매 에피소드 — 실패를 먼저 보여주고, 왜 실패했는지 파고, 해결법을 발견한다.

**교대 구조: Mystery-Reveal**
개념 에피소드 (EP05, EP07) — 질문으로 시작, 단서를 하나씩 공개, 마지막에 답 리빌.

**감정 곡선**
```
흥분 ──→ 공포 ──→ 분노 ──→ 명확함 ──→ 성장
(Hook)   (Problem)  (Break)  (Reveal)  (Change)
```

이 곡선은 매 에피소드에 적용된다. 시청자는 항상 "낮은 곳"을 거쳐야 "높은 곳"에 도달한다.

**Pixar 공식**
"옛날에 [상황]이 있었다. 매일 [일상]. 어느 날 [사건]. 그래서 [행동]. 그래서 [결과]. 마침내 [변화]."

모든 에피소드 스크립트는 이 공식으로 검증한다.

**열린 루프 (Open Loop)**
- Hook 안에 열린 질문 하나를 심는다
- 이 질문은 Core 세그먼트까지 답하지 않는다
- 시청자를 최소 90초 이상 잡아둔다
- 예: "왜 월요일 아침에 아무것도 안 돌아갔을까?" → 답은 2분 30초에

---

### C12. Shorts 전략

**롱폼에서 추출** (에피소드당 2-3개)
- **Hook 클립**: 처음 15초 그대로 (자연스러운 오프닝)
- **Aha Moment**: 핵심 리빌 장면, 15-30초
- **비주얼 개그**: Vee 리액션 + 전후 맥락, 15-30초

**독립 Shorts** (에피소드와 무관)
- **1분 팁**: "AI에게 이렇게 물어봐" 시리즈
- **알고 있었어?**: 놀라운 사실 + 비주얼 메타포
- **도구 비교**: 30초 AB 비교 (커서 vs 코파일럿 등)

**목표**: 주 3-4개 Shorts (롱폼 제작 페이스와 독립적으로 유지)

**Shorts 프로덕션 규칙**
- 9:16 비율 (세로)
- 첫 1초에 시각적 훅 (텍스트 금지, 비주얼로만)
- 최대 60초
- CTA: 마지막 3초에 롱폼 에피소드 티저
- 나레이션 속도: 180-200 WPM (롱폼보다 빠르게)

---

## PART D: PRODUCTION

---

### D13. 파이프라인 스펙

100% 로컬. 클라우드 API 없음.

| 단계 | 도구 | VRAM | 예상 시간 | 입력 → 출력 |
|------|------|------|----------|------------|
| T2I 키프레임 | Flux dev + SimpleVectorFlux LoRA | ~9GB | 3초/장 | 프롬프트 → PNG |
| 캐릭터 편집 | Flux Kontext (GGUF) | ~12GB | 5초/장 | 골든레퍼+편집지시 → PNG |
| I2V 애니메이션 | Wan 2.2 MoE GGUF | ~13GB | 4분/5초 클립 | 키프레임 PNG → MP4 |
| TTS 나레이션 | Dia2-1B | ~4GB | 2초/문장 | 텍스트 → WAV |
| BGM 음악 | ACE-Step 1.5 | ~4GB | 10초/곡 | 가사/스타일 → WAV |
| 립싱크 | Rhubarb | CPU | 5초/분 | WAV → 타임코드 |
| 다이어그램 | Motion Canvas / Remotion | CPU | 수동 | 코드 → MP4 |
| 조립 | FFmpeg | CPU | 1분 | 에셋 → 최종 MP4 |

**파이프라인 순서**
```
스크립트 → 샷매니페스트 → T2I키프레임 → [Kontext편집] → I2V → TTS+립싱크 → BGM → FFmpeg조립
                                                                    ↑
                                                            Motion Canvas 다이어그램 (병렬)
```

---

### D14. 샷 매니페스트 포맷

기존 `ep01_shot_manifest.json` 구조를 v5.0 2D 스타일에 맞게 확장.

```json
{
  "shot_id": "S01_01",
  "scene": "Scene1",
  "purpose": "나레이션 텍스트 (비트 내용)",
  "visual_type": "sitcom | explainer | diagram",
  "characters": ["vee"],
  "dialogue": [
    {
      "speaker": "narrator",
      "text": "나레이션 텍스트",
      "emotion": "curious | frustrated | eureka | happy | neutral"
    }
  ],
  "shorts_candidate": false,
  "prompt_positive": "v3ct0r style, simple flat vector... [full prompt]",
  "prompt_negative": "3D, photorealistic, gradient...",
  "duration_sec": 5.0,
  "aspect_ratio": "16:9",
  "resolution": "1280x720",
  "seed": 5000001,
  "model": "flux-dev + SimpleVectorFlux LoRA",
  "mode": "t2i | i2v",
  "input_image": "S01_01_keyframe.png",
  "output_name": "S01_01.mp4",
  "narrative_stage": "HOOK | MISCONCEPTION | THE_CRACK | CORE | REFRAME | OUTRO_CTA",
  "vee_expression": "default | curious | frustrated | eureka | coding_zone | happy",
  "space": "desk | screen | whiteboard",
  "extended_metaphor": false
}
```

**v4→v5 변경점**
- `resolution`: 832x480 → 1280x720 (HD 타겟)
- `model`: HunyuanVideo → Flux dev + Wan 2.2 MoE
- `prompt_positive`: 3D Pixar 프롬프트 → v3ct0r flat vector 프롬프트
- `narrative_stage`: HOOK/FURY/MESS/INSIGHT → HOOK/MISCONCEPTION/THE_CRACK/CORE/REFRAME/OUTRO_CTA
- 추가 필드: `vee_expression`, `space`, `extended_metaphor`
- 제거 필드: `kontext_prompt` (Kontext는 캐릭터 일관성용으로만, 별도 관리)
- 스테이지 매핑: FURY→MISCONCEPTION, MESS→CORE, INSIGHT→REFRAME, PROBLEM→MISCONCEPTION, APPLICATION→REFRAME, OUTRO→OUTRO_CTA

---

### D15. Vee 에셋 라이브러리

**골든 레퍼런스** (불변 — 모든 Kontext 편집의 소스)

| 앵글 | 파일 | 상태 |
|------|------|------|
| 정면 | `vee_2d_golden_front.png` | TO_GENERATE |
| 3/4 | `vee_2d_golden_3q.png` | TO_GENERATE |
| 전신 | `vee_2d_golden_full.png` | TO_GENERATE |

**표정 스톡** (사전 생성 — 에피소드 제작 시 참조용)
6감정 × 3앵글 (정면/3Q/프로필) = 18장
상태: TO_GENERATE

**프롬프트 템플릿**

Base Positive:
```
v3ct0r style, simple flat vector art, isolated on white bg,
young woman character, bright yellow hoodie (#FFD93D),
round black glasses (#2D2D2D), brown bob hair (#6D4C2F),
warm cream skin (#FDEBD0), minimal detail, clean design,
character asset, flat color fill, thin outline, no gradients
```

Base Negative:
```
3D, photorealistic, gradient, shading, texture, clay,
claymation, fingerprint, detailed, complex, thin lines,
realistic hands, fingers, text, watermark, speech bubble,
multiple characters, anime, sketch, rough
```

**LoRA 스택**
- Primary: SimpleVectorFlux (v3ct0r trigger, weight 0.8-1.0)
- Optional: Vee 전용 character LoRA (향후 Dreambooth/LoRA 학습 가능)
- Identity: Flux Kontext (골든레퍼런스 기반 씬 편집)

---

### D16. 5일 프로덕션 스케줄

| 요일 | 작업 | 산출물 |
|------|------|--------|
| **월** | 스크립트 확정 + 샷 매니페스트 작성 | `ep{NN}_script.md` + `ep{NN}_shot_manifest.json` |
| **화** | 키프레임 배치 생성 (Flux + Kontext) + QC | `ep{NN}/keyframes/*.png` |
| **수** | I2V 애니메이션 (Wan 2.2) + 다이어그램 (Motion Canvas) | `ep{NN}/clips/*.mp4` + `ep{NN}/diagrams/*.mp4` |
| **목** | TTS (Dia2) + 립싱크 (Rhubarb) + BGM (ACE-Step) + 오디오 믹스 | `ep{NN}/audio/*.wav` + `ep{NN}/mix.wav` |
| **금** | FFmpeg 조립 + QC + Shorts 추출 + 메타데이터/업로드 | `ep{NN}_final.mp4` + `ep{NN}_shorts/*.mp4` |

**병렬화 기회**
- 화요일: Vee 샷 (Kontext) 과 다이어그램 키프레임 (Flux T2I) 병렬
- 수요일: I2V 렌더 (GPU) 와 다이어그램 코딩 (CPU) 병렬
- 목요일: TTS 생성 (GPU) 과 BGM 생성 (GPU) 은 순차 (VRAM 공유)

---

### D17. 품질 게이트 (6단계)

모든 에피소드는 6개 게이트를 순차적으로 통과해야 한다. 게이트를 통과하지 못하면 이전 단계로 돌아간다.

**Gate 1: Research**
- [ ] 토픽 브리프 작성 완료
- [ ] 평가 프레임워크 점수 B+ (18/25) 이상
- [ ] 핵심 비주얼 메타포 1개 이상 정의

**Gate 2: Script**
- [ ] 낭독 시간 3-5분 이내
- [ ] 12-20 비트로 분할
- [ ] 비트별 비주얼 액션 정의
- [ ] Hook에 열린 루프 존재
- [ ] 톤 체크 통과 ("술집 친구" 느낌인가?)

**Gate 3: Storyboard**
- [ ] 샷 매니페스트 JSON 완성
- [ ] 모든 비트에 프롬프트 + 타이밍 정렬
- [ ] Vee 리액션 6회 이내, 각 1-2초
- [ ] 패턴 인터럽트 20-30초 간격 확인

**Gate 4: Render**
- [ ] 캐릭터 일관성 체크 (안경, 후디, 머리, 비율)
- [ ] 아티팩트 없음 (손가락, 텍스트, 왜곡)
- [ ] 스타일 매치 (v3ct0r flat vector, 아웃라인 존재)
- [ ] 다이어그램 가독성 확인

**Gate 5: Assembly**
- [ ] 풀 워치스루 (처음부터 끝까지 한 번에)
- [ ] 리텐션 곡선 추정 (30초 이상 드래그 구간 없음)
- [ ] 패턴 인터럽트 작동 확인
- [ ] 오디오 레벨 확인 (나레이션 0dB, BGM -15dB, SFX -5dB)
- [ ] 총 길이 3-5분 이내

**Gate 6: Publish**
- [ ] 썸네일 완성 (Vee + 핵심 비주얼 + 제목 텍스트)
- [ ] 타이틀 최적화 (60자 이내, 키워드 포함)
- [ ] 설명 + 태그 작성
- [ ] Shorts 2개 이상 추출 완료
- [ ] 최종 파일 업로드

---

### D18. 일관성 규칙

**절대 불변 (시리즈 전체)**

| 요소 | 규칙 |
|------|------|
| Vee 디자인 | 안경, 후디, 머리, 원형 머리 — character_design_2d.json 참조 |
| Vee 팔레트 | #FFD93D, #6D4C2F, #FDEBD0, #2D2D2D |
| 나레이터 음성 | 동일 Dia2 화자 샘플 사용 |
| 타이포그래피 | Space Grotesk / Inter / JetBrains Mono |
| 인트로 포맷 | [로고 애니메이션 0.5초] → Hook 즉시 시작 |
| 아웃트로 포맷 | Vee 리액션 + 다음 에피소드 티저 + 구독 CTA |
| 오디오 레벨 | 나레이션 0dB, BGM -15dB, SFX -5dB |
| 비트 리듬 | 2-5초/비트, 패턴 인터럽트 20-30초 간격 |

**에피소드별 가변**

| 요소 | 변경 범위 |
|------|----------|
| 테마 컬러 팔레트 | 배경색 + 다이어그램 액센트 3색 |
| BGM 트랙 | 에피소드 분위기에 맞춰 변경 |
| 비주얼 메타포 세트 | 공통 메타포 + 에피소드별 확장 메타포 1개 |
| 다이어그램 스타일 | 주제에 맞춘 도형/색상 변형 |
| Vee 소품 | 노트북, 종이, 러버덕, 커피잔 등 |

---

## 참조 파일 인덱스

| 파일 | 용도 |
|------|------|
| `systems/planning/09-youtube-channel-research-v2.md` | **채널 레퍼런스 리서치 v2 (SSOT)** — S/A/B/C 티어 분석 |
| `systems/video/assets/characters/vee/character_design_2d.json` | Vee 2D 캐릭터 스펙 (v5.0) |
| `systems/video/assets/characters/vee/character_design.json` | Vee 3D 캐릭터 스펙 (v4.0, archived) |
| `systems/video/planning/season1_episode_guide.md` | 시즌1 10에피소드 상세 가이드 |
| `systems/video/planning/CONTENT_EVALUATION_FRAMEWORK.md` | 주제 평가 루브릭 + Acts 1-5 점수 |
| `systems/video/planning/2d-character-design-references.md` | 2D 디자인 리서치 |
| `systems/video/planning/video-content-strategy-research.md` | 콘텐츠 기획론 |
| `systems/video/planning/ai-native-animation-research.md` | AI 제작 기술 리서치 |
| `systems/video/planning/youtube-content-strategy-research.md` | YouTube 전략 리서치 |
| `systems/video/preproduction/ep01/ep01_shot_manifest.json` | EP01 샷 매니페스트 (v4.0 포맷 참조) |
