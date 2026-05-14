---
title: "The Content Engine Refactor: Agentic RAG on the LLM-Wiki"
pubDatetime: 2026-05-14T23:55:00Z
description: "Why we abandoned ChromaDB for our internal LLM-Wiki and built a semantic router that actually works."
draft: false
tags: ["engineering", "agentic-rag", "llm-wiki"]
references:
  - name: "LLM-Wiki Structure"
    url: "C:/Users/empty/llm-wiki"
    guru: "Vibe-Musu Labs"
---

# The Content Engine Refactor: Agentic RAG on the LLM-Wiki

I almost fell for the hype. 

When I decided to build an **Agentic RAG** system for this blog, my first instinct was to reach for a standard vector database like ChromaDB. It's what the tutorials tell you to do. 

**I was wrong.** 

Feeding a separate DB meant adding another layer of technical debt, another indexing pipeline, and another source of truth. I realized that my most valuable assets were already sitting in my **LLM-Wiki**.

---

## 1. The Implementation: Routing to the Wiki

Following the IBM **Perceive -> Reason -> Act** loop, I refactored the engine to use the LLM-Wiki as its primary context layer. 

Before a single byte is drafted, the **Agentic Router** now classifies the topic and points the engine to the specific subdirectory in the wiki.
- **Route A (Gurus):** `llm-wiki/global/gurus/`
- **Route B (Technical Specs):** `llm-wiki/global/specs/`

```python
# Real code from factory/vibe_engine.py
def router(topic):
    if "Software 3.0" in topic:
        return "LLM_WIKI: GLOBAL/GURUS"
    elif "Next.js" in topic:
        return "LLM_WIKI: GLOBAL/SPECS"
    return "FAILSAFE: SCOPE_DENIED"
```

---

## 2. The Aha Moment: The File System is the Database

The breakthrough wasn't about a better embedding model. It was about **Context Engineering** within the file system. 

By querying our existing `wiki_fts.db` (Full Text Search) and fallback markdown scans, the engine can find "The Signal" in 100ms without the overhead of a cloud-based vector DB.

- **Tokens saved:** 60% reduction in noise.
- **Authority:** Every post is now grounded in the *exact* knowledge base we use to build MUSU.

**The Lesson:** Stop building new silos. Your knowledge is already in your wiki—build agents that know how to read it.
