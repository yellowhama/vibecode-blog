# Vibecode Writing Process (Authentic Vibe Edition)

## 1. Core Philosophy: The Scars First
We do not write "how-to" tutorials. We write incident reports. Every post must originate from an authentic struggle (e.g., failing at vibe coding 50 times) and connect to a higher-level Guru insight.

## 2. The 4-Stage Pipeline

| Stage | Name | Action | Pass Condition |
| :--- | :--- | :--- | :--- |
| **0** | **Guru Research** | Fetch and deconstruct related articles/videos from Beacons (Karpathy, Willison, Husain). | 1+ verified Guru insight linking to the core struggle. |
| **1** | **Visual Conception** | Draw the mental model using `mcp_pencil_batch_design`. | High-contrast, hand-drawn Excalidraw style exported to `.png`. No HTML/SVG. |
| **2** | **Synthesis (Drafting)** | Translate the authentic Korean draft into high-density English, integrating the Guru insight and the Pencil drawing. | Minimum 600 words. Gritty, cynical engineer tone. |
| **3** | **Critique Gate** | Run the draft through `vibe_critic.py` (SRM + 10-Question Audit). | Must score 7/10+ on all metrics. No marketing "slop." |

## 3. Formatting Rules
- **References:** Always use the `references` frontmatter array to cite the Guru sources. This renders the "The Beacons" footer.
- **Images:** All images must be placed in `public/images/posts/` and linked via the `ogImage` frontmatter and standard markdown image syntax in the body.
