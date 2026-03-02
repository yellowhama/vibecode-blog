# The Day I Ran Everything by Hand

Spec exists.
PROBLEMS.md exists.
Learned about SSOT.

Every day. Open the spec. Fix it. Throw it at the AI.
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

"Do I have to do this every single time?"

---

Added a new feature.
"Build a user notification system."

AI built it.
In Python.

Next day.
Asked for something similar.
"This time, a log collection module."

AI built it.
In TypeScript.

"Yesterday was Python."

"Yes, Python was more suitable yesterday, and TypeScript is more suitable today."

What do you mean suitable.
Same project.

---

Another one.

"Build the entire agent system."

AI dumped a thousand lines.
All at once.

Ran it.
Blew up.
No idea where it broke.

A thousand lines. Where's the problem?
I can't read code.
Asked the AI.
"Where did it break?"

"Type error on line 375."

Fixed it.
Blew up again.
"This time, line 512."

Fixed it.
Blew up again.
Third time.

Dump a thousand lines at once and this is what happens.
Can't tell where it broke.
Fix one thing, another breaks, fix that, another breaks.

---

Two things became clear.

AI picks a different tech every time.
-> Never decided the tech upfront.
-> **No Plan.**

A thousand lines dumped at once.
-> Never broke it into pieces.
-> **No Tasks.**

Spec existed.
"What to build" was written down.
But "how to build it" wasn't.
"Build the whole thing at once" -- that's what I threw at it.

Two things missing between spec and implementation.
Tech decisions.
Task decomposition.

---

Tried it myself.

"This feature uses TypeScript. Runs on the Rust runtime. Uses the existing transport module."

Wrote that down before throwing it at the AI.
Python stopped showing up.
Because it was written down.

Broke "the agent system" into pieces.
"1. Data collection module."
"2. Test the collection module."
"3. Evaluation module."
"4. Connect collection and evaluation."

Built one piece at a time.
One piece breaks? Fix that piece.
The rest stayed intact.

---

Found out later.

Someone had already organized this.

Specify -> Plan -> Tasks -> Implement.
Four stages.

Specify: what to build and why.
Plan: which tech, what constraints.
Tasks: break the big thing into small pieces.
Implement: build one piece at a time.

Reading it gave me chills.
Isn't this what I figured out the hard way?

---

It had a name.

Spec-Driven Development.
SDD for short.

"Write first. Build later."

Would it have been better to know the name first?
Not sure.
If I hadn't gone through it myself, I would've read "four stages? cool" and moved on.
Because I went through it, it gave me chills.

---

So I made a CLAUDE.md.

A file the AI reads automatically at the start of every session.
Wrote this in it:

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
