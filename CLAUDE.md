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
| `docs/voice/character.md` | 원본 보존. SSOT는 `branding/voice.md` |
| `docs/translation-guide.md` | 원본 보존. SSOT는 `branding/voice.md` |

---

## 블로그 콘텐츠 위치

| 경로 | 내용 |
|------|------|
| `easy_peasy/blog-only/` | 한국어 블로그 원본 ~47편 |
| `easy_peasy/blog-only/en/` | 영문 번역 |
| `easy_peasy/book-source/` | 책 원안 소스 (섹션별 정리) |
| `docs/book-structure-v2.md` | 새 책 목차 v2 |
| `blog-research/` | 블로그 전략 리서치 (인덱스: `00-INDEX.md`) |
| `publy_april_pitch/` | 퍼블리 투고 준비 + 상세페이지 자동화 키트 |

---

## Twitter 전략 (나이키 접근법)

| 문서 | 역할 |
|------|------|
| `twitter/STRATEGY.md` | 전략 — 왜 하는가, 뭘 올리고, 어떻게 쓰고, 뭘 안 하는가 |
| `twitter/REFERENCE.md` | 참고 — 알고리즘 팩트, 롤모델, 소재 아카이브, 금지 표현 |
| `twitter/PLAYBOOK.md` | 실행 — 매일/매주 뭘 하는가, Phase 전환 기준 |
| `twitter/archive/` | 이전 전략 문서 (00~05) 아카이브 |

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
| `twitter/package.json` | `twitter-api-v2` 의존성 (블로그와 분리) |
| `twitter/scripts/post-queue.mjs` | 메인 스크립트 — 큐 읽기→발행→상태 업데이트 |
| `twitter/scripts/lib/twitter-client.mjs` | Twitter API v2 래퍼 |
| `twitter/scripts/lib/queue-manager.mjs` | 큐 파일 I/O, ISO 주차 계산, 15분 간격 안전장치 |
| `twitter/queue/*.json` | 주간 큐 파일 (주차별 분리) |
| `.github/workflows/twitter-post.yml` | cron 30분 + workflow_dispatch (dry_run 지원) |

### 실행 방법
```bash
cd twitter
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
- **주의**: `-e` 플래그는 반드시 `--` 앞에 (환경변수로 전달됨)
- **X 계정**: @lazy_genius2025
- **사용 가능 도구**: `mcp__twitter__post_tweet`, `mcp__twitter__search_tweets` 등

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

### 스킬 파일
| 스킬 | 파일 | 역할 |
|------|------|------|
| `/blog-plan` | `.claude/commands/blog-plan.md` | 소스 분석 → Act/씬 서사 구조 설계 |
| `/blog-draft` | `.claude/commands/blog-draft.md` | 설계 기반 한국어 글쓰기 |
| `/blog-translate` | `.claude/commands/blog-translate.md` | KO → EN 번역 (voice.md 톤 유지) |
| `/blog-check` | `.claude/commands/blog-check.md` | 10가지 검증 리포트 |

### 출력 구조
| 경로 | 내용 |
|------|------|
| `easy_peasy/phase1/actN-M-ko.md` | 개별 씬 (한국어) |
| `easy_peasy/phase1/actN-ko.md` | 압축본 (한국어, 전체를 한 파일로) |
| `easy_peasy/phase1/en/actN-M-en.md` | 개별 씬 (영어) |
| `easy_peasy/phase1/en/actN-en.md` | 압축본 (영어) |

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

## 도메인

- 블로그: **vibecode.town**
- 제품(MUSU): **musu.pro** — 별개 프로젝트

---

## 상세페이지 자동화 키트 (퍼블리 투고용)

- 키트 루트: `publy_april_pitch/automation_kit/`
- 마스터 프롬프트: `publy_april_pitch/automation_kit/prompts/00_orchestrator.md`
- RAG 인덱스: `cd publy_april_pitch/automation_kit/rag && node scripts/build_index.mjs`
- 검색: `node scripts/query.mjs "Hero 톤" --top=3`
