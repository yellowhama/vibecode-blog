# Names Made a Map

Domain splitting was done.

Agent world. User world. Notification world.
Each has its own folder.
Each speaks its own language.
Need something from another world? Request through the interface.

Opened the code.

I could read it.

---

This is a big deal.

I can't read code.
That hasn't changed.

But just looking at folder names, I get it.
"Oh, this is the agent world."
"This is the user world."
"This is the notification world."

When something breaks, I know where to look.
Notification acting up? Notification folder.
Agent stuck? Agent folder.

Used to dig through 3,000 lines.
Now I check 300.

---

The AI changed too.

"Build this"—and the AI asks first.
"Which world does this belong to?"

Never asked that question before.
When everything was in one folder, no reason to ask.

Folders split, and the AI decides automatically.
"This is notification-related, so I'll put it in the notification folder."

Right.
Without being told, it puts things in the right place.

Saw this in Act 2.
If the drawer is labeled "socks," AI puts socks in it.
Same principle.

Folder names are rules.
Rules written in the environment are rules the AI follows.

---

A map appeared.

Said it in Act 1.
"I'm a traveler dropped in a foreign country with no map."

Back then, the spec was the map.
What to build. Where to go.

Now, structure is the map.
What lives where. Where to look.

Spec = direction.
Structure = terrain.

Direction alone tells you "where you're headed."
Terrain tells you "where you're standing."

Both together? You don't get lost.

---

I was satisfied.
Genuinely.

Act 1: Didn't know what a spec was. → Learned specs.
Act 2: Turned the spec into a system. → SDD.
Act 3: Split code into worlds. → DDD.

Growth. Absolutely.

---

But.

Thought hit me at night.

"Is this actually correct?"

---

Changed some code.
It runs.

But is "it runs" really true?

Features that worked before—do they still work?
Does the notification fire exactly once?
Do user settings save properly?

Check manually every time.
Log in. Run agents. Check notifications.
Change settings. Log in again.

Thirty minutes.

One fix, thirty minutes of checking.
Another fix, another thirty minutes.

---

Ten features? Manageable.

But now there are fifty.
Check fifty things by hand every time?

Skip the check?
"This one probably didn't break."
That "probably" is where bugs escape.

---

Structure is set.
Code is readable.
AI puts things in the right place.

But there's no way to verify "it's correct."

Only option: click through everything manually.
And as features grow, so does the clicking.
More clicking, more things get skipped.
Skipped checks are where things break.

---

Fear.

Every time I change code: "What's going to break this time?"
That fear paralyzes you.

Structure doesn't kill the fear.
If you can't verify "it's correct," you can't touch the code.
Can't touch the code, can't grow.
The code fossilizes.

---

What do you need to change code without fear?

"Changed it. It runs."
Something other than me has to confirm that.
Every time. Automatically. Without missing anything.

Didn't know what that something was yet.
But I knew I needed it.
