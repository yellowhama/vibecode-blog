---
author: Hama
pubDatetime: 2026-03-01T10:00:00Z
title: "Everything Broke Monday Morning"
slug: everything-broke-monday
featured: false
draft: false
tags:
  - vibe-coding
  - act-1
  - english
description: "Monday morning. Made coffee. Turned on the monitor. All five agents were dead. Over ten thousand lines of code. Almost half was duplicated. And a shell injection wide open for six months."
---

Monday morning.
Made coffee. Turned on the monitor.

All five agents were dead.

They were running Friday evening.
I changed something Saturday. Don't remember what.
Didn't touch it Sunday.
Monday morning. Nothing works.

Error message showed up.
Read it. No idea.
Showed it to Claude. "Why is this happening?"
Claude fixed one. One agent started.
But fixing that one killed another.

I've seen this pattern three times now.
Fix one, another breaks.
Fix that, the first one breaks again.
Round and round.

---

Opened the code.

Can't read it. But I can scroll.
Scrolled. And scrolled. Didn't end.

Over ten thousand lines.
10,847 to be exact.

When I started six months ago, how many lines was it?
Don't remember. Maybe a few hundred?

Six months of "add this too" and "build that too."
AI built everything I asked for.
New files every time. New functions. New modules.

Nobody said "clean this up."
Not me. Not the AI.
It just piled up.

---

Asked Claude. "Analyze this code."

Results came back.
Almost half was duplicated. 4,200 lines.

Five agents had built the same function five different ways.

Three date formatters.
One does `YYYY-MM-DD`. One does `MM/DD/YYYY`. One does Unix timestamps.
All three format dates. All three built by different agents.
None of them knew about the others.

Two config parsers.
One reads JSON. One reads environment variables.
Same config, two different methods.

Four ways to validate input.
Every agent had its own way of checking "is this correct?"

Why did this happen?
Simple.

I told Agent 3 "make a date format function."
It did.
Next week I told Agent 5 "handle the dates."
Agent 5 didn't know what Agent 3 built.
So it built another one.

Six months of this.
Built the same thing five times and nobody noticed.
Not the AI. Not me.

Why?
AI doesn't remember all existing code.
Every conversation starts fresh.
It doesn't ask "should I use the one that already exists?"
It just makes a new one.

And me?
I can't read code, so I can't tell if something's duplicated.
It ran, so I thought it worked.
There it is again. "I thought it worked."

---

It didn't end there.

Ran a security audit.
"Check this code for security issues."

Found one.
Line 847.
Shell injection.

What's a shell injection?
In simple terms:

The program takes external input and runs it as a system command.
No filter. No validation.
Someone types a system command into an input field, and it just runs.

In the "enter your username" box, type something like `; rm -rf /`
and the server deletes all its own files.

Extreme example, but that's the principle.
External input runs without checking.

AI wrote this code. I approved it.
I don't read every line.
Isn't that the whole point of vibe coding? AI writes, I steer.

But here's the thing.
I'm building a tool that connects three computers over a network.

Two desktops at home.
I want to work from my laptop outside and still use the machines at home.
That's why I started building this.

This tool goes over the network.
External connections come in.
Commands get sent.

Shell injection in that code?

That's not a bug.
That's a **door.**
A door anyone can walk through.

Anyone could get into my computer and run any command.
Delete files. Steal data. Anything.

That door was open for six months.

---

That evening I shut down all the agents.

Stared at ten thousand lines of code.
Thought: what do I do with this?

Fix it?
Fix what?
I don't even know where the problems are.
Fix one thing and another breaks.

Start over?
Build what, exactly?
I didn't even know what I was building.

Five agents.
4,200 lines of duplicate code.
A security hole.
Fix one thing, something else dies.

Six months of work sitting in front of me.
But I couldn't tell if it was work or garbage.

That's when I thought it for the first time.
"What the hell am I even building?"
