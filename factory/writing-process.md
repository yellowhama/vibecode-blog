# Vibecode Writing Process (v5 Multi-Pass Pipeline)

## 1. Core Philosophy: The Scars First
We do not write "how-to" tutorials. We write incident reports. Every post must originate from an authentic struggle (e.g., failing at vibe coding 50 times) and connect to a higher-level Guru insight.

## 2. The v5 Multi-Pass Pipeline

| Stage | Name | Action | Pass Condition |
| :--- | :--- | :--- | :--- |
| **0** | **Beacon Capture** | Fetch and deconstruct related articles/videos from Beacons (Karpathy, Willison, Husain). | Full text/transcript captured in `research/raw/`. |
| **1** | **Tech Brief** | Generate an XML-structured plan detailing exact errors, tools, Guru quotes, and the "Aha Moment." | Approved Brief in `plans/`. |
| **2** | **First Draft** | Generate a raw, cynical engineering log based strictly on the Brief. | 600+ words in `drafts/v1_raw.md`. |
| **3** | **SRM Audit** | Run the BW-derived Critique Gate (`vibe_critic.py`) to find "slop" and rhythmic issues. | Structured YAML report in `reviews/`. |
| **4** | **Targeted Rewrite** | Apply the critique feedback to produce the final, polished markdown. | Pass SRM Gate + Score 7/10+ on Audit. |
| **5** | **Visual Conception** | Draw the mental model using `mcp_pencil_batch_design` (Pencil Dev). | PNG illustration in `public/images/posts/`. |

## 3. Formatting Rules
- **References:** Always use the `references` frontmatter array to cite the Guru sources.
- **Images:** All images must be hand-drawn style PNGs, linked via `ogImage`.
- **Mouthfeel:** Cynical, dry, engineering tone. No "oceans," "drifting," or "magic."
