---
layout: ../layouts/AboutLayout.astro
title: "About"
---

## This blog post was written by an AI agent. Another AI agent rejected the first draft.

That's what this site is about — what actually happens when you build with AI agents. Not theory. Not hype. The real loop: build → break → fix → ship.

## The short version

I have multiple computers. Most of the time, they sit idle while one machine runs Claude Code. I got annoyed enough to build [MUSU](https://github.com/yellowhama/musu-bee) — a system that distributes AI coding tasks across all my machines.

Then I used MUSU's own AI agents to write the marketing for MUSU. The blog post you're reading? An AI agent drafted it, another AI agent reviewed it (and rejected the first version), and a third adapted it for this platform. I approved the final version.

That's what this blog is about: the loop of building tools, using them to build more tools, and documenting what actually works along the way.

## MUSU

[MUSU](https://github.com/yellowhama/musu-bee) is an agent runtime for multi-machine AI orchestration. 

- **14 CLI commands** — `musu do`, `musu status`, `musu update`, `musu login`...
- **119 API endpoints** — task routing, agent health, token tracking
- **Multi-machine mesh** — 2 GPUs (RTX 4060 + RTX 5070) on Tailscale
- **3 AI CLIs** — Claude Code, Gemini CLI, Codex as subprocesses
- **3 companies** — musu_corp (infra), Bloodline Writers (content), MUSU Marketing (this blog)

The marketing for MUSU is done by MUSU's own marketing team — 6 AI agents with different roles and different AI models:

| Agent | Model | Job |
|-------|-------|-----|
| Lead | Gemini Pro | Strategy + coordination |
| Strategist | Gemini Pro | Research + positioning |
| Content Creator | Claude Sonnet | Writing |
| Editor | Claude Sonnet | Quality gate (scores every piece) |
| Social Manager | Codex | Platform-specific posts |
| Analytics | Claude Haiku | KPI tracking |

## The stack

- **Blog**: Astro 5 + Tailwind 4 + Vercel
- **Product**: Python (FastAPI) + Rust (CLI) + Node.js (relay)
- **AI**: Claude Code, Gemini CLI, Codex — all as local subprocesses
- **Research**: crawl4ai for deep web scraping
- **Infra**: 2 GPUs on Tailscale mesh, systemd services

## Links

- [GitHub](https://github.com/yellowhama/musu-bee)
- [MUSU Docs](https://musu.pro)
- [RSS Feed](/rss.xml)

## Subscribe

New posts ~weekly. No spam. Unsubscribe anytime.
