# I Don't Know If It's Right

Domain splitting was done.
Code was clean.
Added a new feature. Ran it. Worked.

"Did it actually work?"

Checked manually.
Login. Works. Agent execution. Works. Notification. Arrived. Settings change. Saved.

Next day. One small change.
Checked everything again. Thirty minutes.
Another change. Another thirty minutes.

"Do I have to check everything every time I make a change?"

---

Yes.
If you don't, you won't know what broke.

Ten features? Fine.
Now fifty.
Fifty every time?

Around the fifth check, things change.
"This one probably didn't break."
Skip.
That's exactly the door bugs walk through.

Manual testing isn't a time problem.
It's a willpower problem.

---

Asked the AI.
"Hate checking everything. Any way around it?"
"Write tests."

Tests? Isn't that a developer thing?

"A test is writing down 'if this works, we're done.'"

Wait. How is that different from a spec?

"A spec is 'what to build.'
A test is 'how to verify it's built.'"

If the spec is "go to Seoul,"
the test is "standing in front of Seoul Station."

---

But the key is "first."

Before writing code, you write "if this works, it's a success."
"Logging in shows the dashboard."
Write that first.

Code passes this bar? "Done."
Doesn't pass? "Not done."

The bar exists first, so judgment is possible.

This is TDD.
Test-Driven Development.
**Define "done" before you start.**

---

Give the AI the criteria.

"Write code that passes these tests."
AI writes it. AI runs it. Pass? "Done."
Fail? AI fixes it.

I don't have to click through anything.
Tests verify.

"But how do I write tests?"
You don't. You define the criteria.

"Logging in shows the dashboard."
"Notification fires once."
"Settings changes save."

Write in plain language. Give to AI.
"Make test code matching these criteria."

Decisions are mine. Implementation is the AI's. Verification is the tests'.

---

Started with five tests.
Five became fifty. Fifty became five hundred.
Now? 6,260.
849 Rust. 5,411 TypeScript.
All in one minute.

"Did that change break anything?"
Run tests. Thirty seconds. All PASS.
"Nope."

That moment of freedom.
Code can be changed. Without fear.
"If it breaks, tests catch it."

---

But honest confession.

All 6,260 passed.
Production: sixty-nine problems showed up.

Tests aren't perfect.
They only check "situations I thought of."
Situations I didn't think of? Can't catch.

But when those 69 appeared, it wasn't panic. It was a list.
Fixed one by one. Added a test with each fix.
69 became 0. 6,260 became 6,329.

Tests aren't perfect.
But 6,260 times better than nothing.

---

Looking back, it was all connected.

Write the spec. → Direction appears. (SDD)
Name things. → Structure appears. (DDD)
Define "done." → Verification becomes possible. (TDD)

**Fix "what."**
**Fix "where."**
**Fix "done."**

Without these three, AI goes a different direction every time.
With them, AI moves consistently.

Vibe coding isn't "coding by feel."
It's building with AI.
Decisions are mine. Implementation is the AI's. Verification is ours together.

---

The spec is the road.
The domain is the lane markings.
The tests are the guardrails.

No road? Sprint into a dead end.
No lanes? Crash into the car beside you.
No guardrails? Drive off the cliff.

---

I'm not a developer. Still not.

But I know three things.
Write down what you're building first.
Name where things go.
Define "done" before you start.

With these three, you can build with AI.
Without them, it's luck.
With them, it's a system.

Frustration becomes the spec.
The spec becomes the system.
The system becomes freedom.
