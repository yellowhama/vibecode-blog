# pencil.dev 딥 리서치

> 리서치 일자: 2026-03-21

---

## 핵심 발견: "pencil"은 2개의 완전히 다른 제품

| | **pencil.dev** | **trypencil.com** |
|---|---|---|
| 정체 | AI 디자인→코드 도구 (개발자용) | GenAI 광고 크리에이티브 플랫폼 (마케터용) |
| 도메인 | pencil.dev | trypencil.com |
| 출력 | HTML/CSS/React 코드 + .pen 디자인 파일 | 광고 이미지/영상/카피 |
| MCP | **있음** (내장 MCP 서버) | 없음 |
| 가격 | **무료** (얼리 액세스) | $100/월(Core)~$500/월(Pro) |
| 투자 | a16z Speedrun | 별도 |

**글에서 다뤄야 할 건 pencil.dev (디자인→코드 도구)**

---

## pencil.dev 실제 모습

### 한줄 설명
"Design on canvas. Land in code." — IDE(VS Code/Cursor) 안에서 디자인하고 바로 코드로 변환

### 핵심 기능
- **Infinite Canvas**: IDE 안에서 비주얼 UI 디자인
- **실시간 코드 생성**: 디자인 → HTML, CSS, React, Next.js, Vue, Svelte
- **스타일링**: Tailwind CSS, CSS Modules, Styled Components, plain CSS
- **Figma 임포트**: Figma 복붙 → 스타일/간격/레이어 보존
- **Git 네이티브**: `.pen` 파일 = JSON → diff, branch, merge 가능
- **MCP 서버 내장**: AI가 디자인을 프로그래밍적으로 생성/조작
- 현재 **100% 무료** (얼리 액세스)

### 타겟
프론트엔드 개발자, 바이브 코더. 디자인 없이 코드만 쓰던 사람이 비주얼 작업까지.

---

## MCP 연동 방식

### 아키텍처
- Pencil 실행 시 **MCP 서버 자동 시작** (별도 서버 불필요)
- Transport: `stdio`
- VS Code 익스텐션 설치 시 **MCP 설정 자동 구성**

### 설정 예시 (`.claude.json`)
```json
{
  "mcpServers": {
    "pencil": {
      "command": "/path/to/pencil/mcp-server",
      "args": ["--app", "visual_studio_code"],
      "type": "stdio"
    }
  }
}
```

### MCP 도구 목록 (확인된 것)
- `read_canvas` — 현재 캔버스 상태 읽기
- `get_selected_frame` — 선택된 프레임/요소 가져오기
- `get_style_guide` — 디자인 토큰/스타일 정보 검색
- 프레임 추가, 컴포넌트 삽입, 스타일 적용, 레이아웃 배치 등

### 호환 AI 클라이언트
Claude Code, Claude Desktop, Cursor, Windsurf, OpenAI Codex CLI, Antigravity IDE, OpenCode CLI

### 실제 워크플로우 (Claude Code + Pencil)
1. VS Code에서 Pencil 익스텐션 설치
2. Claude Code가 Pencil MCP 서버 자동 감지
3. 프롬프트: "로그인 폼 만들어줘"
4. Claude Code → Pencil MCP → 캔버스에 디자인 생성
5. `.pen` 파일이 프로젝트에 저장됨
6. "이 디자인을 React/Tailwind로 변환해줘"
7. Claude가 캔버스를 MCP로 읽어서 코드 생성
8. `.pen` + 생성된 코드를 Git에 커밋

---

## 상세페이지에 쓸 수 있나?

### 할 수 있는 것
- 자연어 → **웹 UI** 생성 (랜딩페이지, 대시보드, 폼, 카드, 내비게이션)
- 프로덕션 레디 React/HTML/CSS/Tailwind 출력
- Figma 디자인 임포트 → 코드 변환

### 할 수 없는 것
- ❌ **이커머스 전용 템플릿 없음** (상세페이지 레이아웃 프리셋 없음)
- ❌ **이미지 합성/포토 처리 불가** (벡터/UI 도구, 사진 합성 도구 아님)
- ❌ **한국 타이포/레이아웃 프리셋 없음** (긴 스크롤 상세페이지 형식)
- ❌ **이미지 포맷 직접 출력 불가** (쿠팡/네이버용 JPEG/PNG 롱스크롤)

### 솔직한 판정

**상세페이지 자동화 도구로는 부적합.** 이유:

1. **출력 포맷 불일치**: pencil.dev = 코드(HTML/React). 한국 마켓플레이스 상세페이지 = 이미지(JPEG/PNG 롱스크롤). 중간에 puppeteer로 스크린샷 찍는 추가 단계 필요.
2. **한국 커머스 템플릿 없음**: 한국 마켓플레이스가 기대하는 상세페이지 레이아웃 패턴 없음.
3. **사진 처리 불가**: 상세페이지의 70%는 제품 사진+스타일링 배경. pencil.dev는 벡터/UI 도구.

**적합한 상황**: 직접 웹사이트(Shopify PDP, Next.js 자사몰)의 **웹 컴포넌트를 만들 때**는 pencil.dev + Claude Code가 훌륭함.

---

## 대안: MCP 연동 가능한 디자인 도구

### Figma MCP Server (공식)
- 공식 MCP 서버로 Claude Code → Figma 직접 연동
- 디자인 읽기, 코멘트, 토큰 관리, 협업 자동화
- 무료 Figma 플랜에서도 사용 가능
- **장점**: 팀 협업, 업계 표준
- **단점**: 디자이너 워크플로우. 비디자이너에겐 러닝커브

### Canva MCP Server (공식)
- AI 에이전트 → Canva 계정 직접 연동
- 디자인 생성, 템플릿 자동 채우기, 검색, PDF/이미지 내보내기
- **Canva Enterprise 필요** (API 접근)
- **장점**: 템플릿 기반 → 상세페이지에 가장 적합한 MCP 디자인 도구
- **단점**: Enterprise 가격

### Framer MCP Server
- AI → Framer 프로젝트 연동
- 컬러 스타일 업데이트, React 코드 내보내기, 컴포넌트 삽입
- WebSocket 터널 + 액션별 명시적 승인
- **장점**: 마케팅 사이트/랜딩페이지에 최적
- **단점**: 상세페이지 전용은 아님

---

## 한국 상세페이지 전용 도구 (MCP 없음, 하지만 목적에 맞음)

| 도구 | 특징 | 가격 |
|------|------|------|
| **드랩아트** | 한국 커머스 상세페이지 전용. 제품 사진→10~20페이지 자동 생성. 대화형 수정 | 무료 3회 |
| **망고보드 AI** | 키워드→AI 디자인 10~20페이지. 배경제거+카피+이미지→영상 | 무료 3회 |
| **가비아 AI 에디터** | 상품명→AI 레이아웃+카피. HyperCLOVA 기반 | — |
| **에디봇 (카페24)** | 500만건+. 이미지→카테고리 인식→템플릿 적용 | 카페24 전용 |

---

## 글에서의 처리 방향

### 기존 문제
글에서 pencil.dev를 "선택" 섹션에서 상세페이지 렌더링 도구로 소개 → 부정확

### 수정 방향
1. **pencil.dev는 "웹 컴포넌트 생성 도구"로 정확히 포지셔닝**
   - 자사몰/웹사이트 PDP를 코드로 만들 때는 최적
   - 마켓플레이스(쿠팡/네이버) 이미지 상세페이지와는 다른 용도
2. **한국 마켓플레이스 상세페이지**가 목적이면 → 드랩아트, 망고보드, 에디봇 추천
3. **MCP 기반 디자인 자동화**가 필요하면 → Canva MCP(Enterprise) 또는 Figma MCP
4. **전체 프로그래밍 파이프라인**이면 → HTML 템플릿 + Puppeteer로 이미지 변환

### 글에서의 가치
pencil.dev의 **MCP 연동 워크플로우 자체**는 AI 자동화의 좋은 예시. "도구를 프로그래밍적으로 조작하는" 패턴을 보여주는 용도로 활용 가능. 단, "상세페이지를 만드는 도구"라고 포지셔닝하면 안 됨.
