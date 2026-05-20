# Source Workflow Quality Template

Use this before drafting any new public post. The source workflow packet is not a storage ritual. It is the pressure system that makes the draft worth reading.

Every packet-backed post needs these six files under the active LLM wiki:

```txt
companies/vibecode-town/plans/<slug>-reader-pressure.md
companies/vibecode-town/plans/<slug>-title-angle.md
companies/vibecode-town/plans/<slug>-evidence-bundle.md
companies/vibecode-town/plans/<slug>-brief.md
companies/vibecode-town/plans/<slug>-gate-0.md
companies/vibecode-town/plans/<slug>-draft-critique.md
```

`npm run verify:source-workflow-quality` checks that those files are not empty labels. It expects reader pressure, public references, internal evidence, rejection paths, and critique pressure before publication.

## Reader Pressure

Required sections:

```txt
Reader Problem
Pressure
Reader Question
Required Reader Decision
```

The reader question must be a real question. The decision must say what the reader should accept, reject, verify, or change.

## Title Angle

Required sections:

```txt
Title
Angle
Avoid
Must Include
```

The title angle should block generic AI-content drift. If the packet does not say what to avoid, the draft will invent a safer but flatter article.

## Evidence Bundle

Required sections:

```txt
Public References
Internal Evidence
Non-Claims
```

Minimum evidence:

```txt
one public source URL
one inspectable internal artifact: script, gate, commit, hash, approval, screenshot, rendered audit, log, packet, file, or path
one explicit non-claim or boundary
```

## Brief

Required sections:

```txt
Hook
Core Point
Structure
Proof
Tone
```

The hook must create pressure. The proof section must name the evidence the draft is allowed to use.

## Gate 0

Required sections:

```txt
Required Checks
Reject If
Verdict
```

Gate 0 must be able to stop a weak draft before it becomes a polished weak draft.

## Draft Critique

Required sections:

```txt
Current Risk
Revision Pressure
Quality Bar
```

The critique should name the most likely way the article will become boring or unsupported, then state the repair pressure.

## Operating Rule

Do not start drafting because a topic sounds useful. Start drafting after the packet proves:

```txt
source -> angle -> evidence -> reader decision -> reject rule -> critique pressure
```

If that chain is not present, repair the packet before writing the article.
