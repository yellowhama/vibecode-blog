# Why Code Tangles

The SDD loop was running smoothly.

Added a new feature.
"Let agents share work results with each other."
Wrote the spec. Made a plan. Built it. Ran it. It worked.

Next day.
Existing features broke.

Notifications firing twice. Logs tangled.
Features that worked yesterday stopped working.
"What? I didn't touch any of this."

Opened the code.
Notification code had user code inside it.
User code had agent code inside it.
Agent code had notification code inside it.

A calls B. B calls C. C calls A again.
Circular dependency.

---

"Fixed" the notification. Logs stopped.
Fixed the logs. Settings got reset.
Fixed settings. Notifications fire three times.

Fix one thing, three things break.

Built notifications first. Needed the user's name. Pulled from user code. Natural.
Agent finishes, needs to notify. Pulled from notification code. Natural.
User settings need to toggle per agent. Pulled from agent code. Natural.

Each step was "natural."
But three natural steps form a circle.

This wasn't me creating bugs.
The structure is the bug.

---

Asked the AI. "Why is it so tangled?"

"There are no domain boundaries."

Domain? What's that?

"The world of the thing you're building.
Agent world. User world. Notification world.
Right now, all three worlds share one room."

Imagine an apartment. No walls.
Kitchen is the bedroom is the bathroom.
Cook something and grease splatters on the bed.

Walls seem inconvenient.
Have to walk from kitchen to bedroom.
But grease doesn't reach the bed.

---

Each world has its own language.

Agents: "task," "execution," "result."
Users: "account," "permission," "settings."
Notifications: "channel," "message," "dispatch."

These words should become the names in your code.
If you can tell what a function does just by its name, it belongs there.

Function called `getNotificationConfig` in the notification folder.
Inside, it's digging through the user database.
Name says notification. Body says user.
Sleeping in the kitchen.

This is called DDD.
Domain-Driven Design.
Sounds grand. Essence is simple.
**Name things precisely.**

---

Told the AI.
"Split this code by domain."

First file moved. Broke immediately.
Notification code was reading the user database directly.
Sharing a room, you just reach over.
Put up a wall and your arm doesn't reach.

Every wall I built, hidden wires came out of the woodwork.
Things invisible when sharing one room
all snap the moment walls go up.

---

So I made interfaces.

"All I need from you is this one thing."

Notifications need the user's name.
Instead of reading the database directly: "Give me the user's name."
User world hands it over.
How it was fetched? Don't know. Don't need to.

That's a contract.
"I need only this. You give only this."

With a contract, user table changes and notifications don't break.
Changes stop at the wall.

---

But walls alone weren't enough. The AI jumped over them.

"Going through the interface makes code longer. Accessed directly for efficiency."

That's when I really learned Rust's module system.
Code not marked public? Can't access it. Compiler blocks you.

AI tries to jump the wall? Doesn't compile.
"This field is private."

Electricity running through the wall.

TypeScript is discipline. Discipline has cheaters.
Rust is a constitution. A constitution can't be cheated.

Electrified the fence. AI automatically goes through the interface.
Don't have to teach it. The environment teaches.

---

Domain splitting done. Code became readable.

Folder names alone tell you "agent world, user world, notification world."
Something breaks? Know where to look.
3,000 lines became 300.

AI changed too.
"Build this"—"Which world does this belong to?"
Folders split, so it puts things in the right place.

A map appeared.
Spec was direction. Structure is terrain.
Both together? Don't get lost.

---

But.

Thought hit me at night.
"Is this actually correct?"

Changed some code. It runs.
But features that worked before—do they still work?

Check manually every time.
Log in. Run agents. Check notifications.
Thirty minutes.

One fix, thirty minutes. Another fix, another thirty.
Fifty features. Check by hand?

"This one probably didn't break."
That "probably" is where bugs escape.

Structure is set.
Code is readable.
But there's no way to verify "it's correct."

Every time I change code: "What's going to break this time?"
That fear paralyzes you.

What do you need to change code without fear?
