# 구현 계획 — DDD + Event-Driven으로 “초안 공장” 확장하기

- 작성일: 2026-03-01
- 전제: 퍼블리 원고/키트는 이미 “초안 산출물 10개” 계약이 있다.
- Intent SSOT: `00-INTENT.md`

---

## 0) 이유(의도) / 목표 / 방식 / 수단 (058 프레임으로 정리)

### 이유(의도)

- 상세페이지 제작은 “한 번”이 아니라 “계속” 반복된다.
- 반복에서 제일 큰 비용은:
  - 사람마다 방식이 달라져서 품질이 흔들리고
  - 실패했을 때 복구 루프가 없어서 재작업이 폭발하는 것

### 목표

- 새로운 기능을 붙여도(HTML 렌더러, pencil MCP, 이미지 API, 마켓 템플릿)
  - 기존 흐름이 안 깨지고
  - 서로 강하게 결합되지 않고
  - “운영 규정(가격/정책/CS/클레임)”이 자동으로 적용되게 만든다.

### 방식

- **DDD**: 도메인(상세페이지 초안 생산)에서 중요한 개념/경계를 고정한다.
- **Event-Driven**: 모듈을 “함수 호출”로 직접 엮지 않고, **이벤트(사건)**를 매개로 느슨하게 연결한다.

### 수단(현실적인 도구)

- 파일 기반 계약(`runs/.../*.md|*.json`) + 작은 RAG(`rag/sources/*.md`)
- (선택) 이벤트 로그 파일(`events.ndjson`) + 간단한 디스패처 CLI(Node)
- JSON Schema로 “산출물/이벤트 계약”을 고정

---

## 1) DDD: 도메인 모델을 먼저 고정한다(확장성의 기반)

### 유비쿼터스 언어(이 프로젝트의 “말”)

- `SSOT`: 사실(팩트) 단일 문서. 모르면 `TODO`.
- `Run`: SSOT로 “초안 세트”를 1번 뽑는 실행 단위.
- `Artifact`: Run이 만들어내는 산출물 파일 10개.
- `RuleSet`: 작은 RAG 룰 묶음(톤/섹션/QA/가격/정책/CS/클레임/기본 원리).
- `Adapter`: 산출물을 다른 형태로 변환하는 변환기(HTML, pencil, 마켓 템플릿).

### 핵심 Aggregate(확장 시 깨지면 안 되는 단위)

1. `Run` (가장 중요)
- ID: `YYYYMMDD_HHMMSS_<product_slug>`
- 입력: `ssot.yaml`
- 출력 계약(고정 10개):
  - `01_intake_report.md`
  - `02_questions_to_answer.md`
  - `03_section_plan.json`
  - `04_copy_deck.md`
  - `05_wireframe.md`
  - `06_colors.json`
  - `07_image_prompts.md`
  - `08_shot_list.md`
  - `09_qa_report.md`
  - `run_summary.md`

2. `RuleSet`
- 소스: `automation_kit/rag/sources/*.md`
- 인덱스: `automation_kit/rag/index.json`
- 주입: `automation_kit/prompt_bundle.md` (Track B)

### 경계(Bounded Context) 제안

- `DraftFactory Core`: Run 생성(오케스트레이터가 담당)
- `Governance`: QA/금칙/근거/정책 TODO 처리 + 룰 승격(운영 루프)
- `Adapters`: HTML/pencil/마켓 템플릿 등 출력 변환

경계 규칙:
- Core는 “초안 산출물 10개”만 책임진다.
- Adapters는 Core 산출물을 읽기만 한다(역방향 의존 금지).
- Governance는 “룰/정책/금지”를 올리고 Core에 주입한다(룰이 곧 안정성).

---

## 2) Event-Driven: 확장을 위한 “느슨한 연결” 만들기

### 이벤트란?

“무언가가 일어났다”를 기록한 사실.
- 예: `artifact.generated`, `qa.failed`, `rag.source.added`

이벤트 기반으로 만들면 좋은 점:
- 새 기능을 붙일 때 Core를 거의 안 건드려도 된다(구독자 추가).
- 실패/재시도/관찰(로그)이 쉬워진다.

### 이벤트 카탈로그(최소 세트)

Core 쪽:
- `run.started`
- `artifact.generated` (artifact_name 포함)
- `run.completed`

Governance 쪽:
- `qa.completed`
- `qa.failed` (issues_count 포함)
- `rule.promoted` (어떤 룰이 추가됐는지)

RAG/번들 쪽:
- `rag.source.added`
- `rag.index.built`
- `prompt_bundle.generated`

Adapters 쪽:
- `render.requested` (adapter=html|pencil|market)
- `render.completed`

### 이벤트 전달 방식(2가지 옵션)

옵션 A(단순, 현재에 잘 맞음): **암묵적 이벤트**
- “파일이 생겼다”를 이벤트로 본다.
  - `runs/.../03_section_plan.json`이 존재하면 `artifact.generated(section_plan)`로 간주
- 장점: 구현 0에 가까움(지금도 사실상 이렇게 운영)
- 단점: “언제/왜/누가” 정보가 약함

옵션 B(확장용): **명시적 이벤트 로그**
- Run 폴더에 `events.ndjson`를 추가(한 줄=한 이벤트, append-only)
- 장점: 관찰/재실행/자동화에 유리
- 단점: 계약이 하나 늘어남(운영 복잡도 소폭 증가)

권장:
- 지금은 옵션 A로 운영 + 확장 들어갈 때 옵션 B로 승격.

---

## 3) 구현 로드맵(작게, 안전하게)

### Phase 0 (지금): 계약/언어/가드레일 정리

- [x] Intent SSOT 만들기: `00-INTENT.md`
- [x] 산출물 파일명/번호 규칙 정합성 맞추기(문서/키트)
- [x] 글-그림 연동: 이미지 플레이스홀더 ID(`IMG-...`)를 wireframe/image/shot에 공유

### Phase 1: “이벤트 카탈로그”를 문서로 고정(코드 없이)

- [ ] 이 문서의 이벤트 목록을 1페이지 표로 확정
- [ ] 각 이벤트의 “생성 조건(트리거)”과 “소비자(누가 듣나)”를 적기

### Phase 2: 명시적 이벤트 로그(선택, 확장 시작점)

- [ ] `events.ndjson` 스키마 정의(간단한 Event Envelope)
- [ ] 오케스트레이터가 (선택적으로) `events.ndjson`도 생성하도록 추가
  - 또는: `runs/` 폴더를 스캔해서 `events.ndjson`를 만들어주는 CLI를 만든다

### Phase 3: 첫 Adapter 1개를 이벤트처럼 붙이기(추천: HTML)

- [ ] 입력: `runs/.../03_section_plan.json` + `04_copy_deck.md` + `06_colors.json`
- [ ] 출력: `runs/.../output/index.html` (플랫폼 중립)
- [ ] 실패 시: Core 산출물은 유지, Adapter만 재실행 가능

### Phase 4: 운영 루프 자동화(정시 퇴근에 직접 기여)

- [ ] `09_qa_report.md`의 반복 이슈 1개를 룰로 승격하는 템플릿 추가
- [ ] RAG 갱신 → 번들 재생성까지 “반복 루틴”을 1커맨드로 묶기

---

## 4) 퍼블리 원고에서의 사용 방식(권장)

원고 본문:
- Track A(복붙) / Track B(자동화)까지만 보여준다.
- “Event-driven/DDD”는 **부록/심화**로 짧게만 언급한다.
  - 왜냐: 독자(마케터/기획자)는 “오늘 바로”가 우선이라서.

부록(심화):
- “확장할 때는 DDD로 경계/언어를 고정하고, 이벤트로 느슨하게 붙이면 된다” 5줄 요약

---

## 5) 관련 파일(현재 구현)

- Intent: `00-INTENT.md`
- 원고 계획: `PUBLY_ARTICLE_PLAN.md`
- 키트: `automation_kit/`
- 오케스트레이터: `automation_kit/prompts/00_orchestrator.md`
- 작은 RAG: `automation_kit/rag/sources/`
- 번들(Track B): `automation_kit/prompt_bundle.md`
- 데모 실행: `demo/README.md`

