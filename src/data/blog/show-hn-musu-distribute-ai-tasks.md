---
author: Hugh
pubDatetime: 2026-05-08T00:00:00Z
title: "Show HN: MUSU – distribute AI coding tasks across your idle machines"
featured: true
draft: false
tags:
  - musu
  - ai-agents
  - multi-machine
  - launch
description: "I have three computers. Most of the time, two of them are idle while the third runs Claude Code. MUSU fixes that."
---

I have three computers. Most of the time, two of them are idle while the third runs Claude Code. MUSU fixes that.

MUSU is a local orchestration layer that distributes AI coding tasks — Claude Code, Gemini CLI, Codex — across machines you already own.

## Why not just SSH + tmux?

SSH is transport. MUSU is orchestration.

With SSH + tmux you still have to manually route tasks, track agents, handle token exchange, monitor health, restart crashes, and sync results. MUSU handles all of that. You just write:

```bash
musu do "add unit tests to auth module"
```

It picks the best available node, dispatches, monitors, and returns the result.

## Numbers

Measured over 48h across 2 machines (RTX 4060 + RTX 5070):

- Token spend: down ~70% after heartbeat optimization
- 4 concurrent agents across 2 machines vs 1 before
- QA pass rate: ~71% first attempt

## The stack

- `musu-bridge` — FastAPI, 119 endpoints per machine
- `musu-core` — Agent/task/DB abstraction
- `musu-relay` — WebSocket tunnel for cross-machine comms
- `musu-control` — MCP server (78 tools for Claude Code)

Everything runs locally. No cloud dependency.

## Try it

```bash
bash scripts/install.sh --service --start
musu do "describe this project"
musu status
```

GitHub: [github.com/yellowhama/musu-bee](https://github.com/yellowhama/musu-bee)
