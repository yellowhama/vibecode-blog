# 파이프라인 고도화 구현 완료 보고 (2026-03-06)

## 요약
vibecode-blog 멀티채널 퍼블리싱 파이프라인에 6개 Phase 엔지니어링 개선을 적용했습니다.
외부 SaaS 없이 $0 비용, 기존 코드 위에 코드퍼스트 패턴 적용.

## Phase 1: 즉시 수정 (Quick Wins)

### 1-1. TTS 캐시 키 버그 수정
- **파일**: `tts_backends/base.py` line 166
- `cache_key()` 에 `sample_rate` 추가 → 다른 sample_rate 간 잘못된 캐시 히트 방지

### 1-2. evaluate_renders.py 파이프라인 연결
- **파일**: `run_end_to_end_video_pipeline.py`
- learn → **evaluate** → package 순서로 삽입
- `--skip-evaluate`, `--evaluate-strict`, `--evaluate-provider` 플래그 추가

### 1-3. ComfyUI 렌더 재시도
- **파일**: `comfy_batch_render.py`
- `MAX_RETRIES=2`, exponential backoff (5s, 15s)
- `retry_count` 필드 render_log.json에 기록

## Phase 2: 증분 렌더링

- **파일**: `comfy_batch_render.py` + 신규 `render_cache.py`
- 샷 config SHA256 해시 → `.render_cache.json` → 변경 없는 샷 스킵
- `--force-render` 플래그로 캐시 무시 가능
- `status: "cached"` 로그 표시, summary에 `cached` 카운트 포함

## Phase 3: 병렬화 + 오디오 최적화

### DAG 파이프라인
- **파일**: `run_blog_to_video_pipeline.py`
- `asyncio.gather()` 로 manifest + TTS 병렬 실행
- `--stages prepro,tts` / `--resume-from render` 지원

### 오디오 최적화
- **파일**: `audio_postprocess.py`
- N-1번 순차 ffmpeg → 단일 complex filter graph (`acrossfade` 체인)

## Phase 4: 자동 트리거 + 스케줄링

- 신규 `pipeline_watcher.py`: watchdog 기반 `.md` 변경 감시 → prepro 자동 트리거 (5s debounce)
- 신규 `.github/workflows/twitter-analytics.yml`: 일간 06:00 UTC cron → 트위터 분석 수집
- 신규 `content/publish_log.json`: 멀티채널 게시 상태 레지스트리

## Phase 5: 피드백 루프

- 신규 `scripts/twitter/fetch-analytics.mjs`: posted 트윗 → public_metrics 수집 → 주차별 JSON
- `generate_tts_from_prepro.py`: actual_duration 피드백 → prepro_manifest에 기록
- `evaluate_renders.py`: `quality_summary.json` 집계 (pass_rate, avg_score, failure_patterns, 반복 실패 경고)

## Phase 6: YouTube 업로드 자동화

- 신규 `youtube_upload.py`: YouTube Data API v3 + OAuth2, 청크 업로드, 썸네일 설정
- `package_for_youtube.py`: `--upload`, `--upload-privacy`, `--youtube-credentials` 플래그
- 업로드 후 `publish_log.json` 자동 업데이트

## 수정/생성 파일 목록

### 수정됨
| 파일 | 변경 |
|------|------|
| `tts_backends/base.py` | cache_key에 sample_rate 추가 |
| `comfy_batch_render.py` | 재시도 + 증분 렌더 캐시 + --force-render |
| `run_end_to_end_video_pipeline.py` | evaluate 단계 연결 + --evaluate-strict |
| `run_blog_to_video_pipeline.py` | asyncio DAG + --stages + --resume-from |
| `audio_postprocess.py` | 단일 ffmpeg crossfade |
| `evaluate_renders.py` | quality_summary.json 집계 |
| `generate_tts_from_prepro.py` | actual_duration 피드백 |
| `package_for_youtube.py` | --upload + YouTube 연동 |

### 신규 생성
| 파일 | 용도 |
|------|------|
| `render_cache.py` | 해시 기반 렌더 캐시 유틸리티 |
| `pipeline_watcher.py` | watchdog 파일 감시 자동 트리거 |
| `youtube_upload.py` | YouTube Data API v3 업로드 |
| `scripts/twitter/fetch-analytics.mjs` | 트위터 분석 수집 |
| `.github/workflows/twitter-analytics.yml` | 일간 분석 cron |
| `content/publish_log.json` | 멀티채널 게시 레지스트리 |

---

## Phase 7: 영상 후반작업 자동화 (2026-03-06)

기존 파이프라인은 개별 샷을 concat demuxer로 하드컷 이어붙이기만 했음.
이번 Phase에서 트랜지션·자막·오디오덕킹·색감통일·품질검사를 자동화.
비용: $0 (전부 MIT/LGPL 오픈소스).

### 7-A. xfade 트랜지션 + 인트로/아웃트로 오버레이
- **신규**: `video_assembler.py` — FFmpeg xfade 44종, 해상도 정규화(scale+pad), drawtext 인트로/아웃트로
- **수정**: `package_for_youtube.py` — concat demuxer → `assemble_with_transitions()` 교체
- 플래그: `--transition`, `--transition-duration`, `--intro-text`, `--outro-text`, `--no-transitions`

### 7-B. 자막 파이프라인
- **신규**: `subtitle_pipeline.py` — stable-ts 정렬 → pysubs2 ASS → FFmpeg ass 번인
- 듀얼 자막: KO 메인(하단) + EN 보조(하단 위), 독립 ASS 스타일
- 기본 폰트: `Noto Sans CJK KR` + `DejaVu Sans`, repo-local `fontsdir` 지원
- 플래그: `--subtitles`, `--subtitle-lang ko|en|dual`, `--subtitle-text-ko/en`, `--subtitle-font-ko/en`, `--subtitle-fonts-dir`

### 7-C. 오디오 덕킹
- **수정**: `audio_postprocess.py` — `mix_with_ducking()` 추가 (FFmpeg sidechaincompress)
- VO 활성 시 BGM 자동 다운 → VO 종료 시 BGM 복귀
- 플래그: `--audio-ducking`, `--duck-threshold`, `--duck-ratio`

### 7-D. 색감 정규화
- **신규**: `color_normalize.py` — color-matcher 기반 대표 프레임 추출 → 3D LUT 생성 → FFmpeg lut3d
- 적용 시점: 렌더 후, xfade 합본 전 (Phase A 이전)
- 플래그: `--color-normalize`, `--color-method mkl|reinhard|pdf`, `--color-reference`

### 7-E. 품질 게이트 강화
- **수정**: `evaluate_renders.py` — `run_final_quality_check()` (blackdetect/freezedetect/silencedetect)
- `select_best_thumbnail_frame()`: 색상 분산 최대 프레임 + Pillow 타이틀 오버레이
- `build_scene_chapters()`: scene 단위 챕터 그룹핑 (shot 단위 → scene 단위)
- 플래그: `--final-quality-check`, `--quality-check-strict`, `--scene-chapters`

### 7-F. 운영 마감 보강
- **신규**: `ensure_subtitle_fonts.py` — repo-local KO subtitle font bootstrap
- **수정**: `package_for_youtube.py` — subtitle burn-in 직전 자동 font bootstrap (`--skip-subtitle-font-bootstrap` opt-out)
- **수정**: `subtitle_pipeline.py` — standalone CLI 추가 (`--video`, `--audio`, `--text-ko|en`)
- **수정**: `evaluate_renders.py` — `--evaluation-label` 지원, strict/relaxed 결과 공존
- **수정**: `evaluate_renders.py` — transient vision API retry policy (`--retries`, `--retry-delay-sec`)
- **수정**: hallucination keyword false-positive 제거 (`no visible texts/watermarks/...` 문장을 오탐하지 않도록 보강)
- **신규**: `03-visual_assets_guide_production_2026-03-06.md` — production QA용 완화 프로파일
- **신규**: `validate_one_shot_blog_pipeline.py` — blog->render->package one-shot smoke validator
- **신규**: `phase1_act1_render_alignment_backlog_2026-03-07.md` — strict fail 패턴 기반 prompt alignment backlog
- **신규**: `apply_phase1_act1_alignment_overrides.py` — baseline manifest에 alignment prompt override 주입
- **신규**: `phase1_act1_i2v_hunyuan_baseline_manifest_aligned.json` — alignment override 적용 manifest
- **수정**: 상위 오케스트레이터에서 provider/strict/assets-guide/min-score/frames/timeout/retry/label 전달

### 실행 순서
```
D (색감) → A (트랜지션+합본) → C (오디오덕킹) → B (자막번인) → E (품질검사)
```

### 수정/생성 파일
| 파일 | 변경 |
|------|------|
| `video_assembler.py` | 신규 — xfade 체인 + 해상도 정규화 + 인트로/아웃트로 |
| `subtitle_pipeline.py` | 신규 — stable-ts + pysubs2 + FFmpeg burn-in |
| `color_normalize.py` | 신규 — color-matcher LUT + FFmpeg lut3d |
| `validate_phase7_postproduction.py` | 신규 — xfade/ducking/color_normalize 스모크 검증 |
| `ensure_subtitle_fonts.py` | 신규 — repo-local subtitle font bootstrap |
| `validate_one_shot_blog_pipeline.py` | 신규 — one-shot blog pipeline smoke validator |
| `apply_phase1_act1_alignment_overrides.py` | 신규 — prompt alignment override injector |
| `audio_postprocess.py` | +mix_with_ducking (sidechaincompress) |
| `evaluate_renders.py` | +final quality check, labeled evaluation outputs, hallucination false-positive fix, retry policy |
| `package_for_youtube.py` | Phase 7 integration + subtitle font auto-bootstrap |
| `run_end_to_end_video_pipeline.py` | Phase 7 + full evaluate control passthrough |
| `run_blog_to_video_pipeline.py` | Phase 7 + full evaluate control passthrough |

### 의존성
```bash
pip install stable-ts pysubs2 color-matcher
```

### 검증 상태
- [x] 6개 파일 `py_compile` 통과
- [x] 클립 xfade 합본 실행 검증
- [x] 덕킹 믹스 실행 검증
- [x] 색감 정규화 실행 검증
- [x] repo-local subtitle font bootstrap + KO burn-in smoke 검증
- [x] relaxed production guide profile 재평가 검증
- [x] blog->render->package one-shot smoke 검증 (`validate_one_shot_blog_pipeline.py`)
- [~] Act1 통합 파이프라인 실행

### 검증 로그
- `content/video/output/logs/phase7_validation_20260306_062819/phase7_validation_report.json`
- `content/video/output/youtube_packages/phase1_act1_i2v_hunyuan_baseline_20260305_011522/metadata/final_quality_check.json`
- `content/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/evaluations_summary.json`
- `content/video/output/logs/subtitle_smoke_phase7_repo_font.mp4`
- `content/video/output/logs/subtitle_smoke_phase7_repo_font_frame_1s.jpg`
- `content/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/evaluations_summary_production_relaxed.json`
- `content/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/quality_summary_production_relaxed.json`
- `content/video/output/logs/one_shot_blog_pipeline_20260307_015643.json`
- `content/video/output/renders/phase1_act1_one_shot_smoke_video_20260307_014902/evaluations_summary_one_shot_smoke.json`

### 잔여 리스크
- `evaluate_renders` current result on Act1 baseline: `pass=0 fail=5`
- relaxed production guide result on the same baseline: `pass=1 fail=4`
- 동일 baseline이라도 vision QA provider rerun 결과가 완전히 고정되지는 않음 (`e2e_relaxed_passthrough` smoke에서 별도 labeled output 확인)
- frame review + evaluation feedback indicate this is mainly asset-guide/style mismatch, not Phase 7 wiring failure
- subtitle runtime 자체는 해결됨. 남은 과제는 font availability가 아니라 baseline render quality다.
- one-shot smoke는 `mock` evaluator + 1-shot T2V validator 기준 PASS이며, production-grade visual pass와는 별도 관리가 필요하다.

### 다음 단계
1. one-shot smoke 결과를 기준으로 `run_blog_to_video_pipeline.py --render` 경로를 안정화
2. `phase1_act1_i2v_hunyuan_baseline_manifest_aligned.json` 기준으로 샷 재렌더
3. strict/relaxed/rerun variance 기준을 만족할 때까지 `--evaluate-strict`, `--quality-check-strict`는 opt-in 유지

### 운영 기본값(현재)
- `silencedetect` 기본 noise floor: `-55dB`
- `--evaluate-strict`: 기본 비활성
- `--quality-check-strict`: 기본 비활성
- `--evaluate-assets-guide`: strict guide 유지, 필요 시 production guide opt-in
- `--evaluate-temperature`: 기본 `0.0` (결정론적)
- `--render-timeout-sec`: 기본 `10800` (3시간)

---

## Phase 8: 오케스트레이터 플래그 완성 (2026-03-07)

오케스트레이터(run_end_to_end, run_blog_to_video)에서 하위 스크립트로 전달되지 않던 플래그들을 보강.

### 8-A. 렌더 제어 플래그
- **수정**: `run_end_to_end_video_pipeline.py` — `--force-render`, `--render-timeout-sec`, `--render-poll-sec` 추가 및 comfy_batch_render.py 전달
- **수정**: `run_blog_to_video_pipeline.py` — 동일 3개 플래그 + `--output-root` 추가 및 e2e 전달

### 8-B. Manifest Override
- **수정**: `run_blog_to_video_pipeline.py` — `--manifest-override` 추가
- aligned manifest를 직접 지정하면 manifest 자동 생성 스킵

### 8-C. Vision QA 결정론성
- **수정**: `evaluate_renders.py` — `--temperature` 추가 (기본 0.0)
- OpenAI Responses API: `temperature` 필드 payload에 추가
- Gemini API: `generationConfig.temperature` 필드 추가
- **수정**: 양쪽 오케스트레이터에 `--evaluate-temperature` 패스스루

### 수정 파일
| 파일 | 변경 |
|------|------|
| `run_end_to_end_video_pipeline.py` | +force-render, timeout, poll, temperature 전달 |
| `run_blog_to_video_pipeline.py` | +force-render, timeout, poll, output-root, manifest-override, temperature 전달 |
| `evaluate_renders.py` | +temperature (OpenAI/Gemini 양쪽) |

### 검증
- [x] 3개 파일 `py_compile` 통과

---

## Phase 9: 프리프로덕션 + 에이전트 자동화 (2026-03-07)

시각 일관성 0% (strict QA 0/5) 문제 해결을 위한 전면 재설계.
하이브리드 아키텍처: Claude Code Skills (대화형 기획/리뷰) + Python Agents (자율 교정) + 기존 DAG (렌더/평가/조립).

### 9-A. 캐릭터 추출기 (`character_extractor.py`)
- **신규**: `pipeline/scripts/character_extractor.py`
- 대본 markdown + video_prompts.md에서 캐릭터 5명 자동 추출
- Regex + 키워드 매칭 (API 비용 $0)
- 출력: `characters.json` (외모 설명, 등장 씬, 4앵글 시트 프롬프트)
- 검증: 5 캐릭터, 12 Act 추출 성공

### 9-B. 캐릭터 시트 생성기 (`character_sheet_generator.py`)
- **신규**: `pipeline/scripts/character_sheet_generator.py`
- 캐릭터당 4앵글 앵커 프레임 생성 (정면/3-4/측면/전신)
- ComfyUI Wan T2V + `duration_sec=1` → 1프레임 추출 (ffmpeg)
- `primary_anchor` 선정: 색상 분산(numpy) 기준 최고 품질 프레임
- 출력: `assets/characters/{character_id}/` (4 PNG + primary_anchor)
- 검증: 20샷 렌더 성공 (5캐릭터 × 4앵글), 5개 primary_anchor 선정

### 9-C. ComfyUI 노드 체크 (`check_comfyui_nodes.py`)
- **신규**: `pipeline/scripts/check_comfyui_nodes.py`
- ComfyUI `/object_info` API → IP-Adapter, ControlNet, VACE, RIFE, VideoHelper 탐지
- 미설치 시 설치 명령 출력 + Phase 2(IP-Adapter) 스킵 안내
- `--json` 플래그로 기계 판독 가능

### 9-D. IP-Adapter 바인딩 준비
- **신규**: `pipeline/bindings/hunyuan_i2v_ipadapter_bindings.json` (플레이스홀더)
- **수정**: `scripts/comfy_batch_render.py` — `reference_images` 바인딩 섹션 7 추가
  - `reference_images[]` → IP-Adapter 노드에 레퍼런스 이미지 + weight 바인딩
  - 하위호환: IP-Adapter 노드 없으면 무시
  - `_compute_shot_hash()`에 `reference_images` 포함 (캐시 무효화)

### 9-E. 지능형 샷 플래너 (`shot_planner.py`)
- **신규**: `pipeline/scripts/shot_planner.py`
- YouTube 페이싱 계산: 목표 초수 → 목표 샷 수 (8-12 shots/min)
- 캐릭터 배치 그룹핑: `generation_group` + `generation_order`
- 레퍼런스 자동 매핑: `reference_images` 필드 자동 할당
- 히어로 샷 우선: 가장 긴 샷 먼저 렌더 (시각 기준 설정)
- 검증: 50샷 / 300.5초 / 10.0 shots/min 달성

### 9-F. QA 자기교정 에이전트 (`qa_correction_agent.py`)
- **신규**: `pipeline/scripts/qa_correction_agent.py`
- 7개 실패 패턴 분류: hallucination, missing_element, style_mismatch, expression_wrong, costume_wrong, composition_wrong, motion_wrong
- 패턴별 타겟 교정: negative 강화, positive 강조, IP-Adapter weight 상향, seed 시프트
- 최대 3회 재시도 → NEEDS_HUMAN_REVIEW 에스컬레이션
- **수정**: `run_end_to_end_video_pipeline.py` — `--auto-correct`, `--auto-correct-max-attempts` 추가

### 9-G. Claude Code 스킬 (3개)
- **신규**: `.agents/skills/video_production/SKILL.md` — 메인 스킬 정의
- **신규**: `.agents/skills/video_production/plan.md` — `/video-plan` (대화형 기획)
- **신규**: `.agents/skills/video_production/review.md` — `/video-review` (렌더 리뷰)
- **신규**: `.agents/skills/video_production/publish.md` — `/video-publish` (최종 업로드)

### 9-H. 프로덕션 오케스트레이터 (`run_video_production.py`)
- **신규**: `pipeline/scripts/run_video_production.py`
- 6단계 순차 실행: extract → character_sheets → plan → render → correct → package
- 체크포인트/재개: `checkpoint.json` + `--resume-from` 플래그
- ComfyUI 오프라인 시 character_sheets 스킵 (graceful fallback)

### 9-I. 50샷 프로덕션 렌더 실행
- 매니페스트: `phase1_act1_planned_wan_t2v.json` (50샷, Wan T2V 1.3B 통일)
- 발견: Hunyuan T2V 워크플로우 부재 → 전체 Wan T2V로 통일
- 출력: `output/renders/phase1_act1_planned_wan_t2v_20260307_073358/`
- 상태: 렌더 진행중

### 신규 파일 (9개)
| 파일 | 용도 |
|------|------|
| `pipeline/scripts/character_extractor.py` | 대본 → 캐릭터 목록 |
| `pipeline/scripts/character_sheet_generator.py` | 앵커 프레임 생성 |
| `pipeline/scripts/check_comfyui_nodes.py` | IP-Adapter 노드 확인 |
| `pipeline/scripts/shot_planner.py` | 지능형 매니페스트 생성 |
| `pipeline/scripts/qa_correction_agent.py` | 실패 샷 자동교정 |
| `pipeline/scripts/run_video_production.py` | 전체 오케스트레이터 |
| `pipeline/bindings/hunyuan_i2v_ipadapter_bindings.json` | IP-Adapter 바인딩 |
| `.agents/skills/video_production/` (4파일) | Claude Code 스킬 |

### 수정 파일 (2개)
| 파일 | 변경 |
|------|------|
| `scripts/comfy_batch_render.py` | +reference_images 바인딩 + 캐시 해시 |
| `pipeline/scripts/run_end_to_end_video_pipeline.py` | +auto-correct 플래그 |

### 생성 데이터
| 파일 | 내용 |
|------|------|
| `pipeline/manifests/characters.json` | 5 캐릭터 정의 |
| `pipeline/manifests/phase1_act1_planned.json` | 50샷 매니페스트 (혼합 모델) |
| `pipeline/manifests/phase1_act1_planned_wan_t2v.json` | 50샷 매니페스트 (Wan T2V 통일) |
| `assets/characters/` (25 PNG) | 5캐릭터 × 5장 (4앵글 + primary) |
| `assets/characters/character_index.json` | 캐릭터 에셋 인덱스 |
