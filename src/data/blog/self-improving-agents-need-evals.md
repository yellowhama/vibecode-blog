---
title: "Self-Improving Agents Need a Judge Outside the Loop"
pubDatetime: 2026-05-21T16:03:27.688Z
description: "A private source-backed draft about why self-improving agent loops need external judgment before they optimize the wrong thing."
draft: true
featured: false
series: "AI Tool Note"
lang: "en"
workflow: "packet"
tags: ["ai-agents", "agent-harness", "verification"]
ogImage: "/images/posts/self-improving-agents-need-evals.png"
references:
  - name: "Primary source packet reference"
    url: "https://www.youtube.com/watch?v=RoaPvj9Ovug"
    guru: "source-workflow-packet"
---

# Self-Improving Agents Need a Judge Outside the Loop

> Private draft. Not approved for publication.

## Packet Receipt

```txt
source_workflow_quality_gate=pass
source_workflow_slug=self-improving-agents-need-evals
publication_state=draft_only
approval_required=true
approval_candidate=false
candidate_blockers=human_critique,rendered_candidate,hash_approval,image_contract
editorial_decision=keep_internal_example
editorial_decision_ref=src/data/draft-editorial-decisions.json#self-improving-agents-need-evals
```

## The Paragraph That Gets Past You

Here is the paragraph that should make an editor nervous:

```txt
Self-improving agents are the next major leap in AI. Instead of waiting for humans to improve prompts and tools, agents can now test themselves, learn from results, and make their own harnesses better over time.
```

It sounds clean. It is also the kind of paragraph that lets bad systems walk straight through the front door.

The missing word is judge.

A loop that improves itself is not impressive by default. A loop that improves itself against the wrong judge is a machine for producing cleaner mistakes. It will not necessarily get worse. That is the trap. It may get better and better at the measurement that fails to see the thing you actually care about.

What is inspectably wrong with the paragraph is not its tone. It gives the reader no source boundary, no reject condition, no trace to inspect, and no decision about what would make the loop unsafe. The claim sounds useful because it hides the artifact that should be judged.

That is the part of self-improving agents worth taking seriously before the demos get too smooth.

## The Failure Is Not Style

The source video describes AutoAgent as a meta-agent system: one agent edits the harness, runs task agents against benchmarks, reads the results and traces, then keeps or reverts changes.

Reader question: before you let an agent improve its own harness, what should you accept, reject, or verify about the judge that decides keep versus revert?

That shape is useful:

```txt
edit harness -> run tasks -> score benchmark -> inspect trace -> keep/revert -> repeat
```

But the shape is also dangerous if you admire the loop more than the evaluator.

If the benchmark can only see whether a spreadsheet task passed, the agent may learn to optimize the spreadsheet path. If the benchmark can only see terminal success, it may learn terminal success. That is fine when the benchmark is the work. It is not fine when the benchmark is a proxy for a messier human outcome.

For writing, the failure is obvious. A draft can pass structure checks and still read like an internal status memo. It can have sources and still not have a point. It can include an image and still use that image as decoration. It can render correctly and still make a cold reader ask, "Why am I reading this?"

If that failure is not visible to the judge, a self-improving writing agent will optimize around it.

## The Harness Is the Point

The useful lesson from the source is not "let agents improve themselves." The useful lesson is that every improvement loop needs a keep/revert boundary.

Vibecode's article-production harness has the same job:

```txt
Source Scout -> Packet Builder -> Angle Strategist -> Evidence Designer
Draft Writer -> Reference Critic -> Public Surface Editor -> Rendered QA -> Publisher
```

That is not bureaucracy. It is where the judge lives.

The Draft Writer is allowed to write. It is not allowed to approve. The Reference Critic is allowed to reject. It is not allowed to hide a weak source behind a nicer sentence. Rendered QA is allowed to check the browser. It is not allowed to assume markdown intent became user-visible proof. Publisher is allowed to queue. It is not allowed to waive failed gates.

This is the line I would steal from the source:

> A self-improving agent is only as strong as the thing that can say no to it.

Without that no, "self-improving" mostly means "faster at becoming confident."

## Source Thread

The video compares Karpathy-style auto research with AutoAgent.

In the auto research pattern, the agent edits training code, trains briefly, evaluates the result, keeps or discards the change, then repeats. AutoAgent moves the target from model-training code to the agent harness itself: prompts, tools, orchestration, and domain-specific routines.

The source names a meta-agent/task-agent setup. The task agent does the work. The meta-agent changes the harness and uses benchmark feedback to decide whether those changes survive.

That is the bridge into company work. Most teams do not have one workflow. They have support triage, content production, QA, reporting, sales research, data cleanup, incident review, and dozens of small processes that each need a different harness.

The mistake is to hear that and immediately build more agents.

The better move is to ask what each loop will be judged by.

That is the point: the loop is not the product. The refusal rule is the product.

## Visual Evidence

Private source-draft visual artifact:

![Self-improving agents draft visual](/images/posts/self-improving-agents-need-evals.png)

```txt
visual_artifact=F:\Aisaak\CompanyArtifacts\vibecode-draft-review-artifacts\self-improving-agents-need-evals-source-map.png
visual_summary=F:\Aisaak\CompanyArtifacts\vibecode-draft-review-artifacts\self-improving-agents-need-evals-source-map-summary.json
image_state=private_evidence_plan_only_unique_public_image_required_before_promotion
```

The visual job is not to decorate the article. It has to show the judge outside the loop: proposal, sandbox, score, trace review, and keep/revert. If the future public image does not make that relationship visible in the first screen, the image contract should fail.

## The Pattern Worth Stealing

Use this before adding another autonomous loop:

```txt
claim: this agent can improve its own harness
judge: what external test decides keep/revert?
blind_spot: what important failure is invisible to that test?
trace: what reasoning, artifact, or log can a reviewer inspect?
revert_rule: what exact result forces rollback?
human_stop: where can a person block publication, deployment, or spend?
```

For Vibecode, the same map becomes:

```txt
claim: this draft is getting better
judge: reference critic + rendered QA + human promotion review
blind_spot: smooth prose with weak source pressure
trace: source packet, evidence plan, critique, queue artifact, hash
revert_rule: any reject row keeps the draft private
human_stop: publisher cannot publish without approval
```

That is why the judge has to sit outside the loop. The writer cannot be the judge of writing. The agent that creates the artifact cannot be the final authority on whether the artifact proves anything.

Here is the before/after revision trace this draft itself had to pass:

```txt
before: a generated scaffold said the draft should start with a visible failure someday
after: the current opening starts with a weak self-improving-agent paragraph and rejects it
before: the source was a topic summary
after: the source became an edit/run/score/trace/keep-revert mechanism
before: the queue was implied
after: the queue item is a blocked artifact with required proof
```

The rule is simple: if the improvement loop cannot show the thing it rejected, it has not earned the word improvement.

## The Table To Use Before You Prompt Again

| If your loop optimizes this | The judge must also see this | Reject when |
| --- | --- | --- |
| Benchmark score | The real user failure the benchmark might miss | Score improved but trust, clarity, or evidence got worse |
| Task completion | Trace of how the task was completed | The output passes but the path is not inspectable |
| Draft quality | Source pressure, proof object, and reader transfer | The article sounds better but says nothing sharper |
| Visual polish | Whether the image proves the claim | The image decorates instead of explains |
| Publish readiness | Human approval on the exact final hash | The system wants to publish because all automated gates are green |

This is the uncomfortable part: a useful agent loop needs an enemy. Not a hostile person, but a constraint that refuses the output when it gets too good at the wrong game.

If your self-improving system has no enemy, the benchmark becomes the boss.

## Publisher Queue Item

```txt
publisher_queue_item:
  title: "Self-Improving Agents Need a Judge Outside the Loop"
  source_url: "https://www.youtube.com/watch?v=RoaPvj9Ovug"
  reader_decision: "Should this private draft stay internal, be revised, or move to human promotion review after a real critique?"
  required_proof:
    - source workflow packet
    - processed function extract
    - evidence plan
    - private source draft visual artifact
    - reference critic report
    - publisher queue artifact
    - human approval packet
  image_state: "private_evidence_plan_only_unique_public_image_required_before_promotion"
  publish_state: "blocked"
  approval_required: true
```

## Approval Candidate Verdict

Not ready.

This draft has a real source packet, a clear operating claim, and a reusable reader table. It is still not an approval candidate because it needs reference critique, rendered/private artifact proof, a unique public image contract, and a human approval decision tied to the final markdown hash.

## Editorial Critique Result

Reference critic verdict: keep private.

What works:

- The opening rejects the generic self-improving-agent paragraph instead of summarizing the topic.
- The article names the actual mechanism: edit harness, run tasks, score benchmark, inspect trace, keep/revert.
- The reader gets a reusable accept/reject table.
- The publisher queue item blocks publication instead of treating artifact generation as approval.

What still blocks promotion:

- The piece needs a human review row on whether the "judge outside the loop" argument is memorable enough for a cold technical reader.
- The visual is private proof only; a unique public image contract still has to be created.
- The article has not been rendered as a public candidate route.
- The final markdown hash has not been accepted by a human reviewer.

Required next action: send this exact private draft, rendered review artifact, source-map artifact, and publisher queue artifact to human promotion review. Any reject keeps the draft private.

## Boundary

This article is not claiming that AutoAgent is production-ready for all workflows. It is not claiming benchmarks are bad. It is not claiming human review can be removed.

It is making one narrower claim: any self-improving agent loop needs an external judge that can see the failure the loop is likely to optimize around.

## Draft Risk

The biggest risk is that this becomes a clever commentary post instead of a useful operating artifact.

Before promotion, the next reviewer should ask whether the table is strong enough to use on a real agent project tomorrow. If not, keep it private and revise the reader-transfer section before any publication discussion.
