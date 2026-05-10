---
title: '058 Frustration Is The Spec'
description: 'Field notes from the trenches: Exploring 058 frustration is the spec'
pubDatetime: 2026-05-10 13:24:41+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of 058 frustration is the spec. Real scars, no slop.

![Field Notebook Sketch](/images/blog/notebook-sketch.png)

# Frustration Is the Spec

---

**All I want is one thing.**

Two computers at home. Wait, three.

Main desktop, sub desktop.

And a laptop I carry around.

What I want is nothing special.

Use the three like they're one.

Sit down, tell one to boss the others around.

Files going back and forth.

At home, outside, on the laptop.

On the phone or tablet if possible.

I just want to work in peace.

That's it.

Not a tech thing.

Not a framework name.

I just want to live like this.

---

**What even is UX**

Dropping the word UX here and you might think "isn't that a design term?"

User experience.

Not a big deal.

I use an iPhone. It's comfortable.

Unlock, tap, done.

That's good UX for me.

I use an iMac. It's miserable.

Three layers of settings, permission prompts, update nags.

That's bad UX for me.

UX is just this.

The experience I desperately want.

That's UX.

I wanted **"three computers feeling like one."**

That was my UX.

---

**Let's go find it then**

It's gotta exist. No way it doesn't. World's a big place.

So I looked.

**Bought a KVM switch.**

A box that connects two computers to one keyboard and one mouse.

Plugged it in, full of hope.

Keyboard worked.

Mouse worked.

But the files?

Still separate.

Screen flickers every time I switch.

Tells me to plug and unplug USB cables.

What is this, 2008?

Even more pissed now.

Next up, heard Windows has something.

**Remote Desktop.**

Oh, it works?

Nope.

My Windows is the Home edition.

Gotta buy Pro.

What? Upgrade my entire OS for this one thing?

It's not about the money, does this even make sense.

OK it's about the money too.

Fine. Say I somehow figured it out at home.

What about outside?

The laptop is a separate world.

Files I was working on aren't on the laptop.

Push to GitHub, pull on laptop, work, push again.

Forget once? Done.

"Damn, files aren't here."

Lost count of how many times I said that at a cafe.

So just put it in the cloud, right?

I did.

Every time data changes, gotta upload.

Made an automation.

Automation skips sometimes.

Made a routine to check the automation.

At this point I'm managing the automation that manages the automation.

**Haaaaaah.**

Other remote desktop options? Sure.

Tried Google Chrome Remote Desktop. Tried this and that.

Terminal commands work.

But the screen is small, it's slow, and file management is hell.

So here I am.

GitHub, cloud sync, remote desktop, terminal, file manager.

Five programs running just to kinda-sorta "control one computer."

Close enough.

But this isn't it.

---

**No service gives me the UX I want.**

No service?

Two choices.

One. Live like this every day.

Five programs open.

Pissed because sync didn't work.

Pissed because files aren't there.

Pissed because I'm switching between apps.

Slowly bleeding out through a thousand tiny frustrations. Every day.

Two. Get it over with in one brutal push, then live easy.

Build it once, kill yourself doing it.

Then just use it in peace.

I picked two.

Fine. I'm building it.

---

**Turning frustration into questions**

But saying "I'm building it" doesn't build anything.

Emotions aren't raw material.

"I'm pissed" builds nothing.

Questions do.

So I turned frustration into questions.

(Fuming) "Can't I connect computers directly without going through the cloud?"

(Casually) "Can I tell my home computer to do stuff from my laptop outside?"

"Can one program do all of this?"

"Can I do it from my phone too?"

I collected these questions.

And dropped them into the RAG drawers from the last post.

Frustration is emotion.

Questions are material.

Turning emotion into material. That's the first job.

---

**AI doesn't give you the answer**

So I went to AI.

"Hey, I'm in this situation. Got anything?"

AI answers.

**"You could use an SSH tunnel."**

Oh. That works?

So I asked.

"Can files go back and forth too?"

"That won't work. You'll need **rsync** alongside it."

OK. One more thing to install.

"Does it work from a laptop outside?"

"That's a different problem. If you install **WireGuard VPN**..."

Hold on.

You want me to install three programs for this?

"In that case, you could also set up a QUIC-based P2P tunnel directly..."

This pattern keeps repeating.

I ask one thing and AI fixes one thing.

But after the fix, something else breaks next to it.

"Does this work?" -- "No."

"Then how?" -- "Use this."

"Does that work with the first thing?" -- "That also doesn't work."

Around here I realized.

AI doesn't give answers.

AI just tells you a technique that fixes one problem in the situation you threw at it.

So the moment you touch a different condition, "oh, that won't work" comes back.

So I ask again. "How do I make that work?"

AI gives another technique.

Another part breaks.

That's ping-pong.

What AI gave wasn't a solution.

It was a boundary line: "that won't work."

And **every single one of those boundary lines turned out to be a requirement.**

---

**Chat history is research**

Collect the fight logs.

After about twenty rounds of this ping-pong,

the chat window is pretty long.

Most people do this at that point.

Open a new chat.

Explain everything from scratch.

I did that at first too.

But at some point I realized.

The chat history itself is the research.

The record of fighting with AI.

"Does this work?" "No." "Then this?" "Also no."

That raw mess is the material.

Don't throw it away.

---

**Take it back to AI**

Gather all the records. Organize them.

Take them back to AI.

"Hey, here's my situation, here's everything we talked about.

What tech can actually pull this off?

Open source preferred."

This time AI answers differently.

Because this time there's context.

It knows my situation.

It knows what didn't work.

It knows what I want.

So this time "just use SSH" one-liners don't come out.

Multiple tech candidates show up.

---

**Make a comparison table**

Once candidates appear, you compare.

My two criteria.

- Not too hard to build.
- Feature-rich enough.

Best case, one tech fits both.

Usually doesn't.

Easy ones lack features.

Feature-rich ones are hell to build.

Make AI organize this too.

"Make a comparison table of these technologies.

Sort by ease of building and by feature completeness. Both."

Out comes a table.

Look at the table and the options narrow.

---

**Sort what you gathered into four boxes**

By now there's a pile of stuff.

Frustration logs, chat logs, tech candidates, comparison table.

Time to organize.

I use four boxes.

Purpose. What I'm trying to do.

"Use multiple computers like one. Anywhere."

Reason. Why it doesn't work. In other words, why I'm pissed.

"No service does this. The ones that exist are all half-assed."

Method. How to make it work.

"Connect computers directly via P2P. Skip the cloud. QUIC tunnel."

Means. Tech and tools to build it.

"QUIC protocol, libp2p, idle CPU/GPU utilization, local-first architecture."

These four boxes.

(Purpose) (Reason) (Method) (Means)

Like this.

- What I'm trying to do (purpose)
- Why it doesn't work (why I'm pissed)
- How to make it work
- Tools to build it with

That's the spec.

I never sat down to write a spec.

Never opened a spec document and started typing from scratch.

I got pissed, asked questions, fought, organized. And the spec was already there.

---

**The shortest path to that UX**

The spec is done.

But building all of it would kill me.

P2P connections, file sync, GPU sharing, mobile support, security...

Do it all at once and you'll never finish.

So I do this.

Get one technology working.

Just one.

When that works, add one more thing to it.

Build it yourself or grab open source.

Then connect them.

There were letters.

Buy a stamp, put it in an envelope, drop it in the mailbox.

There were telegrams.

There were telephones.

"Operator, please connect me to the Kim residence."

Then came the dial.

Now?

Fire off a text.

All of them are "sending a message." Same function.

The technology is wildly different. Sure.

But from the user's side, it's all the same thing.

Just how easy it is. That's the only difference.

What I'm building is the same.

The goal isn't feature completion.

It's the UX I talked about at the start.

"Sit down and use multiple machines like one."

The moment that feeling hits, even once. That's the MVP.

Doesn't need to do everything.

File sync doesn't need to be perfect.

GPU sharing can wait.

But that one time--

tell the home computer to do something from my laptop,

get the result back,

"Oh. It works. This is nice."

When that feeling lands.

That's the MVP.

Everything else, you bolt on later.

---

**Here's the summary**

In the beginning, there was frustration.

That frustration was this: "the UX I want doesn't exist in this world."

So I decided to build it.

Turned frustration into questions.

Threw the questions at AI.

AI gave boundaries instead of answers.

Gathered the boundaries, organized them, and there was the spec.

Picked the shortest path from the spec and called it the MVP.

That's the order.

Frustration. UX. Questions. Conversation. Research. Spec. MVP.

Next post, I actually build this MVP.

The spec is done.

Now it's implementation.