# pencil.dev 실전 사용 가이드

> 리서치 일자: 2026-03-21 | 3개 에이전트 병렬 리서치

---

## 한줄 요약

pencil.dev = IDE 안에서 디자인하고 .pen(JSON) 파일로 Git에 저장하며, MCP로 Claude Code가 디자인을 읽고 쓸 수 있는 **AI 네이티브 디자인 도구**. 100K+ 유저, a16z 투자, 현재 무료.

---

## 1. 설치 & 셋업

### 설치 방법 3가지
| 방법 | 설치 | 비고 |
|------|------|------|
| **VS Code 익스텐션** | Extensions → "Pencil" 검색 → `highagency.pencildev` 설치 | 가장 추천 |
| **Cursor 익스텐션** | 동일 과정 | Cursor Pro 구독 필요할 수 있음 |
| **데스크톱 앱** | pencil.dev/downloads → .dmg(Mac)/.deb(Linux)/.exe(Win) | 독립 실행 |

### 첫 셋업 순서
1. 익스텐션/앱 설치
2. 이메일 입력 → 활성화 코드 수신 → 입력
3. Claude Code CLI 설치: `npm install -g @anthropic-ai/claude-code-cli`
4. Claude 인증: 터미널에서 `claude` 실행 → 브라우저 인증
5. `.pen` 파일 생성/열기 → 캔버스 자동 열림
6. 캔버스 우클릭 → "Open Welcome File"로 온보딩

### MCP 서버 (자동 설정)
- Pencil 열면 **MCP 서버 자동 시작** — 수동 설정 불필요
- Claude Code에서 `/mcp` 명령으로 연결 확인
- Cursor: Settings → Tools & MCP에서 "pencil" 확인

### 수동 설정이 필요한 경우 (Claude Desktop)
```json
{
  "mcpServers": {
    "pencil": {
      "command": "/Users/<user>/.vscode/extensions/highagency.pencildev-0.6.33/out/mcp-server-darwin-arm64",
      "args": ["--app", "visual_studio_code"],
      "type": "stdio"
    }
  }
}
```

바이너리 경로 패턴: `mcp-server-<platform>-<arch>` (darwin-arm64, linux-x64, win32-x64 등)

---

## 2. 캔버스 사용법

### 인터페이스
- **왼쪽 툴바**: 프레임, 도형, 텍스트 도구
- **중앙 캔버스**: 무한 작업 공간 (팬/줌)
- **왼쪽 레이어 패널**: 계층 구조, 이름 변경(더블클릭), 가시성 토글
- **오른쪽 속성 패널**: 선택 시 나타남 — 정렬, 레이아웃, 외관, 채우기, 선, 효과, 내보내기

### 바운딩 박스 색상
- 🔵 파란색: 일반 요소
- 🟣 마젠타: 컴포넌트 원본 (소스)
- 🟣 보라색: 컴포넌트 인스턴스

### 요소 추가
- **텍스트**: 툴바 텍스트 도구
- **도형**: 사각형, 원, 선, 다각형, 패스
- **이미지**: **드래그&드롭이 가장 안정적** (File 메뉴는 macOS에서 불안정할 수 있음)
- **아이콘**: 내장 Material Icons 라이브러리
- **컴포넌트**: Assets 패널 (레이어 패널의 Libraries 아이콘)
- **UI 킷**: 4개 내장 — **Shadcn UI**, **Halo**, **Lunaris**, **Nitro**

### 프레임 (핵심 개념)
- 관련 요소를 그룹화하는 구조 컨테이너 = 화면 경계 정의
- 생성: `Cmd/Ctrl + Option/Alt + G`
- **중요: 이름 있는 프레임 안에 넣어야 MCP가 접근 가능** — 이름을 의미 있게 짓기

### Figma 임포트
- Figma에서 복사 → Pencil에 붙여넣기 → 레이어, Auto-Layout, 스타일 보존
- **⚠️ 이미지는 복사 안 됨** — SVG로 내보내거나 별도 임포트
- **⚠️ 1단계 프레임만 정상 임포트** — 중첩 콘텐츠는 플래튼될 수 있음
- Figma 플러그인: "Pencil.dev / .pen file import", "Pencil to Figma Importer"

### 레이아웃 시스템
- Flexbox 스타일: `layout`(none/vertical/horizontal), `gap`, `padding`, `justifyContent`, `alignItems`
- 최상위 = 절대 위치(`x`/`y`), 중첩 = 부모 기준 상대 위치
- 크기: 고정(`width`/`height`) 또는 동적(`fit_content`, `fill_container`)

### 핵심 단축키

| 동작 | 단축키 |
|------|--------|
| **AI 프롬프트 패널** | `Cmd/Ctrl + K` |
| 선택 | 클릭 |
| 깊은 선택 | `Cmd/Ctrl + 클릭` |
| 다중 선택 | `Shift + 클릭` |
| 전체 선택 | `Cmd/Ctrl + A` |
| 부모 선택 | `Shift + Enter` |
| 컴포넌트 생성 | `Cmd/Ctrl + Option/Alt + K` |
| 그룹 | `Cmd/Ctrl + G` |
| 프레임 생성 | `Cmd/Ctrl + Option/Alt + G` |
| 복제 | `Cmd/Ctrl + D` |
| 캔버스 이동 | `Space + 드래그` |
| 줌 | `Cmd/Ctrl + 스크롤` |
| 화면에 맞춤 | `Cmd/Ctrl + 0` |
| 저장 | `Cmd/Ctrl + S` |
| 명령 팔레트 | `Cmd/Ctrl + Shift + P` |

---

## 3. MCP 도구 (12개 확인)

Claude Code에서는 `mcp__pencil__<tool_name>` 형태로 호출.

### 읽기 도구
| 도구 | 역할 | 파라미터 |
|------|------|---------|
| `batch_get` | 디자인 트리 읽기, 노드 검색, 컴포넌트 구조 조회 | `filePath`, `nodeIds`, `patterns`, `readDepth`, `resolveInstances`, `resolveVariables` |
| `get_screenshot` | 노드/프레임의 비주얼 프리뷰 렌더링 | `nodeId` |
| `get_editor_state` | 현재 에디터 상태 (활성 파일, 선택 정보) | — |
| `get_variables` | .pen 파일의 디자인 토큰/변수 읽기 | `filePath` |
| `get_style_guide_tags` | 사용 가능한 스타일 가이드 카테고리 목록 | — |
| `get_style_guide` | 선택된 스타일 태그로 비주얼 방향 가져오기 | `tags` (array) |
| `get_guidelines` | 디자인 가이드라인 조회 | `topic`: design-system, code, tables, tailwind, landing-page |

### 쓰기 도구
| 도구 | 역할 | 파라미터 |
|------|------|---------|
| `batch_design` | 노드 생성/수정/이동/삭제 (AI의 "손") | operations array (max 25). type: I/U/R/D/M |
| `set_variables` | 디자인 토큰 업데이트 (컬러, 타이포, 간격) | 변수 정의 |

### 분석 도구
| 도구 | 역할 |
|------|------|
| `snapshot_layout` | 레이아웃 분석, 클리핑/오버플로 감지 (`problemsOnly: true` 지원) |
| `open_document` | .pen 파일 열기 |
| `find_empty_space_on_canvas` | 새 화면 배치할 빈 공간 찾기 |

### batch_design 상세
```json
{
  "operations": [
    { "type": "I", "targetId": "parent_frame", "node": { "type": "text", "name": "hero_title", "content": "청송 꿀사과" } },
    { "type": "U", "targetId": "hero_title", "props": { "fill": [{ "type": "solid", "color": "#FF0000" }] } },
    { "type": "D", "targetId": "old_element" },
    { "type": "M", "targetId": "element_to_move", "parentId": "new_parent" }
  ]
}
```

---

## 4. AI 워크플로우

### 기본 워크플로우 (Claude Code + Pencil)
1. Pencil 열기 → `.pen` 파일 생성/열기
2. `Cmd/Ctrl + K` → AI 프롬프트 패널
3. 자연어로 디자인 지시 → AI가 MCP로 캔버스에 디자인 생성
4. `.pen` 파일에 변경사항 즉시 반영
5. 후속 프롬프트로 반복 수정
6. 최종 디자인 → 코드 생성 요청

### SWARM 모드 (6개 동시 에이전트)
- **최대 6개 AI 에이전트**가 하나의 캔버스에서 동시 작업
- 각 에이전트가 같은 브리프를 받지만 **서로 다른 방향** 생성
- 에이전트별 **커서가 실시간으로 보임**
- 마스터 에이전트 없음 — 모두 독립 작업
- 작업 중 사람이 수동 편집 가능
- 추천 모델: **Opus 4.6** (크리에이티브)
- 일반적 결과: 6개 중 2개 우수, 2개 양호, 1개 무난, 1개 미스
- **활성화**: 여러 에이전트 채팅 탭 열기

### 추천 워크플로우 (커뮤니티 검증)
1. **탐색 (10분)**: 6개 에이전트에 같은 브리프 + 스타일 킷 → 6개 방향 비교
2. **선택**: 최고 방향 픽
3. **정제 (20분)**: 단일 에이전트로 구체적 수정 반복
4. **코드 내보내기**: Claude Code가 MCP로 최종 디자인 읽고 코드 생성

### 5단계 디자인 시스템 워크플로우 (커뮤니티 스킬)
1. 아이디어 발견 — 제품 비전 수집
2. 영감 & 스타일 방향 — `get_style_guide_tags()`, 컬러, 타이포
3. 브랜드 방향 in Pencil — 2~3개 브랜드 보드를 .pen으로
4. 디자인 시스템 컴포넌트 — `set_variables`, 재사용 컴포넌트 빌드
5. 핵심 화면 — 컴포넌트 사용해서 디자인, 데스크톱 우선

### 잘 먹히는 프롬프트 예시
```
디자인 생성:
"Design a dashboard with sidebar and main content area"
"Create a pricing table with 3 tiers"
"Design a web app for managing rocket launches. Use a technical style."
"Design a mobile app for tracking music royalties. Scandinavian minimalistic style."

수정:
"Change all primary buttons to blue"
"Make the sidebar narrower"
"Look at the selected design. Change it to light mode."
"Let's go more bold — make the headline much larger, Swiss layout."

코드 연동:
"Look at the dashboard.pen file and generate a React component"
"Generate Next.js 14 code with Tailwind CSS using Shadcn UI components"
"Create Tailwind config from these variables"
```

### 중요 팁
- **스타일 킷 반드시 첨부** — 없으면 범용 결과
- **프레임에 의미 있는 이름** — MCP로 전달됨
- **프레임 안에서 디자인** — 프레임 밖 요소는 MCP 접근 어려움
- **Pencil 먼저 시작, Claude Code 나중** — 순서 바뀌면 MCP 연결 안 됨
- **수동 저장** (`Cmd/Ctrl + S`) — 자동 저장 없음
- **구체적 프롬프트** — "make it better" ❌ → "padding 16px, color blue" ✅

---

## 5. 코드 생성

### 지원 프레임워크
React (JS/TS), Next.js, Vue, Svelte, HTML/CSS

### 스타일링 옵션
Tailwind CSS (추천), CSS Modules, Styled Components, plain CSS

### 컴포넌트 라이브러리
Shadcn UI, Radix UI, Chakra UI, Material UI, 커스텀

### 코드 생성 방법
1. Pencil에서 `Cmd/Ctrl + K`
2. 또는 Claude Code CLI: `claude 'Generate HTML, CSS, JavaScript from dashboard.pen'`
3. 명시적으로: "Generate Next.js 14 code with Tailwind CSS using Shadcn UI components"

### 생성 품질
- 충실도 매우 높음: "Same colors. Same spacing. Same font weights."
- 복잡한 레이아웃에서 4~8px 정렬 차이 가능
- **반응형은 자동 아님** — 프롬프트에 명시 필요
- ARIA 라벨, 접근성 속성 포함

---

## 6. .pen 파일 포맷

### JSON 구조
```json
{
  "version": "...",
  "themes": { },
  "imports": [ ],
  "variables": {
    "color.primary": { "type": "color", "value": "#FF0000" }
  },
  "children": [
    {
      "id": "frame_1",
      "type": "frame",
      "name": "Hero Section",
      "width": 1440,
      "height": 800,
      "children": [ ... ]
    }
  ]
}
```

### 노드 타입
`rectangle`, `ellipse`, `line`, `polygon`, `path`, `frame`, `group`, `text`, `note`, `prompt`, `context`, `icon_font`, `ref`

### 컴포넌트
- `"reusable": true` → 컴포넌트 생성
- 인스턴스: `"type": "ref"`, `"ref": "component_id"`
- 오버라이드: `descendants`로 ID 경로 지정

### 변수 바인딩
- 달러 접두사: `"$color.primary"`
- 테마 지원: 테마 축에 따른 조건부 값

### Git 버전 관리
- 순수 JSON → diff 의미 있고 읽기 가능
- 브랜치, 머지 = 코드처럼
- ⚠️ 포맷이 아직 변동 중 (breaking changes 가능)

---

## 7. 고급 기능

### 디자인 라이브러리
1. 컴포넌트가 있는 `.pen` 파일 생성
2. 레이어 패널 → Libraries → "Turn this file into a library"
3. `.lib.pen`으로 변환 (되돌릴 수 없음)
4. 다른 파일에서 임포트 → 변경사항 전파

### Pencil CLI (실험적)
```bash
pencil --agent-config config.json
```

```json
[
  {
    "file": "path/to/design.pen",
    "prompt": "Design a dashboard...",
    "model": "claude-4.6-opus",
    "attachments": ["brand-guide.md", "reference.jpg"]
  }
]
```
- 여러 Pencil 창 동시 실행
- **빈 .pen 파일을 미리 생성해야 함** — CLI가 파일 생성 불가
- 모델: `claude-4.5-haiku`, `claude-4.5-sonnet`, `claude-4.6-opus`
- 서버사이드/에이전틱용 headless npm 패키지 개발 중

### 이미지 처리
- 드래그&드롭: PNG/JPEG/SVG
- AI 프롬프트로 Unsplash 이미지
- 내보내기: PNG, JPEG, WEBP, PDF (속성 패널)

---

## 8. 알려진 한계 & 해결법

### 못하는 것
| 한계 | 해결법 |
|------|--------|
| 자동 저장 없음 | `Cmd/Ctrl + S` 자주 저장 |
| 실시간 협업 없음 | Git 브랜치/PR 사용 |
| 브라우저 버전 없음 | 로컬 앱 + Claude CLI 필요 |
| 인터랙티브 프로토타입 없음 | Figma에서 프로토타입 |
| 반응형 자동 아님 | 프롬프트에 "responsive with Tailwind breakpoints" 명시 |
| Figma 이미지 복사 안 됨 | SVG로 내보내기 후 임포트 |
| 앱 내 버전 히스토리 없음 | Git 커밋으로 대체 |

### 알려진 버그 (2026.3)
- `get_style_guide_tags`의 JSON Schema 버그 — Claude Code 세션 전체 도구 호출 크래시 가능 (이슈 #31855)
- macOS File 메뉴 이미지 임포트 실패 → 드래그&드롭 사용
- 큰 Figma 임포트 실패 가능 → 섹션별로 복사
- Pencil이 `config.toml` 수정할 수 있음 → 백업 먼저

---

## 9. 커뮤니티 & 리소스

### 공식
- 프롬프트 갤러리: [pencil.dev/prompts](https://www.pencil.dev/prompts) (12개 예시)
- 문서: [docs.pencil.dev](https://docs.pencil.dev)
- GitHub: [github.com/pencil-dev](https://github.com/pencil-dev) (13 repos)
- VS Code: `highagency.pencildev` (85K+ 설치)

### Claude Code 스킬
- [디자인 시스템 생성 스킬 (5단계)](https://gist.github.com/TobyScr/cc30eba6541a1e7174076dd2667b96a7)
- [pencil-to-code 스킬](https://www.skillavatars.com/skills/pencil-to-code)
- [batch_design 스킬](https://lobehub.com/es/skills/partme-ai-pencil-skills-pencil-mcp-batch-design)

### 블로그/튜토리얼
- [DevelopersIO: Claude Code + Pencil MCP 워크스루](https://dev.classmethod.jp/en/articles/claude-code-pencil-mcp-web-design/) — 5개 프로토타입 제작
- [Atal Upadhyay: Pencil + Claude Code 워크플로우](https://atalupadhyay.wordpress.com/2026/02/25/pencil-dev-claude-code-workflow-from-design-to-production-code-in-minutes/) — 3개 랩
- [Mejba Ahmed: 6 에이전트 디자인 팀](https://www.mejba.me/blog/pencil-ai-design-tool-claude-code)
- [Better Stack: 에이전트 기반 디자인 가이드](https://betterstack.com/community/guides/ai/pencil-ai/)

### 한국어 콘텐츠
- [GPTers: "pencil MCP 써본 소름돋는 후기"](https://www.gpters.org/nocode/post/creepy-review-using-pencil-rJbPnFhdVQR6871)
- [GPTers: "코드베이스만 던졌더니 와이어프레임부터 프로토타입까지"](https://www.gpters.org/dev/post/pencildev-claude-code-just-poDgFWFCc6hA9uC) — 17화면 완성
- [브런치: "Pencil.dev로 디자인과 개발을 동시에"](https://brunch.co.kr/@ghidesigner/411)
- [MobiInside: 인공지능 시대의 디자인](https://www.mobiinside.co.kr/2026/02/11/pencil-dev/)
- [TechTaek: Pencil.dev vs Google Stitch](https://techtaek.com/pencil-dev-vs-google-stitch-1%ec%9d%b8-%ea%b0%9c%eb%b0%9c%ec%9e%90-%eb%94%94%ec%9e%90%ec%9d%b8%ed%88%b4-%eb%ad%98-%ec%84%a0%ed%83%9d%ed%95%b4%ec%95%bc-%ed%95%a0%ec%a7%80-%ea%b3%a0%eb%af%bc/)
- [bkamp.ai: Pencil.dev 완벽 가이드](https://bkamp.ai/ko/recipes/1f8fecbc-c897-430e-b64b-ff6d70cd361b)
- [YouTube @prof_yoohs: Figma/Cursor/Claude Code 연동](https://youtu.be/7IRFzZyrKOE)

### 오픈소스 대안
- **OpenPencil** ([github.com/open-pencil/open-pencil](https://github.com/open-pencil/open-pencil)) — MIT, .fig 파일 읽기, 90+ MCP 도구

---

## 10. Pencil vs 경쟁 도구

| 기능 | Pencil | Figma | v0/Bolt/Lovable | Framer |
|------|--------|-------|-----------------|--------|
| 실시간 협업 | ❌ (Git) | ✅ | ✅ | ✅ |
| 버전 히스토리 | Git | 내장 | 내장 | 내장 |
| AI 에이전트 | 6개 SWARM | 제한적 | 1개 | 제한적 |
| Git 통합 | 네이티브 (.pen=JSON) | ❌ | ❌ | ❌ |
| 코드 생성 | 네이티브 (MCP+AI) | 플러그인 | 네이티브 | 부분 |
| 풀스택 | ❌ 프론트엔드만 | ❌ | ✅ | 부분 |
| 브라우저 | ❌ | ✅ | ✅ | ✅ |
| 가격 | 무료 | Freemium | 유료 | 유료 |
| **핵심 차별점** | 디자인이 코드 옆에 살고, AI가 JSON으로 직접 조작 | 팀 협업 표준 | 앱 빌더 | 웹사이트 빌더 |
