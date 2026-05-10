---
title: '049 Vibe Coding Failure'
description: 'Field notes from the trenches: Exploring 049 vibe coding failure through'
pubDatetime: 2026-05-10 13:24:38+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of 049 vibe coding failure. Real scars, no slop.

![The Code Jungle](/images/blog/10847-lines/hero.png)

# I Followed the Tutorial. I Failed.

## Why doing exactly what the course says still blows up in your face

Two months ago I found a free vibe coding course.

The title was good. "Build your own service with prompts."

I was just starting out.

AI writes code now, they said.

So... I could do it too, right?

The video was friendly.

Friendly is nice. But friendly isn't always right.

---

## The 3 Skills the Course Taught

The course broke vibe coding down to this:

1. **Make your prompts specific**

   Give examples and references. Better results.

2. **Set up rules**

   Use something like Cursor Rules to lock in "always do it this way."

3. **Add MCP**

   Let AI search, crawl, test -- all on its own.

Honestly, listening to it? Made sense.

And it actually helps.

The problem is... that's not the whole story.

---

## The "Weakness" They Admitted Late in the Video Is the Real Point

Near the end, the course says this:

"Say, Run, See" loops are fast.

But without a plan:

- Connections get weak
- Order gets tangled
- Tokens get wasted

So they tell you to add a planning phase. Something like a PRD.

If PRD is too hard, let AI draft one, then refine through conversation.

Here's what I thought:

> Okay.
>
> PRD can wait.
>
> Let me just build something that works first.

And that's the day I started failing.

---

## Me, Back When I Started Vibe Coding After Watching Videos Like This

At first, it works.

Really works.

Features appear. Screens load. Buttons click.

That moment, one thought hits:

"Wow... this is real."

So you get greedy.

"Just a few tweaks and it'll be perfect."

That's where hell begins.

---

## It Works. But...

You rewrite the prompt.

Then something weird starts happening.

Now it doesn't work at all.

You ask it to fix things.

It works again.

But...

**It's further from what I wanted.**

Ask if it's broken? Not exactly broken.

Ask if it works? Doesn't exactly feel right either.

That's the first wall of vibe coding.

---

## The Fear I Felt Wasn't About Code. It Was About State.

What I felt back then:

- I don't know if this is right
- I don't know where it went wrong
- I'm scared that asking for a fix will break it worse

Once you've been through this, you learn something.

Most code AI writes **looks convincing.**

That's what makes it dangerous.

Something completely broken? Anyone spots that.

But "looks fine on the outside, rotting on the inside"?

For a non-developer, that's a disaster.

---

## Karpathy's Vibe Coding Was for Developers

Like Andrej Karpathy said --

Type something in English going by feel, get a result.

That's the original vibe coding.

Right.

**For developers.**

I'm not one.

I'm not a developer.

Vibe coding taught by developers didn't fit me as-is.

Because they fundamentally don't know the most important thing.

**What a non-developer doesn't know.**

---

## What Non-Developers Actually Don't Know in Vibe Coding

It's not syntax.

What they really don't know is this:

> Whether this change is
>
> "a minor tweak"
>
> or "a decision that changes direction entirely."

Developers can tell the difference.

They have criteria for it.

Non-developers can't.

So they write one more prompt.

And AI dutifully moves.

The problem is, **nobody knows where it's going.**

---

## The Takeaway: Non-Developers Don't Need Better Prompts. They Need a Map.

The most important thing for a non-developer doing vibe coding isn't tools, rules, or MCP.

**It's a spec for what you're building.**

What am I making?

What does it do?

Who's going to use it?

One feature or many?

Does it need to scale?

Without answers to these, vibe coding will always go sideways.

Because we don't know code.

We can't just decide mid-drive to "turn right here" or "hard left now."

We're outsiders without a map.

Developers are locals with built-in GPS.

---

## Next Up

Next post, I'll say this more precisely.

**Non-developers fail at vibe coding not because of prompts -- but because they don't understand decisions.**

What a decision is.

When a decision happens.

What happens when you blow past one without noticing.

I'll show it in the exact order I failed.
