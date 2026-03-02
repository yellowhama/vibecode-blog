---
description: "트위터 큐 관리 (목록, 승인, 아카이브, 상태)"
argument-hint: "<list | approve | archive | status> [file-path]"
allowed-tools: ["Read", "Glob", "Grep", "Bash", "Edit", "Write"]
---

# Twitter Queue — 큐 관리

트위터 큐 파일의 상태를 관리한다.

## 명령

- 작업: $ARGUMENTS

첫 번째 단어로 작업을 분기한다. 인자가 없으면 `list`를 실행한다.

## 작업별 동작

### `list` (기본값)

`twitter/queue/` 의 모든 활성 JSON 파일을 스캔한다 (archive 제외).

각 파일의 items를 테이블로 표시:

```
| 파일 | ID | 제목 | 상태 | 스케줄 |
|------|-----|------|------|--------|
| 2026-w10-act1.json | w10-act1-001 | I Thought It Worked | draft | 2026-03-03 14:00 UTC |
| ... | ... | ... | ... | ... |
```

### `approve [file-path]`

지정된 파일의 모든 `"draft"` 항목을 `"approved"`로 변경한다.

- file-path가 없으면: 전체 draft 목록을 보여주고 사용자에게 어떤 파일을 승인할지 물어본다
- 변경 전에 반드시 사용자에게 확인한다
- Edit 도구로 JSON 파일의 `"status": "draft"` → `"status": "approved"` 변경

### `archive [file-path]`

지정된 파일을 `twitter/queue/archive/`로 이동한다.

- archive 디렉토리가 없으면 생성한다
- `posted` 상태의 파일만 아카이브한다
- `draft` 또는 `approved` 상태의 파일은 경고하고 사용자 확인을 받는다
- `mv` 명령으로 이동

### `status`

전체 큐 요약을 표시한다:

```
큐 상태 요약
─────────────
draft:    3개 (w10-act1-001, w10-act1-002, w10-act1-003)
approved: 0개
posted:   0개
archived: 2개

다음 스케줄: 2026-03-03 14:00 UTC (w10-act1-001: "I Thought It Worked")
```

## 상태 흐름

```
draft → approved → posting → posted
                           → failed
                           → partial
```

- `draft`: 작성됨, 미승인
- `approved`: 승인됨, 포스팅 대기
- `posting`: GitHub Actions가 포스팅 중 (이중 포스팅 방지)
- `posted`: 포스팅 완료, postedIds 기록됨
- `failed`: 포스팅 실패, error 기록됨
- `partial`: 일부만 포스팅됨

이 스킬에서는 `draft` ↔ `approved` 전환만 담당한다.
`posting` 이후 상태는 GitHub Actions (`twitter-post.yml`)가 관리한다.
