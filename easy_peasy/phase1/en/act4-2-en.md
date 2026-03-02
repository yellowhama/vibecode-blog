# Defining "Done"

Asked the AI.

"I don't want to check everything every time I change code. Is there a way?"

"Write tests."

---

Tests?

Isn't that a developer thing?
Writing more code underneath the code.
`assert` this, `expect` that.

I can't read code.
Tests are code.
How am I supposed to do that.

---

The AI said:

"A test is writing down 'if this works, it's done.'"

Wait.

"If this works, it's done?"

How is that different from a spec?

"A spec is 'what you're building.'
A test is 'how you confirm it's built.'"

---

Example.

Spec: "When a user logs in, the dashboard appears."

That's what you're building.

Test: "Click the login button. Dashboard screen appears. Username is displayed."

That's how you confirm it's built.

Spec is the destination.
Test is the arrival confirmation.

If the spec is "go to Seoul,"
the test is "standing in front of Seoul Station."

---

The key is you write it first.

You don't write tests after writing code.
You write "if this works, it's a success" before you write the code.

"Login shows the dashboard."
Write that down first.

Then write the code.
Code passes this bar? "Done."
Doesn't pass? "Not done."

The bar comes first, so you can judge "done."
No bar means you can't tell "done" from "probably done."

---

They call this TDD.

Test-Driven Development.

Another grand name.
But the essence is simple again.

**Setting the bar for "done" first.**

"Write down what you're building first." SDD.
"Name where it goes." DDD.
"Set the bar for done first." TDD.

All about "first."
Write first. Name first. Set first.
Implementation is always last.

---

Give the AI this bar and everything changes.

"Write code that passes this test."

AI writes the code.
AI runs the test.
Passes? "Done."
Fails? AI fixes it.

I don't have to click through anything.
The test confirms it.

---

"But how do I write tests?"

You don't.
You just set the bar.

"Login shows the dashboard."
"Notification fires exactly once."
"Settings change gets saved."

I can't read code.
But I can write "if this works, it's a success" in plain language.

Give that to the AI.
"Write test code that matches this bar."

AI writes it.
Can't read code? Doesn't matter.
Just set the bar.

Decisions are mine.
Implementation is the AI's.
Verification is the test's.

---

There's exactly one thing that isn't free.

Deciding what "done" looks like.

A decision.
It's always a decision.
The thing AI can't do is always a decision.
