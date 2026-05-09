---
title: "Boksuni's Major Surgery: From Spaghetti Code to a System"
description: "Field notes from the trenches: Exploring boksuni's major surgery: from spaghetti code to a system through the lens of vibe coding."
pubDatetime: 2026-05-09T07:25:50.000Z
featured: false
draft: false
tags:
  - vibe coding
  - field report
ogImage: ""
---

> **TL;DR**: An excavation of boksuni's major surgery: from spaghetti code to a system. Real scars, no slop.

## TL;DR

- **Problem**: 5 local LLM agents ("Boksuni") on a 16GB GPU. 45-minute runtime. 30% failure rate. 10,000+ lines of spaghetti.
- **Fix**: GitHub Spec Kit for a real specification. Shared modules. Collect/evaluate split. Auto GPU unloading. 3-level error system.
- **Results**: Runtime **45min to 12min**. Codebase **10,847 to 3,562 lines**. Failure rate **30% to 3%**. Adding a new source **2 days to 2 hours**.
- **Rust surprise**: Data collection rewritten in Rust. Speed **30x up**. Memory **80% down**.
- **Lesson**: AI is the chef. You're the Michelin judge. Vibe Coding is the starting point, not the finish line. You need spec-driven refactoring to build a real **system**.

---

## The Morning Boksuni Stopped

December 2024. Monday morning. Opened the Boksuni dashboard with coffee in hand.

Empty.

"Huh? Did Boksuni throw another tantrum?"

Checked the logs. Boksuni #3 timed out downloading arXiv papers. Boksuni #1 errored out calling the Product Hunt API. Boksuni #4 never even started. Out of five agents, not a single one was working.

Started debugging. Found something shocking.

Total code: 10,847 lines. Duplicate code: 4,200 lines. A copy-paste carnival.

Classic spaghetti.

---

## What's Boksuni?

Boksuni is my squad of five AI agents. Born to save me from drowning in the sea of information.

Every morning, they each work in their own domain.

**Boksuni #1** scours the internet for new AI tools.

**Boksuni #2** scrapes academic sites like The Conversation for science articles on topics I care about.

**Boksuni #3** hunts arXiv for AI papers matching my interests.

**Boksuni #4** specializes in pop-psychology papers related to AI. Stuff like "AI and Heartbreak: How People Cope with Losing GPT-4o." I'm not making this up.

**Boksuni #5** is for office workers. Only grabs practical research like "Cut Meeting Note Time 90% with ChatGPT."

They run on open-source models. Solar 10.7B and Qwen2.5 14B. No API bills to OpenAI or Anthropic. They run quietly on my machine. The GPU threatens to explode sometimes, but hey, free is free.

Thanks to these guys, I don't have to spend all day on Google anymore. Boksuni reviews thousands of pieces of content daily, picks the 50 worth reading. All I do is click through the URLs and choose today's writing material. Once I pick a topic, I send the Boksunis back out.

"Find me papers or user reviews on this topic."

When four or five pieces stack up on a single subject, insights start showing. Then I start writing.

The problem was that all five were doing their own thing.

Same RSS parsing code written five times. Same error handling built five times. Classic Vibe Coding output.

---

## 45 Minutes of Pain

Full Boksuni run: 45 minutes average. Why?

Sequential execution. Boksuni #1 finishes, then Boksuni #2 starts. Parallel processing? Impossible.

Simple reason: local LLMs. Running Solar 10.7B and Qwen2.5 14B at the same time? GPU dies instantly. My RTX 4060 Ti has 16GB VRAM. Barely enough for one model. Two at once? Don't even dream about it.

So the Boksunis had to wait their turn. Boksuni #1 finishes evaluating content with Solar, frees up GPU memory, then Boksuni #2 steps in. While Boksuni #3 summarizes papers with Qwen, the rest wait in the lobby.

Like five people sharing one bathroom.

Error handling was a mess too. Everything wrapped in try-except, but no way to tell where the error came from. Just "something went wrong" over and over. Sometimes I couldn't tell if it was GPU memory, API timeout, or the model just crashing.

Failure rate: 30%. Three out of ten runs, something broke. Timeouts, API limits, websites changing their structure. But the biggest killer was "model unload failure." When a model got stuck on the GPU and wouldn't come down, the next Boksuni couldn't even start.

---

## The Power of a Spec

I'd written about GitHub Spec Kit the week before. Theory was done. Time for practice.

Fired up Claude Code. "Analyze Boksuni's code and write me a spec."

One hour. Fifteen pages. I built this system and half of it was news to me.

"Boksuni #2 and #4 both use the arXiv API, but with completely different implementations."

"Error handling is 60% of the codebase. But only 3 patterns repeat."

"Three agents use identical Markdown conversion logic, each implemented differently."

---

## The Surgery Begins

Started refactoring based on the spec. Claude Code led. I pointed the direction.

**First**, shared module extraction. Built a `ContentSource` abstract class that all agents inherit from. RSS parsing, web scraping, Markdown conversion — all in one place.

**Second**, smart async. GPU was still the bottleneck, but data collection doesn't need a GPU.

While the Boksunis scrape websites and call APIs, no GPU is needed. So I split the work into two phases. In the **collection phase**, all five agents grab data simultaneously. RSS feeds, arXiv API, web scraping — parallelized with asyncio. That alone saved 20 minutes.

In the **evaluation phase**, it's still sequential. But now the data is already ready, so you're just waiting for the model to load. Plus I added batch processing — Boksuni #1 evaluates 30 pieces of content at once. Load the model once, process as much as possible, then unload.

**Third**, automated GPU memory management. Auto-inserted `ollama stop` after every agent run. No more models stuck on the GPU. The next Boksuni gets a clean slate every time.

**Fourth**, standardized error handling. Three levels: Critical (halt), Warning (continue but log), Info (ignore). GPU memory errors get classified as Critical — immediately unload the model and restart.

---

## Rust: An Unexpected Win

"We're already tearing things apart. Let's try Rust."

I barely knew what Rust was. Just read some posts about it being fast. That was the extent of my expertise.

I asked Claude. "Can you convert this Python to Rust?"

Claude was pessimistic.

"Python library dependencies are too heavy. BeautifulSoup, PyPDF2, yfinance... A full Rust rewrite would take significant time. ROI may be low."

But on a whim, I opened Claude Code. "Just rewrite Boksuni #1's RSS collection in Rust."

It took less than twenty minutes. Working code. feed-rs for RSS parsing, html2text for Markdown conversion, reqwest for HTTP, tokio for async.

"Wait — this works?"

**Python version**: 45 minutes, sequential, 500MB memory.
**Rust version**: 1.5 minutes, 20 concurrent streams, 100MB memory.

Thirty times faster. Claude said it couldn't be done. Claude Code just did it. Same company. I should go tease Claude about this.

"Thought you said it couldn't be done?"

---

## The Smart Hybrid Strategy

The secret was splitting the work into two phases.

**Phase 1: Collection (Parallel)**

- 19 RSS feeds, all at once
- tokio async runtime for concurrent processing
- No GPU needed. Unlimited parallelism.

**Phase 2: Evaluation (Sequential)**

- Ollama runs the models
- GPU constraint. One at a time.
- But data is already ready, so it's fast.

```
[Collection: 20 concurrent]
    | (10 seconds)
[All data ready]
    |
[LLM evaluation: 1 at a time]
    | (50 seconds)
[Done: ~1 minute total]
```

Before, it was "collect, evaluate, collect, evaluate" on repeat. Now it's "collect everything, then evaluate everything."

I didn't need to know Rust. Claude Code handled it all. I just said "fix this" and "add error handling." That was it.

Rust's zero-copy operations and type safety cut memory usage by 80%. SQLite dedup checks went async with sqlx. Failure rate dropped from 30% to 5%.

---

## Unexpected Discoveries

Some things I realized while refactoring.

**Boksuni #3 was unnecessary.** Boksuni #4 (Dr. PopPsycho) was already pulling papers from arXiv. Just different categories. Merged them. 30% less code.

**The scoring system was pointless.** 90-point scale, 100-point scale... they were all basically the same. Simplified to three tiers: good, average, bad.

**90% of errors were timeouts.** Instead of building complex error handling, I just increased the timeout and added retry logic. Done.

---

## The New Boksuni

The refactoring results were impressive.

**Runtime**: 45 minutes to 12 minutes. The magic of parallel processing.

**Codebase**: 10,847 lines to 3,562 lines. Thanks to dedup and modularization.

**Failure rate**: 30% to 3%. Standardized error handling paid off.

**New source**: 2 days to 2 hours. Just implement the ContentSource interface and you're done.

The biggest change was maintainability. Now I can immediately tell where a problem is. Structured logs, independent modules, easy debugging.

---

## The 80-20 Rule: AI Is the Chef, I'm the Michelin Judge

The most important thing I realized during refactoring.

AI now handles 80%. Coding, testing, documentation, even bug fixes. I handle the other 20%. Writing specs, quality control, setting direction.

Used to be the opposite. Developers did 80% of the coding, tools helped with 20%.

Now the roles have completely flipped.

Good thing they did, too. If they hadn't, I'd still be spending 5 hours a day Googling by myself.

And I'd have maybe picked two topics?

Anyway.

That 20% matters. I need to be a Michelin Guide judge.

When Claude Code brings code, I need to be a tough critic.

"Chef, the error handling is salty. Too many try-catch blocks."

"Hey, this function is about 3% undercooked. Edge case handling is missing."

"Not enough tests on this module. Get the coverage to 95%."

You have to keep nitpicking like this. Not being a no-show. If you want to build a really good system, you need to be a demanding customer.

At first I was impressed by whatever Claude Code brought. "Wow, that fast?" and just accepted it all. The result was 10,000 lines of spaghetti.

Now it's different.

"Consider 10 more timeout scenarios."
"Adding a new source shouldn't take more than 5 minutes."
"If memory exceeds 100MB, refactor."

Push like this, and Claude Code gets more careful too.

Writes tests from the start, considers edge cases in advance, pays attention to performance optimization.

---

## What Boksuni Taught Me

**Vibe Coding is a starting point.** Great for getting ideas off the ground fast. But you need a spec to turn it into a system.

**Collaboration with AI needs boundaries.** Claude Code is a great chef. But you need a tough judge for a Michelin star. That's the human's job.

**An evolving system beats a "perfect" one.** Boksuni is still imperfect. But improvements are easy now. New requirements don't scare me.

**Duplication is a sin, but sometimes a necessary one.** At first, duplication is fine. Getting it working comes first. When patterns emerge, that's when you refactor.

---

## Boksuni's Next Challenge

Boksuni now runs stable. Every morning, 500 pieces of content collected, 50 high-quality picks filtered out.

New goals appeared.

**Getting the Boksunis to talk to each other.** What if Boksuni #1 finds an AI tool and Boksuni #5 evaluates it from an office worker's perspective?

**Self-learning system.** I want it to learn my taste by tracking what I actually read.

**Real-time alerts.** When truly important news breaks, notify me immediately. Event-driven, not batch.

---

## Closing: From Spaghetti to System

Boksuni was born from Vibe Coding. Started with the feeling of "roughly like this."

It became spaghetti. Caused problems every day. But I didn't give up.

Built a spec with Spec Kit. Refactored systematically.

Now Boksuni is a system. Predictable, extensible, maintainable.

Vibe Coding isn't bad. It's a great way to start.

But you can't stop there. Write the spec, build the structure, evolve it into a system.

And most importantly, the developer's role has changed in the AI era. We're no longer the ones writing code. Like Michelin judges, we manage quality, set direction, and make demanding requests.

It's the age of working with AI. With tools like Claude Code, anyone can build a system like Boksuni. What matters is starting, and then constantly saying "this isn't quite right" and nitpicking.

Boksuni works hard every day. More diligent than me, more thorough than me.

And I look at the content Boksuni brings and nitpick again.

"Hey Boksuni, the content quality is slipping today?"

"Boksuni! The soup is too salty!"

"BOKSUNI!! The rice is undercooked!!!"

The journey toward three Michelin stars continues.
