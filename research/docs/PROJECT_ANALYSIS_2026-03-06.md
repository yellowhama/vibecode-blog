# vibecode-blog 프로젝트 전체 분석 (2026-03-06)

## 0. 한 줄 요약

코딩 못하는 사람이 바이브 코딩으로 AI 런타임(MUSU)을 만들면서 겪는 경험을 **블로그 → 트위터 → 유튜브 → 책** 4채널로 퍼블리싱하는 원소스 멀티유즈 시스템.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 도메인 | **vibecode.town** (블로그), **musu.pro** (제품 — 별도 프로젝트) |
| 기술 스택 | Astro 5.16 + AstroPaper + Tailwind v4, Vercel 배포, Pagefind 검색, Giscus 댓글 |
| X 계정 | @lazy_genius2025 (X Premium) |
| 뉴스레터 | Beehiiv |
| 핵심 철학 | **나이키 룰** — 제품은 배경, 사람(경험)이 전경. 트윗에 링크/CTA 절대 안 넣음. |

---

## 2. 브랜딩 시스템 (`branding/`)

### 2.1 아이덴티티 (`BRAND.md`)

- **서사**: 코딩 모르는 사람이 컴퓨터 3대를 하나처럼 쓰고 싶어서 직접 만들기 시작.
- **3개 콘텐츠 기둥**: (1) 뭘 만들고 있나, (2) 뭐가 깨졌나, (3) 뭐가 짜증나나.
- **적(enemy)**: 싸구려 AI 강사, 프롬프트 공식 장사꾼, "5분만에 만들었다" 가짜 성취.
- **안티브랜드**: 트윗에 링크 없음, CTA 없음, 교훈 정리 없음, AI 뉴스 큐레이션 안 함.

### 2.2 보이스 (`voice.md`)

| 속성 | 규칙 |
|------|------|
| 톤 바닥 | 막걸리에 새우깡 (절대 격식체 안 됨) |
| 톤 천장 | 감튀에 맥주 (이 이상 올라가면 이 사람 아님) |
| 모드 A (기본) | 싸지르기 — 한 문장 = 한 줄, 3-7단어 펀치 |
| 모드 B | 각잡기 — 구조 있되 톤은 여전히 구어체 |
| 영어 포뮬러 | Bukowski 60% + Indie Hacker 30% + Product 10% |
| 문장 규칙 | 평균 8-15단어, 최대 25단어, 단락 1-3문장 |
| 금지 표현 | game-changer, deep dive, leverage, utilize, "누구나 쉽게", 수동태 남용 |
| 끝맺음 | 항상 선언문 — "짜증이 스펙이 된다." |

### 2.3 서사 구조 (`narrative.md`)

**3막 구조** (자연스럽게, 강제 아님):
1. **좌절** — 구체적 상황. "월요일 아침, 에이전트 5개 죽었다."
2. **혼돈** — 되는 줄 알았는데 새 문제 발생.
3. **발굴** — 일상 비유로 기술 설명. 엄마 옷장 = RAG. 다크소울 모닥불 = Git 커밋.

**트윗 구조 — 페르마 포맷**:
- 첫 번째 트윗 = 독립적으로 완결된 선언.
- 쓰레드 = 아래로 깊이 파는 구조.
- 하나의 아이디어를 3개 트윗에 쪼개지 않음.

### 2.4 비주얼 (`visual.md`)

| 요소 | 값 |
|------|-----|
| 메인 다크 | Cocoa Brown `#2D1D19` |
| 액센트 | Musu Yellow `#FFD166` |
| 배경 | Off-White `#FDFCF0` |
| 배분 | 60% Off-White / 30% Cocoa / 10% Yellow |
| 폰트 | Nunito 800 (디스플레이), Lora (본문), JetBrains Mono (코드) |
| 미감 | Soft Neobrutalism + Claymation |

---

## 3. 블로그 콘텐츠 (Track A)

### 3.1 원본 자산 (`content/blog/`)

| 경로 | 내용 | 수량 |
|------|------|------|
| `blog-only/000~058` | 한국어 블로그 원본 | ~59편 |
| `blog-only/en/` | 영문 번역 | 대응편 |
| `phase1/act1~act5` | FDD (Fury-Driven Development) 에디토리얼 시리즈 | KO/EN 각 25파일 |
| `book-source/` | 책 원안 소스 (섹션별 정리) | — |
| `archive/` | 리라이트 필요/보류 포스트 | ~12편 |

### 3.2 Phase 1 에디토리얼 시리즈 (FDD Diary)

| Act | 테마 | 핵심 개념 | FDD # |
|-----|------|----------|-------|
| 1 | 스펙이 뭔지도 몰랐다 | 4가지 기둥: 목적/이유/방법/수단 | FDD 1-6 |
| 2 | 스펙이 있으니까 끝인 줄 알았다 | SDD (Spec-Driven Dev) | FDD 7-12 |
| 3 | 코드가 왜 꼬이는가 | DDD (Domain-Driven Design) | FDD 13-18 |
| 4 | 맞는지 모르겠다 | TDD (Test-Driven Dev) | FDD 19-24 |
| 5 | 경험이 무기다 | XDD (Experience-Driven Dev) | FDD 25-30 |

**서사 아크**: 짜증 → 스펙(뭘) → SDD(시스템) → DDD(어디에) → TDD(됐는지) → 자유

### 3.3 품질 감사 (`QUALITY-AUDIT.md`)

- **전체 평균**: 7.3/10
- **S급 (즉시 발행)**: 047 (Claude Code 전제조건, 8.8점), 054 (바이브코딩 정의, 8.8점)
- **주의 사항**: 일부 포스트에 사실 오류(Codex CLI 귀속, WEF 통계 연도), 편집 잔해(AI 피드백 코멘트), 미공개 자사 제품 언급(MUSU/HiveLink)

### 3.4 블로그 글쓰기 파이프라인

```
blog-only/049.md + 050.md + ...     (원재료)
        ↓ blog-plan
서사 구조 설계 (3막)
        ↓ blog-draft
phase1/actN-M-ko.md                 (한국어 초안)
        ↓ blog-translate
phase1/en/actN-M-en.md              (영어 번역)
        ↓ blog-check
검증 리포트 (PASS/FAIL/WARN)
```

**핵심 규칙**:
- 시간 참조 금지 ("6개월", "X주")
- voice.md 톤 SSOT 준수
- 소재 겹침 방지 (기존 Act 내용 재사용 금지)
- 발행 전 유저 승인 필수

---

## 4. 트위터 자동화 (Track B)

### 4.1 전략 (`twitter/STRATEGY.md`)

- **목적**: MUSU 런칭 전 신뢰 자산 축적. 수익 채널 아님.
- **2단계**: Phase 1 (지금) = 씨 뿌리기, Phase 2 (런칭 후) = Build in Public
- **알고리즘 인사이트**: 답글 가중치 = 좋아요의 13.5배. 답글+재답글 = 75.0.
- **일일 루틴**: 답글 10-20개 (AI agent, vibe coding, MCP, Claude 검색), 타임라인 15분
- **주간 루틴**: 일요일 배치 — git log → 필터 → 초안 → 승인 → 큐 JSON 적재

### 4.2 자동 발행 아키텍처

```
일요일:  Claude Code 배치 세션
         → "이번 주 뭐 했지?"
         → content/twitter_queue/YYYY-wWW.json

평일:    GitHub Actions cron (30분 간격)
         → scripts/twitter/post-queue.mjs
         → twitter-api-v2로 발행
         → 큐 파일 상태 업데이트 (posted/failed)
         → git commit + push (봇 커밋)
```

### 4.3 큐 파일 구조 (`content/twitter_queue/`)

```json
{
  "series": "Fury-Driven Development Diary",
  "week": "2026-w10",
  "items": [
    {
      "id": "w10-act1-001",
      "type": "thread",
      "scheduledAt": "2026-03-02T14:10:00Z",
      "status": "posted",           // draft → approved → posting → posted/failed
      "tweets": ["첫 번째 트윗", "두 번째...", ...],
      "postedIds": ["1896..."],
      "postedAt": "2026-03-02T14:10:00Z"
    }
  ]
}
```

- **상태 흐름**: `draft` → `approved` → `posting` → `posted` / `partial` / `failed`
- **안전장치**: 연속 포스팅 15분 최소 간격, 280자 제한 검증, 쓰레드 간 2초 딜레이
- **현재 큐**: W10~W19 (10주분, 2026년 3~5월) 생성 완료

### 4.4 핵심 코드

| 파일 | 역할 |
|------|------|
| `scripts/twitter/post-queue.mjs` | 메인 — 큐 읽기 → 발행 → 상태 업데이트 |
| `scripts/twitter/lib/twitter-client.mjs` | twitter-api-v2 래퍼 (OAuth 1.0a) |
| `scripts/twitter/lib/queue-manager.mjs` | 큐 파일 I/O, ISO 주차 계산, 15분 간격 안전장치 |
| `.github/workflows/twitter-post.yml` | cron 30분 + workflow_dispatch (dry_run 지원) |

### 4.5 MCP 연동

- **패키지**: `@enescinar/twitter-mcp` (유저 레벨 MCP)
- **도구**: `mcp__twitter__post_tweet`, `mcp__twitter__search_tweets` 등
- Claude Code 세션에서 직접 트윗 작성/검색 가능

---

## 5. 영상 제작 + 유튜브 (Track C)

### 5.1 비주얼 컨셉

| 속성 | 내용 |
|------|------|
| 스타일 | **Skeptical Claymation × Whiteboard Flow** |
| 참고 | Aardman 스톱모션 질감 |
| 배경 | 광활한 빈 Off-White (`#FDFCF0`) 공간 |
| 캐릭터 | 통통하고 피곤한 노란 얼굴 찰흙 피규어, 코코아 브라운 후디 |
| 소리 | **비언어(Non-lingual)** — 미니언즈/스톱모션 스타일 끙끙/삑삑/주전자 소리 |
| 내레이션 | 외부 VO가 브랜드 톤으로 깔림 |

### 5.2 제작 파이프라인 (3단계)

```
━━━ Stage 1: 기획 (Agent Skills) ━━━

블로그 포스트 (.md)
  → video_concept_writer     → 컨셉 스크립트 + 비주얼 메타포
  → video_storyboard_planner → 샷별 스토리보드 [Shot X.Y - T2I/I2V]
  → comfyui_video_pipeline   → ComfyUI 샷 매니페스트 JSON

━━━ Stage 2: 프로덕션 (Python + ComfyUI) ━━━

run_blog_to_video_pipeline.py (최상위 오케스트레이터)
  ├── build_blog_to_video_prepro.py      블로그 → 구조화된 프리프로 JSON
  ├── build_shot_manifest_from_prepro.py  프리프로 → 샷 매니페스트 (최대 24샷)
  ├── generate_tts_from_prepro.py         TTS 합성 (edge/xtts/mms 백엔드)
  └── audio_postprocess.py               loudnorm 2-pass, 무음 트림

run_end_to_end_video_pipeline.py (2차 오케스트레이터)
  ├── sync_manifest_keyframes_to_comfy_input.py  키프레임 → ComfyUI input 동기화
  ├── comfy_batch_render.py              ComfyUI API (T2I → I2V)
  └── evaluate_renders.py               QA + 학습 분석

━━━ Stage 3: 패키징 ━━━

package_for_youtube.py
  ├── 최종 mp4 (연결 + BGM/VO 믹스)
  ├── 30초 티저
  ├── 썸네일 (중간 프레임)
  ├── youtube_metadata.json (제목/설명/태그/챕터)
  └── 업로드 체크리스트
```

### 5.3 렌더링 현황

- **모델**: HunyuanVideo (C-v2) 기준선 확정 — `steps=20`, `cfg=1.0`, `--detach`
- **Act1 Scene 1-2**: 전체 배치 통과 (5/5 ok)
- **TTS**: 한국어 스모크 테스트 완료, edge/xtts/mms 3개 백엔드 추상화 완료
- **오디오 후처리**: loudnorm, 무음 트림, 크로스페이드 — 전부 구현 완료
- **출력**: `content/video/output/renders/` — 35개 렌더 런 디렉토리 존재

### 5.4 핵심 제약 사항

- **T2V 금지**: 내러티브 샷은 반드시 T2I → I2V 파이프라인 사용 (IP-Adapter/FaceID 컨디셔닝)
- **텍스트 금지**: 모든 프롬프트에 `NO TEXT, NO LETTERS, NO SPEECH BUBBLES` 필수
- **샷 길이**: 2-3초 서브클립으로 분할 (할루시네이션 방지) → 후반 스티칭
- **FPS**: 12-15fps 스톱모션 느낌, RIFE 프레임 보간은 카메라 무브에만

---

## 6. Agent Skill 시스템 (`.agents/skills/`)

| 스킬 | 파일 | 역할 |
|------|------|------|
| `blog_pipeline` | `.agents/skills/blog_pipeline/SKILL.md` | 블로그 서사 기획 → 초안 → 번역 → 검열 |
| `twitter_pipeline` | `.agents/skills/twitter_pipeline/SKILL.md` | 트위터 쓰레드 기획 → 초안 → JSON 큐 적재 → 검열 |
| `branding_reviewer` | `.agents/skills/branding_reviewer/SKILL.md` | 브랜드/보이스/나이키 룰 품질 관리 게이트 |
| `video_concept_writer` | `.agents/skills/video_concept_writer/SKILL.md` | 블로그 → 비디오 컨셉 스크립트 (VO + 비주얼 메타포) |
| `video_storyboard_planner` | `.agents/skills/video_storyboard_planner/SKILL.md` | 컨셉 → 샷별 스토리보드 (T2I/I2V 분리) |
| `comfyui_video_pipeline` | `.agents/skills/comfyui_video_pipeline/SKILL.md` | 스토리보드 → ComfyUI 샷 매니페스트 JSON |

**흐름**: `blog_pipeline` 또는 `twitter_pipeline`이 콘텐츠 생성 → `branding_reviewer`가 품질 게이트 → `video_*` 3개 스킬이 순차적으로 영상 자산 생성

---

## 7. 책 프로젝트 (`docs/book-structure-v2.md`)

| 항목 | 내용 |
|------|------|
| 제목 후보 | "짜증이 스펙이다" — AI 시대, 코딩 못하는 사람의 통제 전략 |
| 타겟 독자 | 코딩 못하지만 AI로 뭔가 만들고 싶은 사람, 계속 실패하는 사람 |
| 약속 | 읽고 나면 AI를 지시, 제한, 검색, 필터링할 수 있다 |
| 분량 | ~20만자 (A5 350-400쪽) |
| 신규 비율 | 평균 55% 새 콘텐츠 (45% 블로그 기반 3-4배 확장) |

**구조 (20장)**:
```
선언문:   바이브코딩 1.0은 끝났다. 통제가 시작된다.
Part 1:   통제 상실 — "왜 실패하는가?" (Ch.1-3)
Part 2:   통제① 결정 — "뭘 만들지?" (Ch.4-6)
Part 3:   통제② 구조 — "어떻게 잠그지?" (Ch.7-9)
Part 4:   통제③ 검색 — "어떻게 찾지?" (Ch.10-12)
Part 5:   통제④ 신뢰 — "뭘 먼저 믿지?" (Ch.13-15)
Part 6:   종합 — "짜증에서 제품까지" (Ch.16-17)
부록:     AI 7대 구성요소, 언어 선택 가이드
```

---

## 8. 수익 모델 & 로드맵 (`blog-research/`)

### 8.1 수익 사다리 (6단계)

1. **무료 블로그 + 뉴스레터** → 신뢰 구축
2. **유튜브** → 디스커버리 엔진
3. **스폰서십** (10K+ 구독자)
4. **디지털 제품** ($29 ebook → $99 미니코스 → $299 풀코스)
5. **커뮤니티** (Discord)
6. **코호트 워크숍** ($499-$999)

### 8.2 12개월 타임라인

| 기간 | 목표 |
|------|------|
| 사전 준비 (2주) | 스택 세팅, 초기 콘텐츠 5편 |
| Month 1-3 | 100-200 구독자, 주간 발행 리듬 |
| Month 4-6 | 200-500 구독자, 트위터 성장 |
| Month 7-12 | 500-1,000 구독자, 첫 유료 제품 |

### 8.3 트위터 성장 전략

- **Phase 1→2 전환 조건**: MUSU 런칭, 200+ 팔로워, 실제 지표 공유 가능
- **핵심 지표**: 팔로워 수보다 답글 볼륨 (27배 가중치)
- **일일 시간 예산**: 최대 1시간

---

## 9. 멀티채널 퍼블리싱 전체 상태 (2026-03-06 기준)

### 완료

| 트랙 | 상태 | 상세 |
|------|------|------|
| 블로그 원고 | ✅ | Phase1 Act1-5 KO/EN 50파일, blog-only 59편 |
| 트위터 큐 | ✅ | W10-W19 (10주분) JSON 생성 완료 |
| 트위터 자동발행 | ✅ | GitHub Actions cron 운영 중, 첫 쓰레드 2026-03-02 발행 |
| 비디오 TTS | ✅ | edge/xtts/mms 3백엔드, loudnorm, 무음 트림 |
| 비디오 렌더 기준선 | ✅ | HunyuanVideo C-v2, Act1 Scene1-2 배치 통과 |
| 브랜딩 SSOT | ✅ | 6개 문서 (BRAND/voice/narrative/examples/platforms/visual) |
| 에이전트 스킬 | ✅ | 6개 스킬 파이프라인 정의 |

### 진행 중

| 트랙 | 상태 | 상세 |
|------|------|------|
| 비디오 Scene3+ 렌더 | 🔄 | Act1 전체 편집본 미완성 |
| 품질업 실험 | 🔄 | steps/cfg 단일변수 실험 진행 중 |

### 미완료

| 트랙 | 상태 | 필요 작업 |
|------|------|----------|
| 블로그 실제 발행 | ❌ | Astro 빌드/배포 → Vercel, 게시 URL 로그 체계 |
| 유튜브 업로드 체인 | ❌ | 편집, 자막, 썸네일, 메타데이터, 업로드 자동화 |
| 뉴스레터 운영 루프 | ❌ | Beehiiv 발행 리듬 미확정 |
| 책 집필 | ❌ | 구조만 확정, 본문 집필 미시작 |

---

## 10. 다음 실행 권장 순서

1. **Act1 영상 완성** — Scene3+ 렌더 → 전체 Act1 편집본
2. **유튜브 패키지 고정** — title/description/tags/thumbnail/chapters 템플릿
3. **블로그 첫 발행** — Phase1 Act1 게시, Vercel 빌드 확인, URL 로그 체계
4. **블로그↔트위터 연결** — 게시 URL을 쓰레드 마지막 트윗에 자동 삽입
5. **주간 운영 리포트** — 게시 수, 조회, CTR, 완주율 주차별 기록
6. **뉴스레터 시작** — Beehiiv "이번 주는 이랬다" 톤, 블로그 요약이 아닌 독립 콘텐츠

---

## 부록 A. 파일 구조 요약

```
vibecode-blog/
├── branding/                      # 브랜드 SSOT (6개 문서)
│   ├── BRAND.md                   #   마스터 아이덴티티
│   ├── voice.md                   #   보이스 규칙
│   ├── narrative.md               #   3막 서사 구조
│   ├── examples.md                #   좋은/나쁜 예시
│   ├── platforms.md               #   플랫폼별 톤 규칙
│   └── visual.md                  #   시각 아이덴티티
├── content/
│   ├── blog/
│   │   ├── blog-only/             # 원본 블로그 59편 (KO + EN)
│   │   ├── phase1/                # FDD 에디토리얼 시리즈 (Act1-5, KO + EN)
│   │   ├── book-source/           # 책 원안 소스
│   │   ├── archive/               # 보류/리라이트 대상
│   │   ├── CATALOG.md             # 전체 카탈로그
│   │   └── QUALITY-AUDIT.md       # 품질 감사 리포트
│   ├── twitter_queue/             # 주차별 발행 큐 JSON (W10-W19)
│   └── video/
│       ├── planning/              # 스토리보드, 비주얼 가이드, 프롬프트
│       ├── pipeline/scripts/      # Python 자동화 스크립트 (15개+)
│       └── output/                # 렌더 결과물, 유튜브 패키지
├── twitter/                       # 트위터 전략 문서 (STRATEGY/PLAYBOOK/REFERENCE)
├── scripts/
│   ├── twitter/                   # 발행 자동화 (post-queue.mjs + libs)
│   └── pitch_automation/          # 퍼블리 투고용 상세페이지 자동화
├── blog-research/                 # 전략 리서치 11편
├── docs/                          # 책 구조, 기술 결정 문서
├── .agents/skills/                # 에이전트 스킬 6개
└── .github/workflows/
    └── twitter-post.yml           # 30분 cron 자동 발행
```

## 부록 B. 기술 의존성

| 도구 | 용도 |
|------|------|
| Astro 5.16 + AstroPaper | 블로그 SSG |
| Vercel | 블로그 배포 |
| twitter-api-v2 | 트위터 자동 발행 |
| @enescinar/twitter-mcp | Claude Code → 트위터 직접 연동 |
| GitHub Actions | 30분 cron 발행 + 큐 상태 커밋 |
| ComfyUI + HunyuanVideo | AI 영상 생성 (T2I → I2V) |
| edge-tts / XTTS / MMS | TTS 합성 (3백엔드 추상화) |
| ffmpeg | 오디오 후처리 (loudnorm, 트림) |
| Beehiiv | 뉴스레터 |
| Giscus | 블로그 댓글 (GitHub Discussions) |
| Pagefind | 블로그 검색 |
