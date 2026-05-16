---
title: "AI가 기억을 잃지 않게 하는 운영 구조"
pubDatetime: 2026-05-16T06:00:00Z
description: "AI 에이전트가 매 세션마다 같은 설명을 다시 요구하지 않게 하려면, 프롬프트가 아니라 source, spec, handoff, index로 작업 기억을 고정해야 한다."
draft: false
featured: true
series: "AI Explainer"
lang: "ko"
tags: ["engineering", "ai-agents", "llm-wiki", "technical-contracts"]
ogImage: "/images/posts/pencil-handoff-pain.png"
---

# AI가 기억을 잃지 않게 하는 운영 구조

AI 에이전트가 일을 망치는 순간은 보통 모델이 아무것도 몰라서가 아니다.

어제 왜 그 결정을 했는지, 어떤 로그를 보고 멈췄는지, 어떤 약속은 아직 제품에서 증명되지 않았는지 꺼내지 못해서 망친다. 그러면 운영자는 같은 설명을 다시 한다. 같은 제약을 다시 붙인다. 같은 실수를 막기 위해 프롬프트를 더 길게 만든다.

그건 기억 구조가 아니다. 세션마다 임시로 붙이는 보정값이다.

![Agent memory handoff sketch](../../../public/images/posts/pencil-handoff-pain.png)

## Broken System

에이전트가 실제 작업에 들어가면 필요한 기억은 단순한 대화 기록이 아니다.

필요한 것은 이런 것들이다.

```txt
이 결정의 원본 source
이 작업이 따라야 하는 spec
이전 세션에서 끝난 위치
아직 막힌 작업과 이유
제품이 증명한 것과 증명하지 않은 것
다음 에이전트가 먼저 읽어야 하는 문서
```

채팅창은 이걸 오래 버티지 못한다. 컨텍스트는 압축되고, 기억은 오래된 상태로 남고, 작업자는 "아까 말했잖아"를 반복한다.

문제는 프롬프트 품질이 낮은 게 아니다. 작업 기억이 운영 자산으로 승격되지 않은 것이다.

## Bad Default

나쁜 기본값은 프롬프트를 계속 키우는 것이다.

처음에는 작동한다. "이 규칙을 지켜." "이 파일을 참고해." "이전 결정은 이거야." 하지만 작업이 길어지면 프롬프트는 점점 운영 매뉴얼, 회의록, 버그 리포트, 제품 정책, 다음 할 일 목록을 전부 흡수한다.

그러면 두 가지가 깨진다.

첫째, 사람이 검토하기 어렵다. 중요한 결정과 임시 지시가 한 덩어리로 섞인다.

둘째, 다음 에이전트가 검색하기 어렵다. 어떤 말이 source이고, 어떤 말이 판단이고, 어떤 말이 아직 검증 안 된 가정인지 구분되지 않는다.

긴 프롬프트는 기억이 아니다. 정리되지 않은 상태의 임시 컨텍스트다.

## Source Pressure

여러 작업 메모에서 같은 압력이 반복된다.

리서치 워크플로우에서는 한 번 조사한 자료를 채팅 답변으로 끝내지 않고 source note, topic note, comparison note, summary note, index note로 남겨야 한다는 결론이 나온다. 이유는 단순하다. 좋은 조사는 다음 작업에서 다시 검색될 수 있어야 한다.

자동화 워크플로우에서는 반복되는 프롬프트가 skill이나 routine으로 올라간다. 하지만 skill만으로는 부족하다. skill이 실행될 때 읽어야 할 repo context, reference doc, 운영 경계가 없으면 같은 자동화도 매번 다른 판단을 한다.

에이전트 운영 메모에서는 context rot, stale memory, 보이지 않는 session state가 반복 위험으로 잡힌다. 에이전트가 똑똑해질수록 더 위험한 지점은 "모르는 것"이 아니라 "안다고 착각하는 오래된 기억"이다.

이 세 압력을 합치면 결론은 하나다.

```txt
AI에게 필요한 것은 더 긴 프롬프트가 아니라,
검색 가능하고 검토 가능한 운영 기억이다.
```

## Operating Memory Stack

최소 구조는 여섯 층이면 된다.

```txt
1. Raw source
2. Processed source note
3. Spec
4. Handoff
5. Index
6. Remaining-work queue
```

Raw source는 원본이다. 영상 대본, 문서, 로그, diff, 명령 출력, 외부 링크, 회의 메모가 여기에 들어간다. 이 층이 없으면 나중에 판단 근거를 복구할 수 없다.

Processed source note는 원본을 그대로 복사한 요약이 아니다. 다음 작업에 재사용할 수 있는 압력, 패턴, 반례, 경계만 뽑은 문서다.

Spec은 반복해서 지켜야 하는 계약이다. 글쓰기라면 독자, 톤, 금지 표현, 근거 요건이 들어간다. 제품이라면 입력, 출력, 실패 조건, 검증 명령이 들어간다.

Handoff는 다음 세션이 바로 이어받기 위한 상태다. 지금 어디까지 끝났는지, 무엇이 막혔는지, 무엇을 건드리면 안 되는지 적는다.

Index는 검색 표면이다. 사람이 폴더를 외우지 않아도 에이전트가 관련 문서를 찾을 수 있어야 한다.

Remaining-work queue는 기억을 행동으로 바꾸는 층이다. 문서가 많아도 다음 액션이 없으면 운영 기억이 아니라 저장소가 된다.

## Minimal Implementation

큰 시스템부터 만들 필요는 없다.

한 프로젝트에 이 정도만 있으면 시작할 수 있다.

```txt
sources/raw/
sources/processed/
specs/
handoff.md
remaining-work.md
reindex command
```

중요한 건 폴더 이름이 아니다. 다음 세션이 작업을 시작하기 전에 세 가지 질문에 답할 수 있어야 한다.

```txt
근거는 어디에 있는가?
현재 계약은 무엇인가?
다음 작업은 무엇인가?
```

이 세 질문에 답하지 못하면 에이전트는 매번 새로 온 작업자처럼 행동한다. 답할 수 있으면 최소한 이전 판단 위에서 시작한다.

## Boundary

이 구조가 에이전트를 자율 직원으로 만들어주지는 않는다.

LLM-Wiki 같은 형태가 유일한 답이라는 뜻도 아니다. Notion, Markdown repo, SQLite FTS, vector DB, 내부 CMS를 써도 된다. 핵심은 도구가 아니라 계약이다.

```txt
source는 보존된다
가공된 판단은 분리된다
spec은 반복 사용된다
handoff는 다음 세션을 위해 갱신된다
index는 검색 가능하다
remaining work는 행동으로 이어진다
```

이 계약이 없으면 에이전트는 매번 기억을 잃는다. 계약이 있으면 최소한 기억을 확인하고 행동할 수 있다.

## Audit Checklist

지금 쓰는 에이전트 워크플로우에 이 질문을 던지면 된다.

```txt
원본 source가 chat 밖에 남아 있는가?
요약이 아니라 재사용 가능한 processed note가 있는가?
반복 규칙이 spec으로 분리되어 있는가?
다음 세션용 handoff가 있는가?
에이전트가 검색할 index가 있는가?
남은 작업이 queue로 관리되는가?
검증되지 않은 제품 claim이 따로 표시되는가?
```

세 개 이상 비어 있으면 문제는 모델 성능이 아닐 수 있다. 운영 기억이 없는 것이다.

## Technical Verdict

AI가 기억을 잃지 않게 하려면 프롬프트를 더 길게 만드는 것으로는 부족하다.

source, spec, handoff, index, remaining work를 분리해야 한다. 그래야 다음 에이전트가 "무엇을 해야 하는가"뿐 아니라 "왜 그렇게 해야 하는가"를 확인할 수 있다.

에이전트 운영의 핵심은 더 많은 자동화가 아니다. 자동화가 읽을 수 있는 기억 구조다.

[Read the MUSU technical contract direction](https://musu.pro)
