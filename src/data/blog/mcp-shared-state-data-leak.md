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
  - name: "MCP Streamable HTTP Transport Specification"
    url: "https://modelcontextprotocol.io/specification/2025-06-18/basic/transports"
    guru: "Model Context Protocol"
  - name: "GitLab Advisory CVE-2026-25536"
    url: "https://advisories.gitlab.com/npm/%40modelcontextprotocol/sdk/CVE-2026-25536/"
    guru: "GitLab Advisory Database"
---

# Stateless MCP Servers Can Still Leak Shared State

At 1:54 a.m. on 2026-05-21, I opened GitHub Advisory `GHSA-345p-7cg4-v4c7`, checked the GitLab mirror again, and compared both against the MCP Streamable HTTP transport spec. The most dangerous sentence in that review was not in the advisory.

It was the sentence an engineer says right before skipping the real check: "It is HTTP, so it is stateless."

The HTTP request may be stateless. The application object may not be. If one `McpServer` instance or one `StreamableHTTPServerTransport` instance is reused across clients, the agent boundary is already weaker than it looks.

That shared state is not an implementation detail. In an agent tool server, shared state is a security boundary. A route handler can look clean while the object graph behind it still connects two clients that should never meet.

The annoying part is that the bug hides in the place reviewers skim past. Not the tool description. Not the auth middleware. The constructor location.

That is the part I would put in red ink on the review: do not tell me the route is authenticated until you can tell me where the server and transport are constructed.

Two users can hit the same `/mcp` endpoint, both can look properly authenticated, and the leak can still come from a reused transport object quietly carrying request-to-stream state from one client into another.

That is not a vibes-based security concern. That is the difference between reviewing a route and reviewing a runtime.

![MCP shared state boundary diagram](/images/posts/mcp-shared-state-data-leak.png)

## What Changed

GitHub Advisory `GHSA-345p-7cg4-v4c7` covers CVE-2026-25536, a high-severity cross-client data leak in `@modelcontextprotocol/sdk`.

The GitHub advisory lists affected versions as:

```txt
@modelcontextprotocol/sdk >= 1.10.0, <= 1.25.3
patched in 1.26.0
published Feb 4, 2026
updated Feb 9, 2026
severity 7.1 high
```

GitLab's advisory mirrors the same operational facts: affected versions start at `1.10.0`, the fixed version is `1.26.0`, and the weakness is a race around a shared resource.

The important part is not only the version range. The operational lesson is this:

```txt
Do not reuse StreamableHTTPServerTransport across requests.
Do not reuse one McpServer or Server instance across multiple transports or clients.
```

That makes the fix more than "run npm update." It is a lifecycle contract.

If the review stops at dependency version, it misses the operating lesson. The patched SDK matters; the ownership model still has to be reviewed.

The MCP transport spec explains why this matters. Streamable HTTP can use POST and GET, can stream server messages over SSE, can support multiple client connections, and can establish sessions with `Mcp-Session-Id`.

That means "HTTP" is not enough information. You still need to know whether server-to-client messages, event IDs, request IDs, and sessions are isolated per client.

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

Here is the failure shape in review terms:

```txt
Client A opens a request.
Client B opens a request.
Both clients use overlapping JSON-RPC ids.
The shared transport or protocol object updates its internal routing state.
The server sends a response, progress notification, sampling request, or elicitation request.
The message reaches the wrong stream or the wrong client times out.
```

That is why the advisory is uncomfortable. The leak is not "someone forgot auth." It is "auth succeeded, but the object that routes messages was shared."

## The Review That Catches It

The review that would catch this bug is almost embarrassingly small.

It does not start with a security architecture diagram. It starts with a grep result and one uncomfortable line number:

```txt
rg "new McpServer|new Server|new StreamableHTTPServerTransport" src

src/mcp/server.ts:8:const server = new McpServer(...)
src/mcp/server.ts:9:const transport = new StreamableHTTPServerTransport(...)
src/mcp/routes.ts:42:await server.connect(transport)
```

That output should stop the release.

Not because every global object is bad. Because these are not just global objects. They are the objects that own client message routing. A singleton cache is one thing. A singleton transport that remembers `requestId -> stream` is a different animal entirely.

The good review produces a different shape:

```txt
src/mcp/routes.ts:39:const server = new McpServer(...)
src/mcp/routes.ts:40:const transport = new StreamableHTTPServerTransport(...)
src/mcp/routes.ts:52:await server.connect(transport)
src/mcp/routes.ts:53:await transport.handleRequest(request, response)
```

That does not prove the whole server is secure. It proves the reviewer looked at the right layer. The route can still need auth, origin validation, session ownership, and dependency gates. But at least the review is no longer staring at the front door while the hallway connects two apartments.

This is the writing lesson and the security lesson at the same time: a claim is weak until it points at the exact object that would make it false.

## Minimal Audit Evidence

A useful MCP review should leave evidence, not only a package version note.

Start with the risky pattern:

```ts
const server = new McpServer(serverConfig);
const transport = new StreamableHTTPServerTransport(options);

app.post("/mcp", async (request, response) => {
  await server.connect(transport);
  await transport.handleRequest(request, response);
});
```

Then make the ownership visible:

```ts
app.post("/mcp", async (request, response) => {
  const server = new McpServer(serverConfig);
  const transport = new StreamableHTTPServerTransport(options);

  await server.connect(transport);
  await transport.handleRequest(request, response);
});
```

The code review command is deliberately plain:

```bash
rg "new McpServer|new StreamableHTTPServerTransport" .
```

The reviewer is not only asking whether the SDK is patched. The reviewer is asking where those constructors live. A match at module scope is a different risk than a match inside a request or isolated session owner.

I would make the review table explicit:

| Pattern | Risk | Review decision |
| --- | --- | --- |
| Per-request server and transport | Low | Accept with patched SDK and auth/origin checks. |
| Per-session server and transport | Low | Accept with unique session ownership. |
| Shared transport across requests | High | Reject. Exact reuse class. |
| Shared server across transports | High | Reject when server-to-client messages exist. |
| Shared immutable config | Usually acceptable | Accept only if it owns no client state. |

The release receipt should include:

```txt
SDK version checked
constructor locations reviewed
singleton reuse rejected or justified
session ownership documented
dependency advisory gate run
origin/auth controls checked for Streamable HTTP
```

Without that receipt, "we updated the package" is too weak for agent infrastructure.

## Browser Proof

The rendered article has its own proof contract too:

```txt
body image: /images/posts/mcp-shared-state-data-leak.png
ogImage: /images/posts/mcp-shared-state-data-leak.png
rendered summary: F:\Aisaak\CompanyArtifacts\vibecode-rendered-audit\latest\summary.json
desktop first-screen image check: 10/10
mobile first-screen image check: 10/10
surface expected images: 2/2
surface contract image routes: 4/4
surface evidence card routes: 4/4
```

That is not decoration. A post about shared state needs a visual boundary that is also checked in the rendered browser output. Otherwise the article says "verify the boundary" while the page itself asks the reader to trust an unchecked illustration.

The stale receipt was the useful failure here. An older version of this article still said the mobile first-screen image check was `4/10` after the public surface had already been hardened. That is the same class of mistake as the MCP bug at a smaller scale: the sentence sounded official, but the underlying state had moved.

A stale proof number is not a cosmetic issue. It teaches the reader to trust the article less.

The image contract is deliberately boring: one slug-specific diagram, no casual reuse across posts, and a rendered audit that records whether the expected image actually appears. Security writing needs this same discipline. Evidence that only exists as a sentence is easy to polish and hard to trust.

## Control Contract

The minimum control contract is:

```txt
one request or session owns its server/transport lifecycle
different clients do not share transport state
different transports do not overwrite one connected server/protocol instance
the SDK is patched
dependency audit is a release gate
origin validation and authentication are explicit for HTTP transport
```

For stateless deployment, create fresh server and transport instances per request. For stateful sessions, separate ownership per session.

The important question is not "does the endpoint return 200?" The question is "what object owns client state, and can another client reach it?"

That question belongs in code review, not only in incident response.

A concrete release gate can be boring:

```bash
npm ls @modelcontextprotocol/sdk
npm audit --omit=dev
rg "new McpServer|new Server|new StreamableHTTPServerTransport|sessionIdGenerator" src
rg "Origin|Mcp-Session-Id|Authorization" src
```

The first two commands prove the dependency floor. The next two prove that somebody looked at lifecycle and HTTP boundary code. That split matters because a package scanner can tell you `1.26.0` is installed. It cannot tell you whether your code still has a global singleton that should not exist.

## Operator Checklist

Before shipping an MCP tool server, check:

```txt
Is @modelcontextprotocol/sdk patched to 1.26.0 or later?
Is McpServer constructed per request or per isolated session?
Is StreamableHTTPServerTransport reused anywhere?
Can progress, sampling, or elicitation messages cross sessions?
Does CI fail on relevant security advisories?
Does the code review include lifecycle ownership, not only route handlers?
Does the HTTP transport validate `Origin` and require authentication?
If session IDs exist, can you point to the map/store that owns each session?
```

If any answer is unclear, the system does not have a control surface. It has a hope.

The reader decision is direct: upgrade the SDK, then grep for singleton server or transport construction before calling the system reviewed. If the answer is "we think the framework handles it," the review is not done. Name the object. Name the owner. Name the lifetime.

## Boundary

This does not mean every MCP server leaked data. Single-client local development is a different risk profile. A server that already creates fresh server and transport instances per request or per isolated session is not the same as a singleton deployment.

It also does not prove that every shared object is unsafe. Configuration, schemas, and immutable tool definitions can be shared safely when they do not own client lifecycle or pending message state.

The caveat is that upgrading alone is not the full lesson. The patch turns bad reuse into clearer runtime errors, but operators still need to audit ownership. If the review cannot say which object owns which client, the security claim is still too vague.

There is another boundary: this article is about SDK/server lifecycle, not a complete MCP security program. The transport spec also calls out HTTP-specific controls like `Origin` validation, localhost binding for local servers, and authentication. Those do not replace the lifecycle audit. They sit next to it. A server can have correct auth and still route a message through the wrong reused object.

## Technical Verdict

This is not an argument against MCP. It is the opposite. As MCP becomes a serious agent infrastructure layer, server lifecycle has to become explicit.

Agent operations should not trust "stateless" as a label. They should verify ownership, boundaries, and evidence.
