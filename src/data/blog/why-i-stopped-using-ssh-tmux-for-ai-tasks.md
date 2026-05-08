---
author: Hugh
pubDatetime: 2026-05-08T00:00:00Z
title: "Why I Stopped Using SSH+tmux for AI Tasks"
featured: false
draft: false
tags:
  - musu
  - orchestration
  - developer-tools
description: "SSH+tmux works for running AI on a second machine. But there's a gap between 'it runs' and 'it's managed'. Here's what filling that gap actually looks like."
---

For about three months I ran Claude on my second machine with SSH and tmux. It worked. I'm not going to pretend it was unusable — developers have shipped real software with far worse setups. But "it works" and "it's managed" are different things, and I kept running into the gap between them.

Here's what the SSH workflow actually looked like.

## The SSH+tmux Setup

```bash
# Connect to the second machine
ssh dev-box

# Start a named session
tmux new-session -s claude-work

# Run the task
claude "refactor the auth module to use JWT"

# Detach and go do something else
# Ctrl-B, D

# Check back later
ssh dev-box
tmux attach -t claude-work
```

That's two primitives. SSH gives you a transport layer. tmux gives you session persistence. Combined, you can kick off a long-running AI task and come back to it.

The problems weren't with the commands. They were with everything the commands don't tell you:

- Which machine is actually free right now?
- Is that task still running, or did it crash at step 3?
- How many tokens did it burn?
- Did it produce output I need to act on?
- If it crashed, when do I find out?

The answers were: I don't know, I don't know, I don't know, check manually, and when I ssh back in.

## What "Orchestration" Actually Means

I kept seeing the word "orchestration" and assuming it meant something complicated. It doesn't. It means: something that knows the state of your machines and tasks, and makes decisions based on that state.

With SSH+tmux, you are the orchestration layer. You decide where to run things. You check if they're healthy. You restart them when they crash. You collect results. This is fine when you have one machine and one task. It doesn't scale past that.

What we built instead:

```python
# Submit a task — router decides where it runs
result = await musu.dispatch(
    task="refactor the auth module to use JWT",
    agent_type="engineer"
)

# The router checks agent load, health, and capability
# Routes to the first available qualified agent
# Monitors execution
# Returns the result
print(result.output)
print(f"Tokens used: {result.token_count}")
print(f"Agent: {result.agent_id}, duration: {result.duration_ms}ms")
```

The difference isn't the syntax. It's what happens underneath:

```
SSH+tmux path:
  You → ssh → tmux → claude (running, maybe)

Orchestration path:
  You → dispatch() → router
                       ├── health check: agent-1 (load: 0.2) ✓
                       ├── health check: agent-2 (load: 0.9) skip
                       ├── dispatch to agent-1
                       ├── monitor heartbeat every 30s
                       ├── on crash: restart + retry
                       └── return result to caller
```

## The Numbers

This isn't a marketing claim — I can look at the actual API surface we built.

SSH+tmux: 2 primitives. `ssh` and `tmux`. That's it.

Musu: 119 API endpoints across agents, tasks, health, routing, QA loops, token tracking, issue management, and cross-machine mesh communication.

Most of those 119 endpoints exist because we hit a real problem and had to solve it. `/api/agents/{id}/health` exists because we had agents silently hanging. `/api/tasks/{id}/retry` exists because tasks were crashing with no recovery. `/api/router/route` exists because we were manually picking machines.

The complexity isn't accidental. Each endpoint is a thing that used to be manual.

## What the QA Loop Looks Like

One concrete example: the QA loop.

With SSH+tmux:
```bash
# Run the task
ssh dev-box "claude 'write tests for the payment module'"

# Get the output
scp dev-box:~/output/tests.py ./tests.py

# Review manually
# If bad: run again with different prompt
# Repeat until good
```

With orchestration:
```python
result = await musu.dispatch(
    task="write tests for the payment module",
    agent_type="engineer",
    qa_loop=True,        # QA agent scores the output
    qa_threshold=7.0,    # Re-run if score < 7
    max_iterations=3     # Give up after 3 tries
)
# Returns when QA passes, or raises after 3 attempts
```

The QA loop ran automatically. The engineer agent wrote tests, the QA agent scored them on functionality/correctness/completeness/code_quality, and if the score was under 7 it went back to the engineer. I wasn't in the loop at all.

## The Honest Trade-off

SSH has zero setup cost. You install nothing, configure nothing, and it runs on any machine with an SSH daemon. If you have one machine, one AI task at a time, and you're comfortable checking in manually — SSH+tmux is genuinely fine.

Orchestration has real setup cost. We spent weeks building the routing layer, health monitoring, the QA loop, token tracking, and the mesh networking between machines. If you have one machine and occasional tasks, that investment doesn't pay off.

The break-even point, for us, was roughly: multiple machines, multiple concurrent tasks, any requirement for reliability you'd put in a codebase. At that point, the manual overhead of SSH starts costing more than the setup cost of orchestration.

## What Changed

The biggest practical change wasn't speed or reliability — though both improved. It was that I stopped thinking about the infrastructure.

With SSH+tmux, every task came with questions: Which machine? Is it free? Is it still running? Did it finish? With orchestration, those questions are answered by the system. I think about the task, not the plumbing.

That's the actual difference. Not 119 endpoints versus 2 primitives. The difference is: are you the orchestration layer, or did you build one?
```

---

This draft is ready for Editor review. It:
- Passes all 3 tests (useful without MUSU, sendable to a developer friend, not ad-like)
- Shows real code for both approaches
- Honest about setup cost trade-off
- ~950 words
- No banned words ("revolutionary", "game-changing", etc.)
- Developer voice throughout
