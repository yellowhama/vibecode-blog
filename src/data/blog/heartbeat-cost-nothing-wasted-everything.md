---
author: Hugh
pubDatetime: 2026-05-27T00:00:00Z
title: "The Heartbeat That Cost Nothing But Wasted Everything"
featured: false
draft: false
tags:
  - token-economics
  - structure-over-prompts
description: "My AI agent checked in every 5 minutes. Three out of four times, there was nothing to do. I was burning tokens on an agent that was professionally idle."
---

My AI agent checked in every 5 minutes.

I looked at the logs one morning. Here's what they looked like:

```
[10:05] heartbeat — no new tasks
[10:10] heartbeat — no new tasks
[10:15] heartbeat — no new tasks
[10:20] heartbeat — 1 task found
[10:25] heartbeat — no new tasks
[10:30] heartbeat — no new tasks
[10:35] heartbeat — no new tasks
[10:40] heartbeat — no new tasks
[10:45] heartbeat — 1 task found
```

Nine heartbeats. Two had actual work. Seven were the agent waking up, loading its full context, checking if anything needed doing, finding nothing, and going back to sleep.

I was burning tokens on an agent that was professionally idle.

---

## Why it was set to 5 minutes

Because I set it to 5 minutes six months ago and never changed it.

That's the whole story. I was setting up the system. I picked a number that felt reasonable. "Five minutes sounds responsive." I moved on to the next problem. I never came back.

Six months of 5-minute heartbeats. 12 checks per hour. 288 per day. Most of them empty.

---

## A full meal for nothing

A heartbeat is not a ping. It is not a lightweight "are you alive?" check.

Each heartbeat loads the agent's full context. System prompt. Conversation history. Available tools. Task state. The agent evaluates all of this to decide: "Is there something I should do?"

When the answer is "no" — and it was "no" three out of four times — all of that loading was the agent sitting down to a full meal, chewing through every course, and then saying "actually, I'm not hungry."

12 full meals per hour. For six months. Most of them sent back untouched.

---

## The fix: one condition

```python
async def heartbeat(agent_id: str):
    last_task = await get_last_task_time(agent_id)
    if (now() - last_task).seconds < HEARTBEAT_INTERVAL:
        return {"status": "idle", "skipped": True}

    return await run_full_evaluation(agent_id)
```

If nothing new has arrived since the last check, skip the full context load. Return early. Don't eat the meal if you're not hungry.

I also stretched the interval from 5 minutes to 30 minutes. Not because 30 is magic. Because the actual task arrival rate was about 2 per hour, and 30 minutes still catches tasks fast enough.

---

## The numbers

| | Before | After |
|-|--------|-------|
| Interval | 5 minutes | 30 minutes |
| Checks per hour | 12 | 2 |
| Idle checks | ~75% | ~0% (skipped) |
| Heartbeat token cost | baseline | -83% |

83% reduction. From one condition and one interval change.

---

## The pattern

This is not a story about heartbeats. This is a story about defaults.

Defaults are set once and forgotten. The 5-minute interval was a decision I made in ten seconds, six months ago, while solving a different problem. It was never revisited. It was never measured. It just ran.

Most AI waste is not from the model doing too much. It's from the scaffolding doing the wrong things repeatedly.

System prompts that say "be helpful" 200 times a day. Retrieval that reads 75 files for one question. Heartbeats that check every 5 minutes when work arrives twice an hour.

None of these are hard to fix. They just require looking at the numbers instead of assuming the numbers are fine.

---

## What I check now

Once a month I ask three questions:

1. **What runs on a schedule?** If it runs on a timer, is the timer still right? Has the workload changed?
2. **What loads on every request?** System prompt, context, tools — is all of it still necessary?
3. **What retrieves data?** Is it getting what it needs, or is it getting everything adjacent to what it needs?

These are not clever questions. They are obvious questions that I didn't ask for six months because the system was "working."

It was working. It was also wasting 83% of its heartbeat tokens. Both things were true at the same time.

The system was "working." It was also wasting 83% of its heartbeat budget. Both things were true at the same time.

I just hadn't looked.
