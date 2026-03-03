# 031. Claude Code 사용 매뉴얼 종합편

# Claude Code 사용 매뉴얼 종합편

**6개월 삽질을 27분으로 압축한 36가지 팁 - 초급부터 마스터까지**

---

## TL;DR (3줄 요약)

- **Claude Code는 "저장 버튼 달린 ChatGPT"가 아니다.** 제대로 쓰면 일주일치 개발을 몇 시간에 끝낸다.
- **CLAUDE.md + Planning Mode + Git Worktrees** = 이 세 가지가 핵심이다.
- **초급 → 중급 → 고급** 순서로 익히면 누구나 Claude Code 마스터가 된다.

---

## 들어가며: 나도 처음엔 틀렸다

6개월 전, Claude Code를 처음 썼을 때.

"이거 그냥 ChatGPT 터미널 버전 아냐?"

대충 프롬프트 치고, 결과물 복붙하고, 에러 나면 다시 물어보고.

**자동차 사놓고 페달을 열심히 돌려 달리는 격이었다.**

지금은?

Claude Code 인스턴스 3개를 동시에 돌린다. 각각 다른 기능을 개발한다.

일주일치 작업이 몇 시간에 끝난다.

이 글은 그 6개월의 삽질을 정리한 36가지 팁이다.

---

# LEVEL 1: 초급 - 기초 다지기

> "기초가 탄탄해야 고수가 된다"
> 

---

## 🔧 설치와 셋업 (팁 1-3)

### 팁 1: 로컬 설치가 기본이다

```bash
npm install -g @anthropic-ai/claude-code

```

끝. 이게 가장 흔한 방법이다.

터미널 열고, 작업 폴더로 가서 `claude` 치면 시작.

### 팁 2: 원격 서버에도 설치된다

AWS, Digital Ocean, Hertzner... 어디든.

Python이나 Node 설치하듯이 Claude Code도 설치하면 된다.

**꿀팁**: Termius 앱 쓰면 폰으로도 Claude Code 조종 가능하다.

출퇴근 지하철에서 "야 저거 수정해" 가능.

### 팁 3: Cursor, VS Code 안에서도 쓴다

터미널 무서우면? IDE 안에서 써도 된다.

Cursor나 VS Code의 내장 터미널에서 `claude` 치면 똑같이 작동한다.

---

## 📋 To-Do 리스트의 마법 (팁 4)

### 팁 4: Claude Code의 진짜 강점

다른 AI 코딩 도구들? 바로 코드부터 짠다.

Claude Code? **먼저 To-Do 리스트를 만든다.**

```
✓ 1. 프로젝트 구조 분석
✓ 2. 필요한 파일 목록 작성
→ 3. app.py 생성 중...
  4. 테스트 코드 작성
  5. 문서화

```

이게 왜 중요하냐?

- 복잡한 작업도 루프에 안 빠진다
- 이전 작업을 지우지 않는다
- 뭘 하고 있는지 눈에 보인다

프롬프트에 "To-Do 리스트 만들어서 진행해"라고 명시하면 더 확실하다.

---

## 💻 필수 명령어들 (팁 5-10)

### 팁 5: Bash 모드 활용

Claude Code 안에서 바로 bash 명령어 실행 가능.

```bash
# 폴더 내 모든 파일 읽어서 컨텍스트로 쓰기
"src 폴더의 모든 파일 읽어서 구조 파악해"

```

나가지 않아도 된다. Claude가 알아서 `ls`, `cat`, `git` 다 친다.

### 팁 6: 즉석 문서화

```
"이 프로젝트 구조 분석해서 architecture.md로 저장해"

```

새 프로젝트 인수인계 받았을 때? 10분이면 전체 구조 파악 끝.

2주 전에 만들었는데 뭐가 뭔지 모르겠을 때? 5분이면 기억 복구.

### 팁 7: 세션 이어가기

```bash
claude --resume

```

어제 하던 거 이어서 하고 싶으면 `--resume` 플래그.

컨텍스트가 살아있다.

### 팁 8: Auto Accept 모드

매번 "y" 누르기 귀찮다고?

**Shift + Tab** 누르면 Auto Accept 모드.

Claude가 물어보지 않고 바로바로 실행한다.

⚠️ 주의: 믿을 수 있을 때만 쓰자. Production 폴더 날릴 수도 있다.

### 팁 9: 모델 스위칭

```
/model

```

- **Opus**: 복잡한 분석, 어려운 버그 잡을 때
- **Sonnet**: 루틴 작업, 토큰 아끼고 싶을 때
- **Opus Plan Mode**: Opus로 계획, Sonnet으로 실행 (내 최애)

기본값은 "Opus 50% 쓸 때까지 Opus, 그 이후 Sonnet".

### 팁 10: 중단의 기술

**ESC 한 번**: Claude 작업 중단
**ESC 두 번**: 이전 프롬프트로 돌아가기

Claude가 이상한 방향으로 가고 있다? 빨리 끊어.

토큰 아끼는 게 돈 아끼는 거다.

---

## 🐛 디버깅 (팁 11-13)

### 팁 11: 스크린샷 던지기

UI 버그? 캡처해서 Claude한테 던져.

```
"이 스크린샷 봐. 버튼이 이상하게 나오는데 왜 그래?"

```

Claude가 이미지 인식한다. 어디가 문제인지 바로 찾는다.

디자인 시안 던져서 구현해달라고 해도 된다.

### 팁 12: 테스트 먼저 짜게 하기

```
"이 기능 테스트 코드 먼저 짜줘"

```

버그 잡기 쉬워진다. 나중에 뭐 바꿔도 테스트가 잡아준다.

구현 세부사항보다 **전체 흐름 테스트**에 집중하라고 하자.

### 팁 13: TDD로 개발하기

```
"로그인 기능 만들 건데, 테스트 먼저 짜고 그다음 구현해"

```

Test Driven Development.

테스트 → 구현 → 리팩토링 순서로 하면 버그가 줄어든다.

---

## 📄 CLAUDE.md - 프로젝트의 뇌 (팁 14-15)

### 팁 14: CLAUDE.md가 뭔데?

**프로젝트의 "이 인간 사용설명서"다.**

Claude Code가 매번 자동으로 읽는 파일.

```markdown
# CLAUDE.md

## 기본 규칙
- Python 3.11 사용
- 테스트는 pytest로
- production 폴더 절대 건드리지 마

## Git 워크플로우
- feature 브랜치 따서 작업
- main 직접 푸시 금지

## 코딩 스타일
- snake_case 함수명
- 4 spaces 들여쓰기

```

이거 있으면?

- "Python으로 짜" 안 해도 Python으로 짠다
- "테스트 써" 안 해도 테스트 쓴다
- main에 실수로 푸시 안 한다

**수백 번의 반복 설명이 사라진다.**

### 팁 15: Claude한테 CLAUDE.md 만들게 하기

직접 쓰기 귀찮다고?

```
"이 프로젝트 분석해서 CLAUDE.md 만들어줘"

```

Claude가 프로젝트 구조 파악하고 알아서 써준다.

쓰다가 마음에 안 드는 거?

```
"CLAUDE.md에 이거 추가해: Rust도 쓴다"
"너무 길어. 100줄 이하로 줄여"

```

---

## 💬 효율적인 프롬프팅 (팁 16)

### 팁 16: 긴 프롬프트는 파일로

터미널에서 긴 프롬프트 치기 힘들다.

마크다운 파일로 만들어서 @ 기호로 참조.

```
@요구사항.md 이거 보고 구현해줘

```

깔끔하다. 수정도 쉽다. 재사용도 된다.

---

# LEVEL 2: 중급 - 워크플로우 강화

> "기초는 됐다. 이제 진짜 일을 해보자"
> 

---

## 🧠 Planning Mode (팁 17-19)

### 팁 17: 계획 먼저, 코딩은 나중

복잡한 기능? 바로 코딩하면 망한다.

**Tab + Shift** 눌러서 Planning Mode 켜기.

```
"사용자 인증 시스템 만들 건데, 먼저 계획 짜줘"

```

Claude가 계획서를 보여준다. 검토하고 "좋아 진행해"라고 하면 그때 코딩.

아키텍처 결정, 복잡한 버그 수정할 때 필수.

### 팁 18: Opus Plan Mode

```
/model → Opus Plan Mode 선택

```

**Opus가 계획**, **Sonnet이 실행**.

비싼 모델로 머리 쓰고, 저렴한 모델로 손발 쓰는 거다.

최고의 가성비.

### 팁 19: 서브에이전트로 여러 계획 비교

```
"이 버그 고치는 방법 3가지 계획 만들어. 서브에이전트 써서."

```

Claude가 3개의 다른 접근법을 만들어서 비교해준다.

팀 브레인스토밍 하듯이.

---

## 🧠 Think 키워드 (팁 20-21)

### 팁 20: 생각의 깊이 조절

프롬프트에 키워드 추가:

- `think` - 기본 사고
- `think hard` - 깊은 분석
- `think ultra` - 최대 사고력

```
"이 레거시 코드 리팩토링해. think hard."

```

어려운 문제일수록 `think ultra` 써라.

### 팁 21: 조합의 힘

Planning Mode + think hard + 파일 저장.

```
"새 결제 시스템 아키텍처 짜줘.
think hard.
planning mode로.
결과는 payment_architecture.md로 저장."

```

이게 바이브 코딩의 진수다.

---

## 🔍 리서치 & 문서화 (팁 22-26)

### 팁 22: Claude Code로 리서치

Claude Code에 웹 검색/웹 fetch 기능 있다.

```
"Stripe API 결제 연동 방법 찾아서 우리 프로젝트에 적용할 계획 짜줘"

```

구글링 안 해도 된다. Claude가 찾아서 정리해준다.

### 팁 23: PDF도 읽는다

```
"이 리서치 보고서 읽고 핵심 정리해줘"

```

ChatGPT Deep Research 결과물 PDF? Claude한테 던져.

웹 검색 결과랑 합쳐서 분석해준다.

### 팁 24: PRD 자동 생성

```
"새로 만들 대시보드 기능 PRD 만들어줘"

```

Product Requirements Document.

ChatGPT로 만드는 것보다 낫다. 왜?

**실제 프로젝트 구조를 안다.** 현실적인 PRD가 나온다.

### 팁 25: 각종 문서 자동화

- UX 가이드
- API 문서
- 기술 설계서

다 Claude한테 시키면 된다.

```
"API 엔드포인트 문서 만들어. Swagger 형식으로."

```

### 팁 26: 변경 추적

```
"이번 주 변경사항 changelog.md로 정리해"
"왜 이렇게 결정했는지 decision_log.md에 기록해"

```

미래의 나, 미래의 Claude를 위한 기록.

---

## 🔗 GitHub 연동 (팁 27-28)

### 팁 27: GitHub Actions 설정

```
/install-gh-actions

```

이거 한 번 실행하면?

GitHub 이슈에 @claude-code 태그하면 Claude가 답한다.

PR에 태그하면 리뷰하고 수정한다.

**로컬 머신 안 켜도 된다.** GitHub Actions에서 돌아간다.

### 팁 28: 자동 PR 리뷰

새 PR 올라오면 Claude가 자동으로 리뷰.

"여기 버그 있어요", "이 부분 최적화 가능해요"

팀 프로젝트면 필수.

---

## 🎯 마인드셋 (팁 29)

### 팁 29: PM처럼 생각하라

코드 한 줄 한 줄 이해하려고 하지 마.

중요한 건:

- **앱이 원하는 대로 작동하나?**
- **테스트 통과하나?**
- **사용자 경험 괜찮나?**

이거다.

코드 리뷰는 Claude가 한다. 나는 결과물을 검증한다.

**개발자에서 매니저로 레벨업하는 거다.**

---

# LEVEL 3: 고급 - 마스터 기술

> "이제 진짜 마법을 보여주지"
> 

---

## 🌳 Git Worktrees - 병렬 개발 (팁 30-32)

### 팁 30: 동시에 여러 기능 개발하기

Git Worktrees = 같은 레포지토리의 여러 브랜치를 **동시에** 다른 폴더에서 작업.

```bash
# .trees 폴더 만들기
mkdir .trees

# 기능별 worktree 생성
git worktree add .trees/feature-login feature/login
git worktree add .trees/feature-payment feature/payment
git worktree add .trees/feature-dashboard feature/dashboard

```

### 팁 31: 각 Worktree에서 Claude Code 실행

터미널 3개 열어서:

```bash
# 터미널 1
cd .trees/feature-login && claude

# 터미널 2
cd .trees/feature-payment && claude

# 터미널 3
cd .trees/feature-dashboard && claude

```

**3개의 Claude가 3개의 기능을 동시에 개발한다.**

### 팁 32: 마지막에 머지

다 끝나면?

```
"모든 worktree 머지하고 충돌 해결해줘"

```

Claude가 알아서 합친다. 충돌? Claude가 해결한다.

**일주일치 개발이 몇 시간에 끝난다.**

---

## ⚡ Custom Commands (팁 33-34)

### 팁 33: 반복 작업 자동화

매번 같은 프롬프트 치기 귀찮다.

`.claude/commands/` 폴더에 마크다운 파일 만들기:

```markdown
# .claude/commands/changelog.md

## Description
변경사항 정리하는 커맨드

## Allowed Tools
- bash
- read
- write

## Prompt
최근 커밋들 분석해서 changelog.md 업데이트해줘.
사용자가 읽기 쉽게 정리해.

```

이제 `/changelog` 치면 자동 실행.

### 팁 34: 개인 커맨드 vs 프로젝트 커맨드

- **프로젝트 커맨드**: `.claude/commands/` - 이 프로젝트에서만
- **개인 커맨드**: `~/.claude/commands/` - 모든 프로젝트에서

자주 쓰는 건 개인 커맨드로.

---

## 🤖 Custom Subagents (팁 35)

### 팁 35: 전문가 에이전트 만들기

```
/agents

```

위자드가 뜬다. 새 에이전트 설정:

```markdown
# .claude/agents/security-reviewer.md

## Agent Type
subagent

## Usage
보안 취약점 검사할 때 사용

## Allowed Tools
- read
- bash

## System Prompt
너는 보안 전문가다.
코드에서 SQL 인젝션, XSS, 인증 취약점 찾아.
OWASP Top 10 기준으로 검사해.

```

이제 Claude가 알아서 이 에이전트 쓴다.

아니면 직접 "보안 에이전트로 검사해" 해도 된다.

**추천 에이전트들:**

- UX 리뷰어
- API 설계자
- 테스트 작성자
- DB 관리자
- 보안 검사자

---

## 🔌 MCP 서버 연동 (팁 36)

### 팁 36: 외부 도구 연결

MCP (Model Context Protocol) = Claude Code가 외부 도구에 접근.

**데이터베이스 MCP:**

```
- MongoDB MCP
- PostgreSQL MCP
- Supabase MCP

```

직접 DB 쿼리 짜고 실행까지.

**Playwright MCP:**

브라우저 자동화. Claude가 진짜 웹사이트 보면서 테스트.

**Figma MCP:**

디자인 → 코드 자동 변환.

```
"Figma에 있는 이 컴포넌트 React로 만들어"

```

MCP 생태계는 계속 커지는 중. 주시하자.

---

# 부록: 비용과 가격

## 얼마야?

**무료 버전 없다.** Claude Code 쓰려면 유료 구독 필수.

### 옵션 1: Claude 구독 플랜

| 플랜 | 가격 | 특징 |
| --- | --- | --- |
| Pro | $20/월 | 입문용, 가볍게 써보기 |
| Max 5x | $100/월 | Pro 대비 5배 한도 |
| Max 20x | $200/월 | Pro 대비 20배 한도, 헤비 유저용 |

**내 추천**: 진지하게 쓸 거면 Max 5x 이상.

### 옵션 2: API 직접 사용

Anthropic API 연결해서 쓸 수도 있다.

근데 **존나 비싸다.** 회사에서 대줘야 가능한 수준.

개인이라면 그냥 Max 플랜 끊어라.

---

## 마무리: 페라리를 페라리답게

6개월 전의 나: "Claude Code? 그냥 터미널 ChatGPT 아냐?"

지금의 나: 3개 인스턴스 동시 실행, 일주일치 개발 몇 시간에 끝냄.

차이가 뭐냐?

1. **CLAUDE.md** 제대로 관리
2. **Planning Mode** 습관화
3. **Git Worktrees**로 병렬 작업
4. **Custom Commands/Agents**로 자동화

이 36가지 팁.

페라리를 샀으면 5단까지 밟아야지.

1단으로 기어가지 말고.

---

*"복붙은 끝났다. 이제는 실행의 시대다."*

---

**다음 스텝:**

- CLAUDE.md 정리하기
- Planning Mode로 다음 기능 설계하기
- Git Worktrees 한 번 써보기

당신의 Claude Code는 몇 단 기어인가요?

지금 바로 레벨업 해보세요. 🚀