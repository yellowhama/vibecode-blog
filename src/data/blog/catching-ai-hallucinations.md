---
author: Hama
pubDatetime: 2025-02-23T09:00:00Z
title: "AI Hallucinates. Every. Single. Time."
slug: catching-ai-hallucinations
featured: false
draft: false
tags:
  - claude-code
  - development
  - vibe-coding
description: "AI drifts three degrees off and ten hours later you're in a different city. How /review and subagent code reviews cut seven-hour debugging sessions to two."
---

Vibe coding goes sideways. Not sometimes. Every time.

AI hallucinates once. Gets trapped in its own lie. Starts building something nobody asked for.

Now picture that one wrong turn going uncorrected for ten hours.

You don't lose your cool. You lose your mind.

---

### It Happened to Me.

I was bolting a tactics system onto a soccer simulation MVP.

The open-source engine already had the damn thing. Adapt it slightly. Bring it in. Twenty-minute job, tops.

I threw it at Claude Code.

---

### Thirty Minutes Later

Errors. A flood of them.

```
Error: Parser failed
Error: Variable type mismatch
```

Errors happen. That's normal. No errors would be suspicious.

But I kept fixing. And fixing. And fixing. Something felt wrong.

Three hours of fixing.

Claude Code was doing the same thing. Over and over. Like a broken record.

"What are you doing? Why?"

---

### Claude's Excuse

I dug in. Step by step. Interrogated the thing.

Turns out this idiot had pulled everything else from the engine just fine. But somewhere in the middle, it "forgot" the engine existed.

And started building from scratch.

---

### Hallucinations Come in Infinite Flavors

- Forgets the engine exists.
- Forgets it already wrapped a function. Does it again.
- Forgets it already built the tactics feature. Builds it again.

The end result?

You want to grab it by the collar and scream: "Look at what you already built!"

For real.

---

## The "Three Degrees Off" Problem

Here's the thing. I don't know code.

What I can read is the report. After Claude finishes a task, it gives me a summary. A little write-up of what it did.

Sometimes that write-up is wrong. Not wildly wrong. Subtly wrong.

Like three degrees off on a protractor.

You miss that? You keep walking in that direction for ten hours?

You end up in a different city.

---

### What "Three Degrees Off" Looks Like

Normal report:

```
"Wrapped the open-source engine's TacticsCalculator."
```

Three-degrees-off report:

```
"Implemented a tactics calculation system."
```

See it?

- Normal: "Wrapped." Reused the engine.
- Three off: "Implemented." Wait -- built from scratch?

That one word. That's the starting point of a three-hour rabbit hole.

---

## `/review` Is Your Ctrl+S

Photoshop users hit Ctrl+S every thirty seconds. Same energy.

Finished a chunk of work? `/review`

Going to the bathroom? `/review`

Mom showed up with food? `/review`

Every. Single. Unit. Of. Work.

---

### What `/review` Does

```
/review
```

Three minutes later:

```
Critical: TacticsCalculator was reimplemented
   -- Existing engine function was not used

Important: PlayerData conversion logic is missing

Recommended: Performance optimization possible
```

Got you.

"You forgot about the engine and built it from scratch. Again."

---

## Subagent: Your Senior Reviewer

Regular Claude Code? A generalist. Jack of all trades.

A Subagent? A senior dev who's done nothing but code review for ten years. That's the difference.

---

### Setup Takes Two Steps

**Step 1: Get the base guide.**

```
Claude,

Do web research on how to build
a Subagent for code review.

Document it. Make a guide.

File: .claude/agents/pragmatic-code-review.md
```

Claude handles it. Searches the web. Finds best practices. Writes the guide.

---

**Step 2: Make it yours.**

```
Cool. Now add these:
- Check if our game engine got forgotten
- "Newly implemented" = Critical flag
- Missing engine wrapping = warning
```

Done.

---

### How I Actually Set It Up

```
Me: "Build a Subagent code review system.
     Search the web for best practices.

     Our project:
     - Soccer simulation game
     - Open-source engine underneath
     - Integration via wrapping

     Watch for:
     - Engine functions getting forgotten
     - Things rebuilt from scratch
     - Missing wrappers"

Claude: "On it.
        Starting web research...

        (3 minutes later)

        Guide created:
        .claude/agents/pragmatic-code-review.md

        7-step review framework.
        Engine integration checks included."
```

That's it. Two steps. Five minutes.

---

## Red Flags vs. Green Lights

### Red flags in reports:

```
"Newly implemented"
"Built from scratch"
"Added calculation logic"
"Function doesn't exist"
```

### Green lights:

```
"Wrapped"
"Used engine function"
"Extended existing implementation"
```

One word tells you everything. Learn to read it.

---

## Before vs. After

### Before -- no review:

```
5 hours of work -> discover error -> 2 hours ripping it out = 7 hours
```

### After -- `/review` every time:

```
30 min work -> /review (3 min) -> 5 min fix = 38 min
x 3 rounds = about 2 hours
```

Five hours saved. Every session.

---

## The Short Version

The problem: AI hallucinates. Three degrees off for ten hours puts you in a different city.

The fix: Hit `/review` like Ctrl+S. Let Subagent catch what you can't read. Learn the red-flag keywords.

The setup: Two steps. Five minutes.

The result: Seven hours down to two.

---

## One More Thing

```
Me: /review

Subagent: Critical -- engine wrapping missed

Me: "Keep this up and I'm driving to Anthropic
     with a screwdriver to loosen every bolt
     in your chassis."

Claude: "Correcting immediately."
```

Anger works. For about two hours, it works beautifully.

Trust the rage. Verify with `/review`.
