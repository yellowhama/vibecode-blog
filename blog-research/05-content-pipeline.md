# 5. AI 활용 콘텐츠 생산 파이프라인

## 1. AI 도구 체인 (2026)

### Writing & Research
| 도구 | 용도 | 핵심 특징 |
|------|------|---------|
| Claude (Anthropic) | 리서치, 초안, 편집 | 200K 토큰, Projects, 아티팩트 |
| ChatGPT/GPT-4o | 대안 리서치, 요약 | 웹 브라우징, DALL-E |
| Perplexity | 팩트 체크, 소스 리서치 | 실시간 검색 + 인용 |
| Cursor | 코드 예시 생성 | AI 코드 에디터 |

### 핵심 원칙: AI as Research Assistant, Human as Editor
- Simon Willison 방식: AI를 시소러스, 교정, 논리 검증에 사용
- LLM이 대필하게 두지 않음 — 신뢰성이 최우선
- AI 생성 텍스트를 바로 복붙 절대 금지 (Amber Figlow)

## 2. Gary Vee 역피라미드 모델 (콘텐츠 리퍼포징)

### 원리
하나의 "필라 콘텐츠"에서 30+ 마이크로 콘텐츠 파생

### vibecode.town 적용 파이프라인
```
[필라] 주간 딥다이브 블로그 포스트 (2,000-3,000단어)
  ├── 뉴스레터 발행 (요약 + 독점 인사이트)
  ├── Twitter/X 스레드 (5-12 트윗, 핵심 테이크어웨이)
  ├── LinkedIn 포스트 (프로페셔널 앵글)
  ├── Dev.to 크로스포스트 (canonical URL)
  ├── Hashnode 크로스포스트
  ├── YouTube 비디오 (블로그를 스크립트로)
  │   ├── YouTube Shorts (3-5개)
  │   ├── TikTok 클립 (3-5개)
  │   └── Instagram Reels
  ├── Reddit 토론 스타터
  └── HN 제출 (적절할 때)
```

### 리퍼포징 규칙
- 플랫폼별 네이티브 포맷으로 리포맷 (복붙 금지)
- 플랫폼 네이티브 포맷이 35-60% 더 높은 참여율
- 원본 발행 후 2-7일 대기하고 신디케이션

## 3. 배치 콘텐츠 생산

### 왜 배치인가
- 주당 4-6시간 절약 (연간 200+시간)
- 컨텍스트 스위칭: 태스크 복귀에 23분 15초 소요
- 생산성 손실 최대 40% (멀티태스킹 시)
- 의사결정 피로 감소 → 창작 에너지 보존

### 추천 배치 스케줄
```
월요일: 리서치 데이 (5개 주제 리서치 + 아웃라인)
화요일: 작문 데이 (2개 딥다이브 초안)
수요일: 편집 + 비주얼 (교정, OG 이미지, 코드 예시)
목요일: 배포 데이 (뉴스레터 발송, 소셜 포스팅)
금요일: 참여 + 커뮤니티 (댓글 응답, DM, 네트워킹)
```

또는 월 1일 집중 배치: 한 달 치 콘텐츠를 하루에 생산

## 4. 콘텐츠 유형별 생산 파이프라인

### 블로그 포스트 (2,000-3,000 단어)

**Step 1: 토픽 선정** (30분)
- 키워드 리서치 (Ahrefs/SEMrush 또는 무료 대안)
- Reddit/Twitter에서 질문/고통점 수집
- "Context Engineering for Vibe Coders" 같은 검색 갭 공략

**Step 2: AI 리서치** (1시간)
- Claude Projects에 토픽 관련 소스 문서 업로드
- Perplexity로 최신 데이터/통계 검색
- 경쟁 콘텐츠 분석: 기존 글이 놓친 것은?

**Step 3: 아웃라인** (30분)
- BLUF (결론 먼저) 구조
- H2/H3 헤딩 작성
- 코드 예시 위치 지정

**Step 4: 초안** (2-3시간)
- AI: 각 섹션 초안 (Claude Projects, 브랜드 보이스 지침 적용)
- Human: 리라이트, 개인 경험/의견 추가, 톤 조정
- 절대 AI 초안을 그대로 발행하지 않음

**Step 5: 편집** (1시간)
- 코드 예시 테스트 및 검증
- Grammarly/LanguageTool 패스
- 읽기 흐름 확인 (큰소리로 읽기)

**Step 6: 비주얼** (30분)
- OG 이미지: `opengraph-image.tsx` (Next.js ImageResponse)
- 코드 스크린샷: rehype-pretty-code 자동 처리
- 다이어그램: Excalidraw 또는 Mermaid

**Step 7: 발행 + 배포** (1시간)
- MDX 파일 커밋 → Vercel 자동 배포
- 뉴스레터 발송
- 소셜 미디어 포스팅 (스레드 + 개별 트윗)

### 뉴스레터 (매주)
- 블로그 포스트 요약 + 뉴스레터 독점 섹션
- 주간 AI 뉴스 큐레이션 (5-7개 링크 + 코멘터리)
- "이번 주 배운 것" TIL 섹션
- CTA: 블로그 풀 아티클로 유도

### Twitter/X 스레드 (주 1-2개)
- 블로그 포스트의 핵심 테이크어웨이 5-12개
- 훅: 숫자/구체적 결과 ("I built X in 3 hours with Claude. Here's how:")
- 마지막 트윗: 뉴스레터 CTA (링크는 리플라이에)
- 이미지/스크린샷 포함 → 40% 높은 완독률

## 5. OG 이미지 생성

### Next.js 16 방식
```typescript
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)

  return new ImageResponse(
    <div style={{ /* 브랜드 스타일링 */ }}>
      <h1>{post.title}</h1>
      <p>vibecode.town</p>
    </div>,
    { ...size }
  )
}
```

## 6. 이메일 자동화 (Welcome Series)

### 추천 시퀀스
1. **Welcome** (즉시): 구독 확인, 리드 마그넷 전달, 기대치 설정
2. **Behind the Scenes** (Day 2): 왜 이 블로그를 만들었는지, 개인 스토리
3. **Best Of** (Day 4): 지금까지 최고 글 3개
4. **Community Invite** (Day 7): Discord 초대 (해당 시)

### 플랫폼별 자동화 수준
- Kit (ConvertKit): 가장 강력한 자동화 (비주얼 빌더)
- Beehiiv: 기본적 자동화 (성장 도구에 집중)
- Substack: 최소한의 자동화 (심플함)

## 7. 품질 유지 원칙

### Simon Willison의 블로깅 접근법
- TIL (Today I Learned): 배운 것을 짧게 기록 — 깊이 필요 없음
- 프로젝트 설명: 빌드 과정 + 결정 사항
- 매일 365일 블로깅한 적 있음
- AI를 시소러스/교정에만 사용, LLM이 대필하게 두지 않음

### 80/20 인간/AI 비율
- AI: 리서치 (40%), 초안 구조화 (20%), 팩트 체크 (10%)
- Human: 보이스/톤 (100%), 개인 경험 (100%), 최종 편집 (100%), 의견 (100%)
- "AI + 인간 최적화 콘텐츠(AIO)"가 2026 모범 사례

### 콘텐츠 캘린더 구조
- 85% 성공 비즈니스가 콘텐츠 캘린더 사용
- 3요소 조합: 키 데이트 + 브랜드 캠페인 + 스테디 콘텐츠
- AI가 생산 시간 60% 단축 가능 — 하지만 보이스는 인간이 유지
