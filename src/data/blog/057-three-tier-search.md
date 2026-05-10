---
title: 'Clean Your Closet Before You Search'
description: 'Field notes from the trenches: Exploring clean your closet before you'
pubDatetime: 2026-05-10 13:24:41+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of clean your closet before you search. Real scars, no slop.

---

Last post ended like this.

> RAG isn't search technology.
>
> It's the first step of designing AI's world.

Good.

Design matters. Got it.

So I went to design it.

And failed again.

A different way this time.

---

### It Finds Things. The Wrong Things.

After adding RAG, things were good for a while.

AI talking without reading files went down.

AI imagining nonexistent files went down.

Following connected modules worked.

But at some point something weird started happening.

It brought the right file.

But the result wasn't what I wanted.

Before, I could say "hey, did you even read the file?"

Now I can't.

AI read the file.

Followed the connections.

**Still off.**

---

### You Don't Need Technical Terms to Explain This

My house is enough.

"Mom, where's that new thing I bought?"

"Right here."

"No, that's the black one. The new one. The pink one."

"This?"

"No, the pink pants. I mean the pink t-shirt."

At this point, Mom explodes.

**"Clean your damn closet first, then look."**

---

### This Is Exactly What Happens to AI

You tell AI:

"Find the login code I made last time."

AI brings something.

"I think this is the file."

"No, that's the old version. The new one."

"How about this?"

"That's the test file. I mean the actual code."

Three, four rounds of this.

The human is pissed. AI is spiraling.

And eventually:

"Forget it, I'll find it myself."

At that moment, the whole point of RAG is gone.

---

### Why This Happens

The reason is simple.

**Everything is in one drawer.**

Black coat.

Pink pants.

Pink t-shirt.

Pajamas from three years ago.

Yesterday's laundry.

All in the same drawer.

Ask for the "pink t-shirt" in this state and of course it grabs the first pink thing.

Pink pants come up first.

Not wrong.

It is pink.

But that's not what I wanted.

AI is the same.

When all files are in one place, AI can only pick "the thing that looks most similar."

Whether it's actually important or just has a lot of matching words -- no way to tell.

**One drawer.**

---

### Mom's Solution Was Always the Same

Mom's solution wasn't technology.

It was organizing.

"Outer clothes in the wardrobe."

"Underwear in the first compartment."

"Off-season stuff on top of the linen closet."

After sorting like this,

"Mom, where's my pink t-shirt?"

One-second answer.

"Hanging in the wardrobe."

Because the search location is fixed.

Outer clothes go in the wardrobe. Done.

Don't even need to open the other drawers.

---

### So I Split the Drawers

I did the same for AI.

Split it into three compartments.

Each has a different role.

Each has a different speed.

Each holds different stuff.

And each is **built with entirely different technology.**

---

### First Compartment: Everyday Clothes

First compartment holds only daily-wear.

Files you're currently working on.

Code you just edited.

Notes from today.

The key here is speed.

No internet needed.

No external server needed.

Runs right on my machine.

**What this compartment does is simple.**

Chops up my project files.

Tags each chunk with "this is about X."

When AI searches, it reads the tags and picks "this chunk looks closest."

The tagging method is called TF-IDF.

Sounds intimidating but the principle is basic.

"How important is this word in this document?" -- expressed as a number.

"the" is everywhere, so low score.

"login" is only in certain files, so high score.

That score becomes the tag.

All computed on my machine. Stored as a few JSON files.

```
.vibe/cache/
├── memory_index.v1.json          ← tag storage
├── memory_hashvec_index.v1.json  ← fast comparison index
└── memory_embeddings_index.v1.json
```

Wi-Fi can be off.

API cost: zero.

Everyday clothes need to be within arm's reach.

**Tell AI this:**

> "Scan my project files and build a local search index.
>
> TF-IDF based, stored as JSON files,
>
> runs only on my machine without external APIs.
>
> When files change, auto-update the index."

That's enough for AI to set up the structure.

Details need tuning, but the skeleton comes from this.

---

### Second Compartment: Going-Out Clothes

Couldn't find it in the first compartment.

Or found something but not confident.

Open the second.

This holds the nicer stuff.

One critical difference from the first compartment.

**The search method is completely different.**

First compartment finds "files containing this word."

Second compartment finds **"files with a similar meaning."**

Search for "login feature" --

First compartment brings files with the word "login."

Second compartment also brings "user authentication," "session management," "password verification."

Even without the word "login."

Files close in meaning come along.

That's vector search.

Finding by meaning, not letters.

How?

A technique called embeddings.

Turns sentences into arrays of numbers.

Sentences with similar meaning become similar number arrays.

"Login feature" and "user authentication" -- a human sees them as similar.

After embedding, the numbers are similar too.

So you can find it even when the words are different.

The place that stores these number arrays is a vector database.

I use ChromaDB.

Can run on my machine or on a server.

**Tell AI this:**

> "Set up a vector database. Using ChromaDB.
>
> Embed my project documents and store them.
>
> Make it searchable by meaning.
>
> Use an embedding model that runs locally.
>
> Needs to work without internet."

Key difference again.

First compartment: searches by **text**. Fast and light.

Second compartment: searches by **meaning**. Slower but more precise.

In human terms -- when your head isn't enough, you dig through your notes.

Old notes, folders grouped by topic.

Finding it there gives more confidence.

---

### Third Compartment: The Suit in the Safe

Third compartment doesn't open casually.

Only official documents go here.

Finalized specs.

Final decisions.

Standards that must never change.

Answers from here carry more weight than the other compartments.

If the first compartment says "maybe this?"

The third compartment says **"this. Period."**

This one is built differently again.

**Two searches run at the same time.**

```
Final score = 0.6 x semantic similarity + 0.4 x keyword match
```

"Similar in meaning" and "exact word match" -- blended into one score.

This is called hybrid search.

Why blend?

Meaning alone can surface weird results.

Keywords alone can miss the actual meaning.

Mix them 60/40 and it's surprisingly accurate.

Finding that ratio took some time.

Running this needs a proper database.

I use PostgreSQL with the pgvector extension.

This is a different league from first-compartment JSON files.

Heavy, but that accurate.

It's the safe.

**Tell AI this:**

> "Install pgvector on PostgreSQL and
>
> create a table with vector search.
>
> Set up both an embedding column and a text search index.
>
> When searching, combine 60% vector similarity and 40% text matching
>
> into a hybrid search with a blended score."

Throw this at AI and it builds the table structure, indexes, and search queries.

If you don't know what PostgreSQL is, tell AI "install PostgreSQL first."

It'll do that too.

---

### Three Compartments at a Glance

```
┌─────────────────────────────────────────────────┐
│  Compartment 1: My Machine (JSON files)         │
│  Search: text matching (TF-IDF)                 │
│  Speed: fastest                                 │
│  Accuracy: roughly right                        │
│  Cost: $0. Works offline.                       │
│  Analogy: thinking off the top of your head     │
├─────────────────────────────────────────────────┤
│  Compartment 2: Vector DB (ChromaDB)            │
│  Search: meaning matching (embeddings)          │
│  Speed: moderate                                │
│  Accuracy: pretty accurate                      │
│  Cost: $0 if local. Paid if API.                │
│  Analogy: digging through your notes            │
├─────────────────────────────────────────────────┤
│  Compartment 3: Official DB (PostgreSQL+pgvec)  │
│  Search: meaning + keyword (hybrid)             │
│  Speed: slowest                                 │
│  Accuracy: most accurate                        │
│  Cost: needs a running DB                       │
│  Analogy: pulling out the official manual       │
└─────────────────────────────────────────────────┘
```

Going down: slower but more accurate.

Going up: faster but rougher.

So you always start from the top.

**You don't type a safe combination just to grab socks in the morning.**

---

### Do I Need All Three?

No.

You don't need all three from the start.

**The first compartment alone is enough to begin.**

A few JSON files.

No internet.

No database install.

Tell AI "scan my project files and build a search index."

That one sentence finishes the first compartment.

Then as the project grows, add the second.

When you need meaning-based search.

And when official spec documents start piling up, stand up the third.

When you need definitive answers.

That's incremental search.

Add one compartment when you need it.

No reason to build the safe on day one.

---

### Why the First Compartment Must Work Offline

One more thing.

The first compartment running offline isn't a convenience.

It's a design principle.

Vibe coders aren't always on perfect internet.

Wi-Fi dies at the cafe.

You're working on a plane.

The server is just slow that day.

If AI can't see your project at all when that happens?

That's not a tool. That's dead weight.

In the system I built, 4 out of 5 search methods work without internet.

The only one that needs it is the most precise external API search.

If your project's search depends on some other company's server status, that's not a system you control.

---

### Back to Mom

After the closet was organized,

"Mom, where's my pink t-shirt?"

One-second answer.

"Hanging in the wardrobe."

Search location is fixed.

Outer clothes, wardrobe. Done.

No need to open the other drawers.

AI is the same.

"This question should be answered from the spec documents."

When that's decided, AI doesn't need to open the first compartment.

Goes straight to the third. The safe.

"This can be found in the file I just worked on."

When that's decided, no need to go all the way to the third.

First compartment handles it.

**When things are organized, search is simple.**

When things aren't organized, search stays complicated forever.

What Mom said all along turned out to be the core of RAG.

---

### But Splitting Into Compartments Creates a New Problem

Three compartments is good.

But in reality this happens.

The same content sits in all three.

First compartment: "Login uses email."

Second compartment: "Login is under review for switching to social login."

Third compartment: "Login supports both email and social. Finalized."

AI found all three.

Which one should it trust?

This isn't a search problem.

**It's a trust problem.**

Same information, but where it came from should change its weight.

An answer from the spec document and an answer from a three-day-old memo can't carry the same weight.

If you don't set this, splitting into three compartments is pointless.

Three compartments, three different answers, and AI picks at random.

How is that different from one drawer?

---

### Next Post

Next post answers this question.

**What should AI trust first?**

Each compartment has a different weight.

Official docs are 1.0.

README is 0.8.

Code is 0.5.

Stuff AI generated on its own is 0.3.

What these numbers mean.

How these numbers change the order of search results.

And how to make AI follow them.

That's the next story.