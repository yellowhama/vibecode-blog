# 042 Claude Code, 끝까지 일하게 만드는 법: Ralph Loop 완벽 가이드

# Claude Code, 끝까지 일하게 만드는 법: Ralph Loop 완벽 가이드

**"이만하면 됐죠?" — 아니, 진짜 끝날 때까지 해.**

---

## TL;DR (3줄 요약)

- Claude Code는 똑똑하지만 **"대충 이 정도면 됐겠지"** 하고 멈추는 습관이 있다.
- **Ralph Loop**는 Claude를 루프에 가둬서 작업이 **진짜 완성**될 때까지 계속 붙잡아두는 플러그인이다.
- 설치 한 줄, 사용법 한 줄. 근데 결과는 완전히 다르다.

---

## 왜 Ralph Loop가 필요한가?

### Claude Code의 고질병: "됐다!" 증후군

바이브 코딩을 하다 보면 이런 상황이 반복된다.

```
나: "로그인 기능 만들어줘"
Claude: (열심히 코드 작성) "완료했습니다!"
나: (실행) ...에러
나: "에러 나는데?"
Claude: "수정했습니다!"
나: (실행) ...또 에러

```

왜 이런 일이 생길까?

Claude Code는 기본적으로 **한 번 돌리고 끝나는 구조**다.
열심히 추론하고, 코드 짜고, "됐다!" 하고 나간다.

문제는, Claude가 **훨씬 더 잘할 수 있다**는 거다.

한 번 더 확인하고, 한 번 더 테스트하고, 한 번 더 다듬으면 되는데.
스스로 "충분하다"고 판단하고 빠져나가버린다.

마치 과제하다가 "에이 대충 이 정도면 교수님도 이해하겠지" 하고 제출하는 대학생 같다.

---

### Ralph Loop가 하는 일

원리는 아주 단순하다.

```
Claude가 코드 작성
    ↓
"됐다!" 하고 나가려고 함
    ↓
Ralph Loop가 막음: "아직이야"
    ↓
같은 프롬프트를 다시 넣음
    ↓
Claude가 자기 작업물 다시 확인
    ↓
개선점 발견하면 수정
    ↓
(진짜 완성될 때까지 반복)

```

그러니까 Claude Code를 **강제 야근**시키는 거다.

"퇴근? 안 돼. 끝날 때까지 야근이야."

---

### 이름이 왜 Ralph인가?

심슨 가족의 **Ralph Wiggum** 캐릭터에서 따왔다.

이 캐릭터가 어떤 애냐면...

- 계속 실패한다
- 멍청한 실수를 반복한다
- **그런데 절대 포기 안 한다**
- 끈질기게 계속 시도한다
- 결국 어떻게든 해낸다

AI가 이래야 한다. 에러가 나도, 실패해도, 계속 붙잡고 늘어져서 결국 완성하는 것.

---

## 설치하기: 1분이면 끝

### Step 1: Claude Code 터미널에서 설치

```bash
/plugin install ralph-wiggum@claude-plugins-official

```

끝이다. 진짜 이게 전부다.

### Step 2: 설치 확인

```bash
/plugin

```

이 명령어로 설치된 플러그인 목록을 볼 수 있다.
`ralph-wiggum`이 보이면 성공.

---

## 사용법: 이것만 알면 된다

### 기본 명령어

```bash
/ralph-wiggum:ralph-loop "작업 내용" --completion-promise "DONE" --max-iterations 10

```

하나씩 뜯어보자.

| 부분 | 의미 |
| --- | --- |
| `/ralph-wiggum:ralph-loop` | Ralph 루프 시작 명령어 |
| `"작업 내용"` | Claude에게 시킬 일 |
| `--completion-promise "DONE"` | 이 단어가 나오면 완료로 인식 |
| `--max-iterations 10` | 최대 10번까지만 반복 (안전장치) |

### 중요한 안전장치: max-iterations

**무조건 설정하자.**

안 하면? Claude가 무한 루프 돌면서 토큰을 쏟아붓는다.
아침에 일어나보니 청구서가 와 있을 수 있다.

```bash
# 간단한 작업: 10~20회
--max-iterations 15

# 복잡한 작업: 30~50회
--max-iterations 40

# 밤새 돌릴 대형 작업: 50~100회
--max-iterations 80

```

---

## 실전 예시: 이렇게 쓰면 된다

### 예시 1: REST API 만들기

```bash
/ralph-wiggum:ralph-loop "REST API 만들어줘.

요구사항:
- CRUD 전부 동작
- 입력값 검증 포함
- 테스트 커버리지 80% 이상
- README에 API 문서 작성

모든 요구사항 충족하면 <promise>DONE</promise> 출력해." --completion-promise "DONE" --max-iterations 30

```

### 예시 2: TDD로 기능 구현

```bash
/ralph-wiggum:ralph-loop "로그인 기능을 TDD로 구현해.

순서:
1. 실패하는 테스트 먼저 작성
2. 테스트 통과하는 최소한의 코드 작성
3. 테스트 실행
4. 실패하면 수정
5. 통과하면 리팩토링
6. 다음 테스트로 반복

모든 테스트가 통과하면 <promise>COMPLETE</promise> 출력." --max-iterations 40 --completion-promise "COMPLETE"

```

### 예시 3: 버그 수정

```bash
/ralph-wiggum:ralph-loop "이 버그 수정해: [버그 설명]

과정:
1. 버그 재현
2. 원인 파악
3. 수정
4. 회귀 테스트 작성
5. 수정 확인

15번 반복해도 해결 안 되면:
- 막히는 부분 문서화
- 시도한 방법 정리
- 대안 제시

해결되면 <promise>FIXED</promise> 출력." --max-iterations 20 --completion-promise "FIXED"

```

---

## 프롬프트 잘 쓰는 법

Ralph Loop의 성공은 **프롬프트 품질**에 달려있다.

### ❌ 나쁜 프롬프트

```
"좋은 앱 만들어줘"

```

문제점:

- "좋은"이 뭔지 모호함
- 언제 끝났는지 판단 불가
- Claude가 무한 루프에 빠질 수 있음

### ✅ 좋은 프롬프트

```
"투두리스트 앱 만들어줘.

기능:
- 할 일 추가/삭제/수정
- 완료 체크
- 로컬 스토리지 저장

완료 조건:
- 모든 기능 동작
- 콘솔 에러 없음
- 테스트 통과

완료하면 <promise>DONE</promise> 출력."

```

### 좋은 프롬프트의 3요소

1. **명확한 요구사항**: 뭘 만들어야 하는지
2. **구체적인 완료 조건**: 언제 끝났다고 볼 수 있는지
3. **막혔을 때 행동**: N번 시도해도 안 되면 어떻게 할지

---

## 언제 쓰면 좋을까?

### Ralph Loop가 빛나는 상황

| 상황 | 이유 |
| --- | --- |
| **복잡한 프로젝트** | 기능이 많고 연결점이 복잡할 때 |
| **품질이 중요할 때** | 테스트, 에러 처리 꼼꼼히 해야 할 때 |
| **밤새 돌려놓을 때** | 자고 일어나면 완성되어 있음 |
| **자동 검증 가능한 작업** | 테스트, 린터로 성공 여부 판단 가능할 때 |

### 굳이 안 써도 되는 상황

| 상황 | 이유 |
| --- | --- |
| **간단한 작업** | 함수 하나 짜는 정도면 과잉 |
| **빠른 프로토타입** | 일단 돌아가는지만 보고 싶을 때 |
| **주관적 판단 필요** | 디자인, UX 같은 건 사람이 봐야 함 |
| **토큰 예산 빡빡할 때** | 루프 돌리면 비용 증가 |

---

## 실제 성과가 이렇다

### 사례 1: $50,000짜리 프로젝트 → $300

일반적으로 **$50,000** 드는 규모의 프로젝트.

Ralph Loop 없이 Claude Code로 시도했을 때?
→ **10%도 못 함**

Ralph Loop 켜고 돌렸더니?
→ **$300 이하**로 완성

167배 차이다.

### 사례 2: 프로그래밍 언어를 만들다

**CURSED**라는 프로그래밍 언어가 있다.
농담 아니고 진짜 작동하는 언어다.

이걸 만드는 데 걸린 시간? **3개월.**
근데 사람이 붙잡고 있던 게 아니다.

Ralph Loop 켜놓고 주기적으로 확인만 했다.

### 사례 3: Y Combinator 해커톤

해커톤에서 Ralph Loop로 밤새 돌렸더니
→ **6개 레포지토리** 완성
→ 비용은 **$297**

---

## 자주 묻는 질문

### Q: 토큰 비용이 많이 나오지 않나요?

A: 루프를 돌리니까 당연히 일반 사용보다 많이 나온다.
그래서 `--max-iterations`가 중요하다.

처음엔 10~20회로 시작해서, 작업 규모에 맞게 조절하자.

### Q: 무한 루프에 빠지면 어떡하나요?

A: 두 가지 안전장치가 있다.

1. `-max-iterations`: 지정한 횟수 넘으면 자동 종료
2. `/ralph-wiggum:cancel-ralph`: 수동으로 즉시 중단

### Q: completion-promise는 꼭 넣어야 하나요?

A: 권장한다.
안 넣으면 `--max-iterations`에만 의존하게 되는데,
Claude가 실제로 완료했는지 판단하기 어려워진다.

### Q: 영어로 프롬프트 써야 하나요?

A: 한국어도 잘 된다.
다만 completion-promise 부분은 영어 단어로 쓰는 게 안전하다.

```bash
# 이렇게 쓰면 된다
/ralph-wiggum:ralph-loop "한국어로 작업 설명...
완료하면 <promise>DONE</promise> 출력해." --completion-promise "DONE"

```

---

## 명령어 총정리

| 명령어 | 설명 |
| --- | --- |
| `/plugin install ralph-wiggum@claude-plugins-official` | 플러그인 설치 |
| `/ralph-wiggum:ralph-loop "프롬프트"` | 루프 시작 |
| `/ralph-wiggum:cancel-ralph` | 루프 중단 |
| `/ralph-wiggum:help` | 도움말 |

| 옵션 | 설명 | 기본값 |
| --- | --- | --- |
| `--max-iterations <n>` | 최대 반복 횟수 | 무제한 (위험!) |
| `--completion-promise "<텍스트>"` | 완료 신호 문구 | 없음 |

---

## 결론: Claude를 진짜 일하게 만들자

Claude Code는 똑똑하다.
근데 **"이 정도면 됐겠지"**에서 멈춘다.

Ralph Loop는 이 게으름을 허용하지 않는다.

**"끝날 때까지 끝난 게 아니야."**

결과?

- 더 완성도 높은 코드
- 더 적은 수동 수정
- 더 적은 "에러 나는데요?" 대화

바이브 코딩의 다음 단계는 이거다.

```
"야, 해줘"
    ↓
"야, 끝까지 해줘"

```

---

### 지금 바로 시작하기

```bash
# 1. 설치
/plugin install ralph-wiggum@claude-plugins-official

# 2. 첫 번째 루프 실행
/ralph-wiggum:ralph-loop "Hello World API 만들어줘.
테스트 포함. 완료하면 <promise>DONE</promise> 출력." --completion-promise "DONE" --max-iterations 15

```

이제 Claude를 야근시킬 준비 완료.