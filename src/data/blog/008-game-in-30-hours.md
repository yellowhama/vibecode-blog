---
title: 'Making a Game in 30 Hours'
description: 'Field notes from the trenches: Exploring making a game in 30 hours through'
pubDatetime: 2026-05-09 07:25:50+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of making a game in 30 hours. Real scars, no slop.

## TL;DR

**Soccer management sim** dev log, first 30 hours.
**Godot vs Unity**, **Rust via GDExtension**, **Spec Kit-based spec writing**,
Claude Code + GPT-5 + Cursor AI -- an **AI game dev pipeline**.

A beginner's guide to **AI-powered 2D game development**.

## I Decided to Build Something That Makes Money

There was a time I copy-pasted code from chatbots. Asked "how do I fix this error?" a hundred times a day. Then I met Claude Code, learned Spec Kit, and now I wanted to build something real.

A game. Why a game? I'd already built Boksuni. Built a stock screener. Now I wanted something I could put on the App Store. Something that makes money.

Know Princess Maker? That game where you raise a daughter. I wanted that, but with a soccer player. Train them through three years of high school to go pro. I like sports games. I like management sims. Perfect fit.

## 30 Hours Begins

Started yesterday morning. Poured coffee, opened the terminal. Then opened GPT-5.

"I'm making a soccer player management game. Princess Maker style. Write me a spec."

About 20 minutes later. GPT-5 spit out a 15-page spec. 52-week system, 12 attributes, training types, match simulation, even a manager system. Organized in Spec Kit style. Clean.

Took it to Claude Code. "Build the project structure from this spec."

Files started appearing. project.godot, Cargo.toml, folder structure... watching the project materialize was wild. Not having to copy-paste -- so this is what convenient feels like.

## Godot vs Unity -- Which One?

Had to pick an engine. Asked Claude Code.

"I'm making a game. Unity or Godot?"

**What's Unity?**

Most mobile games are Unity. Genshin Impact, Fall Guys, Among Us -- all Unity. Industry standard. You need Unity to get hired. The Asset Store has everything. Zombies, castles, gunshot sounds.

But it's 6GB. Heavy. Gotta learn C#. Recently they introduced a Runtime Fee -- game does well, pay up. People lost their minds.

**What's Godot?**

100MB. Open source. Completely free. MIT license, do whatever you want. GDScript is easy like Python. After the Unity drama, people migrated in droves. Pizza Tower, Brotato -- indie games made with Godot.

But less documentation than Unity. Big studios don't use it. 3D is weaker than Unity.

**I'm making a 2D game.**

Mine was a 2D management sim. Pixel graphics, a few buttons. Godot is better for 2D, apparently. Dedicated 2D nodes. Built-in 2D physics. Unity is a 3D engine that also does 2D. Godot does 2D properly.

**Hooking up Rust was easier with Godot too.**

Unity's default is C#. Rust? No official support. Forcing it means building C++ wrappers. A whole ordeal.

Godot? GDExtension -- an official API. Active Rust bindings. Searched "Godot-rust" and docs came right up.

**Verdict: Unity does more, but Godot is what I need.**

2D management sim. Wanted Rust for logic. Had to build something in 30 hours.

Unity is a fighter jet. Godot is a prop plane.

I needed the prop plane.

## Wrestling with Rust

I thought performance mattered. Python would be slow. Used Rust in 007, so let's do it again.

GDExtension connects Godot and Rust, apparently. Had no idea what that meant. Tried it anyway. Errors piled up like a mountain.

```
Error: No module named godot
Error: Cannot find lib.rs
Error: Signal not found
```

Four hours of wrestling. Claude Code fixed them one by one. cargo add godot, cargo build --release... every command was foreign, but I followed along.

Then finally: "GameCore initialized" on screen. I yelled. "It works!"

## Godot + Rust -- Ignorance-Driven Over-Engineering

Here's the thing. I asked this from the start:

"I'm making a game with Godot. Can I use Rust and Spec Kit style?"

GPT-5: "Of course." I thought that was just how you do it. Used Rust in 007, so obviously games use Rust too. Right?

Claude Code built it out. GDExtension connections. WorkerThreadPool for async. JSON for data exchange.

30 hours later, it was done. Felt pretty good.

Then I showed the code to GPT-5 for a review:

"Oh, you've separated the backend and frontend completely? Godot=UI, Rust=logic? This is architecture for mid-to-large projects, long-term maintenance... For small games, people usually just use GDScript."

What?

"GDScript alone can do everything. Most indie games are built that way."

Damn.

What had I been doing? Bolting on Rust, managing FFI boundaries, JSON serialization, type mapping...

**I could've just written GDScript. Instead I brought in Rust.**

Like driving a Ferrari to the corner store. Like a convenience store clerk wearing a NASA spacesuit to work.

## But I Don't Regret It

Thinking about it, this was actually better.

First, I didn't know it was hard, so I just did it. If I'd known, I would've been scared and stuck with GDScript.

Second, I ended up with a genuinely scalable architecture. GPT-5 admitted it. "This is the structure teams use when long-term maintenance or performance matters."

Third, adding server integration or multiplayer later is way easier with this setup. Logic is already separated.

**Ignorance-driven over-engineering turned out to be best practice.**

Beginner's luck? The paradox of vibe coding?

Either way, in 30 hours I'd built what amounts to a mid-size project architecture. Couldn't have done it alone. AI said "of course it's possible," so I assumed it was normal and did it.

That might be the beauty of vibe coding. You don't know what's hard, so you just do it. And sometimes that gives you better results.

---

GPT-5's review also said this:

"You already have WorkerThreadPool, GDExtension, Resource mapping -- you're close to textbook architecture."

Right. Built textbook architecture without knowing what a textbook was.

## The Buttons Are Too Small

Code came from Claude Code. But the UI was rough. Buttons too small. Text unreadable. So I opened the Godot editor. Dragged buttons bigger. Adjusted font size. Changed colors.

That's what I did. AI wrote the code. I made it look decent. Felt like an art director.

Switched to pastel colors and suddenly it looked like a game. Ugly, but my game.

## Day Two Storm

Woke up this morning and went straight back to work. Yesterday was just the base system. Today needed actual game elements.

Built the 52-week system. Spring semester 20 weeks, summer break 7 weeks, fall semester 20 weeks, winter break 6 weeks. Didn't know academic scheduling was this complicated.

Made AI players. Opponents. Different stats per position. They get stronger each school year.

Added a manager system. Made a Guardiola parody named "Pepaldoeda." Mourinho became "Murchinglo." Naming them was surprisingly fun.

Opened Cursor AI and ran a full code review. "156 lines of duplicate code found." Auto-refactored. Code shrank by 30%.

## A Barely Running MVP

30 hours passed. What's in front of me is something embarrassing to call a game.

It runs. You create a player, train them, stats go up, days pass. The 52-week system works. You can play matches against AI players. Save and load work.

But the graphics are prototype-level. No sound at all. No animations. No tutorial. Balance is a mess. Can I put this on the App Store? Absolutely not.

But something exists. 30 hours ago there was nothing. Now there's something. Ugly and unfinished, but it's a game.

## Why I Used Three AIs

Couldn't have done it alone. Even with just ChatGPT, it would've taken two weeks. Copy-paste, fix error, copy-paste again...

GPT-5 handled design. The big picture. These systems are needed, connect them like this, use this structure.

Claude Code handled building. Created files, wrote code, ran tests. No copy-pasting from me.

Cursor AI handled cleanup. Removed duplicates, found bugs, optimized. Scanned the entire codebase at once to spot problems.

Each one had their role. I only pointed the direction. "Soccer game." "Pastel colors." "Bigger buttons." That's everything I did.

## 30 Hours Later, Something That Isn't Quite a Game

What's in front of me is too embarrassing to call a game.

UI? None. Just text scrolling down.

BGM? None. Silent.

Story? None. Just numbers going up and down.

Matches? Can't play them yet. Can only train.

You create a player, see 12 attributes, pick a training menu, stats go up. That's all.

Is this a game? No.

A skeleton? Not even.

More like... a blueprint of a skeleton? A sketch of a skeleton.

**But I'm pretty satisfied.**

30 hours ago there was nothing. I didn't know what a game was. Didn't know what Godot was. Didn't know you could make games with Rust.

Now something exists. Ugly, bare, embarrassing to call a game, but it exists.

Press a button and something happens. Numbers change. Days pass. The player grows.

This is the start.

## The Road Ahead

Prototype might take a few more days.

App Store launch -- 2-3 months maybe.

Will it make money? No idea.

But for now I'm going to hold onto this thing and build a little every day.

Tomorrow I'll add a match system. Just numbers is fine.

Day after, one event. Three lines of text is enough.

Then UI, piece by piece. Ugly is fine.

The goal is clear. **Put it on the App Store. Sell a game I made.**

$0.99 is fine. One person buys it, that's enough.

"Someone paid money for a game I made."

That one sentence. That's what I'm building toward.

## Vibe Coding

Made a game in 30 hours?

That's a lie. What came out of 30 hours isn't a game.

A seed of a game. A possibility of a game. Something that might become a game.

But that's what matters.

Seeds become trees.

Possibilities become reality.

Something becomes a game.

Vibe coding doesn't promise completion.

It promises a start.

And once you've started, you keep going.

---

That's what I went through in 30 hours.

Did I make a game? No.

I made something that could become a game.

And I got the courage to keep building it.

Start this weekend.

By Monday you won't have a game. But you'll have something that could become one.

That's enough. It's a start.
