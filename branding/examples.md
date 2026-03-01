# Examples — 좋은 예시 vs 나쁜 예시

> "이렇게 쓰지 마라"만으로는 부족하다. 실물 비교가 있어야 판단할 수 있다.
> 이야기 구조는 `narrative.md` 참조.

---

## §0. 이야기 vs 설명

**이 사람의 글은 설명이 아니라 이야기다.**
같은 소재인데 쓰는 방식에 따라 완전히 다른 글이 됨.

### 이야기 ✅ — RAG를 이야기로 쓰면

```
"엄마, 아까 새로 산 거 어딨어?"
"여기."
"아니 그 검은 거 말고. 새로 산 거. 분홍색."
"이거?"
"아니, 분홍색 바지 말고. 분홍색 티."
이 시점에서 엄마 폭발.
"야 옷장부터 정리해라 임마!"
```

→ 이게 RAG 3-tier 검색 구조 설명의 도입부 (057).
일상 비유로 시작. 기술 용어 하나도 안 나옴. 근데 읽으면 RAG가 뭔지 알게 됨.

### 설명 ❌ — 같은 RAG를 설명으로 쓰면

```
RAG(Retrieval-Augmented Generation)란 외부 데이터를
검색하여 LLM의 응답에 활용하는 기술입니다.
이를 통해 환각(hallucination)을 줄일 수 있습니다.
```

→ 맞는 말인데 아무도 안 읽음. 위키피디아 복붙.

### 이야기 ✅ — Git을 이야기로 쓰면

```
월요일 아침.
책상에 파일 30개.
게임_최종.godot
게임_최종_진짜.godot
게임_최종_진짜_마지막.godot
어떤 게 되는 파일인지 모르겠다.
3일치 작업이 어딘가에 있는데 찾을 수가 없다.
```

→ 이게 Git 세이브 시스템 도입부 (015). 다크소울 모닥불로 이어짐.

### 설명 ❌ — 같은 Git을 설명으로 쓰면

```
Git은 분산 버전 관리 시스템으로,
소스 코드의 변경 이력을 추적합니다.
commit으로 스냅샷을 저장하고 branch로 병렬 개발이 가능합니다.
```

→ 개발 문서. 이 사람이 쓸 글이 아님.

### 구분 체크리스트

글을 쓴 다음 이걸 돌린다:
- [ ] 첫 문장에 사람이 있나? (상황, 감정, 구체적 장면)
- [ ] 감정이 있나? (빡침, 당황, 궁금)
- [ ] 시도→실패가 있나?
- [ ] 비유가 일상에서 나오나?
- [ ] 독자가 "나도 저래" 하나?

전부 아니면 → 설명이다. 이야기로 다시 쓴다.

---

## §1. 트윗 — 광고 vs 사람

### 나쁜 예 ❌ (광고)

```
I built an AI agent runtime for 6 months.

849 Rust + 5,411 TypeScript tests.
15 production pain points killed.

Now writing about what breaks between "it works" and "it handles real users."

→ vibecode.town
```

**왜 나쁜가:**
- "셋업 → 숫자 나열 → 반전 → 선언 → CTA" = 광고 공식 그대로
- LinkedIn 자기소개 톤
- 사이트 링크로 끝남
- 숫자를 인상적으로 보이려고 나열
- "Now writing about..." = 자기소개형 프레이밍

### 나쁜 예 ❌ (광고인데 좀 더 교묘한)

```
6,260 tests. Thought I was done.

Then real users showed up.
69 production gaps. Every one a knife.

The demo looked great.
Production was bleeding.

I write about the bleeding.
vibecode.town
```

**왜 나쁜가:**
- "셋업 → 반전 → 메타포 → 선언" = 여전히 광고 구조
- "Every one a knife" "Production was bleeding" = 연출된 드라마
- "I write about the bleeding" = 멋있는 결론
- 사이트 링크로 끝남

### 나쁜 예 ❌ (짧아서 광고처럼 보이는)

```
Zero coding background.
Built an AI agent runtime anyway.
6,260 tests. Still breaks in production.

No prompt hacks here.
Just what actually happens when you ship.

vibecode.town
```

**왜 나쁜가:**
- 짧을수록 더 광고처럼 됨 — 모든 단어가 "인상 관리"에 쓰임
- "No prompt hacks here" = 자기 포지셔닝 (남과 다르다고 주장)
- 사이트 링크

---

### 좋은 예 ✅ — 패턴 C: 1막만 (짜증이 곧 이야기)

```
Writing tests for the fifth agent.
Just realized it does the exact same thing as agent three.
Six months and I'm only now noticing.
```

**왜 좋은가:**
- 그냥 오늘 있었던 일. 한 트윗에 완결.
- 결론 없음. 교훈 없음.
- 자기비하가 자연스러움 ("I'm only now noticing")
- 1막(짜증)이 곧 이야기 전체.

**3막 분석:**
- 1막: 다섯 번째 에이전트 테스트 → 세 번째랑 똑같은 짓 → 6개월째 이제 알아챔
- 2막: 없음 (필요 없음)
- 3막: 없음 (짜증 자체가 펀치라인)

### 좋은 예 ✅ — 패턴 A: 3막 압축

```
Switched the data collector to Rust last week. 45 minutes down to 1.5.
Didn't expect that. Just tried it because Python was pissing me off.
```

**왜 좋은가:**
- 나이키: "달리기 8개월 했는데 이 신발 좋더라"
- 한 트윗 안에 3막 완결.

**3막 분석:**
- 1막: Python 빡침 ("pissing me off")
- 2막: Rust로 바꿈
- 3막: 45분→1.5분 (예상 못한 결과가 펀치라인)

### 좋은 예 ✅ — 패턴 B: 2막 + 펀치라인

```
Can't code. Started from zero.
Built an AI runtime with 6,260 tests.
It still breaks.
```

**왜 좋은가:**
- 짧지만 광고가 아닌 이유: 결론이 "It still breaks." — 성공이 아니라 현실
- 한 트윗. 완결. 펀치라인이 이야기를 닫음.

**3막 분석:**
- 1막: 코딩 못함 (출발점)
- 2막: 그래도 만듦 (6,260 테스트)
- 3막: "It still breaks." (펀치라인)

### 좋은 예 ✅ — 패턴 D: 빡침에서 나온 관찰

```
Prompt courses for $200. Cool.
I spent 6 months making an AI runtime not die in production.
Prompting was maybe 1% of the work.
The rest was config, error handling, and five agents fighting over one GPU.
Nobody sells courses on that part.
```

**왜 좋은가:**
- 빡쳐서 쓴 것. 광고가 아니라 반응.
- 구체적인 디테일 ("five agents fighting over one GPU")
- 한 트윗. 완결.

**3막 분석:**
- 1막: 프롬프트 강의 200달러에 빡침
- 2막: 실제 내 경험과 대비 (프롬프팅은 1%)
- 3막: "Nobody sells courses on that part." (관찰로 끝남)

---

## §2. 스레드 — 랜딩페이지 vs 삽질 일기

### 나쁜 스레드 구조 ❌

```
트윗 1: 숫자 훅 (10,847 lines of AI code...)
트윗 2: 문제 설정
트윗 3-8: 문제 → 시도 → 실패 → 해결
트윗 9-10: 교훈 정리
트윗 11: "More at vibecode.town"
트윗 12: 블로그 링크 리플라이
```

**왜 나쁜가:**
- 랜딩페이지 카피라이팅 구조
- 미리 계획된 12트윗 = 사람이 생각하는 방식이 아님
- 끝에 CTA + 링크 = 결국 광고

### 좋은 스레드 ✅

할 말이 많아서 이어진 것. 공식 없음.

```
트윗 1: 오늘 있었던 일
트윗 2: 근데 이게 왜 문제냐면
트윗 3: 이렇게 해봤는데
트윗 4: 안 됨
트윗 5: (끝. 아직 해결 못 함.)
```

**왜 좋은가:**
- 길이가 정해져 있지 않음. 할 말 끝나면 끝.
- 해결 안 됐으면 안 된 채로 끝남. 억지 교훈 없음.
- 링크 없음.

---

## §3. 리플라이 — 타겟팅 vs 대화

### 나쁜 리플라이 ❌

```
상대: "Just shipped my vibe-coded app!"
리플라이: "Nice! We found 69 production gaps after 5K tests passed.
The real work starts after shipping. Check out my breakdown →"
```

**왜 나쁜가:**
- 소재 매핑 테이블에서 뽑은 스크립트
- 상대 말에 반응한 게 아니라 자기 콘텐츠를 끼워넣음
- 링크 유도

### 좋은 리플라이 ✅

```
상대: "Just shipped my vibe-coded app!"
리플라이: "What stack? Curious how the deploy went."
```

**왜 좋은가:**
- 진짜 궁금해서 물어봄
- 자기 얘기 안 함
- 대화를 이어가려는 의도

### 좋은 리플라이 ✅

```
상대: "AI-generated code keeps breaking in production"
리플라이: "Same. Found out 5 of my agents were each writing their own date formatter.
Cut them all and picked one. 67% less code, 90% fewer crashes."
```

**왜 좋은가:**
- 상대 말에 공감한 후 자기 경험 공유
- 구체적 디테일
- 링크 없음. "자세한 건 여기서" 안 함.

---

## §4. 광고 카피 체크리스트

쓴 다음 이 체크리스트를 돌린다.
**하나라도 해당하면 버리거나 고친다.**

- [ ] "셋업 → 반전 → 선언 → CTA" 구조인가?
- [ ] 숫자를 나열해서 인상적으로 보이려고 하는가?
- [ ] "I write about..." / "I'm building..." 자기소개인가?
- [ ] 깔끔하게 정리된 교훈이 있는가?
- [ ] 사이트 이름이나 링크로 끝나는가?
- [ ] 매번 같은 패턴을 반복하는가? (매번 숫자 펀치 등)
- [ ] 멋있는 메타포로 드라마를 연출하는가?
- [ ] 다른 사람 대화에 자기 콘텐츠를 끼워넣는가?

### 대신 이 질문을 한다:

**"이거 친구한테 카톡으로 보낼 수 있는 톤인가?"**

보낼 수 있으면 OK.
"이건 좀 오글거려서..." 라면 → 버린다.
