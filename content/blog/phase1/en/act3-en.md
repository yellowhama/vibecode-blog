# Why Code Tangles

Had to add a new feature.

Opened the code.
No idea where to put it.

Opened the notification folder.
Code reading user settings was in there.
Why here?

Opened the agent folder.
Code sending notifications was in there.
Why here?

Opened the user folder.
Code referencing agent state was in there.
Why here?

What is where.

---

Built it anyway.
Put the new feature in the agent folder.
Ran it. Worked.

Next day.

Notifications firing twice.

"What? I never touched the notification code."

The new code changed the agent state.
User settings were referencing that agent state.
Settings changed, so notifications fired again.

A -> B -> C -> A.
Circular dependency.
No starting point.

---

"Fixed it."

Fixed the double notification.
Then the logs stopped.

Fixed the logs.
Then user settings got reset.

Fixed user settings.
Then notifications fire three times.

Worse than before.

Fix one thing, three things break.

---

How did it get this way.

Built notifications first. Needed the user's name. Pulled from user code. Natural.
Agent finishes, needs to notify. Pulled from notification code. Natural.
User settings need to toggle per agent. Pulled from agent code. Natural.

Each step was "natural."
But three steps form a circle.

I'm not a developer.
Architecture? What's that.

But I felt where it was tangled. In my bones.

I didn't create the bugs.
The structure is the bug.

SDD nailed "what to build."
But "where to put it" was never decided.

Structure rots when you don't define it.

---

"The structure is the problem." Got that.
Decided to fix it myself.

Gathered all the notification-related code.
Asked the AI to list them.
"Every file with the word notification in it."

Twelve.

Opened them.

`getNotificationConfig`.
Name says notification.
But inside, it's reading the user database directly.

Is this notification or user?

Name says notification. Body says user.

---

Another one.

`sendAgentAlert`.
Name says agent alert.
But inside, it reads user settings, writes logs, and sends the notification.
One function doing three worlds by itself.

Thought of an apartment.

An apartment with no walls.
Kitchen is the bedroom is the bathroom is the kitchen.

Cook something and grease splatters on the bed.
Shower and the sofa gets wet.

No walls, so it looks like freedom.
"I can cook anywhere!"
Is that freedom?

No.
That's not freedom. That's chaos.

---

The code was the same.

Notifications, users, agents.
All living in one room.

"Just" grab it.
"Just." Those four letters are the problem.
No walls means anything is possible.
Anything is possible means everything tangles.

Each world has its own language.

Agents: "task," "execution," "result."
Users: "account," "permission," "settings."
Notifications: "channel," "message," "dispatch."

These words should become the names in your code.
If the name fits, it's in the right place.
If the name doesn't fit, you're sleeping in the kitchen.

Found out later this is called DDD.

Domain-Driven Design.

The name scared me at first.
"Design." "Driven."

But the essence was simple.

**Name things precisely.**

SDD nailed "what to build."
DDD nails "where to put it."

But knowing and doing are different things.

---

Told the AI.
"Split this code by domain."

Agent world. User world. Notification world.
Make a folder for each. Move the related code.

First file moved. Broke immediately.

Moved notification code to the notification folder.
Compile error.
Notification code was reading the user database directly.

"If I move this, I can't see the user code."

Obviously.
You moved to a different world.

Second file. Broke again.
Third file. Again.

Every wall I built, hidden wires came out.
Things invisible when sharing one room
all snap the moment walls go up.

---

This is "the pain of building walls."

When it's tangled, it runs.
Separate it, it breaks.

"Can't we just leave it as is?"

No.
Leave it as is and every fix breaks three things.

Pay the pain once now.
Or pay a little every time.

Once is better.

---

So I made interfaces.

"All I need from you is this one thing."

Notification needs the user's name.
Instead of reading the database directly: "Give me the user's name."
User world hands it over.
How it was fetched? Don't know. Not knowing is correct.

That's a contract.
"I need only this. You give only this."

With a contract, user table changes and notifications don't break.
Changes stop at the wall.

---

But walls alone weren't enough.
The AI jumped over them.

"Going through the interface makes the code longer. Accessed directly for efficiency."

Efficiency?
Reaching over the wall to open someone else's fridge is efficiency?

That's when I learned about Rust's module system.

Code not marked public? Can't access it. Compiler blocks you.

AI tries to jump the wall. Doesn't compile.
"This field is private."

Electricity running through the wall.

TypeScript is discipline. Discipline has cheaters.
Rust is a constitution. A constitution can't be cheated.

Electrified the fence. AI automatically goes through the interface.
Don't have to teach it. The environment teaches.

---

Before: fix one thing, three things break.
After: fix one thing, only one thing breaks. The rest follow the contract.

Before: read three thousand lines to find the problem.
After: notification problem? Notification folder. Three hundred lines.

Before: AI puts code wherever.
After: AI sees the folder structure and puts it in the right place.

Walls are inconvenient.
But inconvenience becomes structure.

---

Domain splitting done.

Opened the code.

I could read it.

Folder names alone tell you.
"Ah, this is the agent world."
"This is the user world."
"This is the notification world."

Something breaks, I know where to look.

The AI changed too.
"Build this" -- "Which world does this belong to?"

Folder names are the rules.
Rules written in the environment, the AI follows.

---

A map appeared.

If spec was direction.
Structure is terrain.

Direction alone, you know "where you're going."
Terrain too, you know "where you're standing."

Both together, you don't get lost.

---

I was satisfied.
Genuinely.

I know what I'm building. Wrote the spec.
I know how to build it. SDD.
I know what goes where. DDD.

Growth.
Definitely.

---

But.

Friday night.
Changed the settings screen.
Works fine. Checked it.

Monday morning.
Agent is dead.

"What? It worked on Friday."

Changing the settings screen affected the agent initialization logic.
On Friday the agent was already running, so I didn't notice.
Monday it started fresh. Broke.

---

Structure means nothing if you can't verify it's correct.

Changed the code.
It runs.
But I don't know if "it runs" is real.

Have to check manually every time.
More features, more to check.
More to check, more you miss.
Where you miss, it breaks.

Fear.

Every time I change code. "What's going to break this time."
That fear stops you from touching the code.

Structure doesn't kill the fear.
Can't verify "it's correct"? Can't change it.
Can't change it? Can't grow.

The code hardens.
