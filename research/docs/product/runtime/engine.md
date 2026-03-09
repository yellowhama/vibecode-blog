# MUSU Engine — Executor

> Raw compute, orchestrated.

## Overview

MUSU Engine is the inference and execution layer. It manages a pool of BitNet model instances with GPU-aware load balancing, exposes an OpenAI-compatible API, and supports dual transport (QUIC primary, HTTP fallback).

## Implementation

- **Crate**: `musu-engine` (Rust)
- **LOC**: ~24,500
- **Tests**: 444 passing
- **Source**: `Musu-new/src/crates/musu-engine/`

## BitNet EnginePool

Manages N instances of BitNet b1.58-2B-4T quantized model.

### Auto-Scaling

```
max_slots = min(
  floor(available_RAM × 0.5 / model_size),
  CPU_cores
)
```

### Backend Selection (priority order)

1. CUDA (NVIDIA GPU)
2. Metal (Apple GPU)
3. CPU fallback

### Load Balancing

Routing score per instance: `active_requests × 100 + avg_latency_ms`

Lowest score wins. New requests go to least-loaded instance.

### API

Each instance exposes OpenAI-compatible endpoint:

```
POST /v1/chat/completions
```

Ports: `:8080`, `:8081`, `:8082`, ... (one per instance)

## Dual Transport

- **Primary**: QUIC (low-latency, multiplexed)
- **Fallback**: HTTP (automatic degradation if QUIC fails)

Both transports serve the same API surface.

## Gateway Integration

Engine registers with Prime as `inference` capability provider:

```
POST /register
{
  "node_id": "engine-01",
  "capabilities": ["inference"],
  "transport": "quic",
  "address": "engine-01:9791"
}
```

Prime dispatches inference jobs; Engine processes via EnginePool.

## Swarm Management

- Worker coordination across multiple Engine instances
- Job queue with priority (Gold > Silver > Bronze weight grades)
- Result aggregation and forwarding back to Prime

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `VIBE_BITNET` | — | Enable BitNet (`1` = enabled) |
| `MUSU_ENGINE_POOL_SIZE` | auto | Override auto-scaling |
| `MUSU_ENGINE_GPU` | auto | Force GPU backend |

## Ports

- `:8080+` — OpenAI-compatible API (N instances)
- Gateway connection to Prime at `:8791`/`:9791`

## Status

**Production** — 444 tests passing. EnginePool verified with GPU/CPU detection.
