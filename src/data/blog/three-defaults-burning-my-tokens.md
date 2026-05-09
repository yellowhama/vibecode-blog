---
author: Hugh
pubDatetime: 2026-05-06T00:00:00Z
title: "Three Defaults That Were Burning My Tokens"
featured: false
draft: false
tags:
  - token-economics
  - structure-over-prompts
ogImage: "https://vibecode.town/images/blog/three-defaults/before-after.png"
description: "A bloated system prompt, a retrieval system reading 75 files per question, and a heartbeat checking every 5 minutes with nothing to do. Three things I set up months ago and never looked at again."
---

Three things were draining supplies from the camp and I didn't know it.

A bloated instruction sheet. A search party that brought back the entire forest. A guard who woke up every five minutes to check an empty horizon.

All three were things I set up months ago and never looked at again. None of them were broken. They were all doing exactly what I told them to do. That was the problem.

---

## 1. The system prompt nobody audited


![Field Notes](/images/blog/three-defaults/before-after.png)

I hadn't looked at my system prompt in two months. When I finally did, it was 670 words.

Half the sentences said some version of "be helpful, be accurate, be thorough." The other half described behavior the model already does by default.

I was paying tokens — every single request — to remind a language model that it is a language model.

Here's the kind of thing I found:

```
You are a helpful AI assistant. Your job is to assist the development team
with coding tasks. You should always be accurate, helpful, and thorough.
When given a task, think step by step. Always consider edge cases...
```

This went on for 496 more words. It was a 20-page employee handbook for someone who's been working here for ten years.

It's not wrong. It's just useless. Telling Claude to "be accurate" is like telling a calculator to "get the math right." Every token spent on this sentence is a token not spent on the actual task.

I went through line by line. One question: if I delete this, does the AI behave differently?

Most of the time, no.

What survived:

```
You are an engineer on this project. TypeScript unless told otherwise.
Search scope: src/ only. Flag blockers immediately. Skip explanation unless asked.
```

174 words. Specific. Every sentence tells the model something it couldn't figure out on its own.

**670 to 174. 75% reduction.** And this loads on every request. Hundreds of times a day.

The rule I apply now: **if deleting a sentence doesn't change the AI's behavior, delete it.** Specific beats general. One sentence carries information. The other carries vibes.

---

## 2. The retrieval that read everything


![Field Notes](/images/blog/notebook-sketch.png)

I asked my agent one question: "What does the health check endpoint return?"

Simple question. One function. One file.

The agent thought for 40 seconds. I checked the logs. It had loaded 75 files into context.

The health check file, yes. But also the auth module. The user model. The session handler. The middleware. The config. Every test file. Every file that imported the auth module. Every file in the same directory.

I had told it: "get relevant context." It interpreted "relevant" as "everything within two imports of the query." Follow the import graph two levels deep and you get the entire codebase.

75 files. For a function that returns `{"status": "ok"}`.

I didn't notice for three months. The bill was high. I assumed the agent was working hard. It was — on the wrong 72 files.

The fix: SQLite has a built-in full-text search engine called FTS5. No new dependency. No external service.

```sql
CREATE VIRTUAL TABLE code_index USING fts5(
    filepath, content,
    tokenize="unicode61 remove_diacritics 2"
);

SELECT filepath FROM code_index
WHERE code_index MATCH ?
ORDER BY rank LIMIT 5;
```

**75 files became 3. 96% reduction.** One SQL table. One afternoon.

I didn't add a smarter engine. I added a limit. "Get the 5 most relevant files" is a fundamentally different instruction than "get relevant files." One has a boundary. The other doesn't.

---

## 3. The heartbeat running on autopilot


![Field Notes](/images/blog/landscape-rain.png)

My agent checked in every 5 minutes. I looked at the logs:

```
[10:05] heartbeat — no new tasks
[10:10] heartbeat — no new tasks
[10:15] heartbeat — no new tasks
[10:20] heartbeat — 1 task found
[10:25] heartbeat — no new tasks
[10:30] heartbeat — no new tasks
```

Nine heartbeats. Two had work. Seven were the agent waking up, loading its full context, finding nothing, and going back to sleep.

A heartbeat is not a ping. Each one loads the system prompt, conversation history, available tools, and task state. The agent evaluates all of this to decide: "Is there something I should do?" When the answer is "no," that's a full meal sent back untouched.

Why every 5 minutes? Because I set it to 5 minutes six months ago and never changed it. That's the whole reason.

The fix: one condition.

```python
async def heartbeat(agent_id: str):
    last_task = await get_last_task_time(agent_id)
    if (now() - last_task).seconds < HEARTBEAT_INTERVAL:
        return {"status": "idle", "skipped": True}
    return await run_full_evaluation(agent_id)
```

Stretched the interval to 30 minutes. Added idle-skip. **83% reduction.**

---

![Three defaults: system prompt 670→174, retrieval 75→3 files, heartbeat 12→2 checks/hr](/images/blog/three-defaults/before-after.png)

## The pattern

Three different systems. Same problem.

| What | Default | Fix | Savings |
|------|---------|-----|---------|
| System prompt | 670 words of generic instructions | 174 words of project-specific rules | 75% |
| Retrieval | "get relevant context" (no limit) | FTS5, top 5 results | 96% |
| Heartbeat | Every 5 min, full context load | Every 30 min + idle skip | 83% |

None of these were hard to fix. The system prompt took 20 minutes. The retrieval index took an afternoon. The heartbeat took one condition.

The hard part wasn't the fix. The hard part was noticing. All three were defaults I set up during initial development and never measured. They were "working" — the system ran, tasks completed, output appeared. But underneath, most of the budget was going to instructions nobody read, files nobody needed, and check-ins with nothing to check.

---

## What I check now

Once a month I ask three questions:

1. **What loads on every request?** System prompt, context, tools — is all of it still earning its place?
2. **What retrieves data?** Is it getting what it needs, or everything adjacent to what it needs?
3. **What runs on a schedule?** Is the interval still right? Has the workload changed?

These are obvious questions. I didn't ask them for six months because the system was "working."

It was working. It was also wasting most of its token budget. Both were true at the same time.

I just hadn't looked.
