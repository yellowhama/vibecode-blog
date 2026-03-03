# I Didn't Know What a Spec Was

Can't code.
Not a developer.
Vibe coding looked fun so I started.

Here's what happened.

---

The first time I opened Claude Code, I typed "make me a to-do app" out of habit.

Back in the ChatGPT days, that's where the loop starts.
Code block shows up. Copy it. Paste it in the terminal. Error. Ask again.
Copy again. Paste again. Error again.
That loop.

But something different happened.
Instead of showing me code, it made the files directly.

Wait.
I don't have to copy-paste?

I tried it. It worked.
Tried another thing. That worked too.

Three days in, I had five agents running.
I didn't fully understand what they did. But they ran.
If it runs, it works. That's what I thought.

---

I built a stock screener. Took two days.

Scans 586 US stocks across three strategies.
Done in three minutes.

Before, I used to ask Claude "what is this?"
Now I tell Claude "do this."

If you can feel the difference, good for you.
I couldn't. That's the trap.

"I can build anything with this."

That thought was the trap.

---

But all of that was practice.

My real project? Something else.
Three computers at home. Two desktops, one laptop.
Work from my laptop outside.
Still use the machines at home.
Like one machine.

Nothing on the market did this.
Built it myself.

---

Then something felt off.

The code ran. But it wasn't what I wanted.

I tweaked the prompt. It got worse.
Tweaked it again. A feature I had before disappeared.

It wasn't broken. But it wasn't right either.
Stuck somewhere in between.

The scariest part?
**I couldn't tell if it was correct.**
I couldn't tell where it went wrong.
I was afraid that asking for a fix would break it more.

So I left it alone.
Touching it would only make it worse.

AI-written code looks convincing.
That's what makes it dangerous.

Completely broken code? Anyone can spot that.
Error on screen, you know it's dead.

But code that looks fine on the outside while rotting on the inside?
For someone who can't read code, that's a disaster.
That was my disaster.

---

One Monday morning.
The whole system stopped.

Nothing worked.
It was fine yesterday.

I opened the code.
Over ten thousand lines.
Almost half of it was duplicated.

Five agents had built the same function five different ways.
Three date formatters.
Two config parsers.
Four different ways to validate input.

Nobody noticed.
Not the AI. Not me.
Agent 3 didn't know what Agent 5 built.
Of course not. They never saw each other's code.

But me?
I didn't know either. I can't read code.

Then I ran a security audit.
Line 847. Shell injection.

AI wrote it. I approved it.
I don't read every line. That's the whole point of vibe coding.

But here's the thing.
This tool — the one connecting my three computers — goes over the network.
A shell injection in that code?

That's not a bug. That's a door.
A door anyone can walk through.

---

What the hell went wrong?

Not the AI's fault. AI did what I told it to.
Not the prompt's fault. The prompts were specific enough.

The problem was deeper.

**I didn't know what I was building.**

No, I thought I knew.
"Connect three computers."

But what does that even mean?
Sync files?
Share screens?
Distribute processes?
At what point is it "done"?

I had no answer.
No answer meant AI went in a different direction every time.
Every time convincing.
Every time different.
Every time slightly wrong.

Making files? AI does that. Free.
Writing code? Free.
Running tests? Free.

Exactly one thing isn't free.
**Deciding what to build.**
AI can't do that. Only humans can.

But I skipped the decision and went straight to building.
"If I just start, something will come out of it."

Something came out.
Ten thousand lines of spaghetti.

---

Karpathy coined "vibe coding."
Type in English, get results.
Works for developers.

But there's a reason it works for developers.
They can read the code.

They can tell "this is a minor fix" from "this changes the whole direction."
I can't. I don't know code.

Developers are locals with built-in GPS.
They know the roads. The dead ends. The shortcuts.

I'm a tourist dropped in a foreign country with no map.
AI says "this way" and I follow.
But I can't tell if that's a right turn or a U-turn.

"What if I just write better prompts?"
No.
The prompts weren't the problem.

**I didn't have a map.**

What am I building?
What does it do?
Who uses it?
When is it done?

I had none of these four.
Didn't matter how good my prompts were.
Didn't matter which AI I used.
No direction means every step is wasted.

---

Developers call that map a "spec."

Spec? Like phone specs? Screen size, battery, storage?
No. In software, a spec is "a document that describes what you're building."

But I didn't know how to write one.
Didn't even know that meaning existed.
Opening a document and typing "1. System Overview" — that's not my world.
Never learned that.

So what did I do?

I got pissed.

Three computers at home.
I want them to work like one.
Tried everything on the market.

KVM switch. Half-assed.
Remote Desktop. Slow and choppy.
Cloud sync. My files going through someone else's server.
Git for code sync. Only handles code, nothing else.
Five apps running at once just to get "barely okay."

Nothing worked the way I wanted.

"Why doesn't this work?"
That became a question.

"What if I do it this way?"
That became an attempt.

"That doesn't work either?"
That became a constraint.

I asked the AI. "Can I connect them like this?"
"No. Here's why."
That "no" became a requirement.

Ask. Get told no. Hear why not. Ask again.
Twenty rounds of that fight.

I never opened a spec document.
I never sat down to write a spec.

I got pissed. Asked questions. Fought. Organized.
And the spec was already there.

But when I wrote it down, one question became four.

"Nothing does this" is the current pain. That's the reason.
"Work like one machine" is the change I want. That's the purpose.
Same "why." Different answers.

"P2P connection" is the tech choice. That's the method.
"Fork libp2p, check the MIT license" is how I get it. That's the means.
Same "how." Different answers.

```
Purpose: Use multiple computers like one machine. From anywhere.
Reason: Nothing on the market does this. Everything out there is half-assed.
Method: Direct P2P connection. QUIC tunnels. Local-first.
Means: Open-source (quinn, libp2p), forked and adapted. MIT verified.
```

Organize your frustration and that's what you get.
It doesn't come from a whiteboard in a conference room.
It comes from "why the hell doesn't this work."

---

Once I had the spec, everything changed.

Instead of "build this" I told AI "build this according to this spec."

Direction meant AI stopped wandering off.
Constraints meant it stopped making the same mistakes.
A definition of "done" meant I could see the finish line.

Ten thousand lines became three thousand.
I could finally delete things.
I could tell what was needed and what wasn't.

Forty-five minutes became twelve.
Python was pissing me off so I switched to Rust. It just got faster.

Failure rate dropped from 30% to 3%.
Less code, fewer places to break.

But reality doesn't follow specs perfectly.
First day, the build blew up. Timeout.
Old code the spec didn't account for popped up. Collision.

Plans change when they get punched.
Got punched. Fixed it. Wrote it down.
Next time I got punched in the same spot, five seconds to fix.

Writing it down is the whole point.
When specs meet reality, specs change.
If you don't write down the change, you get punched in the same place again.

---

I didn't know what a spec was.
I'm still not a "spec engineer."

But I know one thing now.

Better prompts aren't the answer.
Better AI tools aren't the answer.
Knowing what you're building is the answer.

And that answer doesn't come out clean.
It comes from getting pissed, asking questions, fighting, and organizing.

Specs don't come from conference rooms.
They come from the grind.
