#!/usr/bin/env python3
"""Top-level video production orchestrator.

Runs the full production pipeline from script to YouTube-ready package:
1. Extract characters from script
2. Generate character anchor frames (ComfyUI)
3. Plan shots with character batching + YouTube pacing
4. Render + evaluate + auto-correct
5. Package for YouTube

Usage:
    python run_video_production.py \
        --script planning/full_youtube/phase1_act1_script_and_scenes.md \
        --prompts planning/full_youtube/phase1_act1_video_prompts.md \
        --target-duration 300 \
        --auto-correct

    # Resume from a specific stage:
    python run_video_production.py --resume-from render ...

    # Skip character sheet generation (no ComfyUI needed):
    python run_video_production.py --skip-character-sheets ...
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _run(cmd: list[str], label: str = "") -> str:
    """Run a subprocess and return stdout. Raises on failure."""
    display = label or " ".join(str(c) for c in cmd[:4]) + "..."
    print(f"\n{'='*60}")
    print(f"[STAGE] {display}")
    print(f"{'='*60}")
    t0 = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    elapsed = time.time() - t0
    if result.stdout:
        print(result.stdout.strip())
    if result.returncode != 0:
        print(f"[FAIL] {display} (exit {result.returncode}, {elapsed:.1f}s)")
        if result.stderr:
            print(result.stderr[-1000:])
        raise RuntimeError(f"Stage failed: {display}")
    print(f"[OK] {display} ({elapsed:.1f}s)")
    return result.stdout


def _save_checkpoint(checkpoint_path: Path, stage: str, data: dict) -> None:
    """Save progress checkpoint for resume support."""
    checkpoint = {}
    if checkpoint_path.exists():
        checkpoint = json.loads(checkpoint_path.read_text(encoding="utf-8"))
    checkpoint[stage] = {
        "completed_at": datetime.now().isoformat(),
        **data,
    }
    checkpoint_path.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False), encoding="utf-8")


def _load_checkpoint(checkpoint_path: Path) -> dict:
    if checkpoint_path.exists():
        return json.loads(checkpoint_path.read_text(encoding="utf-8"))
    return {}


STAGES = ["extract", "character_sheets", "plan", "render", "correct", "package"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Full video production orchestrator")

    # Input files
    parser.add_argument("--script", type=Path, required=True, help="Script markdown")
    parser.add_argument("--prompts", type=Path, required=True, help="Video prompts markdown")

    # Production parameters
    parser.add_argument("--target-duration", type=int, default=300, help="Target video duration (seconds)")
    parser.add_argument("--server", default="http://127.0.0.1:8188", help="ComfyUI server")

    # Workflow control
    parser.add_argument("--resume-from", choices=STAGES, default=None, help="Resume from specific stage")
    parser.add_argument("--skip-character-sheets", action="store_true", help="Skip anchor frame generation")
    parser.add_argument("--auto-correct", action="store_true", help="Auto-correct failed shots")
    parser.add_argument("--auto-correct-max-attempts", type=int, default=3)

    # Output paths
    parser.add_argument("--output-dir", type=Path, default=None, help="Production output directory")
    parser.add_argument("--video-root", type=Path, default=None)

    # Existing manifest override
    parser.add_argument("--manifest-override", type=Path, default=None, help="Use existing manifest (skip plan)")

    # Render options passthrough
    parser.add_argument("--workflow", type=Path, default=None)
    parser.add_argument("--bindings", type=Path, default=None)
    parser.add_argument("--force-render", action="store_true")
    parser.add_argument("--skip-evaluate", action="store_true")
    parser.add_argument("--evaluate-provider", default="auto")
    parser.add_argument("--evaluate-label", default=None)

    # Package options
    parser.add_argument("--title", default=None)
    parser.add_argument("--intro-text", default=None)
    parser.add_argument("--outro-text", default="vibecode.town")
    parser.add_argument("--subtitles", action="store_true")
    parser.add_argument("--audio-ducking", action="store_true")
    parser.add_argument("--color-normalize", action="store_true")

    args = parser.parse_args()

    # Resolve paths
    scripts_dir = Path(__file__).resolve().parent
    video_root = args.video_root or scripts_dir.parent.parent  # content/video
    output_dir = args.output_dir or (video_root / "output" / "production" / datetime.now().strftime("%Y%m%d_%H%M%S"))
    output_dir.mkdir(parents=True, exist_ok=True)

    checkpoint_path = output_dir / "checkpoint.json"
    checkpoint = _load_checkpoint(checkpoint_path)

    # Determine start stage
    start_idx = 0
    if args.resume_from:
        start_idx = STAGES.index(args.resume_from)
        print(f"[RESUME] Starting from stage: {args.resume_from}")

    # ── Stage 1: Extract Characters ──────────────────────────
    characters_path = output_dir / "characters.json"
    if start_idx <= STAGES.index("extract"):
        _run([
            sys.executable, str(scripts_dir / "character_extractor.py"),
            "--script", str(args.script),
            "--prompts", str(args.prompts),
            "--output", str(characters_path),
        ], "Extract characters from script")
        _save_checkpoint(checkpoint_path, "extract", {"characters": str(characters_path)})
    elif "extract" in checkpoint:
        characters_path = Path(checkpoint["extract"]["characters"])

    # ── Stage 2: Character Sheets ────────────────────────────
    character_assets_path = output_dir / "character_index.json"
    if start_idx <= STAGES.index("character_sheets") and not args.skip_character_sheets:
        char_assets_dir = video_root / "assets" / "characters"
        try:
            _run([
                sys.executable, str(scripts_dir / "character_sheet_generator.py"),
                "--characters", str(characters_path),
                "--output-dir", str(char_assets_dir),
                "--server", args.server,
            ], "Generate character anchor frames")
            # Copy index to output dir
            idx = char_assets_dir / "character_index.json"
            if idx.exists():
                import shutil
                shutil.copy2(idx, character_assets_path)
        except RuntimeError:
            print("[WARN] Character sheet generation failed (ComfyUI may be offline). Continuing without anchors.")
        _save_checkpoint(checkpoint_path, "character_sheets", {"index": str(character_assets_path)})
    elif "character_sheets" in checkpoint:
        character_assets_path = Path(checkpoint["character_sheets"]["index"])

    # ── Stage 3: Shot Planning ───────────────────────────────
    manifest_path = output_dir / "planned_manifest.json"
    if args.manifest_override and args.manifest_override.exists():
        manifest_path = args.manifest_override
        print(f"[OK] Using manifest override: {manifest_path}")
    elif start_idx <= STAGES.index("plan"):
        plan_cmd = [
            sys.executable, str(scripts_dir / "shot_planner.py"),
            "--script", str(args.script),
            "--prompts", str(args.prompts),
            "--characters", str(characters_path),
            "--target-duration", str(args.target_duration),
            "--output", str(manifest_path),
        ]
        if character_assets_path.exists():
            plan_cmd.extend(["--character-assets", str(character_assets_path)])
        _run(plan_cmd, "Plan shots with character batching")
        _save_checkpoint(checkpoint_path, "plan", {"manifest": str(manifest_path)})
    elif "plan" in checkpoint:
        manifest_path = Path(checkpoint["plan"]["manifest"])

    # ── Stage 4: Render + Evaluate ───────────────────────────
    if start_idx <= STAGES.index("render"):
        e2e_py = scripts_dir / "run_end_to_end_video_pipeline.py"

        # Determine workflow and bindings
        workflow = args.workflow
        bindings = args.bindings
        if not workflow:
            workflow = video_root / "workflows" / "api" / "hunyuan_i2v_c_test_api.json"
            if not workflow.exists():
                workflow = video_root / "workflows" / "api" / "wan_t2v_api.json"
        if not bindings:
            bindings = video_root / "pipeline" / "bindings" / "hunyuan_i2v_c_test_bindings.json"
            if not bindings.exists():
                bindings = video_root / "pipeline" / "bindings" / "wan_t2v_text_to_video_bindings.json"

        render_cmd = [
            sys.executable, str(e2e_py),
            "--manifest", str(manifest_path),
            "--workflow", str(workflow),
            "--bindings", str(bindings),
            "--output-root", str(video_root / "output" / "renders"),
            "--server", args.server,
        ]
        if args.force_render:
            render_cmd.append("--force-render")
        if args.skip_evaluate:
            render_cmd.append("--skip-evaluate")
        if args.evaluate_provider != "auto":
            render_cmd.extend(["--evaluate-provider", args.evaluate_provider])
        if args.evaluate_label:
            render_cmd.extend(["--evaluate-label", args.evaluate_label])
        if args.auto_correct:
            render_cmd.append("--auto-correct")
            render_cmd.extend(["--auto-correct-max-attempts", str(args.auto_correct_max_attempts)])

        # Package options
        if args.title:
            render_cmd.extend(["--title", args.title])
        if args.intro_text:
            render_cmd.extend(["--intro-text", args.intro_text])
        if args.outro_text:
            render_cmd.extend(["--outro-text", args.outro_text])
        if args.subtitles:
            render_cmd.append("--subtitles")
        if args.audio_ducking:
            render_cmd.append("--audio-ducking")
        if args.color_normalize:
            render_cmd.append("--color-normalize")

        _run(render_cmd, "Render + Evaluate + Package")
        _save_checkpoint(checkpoint_path, "render", {"completed": True})

    # ── Summary ──────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("[DONE] Video production complete!")
    print(f"  Output: {output_dir}")
    print(f"  Checkpoint: {checkpoint_path}")
    print(f"{'='*60}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
