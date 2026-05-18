---
title: "Stateless MCP Servers Can Still Leak Shared State"
pubDatetime: 2026-05-16T08:00:00Z
description: "The MCP SDK advisory is not just a package update. It is a server and transport lifecycle contract for agent tool infrastructure."
draft: false
featured: true
series: "AI Market Watch"
workflow: "legacy"
lang: "en"
tags: ["engineering", "mcp", "security", "ai-agents"]
ogImage: "/images/posts/mcp-shared-state-data-leak.png"
references:
  - name: "GitHub Advisory GHSA-345p-7cg4-v4c7"
    url: "https://github.com/advisories/GHSA-345p-7cg4-v4c7"
    guru: "GitHub Advisory Database"
---

# Stateless MCP Servers Can Still Leak Shared State

The most dangerous sentence in an MCP server review is: "It is HTTP, so it is stateless."

The HTTP request may be stateless. The application object may not be. If one `McpServer` instance or one `StreamableHTTPServerTransport` instance is reused across clients, the agent boundary is already weaker than it looks.

That shared state is not an implementation detail. In an agent tool server, shared state is a security boundary.

![MCP shared state boundary diagram](/images/posts/mcp-shared-state-data-leak.png)

## What Changed

GitHub Advisory `GHSA-345p-7cg4-v4c7` covers a cross-client data leak in `@modelcontextprotocol/sdk`.

The important part is not only the version range. The operational lesson is this:

```txt
Do not reuse StreamableHTTPServerTransport across requests.
Do not reuse one McpServer or Server instance across multiple transports or clients.
```

That makes the fix more than "run npm update." It is a lifecycle contract.

## Why It Matters

MCP is becoming a standard surface for agent tools. That means an MCP server may carry:

```txt
tool calls
resource reads
prompt fetches
progress notifications
server-to-client messages
sampling or elicitation flows
```

If a response is delivered to the wrong client, the bug is not cosmetic. Tool results, resource contents, and agent progress can cross a boundary that operators assumed was isolated.

Silent cross-client success is worse than a loud failure. A 500 tells you something broke. A normal response delivered to the wrong client can look like the system worked.

## Control Contract

The bad pattern is a module-level singleton:

```txt
global server = new McpServer(...)
global transport = new StreamableHTTPServerTransport(...)
```

That can look like a harmless optimization in a normal web service. In MCP, the server and transport are not just configuration. They carry message lifecycle and client state.

The minimum control contract is:

```txt
one request or session owns its server/transport lifecycle
different clients do not share transport state
different transports do not overwrite one connected server/protocol instance
the SDK is patched
dependency audit is a release gate
```

For stateless deployment, create fresh server and transport instances per request. For stateful sessions, separate ownership per session.

The important question is not "does the endpoint return 200?" The question is "what object owns client state, and can another client reach it?"

## Operator Checklist

Before shipping an MCP tool server, check:

```txt
Is @modelcontextprotocol/sdk patched?
Is McpServer constructed per request or per isolated session?
Is StreamableHTTPServerTransport reused anywhere?
Can progress, sampling, or elicitation messages cross sessions?
Does CI fail on relevant security advisories?
Does the code review include lifecycle ownership, not only route handlers?
```

If any answer is unclear, the system does not have a control surface. It has a hope.

## Technical Verdict

This is not an argument against MCP. It is the opposite. As MCP becomes a serious agent infrastructure layer, server lifecycle has to become explicit.

Vibecode treats this as the same class of problem as Warden evidence and source-backed content: invisible state must be turned into a technical contract.

Agent operations should not trust "stateless" as a label. They should verify ownership, boundaries, and evidence.
