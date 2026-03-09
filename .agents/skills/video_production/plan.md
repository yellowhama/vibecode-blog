# /video-plan — Video Production Planning

Interactive planning session for a new video production run.

## Steps

### 1. Read the Script
Read the target script file and analyze structure:
- How many Acts/Scenes?
- Total narration word count → estimated duration
- Key dramatic beats and transitions

**File:** `systems/video/planning/full_youtube/phase1_act1_script_and_scenes.md`

### 2. Extract Characters
Run character extraction to identify all characters:

```bash
cd /mnt/e/vibecode-blog/systems/video
python3 pipeline/scripts/character_extractor.py \
  --script planning/full_youtube/phase1_act1_script_and_scenes.md \
  --prompts planning/full_youtube/phase1_act1_video_prompts.md \
  --output pipeline/manifests/characters.json
```

Review the output and discuss character designs with the user.

### 3. Generate Character Sheets (if ComfyUI running)
Generate anchor frames for visual consistency:

```bash
python3 pipeline/scripts/character_sheet_generator.py \
  --characters pipeline/manifests/characters.json \
  --output-dir assets/characters \
  --server http://127.0.0.1:8188
```

### 4. Plan Shot Distribution
Calculate YouTube-optimal pacing and generate manifest:

```bash
python3 pipeline/scripts/shot_planner.py \
  --script planning/full_youtube/phase1_act1_script_and_scenes.md \
  --prompts planning/full_youtube/phase1_act1_video_prompts.md \
  --characters pipeline/manifests/characters.json \
  --target-duration 300 \
  --output pipeline/manifests/phase1_act1_planned.json
```

Present the pacing summary:
- Total shots and duration
- Shots per minute (target: 8-12)
- Character generation groups
- Hero shot identification

### 5. Review Production Guide
Reference `AI_VIDEO_PRODUCTION_GUIDE.md` for:
- IP-Adapter availability (run `check_comfyui_nodes.py`)
- Claymation prompt templates
- Transition planning
- Color grading strategy

### 6. User Approval
Present the complete plan and get user go/no-go before rendering.
