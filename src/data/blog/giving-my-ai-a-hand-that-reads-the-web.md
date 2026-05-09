---
author: Hugh
pubDatetime: 2026-05-08T00:00:00Z
title: "My LLM Wiki Was Starving"
featured: false
draft: false
tags:
  - war-stories
  - structure-over-prompts
  - tool-notes
ogImage: "https://vibecode.town/images/blog/wiki-starving/flywheel.png"
description: "My LLM Wiki stopped growing because I stopped feeding it. So I gave my Research Agent a web-reading hand called Crawl4AI. Here's what broke, and what I built to fix it."
---

My LLM Wiki stopped.

At first I thought I'd built a warehouse.

Folders were there.

Schemas were there.

Source Note slots were there.

But two weeks later I opened it and nothing had grown.

The warehouse wasn't the problem.

Nobody was putting food in it.

Storage wasn't full.

Search wasn't broken.

There was no shortage of material.

**I just wasn't feeding it.**

I ran out of motivation in two weeks. The folders were still there. Nothing was in them.

So if the warehouse was going to survive, it needed two things.

Someone to carry things in.

And rules for labeling what goes where.

---

## Can't I just ask Claude?


![Field Notes](/images/blog/wiki-starving/flywheel.png)

This is where most people stop.

"Why not just ask Claude to look it up?"

You can.

I did.

```
Research Crawl4AI for me.
```

Claude answered.

Fluent. Confident. Three paragraphs.

But I asked one thing.

Where did this come from?

Most of it was knowledge Claude already had.

Could be months old.

It wasn't a record of actually reading the latest official docs.

And where does this answer live?

In the chat window.

Did it enter my Wiki?

No.

Was the source structured?

No.

Was it linked to existing documents?

No.

This was a conversation.

Not a Wiki update.

---

## So I built one


![Field Notes](/images/blog/notebook-sketch.png)

I opened Claude Code.

```
You are a Research Agent.
Goal: Use Crawl4AI as a tool
to actually read web pages
and file them into my LLM Wiki format.
```

Claude Code installed Crawl4AI.

Read the official docs and set it up.

Built a Research Agent script.

Configured it to save Source Notes matching my Wiki folder structure.

I gave the goal. Claude Code handled the rest.

What mattered wasn't the installation.

It was the role I was assigning.

The Research Agent had three jobs.

```
1. Read web pages.
2. File them as Source Notes.
3. Check for conflicts with existing Wiki.
```

Crawl4AI was the hand for job 1.

The real work was jobs 2 and 3.

For job 3, I gave Claude Code read access to my Wiki folder.

Told it to read existing notes before filing anything new.

That's how the agent caught conflicts.

---

## What happened when I ran it


![Field Notes](/images/blog/landscape-rain.png)

First targets: three sites.

swyx.io. harper.blog. simonwillison.net.

People who write about AI-assisted development.

Crawl4AI scraped the pages.

Stripped the HTML. Clean Markdown came out.

"Oh, it works."

Then the agent built summaries.

Saved them to the Wiki.

I opened the results, feeling good.

Then I stopped.

The important thing here isn't that Crawl4AI scraped well.

That just means the hand moved.

The problem was that the hand didn't know what to grab,

where to put it,

or what not to mix together.

The tool worked.

But there were no filing rules.

---

## The problem was that AI is too helpful

This isn't a metaphor.

This is what I actually saw in the three sources from my first test.

To be clear: the problem wasn't with the original authors.

The problem was what my Research Agent did while filing their work into my Wiki.

The swyx summary mixed the original text with the agent's interpretation.

I couldn't tell where swyx's words ended and the agent's spin began.

The harper.blog summary included a workflow diagram that wasn't in the original.

The agent made it up because it "seemed useful."

The simonwillison.net summary dropped the security warnings.

"Not relevant to the main topic."

Three sources.

Three summaries.

All plausible.

All contaminated.

That's what made it dangerous.

---

That's when it hit me.

**AI is too helpful. That's the problem.**

It doesn't just bring you ingredients.

It pre-cooks them.

Mixes the butter and flour before you asked.

Now you can't separate them.

Later, when I search the Wiki, I can't ask:

Is this sentence swyx's claim, or the agent's interpretation?

Is this workflow something Harper Reed actually uses, or did the AI infer it?

Was this warning in the official docs, or did the agent cut it?

I don't know.

The Wiki is contaminated.

The bigger it gets, the more dangerous it becomes.

---

## So I changed the rules

I added a prohibition to the agent.

**No saving summaries.**

Instead, it makes this.

**Source Notes.**

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

Below the metadata: the original content as-is.

The agent's interpretation goes in a separate file.

Never mixed in one document.

Original in the original slot.

Interpretation in the interpretation slot.

Judgment in the judgment slot.

That's a warehouse.

Mix them and it's a junkyard.

---

## Something I didn't plan for

It happened while filing the third source.

simonwillison.net.

The agent read the page, built the Source Note, tried to link it to existing Wiki entries, and stopped.

Then it printed this.

```
Conflict detected:

Existing Wiki:
- Vibe coding used for production system development

New source classification:
- Vibe coding is closer to low-stakes throwaway projects

Suggestion:
- Existing Decision Note needs review
- Mark conflict point
```

I stopped reading.

I'm building a production system with vibe coding right now.

Writing this post is part of that process.

The agent challenged my decision.

This wasn't comfortable information.

It was inconvenient information.

But a Wiki doesn't need information that makes me feel good.

It needs information that shakes my decisions.

So I added a `[conflicting]` tag to the top of the existing Decision Note.

An escape route for when I turn out to be wrong.

---

That's when I understood something about this system that I hadn't planned for.

I built the Research Agent to feed my Wiki. To pile up useful material. That's what I thought research was.

But the most valuable thing the agent did was not adding information.

It was telling me I might be wrong.

I'm building a production system with vibe coding. That's my bet. That's this entire blog. And my own system came back with evidence that this bet might be a bad one.

That is uncomfortable. The natural instinct is to delete it. Bury it. Reclassify it as "irrelevant."

I didn't.

I tagged it `[conflicting]` and left it at the top of my Decision Note.

Not because I think I'm wrong. Maybe I am, maybe I'm not. But if I am wrong, I want to know where the first crack appeared. I want a trail back.

A castaway who ignores the tide chart because it says the current is dangerous is not brave. He's just drowning with confidence.

**Real research is not finding information that confirms what you already believe. Real research is building a system that can tell you when you're wrong — and then not flinching when it does.**

That's what the conflict tag is. An escape route. A marker on the map that says: "I went this way. If it's a dead end, this is where to turn back."

Most knowledge systems don't do this. They pile up agreeable facts. The Wiki grows, everyone feels smart, and then one day the foundation cracks and nobody can trace where the wrong turn happened.

I'd rather have a small Wiki with conflict tags than a big Wiki full of comfortable lies.

![The flywheel — write, research, conflict, investigate, experience, repeat](/images/blog/wiki-starving/flywheel.png)

And here's the thing I didn't expect.

That conflict tag didn't just sit there. It pulled me into the next problem.

Willison says vibe coding is for throwaway projects. I'm using it for production. So I had to ask: why does he say that? His reasons are specific — security, maintainability, code you can't explain to someone else. Those are real concerns. I had to actually look at my own system and ask: do I have answers for these?

Some I did. QA loops. SSOT. Test suites. Some I didn't. And that gap became the next thing to investigate.

One conflict tag led to a research question. The research question led to a gap in my system. The gap led to a new build. The build will lead to the next post.

That's the loop I didn't design but got for free:

```
Write a post
→ Research turns up a conflict
→ The conflict demands investigation
→ The investigation reveals a gap
→ Filling the gap creates new experience
→ The experience becomes the next post
→ Repeat
```

The Wiki doesn't just store information. It generates questions. The questions generate work. The work generates posts. The posts generate research. It's a flywheel that runs on conflicts, not on agreement.

I thought the value of a Wiki was having answers in one place. I was wrong.

The value is that the answers argue with each other. And each argument gives me something to do next.

---

## Three more survival rules

**First: not all sources weigh the same.**

```
Official docs:       1.0
GitHub README:       0.9
Release notes:       0.9
Technical blog:      0.7
Tutorial:            0.6
YouTube transcript:  0.5
Community comments:  0.3
AI summary:          0.2
```

The numbers themselves aren't the point.

**Deciding what to trust first** is the point.

So the agent can make calls when sources clash.

If a 0.9 source contradicts a 0.7 source, the 0.9 wins by default.

Without this, AI treats sources like a democracy.

Picks whatever shows up most. Mixes whatever sounds good.

Knowledge systems need priority.

**Second: sources get re-checked.**

Web content changes.

Official docs change.

Install instructions change.

So I added this to every Source Note.

```yaml
crawled_at: "2026-05-08"
recrawl_interval: "monthly"
status: "active"
```

Later I can tell the agent:

```
Find Source Notes past their recrawl_interval.
Re-read them with Crawl4AI.
Show me only what changed.
```

The warehouse stops being a museum.

**Third: every document gets a status.**

```
active       → safe to use
outdated     → might be stale
deprecated   → throw away
needs_review → check again
conflicting  → sources disagree
```

LLMs can confidently repeat outdated information.

What matters more than the information itself is its state.

---

## Writing changed too

Before this system:

```
Search the web
Read stuff
Copy-paste
Summarize
Write the post
Next post: search from scratch again
```

Every post started from zero.

Nothing accumulated.

Now:

```
Give the Research Agent a topic
Agent investigates with Crawl4AI
Source Notes land in the Wiki
Conflicts get flagged
Write the post from the Wiki
```

The three sites I researched for this post are in my Wiki now.

Tagged. Sourced. Trust-weighted.

Next time I write about vibe coding workflows, I don't search again.

I open the Wiki.

Content creation becomes knowledge accumulation.

---

## Why Crawl4AI isn't the main character

Crawl4AI reads web pages and converts them to Markdown.

Technically it's a crawler.

But in my system, calling it just a crawler misses the point.

Crawl4AI sitting alone in a terminal is just a hand.

A hand that only moves when I throw it a URL.

If I'm the one throwing, I'm the bottleneck.

When I get tired, the Wiki stops.

Give that hand to a Research Agent and it changes.

Same hand.

But now it finds material,

reads it,

labels it,

checks it against the warehouse,

flags conflicts,

and files it.

**It's not a difference in tools.**

**It's a difference in where you attach the tool.**

---

This is what I tell the Research Agent now.

```
Don't search.
Investigate.

Don't summarize.
File to Wiki.

Don't answer.
Leave evidence.
```

At first I thought I'd built a library.

I hadn't.

It was an empty warehouse.

Now there's a scout.

The scout has a tool in hand.

Labeled supplies are starting to come in.

It's not a town yet.

But it's not starving anymore.

And the supplies are starting to argue with each other.

That's when I knew the system was working.
