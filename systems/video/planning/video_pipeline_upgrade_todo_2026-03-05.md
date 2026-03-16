# Video Pipeline Upgrade TODO (2026-03-05)

## Status Legend
- [ ] not started
- [~] in progress
- [x] done
- [!] blocked

## A. Planning Lock
- [x] Freeze implementation order and acceptance gates
- [x] Add task owners/estimated effort per item
- [x] Record rollback strategy for each phase

Owner/Effort snapshot:
- Owner: `pipeline automation` = `Codex+Operator`
- Effort(A/B/C/D/E/F/G/H): `M/L/M/M/M/S/S/M`

Rollback snapshot:
- TTS backend issues: force `--tts-backend edge --tts-fallback none`
- Local-only mode issues: disable `--offline-strict`
- Audio postprocess issues: add `--tts-disable-loudnorm`, remove `--tts-trim-silence`

## B. TTS Backend Abstraction
- [x] Add `pipeline/scripts/tts_backends/base.py`
- [x] Add `pipeline/scripts/tts_backends/edge_backend.py`
- [x] Add `pipeline/scripts/tts_backends/xtts_backend.py`
- [x] Add `pipeline/scripts/tts_backends/mms_backend.py`
- [x] Add backend registry/loader helper
- [x] Add `pipeline/scripts/tts_env_check.py`

## C. TTS Generator Refactor
- [x] Refactor `generate_tts_from_prepro.py` to backend-dispatch
- [x] Implement backend fallback chain (`--tts-backend`, `--tts-fallback`)
- [x] Implement `--offline-strict` behavior
- [x] Implement per-segment cache (`text+voice+rate+pitch+backend+model`)
- [x] Add timing alignment report (`timing_alignment_report.json`)
- [x] Add quality report (`voiceover_quality_report.json`)
- [x] Add timing policy gate (`ignore|warn|fail`)

## D. Audio Postprocess
- [x] Add `pipeline/scripts/audio_postprocess.py`
- [x] Integrate loudnorm 2-pass option
- [x] Integrate silence trim option
- [x] Integrate optional crossfade pipeline

## E. Orchestrator Integration
- [x] Extend `run_blog_to_video_pipeline.py` with new TTS flags
- [x] Keep `--recordings-dir` path fully compatible
- [x] Keep explicit `--voiceover` override priority
- [x] Wire report paths into logs/output summary

## F. Packaging Metadata Integration
- [x] Update `package_for_youtube.py` to ingest voiceover quality/timing reports
- [x] Include report summary fields in `youtube_metadata.json`

## G. Docs and Ops
- [x] Update `comfy_video_workframe_and_usage_2026-03-03.md`
- [x] Update `workflows/api/README.md`
- [x] Add local/offline TTS operation notes
- [x] Add troubleshooting matrix for backend failures

## H. Validation
- [x] Python compile check for all changed scripts
- [x] Edge backend smoke (`tts -> render -> package` 1-shot)
- [x] Backend env check (`xtts`, `mms`) run and log
- [x] Regression check for manual recordings mode
- [x] Update this TODO with final pass/fail per item

Validation logs:
- `output/logs/tts_env_check_20260305_v2.json`
- `output/logs/tts_env_check_20260305_v5.json`
- `output/logs/tts_env_check_20260305_v6_test_synth.json`
- `output/logs/tts_env_check_20260305_final.json`
- `output/youtube_packages/phase1_act1_ko_upgrade_smoke_video_20260305_063047/metadata/youtube_metadata.json`
- `output/youtube_packages/phase1_act1_ko_final_smoke_video_20260305_064043/metadata/youtube_metadata.json`
- `preproduction/phase1_act1_ko_manualreg_20260305_063151/*`
- `preproduction/phase1_act1_ko_xttsdry_final_20260305_064207/*`
- `preproduction/phase1_act1_ko_smoke_20260305_040832/voiceover_tts_report.json` (mms standalone)
- `preproduction/phase1_act1_ko_mms_offline_final_20260305_063430/*`

## I. Completion Criteria
- [x] Offline-capable backend path exists and is callable (`xtts` or `mms`)
- [x] End-to-end command works with auto voiceover generation
- [x] Timing and quality reports are generated automatically
- [x] Docs are sufficient for re-run by another operator

## J. YouTube Upload Checklist Automation (2026-03-05 추가)
- [x] `package_for_youtube.py`에서 자동 업로드 게이트(JSON/MD) 생성
- [x] 필수 게이트(render/visual/asset/metadata/chapter/blog_source) 자동 판정
- [x] 선택 게이트(twitter_ref/voiceover timing/loudness) 자동 판정
- [x] 수동 운영 체크리스트(권리/자막/카드/고정댓글) 동봉
- [x] `--checklist-strict` 모드에서 필수 게이트 FAIL 시 즉시 실패 처리
- [x] 상위 오케스트레이터(`run_end_to_end_video_pipeline.py`, `run_blog_to_video_pipeline.py`)에서 strict 플래그 전달

New outputs:
- `output/youtube_packages/<run_id>/metadata/youtube_upload_checklist.json`
- `output/youtube_packages/<run_id>/metadata/youtube_upload_checklist.md`

Environment note (resolved in this run):
- Installed/adjusted runtime deps for local TTS execution:
  - `torchaudio==2.2.2+cpu`
  - `transformers==4.37.2`
  - `numpy==1.26.4`
  - `uroman==1.3.1.1`

---

## K. 영상 후반작업 자동화 (2026-03-06 추가)

### K-A. xfade 트랜지션 + 인트로/아웃트로
- [x] `video_assembler.py` 신규 생성 (xfade 44종, 해상도 정규화, drawtext 오버레이)
- [x] `package_for_youtube.py` concat demuxer → `assemble_with_transitions()` 교체
- [x] `--transition`, `--transition-duration`, `--intro-text`, `--outro-text`, `--no-transitions` 플래그

### K-B. 자막 파이프라인 (stable-ts + pysubs2)
- [x] `subtitle_pipeline.py` 신규 생성 (음성→텍스트 정렬, ASS 생성, FFmpeg 번인)
- [x] 듀얼 자막 지원 (KO 메인 + EN 보조)
- [x] `--subtitles`, `--subtitle-lang ko|en|dual`, `--subtitle-text-ko`, `--subtitle-text-en`, `--subtitle-font-ko`, `--subtitle-font-en`, `--subtitle-fonts-dir` 플래그

### K-C. 오디오 덕킹
- [x] `audio_postprocess.py`에 `mix_with_ducking()` 추가 (sidechaincompress)
- [x] `package_for_youtube.py`에서 `--audio-ducking` 시 자동 전환
- [x] `--duck-threshold`, `--duck-ratio` 플래그

### K-D. 색감 정규화 (color-matcher)
- [x] `color_normalize.py` 신규 생성 (대표 프레임 → 3D LUT → lut3d 적용)
- [x] `package_for_youtube.py`에서 xfade 합본 전 실행
- [x] `--color-normalize`, `--color-method mkl|reinhard|pdf`, `--color-reference` 플래그

### K-E. 품질 게이트 강화
- [x] `evaluate_renders.py`에 `run_final_quality_check()` 추가 (blackdetect/freezedetect/silencedetect)
- [x] `select_best_thumbnail_frame()` — 색상 분산 기반 최적 프레임 + Pillow 타이틀 오버레이
- [x] `build_scene_chapters()` — scene 단위 챕터 그룹핑
- [x] `--final-quality-check`, `--quality-check-strict`, `--scene-chapters` 플래그

### K-F. 통합 검증
- [x] 6개 파일 전체 `py_compile` 통과
- [x] 3개 테스트 클립 → xfade 합본 실행 검증
- [x] VO + BGM → 덕킹 믹스 실행 검증
- [x] 색감 다른 2개 클립 → color_normalize 실행 검증
- [~] Act1 전체 파이프라인 통합 실행

Validation logs:
- `systems/video/output/logs/phase7_validation_20260306_062819/phase7_validation_report.json`
- `systems/video/output/youtube_packages/phase1_act1_i2v_hunyuan_baseline_20260305_011522/metadata/final_quality_check.json`
- `systems/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/evaluations_summary.json`
- `systems/video/output/logs/subtitle_smoke_phase7_repo_font.mp4`
- `systems/video/output/logs/subtitle_smoke_phase7_repo_font_frame_1s.jpg`
- `systems/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/evaluations_summary_production_relaxed.json`

Act1 integration note:
- Postproduction chain(`color_normalize -> xfade -> ducking -> thumbnail/chapters -> final quality check`) packaging succeeded on existing baseline run.
- Residual blockers before calling the full pipeline "complete":
  - `evaluate_renders` current result = `pass=0 fail=5`
  - frame review indicates real asset-guide/style mismatch (smooth 3D-like finish, facial spec drift), not postproduction wiring failure
  - strict guide 기준으로는 여전히 baseline render 품질이 부족
  - relaxed production guide 기준 재평가 결과도 `pass=1 fail=4`로 개선 여지는 남아 있음

### K-G. 운영 보강 및 잔여 리스크
- [x] `run_end_to_end_video_pipeline.py`에 Phase 7 CLI flags 전체 전달
- [x] `run_blog_to_video_pipeline.py`에 Phase 7 CLI flags 전체 전달
- [x] `scene chapters` 타임코드에 xfade overlap 반영
- [x] subtitle/ducking 옵션 precondition fail-fast 추가
- [x] teaser 산출물을 최종 delivery video 기준으로 재생성
- [x] `mix_with_ducking()` FFmpeg 4.4 호환성 수정 (`asplit` + `aformat`)
- [x] `color_normalize.py` LUT 스케일/순서 버그 수정
- [x] `validate_phase7_postproduction.py` 스모크 검증 스크립트 추가
- [x] `ensure_subtitle_fonts.py` 추가 (repo-local KO subtitle font bootstrap)
- [x] `package_for_youtube.py`에 subtitle font auto-bootstrap 연결 (`--skip-subtitle-font-bootstrap` opt-out)
- [x] `subtitle_pipeline.py` 단독 CLI 추가 (`--video/--audio/--text-ko|en`)
- [x] subtitles runtime smoke 실행 완료 (repo-local Noto font로 KO burn-in PASS)
- [x] silence gate default를 `-55dB`로 조정
- [x] `evaluate_renders.py`에 `--evaluation-label` 추가 (strict vs relaxed 결과 공존)
- [x] hallucination keyword false-positive 수정 (`no visible texts/watermarks/...` 문장을 오탐하지 않도록 보강)
- [x] production QA용 `03-visual_assets_guide_production_2026-03-06.md` 추가
- [x] 상위 오케스트레이터에 `--evaluate-assets-guide`, `--evaluate-min-score`, `--evaluate-label`, `--evaluate-overwrite` 전달
- [x] Act1 baseline relaxed evaluation 재실행 (`pass=1 fail=4`, `label=production_relaxed`)
- [x] `run_end_to_end_video_pipeline.py --skip-render` 경로로 evaluate profile passthrough smoke 확인 (`label=e2e_relaxed_passthrough`)
- [x] strict 운영 기본값 결정: `--evaluate-strict`, `--quality-check-strict`는 당분간 opt-in 유지
- [ ] render baseline 개선 후 `--evaluate-strict` 활성화 시점 재평가
- [ ] asset-guide/prompt를 현재 렌더 스타일에 맞게 조정하거나 렌더 품질을 상향

### K-H. 다음 실행 백로그
- [ ] `run_blog_to_video_pipeline.py --render` 경로로 blog->render->package one-shot 재검증
- [ ] relaxed guide 기준 `pass_rate >= 0.8` 달성 전까지 strict gate 기본값 유지
- [ ] vision QA rerun variance를 줄이기 위한 provider/model/timeout 정책 고정
- [ ] prompt/asset guide/모델 route를 조정해 strict guide FAIL 5건을 줄이기

Dependencies:
```bash
pip install stable-ts pysubs2 color-matcher
```

New files:
- `pipeline/scripts/video_assembler.py`
- `pipeline/scripts/subtitle_pipeline.py`
- `pipeline/scripts/color_normalize.py`
- `pipeline/scripts/validate_phase7_postproduction.py`
- `pipeline/scripts/ensure_subtitle_fonts.py`
- `planning/03-visual_assets_guide_production_2026-03-06.md`

Modified files:
- `pipeline/scripts/audio_postprocess.py` (+mix_with_ducking)
- `pipeline/scripts/evaluate_renders.py` (+quality check, thumbnail, scene chapters, labeled evaluation outputs)
- `pipeline/scripts/package_for_youtube.py` (+subtitle font bootstrap, Phase 7 integration)
- `pipeline/scripts/run_end_to_end_video_pipeline.py` (+Phase 7 and evaluate profile passthrough)
- `pipeline/scripts/run_blog_to_video_pipeline.py` (+Phase 7 and evaluate profile passthrough)
- `pipeline/scripts/subtitle_pipeline.py` (+font preflight, standalone CLI)

---

## L. Phase 2: 모델 설치 + EP01 파일럿 (2026-03-16)

### L-1. 환경 정리 + 도구 설치
- [x] 깨진 Wan 2.2 fp8 체크포인트 삭제 (29B + 20B)
- [x] Dia2 TTS 설치 (`pip install git+https://github.com/nari-labs/dia.git` → `nari-tts 0.1.0`)
- [x] ACE-Step 1.5 클론 + `uv sync` (자체 venv, torch 2.10+cu128)
- [x] simplevectorflux LoRA 다운로드 (153MB, trigger: `v3ct0r`)
- 참고: Kurzgesagt Civitai LoRA 대신 simplevectorflux 선택 — 2D flat vector 스타일 더 적합

### L-2. ComfyUI 워크플로우 업데이트
- [x] Wan 2.2 MoE I2V full/short → 832x480 해상도 (16:9 YouTube)
- [x] Wan 2.2 I2V → VHS_VideoCombine MP4 출력 (SaveImage PNG → H.264 MP4)
- [x] Flux LoRA T2I → simplevectorflux LoRA 파일명/트리거 워드 반영
- [x] `render_keyframes.py` — prompt sub-object 추출 수정 (API-format JSON 호환)
- [x] `animate_shots.py` — prompt sub-object + 매니페스트 해상도 주입
- [x] `assemble_episode.py` — Dia2 기본 프로덕션 TTS 추가 (`--tts` 플래그)
- [x] `acestep_bgm.py` — API 서버 모드 리라이트 (ACE-Step 1.5 `uv run` 호환)
- [x] ComfyUI API (:8188) 연결 확인

### L-3. EP01 스타일 검증
- [x] Kontext 키프레임 15장 렌더 (3D Pixar 스타일, 캐릭터 일관성 우수)
- [x] simplevectorflux LoRA 키프레임 1장 (2D flat vector — Kurzgesagt 스타일)
- [x] Wan 2.2 MoE I2V 2초 드래프트 클립 2개 (832x480, 16fps, H.264)
- [x] **스타일 판정**: Kontext=3D Pixar, LoRA=2D flat vector. 둘 다 사용 가능.
- 성능: RTX 5070 Ti (16GB) — Kontext ~60s/키프레임, I2V ~8.5분/2초클립

### L-4. 30초 프로토타입 조립
- [x] `mixed_audio.wav` (나레이션 + BGM 플레이스홀더)
- [x] 한국어 자막 (preproduction SRT 사용)
- [x] **`EP01_PROTOTYPE.mp4`** (28초, 1920x1080, H.264+AAC)
- [x] I2V 배치 렌더 완료 (24/24 클립)

### L-5. 전체 EP01 프로덕션 ✅ (2026-03-16)
- [x] Dia2 프로덕션 영어 내레이션 (24 세그먼트, 79.8초)
  - `dia2.engine.Dia2` API (nari-labs/dia2 repo 에디터블 설치)
  - `ep01_tts_input_en.json` 매니페스트 dialogue에서 추출
- [x] 전체 24샷 키프레임 렌더 (Kontext + LoRA T2I 자동 선택)
- [x] 전체 24샷 I2V 드래프트 클립 (2초, 832x480, Wan 2.2 MoE)
- [x] ACE-Step 1.5 BGM 생성 (90초, turbo 8스텝, ambient electronic)
  - `AceStepHandler.initialize_service()` + `generate_music()` 직접 호출
  - API 서버 모드는 태스크 큐 이슈로 스킵
- [x] 오디오 믹싱 (나레이션 + BGM, 0.15 볼륨)
- [x] SRT 자막 생성 (24개 엔트리, 세그먼트 타이밍 기반)
- [x] **`EP01_FINAL.mp4`** (49.6초, 1920x1080, 30fps, -15.7 LUFS)
- [x] **`EP01_SHORTS_01.mp4`** (58초, 1080x1920, 9:16 크롭)

코드 수정:
- `dia2_tts.py`: `dia.model.Dia` → `dia2.engine.Dia2` API 마이그레이션
- `acestep_bgm.py`: 네스트 응답 파싱 수정 (`data.task_id`)
- `render_keyframes.py`: 듀얼 워크플로우 자동선택, v3ct0r 트리거 주입

커밋: `3d1e86c` (2026-03-16)

### 모델 인벤토리 (2026-03-16 기준)
| 모델 | 위치 | 크기 | 용도 |
|------|------|------|------|
| Wan2.2-I2V-A14B-HighNoise Q3_K_M | `unet/` | 6.7GB | I2V Stage 1 |
| Wan2.2-I2V-A14B-LowNoise Q3_K_M | `unet/` | 6.7GB | I2V Stage 2 |
| flux1-dev-Q5_K_S | `unet/` | ~9GB | T2I (LoRA 호스트) |
| flux1-kontext-dev-Q5_K_S | `unet/` | ~8.3GB | 캐릭터 일관성 편집 |
| simplevectorflux v2 | `loras/` | 153MB | 2D flat vector 스타일 |
| t5-v1_1-xxl Q5_K_M | `clip/` | ~4.6GB | Flux CLIP |
| umt5_xxl fp8 | `text_encoders/` | ~4.6GB | Wan CLIP |
| wan_2.1_vae | `vae/` | ~150MB | Wan VAE |
| ae.safetensors | `vae/` | ~150MB | Flux VAE |
| Dia2-1B | pip (nari-tts) | ~2GB | 프로덕션 TTS |
| ACE-Step 1.5 | `/home/hugh/ACE-Step-1.5/` | ~4GB | BGM 생성 |
| Kokoro 0.9.4 | pip | ~400MB | 드래프트 TTS |
| Dia2-1B (dia2) | editable (`/home/hugh/dia2_repo`) | ~2GB | 프로덕션 TTS (신규 API) |
| ACE-Step 1.5 turbo | `/home/hugh/ACE-Step-1.5/checkpoints/` | ~10GB | BGM (DiT+VAE+TextEnc) |

---

## M. Phase 3: EP01 프로덕션 품질 업그레이드 (다음 단계)

### 현재 상태 및 개선점
EP01_FINAL.mp4 완성 — 49.6초, 24샷. 그러나:
1. **I2V 클립이 2초 드래프트** — 풀 5초로 업그레이드 필요
2. **자막 타이밍이 세그먼트 기반** — Whisper 정밀 정렬 필요
3. **트랜지션 없음** — xfade/디졸브 추가
4. **BGM 품질** — LM 모델 활성화 시 CUDA 그래프 오류, torch 호환성 해결 필요
5. **Vee 캐릭터 일관성** — 샷 간 스타일 편차 존재

### M-1. I2V 풀 길이 업그레이드
- [ ] `wan22_moe_i2v_full.json` 워크플로우로 24샷 재렌더 (5초, 81프레임)
- [ ] GPU 시간 예상: ~20분/클립 × 24 = ~8시간
- [ ] 배치 스케줄링: 야간 렌더 또는 분할 실행

### M-2. Whisper 자막 정밀화
- [ ] `whisper_align.py`로 `narration_en.wav` → word-level SRT
- [ ] stable-ts 또는 whisper-timestamped 활용
- [ ] 듀얼 자막 (EN main) 적용

### M-3. 트랜지션 + 포스트프로덕션
- [ ] `video_assembler.py` 활용 — xfade 디졸브, 인트로/아웃트로 텍스트
- [ ] `color_normalize.py` — 샷 간 색감 통일
- [ ] `audio_postprocess.py` — BGM 덕킹 적용

### M-4. BGM 품질 개선
- [ ] ACE-Step LM 모델 CUDA 호환성 해결 (torch 2.10 + CUDA graph)
- [ ] 또는 LM 없이 caption 직접 지정 + 여러 시드로 선별
- [ ] 분위기별 BGM 세트 (인트로/전환/클라이맥스)

### M-5. EP02 프리프로덕션
- [ ] EP02 스크립트/매니페스트 작성
- [ ] 캐릭터 확장 (Vee + 새 캐릭터?)
- [ ] 스타일 가이드 확정 (Kontext 3D vs LoRA 2D)
