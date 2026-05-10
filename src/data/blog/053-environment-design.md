---
title: 'Make It Blow Its Own Nose.'
description: 'Field notes from the trenches: Exploring make it blow its own nose.'
pubDatetime: 2026-05-10 13:24:39+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of make it blow its own nose.. Real scars, no slop.

## Not prompts. Environment.

---

## Building a System That Blows Its Own Nose

Last post ended like this:

> A system that doesn't need you yelling "Blow!" every time.
>
> One that blows on its own.

Let's build that.

Honestly.

How long are you going to follow AI around?

- Telling it which document to read
- Pointing to where to start
- Telling it where to write when it's done

Why?

**You're the one paying the subscription.**

---

## What Happens If a Human Keeps Doing This

You're not using AI.

**You're a kindergarten teacher.**

Wiping noses every morning.

Spoon-feeding and saying don't spill.

Turn your back and it's writing in the wrong place again.

This isn't automation.

**It's daycare.**

But here's the thing.

AI isn't disobedient.

AI is incredibly diligent.

The problem is exactly one thing.

**The work environment changes every time.**

---

## Time to Change the Approach

We've been fixing our words.

- Writing more detailed prompts
- Adding more conditions
- Attaching more examples

But isn't it strange.

The words keep getting longer.

Why do the results keep wobbling?

Simple reason.

Words evaporate.

Environment stays.

That's why lately the talk is shifting from prompt engineering to **context engineering**.

No matter how pretty you make your words, **setting up one situation where AI can do good work beats all of it.**

---

## What's at the Core of That Environment

SSOT. Single Source of Truth.

> **The one location this project treats as fact.**

Once that's set, here's what happens:

- No confusion about what to read
- Clear what to fix
- Obvious what to throw away

Most things sort themselves out.

---

## But Everyone Fails at This Part

Setting up an SSOT -- people get that far.

The problem is what comes next.

- They don't look at it
- They forget
- They make another one somewhere else

This isn't a willpower issue.

**It's a structure issue.**

Without a structure that forces reading, even the most important document goes unread.

People are the same way.

---

## So the Real Question Is

- Where does this thing need to live?
- How do you make it keep going back there?
- Without ever saying "remember this" -- **how do you make it return like a habit?**

One answer.

**Make it live in that spot from the very beginning.**

---

## Not Tech. Structure.

So the first button is this.

**Rust scaffolding.**

What's that?

Nothing grand.

When you start a project:

- Lay down the folder structure first
- Create document slots first
- Set the rules before a single line of code

The important word isn't Rust.

**It's scaffolding.**

Start with an empty folder and AI has to think every time.

"Where do I write this?"

When structure is already in place, no thinking needed.

**The spot already exists.**

---

## Why Rust Specifically

JS/TS scaffolding usually goes like this:

- Folders are convenience
- Structure is convention
- Can be reorganized later

AI loves this.

Throw code anywhere and it still runs.

Rust is different.

- Folders = visibility boundaries
- Structure = contracts
- Wrong design = the system won't let you

One line:

> **TS is discipline. Rust is a constitution.**

More precisely, it's the combo of "if you lay out folders, AI wants to fill them" and "if you get it wrong, you get smacked."

Both forces work at once.

1. AI is addicted to filling blanks.

AI's core is next-token prediction. Lay down a mat and it dances on it.

**No folders:**
"Nowhere to organize? Screw it, dump everything in `app.ts`."
Result: spaghetti code.

**With folders (`/docs`, `/types`, `/core`):**
"Oh, a docs folder? A separate spot for types?"
AI has an **instinct to follow whatever structure exists in context.** It sees an empty drawer and tries to put socks in it. Because statistically, that's the highest-probability move.

2. But the real reason it works is because it's Rust. (The electric fence.)

In JS/TS, even if you set up folders, AI can ignore them and write somewhere else. The code still runs.

In Rust, file and folder structure IS the module tree. AI writes code in the wrong spot? The compiler grabs it by the collar.

> *"Hey, you didn't register this in `mod.rs`."*
> *"Hey, this is a private module. Why are you calling it from outside?"*

AI screws around? **Red lines show up.** And when errors appear, AI has to fix them before anything else. It's forced to follow the structure.

3. Put it together.

Setting up folders is placing the toilet and saying "go here."

Using Rust is the system that **kicks your ass if you go anywhere else.**

Both have to work together before AI finally settles down and thinks "okay, I'll do what I'm told."

That's the automated discipline we're after.

Break the rules and it's not a lecture you get.

**It's a smack.**

So AI doesn't dare mess around.

---

## So What Does the Human Do

Honestly, this much is enough:

> Set up the Rust scaffolding.
>
> All the document types I'll need.
>
> Make it so you don't forget and actually put documents where they go.
>
> I've got a GitHub repo set up. Hook it into that.

You can say it just like that.

Because AI doesn't remember words.

It **reacts to environmental signals.**

---

## The Conclusion Is What I Said at the Start

Prompts have to be rewritten every time.

Environment, once built, keeps working.

No matter how pretty your prompts are, **forcing a situation where AI works well beats all of it.**

So the conclusion is this:

> Humans don't need to specify the details.
>
> **Just build the environment.**

---

## Next Post

Next, we get into:

- Inside this Rust scaffolding
- What folders need to exist for SSOT to survive
- Where AI starts
- Where it comes back to

Laid out as **actual structure.**

For real this time.

Wiping AI's nose is over.
