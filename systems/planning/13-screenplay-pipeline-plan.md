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

**다음**: EP05-10 대본 집필, TTS/I2V 렌더링, 최종 영상 조립

---

## 검증 방법

1. `16-channel-identity.md` 읽으면 채널이 뭔지 30초 안에 파악 가능 ✅
2. EP01-08 각각 "5분 후 시청자가 뭘 알게 되나?" 한 줄로 답 가능 ✅
3. 캐릭터 설명으로 그릴 수 있을 정도로 구체적 ✅
4. 기존 문서와 모순 없음 ✅
