# I Don't Know If It's Right

Shipped a new feature.
Checked it. It worked. Shipped it.

Next day.
A different feature was dead.

"But I checked?"
Checked that feature. Didn't look at the others.

So I decided to check everything from then on.
Login. Agent. Notification. Settings. Thirty minutes.
Every change. Thirty minutes.

"Do I have to check everything every time I make a change?"

---

Yes.
Because if you don't, you won't know what broke.

Ten features? Fine.
Now fifty.
Fifty every time?

Around the fifth check, things change.
"This one probably didn't break."
Skip it.
That's exactly the door bugs walk through.

Manual testing isn't a time problem.
It's a willpower problem.

---

Asked the AI.
"I don't want to check everything. Is there a way?"
"Write tests."

Tests? Isn't that a developer thing?

"A test is writing down 'if this works, it's done.'"

Wait. How is that different from a spec?

"A spec is 'what you're building.'
A test is 'how you confirm it's built.'"

If the spec is "go to Seoul,"
the test is "standing in front of Seoul Station."

---

The key is you write it first.

You write "if this works, it's a success" before you write the code.
"Login shows the dashboard."
Write that down first.

Code passes this bar? "Done."
Doesn't pass? "Not done."

The bar comes first, so you can judge.

They call this TDD.
Test-Driven Development.
**Setting the bar for "done" first.**

---

Give the AI this bar and everything changes.

"Write code that passes this test."
AI writes it. AI runs it. Passes? "Done."
Fails? AI fixes it.

I don't have to click through anything.
The test confirms it.

"But how do I write tests?"
You don't. You just set the bar.

I can't read code.
But I can write "if this works, it's a success" in plain language.

Give that to the AI.
"Write test code that matches this bar."

Decisions are mine. Implementation is the AI's. Verification is the test's.

---

Started with five tests.
Five became fifty. Fifty became five hundred.
Now? 6,260.
849 in Rust. 5,411 in TypeScript.
Run them all in one minute.

"That code I just changed -- did it break anything?"
Run tests. Thirty seconds. All PASS.
"Nope."

That moment of freedom.
I can change code. Without fear.
"If it breaks, the tests catch it."

---

Without tests, I was too scared to touch anything.
With tests, I cut without hesitation.

Tests aren't feature verification.
They're courage.

---

But I have to be honest about something.

All 6,260 passed.
Sixty-nine issues showed up in production.

Tests aren't perfect.
They only check the situations I thought of.
Situations I didn't think of? Can't catch those.

But when those 69 showed up, it wasn't panic. It was a list.
Fixed them one by one. Added a test every time.
69 became 0. 6,260 became 6,329.

Tests aren't perfect.
But they're 6,260 times better than nothing.

---

A new feature came in.
QUIC tunnel fails, auto-switch to HTTP.

Wrote it down first.
"QUIC drops, switch to HTTP. Within 3 seconds. No data loss."

Where does it belong.
Network world. transport folder.

What counts as done.
"QUIC failure -- HTTP switch -- session persists." Wrote the tests first.

Three days. Done.
All tests passed. No other features broke. 6,260 -- all PASS.

What would've happened before? Two weeks. Three blowups.

---

The three don't spin separately.

Specs set the direction.
Structure sets the position.
Tests confirm the result.

Remove one and it collapses.

**Lock down the "what."**
**Lock down the "where."**
**Lock down the "done."**

Lock them down and the AI sprints inside the rails.
Don't lock them down and the AI wanders in a different direction every time.

Rails mean a sprint.
No rails mean drifting.

---

All of it came from yak shaving.

Didn't learn this from textbooks.
Builds blew up. Twenty-eight left arms appeared.
Fix one, three more break. Lying awake at night thinking "is this even right?"

The rabbit holes created the questions.
The questions found the concepts.
The concepts got names.
SDD. DDD. TDD.

---

I'm not a developer. Still not.
Can't read code. That hasn't changed.

But I know three things.
Write down what you're building first.
Name where it goes.
Set the bar for done first.

With these three things, I can build with AI.
Without them, it's luck.
With them, it's a system.

Frustration becomes the spec.
Specs become the system.
Systems become freedom.
