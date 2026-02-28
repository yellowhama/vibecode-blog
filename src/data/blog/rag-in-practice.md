---
author: Hama
pubDatetime: 2025-03-02T09:00:00Z
title: "Escaping Research Hell -- Finding What You Need in 3 Minutes with RAG"
slug: rag-in-practice
featured: false
draft: false
tags:
  - rag
  - tutorial
  - claude-code
description: "1,624 pages of PDFs, 37 minutes to find 3 paragraphs. Built a RAG system with Claude Code -- research time dropped 91%, output quadrupled."
---

## TL;DR

- **Problem**: 300 pages on 9th-century Europe. I needed 3 lines. Took 37 minutes to find them.
- **Solution**: RAG system = ask a question, get the relevant source material automatically
- **Result**: Research time 37 min to 3 min (91% reduction)
- **Bottom line**: Claude Code built the whole thing. I just said "find it."

---

## Sunday Night, 11 PM, Staring at 300 Pages

Sunday night. I have until tomorrow to write about Carolingian military organization in the 9th century.

PDFs piled on the desk. 1,624 pages total.

Somewhere in there is the part about "adoption of cavalry-centric tactics in the Carolingian dynasty." I definitely read it. Where was it?

First PDF. Ctrl+F. "cavalry."

147 results.

Click through them one by one.

"Byzantine cavalry..." Nope.
"Hunnic cavalry tactics..." Not this either.

30 minutes gone.

Finally found it. Page 78.

Copy. Paste into Notepad. Write down the source.

OK, got one. But I need more.

Open another PDF. Ctrl+F again. Click. Click.

Checked the clock. Past midnight.

**37 minutes of searching: 3 useful paragraphs.**

---

## Finding an Acorn on a Mountain

That's when I realized the problem.

It wasn't a lack of sources. **Too many sources** was the problem.

Ctrl+F finds words. It has no idea if that's the context I'm looking for.

- Finds "cavalry" but misses "heavy cavalry"
- Finds keywords but can't judge relevance

And the most annoying part:

**Having to re-find something today that I already read yesterday.**

---

## What's RAG? — A Fridge Labeling System

I stumbled onto RAG (Retrieval-Augmented Generation).

Asked Claude. "Explain RAG using an everyday analogy."

*"Think of it like a fridge labeling system. Right now you don't know what's in the fridge, so you open the door and dig through everything. RAG is putting a list on the fridge door."*

Ah.

**One-line definition: "You ask a question, and the system finds just the relevant parts from your pile of documents, with sources."**

---

## Old Way vs RAG

**Old way (37 min)**:
Open PDF, Ctrl+F, click through 147 results, find the relevant section, copy, check the source

**RAG way (3 min)**:
Open terminal, type "Carolingian cavalry tactics," get 3 relevant sources automatically, read

**Difference: 34 minutes saved (91% reduction)**

---

## Claude Code, Chop Up My Documents

OK. Let's build it.

"I have 4 PDFs in my `/data/raw/` folder. Split each file into paragraph-sized chunks, about 500-1000 characters each."

Claude Code moved.

5 minutes later:

```
2,157 chunks created
Saved to: /data/chunks/
```

Each chunk tagged with the original filename and page number.

---

## Tagging — Auto-Classification

"Analyze each chunk and tag it. War, diplomacy, economy, religion, geography. Like that."

Made a YAML rules file. "War" tag applies if keywords like [battle, siege, strategy, military] appear. That kind of thing.

Claude ran it.

```
- War tag: 427 chunks
- Diplomacy tag: 213 chunks
- Economy tag: 189 chunks
```

Done.

---

## Building the SQLite Search Engine

"How do I build the search?"

*"Use SQLite FTS5. No extra installation. Fast search."*

"Make me a SQLite DB. Full-text search with FTS5."

Claude designed the schema, loaded the chunks.

```
DB file: /data/rag.db (size: 47MB)
```

Done.

---

## The First Search

Built the search script.

```bash
python rag-search.py "Carolingian military organization"
```

3 seconds later:

```
Related result 1 (relevance: 0.91)

The Carolingian dynasty operated small cavalry-centric
combat units called "scara"...

Source: frankish_military_history.pdf
Page: 78
Tags: [war, military]
Link: file:///data/raw/frankish_military_history.pdf#page=78
```

Damn.

**Found in 3 seconds what used to take 37 minutes.**

---

## One Click to the Original Source

Clicked the link.

PDF opened. **Right to page 78.**

Before, I'd waste 3 minutes going "which PDF was it again?"

Now it's click and done. 3 seconds.

---

## Before vs After — One Week

**Before RAG** (last week):

- Research time: 5 hours 5 min
- Articles written: 3

**After RAG** (this week):

- Research time: 12 min 30 sec
- Articles written: 12

**Research time: 5 hours to 13 minutes (96% drop). Output: 3 articles to 12 (4x).**

---

## What RAG Actually Does — It Doesn't Write for You

Let me be clear.

**RAG does not write your stuff for you.**

RAG's job: find sources + organize + provide citations

My job: read + judge + interpret + write

RAG is the librarian who hands me materials. I'm the chef who cooks with them.

---

## It Has Limits

### Can't find what's not there

Obviously. If it's not in my documents, it can't find it.

No hallucination. If it's not there, it says so.

### Cross-referencing is on me

RAG gives you 3-5 related chunks separately.

How to connect them is my call.

### Tagging accuracy: 70-80%

Auto-tagging isn't perfect.

Checked samples, tweaked the rules, ran it again. After 2-3 rounds it got usable.

---

## Build Time — Honestly, 3 Days

**Day 1**: Chunk splitting + tagging (1 hour 40 min)

**Day 2**: DB setup (55 min)

**Day 3**: Search CLI (1 hour 40 min)

**Total: about 4 hours**

Really, two days learning, one day building.

---

## You Can Build This Too

What you need:

1. Claude Code access
2. Basic SQLite understanding (or not — just ask Claude as you go)
3. A pile of documents you want organized

Programming knowledge? Not needed.

Just tell Claude to do it.

**"Hey, build this for me."**

---

## What's Next — Vector Search

What I built is Phase A. Keyword-based search.

Works well enough.

But you can go further.

**Phase B: Vector Search**

Search for "war" and it also finds "military conflict." That kind of magic.

Semantic search that covers synonyms and related concepts.

**Time needed: 2-3 more days**

But honestly, what I've got already works fine.

---

## Wrapping Up — Out of Research Hell

Sunday night, 11 PM, hopeless in front of 300 pages.

Now?

**Search 3 sec, review 2 min, start writing.**

**37 min to 3 min.**

**That's two extra days a month.**

Your pile of documents can be organized too.

Install Claude Code, open the terminal, say "chop up my PDFs."

**Three days to build. A lifetime of use.**

---

## Quick Start Guide

```
1. "Split my PDFs into 500-1000 character chunks"
2. "Tag the chunks"
3. "Create a SQLite DB with FTS5 search"
4. "Build me a search CLI"
5. python rag-search.py "what you're looking for"
```

Done.

**Stop searching. Start asking.**
