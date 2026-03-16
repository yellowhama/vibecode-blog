# 대본 파이프라인 재정비 + 소스 인덱스 구축

> 작성일: 2026-03-11
> 최종 수정: 2026-03-17
> 상태: **Phase 2.5 완료** — Series Bible + 2D 캐릭터 스펙 + 시즌1 가이드 확정. EP01 2D 대본 재작성 대기 중.

## Context

~~대본 작성 프로세스가 확립됐다 (주제→설계→집필→검증). 이제 이걸 실제로 돌릴 수 있도록 파이프라인을 정비한다.~~

**2026-03-15 업데이트**: 채널 아이덴티티 전면 리브랜딩 완료.
- 3D 시트콤 → 2D 질문 기반 Explainer
- 시트콤 5세그먼트 → 질문→상황→설명→적용→다음 질문
- 블로그 우겨넣기 → 주제 먼저 커리큘럼 (EP01-08 질문 기반)
- 캐릭터 재설계: Vee(호기심), Bee(이해관계자)

---

## 완료된 작업 ✅

### 채널 리브랜딩 (2026-03-15, `bf6c96e`)

| 파일 | 작업 | 상태 |
|------|------|------|
| `systems/planning/16-channel-identity.md` | **신규** — 채널 아이덴티티 SSOT | ✅ |
| `systems/planning/10-youtube-format-bible.md` | **전면 리라이트** — 질문 기반 5세그먼트 | ✅ |
| `systems/planning/12-episode-series-bible.md` | **전면 리라이트** — 주제 먼저 커리큘럼 | ✅ |
| `systems/video/preproduction/source_index.json` | **전면 리라이트** — v2.0 질문/학습결과 매핑 | ✅ |
| `.agents/skills/screenplay_writer/SKILL.md` | **전면 리라이트** — Discovery Arc, 새 검증 기준 | ✅ |
| `systems/planning/08-branding-strategy.md` | **업데이트** — 톤/비주얼/포지셔닝 정렬 | ✅ |

### 기존 완료 항목

| 파일 | 작업 | 상태 |
|------|------|------|
| `systems/video/preproduction/source_index.json` | 소스 블로그 인덱스 | ✅ (v2.0으로 교체) |
| `systems/video/preproduction/rag/` | 블로그 소재 RAG 인덱스 | ✅ |
| `.agents/skills/screenplay_writer/SKILL.md` | Phase 0.5 추가 | ✅ (리브랜딩에 통합) |
| `systems/planning/15-screenplay-research-plan.md` | Phase 0.5 프로세스 | ✅ (유지) |

---

## 대본 파이프라인 (현행)

```
질문 정의 (/screenplay-topic)
  ↓ 유저 승인
주제 리서치 (/screenplay-research)
  ↓ 유저 승인
스토리 설계 (/screenplay-plan) — Discovery Arc
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
키프레임 렌더 (2D flat vector)
  ↓
최종 조립 (영상+VO+자막+BGM)
```

---

## 완료: Phase 2.5 — Series Bible + 2D 스타일 확정 (2026-03-17, `24642ae`)

### 산출물 3개 (SSOT)

| 파일 | 용도 | 상태 |
|------|------|------|
| `systems/video/SERIES_BIBLE.md` | 마스터 기획서 (4파트, 18섹션) — **새 SSOT** | ✅ |
| `systems/video/assets/characters/vee/character_design_2d.json` | Vee 2D 캐릭터 스펙 v5.0 | ✅ |
| `systems/video/planning/season1_episode_guide.md` | 시즌1 10에피소드 가이드 | ✅ |

### 주요 결정사항
- **스타일 확정**: 3D Pixar (v4) → 2D flat vector Level 2.5 (v5)
- **캐릭터 단순화**: 4색 팔레트, 원형/미튼 손, 3요소 표정 시스템
- **포맷 확정**: 80% 다이어그램/모션그래픽 + 20% Vee 리액션 (1-2초)
- **에피소드 포맷**: Hook → Problem → Core → Application → Outro (5세그먼트)
- **시즌1 라인업**: 10에피소드, 교차 배치 (스토리 EP ↔ 독립 EP)
- **파이프라인**: Flux+SimpleVectorFlux→Kontext→Wan 2.2→Dia2→ACE-Step→FFmpeg

### 리서치 4편 (함께 커밋)
- `youtube-content-strategy-research.md`
- `video-content-strategy-research.md`
- `ai-native-animation-research.md`
- `2d-character-design-references.md`

### 문서 상속 관계

| 기존 문서 | 상태 | 대체 |
|-----------|------|------|
| `12-episode-series-bible.md` | **SUPERSEDED** | → `season1_episode_guide.md` |
| `16-channel-identity.md` | **SUPERSEDED** | → `SERIES_BIBLE.md` Part A |
| `10-youtube-format-bible.md` | **SUPERSEDED** | → `SERIES_BIBLE.md` Part C+D |
| `CONTENT_EVALUATION_FRAMEWORK.md` | **유지 (업데이트 필요)** | 아직 "claymation" 참조 → 2D 반영 필요 |

---

## 다음 단계 (미완료)

### Phase 3: Vee 2D 골든 레퍼런스 생성

`character_design_2d.json`에 정의된 골든 레퍼런스 3장 생성.

**작업:**
1. ComfyUI에서 SimpleVectorFlux LoRA 로드
2. `comfyui_prompts.positive_base` + `angle_prompts` 조합으로 생성
3. 정면 / 3/4 / 전신 각 4장 이상 → 베스트 1장 선정
4. 선정된 이미지를 Kontext 골든 레퍼런스로 등록
5. 표정 스톡 18장 (6감정 × 3앵글) 배치 생성

**산출물:**
- `vee_2d_golden_front.png`
- `vee_2d_golden_3q.png`
- `vee_2d_golden_full.png`
- `expressions/` 폴더 (18장)

### Phase 4: EP01 대본 재작성 (2D 구조)

기존 EP01 산출물(시트콤/3D 기반)을 새 Series Bible 구조로 재작성.

**EP01 새 설정 (Series Bible 기준):**
- **제목**: "스펙이 뭔가?"
- **점수**: 23/25 (Grade A, act1-en.md 기반)
- **포맷**: Hook → Problem → Core → Application → Outro
- **확장 메타포**: 건물 = 코드 (청사진 O vs X)
- **Aha**: "스펙은 한 문장이다: '내가 뭘 만드는가?'"

**작업 순서:**
1. EP01 스크립트 작성 (SERIES_BIBLE.md C8 포맷)
2. 샷 매니페스트 JSON (D14 v5 포맷)
3. Vee 2D 키프레임 생성 (Phase 3 골든레퍼런스 사용)
4. 다이어그램/모션그래픽 (Motion Canvas)
5. TTS + 립싱크 + BGM
6. 조립 + QC (D17 6단계 게이트)

### Phase 5: CONTENT_EVALUATION_FRAMEWORK 업데이트

평가 프레임워크를 2D 스타일에 맞게 업데이트.
- "claymation" → "2D flat vector" 용어 변경
- "clay action" → "visual action" 변경
- Axis 3 기준을 2D 다이어그램 + 모션그래픽에 맞게 조정
- "Our position" 문구 업데이트

### Phase 6: validate_screenplay.py 업데이트

자동 검증 스크립트를 새 Series Bible 구조에 맞게 업데이트.

```
[PASS/FAIL] 세그먼트 5개 존재 (Hook/Problem/Core/Application/Outro)
[PASS/FAIL] 타이밍 범위 (Hook 15s, Problem 30s, Core 135s, Application 60s, Outro 60s)
[PASS/FAIL] 총 길이 180-300초 (3-5분)
[PASS/FAIL] 나레이터 V.O. 전 세그먼트 존재
[PASS/FAIL] Vee 음성 대사 없음 (무언극)
[PASS/FAIL] Vee 리액션 6회 이내, 각 1-2초
[PASS/FAIL] 패턴 인터럽트 20-30초 간격
[PASS/FAIL] 금지 표현 0개
[PASS/FAIL] Core에 확장 메타포 60초+ 존재
[PASS/WARN] 열린 루프 (Hook 안에 미답 질문)
```

---

## 검증 방법

1. `16-channel-identity.md` 읽으면 채널이 뭔지 30초 안에 파악 가능 ✅
2. EP01-08 각각 "5분 후 시청자가 뭘 알게 되나?" 한 줄로 답 가능 ✅
3. 캐릭터 설명으로 그릴 수 있을 정도로 구체적 ✅
4. 기존 문서와 모순 없음 ✅
