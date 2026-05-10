---
title: 'GitHub Fixed What AI Coding Couldn''t'
description: 'Field notes from the trenches: Exploring github fixed what ai coding'
pubDatetime: 2026-05-09 07:25:49+00:00
featured: false
draft: false
tags:
- vibe coding
- field report
ogImage: ""
---







> **TL;DR**: An excavation of github fixed what ai coding couldn't. Real scars, no slop.

# Spec Kit: 4 Steps to Make AI Vibe Coding Reliable

## TL;DR

GitHub open-sourced a toolkit called **"Spec Kit"** to fix the problems of building with AI. The goal: move past the limits of "vibe coding" into spec-driven development that makes AI coding accurate and trustworthy.

## AI Writes Code Now, But Something's Off

AI coding is everywhere. "ChatGPT, build me a shopping mall." Code appears. But when you actually run it... it doesn't work. Or it works, but it's not what you wanted.

You've been there. The code looks legit, but it's a mess inside. Part of it is right, but the important stuff is missing. Or it won't even compile. Or the tech stack is completely wrong.

That's the trap of "vibe coding." Andrej Karpathy coined the term -- coding by feel. "Make it something like this" and AI goes "sure, like this?" and throws code at you. Fine for prototypes. But for a real product or adding to an existing system? Disaster.

The problem: we've been using AI like a search engine. But AI isn't a search engine. It's more like a pair programmer who takes everything literally. Great at pattern recognition. Can't read minds. It needs clear instructions.

## GitHub's Answer: Spec Kit

So GitHub built Spec Kit. Open-sourced it. This thing could change how AI coding works.

The core idea is simple. Not "code first, docs later." Instead: **"spec first, code later."** The spec becomes the contract for how code should behave. The source of truth for AI tools. No more guessing.

Specs used to be written and shoved in a drawer. In the AI era, specs become living documents. Spec changes, code changes. Something feels off, go back to the spec.

## Four Steps

Spec Kit works in four stages. Each stage has a clear role, and you validate before moving on.

**First: Specify.** You describe what you want to build and why, at a high level. AI generates a detailed spec. The key -- this isn't about tech stacks or app design. It's about user journeys, experiences, what success looks like. Who uses this? What problem does it solve? How do they interact? What outcomes matter? Like drawing a map of the user experience you want. AI fills in the details. This is a living artifact. It evolves as you learn more about your users.

**Second: Plan.** Now it gets technical. Tell AI your preferred tech stack, architecture, constraints. AI builds a comprehensive implementation plan. Company standards? Put them here. Legacy systems, regulatory requirements, performance targets -- all of it goes in. You can ask for multiple plan options and compare. Feed it internal docs and it'll incorporate your architecture patterns directly. The point: AI needs to understand the rules before the game starts.

**Third: Tasks.** AI takes the spec and plan and breaks them into actual work items. Small, reviewable pieces. Each one solves a specific part of the puzzle. Each task should be independently implementable and testable. This matters because it gives AI a way to validate its own work and stay on track. Like test-driven development, but built for AI agents. Not "build authentication" -- instead, "create a user registration endpoint that validates email format."

**Fourth: Implement.** AI works through the tasks one by one (or in parallel). The difference: you're not reviewing a thousand-line code dump. You're reviewing focused changes that solve specific problems. AI knows what to build (spec said so), how to build it (plan said so), and exactly what to do (tasks said so).

The developer's role isn't just pointing directions. You validate too. At each stage, reflect and improve. "Does this spec capture what I actually want? Does this plan account for real-world constraints? Did AI miss edge cases?" The process has explicit checkpoints for critiquing, finding gaps, and correcting course before moving on.

## Try It

Installation is simple. Install the specify CLI tool and initialize your project:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

Once initialized, `/specify` generates the full spec from a high-level prompt. Focus on the "what" and "why" -- not technical details.

`/plan` makes AI create the technical implementation plan. Give high-level technical direction and AI generates a detailed plan respecting your architecture and constraints.

`/tasks` breaks the spec and plan into executable task lists. AI uses these to implement the project requirements.

This structured workflow turns vague prompts into clear intent that AI can reliably execute. Works with GitHub Copilot, Claude Code, Gemini CLI -- any of them.

## Why This Works

This approach succeeds where "just ask AI" fails because of a basic truth about language models. They're great at pattern completion. They can't read minds.

A vague prompt like "add photo sharing to my app" forces the model to guess thousands of unstated requirements. AI will make reasonable assumptions. Some will be wrong. You won't discover which ones until you're deep in the implementation.

But give it a clear spec upfront, a technical plan, and focused tasks -- AI gets dramatically sharper. Instead of guessing user needs, it knows what to build, how to build it, and in what order.

This also works across tech stacks. Python, JavaScript, Go -- the fundamental challenge is the same: translating intent into working code. The spec captures intent clearly. The plan converts it into technical decisions. Tasks break it into buildable pieces. AI handles the actual coding.

For large organizations, it solves another critical problem. Security policies, regulatory rules, design system constraints, integration needs -- where do all those requirements live? Often in someone's head. Or buried in a wiki nobody reads. Or scattered across Slack threads you'll never find.

With Spec Kit, all of it goes into the spec and plan. Where AI can actually use it. Security requirements aren't an afterthought -- they're in the spec from day one. Design systems aren't bolted on later -- they're part of the technical plan that guides implementation.

The iterative nature gives it power. Traditional development locks you into early decisions. Spec-driven development makes changing direction simple. Update the spec, regenerate the plan, let AI handle the rest.

## Three Places Where This Shines

**Starting from zero.** New project? The temptation is to just start coding. But invest a little upfront in a spec and plan, and AI builds what you actually intended. Not a generic solution based on common patterns.

**Adding features to existing systems (N to N+1).** This is where spec-driven development is strongest. Adding features to a complex codebase is hard. Writing a spec for the new feature forces clarity on how it interacts with the existing system. The plan encodes architectural constraints so new code feels native, not bolted on. Makes ongoing development faster and safer.

**Legacy modernization.** When rebuilding legacy systems, the original intent often gets lost in time. Spec-driven development captures core business logic in a modern spec, designs new architecture in the plan, and lets AI rebuild the system from scratch -- without inheriting technical debt.

The core benefit: separating the stable "what" from the flexible "how." Iterative development without expensive rewrites.

## What the Future Looks Like

We're moving from "code is the source of truth" to "intent is the source of truth." With AI, the spec becomes the source of truth and decides what gets built. Not because docs got more important. Because AI makes specs executable. When a spec automatically becomes working code, it's the spec that decides.

Spec Kit is GitHub's experiment in making that transition real. They open-sourced it because this approach is bigger than any single tool or company. The real innovation is the process.

## So What Now?

Next time you build something with AI, try Spec Kit. Simple to install. Compatible with GitHub Copilot, Claude Code, Gemini CLI. Especially when adding new features to existing code -- try it once and you'll feel the difference.

Vibe coding is fun. "Something like this" and AI builds it -- that's cool. But to build something actually useful, it's time for a more structured approach. AI is smart enough already. Now we need to be smarter about using it.

Spec-driven development doesn't solve everything. But it solves the biggest problem of building with AI -- **wishing AI could read your mind.** Stop wishing. Just tell it clearly. Then AI builds what you actually want.

---

**Source**: [GitHub Blog - Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
