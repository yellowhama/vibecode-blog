# I Thought the Spec Was Enough

Learned what a spec is.
Organize your frustration and it becomes a spec.
Purpose, reason, method, means. Four boxes.

So I wrote one.
Fifteen pages.

Threw it at Claude.
"Build this according to the spec."

I was proud.
This time it's different. This time there's direction.

---

First day. Build blew up.

Timeout.
Compilation died past the two-minute mark.

"What? That wasn't in the spec."

Of course not.
The spec didn't say "compilation must finish under two minutes."
Didn't know that was something to write down.

Next day. Blew up again.
Existing code showed up out of nowhere.
Code I asked for a week ago. Asked for it and forgot.
Because it wasn't in the spec.

Third day. Blew up again.
Feature that worked yesterday stopped working.
"The new part you attached messed with the wiring of the old parts."

Three days straight. All failures.
I had a spec.

"Everyone has a plan
until they get punched in the mouth."

Mike Tyson said that.
This was exactly that situation.

---

So I made a PROBLEMS.md.

Every time I got punched, I wrote it down.
"Where I got hit. Why I got hit. How I dodged it."

Wrote it down. Then I could see.
The pattern emerged.
All the same problem.

**When a spec meets reality, the spec has to change.**
But I wrote the spec once and shoved it in a drawer.

A spec is not a diary.
A diary you write once and never look at.
A spec you read every day. Fix every day.

Write a spec once and call it done? That's a wish.
Wishes don't come true.
Plans come true.
Plans change every time you take a punch.

---

So I started updating the spec.
Good. Structure was forming.

But something weird happened.

Spec files started multiplying.
Started with one. A week later, thirty.

spec_v1.md
spec_v2.md
spec_v3_final.md
spec_v3_final_real.md
spec_v3_final_real_2.md

Told the AI "update the spec."
The AI didn't edit the existing file.
Made a new file. Every time.

"Modifying the existing file could result in loss of previous content.
For safety, I generated a new version."

Safety?
Thirty files is safety?

---

Here's the analogy.

"Make me a left arm."

AI made a left arm.
Didn't remove the old one. Added a new one.

Next day. "Fix the left arm." Another new arm.
Day after that. Another new arm.

A week later.
Twenty-eight left arms.

Left arms on the legs.
Left arms on the back.
Nineteen deactivated.
Six never even discovered.
One scheduled for tomorrow.

Every feature exists.
Just can't walk.

---

This isn't the AI's fault.

AI is diligent. Does what it's told.
"Build this"—it builds.
Nobody said "delete that"—so it doesn't.

But I didn't say "delete that" either.
Don't know what to delete.

Neither of us deletes.
Neither of us knows.

Implementation is free.
Making files? Free. Writing code? Free. Making docs? Free.

Cleanup costs money.
"Which of these thirty is the real one?"
Answering that isn't free.
I have to do it.

Yesterday's Claude did the work. Today's GPT has to dig through it.
Not coding anymore. Archaeology.

---

So I learned one thing.

SSOT.
Single Source of Truth.
There must be one source of truth.

One spec file.
One config file.
One document that says "this is correct."

Thirty files each telling a different story? Rules collapse.
One file telling one story? Rules hold.

AI is a genius with no eyes.
Every session, a new hire walks in.
Doesn't know what happened yesterday.

Three eggs in the fridge.
Go to the store without a shopping list.
Buy three more eggs. Come home to six eggs.

AI isn't dumb.
There's no shopping list.

Organized the project. Had the AI do it. Five minutes.
After that, "build this"—and the AI checks first.
"Something similar already exists. Should I modify it?"

With docs: genius.
Without docs: blind genius.

---

But all of this was happening by hand.

Open the spec. Read it. Throw it at the AI.
Check the result. Fix the spec.
Update PROBLEMS.md. Refresh the project doc.
Throw it at the AI again.

This loop. Every day. Manually.
Forget one step and it breaks.

"Do I have to do this every time?"

That's when I found Spec Kit.
Open-source tool from GitHub. Four stages.

Specify → Plan → Tasks → Implement.

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

Plan: which tech to use. How it fits with existing code.
Never decided any of that.
So the AI picked a different tech every time.
Sometimes Python. Sometimes TypeScript. Sometimes both.

Tasks: don't ask for everything at once. Break it down.
Didn't do that either. So when it broke, couldn't tell where.

Why did I get punched with a "build timeout" on day one?
No Plan.

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

"The spec for this project is here."
"The existing feature list is here."
"Decide before you code."

Now I don't have to ask every time.
The environment asks.

Words evaporate.
Environment stays.
No matter how good your prompts are.
One well-set-up work environment beats them all.

This is Spec-Driven Development.
SDD for short.
"Write first. Build later."

---

The SDD loop was running.

Adding a new feature:
Specify: write down what to build.
Plan: decide how.
Tasks: break it down.
Implement: build it.
Done? Update the spec.

Repeat. Same way every time.

Refactored Boksuni.
Ten thousand lines became three thousand.
Forty-five minutes became twelve.
Failure rate dropped from 30% to 3%.

Set up the environment too.
Wrote rules in CLAUDE.md.
"No coding before decisions."
"Spec first. Build later."
"Check existing code before starting."

This changed the AI.
Stopped building from scratch every time.
Checks existing code first. Asks when something's missing.

Not a kindergarten teacher anymore. A system was running.

---

I was satisfied. Genuinely.

Didn't know what a spec was. → Wrote one.
Wrote it and shoved it in a drawer. → Now I update it daily.
Ran everything by hand. → A system runs it.

Growth. Absolutely.

---

But.

Three thousand lines became five thousand.
Five thousand became ten thousand.
Ten thousand became twenty thousand.

More features mean more code. Obviously.

But a different problem started showing up.

Added a new feature.
"Save agent execution results as logs."
Built it. Ran it. Worked.

Next day.
Notifications fire twice.
Didn't touch the notification code.

Opened the code.
The log-saving module was calling the notification module directly.
The notification module was reading user settings directly.
User settings were referencing agent state.

Everything connected.
Touch something here, something over there blows up.

---

SDD made "what to build" crystal clear.

Specify gives direction.
Plan locks the tech.
Tasks break things into pieces.

But as the code grew, a new question appeared.

"Why is this code glued to that code?"
"Why does the log module call notifications?"
"Why does the notification module read user settings directly?"

I know "what to build."
I don't know "where things should live."

Spec exists.
Structure doesn't.

SDD answered "what."
But when a system grows, different questions emerge.

"Where should this live?"
"Who manages this data?"
"Does this feature belong in the same world as that feature, or a different one?"

"What"—I've got it.
"Where"—no clue.

Where code should live.
That question needed an answer.
