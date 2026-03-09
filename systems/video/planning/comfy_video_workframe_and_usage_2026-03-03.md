# Comfy 영상 제작 워크프레임 + 사용방법 (2026-03-03)

## 0) 범위 선언
- 이 문서는 `content` 전체 퍼블리싱 파이프라인 중 **Video 제작 트랙 전용** 문서입니다.
- Blog/Twitter/YouTube까지 포함한 상위 통합 워크프레임은 아래 문서를 기준으로 합니다.
  - `content/phase1_multichannel_workframe_2026-03-05.md`

## 0-1) 전체 그림 안에서 Video 트랙의 역할
비디오 트랙은 단독 작업이 아니라, `Blog -> Twitter/X -> YouTube` 퍼널의 중간 허브입니다.

### Video 트랙 입력(Upstream)
- 스토리 원문: `content/blog/phase1/*.md` (KO/EN)
- 채널 메시지 톤: `content/twitter_queue/*.json`의 훅/요약 방향
- 기획 문서: `systems/video/planning/*` (shot 목적, 액션, 아트 가이드)

### Video 트랙 출력(Downstream)
- 렌더 산출물: `systems/video/output/renders/<run_id>/*`
- QA 증거: `render_log.json`, `learning_analysis.json|md`, `qa_frames/*`
- 배포 패키지 재료: YouTube용 최종 mp4, 썸네일 후보, 설명문 근거 샷

### 인터페이스 계약(핵심)
1. Blog 핵심 메시지와 영상 장면 의미가 충돌하지 않아야 함.
2. 영상 CTA/설명문은 블로그 게시 URL과 연결 가능해야 함.
3. Twitter 티저 컷(짧은 하이라이트) 추출이 가능하도록 샷 구조를 유지해야 함.

## 1) 공식 문서 기반 워크프레임

### A. 실행 인터페이스를 API로 통일
Comfy 공식 서버 라우트 기준으로 자동화의 최소 인터페이스는 아래 5개다.
- `POST /prompt`: 워크플로우 실행 제출
- `GET /history/{prompt_id}`: 실행 결과 조회
- `GET /queue`: 실행 큐 상태
- `GET /view`: 산출물 파일 조회
- `GET /ws`: 실시간 이벤트 스트림

참고: `/api/*` 프리픽스도 병행 제공됨.

### B. 워크플로우 파일 포맷을 분리
- **기획/편집 포맷**: UI workflow JSON
- **자동화 실행 포맷**: API workflow JSON (`/prompt`용)

운영 규칙:
1. UI에서 워크플로우 완성
2. `File -> Export (API)`로 API JSON export
3. 배치 러너는 API JSON만 사용

### C. 제작 파이프라인을 5단계로 고정 (Dual-Stage Architecture)
순수 T2V 모델의 캐릭터 외형 유지(Visual Consistency) 한계를 극복하기 위해, 영상 생성은 반드시 T2I 키프레임을 경유하는 2단계(Dual-Stage)로 진행합니다.

1. **Planning**: Antigravity 기획 -> shot manifest 정규화 (T2I용 프롬프트 및 I2V 모션 기획)
2. **Keyframing (T2I + IP-Adapter)**: 마스터 캐릭터 시트를 참조(Conditioning)하여 프롬프트와 100% 일치하는 각 샷의 첫 프레임(Base Image)을 사전 생성.
3. **Compile**: I2V manifest 값을 API workflow 노드 입력으로 주입 (생성된 키프레임을 `input_image`로 할당).
4. **Render (I2V)**: `/prompt` 배치 실행 + `/history` 결과 수집 (키프레임 기반 모션 생성).
5. **Deliver**: `/view` 다운로드 + render log 저장 + 후처리(ffmpeg)

## 2) 모델 운용 원칙 (현재 로컬 기준)

- 운영 기준선(Production): **Hunyuan C-v2 I2V**
  - model: `hunyuanvideo1.5_480p_i2v_step_distilled_fp8_scaled.safetensors`
  - params: `steps=20`, `cfg=1.0`, `sampler=euler`, `scheduler=simple`
  - server mode: `run_comfy_server.sh --detach`
- 보조/비교 트랙: Wan 2.1 계열 (회귀 비교/대체 실험용)

메모:
- HunyuanVideo 1.5는 공식 LICENSE 조항(적용 지역 제한)을 운영 전에 반드시 확인해야 함.
- 기준선 승격 근거 run:
  - `phase1_act1_i2v_hunyuan_baseline_20260305_011522` (`5/5 ok`, `noise_collapse=0/5`, `black_collapse=0/5`)

## 3) 이번에 구현한 자동화 구성

### 스크립트
- 배치 렌더러: `systems/video/scripts/comfy_batch_render.py`
- Comfy 실행 래퍼: `systems/video/scripts/run_comfy_server.sh`
- 배치 실행 래퍼: `systems/video/scripts/run_batch_render.sh`
- 블로그 prepro 생성기: `systems/video/pipeline/scripts/build_blog_to_video_prepro.py`
- prepro->shot manifest 변환기: `systems/video/pipeline/scripts/build_shot_manifest_from_prepro.py`
- 큐 녹음 합본기: `systems/video/pipeline/scripts/assemble_voiceover_from_cues.py`
- 자동 TTS 생성기: `systems/video/pipeline/scripts/generate_tts_from_prepro.py`
- TTS 환경 점검기: `systems/video/pipeline/scripts/tts_env_check.py`
- 오디오 후처리 모듈: `systems/video/pipeline/scripts/audio_postprocess.py`
- TTS 백엔드 어댑터: `systems/video/pipeline/scripts/tts_backends/*.py`
- manifest 기반 키프레임 sync: `systems/video/pipeline/scripts/sync_manifest_keyframes_to_comfy_input.py`
- YouTube 패키저: `systems/video/pipeline/scripts/package_for_youtube.py`
- E2E 오케스트레이터: `systems/video/pipeline/scripts/run_end_to_end_video_pipeline.py`
- Blog->Video 오케스트레이터: `systems/video/pipeline/scripts/run_blog_to_video_pipeline.py`

### 데이터 계약 파일
- 기준선 바인딩: `systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json`
- 기준선 매니페스트(Act1 Scene1+2): `systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json`
- 매니페스트 샘플(v2): `systems/video/pipeline/manifests/shot_manifest_template_v2.json`

### 워크플로우 레퍼런스
- 기준선 워크플로우: `systems/video/workflows/api/hunyuan_i2v_c_test_api.json`
- 비교 워크플로우: `systems/video/workflows/api/wan_*.json`
- 실제 실행용은 `systems/video/workflows/api/*.json`에 API 포맷 파일 배치 필요

## 4) 사용 방법

### A) 블로그 글에서 바로 시작 (대본 -> 녹음 -> nonlingual 영상대본 -> 제작)
1) prepro + shot manifest 생성(dry):
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/run_blog_to_video_pipeline.py \
  --blog /mnt/e/vibecode-blog/content/blog/phase1/act1-ko.md \
  --project-id phase1_act1_ko \
  --language ko \
  --max-shots 12 \
  --target-duration-sec 120
```
2) (선택) 큐별 녹음 파일을 폴더에 배치(`B001.wav`, `B002.wav` ... 또는 `S001.wav` ...)
   - 생략하면 `--render` 시 자동 TTS로 `voiceover_master_tts.wav` 생성
3) `i2v` 모드면 샷별 키프레임(`Sxx_xx_keyframe.png`)을 `systems/video/assets` 또는 `systems/video/keyframes`에 준비
   - 키프레임이 없으면 `--mode t2v` + t2v workflow/bindings 조합으로 실행
4) 렌더까지 실행:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/run_blog_to_video_pipeline.py \
  --blog /mnt/e/vibecode-blog/content/blog/phase1/act1-ko.md \
  --project-id phase1_act1_ko \
  --language ko \
  --max-shots 12 \
  --target-duration-sec 120 \
  --render \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json \
  --twitter-queue /mnt/e/vibecode-blog/content/twitter_queue/2026-w10-act1.json \
  --title "FDD Phase1 Act1 | Claymation Story"
```
Local 우선 TTS(offline strict) 예시:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/run_blog_to_video_pipeline.py \
  --blog /mnt/e/vibecode-blog/content/blog/phase1/act1-ko.md \
  --project-id phase1_act1_ko \
  --language ko \
  --max-shots 12 \
  --target-duration-sec 120 \
  --render \
  --tts-backend mms \
  --tts-fallback edge \
  --offline-strict \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json
```
수동 녹음 우선 사용 시:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/run_blog_to_video_pipeline.py \
  --blog /mnt/e/vibecode-blog/content/blog/phase1/act1-ko.md \
  --project-id phase1_act1_ko \
  --language ko \
  --max-shots 12 \
  --target-duration-sec 120 \
  --recordings-dir /mnt/e/vibecode-blog/systems/video/preproduction/<prepro_id>/recordings \
  --render \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json
```
TTS 백엔드 상태 점검:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/tts_env_check.py \
  --out /mnt/e/vibecode-blog/systems/video/output/logs/tts_env_check.json
```

### A-1) TTS 운영 규칙 (2026-03-05)
- 기본: `--tts-backend edge` (온라인 품질 우선)
- 로컬 우선: `--tts-backend mms|xtts` + `--tts-fallback edge`
- 완전 로컬 강제: `--offline-strict` (non-local backend 차단)
- 자동 리포트:
  - `voiceover_tts_report.json` (백엔드/폴백/실패 내역)
  - `timing_alignment_report.json` (비트 vs 실제 음성 길이)
  - `voiceover_quality_report.json` (loudness/peak/음량 요약)
- 로컬 백엔드 의존성(현재 검증 버전):
  - `torch==2.2.2+cpu`
  - `torchaudio==2.2.2+cpu`
  - `transformers==4.37.2`
  - `numpy==1.26.4`
  - `uroman==1.3.1.1` (MMS 비라틴 문자 romanization)

### 0) Comfy 서버 실행
```bash
bash /mnt/e/vibecode-blog/systems/video/scripts/run_comfy_server.sh
```
CLI 자동화/장시간 배치 권장 모드(파이프 단절 방지):
```bash
bash /mnt/e/vibecode-blog/systems/video/scripts/run_comfy_server.sh --detach
```

### 1) API 워크플로우 준비
- Comfy UI에서 대상 워크플로우를 연 뒤 `File -> Export (API)`
- 기준선 저장 경로: `systems/video/workflows/api/hunyuan_i2v_c_test_api.json`

### 2) 매니페스트/바인딩 점검
- `shot_manifest_template_v2.json`을 실제 shot 계획으로 수정
- 노드 ID가 워크플로우와 다르면 바인딩 JSON 수정

### 3) 드라이런 검증
```bash
python3 /mnt/e/vibecode-blog/systems/video/scripts/comfy_batch_render.py \
  --manifest /mnt/e/vibecode-blog/systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json \
  --dry-run
```

### 4) 실제 렌더 실행
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/sync_manifest_keyframes_to_comfy_input.py \
  --manifest /mnt/e/vibecode-blog/systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json

python3 /mnt/e/vibecode-blog/systems/video/scripts/comfy_batch_render.py \
  --manifest /mnt/e/vibecode-blog/systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json
```

### 5) 산출물/로그 확인
- 렌더 결과: `systems/video/output/renders/<project>_<timestamp>/<shot_id>/...`
- 실행 로그: `systems/video/output/renders/<project>_<timestamp>/render_log.json`

### 6) 학습 루프 실행 (지속 개선)
렌더 직후 아래 분석기를 실행해 `실패 유형/원인/다음 실험안`을 자동 기록합니다.
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/learn_from_run.py \
  --run-dir /mnt/e/vibecode-blog/systems/video/output/renders/<run_id> \
  --duration-policy unchanged
```

생성 파일:
- `<run_id>/learning_analysis.md`
- `<run_id>/learning_analysis.json`
- `systems/video/pipeline/learning/experiment_history.jsonl`

### 7) E2E 실행 (렌더 + QA + YouTube 패키지)
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/run_end_to_end_video_pipeline.py \
  --manifest /mnt/e/vibecode-blog/systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json \
  --blog-source /mnt/e/vibecode-blog/content/blog/phase1/act1-ko.md \
  --twitter-queue /mnt/e/vibecode-blog/content/twitter_queue/2026-w10-act1.json \
  --title "FDD Phase1 Act1 | Claymation Story" \
  --checklist-strict
```
참고:
- E2E는 manifest를 읽어 i2v `input_image` 파일을 동적으로 sync합니다.
- 기본 search dir: `systems/video/assets`, `systems/video/keyframes`
- 필요 시 `--keyframe-search-dir`를 반복 지정해 경로를 추가합니다.
- `--checklist-strict`를 쓰면 YouTube 업로드 필수 자동 게이트 FAIL 시 패키징 단계가 즉시 실패합니다.

생성 패키지:
- `systems/video/output/youtube_packages/<run_id>/final/*`
- `systems/video/output/youtube_packages/<run_id>/thumbnails/*`
- `systems/video/output/youtube_packages/<run_id>/metadata/youtube_metadata.json`
- `systems/video/output/youtube_packages/<run_id>/metadata/youtube_upload_checklist.json`
- `systems/video/output/youtube_packages/<run_id>/metadata/youtube_upload_checklist.md`

## 5) 실패 시 우선 점검 (Verification Gates)
1. **API 연결 확인:** Comfy 서버가 `http://127.0.0.1:8188`에서 살아있는지 확인
2. **포맷 검사:** 워크플로우가 API 포맷인지 확인(UI 포맷이면 실패)
3. **바인딩 검사:** 바인딩 노드 ID/입력명과 workflow 노드가 일치하는지 확인
4. **모델명 매칭:** 모델 파일명이 실제 Comfy `models/*`와 일치하는지 확인
4-1. **TTS 백엔드/환경 점검:**
   - `tts_env_check.py`에서 backend healthcheck를 먼저 확인
   - `xtts` 오류 `libtorch_cuda.so`는 torch/환경 불일치 가능성
   - `mms` 오류 `torch.library.register_fake`는 torch/transformers 호환성 이슈
   - 로컬 백엔드 불가 시 `--tts-fallback edge`로 임시 운영
5. **[NEW] BrokenPipe 런타임 오류 점검:**
   - 증상: `render_log`상 `status=ok`로 보였지만 실제로는 Comfy `history.status=error` + `BrokenPipeError`.
   - 실제 원인(2026-03-05): Comfy 프로세스의 stdout/stderr가 read-end 없는 pipe로 연결된 상태에서 KSampler 진행바 출력이 실패.
   - 재발 방지:
     - Comfy 서버는 `run_comfy_server.sh --detach`로 실행(setsid + logfile).
     - 배치 스크립트는 Comfy history `status_str=error`를 즉시 실패 처리하도록 유지.
   - 확인 포인트:
     - `/proc/<comfy_pid>/fd/1`가 pipe가 아니라 logfile를 가리키는지 확인.
     - `render_log`에서 `artifact_count`가 0이면 실패로 처리되어야 정상.
6. **[NEW] 스크린샷 기반 시각 검증 게이트 (Silent Noise Generation):**
   - **핵심:** `render_log.json`의 `status=ok`는 파일 저장 성공일 뿐, 화면 품질 성공이 아님.
   - **실제 확인 (2026-03-04):**
     - *run_id:* `phase1_act1_i2v_20260304_094143`
     - *로그:* `systems/video/output/renders/phase1_act1_i2v_20260304_094143/render_log.json`
     - *로그 요약:* `total=5, ok_or_dry=5, errors=0`
     - *스크린샷 증거:* `systems/video/output/renders/phase1_act1_i2v_20260304_094143/qa_frames/*.jpg`
     - *검증 결과:* 5개 샷 모두(f0/fmid/flast) 캐릭터/배경이 사라지고 컬러 노이즈 패턴만 출력됨.
   - **운영 규칙:** 모든 배치 런은 샷별 `f0/fmid/flast` 스냅샷 추출 후 통과 판정할 것. 스냅샷 검증 전에는 평가기/후처리/납품 단계로 진행 금지.
   - **즉시 FAIL 조건:**
     - 대부분 샷이 동일한 노이즈 텍스처만 출력
     - 키프레임 기반 구조(인물/오브젝트/배경)가 전 프레임에서 식별 불가
     - 샷별 구도 차이가 사라지고 랜덤 패턴만 남음
   - **복구 확인 (2026-03-05, 경량 Hunyuan C-test):**
     - *run_id:* `c_test_hunyuan_i2v_s01_01_20260305_001902` -> `visual_fail_rate=0.0`
     - *run_id:* `c_test_hunyuan_i2v_s01_02_20260305_002411` -> `visual_fail_rate=0.0`
     - *조건:* `DualCLIP = qwen_2.5_vl_7b_fp8_scaled + byt5_small_glyphxl_fp16`, `832x480`, `steps=20`, `cfg=1.0`
   - **추가 검증 및 기준선 승격 (2026-03-05):**
     - *run_id:* `c_test_hunyuan_i2v_s02_01_20260305_010735` -> PASS (`noise=False`, `black=False`, `artifact_count=1`)
     - *run_id:* `c_test_hunyuan_i2v_s02_02_20260305_010301` -> PASS (`noise=False`, `black=False`, `artifact_count=1`)
     - *run_id:* `phase1_act1_i2v_hunyuan_baseline_20260305_011522` -> PASS (`5/5 ok`, `errors=0`, `noise_collapse=0/5`, `black_collapse=0/5`)
     - *운영 기준선 확정:* `Hunyuan C-v2 (steps=20, cfg=1.0) + run_comfy_server.sh --detach`
   - **운영 결론:** `render_log=ok`와 별개로 `qa_frames + learning_analysis`를 통과한 설정만 다음 배치의 기준선(baseline)으로 승격.

## 7) 영상 후반작업 자동화 (2026-03-06 추가)

기존: concat demuxer 하드컷 → 이제: 방송 품질 후처리 자동화.

### 실행 순서
```
D (색감 정규화) → A (xfade 트랜지션) → C (오디오 덕킹) → B (자막 번인) → E (품질 검사)
```

### 새 모듈
| 모듈 | 위치 | 역할 |
|------|------|------|
| `video_assembler.py` | `pipeline/scripts/` | xfade 44종 + 해상도 정규화 + 인트로/아웃트로 drawtext |
| `subtitle_pipeline.py` | `pipeline/scripts/` | stable-ts 정렬 → pysubs2 ASS → FFmpeg ass 번인 |
| `color_normalize.py` | `pipeline/scripts/` | color-matcher LUT 생성 → FFmpeg lut3d 적용 |

### 새 CLI 플래그 (`package_for_youtube.py`)
```bash
# 트랜지션 (기본: fade 1.0초)
--transition fade --transition-duration 1.0
--intro-text "Act 1: 스펙이 뭔지도 몰랐다"
--outro-text "vibecode.town"
--no-transitions  # 하드컷 폴백

# 자막 (stable-ts + pysubs2 필요)
--subtitles --subtitle-lang dual
--subtitle-text-ko "한국어 전체 텍스트..."
--subtitle-text-en "English full text..."
--subtitle-font-ko "Noto Sans CJK KR"
--subtitle-fonts-dir /mnt/e/vibecode-blog/systems/video/assets/fonts
# 기본은 repo-local font bootstrap on, 필요시만:
--skip-subtitle-font-bootstrap

# 오디오 덕킹
--audio-ducking --duck-threshold 0.02 --duck-ratio 6

# 색감 정규화 (color-matcher 필요)
--color-normalize --color-method mkl

# 품질 게이트
--final-quality-check --quality-check-strict
--scene-chapters  # scene 단위 챕터 마커
```

### 의존성
```bash
pip install stable-ts pysubs2 color-matcher
```

repo-local 자막 폰트 bootstrap:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/ensure_subtitle_fonts.py
```

### 검증 커맨드
Phase 7 핵심 3종(xfade/ducking/color_normalize) 스모크:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/validate_phase7_postproduction.py --keep-artifacts
```

Act1 기존 기준선 런에 후반작업 패키징 적용:
```bash
ffmpeg -y -f lavfi -i "sine=frequency=180:sample_rate=24000:duration=30" \
  -af "volume=0.15" -c:a pcm_s16le \
  /mnt/e/vibecode-blog/systems/video/output/logs/act1_phase7_bgm.wav

python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/run_end_to_end_video_pipeline.py \
  --skip-render \
  --run-dir /mnt/e/vibecode-blog/systems/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522 \
  --manifest /mnt/e/vibecode-blog/systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json \
  --workflow /mnt/e/vibecode-blog/systems/video/workflows/api/hunyuan_i2v_c_test_api.json \
  --bindings /mnt/e/vibecode-blog/systems/video/pipeline/bindings/hunyuan_i2v_c_test_bindings.json \
  --blog-source /mnt/e/vibecode-blog/content/blog/phase1/act1-ko.md \
  --twitter-queue /mnt/e/vibecode-blog/content/twitter_queue/2026-w10-act1.json \
  --title "FDD Phase1 Act1 | Claymation Story" \
  --voiceover /mnt/e/vibecode-blog/systems/video/preproduction/phase1_act1_ko_20260305_040631/voiceover_master.wav \
  --bgm /mnt/e/vibecode-blog/systems/video/output/logs/act1_phase7_bgm.wav \
  --transition fade \
  --transition-duration 1.0 \
  --intro-text "Act 1" \
  --outro-text "vibecode.town" \
  --audio-ducking \
  --color-normalize \
  --final-quality-check \
  --scene-chapters
```

자막 단독 smoke (`subtitle_pipeline.py` standalone CLI):
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/subtitle_pipeline.py \
  --video /mnt/e/vibecode-blog/systems/video/output/renders/phase1_act1_ko_final_smoke_video_20260305_064043/S01_01/S01_01.mp4 \
  --audio /mnt/e/vibecode-blog/systems/video/preproduction/phase1_act1_ko_final_smoke_20260305_064040/voiceover_master_tts.wav \
  --text-ko "스펙이 뭔지도 몰랐다" \
  --output /mnt/e/vibecode-blog/systems/video/output/logs/subtitle_smoke_phase7_repo_font.mp4
```

완화 프로파일로 Act1 재평가:
```bash
python3 /mnt/e/vibecode-blog/systems/video/pipeline/scripts/evaluate_renders.py \
  --run-dir /mnt/e/vibecode-blog/systems/video/output/renders/phase1_act1_i2v_hunyuan_baseline_20260305_011522 \
  --manifest /mnt/e/vibecode-blog/systems/video/pipeline/manifests/phase1_act1_i2v_hunyuan_baseline_manifest.json \
  --provider gemini \
  --assets-guide /mnt/e/vibecode-blog/systems/video/planning/03-visual_assets_guide_production_2026-03-06.md \
  --min-score 70 \
  --evaluation-label production_relaxed \
  --overwrite
```

현재 기준선 상태:
- Phase 7 synthetic smoke 3종 PASS
- Act1 postproduction packaging PASS
- subtitle runtime smoke PASS (repo-local Noto font bootstrap)
- strict guide: `pass=0 fail=5`
- relaxed guide (`production_relaxed`): `pass=1 fail=4`

운영 기본값(현재):
- `silencedetect` default noise floor = `-55dB`
- `--evaluate-strict` = off
- `--quality-check-strict` = off
- strict guide 기본 유지, 필요 시 `--evaluate-assets-guide ...03-visual_assets_guide_production_2026-03-06.md --evaluate-min-score 70`

### 사용 예시 (풀 옵션)
```bash
python package_for_youtube.py \
  --manifest manifests/phase1_act1_ko.json \
  --run-dir output/renders/phase1_act1_run_001 \
  --voiceover output/tts/phase1_act1_ko.wav \
  --bgm assets/bgm_ambient.mp3 \
  --transition fade --transition-duration 1.0 \
  --intro-text "Act 1: 분노 주도 개발" \
  --outro-text "vibecode.town" \
  --audio-ducking \
  --color-normalize \
  --subtitles --subtitle-lang dual \
  --subtitle-text-ko "전체 한국어 나레이션..." \
  --subtitle-text-en "Full English narration..." \
  --subtitle-fonts-dir assets/fonts \
  --final-quality-check \
  --scene-chapters \
  --blog-source content/blog/phase1/act1.md
```

## Sources
- Comfy server routes: https://docs.comfy.org/development/comfyui-server/comms_routes
- Workflow JSON spec: https://docs.comfy.org/specs/workflow_json
- Workflow templates: https://docs.comfy.org/custom-nodes/workflow_templates
- Comfy CLI getting started: https://docs.comfy.org/comfy-cli/getting-started
- API nodes overview: https://docs.comfy.org/tutorials/api-nodes/overview
- Wan2.1 native support: https://blog.comfy.org/p/wan21-video-model-native-support
- HunyuanVideo 1.5 native support: https://blog.comfy.org/p/hunyuanvideo-15-native-support
- HunyuanVideo 1.5 LICENSE: https://raw.githubusercontent.com/Tencent-Hunyuan/HunyuanVideo-1.5/main/LICENSE
