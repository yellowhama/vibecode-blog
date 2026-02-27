# /os Deep-Dive Page Wireframe v3

> Created: 2026-02-22
> Last modified: 2026-02-22 (v3 — Dry facts + MUSU voice. No hype, no corporate.)
> Purpose: musu.pro/os Technical Deep-Dive page redesign spec
> Status: Wireframe confirmed, awaiting implementation
> Identity: **"On-premise Protected AI Orchestration System"**

---

## Voice & Tone

- **Channel position**: Architecture (🔥🔥) — between landing drama and pure docs.
- **"I did" founder voice** stays. Even in a deep-dive, MUSU sounds like a person, not a whitepaper.
- **Honest about limits.** Every block states what doesn't work.
- **No hype**: "world's first", "military-grade", "perfect", "revolutionary" — banned.
- **No corporate**: "optimization pipeline", "physical separation of X and Y" — also banned.
- **The target**: engineers and CISOs who close the tab the moment they smell BS.
- **The model**: "AI drifts. This doesn't." / "You don't need to read this. But if you want proof, it's all here."

---

## 7-Block Structure

### Block 0: Hero

- **Top label**: "On-premise Protected AI Orchestration System"
- **H1**: "Borrow the intelligence. Keep the control local."
- **Sub**: "MUSU doesn't generate code. Your LLM does that. MUSU validates it, simulates it, and only lets the safe parts through. Everything runs on your machine."
- **Visual**: Terminal typing effect → Local ↔ MUSU ↔ Cloud LLM diagram
- **CTAs**: Coming Soon / Enterprise Inquiry

### Block 1: Architecture

- **Title**: "The AI thinks. A different layer acts. They never touch."
- **Body**: "LLMs are non-deterministic. They guess. Sometimes brilliantly, sometimes dangerously. So I split the system in two. The LLM proposes. A separate layer — sandboxed, local, deterministic — decides what actually happens to your files."
- **Diagram**:
  - Brain: External LLM (Gemini, Claude) → text generation, reasoning
  - Body: MUSU P15 Engine + Native model (2B) → validation, sandboxing, state control
- **Limitation**: "The Brain is only as good as the LLM you connect. MUSU doesn't make your AI smarter. It makes your AI safe to run."

### Block 2: P15 Engine

- **Title**: "Your AI was expensive and reckless. I fixed both."
- **Card 1 — Holodeck Virtual Shell**:
  - "Your AI was reading 100MB logs through the API. That's $400/month in tokens for a grep job."
  - "MUSU routes it through a background virtual shell. The AI parses data locally. Up to 95% fewer API tokens."
- **Card 2 — Time Stone Simulation**:
  - "Before anything touches your actual files, MUSU runs it in an isolated environment. Multiple times. Only results that pass the exit gate — error rate, goal completion — get committed to real state."
  - "Mistakes don't ship."
- **Card 3 — Block Chain Chunking**:
  - "Most tools chop code into 500-character blocks. Blind cuts through functions, classes, logic."
  - "MUSU splits at meaning boundaries. Parent-child chain links preserve context across chunks."

### Block 3: Air-Gapped & BYOM

- **Title**: "No internet? No problem. Bring your own brain."
- **Body**: "If your org can't trust external APIs, or you're behind an air gap, MUSU still runs. Two options."

- **Option A — Built-in CPU Model (BitNet 1.58-bit)**:
  - "Ships with a 2B-parameter model that runs on a regular CPU. No GPU. ~1.2GB memory."
  - "Persistent HTTP server — 120x faster than spawning CLI subprocesses (131s → 1.1s)."
  - "This model handles system auditing, log parsing, sandbox decisions. It's the warden, not the architect."

- **Option B — Bring Your Own Model**:
  - "Already running Llama, Qwen, or something else on your GPU cluster? Point MUSU to the endpoint. That's it."
  - "Your model becomes the Brain. MUSU handles the rest — sandboxing, validation, state control. Zero cloud dependency."

- **Limitation**: "The built-in model (Option A) is not for code generation or complex reasoning. It's a 2B checkpoint optimized for security decisions. If you need a full Brain without cloud access, use Option B with your own hardware."

### Block 4: Security

- **Title**: "If it can't prove it's allowed, it doesn't run."
- **Body**: "Fail-Closed. Not Fail-Open. The difference matters."
- **Features**:
  - Deny-by-default: missing permissions, missing keys, unsigned P2P requests → blocked. No fallback.
  - `sh -c` execution path removed entirely. Commands go through a whitelist. Nothing else.
  - Mobile Warden: when the AI requests elevated access, your phone buzzes. Tap approve or reject. That's it.
- **Data collected**: "Your billing email. Nothing else."
- **Badges**: HMAC-SHA256 · Fail-Closed · DLP Built-in
- **Limitation**: "MUSU doesn't fix hallucinations. If the AI generates wrong code, MUSU won't catch the logic error. It catches the dangerous execution — rm -rf, unauthorized access, data exfiltration. The thinking is the LLM's job. The guardrails are ours."

### Block 5: Hardware

- **Title**: "Runs on a Raspberry Pi. Scales to a GPU rack."
- **Content**:
  - "Raspberry Pi 4 can run MUSU 24/7 in Caretaker mode — monitoring and controlling your agents while your main machine sleeps."
  - "HiveLink connects your devices over P2P encrypted QUIC. No relay server. Device to device."
  - "Your data never leaves your machines. Not even to us."
- **Limitation**: "Caretaker mode is for monitoring and control. Don't expect to run local LLM inference on a Pi. That's what your main machine — or Option B — is for."

### Block 6: Setup

- **Title**: "Your existing config carries over."
- **Body**: "`.cursorrules`, MCP servers, tool configurations — MUSU reads them natively. No re-setup. No migration guide. It just picks up where your current tools left off."
- **CTA**: Coming Soon — Windows / macOS / Linux
- **Ghost link**: "Back to the overview" → /

---

## Logical Flow

```
"Here's what this is"        (Hero — identity)
  → "Here's how it's built"  (Architecture — brain/body split)
    → "Here's what it saves"  (P15 — cost + safety)
      → "Works offline too"   (Air-Gap — no cloud needed)
        → "Nothing gets past" (Security — fail-closed)
          → "Runs anywhere"   (Hardware — Pi to GPU)
            → "Just install"  (Setup — carry over config)
```

---

## v1 → v2 → v3 Changelog

| Item | v1 (hype) | v2 (corporate) | v3 (MUSU voice) |
|------|-----------|----------------|-----------------|
| Hero H1 | "AI의 지능은 무한하게, 통제는 냉혹하게" | "Borrow the intelligence..." | same as v2 (this one works) |
| Architecture | "뇌와 손발의 분리" | "Physical separation of..." | "The AI thinks. A different layer acts." |
| P15 title | "토큰 낭비와 런타임 에러 박멸" | "Cost and stability optimization pipeline" | "Your AI was expensive and reckless. I fixed both." |
| Security title | "군사급 샌드박스" | "Fail-Closed security model" | "If it can't prove it's allowed, it doesn't run." |
| Limitations | none | added per block | kept, more conversational |
| Air-Gap block | none | added (corporate) | rewritten (MUSU voice) |
| Founder voice | absent | absent | present |

---

## Related Documents

- [landing-v7-integration.md](landing-v7-integration.md) — Unified landing v7.0 spec
- [user-scenario-copy.md](user-scenario-copy.md) — Scenarios + hero & sidekick
- [security-whitepaper.md](security-whitepaper.md) — Security whitepaper
- [architecture-marketing-points.md](architecture-marketing-points.md) — Architecture marketing
- [p15-prime-system.md](p15-prime-system.md) — P15 architecture status
