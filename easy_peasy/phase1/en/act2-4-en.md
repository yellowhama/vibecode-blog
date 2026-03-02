# Repetition Worked. But...

The SDD loop was running.

Added a new feature.
File change detection.
One computer edits a file, the other computers need to know.

Specify: "When a file changes, notify connected devices. Sync only the changed file."
Plan: "Use Rust's notify crate for file watching. Existing transport module for transmission. TypeScript UI for display."
Tasks: "1. Detect file changes. 2. Send change events. 3. Sync on the receiving end. 4. UI notification."

Four pieces.
Built them in order.
Verified them in order.
Two days.
Done.

---

Before this?

No spec. Just "build file sync."
AI would have built the whole thing from scratch.
Ignored the existing transport module.
Made a new connection method.
Collided with existing code.

A week.

---

The numbers changed.

Same feature getting built four times.
Once.
Because SSOT existed.

Three hours to solve one problem.
Forty-five minutes.
Because PROBLEMS.md existed.

Error rate 40%.
5%.
Because Plan locked the tech and Tasks broke the bomb into pieces.

---

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

I was satisfied.
Genuinely.

Didn't know what a spec was. -> Wrote one.
Wrote it and shoved it in a drawer. -> Now I update it daily.
Ran everything by hand. -> A system runs it.

Growth.
Absolutely.

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
