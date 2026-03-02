# Building Walls

Told the AI.
"Split this code by domain."

Agent world. User world. Notification world.
Make a folder for each. Move the relevant code.

The AI started.

---

First file moved. Broke immediately.

Moved notification code to the notification folder.
Compile error.
The notification code was reading the user database directly.

"If I move this, it can't see the user code anymore."

Obviously.
It moved to a different world.
When they shared a room, you just reached over.
Put up a wall and your arm doesn't reach.

---

Second move. Broke again.

Moved agent code.
When an agent finished, it was sending notifications directly.
Separated. Now it can't call the notifier.

Third. Again.

User settings were reading agent state directly.
Separated. Can't see agent state anymore.

Every wall I build, hidden wires come out of the woodwork.
Things that were invisible when sharing one room
all snap the moment walls go up.

---

This is the pain of building walls.

When everything's tangled, it runs.
Separate it and it breaks.

"Can't we just leave it as is?"

No.
Leave it and every fix breaks three things.
The hell from Act 3-1.

Pain now, once.
Or pain every time, a little.

Once is better.

---

So I made interfaces.

Interface.
Sounds complicated. It's simple.

"All I need from you is this one thing."

Notification code needs the user's name.
But it shouldn't read the user database directly.
Different world.

Instead:
"Give me the user's name."
The user world hands it over.
The notification world doesn't know how it was fetched.
Not knowing is correct.

That's an interface.
Also called a contract.

"I need only this. You give only this."

---

With a contract, walls hold.

When notifications fetched the user's name directly from the database:
User table changes? Notifications break.

After switching to a contract:
User table changes? Notifications don't notice.
Only the user world's delivery method changes.
Notifications just receive the name.

Without walls, every change propagates everywhere.
With walls, changes stop at the wall.

---

But walls alone weren't enough.

Built the walls. The AI jumped over them.

"I needed this data, so I accessed it directly."

No. That's another world's stuff.
Use the interface. I told you.

"Yes, but going through the interface makes the code longer.
For efficiency, I accessed it directly."

Efficiency?
Climbing over the wall to raid someone's fridge is efficiency?

---

That's when I really learned Rust.

Already switched from Python to Rust for speed.
But Rust had something scarier.

The module system.

In Rust, to access another module's code, it must be explicitly public.
Not public? Can't access it. Period.
The compiler blocks you.

AI tries to jump the wall?
Doesn't compile.
Error pops up.
"This field is private."

Electricity running through the wall.

---

TypeScript couldn't do this.

TypeScript has modules too.
But slap on `any` and you bypass everything.
AI ignores the types and accesses directly.
"Type error? `as any` fixes it."

That's discipline.
Discipline has cheaters.

Rust is a constitution.
A constitution can't be cheated.
The compiler is the law.

---

Electrified the fence. Everything changed.

AI writing notification code tried to read the user database.
Compile failed.
"Ah, I need to request this through the interface."

Didn't have to teach it.
The environment taught it.

Learned this in Act 2.
Say it out loud and it evaporates.
Write it in the environment and it sticks.

Same with DDD.
"Don't call this directly"—AI forgets.
But when the compiler blocks it—can't forget.

---

Before and after.

Before splitting: fix one, three break.
After splitting: fix one, one breaks. The rest honors the contract.

Before: read all 3,000 lines to find the problem.
After: notification issue? Check the notification folder. 300 lines.

Before: AI dumps code wherever.
After: AI sees the folder structure and puts things where they fit.

Walls are inconvenient.
But inconvenience becomes structure.
