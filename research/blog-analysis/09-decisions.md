# 9. vibecode.town (Blog) — 기술 결정 문서

> **Purpose:** 블로그 구축에 필요한 7가지 결정의 장단점 비교
> **상태:** 미확정 — 검토 후 결정 필요

---

## 1. 컬러 팔레트

### Option A: "Neon Terminal Garden" (리서치 추천)

```
Primary:    Warm Coral #FF6E6E
Secondary:  Electric Violet #7C3AED
Tertiary:   Mint Green #06D6A0
Highlight:  Amber #FBBF24
Background: Deep Space #0F0E17 (바이올렛 틴트)
```

**장점:**
- musu.pro(Gold + Cream)와 확실히 구분됨
- 다크모드에서 비비드 액센트가 눈에 확 들어옴
- 코드 신택스 컬러를 디자인 액센트로 통일 가능 (String=Coral, Function=Mint, Keyword=Violet)
- 대부분 개발 블로그가 쿨 그레이+블루인데, 따뜻한 다크+멀티컬러로 차별화
- Amber가 musu.pro Gold의 미묘한 메아리 — 브랜드 패밀리 연결

**단점:**
- 3색 액센트를 잘못 쓰면 산만해 보일 수 있음
- 코랄이 "에러 컬러"로 오인될 가능성 (빨간 계열)
- 바이올렛 틴트 다크 배경은 모니터 캘리브레이션에 민감

### Option B: 모노크롬 + 1 액센트

```
Primary:    Electric Blue #3B82F6 (또는 Coral #FF6E6E)
Background: Near-black #0A0A0B
Text:       #E5E5E5
```

**장점:**
- 심플. 실수 여지 적음
- Lee Robinson / Dan Abramov 스타일 — 검증된 패턴
- 디자인 결정이 적어서 빠르게 구축 가능

**단점:**
- 차별화 약함 — "또 다른 다크 테크 블로그"
- musu.pro Blue와 겹칠 위험 (Blue 선택 시)
- 코드 블록 외에 시각적 변화가 없어 긴 글에서 단조로움

### Option C: Warm Light + 1 다크 액센트

```
Primary:    Deep Violet #4C1D95
Background: Warm White #FEFCE8
Text:       #1C1917
```

**장점:**
- 라이트모드 블로그 — 다크 일색인 시장에서 오히려 차별화
- 인쇄물/매거진 느낌 — 에디토리얼 권위
- 눈 피로도 낮음 (장시간 읽기에 유리)

**단점:**
- 개발자 80%+가 다크모드 선호 — 타겟 역행
- 코드 블록이 라이트 배경 위의 다크 섬이 됨 (시각적 충돌)
- musu.pro의 Cream 톤과 비슷해져서 분리 약해짐

**추천: A** — 3색이 위험요소가 있지만, 코드 신택스 매핑으로 자연스럽게 소화 가능. 차별화 최대.

---

## 2. 타이포그래피

### Option A: "Playful Technical" (리서치 추천)

```
Headlines: Space Grotesk (700-800)
Body:      Inter (400-500)
Code:      JetBrains Mono (400)
```

**장점:**
- Space Grotesk = 모노스페이스 DNA + 모던 가독성. "코드도 치고 디자인도 하는" 느낌
- Inter = 화면 최적화의 정석. GitHub, Figma, Linear가 사용. 투명하게 사라지는 폰트
- JetBrains Mono = 리가처 지원, 개발자 크레드
- musu.pro의 Nunito(둥글고 따뜻)와 확실히 다른 성격

**단점:**
- Space Grotesk가 한국어를 지원하지 않음 — 한국어 헤딩에 별도 폰트 필요
- Inter가 "너무 보편적"이라 개성 부족할 수 있음

### Option B: "Editorial Authority"

```
Headlines: Clash Display (600-700)
Body:      Literata (400)
Code:      Fira Code (400)
```

**장점:**
- 매거진/에디토리얼 느낌 — 글쓰기 권위
- Literata = 세리프체로 장문 읽기에 편함 (e-book 최적화 폰트)
- Clash Display = 독특한 헤딩 — 인식도 높음

**단점:**
- 세리프 본문은 코드 블로그보다 문학 블로그 느낌
- Clash Display가 무거움 (variable font 미지원)
- 테크 블로그 독자에게 "이상하게 격식 차린" 느낌 줄 수 있음

### Option C: "Warm & Approachable" (musu.pro 연속성)

```
Headlines: Satoshi (700-800)
Body:      Nunito (400-600)
Code:      Cascadia Code (400)
```

**장점:**
- musu.pro와 Nunito 공유 — 브랜드 패밀리 강화
- Satoshi = 모던하면서 둥글고 친근
- 학습 비용 0 (기존 폰트 재사용)

**단점:**
- musu.pro와 너무 비슷해짐 — "분리"가 안 느껴짐
- Nunito는 장문 읽기에 최적화된 폰트가 아님 (x-height 낮음)
- Cascadia Code는 JetBrains Mono보다 리가처/가독성 약함

**추천: A** — 한국어 헤딩은 Pretendard 또는 Noto Sans KR로 보완하면 해결.

---

## 3. 기본 테마 모드

### Option A: Dark 기본 (리서치 추천)

**장점:**
- 개발자 80%+ 다크모드 선호 (Stack Overflow 2024 조사)
- 코드 블록이 자연스럽게 녹아듦 (다크 배경 위의 다크 코드)
- "Neon Terminal Garden" 미학의 핵심
- 야간 읽기 경험 우수
- musu.pro(라이트 기본)와 즉시 구분됨

**단점:**
- 다크모드에서 장문 읽기 피로 호소하는 사용자 존재 (소수)
- OG 이미지/소셜 공유 시 라이트 환경에서 썸네일이 어둡게 보임
- 인쇄 시 잉크 소모 (PDF 다운로드 제공 시 고려)

### Option B: Light 기본 + Dark 토글

**장점:**
- 전통적 블로그 패턴 — 익숙함
- SEO 크롤러가 라이트 모드 기준으로 접근성 평가
- 인쇄/PDF 친화적

**단점:**
- 차별화 약함
- "Neon Terminal Garden" 미학 불가능
- 코드 블록이 밝은 배경 위 어두운 섬이 되어 시각적 단절

### Option C: System 기본 (OS 설정 따름)

**장점:**
- 사용자 선택 존중
- 접근성 최우수

**단점:**
- 첫 인상 통제 불가 — 브랜드 경험 불일치
- 두 모드 모두 완벽하게 디자인해야 함 (작업량 2배)

**추천: A** — 다크 기본, 라이트 토글 제공. OG 이미지는 별도 디자인으로 해결.

---

## 4. 콘텐츠 레이어

### Option A: Velite (리서치 추천)

MDX 파일을 빌드타임에 파싱, Zod 스키마로 타입 생성.

**장점:**
- ContentLayer의 후계자 (ContentLayer는 2026년 사실상 중단)
- Zod 스키마 = TypeScript 타입 자동 생성 + 런타임 검증
- 빌드타임 처리 — 클라이언트 JS 0
- Next.js 16 App Router 완벽 호환
- 프레임워크 무관 — 나중에 Astro로 옮겨도 재사용 가능

**단점:**
- 비교적 새로운 도구 — 커뮤니티 소규모
- 문서가 ContentLayer만큼 풍부하지 않음
- 플러그인 생태계 제한적

### Option B: next-mdx-remote (현재 musu.pro 사용 중)

서버 컴포넌트에서 MDX를 런타임 컴파일.

**장점:**
- 이미 사용 중 — 학습 비용 0
- 검증됨 (Hashicorp, Vercel 공식 추천)
- 동적 MDX 로딩 가능 (CMS, 외부 소스)

**단점:**
- 타입 안전성 없음 — frontmatter 수동 파싱
- Zod 스키마를 직접 구축해야 함
- Velite보다 빌드 성능 낮음 (런타임 컴파일)

### Option C: @next/mdx (Next.js 내장)

**장점:**
- Next.js 내장 — 의존성 0
- 가장 심플한 셋업

**단점:**
- frontmatter 지원 없음 (별도 처리 필요)
- 동적 라우팅 어려움
- 기능 빈약 — 결국 다른 도구 추가 필요

**추천: A (Velite)** — 새로 시작하는 프로젝트이므로 최신 도구로 가는 게 유리. 다만 Velite 셋업이 어려우면 B(next-mdx-remote)로 빠르게 시작 후 마이그레이션도 가능.

---

## 5. 댓글 시스템

### Option A: Giscus (리서치 추천)

GitHub Discussions 기반.

**장점:**
- 무료, 오픈소스
- 트래킹/광고 없음 — 프라이버시
- 타겟 오디언스가 이미 GitHub 계정 보유
- Lazy-loaded — 성능 영향 최소
- 다크/라이트 모드 지원
- Markdown 지원 — 코드 블록도 가능

**단점:**
- GitHub 계정 필수 — 비개발자 63%가 계정 없을 수 있음
- GitHub Discussions에 의존 — GitHub 정책 변경 리스크
- 댓글 데이터가 GitHub에 귀속 (소유권 제한)

### Option B: Disqus

**장점:**
- 가장 널리 사용 — 익숙함
- 소셜 로그인 다양 (Google, Facebook, Twitter)

**단점:**
- 광고 삽입 (무료 플랜)
- 트래킹 과다 — 프라이버시 이슈
- 무거움 — 번들 사이즈 크고 로딩 느림
- 개발자 커뮤니티에서 평판 나쁨

### Option C: 없음 (댓글 비활성화)

**장점:**
- 구현 비용 0
- 스팸/모더레이션 불필요
- "댓글은 Twitter에서" 전략 (트래픽 유도)

**단점:**
- 커뮤니티 형성 어려움
- 독자 참여 채널 없음
- SEO에 UGC(사용자 생성 콘텐츠) 이점 없음

**추천: A (Giscus)** — 비개발자 접근성이 약점이지만, 타겟이 "바이브 코더"이므로 GitHub 계정 보유 가능성 높음. 비개발자 커뮤니티는 Discord로 보완.

---

## 6. 뉴스레터 플랫폼

### Option A: Beehiiv (리서치 초기 추천)

**장점:**
- 2,500 구독자까지 무료
- 성장 도구 우수: 레퍼럴 프로그램, A/B 테스트, 추천 네트워크
- 0% 수수료 (유료 뉴스레터)
- 이메일 에디터 직관적
- SparkLoop 내장 (크로스프로모션)

**단점:**
- Markdown 네이티브가 아님 — WYSIWYG 에디터
- 자동화 기능 기본적 (Kit/ConvertKit보다 약함)
- API가 제한적 — 커스텀 연동 어려울 수 있음
- 데이터 소유권은 있지만, 플랫폼 종속성 존재

### Option B: Buttondown

**장점:**
- Markdown 네이티브 — 개발자 친화적
- RSS-to-email 지원 — 블로그 발행 시 자동 뉴스레터 가능
- 프라이버시 중심 (최소 트래킹)
- API 우수 — 커스텀 연동 자유
- 100 구독자까지 무료, 이후 $9/mo

**단점:**
- 성장 도구 없음 — 레퍼럴, A/B 테스트 없음
- 이메일 에디터가 미니멀 (비개발자에게 불편)
- 커뮤니티/생태계 소규모

### Option C: Kit (구 ConvertKit)

**장점:**
- 10,000 구독자까지 무료
- 자동화 최강 — 비주얼 워크플로우 빌더
- 디지털 제품 판매 내장
- 크리에이터 네트워크 큼

**단점:**
- Markdown 지원 약함
- 이메일 디자인 제한적 (텍스트 중심)
- 무료 플랜에서 자동화 제한

### Option D: 자체 구축 (Resend + React Email)

**장점:**
- 완전한 소유권과 커스터마이징
- 브랜드 디자인 100% 통제
- 비용 최저 (Resend: 3,000 이메일/mo 무료)

**단점:**
- 구축 시간 상당 (구독 관리, 발송, 언서브, 바운스 처리)
- 성장 도구 전부 직접 개발
- 이메일 전달률 관리 (SPF, DKIM, 워밍업)
- 초기에 할 일이 많은데 여기에 시간 쏟으면 콘텐츠가 밀림

**추천: B (Buttondown)로 시작 → 10K+ 넘으면 A (Beehiiv)로 이전 또는 D (자체 구축)**

이유: Markdown 네이티브 + RSS-to-email이 MDX 블로그와 자연스러운 파이프라인. 초기에 성장 도구보다 콘텐츠 품질이 중요. 10K 넘기면 그때 성장 도구 필요성 판단.

---

## 7. 로고

### Option A: "Vibe Wave" Modified Wordmark (리서치 1순위)

'v'를 사인파/오디오 웨이브로 변형한 워드마크.

**장점:**
- "vibe"의 직접적 시각화 — 설명 불필요
- 스케일러블 — 파비콘(16px)부터 배너까지
- 2026 트렌드: 타이포그래피 기반 로고
- 애니메이션 가능 — 페이지 로드 시 펄스
- 구현 난이도 중간

**단점:**
- 오디오/음악 브랜드로 오인 가능
- 'v' 변형이 섬세하지 않으면 어색함
- 사인파가 진부해 보일 수 있음 (실행 품질 의존)

### Option B: "Phase Shift" Abstract Mark (리서치 2순위)

두 사인파가 교차하는 추상 마크.

**장점:**
- 가장 깊은 의미 (위상 전환 = "Vibe Coding → Agentic Engineering")
- 타임리스 — 유행 안 탐
- 독특 — 다른 테크 블로그에 이런 마크 없음
- 애니메이션 극적 (두 파형 진동 + 교차점 펄스)

**단점:**
- 초기 인식에 설명 필요 ("이게 뭐야?")
- 작은 사이즈에서 복잡해 보일 수 있음
- 구현 난이도 높음

### Option C: "Code Cursor + Frequency" (리서치 3순위)

텍스트 커서 `|`에서 주파수 아크가 방사.

**장점:**
- "code" + "vibe" 둘 다 표현
- 16px 파비콘에서도 읽힘
- 개발자가 즉시 이해

**단점:**
- 접근성/WiFi/브로드캐스트 아이콘과 혼동 가능
- B, A보다 개성 약함

### Option D: 텍스트만 (로고 없음)

"vibecode.town"을 Space Grotesk 900으로 그냥 쓰기.

**장점:**
- 구현 비용 0
- Lee Robinson, Dan Abramov, Simon Willison 모델
- 콘텐츠에 집중 — 로고는 나중에

**단점:**
- 파비콘에서 구분 안 됨 (글자 하나? 약어?)
- 초기 브랜드 인식도 약함
- "아직 준비 안 된" 느낌 줄 수 있음

**추천: 초기 D (텍스트만) → 안정되면 A (Vibe Wave)로 업그레이드**

이유: 로고에 시간 쏟는 것보다 첫 5개 글을 발행하는 게 우선. Simon Willison이 로고 없이 23년 블로깅한 것처럼, 콘텐츠가 브랜드를 만든다. Pencil.dev로 제작은 콘텐츠 기반이 잡힌 후에.

---

## 결정 요약

| # | 항목 | 추천 | 대안 |
|---|------|------|------|
| 1 | 팔레트 | **A: Neon Terminal Garden** (3색) | B: 모노크롬+1 (안전) |
| 2 | 폰트 | **A: Space Grotesk + Inter + JBMono** | C: Nunito 유지 (빠름) |
| 3 | 테마 | **A: Dark 기본** | C: System (OS 따름) |
| 4 | 콘텐츠 | **A: Velite** | B: next-mdx-remote (검증됨) |
| 5 | 댓글 | **A: Giscus** | C: 없음 (Twitter로 유도) |
| 6 | 뉴스레터 | **B: Buttondown** → 10K 후 전환 | A: Beehiiv (성장 도구) |
| 7 | 로고 | **D: 텍스트만** → 나중에 A 업그레이드 | A: Vibe Wave (바로 제작) |
