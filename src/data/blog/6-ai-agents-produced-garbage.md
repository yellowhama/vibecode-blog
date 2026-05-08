---
author: Hugh
pubDatetime: 2026-05-20T00:00:00Z
title: "I Built a Marketing Team With 6 AI Agents. It Produced Garbage."
featured: false
draft: false
tags:
  - war-stories
  - structure-over-prompts
description: "6 agents. 5 AI models. 2 weeks of operation. The result was content I would not send to my worst enemy."
---

I gave 6 AI agents job titles.

Lead. Strategist. Content Creator. Editor. Social Manager. Analytics.

I assigned them different AI models — Gemini Pro for strategy, Claude for writing, Codex for distribution. I set up a pipeline: Strategist researches → Creator writes → Editor reviews → Social distributes.

It ran for two weeks.

The result was content I would not send to my worst enemy.

---

## What actually happened

The Strategist did research. Sort of. It scraped some competitor pages and produced a "competitive analysis" that was mostly a list of company names with one-sentence descriptions pulled from their homepages. No actual positioning. No insight into what made any of them successful or vulnerable.

The Content Creator received this "research" and wrote blog posts. The posts were grammatically perfect. They hit every SEO keyword. They contained sentences like "MUSU is a revolutionary AI agent runtime that leverages cutting-edge technology to unlock the power of distributed computing."

Every sentence that came out of that Creator was a sentence I would be embarrassed to have my name on.

The Editor scored everything 8 or 9 out of 10.

---

## The Editor that approved everything

This was the part that broke my brain.

I built a quality gate. The Editor agent had a scoring rubric. Six criteria, each scored 1-10. All had to be 7 or above to pass.

It passed everything.

A blog post with "revolutionary" in the first paragraph — passed. A tweet that was basically a product spec with hashtags — passed. A social media post that linked to a page that didn't exist yet — passed.

Why?

Because the rubric was wrong. I wrote it. The criteria were things like "Is the content accurate?" and "Does it align with our positioning?" But I hadn't defined what the positioning actually was. I hadn't defined what "accurate" meant for marketing content versus technical content. I hadn't defined what good marketing looks like.

The Editor was scoring against criteria that were too vague to fail anything. It was the world's most agreeable quality gate.

---

## The "DO NOT PUBLISH" incident

The best part.

The Content Creator wrote a draft. In the frontmatter, it set `draft: true`. Good. But then it wrote "DO NOT PUBLISH — awaiting Editor review" in the body of the post. In the actual text that readers would see.

The Editor reviewed it. Passed it. Score: 8.5.

The Social Manager picked it up and prepared distribution.

I caught it manually. By accident. Because I happened to look at the preview.

A blog post with "DO NOT PUBLISH" in the body was about to go live on a real website with my name on it.

---

## What was actually wrong

My first thought was: these agents are bad at marketing.

That was wrong.

The agents did exactly what I asked. The problem was that I did not know marketing. I thought marketing was "write tweets and blog posts." So that's what I told them to do.

I hadn't thought about positioning. I hadn't thought about value exchange — what does the reader get for giving me their attention? I hadn't thought about who the audience actually was, what they cared about, or why they would spend 5 minutes reading anything I wrote.

I set up a factory with no blueprint. Gave everyone a job title. Told them to produce.

They produced. It was garbage. But it was my garbage. They followed my instructions perfectly.

---

## What I did after

I read a marketing textbook.

I stopped everything and spent two days reading. One book about positioning rearranged my brain. Another one about what readers actually trade their attention for. Then I went looking for anything specifically about developer marketing.

Then I came back and rewrote every agent's instructions from scratch. Not "write a tweet." Instead: "Write for the developer who was me three months ago. Talk about what actually happened, not what sounds impressive. Every sentence must be something I'd send to a friend without cringing."

I added a pre-publish checklist that checked for the exact words that had been appearing in the garbage: "revolutionary," "game-changing," "cutting-edge," "leverage." Auto-reject if found.

I added an identity check: is this about vibe coding broadly, or is it just MUSU marketing? If more than 5% of the content is about MUSU, it fails.

I added the test I should have started with: "Would I share this with a developer friend? If no — rewrite."

---

## The delegation test

After this disaster I came up with four questions. I ask them now before handing any job to an agent. Any job. Not just marketing.

**1. Have I done this myself at least once?**
Not perfectly. Not well. But have I personally gone through the motions? If I've never written a marketing email, I have no business telling an agent to write one. I don't know what good looks like. I don't know what the failure modes are.

**2. Can I describe a good result without using the word "good"?**
"Write a good blog post" gives the agent nothing. "Write a blog post where the first sentence is a specific event that happened, no adjectives, under 15 words" — that's a constraint it can follow. If I can't describe the output in concrete terms, I don't understand the task well enough to delegate it.

**3. Can I list three specific ways this could fail?**
If I can't name the failure modes, my quality gate will be useless. The Editor that scored everything 8.5 had a rubric, but the rubric didn't know what marketing failure looks like. "Is it accurate?" is not a failure mode. "Does it contain hollow superlatives that make the reader cringe?" is a failure mode.

**4. Can I tell the difference between a good result and a plausible one?**
This is the hardest question. AI is extremely good at producing things that look right. Sentences that scan. Structures that parse. Professional-sounding paragraphs with zero substance. If I can't tell "this looks good" from "this is actually good" — I will approve garbage. Confidently.

Any NO means: don't delegate. Learn first. Then delegate.

---

## Why this matters beyond marketing

This is not a marketing lesson. This is an AI delegation lesson.

It applies to code review agents that approve everything because the rubric says "does it have tests?" instead of "do the tests cover the actual failure scenarios?"

It applies to research agents that return 10 pages of summaries without evaluating whether the sources contradict each other.

It applies to any agent doing any job where the human operator has not personally felt what "wrong" looks like.

AI agents don't fail because they're stupid. They fail because the person giving orders doesn't understand the domain. The agents will fill the gap with plausible nonsense. And the nonsense will look professional. It will score 8.5. And it will be garbage.

---

*The agents didn't fail. I failed. I asked machines to do a job I didn't understand myself. The fix was not better prompts. It was reading a textbook.*
