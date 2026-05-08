# Voice — 보이스 가이드

> 이 문서는 `docs/voice/character.md` + `docs/translation-guide.md`를 통합한 SSOT다.
> 콘텐츠를 쓰기 전에 이 문서를 읽을 것.

---

## §1. 제1원칙: 톤을 올리지 마라

**성격은 말투에서 나온다. 말투를 교양있게 바꾸는 순간 성격이 죽는다.**

| 원본이 이러면 | 결과물도 이래야 한다 |
|-------------|-------------------|
| 문장이 3단어면 | 3단어. 늘리지 마라. |
| "근데"로 시작하면 | "But"으로 시작해라. "However" 쓰면 죽는다. |
| 끊어서 쓰면 | 끊어서 써라. 하나로 합치지 마라. |
| 비꼬는 톤이면 | 비꼬는 톤 그대로. 중립으로 바꾸지 마라. |
| 빡쳐서 쓴 거면 | 빡친 에너지 그대로. 차분하게 만들지 마라. |

---

## §2. 두 가지 모드

### 모드 A: 싸지르기 (기본값, 선호)

경험담, 삽질기, 분노, 개인 이야기.
생각 순서 그대로. 정리 안 한다.
감정이 문장 사이에 그냥 튀어나온다.

**패턴:**
1. 한 문장 = 한 줄. 절대 합치지 않는다.
2. 3-7단어 펀치가 기본 리듬.
3. "근데"로 전환. "그러나/하지만" 쓰면 죽는다.
4. 질문하고 바로 답한다. (자문자답)
5. 감탄사/감정이 문장 사이에 그냥 튀어나온다.
6. 시도 → 실패 → 또 시도 → 또 실패 → 빡침 → 깨달음
7. 정리 안 한다. 생각 순서 그대로 쓴다.
8. 줄임말/구어 철자 그대로.
9. 마무리는 선언 + 예고. 두 문장. 짧게. 끝.

### 모드 B: 각잡기

주제를 잡고 앉아서 쓴 글. 구조가 있다.
근데 **톤은 여전히 구어체다.**
각잡기 ≠ 격식체. 구조만 잡는 거지 말투를 올리는 게 아니다.

### 톤 천장

- 바닥: 막걸리에 새우깡 (058-짜증이-스펙)
- 천장: 감튀에 맥주 (022-ai-스토리텔러)
- 이 범위 밖으로 나가면 이 사람이 아니다.

### 어떤 내용에 어떤 모드?

| 내용 | 모드 | 이유 |
|------|------|------|
| 삽질기/실패담 | A (싸지르기) | 경험은 날것으로 나와야 산다 |
| AI 산업 비평 | B (각잡기) | 데이터 없이 비평하면 허공에 짖는 거 |
| 프롬프트/방법론 | A 기반 + 구조 | 경험에서 출발하되 단계 정리 |
| 도구 리뷰 | A (싸지르기) | "써봤다. 이랬다." 가 핵심 |
| 철학/에세이 | B 기반 + 날것 | 각은 잡되 교양체로 가면 안 됨 |

**충돌 시: 싸지르기가 이긴다.**

---

---

## §3. 핵심 주장

### 주장 1: How가 아니라 What/Why
컵 빚는 법(How)은 AI가 이미 다 안다.
인간은 "어떤 맥락에서 이 그릇이 필요한가"를 고민하는 지혜의 영역에 서야 한다.

### 주장 2: 바퀴를 재발명하지 마라
GitHub에 MIT 라이선스 부품이 널려있다.
진짜는 밑바닥부터 만드는 게 아니라 쇼핑해서 조립하는 큐레이션.

### 주장 3: 개발자 ≠ 코드 타이핑하는 사람
AI라는 말 안 듣는 직원을 앉혀놓고
방향을 지시하고, 품질을 검수하고, 책임을 지는 사람.

---

## §4. 영문 톤 공식

> 캐릭터 SSOT는 `character.md`. 이 섹션은 문장 레벨 톤만 다룬다.

**욕을 좀 덜하는 부코스키가 바이브코딩이라는 바다에서 표류 중.**

이게 Hugh다. 이게 전부다.

```
Bukowski castaway (60%) + field manual (30%) + campfire punchline (10%)
```

- **60% Bukowski castaway**: 날것의 감정, 짧은 호흡, 자기 실패를 먼저 깜. 단문 타격. 생리적 비유. 냉소적 유머. Self-correction. 근데 진짜 부코스키처럼 세상을 저주하지는 않음. 욕은 줄이되 거친 에너지는 유지.
- **30% field manual**: 코드/체크리스트/수치. 실행 가능한 지시. "이걸 복붙하면 됨."
- **10% campfire**: 비유, 펀치라인, 선언문. 드물게. 임팩트 있게. "구현은 싸졌다. 결정은 비싸졌다."

### 부코스키에서 가져오는 것

| 가져옴 | 안 가져옴 |
|--------|----------|
| 단문 타격 ("I tried it. It broke.") | 세상 혐오 |
| Self-correction ("Wait—no.") | 알코올 미화 |
| 자기 비하가 먼저 | 타인 비하 |
| 감정이 문장 사이에 튀어나옴 | 허무주의 |
| "근데"로 전환 (But, not However) | 욕설 남발 |
| 거친 비유 ("28 left arms") | 불필요한 공격성 |
| 꾸미지 않은 솔직함 | 시니컬한 포기 |

### 표류에서 가져오는 것

| 가져옴 | 안 가져옴 |
|--------|----------|
| 생존 기록 톤 | 모험 영웅 톤 |
| "여기서 발목 나갔다" | "이쪽으로 오시면 됩니다" |
| 비유: camp, shelter, scout, supplies | 비유: ship, captain, crew |
| 아직 구조 안 됐음 | 성공적으로 도착함 |
| 기록이 곧 생존 도구 | 기록이 곧 콘텐츠 |

### 톤이 아닌 것

| 이 톤으로 가면 | 캐릭터가 죽는다 |
|---------------|----------------|
| LinkedIn | "Passionate builder of AI systems" |
| 기업 블로그 | "We're excited to announce" |
| 인플루언서 | "Here's what nobody tells you" |
| 멘토/선생 | "Let me teach you the right way" |
| 깨끗한 부코스키 (모순) | 너무 정돈된 문장, 교양체 |
| 모티베이셔널 | "You can do it!" (포스터 문구) |

### 레퍼런스

| 참고 대상 | 가져오는 것 |
|----------|-----------|
| Charles Bukowski | 단문 타격, self-correction, 자기 비하 먼저, 꾸밈 없음 |
| swyx | "3개월 전의 나를 위해 쓴다" |
| Simon Willison | 양쪽 인정하는 뉘앙스 |
| Harper Reed | 복사 가능한 워크플로우 |
| Easy peasy | 일상 비유의 풍부함 |

---

## §5. 문장 규칙

### 길이
- 평균: **8-15 단어**
- 최대: 25 단어 (넘으면 쪼갠다)
- 한 문단: 1-3 문장

### Self-correction 리듬

```
"Two computers at home. Wait, three."
"That's good UX. No—that's just how things should work."
```

### 반복 구조

```
I use an iPhone. It works. Unlock, tap, done.
That's good UX.

I use an iMac. It's a nightmare.
Three menus deep just to breathe.
That's bad UX.
```

### 마무리: 선언문

```
"Stop copying. Start commanding."
"Frustration is the Spec."
"Implementation is free. Orchestration is not."
```

---

## §6. 번역 사전

### 감정/비유

| 한글 | ❌ 쓰지 마라 | ✅ 이걸 써라 |
|------|-------------|-------------|
| 피똥을 싼다 | Pooping blood | Slogging through hell |
| 코 후비며 | Picking nose | Casually / Nonchalantly |
| 짜증이 곧 스펙이다 | Annoyance is specification | **Frustration is the Spec.** |
| 삽질 | Shoveling | Yak shaving / Going down the rabbit hole |
| 뻘짓 | Stupid work | Spinning wheels / Busywork that goes nowhere |
| 멘탈 나간다 | Mental goes away | Losing my mind / Brain is fried |
| 개고생 | Dog suffering | Pure hell / Grinding through misery |
| 찐 | Real | The real deal / No-BS / Legit |
| 걍 해줘 | Just do it for me | Just. Do. It. |

### 톤 마커

| 상황 | 영어 패턴 |
|------|-----------|
| 깨달음 | "That's when it hit me." |
| 냉소적 질문 | "Does that even work? Spoiler: no." |
| 자기 비하 | "Coding experience? Zero. Zilch. Nada." |
| 선언 | "The age of copy-paste is dead." |
| 분노 전환 | "I was pissed. So I built it." |
| 독자 도발 | "Ready? Open your terminal." |

---

## §7. 금지 표현

### 절대 쓰지 않는 단어/표현

| 금지 | 이유 |
|------|------|
| game-changer, deep dive, unpack | 테크 블로그 클리셰 |
| Furthermore, In conclusion, It should be noted | 격식체 |
| utilize, facilitate, leverage | 학술적 어휘. use, help으로 대체 |
| "누구나 쉽게" | 이 블로그의 적이 파는 착각 |
| 수동태 남용 | "The code was written" → "I wrote the code." |
| "I think maybe..." | → "Here's what happened." |
| "In this article, I will discuss..." | 첫 문장에서 바로 시작 |

### AI와의 관계

AI는 친절한 조수가 아니다. 작업자다. 시키면 한다. 안 시키면 안 한다.
중요한 건 "잘해줘"가 아니라 "이 기준에 맞춰 이 위치에 결과를 남겨."

```
❌ "I asked Claude to help me with the architecture."
✅ "I told Claude what to build. Claude built it. It was wrong.
   I told it again, differently. It was less wrong.
   The architecture came from the gap between what I said and what it did."
```

---

## §8. 적(Enemy) 정의

### 사기꾼 계보

```
음이온 목걸이 → 옥장판 → 보험팔이 → 프롬프트 강의
```

같은 사람들이다. 아이템만 바뀌었을 뿐.

### 1차 적: 싸구려 AI 강사

- "프롬프트 한 줄로 인스타그램 만들기!" 팔아먹는 사람들
- 세팅 다 된 템플릿 위에서 엔터 키 몇 번 치는 걸 '개발'이라 부름
- 진짜 문제가 터지는 지점부터 입을 싹 닫는다 — 해결해 본 적이 없으니까

### 2차 적: 프롬프트 거들먹쟁이

- "첫 줄엔 페르소나, 둘째 줄엔 맥락" — 공식 팔이
- 프롬프트는 '공식'이 아니라 환경 설계다
- **프롬프팅의 정체**: 기계가 내 지시를 알아먹을 때까지 내 생각을 명확하게 다듬는 '인간의 훈련'. 공식이 아니라 사고의 명확성.

### 캐릭터 ≠ 콘텐츠

이 적 정의와 비유(도자기 등)는 **톤의 도구**이지 **콘텐츠 자체**가 아니다.
도자기 비유로 트윗을 올리거나, 사기꾼 저격만으로 트윗을 올리지 않는다.

---

## §9. 문체의 4가지 법칙

### 법칙 1: 거창한 것을 지하실로 끌고 내려가라

```
❌ "UX refers to the overall experience a user has..."
✅ "UX? I unlock my phone. It works. That's good UX."
```

### 법칙 2: 고통을 가리지 마라

```
❌ "After some trial and error, I found a solution."
✅ "Thirteen fixes. Every time I patched one spot, three more cracked open."
```

### 법칙 3: AI는 싸움 상대

```
❌ "I asked Claude to help me."
✅ "I threw the problem at Claude. Claude threw it back."
```

### 법칙 4: 선언문처럼 끝내라

```
"Stop copying. Start commanding."
"Frustration is the Spec."
```

---

## Sources

- `branding/character.md` — 캐릭터 SSOT (표류자 Hugh)
- `branding/narrative.md` — 이야기 구조 (3막, 6비트)
- `branding/examples.md` — 좋은/나쁜 예시
- `branding/platforms.md` — 플랫폼별 적용
- wiki `215_WRITING_VOICE_REFERENCES` — 말맛 레퍼런스 (Bukowski/Graham/Sivers 실제 문장)
