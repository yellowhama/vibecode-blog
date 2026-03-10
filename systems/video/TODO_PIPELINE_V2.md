# Pipeline v2.1 Implementation TODO (YouTube Optimized & Agent-Mediated)

## Phase A: Narrative & Scripting (Skill: `script_storyboard_expert`)
- [x] **Task A.1**: Refactor `adapt_blog_to_script.py` into a **High-Context Prompt Generator**.
- [x] **Task A.2**: Implement **Stage 0: The Result Hook** logic in the system prompt.
- [x] **Task A.3**: Define **Agent Workflow** for script generation. (Completed & Tested)

## Phase B: Visual & Shot Planning (Skill: `ai-video-production-master`)
- [x] **Task B.1**: Refactor `shot_planner.py` to parse Agent-generated Fountain scripts.
- [x] **Task B.2**: Update `audio_catalog.py` to support 4-Act structure.
- [x] **Task B.3**: Implement automatic SFX injection logic.

## Phase C: Audio & Media Assembly (Skills: `media-processing`, `ffmpeg`)
- [x] **Task C.1**: Finalize `scenedetect` integration in `evaluate_renders.py`.
- [x] **Task C.2**: Refactor `video_assembler.py` for narrative-aware audio injection.
- [x] **Task C.3**: Implement sidechain ducking logic using `ffmpeg` filters.

## Phase D: Quality Gates & Packaging
- [x] **Task D.1**: Finalize **PySceneDetect** integration in `evaluate_renders.py`.
- [x] **Task D.2**: Implement **Automated Thumbnail Generation**.
- [x] **Task D.3**: Refactor `run_blog_to_video_pipeline.py` to orchestrate the Agent-Mediated DAG.

## Phase E: Audio-Visual Sync & Rendering (CURRENT FOCUS)
- [ ] **Task E.1**: Implement `sync_shots_to_audio.py` helper.
    - [ ] Logic: Read `timing_alignment.json` and update `shots_planned.json` durations.
    - [ ] Logic: Add 0.2s padding/buffer per shot for smoother transitions.
- [ ] **Task E.2**: Implement **Subtitle Burn-in** stage.
    - [ ] Logic: Use `ffmpeg` to overlay `subtitles.srt` onto the final assembled video.
- [ ] **Task E.3**: Execute End-to-End Render for `act1-en`.
    - [ ] Trigger ComfyUI batch render using the synchronized manifest.

---
*Updated: 2026-03-10*
*Status: Phase E Implementation Started*
