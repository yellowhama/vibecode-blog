# I Thought the Spec Was Enough

For the first time, I felt confident.

Fifteen pages.
Purpose, reason, method, means. Wrote it all down.

Threw it at Claude.
"Build this according to the spec."

This time it's different.
This time there's direction.

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
A feature that worked yesterday stopped working.
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
"Build this" -- it builds.
Nobody said "delete that" -- so it doesn't.

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
After that, "build this" -- and the AI checks first.
"Something similar already exists. Should I modify it?"

With docs: genius.
Without docs: blind genius.

---

I'm not a developer.
Didn't know how to organize.

But I learned what happens when you don't.
Twenty-eight left arms.
That's the result of not organizing.

---

But all of this was happening by hand.

Open the spec. Read it. Throw it at the AI.
Check the result. Fix the spec.
Update PROBLEMS.md. Refresh the project doc.
Throw it at the AI again.

This loop. Every day. Manually.
Forget one step and it breaks.

"Do I have to do this every time?"

---

Added a new feature.
"Build a user notification system."

AI built it. In Python.

Next day. Asked for something similar.
"This time, a log collection module."

AI built it. In TypeScript.

"Yesterday was Python."

Same project. Different tech every time.

Another one.
"Build the entire agent system."
AI dumped a thousand lines. All at once.
Ran it. Blew up. No idea where it broke.
Fixed it. Blew up again. Fixed it. Blew up again.

---

Two things became clear.

AI picks a different tech every time.
-> Never decided the tech upfront.
-> **No Plan.**

A thousand lines dumped at once.
-> Never broke it into pieces.
-> **No Tasks.**

Two things missing between spec and implementation.
Tech decisions.
Task decomposition.

---

Tried it myself.

Wrote the tech decisions down before throwing it at the AI.
Python stopped showing up.

Broke the big thing into pieces.
One piece breaks? Fix that piece.
The rest stayed intact.

Found out later.
Someone had already organized this.

Specify -> Plan -> Tasks -> Implement.
Four stages.

Reading it gave me chills.
Isn't this what I figured out the hard way?

It had a name.
Spec-Driven Development.
SDD for short.
"Write first. Build later."

If I hadn't gone through it myself, I would've read "four stages? cool" and moved on.
Because I went through it, it gave me chills.

---

So I made a CLAUDE.md.
A file the AI reads automatically at the start of every session.

"The spec for this project is here."
"The existing feature list is here."
"Make a Plan before writing code."
"Don't build everything at once. Break it into Tasks."

Now I don't have to say it every time.
The environment says it.

Words evaporate.
Environment stays.
No matter how good your prompts are.
One well-set-up work environment beats them all.

A spec went from document to system.

---

The SDD loop was running.

Adding a new feature:
Specify: write down what to build.
Plan: decide how to build it.
Tasks: break it down.
Implement: build it.
Done? Update the spec.

Repeat. Same way every time.

Same feature getting built four times. Once.
Three hours to solve one problem. Forty-five minutes.
Error rate 40%. 5%.

The numbers changed for one reason.
Wrote it down.

Set up the environment too.
Wrote rules in CLAUDE.md.
"No coding without decisions."
"Spec first. Build later."
"Check existing code before starting."

This changed the AI.
Stopped building from scratch every time.
Checks existing code first.
Asks about anything not in the spec.

Not a kindergarten teacher anymore. A system was running.

---

I was satisfied. Genuinely.

Didn't know what a spec was. -> Wrote one.
Wrote it and shoved it in a drawer. -> Now I update it daily.
Ran everything by hand. -> A system runs it.

Growth. Absolutely.

---

But the code started growing.

More features meant more code.
Five thousand lines became ten thousand.
Ten thousand became twenty thousand.

SDD covered "what to build."
What to build -- got it.

But I opened the user settings screen.
Agent status was showing there.

Why is this here?

I know "what to build."
I don't know "where things should live."

Spec exists.
Structure doesn't.

SDD answered "what."
"Where" is the question now.

Where code should live.
That question needed an answer.
