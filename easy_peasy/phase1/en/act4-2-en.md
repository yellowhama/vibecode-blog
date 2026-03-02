# Defining "Done"

Asked the AI.

"I hate checking everything after every change. Any way around it?"

"Write tests."

---

Tests?

Isn't that a developer thing?
Code under the code.
`assert` this, `expect` that.

I can't read code.
Tests are code.
How would I even.

---

The AI said:

"A test is writing down 'if this works, we're done.'"

Wait.

"If this works, we're done?"

How is that different from a spec?

"A spec is 'what to build.'
A test is 'how to verify it's built.'"

---

Example.

Spec: "When the user logs in, the dashboard appears."

That's what to build.

Test: "Click the login button → dashboard screen appears → username is displayed."

That's how to verify it's built.

Spec is the destination.
Test is arrival confirmation.

If the spec is "go to Seoul,"
the test is "standing in front of Seoul Station."

---

But the key is "first."

You don't write tests after writing code.
Before writing code, you write "if this works, it's a success."

"Logging in shows the dashboard."
Write that down first.

Then write the code.
Code passes this bar? "Done."
Doesn't pass? "Not done."

The bar exists first, so judgment is possible.
No bar means you can't tell "done" from "probably done."

---

This is called TDD.

Test-Driven Development.

Another grand name.
But again, the essence is simple.

**Define "done" before you start.**

In Act 2, SDD: "Write down what to build first."
In Act 3, DDD: "Name where things go."
In Act 4, TDD: "Define the success criteria first."

All "first."
Write first. Name first. Define first.
Implementation is always last.

---

Give the AI these criteria and everything changes.

"Write code that passes these tests."

AI writes the code.
AI runs the tests.
Pass? "Done."
Fail? AI fixes it.

I don't have to click through anything.
The tests verify.

---

"But how do I write tests?"

You don't. You define the criteria.

"Logging in shows the dashboard."
"Notification fires exactly once."
"Changing settings saves them."

Write these in plain language.
Give them to the AI.
"Write test code that matches these criteria."

AI writes it.
Can't read code? Doesn't matter.
Just define the criteria.

Decisions are mine.
Implementation is the AI's.
Verification is the tests'.

---

Learned this in Act 1.

"Only one thing isn't free.
Deciding what to build."

Same in TDD.

"Only one thing isn't free.
Deciding what counts as done."

Decisions.
Always decisions.
What AI can't do is always decisions.
