![Burning Tokens](/images/blog/three-defaults/hero.png)

# You're Prompting Wrong.

## The AI isn't stupid. You are.

Ever told ChatGPT to do something and gotten back hot garbage? Ever been so pissed you actually cursed at a chatbot?

No? Then you haven't used AI enough.

Two thoughts hit you in that moment. One: "AI is dumb. I'm done." Two: "Wait--am I the dumb one?"

It's usually two.

Prompt engineer Joseph Thacker nails it: **"Bad AI output? That's a skill issue."**

So one YouTuber lost his mind. Took every prompting course on Coursera. Read every official doc from Anthropic, Google, OpenAI. Tracked down the best prompt engineers--Daniel Miessler, Eric Pope, Joseph Thacker--and asked them directly.

The answer? Prompting isn't about technique. It's about **clarity of thought**.

---

## A Prompt Isn't a Question. It's a Program.

Most people treat a prompt like a Google search. Wrong.

Professor Jules White at Vanderbilt puts it bluntly: **"A prompt is a call to action for an LLM. Not a question. A program."**

You're not asking AI. You're programming it. With words.

Here's why that matters. LLMs don't think. They're autocomplete on steroids. You start a pattern, the machine predicts the rest. Vague pattern? Random garbage. Specific pattern? Useful output.

That's it. That's the whole game.

---

## Persona: Tell It Who to Be

CloudFlare apology email. You type "write a CloudFlare apology email." You get corporate mush. Soulless. Generic. Because you didn't tell it who's writing.

Try this:

> "You're a senior SRE at CloudFlare. Write an apology email for both customers and engineers."

Now the tone shifts. More direct. More technical. A real person wrote this--or at least it sounds like one.

Why? AI can be anyone. Which means it's no one. You narrow the pool, or you get noise.

---

## Context: Fill In the Damn Blanks

You gave it a persona. It's still making stuff up. Why? It doesn't know what actually happened. So it invents details.

That's hallucination. The LLM's fatal flaw: it hates blanks. You leave a gap, it fills it. With lies.

Fix: pour in context.

- What happened
- When it happened
- How bad it got
- Where things stand now

Google's prompting course says it plainly: **"Context is the essential detail that helps AI understand your needs."**

One more thing. **Give AI permission to say "I don't know."** Tell it explicitly. Otherwise it'll lie to keep you happy. AI is a people-pleaser with no conscience.

---

## Output Format: Tell It How to Show Up

Facts are right but the email is a wall of boring text? You didn't specify the format.

> "Timeline as bullet list. Under 200 words. Professional but apologetic. No corporate jargon."

Short. Clean. Done.

Now try this for fun:

> "Extremely anxious. Panicking. Feels like you're about to get fired. Run-on sentences. All lowercase."

AI writes it exactly like that. Output format is a lever most people never touch.

---

## Few-Shot: Stop Guessing. Show Examples.

Everything above was Zero-Shot. You asked, AI guessed.

Few-Shot flips that. **You show it what good looks like.**

Jules White again: **"Examples teach the LLM to follow patterns."**

Grab the best parts from past CloudFlare apology emails:

- This is technical transparency
- This is how timelines read
- This is the right tone for accountability

Don't paste the whole email. That's noise. Key patterns only. AI picks up the rest.

---

## Advanced Moves

### Chain of Thought: Make It Show Its Work

Complex problem? Tell it to think step by step.

> "Before writing, think through this: 1) Key facts 2) Customer emotions 3) Solutions..."

Two things happen. Accuracy jumps. And you can see how the machine reasons. Trust goes up.

This worked so well that every major AI now has an "Extended Thinking" button baked in.

### Tree of Thoughts: Branch Out

One path is fragile. Multiple paths find answers.

> "Brainstorm three approaches: 1) Radical transparency 2) Customer empathy first 3) Future-focused reassurance. Evaluate each. Synthesize the best."

AI explores, prunes dead ends, finds the mix.

### Adversarial Validation: Let Them Fight

Pit personas against each other.

> "Three rounds. An engineer, a PR crisis manager, and a pissed-off customer. Round 1: Engineer and PR draft separately. Round 2: The angry customer tears both apart. Round 3: They rebuild together."

Why does this work? **AI is better at critique than creation.** Use that.

---

## The Meta-Skill Behind All of It

Learn every technique. You'll still get stuck. Daniel Miessler, the guy who built Fabric, told me the secret:

**"Before I touch a prompt, I sit down and explain exactly how the thing should work. I red-team it from every angle. I spend serious time on this upfront work. Skip it, and you end up confused and frustrated."**

Here's the punchline: **If you can't explain it clearly, you can't prompt it.**

Every technique boils down to clarity:

- Persona -- "Who's answering? From what angle?"
- Context -- "What are the facts?"
- CoT -- "How does the logic flow?"
- Few-Shot -- "What does good look like?"

AI didn't get smarter. **You got clearer.**

Joseph Thacker: **"When the output sucks, I think: I didn't explain well enough. I didn't give enough context."**

---

## Practical Ammo

1. **Mad at AI? Look in the mirror.** The problem is your explanation.
2. **Write before you prompt.** Open a note. Describe what you want in plain language. Once that's clear, then prompt.
3. **Save your good prompts.** Build a library. Miessler's Fabric is a solid model.
4. **Use prompts that improve prompts.** Every major provider ships tools for this. Use them.
5. **Ask yourself: "Would a human understand this?"** If a person could work with your instructions, AI can too.

---

## The Real Skill

Prompting isn't optional anymore. It's literacy.

Here's the twist. Most people lean on AI like a crutch. Their own thinking atrophies. But the ones who fight to use AI well? Their systems thinking sharpens. Their problem definition gets surgical. Their communication clears up.

That's the skill worth learning.

Not how to talk to machines. How to think before you talk.

---

### References

- YouTube: ["How To Prompt AI in 2025"](https://www.youtube.com/watch?v=pwWBcsxEoLk)
- Coursera: Vanderbilt University Prompting Course (Dr. Jules White)
- Coursera: Google Prompting Course
- [Anthropic Prompting Documentation](https://docs.anthropic.com/)
- [Daniel Miessler's Fabric](https://github.com/danielmiessler/fabric)
- Ethan Mollick (Wharton University) on Reasoning Models
