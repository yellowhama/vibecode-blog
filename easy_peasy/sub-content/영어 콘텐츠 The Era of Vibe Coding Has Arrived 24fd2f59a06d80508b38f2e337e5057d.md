# 영어 콘텐츠 The Era of Vibe Coding Has Arrived

# "Hey AI, You Write All the Code" - The Era of Vibe Coding Has Arrived

![28a9f2dd-e206-4e65-b62f-10f03e077a80.png](28a9f2dd-e206-4e65-b62f-10f03e077a80.png)

## When AI writes code, what do developers do?

There's a new phrase going around developer circles: "Vibe Coding." In English, "vibe" means "feeling, atmosphere" - so are we talking about "coding by feel"? **'Vibe Coding' is a term popularized by Andrej Karpathy, OpenAI co-founder and former Tesla AI chief, in February 2025.** It's an approach where developers describe goals in natural language, LLMs generate the code, and humans review and refine the quality. Here's what Karpathy said about vibe coding:

"The code almost feels like it doesn't exist. You just speak in natural language, run it, copy-paste, and most of it just works."

Back in the day, developers wrote code line by line with precision. "This variable goes exactly here, this function exactly there..." But vibe coding? Different story. Developer says "Hmm... make something like an e-commerce site," and AI writes the entire codebase. Developer just goes "The vibe's a bit off here, tweak this part." It's like coding by "trusting the vibe" - hence the name.

Sounds like a joke? Well, Jared Friedman, Managing Partner at Y Combinator, just dropped a bombshell. About 25% of startups in the 2025 W25 batch generated over 95% of their code with AI. Y Combinator - the place that birthed Airbnb and Dropbox. One in four companies they're investing in basically outsources coding to AI.

The core is simple: AI takes the lead in writing code, developers just polish here and there. Used to be developers wrote code and asked AI for help when stuck. Now it's flipped. AI cranks out code, developers only step in when something breaks.

Reflecting this reality, an interesting paper just appeared in the Software journal: "Designing Microservices Using AI" - a Systematic Literature Review. A research team from Buenos Aires analyzed 43 studies from 2018 to 2024. What did they cover? A comprehensive look at how AI automates and improves microservice design. In plain English: academia's answer to "Can we trust AI with system architecture?"

![bbda4995-6114-4f67-bd02-1facbd0bfd06.png](bbda4995-6114-4f67-bd02-1facbd0bfd06.png)

## Why Microservice Design is Hell

Microservices means breaking one big program into many small services. Let's use a Chinese restaurant analogy.

A real Chinese restaurant is simple. "Delivery! Two Lo mein, one Orange chicken combo!" "Coming right up!" Done.

What about a computer-run Chinese restaurant? Same order triggers this chaos:

Order Service asks Inventory Service: "Got noodles for two?" Inventory Service responds: "Checking... Yes." Order Service asks again: "How about sauce?" "Checking... Yes." "Chicken?" "Checking... Yes."

Then Order Service tells Noodle Service "Cook two portions," tells Sauce Service "Prepare two portions," tells Chicken Service "Fry one portion." Noodle Service notifies Sauce Service "Noodles ready," Chicken Service tells Container Service "Sauce packaged."

What takes humans 2 sentences requires 30 communications for computers.

Bigger problem? If Sauce Service crashes or runs out, no Orange Chicken. Entire order stops. Need to add a new sauce-making function. What do humans do? Just make more sauce.

This is why microservice design is hell. Hard to decide what constitutes one service. Too granular = communication nightmare. Too broad = why even split?

Even experienced developers think "Fortune cookies are simple, let's separate them," then later realize every delivery calling Fortune Cookie Service slows everything down.

![6d01afec-b6d0-4759-856c-4b3312c6548c.png](6d01afec-b6d0-4759-856c-4b3312c6548c.png)

## How AI Solves This

That recent Software journal paper analyzed 43 studies from 2018-2024. A comprehensive analysis of how AI automates and improves microservice design.

AI uses three main approaches:

**First, finding patterns in code.** Uses clustering techniques. For an e-commerce site: "Product lookup" and "inventory check" always called together? Same service. "Payment processing" and "points deduction" always happen together? Same service. AI finds millions of these patterns. What would take humans months takes AI minutes.

**Second, understanding requirements documents.** "Users should be able to search products," "Users should be able to add to cart," "Users should be able to checkout." AI reads these sentences and groups similar functions. Tools using BERT understand context, not just words. Knows "product search" and "item lookup" mean the same thing.

**Third, learning actual usage patterns.** Analyzes system logs. Which features get heavy use? Which services communicate most? Too much communication? Merge services. Service too big? Split it. Machine learning finds the optimal balance.

![89afaa4e-2c82-4bed-a089-266af261ee71.png](89afaa4e-2c82-4bed-a089-266af261ee71.png)

## If AI Designed a Chinese Restaurant System?

So what if AI designed a Chinese restaurant delivery system from scratch?

AI first analyzes 1 million past orders. "General Tso's-Orange Chicken combo ordered together 90% of the time?" Make it one service. "Fortune cookies needed for every order?" Include in order service, don't separate. "Friday 6-8 PM orders explode?" Pre-scale noodle cooking service to 3 instances.

Computers are dumb - asking "Got noodles?" "Got sauce?" 30 times. AI is smart - "It's a combo order, obviously needs everything" - processes once. Like a 20-year veteran restaurant owner whose hands move automatically hearing "Two combos!" AI learns patterns and skips pointless confirmations.

Basically doing things "by feel" - but way smarter than computers doing it mechanically.

![e2e51836-7a79-4962-98b8-30ef621109c8.png](e2e51836-7a79-4962-98b8-30ef621109c8.png)

## Real Results?

The paper's 43 studies show real impact.

**IBM's Mono2Micro** - literally splits monolithic programs into microservices. How? First scans all code. Which classes call which, what data they share. Then builds a graph, like a subway map of connections.

Graph complete? AI starts cutting. High-connection nodes stay together, low-connection nodes separate. Real companies report: what took weeks now takes days. More importantly, finds hidden dependencies humans miss. Those "Wait, this code connects to THAT?" moments.

**SEMGROMI** takes a different approach. Doesn't read code, reads user stories. "Users should be able to login," "Users should be able to purchase."

SEMGROMI reads these sentences and groups similar ones. "Login," "password reset," "signup" - all user authentication, one service. "Product view," "product search," "category browse" - product service. Sounds simple, but with hundreds of sentences, human brains explode. SEMGROMI automates this.

Interesting part? It improves coupling and cohesion. Coupling = how tightly services stick together (lower is better - independence means fixing one doesn't break others). Cohesion = how related functions within a service are (higher is better - related stuff together = easier management).

SEMGROMI's groupings show lower coupling and higher cohesion than human attempts. Computers categorize more systematically than humans.

Not a silver bullet though. Creates drafts. Final decisions still need humans. But way better than starting from scratch. Like a canvas with sketches beats a blank canvas.

## Problems AI Can't Solve Yet

AI isn't omnipotent. Still unsolved problems:

**Data consistency** - Order Service says "order complete" but Inventory Service says "out of stock." How to prevent mismatches? AI has no answer yet.

**Distributed transactions** - Payment succeeded but shipping failed. Cancel payment? Retry? AI can't predict all complex scenarios.

**Vague requirements** - "Make it user-friendly," "needs good performance." AI can't interpret ambiguity. Needs concrete numbers.

**Real-time feedback** - AI's design has problems in production. Feeding operational data back into design? Still research phase.

## The Future?

The paper identifies trends:

**Generative AI's emergence** - biggest change. Large language models like ChatGPT help design. "Design an e-commerce site as microservices" gets you a complete architecture proposal.

**Reinforcement learning** applications. Systems self-learn. Traffic increases? Auto-scales services. Frequent errors? Auto-improves.

**Most realistic: hybrid approach.** AI drafts, humans review. Humans catch what AI misses.

![6f939703-310c-46ad-9544-7ebcce0ad914.png](6f939703-310c-46ad-9544-7ebcce0ad914.png)

## So How Do We Use This?

Now you can enjoy Spain without speaking Spanish.

Just pull out your translation app.

Sure, it's less smooth than native speakers.

Now you can write code without knowing programming.

Sure, it's way less smooth than real developers.

**The key: it's possible.** Impossible became possible.

Inconvenience? Worth it. Now everyone can be a developer.

This is the vibe coding era developer.

So what should you do?
Install Ubuntu on your computer.

Then install Claude or Cursor.

Everything's ready.

Ready to develop?

---

### **Primary Sources on Vibe Coding:**

**1. Andrej Karpathy's Original Concept**

- Y Combinator Library: ["Vibe Coding is the Future"](https://www.ycombinator.com/library/ME-vibe-coding-is-the-future?utm_source=chatgpt.com)
- Apple Podcasts: ["How to Get the Most Out of Vibe Coding - Startup School"](https://podcasts.apple.com/cm/podcast/how-to-get-the-most-out-of-vibe-coding-startup-school/id1236907421?i=1000704911142&utm_source=chatgpt.com)

**2. Y Combinator Statistics**

- TechCrunch (2025): ["A Quarter of Startups in YC's Current Cohort Have Codebases That Are Almost Entirely AI-Generated"](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated/?utm_source=chatgpt.com)

### **Academic Papers on AI & Microservices:**

**3. Systematic Literature Review**

- Software Journal (2025): ["Designing Microservices Using AI: A Systematic Literature Review"](https://www.mdpi.com/2674-113X/4/1/6)
    - Authors: Research team from Universidad de Buenos Aires
    - Analyzed 43 studies (2018-2024)

**4. IBM Mono2Micro**

- ACM FSE'21: ["Mono2Micro: A Practical and Effective Tool for Decomposing Monolithic Java Applications to Microservices"](https://arxiv.org/pdf/2107.09698)
    - IBM Research publication
    - Automated monolith decomposition

**5. SEMGROMI Framework**

- PeerJ Computer Science: ["Semi-automatic Microservice Decomposition through User Story Analysis"](https://pmc.ncbi.nlm.nih.gov/articles/PMC10280387/)
    - Natural language processing approach
    - Requirements-based decomposition