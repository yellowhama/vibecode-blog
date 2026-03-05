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
- [x] `--subtitles`, `--subtitle-lang ko|en|dual`, `--subtitle-text-ko`, `--subtitle-text-en`, `--subtitle-font-ko`, `--subtitle-font-en` 플래그

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
- `content/video/output/logs/phase7_validation_20260306_062819/phase7_validation_report.json`
- `content/video/output/youtube_packages/phase1_act1_i2v_hunyuan_baseline_20260305_011522/metadata/final_quality_check.json`
- `content/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/evaluations_summary.json`

Act1 integration note:
- Postproduction chain(`color_normalize -> xfade -> ducking -> thumbnail/chapters -> final quality check`) packaging succeeded on existing baseline run.
- Residual blockers before calling the full pipeline "complete":
  - `evaluate_renders` current result = `pass=0 fail=5`
  - final quality check reports `silencedetect` warning on the packaged output

### K-G. 운영 보강 및 잔여 리스크
- [x] `run_end_to_end_video_pipeline.py`에 Phase 7 CLI flags 전체 전달
- [x] `run_blog_to_video_pipeline.py`에 Phase 7 CLI flags 전체 전달
- [x] `scene chapters` 타임코드에 xfade overlap 반영
- [x] subtitle/ducking 옵션 precondition fail-fast 추가
- [x] teaser 산출물을 최종 delivery video 기준으로 재생성
- [x] `mix_with_ducking()` FFmpeg 4.4 호환성 수정 (`asplit` + `aformat`)
- [x] `color_normalize.py` LUT 스케일/순서 버그 수정
- [x] `validate_phase7_postproduction.py` 스모크 검증 스크립트 추가
- [ ] subtitles runtime smoke 검증
- [ ] `evaluate_renders` FAIL 5건 원인 분석 및 strict gate 정책 확정
- [ ] `silencedetect` 기준 또는 BGM baseline 조정

Dependencies:
```bash
pip install stable-ts pysubs2 color-matcher
```

New files:
- `pipeline/scripts/video_assembler.py`
- `pipeline/scripts/subtitle_pipeline.py`
- `pipeline/scripts/color_normalize.py`
- `pipeline/scripts/validate_phase7_postproduction.py`

Modified files:
- `pipeline/scripts/audio_postprocess.py` (+mix_with_ducking)
- `pipeline/scripts/evaluate_renders.py` (+quality check, thumbnail, scene chapters)
- `pipeline/scripts/package_for_youtube.py` (18 new CLI flags, 5-phase integration)
- `pipeline/scripts/run_end_to_end_video_pipeline.py` (+Phase 7 flag passthrough)
- `pipeline/scripts/run_blog_to_video_pipeline.py` (+Phase 7 flag passthrough)
