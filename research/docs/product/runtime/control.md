# MUSU Control — Gatekeeper

> Every action is judged.

## Overview

MUSU Control enforces quality and safety gates on every AI action. It runs the Triple Verdict System (GO/FIX/BLOCK) through the Cockpitd Rust sidecar, with the Ralph Loop providing automatic correction before escalating to humans.

## Implementation

### Cockpitd (Rust Sidecar)

- **Binary**: `cockpitd`
- **Port**: `:3001` (HTTP + SSE)
- **Source**: `Musu-new/release/mvp_core_clinic/cockpitd/`

### Musu Interceptor (Rust Crate)

- **Crate**: `musu-interceptor` (~2,400 LOC)
- **Binary**: `oppa-micro` (Pico Interceptor)
- **Tests**: 8+
- **Source**: `Musu-new/src/crates/musu-interceptor/`

## Triple Verdict System

Every AI action gets one of three signals:

| Verdict | Meaning | Action |
|---------|---------|--------|
| **GO** | Implementation passes intent verification | Proceed to finalize |
| **FIX** | Minor issues (drift, style, incomplete) | Re-implement + re-inspect |
| **BLOCK** | Major issues (intent mismatch, security, policy) | Requires new decision cycle |

## Ralph Loop (Auto-Correction)

When Cockpitd returns FIX, the Ralph Loop automatically attempts correction:

```
Vibe PM → POST /v1/run → Cockpitd
  → gate_check (SSE event)
  → FIX verdict?
    → healing (SSE event) — auto-fix attempt
    → re_gate (SSE event) — re-check
    → Max 3 attempts, 300s timeout
    → done / blocked / timeout (SSE event)
```

### SSE Events

| Event | Meaning |
|-------|---------|
| `gate_check` | Initial inspection started |
| `healing` | Auto-correction in progress |
| `re_gate` | Re-inspection after fix |
| `done` | Passed (GO) |
| `blocked` | Failed after retries (BLOCK) |
| `timeout` | Exceeded 300s limit |

### Fallback

If Cockpitd is unreachable, Vibe PM falls back to local TypeScript inspection (degraded but functional).

## Pico Interceptor (oppa-micro)

Sandboxed agent runtime with 6 execution profiles:

| Profile | Purpose |
|---------|---------|
| **Scout** | Code scan, change detection |
| **Build** | Remote build execution |
| **Test** | Remote test execution |
| **Lint** | Style/format checking |
| **Risk** | Security scanning |
| **Replay** | Bug reproduction |

### Weight Grades

- **Gold** — High priority, runs first
- **Silver** — Normal priority
- **Bronze** — Low priority, background

### Registration Flow

```
Pico → POST /register (capabilities + profile) → Prime
Prime → POST /dispatch (push) → Pico
  OR
Pico → POST /pull-job (pull) → Prime
Pico → sandboxed execution → evidence → POST /submit_result → Prime
```

## Observer FSM

State machine for intervention decisions:

```
IDLE → OBSERVE_ONLY → INTERVENE → DORMANT
```

- **IDLE**: No active monitoring
- **OBSERVE_ONLY**: Watching, not acting
- **INTERVENE**: Actively enforcing gates
- **DORMANT**: Temporarily suspended

Skill packs (7 total, including TDD_GUARD) hook into FSM transitions.

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `VIBE_COCKPIT` | `0` | Enable Cockpitd (`1` = enabled) |
| `VIBE_OBSERVER` | `1` | Enable Observer FSM |
| `RALPH_TIMEOUT` | `300` | Auto-correction timeout (seconds) |

## Status

- **Cockpitd**: Production (Ralph Loop verified)
- **Pico Interceptor**: Alpha (6 profiles defined, sandboxing WIP)
- **Observer FSM**: Production (7 skill packs active)
