# I Wrote a Spec. So What.

Learned what a spec is.
Organize your frustration and it becomes a spec.
Purpose, reason, method, means. Four boxes.

So I wrote one.
Fifteen pages.

Threw it at Claude.
"Build this according to the spec."

I was proud.
This time it's different. This time there's direction.
I have a spec. I have a plan.

---

First day. Build blew up.

Timeout.
Compilation died past the two-minute mark.

"What? That wasn't in the spec."

Of course not.
The spec didn't say "compilation must finish under two minutes."
Didn't know that was something to write down.
Didn't even think of it.

Fixed it.
Raised the timeout limit.

---

Next day. Blew up again.

Different reason this time.
Existing code showed up out of nowhere.

AI built a new feature that collided with code that was already there.
"Um... this feature already exists."

AI said that.
I didn't know.

That code was something I asked for a week ago.
I asked for it and forgot about it.
Because it wasn't in the spec.

---

Third day. Blew up again.

This time, something truly weird.
A feature that worked yesterday stopped working.

Asked the AI.
"It worked yesterday. Why doesn't it work now?"

"The newly added module altered the dependencies of the existing module."

What?
Say that in plain English.

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
It didn't cover what would break in reality.
Couldn't have.
Nothing had broken yet.

---

So I made a PROBLEMS.md.

Every time I got punched, I wrote it down.
"Where I got hit. Why I got hit. How I dodged it."

Day one: build timeout. Cause: dependency chain too long. Fix: split build config.
Day two: code collision. Cause: existing features not in the spec. Fix: add feature inventory.
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
Writing down the changes—that's what a plan is.

---

Getting punched is fine.
Solve it. Record it. Move on.

But there was one more problem.
The "where" of recording was the problem.
