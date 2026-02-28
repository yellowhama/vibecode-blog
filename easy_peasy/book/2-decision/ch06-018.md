# 018 3단계 바이브 코딩

# AI 바이브 코딩 구조화: 3단계 바이브 코딩 vs GitHub Spec Kit

## TL;DR

**문제**: "야 이거 해줘" → AI가 뭔가 만듦 → 엉망진창 → 다시 시작

**해결책 1**: Ryan Carson의 **3단계 바이브 코딩** (PRD → Task List → 피드백)

**해결책 2**: GitHub의 **Spec Kit** (Constitution → Specify → Plan → Tasks → Implement)

둘 다 "즉흥 코딩"을 "시스템"으로 바꾸는 방법론. 하지만 접근 방식이 다르다.

**결론**: 솔로 창업자면 3단계, 팀/복잡한 프로젝트면 Spec Kit

---

## 서론: 5번 창업한 남자가 발견한 "3파일의 비밀"

유튜브를 뒤지다가 재미있는 영상을 하나 봤다.

Ryan Carson이라는 사람이 나와서 이렇게 말하더라:

> "나는 5번 창업했다. Treehouse라는 코딩 교육 플랫폼도 만들었고, 수백 명의 개발자를 가르쳤다. 그런데 AI가 나온 뒤로 깨달았다. 개발자가 필요 없어진 게 아니라, 개발 방식이 바뀐 거다."
> 

그가 제안한 게 **"3-File System"**이라는 거였다.

처음엔 "파일 3개? 그게 뭐 대수냐"고 생각했는데, 영상을 끝까지 보니 충격이었다.

이 사람, 진짜였다.

### Ryan Carson이 누군데?

- **Treehouse 창업자**: 50만 명이 코딩 배운 플랫폼
- **5회 연속 창업가**: 다 성공적으로 Exit
- **솔로 창업자 전도사**: "한 명이서도 충분하다"
- **최근 관심사**: AI 코딩으로 엔지니어링 팀 없이 제품 만들기

그가 말하길, 대부분의 사람들이 AI를 **잘못** 쓰고 있다고 한다.

"ChatGPT야, 쇼핑몰 만들어줘" → 코드 2000줄 → 안 돌아감 → 다시 → 또 안 됨...

이게 **바이브 코딩(Vibe Coding)**의 함정이다. Andrej Karpathy가 만든 용어인데, "느낌으로 코딩한다"는 뜻이다.

Ryan Carson은 여기에 **구조**를 입혔다. 그게 바로 **3-File System**.

근데 재미있는 건, 거의 같은 시기에 GitHub도 비슷한 문제를 발견하고 **Spec Kit**이라는 걸 만들었다는 거다.

**둘 다 같은 문제를 풀려고 했다. 접근 방식만 달랐다.**

이 글은 그 두 가지 방법론을 비교하는 이야기다.

---

## 방법론 1: Ryan Carson의 3단계 바이브 코딩

Ryan Carson(5회 창업가)이 만든 **솔로 창업자를 위한** 워크플로우.

### 핵심: "3-파일 시스템"

```
📄 PRD.md (제품 요구사항 문서)
📄 TASKS.md (원자적 작업 목록)
📄 TESTS.md (TDD 테스트 파일)

```

### 3단계 프로세스

### 1단계: 명확한 컨텍스트 정의

```markdown
# 나쁜 예
"쇼핑몰 만들어줘"

# 좋은 예 (PRD)
## 제품: 고등학생용 중고책 거래 플랫폼
- 대상: 15-18세 학생
- 핵심 기능: 책 등록, 가격 제안, 학교 내 거래
- 제약: 결제 없음 (직거래만), 익명 불가
- 스타일: 당근마켓처럼 심플하게

```

**AI에게 질문하라고 시키는 게 포인트:**

> "이 PRD 보고 부족한 거 있으면 질문해"
> 

AI가 물어본다:

- "거래 취소는 어떻게 처리하나요?"
- "신고 기능은 필요한가요?"
- "사진은 몇 장까지 올릴 수 있나요?"

### 2단계: 작업 자동화 및 체계화

PRD를 **원자적(atomic) 작업**으로 쪼갠다.

```markdown
# TASKS.md

## Phase 1: 인증
- [ ] T1.1: 이메일 회원가입 API
- [ ] T1.2: 로그인 JWT 발급
- [ ] T1.3: 비밀번호 재설정 플로우

## Phase 2: 책 등록
- [ ] T2.1: 책 정보 입력 폼
- [ ] T2.2: 사진 업로드 (최대 3장)
- [ ] T2.3: 가격 제안 받기 토글

```

**원자적이란?**

- 한 번에 하나씩 완료 가능
- 다른 작업에 의존성 최소화
- 30분~2시간 내 끝낼 수 있는 크기

### 3단계: 반복적인 피드백

```
나: "T1.1 구현해줘"
AI: (코드 생성)
나: "테스트 돌려봐"
AI: "Failed: 이메일 중복 체크 안 함"
나: "중복 체크 추가해"
AI: (수정)
나: "이제 커밋해"

```

**핵심 규칙:**

- 마일스톤마다 커밋 (Git)
- AI를 "천재적인 PhD 학생"처럼 대하기
- 명확하고 반복적인 지침

---

## 방법론 2: GitHub Spec Kit

GitHub이 만든 **팀/복잡한 프로젝트를 위한** 오픈소스 툴킷.

### 핵심: "명세서가 AI의 장기기억이 된다"

```
.specify/
├── constitution.md       # AI의 규칙책
├── specs/               # 기능별 명세
│   ├── auth.md
│   └── payment.md
├── plans/               # 기술 계획
└── tasks/               # 구현 작업

```

### 4단계 프로세스 (+ Constitution)

### 0단계: Constitution (헌법) - AI에게 규칙 심기

```bash
/constitution

```

```markdown
# 프로젝트 헌법

## 절대 규칙
- Python 3.11 이상 사용
- 모든 API는 FastAPI로
- 테스트 커버리지 80% 이상
- 기존 UserAuth 시스템 절대 건드리지 마
- 갤럭시 A32에서 60fps 유지

## 코딩 스타일
- 타입 힌트 필수
- Docstring은 Google 스타일
- 함수 이름은 동사로 시작

```

**이게 왜 중요한가?**

AI가 이 규칙을 **매번** 읽고 따른다. 더 이상 "어제 Python 3.9로 짰다가 오늘 3.12로 새로 짜는" 일이 없다.

### 1단계: Specify - 무엇을 만들지

```bash
/specify

```

```markdown
# Feature: 중고책 거래 플랫폼

## 사용자 여정
1. 학생이 책 사진 찍음
2. 가격 입력 (또는 "제안 받기")
3. 같은 학교 학생들에게만 노출
4. 채팅으로 거래 조율

## 성공 조건
- 등록 30초 이내 완료
- 사진 업로드 5초 이내
- 검색 결과 1초 이내 표시

```

**기술 얘기는 안 한다.** "무엇"과 "왜"만 말한다.

### 2단계: Plan - 어떻게 만들지

```bash
/plan

```

AI가 기술 계획을 만든다:

```markdown
# 기술 계획

## 아키텍처
- Backend: FastAPI + PostgreSQL
- Frontend: React Native
- 이미지: S3 + CloudFront
- 인증: 기존 UserAuth 확장

## 제약사항
- 기존 DB 스키마 유지
- iOS/Android 동시 빌드
- GDPR 준수 (학생 데이터)

## 보안
- 이메일 인증 필수
- 학교 계정(@school.edu)만 허용
- 사진 EXIF 데이터 제거

```

### 3단계: Tasks - 작업 쪼개기

```bash
/tasks

```

```markdown
# 작업 목록

## T1: 인증 확장
- T1.1: 학교 이메일 검증 추가
- T1.2: 프로필에 학교 필드 추가
- T1.3: 같은 학교만 보이도록 필터링

## T2: 책 등록
- T2.1: 책 정보 스키마 설계
- T2.2: 이미지 업로드 API (S3)
- T2.3: 등록 폼 UI (React Native)

[P] = 병렬 가능
[T1.1] → [T1.2] → [T1.3] (순차)
[T2.1] [P] [T2.3] (병렬)

```

**의존성 자동 파악:**

- 순차 작업: 화살표로 연결
- 병렬 가능: [P] 표시

### 4단계: Implement - 구현

```bash
/implement T1.1

```

AI가:

1. Constitution 확인 (Python 3.11? ✓)
2. Spec 확인 (학교 이메일만? ✓)
3. Plan 확인 (기존 UserAuth 확장? ✓)
4. **기존 코드 읽고 확장** (새로 만들지 않음!)

```python
# AI가 생성한 코드
# 기존 UserAuth를 확장

def validate_school_email(email: str) -> bool:
    """학교 이메일인지 검증 (Constitution 준수: Google Style Docstring)"""
    valid_domains = ["school.edu", "university.edu"]
    return any(email.endswith(domain) for domain in valid_domains)

```

---

## 결정적 차이점: 비교표

| 항목 | 3단계 바이브 코딩 | GitHub Spec Kit |
| --- | --- | --- |
| **대상** | 솔로 창업자, 소규모 프로젝트 | 팀, 중대형 프로젝트 |
| **핵심 철학** | "빠르게 만들고 반복" | "명세서가 진실의 원천" |
| **파일 수** | 3개 (PRD, Tasks, Tests) | 10+ (Constitution, Specs, Plans, Tasks) |
| **AI 기억** | 없음 (매번 알려줘야 함) | Constitution이 장기기억 |
| **설정 시간** | 5분 | 30분 |
| **학습 곡선** | 낮음 (바로 시작) | 중간 (명령어 익혀야 함) |
| **중복 방지** | 수동 (내가 체크) | 자동 (AI가 기존 코드 읽음) |
| **병렬 작업** | 불가 | 가능 ([P] 표시) |
| **적합한 경우** | MVP, 프로토타입, 혼자 개발 | 프로덕션, 팀 협업, 장기 유지보수 |

---

## 실전 사례 비교

### 사례 1: 축구 육성 게임 (30시간)

**3단계 방식으로 했다면:**

```
Day 1: PRD 작성 (1시간)
Day 2-3: Tasks 하나씩 구현
- "훈련 시스템 만들어"
- "경기 시뮬레이션 추가"
- "능력치 표시"
결과: 빠르게 프로토타입 완성

문제점:
- 전술 시스템을 3번 다르게 만듦
- FormationController가 어디 있는지 모름
- 같은 기능이 4개 파일에 분산

```

**Spec Kit으로 했다면:**

```
Day 1:
- /constitution (Godot 4.4 + Rust 규칙)
- /specify (축구 육성 게임 명세)
- /plan (Godot/Rust 아키텍처)

Day 2-3:
- /tasks (20개 작업 자동 생성)
- /implement T1 T2 T3 --parallel

결과: 체계적으로 완성, 중복 없음

장점:
- AI가 기존 CoachSystem 찾아서 확장
- 전술 관련 코드 하나로 통합
- Constitution으로 "Rust 성능 최적화" 규칙 적용

```

### 사례 2: 주식 스크리너 (2일)

**3단계 방식의 승리 사례:**

```
목표: 빠르게 만들어서 내가 쓰기
규모: 작음 (1000줄 미만)
팀: 나 혼자

PRD: "미국 주식 중 PER 10 이하 찾기"
Tasks:
- [ ] Yahoo Finance API 연결
- [ ] PER 계산 로직
- [ ] 결과 CSV 저장

2일 만에 완성, Spec Kit 배울 시간에 이미 끝남

```

---

## 언제 뭘 써야 하나?

### 3단계 바이브 코딩을 써라:

✅ 혼자 개발하는 경우

✅ MVP/프로토타입

✅ 프로젝트 크기: 소형 (~5000줄)

✅ 2주 안에 끝낼 프로젝트

✅ 기존 코드베이스 없음

✅ "빠르게 만들고 버려도 됨"

**예시:**

- 토이 프로젝트
- 아이디어 검증용 MVP
- 개인 자동화 스크립트
- 해커톤 프로젝트

### Spec Kit을 써라:

✅ 팀으로 개발

✅ 프로덕션 서비스

✅ 프로젝트 크기: 중대형 (5000줄+)

✅ 장기 유지보수 필요

✅ 복잡한 기존 코드베이스

✅ "절대 망가지면 안 됨"

**예시:**

- 앱스토어에 올릴 앱
- 팀 협업 프로젝트
- 레거시 시스템 개선
- 규제 산업 (금융, 의료)

---

## 혼용 전략: "내가 쓰는 방법"

사실 **둘 다 쓴다.** 상황에 따라.

```
Phase 1 (프로토타입): 3단계 바이브 코딩
└─ 빠르게 만들어서 검증
└─ MVP 완성

Phase 2 (프로덕션): Spec Kit으로 전환
└─ 기존 코드를 Spec으로 문서화
└─ Constitution 작성
└─ 체계적으로 기능 추가

```

**전환 방법:**

```bash
# 1. 기존 프로젝트에 Spec Kit 설치
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 2. 초기화
cd my-existing-project
specify init . --ai claude --force

# 3. Constitution 생성
/constitution 기존 README와 코드 분석해서

# 4. 이제부터 Spec Kit으로 진행
/specify [새 기능]
/plan
/tasks
/implement

```

---

## 실전 꿀팁

### 3단계 바이브 코딩 팁

**1. PRD는 짧게, 명확하게**

```markdown
❌ 나쁜 예:
"우리 서비스는 혁신적인 AI 기반 추천 시스템으로..."

✓ 좋은 예:
"넷플릭스처럼 영화 추천, 본 영화 기반, 5개 추천"

```

**2. Tasks는 체크박스로**

```markdown
- [ ] 영화 시청 기록 저장
- [ ] 유사도 계산 (코사인)
- [ ] 상위 5개 추천

```

**3. AI에게 질문하라고 시키기**

```
"이 PRD 보고 빠진 거 있으면 10개 질문해"

```

### Spec Kit 팁

**1. Constitution은 규칙만**

```markdown
❌ 나쁜 예:
"우리는 사용자 경험을 최우선으로..."

✓ 좋은 예:
"갤럭시 A32에서 60fps 필수"

```

**2. 병렬 작업 활용**

```bash
# [P] 표시된 작업들 동시 실행
/implement T1 T2 T3 --parallel

# 시간: 30분 → 10분

```

**3. 기존 코드 버리지 마**

```
/specify 기존 UserAuth 시스템 확장해서 학교 인증 추가

# AI가 알아서 통합함

```

---

## 결론: 도구가 아니라 사고방식

3단계든 Spec Kit이든, 핵심은 **"구조"**다.

**Before (무계획 바이브 코딩):**

```
"야 쇼핑몰 만들어" → 엉망 → 다시 → 또 엉망 → 포기

```

**After (구조화된 개발):**

```
계획 → 작업 분해 → 하나씩 구현 → 검증 → 완성

```

**"여전히 바이브 코딩이다. 단지 체계적일 뿐."**

---

## 당장 시작하기 (10분 가이드)

### 3단계 바이브 코딩 시작

```markdown
1. PRD.md 만들기 (5분)
   - 누구를 위한 거야?
   - 뭘 해결해줘?
   - 어떻게 쓰는 거야?

2. AI에게 Tasks 생성 시키기 (3분)
   "이 PRD 보고 작업 목록 만들어, 원자적으로"

3. 첫 Task 시작 (2분)
   "T1 구현해줘"

끝.

```

### Spec Kit 시작

```bash
# 1. 설치 (30초)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 2. 초기화 (1분)
specify init my-project --ai claude

# 3. Constitution (3분)
/constitution 프로젝트 규칙 정리

# 4. 첫 기능 (5분)
/specify [만들고 싶은 거]
/plan
/tasks
/implement

끝.

```

---

## 참고 자료

**3단계 바이브 코딩:**

- Ryan Carson Twitter: @rcarson
- 개념 출처: "3-File System for Solo Founders"

**GitHub Spec Kit:**

- 공식 저장소: https://github.com/github/spec-kit
- 블로그: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai
- 지원 AI: Claude Code, GitHub Copilot, Gemini CLI, Cursor, Windsurf 등

**내 경험담:**

- 008편: 바이브 코딩으로 게임 만들기 (30시간)
- 011편: Spec Kit으로 게임 개발 업그레이드
- 012편: Spec Kit 실전기 (마이크 타이슨의 명언)

---

## 메타 정보

**핵심 키워드:**
바이브 코딩, Spec Kit, AI 코딩, 3단계 바이브 코딩, GitHub Spec Kit, 명세 주도 개발, SDD, Ryan Carson, Claude Code, 프로젝트 구조화

**대상 독자:**

- AI로 개발하는데 매번 엉망이 되는 사람
- 프로토타입은 잘 만드는데 프로덕션은 못 만드는 사람
- 팀 협업에서 AI 코딩 도입하려는 사람
- "이번엔 제대로 해보자"는 마음가짐

**추천 해시태그:**
#바이브코딩 #SpecKit #AI개발 #명세주도개발 #ClaudeCode #GitHubCopilot #프로젝트관리 #개발생산성 #구조화 #시스템화