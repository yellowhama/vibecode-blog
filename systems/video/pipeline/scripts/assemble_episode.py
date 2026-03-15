#!/usr/bin/env python3
"""Master pipeline orchestrator — runs all 7 stages sequentially.

Usage:
    python assemble_episode.py --episode 01 [--stage 1-7] [--draft]

Stages:
    1. TTS narration (Kokoro draft / Dia2 production)
    2. Whisper timing extraction + SRT
    3. T2I keyframe generation (ComfyUI + Flux Kontext)
    4. I2V animation (ComfyUI + Wan 2.2 MoE)
    5. Diagram animation (Motion Canvas)
    6. BGM generation (ACE-Step)
    7. Final assembly (Remotion / FFmpeg)
"""
import argparse, json, os, subprocess, sys, time
from pathlib import Path

# --- Paths ---
REPO = Path("/mnt/e/vibecode-blog")
SYSTEMS = REPO / "systems" / "video"
SCRIPTS = SYSTEMS / "pipeline" / "scripts"
PREPRO = SYSTEMS / "preproduction"
OUTPUT = SYSTEMS / "output"
COMFYUI = Path("/home/hugh/ComfyUI")

def ep_dir(ep: str) -> Path:
    return PREPRO / f"ep{ep}"

def out_dir(ep: str) -> Path:
    return OUTPUT / f"ep{ep}"

def run_stage(cmd: list[str], label: str):
    """Run a pipeline stage with timing."""
    print(f"\n{'='*60}")
    print(f"  STAGE: {label}")
    print(f"{'='*60}")
    start = time.time()
    result = subprocess.run(cmd, text=True)
    elapsed = time.time() - start
    status = "OK" if result.returncode == 0 else "FAIL"
    print(f"  [{status}] {label} — {elapsed:.1f}s")
    if result.returncode != 0:
        print(f"  Stage failed. Stopping pipeline.", file=sys.stderr)
        sys.exit(1)
    return elapsed

def main():
    parser = argparse.ArgumentParser(description="Episode assembly pipeline")
    parser.add_argument("--episode", "-e", required=True, help="Episode number (01, 02, ...)")
    parser.add_argument("--stage", "-s", type=int, help="Run only this stage (1-7)")
    parser.add_argument("--from-stage", type=int, default=1, help="Start from this stage")
    parser.add_argument("--draft", action="store_true", help="Use Kokoro (fast draft) instead of Chatterbox")
    parser.add_argument("--skip-gpu", action="store_true", help="Skip GPU stages (3,4,6)")
    args = parser.parse_args()

    ep = args.episode.zfill(2)
    epd = ep_dir(ep)
    outd = out_dir(ep)

    # Ensure dirs exist
    for d in [outd / "audio" / "segments", outd / "subtitles",
              outd / "renders" / "keyframes", outd / "renders" / "clips",
              outd / "renders" / "explainer", outd / "final"]:
        d.mkdir(parents=True, exist_ok=True)

    stages_to_run = range(args.from_stage, 8)
    if args.stage:
        stages_to_run = [args.stage]

    total_start = time.time()
    timings = {}

    for stage in stages_to_run:
        if args.skip_gpu and stage in (3, 4, 6):
            print(f"\n  [SKIP] Stage {stage} (--skip-gpu)")
            continue

        if stage == 1:
            # TTS
            tts_input = epd / f"ep{ep}_tts_input.json"
            script_file = epd / f"ep{ep}_script.fountain"
            input_file = str(tts_input) if tts_input.exists() else str(script_file)

            if args.draft:
                timings[1] = run_stage([
                    sys.executable, str(SCRIPTS / "kokoro_tts.py"),
                    "--input", input_file,
                    "--output", str(outd / "audio" / "narration.wav"),
                    "--segments-dir", str(outd / "audio" / "segments"),
                ], "Stage 1: TTS (Kokoro draft)")
            else:
                timings[1] = run_stage([
                    sys.executable, str(SCRIPTS / "chatterbox_tts.py"),
                    "--input", input_file,
                    "--output", str(outd / "audio" / "narration.wav"),
                    "--segments-dir", str(outd / "audio" / "segments"),
                ], "Stage 1: TTS (Chatterbox production)")

        elif stage == 2:
            # Timing extraction
            narration = outd / "audio" / "narration.wav"
            if not narration.exists():
                # Try preproduction voiceover
                alt = epd / "voiceover_master.wav"
                if alt.exists():
                    narration = alt
            timings[2] = run_stage([
                sys.executable, str(SCRIPTS / "whisper_timing.py"),
                "--input", str(narration),
                "--output-dir", str(outd / "subtitles"),
                "--manifest", str(epd / f"ep{ep}_shot_manifest.json"),
            ], "Stage 2: Whisper timing + SRT")

        elif stage == 3:
            # T2I keyframes (ComfyUI)
            timings[3] = run_stage([
                sys.executable, str(SCRIPTS / "render_keyframes.py"),
                "--manifest", str(epd / f"ep{ep}_shot_manifest.json"),
                "--output", str(outd / "renders" / "keyframes"),
                "--comfyui-url", "http://127.0.0.1:8188",
            ], "Stage 3: T2I keyframes (Flux + Kurzgesagt LoRA)")

        elif stage == 4:
            # I2V animation (ComfyUI)
            timings[4] = run_stage([
                sys.executable, str(SCRIPTS / "animate_shots.py"),
                "--keyframes", str(outd / "renders" / "keyframes"),
                "--manifest", str(epd / f"ep{ep}_shot_manifest.json"),
                "--output", str(outd / "renders" / "clips"),
                "--comfyui-url", "http://127.0.0.1:8188",
            ], "Stage 4: I2V animation (Wan 2.2 MoE)")

        elif stage == 5:
            # Motion Canvas explainer diagrams
            mc_dir = REPO / "vibecode-diagrams"
            if mc_dir.exists():
                timings[5] = run_stage([
                    "npx", "motion-canvas", "render",
                    "--scene", f"ep{ep}-explainer",
                    "--output", str(outd / "renders" / "explainer"),
                ], "Stage 5: Motion Canvas diagrams")
            else:
                print(f"\n  [SKIP] Stage 5: vibecode-diagrams not initialized")

        elif stage == 6:
            # BGM
            timings[6] = run_stage([
                sys.executable, str(SCRIPTS / "acestep_bgm.py"),
                "--prompt", "minimal electronic ambient, educational video background, dark theme, subtle, 120bpm",
                "--duration", "300",
                "--output", str(outd / "audio" / "bgm.wav"),
            ], "Stage 6: BGM (ACE-Step)")

            # Mix audio
            narration = outd / "audio" / "narration.wav"
            if narration.exists():
                run_stage([
                    sys.executable, str(SCRIPTS / "mix_audio.py"),
                    "--narration", str(narration),
                    "--bgm", str(outd / "audio" / "bgm.wav"),
                    "--output", str(outd / "audio" / "mixed_audio.wav"),
                ], "Stage 6b: Audio mixing")

        elif stage == 7:
            # Final assembly
            remotion_dir = REPO / "vibecode-assembler"
            if remotion_dir.exists():
                assembly_props = {
                    "episode": ep,
                    "audio": str(outd / "audio" / "mixed_audio.wav"),
                    "subtitles": str(outd / "subtitles" / "subtitles.srt"),
                    "clips_dir": str(outd / "renders" / "clips"),
                    "explainer_dir": str(outd / "renders" / "explainer"),
                }
                props_path = outd / "final" / f"ep{ep}_assembly.json"
                props_path.write_text(json.dumps(assembly_props, indent=2))

                timings[7] = run_stage([
                    "npx", "remotion", "render", "Episode",
                    "--props", str(props_path),
                    "--output", str(outd / "final" / f"EP{ep}_FINAL.mp4"),
                ], "Stage 7: Final assembly (Remotion)")
            else:
                # Fallback: FFmpeg assembly
                timings[7] = run_stage([
                    sys.executable, str(SCRIPTS / "ffmpeg_assemble.py"),
                    "--episode", ep,
                    "--output-dir", str(outd / "final"),
                ], "Stage 7: Final assembly (FFmpeg fallback)")

    total = time.time() - total_start
    print(f"\n{'='*60}")
    print(f"  PIPELINE COMPLETE — {total:.1f}s total")
    for s, t in sorted(timings.items()):
        print(f"  Stage {s}: {t:.1f}s")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
