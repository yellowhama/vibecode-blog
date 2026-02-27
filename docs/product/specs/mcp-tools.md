# MCP Tool Catalog

## Overview

MUSU exposes 46 tools across 5 namespaces via MCP (Model Context Protocol). Tools are available through stdio (Claude Code) and HTTP (Streamable HTTP at `/api/mcp`).

## Tool Loading

Tools load based on profile:

| Profile | Tools | Use Case |
|---------|------:|----------|
| `mvp` | ~15 | Quick start, essential only |
| `coding` | ~25 | Development workflow |
| `all` | 31+ | Full catalog (default) |

Set via `VIBE_PROFILE` env var. Additional 13 tools available with env gates (`VIBE_BITNET`, `VIBE_COCKPIT`, etc.).

## Namespace: `vibe_pm` — Project Management

| Tool | Description |
|------|-------------|
| `vibe_pm.briefing` | Accept project, create run context |
| `vibe_pm.status` | Current project phase and state |
| `vibe_pm.get_decision` | Get decision candidates for a task |
| `vibe_pm.submit_decision` | Record chosen decision option |
| `vibe_pm.create_work_order` | Generate scoped implementation guide |
| `vibe_pm.inspect_code` | Run gate check (GO/FIX/BLOCK) |
| `vibe_pm.doctor` | Environment health check |
| `vibe_pm.ingress` | Receive external event |
| `vibe_pm.init_docs` | Initialize project documentation |
| `vibe_pm.scaffold` | Generate project scaffold |
| `vibe_pm.ui_manifest` | Get UI component manifest |
| `vibe_pm.ui_resource` | Get UI resource |

## Namespace: `vibe_pm.memory` — Persistent Memory

| Tool | Description |
|------|-------------|
| `vibe_pm.memory` | Store memory entry |
| `vibe_pm.memory_retrieve` | Search stored memories |
| `vibe_pm.memory_sync` | Sync with remote store |
| `vibe_pm.memory_status` | Check memory health |

## Namespace: `vibe_pm.spec` — Specification

| Tool | Description |
|------|-------------|
| `vibe_pm.spec_high_validate` | Validate high-level spec |
| `vibe_pm.spec_high_clinic_bridge` | Bridge spec to clinic engine |

## Namespace: `vibe_pm.clinic` — Code Quality

| Tool | Description |
|------|-------------|
| `vibe_pm.clinic_verify` | Verify clinic inspection result |

## Namespace: `vibe_pm.bitnet` — Edge AI (env-gated: `VIBE_BITNET=1`)

| Tool | Description |
|------|-------------|
| `vibe_pm.bitnet_check` | Check BitNet availability |
| `vibe_pm.bitnet_signal` | Send signal to BitNet |
| `vibe_pm.bitnet_trace` | Trace BitNet execution |

## Namespace: `vibecode` — Code Assistance

| Tool | Description |
|------|-------------|
| `vibecode.answer` | Answer coding question |
| `vibecode.one_loop` | Run one clinic loop |
| `vibecode.show_ask_queue` | Show pending questions |
| `vibecode.show_decisions` | Show decision history |

## Response Envelope

Every tool response follows the AI-Native envelope:

```json
{
  "signal": "GO",
  "summary": "Human-readable summary",
  "data": { ... },
  "next_action": "Use vibe_pm.create_work_order to generate implementation guide"
}
```

### Signals

| Signal | Meaning |
|--------|---------|
| `GO` | Proceed |
| `FIX` | Course-correct needed |
| `BLOCK` | Major issue, re-decide |
| `INFO` | Informational response |
| `WAIT` | Async operation in progress |

## Skill Packs (Observer)

7 skill packs register hooks on tool events:

| Pack | Description |
|------|-------------|
| TDD_GUARD | Enforces test-first development patterns |
| ... | (6 additional packs) |

Activated with `VIBE_OBSERVER=1` (default ON).

## Access Methods

### 1. stdio (Claude Code / CLI)

```json
// .mcp.json
{
  "mcpServers": {
    "vibe-pm": {
      "command": "npx",
      "args": ["-y", "@vibecodetown/mcp-server"]
    }
  }
}
```

### 2. HTTP (Streamable HTTP)

```
POST https://musu.pro/api/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "vibe_pm.status",
    "arguments": {}
  }
}
```

### 3. Web MCP (Chrome 146+, planned)

Declarative HTML attributes on form elements.
See [WebMCP notes](../../../memory/webmcp-notes.md).
