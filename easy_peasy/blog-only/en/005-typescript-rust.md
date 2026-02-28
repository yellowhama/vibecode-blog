# What a Non-Coder Learned Vibe Coding -- Python or TypeScript?

## My Vibe Coding Saga as a Complete Outsider

When I first met Claude Code, I was blown away. Describe something in plain language and code just appears. It runs. It felt like magic.

## Reality Hits: The Endless War with Errors

But reality was different.

The first few times were genuinely amazing. "Build me a website." "Connect the database." Stuff actually came out. But as time went on, red text started showing up.

Error: Cannot read property 'undefined' of undefined
TypeError: res.json is not a function
ModuleNotFoundError: No module named 'something'

At first I just asked Claude again. "How do I fix this error?" It answered. Fixed it. Another error popped up. Fixed that. Another one.

My daily routine became this:

Googling: "python error cannot import" -- 10 Stack Overflow tabs open, copy-paste everything.

Community rounds: Discord dev channels, Reddit r/programming, even Facebook coding groups.

AI triple combo: ask Claude, then ChatGPT, then Gemini for good measure.

"What is this error?"

"How do I fix it?"

"Why did it break?"

"It was working five minutes ago, why?"

Like being sick with no doctor, going from pharmacy to pharmacy asking "will this pill work?" The problem was I'm not a developer, so I couldn't even tell who was giving me the right answer.

The worst part: the same error comes back, and I can't remember how I fixed it last time. And neither can the AI. So I start googling from scratch.

## "Vibe Coding Is Not an Excuse for Low-Quality Work"

Then I found a post online.

By Addy Osmani: "Vibe Coding is not an excuse for low-quality work."

The title alone stung. What I've been doing -- is that the "low-quality work" he's talking about?

Reading it was a shock. Every problem I was having was described in there.

### The Traps of AI Coding

The article said AI-assisted coding can be a serious shift. Even non-programmers like me can describe something and get working software. He called it "liberating creativity" -- more people can solve their own problems with custom software.

But then came the catch.

"Speed means nothing when the wheels come off later."

That hit. I wasn't sure anything I'd built actually held together.

### "Two Engineers Can Create 50 People's Worth of Tech Debt"

This sentence was brutal. Two people cutting corners creates cleanup work for fifty.

I was planting hidden bombs for the future. I could see that.

The article spelled out the problems:

No error handling: when something goes wrong, there's no code to deal with it.

Performance issues: it works, but it's slow or eats memory.

Security holes: SQL injection vulnerabilities hiding inside.

Fragile logic: one unexpected input and the whole thing collapses.

"Oh, so that's why my stuff keeps breaking..."

### "House of Cards" Code

The author called this kind of code a **"house of cards."**

"Looks complete, but collapses under real-world pressure."

Like the first little pig's straw house.

That was me exactly.

First reaction: "Whoa, it works!" Then after a few days, things start breaking everywhere.

One unexpected input and the whole thing falls apart.

### The Core Problem: Quantity Does Not Equal Quality

AI can generate a lot of code fast. But **quantity is not quality.**

That really landed.

I'd been thinking "I got a lot of code, so I must have built something impressive." That was the delusion.

### The Fix: "Treat AI Like a Junior Developer"

So what's the answer? The article was clear.

"Treat AI like a very fast but junior team member. Meaning, **you -- the senior engineer or team lead -- are still the person responsible for the output.**"

AI can produce a first draft. But you need to review it with a critical eye, improve it, and make sure it meets quality standards.

Experienced developers who use AI well follow this pattern:

Read and understand AI's output like it came from a junior on your team.

Review and test the code thoroughly.

Consider error cases, security implications, performance characteristics.

Refactor and improve as needed.

Make sure it matches the team's coding standards.

"AI is a tool, not magic. The responsibility to review, understand, and validate everything it produces is still yours."

## But I'm Not Even Junior-Level

After reading it, I felt even more hopeless.

"Review with a critical eye"? Me?

I'm not a senior engineer. I'm not even a junior developer. I'm the person who made a junior AI the lead developer and just went with it. The only thing I can trust is AI, and now I'm told not to trust that either?

"Consider error cases" -- I don't know what error cases are. White text is code, red text is error. That's it.

"Think about security implications" -- I don't know what SQL injection or security implications even mean.

"Evaluate performance characteristics" -- how do I know if it's fast or slow?

"Refactor" -- refactor what, how?

"Match coding standards" -- what standards?

Completely lost. Like a first-year med student told "just take good care of patients."

Actually, more like a high school senior who wants to go to med school.

## "Typed Languages Are Better Suited for Vibe Coding"

Then a few days later, I found something on Hacker News. This time it was almost good news.

"Typed languages are better suited for vibecoding."

Typed languages are better for vibe coding? Sounded hopeful. But **what's a typed language?**

The author was a 10+ year veteran developer.

But even this person completely changed habits after Claude Code came out.

"My 10+ year programming habits changed after Claude Code launched. Python is no longer my first choice for new projects."

A 10-year vet changed habits because of AI?

Then me struggling as a beginner is perfectly normal, right?

The really surprising part:

"I'm managing projects in languages I'm not fluent in -- **TypeScript, Rust, Go** -- and doing fairly well."

Wait, this person is also working in languages they don't know? That's kind of my situation.

Well, not really. They're like a pro soccer player being asked to switch from wingback to striker.

My situation is more like a professional painter being told to play soccer.

### The Key Finding

"Typed and compiled languages seem better suited to vibecoding. Because of the safety guarantees."

Safety guarantees? Sounded important. Guarantees are good. Safety is good.

Reading further:

"Paradoxically, at any meaningful project size, you can move faster and safer with Claude Code + **Rust** than Claude Code + Python, despite the lower-level nature of the code."

So I tried to install Rust... and it was already there?

### A Real Case: The TextCortex Experience

The author described what happened at their actual company. This was impressive:

"I refactored large chunks of TypeScript frontend code at TextCortex. Claude Code runs tsc after completing each task and verifies the code compiles before committing."

The key: **"verifies the code compiles."**

"This allowed me to move much faster than would have been possible with Python, which doesn't provide compile-time guarantees."

And the most striking part:

"I'm continually amazed that 3-5 thousand line diffs built in a few hours break nothing and actually improve stability."

3-5 thousand lines in a few hours? Without breaking anything?

## What Is a Typed Language? (For Beginners Like Me)

I didn't really know what a typed language was, so I looked it up.

Simply put: a typed language requires you to declare what kind of data a variable or function handles, upfront.

### Python vs TypeScript

In Python:

```
def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)         # 8
result = add_numbers("hello", "world")  # "helloworld"
result = add_numbers(5, "hello")   # Error... or maybe not?
```

That last line? You won't know what happens until you run it. Might error. Might not. Schrodinger's error. And even when it errors, it may or may not tell you why. Sweet.

But in TypeScript:

```
function add_numbers(a: number, b: number): number {
    return a + b;
}

const result1 = add_numbers(5, 3);           // OK
const result2 = add_numbers("hello", "world"); // Compile error!
const result3 = add_numbers(5, "hello");       // Compile error!
```

It tells you there's a problem before you even run it. That's "compile-time checking."

### Why Is This Better for Vibe Coding?

Thinking about everything I'd been through, it made sense:

Python: AI writes code, you run it, error hits, ask AI again (it's not sure either), "fix" it by feel, different error (or same one), infinite loop.

TypeScript: AI writes code, compiler checks it, flags problems immediately, most issues resolved before you even run it.

So they say.

### What "Safety Guarantees" Means

"LLMs are leaky abstractions, yes. But they now work well enough to solve the problems Python solved for me (fast prototyping) without Python's downsides (low safety guarantees, slow, ambiguous)."

In other words, typed language + AI gives you:

- Prototyping as fast as Python
- Safety higher than Python
- Fewer runtime errors than Python
- Clearer code structure than Python

## Is There Hope for Me?

After reading this, something clicked.

The reason I'd been struggling was clear. I'm not even junior-level, and I didn't have the ability to manage a junior-level AI. But with a typed language, the language itself manages some of that for me.

### Claude Code + Typed Language

Thinking back on my most frustrating moments:

"It was working a minute ago, why did it break?"

"I typed something and got an undefined error?"

"I have no idea what this function returns."

A typed language catches a big chunk of these before you even run the code.

And Claude Code runs the compiler after each task to flag problems immediately. Like having a built-in quality inspector.

### How a Beginner Can Vibe Code Safely

So someone like me could:

1. Pick a typed language like TypeScript or Rust
2. Vibe code with Claude Code
3. Compiler auto-checks as first pass
4. When errors hit, ask Claude to fix the compile errors
5. Run for second-pass testing

Sure, I still can't "review like a senior engineer." But at least the language itself gives me a basic safety net.

What I needed wasn't a smarter AI. It was a smarter language.

TypeScript first? Or install Rust?

**If you're a vibe coding beginner, start with a typed language like TypeScript, Rust, or Go instead of Python. The language itself becomes your first safety net.**
