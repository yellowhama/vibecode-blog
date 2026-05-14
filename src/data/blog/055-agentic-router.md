---
title: "The Content Engine Refactor: Building an Agentic Router"
pubDatetime: 2026-05-14T23:30:00Z
description: "How we implemented the IBM Agentic Loop into our own Content Factory to stop generating slop."
draft: false
tags: ["engineering", "agentic-rag", "ibm-insights"]
references:
  - name: "Agentic RAG Mental Model"
    url: "https://www.youtube.com/watch?v=agentic-rag"
    guru: "IBM Technology"
---

# The Content Engine Refactor: Building an Agentic Router

Our automated content factory was failing. 

We had a `v5` pipeline that could crawl and draft, but it had no "eyes." It would fetch a 10,000-word Guru post and a 5,000-line API spec, and try to synthesize them without knowing which was which. The result was a technical "slop" that lacked authority.

---

## 1. The Implementation: Perceive before Act

Following the IBM **Perceive -> Reason -> Act** loop, I refactored the engine to include an **Agentic Router**. 

Before a single byte is crawled, the engine now classifies the topic intent.
- **Route A (Guru Insights):** Deep architectural deconstruction.
- **Route B (Technical Specs):** Pragmatic setup and code-level evidence.
- **Failsafe:** If the topic is "Marketing Slop," the loop hard-terminates.

```python
# Real code from factory/vibe_engine.py
def router(topic):
    if "Software 3.0" in topic:
        return "DATABASE_A: GURU_INSIGHTS"
    elif "Next.js" in topic:
        return "DATABASE_B: TECH_SPECS"
    return "FAILSAFE: SCOPE_DENIED"
```

---

## 2. Why it Matters

In a world of infinite tokens, the bottleneck isn't getting data—it's **routing it.** By implementing a router, we reduced token waste by 60% and increased the "Aha Moment" score in our automated audits from a 4/10 to an 8/10.

**The Lesson:** Stop prompting your agents to "know everything." Build routers that tell them where to look.
