---
title: "AI 에이전트 작업 폴더를 C와 F로 나누는 법"
pubDatetime: 2026-05-17T02:00:00Z
description: "AI 코딩 에이전트가 빌드, 테스트, 인덱스, 임시 파일로 시스템 드라이브를 압박하지 않게 하려면 작업 디스크 계약을 먼저 정해야 한다."
draft: false
featured: false
series: "AI Tool Note"
workflow: "packet"
lang: "ko"
tags: ["ai-tools", "engineering", "local-first", "technical-contracts"]
ogImage: "/images/posts/pencil-technical-contract.png"
references:
  - name: "Node.js os.tmpdir"
    url: "https://nodejs.org/api/os.html#ostmpdir"
    guru: "Node.js"
  - name: "PowerShell Get-PSDrive"
    url: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-psdrive"
    guru: "Microsoft Learn"
  - name: "Vibecode temp root commit"
    url: "https://github.com/yellowhama/vibecode-blog/commit/1e62c79c62d0b3b0b1cf2c13d334b0bef80b341d"
    guru: "GitHub"
---

# AI 에이전트 작업 폴더를 C와 F로 나누는 법

AI 코딩 에이전트가 오래 일하면 소스 파일만 바꾸지 않는다.

빌드한다. 테스트 fixture를 만든다. 검색 인덱스를 다시 쓴다. 로그를 남긴다. 임시 evidence bundle을 만들고 지운다. 이 작업들이 전부 OS 기본 temp나 작은 시스템 드라이브로 들어가면, 에이전트는 코드를 고치면서 동시에 작업 머신을 압박한다.

문제는 "C 드라이브가 작다"가 아니다.

작업 디스크 계약이 없다는 것이다.

![Technical contract sketch](../../../public/images/posts/pencil-technical-contract.png)

## Bad Default

나쁜 기본값은 그냥 OS temp를 믿는 것이다.

Node에서는 `os.tmpdir()`가 운영체제의 기본 임시 디렉터리를 돌려준다. 편하다. 하지만 에이전트가 반복 테스트를 오래 돌리는 환경에서는 이 편한 기본값이 위험해진다. 어디에 얼마나 쌓이는지 운영자가 의식하지 못하기 때문이다.

먼저 확인해야 할 것은 모델이 아니라 드라이브다.

```powershell
Get-PSDrive -Name C,F
```

이 명령으로 각 드라이브의 남은 공간을 본다. 중요한 건 숫자 자체가 아니라 역할이다.

```txt
C: active working memory
F: durable archive and repeated test temp
```

역할이 없으면 정리도 없다. 그때부터는 사람이 매번 "이 파일 지워도 되나?"를 판단해야 한다.

## Work Disk Contract

에이전트 작업 폴더는 최소 네 칸으로 나눠야 한다.

```txt
active source repo
active operating memory
completed artifact archive
self-test temp root
```

소스 repo는 작업 중인 코드가 있는 곳이다.

운영 기억은 현재 작업의 handoff, status, index가 있는 곳이다.

완료 산출물은 다음 에이전트가 다시 읽어도 되는 durable archive다.

self-test temp root는 반복 검증이 마음껏 파일을 만들고 지울 수 있는 장소다.

이 네 개를 섞으면 에이전트 운영이 불안해진다. 특히 완료 산출물과 임시 산출물이 섞이면 나중에 지울 수가 없다. 반대로 active memory와 archive가 섞이면 다음 에이전트가 최신 상태와 완료 상태를 구분하지 못한다.

## Minimal Pattern

repo마다 작은 helper를 둔다.

```txt
REPO_SPECIFIC_TEST_TEMP_DIR
TEST_TEMP_DIR
archive-drive test-temp
os.tmpdir()
```

이 순서가 중요하다.

첫째, repo-specific env var가 있으면 그것을 쓴다. 한 repo의 테스트가 다른 repo의 temp 정책을 침범하지 않게 하기 위해서다.

둘째, 공통 `TEST_TEMP_DIR`를 허용한다. 여러 repo를 같은 CI나 같은 operator session에서 돌릴 때 필요하다.

셋째, 로컬 archive drive가 있으면 거기에 둔다. 이게 workstation의 기본 계약이다.

넷째, archive drive가 없을 때만 OS temp로 떨어진다. 그래야 CI나 다른 머신에서도 스크립트가 죽지 않는다.

이 패턴은 Vibecode 쪽에서 [실제 commit](https://github.com/yellowhama/vibecode-blog/commit/1e62c79c62d0b3b0b1cf2c13d334b0bef80b341d)으로 고정했다.

```txt
VIBECODE_TEST_TEMP_DIR
TEST_TEMP_DIR
F:\Aisaak\CompanyArtifacts\test-temp\vibecode-node
os.tmpdir()
```

MUSU 쪽도 같은 구조를 쓴다.

```txt
MUSU_TEST_TEMP_DIR
TEST_TEMP_DIR
F:\Aisaak\CompanyArtifacts\test-temp\musu-node
os.tmpdir()
```

## Why This Matters For Agents

사람이 직접 테스트를 한 번 돌릴 때는 temp 위치가 큰 문제가 아닐 수 있다.

에이전트는 다르다. 실패하면 다시 돌린다. 로그를 더 만든다. fixture를 새로 만든다. 게이트가 많을수록 임시 파일도 많아진다.

그래서 agentic workflow에서는 temp도 계약이어야 한다.

```txt
반복 검증은 archive temp로 간다.
완료 산출물은 archive로 복사된다.
active memory는 C에 남아도 되지만 durable archive가 아니다.
OS temp는 fallback이다.
```

이렇게 나누면 cleanup이 쉬워진다. archive temp 아래는 반복 검증이 만든 작업 공간이다. 완료 산출물 archive와 다르다. source repo와도 다르다.

## Boundary

`TEST_TEMP_DIR`는 마법의 표준이 아니다.

아무 도구나 자동으로 이 값을 읽어주지 않는다. repo의 테스트 helper, build script, operator script가 이 값을 읽도록 만들어야 계약이 된다.

그래서 이 글의 핵심은 "환경변수를 하나 정하라"가 아니다.

핵심은 이것이다.

```txt
AI 에이전트가 파일을 만드는 위치를 코드로 결정하라.
```

그 결정이 없으면 temp 위치는 운영체제와 도구 기본값의 우연에 맡겨진다.

## Practical Checklist

새 agent repo를 받을 때는 먼저 이 네 가지를 정한다.

```txt
1. active repo path
2. operating memory path
3. completed artifact archive path
4. self-test temp root
```

그 다음 guard를 둔다.

```txt
drive free-space check
working-set check
archive health check
temp-root helper self-test
```

이 정도면 충분하다. 중요한 것은 복잡한 인프라가 아니다. 에이전트가 어디에 무엇을 써도 되는지 명시하는 것이다.

AI 에이전트는 작업 속도를 올린다. 그래서 파일을 잘못 쓰는 속도도 같이 올라간다.

작업 디스크 계약은 그 속도를 견디기 위한 가장 작은 운영 장치다.

