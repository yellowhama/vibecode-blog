---
description: "한국어 블로그 → 영어 번역 (voice.md 톤 유지)"
argument-hint: "<ko-file-path(s) | all>"
allowed-tools: ["Read", "Glob", "Grep", "Write", "Task"]
---

# Blog Translate — 영어 번역

한국어 블로그 포스트를 영어로 번역한다. 톤과 리듬 보존이 핵심.

## 소스

- 한국어 파일 경로: $ARGUMENTS
- 인자가 없으면 `easy_peasy/phase1/` 에서 대응하는 영어 파일이 없는 최신 한국어 파일을 찾는다

## 프로세스

1. 한국어 소스 파일을 읽는다
2. 아래 레퍼런스 파일을 **반드시** 읽는다:
   - `branding/voice.md` — 특히:
     - §1 제1원칙: 톤을 올리지 마라 (번역에서 가장 중요)
     - §4 영문 톤 공식: Bukowski 60% + Indie Hacker 30% + Product 10%
     - §5 문장 규칙: 8-15단어, self-correction 리듬
     - §6 번역 사전: 감정/비유 매핑
     - §7 금지 표현 (영어 버전)
3. 번역 규칙을 적용해서 번역한다
4. 파일을 생성한다:
   - 개별 씬: `easy_peasy/phase1/en/actN-M-en.md`
   - 압축본: `easy_peasy/phase1/en/actN-en.md`
5. 사용자에게 결과를 제시한다

## 번역 원칙

### §1 제1원칙이 번역에서 가장 중요하다
**톤을 올리지 마라.**

한국어가 거칠면 영어도 거칠어야 한다.
한국어가 3단어면 영어도 3단어.
한국어가 끊어 쓰면 영어도 끊어 쓴다.

### 영문 톤 공식
- Bukowski 60%: 짧고 건조하고 거친 문장. 감정은 행동으로.
- Indie Hacker 30%: 구체적 숫자, 실패 인정, 허세 없음.
- Product 10%: 기술 용어는 정확하게. 근데 설명하듯이 쓰지 마.

### 번역 사전 (voice.md §6)
- "피똥을 싼다" → "Slogging through hell" (not "Pooping blood")
- "짜증이 곧 스펙이다" → "Frustration is the Spec." (not "Annoyance is specification")
- "삽질" → "Yak shaving" / "Going down the rabbit hole"
- "빡쳤다" → "Got pissed" / "Snapped"
- "됐다고 생각했다" → "I thought it worked"
- "만 줄" → "Ten thousand lines"

### 리듬 보존
- Self-correction: `"Two computers at home. Wait, three."`
- 선언문 마무리: `"Stop copying. Start commanding."`
- "근데" → "But" (절대 "However" 아님)
- 비꼬는 톤이면 비꼬는 톤 그대로
- 빡친 에너지 보존

## 절대 금지

- **금지 표현**: game-changer, deep dive, unpack, Furthermore, However, In conclusion, utilize, facilitate, leverage
- **톤 올리기**: 한국어가 구어체인데 영어가 격식체면 사형
- **의역 과잉**: 원문의 리듬을 깨면서까지 "자연스러운 영어"를 만들지 마라. 어색해도 리듬이 우선.
- **시간 참조**: "six months", "X months", "X weeks" — 한국어에 없으면 영어에도 없다
- **"four lines"**: "four things"로 번역

## 출력

`easy_peasy/phase1/en/` 에 영어 파일을 생성한다.
검증은 `/blog-check`로 별도 실행한다.
