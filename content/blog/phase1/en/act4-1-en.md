# The Hell of Manual Testing

Shipped a new feature.

Checked it. It worked. Shipped it.

Next day.
A different feature was dead.

"But I checked?"

Checked that feature.
Didn't look at the others.

---

So I decided to check everything from then on.

Change the code.
Login. Works.
Agent execution. Works.
Notification. Arrives.
Settings change. Saves.

Done.

---

Next day.
One small fix.
Changed the notification text.

Check everything again.
Login. Agent. Notification. Settings.

Thirty minutes.

---

Another fix.
Slightly reordered agent execution.

Check everything again.
Login. Agent. Notification. Settings.

Thirty minutes.

---

Another fix.

Everything again.

Thirty minutes.

"Do I have to check everything every time I make a change?"

---

Yes.

Why?
Because if you don't, you won't know what broke.

Domain splitting made things better than before.
But "better" isn't "safe."

Don't check? Don't know.
Want to check? Click through everything.

---

Ten features? Fine.
Click through ten. Ten minutes.

Twenty. Twenty minutes.
Thirty. Thirty minutes.

Now fifty.
Fifty every time?

---

Around the fifth check, things change.

"This has nothing to do with what I just changed."
"This one probably didn't break."

Skip it.

That's exactly the door bugs walk through.

Willpower runs out.
Fifth check -- focus drops.
Tenth -- you start skimming.
Twentieth -- you stop looking.

Manual testing isn't a time problem.
It's a willpower problem.

---

Some errors only show up when you run the code.

This is from the Python days.
Made a function. `add(a, b)`.
Passed in `add(5, "hello")`.

Error? Don't know.
Have to run it to find out.

A state where you don't know if it's an error until you run it.
Schrodinger's error.

Can't tell if the cat is alive or dead until you open the box.
Can't tell if there's a bug until you run the code.

---

Fifty features means fifty boxes.

Have to open each one.
Don't want to? "Probably fine." Skip.
Skip and a dead cat stays in the box.

Gets discovered later.
At the worst possible moment.
Always.

---

Change code.
Want to know if it worked? Click through everything manually.
More features, more clicking.
More clicking, more skipping.
More skipping, more breaking.

Is there a way out of this loop?

Something that confirms "it worked" without me clicking.
Every time. Automatically. Without missing anything.
