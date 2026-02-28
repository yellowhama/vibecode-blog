# vibecode.town 블로그 디자인 레퍼런스

> Date: 2026-02-28
> Context: AstroPaper 기본 미니멀 → MUSU V2 스타일(Soft Neobrutalism + Claymorphism) 적용 필요
> 목표: 메모장이 아니라 블로그처럼 보이게

---

## 1. Neobrutalism 블로그 레퍼런스 (직접 방문 가능)

### Tier A: 가장 관련 높음

**1. Brutal (Astro 테마)**
- URL: https://brutal.elian.codes/
- GitHub: https://github.com/ElianCodes/brutal
- **핵심:** Astro로 만든 네오브루탈 블로그. 카드에 2-3px 보더 + 5-7px 오프셋 그림자, pill 태그 뱃지, 15가지 프리셋 컬러. 호버 시 그림자 줄어들며 눌림 효과. JS 0.
- **훔칠 것:** 카드 그리드 레이아웃, 태그 pill 디자인, 그림자 호버 애니메이션
- **스택:** Astro + UnoCSS (Tailwind 아님)

**2. Gumroad**
- URL: https://gumroad.com/
- **핵심:** 네오브루탈리즘의 교과서. 밝은 색상, 굵은 검정 테두리, 플랫 컬러, 단순 레이아웃. 카드에 오프셋 그림자, pill 버튼.
- **훔칠 것:** 카드 레이아웃, pill 버튼, press-down 호버 (그림자 줄고 요소 이동)
- **주의:** 제품 판매 사이트라 블로그 직접 참고는 제한적

**3. Kristi.Digital**
- URL: https://kristi.digital/
- 블로그: https://blog.kristi.digital/
- **핵심:** 개인 사이트를 네오브루탈로 리디자인. 볼드 타이포, 하드 섀도, 비비드 컬러이지만 **의도적으로 따뜻하고 친근**. 주니어 디자이너도 환영받는 느낌.
- **훔칠 것:** 네오브루탈을 따뜻하게 만드는 접근법. 블로그 글이 네오브루탈 프레임 안에서 어떻게 보이는지.
- **보너스:** [네오브루탈 웹 디자인에 좋은 폰트 추천 글](https://blog.kristi.digital/p/my-favourite-fonts-for-neobrutalist-web-design) — Nunito 선택 검증에 유용

**4. Neobrutalism Blog Template**
- URL: https://neobrutalism-blog.netlify.app/
- GitHub: https://github.com/neobrutalism-templates/blog
- **핵심:** 목적 구축된 네오브루탈 블로그 템플릿. 포스트 리스트, 태그 페이지, About, 다크/라이트 토글.
- **훔칠 것:** 포스트 목록 패턴, 태그 네비게이션, 콘텐츠 가독성 유지 방법
- **스택:** Astro + Tailwind + MDX

**5. Panda CSS**
- URL: https://panda-css.com/
- **핵심:** 개발자 도구 사이트가 네오브루탈리즘 사용. 기술 콘텐츠 + 플레이풀 디자인이 양립 가능함을 증명.
- **훔칠 것:** 기술 문서/개발자 타겟이 네오브루탈을 어떻게 소화하는지

### Tier B: 추가 참고

**6. Snowball / Fractal Design System**
- URL: https://snowball.xyz/ / https://fractal.snowball.xyz/
- **핵심:** 핀테크 회사가 만든 오픈소스 네오브루탈 디자인 시스템 "Fractal". React + TS + Panda CSS. Storybook 문서.
- **훔칠 것:** 컬러 팔레트 접근법, 버튼/카드/인풋이 일관된 border/shadow 토큰을 공유하는 구조
- Figma: https://www.figma.com/community/file/1281271374017743876/fractal-design-system
- Dribbble 컬러 가이드: https://dribbble.com/shots/21739202-Fractal-Colors-Snowball-Design-System

**7. Curry Cafe**
- URL: https://curry.cafe/
- **핵심:** 강한 대비 블록 컬러, 모션 타이포, 의도적으로 깨진 그리드. **따뜻한 컬러** 사용 — brown/yellow 팔레트에 가장 가까운 네오브루탈 사이트.
- **훔칠 것:** 따뜻한 컬러가 네오브루탈에서 어떻게 작동하는지. 네온/일렉트릭 컬러 없이도 가능한 증거.

**8. Lydia Amaruch Portfolio**
- URL: https://lydiaamaruch.com/
- **핵심:** 다크모드 네오브루탈 포트폴리오. 우아하고 모던.
- **훔칠 것:** 다크/라이트 모드 전환을 네오브루탈에서 어떻게 처리하는지. 카드 호버 상태.

---

## 2. Claymorphism 참고

**1. Claymorphism Generator (Hype4)**
- URL: https://hype4.academy/tools/claymorphism-generator
- **핵심:** Claymorphism을 만든 Michal Malewicz가 제작한 CSS 생성기. 둥글기, 깊이, 투명도, 블러, 컬러 조절 가능.
- **기본 출력:**
  ```css
  border-radius: 26px;
  box-shadow: 35px 35px 68px 0px rgba(145, 192, 255, 0.5),
              inset -8px -8px 16px 0px rgba(145, 192, 255, 0.6),
              inset 0px 11px 28px 0px rgb(255, 255, 255);
  ```
- **적용:** 파란 계열을 Cocoa Brown으로 교체 → `rgba(45, 29, 25, 0.3)`

**2. clay.css**
- URL: https://codeadrian.github.io/clay.css/
- GitHub: https://github.com/codeadrian/clay.css
- **핵심:** Claymorphism 전용 마이크로 CSS 라이브러리. 5개 CSS 변수로 커스터마이징. npm 설치 가능.
- **훔칠 것:** `.clay` 클래스 컨셉을 우리 3색 팔레트에 적용

**3. Pitch**
- URL: https://pitch.com/
- **핵심:** Claymorphism("fluffy 3D")을 비주얼 아이덴티티로 사용한 첫 스타트업. 전체 claymorphism 트렌드를 촉발.
- **훔칠 것:** 일러스트레이션 접근법 — 푹신하고 둥근 3D 느낌의 요소

**4. Dribbble Claymorphism 컬렉션**
- URL: https://dribbble.com/tags/claymorphism
- **핵심:** 수백 개의 claymorphism 디자인 컨셉. "Website"으로 필터링하면 웹 전용 구현 확인 가능.

**5. Claymorphism 원론 (Hype4)**
- URL: https://hype4.academy/articles/design/claymorphism-in-user-interfaces
- **핵심:** Claymorphism을 정의한 원본 글. CSS 분해 + 실제 적용 예시. 이중 inner shadow 테크닉 설명.
- **핵심 이론:** inset shadow 2개 조합 — 밝은 것(좌상단 하이라이트) + 어두운 것(우하단 깊이) → 찰흙처럼 부푼 느낌

---

## 3. 따뜻한 톤 테크 블로그

**1. Josh W. Comeau**
- URL: https://www.joshwcomeau.com/
- **핵심:** 플레이풀 + 따뜻한 + 인터랙티브 개발 블로그의 금본위제. 커스텀 3D 마스콧, 인터랙티브 코드 데모, 따뜻한 개성.
- **훔칠 것:** 기술 콘텐츠를 재미있고 개인적으로 느끼게 만드는 접근법
- 블로그 빌드 설명: https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/

**2. Overreacted (Dan Abramov)**
- URL: https://overreacted.io/
- **핵심:** 미니멀, 따뜻한, 텍스트 중심 테크 블로그. 따뜻한 다크 배경 + 크림 텍스트. Hot Pink 액센트.
- **훔칠 것:** 극한 심플리시티 — 제목, 날짜, 장문 텍스트만. 사이드바 없음, 뉴스레터 팝업 없음.

**3. A Cup of Jo**
- URL: https://cupofjo.com/
- **핵심:** 테크 블로그는 아니지만, 크림톤 블로그 디자인의 교과서. 부드러운 타이포, 넉넉한 여백, 따뜻한 팔레트.
- **훔칠 것:** 크림 배경의 색온도와 여백. 물리적 책/잡지 같은 읽기 경험.

---

## 4. 컴포넌트 라이브러리 (코드 복붙용)

| 리소스 | URL | 용도 |
|--------|-----|------|
| **RetroUI** | https://www.retroui.dev/ | React + Tailwind 네오브루탈 컴포넌트, shadcn/ui 호환 |
| **Neobrutalism.dev** | https://www.neobrutalism.dev/ | shadcn/ui 기반 네오브루탈 컴포넌트 |
| **Fractal (Snowball)** | https://fractal.snowball.xyz/ | 풀 디자인 시스템 + Storybook |
| **Neo-Brutalism UI Library** | https://neo-brutalism-ui-library.vercel.app/ | 무료 Tailwind 컴포넌트 |
| **clay.css** | https://codeadrian.github.io/clay.css/ | Claymorphism CSS 유틸리티 |
| **Claymorphism Generator** | https://hype4.academy/tools/claymorphism-generator | CSS 값 생성 도구 |

---

## 5. Figma 디자인 파일

| 이름 | URL | 용도 |
|------|-----|------|
| Fractal Design System | https://www.figma.com/community/file/1281271374017743876 | 풀 네오브루탈 디자인 시스템 |
| Neubrutalism Design System | https://www.figma.com/community/file/1313507255978107786 | shadcn/ui 기반 |
| Neobrutalism Components | https://www.figma.com/community/file/1445024004618320019 | 컴포넌트 라이브러리 |
| Hypnosis Blog Template | https://uibundle.com/products/1282-hypnosis-neobrutalism-news-blog-figma-template-free | 무료 네오브루탈 블로그 Figma |
| AstroPaper 디자인 | https://www.figma.com/community/file/1356898632249991861 | AstroPaper 기본 디자인 시스템 |

---

## 6. AstroPaper 포크 사례

| 이름 | URL | 변경 수준 |
|------|-----|----------|
| **Astro Devosfera** | https://devosfera.vercel.app | 극단적 변형 — 터미널/사이버펑크 (참고만) |
| **AstroPaper-S** | https://astro-paper-s.ziteh.dev | 기능 추가 (사이드바 TOC, 읽기 시간) |
| **Brutal** | https://brutal.elian.codes/ | AstroPaper가 아닌 별도 Astro 테마, 네오브루탈 |
| **Neobrutalist (유료)** | https://neobrutalist.noicethemes.com/ | "Fresh and playful" 네오브루탈 Astro 테마 |

---

## 7. 큐레이션 리스트

| 리소스 | URL |
|--------|-----|
| Awesome Neobrutalism (GitHub) | https://github.com/ComradeAERGO/Awesome-Neobrutalism |
| Webflow Neobrutalism Gallery | https://webflow.com/made-in-webflow/neobrutalism |
| Neobrutalism Web Design 20선 | https://www.downgraf.com/inspiration/20-neobrutalism-web-design-examples-that-break-all-the-rules/ |
| Neo Brutalist Website 16선 | https://reallygooddesigns.com/neo-brutalist-website-examples/ |

---

## 8. 블로그 레이아웃 패턴 (네오브루탈용)

### 카드 패턴

```css
/* MUSU V2 네오브루탈 카드 */
border: 3px solid #2D1D19;
border-radius: 24px;
box-shadow: 5px 5px 0px #2D1D19;
background: #FDFCF0;

/* 호버: 눌림 */
box-shadow: 2px 2px 0px #2D1D19;
transform: translate(3px, 3px);

/* 클릭: 완전 눌림 */
box-shadow: none;
transform: translate(5px, 5px);
```

### Claymorphism + Neobrutalism 하이브리드 카드

```css
/* Featured 콘텐츠용 — 오프셋 그림자 + inner shadow 찰흙 */
background: #FDFCF0;
border: 3px solid #2D1D19;
border-radius: 24px;
box-shadow: 8px 8px 0px rgba(45, 29, 25, 0.4),
            inset -4px -4px 10px 0px rgba(45, 29, 25, 0.15),
            inset 0px 6px 14px 0px rgba(255, 255, 255, 0.7);
```

### Pill 태그

```css
border: 2px solid #2D1D19;
border-radius: 9999px;
padding: 4px 12px;
background: #FFD166;
box-shadow: 2px 2px 0px #2D1D19;
font-family: 'Nunito', sans-serif;
font-weight: 700;
```

### Pill 버튼

```css
border: 2px solid #2D1D19;
border-radius: 9999px;
padding: 8px 20px;
background: #FFD166;
box-shadow: 4px 4px 0px #2D1D19,
            inset -3px -3px 8px 0px rgba(45, 29, 25, 0.12),
            inset 0px 4px 10px 0px rgba(255, 255, 255, 0.5);
font-family: 'Nunito', sans-serif;
font-weight: 700;
```

### 포스트 리스트

**A. 카드 그리드 (Brutal 스타일):**
- 2-3 컬럼 그리드
- 카드마다: 컬러 배경 + 썸네일 + 제목 + 발췌 + pill 태그
- 카드 배경에 약간의 색상 변화 (우리는 Off-White / bg-secondary / Yellow 교대)

**B. 수직 리스트 (미니멀 네오브루탈):**
- 단일 컬럼, 각 포스트가 보더 있는 행
- 제목 + 날짜 + 설명, 수평 구분선으로 분리

### 헤더

- 로고/사이트명: 볼드, 오버사이즈 타이포 (좌)
- 네비게이션: pill 버튼 또는 밑줄 텍스트 (우)
- 전폭 배경: 액센트 컬러 또는 하단 3px 보더
- 그라디언트/블러/글라스모피즘 금지

### 푸터

- 상단 3px solid 보더
- 미니멀: 저작권 + 소셜 아이콘 (호버 시 오프셋 그림자)

---

## 9. 적용 전략

AstroPaper의 구조(라우팅, 콘텐츠 컬렉션, SEO, 검색)는 유지하고, CSS만 MUSU V2 스타일로 덮어씌우는 방식.

### 수정 대상 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/styles/global.css` | 네오브루탈 base 스타일 (border, shadow, radius) |
| `src/components/Card.astro` | 포스트 카드에 3px border + offset shadow |
| `src/components/Header.astro` | 헤더 하단 border, 로고 스타일 |
| `src/components/Footer.astro` | 푸터 상단 border |
| `src/components/Tag.astro` | Pill 태그 스타일 |
| `src/pages/index.astro` | 홈페이지 레이아웃 (카드 그리드?) |
| `src/styles/typography.css` | prose 스타일 (blockquote, code 등) |

### 우선순위

1. **카드** — 포스트 카드에 네오브루탈 스타일 (가장 눈에 띄는 변화)
2. **헤더/푸터** — 사이트 프레임
3. **태그 pill** — 작지만 강한 브랜드 시그널
4. **버튼** — CTA, 네비게이션
5. **코드 블록** — 기술 블로그의 핵심 요소
6. **다크모드** — Cocoa Brown 배경에서의 Yellow border/accent

---

## Sources

- [Brutal Astro Theme](https://brutal.elian.codes/)
- [Gumroad](https://gumroad.com/)
- [Kristi.Digital](https://kristi.digital/)
- [Neobrutalism Blog Template](https://neobrutalism-blog.netlify.app/)
- [Panda CSS](https://panda-css.com/)
- [Claymorphism Generator (Hype4)](https://hype4.academy/tools/claymorphism-generator)
- [clay.css](https://codeadrian.github.io/clay.css/)
- [Claymorphism in UI (Hype4)](https://hype4.academy/articles/design/claymorphism-in-user-interfaces)
- [RetroUI](https://www.retroui.dev/)
- [Neobrutalism.dev](https://www.neobrutalism.dev/)
- [Fractal Design System](https://fractal.snowball.xyz/)
- [Awesome Neobrutalism (GitHub)](https://github.com/ComradeAERGO/Awesome-Neobrutalism)
- [Josh W. Comeau](https://www.joshwcomeau.com/)
- [Overreacted](https://overreacted.io/)
- [Astro Devosfera](https://github.com/0xdres/astro-devosfera)
- [20 Neobrutalism Examples](https://www.downgraf.com/inspiration/20-neobrutalism-web-design-examples-that-break-all-the-rules/)
- [16 Neo Brutalist Examples](https://reallygooddesigns.com/neo-brutalist-website-examples/)
- [NN/G Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)
