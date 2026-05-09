---
title: "010 Five-Minute Docs: How to 5x Your AI Vibe Coding"
description: "Field notes from the trenches: Exploring 010 five-minute docs: how to 5x your ai vibe coding through the lens of vibe coding."
pubDatetime: 2026-05-09T07:25:51.000Z
featured: false
draft: false
tags:
  - vibe coding
  - field report
ogImage: ""
---

> **TL;DR**: An excavation of 010 five-minute docs: how to 5x your ai vibe coding. Real scars, no slop.

# Five-Minute Docs: How to 5x Your AI Vibe Coding

## TL;DR

- **Problem**: AI has no idea what's in your project. It builds everything from scratch. Every time.
- **Fix**: "Analyze this project and make a doc." Five minutes. Done.
- **Result**: Three-hour jobs become thirty minutes. No conflicts. Clean integration.
- **The point**: Docs are AI's memory. AI writes the docs too. You just say "organize it."

## Last Night at 2am, I Wasted Three More Hours

I was trying to integrate an open-football engine into a game I'd already built.

Found it on GitHub. A treasure. Obviously it'd be easy to plug in.

"Integrate open-football match engine into our project."

Claude Code started cranking out files.

game_controller.gd, player.gd, MatchSimulationManager.gd...

It kept going for a while. I went to eat, came back.

"I'll begin working on match_simulation_system.gd."

Something felt off.

"Wait, we already have MatchSimulationManager. What's different?"

It was worse than I thought. PlayerManager existed. GameManager existed. 33 Autoload singletons were already running. And AI was building a whole new system from zero.

Like moving into a furnished apartment and the AI thinks it's empty. So it buys all new furniture.

## AI Is a Genius. A Blind One.

That's when it hit me. AI can't see my project folder.

Well, technically it can. It just doesn't look.

When I say "our project," what does AI imagine? Could be Unity. Could be a web app. Could be an empty folder. From AI's perspective, it's a guessing game.

In my head it was crystal clear. 33 Autoloads, team training system, hexagonal stats, managers neatly organized in scripts/core/.

But what did AI know? Nothing.

It has no memory. Like a goldfish. It remembers while it's working, then forgets.

Think of a fridge. Going grocery shopping without the list on the fridge door. You don't know if you have eggs. So you buy more. Come home. Three cartons of eggs already there.

Yesterday was like this. Today was like this.

## "Make a Doc." One Sentence. Everything Changed.

I was pissed. Asked Claude directly.

"Hey, do you even know what's in our project?"

"No, I don't."

Right. You don't. Then I'll tell you.

"Analyze the current project structure and make a doc."

Five minutes later.

```markdown
# PROJECT_INFO.md Complete

## Autoload System (33 total)
- GameCore.gd: Main game logic
- MatchSimulationManager.gd: Match simulation
- MandatoryTeamTrainingManager.gd: Team training system
...

## Folder Structure
scripts/
├── core/          # Core managers
├── ui/            # UI controllers
├── data/          # Data classes
└── utils/         # Utility functions
```

Wait, it found everything?

Then I understood. AI can't read minds. But if you tell it to look, it looks. What would've taken me 30 minutes, it did in 5. Opened every file, cataloged everything.

## What Happened After the Doc Existed

Tried again.

"Check PROJECT_INFO.md and integrate open-football."

This time was different.

"Ah, there's an existing MatchSimulationManager.gd. I'll add the open-football engine as a wrapper on top of it."

Damn it. Should've done this from the start.

**Before: 3 hours.**

- Built new stuff
- Conflicts everywhere
- Debugging
- Deleted everything

**After: 30 minutes.**

- Checked existing systems
- Extended them
- Tested
- Done

The difference? **Five minutes of documentation.**

## The Four-Step Doc Rule

Now I know exactly when to tell AI to document.

### 1. When You Find New Info

```
Me: "Found open-football on GitHub."
Me: "Organize it and add to OPENSOURCE.md."
AI: "Done! License (MIT), usage, integration method documented."
```

### 2. When You Build Something New

```
Me: "Built the match system."
Me: "Add it to FEATURES.md."
AI: "Done! File locations, usage, connected systems recorded."
```

### 3. When You Upgrade a Feature

```
Me: "Improved the training system."
Me: "Write what changed in CHANGELOG.md."
AI: "Done! v1 to v2 changes documented."
```

### 4. When Errors Hit

```
Me: "Fixed this error."
Me: "Add the fix to ERRORS.md."
AI: "Done! Root cause and solution recorded."
```

## My Project's Doc Structure

One week in, it looked like this:

```markdown
# README.md (Main Hub)

## Doc Locations
- Structure → STRUCTURE.md
- Art/UI → ART.md
- Story → STORY.md
- Error Fixes → ERRORS.md
- Open Source → OPENSOURCE.md
- Changes → CHANGELOG.md
- To-do → TODO.md
```

Each doc has a clear job:

**STRUCTURE.md**: Folders, files, core systems.

```markdown
## Autoload System
- GameCore: The heart of the game
- PlayerManager: Player management
- MatchSimulation: Match engine
```

**ART.md**: Colors, fonts, UI rules.

```markdown
## Color Palette
- Main: #FFB6C1 (light pink)
- Sub: #87CEEB (sky blue)
- Accent: #FFD700 (gold)
```

**ERRORS.md**: Common errors and how to kill them.

```markdown
## GPU Memory Error
- Symptom: "VRAM exceeded"
- Cause: Model failed to unload
- Fix: Add ollama stop command
```

## The Daily Routine

**Every day, end of work:**

```
Me: "Organize what I did today and update the docs."
AI: "3 docs updated:
    - STRUCTURE.md: 5 new files added
    - CHANGELOG.md: Today's changes
    - TODO.md: Tomorrow's tasks"
```

**Once a week:**

```
Me: "Clean up the docs. Remove duplicates, merge."
AI: "37 docs → 19 docs. Done."
```

**Every time you find new open source:**

```
Me: "Found korean-name-generator. Add it to OPENSOURCE.md."
AI: "Added. MIT license, usage, integration code examples included."
```

## What I Actually Learned

### Before

- "Where's that feature?" → Digging through files, searching, 30 minutes gone.
- "I've seen this error before..." → Googling, Stack Overflow, 1 hour gone.
- "I don't remember what I built." → Re-reading code, trying to understand my own work.

### Now

- "Check STRUCTURE.md" → Found in one second.
- "Check ERRORS.md" → Fix is right there.
- "Check CHANGELOG.md" → Every change recorded.

Docs are AI's memory. Without docs, AI blanks out every time. With docs, it remembers perfectly.

And the most important part? **You don't write them yourself.** Just say "organize it" and AI does the rest.

## The Four Commands

Remember these:

1. **"Analyze and make a doc."** — First time setup.
2. **"Add this to the doc."** — Every time you build something new.
3. **"Clean up the docs."** — Once a week.
4. **"Remove duplicates."** — When docs pile up.

## Real Results

**Time writing docs**: 0 minutes (AI does it)
**Time saved**: 3 hours daily
**Conflicts/errors**: Down 90%
**Productivity**: 5x

While you've been reading this, AI could've already made a doc.

Open your terminal right now:

```
"Analyze the current project and create PROJECT_INFO.md."
```

Five minutes. That's it.

## Epilogue: Docs = AI's Brain

Working with AI is like a team project.

New teammate shows up. No handoff, no context. "Just figure it out." It's going to be a disaster.

But if clean docs exist? "Everything's here. Read it and start."

AI is the same. Give it docs and it's a genius. No docs and it's clueless.

Why? Because every ten minutes, it becomes a brand new teammate.

So from now on, every project starts with docs.

And during the work, you keep updating them. When? Every breathing moment. New features, new info, new versions, even your sighs and curses. Document everything.

And when it writes code, you make it check the docs line by line. Put a checklist in the doc. Make it check off each line as it finishes. Sounds like a pain?

**"AI writes the docs. You just give the order."**
