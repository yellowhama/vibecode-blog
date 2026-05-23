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
ogImage: /images/default/sketch.png
---

# Image Design Contract

This is the standard operating procedure and technical contract for generating visual assets across the VibeCode Town blog. Images on this site are not random mood boards—they are specific, concept-bound artifacts that must adhere strictly to the established aesthetic.

## 1. The Design Concept

The visual identity of VibeCode Town is rooted in **analog, retro, and tactile** aesthetics. We avoid the generic, hyper-polished, cybernetic, or neon looks typical of AI-generated content.

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

### Standard Generation Prompt
When generating an image for a new post, the prompt must always follow this structure:
```text
A vintage comic style or retro risograph illustration of [SUBJECT], analog texture, muted colors, flat design, no text, no cybernetic or sci-fi elements.
```

## 2. File Structure and Storage

All images must be stored in specific, predictable directories within `public/images/`.

### Directory Rules
- `public/images/thumbnails/`: Contains active, approved images that are currently mapped to a specific post's `ogImage` frontmatter.
- `public/images/default/`: Contains general-purpose, high-quality analog images (e.g., blueprints, gears, blank manuscripts). These are used as fallbacks when a post does not have a dedicated image.
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
If an image generation quota is exhausted, or if an image breaks the contract, the post must fall back to one of the following defaults:
- `/images/default/blueprint.png`
- `/images/default/retro-1.png`
- `/images/default/manuscript.png`
- `/images/default/gear.png`

## Enforcement

Before any agent or operator approves a post for publication, the `ogImage` path must be validated against this contract. If the image lives in the `archive/` folder, the publication fails. If the image contains a glowing neon robot, the publication fails. Taste is now an enforceable boundary.
