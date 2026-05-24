# VibeCode Town - Design System & Brand Identity

This document defines the core brand identity, technical design contracts, color palettes, and visual rules for **VibeCode Town**. It serves as the single source of truth for both human operators and autonomous agents working on the site.

---

## 1. Core Brand Concept

**VibeCode Town** is a field log for "The 1-Person Unicorn." The content focuses on scaling a solopreneur business using autonomous agents, AEO (Agent Engine Optimization), and rigorous technical contracts.

The brand tone is:
- **Technical but Accessible**: We deal with complex agentic infrastructure but explain it through clear, grounded analogies.
- **Analog & Tactile**: Despite writing about cutting-edge AI, the aesthetic is deliberately "retro print" or "blueprint" to emphasize structure, reliability, and engineering discipline rather than hyping up sci-fi magic.
- **Opinionated**: We don't just share code; we share strong operational boundaries and systems (e.g., "Frustration as a Spec", "Design is a Technical Contract").

---

## 2. Color Palette (The 70s Analog Retro Print)

We use a high-contrast, warm color palette that evokes vintage paper, coffee, and printed manuals.

### Light Mode (Default)
- **Background**: `#FDFBF7` *(Warm Paper Cream)* - Used for the main body.
- **Foreground / Text**: `#432c1c` *(Dark Coffee Brown)* - Used for primary text and heavy borders.
- **Accent**: `#ffa602` *(Golden Orange)* - Used for links, highlights, and primary buttons.
- **Accent Dim**: `#d98801` - Used for hover states.

### Dark Mode (Deep Espresso)
- **Background**: `#251714` *(Deep Espresso)* - Used for the main body.
- **Foreground / Text**: `#FDFBF7` *(Warm Paper Cream)* - Reverses the light mode text for high readability.
- **Accent**: `#ffa602` *(Golden Orange)* - Glows beautifully against the dark background.
- **Accent Dim**: `#ffb733` - Used for hover states.

---

## 3. Typography

- **Headings**: `Outfit` - Geometric, clean, but friendly. Used for all `<h1>` to `<h6>` tags. Letter-spacing is slightly tightened (`-0.02em`) for a solid editorial feel.
- **Body & UI**: `Inter` - Highly legible, neutral sans-serif for long-form reading and UI elements.
- **Code & Metadata**: `Space Mono` or system monospace. Used for tags, dates, overlines, and code blocks to reinforce the engineering vibe.

---

## 4. Image Design Contract

Visuals on VibeCode Town are strictly governed by an aesthetic contract to prevent generic AI "sci-fi" slop.

### The Required Aesthetic
- **Style**: Retro risograph, vintage comic book, or analog blueprint sketch.
- **Colors**: Muted colors (teal, burnt orange, off-white, washed-out navy).
- **Texture**: High analog texture, grain, paper bleed, or halftone dots.
- **Format**: Flat graphic design, heavy outlines.

### The Forbidden Elements
- **NO Cybernetics**: No glowing blue robot eyes, neon circuits, or futuristic holograms.
- **NO 3D/CGI**: Do not use 3D renders or Pixar-style character designs.
- **NO Text**: Do not allow image generators to write text, as it becomes garbled.

### Standard Image Prompt
Any agent or operator generating images for a post MUST use this base prompt structure:
> "A vintage comic style or retro risograph illustration of `[SUBJECT]`, analog texture, muted colors, flat design, no text, no cybernetic or sci-fi elements."

---

## 5. UI & Layout Principles

- **Borders & Shadows**: We use hard, thick borders (e.g., `border border-foreground`) and solid drop shadows (`box-shadow: 8px 8px 0 0 var(--foreground)`) for interactive elements and diagrams to give a brutalist, tactile feel.
- **Hero Sections**: Hero background images use `mix-blend-luminosity` and lowered opacity (e.g., `opacity-60`) behind gradient overlays. This ensures text remains perfectly readable while the analog artwork sets the mood in the background.
- **Crossfades**: We prefer elegant crossfades (`transition-opacity duration-1000`) over jarring horizontal sliding animations for rotators.

## 6. Execution Rule

Whenever designing a new component, generating an image, or modifying a layout, **do not invent new aesthetics**. Fall back to the variables defined in `src/styles/global.css` and the prompts defined in this document.
