# Vibecode Writing Process (v5.2 Multi-Pass Pipeline)

## 1. Core Philosophy: The Scars First
We do not write "how-to" tutorials. We write incident reports. Every post must originate from an authentic struggle and connect to a higher-level Guru insight.

## 2. The v5.2 Multi-Pass Pipeline

| Stage | Name | Action | Pass Condition |
| :--- | :--- | :--- | :--- |
| **-3** | **Competitor Mining** | Analyze top 5 competitor posts for tropes and **Gaps**. | Identify what competitors are ignoring (The "Contrarian Edge"). |
| **-2** | **Expansion** | Discover new potential "Beacons" monthly. | Validated Signal-to-Noise grading. |
| **-1.5** | **Hygiene** | Feedback, Content Quality | Prune "slop" or low-signal sources. |
| **-1** | **The Scout** | Approved Pool | Pick 3-5 high-signal assets from the *validated* pool. |
| **-0.5** | **Agent Fact-Check (Anti-Hallucination)** | **MANDATORY FOR AGENTS:** Fetch and read primary documentation/code (e.g. GitHub README, API docs) of the subject before proceeding. | Evidence of raw source documentation read. |
| **0** | **Beacon Capture** | Fetch and deconstruct related articles/videos from Beacons. | Full text/transcript captured in `research/raw/`. |
| **1** | **Visual Conception** | Draw the mental model using `mcp_pencil_batch_design` (Pencil Dev). | PNG illustration in `public/images/posts/`. |
| **2** | **Tech Brief & Packet** | Generate the 6-file source workflow packet (reader-pressure, evidence-bundle, etc.). | **MUST PASS** `npm run verify:source-workflow-quality` |
| **3** | **First Draft** | Generate a raw, cynical engineering log based ONLY on the validated packet. | **NO NUMBERS IN TITLE.** Minimum 600 words. |
| **4** | **Critique & SEO** | Run `vibe_critic.py` (SRM) + Audit Schema Density. | Pass SRM + Score 7/10+ on 10-Question Audit. |
| **5** | **Targeted Rewrite** | Apply the critique feedback to produce the final, polished markdown. | High-signal, dry tone, verified implementation. |

## 3. Mandatory SEO & Metadata Rules
- **No Numbering in Titles:** Public titles must be slug-based and descriptive (e.g., "Frustration as a Technical Signal").
- **Agentic Summaries:** Every post must start with a 2-3 sentence "TL;DR for Robots" to improve AI search indexing.
- **References:** Always use the `references` frontmatter array to cite the Guru sources.
- **Images:** All images must be hand-drawn style PNGs, linked via `ogImage`.
- **Mouthfeel:** Cynical, dry, engineering tone. No "oceans," "drifting," or "magic."
