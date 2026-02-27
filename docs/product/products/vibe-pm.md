# Vibe PM — AI-Native Project Manager

## One Line

MCP server that gives AI agents code review, decision tracking, and quality gates.

## The Problem

AI writes code fast, but nobody checks if it matches what was asked. Files change without tracking, context is lost between sessions, and unreviewed code ships to production. There's no structure, no memory, no gate.

## The Solution

Vibe PM is an MCP server that plugs into Claude Code (or any MCP client). It provides 30+ tools for structured AI workflows: briefings capture intent, decisions record choices, inspections enforce quality, and memory persists context across sessions.

## Quick Start

```bash
# Install
npm install -g @vibecodetown/mcp-server

# Add to Claude Code (.mcp.json)
{
  "mcpServers": {
    "vibe-pm": {
      "command": "npx",
      "args": ["-y", "@vibecodetown/mcp-server"]
    }
  }
}
```

## Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| Project Briefing | Production | Accept project, create run context |
| Decision Tracking | Production | Record intent choices with candidates |
| Code Inspection | Production | Gate check with GO/FIX/BLOCK verdicts |
| Work Order Generation | Production | Scoped implementation guides |
| Memory (ChromaDB) | Beta | Persistent vector store across sessions |
| Observer Pattern | Production | A2A event bus with 7 skill packs |
| Ralph Loop (Cockpitd) | Production | Auto-correction sidecar (3 retries, 300s) |
| Profile System | Production | `mvp`/`coding`/`all` tool loading |

## Workflow

```
briefing → get_decision → submit_decision → create_work_order
  → [implement] → inspect_code
                       │
                   GO ✅ → done
                  FIX ⚠️ → fix + re-inspect
                BLOCK ❌ → back to decision
```

## MCP Tools (30+)

### Core Tools
- `vibe_pm.briefing` — Accept project, create run context
- `vibe_pm.status` — Current project phase
- `vibe_pm.get_decision` — Get decision candidates
- `vibe_pm.submit_decision` — Record chosen option
- `vibe_pm.create_work_order` — Generate implementation guide
- `vibe_pm.inspect_code` — Run gate check (GO/FIX/BLOCK)
- `vibe_pm.doctor` — Environment health check

### Memory Tools
- `vibe_pm.memory` — Store entry
- `vibe_pm.memory_retrieve` — Search memories
- `vibe_pm.memory_sync` — Sync with remote
- `vibe_pm.memory_status` — Check health

### Spec Tools
- `vibe_pm.spec_high_validate` — Validate high-level spec
- `vibe_pm.spec_high_clinic_bridge` — Bridge spec to clinic

### BitNet Tools (env-gated)
- `vibe_pm.bitnet_check` — BitNet availability
- `vibe_pm.bitnet_signal` — Send signal to BitNet
- `vibe_pm.bitnet_trace` — Trace BitNet execution

## Stats

| Metric | Value |
|--------|-------|
| npm package | `@vibecodetown/mcp-server` v1.4.0 |
| Language | TypeScript |
| Tests | 5,411 passing |
| Source files | 702 |
| MCP tools | 30+ (31 default + 13 env-gated) |
| Skill packs | 7 (including TDD_GUARD) |
| Hub port | :3100 (Fastify) |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `VIBE_PROFILE` | `all` | Tool profile (`mvp`/`coding`/`all`) |
| `VIBE_OBSERVER` | `1` | Observer enabled |
| `VIBE_COCKPIT` | `0` | Cockpitd gate enforcement |
| `VIBECODE_DEBUG` | — | Debug logging |
| `VIBECODE_OFFLINE` | — | Skip binary downloads |

## GitHub

- **Monorepo**: yellowhama/Musu (`release/mvp_core_clinic/`)
- **npm repo**: yellowhama/vibe-pm (subtree push)
