---
title: '026  Codex CLI Code Review'
description: 'Field notes from the trenches: Exploring 026  codex cli code review'
pubDatetime: 2026-05-10 13:24:33+00:00
featured: false
draft: false
tags: []
ogImage: ""
---

> **TL;DR**: An excavation of 026  codex cli code review. Real scars, no slop.

# Fix 13 — How I Stopped the Chain Reaction of Breaking Three Things Every Time I Fixed One

## The Game Finally Worked

Took a month.

Ripped apart a football simulation engine from GitHub, bolted it onto Godot 4.4, rewrote the calculation logic in Rust. Players move. Ball rolls. Goals go in.

Yes! The core of my football management game was alive.

Excited, I closed the game and reopened it.

```
Error: WeeklyCalendar.update() failed
```

Huh?

Went back to the main menu. Hit the New Game button.
Button didn't respond.

What the hell?

## Felt Like Fixing a Plumbing Leak

I only touched the simulation engine. Changed a few lines in TacticsManager.gd. That was it.

So why is the calendar breaking?
Why won't the button work?

Exactly like fixing a plumbing leak.

**First try**: Plug the bathroom pipe. Water starts dripping from the living room ceiling.
**Second try**: Patch the living room ceiling. Water seeps through the bedroom wall.

**Third try**: Seal the bedroom wall. Water comes out the kitchen sink.

Fix one spot, another one bursts.

## 13 Fixes, 13 Failures

Kept a log.

```
Attempt 1: Fix TacticsManager → WeekHub error
Attempt 2: Fix WeekHub → GameManager error
Attempt 3: Fix GameManager → PlayerStats error
...
Attempt 13: Fix PlayerStats → TacticsManager error
```

Attempt 13 brought me back to square one.

Stared at the wall.

33 Autoload singletons tangled like a spider web. GameCore.gd calls WeekHub.gd, WeekHub.gd calls TacticsManager.gd, TacticsManager.gd calls GameCore.gd again.

Circular dependency hell.

## The Moment I Saw the Real Problem

That's when it hit me.

**The problem wasn't that I couldn't write code. It was that I couldn't read code.**

AI writes code. Say "build a tactics system" and it delivers.
But it doesn't tell you why that code breaks something else.

What I needed was a senior developer. Someone looking over my shoulder every time I touch something, saying "hey, fix that and this other thing blows up."

But reality:

- No money
- No connections
- Can't even explain the problem properly

So I thought:

**What if I put a senior dev inside my terminal?**
Works 24/7, doesn't ask for pay, never complains.

## Turning Codex CLI Into a Senior Dev

Digging through Anthropic's GitHub repos, I found out Codex CLI could do code reviews.

But every tutorial online was complicated. Create a PR, set up Actions, write yaml files...

No. I just want to ask from the terminal. Right now.

So I kept it simple.

## First Try: Just Asking

Opened the terminal:

```
$ codex "review this code" TacticsManager.gd
```

Codex replied:

```
Code looks clean! You might want to make variable names more descriptive...
```

Useless. What I wanted was "fix this and here's what breaks."

## The Real Solution: Project Rules

So I gave Codex this:

```
$ codex "Analyze our project and create code review rules.

Project is a Godot+Rust football game
running on 33 singletons
targeting mobile 60fps.

Create rule files in .project/codex/:
- base.md (basic rules)
- game.md (game-specific rules)
- forbidden.md (banned patterns)

For forbidden.md, actually look at my code
and find dangerous patterns with specifics"
```

10 minutes later:

```
Codex: Project analysis complete. Rule files created.

Major issues found:
1. UI directly calling systems (7 locations)
2. Duplicate time management (3 locations)
3. Circular references (12 locations)

All documented in forbidden.md.
```

## The Landmines Codex Found in Our Project

Opened forbidden.md:

```markdown
# Banned Patterns (actual cases found)

## 1. UI directly calling systems

Found at WeekHub.gd line 45:
Bad: GameCore.start_week() direct call
Good: EventBus.emit_signal("week_started")

Why: Fix one spot, chain explosion

## 2. Duplicate time management

GameCore.gd and WeekHub.gd both managing time
→ Root cause of weekly training running twice

## 3. Synchronous I/O inside game loop

SaveManager.gd line 234: file save in _process()
→ Root cause of 60fps drops
```

Made from actually reading my code.

## Now Codex Was a Real Senior

From the terminal:

```
$ codex "review TacticsManager.gd"
```

Codex:

```
RED FLAG:

Line 45: Direct reference to GameCore.current_week
- Problem: WeekHub also manages current_week
- Impact: Double-speed time bug incoming
- Fix: Use EventBus.get_current_week()

If you run this as-is, 90% chance WeekHub.gd explodes
```

Finally. "Fix this and that breaks" -- told to me in advance.

## Three Questions I Ask Every Day

### 1. Before modifying a file

```
$ codex "I'm about to modify TacticsManager.gd, anything dangerous?"

Codex: Lines 45, 89, 134 are tangled with other files.
Especially line 45 — could blow up WeekHub. Be careful.
```

### 2. After modifying

```
$ codex "Check the files I just changed"

Codex: 3 files reviewed:
- TacticsManager.gd: Safe
- WeekHub.gd: DANGER (not using EventBus)
- GameManager.gd: WARNING (no error handling)
```

### 3. Periodic full sweep

```
$ codex "Any structural problems in src/core/?"

Codex:
3 structural issues:
1. Time management scattered across 3 locations
2. 12 circular references found
3. Same calculation logic duplicated 5 times
```

## Real Life: From 13 Walls Down to Zero

Old way:

```
Fix TacticsManager
→ Run
→ WeekHub blows up
→ Fix WeekHub
→ Run
→ GameManager blows up
→ (give up 3 hours later)
```

New way:

```
$ codex "I want to modify TacticsManager, what should I watch out for?"

Codex: WeekHub and GameCore could break.
      Here are 3 spots you need to fix together...

(done in 30 minutes)
```

## 3 Weeks In — Actual Numbers

**Before:**

- Fix time: avg 3 hours
- Error rate: 90%
- Gave up: 2-3 times per week
- Stress: through the roof

**After:**

- Fix time: avg 30 minutes
- Error rate: 10%
- Gave up: 0 times
- Stress: almost none

The biggest shift:
**From fixing errors after breaking things to preventing errors before touching anything.**

## Copy-Paste This Into Your Terminal Right Now

```
$ codex "Analyze our project and create code review rules.

My project: [describe your project in 3 lines]

In .project/codex/:
- base.md (basic rules)
- [your-tech].md (React, Django, whatever)
- forbidden.md (banned patterns)
- examples.md (good vs bad examples)

Actually look at my code and find dangerous patterns"
```

Hit enter. Wait 10 minutes. Done.

After that:

```
$ codex "review this file"
$ codex "check what I just changed"
$ codex "if I fix this, what breaks?"
```

That's all you need.

## You Don't Need to Write Code. You Need to Read It.

The real problem with vibe coding:

- Can't write code? Not the issue.
- Can't understand the code you made? That's the issue.

AI writes the code. A senior reviews it.
No senior? Turn Codex into one.

What you need:

- Time: 10 minutes
- Skill: typing in a terminal

I don't flinch every time I touch code anymore.
Codex tells me "fix that and this breaks" before I do anything.

The 13th wall never came back.

If your walls are leaking too,
open the terminal and ask Codex.

"If I fix this, what breaks?"

Ten seconds for an answer.
Beats three hours of rabbit holes.
