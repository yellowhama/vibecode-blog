# Frustration Is the Spec

They said I need to write a spec.

Spec.
Like phone specs? RAM, storage, screen resolution?
That's the only "spec" I knew.

In software, spec means something else.
"A document that describes what you're building."

But I'm not a developer.
Never opened a document and typed "1. System Overview."
Never written "2. Requirements Definition."
Never learned how.

"You need to write a spec."
Cool. How?

---

I froze for a while because I didn't know the method.

Searched for how to write specs.
Software Requirements Specification. SRS. PRD. Functional specs.
All developer documents.
Templates with fields and approval workflows.

Foreign language to me.
"Non-functional requirements" — what?
"System constraints" — what?
"Use case diagram" — what?

Learning that is another few months.
I started vibe coding because I didn't want to learn coding.
Now you're telling me to learn spec writing?

---

So I just got pissed.

That's literally what happened.
Didn't find a methodology. My frustration just exploded.

I have a problem.
Three computers at home. Two desktops, one laptop.
I want them to work like one machine.

Work from my laptop outside.
Tell the desktops at home to do stuff.
See the results on my laptop.
Files sync automatically.

That's the wish.
But nothing on the market does this.

Tried them one by one.

---

**KVM switch.**

Keyboard, monitor, mouse shared across computers.
Works at home when both desktops share a monitor.
But connect from a laptop outside? Nope.
KVM only works with physically connected devices.
Network? Not supported.

Half-assed.

**Remote Desktop.**

See the computer screen remotely.
Usable. But slow.
Move the cursor, it follows 0.3 seconds later.
Video? Forget it. Becomes a slideshow.

And it drops.
Wi-Fi hiccups, connection drops.
Reconnect. Type password. Wait.

Annoying.

**Cloud sync.**

Google Drive, Dropbox, OneDrive.
Files sync. That's it.
Can't run processes.
Not using a computer — just copying files.

And my files go through someone else's server.
Upload a 10GB dataset to the cloud then download it again?
Plugging in a USB drive is faster.

**Git.**

Code? Perfect. Git is the best for code sync.
But everything else?
Large files? No.
Binaries? Hate it.
Runtime environment? Completely different problem.

**Five apps at once.**

This is where I ended up.
KVM + Remote Desktop + cloud + Git + terminal.
Five apps running simultaneously just to get "barely okay."

Barely.
Okay.

Can't work on "barely okay."
Every morning: open five apps, remember where everything is, manually fix sync conflicts.
That's not work. That's busywork.

---

So I decided to build it myself.

But here's the important part.
It wasn't "decided to build it" first.
It was **"figured out why nothing works"** first.

Why doesn't KVM work?
→ No network support.
→ **Requirement: must connect over network.**

Why is Remote Desktop annoying?
→ Slow. Drops connection.
→ **Requirement: fast and stable.**

Why doesn't cloud work?
→ Files only. No processes.
→ **Requirement: files AND commands/processes.**

→ And my files go through someone else's server.
→ **Requirement: no cloud middleman. Direct connection.**

I wrote this down and looked at it.

"Why doesn't this work?" was a question.
"What if I do it this way?" was an attempt.
"That doesn't work either?" became a constraint.

Asked the AI.
"Can I connect three computers directly? No cloud?"
*"P2P is possible. But behind NAT, connections are tricky."*
"What's NAT?"
*"Behind a router. Most home networks."*
"So how do you connect behind a router?"
*"QUIC tunnels or STUN/TURN servers."*
"What's that?"
It explained. Understood half of it.

Every time the answer was "no," I asked "why?"
The "why" became a condition.
Conditions stacked up until I could see what needed to be built.

---

I tried organizing what I had.
"I want multiple computers to work like one."
Why? "Because nothing on the market does this."

Showed it to the AI.
"Is this enough?"
*"I have a question. 'Nothing does this' is the current problem. 'Work like one' is the goal. They're different things."*

I stopped.

"Nothing does this" is right now. That's the reason.
"Work like one" is what changes. That's the purpose.
Same "why." Different answers.

If you can't tell them apart, when someone asks "why build this?"
all you get is "because nothing else does it" on repeat.
"Because nothing else does it" is the reason. Not the purpose.

---

"Direct P2P connection."
I told the AI. It started installing libp2p right away.

Wait.
What the hell is libp2p?
Who made it?
Can I even use this?

*"Open-source by Protocol Labs. MIT license."*
"What's MIT?"
*"Free to use, modify, and distribute. Commercial use included."*

Cool. But.
"Do I use this as-is? Or do I need to change it?"
*"It's a general-purpose library. Usually you adapt it to your situation."*
"What about QUIC?"
*"QUIC is a protocol. There's a Rust implementation called quinn. Also MIT."*

That's when it clicked.

"P2P connection" is a tech choice. That's the method.
But how you get that tech is a different question.

Build from scratch?
Use someone else's code as-is?
Fork it and adapt?

And when you take it — are you even allowed to?
MIT? Apache? GPL?

"Don't reinvent the wheel."
Heard that plenty.
But one line was always missing.

> *"When you take someone's wheel, check who owns it."*

Method: what tech to use.
Means: how to get that tech.
Same "how." Different answers.

---

Twenty rounds of fighting.
Ask. Get told no. Hear why. Ask again.
Suggest something else. Get told no again.

---

I never opened a spec document.
Never typed "1. System Overview."
Never sat down to write a spec.

I got pissed.
Asked questions.
Fought.
Organized.

And the spec was already there.

```
Purpose: Use multiple computers like one machine. From anywhere.
Reason: Nothing on the market does this. Everything is half-assed.
Method: Direct P2P connection. QUIC tunnels. Local-first.
Means: Open-source (quinn, libp2p), forked and adapted. MIT verified.
```

Four things.
That's a spec.
Not an SRS. Not a PRD.
Just organized frustration.

Collapse those four into two ("why" and "how") and this doesn't happen.
One "why" and AI can't pick a direction.
One "how" and you end up using someone's code without checking.

Organize your frustration and that's what you get.
It doesn't come from a whiteboard in a conference room.
It comes from "why the hell doesn't this work."

---

Once I had the spec, everything changed.

Instead of "build this" I told AI "build according to this spec."

Day one.
AI tried to install a cloud SDK.
Showed it the spec. "It says no cloud. Right there."
AI came back. Switched to libp2p.

Before, I would've said "cool" and moved on.
But now I had the spec. Now I could say "that's wrong."

And I could delete things.
For the first time, I could actually delete code.

Opened the ten-thousand-line codebase.
Found something not in the spec. Deleted it.
Found another. Deleted that too.
Three thousand lines left.
App didn't break. It got faster.

Forty-five minutes became twelve.
Python was pissing me off so I switched to Rust. It just got faster.
Failure rate dropped from 30% to 3%.

---

But reality doesn't follow specs perfectly.

Day one.
Ran the build.
Two minutes, still going. Timeout.

Build wasn't in the spec.
Didn't even think about builds failing.
Dependencies were recompiling from scratch every time.
Pinned versions, enabled cache. Twenty-eight seconds.

Day two.
Spec said "build from scratch."
But existing code was already doing the same thing.
The piled-up code had some usable pieces.

Build new per spec? Or fix what's already there?
Fixed what was there.
Faster than starting from zero.

Surprises the spec didn't account for showed up every day.

Plans change when they get punched.
Mike Tyson said it.
"Everyone has a plan until they get punched in the mouth."

Got punched.
Fixed it.
**Wrote it down.**

That's the key. Writing it down.
Next day, same problem. "How did I fix this yesterday?"
Wrote it down, so five seconds.
Didn't write it down? Another thirty minutes.

When specs meet reality, specs change.
Don't write down the change, you get punched in the same spot again.

Made a file called `PROBLEMS.md`.
Every time something breaks, write it down.
What broke, why it broke, how I fixed it.

One week later, same problem.
Opened the file. Fixed in five seconds.

Specs aren't finished products.
Specs are living documents.
Reality punches them, you update them.

---

I didn't know what a spec was.
I'm still not a "spec expert."

But I know one thing now.

Better prompts aren't the answer.
Better AI tools aren't the answer.
**Knowing what you're building is the answer.**

And that answer doesn't come out clean.
You get pissed. Ask questions. Fight. Organize.

Specs don't come from conference rooms.
They come from the grind.
