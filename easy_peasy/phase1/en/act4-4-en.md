# Three Things Become One

A new feature came in.

QUIC tunnel fails, auto-switch to HTTP.
They call it fallback.

Before, I would've just started.
"Just build it."

---

Not anymore.

Write it down first.

"What am I building."
When the QUIC connection drops, auto-switch to HTTP.
The user doesn't know. Doesn't notice the connection dropped.

"What does done look like."
QUIC failure -- HTTP switch within 3 seconds -- existing session stays alive.

"Why am I building this."
Some networks block QUIC.
When that happens, the app can't freeze.

Wrote the spec first.

---

Next.

"Where does this belong."

Network world.
transport folder.

Not notifications.
Not user settings.
Not agent execution.

It's a connection and switching problem. So transport.

Named the place first.

---

Next.

"What counts as done."

Wrote the tests first.

"QUIC connection drops, switches to HTTP."
"Switch happens within 3 seconds."
"No data loss during switch."
"Existing session ID persists."

Wrote that in plain language and handed it to the AI.
AI wrote the test code.

Then started implementing.

---

Three days. Done.

All tests passed.
No other features broke.
6,260 -- all PASS.

Landed clean inside the transport folder.
Didn't touch notification code.
Didn't touch user code.

---

What would've happened before?

Would've started without a spec.
AI would've shoved network logic inside the notification code.
"It was convenient here."

Would've shipped without tests.
Something would've blown up the next day.
Would've spent forever finding where.

Two weeks. Three blowups.

---

Three days versus two weeks.

The difference isn't skill.
It's sequence.

Wrote down what I'm building first.
Decided where it goes first.
Set the bar for done first.

Implementation was last.

---

The three don't spin separately.

Specs set the direction.
Structure sets the position.
Tests confirm the result.

Remove one and it collapses.

No direction? You end up with twenty-eight left arms.
No position? Fix one thing, three things blow up.
No confirmation? Ship it and you don't know if it "worked."

All three have to mesh.

---

**Lock down the "what."**
**Lock down the "where."**
**Lock down the "done."**

Lock them down and the AI sprints inside the rails.
Fast. Accurate. Consistent.

Don't lock them down and the AI wanders in a different direction every time.
Fast. Convincing. Different every time.

Rails mean a sprint.
No rails mean drifting.

---

All of it came from yak shaving.

Didn't learn this from textbooks.
Builds blew up.
Twenty-eight left arms appeared.
Fix one, three more break.
Lying awake at night thinking "is this even right?"

The rabbit holes created the questions.
The questions found the concepts.
The concepts got names.
SDD. DDD. TDD.

Names meant I could search.
Searching meant I found out I wasn't alone.

---

I'm not a developer.
Still not.

Can't read code.
That hasn't changed.

But I know three things.

Write down what you're building first.
Name where it goes.
Set the bar for done first.

With these three things,
I can build with AI.

Without them, it's luck.
With them, it's a system.

---

Frustration becomes the spec.
Specs become the system.
Systems become freedom.
