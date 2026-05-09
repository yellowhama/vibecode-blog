---
title: "015 Git Is Your Save System"
description: "Field notes from the trenches: Exploring 015 git is your save system through the lens of vibe coding."
pubDatetime: 2026-05-09T08:19:14.000Z
featured: false
draft: false
tags:
  - vibe coding
  - field report
ogImage: ""
---

> **TL;DR**: An excavation of 015 git is your save system. Real scars, no slop.

# AI Made 30 Files. Which One Works? — Git as a Save System

**TL;DR**

- Coded all night. Morning comes. 30 files. No idea which one runs.
- Git is a save point in a game. Break something? Restored in 3 seconds.
- The faster Claude Code builds, the faster you're screwed without Git.

---

## Monday Morning Horror

Monday morning. Coffee in hand. Computer on.

The game was running fine Friday night. Over the weekend I added a tactics system, player substitution, tweaked the UI. Had Claude Code do it. Fast as hell.

Opened the folder.

30 files.

`game.godot game_backup.godot game_tactics_added.godot game_final.godot game_final_real.godot game_final_real_last.godot`

Numbers going up to 7 after that.

Which one actually runs?

Opened one. Ran it. White screen.

Next file. Tactics button missing.

Next file. Just error messages.

30 minutes gone.

Finally found one. `game_tactics_added.godot`. It runs.

But the file date says Thursday.

Today is Monday.

**Where did three days of work go?**

---

## The Faster AI Works, the More Files Pile Up

When I coded alone, it was fine. Maybe 2-3 new files a day. I roughly remembered what I changed.

Then I started working with Claude Code.

"Do this." Five seconds later, 3 files modified.
"That too." Ten seconds later, 5 more files appear.

20 files a day stacking up.

The speed is great. But I can't tell what's what.

Rust files too. `main.rs`, `main_old.rs`, `main_backup.rs`, `main_fixed.rs`, `main_fixed2.rs`... No idea which one compiles.

**The cost of speed.**

---

## "Can't I Just Save Like a Game?"

Asked Claude.

"What's Git? Explain it like a video game."

The answer:

*"It's like a bonfire in Dark Souls. You save before fighting the boss. Die, and you respawn at that point. Git is the same. Modify code, hit save, and you can return to that moment anytime."*

Oh.

Got it.

So I don't need `_final`, `_real`, `_last` in my file names anymore?

---

## Save System Installed in 5 Minutes

Opened the terminal. Typed one line.

File name stays `game.godot`. Just one.

But now Git records every change.

Added tactics system. One save.
Fixed formations. Another save.

**One file. Infinite saves.**

---

## Broke Something? 3-Second Recovery.

Messed up the formation code. Game won't start at all.

Before, I would've opened 30 backup files one by one. That's an hour.

Now?

Checked the save list.

"Formation fix" (just now)
"Tactics system added" (1 hour ago)
"Project start" (this morning)

Went back to the save from 1 hour ago.

**3 seconds.**

Ran the game. It works.

Formation changes? Never happened.

---

## Seeing Exactly What Changed

Finding where I screwed up got easier too.

Before, I'd open two files side by side and compare with my eyes.

Now Git shows it.

"Oh, I messed up this line right here."

Red for deleted. Green for added. All at a glance.

---

## One Week Later

Project folder is clean.

One file. `game.godot`.

But there are actually 127 save points.

Roll back anytime. Every change recorded with timestamps.

Looked at the list.

"Player stat balance adjustment"
"Tactics change UI improvement"
"Added 5 formations"
"Match simulation speed fix"
"Bug fix: duplicate player selection"

**Feels like I got a time machine.**

---

## Claude Code + Git = Safe Rampage

"Improve the tactics system."

Claude Code modifies 10 files.

Hit save.

Don't like it?

Roll back to the previous save.

**Claude Code is speed. Git is the safety net.**

Put them together and it's the full package.

---

## My Save Notes Were Garbage at First

The memo you leave when you save.

At first I wrote "fixed," "updated," "final."

A week later, no idea what any of it meant.

Now I write this:

"Tactics system: added 4-3-3 formation"
"Bug fix: crash on player substitution"
"UI: resized tactics button"

**Notes to my future self.**

---

## No More Filename Hell

I don't do this anymore:

Naming files `_final_real_last_v7`.
Not knowing which file actually runs.
Losing three days of work.

Now it's this:

One file.
Every version recorded.
Roll back anytime.

**Git isn't optional. It's mandatory.**

Especially if you work with AI.

The faster Claude Code builds, the faster you're wrecked without Git.

It's Dark Souls without a save system.

Die at the boss and you start from the beginning.

**Don't want that? Install Git.**
