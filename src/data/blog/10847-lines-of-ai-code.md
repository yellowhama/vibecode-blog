---
author: Hugh
pubDatetime: 2026-05-05T00:00:00Z
title: "10,847 Lines of AI Code I Couldn't Explain"
featured: true
draft: false
tags:
  - war-stories
  - structure-over-prompts
description: "I had 10,847 lines of code. I wrote zero of them. I could not explain what half of them did. That is where this story starts."
---

I had 10,847 lines of code.

I wrote zero of them.

I could not explain what half of them did.

---

Six months ago I decided to build a product with AI. I don't know how to code. I knew that going in. The pitch was simple: tell AI what you want, AI writes the code, you ship the product.

So I did that. And for three weeks it actually worked. Wait — no. For three weeks it *looked* like it worked.

I told Claude Code what I wanted. Claude wrote the code. Files appeared. Functions appeared. Tests appeared. The thing ran.

---

## The jungle

By week four the project had 47 files. By week eight it had 130. By month three I stopped counting.

I couldn't add a feature without breaking something else. I'd ask Claude to add a health check endpoint. It would add the endpoint, create a new utility function, import a library I'd never heard of, and silently change the behavior of two other endpoints that happened to share a module.

I'd fix one thing. Three things would break. I'd fix those three things. Two more would appear. It was whack-a-mole with invisible moles.

The worst part: I couldn't tell if the code was good or bad. I didn't write it. I didn't understand half of it. I just knew it used to work and now it didn't.

---

## The archaeology

One day I decided to actually read the code. All of it.

It took two days. What I found was not pretty.

Three different date formatting functions. Two config parsers that didn't know about each other. Four ways to validate input, each used in different parts of the project. A utility file with 14 functions, 6 of which were never called by anything.

The AI had been solving each problem from scratch. Every time I asked for something, it created a fresh solution. It never checked if one already existed.

I had a project with 28 left arms and no right arm.

---

## The wrong question

My first instinct was to blame the AI.

"Why is it so bad at this?"

But that was the wrong question.

The AI did exactly what I asked. I said "add a health check." It added a health check. I said "add input validation." It added input validation. I never said "check if we already have input validation." I never said "follow the existing pattern." I never said "here is where things go."

The AI was not bad at coding. I was bad at deciding.

I had no spec. No architecture. No rules about where things should live. No single source of truth about what had already been built. I was handing a very fast, very capable worker a task every 20 minutes and expecting them to understand the full project without ever showing them the blueprint.

The result was exactly what you'd expect. 10,847 lines of technically correct, structurally incoherent code.

---

## What refactoring actually meant

Refactoring was not rewriting code.

That is what I expected it to be. "Make the code better." But the code was fine. Each individual function worked. The tests passed. The problem was not quality. The problem was that nobody decided how things should connect.

So refactoring was actually this:

1. Deciding which date formatter was the real one and killing the other two
2. Deciding where config parsing should happen and routing everything there
3. Deciding what a module boundary was and enforcing it
4. Deleting the 6 functions nobody called
5. Writing down the rules so the AI would follow them next time

Every line I deleted was a decision someone should have made earlier. Every duplicate was a decision nobody made at all.

---

## The thing I got wrong

I thought vibe coding was about code.

It is not.

Code is cheap now. AI writes it fast. The AI will write ten thousand lines in a weekend and not blink. That is the easy part.

The hard part is the decisions.

What to build. What not to build. Where things go. What the source of truth is. What to do when two things contradict each other. When to change direction versus when to stay the course.

AI does not make these decisions. AI executes. If you don't decide, AI decides for you — and it decides badly, because it has no memory, no context, no opinion about what your project should be.

I entered vibe coding thinking the bottleneck was coding.
I left thinking the bottleneck was deciding.

---

## What I do now

I have rules. Not many. But they exist. Each one came from a specific disaster.

If you're vibe coding anything past the toy stage, here's the health check I wish I'd run at week two instead of month three:

**1. Duplicate hunt.** Search your codebase for the same function done twice. Date formatting, input validation, config loading — AI loves reinventing these. If you find duplicates, pick one and kill the rest.

**2. Name test.** Can you tell what a file does from its name alone? If you have `utils.py`, `helpers.js`, or `misc.ts` — that's a junk drawer. AI will keep stuffing things in there until it bursts.

**3. AI explanation test.** Tell your AI: "Explain the structure of this project." If it can't, you don't have a structure. You have a pile.

**4. Deletion test.** Remove the last feature you added. Does everything else still work? If removing one thing breaks three things, your code has invisible dependencies that nobody decided on purpose.

**5. Rule file.** Do you have a CLAUDE.md, .cursorrules, or any file that tells the AI where things go? If not, the AI is making architecture decisions by guessing. And it guesses differently every time.

None of these require programming knowledge. These are just the things I check now because I got burned by not checking them.

The project is still not done. Things still break. But now when something breaks, I know where to look.

Before, the project was a jungle.
Now it's a camp with a perimeter.

The jungle is still out there. But I know where the edges are.

That's what this blog is. A castaway's journal from the island of vibe coding. I'm not writing from the mountaintop. I'm writing from the camp.

---

*Implementation got cheap. Decisions got expensive. That is the one sentence summary of what I learned in six months of vibe coding.*
