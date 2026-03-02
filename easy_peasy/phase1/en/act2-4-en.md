# Repetition Worked. But...

The SDD loop was running.

Adding a new feature:
Specify: write down what to build.
Plan: decide how to build it.
Tasks: break it down.
Implement: build it.
Done? Update the spec.

Repeat.
Same way every time.

---

Refactored Boksuni.

Ten thousand lines became three thousand.
Could finally delete things.
Because I could now tell what was needed and what wasn't.

Forty-five minutes became twelve.
Got pissed at Python and switched to Rust. Just faster.

Failure rate dropped from 30% to 3%.
Less code. Fewer places to break.

Before and after. Crystal clear.

---

Set up the environment too.

Wrote rules in CLAUDE.md.
"No coding before decisions."
"Spec first. Build later."
"Check existing code before starting."

This changed the AI.
Stopped building from scratch every time.
Started checking existing code first.
Started asking when something wasn't in the spec.

Not a kindergarten teacher anymore. A system was running.

Set up the folder structure too.
Decided what goes where.
AI sees an empty folder and puts something appropriate in it.
Sees an empty drawer and tries to shove socks in.
But if the drawer says "socks," it puts socks.

The environment is the rule.
Say it out loud and it evaporates.
Write it in a folder and it sticks.

---

I was satisfied.
Genuinely.

Didn't know what a spec was. → Wrote one.
Wrote it and shoved it in a drawer. → Now I update it daily.
Ran everything by hand. → A system runs it.

Growth. Absolutely.

---

But.

Three thousand lines became five thousand.
Five thousand became ten thousand.
Ten thousand became twenty thousand.

More features mean more code.
Obviously.

But a different problem started showing up.

---

Added a new feature.
"Save agent execution results as logs."

Built it. Ran it. Worked.

Next day.
Notifications fire twice.

What?
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

---

SDD answered "what."

"What are we building?"
"What counts as done?"
"What comes first?"

But when a system grows, different questions emerge.

"Where should this live?"
"Who manages this data?"
"Does this feature belong in the same world as that feature, or a different one?"

"What"—I've got it.
"Where"—no clue.

Where code should live.
That question needed an answer.
