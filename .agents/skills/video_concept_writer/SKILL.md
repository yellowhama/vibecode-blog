---
name: video_concept_writer
description: Reads a blog post or thread and writes a high-level video script with narration and core visual metaphors, prior to the storyboard phase.
---

# Video Concept Writer Skill

This skill guides the agent in interpreting text content (blogs, threads) and translating it into a **High-Level Video Script and Concept**. The output of this skill is a "Concept Document" that will later be used by the `video_storyboard_planner` skill to generate a detailed, shot-by-shot storyboard.

## Process

1. **Content Digestion**: 
   - Read and fully understand the source content (the user's blog post or Twitter thread).
   - Identify the core message, the emotional beats, and the intended audience.

2. **Audio & Narration Strategy (Non-Lingual / Gibberish)**:
   - The characters in the video MUST remain **non-lingual** (they do not speak real words, similar to Minions or classic stop-motion characters).
   - Instead of writing a spoken script for the characters, write **"Gibberish/Sound Effect Cues"** for the on-screen action (e.g. *[Frustrated squawking]*, *[Confused hum]*, *[Happy clicking]*).
   - **External Voiceover (VO):** The actual intellectual message of the blog post will be delivered via an external, disembodied Voiceover (VO) track laid over the video. 
   - Write the exact Voiceover (VO) script that aligns with the visual action. This VO should be concise, punchy, and follow the branding guidelines (`branding/narrative.md` and `branding/voice.md`).

3. **High-Level Metaphor Design**:
   - Invent **Visual Metaphors** that will play out on screen to accompany the narration. Do not be overly literal.
   - *Example:* If the text is about "the chaotic nature of legacy code," the metaphor might be "a rapidly multiplying monster made of black spaghetti strings." If the text is about "building the architecture," the metaphor might be "molding a structural robot out of raw clay."
   - Describe these metaphors in broad strokes. Do NOT worry about camera angles, cut timings, or specific T2I/I2V shot splits at this stage. Just focus on what the audience should *feel* and *see* generally.

4. **Visual DNA enforcement (Skeptical Claymation x Whiteboard Flow)**:
   - All proposed metaphors must fit within the project's base aesthetic: **Aardman-style claymation textures set against empty, solid Off-White (`#FDFCF0`) backgrounds.** 
   - Ensure the setting feels like a "3D Whiteboard" – no clutter, no scenery, just the characters and objects necessary for the metaphor.
   - Characters: Sleep-deprived, skeptical clay figures.
   - Colors: Muted cocoa brown (`#2D1D19`) for characters, accented by Musu Yellow (`#FFD166`) or bright red for action items, AI agents, bugs, or errors.

## Output Constraints

Your final output must be a Markdown Document containing:
1. **Title & Theme:** A catchy title and a 1-sentence summary of the core metaphor.
2. **Character & Prop Concepts:** Brief descriptions of what the main character and key metaphor props (e.g. the spaghetti monster) look like in the claymation style.
3. **The Script Sequence:** A section-by-section breakdown containing:
   - **Narration:** The exact words to be spoken.
   - **Visual Concept:** A paragraph describing what happens on screen during this narration.

**Do NOT include camera angles or `[Shot X.Y]` annotations. That is the job of the storyboard planner.**
