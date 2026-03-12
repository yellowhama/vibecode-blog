# 주제 카드 — EP01

## 주제
> 스펙

## 세 가지

| | 내용 |
|--|------|
| **뭔지** | "뭘 만들 건지" 적어둔 것. 목적/이유/방법/수단. |
| **없으면** | AI한테 하나씩 물어보면 핑퐁 무한루프. 고치면 옆에서 터짐. |
| **있으면** | 뭘 만드는지 알고 시작. 에러가 있어도 뭘 고칠지 앎. |

## 3막 구조

| 막 | 전달 | 형식 | 소재 창고에서 뽑은 장면 |
|----|------|------|----------------------|
| 1막 (없으면) | 스펙 없이 만들면 이렇게 된다 | 시트콤 | act1-1 + 058: 바이브코딩 몽타주→에러→핑퐁 |
| 2막 (뭔지) | 스펙은 이런 거다 | 해설 | 설계도 메타포 + 네 칸(목적/이유/방법/수단) |
| 3막 (있으면) | 스펙 있으면 달라진다 | 시트콤 | 058: 짜증→질문→스펙 |

## Vee의 변화
- **착각** (시작): "돌아가니까 됐다"
- **깨달음** (끝): "짜증을 정리하면 그게 스펙이다"

## 쇼츠 후보
1. HOOK 전체 (20s) — Vee celebrates → error explosion
2. EXPLAINER "stacking without blueprint → collapse" (15s)
3. ENDING mirror shot — same errors, paper pinned (15s)

## 상태
- [x] Phase 0: 주제 정의 — **유저 승인 완료**
- [x] Phase 1: 스토리 설계 — `ep01_story_design.md` (Story Circle + Spine + 감정 트래커 + 소재 매핑)
- [x] Phase 2: Fountain 집필 — SITCOM1 소수정 + SITCOM2 전면 재작성 + ENDING 전면 재작성
- [x] Phase 3: 구조 검증 — 자동 16/16 PASS + 수동 리뷰 완료
- [x] **Phase 4: 포맷 전환 (2026-03-12)** — 내레이터 온리 + 영어 대본 전면 재작성
  - 포맷 바이블: 내레이터 전 세그먼트 주도, 캐릭터 대사 제거, 비주얼 코미디 가이드 추가
  - 검증 스크립트: NARRATOR 필수 체크로 반전, 수동 체크리스트 확장
  - 대본 스킬: 내레이션 온리 + 영어 + 정보 경로 + Curse of Knowledge 원칙
  - EP01 Story Design: 정보 경로 최상단, 비주얼 코미디 비트 리스트
  - EP01 Fountain: 영어 전면 재작성, 21/21 PASS
  - 커밋: `ff4e1c9`

- [x] **Phase 5: 프로덕션 파이프라인 Phase 1-3 (2026-03-12)** — `d79a0a1`
  - `parse_fountain_to_prepro.py`: `--language` 플래그, 자동 감지, 영어 WPM 기반 duration
  - Prepro manifest 재생성: 5 segments, 31 beats, `language=en`, 전원 narrator
  - TTS 생성: `en-US-AriaNeural`, 148.9s master audio + SRT 자막
  - Shot manifest 재생성: 24 shots (15 sitcom + 9 explainer), 180s, 영어 프롬프트

- [x] **Phase 6: 키프레임 생성 1차 (2026-03-12)** — Flux Kontext 15샷 + T2I 3샷, 18개 키프레임
- [x] **Phase 7: I2V/T2V 렌더 1차 (2026-03-12~13)** — WAN 2.2 MoE I2V 18샷 + T2V 6샷 = 24 MP4
- [x] **Phase 8: 최종 조립 1차 (2026-03-13)** — `EP01_FINAL.mp4` (179.5s, 31MB, 자막 포함)

- [x] **Phase 9: QA 포스트모템 + 파이프라인 수정 (2026-03-13)** — `33a68d3`
  - **1차 렌더 문제**: 모든 씬이 얼굴 클로즈업에서 시작, 1:1 비율 찌그러짐
  - **근본 원인**: Kontext에 초상화(1024x1024) 입력 → 씬 구도 없이 얼굴만 생성
  - **수정**: 바인딩 768x768→832x480, shot manifest에 width/height 명시
  - **올바른 파이프라인 문서화**: `05-storyboard-keyframe-pipeline.md`
    - T2I 씬 스토리보드(16:9) → Kontext 캐릭터 보정(선택) → I2V
  - **Kontext 딥 리서치**: latent concatenation 아키텍처, RefControl LoRA, 프롬프트 가이드

## EP01 2차 렌더 — 완료 (Flux Dev, vanilla T2I)

- [x] **Phase 10: T2I 스토리보드 파이프라인 구현 (2026-03-13)** — `00bfa17`
  - 신규: `generate_t2i_storyboards.py` — shot manifest → Flux Dev T2I 832x480 16:9 배치 생성
  - 수정: `generate_kontext_keyframes.py` — `--storyboard-dir` 추가, golden-ref 선택적

- [x] **Phase 10.5: 애니매틱 + 오디오 + 와이어링 (2026-03-13)** — `0ac10f2`
  - 신규: `generate_animatic.py`, `annotate_manifest_stages.py`, `generate_placeholder_audio.py`
  - 수정: `audio_catalog.py`, `package_for_youtube.py`, `video_assembler.py` 버그 3건

- [x] **Phase 10A: TTS 업그레이드 — Chatterbox (2026-03-13)**
  - 31/31 beats Chatterbox 합성 성공, 88s master VO, 31-entry SRT

- [x] **Phase 10B~11: T2I → Kontext → I2V 2차 (2026-03-13)**
  - 24/24 스토리보드, 15/15 Kontext, I2V 렌더 완료

## EP01 3차 렌더 — PuLID 캐릭터 일관성 + QA 체크포인트

### 2차 렌더 포스트모템
1. **T2I에 캐릭터 레퍼런스 없음** — vanilla Flux Dev T2I로 생성하여 Vee가 매 샷 다른 얼굴
2. **단계별 QA 없이 자동 진행** — 대본/TTS/스토리보드/키프레임/I2V를 결과 확인 없이 연쇄 실행

### 파이프라인 개선 (`339ee58`)
- `generate_t2i_storyboards.py`: PuLID 기본 워크플로우로 전환 (`flux_pulid_t2i.json`)
  - `--pulid-ref`, `--pulid-weight`, `--workflow`, `--bindings`, `--no-pulid` CLI 추가
  - T2I manifest에 `pulid_ref_image`, `pulid_weight`, `pulid_start_at`, `pulid_end_at` 주입
- 신규: `qa_checkpoint.py` — 대화형 QA 게이트 (Approve/Retry/Abort, exit 0/2/1)
  - `--stage`, `--artifacts-dir`, `--artifact-type` (image/audio/video)
  - `--report-json` 품질 보고서 요약, `--auto-approve` CI 모드

### v3 파이프라인 진행 상황

- [ ] **STAGE 0: 대본 리뷰**
  - `validate_screenplay.py` + 수동 나레이션 텍스트 검토

- [ ] **STAGE 1: TTS 생성**
  - Chatterbox 31 beats → `tts_full_v3/` + `qa_checkpoint.py --stage "TTS Audio"`

- [ ] **STAGE 2: T2I PuLID 스토리보드**
  - `generate_t2i_storyboards.py --pulid-ref ivy_burr_golden_ref.png --pulid-weight 0.9`
  - `qa_checkpoint.py --stage "T2I PuLID Storyboards"` → 캐릭터 일관성 리뷰

- [ ] **STAGE 3: 애니매틱 프리뷰** ← 가장 중요한 QA (GPU 비용 0)
  - `generate_animatic.py` → `EP01_ANIMATIC_v3.mp4`
  - `qa_checkpoint.py --stage "Animatic Preview"` → 타이밍/페이싱/싱크 검증

- [ ] **STAGE 4: Kontext 캐릭터 보정** (시트콤 15샷)
  - `generate_kontext_keyframes.py --guidance 2.5`
  - `qa_checkpoint.py --stage "Kontext Keyframes"`

- [ ] **STAGE 5: I2V 렌더** (WAN 2.2 MoE)
  - `comfy_batch_render.py` + `evaluate_renders.py --min-score 75`
  - `qa_checkpoint.py --stage "I2V Renders"` + `qa_correction_agent.py` 실패 샷 보정

- [ ] **STAGE 6: 최종 조립**
  - `package_for_youtube.py --transition fade` → `EP01_FINAL_v3.mp4`
  - `validate_phase7_postproduction.py` + `qa_checkpoint.py --stage "Final Assembly"`

## 1차 렌더 핵심 문제 — 확정

### 문제 A: I2V가 얼굴만 나옴
- **원인**: `generate_t2i_storyboards.py` 미실행 → Kontext가 골든 레퍼런스(1024x1024 얼굴 포트레이트)로 폴백 → I2V가 얼굴 클로즈업에서 영상 시작
- **실행된 것**: [T2I 스킵] → Kontext(얼굴 1024x1024) → I2V = 전부 얼굴
- **정상 흐름**: T2I(832x480 장면) → Kontext(캐릭터 보정) → I2V(장면 영상)

### 문제 B: TTS 성우 퀄리티
- **현재**: edge-tts (`en-US-AriaNeural`) — 합성 느낌, 감정 표현 없음
- **추천 1순위**: **Chatterbox** — ElevenLabs 블라인드 테스트 승리, 감정 제어(0-2), 한/영, 5초 음성 클론, 무료 MIT, `/home/hugh/chatterbox/` 이미 존재
- **추천 2순위**: **Kokoro-82M** — CPU 0.3초, 드래프트용, 무료 Apache
- **추천 3순위**: **Fish Speech v1.5** — TTS Arena ELO 1위, 한영일, `/home/hugh/fishspeech_env/` 존재

---

## 다음 단계 — v3 렌더 런북

STAGE 0 (대본 리뷰) 부터 순차 진행. 각 단계 `qa_checkpoint.py`로 승인 후 다음 진행.

```bash
# STAGE 0: 대본 리뷰
python validate_screenplay.py --input .../ep01_script.fountain

# STAGE 1: TTS
python generate_tts_from_prepro.py \
  --prepro-manifest .../ep01_prepro_manifest.json \
  --tts-backend chatterbox --tts-fallback edge \
  --out-audio .../tts_full_v3/voiceover_master.wav \
  --sample-rate 48000 --gap-sec 0.15 --device cuda
python qa_checkpoint.py --stage "TTS Audio" \
  --artifacts-dir .../tts_full_v3 --artifact-type audio

# STAGE 2: T2I PuLID 스토리보드
python generate_t2i_storyboards.py \
  --manifest .../ep01_shot_manifest.json \
  --output-dir .../output/renders/ep01_storyboards_v3 \
  --comfy-input /home/hugh/ComfyUI/app/input \
  --pulid-ref ivy_burr_golden_ref.png \
  --pulid-weight 0.9 --guidance 3.5 --update-manifest
python qa_checkpoint.py --stage "T2I PuLID Storyboards" \
  --artifacts-dir .../output/renders/ep01_storyboards_v3 --artifact-type image

# STAGE 3: 애니매틱 (GPU 비용 0, 가장 중요한 QA)
python generate_animatic.py \
  --manifest .../ep01_shot_manifest.json \
  --storyboard-dir .../output/renders/ep01_storyboards_v3 \
  --voiceover .../tts_full_v3/voiceover_master.wav \
  --subtitles .../tts_full_v3/subtitles.srt \
  --output .../output/EP01_ANIMATIC_v3.mp4
python qa_checkpoint.py --stage "Animatic Preview" \
  --artifacts-dir .../output --artifact-type video

# STAGE 4: Kontext 캐릭터 보정
python generate_kontext_keyframes.py \
  --manifest .../ep01_shot_manifest.json \
  --storyboard-dir .../output/renders/ep01_storyboards_v3 \
  --output-dir .../output/renders/ep01_kontext_v3 \
  --comfy-input /home/hugh/ComfyUI/app/input --guidance 2.5
python qa_checkpoint.py --stage "Kontext Keyframes" \
  --artifacts-dir .../output/renders/ep01_kontext_v3 --artifact-type image

# STAGE 5: I2V 렌더
python comfy_batch_render.py \
  --manifest .../ep01_shot_manifest.json \
  --workflow .../workflows/api/wan22_moe_i2v_full.json \
  --bindings .../workflows/api/wan22_moe_i2v_bindings.json \
  --output-dir .../output/renders/ep01_i2v_v3
python evaluate_renders.py --run-dir .../output/renders/ep01_i2v_v3 \
  --manifest .../ep01_shot_manifest.json --min-score 75
python qa_checkpoint.py --stage "I2V Renders" \
  --artifacts-dir .../output/renders/ep01_i2v_v3 --artifact-type video \
  --report-json .../output/renders/ep01_i2v_v3/evaluations_summary.json

# STAGE 6: 최종 조립
python package_for_youtube.py \
  --manifest .../ep01_shot_manifest.json \
  --render-dir .../output/renders/ep01_i2v_v3 \
  --voiceover .../tts_full_v3/voiceover_master.wav \
  --subtitles --simple-audio \
  --transition fade --transition-duration 1.0 \
  --output EP01_FINAL_v3.mp4
python qa_checkpoint.py --stage "Final Assembly" \
  --artifacts-dir .../output --artifact-type video
```

## 전제 조건 (v3 렌더)
- ComfyUI 서버 실행 (localhost:8188)
- GPU 사용 가능 (RTX 5070 Ti 16GB)
- Chatterbox 환경 활성화 (`/home/hugh/chatterbox/`)
- PuLID 워크플로우: `flux_pulid_t2i.json` + 바인딩 + `pulid_flux_v0.9.1.safetensors` (설치 완료)
- 골든 레퍼런스: `ivy_burr_golden_ref.png` (ComfyUI input/ 내 존재)
- TTS: Chatterbox 31 beats 합성 완료 (`tts_full_v2/` — v3용 재생성 or 재사용)
- WAN 2.2 MoE I2V 워크플로우 + 바인딩 JSON
- 참고: `systems/video/planning/05-storyboard-keyframe-pipeline.md`
