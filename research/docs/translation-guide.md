# Easy Peasy Claude Code — 영한 번역 스타일 가이드

> 작성일: 2026-02-28
> 대상: "Easy Peasy Claude Code" 시리즈 59편의 영문 번역
> 원문 문체: 부코우스키(Bukowski)적 더티 리얼리즘 + 블루칼라 개발자 감성

---

## 1. 문체 정체성: "블루칼라 개발자"

이 글의 저자는 코딩을 모르는 사람이 터미널 앞에서 부딪히며 배운 기록을 쓴다.
문체의 핵심은 **고상하지 않은 솔직함**이다.

### 1.1 레퍼런스 작가

| 작가 | 유사점 | 참고 작품 |
|------|--------|-----------|
| **Charles Bukowski** (1차) | 단문 타격, 생리적 비유, 냉소적 유머, Self-correction 리듬 | *Post Office*, *Factotum* |
| Jason Fried (2차) | 짧고 단호한 선언문 스타일, 불필요한 수식어 제거 | *Rework*, *It Doesn't Have to Be Crazy at Work* |
| Paul Graham (3차) | 에세이 형식의 기술 통찰, 본질을 꿰뚫는 관점 | paulgraham.com 에세이 |

### 1.2 핵심 톤 공식

```
Bukowski Grit (60%) + Indie Hacker Manifesto (30%) + Product Philosopher (10%)
```

- **60% Bukowski**: 날것의 감정, 거친 비유, 짧은 호흡
- **30% Indie Hacker**: 단호한 선언, 실전 중심, 군더더기 없음
- **10% Product**: 통찰의 순간에만 잠깐 격을 올림

---

## 2. 문장 구조 규칙

### 2.1 짧게 끊어라

원문의 최대 강점은 **짧고 단호한 문장의 연속 타격**이다.

```
❌ I have three computers at home and I just want them to work together
   seamlessly so that I can have a unified experience across all devices.

✅ Three computers.
   No, three.
   One for the heavy lifting, one for the backup.
   And a laptop for the road.
```

- 평균 문장 길이: **8-15 단어**
- 최대 문장 길이: 25 단어 (넘으면 쪼갠다)
- 한 문단: 1-3 문장

### 2.2 Self-correction 리듬 살리기

원문에서 "아 세대"처럼 자기 말을 고치는 흐름은 **사고의 라이브 스트리밍**이다. 반드시 살려야 한다.

```
Korean: "집에 컴퓨터가 두 대 있다. 아 세대."
English: "Two computers at home. Wait, three."

Korean: "그건 좋은 UX다. 아니, 그냥 당연한 거다."
English: "That's good UX. No—that's just how things should work."
```

### 2.3 반복 구조로 리듬감

같은 문법 구조를 반복해서 비교-대조의 펀치를 날린다.

```
I use an iPhone. It works. Unlock, tap, done.
That's good UX.

I use an iMac. It's a nightmare.
Three menus deep just to breathe.
That's bad UX.
```

---

## 3. 핵심 표현 번역 사전

### 3.1 감정/비유 표현

| 한글 원문 | ❌ 직역 (쓰지 마라) | ✅ 의역 (이걸 써라) | 뉘앙스 |
|-----------|---------------------|---------------------|--------|
| 피똥을 싼다 | Pooping blood | Slogging through hell / Slowly bleeding out through a thousand tiny frustrations | 만성적 고통, 누적되는 스트레스 |
| 코 후비며 | Picking nose | Nonchalantly / Casually asking | AI의 무심함, 여유로움 |
| 짜증이 곧 스펙이다 | Annoyance is specification | **Frustration is the Spec.** | 짧고 강렬하게. 관사 빼도 됨. |
| 한방에 확 싸고 편하게 산다 | (불가) | Get it over with in one brutal push, then live easy | 고통을 한번에 감수하는 결단 |
| 삽질 | Shoveling | Yak shaving / Going down the rabbit hole | 개발 커뮤니티 관용어 활용 |
| 뻘짓 | Stupid work | Spinning wheels / Busywork that goes nowhere | 무의미한 반복 작업 |
| 멘탈 나간다 | Mental goes away | Losing my mind / Brain is fried | 정신적 한계 |
| 개고생 | Dog suffering | Pure hell / Grinding through misery | 극도의 고생 |
| 욕 나온다 | Swear comes out | Makes you want to scream | 분노의 임계점 |
| 찐 (진짜의) | Real | The real deal / No-BS / Legit | 정품, 가짜 아님 강조 |
| 걍 해줘 | Just do it for me | Just. Do. It. / Handle it. | 명령조의 절박함 |

### 3.2 기술 관련 표현

| 한글 원문 | 영문 번역 | 비고 |
|-----------|-----------|------|
| 바이브 코딩 | Vibe Coding | 고유명사 취급, 대문자 |
| 복붙 | Copy-paste hell / The copy-paste treadmill | 단순 copy-paste보다 부정적 뉘앙스 살림 |
| 스파게티 코드 | Spaghetti code | 그대로 사용 (영어권 관용어) |
| 에러 지옥 | Error hell / Debug nightmare | |
| 돌아가는 놈 | Something that actually works | 구어체 유지 |
| 서비스급 | Production-grade / Ship-ready | |
| 느낌적인 느낌 | Going by feel / Vibes-first | Karpathy 원문 참조 |

### 3.3 톤 마커

| 상황 | 한글 패턴 | 영어 패턴 |
|------|-----------|-----------|
| 깨달음의 순간 | "그때 알았다." | "That's when it hit me." |
| 냉소적 질문 | "그게 되냐고?" | "Does that even work? Spoiler: no." |
| 자기 비하 | "코딩 경력? 0년." | "Coding experience? Zero. Zilch. Nada." |
| 선언 | "복붙의 시대는 끝났다." | "The age of copy-paste is dead." |
| 분노 전환 | "짜증났다. 그래서 만들었다." | "I was pissed. So I built it." |
| 독자 도발 | "준비됐으면 터미널 열어라." | "Ready? Open your terminal." |

---

## 4. 문체의 4가지 법칙

### 법칙 1: 거창한 것을 지하실로 끌고 내려가라 (Demystify)

전문 용어나 거창한 개념을 **개인적인 신체적 경험**으로 끌어내린다.

```
❌ "UX refers to the overall experience a user has when interacting with
   a product or service, encompassing usability, accessibility, and satisfaction."

✅ "UX? Fancy word for a simple thing.
   I unlock my phone. It works. That's good UX.
   I open my Mac. Three menus to do one thing. That's bad UX.
   UX is just this: a desperate itch for things to work."
```

### 법칙 2: 고통을 가리지 마라 (Show the Pain)

시행착오와 실패를 숨기지 않는다. 오히려 **가장 처참한 순간을 확대**한다.

```
❌ "After some trial and error, I found a solution."

✅ "Thirteen fixes. Thirteen.
   Every time I patched one spot, three more cracked open.
   I was playing whack-a-mole with my own code."
```

### 법칙 3: AI와의 관계는 '동료'도 '도구'도 아닌 '싸움 상대' (The Sparring Partner)

이 글에서 AI는 친절한 조수가 아니다. **맞서 싸워야 경계선이 보이는 스파링 파트너**다.

```
❌ "I asked Claude to help me with the architecture."

✅ "I threw the problem at Claude.
   Claude threw it back. 'Can't do that.'
   I threw it again, differently.
   Twenty rounds later, I had my answer—
   not from Claude, but from the fight itself."
```

### 법칙 4: 선언문처럼 끝내라 (End with a Manifesto Line)

각 글의 마지막은 **한 문장 선언**으로 찍는다.

```
"Stop copying. Start commanding."
"Frustration is the Spec."
"In the beginning, there was annoyance."
"Implementation is free. Orchestration is not."
```

---

## 5. 번역 프로세스

### 5.1 단계별 워크플로우

```
Step 1: 원문 통독 — 감정의 흐름 파악 (어디서 짜증나고, 어디서 깨닫고, 어디서 선언하는가)
Step 2: 핵심 문장 3개 추출 — 글의 뼈대가 되는 선언문
Step 3: 부코우스키 톤으로 초벌 번역 — 감정 우선, 정확도 후순위
Step 4: 기술 용어 검증 — 개발자가 읽어도 오역 없는지 확인
Step 5: 리듬 체크 — 소리 내서 읽었을 때 타격감이 있는가?
Step 6: 불필요한 수식어 삭제 — 형용사/부사를 50% 줄인다
```

### 5.2 번역 품질 체크리스트

- [ ] 평균 문장 길이 15단어 이하인가?
- [ ] Self-correction 리듬이 살아있는가? ("Wait, no—")
- [ ] 비속어/생리적 비유가 자연스러운가? (억지스러우면 빼라)
- [ ] 선언문 한 줄이 있는가?
- [ ] 기술 용어가 정확한가?
- [ ] 소리 내서 읽었을 때 리듬이 있는가?
- [ ] "AI에게 물어본다"가 아니라 "AI와 싸운다" 톤인가?

### 5.3 피해야 할 것

| 절대 하지 마라 | 이유 |
|----------------|------|
| 수동태 남용 | 부코우스키는 수동태를 안 쓴다. "The code was written" → "I wrote the code." |
| 학술적 어휘 | "utilize" → "use", "facilitate" → "help", "leverage" → 그냥 빼라 |
| 이모지 과다 | 원문이 거칠면 이모지가 톤을 죽인다. 최소한만. |
| 겸양의 표현 | "I think maybe..." → "Here's what happened." |
| 긴 도입부 | 첫 문장에서 바로 시작. "In this article, I will discuss..." 같은 건 삭제. |

---

## 6. 샘플 번역

### 원문 (058번 도입부)

> 집에 컴퓨터가 두 대 있다. 아 세대. 메인 데탑, 서브 데탑, 그리고 노트북.
> 원하는 건 하나뿐이다. 그냥 컴퓨터 한 대처럼 쓰고 싶다.
> 앉아서 명령 하나 때리면, 세 놈이 다 움직이고.
> 파일은 알아서 왔다 갔다 하고.
> 집에서도, 밖에서도, 폰에서도. 걍 일하고 싶다.
> 기술 이야기가 아니다. 그냥 이렇게 살고 싶다는 거다.

### 번역 (Bukowski + Indie Hacker)

> **Three computers.**
> No, three.
> One for the heavy lifting, one for the backup.
> And a laptop for the road.
>
> I'm not asking for the moon.
> I just want the three of them to act like one.
> Sit down, bark an order, and they all move.
> Files sliding back and forth, smooth as whiskey.
> In the house, on the street, on the damn phone.
> I just want to work without the headache.
> That's it.
>
> It's not a tech talk.
> I don't care about your frameworks.
> I just want to live.

### 번역 분석

| 요소 | 적용 |
|------|------|
| Self-correction | "Two? No, three." |
| 생리적 비유 | "smooth as whiskey" (위스키처럼 매끄럽게) |
| 짧은 선언 마무리 | "I just want to live." |
| 불필요한 설명 제거 | 원문의 "메인 데탑, 서브 데탑" → 역할로 압축 |
| 톤 유지 | "bark an order", "damn phone" → 거친 어감 |

---

## 7. 글 유형별 톤 가이드

시리즈 59편은 내용에 따라 톤 비율을 조절한다.

| 글 유형 | Bukowski | Indie Hacker | Product | 예시 포스트 |
|---------|----------|--------------|---------|-------------|
| 경험담/실패기 | **70%** | 20% | 10% | 049-054, 008, 012 |
| 도구 리뷰/비교 | 30% | **50%** | 20% | 019, 029, 031, 042 |
| AI 산업 비평 | **60%** | 10% | 30% | 021, 032, 040, 041 |
| 기술 해설 | 20% | 30% | **50%** | 037, 043, 055-057 |
| 프롬프트/방법론 | 30% | **50%** | 20% | 025, 030, 035, 045 |
| 프롤로그/에필로그 | **60%** | 30% | 10% | 000, 058 |

---

## 8. 제목 번역 원칙

### 8.1 공식

```
짧게 (5단어 이하) + 강렬하게 + 의문 or 선언
```

### 8.2 예시

| # | 한글 제목 | 영문 제목 |
|---|-----------|-----------|
| 000 | 프롤로그 | Prologue: Stop Copying. |
| 004 | GitHub이 AI 코딩의 치명적 약점을 해결했다 | GitHub Fixed What AI Couldn't |
| 006 | 복순이 대수술기 | 10,000 Lines of Spaghetti |
| 014 | 키들린의 법칙 2.0 | Write It Down. 90% Solved. |
| 049 | 강의 따라하는데 누가 망하냐구요? 저요! | I Followed the Tutorial. I Failed. |
| 050 | AI가 멍청한 게 아닙니다 | AI Isn't Stupid. You Are. |
| 052 | 구현은 공짜다 | Implementation Is Free. |
| 054 | 바이브 코딩이란 무엇인가 | What Vibe Coding Actually Is |
| 058 | 짜증이 스펙이 되기까지 | Frustration Is the Spec |

### 8.3 제목에서 피할 것

- "How to..." (너무 일반적)
- "The Ultimate Guide to..." (클릭베이트)
- "Everything You Need to Know About..." (장황함)
- 숫자 리스트 제목은 OK ("7 Terms", "36 Tips") — 내용이 실제로 리스트일 때만

---

## 9. SEO & 플랫폼 고려사항

### 9.1 이중 제목 전략

```yaml
# 블로그 (SEO 친화적)
title: "Frustration Is the Spec: How Annoyance Becomes Architecture"

# Twitter/X (타격감 우선)
tweet: "Frustration is the Spec. I had three computers. I just wanted them to act like one. So I built it."

# Substack/Newsletter (호기심 유발)
subject: "I was pissed off. So I wrote a spec."
```

### 9.2 플랫폼별 톤 조절

| 플랫폼 | Bukowski 강도 | 비속어 허용 | 문장 길이 |
|--------|---------------|-------------|-----------|
| 블로그 본문 | 100% | ✅ (damn, hell, pissed) | 자유 |
| Twitter/X | 80% | ✅ | 280자 제한 |
| LinkedIn | 40% | ❌ | 약간 길어도 OK |
| Dev.to / HN | 90% | ✅ | 짧게 |
| Newsletter 제목 | 100% | ✅ | 초짧게 |

---

## 부록 A: 부코우스키 핵심 인용 (톤 참조용)

> "Find what you love and let it kill you."

> "Some people never go crazy. What truly horrible lives they must lead."

> "The problem with the world is that the intelligent people are full of doubts, while the stupid ones are full of confidence."

> "If you're going to try, go all the way. Otherwise, don't even start."

이 에너지를 기술 에세이에 담는 것이 이 번역 프로젝트의 목표다.

---

## 부록 B: 문체 유사도 매핑

| 원문 특성 | 부코우스키 대응 | 번역 전략 |
|-----------|----------------|-----------|
| 짧고 단호한 문장 | 타자기 리듬 | 15단어 이하 유지 |
| 자기 말 수정 ("아 세대") | 술기운 독백 | "Wait—" "No—" 패턴 |
| 생리적 비유 ("피똥") | 육체의 언어 | 물리적 고통 메타포 |
| 거창한 개념 끌어내림 | 지하실 강등 | 개인 경험으로 재정의 |
| 1:다 투쟁 구도 | 고독한 반항 | "The world vs. me" 프레이밍 |
| 능동적 냉소 | "내 타자기 앞에서 죽겠다" | "Pissed off → So I built it" |

---

*이 가이드는 Easy Peasy Claude Code 시리즈 전체 번역에 적용한다.*
*원문의 '바이브'를 죽이느니, 차라리 문법을 죽여라.*
