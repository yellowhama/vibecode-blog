# I Wrote a Spec. So What.

For the first time, I felt confident.

Fifteen pages.
Purpose, reason, method, means. Wrote it all down.

Threw it at Claude.
"Build this according to the spec."

This time it's different.
This time there's direction.

---

First day. Build blew up.

Timeout.
Compilation died past the two-minute mark.

"What? That wasn't in the spec."

Of course not.
The spec didn't say "compilation must finish under two minutes."
Didn't know that was something to write down.
Didn't even occur to me.

Fixed it.
Raised the timeout limit.

---

Next day.
Blew up again.

Different reason this time.
Existing code showed up out of nowhere.

The AI's new feature collided with code that was already there.
"Um... this feature already exists here."

The AI said that.
I didn't know.

That code was something I asked for a week ago.
I asked for it and forgot about it.
Because it wasn't in the spec.

---

Third day.
Blew up again.

This time, something truly weird.
A feature that worked yesterday stopped working.

"It worked yesterday. Why doesn't it work now?"

"The newly added module altered the dependencies of the existing module."

Say it simply.

"The new part you attached messed with the wiring of the old parts."

Ah.

---

Three days straight. All failures.
I had a spec.

"Everyone has a plan
until they get punched in the mouth."

Mike Tyson said that.
This was exactly that situation.

Walked into the ring with fifteen pages of spec.
First round. Got hit.
Second round. Got hit again.
Third round. Got hit again.

Was the spec the problem?
No.
The spec was fine.

But the spec only said "what to build."
What would break in reality wasn't in there.
Couldn't have been.
Nothing had broken yet.

---

So I made a PROBLEMS.md.

Every time I got punched, I wrote it down.
"Where I got hit. Why I got hit. How I dodged it."

Day one: build timeout. Cause: dependency chain. Fix: split build config.
Day two: code collision. Cause: no existing feature inventory. Fix: add the inventory.
Day three: dependency mutation. Cause: module connections undocumented. Fix: add dependency map.

Wrote it down. Then I could see.
The pattern emerged.

All the same problem.
**When a spec meets reality, the spec has to change.**
But I wrote the spec once and shoved it in a drawer.

---

A spec is not a diary.

A diary you write once and never look at.
A spec you read every day. Fix every day.

Fix it every time you get punched.
"Got hit here. Add this item."
"This was wrong. Revise."
"This was missing. Fill in."

Write a spec once and call it done? That's a wish.
"I hope this works out."

Wishes don't come true.
Plans come true.
Plans change every time you take a punch.
Writing down the changes -- that's what a plan is.

---

Getting punched is fine.
Solve it. Record it. Move on.

But there was one more problem.
The "where" of recording was the problem.
