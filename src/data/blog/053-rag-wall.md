---
title: "Day 247: The Next.js 15 Wall and the Warden's Watch"
pubDatetime: 2026-05-14T19:00:00Z
description: "Real field notes from the trenches: Dealing with Next.js 15 breaking changes and why manual RAG still beats autonomous slop."
draft: false
tags: ["fieldlog", "nextjs", "musu", "scars"]
---

# Day 247: The Next.js 15 Wall and the Warden's Watch

The "Vibe" hit a brick wall today. It wasn't an AI hallucination—it was a version bump.

I was pushing the latest log streaming feature for MUSU. Everything worked on the dev server. I pushed to production, and the logs route went dark. **HTTP 500.** 

---

## The Scar: Async Params in Next.js 15

If you're vibe coding without reading the migration guides, Next.js 15 will destroy you. I spent three hours hunting a ghost in `src/app/api/bridge/tasks/[id]/logs/route.ts`.

The culprit? `params` is now a **Promise**. 

```typescript
// THE BUG (Commit 358fb4c)
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // <-- THIS BROKE
) {
  const taskId = params.id; // Sync access failed
```

I had to refactor the entire bridge API to handle async params. It felt like "slop" because the AI didn't catch the version mismatch until I forced it to look at the build logs.

---

## The Warden: Enforcing Architecture over Intent

While fixing the API, my agents tried to "help" by rewriting the `warden.repo.ts`. They wanted to add a complex caching layer that we didn't ask for. 

I saw the proposed change in the terminal: **+450 lines of unsupported machinery.**

This is where the **MUSU Warden** philosophy saved me. I didn't let the agent "vibe" out a solution. I enforced a strict **SRM Gate**:
1. **Structure:** Does this repository follow the existing Supabase service pattern?
2. **Rhythm:** Can I read this connection logic in 5 seconds?
3. **Mouthfeel:** Does it sound like our technical canon?

The agent failed the gate. I rejected the PR. I manually wrote the 15-line fix instead.

---

## Forged in the Drift

Today's lesson was expensive (80,000 tokens of debugging). But it proved why I'm building MUSU.

We don't need agents that write more code. We need agents that **respect the boundaries** we set. I'm taking the scars from today and turning them into new Warden rules.

**The Lesson:** The tighter the cage, the faster the bird flies.

---
[Survive the AI ocean with MUSU Engine](https://musu.pro)
