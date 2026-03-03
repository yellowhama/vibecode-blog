# Names Made a Map

Domain splitting was done.

Agent world. User world. Notification world.
Each has a folder.
Each speaks its own language.
Need another world? Request through the interface.

Opened the code.

I could read it.

---

This is a big deal.

I can't read code.
That hasn't changed.

But just looking at the folder names, I get it.
"Ah, this is the agent world."
"This is the user world."
"This is the notification world."

Something breaks, I know where to look.
Notification acting up? Notification folder.
Agent stuck? Agent folder.

Before, I had to dig through three thousand lines.
Now I look at three hundred.

---

The AI changed too.

"Build this" -- and the AI asks first.
"Which world does this belong to?"

When everything was one folder, it never asked that.
No reason to ask.

Split the folders and the AI decides on its own.
"This is notification-related, so I'll put it in the notification folder."

Correct.
Puts it in the right place without being told.

Write "socks" on an empty drawer and socks go in.
Same principle.

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

Do the features that worked before still work?
Does the notification fire exactly once?
Do user settings save properly?

Have to check manually every time.
More features, more to check.
More to check, more you miss.
Where you miss, it breaks.

---

Fear.

Every time I change code. "What's going to break this time."
That fear stops you from touching the code.

Structure doesn't kill the fear.
Can't verify "it's correct"? Can't change it.
Can't change it? Can't grow.

The code hardens.
