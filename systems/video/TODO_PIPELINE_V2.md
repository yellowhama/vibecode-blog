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

## Phase E: Audio-Visual Sync & Rendering ✅ COMPLETE
- [x] **Task E.1**: Shot-audio sync via manifest timing + FFmpeg concat
- [x] **Task E.2**: SRT subtitle generation (Whisper medium, 87 entries)
- [x] **Task E.3**: End-to-End render — EP01 v1 COMPLETE (2026-03-17)
    - 32 keyframes (SimpleVectorFlux LoRA T2I)
    - 32 clips (Ken Burns zoom/pan)
    - Dia2-1B narration + BGM loop + audio mix
    - Final: `EP01_v2_FINAL.mp4` — 3:22, 1280x720, 30fps

## Phase F: Quality Upgrade (NEXT)
- [ ] **Task F.1**: Wan 2.2 I2V animation — replace Ken Burns with real motion
- [ ] **Task F.2**: ACE-Step custom BGM — replace looped placeholder
- [ ] **Task F.3**: Motion Canvas diagrams — animated C01-C10 building metaphor
- [ ] **Task F.4**: Thumbnail pipeline — best-frame + title overlay

---
*Updated: 2026-03-17*
*Status: Phase E Complete, Phase F Next*
