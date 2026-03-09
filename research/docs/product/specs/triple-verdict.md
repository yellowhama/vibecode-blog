# Triple Verdict System

## Overview

Every AI action in MUSU gets a signal before execution. The Triple Verdict System ensures code quality by classifying every implementation into GO, FIX, or BLOCK.

## Verdicts

### GO — Proceed

- **Signal**: `GO`
- **Meaning**: Implementation passes intent verification
- **Action**: Proceed to `finalize_work`
- **Triggered by**: All gates pass, no drift detected

### FIX — Course-Correct

- **Signal**: `FIX`
- **Meaning**: Minor issues detected
- **Examples**: Style drift, incomplete implementation, missing tests
- **Action**: Re-implement and re-inspect (`retry_count++`)
- **Auto-correction**: Ralph Loop handles this automatically

### BLOCK — Re-Decide

- **Signal**: `BLOCK`
- **Meaning**: Major issues detected
- **Examples**: Intent mismatch, security violation, policy breach
- **Action**: Requires new decision cycle via `get_decision`
- **Escalation**: Human decision required

## Ralph Loop

Auto-correction engine in Cockpitd sidecar.

### Flow

```
inspect_code → Cockpitd /v1/run
  │
  ├→ GO  → done (SSE: done)
  │
  ├→ FIX → auto-fix attempt (SSE: healing)
  │         → re-inspect (SSE: re_gate)
  │         → attempt 2...
  │         → attempt 3...
  │         → still FIX? → BLOCK (SSE: blocked)
  │
  └→ BLOCK → blocked (SSE: blocked)
```

### Limits

| Parameter | Value |
|-----------|-------|
| Max retry attempts | 3 |
| Timeout | 300 seconds |
| Retry backoff | Immediate (no delay) |

### SSE Event Stream

```
event: gate_check
data: {"phase": "initial", "timestamp": "..."}

event: healing
data: {"attempt": 1, "issue": "missing test coverage"}

event: re_gate
data: {"attempt": 1, "result": "FIX"}

event: done
data: {"verdict": "GO", "attempts": 2}
```

## Gate Types

| Gate | What It Checks |
|------|----------------|
| Schema | Output matches expected JSON schema |
| Path | Files modified match allowed paths |
| Runtime | Execution within resource limits |
| Semgrep | Static analysis patterns pass |
| Intent | Implementation matches recorded decision |

## Evidence

Every verdict includes evidence:

- Attached to run folder
- SHA-256 prefixed (`sha256:abc123...`)
- Logged to decision log (JSONL)
- Immutable audit trail

## MCP Tools

| Tool | Description |
|------|-------------|
| `vibe_pm.inspect_code` | Trigger verdict generation |
| `vibe_pm.clinic_verify` | Verify clinic result |
| `vibe_pm.gate` | Manual gate validation |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `VIBE_COCKPIT` | `0` | Enable Cockpitd (`1`) |
| `RALPH_TIMEOUT` | `300` | Timeout in seconds |

## Fallback

If Cockpitd is unreachable:
- Vibe PM runs local TypeScript inspection
- Reduced gate coverage (no Semgrep, no Ralph Loop)
- Verdict still generated (GO/FIX/BLOCK)
- Warning logged to decision log
