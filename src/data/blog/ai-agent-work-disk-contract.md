---
title: "The Work Disk Contract for AI Coding Agents"
pubDatetime: 2026-05-17T02:00:00Z
description: "AI agents build, test, index, and generate evidence. If their temp and archive paths are accidental, the machine becomes part of the failure mode."
draft: false
featured: false
series: "AI Tool Note"
workflow: "packet"
lang: "en"
tags: ["ai-tools", "engineering", "local-first", "technical-contracts"]
ogImage: "/images/posts/ai-agent-work-disk-contract.png"
references:
  - name: "Node.js os.tmpdir"
    url: "https://nodejs.org/api/os.html#ostmpdir"
    guru: "Node.js"
  - name: "PowerShell Get-PSDrive"
    url: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-psdrive"
    guru: "Microsoft Learn"
  - name: "Vibecode temp root commit"
    url: "https://github.com/yellowhama/vibecode-blog/commit/1e62c79c62d0b3b0b1cf2c13d334b0bef80b341d"
    guru: "GitHub"
---

# The Work Disk Contract for AI Coding Agents

On 2026-05-20, the disk problem was not code. AI coding agents do not only edit source files, and that is the hidden risk.

They build. They test. They create fixtures. They write indexes. They generate logs. They produce evidence bundles, compare outputs, and sometimes leave large temp trees behind.

On this workstation, that distinction is not theoretical. The active source repo is on `F:\Aisaak\Projects\vibecode-town`, the LLM wiki archive is on `F:\Aisaak\CompanyArtifacts\llm-wiki-completed`, and the rendered audit writes to `F:\Aisaak\CompanyArtifacts\vibecode-rendered-audit\latest`.

The repeated failure was still the old one: work kept drifting toward `C:` because the operating system made that the easy default.

If builds, screenshots, search indexes, and evidence bundles fall into the operating system temp folder, the agent is changing code while quietly pressuring the workstation. The problem is not "the C drive is small." The problem is that nobody told the agent which disk role each artifact belongs to.

A work disk contract answers that before the next long run starts.

![AI work disk contract diagram](/images/posts/ai-agent-work-disk-contract.png)

## Bad Default

Node.js exposes `os.tmpdir()`, which is convenient and portable. That convenience is exactly why it becomes risky in long agent sessions. Operators stop asking where repeated test artifacts are going.

The first check is not a model check. It is a disk-role check:

```powershell
Get-PSDrive -Name C,F
```

The numbers matter less than the roles.

```txt
active source repo
active operating memory
durable completed artifact archive
self-test temp root
```

If those roles are not explicit, cleanup becomes a manual judgment call. That is where long-running agent work gets messy.

The failure pattern is easy to miss:

```txt
run tests
generate screenshots
write indexes
archive evidence
resume tomorrow
discover the active machine state is now part of the task
```

That is not an agent intelligence problem. It is an operations boundary problem.

The worse version is more subtle: the test passes, but the receipt lands somewhere the next agent will never search. That is how a team gets a green check and a broken handoff at the same time.

## Current Machine Receipt

The active workstation makes the disk-role issue visible:

```txt
Get-PSDrive -Name C,F

Name   Used (GB)   Free (GB)   Root
C         441.06      489.60   C:\
F        1114.30     6337.72   F:\
```

The point is not that F is always the right disk. The point is that this machine has a clear archive/work volume, and the agent was still being corrected for using C in places where completed company artifacts belonged on F.

The current contract names the durable locations:

```txt
product repo: F:\Aisaak\Projects\vibecode-town
LLM wiki: F:\Aisaak\CompanyArtifacts\llm-wiki-completed
rendered evidence: F:\Aisaak\CompanyArtifacts\vibecode-rendered-audit\latest
test temp: F:\Aisaak\CompanyArtifacts\test-temp
```

The archive receipt from the latest wiki sync was:

```txt
archive_files_copied=272
source_markdown_count=240
archive_markdown_count=240
Indexed 240 markdown files into F:\Aisaak\CompanyArtifacts\llm-wiki-completed\wiki_fts.db
```

That is why the path contract matters. Without it, an agent can pass a test while leaving the evidence trail in the wrong place.

The receipt is only useful because it is in the same durable operating archive the next session will query.

## Work Disk Contract

Vibecode uses the contract this way:

| Role | Bad default | Contract |
| --- | --- | --- |
| source repo | write fixtures beside source | keep source under the repo only |
| operating memory | scatter notes in chat | store handoff/wiki/index on F |
| completed archive | leave receipts in temp | copy durable evidence to archive |
| self-test temp | use OS temp silently | use project temp root first |
| screenshots | trust generated HTML | write rendered proof to audit dir |

The implementation is deliberately boring. Scripts read repo-specific temp variables first, then shared temp variables, then a large local archive drive, and only then fall back to the OS default.

```txt
VIBECODE_TEST_TEMP_DIR
PROJECT_TEST_TEMP_DIR
TEST_TEMP_DIR
F:\Aisaak\CompanyArtifacts\test-temp
os.tmpdir()
```

The point is not that these exact names are universal. They are not. The point is that every repo has to decide where agent-created files are allowed to land, and scripts have to honor that decision.

This pattern is fixed in the Vibecode repo through a [real commit](https://github.com/yellowhama/vibecode-blog/commit/1e62c79c62d0b3b0b1cf2c13d334b0bef80b341d), not just a note in a prompt.

That distinction matters. A prompt reminder can be missed. A script-level path contract can be tested.

## Copyable Contract

For a repo with long-running agents, write the contract down before the first autonomous loop:

```powershell
$env:VIBECODE_TEST_TEMP_DIR = "F:\Aisaak\CompanyArtifacts\test-temp\vibecode-node"
$env:PROJECT_TEST_TEMP_DIR = "F:\Aisaak\CompanyArtifacts\test-temp\vibecode-town"
$env:LLM_WIKI_ROOT = "F:\Aisaak\CompanyArtifacts\llm-wiki-completed"
```

Then add a drift check:

```powershell
Get-PSDrive -Name C,F
Test-Path $env:LLM_WIKI_ROOT
Test-Path $env:VIBECODE_TEST_TEMP_DIR
```

And make the verifier say what happened:

```txt
completion_audit_sync_archive_files_copied=272
completion_audit_sync_source_markdown_count=240
completion_audit_sync_archive_markdown_count=240
company_artifacts_archive_status=pass
```

This is the part most agent setups skip. They define a workflow, but not a filesystem jurisdiction. Then the first real loop writes code in one place, screenshots in another, and evidence in a third.

## Practical Checklist

Before handing a repo to an AI coding agent, define:

```txt
Where does build output go?
Where does repeated test output go?
Where does runtime evidence go?
Where does the searchable operating memory live?
What is durable and what is disposable?
Which checker fails when the paths drift?
```

Then add guards.

```txt
source and archive counts match
secret scans include the durable memory
stale handoff checks fail on old status pins
test temp roots stay outside the source repo
public evidence gates reject samples and templates
```

That last line matters. A sample result is useful documentation. It is not evidence.

The reader action is not to copy these path names. It is to name the roles in your own repo and make scripts resolve them in that order.

## The Review Question

Before trusting an agent-produced receipt, ask:

```txt
If a new agent starts tomorrow, where will it search for this artifact?
```

If the answer is "the chat," "Downloads," or "whatever temp folder the SDK picked," the receipt is not operational memory. It is debris.

If the answer is a named archive path, backed by a checker that compares source and archive counts, the receipt can become part of the system.

## Boundary

A work disk contract does not prove the work is correct. It does not make a runtime receipt real. It does not turn a sample artifact into evidence.

It only makes filesystem behavior explicit enough that other gates can trust where artifacts are supposed to live. Disk routing is infrastructure for evidence quality, not evidence quality itself.

## Why This Belongs in the Trust Engine

Agent speed cuts both ways. It accelerates useful work, and it accelerates accidental filesystem damage.

A work disk contract makes that speed survivable. The agent can still create files, run tests, and collect evidence, but the system knows where each class of artifact belongs.

The operating principle is simple: the agent is allowed to move fast only inside explicit boundaries.

No boundary, no trust.
