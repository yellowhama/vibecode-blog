# The Day a Spec Became a System

Running it by hand.

Open the spec. Read it. Throw it at the AI.
Check the result. Fix the spec.
Update PROBLEMS.md.
Refresh the project doc.
Throw it at the AI again.

This loop.
Every day.
Manually.

Forget one step and it breaks.
Don't log in PROBLEMS.md? Get hit in the same spot again.
Don't update the project doc? AI builds from scratch again.

"Do I have to do this every time?"

---

That's when I found Spec Kit.

Open-source tool from GitHub.
Four stages.

Specify → Plan → Tasks → Implement.

Read through it.

Specify: write down "what you're building and why." No tech talk.
Plan: write down "how to build it." This is where you pick your tech.
Tasks: break the big chunk into small pieces. Each piece independently verifiable.
Implement: build one piece at a time.

Reading it gave me chills.

Isn't this what I've been doing by hand?

---

Exactly.

Writing the spec = Specify.
Building from the spec = Implement.

But I'd been skipping two steps.
Plan and Tasks.

I wrote the spec and went straight to "build it."
Jumped over the middle.

Plan: which tech to use. What constraints exist. How it fits with existing code.
Never decided any of that.
So the AI picked a different tech every time.
Sometimes Python. Sometimes TypeScript. Sometimes both.

Tasks: don't ask for everything at once. Break it down.
Didn't do that either.
"Build the whole system at once."
So when it broke, couldn't tell where.

---

In Specify, you write "why" first.
No tech talk.

"What does the user want to do?"
"What problem does this solve?"
"What counts as 'done'?"

That's Specify.
The "purpose, reason, method, means" from Act 1 live here.

---

In Plan, you finally pick your tech.

"Rust? Python? TypeScript?"
"Where will it clash with existing code?"
"Which libraries?"

Decide this upfront and the AI won't pick something else.
Say "use Python" and Rust won't show up.
It's in the Plan.

Why did I get punched with a "build timeout" on day one?
No Plan.
Build environment, dependencies, timeout limits.
Had I written those in the Plan, day one wouldn't have hurt.

---

In Tasks, you break the big thing down.

"Build the entire agent system."

Say that and the AI dumps a thousand lines at once.
Can't tell where it broke.
Can't tell what's right and what's wrong.

Instead, break it down.

"1. Build the data collection module."
"2. Test the collection module."
"3. Build the evaluation module."
"4. Connect collection and evaluation."

Each piece runs independently.
One piece breaks? Fix that piece.
The rest stays intact.

---

Write it down and half the problem dissolves.

Don't write it down? Neither the AI nor I know what's going on.
Write it down? The AI reads it.
Reads it? Context forms.
Context exists? 90% solved.

Before: problems that took 3 hours.
After: 45 minutes.

Before: the same feature built 4 times.
After: once.

Before: 40% error rate.
After: 5%.

The numbers changed for one reason.
Wrote it down.

---

But writing isn't everything.

If the AI doesn't read what you wrote, it's useless.

"Read this document first."

Having to say that every time makes you a kindergarten teacher.
"Did you wash your hands?" "Did you put on your shoes?" "Did you pack your bag?"

So I made a CLAUDE.md.

A file the AI reads automatically at the start of every session.
Wrote this in it:

"The spec for this project is here."
"The existing feature list is here."
"Decide before you code."

Now I don't have to ask every time.
The environment asks.

---

Words evaporate.
Environment stays.

No matter how good your prompts are.
One well-set-up work environment beats them all.

Specify → Plan → Tasks → Implement.
These four stages are the environment.

Spec exists, so direction is set.
Plan exists, so tech is locked.
Tasks are broken down, so nothing blows up all at once.
Implementation comes last. Not first—fourth.

This is Spec-Driven Development.
SDD for short.

"Write first. Build later."

But I learned the name after the fact.
At first it was just "that thing I do by hand."
Didn't know it had a name.

Knowing the name meant I could search for it.
Searching meant I found out other people do this too.
I wasn't alone.

---

A spec went from document to system.

Not something you write once and shove in a drawer.
A loop: update daily, feed into plans, break into tasks, build, verify.

When this loop runs, repetition becomes possible.
Next feature? Same process.
Feature after that? Same process.

Not luck. A system.
