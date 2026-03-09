# vibecode.town 블로그 디자인 레퍼런스 v2

> Date: 2026-02-28
> Context: MUSU V2 브랜딩 기반 Neobrutalism + Claymorphism 블로그 디자인 리서치

---

## 1. 핵심 레퍼런스 5개

### 1.1 Brutal (Astro Neobrutalist Theme)

- **URL**: https://brutal.elian.codes/
- **GitHub**: https://github.com/ElianCodes/brutal
- **기술**: Astro + UnoCSS
- **특징**:
  - 3px solid black border, `drop-shadow(7px 7px 0 rgb(0 0 0))` → hover시 5px로 축소
  - CSS 변수 기반 카드별 색상 커스터마이징
  - Tag pills: `border-radius: 9999px` + 동일 shadow
  - 제로 JS 인터랙션 — 순수 CSS
  - UnoCSS (Tailwind 호환 문법)
- **우리와의 관계**: 3px border 스펙 동일, shadow 패턴 동일 (우리 4px vs 이들 7px)

### 1.2 neobrutalism.dev (Component Library)

- **URL**: https://www.neobrutalism.dev/
- **GitHub**: https://github.com/ekmas/neobrutalism-components
- **기술**: React + shadcn/ui + Tailwind + Next.js
- **특징**:
  - 40+ 컴포넌트: Card, Button, Badge, Accordion, Input, Slider 등
  - `border-2`, `rounded-base`, `shadow-shadow` CSS 변수
  - Hover: `translate-x-boxShadowX translate-y-boxShadowY` + `shadow-none` (press 효과)
  - `bg-main`, `bg-secondary-background`, `text-main-foreground` 시맨틱 토큰
  - Figma 키트: https://www.figma.com/community/file/1445024004618320019
- **우리와의 관계**: `.musu-*` 클래스의 직접 레퍼런스. 색상 매핑: `--main` → #FFD166, `--secondary-background` → #FDFCF0, `--border` → #2D1D19

### 1.3 Devosfera (AstroPaper 극한 커스텀 포크)

- **URL**: https://github.com/0xdres/astro-devosfera
- **데모**: https://devosfera.vercel.app/
- **기술**: Astro 5 + Tailwind CSS v4 (AstroPaper 기반)
- **특징**:
  - AstroPaper를 완전히 다른 디자인(Terminal/Cyberpunk)으로 변환
  - Glassmorphism navbar, TOC, cards, modals
  - CSS grid-line 배경 + 커서 반응형 radial glow
  - 3-tier 커스텀 타이포그래피: Wotfard (body), Cascadia Code (code), Sriracha (italics)
  - Cmd+K 검색 모달 (Pagefind)
  - SVG progress ring BackToTop 버튼
  - `<dialog>` 기반 이미지 갤러리 라이트박스
  - Lighthouse 100/100 유지
- **우리와의 관계**: AstroPaper를 얼마나 바꿀 수 있는지의 증거. 구조는 유지하면서 디자인만 교체

### 1.4 Gumroad

- **URL**: https://gumroad.com/
- **기술**: 프로덕션 웹사이트
- **특징**:
  - 네오브루탈리즘의 정석 / 가장 유명한 실제 적용 사례
  - 2-3px black border, 4-6px offset `box-shadow: Xpx Xpx 0 #000`
  - Pill-shaped 버튼, 둥근 카드
  - Pink/Yellow/Black 팔레트
  - 미니멀 내비게이션, 직접적
- **우리와의 관계**: Pink → Musu Yellow, White → Off-White로 치환하면 거의 동일. Shadow/border 처리 직접 참고

### 1.5 Tony's Chocolonely eCommerce (Dribbble)

- **URL**: https://dribbble.com/shots/20815734-Tony-s-Chocolonely-eCommerce
- **특징**:
  - 우리 팔레트와 가장 유사: 초콜릿 브라운 + 옐로 리본 + 크림 배경
  - Bold sans-serif, 두꺼운 outline, pill 버튼
  - 카드 기반 레이아웃, 평면 일러스트
  - 따뜻하고 장난기 있는 톤
- **우리와의 관계**: 색상 무드보드로 최적. Yellow ribbon ≈ #FFD166, Chocolate ≈ #2D1D19, Cream ≈ #FDFCF0

---

## 2. 추가 레퍼런스

### 2.1 컴포넌트 라이브러리

| 이름 | URL | 특징 |
|------|-----|------|
| RetroUI | https://www.retroui.dev/ | 40+ React+Tailwind 컴포넌트, `hover:translate-y-1 active:translate-y-2 active:shadow-none` |
| clay.css | https://github.com/codeAdrian/clay.css | Claymorphism 전용 micro CSS, 3-shadow 시스템 |
| Neo-Brutalism UI (marieooq) | https://neo-brutalism-ui-library.vercel.app/ | React+Tailwind copy-paste, Storybook 문서 |

### 2.2 Astro 테마

| 이름 | URL | 특징 |
|------|-----|------|
| Flabbergasted | https://lexingtonthemes.com/templates/flabbergasted | Dark-mode only 네오브루탈, 40+ pages, 300+ components (유료) |
| Dotfiles | https://github.com/nabsiddiqui/dotfiles-astro-theme | Terminal 미학, 14개 팔레트 (Catppuccin, Nord 등) |
| Infostrikes | https://github.com/absurditiesmedia/infostrikes | Brutal 포크, 색상 config 커스터마이징 |

### 2.3 기술 문서

| 이름 | URL | 내용 |
|------|-----|------|
| Claymorphism (Smashing Magazine) | https://www.smashingmagazine.com/2022/03/claymorphism-css-ui-design-trend/ | Claymorphism 3-shadow 공식 원본 |
| Claymorphism (Hype4 Academy) | https://hype4.academy/articles/design/claymorphism-in-user-interfaces | 명명자 Michal Malewicz의 정의 |
| NN/g Neobrutalism | https://www.nngroup.com/articles/neobrutalism/ | UX 관점 분석 |
| Awesome Neobrutalism | https://github.com/ComradeAERGO/Awesome-Neobrutalism | 큐레이션 리스트 |

### 2.4 Figma 템플릿

| 이름 | URL |
|------|-----|
| Neubrutalism Website Design | https://www.figma.com/community/file/1271359085282674583 |
| Neubrutalism Design System | https://www.figma.com/community/file/1313507255978107786 |
| Neo Brutalism UI Kit | https://www.figma.com/community/file/1209478811951634271 |
| How to Design Neo-Brutalism | https://www.figma.com/community/file/1280887851475019031 |

### 2.5 Dribbble

| 이름 | URL | 관련성 |
|------|-----|--------|
| Statsy.com Landing | https://dribbble.com/shots/19525034 | Yellow 액센트 네오브루탈 |
| Neobrutalism 태그 (600+) | https://dribbble.com/tags/neobrutalism | 전체 브라우징 |
| Snowball Fractal Design System | https://fractal.snowball.xyz/ | 프로덕션 핀테크 네오브루탈 |

---

## 3. CSS 공식 정리

### 3.1 Neobrutalism + Claymorphism 하이브리드 (우리 방식)

```css
.card {
  background: #FDFCF0;
  border: 3px solid #2D1D19;
  border-radius: 24px;
  box-shadow:
    4px 4px 0 #2D1D19,                           /* neo offset */
    inset -3px -3px 6px rgba(45, 29, 25, 0.1),   /* clay dark */
    inset 3px 3px 6px rgba(255, 255, 255, 0.6);   /* clay light */
  transition: all 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card:hover {
  transform: translate(2px, 2px);   /* press down */
  box-shadow:
    2px 2px 0 #2D1D19,
    inset -3px -3px 6px rgba(45, 29, 25, 0.1),
    inset 3px 3px 6px rgba(255, 255, 255, 0.6);
}
```

### 3.2 Featured Card (Yellow 배경)

```css
.featured-card {
  background: #FFD166;
  border: 3px solid #2D1D19;
  border-radius: 24px;
  box-shadow:
    4px 4px 0 #2D1D19,
    inset -4px -4px 8px rgba(45, 29, 25, 0.12),
    inset 4px 4px 8px rgba(255, 255, 255, 0.35);
}
```

### 3.3 인터랙션 패턴 비교

| 패턴 | 소스 | 설명 |
|------|------|------|
| Lift up | 현재 우리 | `translateY(-2px)`, shadow 커짐 |
| Press down | Brutal, neobrutalism.dev | `translate(2px, 2px)`, shadow 줄어듦 |
| Scale bounce | RetroUI | `hover:translate-y-1 active:translate-y-2` |
| Shadow color shift | TailwindFlex | hover시 shadow 색상 변경 |

---

## 4. 적용 우선순위

### 즉시 적용 가능

1. Press-down hover 인터랙션 (현재 lift-up → press-down 변경 검토)
2. Featured 카드 (`.musu-card-featured` — Yellow 배경)
3. 코드 블록에 neo border + shadow 적용

### 참고만

4. Cursor-reactive glow (Devosfera) — 과한 효과, 보류
5. Glassmorphism overlay — MUSU V2에서 금지
6. 카드 rotation (`rotate(-3deg)`) — 블로그엔 과함

---

## 5. 심층 분석 — 각 레퍼런스의 구체적 CSS 스펙

### 5.1 Brutal — 완전 분해

#### Shadow 시스템: `filter: drop-shadow()` 사용

Brutal은 `box-shadow`가 아니라 **`filter: drop-shadow()`** 를 사용한다. 이유: `drop-shadow`는 `border-radius`를 따라가지만 `box-shadow`는 사각형 기준.

```css
/* Card */
filter: drop-shadow(7px 7px 0 rgb(0 0 0 / 1));
border: 3px solid black;
border-radius: 0.5rem; /* 8px */
transition: all 0.5s ease-in-out;

/* Card hover — shadow 축소 (press-in) */
filter: drop-shadow(5px 5px 0 rgb(0 0 0 / 1));

/* Button */
filter: drop-shadow(5px 5px 0 rgb(0 0 0 / 1));
border: 2px solid black;

/* Button hover — shadow 축소 + bg 색상 변경 */
filter: drop-shadow(3px 3px 0 rgb(0 0 0 / 1));
background-color: var(--color); /* 랜덤 accent */

/* Pill/Tag — 반대 방향! shadow가 커짐 (pop-out) */
filter: drop-shadow(3px 3px 0 rgb(0 0 0 / 1));
border: 2px solid black;
border-radius: 9999px;

/* Pill hover — shadow 증가! */
filter: drop-shadow(5px 5px 0 rgb(0 0 0 / 1));
background-color: var(--color);
```

#### 3-Tier Shadow 계층

| 컴포넌트 | 기본 Shadow | Hover Shadow | 방향 |
|----------|------------|-------------|------|
| Card | 7px 7px | 5px 5px | 축소 (press-in) |
| Button | 5px 5px | 3px 3px | 축소 (press-in) |
| Pill | 3px 3px | **5px 5px** | **증가 (pop-out)** |

#### 랜덤 카드 색상 (16색 팔레트)

카드에 `color` prop 없으면 SSR 시 랜덤 배정:
```
#c084fc #f472b6 #fb7185 #e879f9 #a78bfa #818cf8
#60a5fa #38bdf8 #22d3ee #2dd4bf #34d399 #4ade80
#a3e635 #facc15 #fb923c #f87171
```
모두 Tailwind 400-weight 색상. 매 빌드마다 배치 달라짐.

#### 타이포그래피 (5폰트 시스템)

| 폰트 | 역할 | 사용처 |
|------|------|--------|
| Outfit | sans-serif | Hero 헤딩 |
| Poppins | sans-serif | Body, nav, 설명 |
| Righteous | sans-serif | 로고 (`text-5xl`) |
| Sanchez | serif | 버튼, 태그 링크 |
| DM Serif Text | serif | 섹션 제목 |

#### 블로그 카드 구조

1. 제목 (`<h3>` Poppins text-lg ~ text-xl)
2. 이미지 (`h-56` = 224px, `object-cover`, 별도 3px border)
3. 설명 (`<p>` Poppins)
4. "Read post →" 버튼 (우측 정렬)
5. 태그 Pill (모바일에서 숨김)

#### 페이지별 배경색

- 홈: `bg-pink`
- 블로그 목록: `bg-green`
- 각 페이지 메인에 다른 파스텔 배경 적용

---

### 5.2 neobrutalism.dev — 컴포넌트 전체 스펙

#### Design Token (CSS Custom Properties)

```css
:root {
  --border-radius: 5px;
  --box-shadow-x: 4px;
  --box-shadow-y: 4px;
  --reverse-box-shadow-x: -4px;
  --reverse-box-shadow-y: -4px;
  --heading-font-weight: 700;
  --base-font-weight: 500;
  --shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border);
}
```

#### Tailwind v4 매핑

```css
@theme inline {
  --spacing-boxShadowX: var(--box-shadow-x);     /* 4px */
  --spacing-boxShadowY: var(--box-shadow-y);     /* 4px */
  --radius-base: var(--border-radius);            /* 5px */
  --shadow-shadow: var(--shadow);                 /* 4px 4px 0px 0px black */
  --font-weight-base: var(--base-font-weight);    /* 500 */
  --font-weight-heading: var(--heading-font-weight); /* 700 */
}
```

#### 유니버설 패턴

```
/* 모든 정적 요소 */
border-2 border-border rounded-base shadow-shadow

/* 모든 인터랙티브 요소 (press-down) */
border-2 border-border rounded-base shadow-shadow
hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none

/* Reverse (pop-up) */
border-2 border-border rounded-base
hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow
```

#### 주요 컴포넌트 Tailwind 클래스

**Button (default)**:
```
text-main-foreground bg-main border-2 border-border shadow-shadow
hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none
h-10 px-4 py-2 text-sm font-base rounded-base
```

**Card**:
```
rounded-base flex flex-col shadow-shadow border-2 gap-6 py-6
border-border bg-background text-foreground font-base
```

**Badge**:
```
inline-flex items-center justify-center rounded-base border-2 border-border
px-2.5 py-0.5 text-xs font-base bg-main text-main-foreground
```

**Input**:
```
flex h-10 w-full rounded-base border-2 border-border bg-secondary-background
px-3 py-2 text-sm font-base text-foreground
focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
```

#### 17개 색상 팔레트 (oklch 기반)

red, orange, amber, **yellow**, lime, green, emerald, teal, cyan, sky, **blue** (기본), indigo, violet, purple, fuchsia, pink, rose

#### 다크모드

```css
.dark {
  --background: oklch(29.12% 0.0633 270.86);
  --secondary-background: oklch(23.93% 0 0);
  --foreground: oklch(92.49% 0 0);
  --main-foreground: oklch(0% 0 0);  /* 색상 요소 위 텍스트는 여전히 검정 */
  --border: oklch(0% 0 0);           /* border는 여전히 검정! */
}
```

#### 46개 컴포넌트 중 Shadow 사용 여부

| Shadow 있음 | Shadow + Press 있음 |
|------------|-------------------|
| Card, Alert, Dialog, Image Card, Toast | **Button만** |

대부분의 컴포넌트는 shadow 없이 border만 사용.

---

### 5.3 Devosfera — AstroPaper 변환 레시피

#### 수정한 AstroPaper 파일 (22+)

| 파일 | 수정 정도 |
|------|----------|
| Card.astro | 완전 재작성 (glow effect) |
| Header.astro | 완전 재작성 (sticky glassmorphism) |
| Footer.astro | 완전 재작성 |
| BackButton.astro | 완전 재작성 (glassmorphism pill) |
| BackToTopButton.astro | 완전 재작성 (SVG progress ring) |
| Layout.astro | 대폭 수정 (global backdrop) |
| PostDetails.astro | 대폭 수정 (aurora header) |
| global.css | 대폭 추가 |
| typography.css | 대폭 추가 |

#### 새로 추가한 파일 (15+)

SearchModal.astro, IntroAudio.astro, GalleryEmbed.astro, GalleryCard.astro, 커스텀 폰트 3개 (Wotfard, Cartograph CF, Cascadia Code), noise.png 텍스처 등

#### Global Backdrop (가장 임팩트 큰 변경)

`Layout.astro`에 하나의 fixed div 추가, 4개 레이어:

1. **Grid pattern**: 50x50px accent 색 grid, 3.5% opacity, radial mask
2. **Ambient glow**: 800x550px radial gradient, accent 6% opacity, blur 80px
3. **Cursor glow**: 1100px radial gradient, mouse 따라감, blur 40px
4. **Noise texture**: 64x64 PNG 타일, `mix-blend-mode: overlay`, opacity 0.55

전체 mask: `linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.3) 70%, transparent 100%)`

#### Card Glow Effect

```css
.card-glow-effect {
  background: radial-gradient(
    350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    color-mix(in oklab, var(--accent) 8%, transparent) 0%,
    color-mix(in oklab, var(--accent) 4%, transparent) 30%,
    transparent 80%
  );
}
```
+ JS로 mouse position 추적 → `--mouse-x`, `--mouse-y` CSS 변수 설정

#### Sticky Header

```css
/* 스크롤 15px 이상일 때 */
.header-scrolled {
  background: color-mix(in srgb, var(--background) 80%, transparent);
  backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 4px 30px rgba(0,0,0,0.05);
}
```
Active nav link: `::after` pseudo-element (0.35rem 원형 + `box-shadow: 0 0 6px accent/80%`)

#### `color-mix()` 활용

Tailwind opacity 유틸리티 대신 `color-mix(in oklab)` 사용:
- Border: `color-mix(in srgb, var(--accent) 18%, transparent)`
- Hover bg: `color-mix(in srgb, var(--accent) 5%, transparent)`
- Glow: `color-mix(in oklab, var(--accent) 8%, transparent)`

#### 핵심 교훈

| 순위 | 변경 | 임팩트/노력 비율 |
|------|------|----------------|
| 1 | Global backdrop (grid + glow + noise) | 최고 — Layout.astro 한 파일 수정 |
| 2 | `color-mix()` 기반 5-변수 색상 | 높음 — global.css 교체 |
| 3 | Card glow effect | 높음 — CSS 30줄 + JS 5줄 |
| 4 | Glassmorphism header | 중간 — Header.astro 수정 |
| 5 | Gradient hero title + shimmer | 중간 — CSS 20줄 |

---

### 5.4 Gumroad — 프로덕션 네오브루탈리즘 정석

#### 컬러 시스템

| 역할 | 색상 | HEX |
|------|------|-----|
| Primary accent | Lavender Rose | `#FF90E8` |
| Secondary accent | Marigold | `#FFC900` |
| Teal | Success | `#23A094` |
| Structure | Black | `#000000` |
| Surface | White | `#FFFFFF` |
| Background | Off-White | `#F4F4F0` |

Black = 구조 (모든 border, 모든 shadow, 주요 텍스트)
White = 여백 (카드, 입력 배경)
Pink/Yellow = 20-30%만 사용 (CTA, 강조)

#### Shadow 스펙 — 핵심 규칙

```css
box-shadow: 4px 4px 0px 0px #000000;

/* 절대 불변 규칙: */
/* 1. Zero blur (0px) — blur 쓰면 네오브루탈 아님 */
/* 2. Zero spread (0px) — 깨끗한 기하학적 offset만 */
/* 3. Black color — border와 동일, 항상 #000 */
/* 4. 4px가 표준, 6px는 대형/히어로, 2px는 소형 */
/* 5. 항상 우하단 방향 (positive X, Y) */
```

#### Press 인터랙션 — 가장 정교한 설명

```css
/* 기본: shadow로 "떠있는" 느낌 */
.button {
  border: 2px solid #000;
  box-shadow: 4px 4px 0px 0px #000;
  transition: all 0.15s ease;
}

/* Hover: shadow offset만큼 정확히 이동 → shadow 사라짐 = "눌림" */
.button:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

이것이 물리적으로 정확한 이유: shadow는 "물체 아래 그림자". 물체가 shadow 위치로 내려가면 그림자가 사라진다.

#### Reverse 패턴

```css
/* 기본: 평평, shadow 없음 */
.button-reverse { border: 2px solid #000; }

/* Hover: 위로 뜸, shadow 나타남 */
.button-reverse:hover {
  transform: translate(-4px, -4px);
  box-shadow: 4px 4px 0px 0px #000;
}
```

#### 다크모드에서도 Border는 Black

```css
.dark {
  --border: oklch(0% 0 0);  /* 여전히 black */
}
```
이것이 구조적 rigidity를 유지하는 핵심. Border가 회색으로 바뀌면 네오브루탈 느낌 붕괴.

#### 타이포그래피

- Font: ABC Favorit (커스텀 geometric sans-serif)
- Heading: 700, 48-64px (hero), 32-40px (section)
- Body: 400-500, 16-18px
- Small: 14px

#### 왜 "Raw"가 Premium으로 느껴지는가

1. **제약 = 일관성**: 2-3개 accent, black/white 구조 — 예외 없음
2. **Shadow = 깊이**: Material Design의 elevation을 더 직관적으로 대체
3. **폰트가 무거운 짐**: 장식 없이 크기/굵기만으로 계층 생성
4. **Pink #FF90E8**: baby pink(너무 부드러움)과 hot pink(너무 공격적) 사이의 정확한 지점
5. **반응형에서 shadow 유지**: 모바일에서도 2px border + 4px shadow 동일 — 축소하지 않음

---

### 5.5 RetroUI — 7단계 Shadow + 3단계 Press

#### Shadow Scale (7단계)

```css
--shadow-xs:  1px 1px 0 0 var(--border);
--shadow-sm:  2px 2px 0 0 var(--border);
--shadow:     3px 3px 0 0 var(--border);
--shadow-md:  4px 4px 0 0 var(--border);
--shadow-lg:  6px 6px 0 0 var(--border);
--shadow-xl:  10px 10px 0 1px var(--border);
--shadow-2xl: 16px 16px 0 1px var(--border);
```

xl/2xl에서 `0 1px` spread 추가 — 미세한 stroke 효과.

#### Primary Color

`#ffdb33` (golden yellow) — 우리 `#FFD166`과 거의 동일!

#### 3단계 Press Effect (가장 정교)

```css
/* 1. Rest: shadow-md (4px), 원위치 */
shadow-md

/* 2. Hover: shadow 축소 (3px), 약간 내려감 */
hover:shadow hover:translate-y-1

/* 3. Active: shadow 완전 사라짐, 대각선으로 눌림 */
active:shadow-none active:translate-y-2 active:translate-x-1
```

neobrutalism.dev의 2단계 (rest → pressed)보다 더 물리적으로 느껴지는 이유:
- Hover = "손가락이 닿음" (살짝 눌림)
- Active = "클릭" (완전히 눌림)
- `active:translate-x-1` 대각선 이동이 현실감 추가

#### Button 전체 CSS

```
/* Primary */
shadow-md hover:shadow active:shadow-none
bg-primary text-primary-foreground border-2 border-black
transition hover:translate-y-1 active:translate-y-2 active:translate-x-1
hover:bg-primary-hover

/* Secondary */
shadow-md hover:shadow active:shadow-none
bg-secondary shadow-primary text-secondary-foreground border-2 border-black
transition hover:translate-y-1 active:translate-y-2 active:translate-x-1

/* Outline */
shadow-md hover:shadow active:shadow-none
bg-transparent border-2
transition hover:translate-y-1 active:translate-y-2 active:translate-x-1
```

#### Card

```css
inline-block border-2 rounded shadow-md transition-all hover:shadow-none bg-card
```
Card는 hover시 shadow-none만 — translate 없음 (카드는 "눌리는" 것이 아니라 "평평해지는" 것)

#### Badge (4 변형)

| 변형 | 클래스 |
|------|--------|
| default | `bg-muted text-muted-foreground` |
| outline | `outline-2 outline-foreground text-foreground` |
| solid | `bg-foreground text-background` |
| surface | `outline-2 bg-primary text-primary-foreground` |

Size: sm(`px-2 py-1 text-xs`), md(`px-2.5 py-1.5 text-sm`), lg(`px-3 py-2 text-base`)

#### 7개 프리빌트 테마

default (yellow `#ffdb33`), purple, lime, red, lavender, orange, green — 각각 light/dark 토큰 세트 포함

#### neobrutalism.dev와 비교

| 항목 | RetroUI | neobrutalism.dev | 블로그에 유리 |
|------|---------|-----------------|-------------|
| Shadow | 7단계 (xs~2xl) | 단일 4px | **RetroUI** — 시각적 계층 |
| Border | 2px | 2px | 동일 |
| Radius | 0 (기본), 0.5rem (opt-in) | 5px | 동일 |
| Press 효과 | 3단계 (rest/hover/active) | 2단계 (rest/hover) | **RetroUI** — 더 물리적 |
| Reverse hover | 없음 | 있음 (shadow 나타남) | **neobrutalism.dev** |
| 색상 | HSL, 7 테마 | oklch, 17 팔레트 | 취향 |
| 컴포넌트 수 | ~38 | ~46 | neobrutalism.dev |
| Badge 변형 | 4개 | 2개 | **RetroUI** |

---

## 6. 우리 블로그 적용 결론

### 확정 적용 (리서치 기반)

| # | 항목 | 근거 | 현재 → 변경 |
|---|------|------|------------|
| 1 | **Press-down hover** | Gumroad, neobrutalism.dev, RetroUI 전부 사용 | `translateY(-2px)` → `translate(4px, 4px) + shadow-none` |
| 2 | **Shadow 계층화** | Brutal 3-tier, RetroUI 7-tier | Card 4px, Button 4px, Tag 2px |
| 3 | **Tag pop-out** | Brutal Pill 패턴 | Tag hover시 shadow 2px→3px 증가 |
| 4 | **`.musu-card-featured`** | Gumroad yellow card, clay.css yellow example | Yellow 배경 + clay inset shadow |
| 5 | **코드 블록 스타일링** | Brutal 이미지 컨테이너 패턴 | 3px border + offset shadow 적용 |

### 검토 필요

| # | 항목 | 장점 | 단점 |
|---|------|------|------|
| 6 | `drop-shadow` vs `box-shadow` | radius 따라감 | claymorphism inset shadow와 병용 불가 |
| 7 | 다크모드 border black 유지 | 구조적 rigidity | 우리 다크는 Cocoa Brown 배경이라 black이 안 보임 |
| 8 | 3단계 press (RetroUI) | 더 물리적 | 복잡도 증가, 블로그엔 과할 수 있음 |
| 9 | Global backdrop (Devosfera) | 분위기 전환 효과 최고 | Glassmorphism = MUSU V2 금지, noise만 가능 |

### 절대 안 함

| # | 항목 | 이유 |
|---|------|------|
| 10 | 랜덤 카드 색상 (Brutal) | MUSU V2 3색 규칙 위반 |
| 11 | oklch 색상 시스템 | MUSU V2는 HEX 기반 |
| 12 | Glassmorphism (Devosfera) | MUSU V2 브랜딩에서 명시적 금지 |
| 13 | 5폰트 시스템 (Brutal) | MUSU V2: Nunito + JetBrains Mono만 |
| 14 | `border-radius: 0` (RetroUI 기본) | MUSU V2: 24px 카드, pill 버튼 |

---

## 7. 레이아웃 디자인 레퍼런스

### 7.1 홈페이지 레이아웃 패턴

#### Pattern A: Featured Hero + Grid (Linear, Stripe 스타일)

대형 피처드 포스트 + 아래 2-3열 그리드.

```css
.homepage-grid {
  display: grid;
  gap: 1.5rem;
  max-width: 1024px; /* max-w-5xl */
  margin: 0 auto;
}

/* 피처드 영역: 전체 폭 */
.featured-hero {
  grid-column: 1 / -1;
}

/* 나머지 포스트: 반응형 그리드 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .post-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .post-grid { grid-template-columns: repeat(3, 1fr); }
}
```

**Neobrutalist 적용**: 피처드 카드는 `.musu-card-featured` (Yellow 배경), 일반 카드는 `.musu-card`

#### Pattern B: Vertical Card List (Overreacted 스타일) — 현재 우리

```css
.post-list {
  max-width: 768px; /* max-w-3xl */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

최소 변경, 읽기 최적화. 현재 우리 블로그 구조.

#### Pattern C: Auto-Fit Grid (Josh Comeau 스타일)

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}
```

카드 높이 균등, `minmax(320px, 1fr)`로 자연스러운 반응형.

#### Pattern D: Bento Grid (비대칭)

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.bento-featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

피처드 포스트가 2x2 크기, 나머지 1x1. 시각적으로 화려하지만 AstroPaper 구조 변경 多.

#### Pattern E: Horizontal Scroll → Grid (모바일 퍼스트)

```css
.featured-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1.5rem 0;
}

.scroll-card {
  min-width: 300px;
  scroll-snap-align: start;
}

@media (min-width: 768px) {
  .featured-scroll {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
  }
  .scroll-card { min-width: auto; }
}
```

모바일에서 스와이프, 데스크탑에서 그리드 전환.

---

### 7.2 포스트 페이지 레이아웃 패턴

#### Pattern F: Sticky TOC Sidebar

```css
.post-layout {
  display: grid;
  grid-template-columns: 1fr min(768px, 100%) 250px;
  gap: 2rem;
}

.post-content { grid-column: 2; }

.toc-sidebar {
  grid-column: 3;
  position: sticky;
  top: 5rem;
  height: fit-content;
}

.toc-link {
  display: block;
  padding: 0.5rem 0;
  border-left: 3px solid transparent;
  padding-left: 1rem;
}

.toc-link.active {
  border-left-color: var(--accent); /* #FFD166 */
  font-weight: 700;
}

@media (max-width: 1200px) {
  .post-layout { grid-template-columns: 1fr; }
  .toc-sidebar { display: none; } /* 모바일에서 숨김 또는 접기 */
}
```

#### Pattern G: Wide Content + Breakout

```css
.article-grid {
  display: grid;
  grid-template-columns: 1fr min(65ch, 100%) 1fr;
}

.article-grid > * { grid-column: 2; }

/* 이미지, 코드 블록 등 넓은 요소 */
.article-grid > .full-bleed {
  grid-column: 1 / -1;
  max-width: 1200px;
  margin: 2rem auto;
}

.article-grid > .wide {
  grid-column: 1 / -1;
  max-width: 900px;
  margin: 1.5rem auto;
}
```

본문은 `65ch` 폭, 이미지/코드는 full-width breakout.

#### Pattern H: Reading Progress Bar

```css
.progress-container {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 4px;
  background: var(--bg-tertiary);
}

.progress-bar {
  height: 100%;
  background: var(--accent); /* #FFD166 */
  transform-origin: left;
  /* scaleX는 JS로 scroll % 계산 */
}
```

---

### 7.3 헤더/네비게이션 패턴

#### Pattern I: Auto-Hide Sticky Header

```css
.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: var(--background);
  border-bottom: 3px solid var(--border-strong);
  transform: translateY(0);
  transition: transform 300ms var(--ease-out-expo);
  z-index: 1000;
}

.header.hidden {
  transform: translateY(-100%);
}
```

```js
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.pageYOffset;
  if (current > lastScroll && current > 100) {
    header.classList.add('hidden');   // 스크롤 다운 → 숨김
  } else {
    header.classList.remove('hidden'); // 스크롤 업 → 표시
  }
  lastScroll = current;
});
```

#### Pattern J: Accent Bar Header

```css
/* 상단에 Yellow 라인 */
body::before {
  content: '';
  display: block;
  height: 4px;
  background: var(--accent); /* #FFD166 */
}
```

간단하지만 브랜드 인지도 높임.

---

### 7.4 푸터 패턴

#### Pattern K: Newsletter + Social

```css
.footer {
  background: var(--foreground); /* Cocoa Brown */
  color: var(--background);      /* Off-White */
  border-top: 4px solid var(--accent); /* Yellow */
  padding: 3rem 1.5rem 2rem;
}

.newsletter-row {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
}

.newsletter-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 3px solid var(--background);
  border-radius: 9999px;
  background: transparent;
  color: var(--background);
}

.newsletter-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  color: var(--foreground);
  border: 3px solid var(--foreground);
  border-radius: 9999px;
  font-weight: 700;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--background);
  border-radius: 50%;
  transition: all 200ms var(--ease-spring);
}

.social-icon:hover {
  background: var(--accent);
  border-color: var(--foreground);
  color: var(--foreground);
}
```

---

### 7.5 실제 테크 블로그 레이아웃 분석

| 사이트 | 홈 그리드 | 본문 폭 | TOC | 네비 | 주요 특징 |
|--------|----------|---------|-----|------|----------|
| **Overreacted** | Flex column (stacked) | 672px | 없음 | Static, 56px margin | 극도로 미니멀, `scale(1.005)` hover |
| **Josh Comeau** | Named CSS Grid areas | 1100px | 상단 인라인 | Fixed 40px | 스페이싱 시스템 4-44px, wave SVG footer |
| **Kent C. Dodds** | 3-col card grid | ~1200px | 없음 | Fixed/sticky | Cloudinary 이미지 최적화 |
| **Linear** | 3-col, 448px cards | 1200-1400px | 없음 | Fixed 64px | 16:9 카드 이미지, snap scroll 캐러셀 |
| **Stripe** | CSS Grid, responsive | 1264px | 없음 | Fixed 64px | 5-tier shadow, skew sections |
| **Smashing Magazine** | Flexbox, 1440px | ~900px | Sidebar | CSS Grid nav | `calc()` 반응형 타이포, 11px radius |
| **CSS-Tricks** | Horizontal slider + grid | Responsive | Sidebar | Top nav + search | Negative margin 카드 스택 |
| **Brutal Theme** | Vertical cards | ~900px | 없음 | Sidebar + mobile | **7px drop-shadow**, 16색 랜덤 카드 |
| **Gumroad** | 3-col feature grid | ~1200px | 없음 | Minimal | Content > Decoration 철학 |

### 7.6 핵심 수치 정리

| 항목 | 값 | 출처 |
|------|---|------|
| 읽기 최적 폭 | **672-900px** | Overreacted (672), Josh (900), Brutal (900) |
| 홈페이지 그리드 폭 | **1100-1440px** | Josh (1100), Stripe (1264), Smashing (1440) |
| 네비 높이 | **40-64px** | Josh (40), Overreacted (56 margin), Linear/Stripe (64) |
| 그리드 반응형 | **3열 → 2열(768px) → 1열(640px)** | 거의 모든 사이트 공통 |
| 섹션 간격 | **32-48px** | Overreacted (gap-8=32), Linear (48px) |
| 카드 이미지 비율 | **16:9** (대부분) 또는 **3:4** (Kent) | Linear, Stripe |
| Progress bar 높이 | **4-6px** | 일반적 표준 |

---

## 8. 레이아웃 적용 결론

### 확정 적용

| # | 항목 | 패턴 | 구현 난이도 |
|---|------|------|-----------|
| 1 | **홈 Featured Hero + List** | A+B 혼합 | 중 — `Main.astro` 또는 `index.astro` 수정 |
| 2 | **Accent Bar (Yellow top line)** | J | 하 — `body::before` CSS 1줄 |
| 3 | **Reading Progress Bar** | H | 하 — sticky div + JS 5줄 |
| 4 | **Post 하단 Related Posts Grid** | 기존 Prev/Next 확장 | 중 — PostDetails.astro 수정 |

### 검토 필요

| # | 항목 | 장점 | 단점 |
|---|------|------|------|
| 5 | Sticky TOC Sidebar (F) | 긴 기술 글에 필수 | 1200px 이상 폭 필요, AstroPaper TOC 구조 변경 |
| 6 | Wide Breakout (G) | 이미지/코드 넓게 | 본문 `grid-template-columns` 교체 필요 |
| 7 | Auto-Hide Header (I) | 읽기 공간 최대화 | JS 필요, AstroPaper Header 로직 변경 |
| 8 | Newsletter Footer (K) | 구독자 수집 | 이메일 서비스(Buttondown 등) 연동 필요 |
| 9 | 홈 2-3열 그리드 (C) | 포스트 한눈에 | `max-w-3xl` → `max-w-5xl` 확장 필요, 카드 높이 균등화 |

### 절대 안 함

| # | 항목 | 이유 |
|---|------|------|
| 10 | Masonry (Pinterest) | 카드 높이 불균등 → 읽기 순서 혼란 |
| 11 | Magazine 12-col Grid | 블로그에 과도한 복잡성 |
| 12 | Timeline Layout | 체인지로그 전용, 일반 블로그 부적합 |
| 13 | Bento Grid | AstroPaper 구조 대규모 변경 필요 |

---

## 9. 시각적 디자인 레퍼런스 (Visual Inspiration)

### 9.1 직접 관련 — 우리 팔레트(Cocoa Brown + Yellow + Cream)와 비슷한 무드

#### Tony's Chocolonely eCommerce
- **URL**: https://dribbble.com/shots/20815734-Tony-s-Chocolonely-eCommerce
- **BUCK 케이스**: https://buck.co/work/tonys-chocolonely
- **Tinloof 구현**: https://tinloof.com/work/tony-s-chocolonely
- **시각 설명**: 초콜릿 브라운 배경 + 옐로 리본 장식 + 크림 카드. 우리 3색 팔레트와 거의 동일
- **레이아웃**: Grid 기반 모듈, 블로그 아티클에 핫스팟 배너 삽입
- **타이포**: GT Flexa (loud, playful) + American Typewriter (vintage)
- **가져올 것**: 초콜릿 따뜻함 + bold 타이포의 조합, 그리드 모듈 시스템, 블로그 내 제품 CTA 통합 방식

#### Cassie Evans
- **URL**: https://www.cassie.codes
- **시각 설명**: 민트/라일락/피치 파스텔 + 두꺼운 블랙 보더 + offset shadow(0.5rem). 비대칭 구도, 회전된 라벨(`rotate(-5deg)`), 의도적으로 불완전한 정렬
- **타이포**: Mosk (geometric sans) + Jenthill (cursive 장식용)
- **가져올 것**: 네오브루탈 + 플레이풀의 교과서. 회전 라벨, 비대칭 구도, 손그림 느낌. 파스텔을 우리 3색으로 치환하면 바로 적용 가능

#### Mailchimp (Yellow 브랜드 시절)
- **URL**: https://mailchimp.com/design/
- **시각 설명**: Cavendish Yellow이 주도하는 브랜드. 흑백 손그림 일러스트(버섯, 기린 등) + 옐로 팝. Cooper Light(chunky, 약간 삐뚤한 워드마크)
- **가져올 것**: Yellow을 과감하게 주요 색상으로 쓰는 법. 흑백 일러스트 위에 옐로 악센트. "Outsider art" 느낌의 imperfection

#### Bumble
- **URL**: https://bumble.com
- **시각 설명**: Bumble Yellow(#FFC629)가 메인 브랜드컬러. 미니멀, 클린, 플레이풀, 커스텀 일러스트
- **가져올 것**: Yellow = 친근함, 에너지, 혁신. Yellow을 CTA/강조에만 쓰지 말고 대담하게 주도색으로 사용하는 전략

#### Soft Brutalism (2025 트렌드)
- **URL**: https://www.hashbuilds.com/patterns/what-is-soft-brutalism-design
- **참고**: https://www.home-designing.com/soft-brutalism-how-this-contradictory-style-is-taking-over-designer-homes
- **시각 설명**: 두꺼운 보더 + 둥근 모서리(bullnosed edges, arches). Warm taupe, greige, sand, clay, charcoal + mustard yellow
- **무드**: "구조적 정직함이 인간적 편안함을 만남"
- **가져올 것**: **정확히 우리 방향**. Cocoa Brown = warm clay, Musu Yellow = mustard, Off-White = sand. 두꺼운 보더인데 `border-radius: 24px`

---

### 9.2 네오브루탈리즘 블로그/웹 디자인

#### Gumroad
- **URL**: https://gumroad.com
- **시각 설명**: 네오브루탈 정석. 2-3px black border, 4-6px offset shadow(zero blur). "Digital zine" 느낌. 스티커처럼 보이는 UI 요소들
- **컬러**: Pink #FF90E8 + Marigold #FFC900 + Black/White 구조
- **가져올 것**: "Raw가 Premium으로 느껴지는 이유" — 제약 = 일관성, Shadow = 깊이, 폰트가 무거운 짐

#### Brutal (Astro Theme)
- **URL**: https://brutal.elian.codes/
- **GitHub**: https://github.com/ElianCodes/brutal
- **시각 설명**: 파스텔 배경 카드(16색 랜덤), 7px drop-shadow, 3px border. 페이지별 다른 배경색(홈=pink, 블로그=green)
- **가져올 것**: Astro 블로그에서 네오브루탈을 구현하는 실제 방법. 카드 구조, shadow 계층, 페이지별 컬러 변화

#### neobrutalism.dev
- **URL**: https://www.neobrutalism.dev/
- **시각 설명**: 46개 컴포넌트 쇼케이스. 4px offset shadow, 2px border, 5px radius. 모든 인터랙티브 요소: `translate → shadow-none`
- **가져올 것**: 컴포넌트별 레이아웃 구성법. Card, Accordion, Dialog 등이 페이지에서 어떻게 배치되는지

#### Neobrutalist (Astro Theme)
- **URL**: https://astro.build/themes/details/neobrutalist/
- **시각 설명**: 블로그 전용 네오브루탈 Astro 테마. 라이트/다크, bold modern design
- **가져올 것**: 블로그 특화 네오브루탈 레이아웃의 실제 구현체

---

### 9.3 플레이풀 테크 블로그

#### Josh W. Comeau
- **URL**: https://www.joshwcomeau.com
- **시각 설명**: 구름 위 마스코트 캐릭터, organic wavy SVG 장식, 인터랙티브 데모 임베드. Named CSS Grid areas로 섹션 구분(newest, categories, popular)
- **무드**: 기술적이면서도 환영하는 느낌 — "따뜻한 테크 블로그"의 정석
- **가져올 것**: 일러스트/마스코트로 온기 추가, SVG 웨이브 장식, 4px 단위 스페이싱 시스템

#### Una Kravets
- **URL**: https://una.im
- **시각 설명**: 카드 기반 블로그 프리뷰 + 썸네일. backdrop-filter blur로 깊이감. 네비 hover에 오디오 피드백(!)
- **가져올 것**: 예상 못한 즐거움(오디오, 마이크로인터랙션). 모듈러 스페이싱, 카드+썸네일 레이아웃

---

### 9.4 무드보드 & 큐레이션 사이트

| 사이트 | URL | 용도 |
|--------|-----|------|
| Dribbble neobrutalist | https://dribbble.com/tags/neobrutalist | 600+ 네오브루탈 디자인 |
| Dribbble yellow website | https://dribbble.com/tags/yellow-website | 옐로 액센트 웹 디자인 32+ |
| Awwwards Brutalism | https://www.awwwards.com/awwwards/collections/brutalism/ | 수상작 브루탈리즘 컬렉션 |
| One Page Love Brutalist | https://onepagelove.com/brutalist-websites | 163개 브루탈리즘 사이트 스크린샷 |
| Lapa.ninja Blog | https://www.lapa.ninja/category/blog/ | 74개 블로그 랜딩 페이지 |
| Siteinspire Blog | https://www.siteinspire.com/websites/category/blog | 블로그 카테고리 |
| Behance neobrutalism | https://www.behance.net/search/projects/neobrutalism | 네오브루탈 프로젝트 |
| Brutalist Websites | https://brutalistwebsites.com/ | 브루탈리즘 큐레이션 |
| Really Good Designs | https://reallygooddesigns.com/neo-brutalist-website-examples/ | 네오브루탈 예시 모음 |

### 9.5 Figma 커뮤니티 템플릿

| 이름 | URL | 특징 |
|------|-----|------|
| Neubrutalism Design System | https://www.figma.com/community/file/1313507255978107786 | 반응형 그리드, 매거진 레이아웃 |
| Minimalist Brutalist Web | https://www.figma.com/community/file/1205138501284675696 | 미니멀 + 브루탈 조합 |
| 140+ Neobrutalist Components | https://www.figma.com/community/file/1606309563914816959 | SaaS 포커스, 140+ 컴포넌트 |
| Neobrutalism Website Design | https://www.figma.com/community/file/1271359085282674583 | 웹사이트 레이아웃 템플릿 |

### 9.6 컬러 트렌드 검증

#### Pantone 2025: Mocha Mousse
- Cocoa Brown #2D1D19 ≈ Pantone Mocha Mousse — 2025 올해의 색상과 거의 동일
- "Rich, earthy brown, quiet sophistication" — 우리 팔레트가 트렌드 정중앙

#### 네오브루탈리즘 컬러 팔레트
- **참고**: https://colorany.com/color-palettes/neobrutalism-color-palettes/ (28개 팔레트)
- "Maple Glow" 팔레트: deep browns + vibrant yellows = 우리 팔레트와 동일한 구성
- 네오브루탈 규칙: 2-3 bold colors + black/white structure, NO gradients

### 9.7 우리 무드 키워드

> **"Bakery meets Tech"** — 커피숍/초콜릿 브랜드의 따뜻함 + 네오브루탈의 구조감
>
> **"Soft Brutalism"** — 두꺼운 보더인데 둥글고, 오프셋 섀도인데 따뜻한 색
>
> **"Pantone 2025 Mocha Mousse"** — Cocoa Brown이 올해의 트렌드 컬러
>
> **"Digital Zine"** — Gumroad 스타일, 스티커처럼 보이는 UI, 인쇄물 느낌의 디지털
