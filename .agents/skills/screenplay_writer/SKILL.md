# Screenplay Writer Skill

대본 작성 4단계 프로세스. 각 단계는 게이트 — 이전 단계 통과 전 다음 단계 진입 불가.

## 서브커맨드

| 커맨드 | 역할 |
|--------|------|
| `/screenplay-topic` | Phase 0: 소재 정의 (한 에피소드 = ONE 개념, ONE 메타포, ONE 갈등) |
| `/screenplay-plan` | Phase 1: 스토리 설계 (Story Circle + Story Spine + 감정 트래커) |
| `/screenplay-write` | Phase 2: Fountain 집필 (설계 기반) |
| `/screenplay-review` | Phase 3: 구조 검증 (자동 + 수동 체크리스트) |

---

## Phase 0: 주제 정의 (`/screenplay-topic`)

**모든 것의 시작.** 주제를 정하면 구조가 나온다. 구조가 나오면 장면이 나온다. 이 순서를 절대 뒤집지 않는다.

### 참조
- `systems/video/preproduction/source_index.json` — EP별 소스+주제 매핑
- `systems/video/preproduction/rag/` — 블로그 소재 RAG 인덱스 (`node scripts/query.mjs "키워드" --top=5`)

### 프로세스

#### Step 1: 주제를 한 단어로 정한다

> 예: **스펙**

#### Step 2: 주제에서 3가지를 뽑는다

| 질문 | 답 |
|------|-----|
| **이게 뭔지** | [예: "뭘 만들 건지" 적어둔 것] |
| **없으면 어떻게 되는지** | [예: 돌아가긴 가는데 뭘 만들고 있는지 모름, 고치면 다른 데 터짐] |
| **있으면 어떻게 되는지** | [예: 뭘 만드는지 알고 시작함] |

#### Step 3: 3가지가 곧 에피소드 구조다

| 막 | 전달 내용 | 형식 |
|----|----------|------|
| **1막** — 없으면 | 주제 없이 하면 이렇게 된다 | 시트콤 — Vee가 삽질하는 걸 **보여준다** |
| **2막** — 뭔지 | 주제가 이런 거다 | 해설 — 메타포로 **설명한다** |
| **3막** — 있으면 | 주제가 있으면 이렇게 달라진다 | 시트콤 — Vee가 변하는 걸 **보여준다** |

이게 에피소드의 뼈대다. 여기서 HOOK(1막의 하이라이트 먼저 보여주기)과 ENDING(3막의 마무리)이 자연스럽게 나온다.

#### Step 4: 소재 창고에서 장면을 뽑는다

블로그 글(`content/blog/phase1/`)은 **소재 창고**. 순서대로 옮기는 게 아니라, 3막 구조에 맞는 장면만 골라 쓴다.

- 1막에 쓸 삽질 장면: [블로그에서 뽑기]
- 2막에 쓸 개념 설명: [메타포 라이브러리에서 뽑기]
- 3막에 쓸 변화 장면: [블로그에서 뽑기]

### 작성: 주제 카드

```markdown
## 주제 카드 — EP{NN}

### 주제
> [한 단어. 예: 스펙]

### 세 가지

| | 내용 |
|--|------|
| **뭔지** | |
| **없으면** | |
| **있으면** | |

### 3막 구조

| 막 | 전달 | 형식 | 소재 창고에서 뽑은 장면 |
|----|------|------|----------------------|
| 1막 (없으면) | | 시트콤 | |
| 2막 (뭔지) | | 해설 | 메타포 ID: |
| 3막 (있으면) | | 시트콤 | |

### Vee의 변화
- 착각 (시작): [예: "돌아가니까 됐다"]
- 깨달음 (끝): [예: "뭘 만드는지 먼저 알아야 한다"]

### 쇼츠 후보 (2-3개)
1.
2.
3.
```

### Phase 0 완료 조건

- 주제가 **한 단어**로 명확
- 세 가지(뭔지/없으면/있으면)가 각각 한 줄
- 3막 구조에서 소재 창고 장면이 골라져 있음
- Vee의 착각 ≠ 깨달음
- **유저 승인**

---

## Phase 1: 스토리 설계 (`/screenplay-plan`)

Phase 0 통과 후에만 진행. 소재 카드를 바탕으로 이야기 구조를 설계한다.

### 입력

- Phase 0에서 승인된 소재 카드

### 참조 SSOT

| 문서 | 용도 |
|------|------|
| `systems/planning/12-episode-series-bible.md` | 에피소드별 비트, 캐릭터 아크, 해설 개념 |
| `systems/planning/11-concept-metaphor-library.md` | 해설 세그먼트 메타포 |
| `systems/planning/10-youtube-format-bible.md` | 5세그먼트 구조, 타이밍, 비주얼 모드 |
| `branding/narrative.md` | 3막 서사 구조, Nike Rule |
| `branding/storyform.json` | 톤 비율, 금지 표현 |

### 작성 문서 3가지

#### A. Story Circle 워크시트

Dan Harmon의 8단계를 5세그먼트에 매핑. **Step 8은 반드시 Step 2를 거울처럼 참조해야 한다.**

```markdown
## Story Circle — EP{NN}

### 1. YOU (일상) → HOOK 시작
Vee는 지금 뭘 믿고 있나?
> [작성]

### 2. NEED (위기) → HOOK 끝
무슨 사건이 터지나? 어떤 질문이 던져지나?
> [작성]

### 3. GO (진입) → SITCOM ACT 1 시작
Vee가 처음 시도하는 건? (항상 틀린 접근이어야 함)
> [작성]

### 4. SEARCH (몸부림) → SITCOM ACT 1 끝
어떻게 더 꼬이나? Bee는 어디서 끼어드나?
> [작성]

### 5. FIND (발견) → EXPLAINER
무슨 개념이 문제를 설명하나? 메타포 ID는?
> [작성] (11-concept-metaphor-library.md 참조)

### 6. TAKE (대가) → SITCOM ACT 2 시작
Vee가 뭘 바꾸거나 포기하나?
> [작성]

### 7. RETURN (복귀) → SITCOM ACT 2 끝
원래 상황으로 어떻게 돌아오나?
> [작성]

### 8. CHANGE (변화) → ENDING
Vee가 어떻게 달라졌나? **Step 2의 같은 장면에서 다른 반응을 보여야 한다.**
> [작성]

### Opening Image ↔ Final Image
- 오프닝: [HOOK의 핵심 이미지]
- 파이널: [ENDING의 핵심 이미지 — 오프닝의 거울]
```

#### B. Story Spine

Pixar 빈칸 채우기. 한 줄로 전체 아크를 요약한다.

```markdown
## Story Spine — EP{NN}

옛날 옛적에, Vee는 _____.
매일매일, 그녀는 _____.
그러던 어느 날, _____.
그래서, _____.
그래서, _____.
마침내, _____.
그 후로, _____.
```

#### C. 감정 트래커

Vee/Bee의 감정 상태를 세그먼트 경계마다 추적. `12-episode-series-bible.md`의 캐릭터 아크와 교차 검증.

```markdown
## 감정 트래커 — EP{NN}

| 경계 | Vee 감정 | Bee 감정 | 관계 상태 |
|------|---------|---------|----------|
| HOOK 진입 | | | |
| HOOK 퇴장 | | | |
| SITCOM1 진입 | | | |
| SITCOM1 퇴장 | | | |
| EXPLAINER | (없음) | (없음) | n/a |
| SITCOM2 진입 | | | |
| SITCOM2 퇴장 | | | |
| ENDING | | | |

시리즈 바이블 일치: [EP{NN} 아크 요약 복사 후 대조]
```

### Phase 1 완료 조건

- 3가지 문서 작성 완료
- Story Circle Step 8 ↔ Step 2 거울 확인
- 감정 트래커와 시리즈 바이블 교차 검증
- 유저 승인

---

## Phase 2: Fountain 집필 (`/screenplay-write`)

Phase 1 통과 후에만 진행. Story Circle의 각 스텝을 Fountain 세그먼트로 확장.

### 참조

| 규칙 | 출처 |
|------|------|
| 5세그먼트 구조 + 타이밍 | `10-youtube-format-bible.md` |
| Fountain 포맷 + SEGMENT 주석 | 기존 `parse_fountain_to_prepro.py` 호환 |
| 톤: 시트콤=반말, 해설=존댓말 | `10-youtube-format-bible.md` |
| Nike Rule: 액션 > 대사 | `branding/narrative.md` |
| 금지 표현 | `branding/storyform.json` |
| 메타포 | `11-concept-metaphor-library.md` |
| **글쓰기 원칙** | **`craft-reference.md` — 집필 전 반드시 읽을 것** |

### Fountain 포맷 규칙

```fountain
# SEGMENT N: NAME [시작-끝]
# visual_type: sitcom|explainer
# characters: vee, bee | []
# shorts_candidate: true|false

= Synopsis/비주얼 골 (= 접두사)

INT. 장소 - 시간

액션 라인. Vee가 뭔가 한다. (Nike Rule: 보여주기 > 말하기)

CHARACTER
(감정/동작)
대사. 짧게. 3-7단어.

> TRANSITION: 전환 지시
```

### 소재 활용 원칙

**블로그(`content/blog/phase1/`, `content/blog/blog-only/`)는 소재 창고.**
순서대로 옮기는 게 아니라, 3막 구조에 맞는 장면만 골라 쓴다.
- 1막에 쓸 삽질 장면: 소재 창고에서 "없으면"에 해당하는 에피소드 뽑기
- 2막에 쓸 개념 설명: 메타포 라이브러리에서 뽑기
- 3막에 쓸 변화 장면: 소재 창고에서 "있으면"에 해당하는 에피소드 뽑기

### 집필 원칙

1. **Phase 1의 Story Circle을 그대로 따른다** — 즉흥 추가/삭제 금지
2. **시트콤**: 반말, Vee+Bee 대화, 액션 중심, 한 줄 = 한 비트
3. **해설**: 존댓말, NARRATOR (V.O.) only, 캐릭터 등장 안 함
4. **HOOK**: 결과 먼저 (In Medias Res), 15-30초
5. **ENDING**: Opening Image의 거울. Phase 1에서 정의한 Final Image 반드시 포함
6. **전환**: 시트콤→해설 줌인, 해설→시트콤 줌아웃 (물건 모핑)
7. **쇼츠 후보**: 시리즈 바이블의 쇼츠 후보를 `shorts_candidate: true`로 마킹

### 글쓰기 품질 규칙 (`craft-reference.md` 요약)

집필 전 `craft-reference.md` 전문을 읽는다. 아래는 액션 라인 작성 시 반드시 체크할 핵심 5가지.

1. **카메라 테스트** — 액션 라인에 적힌 것을 애니메이터가 그릴 수 있는가? 못 그리면 삭제. (McKee)
2. **감정 이름 금지** — "뭔가 연결된다" ← 못 그린다. 대신 눈동자, 손, 표정의 구체적 변화를 쓴다. (McKee)
3. **액션 블록 3줄 이하** — 넘으면 쪼개거나 삭제. (Go Into The Story)
4. **대사는 원할 때만** — 캐릭터가 상대에게 뭔가를 원할 때 말한다. 정보 전달용 대사 금지. (Sorkin)
5. **잘라도 되면 잘라라** — 대사를 지워도 씬이 작동하면 그 대사는 필요 없다. (Sorkin)

---

## Phase 3: 구조 검증 (`/screenplay-review`)

자동 검증 스크립트 실행 + 수동 리뷰 체크리스트.

### 자동 검증

```bash
python systems/video/pipeline/scripts/validate_screenplay.py \
  --input systems/video/preproduction/ep{NN}/ep{NN}_script.fountain
```

자동 체크 항목:
- 세그먼트 5개 존재 + 올바른 순서
- 각 세그먼트 타이밍이 포맷 바이블 범위 내
- 총 길이 240-480초 (4-8분)
- 시트콤 세그먼트에 NARRATOR 없음
- 해설 세그먼트에 NARRATOR만 있음
- `branding/storyform.json` 금지 표현 0개
- 해설 `characters` = `[]`
- 전환 지시 존재 (시트콤↔해설 경계)

### 수동 리뷰 체크리스트

자동 검증 PASS 후, 다음을 사람이 판단:

```
[ ] 서클 클로저: ENDING이 HOOK의 위기를 거울처럼 비추는가?
    HOOK 위기: ___________
    ENDING 거울: ___________

[ ] Opening Image ↔ Final Image: 같은 상황, 다른 반응?
    오프닝 이미지: ___________
    파이널 이미지: ___________

[ ] Vee 감정 아크: HOOK 감정 ≠ ENDING 감정?
    시작: _____ → 끝: _____

[ ] 시리즈 바이블 일치: EP{NN} 아크가 바이블 엔트리와 맞는가?
    바이블: ___________
    대본: ___________

[ ] 다음편 떡밥: EP{N+1}의 HOOK과 연결되는가?
    떡밥: ___________
    다음편 HOOK: ___________
```

### Phase 3 완료 조건

- 자동 검증 전 항목 PASS
- 수동 리뷰 전 항목 체크
- 유저 최종 승인 → 다음 단계(TTS) 진행 가능
