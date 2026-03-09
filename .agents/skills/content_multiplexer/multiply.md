---
description: "블로그 소스 → Twitter + Video + Shorts 3채널 동시 변환"
argument-hint: "<blog-source-path>"
allowed-tools: ["Read", "Glob", "Grep", "Write", "Task"]
---

# Multiply — 멀티채널 콘텐츠 변환

소스 블로그 파일 하나를 읽고, 3채널(Twitter, Video, Shorts) 초안을 동시에 생성한다.

## 소스

- 소스 경로: $ARGUMENTS

## 프로세스

1. 소스 블로그 파일 전체를 읽는다
2. 아래 레퍼런스 파일을 **반드시** 읽는다:
   - `branding/voice.md` — 톤 SSOT
   - `branding/narrative.md` — 3막 구조, 페르마 구조
   - `branding/examples.md` — 좋은/나쁜 예시
   - `systems/twitter/strategy/STRATEGY.md` — 나이키 룰, 비트 구조
3. `systems/analytics/feedback-context.md` 읽기 (존재 시) — 성과 패턴 참고
4. 3채널 초안을 생성한다:

### A. Twitter Thread Plan + Draft

- `twitter-plan.md`/`twitter-draft.md` 로직을 인라인으로 적용
- Beat 구조 (Beat 1~5) 기반 서사 설계
- 페르마 구조: 첫 트윗은 독립 완결
- 나이키 룰: 링크/CTA/제품명 없음
- 출력: 트윗 content 배열 (큐 JSON 형식)

### B. Video Narration Script

- 소스에서 핵심 서사 아크 추출
- 2-3문단 내레이션 스크립트 요약 (video-plan 입력용)
- 클레이메이션 캐릭터 비주얼 힌트 포함
- 출력: 마크다운 스크립트 (`systems/video/planning/multiplexed/`)

### C. Short-Form Slide Script

- 5-8장 슬라이드 시퀀스 설계
- 첫 슬라이드 = hook (행동/감정, 설정 아님)
- 텍스트 오버레이 40자 이내
- 총 15-60초 분량
- Beat 프레임워크: Frustration → Starting → Struggling → Learning → Progress
- 출력: 슬라이드 JSON (`systems/shorts/scripts/`)

5. 3채널 초안을 사용자에게 제시한다
6. **사용자 승인 후에만** 파일을 저장한다:
   - Twitter: `systems/twitter/queue/YYYY-wWW-{id}.json` (status: "draft")
   - Video: `systems/video/planning/multiplexed/{id}-script.md`
   - Shorts: `systems/shorts/scripts/{id}-slides.json`
7. `content/publish_log.json` 업데이트 — 소스 → 채널별 매핑 기록

## 절대 규칙

- **나이키 룰**: Twitter 채널에 링크/CTA/제품명 절대 금지
- **톤 일관성**: 3채널 모두 voice.md 톤 SSOT 준수
- **유저 승인 필수**: 파일 저장 전 반드시 유저 리뷰 + 승인
- **시간 참조 금지**: "6개월", "X weeks" 등 구체적 시간 표현 없음
- **금지 표현**: voice.md §7 금지 표현 목록 전체 적용

## publish_log.json 포맷

저장 시 `content/publish_log.json`에 아래 형식으로 추가:

```json
{
  "entries": {
    "<entry-id>": {
      "source": "<blog-source-path>",
      "created_at": "ISO8601",
      "channels": {
        "twitter": { "queue_file": "...", "item_ids": [...], "status": "draft" },
        "video": { "script": "...", "status": "scripted" },
        "shorts": { "script": "...", "status": "scripted" }
      }
    }
  }
}
```

## 출력

3채널 초안을 대화로 제시. 승인 시 파일 저장 + publish_log 업데이트.
