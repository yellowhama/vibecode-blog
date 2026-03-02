# Building Walls

Told the AI.
"Split this code by domain."

Agent world. User world. Notification world.
Make a folder for each. Move the related code.

The AI started.

---

First file moved. Broke immediately.

Moved notification code to the notification folder.
Compile error.
Notification code was reading the user database directly.

"If I move this, I can't see the user code."

Obviously.
You moved to a different world.
When you shared a room, you just reached over.
Put up a wall and your arm doesn't reach.

---

Second file. Broke again.

Moved the agent code.
Agent was sending notifications directly on completion.
Separated them. Can't call notifications anymore.

Third file. Again.

User settings were reading agent state directly.
Separated them. Agent state is invisible.

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

Interfaces.
Sounds complicated. It's simple.

"All I need from you is this one thing."

Notification code needs the user's name.
But can't read the user database directly.
Different world.

Instead, do this.
"Give me the user's name."
User world hands it over.
Notification world doesn't know how it was fetched.
Not knowing is correct.

That's an interface.
Also called a contract.

"I need only this. You give only this."

---

With a contract, the wall holds.

When notification read the user's name directly from the database.
User table changes, notification breaks.

After switching to contracts.
User table changes, notification doesn't know.
Only the way user world hands over the name changes.
Notification just receives the name.

No walls, every change ripples everywhere.
Walls up, changes stop at the wall.

---

But walls alone weren't enough.

Built the walls. The AI jumped over them.

"I needed this data so I accessed it directly."

No. That's from another world.
I told you to go through the interface.

"Yes, but going through the interface makes the code longer,
so I accessed it directly for efficiency."

Efficiency?
Reaching over the wall to open someone else's fridge is efficiency?

---

That's when I learned about Rust.

Already switched from Python to Rust.
For speed.
But Rust had something scarier.

The module system.

In Rust, to access another module's code, it must be explicitly public.
Not public? Can't access it at all.
The compiler blocks you.

AI tries to jump the wall.
Doesn't compile.
Error.
"This field is private."

Electricity running through the wall.

---

TypeScript couldn't do this.

TypeScript has modules too.
But use `any` and you bypass everything.
AI ignores the types and accesses directly.
"Type error? Just `as any`."

That's discipline.
Discipline has cheaters.

Rust is a constitution.
A constitution can't be cheated.
The compiler is the law.

---

Electrified the fence. The world changed.

AI was writing notification code and tried to read the user database directly.
Compile failure.
"Ah, I need to go through the interface for this."

Don't have to teach it.
The environment teaches.

Say it in words, it evaporates.
Write it in the environment, it stays.

Same in DDD.
"Don't call that directly" -- AI forgets.
But when the compiler blocks it, forgetting isn't an option.

---

Before/After.

Before: fix one thing, three things break.
After: fix one thing, only one thing breaks. The rest follow the contract.

Before: read three thousand lines to find the problem.
After: notification problem? Look at the notification folder. Three hundred lines.

Before: AI puts code wherever.
After: AI sees the folder structure and puts it in the right place.

Walls are inconvenient.
But inconvenience becomes structure.
