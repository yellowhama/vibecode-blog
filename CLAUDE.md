# vibecode-blog 프로젝트 규칙

## 브랜딩 SSOT

**모든 콘텐츠(트윗, 블로그, 뉴스레터)의 최상위 기준: `branding/` 폴더**

| 문서 | 역할 |
|------|------|
| `branding/BRAND.md` | 마스터 — 이 사람이 누구인가, 안티브랜드, 나이키 룰 |
| `branding/voice.md` | 보이스 SSOT — 톤, 모드, 문장 규칙, 적 정의 |
| `branding/narrative.md` | 이야기 구조 — 3막, 트윗 압축, 비유 도구함, 이야기 vs 설명 |
| `branding/examples.md` | 좋은 예시 vs 나쁜 예시 — 광고 카피 판단 기준 |
| `branding/platforms.md` | 플랫폼별 적용 — 트윗/블로그/뉴스레터 차이 |
| `branding/visual.md` | 시각 아이덴티티 — 색상, 폰트, 소셜 에셋 |

### 콘텐츠 작성 전 필수 프로세스

1. `branding/voice.md` 읽기
2. `branding/narrative.md` 읽기 — 이야기 구조 (3막, 트윗 압축)
3. `branding/examples.md`로 광고 카피 체크 + 이야기 vs 설명 체크
4. `branding/platforms.md`에서 해당 플랫폼 규칙 확인
5. 작성
6. **유저에게 보여주고 승인 후 발행** — 바로 쏘지 말 것

### 나이키 룰

제품/블로그를 밀지 않는다. 사람이 전경. 제품은 배경.
트윗에 링크 안 넣는다. CTA 안 달다. 블로그는 프로필 바이오에만.

### 원본 파일 (보존, SSOT 아님)

| 경로 | 상태 |
|------|------|
| `research/docs/voice/character.md` | 원본 보존. SSOT는 `branding/voice.md` |
| `research/docs/translation-guide.md` | 원본 보존. SSOT는 `branding/voice.md` |

---

## 블로그 콘텐츠 위치

| 경로 | 내용 |
|------|------|
| `content/blog/blog-only/` | 한국어 블로그 원본 ~47편 |
| `content/blog/blog-only/en/` | 영문 번역 |
| `content/blog/book-source/` | 책 원안 소스 (섹션별 정리) |
| `systems/video/` | 비디오 생성 프로젝트 최상위 |
| `systems/video/planning/` | 비디오 스토리보드 및 시각화 가이드 문서 모음 |
| `systems/video/output/` | 렌더링 된 최종/중간 비디오 파일 결과물 |
| `systems/twitter/automation/` | Twitter 자동 발행 + 분석 수집 |
| `content/publish_log.json` | 멀티채널 게시 상태 레지스트리 (blog/twitter/youtube URL 연결) |
| `research/docs/book-structure-v2.md` | 새 책 목차 v2 |
| `research/blog-analysis/` | 블로그 전략 리서치 (인덱스: `00-INDEX.md`) |
| `systems/pitch/automation/` | 퍼블리 투고 준비 + 상세페이지 자동화 키트 |
| `systems/planning/` | 유튜브 채널 기획 문서 (포맷 바이블, 메타포 라이브러리, 시리즈 바이블) |
| `systems/video/preproduction/ep01/` | EP01 파일럿 프리프로덕션 (Fountain 스크립트) |

---

## 유튜브 채널: Vibecode Town (나레이션 + 2D 애니메이션)

> **SSOT**: `systems/video/SERIES_BIBLE.md` — 이후 모든 제작의 단일 진실 원천

### 장르 & 타겟
- **장르**: 나레이션 + 2D flat vector 애니메이션 (Kurzgesagt meets Claudius Papirus)
- **타겟**: Vibe Coder (코드 못 읽는데 AI로 만드는 사람)
- **차별점**: 오해-먼저 교육 + Vee 캐릭터 감정 대리

### 에피소드 6단계 구조
```
HOOK (0:00-0:15)          역설적 사실/반직관적 결과
MISCONCEPTION (0:15-0:45) Vee의 잘못된 가정 → 실패 (빨간 색조)
THE_CRACK (0:45-1:15)     인지부조화 — "근데 이렇게 하면?" (색조 전환)
CORE (1:15-3:00)          올바른 방법, 비주얼 메타포 (초록 색조)
REFRAME (3:00-3:30)       더 큰 그림 — 줌아웃, 시스템 뷰
OUTRO_CTA (3:30-4:00)     Vee eureka + 구독 + 다음 에피소드
```

### 비주얼 스타일
- **2D flat vector** (Level 2-2.5, v3ct0r LoRA trigger)
- 80% 다이어그램/모션그래픽 + 20% Vee 리액션 컷 (1-2초씩)
- 나레이터 보이스오버 전용 — Vee는 절대 말하지 않음 (무언극)
- 배경: 다크 네이비 #0D1B2A, 캐릭터 팔레트: #FFD93D/#6D4C2F/#FDEBD0/#2D2D2D

### 기획 문서
| 경로 | 역할 |
|------|------|
| `systems/video/SERIES_BIBLE.md` | **SSOT** — 아이덴티티, 캐릭터, 포맷, 프로덕션 전체 |
| `systems/planning/11-concept-metaphor-library.md` | 소프트웨어 개념 → 비주얼 메타포 매핑 |
| `systems/video/planning/season1_episode_guide.md` | 시즌 1 EP01-10 상세 가이드 |

### 파이프라인
- `build_shot_manifest_from_prepro.py`: `visual_type`, `space`, `vee_expression`, `shorts_candidate` 필드
- `comfy_batch_render.py`: ComfyUI API 배치 렌더 (증분 캐시 + 재시도)
- `generate_kontext_keyframes.py`: Vee 캐릭터 일관성 (골든레퍼런스 기반 Kontext 편집)
- `generate_tts_simple.py`: 단일 나레이터 보이스 (Dia2-1B)

### 시즌 1 진행 상태
| EP | 제목 | 스크립트 | 매니페스트 | 렌더 |
|----|------|---------|-----------|------|
| 01 | "스펙이 뭔가?" | v3 리워크 중 | v6 | — |
| 02 | "왼팔이 28개" | v5 작성 | — | — |
| 03 | "벽 없는 아파트" | v5 작성 | — | — |
| 04 | "열기 무서운 상자" | v5 작성 | — | — |
| 05-10 | — | 기획 중 | — | — |

---

## Twitter 전략 (나이키 접근법)

| 문서 | 역할 |
|------|------|
| `systems/twitter/strategy/STRATEGY.md` | 전략 — 왜 하는가, 뭘 올리고, 어떻게 쓰고, 뭘 안 하는가 |
| `systems/twitter/strategy/REFERENCE.md` | 참고 — 알고리즘 팩트, 롤모델, 소재 아카이브, 금지 표현 |
| `systems/twitter/strategy/PLAYBOOK.md` | 실행 — 매일/매주 뭘 하는가, Phase 전환 기준 |
| `systems/twitter/archive/` | 이전 전략 문서 (00~05) 아카이브 |

---

## Twitter 자동 발행 시스템

### 아키텍처
```
일요일: Claude Code 배치 세션 → "이번 주 뭐 했지?" → queue/YYYY-wWW.json
평일:   GitHub Actions cron (30분) → twitter-api-v2로 발행 → 상태 업데이트
```

### 파일 구조
| 경로 | 역할 |
|------|------|
| `systems/twitter/automation/package.json` | `twitter-api-v2` 의존성 (블로그와 분리) |
| `systems/twitter/automation/post-queue.mjs` | 메인 스크립트 — 큐 읽기→발행→상태 업데이트 |
| `systems/twitter/automation/lib/twitter-client.mjs` | Twitter API v2 래퍼 |
| `systems/twitter/automation/lib/queue-manager.mjs` | 큐 파일 I/O, ISO 주차 계산, 15분 간격 안전장치 |
| `systems/twitter/queue/*.json` | 주간 큐 파일 (주차별 분리) |
| `.github/workflows/twitter-post.yml` | cron 30분 + workflow_dispatch (dry_run 지원) |
| `.github/workflows/twitter-analytics.yml` | 일간 06:00 UTC 분석 수집 cron |

### 실행 방법
```bash
cd systems/twitter/automation
npm run post:dry    # 드라이런
npm run post        # 실제 발행
```

### 큐 파일 상태 흐름
`draft` → `approved` → `posting` → `posted` / `partial` / `failed`

### GitHub Secrets (설정 완료)
`TWITTER_API_KEY`, `TWITTER_API_SECRET_KEY`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`

---

## Twitter/X MCP 연동 (Claude Code용)

- **패키지**: `@enescinar/twitter-mcp` (유저 레벨 MCP, `-s user`)
- **설정 방법**: `claude mcp add twitter -s user -e API_KEY=... -e API_SECRET_KEY=... -e ACCESS_TOKEN=... -e ACCESS_TOKEN_SECRET=... -- npx -y @enescinar/twitter-mcp`
- **AI Writers Workshop MCP**: `claude mcp add story-workshop -s user -- npx -y @angrysky56/ai-writers-workshop` (서사 및 아키타입 기반 스크립트 작성 지원)
- **주의**: `-e` 플래그는 반드시 `--` 앞에 (환경변수로 전달됨)

---

## 고급 도구 및 기술 로드맵

이 프로젝트는 다음 오픈소스 기술을 우선적으로 채택함:

### 1. 비디오 파이프라인 최적화
- **이미지 모델**: **Flux.1-dev GGUF** (T2I) + **Flux Kontext GGUF** (캐릭터 일관성 씬 편집)
- **영상 모델**: **Wan 2.2 MoE GGUF** (I2V)
- **캐릭터 일관성**: Flux Kontext가 primary (PuLID는 스타일 캐릭터에서 실패)
- **자동화**: `comfy_batch_render.py` — generic binding injection으로 모든 워크플로우 배치 렌더
- **검증**: `evaluate_renders.py`에 **PySceneDetect**를 통합하여 샷 전환 오류 및 "Bad Cut" 자동 감지.

### 2. 서사 및 브랜딩 전략
- **NCP (Narrative Context Protocol)**: `branding/storyform.json`을 SSOT로 사용하여 모든 에이전트가 동일한 테마와 아크를 유지.
- **Astro SEO**: Open Graph 및 Twitter 카드 자동화를 위해 `astro-seo` 활용.

---

## 스크립트 및 스토리보드 워크플로우

이 프로젝트는 다음 전문 스킬을 활용하여 운영됨:

| 스킬 | 핵심 역할 |
|------|----------|
| `ai-video-production-master` | 스크립트-투-비디오 파이프라인, LoRA 학습, 클라우드 GPU(Vast.ai) 오케스트레이션 |
| `media-processing` | FFmpeg/ImageMagick 기반 미디어 변환, 최적화, 스트리밍 매니페스트 생성 |
| `ffmpeg` | Remotion 호환 비디오 인코딩, GIF 변환, 플랫폼별(YouTube/Twitter) 최적화 |
| `web-design-guidelines` | 블로그 UI/UX 디자인 리뷰 및 접근성 감사 |

### 비디오 프로덕션 가이드라인
1. **접근 방식**: 교육용은 Stock Footage, 브랜드 자산은 I2V(ComfyUI) 선호.
2. **인코딩 표준**: `-movflags faststart -pix_fmt yuv420p` 필수 사용.
3. **해상도**: 홀수 픽셀 방지를 위해 `scale=trunc(iw/2)*2:trunc(ih/2)*2` 필터 적용.
4. **품질**: 프로덕션용은 CRF 18-22, 웹 프리뷰는 CRF 24-28 사용.

---

## 스크립트 및 스토리보드 워크플로우

이 프로젝트는 **Fountain** 포맷을 표준으로 사용하며, 모든 비디오 제작 전 스토리보드 단계를 거침.

### 1. Fountain 포맷 (.fountain)
- 모든 스크립트는 일반 텍스트 마크업인 Fountain 형식을 따름 (Git 관리에 최적화).
- `INT./EXT.` 헤더, 캐릭터 이름 대문자, 액션 중심의 서술.

### 2. 스토리보딩 (Shot List)
- 모든 스크립트 작성 후 `shots.json` 또는 상세 샷 리스트 생성 필수.
- **샷 유형**: WS(Wide), MS(Medium), CU(Close Up), POV 등 명시.
- **나이키 룰**: 대사보다 행동(Action) 위주로 구성. 설명하지 말고 보여줄 것.

### 3. 에이전트 스킬 활용
- `.agents/skills/script_storyboard_expert/` 스킬을 활성화하여 씬 설계 및 프롬프트 생성.

---

## 블로그 글쓰기 파이프라인

기존 블로그 포스트(blog-only/)를 원재료로 삼아 에디토리얼 시리즈(phase1/)로 변환하는 4단계 파이프라인.

### 파이프라인
```
blog-only/049.md + 050.md + ...   (원재료: 기존 블로그 포스트)
        ↓ /blog-plan
서사 구조 설계 (대화로 제시, 파일 생성 안 함)
        ↓ /blog-draft
phase1/actN-M-ko.md + actN-ko.md   (한국어)
        ↓ /blog-translate
phase1/en/actN-M-en.md + actN-en.md   (영어)
        ↓ /blog-check
검증 리포트 (PASS/FAIL/WARN)
```

### 스킬 (Agent Skills)
| 스킬 (Skill) | 파일 | 역할 |
|------|------|------|
| `blog_pipeline` | `.agents/skills/blog_pipeline/SKILL.md` | 블로그 서사 기획, 초안 작성, 영어 번역, 검열 수행 |
| `twitter_pipeline` | `.agents/skills/twitter_pipeline/SKILL.md` | 트위터 쓰레드 기획, 초안 작성, JSON 큐 적재, 검열 수행 |
| `branding_reviewer` | `.agents/skills/branding_reviewer/SKILL.md` | 브랜드 서사(3막) 및 보이스(나이키 룰) 품질 관리 |
| `content_multiplexer` | `.agents/skills/content_multiplexer/SKILL.md` | 블로그 → 멀티채널(Twitter+Video+Shorts) 일괄 변환 |
| `shorts_pipeline` | `.agents/skills/shorts_pipeline/SKILL.md` | 숏폼(TikTok/Reels/Shorts) 슬라이드 기획, 작성, 검증 |
| `video_production` | `.agents/skills/video_production/SKILL.md` | 비디오 프로덕션 워크플로우 (기획/리뷰/퍼블리싱) |

### 출력 구조
| 경로 | 내용 |
|------|------|
| `content/blog/phase1/actN-M-ko.md` | 개별 씬 (한국어) |
| `content/blog/phase1/actN-ko.md` | 압축본 (한국어, 전체를 한 파일로) |
| `content/blog/phase1/en/actN-M-en.md` | 개별 씬 (영어) |
| `content/blog/phase1/en/actN-en.md` | 압축본 (영어) |

### 현재 진행 상태 — Phase 1 완성 (40파일)

| Act | 테마 | 핵심 개념 | 파일 수 (KO+EN) |
|-----|------|----------|:--------------:|
| **1** | 스펙이 뭔지도 몰랐다 | 스펙의 필요성 | 10 |
| **2** | 스펙이 있으니까 끝인 줄 알았다 | SDD (Spec-Driven Dev) | 10 |
| **3** | 코드가 왜 꼬이는가 | DDD (Domain-Driven Design) | 10 |
| **4** | 맞는지 모르겠다 | TDD (Test-Driven Dev) | 10 |

- **서사 아크**: 짜증 → 스펙(뭘) → SDD(시스템) → DDD(어디에) → TDD(됐는지) → 자유
- **최종 선언**: "짜증이 스펙이 된다. 스펙이 시스템이 된다. 시스템이 자유가 된다."
- **소스**: blog-only/004~058 + 실제 MUSU/HiveLink 개발 경험
- **검증**: 전 Act 금지표현 0, 시간참조 0, 격식체 0, KO↔EN 구조 일치

### 핵심 규칙
- 시간 참조 금지 ("6개월", "X주" 등)
- "4줄 스펙" → "4가지 개념"
- voice.md 톤 SSOT — Bukowski 60% + Indie Hacker 30% + Product 10%
- 모드 A (싸지르기) 기본 — 한 문장 = 한 줄, 3-7단어 펀치
- 소재 겹침 방지 — 기존 Act에서 다룬 내용 재사용 금지

---

## 대본 (Screenplay) 프로세스

### 순서 (절대 뒤집지 않음)
1. 주제 정의 (`/screenplay-topic`) → 2. 스토리 설계 (`/screenplay-plan`) → 3. Fountain 집필 (`/screenplay-write`) → 4. 구조 검증 (`/screenplay-review`) → 5. TTS → 6. 렌더

### 주제 정의 원칙
- 주제 = 한 단어 (예: 스펙, 테스트, 도메인)
- 주제에서 3가지 (뭔지/없으면/있으면) → 자연스럽게 3막
- 블로그는 소재 창고. 순서대로 옮기는 거 아님. 3막 구조에 맞는 장면만 골라 쓴다.

### 핵심 스킬
| 스킬 | 역할 |
|------|------|
| `screenplay_writer` | 4단계 대본 작성 (topic→plan→write→review) + `craft-reference.md` (글쓰기 원칙 내장) |
| `validate_screenplay.py` | Fountain 자동 검증 (`python systems/video/pipeline/scripts/validate_screenplay.py --input FILE`) |

### 소재 인덱스
| 경로 | 내용 |
|------|------|
| `systems/video/preproduction/source_index.json` | EP별 소스+주제 매핑 (시리즈 바이블 연동) |
| `systems/video/preproduction/rag/` | 블로그 소재 RAG 인덱스 (`node scripts/query.mjs "키워드" --top=5`) |
| `content/blog/phase1/` | 정제된 소스 (Act 1-4, 25편 KO+EN) |
| `content/blog/blog-only/` | 원본 소스 (~50편) |
| `systems/planning/13-screenplay-pipeline-plan.md` | 대본 파이프라인 재정비 계획 문서 |

---

## 콘텐츠 분석 + 피드백 루프

### 아키텍처
```
Twitter API → queue/analytics/ → generate-report.mjs → reports/YYYY-wNN-report.json
                                                      → build-feedback-context.mjs → feedback-context.md
                                                                                        ↓
                                                                              twitter-plan, twitter-draft, /multiply
```

### 파일 구조
| 경로 | 역할 |
|------|------|
| `systems/analytics/generate-report.mjs` | 주간 성과 리포트 생성 (engagement rate, hook 랭킹) |
| `systems/analytics/build-feedback-context.mjs` | 최근 4주 리포트 → AI 읽기용 마크다운 |
| `systems/analytics/fetch-youtube-analytics.py` | YouTube Data API v3 채널 분석 수집 |
| `systems/analytics/update-publish-log.mjs` | `content/publish_log.json` 업데이트 헬퍼 |
| `systems/analytics/reports/` | 주간 리포트 JSON |
| `systems/analytics/youtube/` | YouTube 주간 메트릭 |
| `systems/analytics/feedback-context.md` | 스킬에서 읽는 성과 피드백 (자동 생성) |

### GitHub Actions
| 워크플로우 | 스케줄 |
|-----------|--------|
| `.github/workflows/twitter-analytics.yml` | 매일 06:00 UTC — 메트릭 수집 + 리포트 + 피드백 |
| `.github/workflows/weekly-report.yml` | 매주 일요일 08:00 UTC — 주간 리포트 + 피드백 |

---

## 비디오 파이프라인 (자동화 인프라)

### DAG 구조
```
blog.md
  ↓ prepro
prepro_manifest.json
  ├──► manifest (build_shot_manifest) ──► render (comfy_batch) ──► evaluate ──► package ──► upload
  └──► TTS (generate_tts) ──────────────────────────────────────┘ (VO merge)
```
- **manifest + TTS 병렬 실행** (asyncio.gather)
- `--stages prepro,tts` / `--resume-from render` 로 부분 실행 가능

### 핵심 스크립트
| 경로 | 역할 |
|------|------|
| `systems/video/pipeline/scripts/run_blog_to_video_pipeline.py` | 최상위 DAG orchestrator (asyncio) |
| `systems/video/pipeline/scripts/run_end_to_end_video_pipeline.py` | render→learn→evaluate→package 체인 |
| `systems/video/scripts/comfy_batch_render.py` | ComfyUI API 배치 렌더 (증분 캐시 + 재시도) |
| `systems/video/pipeline/scripts/evaluate_renders.py` | Vision QA (Gemini/OpenAI) + 품질 통계 |
| `systems/video/pipeline/scripts/package_for_youtube.py` | 패키징 + YouTube 업로드 (`--upload`) |
| `systems/video/pipeline/scripts/youtube_upload.py` | YouTube Data API v3 업로드 |
| `systems/video/pipeline/scripts/generate_tts_from_prepro.py` | TTS 생성 + actual_duration 피드백 |
| `systems/video/pipeline/scripts/pipeline_watcher.py` | watchdog 파일 감시 자동 트리거 |

### 증분 렌더링
- 각 샷 config → SHA256 해시 → `.render_cache.json`
- 해시 동일 + 파일 존재 → 스킵 (`status: "cached"`)
- `--force-render` 로 캐시 무시

### YouTube 업로드
- `pip install google-api-python-client google-auth-oauthlib`
- credentials: `~/.youtube_credentials.json` 또는 `--youtube-credentials`
- 기본 privacy: `unlisted` (안전)

---

## 도메인

- 블로그: **vibecode.town**
- 제품(MUSU): **musu.pro** — 별개 프로젝트

---

## Content Boss (자율 콘텐츠 운영)

### 아키텍처
```
Claude Code 세션:   소스 읽기 → 큐 JSON 작성 → auto-approve → 커밋 푸시
                    (몇 주치 미리 예약 가능)
평일:               twitter-post.yml (30분 cron) → approved 항목 자동 발행
매일 06:00 UTC:     twitter-analytics.yml → 메트릭 수집 → 리포트 + 피드백
일요일 08:00 UTC:   weekly-report.yml → feedback-context.md 갱신
```

### 운영 방법
1. Claude Code 세션에서 소스 콘텐츠 읽기 (`content/blog/phase1/en/`, `content/blog/book-source/`)
2. `systems/content-boss/prompts/twitter-system.md` 가이드에 따라 큐 JSON 직접 작성
3. `systems/twitter/queue/YYYY-wWW-{series}.json`에 저장
4. `node systems/content-boss/auto-approve.mjs`로 검증
5. 커밋 + 푸시 → twitter-post.yml cron이 예약 시간에 자동 발행

### 파일 구조
| 경로 | 역할 |
|------|------|
| `systems/content-boss/auto-approve.mjs` | 큐 아이템 자동 검증 (금지표현, 링크, 시간참조, 4줄) |
| `systems/content-boss/prompts/twitter-system.md` | Claude Code용 생성 가이드 (voice+narrative+strategy 핵심) |
| `systems/content-boss/logs/` | 에러 로그 |
| `systems/content-boss/package.json` | auto-approve 실행용 |

### 검증 규칙 (auto-approve.mjs)
1. 금지 표현: game-changer, deep dive, unpack, Furthermore, In conclusion, utilize, facilitate, leverage, "I think maybe", "I write about", "In this article"
2. 링크/CTA: http(s), .com/.town/.pro, "check out", "read more", "more at", "link in bio"
3. 시간 참조: "six months", "months ago", N months, N weeks
4. "4줄" 표현: "four lines", "4줄", "four-line"

---

## 상세페이지 자동화 키트 (퍼블리 투고용)

- 키트 루트: `systems/pitch/automation/`
- 마스터 프롬프트: `systems/pitch/automation/prompts/00_orchestrator.md`
- RAG 인덱스: `cd systems/pitch/automation/rag && node scripts/build_index.mjs`
- 검색: `node scripts/query.mjs "Hero 톤" --top=3`
