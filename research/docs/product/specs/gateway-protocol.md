# Gateway Protocol Specification

## Overview

The Gateway Protocol connects Vibe PM, Musu Engine, and HiveLink through capability-based job routing. Prime acts as the central router; workers register capabilities and receive jobs.

## Endpoints

### POST `/dispatch`

Submit a job for routing to a capable node.

```json
{
  "job_id": "uuid",
  "capability": "inference",
  "payload": { ... },
  "priority": "gold",
  "mode": "push"
}
```

**Response**: `202 Accepted` with job ID for polling.

### GET `/result/{id}`

Poll for job result.

**Response**:
- `200 OK` — Job complete, result in body
- `202 Accepted` — Job still running
- `404 Not Found` — Unknown job ID

### POST `/pull-job`

Worker pulls next available job matching its capabilities.

```json
{
  "node_id": "worker-01",
  "capabilities": ["inference", "scout"]
}
```

### POST `/register`

Worker registers capabilities with Prime.

```json
{
  "node_id": "engine-01",
  "capabilities": ["inference"],
  "transport": "quic",
  "address": "engine-01:9791",
  "metadata": {
    "gpu": "nvidia-rtx-4090",
    "vram_gb": 24
  }
}
```

### POST `/heartbeat`

Worker keep-alive.

```json
{
  "node_id": "engine-01",
  "load": 0.45,
  "active_jobs": 2
}
```

### GET `/capabilities`

List all registered capabilities and their providers.

## Capability Types

| Capability | Typical Provider | Description |
|------------|-----------------|-------------|
| `code_inspection` | Vibe PM | Code quality gate |
| `gate` | Cockpitd | GO/FIX/BLOCK verdict |
| `briefing` | Vibe PM | Project briefing |
| `inference` | Musu Engine | AI model inference |
| `scout` | Pico Interceptor | Code scanning |
| `sys_admin` | Pico Interceptor | System administration |
| `remote_compute` | HiveLink | Shell execution |
| `file_transfer` | HiveLink | File read/write |
| `terminal` | HiveLink | PTY session |

## Routing Modes

### Push Mode
Prime dispatches immediately to an online node with matching capability.
If no node available: returns error or queues (configurable).

### Pull Mode
Job stored in queue. Next worker with matching capability pulls it.
Useful for offline/batch workloads.

## Priority Grades

| Grade | Description |
|-------|-------------|
| **Gold** | Highest priority, runs first |
| **Silver** | Normal priority |
| **Bronze** | Low priority, background |

## Transport

- **Primary**: QUIC (`:9791`) — low-latency, multiplexed streams
- **Fallback**: HTTP (`:8791`) — automatic degradation

Both transports serve identical API surface.

## Authentication

- **Development**: No auth (default)
- **Production**: mTLS (`MUSU_ENV=production`)
- **Future**: JWT token-based (planned)
