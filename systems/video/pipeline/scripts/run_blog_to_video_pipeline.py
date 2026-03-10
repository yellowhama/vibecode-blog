#!/usr/bin/env python3
"""Content Boss Master Orchestrator (v2.1).

A streamlined, robust pipeline for AI video production.
Flow: Prepro -> Agent Prompt -> (Manual Agent Run) -> TTS -> Sync -> Render -> Package.
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path

def _run(cmd, description):
    print(f"\n[STAGE] {description}")
    print(f"Running: {' '.join(cmd)}")
    proc = subprocess.run(cmd, capture_output=False, text=True)
    if proc.returncode != 0:
        print(f"[FAIL] {description} failed with exit code {proc.returncode}")
        sys.exit(proc.returncode)
    return True

def main():
    parser = argparse.ArgumentParser(description="Content Boss Master Orchestrator")
    parser.add_argument("--blog", type=Path, required=True, help="Path to blog MD")
    parser.add_argument("--stages", default="all", help="Stages to run (prepro,agent,tts,sync,render,package)")
    parser.add_argument("--resume-from", help="Stage to resume from")
    parser.add_argument("--language", default="en")
    parser.add_argument("--render", action="store_true", help="Actually run ComfyUI render")
    parser.add_argument("--server", default="127.0.0.1:8188")
    parser.add_argument("--workflow", type=Path)
    parser.add_argument("--bindings", type=Path)
    parser.add_argument("--golden-ref", default=None, help="Golden reference image for Kontext keyframe generation")
    parser.add_argument("--skip-kontext", action="store_true", help="Skip Kontext keyframe generation")
    parser.add_argument("--kontext-guidance", type=float, default=2.5, help="Kontext guidance (default: 2.5)")
    args = parser.parse_args()

    # Paths
    root = Path(__file__).resolve().parent.parent.parent
    scripts = root / "pipeline" / "scripts"
    prepro_root = root / "preproduction"
    output_root = root / "output"
    
    video_root = root.parent # E:\vibecode-blog
    
    active_stages = args.stages.split(",") if args.stages != "all" else ["prepro", "agent", "tts", "sync", "kontext", "render", "package"]
    
    # Context state
    project_id = args.blog.stem
    # Find the latest timestamped folder for this project if resuming
    run_dir = None
    if args.resume_from:
        matching_dirs = sorted(prepro_root.glob(f"{project_id}_*"), reverse=True)
        if matching_dirs:
            run_dir = matching_dirs[0]
            print(f"[INFO] Resuming in directory: {run_dir}")

    # 1. PREPRO
    if "prepro" in active_stages and not args.resume_from:
        _run([
            "python3", str(scripts / "build_blog_to_video_prepro.py"),
            "--blog", str(args.blog),
            "--out-root", str(prepro_root),
            "--language", args.language
        ], "Preproduction (MD to Beats)")
        # Update run_dir after creation
        run_dir = sorted(prepro_root.glob(f"{project_id}_*"), reverse=True)[0]

    # 2. AGENT PROMPT
    if "agent" in active_stages and (not args.resume_from or args.resume_from == "agent"):
        _run([
            "python3", str(scripts / "adapt_blog_to_script.py"),
            "--blog", str(args.blog),
            "--output", str(run_dir / "script_generation.prompt"),
            "--language", args.language
        ], "Generating Agent Prompt")
        print(f"\n[PAUSE] Prompt generated at: {run_dir}/script_generation.prompt")
        print("Please run the prompt through Gemini/Claude and save narration_manifest.json to the run dir.")
        if args.stages != "all": return

    # 3. TTS
    if "tts" in active_stages and (not args.resume_from or args.resume_from in ["tts", "agent"]):
        manifest = run_dir / "narration_manifest.json"
        if not manifest.exists():
            print(f"[ERROR] Missing {manifest}. Run agent stage first.")
            sys.exit(1)
        _run([
            "python3", str(scripts / "generate_tts_simple.py"),
            "--manifest", str(manifest),
            "--output-dir", str(run_dir)
        ], "Generating TTS and Subtitles")

    # 4. SYNC
    if "sync" in active_stages and (not args.resume_from or args.resume_from in ["sync", "tts"]):
        _run([
            "python3", str(scripts / "sync_shots_to_audio.py"),
            "--shots", str(run_dir / "shots_planned.json"), # Created by agent stage manifest or planner
            "--timing", str(run_dir / "timing_alignment.json"),
            "--output", str(run_dir / "shots_synchronized.json")
        ], "Synchronizing Visuals to Audio")

    # 5.5. KONTEXT KEYFRAMES
    if "kontext" in active_stages and args.golden_ref and not args.skip_kontext:
        manifest_for_kontext = run_dir / "shots_synchronized.json"
        if not manifest_for_kontext.exists():
            manifest_for_kontext = run_dir / "shots_planned.json"
        kontext_cmd = [
            "python3", str(scripts / "generate_kontext_keyframes.py"),
            "--manifest", str(manifest_for_kontext),
            "--golden-ref", args.golden_ref,
            "--output-dir", str(output_root / "kontext_keyframes"),
            "--server", args.server,
            "--guidance", str(args.kontext_guidance),
        ]
        comfy_input = Path("/home/hugh/ComfyUI/app/input")
        if comfy_input.exists():
            kontext_cmd.extend(["--comfy-input", str(comfy_input)])
        _run(kontext_cmd, "Kontext Keyframe Generation (Character Consistency)")

    # 6. RENDER
    if args.render or ("render" in active_stages and args.resume_from == "render"):
        workflow = args.workflow or root / "workflows" / "v2_standard_workflow.json"
        bindings = args.bindings or root / "workflows" / "v2_standard_bindings.json"
        _run([
            "python3", str(scripts / "comfy_batch_render.py"),
            "--manifest", str(run_dir / "shots_synchronized.json"),
            "--workflow", str(workflow),
            "--bindings", str(bindings),
            "--output-root", str(output_root),
            "--server", args.server
        ], "Batch Rendering (ComfyUI)")

    # 6. PACKAGE
    if "package" in active_stages and (not args.resume_from or args.resume_from == "package"):
        # This will call the final packaging script once rendering is done
        print("\n[INFO] Rendering complete. Ready for packaging.")
        # (Packaging logic call here)

    print(f"\n[FINISH] Pipeline run complete for {project_id}")

if __name__ == "__main__":
    main()
