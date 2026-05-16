---
title: "MCP 서버는 stateless여도 shared state를 재사용하면 안 된다"
pubDatetime: 2026-05-16T08:00:00Z
description: "MCP SDK 보안 권고가 보여준 핵심은 단순한 패키지 업데이트가 아니다. agent tool 서버에서 server와 transport의 생명주기를 계약으로 고정해야 한다."
draft: false
featured: true
series: "AI Market Watch"
workflow: "legacy"
lang: "ko"
tags: ["engineering", "mcp", "security", "ai-agents"]
ogImage: "/images/posts/pencil-mcp-loop.png"
references:
  - name: "GitHub Advisory GHSA-345p-7cg4-v4c7"
    url: "https://github.com/advisories/GHSA-345p-7cg4-v4c7"
    guru: "GitHub Advisory Database"
---

# MCP 서버는 stateless여도 shared state를 재사용하면 안 된다

MCP 서버를 만들 때 가장 위험한 착각은 "HTTP니까 stateless겠지"다.

HTTP 요청은 stateless일 수 있다. 하지만 서버 코드가 같은 `McpServer` 인스턴스나 같은 transport 인스턴스를 여러 클라이언트 사이에서 재사용하면, 상태는 이미 공유되고 있다.

그 공유 상태가 agent tool 서버에서는 보안 경계가 된다.

![MCP loop sketch](../../../public/images/posts/pencil-mcp-loop.png)

## What Changed

GitHub Advisory `GHSA-345p-7cg4-v4c7`은 `@modelcontextprotocol/sdk`의 cross-client data leak 문제를 다룬다.

공식 권고의 핵심은 두 가지다.

```txt
StreamableHTTPServerTransport를 여러 요청 사이에서 재사용하지 말 것
McpServer 또는 Server 인스턴스를 여러 transport/client 사이에서 재사용하지 말 것
```

영향 범위는 `@modelcontextprotocol/sdk` `1.10.0`부터 `1.25.3`까지이고, patched version은 `1.26.0`이다.

이건 단순히 "패키지 업데이트 하세요"로 끝낼 문제가 아니다. MCP 서버를 어떻게 구성하는지에 대한 계약 문제다.

## Why It Matters

MCP는 agent에게 tool을 붙이는 표준 인터페이스가 되고 있다. 그러면 MCP 서버는 단순한 API 서버가 아니다.

그 서버는 이런 것들을 다룬다.

```txt
tool call
resource read
prompt get
progress notification
server-to-client message
```

여기서 응답이 다른 클라이언트로 잘못 가면 문제는 UI 버그가 아니다. 다른 사용자의 tool 결과, resource 내용, agent 진행 상태가 섞일 수 있다.

agent infrastructure에서 가장 나쁜 실패는 조용한 실패다. 터지는 에러보다 위험한 건 잘못된 클라이언트에게 정상 응답처럼 도착하는 데이터다.

## Bad Default

나쁜 기본값은 singleton으로 MCP 서버를 만들어 두고 모든 요청이 그걸 쓰게 하는 것이다.

대략 이런 식이다.

```txt
global server = new McpServer(...)
global transport = new StreamableHTTPServerTransport(...)

request A -> server/transport
request B -> same server/transport
```

일반 웹 서버에서는 이런 구조가 성능 최적화처럼 보일 수 있다. 하지만 MCP에서는 server와 transport가 단순 설정 객체가 아니다. 요청, transport, client, message lifecycle을 붙잡는 실행 상태다.

그러면 stateless HTTP라는 말은 별 의미가 없어진다. 애플리케이션 객체가 stateful이면 배포 모드가 stateless여도 경계는 이미 깨졌다.

## Control Contract

MCP 서버의 최소 계약은 이거다.

```txt
한 request 또는 session은 자기 server/transport lifecycle을 가져야 한다.
서로 다른 client가 같은 transport를 공유하면 안 된다.
서로 다른 transport가 같은 connected server/protocol 인스턴스를 덮어쓰면 안 된다.
SDK는 patched version으로 올린다.
릴리즈 전에 dependency audit를 gate로 돌린다.
```

stateless 배포라면 request마다 fresh server와 fresh transport를 만든다.

stateful session을 쓴다면 session마다 server와 transport를 분리한다.

중요한 건 "어디까지 공유해도 되는가"를 코드 리뷰 감으로 넘기지 않는 것이다. MCP에서는 생명주기 자체가 보안 계약이다.

## Operator Checklist

지금 MCP 서버를 운영하거나 만들고 있다면 이것부터 확인하면 된다.

```txt
@modelcontextprotocol/sdk version이 1.26.0 이상인가?
McpServer 또는 Server 인스턴스를 module-level singleton으로 두고 있지 않은가?
StreamableHTTPServerTransport를 여러 request에 재사용하지 않는가?
sessionIdGenerator를 쓴다면 session별 server/transport ownership이 분리되어 있는가?
tool handler가 progress notification, sampling, elicitation을 보내는가?
CI에서 npm audit 또는 equivalent advisory scan이 high severity에서 실패하는가?
```

하나라도 모호하면 "동작하니까 괜찮다"가 아니라 "상태 경계가 문서화되지 않았다"로 봐야 한다.

## Boundary

이 글은 MCP가 위험하다는 말이 아니다.

오히려 반대다. MCP가 agent tool 연결의 표준 표면이 될수록, 서버 생명주기와 transport ownership을 더 명확히 해야 한다.

또 이 글은 특정 서비스에서 실제 데이터 유출을 관측했다는 뜻도 아니다. 보안 권고와 로컬 dependency audit가 말하는 것은 위험한 구성의 가능성과 패치 범위다.

업그레이드는 필요하다. 하지만 업그레이드만으로 코드 구조가 자동으로 좋아지지는 않는다.

## Technical Verdict

Agent tool 서버에서 state는 보안 경계다.

MCP 서버를 stateless로 배포하더라도, `McpServer`와 transport를 공유하면 운영자는 이미 stateful한 위험을 만든 것이다.

패키지를 올려라. 그리고 lifecycle을 계약으로 박아라.

[Read the MUSU technical contract direction](https://musu.pro)
