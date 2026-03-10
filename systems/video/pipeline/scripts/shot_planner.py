#!/usr/bin/env python3
"""Intelligent shot planner v2.1: Fountain-based planning with YouTube Retention integration.

Parses .fountain scripts and narration_manifest.json to produce a shots.json that:
1. Supports 4-Act structure (HOOK, FURY, MESS, INSIGHT)
2. Enforces the "Nike Rule" (Action > Dialogue)
3. Maps visual goals to specific ComfyUI models (Wan 2.1 / Hunyuan)
4. Injects narrative_stage metadata for audio automation
5. Groups shots by character for generation consistency
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_MODEL_HUNYUAN = "hunyuanvideo1.5_480p_i2v_step_distilled_fp8_scaled.safetensors"
DEFAULT_MODEL_WAN_T2V = "wan2.1_t2v_1.3B_fp16.safetensors"
DEFAULT_RESOLUTION = "832x480"

STYLE_BASE = (
    "Stop-motion claymation, Aardman studio style. "
    "Soft matte studio lighting. Heavy fingerprint textures, matte finish."
)
CRITICAL_NEGATIVES = (
    "text, subtitles, watermark, logo, speech bubble, blurry, deformed, "
    "ugly, oversaturated, photorealistic, CGI, smooth animation, live action, "
    "plastic sheen, multiple views, turnaround sheet"
)

# ---------------------------------------------------------------------------
# Heuristics
# ---------------------------------------------------------------------------

def _detect_primary_character(visual: str) -> str:
    """Guess the primary character for generation grouping."""
    v_lower = visual.lower()
    if "robot" in v_lower or "stubby" in v_lower:
        return "yellow_robot"
    if "monster" in v_lower or "spider" in v_lower:
        return "spider_monster"
    if "character" in v_lower or "man" in v_lower or "he" in v_lower:
        return "dev_protagonist"
    return "environment"

# ---------------------------------------------------------------------------
# Planning Logic
# ---------------------------------------------------------------------------

def plan_shots_v2_1(
    manifest_path: Path,
    target_duration: int
) -> Dict[str, Any]:
    """Build optimized shot list from NCP manifest."""
    
    # Load JSON manifest (SSOT from adapt_blog_to_script.py)
    manifest_data = json.loads(manifest_path.read_text(encoding="utf-8"))
    phases = manifest_data.get("phases", [])
    
    shots = []
    seed_base = 6000000
    total_estimated_dur = 0.0
    
    for phase in phases:
        stage = phase.get("phase", "UNKNOWN")
        for i, beat in enumerate(phase.get("beats", [])):
            shot_id = beat.get("beat_id", f"S{len(shots)+1:03d}")
            # Est duration from manifest or default
            dur = beat.get("estimated_duration_sec", 5.0)
            
            # --- NIKE RULE ENFORCEMENT ---
            narration = beat.get("narration_text", "")
            words = len(narration.split())
            nike_violation = False
            if words > (dur * 2.5): # Strict limit: 2.5 words per second
                nike_violation = True
                print(f"[NIKE RULE VIOLATION] Shot {shot_id}: {words} words for {dur}s. Too much talking.")

            # --- MODEL SELECTION (ai-video-production-master skill) ---
            visual = beat.get("visual_goal", "")
            # Prefer Wan 2.1 for complex T2V, Hunyuan for I2V/Simple
            model = DEFAULT_MODEL_HUNYUAN
            if any(k in visual.lower() for k in ["whiteboard", "abstract", "complex movement"]):
                model = DEFAULT_MODEL_WAN_T2V

            shot = {
                "shot_id": shot_id,
                "narrative_stage": stage,
                "scene": beat.get("fountain_scene_heading", "INT. SCENE - DAY"),
                "purpose": f"{stage} - {shot_id}",
                "prompt_positive": f"{STYLE_BASE} {visual}",
                "prompt_negative": CRITICAL_NEGATIVES,
                "duration_sec": dur,
                "narration": narration,
                "model": model,
                "seed": seed_base + len(shots),
                "resolution": DEFAULT_RESOLUTION,
                "visual_intensity": beat.get("visual_intensity", "medium"),
                "generation_group": _detect_primary_character(visual),
                "nike_rule_status": "FAIL" if nike_violation else "PASS",
                "transition_type": "fade" if i == 0 and len(shots) > 0 else None
            }
            shots.append(shot)
            total_estimated_dur += dur

    return {
        "project_id": manifest_data.get("project_id", "v2_1_production"),
        "total_shots": len(shots),
        "total_duration_sec": round(total_estimated_dur, 1),
        "strategy": "YouTube Retention v2.1",
        "shots": shots
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True, help="narration_manifest.json")
    parser.add_argument("--target-duration", type=int, default=180)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    planned = plan_shots_v2_1(args.manifest, args.target_duration)
    
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(planned, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[OK] V2.1 Planned manifest: {planned['total_shots']} shots, {planned['total_duration_sec']}s -> {args.output}")

if __name__ == "__main__":
    main()
