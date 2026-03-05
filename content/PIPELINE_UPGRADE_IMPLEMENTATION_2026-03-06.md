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
- 플래그: `--subtitles`, `--subtitle-lang ko|en|dual`, `--subtitle-text-ko/en`, `--subtitle-font-ko/en`

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
| `audio_postprocess.py` | +mix_with_ducking (sidechaincompress) |
| `evaluate_renders.py` | +final quality check, best thumbnail, scene chapters |
| `package_for_youtube.py` | 18 new CLI flags, 5-phase integration |
| `run_end_to_end_video_pipeline.py` | Phase 7 flags passthrough |
| `run_blog_to_video_pipeline.py` | Phase 7 flags passthrough |

### 의존성
```bash
pip install stable-ts pysubs2 color-matcher
```

### 검증 상태
- [x] 6개 파일 `py_compile` 통과
- [x] 클립 xfade 합본 실행 검증
- [x] 덕킹 믹스 실행 검증
- [x] 색감 정규화 실행 검증
- [~] Act1 통합 파이프라인 실행

### 검증 로그
- `content/video/output/logs/phase7_validation_20260306_062819/phase7_validation_report.json`
- `content/video/output/youtube_packages/phase1_act1_i2v_hunyuan_baseline_20260305_011522/metadata/final_quality_check.json`
- `content/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522/evaluations_summary.json`

### 잔여 리스크
- `evaluate_renders` current result on Act1 baseline: `pass=0 fail=5`
- final packaged output hits `silencedetect` warning (`14.88s`)
- subtitle runtime smoke has not been executed yet

### 다음 단계
1. `evaluate_renders` FAIL 5건이 실제 렌더 품질 문제인지, 평가 프롬프트/threshold 문제인지 분리
2. `silencedetect` 기준 또는 BGM baseline을 운영값에 맞게 조정
3. subtitle runtime smoke를 실제 KO/EN 텍스트 + voiceover로 실행
4. 위 3건 정리 후 `--evaluate-strict`, `--quality-check-strict`의 운영 기본값 결정
