# Screenplay Writer Skill

대본 작성 4단계 프로세스. 각 단계는 게이트 — 이전 단계 통과 전 다음 단계 진입 불가.

## 서브커맨드

| 커맨드 | 역할 |
|--------|------|
| `/screenplay-topic` | Phase 0: 소재 정의 (한 에피소드 = ONE 질문, ONE 개념, ONE 발견) |
| `/screenplay-research` | Phase 0.5: 주제 리서치 (웹 조사 + 블로그 근거 추출 + 토픽 브리프) |
| `/screenplay-plan` | Phase 1: 스토리 설계 (Discovery Arc + Story Spine + 감정 트래커) |
| `/screenplay-write` | Phase 2: Fountain 집필 (설계 기반) |
| `/screenplay-review` | Phase 3: 구조 검증 (자동 + 수동 체크리스트) |

---

## Phase 0: 주제 정의 (`/screenplay-topic`)

**모든 것의 시작.** 시청자의 질문을 정하면 구조가 나온다. 구조가 나오면 장면이 나온다. 이 순서를 절대 뒤집지 않는다.

### 참조
- `systems/video/preproduction/source_index.json` — EP별 질문+주제 매핑
- `systems/video/preproduction/rag/` — 블로그 소재 RAG 인덱스 (`node scripts/query.mjs "키워드" --top=5`)

### 프로세스

#### Step 1: 시청자 질문을 정한다

> 예: **"바이브코딩이 뭐야?"**

시청자가 실제로 구글링할 질문. 한 줄.

#### Step 2: 5분 후 알게 되는 것을 정한다

| 질문 | 답 |
|------|-----|
| **질문** | [예: "바이브코딩이 뭐야?"] |
| **5분 후 알게 되는 것** | [예: AI가 대신 코딩 ≠ 바이브코딩. AI와 '같이' 만드는 것.] |
| **왜 중요한가** | [예: 이걸 모르면 AI 핑퐁 무한루프에 빠짐] |

#### Step 3: 질문이 곧 에피소드 구조다

| 세그먼트 | 전달 내용 | 형식 |
|----------|----------|------|
| **질문** | 시청자 질문 그대로 | 텍스트 + Vee 표정 |
| **상황** | 이 질문과 만나는 맥락 | Vee가 해보다가 "어?" |
| **설명** | 핵심 개념 + 데이터 | 내레이터 + 다이어그램 |
| **적용** | 이해한 걸 적용 | Vee가 해봄 → 결과 |
| **다음 질문** | 자연스러운 다음 궁금증 | = 다음 EP 질문 |

#### Step 4: 블로그에서 양념을 뽑는다

블로그 글(`content/blog/phase1/`)은 **양념 창고**. 순서대로 옮기는 게 아니라, 에피소드 구조에 맞는 데이터만 골라 쓴다.

- 상황에 쓸 맥락: [블로그에서 뽑기]
- 설명에 쓸 데이터: [블로그 숫자/인용 + 메타포 라이브러리]
- 적용에 쓸 변화: [블로그에서 뽑기]

### 작성: 주제 카드

```markdown
## 주제 카드 — EP{NN}

### 질문
> [시청자 질문. 예: "바이브코딩이 뭐야?"]

### 5분 후 알게 되는 것
> [한 줄. 예: AI가 대신 코딩 ≠ 바이브코딩. AI와 '같이' 만드는 것.]

### 에피소드 구조

| 세그먼트 | 내용 | 블로그 양념 |
|----------|------|------------|
| 질문 | | |
| 상황 | | |
| 설명 | | 메타포 ID: |
| 적용 | | |
| 다음 질문 | | = EP{NN+1} 질문 |

### Vee의 발견
- 시작: [예: "AI한테 시키면 코딩 아니야?"]
- 발견: [예: "같이 만드는 거구나"]

### 쇼츠 후보 (2개)
1.
2.
```

### Phase 0 완료 조건

- 질문이 **시청자가 구글링할** 수준으로 자연스러움
- 5분 후 알게 되는 것이 한 줄
- 다음 질문이 다음 EP과 연결됨
- Vee의 시작 ≠ 발견
- **유저 승인**

---

## Phase 0.5: 주제 리서치 (`/screenplay-research`)

Phase 0 통과 후에만 진행. 주제를 **연구**하고 블로그에서 **근거를 추출**하여 토픽 브리프를 작성한다.

**왜 필요한가**: 블로그 글은 소재 시드(감정+경험)일 뿐이다. 설명 세그먼트가 근거 기반이 되려면, 주제 자체에 대한 리서치 + 블로그의 구체 데이터 추출이 필요하다.

### 입력

- Phase 0에서 승인된 소재 카드
- `source_index.json`의 해당 에피소드 소스 파일 목록

### 참조

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
3. **감정 여정 비트** — 시작 상태 → 에스컬레이션 → 브레이킹 포인트 → 깨달음 → 해결

> 핵심: 대본에 사용할 **구체적 사실**. "10,847줄" 같은 숫자가 "코드가 많아졌다"보다 100배 강력.

#### Step C: 토픽 브리프 작성

`topic_brief_template.md` 양식에 따라 토픽 브리프를 작성한다.

- 저장: `preproduction/ep{NN}/ep{NN}_topic_brief.md`
- Part 1: Research Summary (Step A 결과)
- Part 2: Blog Evidence Table (Step B 결과)
- Part 3: Explainer Script Seeds (리서치 + 블로그 근거를 결합한 설명 세그먼트 비트 3-5개)
- Part 4: Recommended Sources

### Phase 0.5 완료 조건

- 웹 리서치 5가지 질문 전부 답변
- 증거 테이블에 구체적 데이터 포인트 5개+
- 아하 모먼트 정확한 소스와 함께 식별
- Explainer Script Seeds 3개+, 각각 연구+블로그 근거 보유
- **유저 승인**

---

## Phase 1: 스토리 설계 (`/screenplay-plan`)

Phase 0.5 통과 후에만 진행. 소재 카드 + **토픽 브리프**를 바탕으로 이야기 구조를 설계한다.

### 입력

- Phase 0에서 승인된 소재 카드
- **Phase 0.5에서 승인된 토픽 브리프** — 특히 Explainer Script Seeds

### 참조 SSOT

| 문서 | 용도 |
|------|------|
| `systems/planning/12-episode-series-bible.md` | 에피소드별 질문, 캐릭터 아크 |
| `systems/planning/11-concept-metaphor-library.md` | 설명 세그먼트 메타포 |
| `systems/planning/10-youtube-format-bible.md` | 5세그먼트 구조, 타이밍, 비주얼 모드 |
| `systems/planning/16-channel-identity.md` | 채널 아이덴티티, 캐릭터 설정, 톤 |
| `branding/storyform.json` | 금지 표현 |

### 작성 문서 3가지

#### A. Discovery Arc 워크시트

**질문→모험→답** 구조를 5세그먼트에 매핑.

```markdown
## Discovery Arc — EP{NN}

### 질문 (질문 세그먼트)
시청자의 질문은?
> [작성]

### 맥락 (상황 세그먼트)
Vee가 이 질문과 어떻게 만나나? "어?" 순간은?
> [작성]

### 발견 (설명 세그먼트)
무슨 개념이 답이 되나? 메타포 ID는? 토픽 브리프의 어떤 Script Seeds를 사용하나?
> [작성] (11-concept-metaphor-library.md + ep{NN}_topic_brief.md Part 3 참조)

### 적용 (적용 세그먼트)
Vee가 뭘 해보나? 결과는?
> [작성]

### 다음 호기심 (다음 질문 세그먼트)
이 답에서 자연스럽게 나오는 다음 질문은? EP{NN+1}과 연결되나?
> [작성]

### Opening Image ↔ Final Image
- 오프닝: [질문 세그먼트의 핵심 이미지]
- 파이널: [다음 질문 세그먼트의 핵심 이미지 — 오프닝과 대비]
```

#### B. Story Spine

한 줄로 전체 아크를 요약한다.

```markdown
## Story Spine — EP{NN}

Vee는 _____ 궁금했다.
그래서 _____ 해봤다.
그랬더니 _____ 됐다.
알고 보니 _____ 때문이었다.
이제 Vee는 _____ 할 수 있다.
근데 _____ 가 궁금해졌다.
```

#### C. 감정 트래커

Vee/Bee의 감정 상태를 세그먼트 경계마다 추적. `12-episode-series-bible.md`의 캐릭터 아크와 교차 검증.

```markdown
## 감정 트래커 — EP{NN}

| 경계 | Vee 감정 | Bee 감정 | 관계 상태 |
|------|---------|---------|----------|
| 질문 | | | |
| 상황 시작 | | | |
| 상황 끝 | | | |
| 설명 | (없음) | (없음) | n/a |
| 적용 시작 | | | |
| 적용 끝 | | | |
| 다음 질문 | | | |

시리즈 바이블 일치: [EP{NN} 아크 요약 복사 후 대조]
```

### Phase 1 완료 조건

- 3가지 문서 작성 완료
- Discovery Arc의 다음 질문 ↔ 다음 EP 질문 연결 확인
- 감정 트래커와 시리즈 바이블 교차 검증
- 유저 승인

---

## Phase 2: Fountain 집필 (`/screenplay-write`)

Phase 1 통과 후에만 진행. Discovery Arc의 각 단계를 Fountain 세그먼트로 확장.

### 참조

| 규칙 | 출처 |
|------|------|
| 5세그먼트 구조 + 타이밍 | `10-youtube-format-bible.md` |
| Fountain 포맷 + SEGMENT 주석 | 기존 `parse_fountain_to_prepro.py` 호환 |
| 톤: 옆자리 형/누나 | `16-channel-identity.md` |
| 금지 표현 | `branding/storyform.json` |
| 메타포 | `11-concept-metaphor-library.md` |
| **글쓰기 원칙** | **`craft-reference.md` — 집필 전 반드시 읽을 것** |

### Fountain 포맷 규칙

```fountain
# SEGMENT N: NAME [시작-끝]
# visual_type: character|explainer|code_demo
# characters: vee, bee | []
# shorts_candidate: true|false

= Synopsis/비주얼 골 (= 접두사)

INT. LOCATION - TIME

NARRATOR (V.O.)
Information delivery in English. One idea per sentence.

= Visual: Character action description (for animator).
= Vee tilts head — curious expression.
= Bee holds up a sign: "NOPE"

> TRANSITION: transition direction
```

> **캐릭터 음성 라인 없음.** 모든 음성은 NARRATOR (V.O.). 캐릭터 행동은 `=` 액션 라인으로만.

### 소재 활용 원칙

**블로그는 양념 창고.** 순서대로 옮기는 게 아니라, 에피소드 구조에 맞는 데이터만 골라 쓴다.
- 상황에 쓸 맥락: 양념 창고에서 뽑기
- 설명에 쓸 데이터: **토픽 브리프 Script Seeds** + 메타포 라이브러리
- 적용에 쓸 변화: 양념 창고에서 뽑기

### 집필 원칙

1. **Phase 1의 Discovery Arc를 그대로 따른다** — 즉흥 추가/삭제 금지
2. **정보 경로를 먼저 설계한다** — 시청자가 아는 것 → 모르는 것, 한 번에 하나
3. **내레이터가 모든 정보를 전달한다** — 전 세그먼트 NARRATOR (V.O.) only
4. **캐릭터 대사 없음** — 립싱크 없으므로 캐릭터는 비주얼 리액션만 (표정, 팻말, 제스처)
5. **대본은 영어로 작성** — 시스템 문서만 한국어
6. **캐릭터 장면**: 내레이터가 상황 설명 + 캐릭터 비주얼 리액션
7. **설명**: NARRATOR (V.O.) only, 캐릭터 등장 안 함, 데이터 포인트 2개+ 필수
8. **질문**: 화면에 텍스트 + Vee 표정, 15초 이내
9. **다음 질문**: 짧게. 10초 넘기지 않음. 다음 EP 질문과 연결.
10. **전환**: 캐릭터→설명 시 비주얼 변형 (1-2초)
11. **쇼츠 후보**: 시리즈 바이블의 쇼츠 후보를 `shorts_candidate: true`로 마킹
12. **Curse of Knowledge 체크**: "이 문장을 바이브코딩 안 해본 사람이 이해하는가?"
13. **설명 데이터 규칙**: Topic Brief 증거 테이블의 구체적 데이터 포인트 **2개 이상** 반드시 포함
14. **설명 연구 규칙**: Topic Brief의 연구 기반 설명 **1개 이상** 반드시 포함. 메타포만으로 구성 불가

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
- 세그먼트 5개 존재 + 올바른 순서 (질문→상황→설명→적용→다음 질문)
- 각 세그먼트 타이밍이 포맷 바이블 범위 내
- 총 길이 210-300초 (3.5-5분)
- **모든 세그먼트에 NARRATOR (V.O.) 존재** (내레이션 온리)
- 캐릭터 장면 세그먼트에 캐릭터 음성 대사 없음
- 설명 세그먼트에 NARRATOR만 있음
- `branding/storyform.json` 금지 표현 0개
- 설명 `characters` = `[]`
- 전환 지시 존재 (캐릭터↔설명 경계)
- **설명에 Topic Brief의 구체적 데이터 포인트 2개+ 포함**
- **설명에 연구 기반 설명 1개+ 포함 (메타포만으로 구성 불가)**

### 수동 리뷰 체크리스트

자동 검증 PASS 후, 다음을 사람이 판단:

```
[ ] 질문 자연스러움: 시청자가 진짜 구글링할 질문인가?
    질문: ___________

[ ] 학습 결과: 5분 후 시청자가 뭘 알게 되나? 한 줄로 답 가능?
    알게 되는 것: ___________

[ ] Opening Image ↔ Final Image: 대비가 명확한가?
    오프닝 이미지: ___________
    파이널 이미지: ___________

[ ] Vee 감정 아크: 호기심 → 발견 패턴인가?
    시작: _____ → 끝: _____

[ ] 시리즈 바이블 일치: EP{NN} 아크가 바이블 엔트리와 맞는가?
    바이블: ___________
    대본: ___________

[ ] 다음편 연결: 다음 질문이 EP{N+1}의 질문과 연결되는가?
    다음 질문: ___________
    EP{N+1} 질문: ___________

[ ] Curse of Knowledge: 바이브코딩 안 해본 사람이 이해하는가?
```

### Phase 3 완료 조건

- 자동 검증 전 항목 PASS
- 수동 리뷰 전 항목 체크
- 유저 최종 승인 → 다음 단계(TTS) 진행 가능
