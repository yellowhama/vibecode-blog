# EP01 Prompt Comparison Report

Baseline: `ep01_shot_manifest_v9.json` | Methods: 3
i2v shots evaluated: 16

## Summary

| Metric | Baseline (v9 template) | A: Claude | B: Ollama 7b | C: Ollama 14b |
|--------|-----|-----|-----|-----|
| Diversity (Jaccard avg) | 0.219 | 0.588 | **0.763** | 0.724 |
| Trigger word rate | **1.0** | **1.0** | **1.0** | **1.0** |
| Banned words total | **0** | **0** | **0** | **0** |
| Mood color match rate | 0.5 | **0.88** | 0.19 | 0.31 |
| Camera terms (distinct) | 0 | **14** | 7 | 6 |
| Camera coverage rate | 0.0 | **1.0** | 0.94 | **1.0** |
| Motion verbs (distinct) | 7 | **21** | 15 | 17 |
| Motion coverage rate | **1.0** | **1.0** | **1.0** | **1.0** |
| Avg prompt tokens | 28.3 | 14.6 | 14.2 | 10.0 |

## Shot-by-Shot Comparison

### H01

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black round glasses, brown bob hair, cream skin, med...`
- Camera: medium shot, centered composition, desk fills lower third
- Motion: Vee leans forward toward screen, eyes scanning left to right, one hand reaches for keyboard
- Color: warm amber #FFD93D, soft orange #FF9F43, cream background, inviting energy

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman Vee in bright yellow hoodie and round black glasses, warm cream skin t...`
- Camera: medium close-up, rule of thirds, character centered slightly to the right, room visible behind her
- Motion: subtle head tilt towards camera, eyes widen slightly as she looks around confused
- Color: warm amber #FFD93D, cream background, light blue accents for desk

### H02

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, close-up face ...`
- Camera: close-up, face and shoulders, slight low angle, subject center-frame
- Motion: eyes widen progressively, head turns slightly as ad text flashes past, glasses catch light
- Color: bright yellow #FFD93D, white highlights, pop of orange #FF9F43, energetic hype mood

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, social media ad montage flashing across screen, bold text and sparkly effects, Tik...`
- Camera: medium close-up, centered on Vee's face and hands, rule of thirds composition, focused on the interaction between her and the screen
- Motion: subtle head tilt to the right, eyes widen slightly, fingers lightly tap on keyboard in rhythm with the montage
- Color: warm amber #FFD93D, cream background, bold text and sparkly effects, TikTok-style swipe transitions

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses, warm cream ...`
- Camera: medium close-up, rule of thirds, slightly off-center to the left, focusing on Vee's face and hands
- Motion: subtle head tilt towards screen, eyes widen as she types, fingers move quickly over keyboard keys
- Color: warm amber #FFD93D, cream background, sparkly effects in bright contrasting colors

### H03

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, bird's eye vie...`
- Camera: bird's eye view, top-down angle on desk, hands and keyboard prominent
- Motion: fingers tap keyboard rapidly, screen brightens with each keystroke, Vee's head lifts up at the glow
- Color: warm yellow #FFD93D, bright white screen glow, cream desk surface, hopeful anticipation

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses, sitting at ...`
- Camera: medium close-up, rule of thirds, subject centered in left third, minimal negative space, clean desk in foreground, digital screen partially visible at top right, bright yellow hoodie and round black glasses clearly defined
- Motion: subtle head tilt, slight smile widen, relaxed pose with one hand on hip, typing fingers moving lightly over keyboard keys
- Color: warm amber #FFD93D, cream background, digital screen glow in orange #FF6B35, bright yellow hoodie #FFD93D

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, Vee sitting at desk typing on keyboard, looking excited, screen glows when enter i...`
- Camera: medium shot, rule of thirds, centered on Vee's hands and face, slightly tilted angle to show desk setup
- Motion: Vee types quickly with both hands, eyes widen momentarily as she looks at the glowing screen, head tilts slightly towards monitor
- Color: warm amber #FFD93D, cream background, blue glow from computer screen

### M01

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, medium shot at...`
- Camera: medium shot, over-the-shoulder angle, screen visible past Vee's profile
- Motion: hands type a short phrase, pause, eyes narrow slightly at screen result
- Color: cool blue #4A90D9, dark navy #0D1B2A, muted cream, transition from warmth to uncertainty

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman typing on keyboard, round black glasses, brown bob hair, warm cream sk...`
- Camera: medium close-up, centered on Vee's face and shoulders, rule of thirds composition, balanced framing
- Motion: subtle head tilt to the right, eyes widen slightly, slight nod as she looks at her keyboard, fingers tapping lightly on keys
- Color: blue #4A90D9, grey #9CA3AF, muted tones, white background, clean and minimal design

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses, brown bob h...`
- Camera: medium close-up, rule of thirds, off-center left, focused on hands and face
- Motion: slight head tilt to the right, eyes narrow in confusion, typing slowly and hesitantly
- Color: cool blue tones #4A90D9, muted grey background #9CA3AF, warm cream skin tone

### M02

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, medium close-u...`
- Camera: medium close-up, rule of thirds with Vee left-third, screen right-third
- Motion: Vee slowly tilts head, blinks twice, one hand lifts from keyboard in confusion
- Color: cool grey #9CA3AF, muted blue #4A90D9, garish neon pink on screen as contrast, disappointed mood

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman Vee in bright yellow hoodie and round black glasses, brown bob hair, s...`
- Camera: medium close-up, rule of thirds, screen filled with Vee at center, computer screen partially visible in background, off-center composition to the right
- Motion: subtle head tilt, slight nod, eyes widen slightly as Vee looks at the screen, hand resting on hip with a hint of curiosity
- Color: cool uncertainty, blue (#4A90D9) and grey (#9CA3AF) tones, muted background, neon pink and lime green website elements

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character Vee in default expression, bright yellow hoodie, round black...`
- Camera: medium close-up, rule of thirds, centered on Vee's face and upper body, slightly off-center to the right
- Motion: slight head tilt towards the left, eyes looking down at a computer screen, subtle lean forward
- Color: cool uncertainty, muted blue (#4A90D9), grey (#9CA3AF), cream background

### M03

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, close-up face ...`
- Camera: close-up, face filling frame, dead center, shallow depth feel
- Motion: completely still for a beat, then one slow blink, no other movement — frozen disbelief
- Color: desaturated blue-grey #6B7280, muted cream skin, cold flat lighting, emotional flatline

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, round black glasses, brown bob hair, warm cream skin tone, d...`
- Camera: medium shot (head to waist), centered, subject in left-third of frame, rule of thirds composition
- Motion: static, no movement
- Color: cool blue #4A90D9, grey #9CA3AF background, modern font, responsive layout

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses, brown bob h...`
- Camera: medium shot, rule of thirds, centered on Vee's face and upper body
- Motion: none, static pose with eyes wide in surprise for 1.5 seconds
- Color: cool blue #4A90D9, muted grey background #9CA3AF, white details

### M04

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, wide shot pull...`
- Camera: wide shot, zooming out, Vee shrinks as text wall grows, negative space emphasizes overwhelm
- Motion: camera slowly pulls back revealing more text, Vee's shoulders drop progressively
- Color: dark navy #0D1B2A, cold blue #4A90D9 text glow, grey #9CA3AF, oppressive information overload

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on cream bg, Vee sitting at desk, looking confused and slightly puzzled, ...`
- Camera: medium close-up, centered composition, rule of thirds, subject centered in left third, negative space around Vee and tablet
- Motion: subtle head tilt to the right, slight widening of eyes as if reading the screen closely, small nod of head in understanding or confusion
- Color: blue (#4A90D9), grey (#9CA3AF), muted tones, cream background

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in bright yellow hoodie and round black glasses, default expression, s...`
- Camera: medium close-up, rule of thirds, slightly off-center to the left side, slowly zooming out as shot progresses
- Motion: text extends beyond the screen edges, Vee's eyes widen and head tilts slightly to one side in confusion
- Color: cool blue (#4A90D9), muted grey background grid pattern, text is light grey with dark grey outline

### M05

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie with hood partially up, black glasses, brown bob, cre...`
- Camera: medium shot, side angle three-quarter view, chair tilt visible, defeated posture
- Motion: Vee slumps backward in chair, hands slide off keyboard, head drops slightly forward
- Color: muted grey-blue #6B7280, desaturated yellow hoodie, dark background, deflated energy

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character with bright yellow hoodie and round black glasses, brown bob...`
- Camera: medium close-up, centered subject with slight off-center to right-third rule of thirds composition, showing Vee's face and upper body, background blurred for focus on character
- Motion: slight head tilt to the side, eyes looking towards Bee who is shrugging with arms in a relaxed position, hands gently dropping from keyboard, leaning back slightly in chair, turning head to look at Bee
- Color: cool blue #4A90D9, grey #9CA3AF tones, warm cream background, soft lighting

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses looking at a...`
- Camera: medium close-up, off-center composition, rule of thirds, focus on Vee's face and upper body
- Motion: slight head tilt to side, eyes looking down at screen then up towards Bee character shrugging in the background
- Color: cool blue tones #4A90D9, muted grey #9CA3AF, warm cream background

### M06

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, wide shot of d...`
- Camera: wide shot, emphasis on three screens, Vee positioned center-bottom of frame
- Motion: eyes scan slowly from left screen to center to right, arms stay crossed, slight head shake
- Color: cool blue-grey #4A90D9, three different wrong color schemes on screens, dark #0D1B2A, frustration peak

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, three browser windows side by side, each showing different results in distinct lay...`
- Camera: medium close-up, rule of thirds, screen split into three panels, each panel centered in one-third sections
- Motion: subtle head tilt to the right, slight nod of agreement, eyes widen slightly
- Color: cool grey background (#9CA3AF), muted tones, purple accent, text-only result in blue and green, mostly image result in orange and yellow, warm cream highlights

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character Vee sitting at desk looking frustrated, three browser window...`
- Camera: medium shot, rule of thirds, slightly off-center to left third, focusing on the screen with Vee's hand visible on mouse or keyboard
- Motion: slight head tilt towards screen, eyes narrow as she looks at each browser window in turn
- Color: cool blue #4A90D9, grey background #9CA3AF, muted tones reflecting uncertainty and confusion

### K01

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, medium shot, t...`
- Camera: medium shot, Vee slightly off-center left, three panels visible right, dramatic split composition
- Motion: Vee turns from screens toward camera, hand lifts to point at the panels, eyebrow rises
- Color: warm orange accent #FF6B35, red highlight #EF4444 on key elements, dark-to-warm transition, tension building

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, three screen panels side by side, purple-themed panel, text-only panel, mostly ima...`
- Camera: wide shot (full body), centered, rule of thirds, subject in center third, negative space around Vee
- Motion: subtle head tilt to the right, slight smile on face, one hand resting on hip, relaxed pose
- Color: red accent (#EF4444), orange (#FF6B35) highlights, dark background, yellow (#FFD93D) hoodie, warm amber #FFD93D

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character Vee in default expression, bright yellow hoodie, round black...`
- Camera: medium shot, rule of thirds, centering Vee's face and head to chest area, slightly wider than previous shot to show three screens split across the view
- Motion: Vee looks towards each screen in turn, eyes widening slightly as she examines the different results, subtle nod indicating realization
- Color: cool uncertainty with blue accents (#4A90D9), grey tones (#9CA3AF), dark background for contrast, warm cream skin tone

### K02

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, close-up of fa...`
- Camera: close-up, face with screen reflection in glasses lenses, tight framing
- Motion: floating letters materialize one by one in front of her, eyes track each letter, slight forward lean
- Color: orange #FF6B35, red accent #EF4444, warm amber, each letter a different brightness — probability visualization

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, round black glasses, brown bob hair, warm cream skin tone, m...`
- Camera: medium close-up, rule of thirds, centered on Vee, focusing on the three screens in front of her, establishing shot
- Motion: Vee slightly leans forward, head tilts to the left, then right, eyes widen and look between the three screens
- Color: warm amber #FFD93D, cream background, text screens with blue (#4A90D9) and orange (#FF6B35) probability clouds, dice rolls, and letters

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses, brown bob h...`
- Camera: medium close-up, rule of thirds, centered on Vee's face with the screen slightly to one side
- Motion: Vee's eyes tracking the text appearing letter by letter on the screen, subtle head movement towards the center of focus
- Color: dark background with neon red accents (#EF4444), cool blue highlights (#4A90D9), warm cream skin tone, clean white background for the split-screen

### K03

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, medium close-u...`
- Camera: medium close-up, front-facing, head movement is the action, warm side-lighting
- Motion: head swivels left-right-left between three screens, eyes widen gradually, mouth opens slightly with realization
- Color: warm orange #FF9F43, amber #FFD93D, red accent #EF4444, the crack moment — understanding dawning

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, Vee head swiveling between three screens, slight smile, relaxed pose, round black ...`
- Camera: medium close-up, centered subject, rule of thirds, balanced composition
- Motion: subtle head tilt left to right, nod head, look direction change smoothly between screens
- Color: warm amber #FFD93D, cream background, subtle blue accent on screens

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in bright yellow hoodie and round black glasses looking between three ...`
- Camera: medium close-up, rule of thirds, centered on Vee's face as she looks between the screens
- Motion: head swiveling left to right to center, eyes scanning each screen in quick succession
- Color: cool grey background (#9CA3AF), warm cream skin tone, bright yellow hoodie #FFD93D, subtle red accent lines on screens (#EF4444)

### Z01

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses pushed up on forehead, brown bob, crea...`
- Camera: medium shot, centered, Vee standing tall, desk as backdrop, bright even lighting
- Motion: Vee stands up from chair, pushes glasses up, holds up three fingers confidently
- Color: vibrant yellow #FFD93D, warm orange #FF9F43, bright cream, confident resolution energy

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, Vee standing confidently at her desk, round black glasses, brown bob hair styled i...`
- Camera: medium close-up, rule of thirds, subject centered on Vee, slightly off-center to right-third for negative space, clean medium shot
- Motion: subtle head tilt to the left as Vee speaks, slight nod while counting fingers, hands relaxed and gesturing with three fingers raised in a friendly manner
- Color: warm amber #FFD93D background, cream desk with white details, inviting and energetic

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, brown bob hair, warm cream skin tone, standing at desk with minimal detail, friend...`
- Camera: medium shot, rule of thirds, Vee positioned on right-third, white background, centered composition for clarity and focus
- Motion: subtle head nod, eyes looking down then up at viewer, slight arm movement as if pointing to each action in sequence
- Color: warm amber #FFD93D, cream background, vibrant palette, bright and inviting

### Z02

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, close-up of de...`
- Camera: close-up, overhead angle on desk, sticky note center-frame, Vee's smile at top
- Motion: hand places sticky note on desk, presses it down, fingers tap each number
- Color: bright yellow #FFD93D sticky note, warm cream desk, orange accent, organized action energy

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, round black glasses, and brown bob hair, pointing at a sticky note on the desk tha...`
- Camera: medium close-up, rule of thirds, subject centered, isolated on white background, cursor and sticky note placed at one-third bottom center
- Motion: Vee subtly tilts her head towards the sticky note as she points to it, eyes wide with interest. The sticky note slightly shifts position under the cursor's movement.
- Color: warm amber #FFD93D, cream background, subtle golden highlights on Vee and sticky note, clean lines and flat color fills

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman character in bright yellow hoodie and round black glasses sitting at d...`
- Camera: medium shot, rule of thirds, Vee's desk setup in focus, slightly off-center composition
- Motion: cursor moving towards the computer screen, hand gently reaches for sticky note and places it nearby
- Color: vibrant palette, bright yellow (#FFD93D), warm cream background, soft orange highlights

### Z03

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses, brown bob, cream skin, medium shot fr...`
- Camera: medium shot, side angle three-quarter, screen glow on face, focused composition
- Motion: fingers type steadily, eyes half-closed in concentration, screen content scrolls upward
- Color: warm amber #FFD93D, soft blue screen glow #3B82F6, cream, intense productive focus

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, round black glasses, brown bob hair, ...`
- Camera: medium close-up, centered on Vee's face, rule of thirds composition, subject left-third, minimal negative space
- Motion: subtle head tilt to the right, slight nod as she writes, eyes narrowing in concentration, pen moves from left to right across sticky note
- Color: warm amber #FFD93D, cream background, clean and simple design, no gradients or shading

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, young woman at desk typing on keyboard, bright yellow hoodie, round black glasses,...`
- Camera: medium close-up, rule of thirds, focused on Vee's hands and desk area, slightly tilted angle to show depth of workspace
- Motion: subtle head movement towards keyboard, eyes looking down at screen, fingers tapping keys, hand moves to hover over enter button
- Color: warm amber #FFD93D, cream background, white keyboard, soft shadows indicating slight desk elevation

### Z04

**Baseline**:
- Prompt: `v3ct0r style, simple flat vector art, isolated on white bg, young woman character, bright yellow hoodie, round black gla...`
- Camera: —
- Motion: —
- Color: —

**A: Claude**:
- Prompt: `v3ct0r style, simple flat vector art, young woman in yellow hoodie, black glasses with star highlight in lens, brown bob...`
- Camera: medium shot, slight low angle for heroic feel, golden backlight, Vee center-frame
- Motion: Vee's eyes widen seeing result, arms lift with excitement, pen hand moves to write on sticky note
- Color: golden #F59E0B, bright yellow #FFD93D, warm white, full vibrant palette — triumphant resolution

**B: Ollama 7b**:
- Prompt: `v3ct0r style, simple flat vector art, round black glasses, brown bob hair, warm cream skin tone, writing on a sticky not...`
- Camera: medium close-up, rule of thirds, subject centered, desk in negative space, clean and modern office environment, cream background
- Motion: subtle head tilt to the left, slight nod while writing, pen moves smoothly across sticky note surface, soft animation of text appearing on sticky note, warm amber #FFD93D color scheme, subtle arms lifting pen to start writing
- Color: warm amber #FFD93D, cream background, white sticky note with dark ink pen

**C: Ollama 14b**:
- Prompt: `v3ct0r style, simple flat vector art, round black glasses, brown bob hair, warm cream skin tone, minimal detail, clean d...`
- Camera: medium shot, centered, rule of thirds composition, desk setup with computer screen visible in background
- Motion: Vee leans slightly forward to look at the screen, then reaches for a pen, pauses briefly before writing on a sticky note
- Color: warm amber #FFD93D, white background, golden accents (#F59E0B), inviting and vibrant palette

## Winner by Metric

- **Diversity (Jaccard avg)**: B: Ollama 7b (0.763)
- **Trigger word rate**: Baseline (v9 template) (1.0)
- **Banned words total**: Baseline (v9 template) (0)
- **Mood color match rate**: A: Claude (0.88)
- **Camera terms (distinct)**: A: Claude (14)
- **Camera coverage rate**: A: Claude (1.0)
- **Motion verbs (distinct)**: A: Claude (21)
- **Motion coverage rate**: Baseline (v9 template) (1.0)

---
Generated by `compare_prompts.py`
