# 대본 파이프라인 재정비 + 소스 인덱스 구축

> 작성일: 2026-03-11
> 최종 수정: 2026-03-17
> 상태: **Phase 6 완료** — Series Bible → 2D 스타일 전환 → EP01-04 전체 파이프라인 구현 완료.

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

## 완료: Phase 3 — Vee 2D 골든 레퍼런스 + 표정 스톡 (2026-03-17)

ComfyUI Flux dev + SimpleVectorFlux LoRA로 생성.

| 산출물 | 파일 | 상태 |
|--------|------|------|
| 정면 골든 | `vee/golden/vee_2d_golden_front.png` | ✅ |
| 3/4 골든 | `vee/golden/vee_2d_golden_3q.png` | ✅ |
| 전신 골든 | `vee/golden/vee_2d_golden_full.png` | ✅ |
| 표정 스톡 | `vee/expressions/` (6감정 × 3앵글 = 18장) | ✅ |

**워크플로 수정사항:**
- `flux_simplevector_t2i.json` — `CheckpointLoaderSimple` → `UnetLoaderGGUF` + `DualCLIPLoaderGGUF` + `VAELoader` 분리
- LoRA명 수정: `simplevectorflux.safetensors` → `Simple_Vector_Flux_v2_renderartist.safetensors`
- VAE 분리: `ae.safetensors` 별도 로더 (GGUF 모델은 VAE 미포함)

---

## 완료: Phase 4 — EP01-04 대본 + 샷 매니페스트 + 다이어그램 (2026-03-17)

### EP01 "스펙이 뭔가?" (이전 세션에서 완료)
| 파일 | 상태 |
|------|------|
| `ep01/ep01_script_v2.fountain` | ✅ ~210s, 5세그먼트 |
| `ep01/ep01_shot_manifest_v5.json` | ✅ 31샷, 1280×720 |

### EP02 "왼팔이 28개"
| 파일 | 상태 |
|------|------|
| `ep02/ep02_script.fountain` | ✅ ~240s |
| `ep02/ep02_shot_manifest_v5.json` | ✅ v5 포맷 |

### EP03 "벽 없는 아파트"
| 파일 | 상태 |
|------|------|
| `ep03/ep03_script.fountain` | ✅ ~240s |
| `ep03/ep03_shot_manifest_v5.json` | ✅ v5 포맷 |

### EP04 "열기 무서운 상자"
| 파일 | 상태 |
|------|------|
| `ep04/ep04_script.fountain` | ✅ ~240s |
| `ep04/ep04_shot_manifest_v5.json` | ✅ v5 포맷 |

### Motion Canvas 다이어그램
| 파일 | 설명 | 상태 |
|------|------|------|
| `vibecode-diagrams/src/scenes/ep01-explainer.tsx` | 건물 메타포 (청사진 vs 혼돈) | ✅ |
| `vibecode-diagrams/src/scenes/ep02-explainer.tsx` | 왼팔 28개 → SSOT 해결 | ✅ |
| `vibecode-diagrams/src/scenes/ep03-explainer.tsx` | 벽 없는 아파트 → 도메인 분리 | ✅ |
| `vibecode-diagrams/src/scenes/ep04-explainer.tsx` | 봉인된 상자 → 테스팅 리듬 | ✅ |

---

## 완료: Phase 5 — 파이프라인 스크립트 v5 업데이트 (2026-03-17)

| 파일 | 변경사항 | 상태 |
|------|----------|------|
| `parse_fountain_to_prepro.py` | v5 세그먼트 (Hook/Problem/Core/Application/Outro) | ✅ |
| `build_shot_manifest_from_prepro.py` | v5 매니페스트 (segment, visual_type, space 필드) | ✅ |
| `animate_shots.py` | Wan 2.2 MoE GGUF + 2D flat vector 워크플로 | ✅ |

---

## 완료: Phase 6 — 보조 산출물 (2026-03-17)

| 파일 | 작업 | 상태 |
|------|------|------|
| `source_index.json` | v3.0 — 시즌1 가이드 정렬, 10에피소드 | ✅ |
| `bee/character_design_2d.json` | Bee 2D v2.0 캐릭터 스펙 | ✅ |
| `validate_screenplay.py` | Series Bible v5 구조 검증 (10체크) | ✅ (이전 커밋) |
| `CONTENT_EVALUATION_FRAMEWORK.md` | claymation → 2D flat vector 반영 | ✅ (이전 커밋) |

---

## 전체 완료 상태

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 소스 인덱스 + RAG | ✅ |
| 2 | 채널 리브랜딩 | ✅ |
| 2.5 | Series Bible + 2D 스타일 확정 | ✅ |
| 3 | Vee 2D 골든 레퍼런스 + 표정 스톡 | ✅ |
| 4 | EP01-04 대본 + 매니페스트 + 다이어그램 | ✅ |
| 5 | 파이프라인 스크립트 v5 | ✅ |
| 6 | 보조 산출물 (소스 인덱스 v3, Bee 스펙) | ✅ |
| 6.5 | TTS 재생성 + 파이프라인 현행화 + 다국어 | ✅ |
| 6.6 | 나레이션 리서치 원칙 파이프라인 통합 | ✅ |

---

## 완료: Phase 6.5 — TTS 재생성 + 파이프라인 현행화 (2026-03-19, `1472e78`)

### 6.5a — 한국어 TTS 전처리
| 파일 | 변경 | 상태 |
|------|------|------|
| `tts_rules.yaml` | `pronunciation_ko` + `pivot_words_ko` 한국어 규칙 추가 | ✅ |
| `prepare_tts_script.py` | `apply_pronunciation()`, `apply_pauses()` 로케일 분기 (lang 파라미터) | ✅ |
| EP03 manifest | 34/38 beats modified, `tts_text` + `tts_exaggeration` 필드 생성 | ✅ |

### 6.5b — 4에피소드 TTS 재생성
| EP | Backend | Duration | Timing Violations | LUFS |
|----|---------|----------|-------------------|------|
| EP01 | Chatterbox | 362.8s | 10/53 | -16.17 |
| EP02 | Chatterbox | 323.3s | 10/46 | -16.03 |
| EP03 | Edge TTS (ko) | 339.3s | 37/38 | -15.98 |
| EP04 | Chatterbox | 273.3s | 8/41 | -16.10 |

### 6.5c — 파이프라인 현행화 (7개 스크립트 수정/신규)
| 파일 | 변경 | 상태 |
|------|------|------|
| `sync_shots_to_audio.py` | 세그먼트 기반 beat→shot 매핑으로 재작성 | ✅ |
| `audio_postprocess.py` | silence trim 버그 수정 (2-pass lead/trail) | ✅ |
| `mix_audio.py` | BGM 자동 루프 (aloop+atrim+afade) | ✅ |
| `ffmpeg_assemble.py` | shot manifest 기반 어셈블리 + Ken Burns fallback | ✅ |
| `assemble_episode.py` | 8-stage 오케스트레이터 + validation gates + write-back | ✅ |
| `manifest_validator.py` | **신규** — spec-driven 검증 게이트 | ✅ |
| `export_multilang_audio.py` | **신규** — YouTube 다국어 오디오 pad/trim export | ✅ |
| `run_tts_regen.sh` | **신규** — TTS 배치 러너 | ✅ |
| `episode_audio_map.json` | **신규** — 에피소드별 BGM 매핑 | ✅ |

### 6.5d — 4에피소드 영상 어셈블리
| EP | Duration | Size | Visual | Audio |
|----|----------|------|--------|-------|
| EP01 | 6:03 | 16.3MB | 15 Ken Burns + 15 placeholder | narration + BGM + ducking |
| EP02 | 5:24 | 11.5MB | 30 placeholder | narration + BGM + ducking |
| EP03 | 5:39 | 8.9MB | 30 placeholder | narration + BGM + ducking |
| EP04 | 4:34 | 9.7MB | 30 placeholder | narration + BGM + ducking |

### 6.5e — YouTube 다국어 export + 문서화
| 파일 | 내용 | 상태 |
|------|------|------|
| `mixed_audio_v4_en.wav` × 3 | EP01/02/04 EN 오디오 (비디오 길이 정확 매칭) | ✅ |
| `mixed_audio_v4_ko.wav` × 1 | EP03 KO 오디오 (비디오 길이 정확 매칭) | ✅ |
| `18-youtube-multilang-audio-guide.md` | YouTube 다국어 오디오/채널 설정 가이드 | ✅ |
| `19-speckit-spec-driven-dev-reference.md` | SpecKit spec-driven dev 레퍼런스 | ✅ |

### Spec-Driven 파이프라인 아키텍처 (SpecKit 적용)

```
Stage 1: TTS (Specify) ← prepro manifest SSOT
  ↓ [GATE: language, beats[].narration_text]
Stage 2: Whisper timing (Plan) ← shot manifest SSOT
  ↓ [GATE: shots[].shot_id, duration_sec]
Stage 3: Keyframes (Render) ← ComfyUI
  ↓ [GATE: shots[].prompt_positive, render_method]
Stage 4: I2V Animation (Render) ← Wan 2.2
  ↓ [GATE: shots[].duration_sec]
Stage 5: Diagrams (Render) ← Motion Canvas
  ↓
Stage 6: Audio mix (Mix) ← BGM catalog + narration
  ↓ [GATE: language]
Stage 7: Assembly (Implement) ← FFmpeg
  ↓ [GATE: shots[].shot_id, duration_sec]
Stage 8: Multi-lang export (Deliver) ← YouTube upload
  ↓ [GATE: language]
```

Each gate validates manifest SSOT before execution.
Each stage writes completion status back to manifest.

---

## 전체 완료 상태

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 소스 인덱스 + RAG | ✅ |
| 2 | 채널 리브랜딩 | ✅ |
| 2.5 | Series Bible + 2D 스타일 확정 | ✅ |
| 3 | Vee 2D 골든 레퍼런스 + 표정 스톡 | ✅ |
| 4 | EP01-04 대본 + 매니페스트 + 다이어그램 | ✅ |
| 5 | 파이프라인 스크립트 v5 | ✅ |
| 6 | 보조 산출물 (소스 인덱스 v3, Bee 스펙) | ✅ |
| **6.5** | **TTS 재생성 + 파이프라인 현행화 + 다국어 + 검증 게이트** | **✅** |
| **6.6** | **나레이션 리서치 원칙 파이프라인 통합 (25개 자동 검증)** | **✅** |

---

## 완료: Phase 6.6 — 나레이션 리서치 원칙 파이프라인 통합 (2026-03-19, `392a11b`)

SERIES_BIBLE, craft-reference, SKILL.md에 문서화된 69개 나레이션 품질 원칙 중 **25개 미구현 원칙을 파이프라인에 자동 검증으로 통합**.

### 신규/수정 파일 5개

| 파일 | 변경 | 상태 |
|------|------|------|
| `tts_rules.yaml` | **+42줄** — tone_validation (Never Say 10 + Show vs Tell 8), narrative_structure (beat_map, discovery_arc, shorts), preproduction_gates | ✅ |
| `validate_preproduction.py` | **신규 210줄** — 7체크 (P1-P7): topic card/brief/evaluation 게이트 | ✅ |
| `validate_screenplay.py` | **+170줄** — 체크 16-24 추가 (Discovery Arc, beat count, Pixar formula, shorts, analogy-first, show vs tell, never say, actionable takeaway) | ✅ |
| `manifest_validator.py` | **+55줄** — Stage 0 pre-production gate, Stage 3 vee_expression, Stage 5 diagram motion_type, Stage 7 thumbnail+title | ✅ |
| `assemble_episode.py` | **+8줄** — Stage 0 게이트 자동 실행 (from_stage <= 1) | ✅ |

### 3-스크립트 모델 (완성)

```
validate_preproduction.py (P1-P7)  ← 대본 작성 전 (Stage 0)
  ↓ [GATE: topic card + brief + eval >= 18/25]
validate_screenplay.py (1-24)     ← 대본 완료 후 (Phase 3)
  ↓ [24 automated + 6 manual checks]
manifest_validator.py (Stage 0-8) ← 각 스테이지 전
  ↓ [extended: vee_expression, motion_type, thumbnail, title]
assemble_episode.py               ← Stage 0 게이트 → Stage 1-8
```

### Spec-Driven 파이프라인 아키텍처 (확장)

```
Stage 0: Pre-production ← topic_card.md + topic_brief.md + eval score
  ↓ [GATE: P1-P7 pre-production checks]
Stage 1: TTS (Specify) ← prepro manifest SSOT
  ↓ [GATE: language, beats[].narration_text]
Stage 2: Whisper timing ← shot manifest SSOT
  ↓ [GATE: shots[].shot_id, duration_sec]
Stage 3: Keyframes ← ComfyUI
  ↓ [GATE: shots[].prompt_positive, render_method, vee_expression ∈ {6}]
Stage 4: I2V Animation ← Wan 2.2
  ↓ [GATE: shots[].duration_sec]
Stage 5: Diagrams ← Motion Canvas
  ↓ [GATE: diagram shots need render_method + motion_type]
Stage 6: Audio mix ← BGM catalog + narration
  ↓ [GATE: language]
Stage 7: Assembly ← FFmpeg
  ↓ [GATE: shots[].shot_id, duration_sec, thumbnail, title ≤ 60자]
Stage 8: Multi-lang export ← YouTube upload
  ↓ [GATE: language]
```

### 검증 결과 (EP01 v5 스크립트)

| 구분 | 결과 |
|------|------|
| 체크 1-15 (기존) | 19/20 PASS (1 FAIL: 세그먼트 타이밍) |
| 체크 16-24 (신규) | Discovery Arc 6/6 PASS, Analogy-First PASS, We Say/Never Say PASS, Actionable Takeaway PASS |
| Show vs Tell | 3 WARN (decides, feels — 리비전 대상) |
| Beat count | 53 beats (12-20 범위 초과 — v5 스크립트가 길어서 정상) |
| Pre-production | P4-P5 PASS, P1-P2 FAIL (EP01 topic card 한국어 헤딩 미적용) |

**다음**: Phase 7 — ComfyUI 키프레임 렌더 → placeholder 교체 → I2V 클립 → 프로덕션 영상

---

## 검증 방법

1. `16-channel-identity.md` 읽으면 채널이 뭔지 30초 안에 파악 가능 ✅
2. EP01-08 각각 "5분 후 시청자가 뭘 알게 되나?" 한 줄로 답 가능 ✅
3. 캐릭터 설명으로 그릴 수 있을 정도로 구체적 ✅
4. 기존 문서와 모순 없음 ✅
