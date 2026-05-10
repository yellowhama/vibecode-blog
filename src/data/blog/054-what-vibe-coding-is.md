---
title: 'What Vibe Coding Actually Is'
description: 'Field notes from the trenches: Exploring what vibe coding actually is'
pubDatetime: 2026-05-10 13:24:40+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of what vibe coding actually is. Real scars, no slop.

Open Instagram.

Ad.

Someone made tens of thousands of dollars with vibe coding again.

Open YouTube.

Someone's teaching how to build a web SaaS in one hour with vibe coding.

What a time to be alive.

So I did it too.

And I failed.

Not once. Dozens of times.

I wrote about that process across five posts.

This post takes the conclusion from those five posts and puts it in one place.

You don't need to have read them.

"So what is vibe coding, exactly?"

Answering that one question is the entire point of this post.

---

### What Is Vibe Coding?

**Vibe coding is not "AI codes for you."**

Vibe coding is **a way of building software with an agentic AI.**

The key word here isn't *AI*. It isn't *coding*.

It's **with**.

AI does everything and the human just receives the output?

That's not vibe coding. That's **outsourcing**.

The stuff Instagram ads sell you.

---

### Why "With"?

Today's AI doesn't just suggest a line of code.

It creates files.

Edits them.

Runs them.

Runs tests.

And the human approves or rejects those actions.

AI isn't a tool. It's a **worker**.

The human isn't an audience. The human is the **decision-maker**.

Implementation is AI's job.

Judgment is the human's job.

That's the structure of vibe coding.

Only when this structure holds does vibe coding have any power.

---

### What Happens When "With" Disappears?

This is exactly what I wrote about across five posts.

When the human stops making decisions, AI keeps running. Diligently.

**With no one knowing where it's headed.**

No idea why it built things this way.

No idea how far you're allowed to change things.

The more you fix, the more it breaks.

And eventually this comes out:

"Just rebuild the whole thing from scratch."

---

### What Instagram Won't Tell You

Instagram ads say things like this.

Just write good prompts.

You can build an app without knowing how to code.

It's all about getting results fast.

All true.

**Until day one is over.**

From day two, you need something else.

Decisions.

What are you building.

What situation is this for.

Is this change a "minor tweak" or a "complete direction change."

The criteria to tell the difference.

The structure to lock it down.

The habit to repeat it.

Instagram doesn't talk about this.

A one-hour tutorial sells better.

---

### Devices That Lock Down Decisions

Developers hit this same problem decades ago.

Because it happens between humans too.

So they built things.

The names sound intimidating.

But they all do the same job.

**Nailing down "what we're building" in writing, before building it.**

---

**TDD** -- Test-Driven Development.

You write the test first.

"When the login button is pressed, the main screen appears."

You write that down first.

Then you build the code that passes the test.

Since there's a test, "did it work or not" is clear.

Same with AI.

Not "build this for me" but "make this pass the test."

When there's a standard, AI can't go off on tangents.

---

**DDD** -- Domain-Driven Design.

Give the problem a precise name.

Not "something seems off" but "the cart doesn't empty after checkout is complete."

When the name is precise, AI is precise.

When the name is vague, AI is vague.

Sounds obvious, right?

In practice, most people start at the "something seems off" end.

I did too.

---

**Spec-driven** -- write the spec first.

Before building, write down "this is what we're building" as a document.

Say it out loud and it evaporates.

Keep it in your head and AI doesn't know.

Write it down and it stays.

"Build according to this spec."

That one sentence cuts down on AI drifting off dramatically.

---

### Why Does This Lock Down Decisions?

All three do the same thing.

**Before building, lock down what you're building.**

TDD locks it with "success criteria."

DDD locks it with "precise names."

Spec-driven locks it with "a document."

What changes when it's locked?

You can tell AI "do this and only this."

When it's not locked?

You end up telling AI "just figure it out" every time.

Say "just figure it out" three times and you get a monster with 28 left arms.

Speaking from experience.

---

### Why Spend Energy Here?

In vibe coding, implementation is free.

AI does it.

Creating files. Free.

Writing code. Free.

Running tests. Free.

**Exactly one thing isn't free.**

"Deciding what to build."

Only a human can do that.

And locking that decision down in writing.

Only a human can do that too.

You can make AI implement endlessly.

But if the decision is wrong, a hundred implementations are still garbage.

So where you should spend your energy isn't code. It's **the spec**.

Not prompts. **Standards**.

AI can run fast not because AI is smart.

**Because a human laid the road.**

Laying that road is TDD. DDD. Spec-driven.

The real human job in vibe coding isn't coding.

It's **laying the road**.

---

### So Here's My Definition of Vibe Coding

I wrote five posts.

Built a game myself.

Built an AI agent system.

Failed dozens of times and started over.

Barely, barely got three pre-launch services to MVP.

My conclusion is one thing.

**Vibe coding is a way of building software by continuously exchanging decisions with AI.**

Implementation is AI's job.

Judgment is the human's job.

When this separation breaks down, you start like an Instagram ad and end with "just rebuild the whole thing from scratch."

---

### Four Questions You Must Answer Before Starting

Whatever tool you use.

Whatever methodology you follow.

Answer these four first.

**What** am I building.

**What situation** is this for.

What is the **problem** right now.

**Why** am I trying to fix it.

When you have these answers, AI moves precisely.

When you don't, AI wanders convincingly.

And I watch it wander until around day three, when I say:

"Just rebuild the whole thing from scratch."

Third time now.

---

## FAQ

### Q. How is vibe coding different from regular AI coding?

Regular AI coding is asking AI for code and copy-pasting it. Vibe coding is AI directly creating, editing, and running files. The difference? Copy-paste versus working together.

### Q. Can someone who knows zero coding do this?

Yes. But instead of "coding skill" you need "decision skill." What to build, whether this feature is needed now, whether this change is a tweak or a direction shift. AI handles the code syntax, but only a human can make these calls. Practicing these calls is vibe coding.

### Q. What's the best AI tool?

This isn't a tool fight. Claude Code, Cursor, GPT -- without a structure to lock down decisions, they all produce similar results. Write a spec document first. Break it into steps. Verify each result. That flow matters ten times more than which tool you pick.

### Q. Isn't this the same as prompt engineering?

No. Prompt engineering is the art of talking well. Vibe coding refers to the entire way of working with AI. Prompts are one piece inside it. In reality, environment design beats prompts every time. No matter how well you sweet-talk, it can't beat setting up one situation where the work actually gets done.

### Q. Is this different from what Karpathy described as vibe coding?

Karpathy's original was "coding where you type something in English by feel and results come out." True. From a developer's perspective. But for non-developers, that "feel" doesn't work. Because there's no criteria to distinguish decisions. My definition adds "decision structure" to Karpathy's original. Vibe coding that non-developers can use too.

The thing is, Karpathy already had that decision structure built in. I didn't, so I had to learn it the hard way.

Right. When Ryu Hyun-jin gives a one-point pitching lesson, only baseball players understand it.