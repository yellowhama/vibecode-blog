# Fix One Thing, Three Things Break

The SDD loop was running smoothly.

Write the spec. Make a plan. Break it down. Build it.
Verify. Update the spec.
Repeat.

Added a new feature.
"Let agents share work results with each other."

Wrote the spec.
Made the plan.
Built it.
Ran it.
It worked.

Good.

---

Next day.

Existing features broke.

Notifications firing twice.
Logs tangled.
Features that worked yesterday stopped working.

"What? I didn't touch any of this."

Opened the code.

Notification code had user code inside it.
User code had agent code inside it.
Agent code had notification code inside it.

Wait.
Isn't this a circle?

A calls B.
B calls C.
C calls A again.

Circular dependency.
A Möbius strip.
No starting point.

---

"Fixed" the notification issue.

Notifications stopped doubling.

But logs stopped working.

Fixed the logs.

User settings got reset.

Fixed user settings.

Notifications now fire three times.

What.
It's worse than before.

---

Picture this.

Tangled thread. You pull one end to untangle it.
The other end tightens.
Pull that end—another spot tightens.

Three spots tangled at once and you can't tell which to pull first.
The more you pull, the worse it gets.

Fix one thing, three things break.

---

Asked the AI.
"Why is this happening?"

"The modules have circular dependencies.
A references B, B references C, C references A."

I know that.
Why did it get this way?

"Each module directly imports whatever functionality it needs.
This structure forms naturally over time."

Naturally?

---

It was natural.

Built the notification code first.
Needed the user's name to send a notification.
Pulled it from user code.
Natural.

Built the agent code.
Agent finishes, needs to send a notification.
Pulled from notification code.
Natural.

Built user settings.
Users should toggle notifications per agent.
Pulled from agent code.
Natural.

Each step was "natural."
But three natural steps form a circle.

The circle was never intentional.
Took one natural step at a time and ended up back at the start.

---

Five agents building the same function five different ways.
Saw that in Act 1.

Back then, duplication was the problem.
Now, connection is the problem.

Duplication? Delete it.
Connection? Cut it and things break.

Connection is scarier than duplication.

---

This wasn't me creating bugs.
The structure is the bug.

Each line of code is correct.
Each feature works on its own.
But everything is tangled together.

SDD nailed "what to build."
But "where to put it" was never decided.

Should notification code directly call user code?
Should agent code directly send notifications?

Never asked those questions.
Never asked, so the code tangled itself.

Structure rots when you don't define it.
