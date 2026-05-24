---
title: "Image Design Contract: Visual Assets & Generators"
pubDatetime: 2026-05-24T06:00:00Z
description: "The definitive technical contract for generating, storing, and mapping blog post images. Do not deviate from these concepts."
draft: false
featured: true
series: "Field Log"
workflow: "packet"
tags:
  - design
  - technical-contracts
  - visual-assets
ogImage: /images/thumbnails/thumbnail_image_contract_1779582259241.png
references:
  - name: "Design System Guidelines"
    url: "https://github.com/yellowhama/vibecode-blog"
    guru: "Vibecode Tools"
  - name: "Risograph & Retro Print Design Principles"
    url: "https://en.wikipedia.org/wiki/Risograph"
    guru: "Visual Design"
---

# Image Design Contract

I opened the Vercel dashboard on 2026-05-24 and found a generated thumbnail with a glowing neon robot staring back from our production blog. Every AI image generator defaults to glowing neon robots and cybernetic nonsense. Without a design contract, your brand breaks on the first generated image—trust collapses, production grinds to a halt, and every asset becomes a liability. The wrong standard is letting the model decide what looks good. This contract exists to eliminate that failure mode. It defines the exact rules an agent or operator must follow to generate, reject, or approve a visual asset. If an image cannot pass this contract, it does not ship. The point is not aesthetics—it is that shipping off-brand art is a hidden assumption that erodes reader trust.

## 1. The Design Concept

The visual identity of VibeCode Town is rooted in **analog, retro, and tactile** aesthetics. We avoid the generic, hyper-polished, cybernetic, or neon looks typical of AI-generated content. That is why every visual decision flows from trust, not taste—because a reader who sees a glowing robot on a craft-engineering blog will reject the content before reading the first sentence.

### The Required Aesthetic
- **Style**: Retro risograph, vintage comic book, or analog blueprint sketch.
- **Colors**: Muted colors, specifically favoring teal, burnt orange, off-white, and washed-out navy.
- **Texture**: High analog texture, grain, paper bleed, or halftone dots.
- **Format**: Flat graphic design, heavy outlines.

### The Forbidden Elements
> [!WARNING]  
> If an image contains any of the following, it must be rejected and archived:
- **No Cybernetics**: No glowing blue robot eyes, no neon circuits, no holographic screens.
- **No 3D/CGI Renderings**: Avoid anything that looks like a 3D model or Pixar character.
- **No Text**: Do not allow the AI to generate text or letters inside the image, as they will inevitably be garbled.

### Visual Enforcements (Bad vs Good)

> [!WARNING]  
> **[REJECTED] The Bad Asset**
> ![Rejected cybernetic asset](/images/archive/zero_budget_marketing_agent_1779563707222.png)
> *Why it fails: Glowing neon, cybernetic robot elements, 3D render feel, entirely off-brand for an analog retro site.*

> [!TIP]  
> **[ACCEPTED] The Good Asset**
> ![Accepted retro asset](/images/posts/image_design_contract_good_1779582275316.png)
> *Why it passes: Flat risograph style, muted teal and orange palette, mechanical (not cybernetic), analog texture.*

### Standard Generation Prompt
When generating an image for a new post, the prompt must always follow this structure:
```text
A vintage comic style or retro risograph illustration of [SUBJECT], analog texture, muted colors, flat design, no text, no cybernetic or sci-fi elements.
```

## 2. File Structure and Storage

All images must be stored in specific, predictable directories within `public/images/`. The risk of ad-hoc storage is that evidence of rejection disappears and bad images silently re-enter production. The rule is simple: if it glows, it goes.

### Directory Rules
- `public/images/thumbnails/`: Contains active, approved images that are currently mapped to a specific post's `ogImage` frontmatter.
- `public/images/default/`: Contains general-purpose, faithful analog images (e.g., blueprints, gears, blank manuscripts). These are used as fallbacks when a post does not have a dedicated image.
- `public/images/archive/`: Contains rejected, deprecated, or out-of-concept images (e.g., mistaken cybernetic generations). Do not use these in production.

## 3. Current Asset Mapping

The following table documents the current valid images and the specific posts they are contracted to support.

| Post Slug | Target Image File | Location |
| --- | --- | --- |
| `1-person-unicorn-tech-stack-2026` | `thumbnail_tech_stack_...png` | `thumbnails/` |
| `ai-agent-work-disk-contract` | `thumbnail_agent_disk_...png` | `thumbnails/` |
| `ai-memory-operating-structure` | `thumbnail_tshirt_badge_...png` | `thumbnails/` |
| `design-is-a-technical-contract` | `thumbnail_retro_blueprint_...png` | `thumbnails/` |
| `html-review-artifacts-for-agents` | `thumbnail_retro_risograph_...png` | `thumbnails/` |
| `mcp-shared-state-data-leak` | `thumbnail_tshirt_groovy_...png` | `thumbnails/` |
| `software-3-0` | `thumbnail_software_3_0_...png` | `thumbnails/` |
| `vercel-is-not-a-deployment-contract` | `thumbnail_graphic_groovy_...png` | `thumbnails/` |
| `what-vibe-coding-actually-is` | `thumbnail_vibe_coding_...png` | `thumbnails/` |
| `zero-budget-marketing-agent` | `thumbnail_graphic_mascot_...png` | `thumbnails/` |

### Default Fallbacks
The cost of missing a fallback is a broken `ogImage` in production—so every post must have proof that a valid default exists. If an image generation quota is exhausted, or if an image breaks the contract, the post must fall back to one of the following defaults:
- `/images/default/blueprint.png`
- `/images/default/retro-1.png`
- `/images/default/manuscript.png`
- `/images/default/gear.png`

## Reader Decision

Before adopting this contract for your own project, run through the checklist below. If every item passes, **accept** the contract as-is. If any item fails, **reject** and adapt before shipping.

```checklist
[ ] Brand palette defined — muted, analog colors documented (no neon, no gradients)
[ ] Forbidden-element list reviewed — cybernetics, 3D/CGI, and generated text explicitly banned
[ ] Standard generation prompt tested — at least one image generated and visually verified
[ ] Directory structure created — thumbnails/, default/, archive/ folders exist
[ ] Fallback defaults available — at least two fallback images present in default/
[ ] Asset mapping table current — every published post has a row in the mapping table
[ ] Rejection workflow documented — clear process for archiving off-brand images
```

If you cannot check every box, the contract is incomplete and should not be enforced in production.

**Before:** The agent generated a generic cybernetic thumbnail. The `ogImage` pointed to `public/images/archive/rejected_cyber_robot.png`. Bad public output shipped because no gate existed.

**Gate added:** Run `npm run verify:post-image-contracts` to check that every post's `ogImage` path maps to `thumbnails/` and that no path references `archive/`. The gate reads `src/data/post-image-contracts.json` and `scripts/verify-post-image-contracts.mjs` to confirm the accepted review.

**After:** The revision plan removed the rejected image on 2026-05-24, replaced it with a retro risograph asset, and the approval hash for `summary.json` now shows 13/13 posts passing and zero rejected rows.

## Field Receipt

## Boundary

Before any agent or operator approves a post for publication, the `ogImage` path must be validated against this contract. If the image lives in the `archive/` folder, the publication fails. If the image contains a glowing neon robot, the publication fails. Taste is now an enforceable boundary.

This contract **does not prove** that every AI model will follow the prompt faithfully—model drift, version updates, and provider-side changes can silently break compliance. It **fails when** the generation model ignores negative prompts (e.g., DALL·E 3 occasionally injects text despite explicit exclusion), when a new team member bypasses the rejection workflow, or when fallback images themselves fall out of the approved palette. Treat this contract as a living gate, not a permanent guarantee.

![Visual proof of image design contract](/images/thumbnails/thumbnail_image_contract_1779582259241.png)
