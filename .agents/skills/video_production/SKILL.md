---
name: video_production
description: Full video production pipeline — from script to YouTube-ready video. Orchestrates character design, shot planning, rendering, QA, and publishing.
---

# Video Production Pipeline Skill

End-to-end AI video production for claymation YouTube content.

## Sub-Skills

1. **plan** (`plan.md`) — Interactive video planning session
2. **review** (`review.md`) — Render result review and approval
3. **publish** (`publish.md`) — Final review and YouTube upload

## Full Production Flow

```
/video-plan  →  character_extractor.py  →  character_sheet_generator.py
                                              ↓
                                     shot_planner.py  →  manifest.json
                                              ↓
                              run_end_to_end_video_pipeline.py
                                  (render → evaluate → auto-correct)
                                              ↓
/video-review  →  approve/reject  →  qa_correction_agent.py (if needed)
                                              ↓
                                package_for_youtube.py
                                              ↓
/video-publish  →  final check  →  youtube_upload.py
```

## Resources

- Production Guide: `systems/video/pipeline/AI_VIDEO_PRODUCTION_GUIDE.md`
- Script: `systems/video/planning/full_youtube/phase1_act1_script_and_scenes.md`
- Prompts: `systems/video/planning/full_youtube/phase1_act1_video_prompts.md`
- Characters: `systems/video/pipeline/manifests/characters.json`
- Planned Manifest: `systems/video/pipeline/manifests/phase1_act1_planned.json`

## Key Scripts

| Script | Purpose |
|--------|---------|
| `character_extractor.py` | Extract characters from script (regex, $0) |
| `character_sheet_generator.py` | Generate 4-angle anchor frames via ComfyUI |
| `shot_planner.py` | Build optimized manifest (character batching, YouTube pacing) |
| `qa_correction_agent.py` | Auto-diagnose and fix failed shots |
| `check_comfyui_nodes.py` | Verify IP-Adapter/ControlNet availability |
| `run_video_production.py` | Top-level orchestrator |
