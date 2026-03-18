#!/usr/bin/env python3
"""Master pipeline orchestrator — spec-driven, gated, 8 stages.

Usage:
    python assemble_episode.py --episode 01 [--stage 1-8] [--draft] [--skip-gpu]
    python assemble_episode.py --episode 01 --from-stage 7 --skip-validation

Stages:
    1. TTS narration (copy from prepro voiceover_master_tts.wav)
    2. Whisper timing extraction + SRT
    3. T2I keyframe generation (ComfyUI + Flux Kontext)
    4. I2V animation (ComfyUI + Wan 2.2 MoE)
    5. Diagram animation (Motion Canvas)
    6. BGM selection + audio mixing (sidechain ducking)
    7. Final assembly (FFmpeg)
    8. Multi-language audio export (YouTube upload)

Each stage validates its manifest inputs before execution (spec-driven gates)
and writes completion status back to the manifest (SSOT write-back).
"""
import argparse, json, os, shutil, subprocess, sys, time
from pathlib import Path

from manifest_validator import validate_manifest_file, write_pipeline_status

# --- Paths ---
REPO = Path("/mnt/e/vibecode-blog")
SYSTEMS = REPO / "systems" / "video"
SCRIPTS = SYSTEMS / "pipeline" / "scripts"
PREPRO = SYSTEMS / "preproduction"
OUTPUT = SYSTEMS / "output"
CATALOG = SYSTEMS / "pipeline" / "audio_catalog.json"
COMFYUI = Path("/home/hugh/ComfyUI")

MAX_STAGE = 8


def ep_dir(ep: str) -> Path:
    return PREPRO / f"ep{ep}"


def out_dir(ep: str) -> Path:
    return OUTPUT / f"ep{ep}"


def latest_file(directory: Path, pattern: str) -> Path | None:
    matches = sorted(directory.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0] if matches else None


def find_narration(ep: str) -> Path:
    epd = ep_dir(ep)
    outd = out_dir(ep)
    for c in [epd / "voiceover_master_tts.wav",
              outd / "audio" / "narration_v3.wav",
              outd / "audio" / "narration.wav",
              epd / "voiceover_master.wav"]:
        if c.exists():
            return c
    raise FileNotFoundError(f"No narration found for ep{ep}")


def find_shot_manifest(ep: str) -> Path:
    epd = ep_dir(ep)
    candidates = sorted(
        [p for p in epd.glob(f"ep{ep}_shot_manifest_v*.json")
         if "handoff" not in p.name and "report" not in p.name and "timed" not in p.name],
        key=lambda p: p.stat().st_mtime, reverse=True,
    )
    if candidates:
        return candidates[0]
    fallback = epd / f"ep{ep}_shot_manifest.json"
    if fallback.exists():
        return fallback
    raise FileNotFoundError(f"No shot manifest for ep{ep}")


def find_prepro_manifest(ep: str) -> Path:
    epd = ep_dir(ep)
    candidates = sorted(
        [p for p in epd.glob(f"ep{ep}_prepro_manifest_v*.json")
         if "report" not in p.name],
        key=lambda p: p.stat().st_mtime, reverse=True,
    )
    if candidates:
        return candidates[0]
    raise FileNotFoundError(f"No prepro manifest for ep{ep}")


def find_srt(ep: str) -> Path:
    outd = out_dir(ep)
    for c in [outd / "subtitles" / f"ep{ep}_subtitles.srt",
              outd / "subtitles" / "subtitles.srt"]:
        if c.exists():
            return c
    raise FileNotFoundError(f"No SRT for ep{ep}")


def run_stage(cmd: list[str], label: str) -> float:
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


# --- Validation gate ---

# Maps stages to which manifest type + path to validate
def _manifest_for_stage(ep: str, stage: int) -> tuple[Path, int]:
    """Return (manifest_path, stage_number) for validation."""
    if stage in (1, 6, 8):
        return find_prepro_manifest(ep), stage
    else:
        return find_shot_manifest(ep), stage


def validate_gate(ep: str, stage: int, skip: bool = False) -> None:
    """Spec-driven validation gate. Blocks if manifest is incomplete."""
    if skip:
        return
    try:
        manifest_path, stage_num = _manifest_for_stage(ep, stage)
    except FileNotFoundError as e:
        print(f"\n  [BLOCKED] Stage {stage}: {e}")
        sys.exit(1)

    result = validate_manifest_file(manifest_path, stage_num)
    if not result.ok:
        print(f"\n{result.block_message()}")
        sys.exit(1)
    print(f"  [GATE] Stage {stage} ({result.label}): validated ✓")


# --- BGM ---

EPISODE_BGM = {
    "01": "fdd_fury_stomp",
    "02": "yak_shaving_machine",
    "03": "cynical_indie_hacker",
    "04": "nike_insight_minimal",
}


def find_bgm(ep: str) -> Path | None:
    if not CATALOG.exists():
        return None
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    bgm_id = EPISODE_BGM.get(ep)
    for entry in catalog.get("bgm", []):
        if entry["id"] == bgm_id:
            bgm_path = SYSTEMS / entry["path"]
            if bgm_path.exists():
                return bgm_path
    outd = out_dir(ep)
    for name in ["bgm_real.wav", "bgm_v2.wav", "bgm.wav"]:
        p = outd / "audio" / name
        if p.exists():
            return p
    return None


def main():
    parser = argparse.ArgumentParser(description="Episode assembly pipeline (spec-driven)")
    parser.add_argument("--episode", "-e", required=True, help="Episode number (01, 02, ...)")
    parser.add_argument("--stage", "-s", type=int, help="Run only this stage (1-8)")
    parser.add_argument("--from-stage", type=int, default=1, help="Start from this stage")
    parser.add_argument("--draft", action="store_true", help="Use fast draft options")
    parser.add_argument("--tts", choices=["kokoro", "dia2", "chatterbox"], help="TTS engine override")
    parser.add_argument("--skip-gpu", action="store_true", help="Skip GPU stages (3,4)")
    parser.add_argument("--skip-validation", action="store_true", help="Skip manifest validation gates")
    args = parser.parse_args()

    ep = args.episode.zfill(2)
    epd = ep_dir(ep)
    outd = out_dir(ep)

    for d in [outd / "audio" / "segments", outd / "subtitles",
              outd / "renders" / "keyframes", outd / "renders" / "clips",
              outd / "renders" / "explainer", outd / "final"]:
        d.mkdir(parents=True, exist_ok=True)

    stages_to_run = range(args.from_stage, MAX_STAGE + 1)
    if args.stage:
        stages_to_run = [args.stage]

    total_start = time.time()
    timings = {}

    for stage in stages_to_run:
        if args.skip_gpu and stage in (3, 4):
            print(f"\n  [SKIP] Stage {stage} (--skip-gpu)")
            continue

        # --- VALIDATION GATE (spec-driven) ---
        validate_gate(ep, stage, skip=args.skip_validation)

        if stage == 1:
            narration_src = find_narration(ep)
            narration_dst = outd / "audio" / "narration_v3.wav"
            start = time.time()
            if narration_src != narration_dst:
                shutil.copy2(narration_src, narration_dst)
            elapsed = time.time() - start
            print(f"\n{'='*60}")
            print(f"  STAGE: Stage 1: TTS narration (copy)")
            print(f"{'='*60}")
            print(f"  [OK] {narration_src} → {narration_dst} — {elapsed:.1f}s")
            timings[1] = elapsed
            # Write-back
            try:
                write_pipeline_status(find_prepro_manifest(ep), 1, elapsed_sec=elapsed,
                                      artifacts=[str(narration_dst)])
            except Exception:
                pass

        elif stage == 2:
            narration = find_narration(ep)
            shot_manifest = find_shot_manifest(ep)
            timings[2] = run_stage([
                sys.executable, str(SCRIPTS / "whisper_timing.py"),
                "--input", str(narration),
                "--output-dir", str(outd / "subtitles"),
                "--manifest", str(shot_manifest),
            ], "Stage 2: Whisper timing + SRT")
            try:
                write_pipeline_status(shot_manifest, 2, elapsed_sec=timings[2])
            except Exception:
                pass

        elif stage == 3:
            shot_manifest = find_shot_manifest(ep)
            timings[3] = run_stage([
                sys.executable, str(SCRIPTS / "render_keyframes.py"),
                "--manifest", str(shot_manifest),
                "--output", str(outd / "renders" / "keyframes"),
                "--comfyui-url", "http://127.0.0.1:8188",
                "--only-missing",
            ], "Stage 3: T2I keyframes (Flux + Kontext)")
            try:
                write_pipeline_status(shot_manifest, 3, elapsed_sec=timings[3])
            except Exception:
                pass

        elif stage == 4:
            shot_manifest = find_shot_manifest(ep)
            timings[4] = run_stage([
                sys.executable, str(SCRIPTS / "animate_shots.py"),
                "--keyframes", str(outd / "renders" / "keyframes"),
                "--manifest", str(shot_manifest),
                "--output", str(outd / "renders" / "clips"),
                "--comfyui-url", "http://127.0.0.1:8188",
            ], "Stage 4: I2V animation (Wan 2.2 MoE)")
            try:
                write_pipeline_status(shot_manifest, 4, elapsed_sec=timings[4])
            except Exception:
                pass

        elif stage == 5:
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
            narration = find_narration(ep)
            bgm = find_bgm(ep)
            mixed_out = outd / "audio" / "mixed_audio_v4.wav"

            if bgm:
                timings[6] = run_stage([
                    sys.executable, str(SCRIPTS / "mix_audio.py"),
                    "--narration", str(narration),
                    "--bgm", str(bgm),
                    "--output", str(mixed_out),
                    "--bgm-volume", "0.15",
                    "--ducking-db", "-15",
                ], f"Stage 6: Audio mixing (BGM: {bgm.stem})")
            else:
                shutil.copy2(narration, mixed_out)
                print(f"\n  [WARN] No BGM for ep{ep}, using narration only")
                timings[6] = 0.0
            try:
                write_pipeline_status(find_prepro_manifest(ep), 6, elapsed_sec=timings.get(6, 0),
                                      artifacts=[str(mixed_out)])
            except Exception:
                pass

        elif stage == 7:
            shot_manifest = find_shot_manifest(ep)
            timings[7] = run_stage([
                sys.executable, str(SCRIPTS / "ffmpeg_assemble.py"),
                "--episode", ep,
                "--shot-manifest", str(shot_manifest),
                "--output-dir", str(outd / "final"),
            ], "Stage 7: Final assembly (FFmpeg)")
            try:
                write_pipeline_status(shot_manifest, 7, elapsed_sec=timings[7],
                                      artifacts=[str(outd / "final" / f"EP{ep}_v4_FINAL.mp4")])
            except Exception:
                pass

        elif stage == 8:
            # Stage 8: Multi-language audio export for YouTube
            final_video = outd / "final" / f"EP{ep}_v4_FINAL.mp4"
            if final_video.exists():
                timings[8] = run_stage([
                    sys.executable, str(SCRIPTS / "export_multilang_audio.py"),
                    "--episode", ep,
                    "--video", str(final_video),
                    "--languages", "en,ko",
                ], "Stage 8: Multi-language audio export")
            else:
                print(f"\n  [SKIP] Stage 8: final video not found ({final_video})")
            try:
                write_pipeline_status(find_prepro_manifest(ep), 8,
                                      elapsed_sec=timings.get(8, 0))
            except Exception:
                pass

    total = time.time() - total_start
    print(f"\n{'='*60}")
    print(f"  PIPELINE COMPLETE — {total:.1f}s total")
    for s, t in sorted(timings.items()):
        print(f"  Stage {s}: {t:.1f}s")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
