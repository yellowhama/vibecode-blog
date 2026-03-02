# Without Names, You Lose Your Way

"The structure is the problem." Got that.

But what do I do about it?

Asked the AI.
"Why is the code so tangled?"

"There are no domain boundaries."

Domain?
What's that?

---

AI explained.

"A domain is 'the world of the thing you're building.'"

What? Simpler.

"The world where agents do their work.
The world where users live.
The world where notifications live.
Each one is a domain.
Right now, all three worlds share one room."

---

Imagine an apartment.

No walls.
Kitchen is the bedroom is the bathroom is the kitchen.

Cook something and grease splatters on the bed.
Take a shower and the couch gets wet.
Do anything anywhere and something else is affected.

But without walls it feels free.
"I can cook anywhere!"
Is that freedom?

No.
That's not freedom. That's chaos.

Walls seem inconvenient.
Have to walk from the kitchen to the bedroom.
But grease doesn't reach the bed.

Walls are boundaries.
Boundaries keep grease off the mattress.

---

Code is the same.

Notification code, user code, agent code.
All sharing one room.

One room means you can call anything directly.
Need the user's name for a notification? Just grab it.
Agent done? Just call the notifier.
User settings need agent state? Just read it.

"Just." Those four letters are the problem.

"Just" grab it means no walls.
No walls means anything goes.
Anything goes means everything tangles.

---

The AI said:

"Each world has its own language.

In the agent world: 'task,' 'execution,' 'result.'
In the user world: 'account,' 'permission,' 'settings.'
In the notification world: 'channel,' 'message,' 'dispatch.'

These words should become the names in your code."

---

Names.

"If you can tell what a function does just by its name,
that function is where it belongs."

Flip it.
Can't tell what it does from the name?
It's in the wrong place.

A function called `getNotificationConfig` in the notification folder.
But inside, it's digging through the user database.

The name says notification. The body says user.
Sleeping in the kitchen.

---

Learned this is called DDD.

Domain-Driven Design.

The name scared me at first.
"Design." "Driven."
Sounded like some grand theory from developer world.

But the essence is simple.

**Name things precisely.**

Agent world code goes in the agent folder.
User world code goes in the user folder.
Notification world code goes in the notification folder.

Each world speaks its own language.
Doesn't directly call another world's words.

That's the core of DDD.
Not a 500-page theory book. Just "put things where they belong."

---

If SDD figured out "what to build."
DDD figures out "where to put it."

Don't know what to build? No direction.
Don't know where to put it? No structure.

No direction? You wander.
No structure? You tangle.

SDD first. Then DDD.
The order made sense.

Decide "what" first.
Decide "where" next.

---

But knowing and doing are different.

"Need to split the boundaries." Got that.
Actually splitting them? Different story.
