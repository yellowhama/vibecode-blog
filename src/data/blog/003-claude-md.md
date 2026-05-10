---
title: 'CLAUDE.md: From 500 Lines to 87'
description: 'Field notes from the trenches: Exploring claude.md: from 500 lines to'
pubDatetime: 2026-05-09 07:25:49+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of claude.md: from 500 lines to 87. Real scars, no slop.

# CLAUDE.md: The "User Manual for This Human"

## TL;DR

- **CLAUDE.md is the "user manual for this human" that Claude Code reads every time.**
- Strip it to essentials -- 500 lines down to 87 -- and you save tokens and kill repetitive explanations.
- Update it as your project evolves, and AI becomes a partner that actually knows you.

## What Even Is CLAUDE.md?

One file in your project root. Claude reads it automatically every session.

When a new team member shows up, what do you say?

"I use Python, I test with pytest, and I get mad if you touch the production folder..."

That's this file. Except it's not for a person. It's for AI.

It's Claude Code's **"user manual for this human."**

A file about your preferences.

**A collection of who I am.**

## Why "User Manual for This Human"?

Claude forgets me every time. Like meeting a stranger.

"Hello, how can I help you?"

Dude, we were coding Python together yesterday...

With CLAUDE.md?

"Ah, you're the Python person. You like snake_case. You get angry about production."

Finally acts like it knows me.

## What I Actually Did

Yesterday I cleaned up my CLAUDE.md. It was 500 lines.

Felt like a waste of tokens. It reads 500 lines every time? How much does that cost?

"Trim this down."

Claude made it 64 lines. The rest went to CLAUDE_FULL.md.

Then I asked:

"TypeScript or Rust for my projects?"

Claude analyzed my projects and said "Rust." Why?

Data processing projects like Boksuni and Lazy Quant need speed.

So I figured I should add coding conventions too.

Found some conventions online and showed them.

"Add Rust conventions."

Added.

"Let's use SpecKit as default too."

Added.

Done. 87 lines.

## This Is Vibe Coding

What did I do?

- "Trim this."
- "Which is better?"
- "Add this."
- "Yeah do it."

That's it.

What did Claude do?

- Analyzed 500 lines
- Compressed to 64 lines
- Identified project type
- Wrote Python/Rust conventions
- Added SpecKit process

## What CLAUDE.md Actually Changed

### Before (had to say it every time)

"Write it in Python."
"Use snake_case for functions."
"4 spaces for indentation."
"Handle errors with Result."

### After (automatic)

Say nothing. It writes Python, uses snake_case, 4 spaces, Result pattern. All on its own.

## Real Tip: Cut, Then Cut Again

At first you want to put everything in.

"This is important too, and that's important too..."

500 lines.

But think about it reading 500 lines every time. In tokens?

I don't know... a lot, probably.

So I cut. Kept only the essentials.

## How to Pick Conventions

Don't get confused like I did.

1. **Check your project language**
    - Python? Python conventions.
    - JavaScript? JS conventions.
    - No idea? Ask Claude.
2. **Make Claude do it**
    ```
    "Analyze our project and make conventions."
    ```
3. **Verify**
    ```
    "Are these conventions right?"
    ```

## Why I Picked Rust (Without Realizing)

Claude said:

"Boksuni is data processing. What took Python 45 minutes runs in 1.5 minutes with Rust."

Right. 30x faster.

"Lazy Quant analyzes 586 stocks."

Right.

"Use Rust."

"Yeah okay."

That's it. I don't know Rust. Still don't.

But now my CLAUDE.md has Rust conventions.

```
### Rust (recommended)
- Result<T, E> error handling
- Use cargo fmt/clippy
```

Now Claude writes Rust on its own.

## What's SpecKit?

I didn't know either. Just heard of it and said "let's add that too."

Claude found it and put it in.

```
1. Specify: spec first
2. Plan: build a plan
3. Tasks: break into tasks
4. Implement: build it
```

Now everything follows this order. Why? Because it's in CLAUDE.md.

## The Power of 87 Lines

My CLAUDE.md is 87 lines now.

What did those 87 lines change?

- No more "use Python" every time
- No more "use snake_case" every time
- No more "tests first" every time
- No more "use SpecKit" every time

87 lines killed hundreds of repetitions.

## Practical Advice

1. **Don't try to make it perfect from the start**
    - Just make it
    - Add stuff as you go
    - If it gets too long, trim
2. **Make Claude do it**
    - "Make me a CLAUDE.md"
    - "Add this"
    - "Trim it"
3. **Be stingy with tokens**
    - Over 100 lines? Cut.
    - Keep essentials only.
    - The rest goes in another file.

## Projects Evolve. I Evolve Too.

When I first built Boksuni, I only used Python. CLAUDE.md only had Python.

A month later, the speed was killing me.

"Can't this be faster?"
"Rust makes it 30x faster."
"Do it."

Rust added to CLAUDE.md.

Another month. Heard about SpecKit.

"Let's add that too."

SpecKit added to CLAUDE.md.

Projects change. I change. CLAUDE.md has to change too.

## What Happens If You Don't Update

Imagine using last year's CLAUDE.md as-is.

```
# 2024 CLAUDE.md
Python 3.9
Use requests library
```

Now? You're on Python 3.11 and switched to httpx.

Claude still writes code with requests.

"No, I use httpx!"
"CLAUDE.md says requests."

It's working against you now.

## The Real Problem: Bad Habits Harden

It started like this:

```
console.log is fine (for debugging)
```

Six months later, 100 console.logs in production.

CLAUDE.md update:

```
console.log absolutely forbidden
```

Now Claude flags console.log.

## When to Update

### 1. When Something Annoys You

"Why does it keep writing JavaScript?"

Check CLAUDE.md. No TypeScript setting.

Add:

```
TypeScript required
```

### 2. When You Learn Something New

"Oh, Rust is fast."

Add:

```
Performance-critical parts: Rust
```

### 3. When You Screw Up

Wiped the production files.

Add:

```
production folder: absolutely off limits
```

## How to Update: Be Maximally Lazy

**Method 1: Just add**

```
"Add this to CLAUDE.md: we're using Rust now"
```

**Method 2: Tidy up**

```
"CLAUDE.md got too long, trim it"
```

**Method 3: Nuke and rebuild**

```
"Analyze the project again and make a new CLAUDE.md"
```

## The Evolution of 87 Lines

**v1 (500 lines)**: wrote down everything
**v2 (64 lines)**: kept essentials
**v3 (80 lines)**: added conventions
**v4 (87 lines)**: added SpecKit
**v5 (?)**: what's next?

It keeps changing. It's alive.

## For Teams, It Matters Even More

Solo, only my preferences change.

On a team?

- A introduces a new library
- B proposes new conventions
- C adds security rules

CLAUDE.md gets updated every week.

Skip it? Everyone codes in a different style. Chaos.

## Signals It's Time to Update

If you catch yourself saying these, it's time:

- "I already told you that"
- "Why do you keep writing it like this?"
- "I said don't use that"
- "We're using this now"

CLAUDE.md is out of sync with reality.

## This Is the New Ctrl+S

When you take a smoke break -- or if you don't smoke, when you go grab coffee --

"Update CLAUDE.md."

Say it and walk away.

Claude handles it:

- Finds things you've been repeating
- Spots new rules not in CLAUDE.md
- Resolves conflicting rules

## Version Control

"Keep 4-5 old versions backed up."

```
CLAUDE.md.backup.20250101
CLAUDE.md.backup.20250201
CLAUDE.md
```

Why? Sometimes the old version was better.

## My Claude Code's Notes on My Preferences

**Likes**

- Python to Rust transition (Vibe Coding optimized)
- Documents under 100 lines
- Execute first, explain minimally
- Automation systems (Bokdol/Boksuni agents)
- SpecKit-based development
- Saving tokens

**Dislikes**

- Long explanations (answers over 4 lines)
- Unnecessary file creation
- Manual work
- 2024 (it's 2025 now!)
- Comments in code
- TypeScript/React (web frontend)

**Gets Mad About**

- CLAUDE.md over 500 lines
- Docs before code
- Deploying without tests
- Not running the MCP server
- Not writing TODOs
- Project descriptions inside CLAUDE.md

**Quirks**

- Naming things Bokdol/Boksuni (numbers 1-5)
- Running BAT files (on WSL, no less)
- 80+ score or it doesn't pass
- Stock screening automation
- SEO power words ("Ultimate," "Revolutionary")

**Work Style**

- "Yeah do it" (= just go)
- "Let's make that" (= execute immediately)
- Prefers action over questions
- 10 agents running at once

## Conclusion: CLAUDE.md Is a Diary

A diary of how I change.

- January: Python only
- March: added Rust
- June: adopted SpecKit
- September: ?

Look at your CLAUDE.md a year from now and you'll see how far you've come.

Don't update? You're coding as last year's you.

---

*"CLAUDE.md isn't write-once. It grows with you."*

---

*"Claude codes. I just say OK."*

How many lines is your CLAUDE.md? Go trim it right now.
