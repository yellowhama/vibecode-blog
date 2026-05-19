---
title: "Stateless MCP Servers Can Still Leak Shared State"
pubDatetime: 2026-05-18T07:30:00Z
description: "The MCP SDK advisory is not just a package update. It is a server and transport lifecycle contract for agent tool infrastructure."
draft: false
featured: false
series: "AI Market Watch"
workflow: "packet"
lang: "en"
tags: ["ai-security", "mcp", "agent-infrastructure", "technical-contracts"]
ogImage: "/images/posts/mcp-shared-state-data-leak.png"
references:
  - name: "GitHub Advisory GHSA-345p-7cg4-v4c7"
    url: "https://github.com/advisories/GHSA-345p-7cg4-v4c7"
    guru: "GitHub Advisory Database"
---

# Stateless MCP Servers Can Still Leak Shared State

The most dangerous sentence in an MCP server review is: "It is HTTP, so it is stateless."

The HTTP request may be stateless. The application object may not be. If one `McpServer` instance or one `StreamableHTTPServerTransport` instance is reused across clients, the agent boundary is already weaker than it looks.

That shared state is not an implementation detail. In an agent tool server, shared state is a security boundary. A route handler can look clean while the object graph behind it still connects two clients that should never meet.

![MCP shared state boundary diagram](/images/posts/mcp-shared-state-data-leak.png)

## What Changed

GitHub Advisory `GHSA-345p-7cg4-v4c7` covers CVE-2026-25536, a high-severity cross-client data leak in `@modelcontextprotocol/sdk`.

The advisory lists affected versions as:

```txt
@modelcontextprotocol/sdk >= 1.10.0, <= 1.25.3
patched in 1.26.0
```

The important part is not only the version range. The operational lesson is this:

```txt
Do not reuse StreamableHTTPServerTransport across requests.
Do not reuse one McpServer or Server instance across multiple transports or clients.
```

That makes the fix more than "run npm update." It is a lifecycle contract.

If the review stops at dependency version, it misses the operating lesson. The patched SDK matters; the ownership model still has to be reviewed.

## Unsafe Lifecycle

The risky pattern is a module-level singleton:

```txt
global server = new McpServer(...)
global transport = new StreamableHTTPServerTransport(...)
```

That can look like a harmless optimization in a normal web service. In MCP, the server and transport are not just configuration. They can carry message lifecycle and client state.

The advisory describes two related issues:

```txt
transport re-use across client requests
server/protocol re-use across multiple transports
```

Both can route data to the wrong client under the wrong ownership model.

The failure does not require an obviously malicious tool. A progress message, sampling response, elicitation flow, or pending request can become attached to the wrong client if the lifecycle boundary is wrong.

## Control Contract

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

That question belongs in code review, not only in incident response.

## Operator Checklist

Before shipping an MCP tool server, check:

```txt
Is @modelcontextprotocol/sdk patched to 1.26.0 or later?
Is McpServer constructed per request or per isolated session?
Is StreamableHTTPServerTransport reused anywhere?
Can progress, sampling, or elicitation messages cross sessions?
Does CI fail on relevant security advisories?
Does the code review include lifecycle ownership, not only route handlers?
```

If any answer is unclear, the system does not have a control surface. It has a hope.

The reader decision is direct: upgrade the SDK, then grep for singleton server or transport construction before calling the system reviewed.

## Boundary

This does not mean every MCP server leaked data. Single-client local development is a different risk profile. A server that already creates fresh server and transport instances per request or per isolated session is not the same as a singleton deployment.

It also means upgrading alone is not the full lesson. The patch turns bad reuse into clearer runtime errors, but operators still need to audit ownership.

## Technical Verdict

This is not an argument against MCP. It is the opposite. As MCP becomes a serious agent infrastructure layer, server lifecycle has to become explicit.

Agent operations should not trust "stateless" as a label. They should verify ownership, boundaries, and evidence.
