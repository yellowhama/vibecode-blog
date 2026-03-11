# 대본 파이프라인 재정비 + 소스 인덱스 구축

> 작성일: 2026-03-11
> 상태: 승인됨 — 구현 진행 중

## Context

대본 작성 프로세스가 확립됐다 (주제→설계→집필→검증). 이제 이걸 실제로 돌릴 수 있도록:
1. 파이프라인 순서를 재정비하고
2. 스킬들을 업데이트하고
3. 소스 블로그 글들을 정리해서 인덱스하고
4. EP01 대본을 새 프로세스로 재작성할 준비를 한다

---

## 대본 파이프라인 (올바른 순서)

```
주제 정의 (/screenplay-topic)
  ↓ 유저 승인
스토리 설계 (/screenplay-plan)
  ↓ 유저 승인
Fountain 집필 (/screenplay-write)
  ↓ 유저 승인
구조 검증 (/screenplay-review)
  ↓ 자동검증 PASS + 유저 승인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TTS 생성 (대본 확정 후에만)
  ↓
타이밍 싱크 (TTS actual_duration → shot manifest)
  ↓
키프레임 렌더 (Kontext + T2I)
  ↓
I2V 렌더 (Wan 2.2 MoE)
  ↓
최종 조립 (영상+VO+자막+BGM)
```

### DAG (스크립트 매핑)

```
screenplay-topic → screenplay-plan → screenplay-write → screenplay-review
  ↓ (대본 확정)
parse_fountain_to_prepro.py → generate_tts → build_shot_manifest → render → assemble
```

---

## Step 1: 소스 블로그 인덱스 구축

### 1A. 원본 소스 확인

원본 블로그 ~50편이 `content/blog/blog-only/`에 존재 (프로젝트 내).
정제된 Phase 1 소스 25편 (KO+EN)이 `content/blog/phase1/`에 존재.

### 1B. 에피소드 소스 매핑 인덱스

**파일**: `systems/video/preproduction/source_index.json`

에피소드별로 어떤 블로그가 소재인지 매핑하는 마스터 인덱스.
시리즈 바이블(`12-episode-series-bible.md`)과 1:1 대응.

| EP | 주제 | Phase1 소스 | 원본 소스 | 메타포 |
|----|------|------------|----------|--------|
| 01 | 스펙 | act1-1, act1-2 | 049, 050, 058 | 설계도 vs 무작위 쌓기 |
| 02 | 프롬프트 vs 스펙 | act1-3, act1-4 | | 구두 주문 vs 서면 주문 |
| 03 | SDD | act2-1, act2-2 | | 집 방 나누기 |
| 04 | 의존성/모듈 | act2-3, act2-4 | | 도미노 + 레고 |
| 05 | 도메인 | act3-1, act3-2 | | 동네 지도 |
| 06 | Bounded Context | act3-3, act3-4 | | 울타리 + 검문소 |
| 07 | TDD | act4-1, act4-2 | | 안전망 + 신호등 |
| 08 | 테스팅 사이클 | act4-3, act4-4 | | Red-Green-Refactor |

### 1C. RAG 인덱스

**디렉토리**: `systems/video/preproduction/rag/`

기존 `systems/pitch/automation/rag/` 패턴 재활용:
- `build_index.mjs` — H2 대신 `---`(수평선)으로 청크 분할
- `query.mjs` — 키워드 검색 (BM25-like scoring)
- 메타데이터: `act`, `chapter`, `concept` 태그 추가

---

## Step 2: 스킬 업데이트

| 스킬 | 변경 | 내용 |
|------|------|------|
| `screenplay_writer` | 수정 | source_index.json 참조 추가, Phase 2에 "소재 창고에서 뽑기" 명시 |
| `video_concept_writer` | 수정 | DEPRECATED 노트 (non-lingual claymation → 한국어 대사+해설로 전환) |
| `script_storyboard_expert` | 수정 | "이야기 구조는 screenplay_writer 담당. 이 스킬은 포맷+샷 분해만" |
| `video_storyboard_planner` | 수정 | "Fountain 완성 후에만 사용" 게이트 추가 |

---

## Step 3: 자동 검증 스크립트

**파일**: `systems/video/pipeline/scripts/validate_screenplay.py`

`parse_fountain_to_prepro.py`의 regex 패턴 재사용. CLI로 Fountain 파일을 자동 검증.

### 자동 체크 항목

```
[PASS/FAIL] 세그먼트 5개 존재
[PASS/FAIL] 순서: HOOK → SITCOM ACT 1 → EXPLAINER → SITCOM ACT 2 → ENDING
[PASS/FAIL] 타이밍 범위 (HOOK 15-30s, SITCOM1 60-90s, EXPLAINER 90-120s, SITCOM2 60-90s, ENDING 15-30s)
[PASS/FAIL] 총 길이 240-480초
[PASS/FAIL] 시트콤에 NARRATOR 없음
[PASS/FAIL] 해설에 NARRATOR만 있음
[PASS/FAIL] 금지 표현 0개 (storyform.json)
[PASS/FAIL] 해설 characters = []
[PASS/WARN] 시트콤↔해설 전환 지시 존재
```

### 수동 리뷰 출력

```
[ ] 서클 클로저: ENDING이 HOOK 위기의 거울인가?
[ ] Opening Image ↔ Final Image: 같은 상황, 다른 반응?
[ ] Vee 감정 아크: 시작 ≠ 끝?
[ ] 시리즈 바이블 일치
[ ] 다음편 떡밥
```

---

## Step 4: EP01 대본 재작성 준비

### 주제 카드 (확정)

**파일**: `systems/video/preproduction/ep01/ep01_topic_card.md`

- **주제**: 스펙
- **뭔지**: "뭘 만들 건지" 적어둔 것
- **없으면**: AI한테 하나씩 물어보면 핑퐁 무한루프. 고치면 옆에서 터짐.
- **있으면**: 뭘 만드는지 알고 시작. 에러가 있어도 뭘 고칠지 앎.
- **Vee 착각**: "돌아가니까 됐다"
- **Vee 깨달음**: "짜증을 정리하면 그게 스펙이다"

### 기존 산출물 보존

대본 재작성 후 재생성 필요:
- `ep01_prepro_manifest.json`, `ep01_shot_manifest.json`, `ep01_tts_input.json`
- `voiceover_master.wav`, `subtitles.srt`
- 키프레임/렌더 결과

기존 파일은 `_v1/` 폴더로 백업.

---

## Step 5: CLAUDE.md 업데이트

대본 프로세스 섹션 추가:
- 파이프라인 순서 (절대 뒤집지 않음)
- 주제 정의 원칙 (한 단어 → 3가지 → 3막)
- 핵심 스킬 + 소재 인덱스 경로

---

## 수정 대상 파일 요약

| 파일 | 작업 | 설명 |
|------|------|------|
| `systems/video/preproduction/source_index.json` | **신규** | EP별 소스+주제+상태 매핑 |
| `systems/video/preproduction/rag/` | **신규** | 블로그 소재 RAG 인덱스 |
| `systems/video/pipeline/scripts/validate_screenplay.py` | **신규** | Fountain 구조 자동 검증 |
| `.agents/skills/screenplay_writer/SKILL.md` | 수정 | source_index.json 참조 추가 |
| `.agents/skills/video_concept_writer/SKILL.md` | 수정 | DEPRECATED 노트 |
| `.agents/skills/script_storyboard_expert/SKILL.md` | 수정 | 역할 한정 명시 |
| `.agents/skills/video_storyboard_planner/SKILL.md` | 수정 | Fountain 완성 후 전용 명시 |
| `systems/video/preproduction/ep01/ep01_topic_card.md` | **신규** | EP01 주제 카드 |
| `CLAUDE.md` | 수정 | 대본 프로세스 섹션 추가 |

---

## 검증 방법

1. `source_index.json` — EP01-08 매핑이 시리즈 바이블과 일치
2. RAG 인덱스 — `node query.mjs "스펙" --top=5` → act1 관련 상위 노출
3. `validate_screenplay.py` — EP01 fountain 검증 시 ENDING 서클 클로저 WARN
4. 스킬 — 각 SKILL.md 역할 분리 명확
5. CLAUDE.md — 대본 프로세스 섹션 정확
