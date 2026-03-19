# AI Video Prompting Research

> Comprehensive reference for I2V, T2V, and T2I prompt engineering across major AI video/image models.
> Compiled: 2026-03-19

---

## Table of Contents

1. [Universal Prompt Structure](#1-universal-prompt-structure)
2. [Image-to-Video (I2V) Prompting](#2-image-to-video-i2v-prompting)
3. [Camera Composition & Framing](#3-camera-composition--framing)
4. [Motion Description](#4-motion-description)
5. [Color, Mood & Atmosphere](#5-color-mood--atmosphere)
6. [Style Consistency Across Shots](#6-style-consistency-across-shots)
7. [T2I for Flat Vector Art](#7-t2i-for-flat-vector-art)
8. [Model-Specific Notes](#8-model-specific-notes)
9. [Common Mistakes](#9-common-mistakes)
10. [Sources](#10-sources)

---

## 1. Universal Prompt Structure

### The Core Formula

All major AI video models respond well to a structured prompt with these elements in order:

```
[Subject] + [Scene/Setting] + [Action/Motion] + [Camera Movement] + [Lighting/Atmosphere] + [Style/Quality]
```

Alternative formulations that work:

- **Civitai formula**: Subject + Scene + Action + (Style) + (Atmosphere) + (Camera Movement) + (Lighting) + (Shot Size)
- **Wan advanced formula**: Subject (Description) + Scene (Description) + Movement (Description) + Aesthetic Control + Stylization
- **Simple formula**: [Camera direction] + [Scene pace] + [Action/motion] + [Atmospheric details]

### Optimal Prompt Length

| Model | Sweet Spot | Notes |
|-------|-----------|-------|
| Wan 2.2 / 2.6 | 80-120 words | Under-specifying causes model to apply its own "cinematic" defaults |
| Runway Gen-4 | 30-80 words | Shorter is better; one dominant camera instruction |
| Kling 2.6 | 50-100 words | Concrete, action-based language preferred |
| Sora 2 | 60-120 words | Describe beginning, middle, end |

### Golden Rule

For I2V specifically: **describe how things move, not what should appear** -- the uploaded image already defines the "what."

---

## 2. Image-to-Video (I2V) Prompting

### Why I2V Over T2V

I2V is recommended for most production workflows because:
- Brand/style consistency is locked by the source image
- You control composition, color palette, and framing upfront
- The prompt focuses purely on animating what exists
- Results are far more predictable

### I2V Prompt Template (Wan 2.2)

```
[What moves/changes], [what stays fixed], [camera behavior around the existing image].
[Lighting condition]. [Mood descriptor]. [Quality anchor].
```

**Good I2V prompt:**
```
The woman's hair sways gently in the breeze, her eyes blink twice, lips
curve into a subtle smile. Background leaves rustle softly. Slow dolly in,
center-framed. Warm golden hour light. Cinematic, 35mm film grain.
```

**Bad I2V prompt:**
```
A beautiful woman standing in a garden with flowers. She is wearing a
blue dress. The garden is very pretty with many colors.
```
Problem: describes appearance (already in the image) instead of motion.

### I2V Prompt Template (Kling 2.6)

Kling needs four elements: **Subject + Action + Context + Style**

```
[Primary subject] [specific action verb] [in/at location],
[camera instruction], [lighting], [style reference].
```

**Example:**
```
The warrior raises his sword overhead in a sweeping arc, rain
cascading off the blade. Tracking shot follows the motion.
Overcast stormy light, desaturated teal grade, cinematic.
```

---

## 3. Camera Composition & Framing

### Camera Terms That AI Models Understand

AI video models are trained on professional film data and respond precisely to cinematography terminology. Use these exact phrases:

#### Shot Sizes
| Term | What It Does | Use For |
|------|-------------|---------|
| `extreme close-up` / `ECU` | Face fills frame, eyes/mouth only | Emotion, detail |
| `close-up` | Head and shoulders | Dialogue, reaction |
| `medium close-up` | Chest up | Conversation |
| `medium shot` | Waist up | Standard dialogue |
| `medium wide` / `cowboy shot` | Knees up | Action + context |
| `wide shot` / `full shot` | Entire body + environment | Establishing |
| `extreme wide shot` | Tiny figure in vast landscape | Scale, isolation |

#### Camera Movements
| Term | What It Does | Best For |
|------|-------------|----------|
| `slow dolly in` | Camera physically moves closer | Building tension, intimacy |
| `dolly out` / `pull back` | Camera moves away | Reveal, isolation |
| `pan left` / `pan right` | Camera swivels horizontally (fixed point) | Following action, landscape reveal |
| `tilt up` / `tilt down` | Camera pivots vertically | Revealing height, power dynamics |
| `tracking shot` | Camera follows moving subject | Journey, pursuit, energy |
| `crane shot` / `jib up` | Camera rises vertically | Establishing, grandeur |
| `orbit` / `arc shot` | Camera circles the subject | Drama, reveal |
| `steadicam` / `smooth follow` | Handheld but stabilized | Immersion, documentary feel |
| `static` / `locked off` / `tripod` | No camera movement | Stillness, tableau |
| `handheld` | Subtle shake | Urgency, realism |
| `aerial` / `drone shot` | High overhead, moving | Scale, geography |
| `whip pan` | Fast horizontal camera move | Transition, energy burst |

#### What NOT to Say
| Bad | Better |
|-----|--------|
| "camera moves closer" | "slow dolly in, center-framed, steady" |
| "make it look cool" | "low angle tracking shot, golden hour backlight" |
| "add movement" | "gentle pan right revealing the coastline" |
| "zoom in" | "slow push in" (zoom changes focal length; push-in changes perspective) |

### Combining Camera + Subject

The most effective pattern is one dominant camera movement paired with one subject action:

```
Slow dolly in on the woman as she turns her head toward the window,
soft afternoon light casting long shadows across the table.
```

**Avoid stacking conflicting camera moves.** "Pan right while dollying in and tilting up" produces jerky, confused motion. Pick one.

---

## 4. Motion Description

### Motion Verbs That Work

These verbs produce reliable, clean motion in 5-second clips:

**Subtle/Gentle:**
- `sways gently`, `drifts slowly`, `ripples softly`
- `flutters`, `blinks`, `breathes`, `shifts slightly`
- `glides`, `floats`, `settles`, `fades`

**Moderate:**
- `walks steadily`, `turns toward`, `reaches for`
- `pours`, `stirs`, `lifts`, `nods`
- `billows`, `swirls`, `cascades`

**Dynamic:**
- `sprints`, `leaps`, `crashes`, `shatters`
- `erupts`, `whips`, `surges`, `explodes`
- `lunges`, `spins rapidly`, `collides`

### Environmental Motion Keywords (High Reliability)

These consistently produce good results across all models:

**Wind effects:** `hair blowing gently`, `leaves rustling in the breeze`, `curtains billowing`, `grass swaying`, `fabric rippling`

**Water effects:** `waves rolling toward shore`, `water rippling`, `rain falling softly`, `raindrops hitting puddles`, `steam rising`

**Light effects:** `sunlight flickering through leaves`, `shadows shifting slowly`, `light dancing on water`, `embers drifting upward`

**Particle effects:** `dust motes floating`, `snow falling gently`, `petals drifting`, `smoke curling upward`

### Motion with Weight and Physics

Adding physical weight makes motion more convincing:

| Generic (Weak) | Weighted (Strong) |
|----------------|-------------------|
| "person walks" | "person with heavy pack trudges forward, each step pressing deep into snow" |
| "flag moves" | "flag snaps taut in gusting wind, fabric rippling along its length" |
| "water flows" | "thick honey-like liquid oozes slowly down the glass surface" |
| "bird flies" | "hawk glides on thermals, wingtips barely adjusting" |

### The Three Layers of Motion

For a scene that feels alive, describe motion at three levels:

1. **Subject motion** -- what the character/object does
2. **Environment motion** -- what the world around them does
3. **Camera motion** -- how the viewpoint moves

**Example (all three layers):**
```
A fisherman casts his line into the river (subject), current carrying
fallen leaves downstream as dragonflies hover above the surface
(environment), slow tracking shot following the arc of the line (camera).
Warm late-afternoon light, golden tones, peaceful atmosphere.
```

A prompt with zero explicit motion (e.g., "a beautiful sunset over the ocean") produces a nearly static clip. Always add at least one motion layer.

---

## 5. Color, Mood & Atmosphere

### Lighting Descriptors That Work

| Keyword | Visual Effect |
|---------|--------------|
| `golden hour` | Warm, low-angle sun, long shadows |
| `blue hour` | Cool twilight, pre-dawn/post-sunset |
| `overcast soft light` | Flat, diffused, no harsh shadows |
| `harsh directional light` | Strong shadows, dramatic contrast |
| `backlit` / `rim light` | Subject outlined in light, silhouette |
| `neon-lit` | Cyberpunk, urban night, color spill |
| `candlelight` / `firelight` | Warm flicker, intimate, orange tones |
| `moonlight` | Cool blue, low-key, atmospheric |
| `studio lighting` | Clean, controlled, professional |
| `volumetric light` | God rays, fog beams, atmosphere |

### Color Grade / Palette Keywords

These work as style anchors to lock a look across shots:

- `teal-and-orange grade` -- modern cinematic blockbuster look
- `desaturated` / `muted colors` -- indie film, moody
- `high contrast black and white` -- noir, dramatic
- `pastel palette` -- soft, dreamy, whimsical
- `warm earth tones` -- natural, grounded, nostalgic
- `cool blue tones` -- clinical, melancholic, futuristic
- `saturated primary colors` -- bold, graphic, pop art
- `monochrome with [color] accent` -- selective color emphasis

### Mood Keywords

| Mood | Keywords That Work |
|------|-------------------|
| Tension | `ominous`, `foreboding`, `uneasy stillness`, `shadows creeping` |
| Peace | `serene`, `tranquil`, `gentle`, `soft ambient light` |
| Energy | `vibrant`, `dynamic`, `electric`, `pulsing` |
| Nostalgia | `faded film stock`, `warm grain`, `soft vignette`, `muted warmth` |
| Mystery | `fog-shrouded`, `dim`, `silhouetted figures`, `obscured` |
| Joy | `bright`, `sun-drenched`, `warm golden light`, `vivid colors` |

### Atmosphere Example (Full Prompt)

```
A lone lighthouse keeper climbs the spiral staircase, lantern in hand.
Coastal lighthouse at blue hour, soft fog rolling in from the sea.
Slow dolly-in through the doorway. Volumetric light beams cut through
dust motes. Muted teal palette with warm lantern accent. Cinematic,
35mm anamorphic, film grain.
```

---

## 6. Style Consistency Across Shots

### The Core Problem

AI video models treat each generation as an independent task. There is no built-in memory for characters, settings, or style across clips.

### Strategies That Work

#### 1. Repeat Exact Identity Phrases

Use the **exact same phrasing** for key identity and scene attributes across every shot:

```
Shot 1: "A 30-year-old woman with auburn bob, denim jacket, silver locket;
         rainy neon-lit alley; 35mm, f/2.8; teal-and-magenta grade"

Shot 2: "Same 30-year-old woman with auburn bob, denim jacket, silver locket;
         inside a dimly lit bar; 35mm, f/2.8; teal-and-magenta grade"

Shot 3: "Same 30-year-old woman with auburn bob, denim jacket, silver locket;
         standing under a streetlamp; 35mm, f/2.8; teal-and-magenta grade"
```

The style anchor (`35mm, f/2.8; teal-and-magenta grade`) stays identical.

#### 2. Use I2V With a Consistent Source

Generate a hero image first, then use it as the I2V source for all shots of that character. This locks appearance far better than text alone.

#### 3. Reference Frame Color Matching

Apply the same color profile from a reference frame to all clips in post. Even if the AI drifts slightly, color grading unifies the sequence.

#### 4. Build a Prompt Template

Create a reusable template with locked style tokens:

```
STYLE_ANCHOR = "cinematic, 35mm anamorphic, shallow depth of field,
               desaturated teal grade, film grain"
CHARACTER = "a weathered fisherman, 60s, grey beard, yellow raincoat,
            deep-set eyes"
SETTING = "a fog-covered harbor at dawn, fishing boats creaking"

Shot prompt: {CHARACTER}, [action], {SETTING}. [Camera]. {STYLE_ANCHOR}.
```

#### 5. Consistent Negative Prompts

Keep the same negative prompt across all shots:
```
text overlay, logos, watermark, heavy blur, lens distortion, jitter
```

---

## 7. T2I for Flat Vector Art

### LoRA Models for Vector Style (Flux / SDXL)

#### SimpleVectorFlux
- **Trigger:** `v3ct0r` or `v3ct0r style`
- **Template:** `v3ct0r style, simple flat vector art, isolated on white bg, [subject]`
- **LoRA weight:** 0.6 - 0.9
- **Strengths:** Game assets, clip art, character designs, isolated elements
- **Quirks:** Can be temperamental; sometimes bleeds/blends subjects. Adjust prompt tokens iteratively.
- Source: `renderartist/simplevectorflux` on HuggingFace

#### Flux-LoRA-Simple-Vector (lichorosario)
- **Trigger:** `v3ct0r`
- **Template:** `v3ct0r, simple vector art of a [subject], flat colors, clean lines, white background`
- Source: `lichorosario/flux-lora-simple-vector` on HuggingFace

#### Minimalist Vector Art (Civitai)
- **Trigger:** `ArsMJStyle, Minimalist Vector Art`
- **Enhancements:** `Silhouette, monochrome, greyscale, simple background`
- Works across SDXL, Pony, and Flux
- Source: Civitai model #658816

#### FLUX.1-dev-LoRA-Vector-Journey (Shakker-Labs)
- **Trigger:** `VCTRL`
- **Style:** More stylized vector illustration, journey/adventure aesthetic
- Source: `Shakker-Labs/FLUX.1-dev-LoRA-Vector-Journey` on HuggingFace

### General T2I Vector Art Tips

1. **Always include background instruction**: `isolated on white bg`, `simple background`, `solid color background`
2. **Style anchors**: `flat colors`, `clean lines`, `no gradients`, `bold outlines`, `minimal shading`
3. **Negative prompts for vector**: `photorealistic, 3d render, gradient, texture, noise, photograph, blurry`
4. **LoRA weight tuning**: Start at 0.7, increase for stronger style, decrease if details are lost
5. **Use unique tokens**: If combining LoRAs, use the unique trigger token (e.g., `v3ct0r`, `txcl`) to keep styles separated

### T2I Vector Prompt Template

```
v3ct0r style, simple flat vector art, isolated on white bg,
[subject description], [color palette], clean lines, bold outlines,
minimal detail, no gradients, graphic design style
```

**Good example:**
```
v3ct0r style, simple flat vector art, isolated on white bg,
a friendly robot holding a coffee cup, blue and orange palette,
clean lines, bold outlines, minimal detail, no gradients
```

**Bad example:**
```
a robot with coffee, vector art
```
Problem: too vague, no trigger word, no style anchors, no background instruction.

---

## 8. Model-Specific Notes

### Wan 2.2 / 2.6

- Uses Mixture-of-Experts (MoE) architecture -- better at handling complex prompts than predecessors
- Negative prompts are more consistently respected than in Wan 2.1
- Keep negatives short: 3-6 items max. Over-specified negatives (the old "deformed, disfigured, ugly" boilerplate) can actually collapse faces
- For flicker issues: shorten duration, add `no flicker` to negatives, raise steps, lower strength
- Wan 2.2 "seems happier with clear nouns and a gentle style hint than with stacked adjectives"
- **Negative prompt template:** `text overlay, logos, heavy blur, flicker, lens warping, jitter`

### Runway Gen-4 / 4.5

- **Shorter prompts work better** -- Gen-4 is designed for simplicity
- **No negative prompts supported** -- describe what should happen, not what to avoid
- Use simple, direct verbs: "run," "jump," "turn" -- avoid complex descriptive phrases
- Runway thinks in terms of forces/physics: describe forces acting on objects rather than appearance
- Camera speed matters: low speed = clean edges, high speed = artifacts ("AI wobble")
- **Motion brush must align with text prompt** -- conflicting instructions cause tearing
- Prompt structure: Subject -> Action -> Camera motion/style

### Kling 2.6

- Excels at realistic high-speed motion and physics
- Always specify: Subject + Action + Context + Style
- For I2V: write what moves, what stays fixed, how camera behaves
- Best with concrete, action-based language
- Supports camera presets in addition to text camera descriptions

### Sora 2

- Models cause and effect -- think in causal chains
- Specify camera/shot details explicitly: "wide angle," "dolly in," "over the shoulder shot"
- Think beginning, middle, end within a single clip
- Precise prompts with timing markers produce cinematic output
- Generic descriptions produce generic results

---

## 9. Common Mistakes

### Mistake 1: Describing Appearance Instead of Motion (I2V)
The source image already defines what things look like. Your prompt should focus on animation.

### Mistake 2: Stacking Conflicting Camera Moves
"Pan right while dollying in and tilting up and orbiting" produces chaos. Pick ONE dominant movement.

### Mistake 3: Zero Explicit Motion
"A beautiful sunset over the ocean" = nearly static clip. Add: "Waves rolling toward shore in slow motion, golden light reflecting on each wave, camera slowly panning across the horizon."

### Mistake 4: Over-Specified Negative Prompts
The old Stable Diffusion boilerplate (`deformed, disfigured, ugly, blurry, bad anatomy, extra limbs`) can hurt video models. Use 3-6 targeted negatives.

### Mistake 5: Vague Language
"Make it cinematic" means nothing. "35mm anamorphic, shallow depth of field, warm grade, slow dolly" means everything.

### Mistake 6: Forgetting the Style Anchor
Without a consistent style descriptor, each generation drifts. Lock your look with a repeating style block.

### Mistake 7: Prompt Too Long or Too Short
Below 30 words: model fills in gaps unpredictably. Above 150 words: signal diluted, model ignores details. Aim for the model-specific sweet spot.

### Mistake 8: Using Abstract Concepts
"The feeling of loneliness" forces the model to interpret your intention. "A woman sits alone at a large empty dining table, single overhead light, shadows filling the room" gives concrete instruction.

### Mistake 9: Ignoring Physics/Weight
"The ball bounces" is flat. "The heavy medicine ball drops, compresses slightly on impact, then bounces low with visible effort" reads as physically plausible.

### Mistake 10: Inconsistent Prompts Across Shots
Changing character descriptions, style anchors, or color grades between shots guarantees visual inconsistency. Template and repeat.

---

## 10. Sources

### Wan 2.1 / 2.2 / 2.6
- [WAN 2.1 Prompt Guide -- Ambience AI](https://www.ambienceai.com/tutorials/wan-prompting-guide)
- [Wan2.2 Video Models -- Scenario](https://help.scenario.com/en/articles/wan-2-2-models-the-essentials/)
- [Wan 2.2 Prompting Guide -- VEED](https://www.veed.io/learn/wan-2-2-prompting-guide)
- [Wan 2.6 I2V Prompts -- CrePal](https://crepal.ai/blog/aivideo/wan-2-6-image-to-video-prompts/)
- [Wan2.2 What's New & Killer Prompts -- InstaSD](https://www.instasd.com/post/wan2-2-whats-new-and-how-to-write-killer-prompts)
- [Wan 2.2 Performance & High-Impact Prompts -- ViewComfy](https://www.viewcomfy.com/blog/wan2.2_prompt_guide_with_examples)
- [Wan 2.2 Prompt Complete Guide -- Story321](https://story321.com/blog/wan-2-2-prompt)
- [How to Craft Wan2.2 AI Video Prompts (69+ Examples) -- MimicPC](https://www.mimicpc.com/learn/how-to-craft-wan22-ai-video-prompts)
- [Wan 2.6 Prompt Guide -- fal.ai](https://fal.ai/learn/devs/wan-2-6-prompt-guide-mastering-all-three-generation-modes)
- [WAN 2.6 Complete Guide -- WaveSpeedAI](https://wavespeed.ai/blog/posts/wan-2-6-complete-guide-2026/)
- [Mastering Prompt Writing for Wan 2.1 in ComfyUI -- InstaSD](https://www.instasd.com/post/mastering-prompt-writing-for-wan-2-1-in-comfyui-a-comprehensive-guide)
- [ComfyUI Wan2.2 Official Workflow -- ComfyUI Docs](https://docs.comfy.org/tutorials/video/wan/wan2_2)

### Runway
- [Gen-4 Video Prompting Guide -- Runway](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide)
- [Camera Terms, Prompts & Examples -- Runway](https://help.runwayml.com/hc/en-us/articles/47313504791059-Camera-Terms-Prompts-Examples)
- [Runway Gen-4 Camera Motion -- CrePal](https://crepal.ai/blog/aivideo/runway-gen4-motion-prompts/)
- [Runway Gen-4 Prompts Ultimate Guide -- FilmArt](https://filmart.ai/runway-gen-4-prompts/)

### Kling
- [Kling AI Prompt Guide -- Leonardo.Ai](https://leonardo.ai/news/kling-ai-prompts/)
- [Kling 2.5 Turbo Prompting Guide -- Atlabs](https://www.atlabs.ai/blog/kling-2-5-turbo-prompting-guide)
- [Kling 2.6 Pro Prompt Guide -- fal.ai](https://fal.ai/learn/devs/kling-2-6-pro-prompt-guide)

### Sora
- [Sora 2 Prompting Best Practices -- WeShop](https://www.weshop.ai/blog/sora-2-prompting-best-practices-for-real-life-motion/)
- [Ultimate Sora 2 Prompt Guide -- GLBGPT](https://www.glbgpt.com/hub/ultimate-sora-2-prompt-guide/)

### Camera & Motion
- [12 Essential Camera Movements -- LetsEnhance](https://letsenhance.io/blog/all/ai-video-camera-movements/)
- [AI Camera Shots -- Artlist](https://artlist.io/blog/camera-shots-ai/)
- [Camera Movements Prompts Guide -- AgeOfLLMs](https://ageofllms.com/ai-howto-prompts/ai-fun/camera-movements-prompts-ai-video)
- [16 Camera Movements -- ImagineArt](https://www.imagine.art/blogs/camera-movements)
- [Guide to Prompting Video Generator -- getimg.ai](https://getimg.ai/guides/guide-to-prompting-with-video-generator)

### General Video Prompting
- [Civitai's Guide to Video Gen Prompting](https://education.civitai.com/civitais-guide-to-video-gen-prompting/)
- [How to Actually Control Next-Gen Video AI -- Medium](https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b)
- [Prompting Tips for Different AI Video Models -- Artlist](https://help.artlist.io/hc/en-us/articles/31558164653213)
- [Complete Guide to Writing Prompts for AI -- Medium/Bootcamp](https://medium.com/design-bootcamp/complete-guide-to-writing-prompts-for-ai-text-to-image-text-to-video-image-to-video-and-visual-f59ccd2929cb)
- [AI Video Prompt Guide -- LTX Studio](https://ltx.studio/blog/ai-video-prompt-guide)
- [Veo Vertex AI Prompt Guide -- Google Cloud](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide)

### Style Consistency
- [Consistent Style Across AI Video Clips -- PyxelJam](https://pyxeljam.com/how-to-achieve-consistent-style-across-multiple-ai-generated-video-clips/)
- [Consistent Character AI -- Artlist](https://artlist.io/blog/consistent-character-ai/)
- [Veo 3.1 Multi-Prompt Storytelling -- SkyWork](https://skywork.ai/blog/multi-prompt-multi-shot-consistency-veo-3-1-best-practices/)

### Vector Art LoRAs
- [SimpleVectorFlux -- HuggingFace](https://huggingface.co/renderartist/simplevectorflux)
- [flux-lora-simple-vector -- HuggingFace](https://huggingface.co/lichorosario/flux-lora-simple-vector)
- [Minimalist Vector Art (SDXL/Pony/Flux) -- Civitai](https://civitai.com/models/658816/minimalist-vector-art-sdxl-pony)
- [FLUX.1-dev-LoRA-Vector-Journey -- HuggingFace](https://huggingface.co/Shakker-Labs/FLUX.1-dev-LoRA-Vector-Journey)
- [Vector Art & Line Art (Flux) -- Civitai](https://civitai.com/models/686231/vector-art-and-line-art-flux)
