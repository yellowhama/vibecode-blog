---
author: Hugh
pubDatetime: 2026-05-23T00:00:00Z
title: "75 Files Per Query"
featured: false
draft: false
tags:
  - token-economics
  - war-stories
description: "My AI agent was reading 75 files every time it needed context. For a question about one function. The fix took an afternoon."
---

The most embarrassing optimization I ever made.

My AI agent was reading 75 files every time it needed context. For a question about one function.

I did not notice for three months.

---

## The moment I found out

I asked the agent one question: "What does the health check endpoint return?"

Simple question. One function. One file.

The agent thought for 40 seconds. That felt wrong. I checked the logs.

It had loaded 75 files into context. The health check file, yes. But also the auth module. The user model. The session handler. The middleware. The config. Every test file. Every file that imported the auth module. Every file in the same directory.

I had told it: "get relevant context." It interpreted "relevant" as "everything within two imports of the query." Follow the import graph two levels deep and you get the entire codebase.

75 files. For a function that returns `{"status": "ok"}`.

---

## Three months of this

The bill was high. I assumed the agent was working hard.

It was. Just not on the right things.

I didn't notice until I started measuring individual requests. The health check query from above? It was consuming more tokens than a full code generation task. That's what made me check the logs in the first place.

---

## The fix

SQLite has a built-in full-text search engine called FTS5. It's been there for years. No new dependency. No external service. No vector database. Just SQLite doing what SQLite does.

```sql
CREATE VIRTUAL TABLE code_index USING fts5(
    filepath,
    content,
    tokenize="unicode61 remove_diacritics 2"
);

SELECT filepath FROM code_index
WHERE code_index MATCH ?
ORDER BY rank LIMIT 5;
```

Index the codebase. Query returns the top 5 matches by relevance. Not 75. Five.

I built this in an afternoon. Most of that afternoon was reading the FTS5 documentation, which is surprisingly good.

---

## The numbers

| Before | After |
|--------|-------|
| 75 files per query | 3 files per query (average) |
| Naive relevance matching | Full-text ranked search |
| Token cost: absurd | Token cost: 96% less |
| Dependency: none | Dependency: still none (SQLite built-in) |

96% reduction. Same quality of answers. Often better, because the agent wasn't drowning in irrelevant context.

---

## The real problem

The retrieval system was not broken. It was doing exactly what I told it to do. "Get relevant context" with no scope constraint means "get everything adjacent to the query."

And "everything adjacent" compounds fast. One function imports a module. That module imports three others. Those three import five more. Follow the graph two levels deep and you have the entire codebase.

The fix was not a smarter algorithm. It was a constraint.

"Get the 5 most relevant files" is a fundamentally different instruction than "get relevant files." One has a boundary. The other doesn't.

---

## What this taught me

The best optimization is usually removing something, not adding something.

I did not add a better retrieval engine. I added a limit. The limit did more for performance than any amount of clever engineering would have.

This is a pattern I keep seeing. The problem is not that the AI can't do the thing. The problem is that nobody set the boundary. And without a boundary, AI is thorough to the point of waste.

"Get relevant context" — waste.
"Get the 5 most relevant files from the code index" — useful.

Same intent. One has a fence. The other doesn't.

---

*75 files became 3. One SQL table. One afternoon. The fix was not a smarter search engine. It was the word "limit."*
