---
description: "서사 설계 기반 트위터 쓰레드 작성 → 큐 JSON 생성"
argument-hint: "<source-path>"
allowed-tools: ["Read", "Glob", "Grep", "Write", "Task"]
---

# Twitter Draft — 트윗 작성

`/twitter-plan`에서 설계한 서사 구조(또는 대화 컨텍스트의 설계)를 바탕으로 실제 트윗을 작성하고 큐 JSON 파일을 생성한다.

## 소스

- 소스 경로: $ARGUMENTS

## 프로세스

1. 대화 컨텍스트에서 서사 설계를 확인한다 (없으면 사용자에게 `/twitter-plan`을 먼저 실행하라고 안내)
2. 소스 파일을 읽는다
3. 아래 레퍼런스 파일을 **반드시** 읽는다:
   - `branding/voice.md` — 톤 SSOT. 특히:
     - §1 제1원칙: 톤을 올리지 마라
     - §4 영문 톤 공식: Bukowski 60% + Indie Hacker 30% + Product 10%
     - §5 문장 규칙: 8-15단어 평균, self-correction 리듬, 선언문 마무리
     - §7 금지 표현 목록
     - §9 문체 4법칙: 지하실로 끌고 내려가라 / 고통을 가리지 마라 / AI는 싸움 상대 / 선언문처럼 끝내라
   - `branding/narrative.md` — 페르마 구조, 첫 트윗 패턴
   - `branding/examples.md` — 좋은/나쁜 예시, 광고 카피 체크리스트
   - `systems/twitter/strategy/STRATEGY.md` — 나이키 룰, 행동이 전면, 기술적 가치 필터
4. 기존 큐 파일 확인 — 같은 week에 파일이 있으면 충돌 경고
5. 트윗을 작성한다
6. 큐 JSON 파일을 생성한다: `systems/twitter/queue/YYYY-wWW-{series}.json`
7. 사용자에게 결과를 제시한다

## 작성 규칙

### 톤
- **Mode A (싸지르기)**: 생각 순서 그대로. 정리 안 한다.
- 한 문장 = 한 줄. 절대 합치지 않는다.
- 3-7단어 펀치가 기본 리듬.
- 자문자답. 감정이 문장 사이에 그냥 튀어나온다.
- 마무리는 선언문. 짧게. 끝.

### 읽는 맛
- X Premium이므로 글자 수 제한 없음. 읽는 맛이 최우선.
- 소스 원문의 리듬(짧은 줄, 끊어 쓰기, 자문자답, 감정 터짐)을 **그대로 보존**한다.
- 요약하거나 압축하지 않는다. 원문이 3단어면 3단어 그대로.

### 절대 금지
- **금지 표현**: game-changer, deep dive, unpack, Furthermore, In conclusion, utilize, facilitate, leverage, "I think maybe...", "I write about...", "In this article..."
- **링크/CTA**: http, https, .com, .town, .pro, "check out", "read more", "more at" — 전부 금지
- **시간 참조**: "six months", "X months", "X weeks", "months ago" — 시간 개념 자체를 빼라
- **"4줄 스펙"**: "four lines" / "4줄" 금지. Purpose/Reason/Method/Means는 "4가지 개념".
- **수동태 남용**: "The code was written" → "I wrote the code."
- **자기소개**: "I'm building..." / "I write about..." = 광고

### AI 묘사
- AI는 친절한 조수가 아니다. 싸움 상대.
- ❌ "I asked Claude to help me."
- ✅ "I threw the problem at Claude. Claude threw it back."

## 큐 JSON 포맷

```json
{
  "week": "YYYY-wWW",
  "series": "시리즈명",
  "generatedAt": "ISO8601+09:00",
  "items": [{
    "id": "wWW-{series}-NNN",
    "type": "thread",
    "category": "카테고리명",
    "title": "쓰레드 제목",
    "source": "소스 파일 상대경로",
    "scheduledAt": "ISO8601 UTC",
    "status": "draft",
    "content": ["트윗1 내용", "트윗2 내용", "..."],
    "postedIds": [],
    "postedAt": null,
    "error": null
  }]
}
```

- `content` 배열의 각 항목 = 1 트윗
- 줄바꿈은 `\n`
- 따옴표는 `\"` 이스케이프
- `status`는 항상 `"draft"`로 생성

## 출력

`systems/twitter/queue/` 에 JSON 파일을 생성하고 사용자에게 내용을 제시한다.
검증은 `/twitter-check`로 별도 실행한다.
