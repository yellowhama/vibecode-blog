---
title: 'Claude Isn''t Stupid. You Are.'
description: 'Field notes from the trenches: Exploring claude isn''''''''''''''''''''''''''''''''t'
pubDatetime: 2026-05-10 13:24:35+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of claude isn't stupid. you are.. Real scars, no slop.

## TL;DR

- **Claude isn't dumb. Your prompt is dumb.**
- Tone. Quantity. Scope. Structure. Why. Five knobs. Turn them right and the output transforms.
- One-shot prompting is how you fail. Draft. Revise. Finalize. That's the answer.

---

## Why This Exists

I juggle models these days. Vibe Coding with three at once.

Gemini 3. OpenAI's Codex CLI. Claude Opus 4.6.

I'll say it straight. **Opus 4.6 is the best.**

It reads context like no one else. Gets what I want on the first swing. Clean code. Other models wander off into the weeds. Opus 4.6 stays on target.

But I had a problem.

Some days the output was brilliant. Other days it felt broken. Same model. Wildly different results.

Then it hit me.

**Anthropic had been dropping hints the whole time.**

Blog posts. Docs. X threads. YouTube videos. Twelve months of breadcrumbs scattered everywhere. And I'd been using the model raw. Like driving a race car in first gear.

So I went back and read everything.

The verdict? **Not a model problem. I was writing garbage prompts.**

---

## 1. Tone: Talk to It Like a Teammate

First thing Anthropic stressed. Surprised me.

"Friendly, clear, direct tone gets the best results."

### Before

```
Fix this grammar now
```

Claude flinches. Gets cautious. Dances around the answer.

### After

```
Review the grammar in this sentence.
Goal: make it sound more professional and confident.
```

This isn't about being polite.

It's **meta-information**. You're telling Claude what job to do.

You don't scream at a teammate and expect good work. Same deal.

---

## 2. Three Ingredients: Verb + Quantity + Audience

Anthropic's framework. Tattoo it on your arm.

1. **Action verb**: Generate, Rewrite, Summarize
2. **Quantity**: How many
3. **Audience**: Who reads this

### Before

```
Give me some blog ideas
```

Passive. Vague. AI slop incoming.

### After

```
Generate 10 blog titles about remote work's impact on urban planning.
Audience: city officials and real estate developers.
```

Why this works:

- Quantity gives Claude a finish line
- Audience calibrates tone and depth automatically
- A verb locks in work mode

Quality jumps 2-3x. Not exaggerating.

---

## 3. The Box: Constraints Breed Creativity

### Before

```
Write a short story about a future detective
```

Infinite runway. Infinite means generic. AI slop.

### After

```
Under 500 words.
Style: Raymond Chandler.
Protagonist: robot detective investigating data theft on Mars.
Banned word: 'cyber'
```

Why?

**A tight box beats an open field every time.**

AI thrives inside constraints. Wide open? It regresses to the mean.

---

## 4. Three Steps: Draft. Revise. Execute.

You want to nail it in one prompt. I get it. Feels efficient.

It's not. That's how you fail.

Anthropic says do it in three.

### Step 1: Draft

```
Create a detailed outline for a report on 4-day workweek benefits
```

### Step 2: Revise

```
Good. Add reduced employee turnover to section 2.
```

### Step 3: Execute

```
Write the full report from this revised outline.
```

Why?

It **keeps the AI from drifting or guessing halfway through.**

Seems slower? No. Faster than reprompting ten times.

---

## 5. Structure: Tell It the Shape

One of the strongest rules. Period.

### Before

```
Tell me about the Apollo missions
```

You get a wall of text. Useless.

### After

```
Apollo 15, 16, 17 in a markdown table.
Columns: Launch date / Crew / Key achievements
```

AI is far better at **structured output** than clean prose.

Tables. JSON. YAML. Demand a shape and quality jumps. Anthropic tested this internally.

---

## 6. Why: Give It the Reason

### Before

```
5 marketing slogans for a coffee brand
```

No context. Brand values? Target? USP? Claude's flying blind.

### After

```
5 slogans for a new coffee brand.

Key points:
- Ethically sourced from small independent farms
- Target: eco-conscious millennials
- Reflect quality and sustainability

Why? Our core brand identity is 'sustainability.'
```

One line of "Why" and Claude locks in.

"Got it. Emotional tone goes here. This value is central."

Output accuracy? 2-3x difference. One line.

---

## 7. Length: You Set the Dial

Anthropic calls it "verbosity control."

### Expert Mode

```
Explain photosynthesis in detail for a college biology student.
Think step by step for accuracy.
```

### Brief Mode

```
Explain photosynthesis. Concise. Bullet points.
```

### Five-Year-Old Mode

```
Explain photosynthesis to a five-year-old.
```

**Length and depth are yours to decide.** Don't decide? Claude decides for you. That's why you hate the output.

---

## 8. Scaffolding: Hand It a Template

Brutally effective. Every single time.

### Before

```
Summarize this article
```

### After

```
Summarize using this format:

Core argument: (one sentence)
Key evidence: (3 points)
Conclusion: (one sentence)

[paste article]
```

Give it a mold. It fills the mold.

AI follows structure like religion. Two days of frustration? Gone.

---

## 9. Power Words: Cheat Codes

Claude trained on a mountain of text about AI.

Certain words flip certain switches.

### Think step by step

```
Think step by step.
```

Logical errors drop. Reasoning sharpens. Code catches more edge cases.

### Critique your own response

```
Critique your own response.
```

Self-verification kicks in. Catches mistakes in the first draft.

### Adopt the persona

```
Respond as a [field] expert.
```

Domain vocabulary and frameworks activate.

Memorize these three. They work.

---

## 10. Divide and Conquer

Anthropic says this is the single most common mistake.

### Before

```
Write me a business plan
```

Ten pages from one prompt? That's a guaranteed disaster.

### After

**Step 1: Blueprint**

```
Detailed table of contents for a specialty coffee shop business plan.
```

**Step 2: Section by section**

```
Write the Executive Summary.
```

```
Write the market analysis.
```

**Step 3: Integration**

```
Review everything for tone consistency and contradictions.
```

Think conductor, not soloist. Assign parts. Merge at the end.

---

## Full Example

### Before

```
Tell me about Stoic philosophy
```

### After

```
Respond as a philosophy professor.

Preparing a 1-hour intro lecture. Students know nothing.

Create an outline with 3 main sections.
- Introduction, body, conclusion
- Nested bullet format

Each major point:
- One Stoic philosopher (e.g., Seneca)
- Their one core idea

Tone: accessible and engaging.
```

That's it. Nothing more.

---

## The Point

Claude doesn't understand you?

Writes bad code?

Too verbose?

**Nine times out of ten, it's not the model. It's your prompt.**

Ten rules:

1. Treat it like a teammate
2. Verb + quantity + audience
3. Build a box
4. Draft. Revise. Execute.
5. Specify the structure
6. Explain the Why
7. Control the length
8. Give it a template
9. Use power words
10. Break big jobs into parts

That's the whole list.

You're not handing off work to AI. You're **designing an environment where AI does its best work.** That's real productivity.

---

*"Claude isn't stupid. Your prompt is."*
