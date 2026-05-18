---
title: "에이전트가 쓴 긴 계획서를 HTML로 검토하는 법"
pubDatetime: 2026-05-18T15:00:00Z
description: "Claude Code가 긴 계획서와 PR 설명을 HTML로 만들면 읽기는 쉬워진다. 하지만 원본 계약은 Markdown이나 JSON에 남겨야 한다."
draft: false
featured: false
series: "AI Tool Note"
workflow: "packet"
lang: "ko"
tags: ["ai-tools", "claude-code", "agentic-engineering", "technical-contracts"]
ogImage: "/images/posts/pencil-technical-contract.png"
references:
  - name: "Thariq X post"
    url: "https://x.com/trq212/status/2052809885763747935"
    guru: "Thariq Shihipar"
  - name: "HTML effectiveness examples"
    url: "https://thariqs.github.io/html-effectiveness/"
    guru: "Thariq Shihipar"
  - name: "Simon Willison link post"
    url: "https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/"
    guru: "Simon Willison"
---

# 에이전트가 쓴 긴 계획서를 HTML로 검토하는 법

AI 코딩 에이전트가 계획을 못 써서 문제가 생기는 게 아니다.

요즘 더 흔한 문제는 계획을 너무 길게 잘 쓴다는 것이다. 200줄짜리 Markdown 계획서가 생기고, PR 설명이 길어지고, 리서치 요약이 표와 코드와 다이어그램을 한꺼번에 품으려 한다. 그리고 사람은 조용히 스크롤을 내린다. 읽은 척한다. 다음 프롬프트로 넘어간다.

이건 문서 포맷 취향 문제가 아니다.

검토 표면이 깨진 것이다.

![Technical contract sketch](../../../public/images/posts/pencil-technical-contract.png)

## The Skipped Plan Problem

Thariq Shihipar가 Claude Code에서 Markdown 대신 HTML artifact를 선호한다는 글을 올렸다. 함께 공개된 예시 페이지에는 exploration, PR review, design system, prototype, incident report, prompt tuner 같은 20개 HTML 산출물이 정리돼 있다.

핵심은 "HTML이 예쁘다"가 아니다.

에이전트가 만든 결과물을 사람이 실제로 읽고, 비교하고, 조작하고, 결정할 수 있게 만드는 것이다.

Markdown은 기록하기 좋다. diff가 쉽고, 어디서나 열리고, 에이전트도 잘 쓴다. 하지만 긴 계획서, annotated diff, module map, incident timeline, design variant 같은 산출물은 평평한 텍스트로 들어가면 검토 비용이 커진다.

그 순간 필요한 것은 더 좋은 문장이 아니라 더 좋은 review surface다.

## Keep Markdown As Canon

여기서 바로 "그럼 Markdown 버리자"로 가면 안 된다.

Vibecode 기준은 반대다.

```txt
Markdown is the contract.
HTML is the review surface.
```

원본 계약은 Markdown이나 JSON에 남아야 한다.

```txt
source note
brief
evidence bundle
acceptance criteria
decision record
manifest
runtime evidence JSON
```

이런 것들은 오래 남고, 검색되고, diff되고, 다음 에이전트가 다시 읽어야 한다. HTML만 남기면 예쁘게 보이지만 운영 기억으로는 약해질 수 있다. 특히 generated HTML은 diff가 시끄럽고, CSS와 JS가 섞이면 나중에 무엇이 결정이고 무엇이 장식인지 흐려진다.

그래서 HTML은 canon이 아니라 review artifact로 써야 한다.

## When HTML Wins

HTML이 이기는 순간은 분명하다.

```txt
비교해야 한다
탐색해야 한다
시각 구조가 중요하다
작은 인터랙션이 필요하다
다른 사람에게 링크로 보여줘야 한다
```

예를 들어 에이전트에게 "이 PR 설명 써줘"라고 하면 Markdown이 나올 것이다. 그런데 streaming/backpressure 로직을 잘 모르는 리뷰어에게 보여줘야 한다면 HTML artifact가 더 낫다.

```txt
annotated diff
severity labels
module map
jump links
risk table
review checklist
```

이런 구조는 GitHub diff나 긴 Markdown보다 빨리 읽힌다.

기획도 마찬가지다. "온보딩 화면 방향 6개"를 Markdown으로 받으면 사람은 머릿속에서 여섯 화면을 상상해야 한다. HTML grid로 받으면 각 방향의 density, tone, layout, tradeoff를 한 화면에서 비교할 수 있다.

이건 장식이 아니다. 의사결정 속도다.

## The Export Rule

HTML artifact에서 가장 중요한 규칙은 export다.

인터랙티브한 HTML은 좋다. 슬라이더로 애니메이션 속도를 조절하고, drag-and-drop으로 티켓 우선순위를 바꾸고, prompt template을 live preview로 튜닝할 수 있다.

하지만 결정이 HTML 안에만 갇히면 운영이 망가진다.

그래서 모든 interactive artifact는 마지막에 이 중 하나를 가져야 한다.

```txt
copy as Markdown
copy as JSON
copy as prompt
copy as patch checklist
copy as decision record
```

사람이 브라우저에서 결정한다. 그 결정은 다시 canon으로 돌아간다.

이 export가 없으면 HTML은 검토 도구가 아니라 숨은 상태가 된다.

## A Practical Prompt

Claude Code나 Codex에 이렇게 요청하면 된다.

```txt
Create a single-file HTML review artifact from these source files.

Purpose:
- help a senior engineer inspect and decide, not admire the design.

Include:
- source inventory;
- TL;DR;
- decision surface;
- evidence map;
- risk table;
- annotated diff or code snippets if relevant;
- visual map or timeline if useful;
- open questions;
- explicit non-claims;
- copy-as-Markdown decision record.

Constraints:
- no external network calls;
- no secrets;
- no unsupported claims;
- keep the canonical source in Markdown/JSON;
- do not make the HTML artifact the source of truth.
```

중요한 건 "HTML로 예쁘게 만들어줘"가 아니다.

무엇을 결정해야 하는지, 어떤 source를 읽었는지, 어떤 export가 필요한지 먼저 정해야 한다.

## Boundary

HTML artifact는 위험도 있다.

첫째, generated JavaScript를 너무 쉽게 믿게 된다. copy button이나 filter 정도는 괜찮을 수 있지만, remote call, file mutation, credential handling이 들어가면 더 이상 문서가 아니다. 작은 앱이다. 작은 앱이면 리뷰가 필요하다.

둘째, visual polish가 약한 근거를 가릴 수 있다. 카드, 색상, timeline이 있으면 분석이 탄탄해 보인다. 하지만 source inventory가 없고 non-claims가 없으면 그냥 잘 꾸민 추측이다.

셋째, 버전 관리가 약해진다. Markdown diff는 읽을 수 있지만 HTML diff는 금방 소음이 된다.

그래서 HTML artifact에는 이 경계가 필요하다.

```txt
No secrets.
No external network calls.
No HTML-only source of truth.
No unsupported product claims.
No hidden state without export.
```

## Vibecode Verdict

에이전트가 만든 긴 문서를 사람이 읽지 않는다면, 그건 작은 운영 장애다.

Markdown을 더 길게 만들면 해결되지 않는다. 에이전트 output에도 UX가 필요하다.

다만 source of truth는 여전히 차갑고 지루해야 한다. Markdown, JSON, manifest, evidence bundle. 검색되고 diff되고 다음 세션이 재사용할 수 있어야 한다.

HTML은 그 위에 놓는 cockpit이다.

계획을 읽게 만들고, diff를 이해하게 만들고, incident를 timeline으로 보게 만들고, prompt나 config를 조작하게 만든다. 그리고 마지막에는 결정을 다시 canon으로 export한다.

그게 Vibecode가 이 패턴을 받아들이는 방식이다.

HTML은 계약을 대체하지 않는다. 계약을 검토 가능하게 만든다.

[Read the MUSU technical contract direction](https://musu.pro)

