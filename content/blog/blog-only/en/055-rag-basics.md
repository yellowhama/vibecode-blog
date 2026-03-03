# AI Lies Like It Breathes

## RAG. What Even Is That.

---

## This AI Kept Lying and I Lost It

For real.

```
AI: Fixed line 32 in auth.ts.
```

Go check. Empty.

```
AI: Oh, it's line 34.
```

Go check. A comment.

At this point you realize.

It's not getting things wrong.

**It's talking without looking.**

---

## AI Has Never Seen My Code

We assume things.

> AI probably understands my project.

No.

An LLM is not a "reading machine."

It's a "keep-talking machine."

If it hasn't actually read the file, it fills in with patterns.

Patterns sound plausible.

That's what makes them dangerous.

---

## So I Got Pissed and Reached a Conclusion

Stop imagining.

**Look it up before you talk.**

That's RAG.

Not some fancy acronym.

> Retrieval Augmented Generation
>
> = Look it up before you generate.

One-line summary. Done.

---

## Step 1: Check If It Even Exists

The first thing I did was this.

> "Confirm the file actually exists before you say anything."

How?

Hand it dead-simple Linux commands (`find`, `grep`).

That one line.

Skip it and this happens:

```
AI: I'll modify user_login.js.
```

That file doesn't exist. Then AI goes "oh it's not here? where'd it go? let me look around."

So I locked it down.

```
Before modifying:
1. Actually search for related files.
2. State the path, then start working.
```

Just this alone.

Half the bullshit disappears.

**[After applying this]**

> **AI:** (pauses)
> *System quietly runs `find ./src -name "*login*"`.*
>
> **AI:** "Found it. `UserLogin.tsx` exists. I'll fix this one."

This isn't advanced tech.

It's just "look before you talk."

---

## But This Wasn't Enough

Fix a single file in isolation and it's wrong again.

Because code isn't text.

It's **connections**.

```
login.ts
  ├── import AuthType from './types'
  ├── import db from './db'
```

A clueless AI does this:

> Opens only login.ts and edits it.

And immediately:

> "Where is the AuthType definition?"

So I have to explain. Again.

More time wasted.

More frustration.

---

## So I Added a Second Rule

> When editing a file, also pull the files it imports.

That one line.

That's real RAG.

Keyword search brings back one file.

Dependency-based search **brings back connected files too**.

> **"When modifying a file, find the files imported at the top, read their contents first, then plan your changes."**

This one line doubles AI's effective intelligence.

The difference is simple.

**[Clueless AI]**

> Grabs only `login.ts`. Tries to edit. Doesn't know what `AuthType` is. Throws an error.

**[AI with awareness]**

> Finds `login.ts`. Reads the top. Sees `import { AuthType } from './types'`. Thinks: "Owner didn't mention it, but I'll need `types.ts` too." Grabs it on its own.

The technical term is "dependency graph traversal."

Plain English: **reading the family tree without being told.**

If you're using Cursor or Claude, add this one line to your config file (`.cursorrules` or equivalent).

Skip this and AI always edits with half the context.

And half-context edits blow up eventually.

---

## What I Actually Locked Down

This is copy-paste ready.

```
Before working:
1. Search for the target file.
2. List internal modules it imports.
3. Read related files together, then start editing.
```

I locked down these three lines.

After that,

"Where is this defined?"

Almost never came up again.

---

## That's RAG Round 1

Summary.

AI bullshits for two reasons.

1. It talks without reading files.
2. It edits without knowing connections.

So the fix is two lines.

- Look it up first.
- Grab the connected stuff too.

That's why I added RAG.

**A safety net born from frustration.**

---

## But Then Another Problem Showed Up

Pull every connected file and now AI's brain overflows.

Past 15 files, the context is full.

This time it's not bullshit.

It's **confusion**.

So the next step became necessary.

> Pull everything, but **keep only what matters.**

That's the next post.