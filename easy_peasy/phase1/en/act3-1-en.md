# Fix One Thing, Three Things Break

Had to add a new feature.

Opened the code.
No idea where to put it.

Opened the notification folder.
Code reading user settings was in there.
Why here?

Opened the agent folder.
Code sending notifications was in there.
Why here?

Opened the user folder.
Code referencing agent state was in there.
Why here?

What is where.

---

Built it anyway.
Put the new feature in the agent folder.
Ran it.
Worked.

Next day.

Notifications firing twice.

"What? I never touched the notification code."

Opened the code.
The new code changed the agent state.
User settings were referencing that agent state.
Settings changed, so notifications fired again.

A -> B -> C -> A.
Circular dependency.
No starting point.

---

"Fixed it."

Fixed the double notification.
Then the logs stopped.

Fixed the logs.
Then user settings got reset.

Fixed user settings.
Then notifications fire three times.

Worse than before.

---

Pulled one end of a tangled thread to untangle it.
The other side tightened.
Pulled that side, another spot tightened.

Three spots tangled at once and you don't know which to pull first.
The more you pull, the worse it gets.

Fix one thing, three things break.

---

How did it get this way.

Built the notification code first.
Needed the user's name to send a notification.
Pulled it from user code.
Natural.

Built the agent code.
Agent finishes, needs to send a notification.
Pulled from notification code.
Natural.

Built user settings.
Should be able to turn off notifications per agent.
Pulled from agent code.
Natural.

Each step was "natural."
But three steps form a circle.

---

I'm not a developer.
Architecture? What's that.

But I felt where it was tangled. In my bones.

I didn't create the bugs.
The structure is the bug.

Each line of code is correct.
Each feature works on its own.
But everything is tangled together.

SDD nailed "what to build."
But "where to put it" was never decided.

Never asked that question.
Never asked, so the code tangled itself.

Structure rots when you don't define it.
