---
title: "The Work Disk Contract: Managing Artifacts in AI Coding Agents"
pubDatetime: 2026-05-17T02:00:00Z
description: "AI coding agents generate artifacts like builds, tests, and logs. Discover why defining a strict 'Work Disk Contract' is crucial to prevent operating system failures and lost evidence."
draft: false
featured: false
series: "AI Tool Note"
workflow: "packet"
ogImage: /images/thumbnails/thumbnail_agent_disk_1779565086528.png
lang: "en"
tags:
  - ai-agents
  - software-engineering
  - technical-contracts
  - vibecoding
  - devops

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

On 2026-05-21, I ran a PowerShell drive check, verified the LLM wiki archive gate, and opened the Chrome-rendered audit under `<rendered-audit-root>`. The disk problem we faced was not code. It was a lack of definition about **where the agent was allowed to leave proof.** 

Use this rule before accepting any agent run: **name the source, memory, rendered evidence, and temp roots first.**

AI coding agents do not only edit source files—and that is the hidden risk.

They build. They test. They create fixtures. They write indexes. They generate logs. They produce evidence bundles, compare outputs, and sometimes leave massive temp trees behind. If those artifacts drift to the wrong drive, the agent can pass a test while making the next handoff harder to trust.

On this workstation, that distinction is not theoretical. The active source repo is strictly on `<repo-root>`, the LLM wiki archive is on `<wiki-root>`, and the rendered audit writes to `<rendered-audit-root>`.

If any receipt lands outside those roots, rerun the workflow under the contract instead of cleaning it up by hand.

The current receipt is boring on purpose: commit `551c7f7`, 10 posts, 41 pages, 24 viewports, 10 Pagefind pages, 2123 words, 350 wiki files indexed, 382 files archived, and zero rendered-page failures. Those numbers are not decoration. They are the proof that the artifact trail lives exactly where the next agent will look.

The repeated failure was always the old one: work kept drifting toward `C:` because the operating system made that the easy default.

The important correction was sharper than simply "move the C files to F later." That only cleans up after the mistake. The real correction is to make the agent start from the `F:` contract in the first place: repo on F, wiki on F, rendered evidence on F, test temp on F. No after-the-fact rescue missions.

If builds, screenshots, search indexes, and evidence bundles fall into the operating system temp folder, the agent is changing code while quietly pressuring the workstation. The problem is not "the C drive is small." The problem is that nobody told the agent which disk role each artifact belongs to.

A **work disk contract** answers that before the next long run starts.

![AI work disk contract diagram](/images/posts/ai-agent-work-disk-contract.png)

## Approval Proof Chain

**Bad output:**

```txt
The agent writes screenshots, test fixtures, wiki notes, and rendered summaries wherever the SDK defaults.
The operator sees tests finish.
Someone copies the C-drive leftovers to F by hand.
The next session accepts the claim without knowing whether the proof was born under the contract or rescued later.
```

**Gate added:**

```powershell
Get-PSDrive -Name C,F
Test-Path <wiki-root>
Test-Path <rendered-audit-root>\summary.json
```

Then run the system checks that prove the archive and public proof still line up:

```txt
python .\reindex_wiki.py
.\archive_completed_artifacts.ps1
npm run verify:rendered-pages
npm run verify:publication-approvals
```

**After:**

```txt
accepted review result exists
zero-item revision plan exists
publication review record matches the current content digest
archive_files_copied=382
source_markdown_count=350
archive_markdown_count=350
Indexed 350 markdown files into <wiki-root>\wiki_fts.db
rendered desktop/mobile receipts still pass
```

Source: repo path, wiki root, rendered-audit root, test-temp root, archive sync output, and publication review record.

**Accept only when:** the receipt was produced under the named roots and the archive/index/rendered checks pass after the run.

**Reject when:** the evidence was copied into place after the run, the temp root is unknown, or the next agent would have to search `C:`, Downloads, chat, or an SDK temp folder to find it.

*Boundary:* A disk contract proves artifact jurisdiction; it does not prove the code, article, or runtime claim is correct.

## Bad Default

Node.js exposes `os.tmpdir()`, which is convenient and portable. That convenience is exactly why it becomes risky in long agent sessions. Operators stop asking where repeated test artifacts are going.

The first check is not a model check. It is a **disk-role check**:

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

The bad version looks harmless in the moment:

```txt
"Build passed."
"Screenshots generated."
"Archive refreshed."
```

None of those statements are enough. The better receipt names *where* the work landed: `dist`, `<rendered-audit-root>\summary.json`, `<wiki-root>\wiki_fts.db`, and `<test-temp-root>\vibecode-node`.

That is the whole point. A disk contract turns "it worked" into "it worked, and the evidence is in the place the next agent will search."

## Current Machine Receipt

The active workstation makes the disk-role issue visible:

```txt
Get-PSDrive -Name C,F

Name  UsedGB  FreeGB Root
C     445.87  484.79 C:\
F    1126.82 6325.20 F:\
```

The point is not that `F:` is always the right disk. The point is that this machine has a clear archive/work volume, and the agent was still being corrected for using `C:` in places where completed company artifacts belonged on `F:`.

The current contract names the durable locations:

```txt
product repo: <repo-root>
LLM wiki: <wiki-root>
rendered evidence: <rendered-audit-root>
test temp: <test-temp-root>
```

The archive receipt for this article revision was:

```txt
archive_files_copied=382
source_markdown_count=350
archive_markdown_count=350
Indexed 350 markdown files into <wiki-root>\wiki_fts.db
```

That is why the path contract matters. Without it, an agent can pass a test while leaving the evidence trail in the wrong place.

The receipt is only useful because it is in the same durable operating archive the next session will query.

The bad version of the fix would have been:

```txt
write evidence to C
notice the mistake
copy some files to F
hope the next run does not do it again
```

That is not a contract. That is a cleanup chore with better naming.

The cost arrives in the next session. The wiki says the archive is current, the rendered audit points at `F:`, but the screenshot or temp fixture that justified the claim was born on `C:` and copied later by hand. Now the reviewer is not checking the work. They are checking whether the cleanup story was true.

The better version is:

```txt
start in <repo-root>
write wiki memory to <wiki-root>
write rendered evidence to <rendered-audit-root>
write self-test fixtures to <test-temp-root>
fail checks when the archive and index drift
```

The difference looks small until the third autonomous loop. Then it is the difference between "resume from the archive" and "search the laptop."

The same rule applies to rendered evidence. The public image rule is not only a design rule. It is a filesystem rule:

```txt
body image: /images/posts/ai-agent-work-disk-contract.png
ogImage: /images/thumbnails/thumbnail_agent_disk_1779565086528.png
rendered summary: <rendered-audit-root>\summary.json
desktop first-screen image check: 10/10
mobile first-screen image check: 10/10
surface expected images: 2/2
surface evidence cards: 4/4
```

If screenshots are evidence, screenshot paths are part of the evidence. A missing image and a missing archive receipt are the same class of problem: the reader is asked to trust something the system did not preserve.

## Work Disk Contract

Vibecode uses the contract this way:

| Role | Bad default | Contract |
| --- | --- | --- |
| source repo | write fixtures beside source | keep source under the repo only |
| operating memory | scatter notes in chat | store handoff/wiki/index on F |
| completed archive | leave receipts in temp | copy durable evidence to archive |
| self-test temp | use OS temp silently | use project temp root first |
| screenshots | trust generated HTML | write rendered evidence to audit dir |

The implementation is deliberately boring. Scripts read repo-specific temp variables first, then shared temp variables, then a large local archive drive, and only then fall back to the OS default.

```txt
VIBECODE_TEST_TEMP_DIR
PROJECT_TEST_TEMP_DIR
TEST_TEMP_DIR
<test-temp-root>
os.tmpdir()
```

The point is not that these exact names are universal. They are not. The point is that every repo has to decide where agent-created files are allowed to land, and scripts have to honor that decision.

This pattern is fixed in the Vibecode repo through a [real commit](https://github.com/yellowhama/vibecode-blog/commit/1e62c79c62d0b3b0b1cf2c13d334b0bef80b341d), not just a note in a prompt.

That distinction matters. A prompt reminder can be missed. A script-level path contract can be tested.

## Copyable Contract

For a repo with long-running agents, write the contract down before the first autonomous loop:

```powershell
$env:VIBECODE_TEST_TEMP_DIR = "<test-temp-root>\vibecode-node"
$env:PROJECT_TEST_TEMP_DIR = "<test-temp-root>\vibecode-town"
$env:LLM_WIKI_ROOT = "<wiki-root>"
```

Then add a drift check:

```powershell
Get-PSDrive -Name C,F
Test-Path $env:LLM_WIKI_ROOT
Test-Path $env:VIBECODE_TEST_TEMP_DIR
```

And make the verifier say what happened:

```txt
completion_audit_sync_archive_files_copied=382
completion_audit_sync_source_markdown_count=350
completion_audit_sync_archive_markdown_count=350
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

Use this acceptance test before trusting a new agent setup:

| Claim | Accept when | Reject when |
| --- | --- | --- |
| "Temp files are safe." | Repo temp var wins before `os.tmpdir()`. | OS temp is silent default. |
| "The archive is current." | Counts match and checker passes. | The agent only says it copied. |
| "Screenshots prove the page." | `summary.json` and screenshot dir are named. | Only an image path is linked. |
| "The handoff is durable." | Wiki/index path is searchable. | Artifact lives in chat or Downloads. |

## The Review Question

Before trusting an agent-produced receipt, ask:

```txt
If a new agent starts tomorrow, where will it search for this artifact?
```

Forward this to the operator who says, "just move the C files to F after the run." The decision is narrow: can they accept the receipt as operating memory, or must the agent rerun with repo, wiki, rendered evidence, and test temp roots already pointed at the durable work disk?

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
