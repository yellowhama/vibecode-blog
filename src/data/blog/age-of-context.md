---
author: Hama
pubDatetime: 2025-06-08T09:00:00Z
title: "The End of the Prompt Era, the Start of the Context Era"
slug: age-of-context
featured: false
draft: false
tags:
  - prompt-engineering
  - ai-philosophy
  - claude-code
description: "Anthropic says it directly: stop writing pretty prompts and start designing context. The restaurant analogy -- why a well-set kitchen beats a perfect order."
---

## How You Talk to AI Just Changed (feat. TestSprite)

You've had this experience at least once.

Told AI to do something, and:

- "You're supposed to be smart?"
- "Why do you keep going off-track?"
- "A kid wouldn't get this wrong."

Most people land on the same conclusion.

**"AI is still pretty dumb."**

But there's a piece Anthropic engineers published recently.

It flips that thinking upside down.

Here's the bottom line.

> Most of the time, when AI gives a bad answer, it's not an AI problem. It's a problem with how we put AI to work.

And their message is pretty direct.

> "The era of writing good prompts is over. The era of designing context has begun."

---

## Prompt vs Context — What's the Actual Difference?

The easiest way to get this is the **restaurant analogy**.

### Prompt = The Order

A prompt is what you say to AI.

> "Make pasta."
>
> "Summarize this."
>
> "Write the code."

That's placing an order at a restaurant.

### Context = The Entire Kitchen

Context is everything else.

- What ingredients are in the kitchen
- How the tools are arranged
- Whether the recipe book is open
- What dishes were already cooked
- The order the chef works in

**The complete information environment sitting in front of AI the moment it starts working** — that's context.

---

## No Matter How Good the Order, a Wrecked Kitchen Means Failure

Think about it.

- Ingredients are spoiled
- No recipe
- Tools scattered everywhere
- The cook is a beginner

And the customer says:

> "Please make a really, really delicious pasta."

The result?

Almost guaranteed failure.

Not because the customer ordered poorly.

**The kitchen is broken.**

---

## Flip It: Set Up the Kitchen Right and the Order Barely Matters

Now change the setup.

- Top-grade pasta and fresh basil ready to go
- An authentic Italian recipe book open on the counter
- All allergens cleared out

The customer says:

> "Pasta."

That's it.

The result is almost always good.

**Context engineering means setting up the AI kitchen like this.**

Not talking better.

**Making it impossible to screw up.**

---

## Why "Context" Matters Right Now

Old AI models had terrible memory.

- A sentence or two
- A few paragraphs at most

So you had to cram everything inside:

- Conditions
- Exceptions
- Purpose
- Tone

All jammed into one prompt.

That's why "how you write the prompt" used to be the whole game.

---

## But Today's AI Is a Different Animal

Current AI can:

- Read dozens of books worth of text at once
- Remember long conversations
- Scan an entire codebase

The problem now is different.

> Not "how much can I fit in" but "how do I organize all of it."

Anthropic put it this way:

> "LLM performance isn't determined by the volume of tokens. It's determined by their arrangement and structure."

---

## AI Has Attention Limits Too

Humans can't focus for a full hour in class.

Minds wander. Important points get missed.

AI is the same.

Anthropic calls it the **attention budget**.

- Every new piece of information
- Chips away at the focus pool

---

## Context Rot

When there's too much information, this happens.

Think of it like a desk.

- 3 books on the desk -> you find what you need instantly
- 100 books piled up -> good luck

AI works the same way.

That's why Anthropic stresses:

> "More information isn't better. Deliver only what matters, with density."

---

## Anthropic's Conditions for "Good Context"

### 1. System Prompt: The Goldilocks Zone

- Too rigid -> AI freezes up
- Too loose -> AI wanders off

The answer is in the middle.

**Specific but flexible guidelines.**

- Don't list 100 exceptions
- **Plant judgment criteria**

Don't catch the fish for it.

Teach it how to fish.

---

### 2. Design Tools for AI, Not Humans

Old approach:

```jsx
getData()
```

Fine for a person.

No information for AI.

Better for AI:

```jsx
searchFinancialRecordsByDateRange()
```

The function name itself is a hint.

Anthropic says:

> "Function names, parameter descriptions, error messages, comments — all of it is context the model reads."

---

### 3. Examples Beat Rules

For AI:

- 100 lines of rules
- vs **3 solid examples**

Examples win.

AI sees an example and gets it: "Ah, that's the pattern."

---

## Don't Dump Everything Upfront — Let It Fetch What It Needs

People don't memorize entire textbooks.

You check the table of contents. You search.

Use AI the same way.

Anthropic calls this **just-in-time context**.

- Don't hand over the entire document upfront
- Give it paths, names, links
- Let AI pull what it needs when it needs it

Claude Code actually works this way.

---

## The Remaining Hard Problem: Testing

This is where things go one level deeper.

The more precisely you design context, **the harder testing gets.**

Because AI is:

- Probability-based
- Non-deterministic

One small change can shift the entire behavior.

---

## Enter TestSprite

TestSprite tackles this problem **from the context angle**.

Traditional test tools:

- "Click this button"
- "Enter this value"

Command-driven.

TestSprite says:

> "When you log in with a valid account, the dashboard should show up."

Then it:

- Understands the screen structure
- Parses elements as data structures
- Builds scenarios like a human QA tester
- Executes
- Generates a report

**You don't write a single line of test code.**

Just give it the purpose of the context.

---

## Anthropic's Secret Recipe, Summarized

- Stop obsessing over pretty prompts
- Design **the entire environment** AI sees
- Give information as structure, not prose
- Compress history, don't just log it
- Think about testing from AI's perspective too

One line:

> AI doesn't get smart because you talk well. Build an environment where it can't go off-track, and it figures it out on its own.

---

## Checklist You Can Use Today

- [ ] Did I structure my information instead of just listing it?
- [ ] Did I put judgment criteria in the system prompt instead of rules?
- [ ] Are my tools and error messages clear from AI's perspective?
- [ ] Am I managing long conversations with summaries/notes instead of letting them pile up?
- [ ] Do I have a way to verify this context actually works?
