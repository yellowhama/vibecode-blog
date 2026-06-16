---
slug: stateless-mcp-shared-state-leak
title: "Stateless MCP servers still leak shared state: the leaks we found and the contracts that fix them"
description: "An MCP server can be a stateless handler and still leak one tenant's payload into another's stream. Here is the shared-queue leak we traced, the CVE that proves it, and the one-line key change that closes it."
pubDatetime: 2026-06-16T00:00:00Z
tags: [mcp, multi-tenant, session-security, agentic-infra, security-contract]
series: Field Log
draft: false
references:
  - name: "MCP Specification — Security Best Practices (2025-11-25)"
    url: https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices
  - name: "MCP issue #493 — stateless POST /mcp proposal"
    url: https://github.com/modelcontextprotocol/modelcontextprotocol/issues/493
  - name: "CVE-2026-33946 — MCP Ruby SDK insufficient session binding (GitLab Advisories)"
    url: https://advisories.gitlab.com/pkg/gem/mcp/
  - name: "OWASP MCP Top 10 — MCP10:2025 Context Injection & Over-Sharing"
    url: https://owasp.org/www-project-mcp-top-10/2025/MCP10-2025–ContextInjection&OverSharing
  - name: "AuthZed — Timeline of MCP breaches"
    url: https://authzed.com/blog/timeline-mcp-breaches
---

A "stateless" MCP server can still deliver one tenant's payload into another tenant's stream. We run our publishing pipeline on MCP servers we deploy ourselves — multi-tenant, behind a load balancer — and the cross-tenant leak does not live in the handler the label describes. It lives in the shared state the handler reaches for once you scale it.

This is the leak we traced, the CVE that proves the class is real, and the one-line key change that turns it into a non-event.

## "Stateless" is a claim about the handler, not the system

Calling an MCP server "stateless" describes exactly one property: the request handler keeps no per-request memory between invocations. That is true, and it is worth having. It says nothing about the **substrate the handler runs on**.

Scale streamable-HTTP behind a load balancer and the substrate stops being stateless. The spec issue proposing a stateless `POST /mcp` is blunt about why: SSE and HTTP requests "may be routed to different servers, requiring shared state," and the current design "forces implementations to maintain cross-server state for sessions" (MCP issue #493).

So you add the obvious thing — a shared queue, a Redis session store, a resumable-stream buffer. The state you removed from the handler re-enters through the substrate. And the join key for that shared state is almost always the session ID.

## The leak: a shared queue keyed by session ID

The MCP Security Best Practices document names this attack **Session Hijack Prompt Injection**. The sequence:

```
1. Client connects to Server A          → gets session_id = S
2. Attacker sends a malicious event to Server B, presenting S
3. Server B enqueues it in a shared queue, keyed by S
4. Server A polls the queue by S, delivers the
   attacker's payload to the client as an async/resumed response
```

Every instance is stateless. Every handler is clean. The attacker's payload still reaches the victim's client — because the **queue is keyed on a value the client presents**, and nothing binds that value to who the client actually is.

The spec closes both halves of the bug normatively: servers **MUST NOT** use sessions for authentication, and session IDs **MUST** be "secure, non-deterministic" — a CSPRNG output such as a UUID. Guessability is the second half; an ID a client can predict is an ID a client can replay.

This is not hypothetical. **CVE-2026-33946** (CVSS 7.5, HIGH) is this exact class in the MCP Ruby SDK: insufficient session binding in the streamable-HTTP transport lets a valid session ID be replayed to hijack another client's SSE stream. The abstract spec attack and the shipped CVE are the same shape.

## Resumable streams widen the window

Redelivery and resumable streams open the door further. The spec notes that deliberately terminating a request before its response "could lead to it being resumed by the original client," and that an SSE-triggering call such as `notifications/tools/list_changed` can leave a client with "tools that they were not aware were enabled."

A resume-where-you-left-off convenience is a privilege boundary wearing a feature's clothes. It is the surface that most needs an isolation check, and it usually ships with none.

## The same bug we fight in our own infra

We recognized this on sight, because it is the class we already fight in our multi-tenant publishing daemon and its WAL queue: **anything keyed solely on an opaque, client-presentable ID is a tenant-isolation bug waiting for a trigger.**

OWASP names the broader failure mode — **MCP10:2025 Context Injection & Over-Sharing** — where context that is "stored, persistently stored, or insufficiently scoped" bleeds across session, user, or tenant boundaries. Its "Multi-Tenant Bleed" example is precise: Tenant A's vector-store documents surfacing in Tenant B's retrieval.

The production incidents are real, even where the figures aren't settled. The Asana MCP integration carried a cross-tenant access-control flaw that made one customer's projects, teams, and tasks visible to another. A Smithery path-traversal exposed a Fly.io token controlling more than 3,000 hosted MCP servers (AuthZed timeline). These are aggregator-sourced, and the reported dates and counts vary between accounts — so we lean on the shape, not the numbers.

## The contract: never key shared state on a value the client controls

The fix is not "be more stateless." It is a contract on **how shared state is keyed** — four clauses, each one we enforce in our own gate pipeline.

### 1. Bind keys to identity derived from the token

The spec's normative mitigation: servers **SHOULD** bind session IDs to user-specific information using a key format such as `<user_id>:<session_id>`, where the user ID is "derived from the user token and not provided by the client." That final clause is the whole fix.

```python
# Leak: shared state keyed on a client-presented value
queue_key = session_id                       # attacker presents this

# Contract: derive identity from the validated token, then bind
user_id   = verify_token(request.auth).sub   # never from the body
queue_key = f"{user_id}:{session_id}"         # spec-recommended format
```

This mirrors how our publishing gate derives the tenant from the auth context, never from the payload. With the composite key, replaying `S` against Server B fails: the attacker has no valid `user_id` to pair with it, so the enqueue lands in a namespace the victim's Server A never polls.

### 2. Treat sessions as correlation, not authentication

Re-verify every inbound request. The session ID is a correlation handle, not a capability (spec: **MUST NOT** use sessions for auth).

### 3. Use CSPRNG IDs, plus TTL and per-tenant namespaces

Non-deterministic session IDs close the guessing path. Ephemeral, per-tenant context with a TTL closes the persistence path — OWASP recommends ceilings at session-end, 30 minutes, or 24 hours, the same TTL discipline we apply to WAL-queue entries.

### 4. Treat resumable streams as a privilege

Redelivery and `list_changed` get an explicit isolation boundary, not a convenience default.

| Clause | Closes | One-line rule |
|---|---|---|
| Identity-bound keys | Cross-server queue hijack | Key on `<token_user_id>:<session_id>` |
| Sessions ≠ auth | Replayed session as capability | Re-verify the token every request |
| CSPRNG + TTL + namespaces | Guessing and persistence | Random IDs, scoped state, expiry ceiling |
| Resume as privilege | Redelivery over a boundary | Isolation check before re-delivery |

## The takeaway

Audit one thing this week: **every key into shared state — queue, cache, session store, resume buffer.** For each, ask whether the client controls or can guess that key. If it can, you hold a cross-tenant leak that fires on the next load-balancer reroute.

The line that closes it is short: derive an identity from the validated token, prepend it, and bind. "Stateless" was never the guarantee. *Identity-bound* is.