# The age of “Vibe Coding” has arrived… original source text

The age of “Vibe Coding” has arrived…

…whether we like it or not.

If you’re unfamiliar with that term, consider yourself fortunate to be so insulated from programmer meme culture. It’s a term that held virtually no meaning a few years ago, and today is a common expression. So what does it mean?

Vibe Coding is a verb, It’s the act of using LLMs and other A.I.-powered code-completion tools less like they’re a helper, and more like they’re the lead dev. It’s almost an inversion of control: you’re no longer using the A.I. when you get stuck, you’re using it all the time, by default. And it’s only when something doesn’t work as expected, or the system needs direction or course-correction, that you need to step in and help.

The first few times I heard the term it was used in a derogatory way; saying someone was “vibe coding” their product was not a compliment. But in less than a year, that connotation has shifted, hard. Recently, even Garry Tan, the president of Y Combinator, (the startup incubator) has said publicly that in their current batch of startups, 25% of the companies are vibe-coding all or most of their codebases.

And I don’t just mean that models are filling-in function bodies, or providing templates for DB schemas, they’re doing a lot more than that: even going so far as designing system architecture. That’s what today’s paper is all about. AI tools that perform core pieces of system-design. These are high-stakes, mission-critical tasks that are traditionally reserved for only the most senior engineers on the team.

This whole trend makes a lot of people extremely uncomfortable…and I will count myself in that group. I am very-much a skeptic. So consider today’s episode as one that is designed to push us all out of comfort zones just a little bit. But it’s also more than that. Today we’re pulling back the curtain on a perspective that few of us might organically be exposed to. An ideology that is much less reticent to use AI, and an attitude that embraces the idea of high automation in the code creation process. Hopefully if nothing else, this paper will help people like me get a better understanding of…well…what these kids are up to…

Today’s paper is a systematic literature review. It’s not about a single tool or technique, it’s a survey of the field. It looks, broadly, at how A.I. (everything from clustering algorithms to LLMs) is being used to support the structural design of microservices. Systems that help define architecture before a single line of code is written.

On today’s episode we’ll cover how these systems actually work, what kinds of artifacts they rely on, and where they tend to break down. We’ll also get into the operational feedback loops that tie runtime metrics back into design.

To reiterate, this paper is not about vibe coding as a whole, it’s narrowly about vibe coding your system architecture specifically. So the tools and techniques we cover might not be familiar names, and they may not take a familiar shape…but they all share a premise: that engineers can do more, faster, and better, when they surrender much or most of the decision-making process to AI.

Let’s jump in.

We need to start by talking about microservices for a bit. There’s a common misconception that once you decide to migrate to microservices, the rest of the architecture will just magically fall into place. But, that’s far from the case. Service decomposition sounds simple enough, but it’s actually quite messy.

Even with mature approaches like Domain-Driven Design, teams often struggle to identify where service boundaries should be drawn. Architects often have to make assumptions (about coupling, ownership, coordination, observability, versioning and more) based on little more than a hunch.

There’s also the granularity problem. It’s easy to accidentally break the system into either too many or too few services, because the tradeoffs between cohesion and communication cost are rarely obvious up front. Worse, there are no standard metrics for evaluating whether a decomposition is “good.” So again, teams rely on intuition or prior experience, which introduces variability across projects and organizations.

Then there’s ops. Each service you create needs deployment, monitoring, fault tolerance, API contracts, and data persistence. If service boundaries are drawn poorly, those costs multiply. Coordination between services often requires distributed transactions or sagas, both of which are complex to test and verify. And once services are deployed, tracing and debugging issues becomes exponentially harder, especially when ownership is split across teams.

And for the record, these difficulties exist whether you’re starting fresh or decomposing a monolith. On the first hand, greenfield projects tend to lack detailed process models or domain ontologies. But the domains spec’d out in an existing monolith rarely map cleanly to microservice boundaries. Semantic overlaps, ambiguous responsibilities, and unclear boundaries between capabilities lead to fragile designs that require a mountain of refactoring.

This is the backdrop for why so many teams are grasping for help in this arena. They’re not necessarily trying to replace architecture decisions, but to help automate the parts of the process that are slow, inconsistent, and highly sensitive to the quality of input artifacts. They’re faced with what feels like a giant interlocking set of constraint optimization problems, and they’re looking, quite simply, for solvers.

The authors structure this paper around five research questions:

What AI techniques are actually being used during microservice design?
What specific challenges arise when integrating them?
What measurable benefits are being reported compared to traditional methods?
What trends are emerging in current research?
And which input artifacts (like requirements docs, use cases, or diagrams) are these systems relying on?
For service composition, the most mature examples fall into two categories: clustering-based partitioners and NLP-driven semantic groupers. We’re also going to look at LLMs, but as they’re less mature we’ll look at them separately later on in the episode.

Clustering-based models work by treating various parts of the system (like use cases, source files, database tables, or even runtime logs) as nodes in a graph. Tools like Mono2Micro, PF4MD, and GreenMicro use unsupervised learning to identify clusters of related elements.

Mono2Micro, for example, takes static code analysis and dynamic call graphs as input, runs them through k-Means clustering, and returns a set of candidate microservices that minimize inter-service communication.
PF4MD adds architectural semantics by incorporating problem frames and complexity metrics into the partitioning logic.
GreenMicro, which is focused on greenfield development, clusters use cases and related entities using heuristics to generate service boundaries early in the design process.
All of these systems aim to reduce coupling and increase cohesion without requiring the architect to hand-craft the partitions. Across all of these options, the key idea is the same: microservices decomposition can be reframed as a problem of structure discovery. Whether the input is textual, behavioral, or architectural, the output is an inferred segmentation intended to help the human architect make sense of the design space. But these are assistive systems, not definitive ones. The AI can point to plausible groupings, but it cannot validate whether those groupings are operationally meaningful, or whether they align with organizational structure, compliance constraints, or runtime observability goals. Clustering and metrics can help reduce design uncertainty, but only when their assumptions are satisfied. They need clear input boundaries, meaningful feature spaces, and the right objectives encoded in their optimization. Without that, they risk giving the illusion of structure where there is none.

The second category uses natural language processing to analyze textual inputs like user stories or requirement documents. Tools in this space include SEMGROMI and GTMicro.

SEMGROMI operates on user stories by extracting semantic meaning, measuring similarity across stories, and grouping them into functionally coherent buckets. These buckets are proposed as candidate services.
GTMicro pushes further by using transformer-based models (specifically BERT variants) to embed use case descriptions and perform hierarchical clustering. The goal is to find latent functional structure purely from the language used to describe the system. This is especially useful when there is little or no existing codebase and the only available artifacts are textual.
What all these tools have in common is that they are trying to automate a process that is typically qualitative and intuition-driven. They take artifacts that already exist in the development process and apply unsupervised or semi-supervised learning techniques to generate structure. That structure, in turn, can be used to scaffold the early stages of a microservices design. It is not fully automatic, (and of course it is not always correct), but it significantly reduces the number of decisions that architects need to make in the dark. Most importantly, these tools are designed to work early, before infrastructure is committed, when changes are cheap.

But, it’s not all positive, of course.

Despite the progress, the reality is that most of these AI-driven design tools are brittle. They work best when the input data is clean, structured, and well-formed. That is rarely the case in real projects.

Take SEMGROMI: clustering user stories by semantic similarity sounds reasonable on paper. But if the user stories are ambiguous, inconsistent, or missing key entities, the clustering falls apart. The system can’t enforce cohesion if it doesn’t understand what the stories are about. The same issue applies to GTMicro, (the one that uses a BERT-based transformer to group use cases). It depends entirely on clear, well-defined descriptions. If those descriptions are vague or domain-specific without sufficient examples, the model either overfits or splits the wrong seams. GreenMicro runs into a similar problem. It assumes that there’s a consistent mapping between use case boundaries and service boundaries. That mapping often doesn’t hold. Overlapping definitions or weakly defined actors lead to imprecise groupings. The result is a set of services that look clean structurally but have poor separation of concerns once code is actually written.

Data consistency is another recurring failure point. Most of the tools reviewed here focus on initial decomposition. They don’t enforce rules for eventual consistency or distributed coordination. PF4MD, for instance, uses problem frames and complexity metrics to define services, but it leaves transactional guarantees entirely up to the architect. You get cleaner modules, but the consistency logic has to be bolted on manually. If services share write responsibilities over related entities, or if distributed transactions are needed, those problems are still downstream.

None of the decomposition tools seem to incorporate real feedback from the system’s runtime behavior. They’re not built to adapt as usage patterns change. That means the resulting service boundaries are static. Once they’re defined, they’re fixed unless manually reevaluated. If usage shifts, or if new coupling emerges during implementation, you either re-architect by hand or live with the degradation.

Finally, there's the issue of false precision. These tools can produce sharp, quantifiable boundaries that look credible but might ultimately be based on shallow signals. For example, clustering algorithms often rely on vector similarity metrics over text embeddings or dependency graphs. That gives a precise segmentation, but not necessarily a correct one. Two stories might be semantically similar but operationally unrelated. Or vice versa. The model can’t tell the difference unless it understands the functional role of each component in context, which is still beyond most current systems.

In short, these tools are not capable of full automation…not yet. They’re probably best seen as accelerators for an active design exploration process. Copilots, not autopilots. They help surface candidate boundaries quickly, but they don’t validate them against domain constraints, failure modes, or organizational factors. Those checks still have to be done by an experienced architect. Without that, the risk is not just inefficiency. It’s brittle systems built on shaky segmentation.

Now let’s turn, as promised, to the use of large language models. Several of the reviewed studies treat LLMs as a complementary layer to existing design workflows. Rather than automating the entire process, they position the model as a suggestion engine that proposes multiple decomposition strategies or identifies architectural smells based on textual context. For example, one of the experiments involved feeding a requirements specification into an LLM and prompting it to suggest bounded contexts for a microservices implementation. The generated output included descriptions of service responsibilities, communication pathways, and hints at potential data ownership boundaries. The results were not perfect, but they showed enough internal consistency to warrant human-in-the-loop consideration.

A common pain point in microservices design is tracking the rationale behind architectural choices: why a service boundary was drawn a certain way, why a communication protocol was chosen, or why eventual consistency was deemed acceptable in a particular context. In one case LLMs were used to help generate structured design documentation by turning informal discussions into decision records. Some researchers used prompt-engineered templates to guide the model through the necessary tradeoffs, generating markdown-style design entries aligned with decision log formats.

These patterns are often referred to as "prompt pattern sequences" in the literature. Instead of issuing a single prompt and taking the result as-is, the system walks through a structured multi-prompt sequence: first asking the model to identify the core functionality, then decomposing it into modules, then evaluating tradeoffs across different decomposition strategies, and finally outputting decision rationale. This incremental prompting approach significantly improved both the internal consistency and usability of the model's outputs, compared to one-shot queries.

However, the paper also points out limitations. Model hallucination remains a problem, particularly when the input artifacts are ambiguous, inconsistent, or underspecified. In one case, the model generated a plausible-sounding but entirely non-existent architectural pattern in response to a vague requirement about “cross-cutting telemetry.” In another, the model ignored established constraints in the input and recommended a pattern that violated the stated latency budget. In short, LLMs are not yet reliable enough to act as authoritative sources of architectural truth.

If you're building microservices from scratch, this paper gives you a map of what tools and techniques are actually being used, and where the boundaries of current AI support really are. If you're a software engineer or architect trying to stay current, this paper gives you a clear signal through the noise, and is definitely worth the read. It catalogs what tools are being used, which techniques are maturing, and what tradeoffs you should expect if you're incorporating AI into your architecture workflow. The appendix includes a side-by-side comparison of all the tools mentioned, the specific AI methods they use, and what artifacts they rely on.