# Implementation Is Free.

## The real reason AI projects fall apart

**Why do AI-coded projects get harder to manage over time?**

Coding isn't the problem anymore.

AI fixes bad code fast.

It even explains why it was bad.

The problem is what comes after.

The planning spec was one document.

You gave it that and told it to work.

A week later, there are 30 work reports.

Some are new docs.

Some updated old ones.

Some created new folders.

Some went and made a whole separate docs folder in a different path and stacked 20 more files there.

End result: "what's current and what's real" is something a human has to track down again.

Not surprising.

This isn't a problem of AI doing bad work.

It's a problem of AI being too diligent.

**Implementation is free. Orchestration is the cost.**

---

**If coding isn't the problem, what is?**

AI doesn't fail at implementation.

Failure always starts after implementation.

Code gets fixed.

Features run.

Tests pass.

But the project gets harder and harder to handle.

The reason is simple.

There's no concept of "done" inside the system.

Humans naturally tidy up after finishing a task.

It's so natural we sometimes forget to tell AI to do it.

And that "sometimes" is what always causes trouble.

---

**One spec. So why 30 versions of the result?**

Humans think like this:

"Built the feature. Done. Moving on."

But AI behaves differently.

After each task, AI doesn't leave a "completed result."

It leaves a new record.

One report.

One summary.

One cleaned-up version.

One doc that looks like a backup.

They stack up.

The standard was always one document. But the records keep multiplying.

And AI doesn't update all of them equally every time.

Why? It creates them and then forgets they exist.

---

**Why does AI keep generating records?**

For AI, overwriting an existing document is risky.

Deleting is riskier.

So the safest move AI can make is this:

"Make one more."

This isn't a mistake.

It's a risk-avoidance strategy.

---

**Why "proceed to the next task" is dangerous**

The breaking point is always the same.

"Alright, next task. List out what's remaining."

Feels natural.

But this question has a hidden assumption:

There's one document representing the current state, and you can judge from it.

In reality, that document doesn't exist.

Even if you manually create a ground-truth doc and say "this is the standard," AI will occasionally forget and write a different one.

From that point on, every judgment becomes random.

---

**How does AI try to figure out current state?**

AI guesses.

Picks one document out of many.

The one that looks most recent.

The one that looks most detailed.

The one it happened to read first.

Then treats that as the current state.

The problem: it picks differently every time.

Total random box.

---

**Why does it keep re-implementing features that already exist?**

When it looks at the wrong document, the conclusion is always the same.

"Hasn't been done yet."

So AI builds it again.

Even if existing code is right there, if AI can't be sure, it won't use it.

Building fresh is safer.

From that moment, the same feature exists twice.

---

**What happens when the same feature exists in multiples?**

This isn't a code duplication issue.

It's a structural issue.

In human terms:

Me: "Both arms are built, right?"

AI: "Yes, two arms ready."

So I say:

"Watch on the left wrist. Spoon in the right hand."

AI asks:

"Uh... there are two left arms. Feature-A-left-arm-action and Feature-A-left-arm-movement. Which one?"

Two left arms.

No right arm yet.

This conversation happens in codebases every single day.

---

**Why different names for the same feature makes it lethal**

If it said "Feature-A-left-arm" you'd count your blessings.

Reality looks like this:

- leftArm_A
- leftHandPlan
- leftWrist_plus
- LEFT_ARM
- LEFTIE
- RYU_HJ

Same feature. All the left arm.

But different names.

This isn't a naming problem.

Maybe all those left arms work. Maybe only some are connected. Maybe the signals are crossed and it just looks like it's working.

The problem: a simple search can't find all of them at once.

---

**Why doesn't AI delete the duplicates?**

"Let's fix this."

AI works hard again.

Later you look: 19 deactivated left arms. One newly created left arm. 6 left arms the search missed. 2 left arms that got reactivated during a different task.

Chaos.

"Just delete them!"

Deleting creates responsibility.

What if this one's real?

What if something else depends on it?

What if the latest is actually that one?

So AI doesn't delete.

It deactivates.

And makes one more.

Duplication isn't the result of mistakes. It's the accumulation of rational choices.

Like the mistakes smart people make -- every precaution for the future is wrecking the present.

---

**What happens to the project if this keeps going?**

Now I'm fixated on the left arm.

Let's perfect the left arm first.

Block. Stab. Slash. Grab.

Time passes.

The left arm count is around 28.

Each one does one thing.

Some overlap.

One left arm stabs in the grab position.

Another left arm blocks in the waving position.

***And there's still no right arm.***

Left legs and right legs also have left arms attached.

Every feature exists.

***Except walking.***

This is what actually happens.

---

**Why more documents isn't the real problem**

Document count isn't the core issue.

The problem is this: each document tells a different story.

If they all reflect the same state from different angles? Great.

But what if some describe now, two describe yesterday, nineteen describe last month, and one describes tomorrow?

And all 219 documents have slightly different names?

And AI wrote code based on these?

Same features don't know about each other.

The system can't understand itself.

From this point, vibe coding isn't automation anymore. It's archaeology.

Yesterday's Claude did the digging. Today's GPT has to excavate it. Gemini carefully brushes off the dirt, lines up similar code, and examines each piece under a microscope.

**Why naming rules and document conventions can't fix this**

When multiple documents claim to be the standard, rules always break.

No matter how many rules you set, if "which document is the standard" isn't settled, everything is powerless.

---

**So what needs to be fixed in place?**

Not fewer documents.

Not uniform formatting.

Fix the location of truth.

"Just look at this one."

That sentence has to hold.

You need one such document. It's called SSOT.

**Single Source of Truth.**

**The one scripture of absolute truth.**

**The one document AI must consult no matter what it's doing.**

**Fail to create this and the dragonfly you're building will sprout elephant legs and eagle wings. You'll have a chimera before you know it.**

---

**So what do you actually do?**

Bottom line, nothing fancy.

A human has to mark where work begins and where it ends.

When work starts, point to the exact spec document.

"Okay, next task is this. Let's plan the implementation based on this doc."

Not telling AI what to do -- fixing where it should think from.

---

When work ends, same thing.

Point to the exact progress tracking document and say:

"Log what you just did here. Check what's next."

Don't make a new document. Write here. I'm telling you where.

This one, then that one.

One by one.

Step by step.

You have to spell it out every single time.

---

Tedious.

Incredibly tedious.

Like following your kindergartner around.

Wiping his nose when it runs.

Putting on a bib before he eats.

Wiping his mouth with a wet wipe.

"Your nose is stuffed. Blow. Blow! Harder!"

That's what it feels like.

Yep.

That's exactly the level.

---

**But what happens if you don't design this?**

AI keeps working diligently.

And the project keeps falling apart diligently.

Docs multiply. Features split. Standards vanish.

AI did nothing wrong.

Nobody told it "come back here."

So the starting point of vibe coding isn't a smarter prompt.

It's a structure where a human marks where work begins and ends.

Don't design that part, and AI will diligently destroy everything.

---

Of course, teaching it one thing at a time, pointing to documents, manually marking starts and ends -- that's not normal human behavior.

Keep doing this and you're not using AI.

You're a kindergarten teacher.

So next post, I'll talk about how to stop doing this manually.

How to stop saying "this document is the standard" every time work starts.

How to stop pointing to "write it here" every time work ends.

A system that keeps AI from mixing up its starting doc and its home doc.

In other words:

A system that blows its own nose without you yelling "Blow!"

Next post covers that structure.
