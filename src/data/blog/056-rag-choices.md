---
title: 'I Added RAG. Then the Real Problem Showed Up.'
description: 'Field notes from the trenches: Exploring i added rag. then the real'
pubDatetime: 2026-05-10 13:24:40+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of i added rag. then the real problem showed up.. Real scars, no slop.

**RAG isn't search. It's selection.**

---

I added RAG.

Now AI doesn't talk without reading files.

It stopped imagining files that don't exist.

It follows imports.

Hallucinations dropped hard.

Good.

But something weird started happening.

---

## The Code Is Right. The Result Is Wrong.

The file is correct.

The connections are correct.

The syntax is fine.

But the result isn't what I wanted.

This is worse.

Before, I could say:

> "Hey, did you even read the file?"

Now I can't.

AI did read the file.

It followed the connected modules.

And it still missed.

Why?

---

## RAG Is Not Search

Most people understand RAG like this.

> Attach search and it gets accurate.

Half right. Half wrong.

RAG isn't a technology for fetching more.

**It's a technology for choosing what to attach.**

AI doesn't build its own world.

The context you feed it is the world.

Attach 3 files and those 3 are the world.

Attach 30 files and those 30 are the world.

From that moment, AI's judgment range is already set.

---

## Today's Models Come with Basic RAG Built In

Let's be honest.

- Vectorization?
- Ranking?
- ANN?
- Embedding optimization?

Current models already handle this kind of general search well.

We don't have to touch a vector DB ourselves.

Most search comes built in.

So what's left for us?

> Not general-purpose RAG.

---

## The Coffee Example

Say I sell coffee.

I gathered every related resource. Papers, blogs, health articles.

I ask AI:

> "Summarize the health benefits of coffee."

AI says:

> "Excessive caffeine intake can cause anxiety and sleep disorders."

Not wrong.

I ask again.

> "Rich in antioxidants, may help prevent cardiovascular disease."

Also true.

Both are real.

But which sentence belongs in a catalog?

The answer is simple.

**The truth that fits my purpose.**

---

## The Technology Isn't Wrong

Here's where people get confused.

"The RAG is broken."

No.

The model isn't wrong.

> You built a RAG that doesn't match the use case.

The data is all correct.

The search worked fine.

The problem is this.

**What purpose-filter did you run that data through?**

---

## Generation Isn't Copy-Paste

RAG fetches raw ingredients.

Generation is the cooking.

Copy the search results as-is and you've got Wikipedia.

You need to restructure for the question.

- What to emphasize.
- What to push to the back.
- What to exclude entirely.

That's purpose-driven RAG.

---

## That's Why You Need Your Project's Own RAG

General-purpose RAG is the model's job.

What we need to do is this.

- Collect the data.
- Chunk it.
- Put it in SQLite.

And lock it down for AI.

> Who am I.
>
> What is this data for.

If you're building a coffee catalog, put AI inside that world.

Push side effects to the "Cautions" section.

Put benefits in the main copy.

This isn't search tuning.

**It's world-building.**

---

## This Is Where It Gets Real

Prompt engineering says:

> "You are the god of coffee marketing."

And repeats it a hundred times.

That's closer to role-play.

The real method is different.

- Give it the coffee data.
- Lock down the catalog purpose.
- State what to emphasize and what's off-limits.

The moment you do that, AI changes.

Not because it became "the god of marketing."

**Because it entered the marketing world.**

---

## So This Statement Holds

> Built a RAG system?
>
> Then you've already started context engineering.

Prompts are words.

Context is the environment.

Talking well isn't the issue.

The issue is what environment you make it think inside.

---

Implementation is free.

Models keep getting smarter.

The fight always comes back to this.

> What do you show it.

RAG isn't search technology.

**It's the first step of designing AI's world.**

And that design is about 90% of it.