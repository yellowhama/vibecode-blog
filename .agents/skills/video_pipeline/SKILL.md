---
name: video_pipeline
description: Executes the end-to-end video production pipeline by designing characters, planning cinematic shots, and preparing prompts for image-to-video tools.
---

# Video Production Pipeline Skill

This skill guides the agent in orchestrating the creation of AI-generated videos (2D or 3D) based on existing blog posts or Twitter threads. The workflow currently focuses on generating text assets (prompts, scripts, and shot lists) to be used with external video/audio generation tools (midjourney, sora, elevenlabs, etc.).

## Process

1. **Story & Metaphor Design**: 
   - Read the source content (blog or thread).
   - Write a compelling video script that relies on **Narration and Visual Metaphor** (e.g. building a robot out of clay representing building code, a tangled mess representing spaghetti code). Do not be overly literal.
   - Separate the script into "Narration" (Voiceover) and "Visual" (Action happening on screen).

2. **Visual DNA enforcement (Skeptical Claymation x Whiteboard Flow)**:
   - All videos must share the same base aesthetic: **Aardman-style claymation textures set against empty, solid Off-White (`#FDFCF0`) backgrounds.** 
   - Ensure the setting feels like a "3D Whiteboard" – no clutter, no scenery, just the characters and objects necessary for the metaphor.
   - Characters: Sleep-deprived, skeptical clay figures.
   - Colors: Muted cocoa brown (`#2D1D19`) for characters, accented by Musu Yellow (`#FFD166`) or bright red for action items, AI agents, bugs, or errors.
   - Output the character descriptions as an independent reference sheet before the prompt lists.

3. **Shot List & Cinematic Angles**: 
   - Break down the script into a scene-by-scene shot list.
   - Use dynamic camera angles (Low, High, Dutch, Over-the-shoulder, Extreme Close Up) depending on the emotional beat of the story.
   - **Crucial Rule:** The background must always remain an empty void/solid color. Objects and characters should "drop in," "be molded," or "appear" as the narration progresses.  

4. **Motion & Prompt Generation (Continuity Workflow)**:
   - To solve the disconnected scene issue, you MUST use the **Continuity Generation** workflow for motion prompts (for tools like Sora/Gen-3/Nano Banana).
   - **Shot 1 (Standalone):** Generate a complete text-to-image prompt to establish the scene, character, and background from scratch.
   - **Shot 2 onwards (Continuity):** You MUST write `[CONTINUITY PROMPT: Use the last frame of the previous shot as the First Frame Image Reference]` at the very beginning of the prompt. 
   - For continuity shots, do NOT re-describe the entire character or background. Only describe the *new action, motion, or object appearing* (e.g., "A yellow clay piece drops from the sky"). This ensures the AI keeps the character and environment perfectly consistent.
   - *Example Base Style Prompt to always include for Standalone shots:*
     `Minimalist stop-motion claymation, Aardman studio style. A highly textured clay figure with chubby and stubby proportions wearing an oversized hoodie in a vast, empty Off-White solid background. No room details, extremely simple minimalist environment, resembling a 3D whiteboard animation. Soft matte lighting. The character's skin is bright Musu Yellow (#FFD166) clay, and the hoodie is muted cocoa brown colored clay (#2D1D19). CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. The character is completely silent, mouth closed, no speaking, nonverbal, nonlingual, no lip-sync.`

## Resources
You must follow the branding guidelines when writing the video script:
- `branding/narrative.md`
- `branding/voice.md`
