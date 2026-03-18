# Comparative Evaluation: Vibecode Town vs IBM Technology

> Date: 2026-03-18
> Evaluator: Claude (requested by Hugh)
> Framework: `systems/video/planning/CONTENT_EVALUATION_FRAMEWORK.md` (5축 25점)
> Subjects:
> - **IBM-A**: "What Is Vibe Coding?" (Y68FF_nUSWE, ~7min)
> - **IBM-B**: "Spec-Driven Development" (mViFYTwWvcM, ~9min)
> - **VT-01**: EP01 "What Is Vibe Coding?" (v4, 3:55)
> - **VT-02**: EP02 "What Is Spec-Driven Dev?" (v6, 3:55)

---

## 1. Axis-by-Axis Scoring

### Axis 1: Hook & Retention Structure (5점)

| | IBM-A | IBM-B | VT-01 | VT-02 |
|---|---|---|---|---|
| **Score** | **2** | **3** | **4** | **4** |

**IBM-A**: "Today we're breaking down vibe coding." — 사전식 도입. 질문/갈등 없음. 첫 문장에서 이미 "what, when, how" 목록을 예고. 시청자는 정보를 기다리지만, 궁금해하지 않음. Open loop 없음.

**IBM-B**: "Right now, the way apps are getting built is completely changing..." → "that is what's known as spec-driven development. Thank you very much. Nah, just kidding." — 유머 시도는 있으나 open loop 없음. 정보 전달 시작까지 23초 소요.

**VT-01**: "Build an app with one prompt. No code. No experience. Just vibes." → 광고 몽타주 → 뭔가 나왔는데 → "...what is this?" — 약속 → 실망의 gap 형성. Vee의 혼란이 open loop ("왜 이상한 게 나왔지?"). 첫 15초 안에 감정 전환.

**VT-02**: EP01 콜백 → "Five times. Five prompts. Same project. Five completely different things." — 이전 에피소드 연결 + 즉시 문제 제시. 직접적 open loop는 약하지만 좌절감 셋업은 강함.

**분석**: IBM은 **정의-먼저** (definition-first). 우리는 **문제-먼저** (problem-first). YouTube retention 리서치에 따르면 "첫 3초에 시청자의 질문을 만들어야" 함. IBM은 정보를 줄 뿐, 질문을 만들지 않음.

---

### Axis 2: Narrative Arc & Emotional Curve (5점)

| | IBM-A | IBM-B | VT-01 | VT-02 |
|---|---|---|---|---|
| **Score** | **2** | **2** | **4** | **5** |

**IBM-A**: 구조 = 정의 → 사용처 → 주의점 → best practices (3 phases) → 마무리. **리스트 포맷**. Conflict 없음. Change 없음. 시작과 끝에서 시청자의 감정이 동일함. 5C 중 Context만 존재.

**IBM-B**: 구조 = vibe coding 설명 → SDLC 소개 → SDD 설명 → 비교표 → 예시 → 마무리. **프로세스 다이어그램 나열**. Conflict = vibe coding의 비결정성("100 different tries"), 있으나 빠르게 넘어감. 감정 곡선이 아니라 정보 곡선.

**VT-01**: 흥분(광고) → 혼란(뭐가 나왔지?) → 좌절(3번 했는데 3개 다름) → 깨달음(요리 메타포: 레시피=스펙) → 자신감(도구 투어, 시작하세요). **5C 중 4개** (Climax가 약함 — THE_CRACK의 "rolling dice" 비유가 개념적).

**VT-02**: 자신감(EP01 배웠으니까) → 좌절(5번 했는데 5개 다름, 자세히 쓸수록 더 꼬임) → 공포(10,847줄, 4,200줄 중복) → 깨달음(건물 메타포, 3줄 스펙) → 패러다임 전환("좌절이 곧 스펙이다") → 행동(3줄 템플릿). **5C 완벽**. 시작과 끝에서 시청자의 정체성이 바뀜.

**분석**: IBM은 **교과서** — 읽으면 배움. 우리는 **여행** — 따라가다 보면 깨달음. Kurzgesagt 분석에서 말하는 "12 minutes as a journey" vs "12 minutes of information".

---

### Axis 3: Visual Metaphor Density (5점)

| | IBM-A | IBM-B | VT-01 | VT-02 |
|---|---|---|---|---|
| **Score** | **2** | **3** | **5** | **5** |

**IBM-A**: 시각 = 코드 에디터 스크린 캡처 + 텍스트 박스 다이어그램. 메타포 0개. "Agentic AI" 등 추상 개념을 텍스트로만 설명. 문장의 80%+가 talking head 위에 떠 있는 텍스트. 애니메이션으로 전환 불가.

**IBM-B**: 약간 나음. 플로우차트(prompt → model → code → edit), SDLC 다이어그램, vibe coding vs SDD 비교표. 하지만 여전히 **프로세스 다이어그램**. 메타포 = "100 different tries"(약함). 라이브 코딩 예시(login endpoint)는 구체적이지만 비주얼 메타포가 아님.

**VT-01**: 로봇 셰프(레시피 없이 요리 = AI에 스펙 없이 코딩), 주사위(토큰 예측), Karpathy 인용 타이포, YOU/AI 2열 다이어그램, 3단계 계단(L1/L2/L3), 도구 투어 4패널. **문장의 80%+가 구체적 시각 액션에 매핑됨**. 확장 메타포(요리) 60초+.

**VT-02**: 5채널 같은 건물/다른 건물(5개 로봇 아이콘), 카운터 10,847→4,200(레드 분리), 청사진 없는 건설(벽돌 랜덤 쌓기 → 화장실이 지붕에), 노트 카드 3줄(건물 재조립), Before/After 비교, CLAUDE.md 파일 트리, 빨간 낙서→파란 구조(좌절→스펙 변환). **모든 추상 개념이 물리적 비유로 전환됨**.

**분석**: 이건 포맷 차이. IBM = talking head + 스크린 캡처 (저비용 고속 제작). 우리 = 2D flat vector 애니메이션 (고비용 but 메타포 밀도 극대화). IBM의 강점은 "즉시 보여주기"(코드 편집기 실제 화면). 우리의 강점은 "이해시키기"(요리=코딩 메타포는 비개발자도 즉시 이해).

---

### Axis 4: Beat Pacing & Duration Fit (5점)

| | IBM-A | IBM-B | VT-01 | VT-02 |
|---|---|---|---|---|
| **Score** | **3** | **3** | **4** | **4** |

**IBM-A (7분)**: 30+ 비트. 평균 5-8초/비트. 전반적으로 느슨함. "Right?" "Uh" "the thing is" 등 필러가 많음. 3분 이후 best practices 섹션은 리스트 나열 → 밀도 하락. 3분 컷으로 편집하면 핵심 30%만 남음.

**IBM-B (9분)**: 유사. Vibe coding 설명에 2분, SDLC에 1분, SDD 설명에 2분, 비교에 1분, 예시에 2분. 중복 설명 다수 ("the thing is..." 반복). 5분으로 압축 가능.

**VT-01 (3:55, 30비트)**: 평균 7.8초/비트. CORE 세그먼트(105초, 15비트)가 가장 밀도 높음. 비트 길이 균일. 30초마다 시각 전환. 다만 도구 투어(4x8초)가 살짝 나열적.

**VT-02 (3:55, 30비트)**: 유사 밀도. THE_CRACK(숫자 폭탄)→CORE(건물 메타포)→REFRAME(좌절=스펙) 전환이 매끄러움. 6세그먼트 구조가 자연적 페이싱 가드레일 역할.

**분석**: IBM은 **길고 느슨** (conversational podcast 느낌). 우리는 **짧고 조밀** (Fireship/Kurzgesagt 밀도). YouTube 2025 트렌드: mid-form (3-8분)이 가장 높은 retention.

---

### Axis 5: Target Audience Resonance (5점)

| | IBM-A | IBM-B | VT-01 | VT-02 |
|---|---|---|---|---|
| **Score** | **3** | **3** | **5** | **5** |

**IBM-A**: 타겟 = 주니어 개발자. "IDE", "VS Code", "IntelliJ", "Java project", "banking API", "dependencies" — 비개발자는 첫 문장부터 탈락. 행동 제안: "lint, type check, security scanning" — 개발자만 할 수 있는 행동.

**IBM-B**: 타겟 = 같은 개발자. "SDLC", "PRD", "endpoint at /login", "POST requests", "200 code" — 기술 어휘 전제. "spec = contract to create requirements" — 개발자에겐 명확하지만 비개발자에겐 추상적.

**VT-01**: 타겟 = 코드 못 읽는 사람. "Build an app with one prompt" = 그들이 실제로 접하는 광고. "Something came out. But..." = 그들이 실제로 느끼는 감정. "You decide what. AI decides how." = 즉시 실행 가능한 프레임. 행동: "도구 하나 설치, 프롬프트 하나 실행."

**VT-02**: 같은 타겟. "More detail didn't help. It made things more confusing." = 더 자세히 쓰면 될 줄 알았는데 더 꼬임 — 모든 비개발자의 경험. "Three lines. Goal. Constraints. Done-when." = 개발 지식 0으로 오늘 바로 할 수 있음. "Frustration IS the spec" = 그들의 좌절을 역량으로 리프레임.

**분석**: IBM은 **개발자에게 새 기법 소개**. 우리는 **비개발자에게 첫 걸음 제시**. 같은 주제, 완전히 다른 관객. IBM의 login endpoint 예시는 개발자가 "아 이렇게 하면 되겠다" → 우리의 3줄 스펙은 비개발자가 "나도 할 수 있겠다."

---

## 2. Total Scores

| | IBM-A | IBM-B | VT-01 | VT-02 |
|---|---|---|---|---|
| Hook & Retention | 2 | 3 | 4 | 4 |
| Narrative Arc | 2 | 2 | 4 | 5 |
| Visual Metaphor | 2 | 3 | 5 | 5 |
| Beat Pacing | 3 | 3 | 4 | 4 |
| Audience Resonance | 3 | 3 | 5 | 5 |
| **TOTAL** | **12/25 (D)** | **14/25 (C)** | **22/25 (A)** | **23/25 (A)** |

---

## 3. Fair Caveats — 이 비교의 한계

이 점수는 **우리 평가 프레임워크** 기준. 이 프레임워크는 "2D 애니메이션 에세이 + 비개발자 타겟" 파이프라인을 위해 설계됨. IBM의 콘텐츠는 다른 목적으로 만들어짐:

| 차원 | IBM | Vibecode Town |
|------|-----|---------------|
| **포맷** | Talking head + 스크린 캡처 | 2D flat vector 애니메이션 |
| **제작 비용** | 촬영 1일 + 편집 2일 | 스크립트 3일 + 렌더 2일 + 조립 1일 |
| **타겟 관객** | 주니어-미드 개발자 | 비개발자, 바이브코더 입문자 |
| **콘텐츠 목적** | 기술 교육 / 채널 SEO | 스토리텔링 / 행동 변화 |
| **업로드 빈도** | 주 2-3회 | 주 1회 + Shorts |
| **깊이** | 넓고 얕음 (개요) | 좁고 깊음 (한 주제 몰입) |

IBM의 강점은 **속도, 범위, 신뢰도** (IBM 브랜드 파워). 이걸 우리 프레임워크로 평가하면 불공정한 면이 있음.

---

## 4. IBM에서 배울 것

### 4A. 우리가 이기는 지점 (유지/강화)
1. **메타포 우선**: 요리=코딩, 건물=코드, 5로봇=5세션 — 비개발자 관문 통과
2. **감정 곡선**: 흥분→좌절→깨달음→자신감 — IBM은 flat
3. **행동 구체성**: "3줄 쓰세요" vs "use security scanning" — 진입장벽 차이
4. **6세그먼트 구조**: 페이싱 가드레일 — IBM은 자유 형식 → 느슨해짐

### 4B. IBM이 이기는 지점 (흡수 필요)
1. **코드 실물 데모**: login endpoint 예시 — 실제 코드가 화면에 나옴. 우리는 메타포만 있고 실물이 없음
   - **대응**: VT-02 CORE에 실제 3줄 스펙 → AI 결과 before/after 실물 스크린 추가 검토
2. **기존 패러다임 비교**: Traditional → TDD → SDD 진화 프레이밍 — 개발 역사 맥락
   - **대응**: VT-02에서 이건 의도적 배제 (비개발자는 TDD를 모름). 하지만 EP04가 이 역할을 함
3. **"Spec = Contract" 프레이밍**: 명확하고 기억에 남는 한 줄 정의
   - **대응**: 우리의 "Frustration IS the spec"이 더 강력한 한 줄이지만, "spec = contract"도 CORE 어딘가에 넣을 가치 있음
4. **SDLC 연결**: SDD가 기존 소프트웨어 개발 프로세스와 어떻게 연결되는지 보여줌
   - **대응**: 비개발자 타겟이라 SDLC는 과도. 하지만 "professional developers do this too"라는 한 줄 정당성 추가는 고려

### 4C. 구체적 스크립트 개선 제안

**VT-01에 추가 고려**:
- IBM의 "vibe coding can be tricky for production" → 우리 THE_CRACK에서 "왜 매번 다른 게 나오나" 설명 후 "This isn't a bug. This is how AI works." 라인 강화

**VT-02에 추가 고려**:
- CORE 세그먼트에 한 줄 추가: "Developers call this a contract. You define the rules before work begins." — SDD를 프로 세계와 연결
- IBM의 "approval gate" 개념: "If you're happy with those requirements, approve. If not, edit before any code is written." → 우리 REFRAME에서 "Write before you prompt" 메시지와 연결 가능

---

## 5. 결론

IBM은 **기술 교육 콘텐츠**의 정석. 명확, 정확, 신뢰. 하지만 감정이 없고 여정이 없음. YouTube 에세이가 아니라 **온라인 강의**.

우리는 **스토리텔링 교육 콘텐츠**. 정보량은 IBM보다 적지만, 행동 변화율은 높을 것. 비개발자가 IBM 영상을 끝까지 볼 확률 < 우리 영상을 끝까지 볼 확률.

**포지셔닝**:
- IBM = "SDD가 뭔지 설명해줘" → 지식 전달
- Vibecode Town = "SDD를 해야 하는 이유를 느끼게 해줘" → 행동 유발

같은 주제, 다른 레이어. 경쟁이 아니라 **보완**. IBM 영상을 본 개발자가 비개발자 친구에게 우리 영상을 공유하는 것이 이상적 시나리오.
