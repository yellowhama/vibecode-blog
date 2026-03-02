# No Name, No Direction

"The structure is the problem." Got that.

Decided to fix it myself.

---

Gathered all the notification-related code.

Asked the AI to list them.
"Every file with the word notification in it."

Twelve.

Opened them.

`getNotificationConfig`.
Name says notification.
But inside, it's reading the user database directly.

Is this notification or user?

Name says notification. Body says user.

---

Another one.

`sendAgentAlert`.
Name says agent alert.
But inside, it reads user settings, writes logs, and sends the notification.
One function doing three worlds by itself.

What even is this?

---

Thought of an apartment.

An apartment with no walls.
Kitchen is the bedroom is the bathroom is the kitchen.

Cook something and grease splatters on the bed.
Shower and the sofa gets wet.
Do anything anywhere and something else gets hit.

No walls, so it looks like freedom.
"I can cook anywhere!"
Is that freedom?

No.
That's not freedom. That's chaos.

Walls seem inconvenient.
Have to walk from the kitchen to the bedroom.
But grease doesn't splatter.

---

The code was the same.

Notifications, users, agents.
All living in one room.

One room, so everything calls everything directly.
"Just" grab it.

"Just." Those four letters are the problem.
"Just" grabbing it means there are no walls.
No walls means anything is possible.
Anything is possible means everything tangles.

---

Each world has its own language.

In the agent world: "task," "execution," "result."
In the user world: "account," "permission," "settings."
In the notification world: "channel," "message," "dispatch."

These words should become the names in your code.
If the name fits, it's in the right place.
If the name doesn't fit, you're sleeping in the kitchen.

---

Found out later this is called DDD.

Domain-Driven Design.

The name scared me at first.
"Design." "Driven."
Sounded like some grand theory from the developer world.

But the essence was simple.

**Name things precisely.**

Agent world code goes in the agent folder.
User world code goes in the user folder.
Notification world code goes in the notification folder.

Each world speaks its own language.
Never calls another world's language directly.

---

SDD nailed "what to build."
DDD nails "where to put it."

Don't know what to build? No direction.
Don't know where to put it? No structure.

No direction, you wander.
No structure, you tangle.

But knowing and doing are different things.

"Need to draw boundaries." Got that.
Actually drawing them is a different story.
