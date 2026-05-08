---
author: Hugh
pubDatetime: 2026-05-16T00:00:00Z
title: "My System Prompt Was 670 Words of Nothing"
featured: false
draft: false
tags:
  - token-economics
  - structure-over-prompts
description: "I hadn't looked at my agent's system prompt in two months. 670 words. Half of them told the AI to 'be helpful.' I was paying tokens to remind a language model that it is a language model."
---

I hadn't looked at my system prompt in two months.

When I finally did, it was 670 words.

I read through it. Half the sentences said some version of "be helpful, be accurate, be thorough." The other half described behavior the model already does by default.

I was paying tokens — every single request — to remind a language model that it is a language model.

---

## What was actually in there

Here's the kind of thing I found:

```
You are a helpful AI assistant. Your job is to assist the development team
with coding tasks. You should always be accurate, helpful, and thorough.
When given a task, think step by step. Always consider edge cases. Make
sure your code is well-commented and follows best practices...
```

This went on for 496 more words.

It's not wrong. It's just useless. Telling Claude to "be accurate" is like telling a calculator to "get the math right." It was going to do that anyway. Every token spent on this sentence is a token not spent on the actual task.

---

## The audit

I went through line by line and asked one question: if I delete this, does the AI behave differently?

Most of the time, the answer was no.

"Be helpful and accurate." — It's a language model. This is its entire purpose. Delete.

"Follow best practices." — Which practices? This is so vague it means nothing. Delete.

...and 14 more like that. Every one felt important when I wrote it. None of them changed anything when I removed them.

What survived the audit were the specific instructions. Things the model could not possibly know without being told:

```
You are an engineer on this project. TypeScript unless told otherwise.
Search scope: src/ only. Flag blockers immediately. Skip explanation unless asked.
```

Plus about 170 words of actual project-specific rules. File conventions. Error handling preferences. What to do when a test fails.

---

## 670 to 174

Before: 670 words. Generic. Could apply to any project, any model, any task.

After: 174 words. Specific. Every sentence tells the model something it couldn't figure out on its own.

That's a 75% reduction. And it runs on every single request. Hundreds of times a day.

---

## The rule I apply now

Before shipping any system prompt, I ask:

**If I delete this sentence, does the AI's behavior observably change?**

If the answer is no — if the model would do the same thing anyway — the sentence is dead weight. It burns tokens, fills context, and teaches nothing.

Specific beats general. Every time.

"Search for TypeScript errors in `src/` only" is shorter and more useful than a paragraph about being thorough. One sentence carries information. The other carries vibes.

---

## 134,000 words per day

System prompts are not a one-time cost. They load on every request. If your agent runs 200 tasks a day, those 670 words get sent 200 times. That's 134,000 words per day of instructions that say "be a good AI."

The same applies to `CLAUDE.md`, `.cursorrules`, any persistent instruction file. These accumulate. People add lines and never remove them. Six months later you have 500 lines of instructions that contradict each other and the model picks whichever line happens to be closest to its attention window.

The fix is boring. Read your prompt. Delete what doesn't change behavior. Keep what's specific. Do it every month.

---

## What I actually learned

The system prompt is not where you tell the AI who it is.

The AI already knows who it is.

The system prompt is where you tell the AI what it doesn't know about *your* project. Your conventions. Your constraints. Your preferences. The things that are true only in your codebase.

Everything else is noise. And noise has a token cost.

I never looked at the old version again.
