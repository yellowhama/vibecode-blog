---
author: Hugh
pubDatetime: 2026-05-30T00:00:00Z
title: "I Gave My AI a Hand That Reads the Web"
featured: false
draft: true
tags:
  - structure-over-prompts
  - tool-notes
  - war-stories
description: "My LLM Wiki stopped growing because I stopped feeding it. So I gave my Research Agent a web-reading hand called Crawl4AI. Here's what happened."
---

My LLM Wiki stopped growing.

Not because the storage was full. Not because the search was broken. Not because I ran out of topics.

It stopped because I stopped feeding it.

The Wiki only grows when a human reads a web page, copies the good parts, reformats them, adds metadata, tags them, links them to existing documents, and saves. That human was me. And I got tired after two weeks.

I needed someone else to do it.

---

## The wrong first attempt

I did what most people do. I asked Claude directly.

```
Tell me about Crawl4AI.
```

Claude answered. Articulate, confident, three paragraphs. "Crawl4AI is an open-source web crawling framework optimized for LLM consumption..."

Good answer. Useless for my Wiki.

Where did this information come from? Claude's training data — which could be months old. Is there an actual source URL I can check later? No. Did it separate what's from official docs versus what's from a random blog? No. Did it save anything to my Wiki? No. Did it check if my Wiki already has a page about Crawl4AI? No.

That was a conversation. Not research.

---

## What I actually needed

I didn't need a chatbot that summarizes the web from memory.

I needed a worker that goes to the actual page, reads it, brings back the raw material, and files it properly.

Think of it this way: I had a kitchen (the Wiki). I had recipes (content I wanted to write). What I was missing was someone to go to the market, buy the ingredients, label them, and put them in the right shelf. Instead I was asking a friend who once visited the market to describe what they remember.

So I built a Research Agent inside Claude Code. And I gave it a tool called Crawl4AI — an open-source crawler that fetches web pages and converts them to clean Markdown that LLMs can actually read.

Crawl4AI is the hand. The Research Agent is the worker. The distinction matters.

---

## What happened when I ran it

I pointed the Research Agent at three sites: swyx.io, harper.blog, and simonwillison.net. Real blogs by real developers writing about AI-assisted coding.

Here's what I expected: three neat Wiki pages with summaries.

Here's what actually happened:

The agent fetched the pages. That part worked. Crawl4AI grabbed the content, stripped the HTML, returned clean Markdown. Fast. No issues.

Then the agent tried to "summarize" and save it to the Wiki. And that's where everything got messy.

The summary of swyx's "Learn in Public" mixed swyx's actual principles with the agent's own interpretation. I couldn't tell which sentences came from swyx and which the AI made up. The Harper Reed summary included a workflow diagram that wasn't in the original — the agent invented it because it seemed helpful. The Simon Willison summary quietly dropped his warnings about security because they "weren't relevant to the main topic."

Three sources. Three summaries. All plausible. All contaminated.

---

## The contamination problem

This is the thing nobody warns you about with AI research: the AI is too helpful.

It doesn't just bring you the ingredients. It pre-cooks them. It mixes the butter with the flour before you asked. And now you can't separate them.

When I looked at what ended up in my Wiki, I couldn't answer basic questions:

- Is this sentence from swyx's blog or from Claude's interpretation?
- Did Harper Reed actually recommend this workflow, or did the agent infer it?
- Is this a direct quote or a paraphrase?

If I can't answer these questions, the Wiki page is not knowledge. It's an AI-generated summary dressed up as research. It will fool me in three months when I've forgotten the source.

---

## What I changed: Source Notes

I added a rule. The Research Agent cannot save summaries. It saves **Source Notes**.

A Source Note looks like this:

```yaml
type: source_note
source_url: "https://www.swyx.io/learn-in-public"
source_title: "Learn In Public"
source_type: "blog_post"
crawled_at: "2026-05-08"
tool_used: "crawl4ai"
created_by: "research-agent"
trust_weight: 0.7
recrawl_interval: "quarterly"
status: "active"
```

Below the metadata: the original content as-is, then the agent's analysis in a clearly separated section.

The agent's interpretation goes in a different file — a Concept Note or a Workflow Note. Never mixed with the source.

This way, when future-me reads the Wiki, the chain is clear: this came from that URL, on that date, and here's how I interpreted it separately.

---

## The conflict detection I didn't plan for

The surprise was what happened when the agent ingested the third source.

Simon Willison argues that vibe coding — letting AI write code without reviewing it — is only appropriate for low-stakes projects. Meanwhile, my Wiki already had a page where I described using vibe coding to build a production system (which is... what I'm doing).

The agent flagged this:

```
Conflict detected:
- Existing Wiki: vibe coding used for production system
- New source (Willison): vibe coding only for low-stakes throwaway projects
- Recommendation: add nuance to existing page or create Decision Note
```

This was the moment I realized the Research Agent's most valuable job is not adding information. It's finding where new information contradicts what I already believe.

That's real research. Not summarizing. Comparing.

---

## The trust hierarchy

Not all sources are equal. My Wiki now has a trust ranking:

```
Official docs: 1.0
GitHub README: 0.9
Release notes: 0.9
Technical blog (known author): 0.7
Tutorial: 0.6
YouTube transcript: 0.5
Community comments: 0.3
AI-generated summary: 0.2
```

When two sources disagree, the higher-trust source wins by default. The agent marks the conflict and moves on. I review conflicts weekly.

This sounds bureaucratic. It's not. Without this, the Wiki becomes a democracy where Claude's made-up paragraph gets the same weight as the official docs. That's how knowledge systems rot.

---

## What content creation looks like now

Before this system, writing a blog post meant:

```
Search the web
Read 10 tabs
Copy interesting sentences
Lose track of which tab said what
Write the post from memory
Publish
Next post: repeat from scratch
```

Every post started from zero. Nothing accumulated.

Now it looks like this:

```
Give the Research Agent a topic
Agent crawls relevant pages → Source Notes in Wiki
Agent creates Concept Notes and Workflow Notes
I review the Wiki, not the raw web
I write the post from Wiki, not from memory
Wiki grows with every post
Next post: start from where I left off
```

The three sites I researched for this post? They're in my Wiki now. Tagged, sourced, trust-weighted. When I write the next post about vibe coding workflows, I don't search again. I open the Wiki.

---

## The tool is not the point

Crawl4AI is an open-source web crawler. It fetches pages and returns Markdown. That's it. It's good at that one job.

But I didn't write this post about Crawl4AI.

I wrote it about the difference between a tool and a system.

A tool without a role is just another rock on the beach. Crawl4AI sitting in my terminal, waiting for me to paste URLs — that's a rock. I was the bottleneck. I got tired. The Wiki stopped.

Crawl4AI inside a Research Agent, with rules about Source Notes and trust weights and conflict detection — that's a hand attached to a worker with a job description.

The same tool. Completely different outcome.

---

Three things I tell the Research Agent now. They apply to any AI doing any kind of research:

Don't search. Investigate.

Don't summarize. File the source and your analysis separately.

Don't answer. Leave evidence.
