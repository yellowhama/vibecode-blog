---
name: Land-OS Retro-Engineering
colors:
  surface: '#1a110b'
  surface-dim: '#1a110b'
  surface-bright: '#43372f'
  surface-container-lowest: '#150c07'
  surface-container-low: '#231a13'
  surface-container: '#281e17'
  surface-container-high: '#332821'
  surface-container-highest: '#3e322b'
  on-surface: '#f2dfd4'
  on-surface-variant: '#d8c3ac'
  inverse-surface: '#f2dfd4'
  inverse-on-surface: '#392e27'
  outline: '#a08e79'
  outline-variant: '#534433'
  surface-tint: '#ffb95b'
  primary: '#ffcc8d'
  on-primary: '#462a00'
  primary-container: '#ffa602'
  on-primary-container: '#684100'
  inverse-primary: '#845400'
  secondary: '#e4bfa8'
  on-secondary: '#422b1b'
  secondary-container: '#5b4130'
  on-secondary-container: '#d2ae98'
  tertiary: '#d4d5d5'
  on-tertiary: '#2f3131'
  tertiary-container: '#b8b9b9'
  on-tertiary-container: '#484a4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb6'
  primary-fixed-dim: '#ffb95b'
  on-primary-fixed: '#2a1800'
  on-primary-fixed-variant: '#643f00'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#e4bfa8'
  on-secondary-fixed: '#2a1708'
  on-secondary-fixed-variant: '#5b4130'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#1a110b'
  on-background: '#f2dfd4'
  surface-variant: '#3e322b'
typography:
  headline-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  body-ko:
    fontFamily: Pretendard
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is an "Analog Engineering" interface that blends high-utility brutalism with mid-century industrial hardware aesthetics. It targets a demographic that appreciates tactile clarity and high legibility, specifically optimized for elderly users through high-contrast ratios and oversized interactive hit areas.

The visual style is **High-Contrast Brutalist**. It rejects soft gradients and subtle shadows in favor of hard-edged borders, solid offsets, and a rigid mechanical structure. The emotional response should be one of "rugged reliability"—feeling like a physical control panel rather than a ephemeral digital overlay.

## Colors
The palette is restricted to ensure AAA accessibility standards for contrast. 
- **Main Surface:** The `#432C1C` (Dark Espresso) serves as the primary container background, providing a warm but deep canvas that reduces eye strain compared to pure black.
- **Primary Accent:** `#FFA602` (Golden Orange) is used exclusively for primary actions, active states, and critical information. 
- **Functional Contrast:** Pure white is used for secondary text and icons against the dark background, while `#1A110B` is used for deep "well" effects and background layering.
- **Outlines:** All borders use either pure White or the Primary Golden Orange to maintain structural definition.

## Typography
Typography is optimized for readability. **Outfit** provides a clean, geometric sans-serif base for high-speed scanning of headers and body text. **Space Mono** is utilized for technical data, labels, and "read-out" elements to reinforce the engineering aesthetic. For Korean text, **Pretendard** is mandated for its exceptional legibility and modern proportions.

- **Contrast:** No text should fall below a 7:1 contrast ratio.
- **Scale:** Minimum font size for mobile body text is 18px to accommodate elderly vision.
- **Weight:** Use Bold and Extra Bold for hierarchy; avoid light weights that might "wash out" on dark backgrounds.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy inspired by architectural blueprints. Elements are placed on a strict 8px baseline grid to ensure a rhythmic, mechanical feel.

- **Desktop:** 12-column grid with a max-width of 1280px. Gutters are fixed at 24px to maintain clear separation between "modules."
- **Mobile:** 4-column fluid grid. Margins are increased to 24px to prevent thumb-overlap on hardware bezels.
- **Sectioning:** Content should be grouped into "Modules" (Cards) with significant padding (md/lg) to prevent visual clutter, which is essential for accessibility.

## Elevation & Depth
Depth is created through **Bold Borders** and **Solid Shadows** (Neobrutalism), rather than light-source simulation. 

- **Surface Tiers:** Level 0 is the page background (#1A110B). Level 1 is the primary container (#432C1C).
- **The Offset Shadow:** Interactive elements feature a solid, 100% opacity shadow (usually #000000 or a darker shade of the container) offset by 4px or 8px down and to the right. 
- **Outlines:** Every container must have a minimum 2px solid border. Active elements use the Golden Orange (#FFA602) border; inactive use White or a muted variant.
- **Interaction:** On hover or press, the element "pushes" into the shadow (translate X/Y) to simulate a physical mechanical button.

## Shapes
This design system uses **Sharp (0px)** corners exclusively. The absence of rounding reinforces the "industrial hardware" and "analog equipment" narrative. 

Structural integrity is conveyed through right angles and thick strokes. All buttons, input fields, and cards must maintain 90-degree corners. The only exception is for status indicators (LED style) which may be perfect circles.

## Components
- **Buttons:** Large, high-contrast blocks. Primary buttons use #FFA602 background with black text. They must include a 4px solid black offset shadow that disappears on "active" state to simulate a physical press.
- **Input Fields:** Darker background (#1A110B) with a 2px white border. Labels must be in Space Mono above the field.
- **Cards:** Defined by a 2px solid white border. Header areas of cards should 고전 background color to separate "Control" from "Content."
- **Chips/Status:** High-visibility tags using Space Mono. Use "LED" style circular icons next to text to indicate system status (e.g., Green for "Operational").
- **Checkboxes/Radios:** Oversized (min 32px) for easy tapping. Active states must fill with #FFA602.
- **Lists:** Separated by 2px solid horizontal rules. Increase vertical padding to 24px per item to ensure high hit-density for elderly users.
