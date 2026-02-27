# 8. vibecode.town English Voice Guide

> **Purpose:** 한국어 원본을 영어로 재창작할 때의 톤/스타일 가이드
> **원칙:** 번역이 아니라 같은 감정으로 다시 쓰는 것

---

## 1. 톤 레퍼런스 (3인 교집합)

| 레퍼런스 | 가져올 것 | 가져오지 않을 것 |
|---------|----------|---------------|
| **Charles Bukowski** | 짧은 문장, 펀치, 포장 없는 감정, 자기비하 리듬 | 욕설, 비속어, 자기파괴적 톤 |
| **Paul Graham** | 명료함, 누구나 읽히는 테크 에세이, 논리 전개 | 학술적 거리감, 차가움 |
| **Anthony Bourdain** | 솔직함, 날것 느낌, 유머, 인간미 | 음식 메타포 남발, 냉소 |

### AI 프롬프트 원라이너

```
Bukowski rhythm, Paul Graham clarity, Bourdain honesty.
No profanity. Short sentences. Real emotions.
```

---

## 2. 절대 규칙

### DO (해라)

- **재창작하라.** 한국어 원본의 감정/의도를 영어로 다시 쓴다.
- **짧게 쓰라.** 한 문장 = 한 생각. 길어지면 끊는다.
- **감정을 보존하라.** 짜증은 짜증으로, 감탄은 감탄으로. 톤을 중립화하지 않는다.
- **구어체를 유지하라.** "One does not simply..." 같은 문어체 금지. 사람이 말하는 것처럼.
- **능동태.** "It was discovered that..." 금지. "I found out..." 으로.

### DON'T (하지 마라)

- **직역 금지.** 한국어 문장 구조를 영어에 그대로 옮기지 않는다.
- **욕설 금지.** damn, shit, fuck 등 비속어 사용하지 않는다.
- **과장 금지.** "absolutely insane", "mind-blowing", "game-changer" 같은 테크 블로그 클리셰 금지.
- **이모지 금지.** 글 본문에 이모지 없다.
- **격식체 금지.** "Furthermore", "In conclusion", "It should be noted that" 금지.

---

## 3. 번역 패턴 사전

한국어 원본에서 자주 나오는 표현들의 영어 처리법.

### 감정 표현

| 한국어 | 직역 (금지) | 재창작 (사용) |
|--------|-----------|-------------|
| 피똥을 싼다 | poop blood | You die a little inside. |
| 하아아아 | Haaaah | I wanted to throw my laptop out the window. |
| 코 후비며 | picking my nose | Half paying attention, I asked... |
| 아 짜증나 | Ah annoying | This drove me up the wall. |
| 뭐? 이게 말이 되냐고 | What? Does this make sense? | Excuse me? |
| 이게 무슨 2008년이냐 | What is this, 2008? | What is this, 2008? (이건 그대로 됨) |
| 까먹으면? 끝이다. | If you forget? It's over. | Forget once? You're done. |
| 이쯤 되면 | At this point | At this point (이것도 그대로) |
| 백번 양보해서 | Conceding a hundred times | Even if I'm being generous... |
| 그래서 찾아봤다 | So I looked it up | So I went looking. |

### 리듬 표현

| 한국어 패턴 | 영어 패턴 |
|------------|----------|
| X다. Y다. Z다. (3연타) | X. Y. Z. (동일하게 3연타 유지) |
| 이게 끝이다. | That's it. / Full stop. |
| 근데 이게 아니다. | But that's not it. / Close, but no. |
| 그냥 ~ 하고 싶다. | I just want to ~. |
| ~한 적이 없다. | I never once ~. |
| 다시 말하면, | In other words, / Put differently, |

### 강조 표현

| 한국어 | 영어 |
|--------|------|
| 별 거 아니다 | Nothing fancy. |
| 거창한 거 아니다 | It's not rocket science. |
| 이거 하나다 | One thing. Just one. |
| 선택지가 두 개다 | Two options. |
| 그게 스펙이다. | That's your spec. |

### 기술 용어 처리

| 상황 | 처리 |
|------|------|
| 한국어로 쉽게 풀어 쓴 기술 개념 | 영어에서도 동일하게 쉽게 풀어 쓴다. 전문 용어로 복원하지 않는다. |
| 영어 기술 용어가 한국어 원본에 그대로 등장 | 그대로 유지 (SSH, QUIC, rsync 등) |
| 한국어 비유 (편지→전보→전화→카톡) | 문화적으로 동일한 비유로 교체. 카톡→iMessage 또는 그냥 "a text" |

---

## 4. 문장 길이 가이드

| 유형 | 목표 길이 | 예시 |
|------|----------|------|
| 펀치 라인 | 3-7 단어 | "That's it." / "I chose option two." |
| 설명 문장 | 10-20 단어 | "I wanted to use three computers as if they were one." |
| 최대 | 25 단어 | 이 이상 길어지면 두 문장으로 끊는다. |

한 단락 최대 3-4문장. 한 문장짜리 단락 자주 사용.

---

## 5. 제목/부제 스타일

### 시리즈 타이틀

```
한국어: 바이브코딩 110 - 당신의 짜증이 곧 스펙이다.
영어:   Vibe Coding 110 — Your Frustration Is the Spec.
```

- 넘버링 유지
- 대시(—) em dash 사용
- 마침표로 끝남 (선언문 톤)

### 섹션 헤딩

```
한국어: 내가 원하는 건 이거 하나다
영어:   One thing. That's all I want.

한국어: AI는 정답을 안 준다
영어:   AI doesn't give you answers.

한국어: 짜증을 질문으로 바꾸기
영어:   Turn your frustration into questions.
```

- 짧게. 동사형 또는 선언형.
- "How to..." 패턴 금지 (너무 튜토리얼 느낌).

---

## 6. 파이프라인

```
1. 한국어 원본 작성 (저자)
2. AI 영어 재창작 (이 가이드 + 원본 제공)
3. 저자 검토 (감 확인, 10-15분)
4. 발행 (한국어 먼저, 영어는 2-3일 후)
```

### AI 프롬프트 템플릿

```
You are rewriting a Korean tech blog post into English.

Voice references: Bukowski's rhythm, Paul Graham's clarity,
Bourdain's honesty. No profanity.

Rules:
- This is a RECREATION, not a translation.
- Preserve the emotion and rhythm of the original.
- Short sentences. One thought per sentence.
- No tech blog clichés ("game-changer", "deep dive", "unpack").
- No formal English ("Furthermore", "It should be noted").
- No emoji.
- Keep technical terms as-is (SSH, QUIC, MCP, etc).
- Cultural references: adapt, don't transliterate.
- Maximum sentence length: 25 words. Break longer ones.

Here is the Korean original:

[원본 붙여넣기]
```

---

## 7. 품질 체크리스트

영어 버전 발행 전 확인:

- [ ] 소리 내어 읽었을 때 자연스러운가? (어색하면 다시 쓴다)
- [ ] 한국어 원본의 감정이 살아있는가?
- [ ] 문장이 25단어를 넘는 곳이 없는가?
- [ ] 비속어가 없는가?
- [ ] 테크 블로그 클리셰가 없는가?
- [ ] "Furthermore", "In conclusion" 같은 격식체가 없는가?
- [ ] 한국 문화 레퍼런스가 영어 독자에게도 통하는가?
- [ ] 제목이 7단어 이내인가?

---

## Sources

- Charles Bukowski — *Post Office* (1971), *Ham on Rye* (1982): 리듬, 자기비하, 짧은 문장
- Paul Graham — paulgraham.com essays: 명료함, 접근성, 논리
- Anthony Bourdain — *Kitchen Confidential* (2000): 솔직함, 유머, 포장 없는 진정성
