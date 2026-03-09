---
name: video_storyboard_planner
description: Reads blog or thread content and designs a 'Skeptical Claymation x Whiteboard Flow' storyboard with narration and split shots (T2I/I2V).
---

# Video Storyboard Planner Skill

This skill guides the agent in interpreting text content (blogs, threads) and translating it into a highly structured storyboard. The output of this skill is a "Storyboard Document" that will later be used by the `comfyui_video_pipeline` skill to generate actual video prompts.

## Process

1. **Story & Metaphor Design**: 
   - Read the source content.
   - Write a compelling video script that relies on **Narration and Visual Metaphor**. Never be overly literal (e.g., if discussing "spaghetti code", visualize a tangled monster; if discussing "building", visualize a robot being molded).
   - Separate the script into "Narration" (Voiceover) and "Visual" (Action happening on screen).

2. **Visual DNA enforcement (Skeptical Claymation x Whiteboard Flow)**:
   - All videos must share the same base aesthetic: **Aardman-style claymation textures set against empty, solid Off-White (`#FDFCF0`) backgrounds.** 
   - Ensure the setting feels like a "3D Whiteboard" – no clutter, no scenery, just the characters and objects necessary for the metaphor.
   - Characters: Sleep-deprived, skeptical clay figures.
   - Colors: Muted cocoa brown (`#2D1D19`) for characters, accented by Musu Yellow (`#FFD166`) or bright red for action items, AI agents, bugs, or errors.

3. **Shot Splitting for ComfyUI (Crucial Step)**:
   - Because the final video will be generated via a ComfyUI T2I -> I2V pipeline, you must break down the "Visual" actions into highly specific, manageable shots.
   - **T2I (Text-to-Image) Shots:** Used to establish a new scene, character pose, or major camera angle change. (e.g., "Character sitting at desk looking angry.")
   - **I2V (Image-to-Video) Shots:** Used to describe the physical motion that happens *immediately after* the preceding T2I or I2V shot. (e.g., "Steam blows out of the character's head.")
   - Format the storyboard using these explicit tags: `[Shot X.Y - T2I/I2V]`.

## Output Constraints

Your final output must be a Markdown storyboard file containing:
1. The Narration text.
2. The exact breakdown of T2I and I2V visual shots.
3. The estimated duration of the sequence.

## Resources
You must follow the branding guidelines when writing the video script metaphors:
- `branding/narrative.md`
- `branding/voice.md`
