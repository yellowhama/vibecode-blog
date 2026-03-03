# Things You Must Do Before Using Claude Code

A field manual for non-developers -- and how the people who built it actually use it.

People who try Claude Code for the first time always say the same thing.

"Wow, this actually works."

Then a few days later, almost the same words come back.

"But why does it keep stopping in the middle?"

"Yesterday it worked. Today it doesn't. Why?"

"What am I doing wrong?"

Most people land here:

"I guess I just don't know how to use Claude Code yet."

Half right.

**The real problem is how you're using it.**

This isn't a feature guide.

It's not a tutorial.

**It's the routine the people who built Claude Code follow every time they start a project** -- rewritten for non-developers.

---

## What the People Who Built Claude Code Actually Say

A key figure inside Anthropic keeps repeating this:

> "Claude isn't a tool you fire once and forget.
>
> Without a verification loop, it makes the same mistakes a human would."

That matters more than you think.

Most people treat Claude Code like "ChatGPT with a save button."

The people who built it see it completely differently.

Claude Code is closer to a **new hire**.

Listens well. Works fast.

But give vague instructions and it'll freelance.

And it's very good at thinking "this is probably good enough."

So the builders **never let Claude start working right away.**

They always run the same prep routine first.

---

## The First Thing They Decide Isn't "What to Build"

Most people start like this:

"I want to build this program."

"Automate this for me."

But the people who built Claude Code **don't even ask that question.**

They start here:

"When can I say this task is done?"

Example.

"A program that auto-organizes files" is not a goal.

A goal looks like this:

- It runs without errors
- Files actually move to the right folders
- Instructions are written somewhere

Without that, Claude will stall.

And it can't explain why.

The principle the builders repeat:

**A task with no completion criteria never gets completed.**

---

## The One Thing They Always Teach Claude Before Any Task

Before giving any task instructions, they always include this:

"Check your own work."

Why does that matter?

Claude focuses on "writing good code."

But it's blind to "does this actually run."

So the builders always add:

"Run it after you're done."

"If there's an error, analyze why and run it again."

Sounds like a developer thing. It's not.

Non-developers can do this too.

- Does the program run?
- Did the file actually get created?
- Does the screen show up?

Just checking that much changes everything.

In the builders' own words:

> "Without verification, Claude just writes.
>
> With verification, Claude works."

---

## Why Every Project Gets a CLAUDE.md

Anyone who's used Claude Code a bit has had this moment:

"I explained this yesterday..."

"Why is it making the same mistake again?"

Simple reason.

Claude **doesn't remember.**

So the team that built Claude Code creates one file in every project.

CLAUDE.md

This file isn't for humans.

**It's a user manual for Claude.**

What goes in it isn't grand philosophy.

- What this project is for
- What must never happen
- What order to follow

That's enough.

With just this file, Claude understands: "Oh, this is how I should behave in this project."

In the builders' words:

> "CLAUDE.md doesn't give memory. It installs habits."

---

## They Never Build Right Away. Always Plan First.

Claude Code has a Planning Mode.

Don't treat it as just an option.

The people who built Claude Code **treat coding without planning as almost taboo.**

Because once Claude starts executing, it's hard to stop.

So they always say:

"Don't execute yet. Just write the plan."

"Don't create any files yet."

What they look at in this stage isn't code.

- How many steps the task breaks into
- Where to fall back if something fails
- Where a human needs to step in

They check this first.

After this step, "oh wait, that's not right" almost never happens.

---

## The Usage Pattern the Builders Hate Most

The scene they warn about most:

"Build all of this at once."

Multiple features, settings, tests, docs -- all crammed into one prompt.

Why do they hate it?

Claude is faster than humans.

But it loses its way far easier.

So the builders always break tasks apart.

Structure, then core feature, then verify, then next step.

Feels slower.

In practice, it's the opposite.

Time spent backtracking drops to nearly zero.

---

## Why They Don't Turn On Auto-Approve Right Away

Claude Code has a mode that auto-approves every change.

Even the builders don't turn it on from the start.

Reason is simple.

Claude is statistically less likely to be wrong.

It's not a being that's never wrong.

Their rule:

- Manual approval first
- Automate once you see the pattern

Skip this order and you'll lose a project. They say it flat out.

---

## The Last Thing They Always Do When Work Is Done

When work wraps up, there's one thing they always make Claude do.

"Summarize what you just did."

This isn't a retrospective.

**It's prep for the next task.**

- What got done
- What files changed
- What comes next

Leave this behind and you don't have to re-explain to Claude tomorrow.

And it saves future-you too.

---

## Claude Code Isn't a Tool

If you boil down the builders' attitude to one sentence:

**Claude Code isn't something you use. It's something you manage.**

- You don't sit beside it like a developer
- You direct it like a boss
- You judge it by results only

Use it this way and non-developers can carry a project to the finish line.

Claude Code isn't a friendly assistant.

Used right, it's **a team member who works through the night.**

But first, you have to be ready to treat it like a person.
