---
title: "014 Write It Down. 90% Solved. — Kidlin's Law for AI Coding"
description: "Field notes from the trenches: Exploring 014 write it down. 90% solved. — kidlin's law for ai coding through the lens of vibe coding."
pubDatetime: 2026-05-09T08:19:14.000Z
featured: false
draft: false
tags:
  - vibe coding
  - field report
ogImage: ""
---

> **TL;DR**: An excavation of 014 write it down. 90% solved. — kidlin's law for ai coding. Real scars, no slop.

# Write It Down. 90% Solved. — Kidlin's Law for AI Coding

## TL;DR

- **Problem**: During development, you mark things "done" but **never document the connections**. Systems end up isolated.
- **Fix**: **Write down what's not connected** in the docs. Let AI read it and figure out the next steps and requirements on its own.
- **Method**: **Six-step checklist prompt** (log work → next steps → check requirements → reuse internal code → check external libraries → execute).
- **Result**: A three-day integration problem solved in one hour. Average work time **3 hours → 45 minutes**. Error rate **40% → 5%**.

---

## The Missing Link I Found During Development

Last week of September. Building a game.

- Sept 29: Character creation screen. Done.
- Sept 30: Graduation system. Done.
- Oct 1: Full integration test.

Then it blew up.

"Wait, where did the graduated player go?"

The ending screen worked fine. But the graduated player wasn't in the team roster.

Checked the docs. Here's what they said:

**Graduation System: Done.**

- Ending screen complete. Stats displayed.

**MyTeamScreen: Not done.**

- Backend ready. UI not built.

The two systems didn't know about each other.

There was no code to pass graduation data to MyTeam.

Why?

Because on September 30th, I finished the graduation system, checked it off as "done," and **never wrote down what still needed to be connected.**

---

## Kidlin's Law 2.0: Problem-Solving for the AI Era

In the 1950s, engineer Charles Kettering said:

"Write a problem down on paper and it's half solved."

The moment you write a problem down, your brain switches to organizing mode. Vague things become concrete. What you don't know becomes clear.

But in the AI era, update the law:

**"Write the problem down and let AI read it. 90% solved."**

Because:

- AI can't read minds.
- AI doesn't catch implicit connections.
- "It should obviously know" doesn't work.

---

## The Six-Step Checklist Prompt

4am. Reorganizing the problem. That's when I built this prompt.

Post 010 said "AI writes the docs." True. **But what to write down? That's on you.**

Copy this. Use it now:

1. Check off what you just did and log it.
    - What's done / what improved / what's still lacking
2. List the next task and its requirements.
    - Next step / resources needed
3. Check if the requirements exist.
    - Libraries, APIs, files / if missing, how to get them
4. Check what's already in the project.
    - Similar features built? / reusable code?
5. Check external libraries.
    - Usable features / file paths and usage
6. If ready, start. If not, prep first.

That's the whole post.

---

## Real Example: Game Dev, Graduation System to Team Integration

Here's the point.

In step 1, when you log "what I just did," the **gaps show themselves**.

Something like: "Graduation system has a screen but no MyTeam integration."

Step 2 turns that gap into the **next task**.

"Build add_graduated_player function."

Step 3 checks if you have what you need.

Libraries, APIs, files. If not, how to get them.

Step 4 digs through your own project.

Similar features? Reusable code?

Step 5 checks external libraries.

If something exists, log the path and how to use it.

Step 6. If everything's ready, go.

If not, prep first.

This six-step prompt isn't just a checklist.

**It forces connections into the open. Problem → Prep → Execute. The loop runs itself.**

- Step 1: Graduation system done. But no data save. No integration.
- Step 2: Need PlayerData add function, save call on graduation, MyTeam UI.
- Step 3: MyTeamData and SaveManager exist. UI needs building.
- Step 4: TeamScreen layout and PlayerCard component are reusable.
- Step 5: No external library needed. Godot's built-in features are enough.
- Step 6: Ready. Start building.

**One hour later, fully integrated.**

Graduated players showed up in MyTeam. Displayed on the UI.

---

## The Documentation Loop That Speeds Up AI Collaboration

This is Kidlin's Law 2.0 working in practice.

Before work: Check the spec.

During work: Execute.

After work: Update the spec. (Prep next steps.)

Repeat.

Run this loop and:

- AI doesn't lose context.
- Duplicate work disappears.
- External resources get used efficiently.
- Next task starts faster.

---

## Before vs After

**Without it (just checking boxes):**

- Same feature built 4 times.
- Wandering around looking for files.
- Duplicate open-source installs.

Average: 3 hours. Error rate: 40%. Rework: 2-3 times per week.

**With the six steps:**

- Extend existing code.
- File locations and integration points all recorded.
- Open source installed once.

Average: 45 minutes. Error rate: 5%. Rework: 0-1 times per week.

---

## How to Start

**Three key commands:**

- Before work: "Check the spec and prep for [task]."
- After work: "Check off what I just did. Prep the next step."
- When stuck: "Anything in our project or libraries I can use?"

**Building the habit:**

- Day 1-2: Consciously say "Run the six steps."
- Day 3-4: AI starts asking "Step 1 first?"
- Day 5-7: Auto-check. Auto-update.

One week and it's automatic.

---

## Write It Down. Let AI Read It. 90% Solved.

Docs aren't a one-time thing.

Every task: check, update, write down the connections.

That's how docs become a living map of the project.

AI reads that map. Knows where you are, what needs doing, and how to do it.

**That's Vibe Coding.**

---

## Kidlin's Law, Upgraded

- Original (1950s): "Write the problem on paper. Half solved." (50%)
- AI version (2025): "Write it down. Let AI read it. 90% solved."

The last 10% is human.

- Final decisions.
- Creative direction.
- Edge-case judgment.
- The gut calls.
