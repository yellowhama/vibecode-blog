# 콘텐츠 자동화 고도화 딥리서치 (2026-03-06)

## 0. 핵심 결론

현재 vibecode-blog 파이프라인은 이미 **상위 10% 수준의 자동화 인프라**를 갖추고 있다.
부족한 건 도구가 아니라 **마지막 1마일 연결**(블로그 발행 루프, 유튜브 업로드, 뉴스레터 발송)과 **피드백 루프**(성과 수집 → 다음 콘텐츠 반영).

아래는 **현재 시스템 기준으로 즉시 적용 가능한 업그레이드**를 우선순위로 정리한 문서다.

---

## 1. 블로그 발행 자동화

### 1.1 현재 상태 vs 목표

| 현재 | 목표 |
|------|------|
| Astro + Vercel 배포 구조 있음 | git push → 자동 빌드 → 자동 발행 루프 완성 |
| phase1 원고 50파일 완성 | 예약 발행 (publishDate 기반 자동 노출) |
| 수동 빌드/확인 | QA 게이트 → 자동 빌드 → URL 로그 기록 |

### 1.2 즉시 적용: 예약 발행 시스템

**패턴**: Astro Content Collections `publishDate` + GitHub Actions cron → Vercel Deploy Hook

```yaml
# .github/workflows/scheduled-publish.yml
name: Scheduled Blog Publish
on:
  schedule:
    - cron: '0 9 * * *'  # 매일 오전 9시 (KST 18:00)
  workflow_dispatch: {}

jobs:
  trigger-rebuild:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK_URL }}"
```

Astro에서 `publishDate <= now()` 필터링만 하면, 매일 cron이 빌드 트리거 → 해당 날짜의 글이 자동 노출.

**참고**: Vercel Deploy Hooks — `Settings > Git > Deploy Hooks`에서 URL 생성. 무료.

### 1.3 SEO 자동화

| 영역 | 방법 | 비용 |
|------|------|------|
| 메타 태그 | Astro 빌드 타임에 frontmatter → `<meta>` + OG 자동 생성 | 무료 |
| JSON-LD | 컴포넌트에서 frontmatter → `<script type="application/ld+json">` 자동 생성 | 무료 |
| 사이트맵 | `@astrojs/sitemap` (이미 설치됨) | 무료 |
| 내부 링크 | 빌드 시 관련 포스트 자동 추천 (태그/카테고리 기반) | 무료 |

### 1.4 뉴스레터 연동

**현재 스택**: Beehiiv

| 방법 | 난이도 | 비용 |
|------|--------|------|
| RSS → Beehiiv 자동 발송 | 낮음 | 무료 (Beehiiv 기본 기능) |
| Beehiiv API (프로그래매틱 포스트 생성) | 높음 | Enterprise 전용 (베타) |
| Zapier/Make 트리거 (새 글 → Beehiiv 초안) | 중간 | $20-50/mo |
| **RSS-to-Email** (Beehiiv Automations) | **낮음** | **무료** |

**권장**: RSS-to-Email이 가장 현실적. 블로그 RSS 피드에 새 글 → Beehiiv가 자동으로 뉴스레터 생성+발송. 인간 개입 최소.

**대안 스택**: Ghost (CMS + 뉴스레터 + 멤버십 통합). Admin API로 프로그래매틱 발행 가능. 자체 호스팅 무료. n8n 연동 템플릿 존재.

---

## 2. 트위터/X 자동화 고도화

### 2.1 현재 상태 vs 개선점

| 현재 | 개선 가능 |
|------|----------|
| GitHub Actions 30분 cron 발행 ✅ | 성과 피드백 루프 없음 |
| twitter-api-v2 직접 사용 ✅ | 에버그린 재활용 없음 |
| JSON 큐 기반 상태 관리 ✅ | 답글 자동화 없음 |

### 2.2 X API 비용 현실 (2026년 3월)

| 티어 | 가격 | 읽기 | 쓰기 | 적합 |
|------|------|------|------|------|
| Free | $0 | ~1/일 | 1,500/월 | 발행 전용 봇 |
| Basic | **$200/월** | 15,000/월 | 50,000/월 | 분석 포함 자동화 |
| Pro | $5,000/월 | 1M/월 | 300,000/월 | 데이터 사업 |
| Pay-Per-Use | 크레딧제 | 변동 | 변동 | 간헐적 사용 |

**현재 시스템은 Free 티어로 충분** (발행만 하므로). 성과 피드백 루프 추가 시 Basic ($200/월) 필요.

**절감 대안**: twitterapi.io (비공식, 90-95% 절감) 또는 Apify (스크래핑 기반, 95% 절감).

### 2.3 성과 피드백 루프 추가

```
발행 후 48시간 → X API로 engagement 조회 →
  score = (likes + retweets×2 + replies×3) / impressions →
  score > 임계값 → 에버그린 큐에 추가 (재활용 대상) →
  score < 임계값 → 아카이브 + 리라이트 태그
```

GitHub Actions에 주 1회 cron으로 성과 수집 → `content/twitter_queue/analytics/` JSON 기록.

### 2.4 도구 비교 (필요 시)

| 도구 | 가격 | 핵심 기능 | 현재 시스템 대비 이점 |
|------|------|----------|---------------------|
| Tweet Hunter | $29-200/mo | AI 생성, 자동 DM, 자동 플러그, CRM | 성장 자동화 최강 |
| Typefully | $13-80/mo | 깔끔한 쓰레드 에디터, 분석 | 글쓰기 UX |
| Hypefury | $24-58/mo | 에버그린 재활용, 자동 리포스트 | 재활용 자동화 |
| **현재 시스템** | **$0** | **JSON 큐 + GitHub Actions** | **최대 통제권** |

**판단**: 현재 시스템이 이미 강력. 200+ 팔로워 도달 전까지 도구 추가 불필요. 팔로워 성장 후 Tweet Hunter ($29/mo) 검토.

### 2.5 Build-in-Public 자동화

**BuiltPublic** (builtpublic.com): GitHub 커밋 → AI가 사람 읽기 좋은 소셜 포스트로 변환 → X/LinkedIn 자동 게시.

**DIY 패턴** (현재 시스템 확장):
```
git log --since="1 week ago" → Claude API → 주간 하이라이트 트윗 생성 → 큐 적재
```
일요일 배치 세션에 이미 하고 있는 것의 자동화 버전.

---

## 3. 영상 제작 + 유튜브 자동화

### 3.1 AI 영상 모델 현황 (2026년 3월)

| 모델 | 출처 | 특징 | 비용 | 적합도 |
|------|------|------|------|--------|
| **Wan 2.2** | 알리바바 | Apache 2.0, MoE, VBench 86.22%, ComfyUI 네이티브 | 무료 (로컬) | ★★★★★ |
| HunyuanVideo 1.5 | 텐센트 | I2V 특화, Avatar 변형, 4090에서 480p ~75초 | 무료 (로컬) | ★★★★ |
| Veo 3.1 | 구글 | 최고 품질 + 오디오 동시 생성, API만 | API 크레딧 | ★★★ |
| Kling 2.6 | 쾌수 | 오디오+비주얼 동시, 대량 생산 최적화 | API 크레딧 | ★★★ |
| Runway Gen-4 | Runway | 시네마틱 최고, API만 | $15-76/mo | ★★★ |

**권장 업그레이드**: 현재 HunyuanVideo → **Wan 2.2 (14B) 테스트**. Apache 2.0, ComfyUI 네이티브 지원, VBench 점수 Sora 초과. 4090에서 720p 24fps 가능.

- GitHub: `github.com/Wan-Video/Wan2.2`
- ComfyUI 가이드: apatero.com/blog/wan-2-2-comfyui-complete-guide

### 3.2 TTS 한국어 품질 순위 (2026년 3월)

| 순위 | 엔진 | 한국어 품질 | 비용 | 지연시간 |
|------|------|-----------|------|---------|
| 1 | **ElevenLabs** | 최상 (보이스 클론) | $5-330/mo | 75ms |
| 2 | **CosyVoice 3** | 상 (2,200시간 KO 학습) | 무료 (로컬) | 150ms |
| 3 | XTTS-v2 | 중상 (제로샷 클론) | 무료 (로컬) | 중간 |
| 4 | Kokoro-82M | 중 (영어 >> 한국어) | 무료 (로컬) | <0.3초 |
| 5 | edge-tts | 중하 (합성 티 남) | 무료 | 빠름 |

**권장 업그레이드**: 현재 edge-tts 기본 → **CosyVoice 3 추가**. 알리바바 FunAudio, 한국어 2,200시간 학습, 150ms 지연. 9개 언어 지원.

- GitHub: `github.com/FunAudioLLM/CosyVoice`
- 현재 TTS 3백엔드 추상화에 4번째 백엔드로 추가 가능

**통합 도구**: `github.com/abus-aikorea/voice-pro` — 한국인 개발자, Gradio WebUI, edge-tts/Kokoro/F5-TTS/CosyVoice 통합.

### 3.3 유튜브 업로드 자동화

**YouTube Data API v3 핵심**:

| 항목 | 값 |
|------|-----|
| 일일 쿼터 | 10,000 유닛 |
| 동영상 업로드 | 1,600 유닛 → 최대 6개/일 |
| 썸네일 업로드 | `thumbnails.set`, 최대 2MB |
| 인증 | OAuth 2.0 필수 (API 키 불가) |

**자동 업로드 파이프라인**:

```
[최종 MP4] + [메타데이터 JSON]
       ↓
[YouTube Data API v3]
  ├── videos.insert (재개 가능 업로드)
  ├── thumbnails.set
  └── videos.update (챕터 마커 = description 타임스탬프)
       ↓
[URL 기록] → content/video/output/youtube_log.json
```

**n8n 템플릿** (즉시 사용 가능):
- `n8n.io/workflows/3900` — YouTube 예약 업로드 + AI 메타데이터 생성
- `n8n.io/workflows/4846` — Veo3 → Google Drive → YouTube 전체 체인

### 3.4 썸네일 자동 생성

| 방법 | 적합도 | 비용 |
|------|--------|------|
| Pillow (Python) 프로그래매틱 | 대량 생산, 템플릿 기반 | 무료 |
| YouTube 네이티브 A/B 테스트 | 3개 썸네일 자동 로테이션, CTR 측정 | 무료 |
| ThumbLab AI | 10-20개 변형/분, 20-50% CTR 향상 | 유료 |

**권장**: Pillow 템플릿 기반 생성 (현재 비주얼 가이드의 Cocoa Brown + Musu Yellow 팔레트 자동 적용) + YouTube 네이티브 A/B 테스트.

### 3.5 챕터 마커 자동화

| 도구 | 방법 | 비용 |
|------|------|------|
| TimeSkip.io | 크롬 확장, 1시간 영상 5초 | 유료 |
| Gling AI | 트랜스크립트 기반 | 유료 |
| **자체 파이프라인** | 프리프로 JSON의 segment 타임스탬프 → description 포맷 | **무료** |

**권장**: 이미 `build_shot_manifest_from_prepro.py`에서 세그먼트 타임스탬프를 생성하므로, 이를 YouTube description의 챕터 포맷(`MM:SS - 제목`)으로 변환하는 스크립트만 추가.

### 3.6 자막 자동화

```
WhisperX (word-level 타임스탬프 + 화자 분리)
  → .srt / .ass 출력
  → FFmpeg 번인: ffmpeg -vf "subtitles=captions.ass" output.mp4
```

WhisperX: 95%+ 정확도 (YouTube 네이티브 60-70% 대비).
한국어: `--language ko` 플래그.

### 3.7 Shorts 자동 클리핑

| 도구 | 가격 | 핵심 |
|------|------|------|
| OpusClip | 무료 60분/월, Pro $29/mo | AI 바이럴리티 점수, 자동 자막 |
| Klap | 유료 | 다국어 더빙 |
| **FFmpeg 직접** | 무료 | 하이라이트 구간 수동 지정 후 자동 크롭 |

---

## 4. 멀티채널 오케스트레이션

### 4.1 현재 아키텍처 vs 목표

```
현재:
  블로그 원고 → [수동] → 블로그 발행
  블로그 원고 → [Agent Skill] → 트위터 큐 → [GitHub Actions] → X 발행
  블로그 원고 → [Agent Skill] → 영상 기획 → [Python] → 영상 렌더 → [수동] → 유튜브

목표:
  블로그 원고 → [자동] → 블로그 발행 (예약)
                ↓
         [자동 트리거]
           ├── 트위터 큐 자동 적재 + 발행
           ├── 뉴스레터 자동 발송 (RSS)
           ├── 영상 파이프라인 트리거
           └── 성과 수집 → 피드백 루프
```

### 4.2 오케스트레이션 도구 비교

| 도구 | 가격 | 장점 | 단점 |
|------|------|------|------|
| **n8n (자체 호스팅)** | $5-10/mo (VPS) | 무제한 워크플로, LangChain 70+ 노드, X 연동 | 셋업 필요 |
| **현재 시스템 (GitHub Actions)** | $0 | 이미 운영 중, git 네이티브 | 복잡한 분기 어려움 |
| Make.com | $9-34/mo | 비주얼 빌더 | **X 연동 2025.5월 폐기** |
| Zapier | $20+/mo | 쉬움 | X 사용량 과금, 비쌈 |

**권장**: 현재 GitHub Actions 유지 + 복잡한 워크플로는 n8n 자체 호스팅 추가.

**주의**: Make.com은 2025년 5월 X(Twitter) 연동을 공식 폐기함. Zapier는 사용량 과금. n8n이 개발자에게 가장 현실적.

### 4.3 멀티 플랫폼 API 레이어

**Ayrshare** (ayrshare.com): 단일 API로 X, Instagram, TikTok, LinkedIn, YouTube 등 13개 플랫폼 동시 포스팅.

```javascript
// 한 번의 API 호출로 X + LinkedIn + Instagram 동시 포스팅
const response = await ayrshare.post({
  post: "새로운 블로그 포스트가 나왔습니다",
  platforms: ["twitter", "linkedin", "instagram"],
});
```

가격: 무료 (20/월), Premium $99/월 (1,000/월).

**판단**: 현재는 X만 사용하므로 불필요. LinkedIn/Instagram 확장 시 검토.

### 4.4 원소스 멀티유즈 자동화 모델

**Gary Vee 역피라미드 자동화 스택** (2025):

```
1개 장문 콘텐츠 (블로그 포스트)
  → Whisper 트랜스크립트 (영상용)
  → Claude/GPT 리퍼포징 (플랫폼별 포맷)
  → SMM 도구로 동시 배포

도구: Castmagic (오디오→30+포맷) / Repurpose.io (영상→멀티플랫폼)
```

**현재 시스템에 매핑**:

```
phase1/act1-ko.md (장문)
  → twitter_pipeline skill → 큐 JSON (이미 있음)
  → video_concept_writer skill → 영상 컨셉 (이미 있음)
  → [추가] RSS → Beehiiv 뉴스레터 (자동)
  → [추가] package_for_youtube.py → YouTube 업로드 (반자동)
```

---

## 5. AI 에이전트 콘텐츠 파이프라인

### 5.1 현재 Agent Skill 시스템 평가

| 스킬 | 성숙도 | 개선 가능 |
|------|--------|----------|
| blog_pipeline | ✅ 완성 | — |
| twitter_pipeline | ✅ 완성 | 성과 피드백 반영 |
| branding_reviewer | ✅ 완성 | — |
| video_concept_writer | ✅ 완성 | — |
| video_storyboard_planner | ✅ 완성 | — |
| comfyui_video_pipeline | ✅ 완성 | — |

**이미 6개 스킬이 완성됨**. 추가 에이전트 프레임워크(CrewAI, AutoGPT 등)는 현재 불필요.

### 5.2 MCP 기반 확장 (선택적)

| MCP 서버 | 용도 | 현재 필요성 |
|----------|------|------------|
| @enescinar/twitter-mcp | X 직접 연동 | ✅ 이미 사용 중 |
| ContentStudio MCP | 멀티 플랫폼 스케줄링 | 낮음 |
| n8n-mcp | Claude → n8n 워크플로 대화형 생성 | 중간 |
| WordPress MCP | WP 자동 발행 | 해당 없음 (Astro 사용) |

### 5.3 품질 게이트 자동화

| 계층 | 도구 | 현재 시스템 |
|------|------|-----------|
| 브랜드 보이스 | branding_reviewer 스킬 | ✅ 있음 |
| 금지 표현 검사 | blog-check / twitter-check | ✅ 있음 |
| 사실 확인 | QUALITY-AUDIT.md 수동 | ❌ 자동화 없음 |
| 톤 일관성 | system prompt + examples.md | ✅ 있음 |

**추가 가능**: Grammarly Writing Score API ($15/user/mo) — 교정, 명확성, 톤 점수 자동 산출. 우선순위 낮음.

---

## 6. 한국 시장 특화

### 6.1 네이버 블로그

- 한국 검색 점유율: 네이버 46.53% vs 구글 46.05% (2025.1)
- **C-Rank 알고리즘**: 특정 주제 전문 포스팅 → 크리에이터 랭크 상승
- **D.I.A. 알고리즘**: 사용자 의도 매칭, 키워드 스터핑 페널티
- **공식 포스팅 API 없음** — 수동 발행 필수. 자동화는 리서치/초안/키워드까지만.

**판단**: vibecode.town이 주 블로그. 네이버는 선택적 미러링 (수동). 당장 불필요.

### 6.2 카카오톡 채널

- 한국 인구 90% 도달
- 2025 리디자인: 인스타 스타일 피드 도입 → 콘텐츠 배포 채널 확대
- **검토 시점**: 한국어 뉴스레터 시작 시

### 6.3 유튜브 한국 정책 (2025.7 업데이트)

> 고유한 관점 없이 완전 자동 생성된 반복적 AI 영상은 수익화 중단 가능.

**현재 시스템은 안전**: 클레이메이션 컨셉 + 브랜드 보이스 VO + 에디토리얼 레이어 존재.

---

## 7. 수익화 인프라 (미래 대비)

### 7.1 디지털 제품 판매

| 플랫폼 | 수수료 | MoR | API | 적합 |
|--------|--------|-----|-----|------|
| **Lemon Squeezy** | 5%+$0.50 | ✅ | ✅ | ebook, 코스 |
| Gumroad | 10%+$0.50 | ✅ (2025~) | 제한적 | 단순 판매 |
| **Polar.sh** | 4%+Stripe | ✅ | ✅ (오픈소스) | 개발자 타겟 |

**권장**: Lemon Squeezy (ebook/코스) 또는 Polar.sh (개발자 커뮤니티). 책 출판 시점에 검토.

### 7.2 멤버십/유료 구독

| 플랫폼 | 방법 | 적합 |
|--------|------|------|
| Ghost | CMS + 멤버십 + 뉴스레터 통합 | 블로그 이전 시 |
| Beehiiv | 유료 구독 + 광고 네트워크 | 뉴스레터 중심 |
| Memberful | WordPress/커스텀 사이트 연동 | Astro 사이트 |

---

## 8. 오픈소스 도구 추천

### 8.1 소셜 미디어 스케줄러

| 도구 | GitHub Stars | 특징 |
|------|-------------|------|
| **Postiz** | 14K+ | X/IG/TikTok/LinkedIn/Bluesky, AI 어시스턴트, Docker 배포 |
| **Mixpost** | — | Laravel+Vue, 무제한, Reels/Shorts 지원 |

### 8.2 콘텐츠 자동화

| 도구 | 용도 |
|------|------|
| n8n (자체호스팅) | 워크플로 오케스트레이션 (LangChain 70+ 노드) |
| CrewAI | 멀티 에이전트 콘텐츠 파이프라인 (Python) |
| Remotion | React → MP4 프로그래매틱 영상 생성 |
| voice-pro | 한국어 TTS 통합 (edge/Kokoro/F5/CosyVoice) |

### 8.3 유튜브 자동화

| 레포 | 설명 |
|------|------|
| `naqashafzal/AI-Content-Studio` | 전체 파이프라인: 리서치→스크립트→음성→영상→업로드 |
| `muratali016/Fully-Automated-YouTube-Channel` | 매일 자동 업로드 실가동 예시 |
| `RayVentura/ShortGPT` | Shorts/TikTok 자동화 프레임워크 |
| `daveshap/YouTubeChapterGenerator` | GPT-4로 챕터 마커 자동 생성 |

---

## 9. 즉시 실행 로드맵 (우선순위 순)

### Phase 1: 발행 루프 완성 (1-2일)

| # | 작업 | 난이도 | 효과 |
|---|------|--------|------|
| 1 | Vercel Deploy Hook 생성 + 매일 cron 워크플로 | 낮음 | 예약 발행 자동화 |
| 2 | Beehiiv RSS-to-Email 설정 | 낮음 | 뉴스레터 자동 발송 |
| 3 | 블로그 발행 URL 로그 JSON 자동 생성 스크립트 | 낮음 | 추적성 확보 |

### Phase 2: 유튜브 업로드 체인 (3-5일)

| # | 작업 | 난이도 | 효과 |
|---|------|--------|------|
| 4 | YouTube Data API v3 OAuth 설정 | 중간 | 업로드 자동화 기반 |
| 5 | `package_for_youtube.py` → API 업로드 스크립트 연결 | 중간 | 반자동 업로드 |
| 6 | 프리프로 JSON → 챕터 마커 자동 변환 | 낮음 | SEO 개선 |
| 7 | Pillow 썸네일 템플릿 (Cocoa+Yellow 팔레트) | 낮음 | 일관된 브랜딩 |

### Phase 3: 피드백 루프 (1주)

| # | 작업 | 난이도 | 효과 |
|---|------|--------|------|
| 8 | 트위터 성과 수집 스크립트 (주 1회 cron) | 중간 | 데이터 기반 의사결정 |
| 9 | 에버그린 재활용 큐 시스템 | 중간 | 콘텐츠 수명 연장 |
| 10 | 주간 운영 리포트 자동 생성 | 중간 | 진행 상황 추적 |

### Phase 4: 품질 향상 (선택적)

| # | 작업 | 난이도 | 효과 |
|---|------|--------|------|
| 11 | CosyVoice 3 TTS 백엔드 추가 | 중간 | 한국어 TTS 품질 향상 |
| 12 | Wan 2.2 ComfyUI 워크플로 테스트 | 중간 | 영상 품질 향상 |
| 13 | WhisperX 한국어 자막 파이프라인 | 낮음 | 자막 자동화 |

---

## 10. 비용 요약

### 현재 비용: ~$0/월

| 항목 | 비용 |
|------|------|
| Vercel (무료 티어) | $0 |
| GitHub Actions (무료 티어) | $0 |
| X API (Free 티어) | $0 |
| Beehiiv (무료 티어) | $0 |
| ComfyUI (로컬 GPU) | $0 |
| edge-tts | $0 |

### 고도화 후 추가 비용: $5-15/월

| 항목 | 비용 |
|------|------|
| n8n VPS (선택) | $5-10/mo |
| CosyVoice (로컬) | $0 |
| YouTube API | $0 (쿼터 내) |
| Wan 2.2 (로컬) | $0 |
| **합계** | **$5-10/mo** |

### 스케일 단계 추가 비용

| 항목 | 비용 | 시점 |
|------|------|------|
| X API Basic | $200/mo | 성과 피드백 필요 시 |
| ElevenLabs | $5-22/mo | 프로 TTS 필요 시 |
| Tweet Hunter | $29/mo | 200+ 팔로워 후 |
| Lemon Squeezy | 5%/거래 | 디지털 제품 판매 시 |

---

## 부록 A. 참고 소스

### 블로그 자동화
- Vercel Deploy Hooks: vercel.com/docs/deploy-hooks
- Astro 예약 발행: ainoya.dev/posts/scheduled-post-astro/
- n8n 멀티에이전트 콘텐츠: n8n.io/workflows/10293
- Ghost Admin API: ghost.org/changelog/admin-api/
- Beehiiv API: developers.beehiiv.com

### 유튜브 자동화
- YouTube Data API v3: developers.google.com/youtube/v3/docs
- Wan 2.2: github.com/Wan-Video/Wan2.2
- HunyuanVideo 1.5: github.com/Tencent-Hunyuan/HunyuanVideo-1.5
- CosyVoice: github.com/FunAudioLLM/CosyVoice
- Remotion: remotion.dev
- n8n YouTube 업로드: n8n.io/workflows/3900

### 트위터/소셜
- X API 가격: docs.x.com/x-api/getting-started/pricing
- twitter-api-v2: github.com/PLhery/node-twitter-api-v2
- Ayrshare: ayrshare.com
- Postiz: github.com/gitroomhq/postiz-app
- BuiltPublic: builtpublic.com

### 한국 시장
- 네이버 SEO: interad.com/en/insights/naver-seo-guide
- DataForSEO 네이버: dataforseo.com/blog/dataforseo-naver-serp-api
- 한국 소셜미디어 2025: icrossborderjapan.com/en/blog/social-media/korean-social-media-2025-trends-strategies/

### 오픈소스 레포
- AI-Content-Studio: github.com/naqashafzal/AI-Content-Studio
- ShortGPT: github.com/RayVentura/ShortGPT
- voice-pro: github.com/abus-aikorea/voice-pro
- YouTubeChapterGenerator: github.com/daveshap/YouTubeChapterGenerator
- CrewAI: github.com/crewAIInc/crewAI
- n8n-mcp: github.com/czlonkowski/n8n-mcp
- Polar.sh: github.com/polarsource/polar
