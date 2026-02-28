# 012 Everybody Has a Plan Until They Get Punched — Spec Kit Field Report

# Everybody Has a Plan Until They Get Punched — Spec Kit Field Report

## TL;DR

- **Plans are just plans** — Build timeouts, code conflicts, performance drops. Reality punches first.
- **AI three-way collab** — Claude Code (executes), GPT (analyzes), Cursor (cleans up). Solve, record, evolve.
- **The real lesson** — No plan is perfect. But document, record, find patterns, and AI coding gets faster and more stable.

## The Perfect Plan: Spec Kit

In post 011, I laid out the whole plan with Spec Kit. 20 FRs (Functional Requirements), four-phase process, implementation roadmap for each phase. Clean stuff.

Decided to build the tactics system. Start at T1.1, go in order. Rust backend, Godot integration, UI on top.

"Just type /implement and we're rolling."

Mike Tyson said it best. "Everybody has a plan until they get punched in the mouth."

## First Punch: Build Won't Compile

Spec Kit. `/implement T1.1`. Enter.

Here's how it works. Spec Kit breaks down the work. T1.1, T1.2, T1.3... each one is a single task. T1.1 was "Build the tactics engine in Rust."

Claude Code started cranking out files. Rust code flowing. 500 lines, 1000 lines... Tactics calculation, formation management.

Done building. Time to compile. That's where you turn the raw code into something that actually runs. Like putting dough in the oven to make bread.

One minute... Fine. Rust builds take a while.

Two minutes... Why is this taking so long?

`Build timeout: Process exceeded 2 minutes`

Timeout. The oven wouldn't light.

> **What actually went wrong:**
>
> ```
> cargo build --release
> Compiling godot-codegen v0.1.0 (git+...)
> Building [=>        ] 13/88 crates
> ```
>
> The godot dependency was pulling from git master. Recompiling everything every time. Only 13 of 88 crates were cached. The rest built from scratch.

## The AI Triple Team

I have a pattern for situations like this.

First, had Claude Code run diagnostics.

"Figure out what's going on. List the problems."

Claude Code dug through the build logs. Something was recompiling the same stuff over and over.

Took that info to GPT.

"How do I fix this?"

GPT gave the prescription. Pin the version. Use build cache.

> **The fix:**
>
> ```toml
> # Cargo.toml change
> - godot = { git = "...", branch = "master" }
> + godot = "0.3.5"
> ```
>
> - Installed sccache for build caching
> - Switched to rust-lld linker for faster linking
> - Result: 2-minute timeout → 28 seconds. Done.

Back to Claude Code. Ran it. 28 seconds. Success.

## Second Punch: Oh, This Already Exists?

Moved to T1.2. Building a file to manage the tactics system.

Claude Code stopped mid-work.

"Uh... there's already tactics code here?"

Checked. It was real. A file called CoachSystem already had tactics code in it.

Imagine this. You're digging a foundation for a new house. And there's already a basement down there. "Wait, someone already poured the foundation?"

Spec Kit didn't know. Of course it didn't. I never said "by the way, there's already some tactics code here."

> **Existing code found:**
>
> ```
> # scripts/core/CoachSystem.gd
> current_tactics = "4-4-2"
> available_tactics = ["4-4-2", "4-3-3", "3-5-2"]
> func change_tactics(new_tactics: String) -> void:
>     # Already implemented
> ```
>
> Problem: Spec Kit didn't know this file existed.
> Solution: Extend the existing system instead of replacing it.

## AI Teamwork to the Rescue

Couldn't solve this alone. Called in all three AIs.

First, sent Claude Code on recon.

"Check everything in the existing files."

Claude Code opened and read them. "Formations 4-4-2, 4-3-3, 3-5-2 already exist. Tactics-switching function is already there."

Took that info to GPT.

"How do I connect the existing code with the new stuff?"

GPT drew up the plan. "Don't throw away what's there. Extend it. The old code handles 'coaching knowledge.' The new code handles 'tactical execution.' Split the roles."

> **Integration architecture:**
>
> ```
> CoachSystem (existing)     TacticalManager (new)
>     |                            |
> Tactics knowledge          Actual execution
> Coach-manager relationship Rust backend integration
> Tactics learning           Real-time effectiveness calc
>     |_____Signal_____|
>          Connected
> ```

Claude Code wired the two systems together. Old system and new system, talking to each other.

## Third Punch: It's Stuttering

Built the formation screen. Eleven players on a football pitch diagram.

Ran it. Choppy. Target was 60 frames per second. Getting 45.

You know how games feel sluggish when frames drop? Same thing.

Checked the Spec Kit plan. "Performance optimization: Phase 5." We were on Phase 1...

> **Performance bottleneck:**
>
> ```
> # FormationDisplay.gd - the problem
> func _draw():
>     draw_field()      # Redraws entire field every frame
>     draw_all_players() # Redraws all 11 players every frame
>     draw_all_lines()   # Redraws every line every frame
> ```
>
> Cause: Full re-render 60 times per second, even with zero changes.
> Fix: Dirty flag pattern + caching.

## The Fix Combo

**Step 1: Diagnosis**

Asked Claude Code: "Why is it slow?"

"It's redrawing the entire screen every frame. 60 times a second. The whole thing."

**Step 2: Prescription**

Explained the situation to GPT.

"Only redraw what changed. No need to repaint everything every time."

**Step 3: Execution**

Claude Code rewrote the code. Only redraws the parts that actually changed.

**Step 4: Cleanup**

Cursor tidied up the whole codebase.

> **Optimized code:**
>
> ```
> var needs_redraw = false
>
> func _draw():
>     if not needs_redraw:
>         return
>     # Only draw what changed
>     needs_redraw = false
> ```
>
> Result: 45fps → 60fps.

## Key Realization: Write It Down

Next day. Same build problem. Again.

"Wait, I fixed this yesterday... How did I do it?"

Couldn't remember. Claude Code didn't know either. New conversation, blank slate.

That's when I started recording every problem and its fix.

"Claude Code, create a file called PROBLEMS.md. Every time a problem comes up, log it here."

> **PROBLEMS.md example:**
>
> ```markdown
> ## Build Timeout Issue
> - Symptom: Build takes 2+ minutes, never finishes
> - Cause: godot recompiles from git every time
> - Fix:
>   1. Pin godot to version 0.3.5
>   2. Install sccache (or use build_without_sccache.sh)
>   3. Enable rust-lld linker
> - Result: 2min+ → 28 seconds
> ```

A week later, same problem popped up. Fixed it in 5 seconds.

## The AI Collaboration Pattern

After doing this a few times, a pattern emerged.

```
Problem → Claude Code (diagnose) → GPT (analyze) → Claude Code (execute) → Cursor (clean up)
```

Each one had its strength:

- **Claude Code**: The hands. Handles files, runs code.
- **GPT**: The brain. Analyzes problems, proposes solutions.
- **Cursor**: The janitor. Cleans up and refactors.

> **Actual work log:**
>
> ```
> [09:23] Claude Code: "Attempting to create TacticsManager.gd"
> [09:24] Claude Code: "Conflict found with CoachSystem.gd"
> [09:25] GPT consult: "Integration plan proposed"
> [09:27] Claude Code: "Integration complete"
> [09:30] Cursor: "156 duplicate lines removed"
> ```

## Result: Different From the Plan, But Better

According to Spec Kit, I was supposed to implement all 20 FRs in order.

What actually happened:

- Only 8 FRs implemented
- But integrated with existing systems
- Performance optimization done early
- Build system cleaned up
- Documentation framework built

> **Implementation status:**
>
> ```markdown
> ## T1.2 IMPLEMENTATION COMPLETED
> - FR-001: Only manager can select formation
> - FR-002: Players cannot refuse tactical orders
> - FR-017: Visual formation display
> - FR-018: Instant feedback on formation selection
>
> Phase complete: 8/20 FR (40%)
> But stability: 200% better
> ```

Different from the plan. But a more solid foundation.

## Vibe Coding Field Tips

When things break:

1. **Don't panic** — Every developer deals with this.
2. **Be specific with AI** — "This doesn't work" needs details.
3. **Use multiple AIs** — They're each good at different things.
4. **Record the fix** — You'll need it again.
5. **Plans change. That's fine.** — No plan survives contact with reality.

> **Problem-solving process:**
>
> ```
> 1. Claude Code: Situation report (1 min)
> 2. GPT: Solution analysis (2 min)
> 3. Claude Code: Execute (5 min)
> 4. Cursor: Code quality pass (3 min)
> 5. Claude Code: Update PROBLEMS.md (auto)
> 6. Spec Kit: Update docs (/constitution refresh)
> ```

## Epilogue: It's OK When Plans Fall Apart

Spec Kit is a map. But when you actually walk the road, there might be construction. Dead ends.

That's when the AIs find detours. And if you write those detours down, next time you'll get there faster.

**Everybody has a plan until they get punched in the mouth.**

Get punched. Fix it. Write it down.

The AI handles that part too.
