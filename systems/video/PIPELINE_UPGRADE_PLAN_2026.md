# Pipeline Upgrade Plan 2026: Fury-Driven Video (v2.0)

This document outlines the refactoring of the `vibecode-blog` video production pipeline to align with the Larry/Bukowski/Nike branding and the Narrative Context Protocol (NCP).

## 1. Context & Branding Integration
- **SSOT**: `branding/storyform.json` is the master DNA.
- **Narrative Logic**: 3-Act structure (Fury → Mess → Insight).
- **Tone**: Bukowski Grit (60%) + Indie Hacker (30%) + Product (10%).

## 2. Technical Roadmap

### Phase A: Scripting & Planning (The "Fountain" Shift)
- **Task A.1**: Refactor `adapt_blog_to_script.py`.
    - Output: `.fountain` format.
    - Logic: Use NCP storyform to structure the scene beats.
- **Task A.2**: Refactor `shot_planner.py`.
    - Output: `shots.json` with visual prompts + audio cues.
    - Logic: Enforce "Nike Rule" (Action > Dialogue).

### Phase B: Audio Automation (The "Vibe" Matcher)
- **Task B.1**: Update `audio_catalog.py`.
    - Add `get_bgm_for_act(act_id)` helper.
- **Task B.2**: Update `video_assembler.py`.
    - Logic: Auto-assign BGM based on the current shot's narrative stage (Act 1, 2, or 3).
    - Logic: Inject `clay_squish` SFX for character movement shots.

### Phase C: QA & Evaluation (The "Hard Gate")
- **Task C.1**: Finalize `evaluate_renders.py`.
    - Ensure `scenedetect` results flag `BadCut` in the final `evaluations_summary.json`.
- **Task C.2**: Update `package_for_youtube.py`.
    - Logic: Block assembly if `BadCut` count > 0 in strict mode.

### Phase D: Orchestration (The "English" Trigger)
- **Task D.1**: Update `run_blog_to_video_pipeline.py`.
    - Logic: Handle `--language en` using the English NCP rules and English TTS backends.

## 3. Implementation Schedule

| Step | Task | Script to Modify |
| :--- | :--- | :--- |
| **1** | Fountain Scripting | `adapt_blog_to_script.py` |
| **2** | Shot Planning | `shot_planner.py` |
| **3** | Audio Logic | `audio_catalog.py` & `video_assembler.py` |
| **4** | QA Hard Gates | `evaluate_renders.py` & `package_for_youtube.py` |
| **5** | E2E Testing | `run_blog_to_video_pipeline.py` |

---

## 4. Final Goal
A fully autonomous pipeline where dropping an English blog post (`.md`) results in a branded, high-quality, 3-Act claymation video with zero manual intervention.
