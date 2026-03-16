# Screenplay Writer Skill

대본 작성 5단계 프로세스. 각 단계는 게이트 — 이전 단계 통과 전 다음 단계 진입 불가.

## SSOT

**`systems/video/SERIES_BIBLE.md`** — 이 문서가 모든 제작의 단일 진실 원천.
에피소드 구조, 톤, 캐릭터, 비주얼 스타일, 비트 규칙 전부 여기서 나온다.

## 스타일 요약

- **비주얼**: 2D flat vector (Kurzgesagt level). 3D/claymation/clay 절대 금지
- **포맷**: 나레이터 V.O. + Vee 무언극 + Bee 비주얼 리액션
- **톤**: Kurzgesagt clarity + Fireship speed. 아날로지 퍼스트, 추상적 설명 금지

## 캐릭터 규칙

### Vee (주인공)

- **절대 말하지 않는다.** 음성 대사 없음
- 비주얼 리액션만: 표정 변화, 몸짓, 플래카드
- 에피소드당 **최대 6회** 리액션, 각 **1-2초**
- 감정 루프: curiosity → experiment → confusion → understanding → discovery
- 역할: 시청자의 감정 대리인

### Bee (사이드킥)

- **Vee의 코드 이해관계자** — 코드 위에 산다
- **음성 없음** — 비주얼 리액션 + 플래카드만
- 코드가 좋으면 기뻐하고, 코드가 망하면 짜증/울음
- Vee와 별도 리액션 카운트 아님 (Vee 6회 제한에 포함하지 않음, 단 Bee 등장은 에피소드당 3-4회 이내)

### 나레이터

- **모든 세그먼트**에서 V.O.로 정보 전달
- 영어 스크립트
- 톤: "똑똑한 친구가 술집에서 설명하는 느낌" — Kurzgesagt clarity + Fireship speed
- **아날로지 퍼스트**: 추상적 설명 금지. 비유로 시작하고, 비유로 이해시킨 뒤, 정의는 도착점
- 속도: 150-180 WPM

## 서브커맨드

| 커맨드 | 역할 |
|--------|------|
| `/screenplay-topic` | Phase 0: 소재 정의 (한 에피소드 = ONE 실패, ONE 개념, ONE 발견) |
| `/screenplay-research` | Phase 0.5: 주제 리서치 + 평가 프레임워크 게이트 (B+ 18/25 이상) |
| `/screenplay-plan` | Phase 1: 스토리 설계 (Discovery Arc + 비트맵 + Shorts 추출 계획) |
| `/screenplay-write` | Phase 2: Fountain 집필 (설계 기반) |
| `/screenplay-review` | Phase 3: 구조 검증 (`validate_screenplay.py` + 수동 체크리스트) |

---

## 세그먼트 구조

| 세그먼트 | 시간 | 용도 | 비주얼 모드 |
|----------|------|------|------------|
| **Hook** | 0:00-0:15 (15s) | 놀라운 사실 또는 "상상해봐" + 열린 루프 | Mode A or B |
| **Problem** | 0:15-0:45 (30s) | 실패 장면, 왜 중요한지 | Mode A |
| **Core** | 0:45-3:00 (135s) | 핵심 개념 2-3개 + 확장 비주얼 메타포 | Mode B primary, Mode A/C 교차 |
| **Application** | 3:00-4:00 (60s) | 실제 적용법 | Mode C primary, Mode B 보조 |
| **Outro** | 4:00-5:00 (60s) | 요약 + 구독 + 다음 에피소드 티저 | Mode A |

**총 길이: 3-5분 (타겟 3분 30초)**

## 비주얼 모드

| 모드 | 설명 | 공간 |
|------|------|------|
| **Mode A** (캐릭터 씬) | Vee/Bee 책상 장면, 표정/몸짓 리액션 | desk (따뜻한 톤) |
| **Mode B** (다이어그램/인포그래픽) | 화이트보드 개념 설명, 다이어그램, 확장 메타포 | whiteboard (밝은 배경) |
| **Mode C** (코드 데모) | 코드/터미널/에러 비주얼, 실제 적용 시연 | screen (다크 배경) |

## Discovery Arc

에피소드의 내러티브 뼈대. 강의하지 않고 발견하게 한다.

```
Question → Situation → Explanation → Application → Next Question
(Hook)     (Problem)   (Core)        (Application)  (Outro)
```

- **Question**: "이상하지 않아?" — 시청자의 호기심을 건드리는 열린 질문
- **Situation**: "이런 일이 벌어졌어" — 공감 가능한 실패 상황
- **Explanation**: "알고 보니 이거였어" — 아날로지 → 원리 → Aha 모먼트
- **Application**: "이렇게 하면 돼" — 직접 적용할 수 있는 방법
- **Next Question**: "근데 이건 어떻게?" — 다음 에피소드의 씨앗

---

## Phase 0: 주제 정의 (`/screenplay-topic`)

**모든 것의 시작.** 실패 장면을 정하면 구조가 나온다. 구조가 나오면 장면이 나온다. 이 순서를 절대 뒤집지 않는다.

### 참조
- `systems/video/SERIES_BIBLE.md` — C9 콘텐츠 필라 & 주제 선정, C10 에피소드 가이드
- `systems/video/preproduction/source_index.json` — EP별 주제 매핑
- `systems/video/preproduction/rag/` — 블로그 소재 RAG 인덱스

### 프로세스

#### Step 1: 실패 장면을 정한다

> 예: **"AI가 만든 코드, 월요일에 아무것도 안 돌아감"**

시청자가 공감할 실패. 한 줄.

#### Step 2: 에피소드 끝에 알게 되는 것을 정한다

| 항목 | 내용 |
|------|------|
| **실패** | [예: AI가 만든 코드를 스펙 없이 쌓음] |
| **3-5분 후 알게 되는 것** | [예: 스펙 = 청사진. 없으면 건물이 무너진다.] |
| **왜 중요한가** | [예: 이걸 모르면 매주 월요일 아침이 지옥] |

#### Step 3: Discovery Arc 매핑

| 세그먼트 | Discovery Arc | 전달 내용 | 시간 |
|----------|--------------|----------|------|
| **Hook** | Question | 놀라운 사실 또는 "상상해봐" + 열린 루프 | 0:00-0:15 |
| **Problem** | Situation | 실패 장면, 왜 중요한지 | 0:15-0:45 |
| **Core** | Explanation | 핵심 개념 2-3개 + 확장 비주얼 메타포 (60초+) | 0:45-3:00 |
| **Application** | Application | 실제 적용법 | 3:00-4:00 |
| **Outro** | Next Question | 요약 + 구독 + 다음 에피소드 티저 | 4:00-5:00 |

#### Step 4: 필수 요소 체크

- [ ] **열린 루프 1개** — Hook에 심고, Core까지 답하지 않음 (최소 90초 잡아두기)
- [ ] **확장 메타포 1개** — Core에서 60초 이상 사용 (에피소드의 시각적 시그니처)
- [ ] **Aha 모먼트 1개** — 시청자가 "아!" 하는 순간
- [ ] **내러티브 구조 선택** — Problem-Solution (기본) 또는 Mystery-Reveal (개념 EP)

#### Step 5: 블로그에서 양념을 뽑는다

블로그 글(`content/blog/phase1/`)은 **양념 창고**. 순서대로 옮기는 게 아니라, 에피소드 구조에 맞는 데이터만 골라 쓴다.

- Problem에 쓸 실패 맥락: [블로그에서 뽑기]
- Core에 쓸 데이터: [블로그 숫자/인용 + 메타포]
- Application에 쓸 변화: [블로그에서 뽑기]

### 작성: 주제 카드

```markdown
## 주제 카드 — EP{NN}

### 실패 장면
> [시청자가 공감할 실패. 예: "AI가 만든 코드, 월요일에 아무것도 안 돌아감"]

### 3-5분 후 알게 되는 것
> [한 줄. 예: 스펙 = 청사진. 없으면 건물이 무너진다.]

### 내러티브 구조
- [ ] Problem-Solution (기본)
- [ ] Mystery-Reveal (개념 EP)

### Discovery Arc

| 세그먼트 | Arc 단계 | 내용 | 블로그 양념 | 시간 |
|----------|---------|------|------------|------|
| Hook | Question | [열린 루프 포함] | | 0:00-0:15 |
| Problem | Situation | | | 0:15-0:45 |
| Core | Explanation | [확장 메타포 ID: ] | | 0:45-3:00 |
| Application | Application | | | 3:00-4:00 |
| Outro | Next Question | [다음 EP 티저] | | 4:00-5:00 |

### 감정 곡선
curiosity(Hook) → empathy(Problem) → frustration(Break) → clarity(Reveal) → discovery(Change)

### 필수 요소
- 열린 루프: [Hook에 심을 질문]
- 확장 메타포: [Core에서 60초+ 사용할 메타포]
- Aha 모먼트: [시청자가 "아!" 하는 순간]

### Vee 리액션 (최대 6회, 각 1-2초)
1. Hook 직후:
2. Problem 중:
3. Problem 중:
4. Core 중:
5. Core 중:
6. Outro:

### Bee 리액션 (3-4회, 플래카드/비주얼만)
1. Problem 중 (코드 위에서 짜증):
2. Core 중 (코드 개선되면 반응):
3. Application 중 (안정되면 기쁨):

### 쇼츠 추출 계획 (2-3개)
1. Hook 클립 (처음 15초):
2. Aha Moment (15-30초):
3. 비주얼 개그 (15-30초):
```

### Phase 0 완료 조건

- 실패 장면이 **시청자가 공감할** 수준으로 구체적
- 3-5분 후 알게 되는 것이 한 줄
- Discovery Arc 매핑 완료 (Question → Situation → Explanation → Application → Next Question)
- 열린 루프, 확장 메타포, Aha 모먼트 정의
- 쇼츠 추출 계획 2-3개
- 내러티브 구조 선택 (Problem-Solution or Mystery-Reveal)
- **유저 승인**

---

## Phase 0.5: 주제 리서치 (`/screenplay-research`)

Phase 0 통과 후에만 진행. 주제를 **연구**하고 블로그에서 **근거를 추출**하여 토픽 브리프를 작성한다.
**B+ (18/25) 이상 통과해야 Phase 1 진입 가능.**

### 입력

- Phase 0에서 승인된 주제 카드
- `source_index.json`의 해당 에피소드 소스 파일 목록

### 참조

- `systems/video/SERIES_BIBLE.md` — C9 주제 검증 프레임워크 (5축 x 5점)
- `systems/video/planning/CONTENT_EVALUATION_FRAMEWORK.md` — 상세 루브릭
- `source_index.json` — EP별 소스 블로그 매핑
- `content/blog/phase1/`, `content/blog/blog-only/` — 블로그 소재 창고
- `topic_brief_template.md` — 토픽 브리프 양식

### 프로세스

#### Step A: 웹 리서치

주제에 대해 5가지 질문을 조사한다. 웹 검색, 논문, 서적, 강연 등 외부 소스 활용.

1. **정의 & 기원** — 이 개념이 뭔가? 누가 만들었나? 핵심 정의.
2. **왜 중요한가** — 안 하면 뭐가 터지나? 산업 데이터, 통계, 비용 곡선.
3. **베스트 프랙티스** — 실무에서 실제로 어떻게 하나? 3-5가지.
4. **바이브코더 안티패턴** — AI 퍼스트 개발자가 건너뛸 때 특히 뭐가 터지나?
5. **케이스 스터디** — 2-3개 실제 사례 (성공 or 실패).

> 핵심: **시청자에게 가르칠 내용**을 만드는 단계. 블로그는 감정 소재, 리서치는 지적 권위.

#### Step B: 블로그 근거 추출

`source_index.json`에 매핑된 소스 파일들을 읽고 구체적 데이터를 추출한다.

추출 대상:
1. **숫자/메트릭** — 줄 수, 중복 비율, 시간, 에러 수 등 구체 수치
2. **아하 모먼트** — 저자가 이 개념의 중요성을 깨달은 정확한 순간 (인용)
3. **Discovery Arc 비트** — Question → Situation → Explanation → Application 매핑 가능한 데이터

> 핵심: 대본에 사용할 **구체적 사실**. "10,847줄" 같은 숫자가 "코드가 많아졌다"보다 100배 강력.

#### Step C: 토픽 브리프 작성

`topic_brief_template.md` 양식에 따라 토픽 브리프를 작성한다.

- 저장: `preproduction/ep{NN}/ep{NN}_topic_brief.md`
- Part 1: Research Summary (Step A 결과)
- Part 2: Blog Evidence Table (Step B 결과)
- Part 3: Explainer Script Seeds (리서치 + 블로그 근거를 결합한 Core 비트 3-5개)
- Part 4: Recommended Sources

#### Step D: 평가 프레임워크 게이트

토픽 브리프를 5축 평가한다 (SERIES_BIBLE.md C9 참조):

| 축 | 5점 만점 |
|----|---------|
| Hook & Retention Structure | /5 |
| Narrative Arc & Emotional Curve | /5 |
| Visual Metaphor Density | /5 |
| Beat Pacing & Duration Fit | /5 |
| Target Audience Resonance | /5 |
| **총점** | **/25** |

**B+ (18/25) 이상이면 통과. 미달이면 리라이트.**

### Phase 0.5 완료 조건

- 웹 리서치 5가지 질문 전부 답변
- 증거 테이블에 구체적 데이터 포인트 5개+
- 아하 모먼트 정확한 소스와 함께 식별
- Explainer Script Seeds 3개+, 각각 연구+블로그 근거 보유
- **평가 프레임워크 B+ (18/25) 이상**
- **유저 승인**

---

## Phase 1: 스토리 설계 (`/screenplay-plan`)

Phase 0.5 통과 후에만 진행. 주제 카드 + **토픽 브리프**를 바탕으로 Discovery Arc 기반 이야기 구조를 설계한다.

### 입력

- Phase 0에서 승인된 주제 카드
- **Phase 0.5에서 승인된 토픽 브리프** (B+ 이상)

### 참조 SSOT

| 문서 | 용도 |
|------|------|
| `systems/video/SERIES_BIBLE.md` | **단일 진실 원천** — 에피소드 구조, 캐릭터, 톤, 비주얼, 비트 규칙 전부 |
| `systems/video/planning/CONTENT_EVALUATION_FRAMEWORK.md` | 상세 평가 루브릭 |
| `systems/planning/11-concept-metaphor-library.md` | 확장 메타포 라이브러리 |

### 작성 문서 4가지

#### A. Discovery Arc 워크시트

SERIES_BIBLE.md C11 + Discovery Arc를 5세그먼트에 매핑.

```markdown
## Discovery Arc — EP{NN}

### 아크 흐름
Question(Hook) → Situation(Problem) → Explanation(Core) → Application(Application) → Next Question(Outro)

### 감정 흐름
curiosity → empathy → frustration → clarity → discovery

| 세그먼트 | Arc 단계 | 감정 | Vee 리액션 | Bee 리액션 | 나레이터 톤 | 비주얼 모드 |
|----------|---------|------|-----------|-----------|------------|-----------|
| Hook (0:00-0:15) | Question | curiosity | [예: 고개 기울임] | — | 흥미로운 사실 툭 던짐 | A or B |
| Problem (0:15-0:45) | Situation | empathy → frustration | [예: 후드 뒤집어씀] | [예: 코드 위에서 짜증] | "망했어. 왜인지 알아보자." | A |
| Core (0:45-3:00) | Explanation | frustration → clarity | [예: 고개 기울임 → 눈 빛남] | [예: 코드 개선에 반응] | 아날로지 → 원리, 차근차근 | B primary |
| Application (3:00-4:00) | Application | clarity | [예: 코딩존 몰입] | [예: 안정된 코드에 기쁨] | 직설적 적용 | C primary |
| Outro (4:00-5:00) | Next Question | discovery | [예: 미소] | — | "알겠지? 근데 이건 어떻게?" | A |

### 열린 루프
- Hook에서 심는 질문: [작성]
- Core에서 답하는 시점: [타이밍]
- 유지 시간: [최소 90초]

### 확장 메타포
- 메타포: [예: 건물 = 코드]
- Core 내 사용 시간: [60초 이상]
- 비주얼 전개: [예: 청사진 O → 순서대로 쌓기, 청사진 X → 무작위 → 붕괴]

### Aha 모먼트
- 위치: [세그먼트 + 타이밍]
- 내용: [시청자가 깨닫는 것]
- 비주얼: [Aha를 강조하는 비주얼 — 줌, 색 변화 등]
```

#### B. 비트맵 (Beat Map)

12-20 비트로 에피소드를 분할. 비트 = 하나의 나레이션 문장 + 하나의 비주얼 액션.

```markdown
## 비트맵 — EP{NN}

| # | 세그먼트 | 비트 내용 | 비주얼 모드 | 공간 | 시간(초) | 패턴 인터럽트 |
|---|----------|----------|-----------|------|---------|-------------|
| 1 | Hook | [나레이션 한 줄] | Mode A | desk | 3 | — |
| 2 | Hook | [나레이션 한 줄] | Mode B | whiteboard | 4 | SFX |
| 3 | Problem | [나레이션 한 줄] | Mode A | desk | 3 | 씬 전환 |
| ... | | | | | | |

총 비트 수: [12-20]
총 시간: [180-300초]

### 패턴 인터럽트 체크
- 20-30초 간격 확인: [ ]
- 같은 공간 30초 이상 연속 없음: [ ]
- Vee 리액션 총 [N]회 (최대 6): [ ]
- Bee 리액션 총 [N]회 (3-4회 이내): [ ]
```

**비주얼 모드 3종:**

| 모드 | 설명 | 공간 |
|------|------|------|
| `Mode A` (캐릭터 씬) | Vee/Bee 책상 장면, 표정/몸짓 리액션 | desk (따뜻한 톤) |
| `Mode B` (다이어그램) | 화이트보드 설명, 다이어그램, 인포그래픽 | whiteboard (밝은 배경) |
| `Mode C` (코드 데모) | 코드/터미널/에러 비주얼, 적용 시연 | screen (다크 배경) |

**3개 공간:**

| 공간 | 비주얼 스타일 |
|------|--------------|
| desk | 따뜻한 톤, Vee의 책상. 모니터, 키보드, 커피잔. Bee가 모니터 옆/코드 위에 |
| screen | 다크 배경 (#0D1B2A), 네온 액센트. 코드/에러/데이터 |
| whiteboard | 밝은 배경, 볼드 컬러 도형. 개념 설명 |

#### C. Pixar 공식 검증

한 줄로 전체 아크를 요약한다 (SERIES_BIBLE.md C11).

```markdown
## Pixar 공식 — EP{NN}

"옛날에 [상황]이 있었다. 매일 [일상]. 어느 날 [사건]. 그래서 [행동]. 그래서 [결과]. 마침내 [변화]."

실제 적용:
> 옛날에 _____.
> 매일 _____.
> 어느 날 _____.
> 그래서 _____.
> 그래서 _____.
> 마침내 _____.
```

#### D. Shorts 추출 계획

대본 집필 전에 Shorts를 미리 설계한다 (SERIES_BIBLE.md C12).

```markdown
## Shorts 추출 — EP{NN}

### 롱폼 추출 (2-3개)
1. **Hook 클립**: 처음 15초 그대로 → Shorts 오프닝
   - 비주얼: [작성]
2. **Aha Moment**: 핵심 리빌 장면 15-30초
   - 비트 #: [비트맵에서 지정]
   - 비주얼: [작성]
3. **비주얼 개그**: Vee/Bee 리액션 + 전후 맥락 15-30초
   - 비트 #: [비트맵에서 지정]
   - 비주얼: [작성]

### 세로(9:16) 변환 노트
- 텍스트 위치 조정 필요: [있음/없음]
- Vee 리프레이밍 필요: [있음/없음]
```

### Phase 1 완료 조건

- 4가지 문서 작성 완료 (Discovery Arc 워크시트, 비트맵, Pixar 공식, Shorts 추출)
- Discovery Arc: Question → Situation → Explanation → Application → Next Question 매핑 완료
- 비트맵: 12-20 비트, 총 180-300초
- 패턴 인터럽트 20-30초 간격 확인
- Vee 리액션 최대 6회, 각 1-2초
- Bee 리액션 3-4회, 플래카드/비주얼만
- 열린 루프 + 확장 메타포 + Aha 모먼트 위치 확정
- Shorts 추출 2-3개 계획 완료
- 유저 승인

---

## Phase 2: Fountain 집필 (`/screenplay-write`)

Phase 1 통과 후에만 진행. 비트맵의 각 비트를 Fountain 대본으로 확장.

### 참조

| 규칙 | 출처 |
|------|------|
| **전체 SSOT** | **`systems/video/SERIES_BIBLE.md`** |
| 5세그먼트 구조 + 타이밍 | SERIES_BIBLE.md C8 |
| 나레이터 톤 + We Say/Never Say | SERIES_BIBLE.md A3 |
| Vee 캐릭터 + 무언극 규칙 | SERIES_BIBLE.md B6 |
| Bee 캐릭터 | `systems/video/assets/characters/bee/character_design.json` |
| 비주얼 메타포 시스템 | SERIES_BIBLE.md B7 |
| 내러티브 구조 | SERIES_BIBLE.md C11 |
| Fountain 포맷 + SEGMENT 주석 | 기존 `parse_fountain_to_prepro.py` 호환 |
| **글쓰기 원칙** | **`craft-reference.md` — 집필 전 반드시 읽을 것** |

### Fountain 포맷 규칙

```fountain
# SEGMENT N: NAME [시작-끝]
# visual_mode: A|B|C
# characters: vee | vee,bee | []
# shorts_candidate: true|false
# space: desk|screen|whiteboard

= Synopsis/비주얼 골 (= 접두사)

INT. LOCATION - TIME

NARRATOR (V.O.)
Information delivery in English. One idea per sentence.
Analogy first, then principle. Never abstract explanation.

= Visual: Character action description (for animator).
= Vee tilts head — curious expression.
= Bee on monitor, arms crossed — frustrated placard: "NOT AGAIN"
```

> **Vee는 절대 말하지 않는다.** 모든 음성은 NARRATOR (V.O.). Vee는 비주얼 리액션만 (표정 + 몸짓). 에피소드당 최대 6회, 각 1-2초.
>
> **Bee는 절대 말하지 않는다.** 비주얼 리액션 + 플래카드만. 코드의 상태를 감정으로 표현하는 바로미터. 음성 없음.

### 톤 가이드: Kurzgesagt clarity + Fireship speed

SERIES_BIBLE.md A3의 We Say / Never Say 테이블을 반드시 참조.

| O (이렇게 말한다) | X (절대 이렇게 안 한다) |
|-------------------|------------------------|
| "망했어. 왜인지 알아보자." | "이 개념을 이해하는 것이 중요합니다." |
| "847번째 줄이 열린 문이었다." | "보안 취약점이 감지되었습니다." |
| "스파게티가 됐어. 맛없는 스파게티." | "코드 구조가 최적화되지 않았습니다." |
| "3일 걸렸어. 답은 한 줄이었고." | "상당한 시간 투자 후 해결책을 발견했습니다." |

### 나레이터 원칙: 아날로지 퍼스트

1. **비유로 시작한다** — "이건 마치 ~와 같아" 로 잡고
2. **비유 안에서 설명한다** — 추상적 정의 없이 비유가 원리를 전달
3. **정의는 도착점** — 시청자가 이미 이해한 뒤에 한 줄로 정의
4. **절대 추상적 설명으로 시작하지 않는다** — "X란 Y를 Z하는 개념입니다" 금지

### 소재 활용 원칙

**블로그는 양념 창고.** 순서대로 옮기는 게 아니라, 에피소드 구조에 맞는 데이터만 골라 쓴다.
- Problem에 쓸 실패 맥락: 양념 창고에서 뽑기
- Core에 쓸 데이터: **토픽 브리프 Script Seeds** + 비주얼 메타포 시스템
- Application에 쓸 변화: 양념 창고에서 뽑기

### 집필 원칙

1. **Phase 1의 비트맵을 그대로 따른다** — 즉흥 추가/삭제 금지
2. **Discovery Arc를 따른다** — Question → Situation → Explanation → Application → Next Question
3. **아날로지 퍼스트** — 추상적 설명으로 시작하지 않는다. 비유 → 원리 → 정의 순서
4. **내레이터가 모든 정보를 전달한다** — 전 세그먼트 NARRATOR (V.O.) only
5. **Vee는 절대 말하지 않는다** — 무언극. 표정, 몸짓만. 최대 6회, 각 1-2초
6. **Bee는 절대 말하지 않는다** — 비주얼 리액션 + 플래카드만. 코드 상태의 감정 바로미터
7. **대본은 영어로 작성** — 시스템 문서만 한국어
8. **Mode A 장면**: 나레이터가 상황 설명 + Vee/Bee 비주얼 리액션 (desk 공간)
9. **Mode B 장면**: 화이트보드 공간, 다이어그램/인포그래픽, NARRATOR only
10. **Mode C 장면**: screen 공간, 코드/터미널 데모
11. **Hook**: 강렬한 오프닝 + 열린 루프, 15초 이내
12. **Outro**: 요약 + 구독 CTA + 다음 EP 티저 (Next Question)
13. **전환**: 공간 전환 시 비주얼 변형 (1-2초)
14. **패턴 인터럽트**: 20-30초마다 (씬 전환 / SFX / Vee 리액션 / 줌 / 비주얼 개그)
15. **같은 공간 30초 이상 금지**
16. **쇼츠 후보**: 비트맵의 쇼츠 계획에 해당하는 비트를 `shorts_candidate: true`로 마킹
17. **Curse of Knowledge 체크**: "이 문장을 바이브코딩 안 해본 사람이 이해하는가?"
18. **Core 데이터 규칙**: Topic Brief 증거 테이블의 구체적 데이터 포인트 **2개 이상** 반드시 포함
19. **Core 연구 규칙**: Topic Brief의 연구 기반 설명 **1개 이상** 반드시 포함. 메타포만으로 구성 불가
20. **확장 메타포**: Core에서 60초 이상 사용. 에피소드의 시각적 시그니처
21. **비트 구조**: 12-20 비트, 각 2-5초. 총 180-300초 (3-5분)
22. **비주얼 스타일**: 2D flat vector (Kurzgesagt level). 3D/claymation/clay 절대 금지

### 글쓰기 품질 규칙 (`craft-reference.md` 요약)

집필 전 `craft-reference.md` 전문을 읽는다. 아래는 액션 라인 작성 시 반드시 체크할 핵심 5가지.

1. **카메라 테스트** — 액션 라인에 적힌 것을 2D 애니메이터가 그릴 수 있는가? 못 그리면 삭제. (McKee)
2. **감정 이름 금지** — "뭔가 연결된다" ← 못 그린다. 대신 눈동자, 손, 표정의 구체적 변화를 쓴다. (McKee)
3. **액션 블록 3줄 이하** — 넘으면 쪼개거나 삭제. (Go Into The Story)
4. **대사는 원할 때만** — 나레이터만 말한다. Vee/Bee 대사 절대 없음. (Sorkin)
5. **잘라도 되면 잘라라** — 나레이션을 지워도 씬이 작동하면 그 나레이션은 필요 없다. (Sorkin)

---

## Phase 3: 구조 검증 (`/screenplay-review`)

자동 검증 스크립트 실행 + 수동 리뷰 체크리스트.

### 자동 검증

```bash
python systems/video/pipeline/scripts/validate_screenplay.py \
  --input systems/video/preproduction/ep{NN}/ep{NN}_script.fountain
```

`validate_screenplay.py` 자동 체크 항목:

- 세그먼트 5개 존재 + 올바른 순서 (HOOK → PROBLEM → CORE → APPLICATION → OUTRO)
- 각 세그먼트 타이밍 범위: Hook 15s, Problem 30s, Core 135s, Application 60s, Outro 60s
- 총 길이 180-300초 (3-5분)
- **모든 세그먼트에 NARRATOR (V.O.) 존재** (내레이션 온리)
- **Vee 음성 대사 없음** (Vee는 절대 말하지 않는다)
- **Bee 음성 대사 없음** (Bee는 절대 말하지 않는다)
- Vee 리액션 최대 6회, 각 1-2초
- `branding/storyform.json` 금지 표현 0개
- 비주얼 모드: `A` | `B` | `C` 만 허용
- 공간: `desk` | `screen` | `whiteboard` 만 허용
- 패턴 인터럽트 20-30초 간격 확인
- 같은 공간 30초 이상 연속 없음
- 비트 수 12-20개, 각 2-5초
- Core에 Topic Brief 데이터 포인트 2개+ 포함
- Core에 연구 기반 설명 1개+ 포함 (메타포만으로 구성 불가)
- 확장 메타포 Core 내 60초+ 사용
- 열린 루프 Hook에 존재, Core 전에 답하지 않음
- `shorts_candidate: true` 비트 2개+ 존재
- 2D flat vector 스타일 준수 (3D/claymation/clay 참조 없음)

### 수동 리뷰 체크리스트

자동 검증 PASS 후, 다음을 사람이 판단:

```
[ ] 톤 체크: Kurzgesagt clarity + Fireship speed 느낌인가?
    We Say/Never Say (SERIES_BIBLE.md A3) 위반 없는가?

[ ] 아날로지 퍼스트: 추상적 설명으로 시작하는 나레이션이 없는가?
    모든 개념이 비유 → 원리 → 정의 순서인가?

[ ] Discovery Arc: Question → Situation → Explanation → Application → Next Question 흐름이 느껴지는가?

[ ] 열린 루프: Hook에 심은 질문이 90초 이상 유지되는가?
    열린 루프: ___________
    답하는 시점: ___________

[ ] 확장 메타포: Core에서 60초+ 사용하는가? 에피소드의 시각적 시그니처가 되는가?
    메타포: ___________
    사용 시간: ___________

[ ] Aha 모먼트: 시청자가 "아!" 하는 순간이 명확한가?
    위치: ___________
    내용: ___________

[ ] 감정 곡선: curiosity → empathy → frustration → clarity → discovery 흐름이 느껴지는가?

[ ] Vee 무언극: Vee가 단 한 마디도 하지 않는가? 리액션만 있는가?
    리액션 횟수: _____ (최대 6)

[ ] Bee 무언극: Bee가 단 한 마디도 하지 않는가? 플래카드/비주얼만 있는가?
    Bee 등장 횟수: _____ (3-4회 이내)

[ ] Curse of Knowledge: 바이브코딩 안 해본 사람이 이해하는가?

[ ] 쇼츠 추출: 계획한 2-3개 쇼츠가 실제로 독립적으로 작동하는가?

[ ] 시리즈 바이블 일치: SERIES_BIBLE.md의 해당 EP 정보와 맞는가?
    바이블: ___________
    대본: ___________

[ ] 평가 프레임워크 게이트: B+ (18/25) 이상인가?
```

### Phase 3 완료 조건

- 자동 검증 (`validate_screenplay.py`) 전 항목 PASS
- 수동 리뷰 전 항목 체크
- **평가 프레임워크 B+ (18/25) 이상** — Content Evaluation Framework 점수 확인
- 유저 최종 승인 → 다음 단계(TTS) 진행 가능
