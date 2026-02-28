# 011  Spec Kit으로 게임 개발 업그레이드: Godot+Rust 체계적 바이브 코딩

# 

# Spec Kit으로 게임 개발 업그레이드: Godot+Rust 체계적 바이브 코딩

바이브 코딩 2.0: Spec Kit으로 Godot+Rust 게임 개발 체계화하기

## TL;DR

- **문제**: 30시간 바이브 코딩 = 같은 기능 3번 구현 + 15개 미완성 + 스파게티 코드
- **해결**: 기존 문서 + Spec Kit = AI가 프로젝트를 기억하게 만들기
- **과정**: `/constitution` → `/specify` → `/plan` → `/tasks` → `/implement`
- **결과**: 3일 만에 5개 기능 완성, 충돌 0, 중복 0

## 32시간째, 내가 만든 게임을 내가 모른다

009편에서 GitHub 오픈소스 통합했고, 010편에서 문서화까지 완벽했다.

새벽 3시, 전술 시스템 추가하려는데:

```
Error: Function '_on_train_button_pressed' not found
Error: Signal 'tactics_changed' not connected
Error: Node 'TacticsManager' is null

```

"TacticsManager? 내가 만들었나?"

찾아보니:

```
TacticsManager.gd (3줄, TODO만 있음)
FormationController.gd (절반만 구현)
TeamSetup.gd (이게 뭐지?)
tactical_system.py (왜 Python이?)

```

**같은 전술 시스템을 4번 다르게 만들어놨더라.**

## 바이브 코딩의 근본 문제

### AI는 골드피쉬다 (기억력 3초)

월요일:

```
나: "전술 시스템 만들어"
AI: "TacticsManager.gd 생성했습니다"

```

화요일:

```
나: "전술 기능 추가해"
AI: "FormationController.gd 새로 만들었습니다"
(어제 만든 거 모름)

```

수요일:

```
나: "포메이션 설정 기능"
AI: "tactical_system.py로 구현했습니다"
(왜 갑자기 Python?)

```

**AI는 매번 백지상태. 내 프로젝트가 뭔지, 뭘 만들었는지 모른다.**

## GitHub Spec Kit: AI에게 기억을 주자

GitHub 블로그의 한 줄:

**"명세서가 AI의 기억이 된다"**

## GitHub Spec Kit이 뭔데?

GitHub이 만든 오픈소스 도구다. AI와 개발할 때 생기는 "매번 처음부터" 문제를 해결한다.

**핵심: 명세서가 AI의 기억이 된다.**

4단계 프로세스로 작동한다:

1. **Constitution** (헌법) - 프로젝트 원칙 정의
2. **Specify** (명세) - 뭘 만들지 정확히 기술
3. **Plan** (계획) - 어떻게 만들지 기술 설계
4. **Tasks** (작업) - 구현 순서와 의존성 정리

AI가 이 문서들을 매번 읽고, 일관성 있게 개발한다.
더 이상 "어제 만든 거 모르고 새로 만드는" 일이 없다.

**여기에 재밌는 발상의 전환이 있다.**

보통 개발 도구는 "인간이 쓰는 걸" 기준으로 만든다. IDE, 디버거, 테스트 도구 전부.
**Spec Kit은 "AI가 읽고 실행하는 걸" 기준으로 만들어졌다.**

인간은 명세만 쓰고, AI가 그 명세를 매번 읽고 일관성 있게 개발한다.
더 이상 "어제 만든 거 모르고 새로 만드는" 일이 없다.

**도구의 주인공이 인간에서 AI로 바뀐 첫 사례다.**

## Spec Kit은 뭐가 다른가?

Cursor, Copilot은 **코드 자동완성**이다. 한 줄씩, 함수 단위로 도와준다.

Spec Kit은 **AI 개발 프로세스 시스템**이다.
명세 만들고 → 계획 세우고 → 작업 쪼개고 → AI가 전체를 구현한다.

**"AI에게 프로젝트 전체 맥락을 이해시키는 유일한 도구"**

Constitution이 AI의 장기기억이 되고, 매번 이 원칙을 지키며 개발한다.
비교 대상이 없다. 이런 도구는 Spec Kit이 최초고 현재는 유일하다.

### 30초 설치

```bash
# Python 있어야 함 (있겠지 뭐)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

```

### 1분 초기화

```bash
cd /my-game-project
specify init football-manager --ai claude

```

생성되는 마법의 폴더:

```
.specify/
├── memory/
│   └── constitution.md    # AI의 장기기억
├── scripts/               # 자동화 스크립트들
├── templates/             # 문서 템플릿
└── specs/                 # 기능별 명세

```

## 천재적 발견: "야, 나 문서 있잖아?"

010편에서 뭐라고 했더라?

**"문서는 AI가 만든다"**

이미 있는 문서들:

```
PROJECT_INFO.md - 33개 Autoload 시스템
STRUCTURE.md - 폴더 구조
FEATURES.md - 만든 기능들
TODO.md - 미완성 15개
ERRORS.md - 에러 해결법
OPENSOURCE.md - GitHub에서 가져온 것들

```

"이거 다 합치면 Constitution 아니야?"

## 실전: 5단계 마법 프로세스

### 1️⃣ Constitution (헌법) - AI의 뇌에 규칙 심기

```

우리 게임 원칙 정리해 (문서들 다 읽고):
- PROJECT_INFO.md의 33개 Autoload 건드리지 마
- Godot 4.4 + Rust 아키텍처 유지
- 갤럭시 A32에서 60fps 필수
- 우마무스메 + FM 스타일
- 한국 고등학교 정서
다 읽고 정리해서 생각하면서 /constitution 에 넣을 글을 적어보자.
```

5분 후, AI가 만든 헌법:

```markdown
# Football Manager KR - Constitution v1.0.0

## 원칙 1: 기존 시스템 존중
33개 Autoload 싱글톤은 신성불가침
이유: 이미 작동하는 걸 망가뜨리지 않는다

## 원칙 2: 모바일 우선
갤럭시 A32 (3GB RAM)에서 60fps
이유: 한국 중고생 70%가 중저가폰 사용

## 원칙 3: 한 기능 한 파일
같은 기능 여러 번 만들기 금지
이유: TacticsManager 3개 사태 재발 방지

```

**이제 AI가 이 원칙을 영원히 기억한다!**

### 2️⃣ Specify (명세) - 뭘 만들지 확실히

```

전술 시스템 완성하기:
- 기존 TacticsManager.gd 살려서 확장
- FormationController.gd 코드 통합
- TeamSetup.gd는 삭제 (테스트였음)
- 11개 포메이션 구현
- 드래그&드롭 선수 배치
다 읽고 정리해서 생각하면서 /specify 에 넣을 글을 적어보자.

```

자동으로 일어나는 일:

1. 새 브랜치 생성: `feature/tactics-system`
2. `specs/tactics-system/spec.md` 생성

```markdown
## 현황 분석
- TacticsManager.gd: 3줄 (확장 가능)
- FormationController.gd: 절반 구현 (통합 필요)
- TeamSetup.gd: 테스트 코드 (삭제 예정)

## 기능 요구사항
- 기존 코드 최대한 활용
- 중복 제거
- 단일 진실 공급원 원칙

```

### 3️⃣ Plan (계획) - 어떻게 만들지

```

Godot 4.4 우선, 성능 부분만 Rust
기존 33개 Autoload 절대 건드리지 마
EventBus 패턴으로 통합
모바일 터치 UI

또 어떤게 필요할지 생각해보고 /plan 을 작성해보자
```

constitution, specify, plan 셋다 내가 짜는 게 아니다. 

앞에서 만들었던 게임들의 모든 문서를 먼저 정리하고, 

어떤 게임을 만들거다. 

이게임은 뭘하는 거고, 왜 만들거며 등등이 적인 문서와

앞에 만들면서 적었던 모든 문서를 AI가 읽고 정리해주는거다. 

AI가 자동 생성하는 것들:

- `research.md` - 기술 조사
- `data-model.md` - 데이터 구조
- `contracts/` - API 정의
- `quickstart.md` - 테스트 시나리오
- constitution.md
- plan.md
- specify.md
- tasks.md
- analyze.md
- clarify.md

### 4️⃣ Tasks (작업) - 할 일 쪼개기

```
/tasks

```

생성된 작업 목록:

```markdown
## Phase 1: 정리 작업
[T001] TacticsManager.gd 백업 [10m]
[T002] FormationController.gd 분석 [20m]
[T003] 통합 가능 코드 식별 [30m]

## Phase 2: 테스트 작성 [병렬 가능]
[T004] [P] 포메이션 데이터 테스트
[T005] [P] 전술 계산 테스트
[T006] [P] UI 드래그 테스트

## Phase 3: 구현
[T007] TacticsManager 확장 [2h]
[T008] FormationController 통합 [1h]
[T009] TeamSetup.gd 삭제 [5m]
[T010] 포메이션 JSON 생성 [30m]

병렬 실행 가능: T004, T005, T006

```

### 5️⃣ Implement (구현) - 진짜 코드 생성

```
/implement

```

또는 선택적으로:

```
/implement T001        # 하나씩
/implement T004 T005 T006 --parallel  # 병렬
/implement --all       # 전부 다

```

**이제 AI가 실제로 코드를 짠다!**

근데 신기한 건:

- TacticsManager.gd를 **확장**한다 (새로 안 만듦)
- FormationController의 코드를 **통합**한다
- TeamSetup.gd를 **삭제**한다
- **Constitution을 지킨다**

## 3일의 기적

### Day 1: 시스템 정리 (30분)

```bash
# 오전: 기존 문서로 Constitution 생성
/constitution PROJECT_INFO.md 기반으로

# 오후: 15개 미완성 기능 명세화
for todo in TODO.md:
    /specify [todo 내용]

# 저녁: 우선순위 결정
"가장 중요한 5개 골라"

```

### Day 2-3: 5개 기능 완성

1. **전술 시스템**

```
/specify → /plan → /tasks → /implement
결과: TacticsManager 하나로 통합 완료

```

1. **CA/PA 변화 알림**

```
/specify → /plan → /tasks → /implement
결과: 실시간 능력치 변화 표시

```

1. **컨디션 시스템**

```
/specify → /plan → /tasks → /implement
결과: 우마무스메 스타일 5단계 컨디션

```

1. **훈련 일정**

```
/specify → /plan → /tasks → /implement
결과: 52주 자동 스케줄링

```

1. **경기 시뮬레이션**

```
/specify → /plan → /tasks → /implement
결과: open-football 엔진 통합

```

**각 기능당 평균 2시간** (이전: 2일씩 걸리고 망가짐)

## 핵심: Context가 전부다

### Before (바이브 코딩 1.0)

```
나: "전술 만들어"
AI: (뭔지 모름) → 새 파일 생성
나: "전술 수정해"
AI: (어디있는지 모름) → 또 새 파일
결과: 파일 4개, 다 미완성

```

### After (Spec Kit 바이브 코딩)

```
나: /specify 전술 시스템
AI: (Constitution 확인) → (기존 파일 분석) → (통합 계획)
나: /plan
AI: (아키텍처 결정) → (충돌 방지 설계)
나: /tasks
AI: (작업 분해) → (병렬 가능 식별)
나: /implement
AI: (기존 코드 확장) → (중복 제거) → (테스트 포함)
결과: 파일 1개, 완성, 테스트 통과

```

## ⚠️ 절대 하지 마라: 재초기화

```bash
# ❌ 망하는 길
문서 수정 → specify init (다시) → 모든 설정 날아감

# ✅ 올바른 길
문서 수정 → /constitution (업데이트) → 계속 진행

```

**`init`은 처음 한 번만!** 이후는 슬래시 커맨드로 업데이트.

## 지금 당장 시작하기 (10분)

### 기존 프로젝트가 있다면

```bash
# 1. 설치 (30초)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 2. 초기화 (1분)
cd /your-project
specify init my-game --ai claude

# 3. Constitution 생성 (5분)
/constitution 기존 README와 문서들 기반으로

# 4. 첫 기능 구현 (3분)
/specify [미완성 기능 하나]
/plan
/tasks
/implement

# 5. 확인
"와, 충돌 없이 됐네?"

```

### 아무 문서도 없다면

```bash
# AI가 다 만든다
"프로젝트 분석해서 PROJECT_INFO.md 만들어"
"미완성 기능 찾아서 TODO.md 만들어"

# 이제 Constitution
/constitution 방금 만든 문서들로

# 이후 동일

```

## 실전 꿀팁

### 1. Constitution은 짧게

```markdown
# ❌ 나쁜 예: 철학 논문
"우리 게임은 한국 청춘의 열정과 도전을..."

# ✅ 좋은 예: 명확한 규칙
"갤럭시 A32에서 60fps"

```

### 2. 병렬 작업 활용

```bash
# [P] 표시된 작업들 동시 실행
/implement T004 T005 T006 --parallel

# 30분 → 10분

```

### 3. 기존 코드 버리지 마

```
/specify 기존 TacticsManager.gd 확장해서

# AI가 알아서 통합한다

```

### 4. 매일 문서 업데이트

```
# 작업 끝나고
"오늘 변경사항 CHANGELOG.md 업데이트"

# Constitution도 가끔
/constitution 새로운 원칙 추가

```

## 결론: 바이브 코딩 진화

**바이브 코딩 1.0**: "야 이거 해" → 엉망진창

Spec Kit의 사용법은 간단하다. 
1. AI에게 깃헙의 spec kit 설치를 명령하기, 사용방법이나 꿀팁을 따로 문서화 시킨다.

1. 1에서 만든 문서를 읽고 사용하라고 시킨다.

**바이브 코딩 2.0 (Spec Kit)**:

- Constitution으로 원칙 심고
- Specify로 명확히 하고
- Plan으로 설계하고
- Tasks로 쪼개고
- Implement로 구현

**여전히 "야 이거 해"다. 단지 체계적일 뿐.**

내 게임은 이제:

- 같은 기능 3번 구현 → 1번만 구현
- 15개 미완성 → 5개 완성 (3일)
- 어디에 뭐가 있는지 모름 → AI가 다 기억

**스파게티 → 시스템**

---

**다음 편 예고**:
"Spec Kit으로 3일 만에 앱스토어 출시 준비 완료?"