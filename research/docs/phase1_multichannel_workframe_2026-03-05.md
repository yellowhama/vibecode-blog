# Phase1 멀티채널 퍼블리싱 워크프레임 (2026-03-05, updated 2026-03-06)

## 0) 한 줄 결론
`Blog -> Twitter/X -> YouTube` 전체 체인 중 **Video 파이프라인 고도화 6단계 완료**. 증분 렌더·병렬화·QA 자동화·YouTube 업로드·피드백 루프까지 코드로 구현됨. 다음 단계: **실제 Act1 풀 렌더 + 채널별 첫 발행**.

## 1) 목표 범위
- Source: `content/blog/phase1/*` (KO/EN 원문)
- Channel A: 블로그 게시
- Channel B: Twitter/X 스레드 게시
- Channel C: 영상 제작 + YouTube 게시

## 2) 현재 상태 스냅샷

### 완료됨
- Blog 원고 자산:
  - `content/blog/phase1/act1~act5` KO/EN 문서 존재 (40파일)
- Twitter 큐 자산:
  - `content/twitter_queue/2026-w10~w19-*.json` 존재 (주차별 큐 구조 확보)
- Video 생성 안정화:
  - Hunyuan C-v2 기준선 확정: `steps=20`, `cfg=1.0`, `--detach` 운영
  - Scene1+2 전체 배치 통과 run: `phase1_act1_i2v_hunyuan_baseline_20260305_011522` (`5/5 ok`)
- **파이프라인 엔지니어링 고도화 (2026-03-06) — 6 Phase 전체 완료**:
  - Phase 1: Quick Wins — TTS 캐시키 버그 수정, evaluate_renders 연결, 렌더 재시도(2x backoff)
  - Phase 2: 증분 렌더링 — SHA256 샷 해시 캐시, 변경분만 재렌더
  - Phase 3: DAG 병렬화 — asyncio(manifest‖TTS), 단일 ffmpeg crossfade, --stages/--resume-from
  - Phase 4: 자동 트리거 — watchdog 파일 감시, GitHub Actions 분석 cron, publish_log.json
  - Phase 5: 피드백 루프 — Twitter 분석 수집, TTS actual_duration 피드백, 품질 통계 집계
  - Phase 6: YouTube 업로드 — Data API v3 + OAuth2, --upload --upload-privacy 플래그
  - 상세: `content/PIPELINE_UPGRADE_IMPLEMENTATION_2026-03-06.md`

### 진행 중
- Scene 단위 품질업 단일변수 실험(steps/cfg)로 기준선 검증 확장

### 미완료 → 다음 단계
- [ ] Act1 전체 Scene(3+) 렌더 → 편집본 생성 (파이프라인 실전 검증)
- [ ] YouTube 첫 업로드 (credentials 설정 + unlisted 테스트)
- [ ] Blog 첫 게시 (Astro 빌드 → Vercel → publish_log 기록)
- [ ] Twitter 첫 자동 게시 (approved → posted 전환 확인)
- [ ] 주간 운영 리포트 대시보드 (게시 수/조회/CTR/완주율)

## 3) 멀티채널 운영 구조

### Track A. Blog Publishing
1. 원문 고정: `content/blog/phase1/<act>-ko.md` (필요시 EN 동기화)
2. 게시본 확정: 제목/요약/CTA/내부링크/대표이미지
3. 발행 기록: 게시 URL, 게시일, 수정 이력

산출물:
- 게시 원문 파일
- 게시 URL 로그(문서 또는 JSON)

### Track B. Twitter/X
1. 원문에서 스레드 파생(후킹 문장 + 4~7 포스트)
2. `content/twitter_queue/YYYY-wNN-*.json`에 적재
3. 상태 전이 관리: `draft -> approved -> posted`
4. 게시 후 `postedIds`, `postedAt` 기록

산출물:
- 주차별 queue JSON
- 게시 결과 로그

### Track C. Video + YouTube
1. 스크립트/샷 설계: `content/video/planning/*`
2. 렌더 실행: `content/video/scripts/comfy_batch_render.py`
   - **증분 렌더링**: SHA256 해시 캐시 → 변경 샷만 재렌더 (`--force-render` 오버라이드)
   - **자동 재시도**: MAX_RETRIES=2, exponential backoff (5s, 15s)
3. QA 게이트 통과:
   - `render_log`: `status=ok`, `artifact_count>0`
   - `learning_analysis`: `noise=False`, `black=False`
   - **Vision QA**: `evaluate_renders.py` → Gemini/OpenAI 기반 자동 평가 (`--evaluate-strict`)
   - **품질 통계**: `quality_summary.json` (pass_rate, failure_patterns, 반복 실패 경고)
4. 편집/합본(VO/BGM/자막/인트로/아웃트로)
   - **TTS 피드백**: actual_duration → prepro_manifest에 기록 → 다음 렌더 시 활용
   - **오디오 최적화**: 단일 ffmpeg complex filter crossfade (N-1회 → 1회)
5. YouTube 업로드 패키지 생성(제목/설명/태그/챕터/썸네일)
6. **YouTube 자동 업로드**: `youtube_upload.py` (Data API v3, OAuth2, chunked)
   - `package_for_youtube.py --upload --upload-privacy unlisted`

산출물:
- final mp4
- 썸네일
- 업로드 메타데이터 파일
- YouTube URL 로그
- `publish_log.json` 자동 업데이트

### Track D. 파이프라인 인프라 (신규)
1. **DAG 병렬화**: `run_blog_to_video_pipeline.py` — asyncio(manifest‖TTS 동시 실행)
2. **단계별 실행**: `--stages prepro,tts` / `--resume-from render`
3. **자동 트리거**: `pipeline_watcher.py` — watchdog `.md` 변경 감시 → prepro 자동 실행
4. **분석 수집**: `fetch-analytics.mjs` + `.github/workflows/twitter-analytics.yml` (일간 cron)
5. **멀티채널 레지스트리**: `content/publish_log.json` — blog/twitter/youtube URL 상호 참조

## 4) 공통 QA/게이트
- 원문-채널 정합성: 메시지 왜곡 금지
- 법적/정책 검토: 사용 모델/자산 라이선스 확인
- 데이터 추적성: run_id / post_id / URL 상호 연결
- 실패 시 즉시 롤백: 이전 승인 버전으로 복귀

## 5) 지금까지 한 일의 위치 (중요)
- Track C(Video) 파이프라인: **코드 인프라 완성** (증분 렌더·QA·업로드·피드백 루프)
- Track D(인프라): **파이프라인 자동화 기반 완성** (DAG·트리거·분석·레지스트리)
- **아직 실전 검증 미완료**: 실제 Act1 풀 렌더, YouTube 첫 업로드, Blog/Twitter 첫 발행

## 6) 다음 실행 순서 (권장)

### Step 1. 실전 검증 (파이프라인 end-to-end 테스트)
1. YouTube OAuth credentials 설정 (credentials.json 발급)
2. Act1 전체 Scene 매니페스트 확보 → `run_blog_to_video_pipeline.py --render` 풀 실행
3. `--upload --upload-privacy unlisted` 로 YouTube 테스트 업로드
4. `publish_log.json` 에 결과 기록 확인

### Step 2. 3채널 동시 첫 발행
1. Blog Act1 게시: Astro 빌드 → Vercel 배포 → 게시 URL 확보
2. Twitter 첫 자동 게시: queue 파일에서 `approved` 항목 → cron 발행 확인
3. YouTube: unlisted → public 전환 (게시 URL과 연결)
4. `publish_log.json`에 3채널 모두 URL 기록

### Step 3. 운영 루프 안정화
1. `pipeline_watcher.py` 상시 가동 (systemd user unit 또는 nohup)
2. Twitter 분석 cron 가동 확인 → 첫 주간 리포트 생성
3. Blog/Twitter 교차 링크: 블로그 게시 URL을 Twitter 스레드 마지막에 자동 삽입
4. 주간 운영 대시보드: 게시 수 / 조회 / CTR / 완주율 주차별 기록

### Step 4. 콘텐츠 확장
1. Act2~5 영상 제작 (같은 파이프라인, 증분 렌더 활용)
2. A-Grade 블로그 9편 순차 발행 (QUALITY-AUDIT 기준 S/A tier)
3. 영문 번역 T1 8편 발행 (BLOG-EVALUATION 기준)
4. 책 원안(book-source) → 별도 채널 검토
