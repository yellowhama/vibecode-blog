#!/usr/bin/env python3
"""Run blog -> prepro -> shot manifest -> (optional VO assemble) -> (optional render).

DAG structure (when --render is set):
  prepro ─┬─► manifest ──► render ──► evaluate ──► package
          └─► TTS ────────────────┘ (VO merge at package)

manifest and TTS run in parallel after prepro completes.
"""

from __future__ import annotations

import argparse
import asyncio
import re
import subprocess
from pathlib import Path


PREPRO_DIR_RE = re.compile(r"\[OK\] prepro dir:\s*(.+)")
MANIFEST_RE = re.compile(r"\[OK\] auto shot manifest:\s*(.+)")

ALL_STAGES = ("prepro", "manifest", "tts", "render", "package")
DEFAULT_EVALUATE_ASSETS_GUIDE = Path(__file__).resolve().parent.parent.parent / "planning" / "03-visual_assets_guide.md"


def _run(cmd: list[str]) -> str:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )
    return proc.stdout


async def _arun(cmd: list[str]) -> str:
    """Async subprocess execution."""
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout_bytes, stderr_bytes = await proc.communicate()
    stdout = stdout_bytes.decode("utf-8", errors="replace") if stdout_bytes else ""
    stderr = stderr_bytes.decode("utf-8", errors="replace") if stderr_bytes else ""
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{stdout}\nstderr:\n{stderr}"
        )
    return stdout


def _extract(stdout: str, pattern: re.Pattern[str], label: str) -> Path:
    for line in stdout.splitlines():
        m = pattern.search(line.strip())
        if m:
            return Path(m.group(1).strip())
    raise RuntimeError(f"Could not parse {label} from command output")


def _should_run_stage(stage: str, stages: set[str] | None, resume_from: str | None) -> bool:
    """Check if a stage should be executed based on --stages and --resume-from."""
    if stages is not None:
        return stage in stages
    if resume_from is not None:
        stage_order = list(ALL_STAGES)
        try:
            resume_idx = stage_order.index(resume_from)
            current_idx = stage_order.index(stage)
            return current_idx >= resume_idx
        except ValueError:
            return True
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Run blog to video production pipeline")
    parser.add_argument("--blog", required=True, type=Path)
    parser.add_argument("--project-id", default=None)
    parser.add_argument("--language", choices=["auto", "ko", "en"], default="auto")
    parser.add_argument(
        "--video-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent,
    )
    parser.add_argument(
        "--prepro-out-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "preproduction",
    )
    parser.add_argument("--manifest-out", type=Path, default=None)
    parser.add_argument("--max-shots", type=int, default=24)
    parser.add_argument("--target-duration-sec", type=float, default=180.0)
    parser.add_argument("--min-shot-sec", type=float, default=3.0)
    parser.add_argument("--max-shot-sec", type=float, default=8.0)
    parser.add_argument("--resolution", default="832x480")
    parser.add_argument("--aspect-ratio", default="16:9")
    parser.add_argument("--mode", choices=["i2v", "t2v"], default="i2v")
    parser.add_argument("--model", default=None)
    parser.add_argument("--recordings-dir", type=Path, default=None)
    parser.add_argument("--voiceover", type=Path, default=None, help="Existing voiceover file to use")
    parser.add_argument("--tts-auto", action="store_true", help="Force auto TTS generation from prepro")
    parser.add_argument("--disable-auto-tts", action="store_true", help="Disable implicit auto TTS on render")
    parser.add_argument("--tts-backend", default="edge", choices=["edge", "xtts", "mms", "none"])
    parser.add_argument("--tts-fallback", default="none", choices=["edge", "xtts", "mms", "none"])
    parser.add_argument("--offline-strict", action="store_true")
    parser.add_argument("--tts-voice", default=None, help="Edge TTS voice id")
    parser.add_argument("--tts-rate", default="+0%")
    parser.add_argument("--tts-volume", default="+0%")
    parser.add_argument("--tts-pitch", default="+0Hz")
    parser.add_argument("--tts-gap-sec", type=float, default=0.15)
    parser.add_argument("--tts-model-id", default=None)
    parser.add_argument("--tts-model-dir", type=Path, default=None)
    parser.add_argument("--tts-device", default="auto", choices=["auto", "cpu", "cuda"])
    parser.add_argument("--tts-speaker", default=None)
    parser.add_argument("--tts-speaker-wav", type=Path, default=None)
    parser.add_argument("--tts-no-cache", action="store_true")
    parser.add_argument("--tts-crossfade-sec", type=float, default=0.0)
    parser.add_argument("--tts-trim-silence", action="store_true")
    parser.add_argument("--tts-disable-loudnorm", action="store_true")
    parser.add_argument("--tts-target-lufs", type=float, default=-16.0)
    parser.add_argument("--tts-target-lra", type=float, default=11.0)
    parser.add_argument("--tts-target-true-peak", type=float, default=-1.5)
    parser.add_argument("--tts-timing-policy", default="warn", choices=["ignore", "warn", "fail"])
    parser.add_argument("--tts-timing-tolerance-ratio", type=float, default=0.35)
    parser.add_argument("--bgm", type=Path, default=None)
    parser.add_argument("--voiceover-volume", type=float, default=1.0)
    parser.add_argument("--bgm-volume", type=float, default=0.18)
    parser.add_argument("--checklist-strict", action="store_true", help="Fail if required upload checklist gates fail")
    parser.add_argument("--transition", default="fade")
    parser.add_argument("--transition-duration", type=float, default=1.0)
    parser.add_argument("--intro-text", default=None)
    parser.add_argument("--outro-text", default=None)
    parser.add_argument("--no-transitions", action="store_true")
    parser.add_argument("--subtitles", action="store_true")
    parser.add_argument("--subtitle-lang", choices=["ko", "en", "dual"], default="ko")
    parser.add_argument("--subtitle-text-ko", default=None)
    parser.add_argument("--subtitle-text-en", default=None)
    parser.add_argument("--subtitle-font-ko", default="Noto Sans CJK KR")
    parser.add_argument("--subtitle-font-en", default="DejaVu Sans")
    parser.add_argument("--subtitle-fonts-dir", type=Path, default=Path(__file__).resolve().parent.parent.parent / "assets" / "fonts")
    parser.add_argument("--skip-subtitle-font-bootstrap", action="store_true")
    parser.add_argument("--audio-ducking", action="store_true")
    parser.add_argument("--duck-threshold", type=float, default=0.02)
    parser.add_argument("--duck-ratio", type=float, default=6.0)
    parser.add_argument("--color-normalize", action="store_true")
    parser.add_argument("--color-method", choices=["mkl", "reinhard", "pdf"], default="mkl")
    parser.add_argument("--color-reference", type=Path, default=None)
    parser.add_argument("--final-quality-check", action="store_true")
    parser.add_argument("--quality-check-strict", action="store_true")
    parser.add_argument("--scene-chapters", action="store_true")
    parser.add_argument("--silence-duration", type=float, default=2.0)
    parser.add_argument("--silence-noise-db", type=float, default=-55.0)
    parser.add_argument("--evaluate-assets-guide", type=Path, default=DEFAULT_EVALUATE_ASSETS_GUIDE)
    parser.add_argument("--evaluate-min-score", type=int, default=75)
    parser.add_argument("--evaluate-label", default=None)
    parser.add_argument("--evaluate-overwrite", action="store_true")
    parser.add_argument("--render", action="store_true", help="Run Comfy render and package step")
    parser.add_argument("--workflow", type=Path, default=None)
    parser.add_argument("--bindings", type=Path, default=None)
    parser.add_argument("--blog-source", type=Path, default=None)
    parser.add_argument("--twitter-queue", type=Path, default=None)
    parser.add_argument("--title", default=None)
    parser.add_argument("--teaser-sec", type=int, default=30)
    parser.add_argument("--server", default="http://127.0.0.1:8188")
    parser.add_argument("--no-sync-keyframes", action="store_true")
    parser.add_argument("--keyframe-search-dir", action="append", default=None)
    parser.add_argument(
        "--stages",
        default=None,
        help="Comma-separated stages to run (e.g. prepro,tts). Default: all.",
    )
    parser.add_argument(
        "--resume-from",
        default=None,
        choices=list(ALL_STAGES),
        help="Resume pipeline from this stage onward",
    )
    args = parser.parse_args()

    if not args.blog.exists():
        raise SystemExit(f"[FAIL] blog file not found: {args.blog}")
    if args.render and (not args.workflow or not args.bindings):
        raise SystemExit("[FAIL] --render requires --workflow and --bindings")
    if args.tts_auto and args.tts_backend == "none":
        raise SystemExit("[FAIL] --tts-auto requires --tts-backend not equal to none")

    selected_model = args.model
    if not selected_model:
        selected_model = (
            "hunyuanvideo1.5_480p_i2v_step_distilled_fp8_scaled.safetensors"
            if args.mode == "i2v"
            else "wan2.1_t2v_1.3B_fp16.safetensors"
        )

    # Parse stage filters
    active_stages: set[str] | None = None
    if args.stages:
        active_stages = {s.strip() for s in args.stages.split(",")}
        invalid = active_stages - set(ALL_STAGES)
        if invalid:
            raise SystemExit(f"[FAIL] unknown stages: {invalid}. Valid: {ALL_STAGES}")

    scripts_dir = args.video_root / "pipeline" / "scripts"
    prepro_py = scripts_dir / "build_blog_to_video_prepro.py"
    manifest_py = scripts_dir / "build_shot_manifest_from_prepro.py"
    vo_py = scripts_dir / "assemble_voiceover_from_cues.py"
    tts_py = scripts_dir / "generate_tts_from_prepro.py"
    e2e_py = scripts_dir / "run_end_to_end_video_pipeline.py"

    return asyncio.run(_async_pipeline(args, active_stages, selected_model,
                                        prepro_py, manifest_py, vo_py, tts_py, e2e_py))


async def _async_pipeline(
    args: argparse.Namespace,
    active_stages: set[str] | None,
    selected_model: str,
    prepro_py: Path,
    manifest_py: Path,
    vo_py: Path,
    tts_py: Path,
    e2e_py: Path,
) -> int:
    """Execute pipeline stages as a DAG with parallel manifest+TTS."""

    # --- Stage: prepro ---
    prepro_dir: Path | None = None
    prepro_manifest: Path | None = None

    if _should_run_stage("prepro", active_stages, args.resume_from):
        prepro_cmd = [
            "python3",
            str(prepro_py),
            "--blog",
            str(args.blog),
            "--out-root",
            str(args.prepro_out_root),
            "--language",
            args.language,
            "--max-beats",
            str(args.max_shots),
            "--target-duration-sec",
            str(args.target_duration_sec),
        ]
        if args.project_id:
            prepro_cmd.extend(["--project-id", args.project_id])
        prepro_out = await _arun(prepro_cmd)
        print(prepro_out.strip())
        prepro_dir = _extract(prepro_out, PREPRO_DIR_RE, "prepro dir")
        prepro_manifest = prepro_dir / "prepro_manifest.json"
    else:
        # When resuming, derive prepro paths from expected location
        prepro_dir = args.prepro_out_root
        # Try to find the most recent prepro_manifest
        candidates = sorted(args.prepro_out_root.glob("*/prepro_manifest.json"), reverse=True)
        if candidates:
            prepro_manifest = candidates[0]
            prepro_dir = prepro_manifest.parent

    if prepro_manifest is None or not prepro_manifest.exists():
        raise SystemExit(f"[FAIL] prepro_manifest not found at {prepro_manifest}")

    # --- Parallel: manifest + TTS ---
    # These two stages depend only on prepro output and can run concurrently

    shot_manifest: Path | None = None
    voiceover_path = args.voiceover
    tts_timing_report_path = prepro_dir / "timing_alignment_report.json"
    tts_quality_report_path = prepro_dir / "voiceover_quality_report.json"

    async def _run_manifest() -> Path | None:
        if not _should_run_stage("manifest", active_stages, args.resume_from):
            # Try to find existing manifest
            if args.manifest_out and args.manifest_out.exists():
                return args.manifest_out
            return None

        manifest_cmd = [
            "python3",
            str(manifest_py),
            "--prepro-manifest",
            str(prepro_manifest),
            "--max-shots",
            str(args.max_shots),
            "--target-duration-sec",
            str(args.target_duration_sec),
            "--min-shot-sec",
            str(args.min_shot_sec),
            "--max-shot-sec",
            str(args.max_shot_sec),
            "--resolution",
            args.resolution,
            "--aspect-ratio",
            args.aspect_ratio,
            "--mode",
            args.mode,
            "--model",
            selected_model,
        ]
        if args.project_id:
            manifest_cmd.extend(["--project-id", f"{args.project_id}_video"])
        if args.manifest_out:
            manifest_cmd.extend(["--out-manifest", str(args.manifest_out)])
        manifest_out = await _arun(manifest_cmd)
        print(manifest_out.strip())
        return _extract(manifest_out, MANIFEST_RE, "auto shot manifest")

    async def _run_tts() -> Path | None:
        if not _should_run_stage("tts", active_stages, args.resume_from):
            return args.voiceover

        if args.recordings_dir:
            vo_cmd = [
                "python3",
                str(vo_py),
                "--prepro-manifest",
                str(prepro_manifest),
                "--recordings-dir",
                str(args.recordings_dir),
            ]
            vo_out = await _arun(vo_cmd)
            print(vo_out.strip())
            return prepro_dir / "voiceover_master.wav"

        if args.tts_auto or (
            args.render and not args.disable_auto_tts and not args.voiceover and args.tts_backend != "none"
        ):
            tts_cmd = [
                "python3",
                str(tts_py),
                "--prepro-manifest",
                str(prepro_manifest),
                "--tts-backend",
                args.tts_backend,
                "--tts-fallback",
                args.tts_fallback,
                "--rate",
                args.tts_rate,
                "--volume",
                args.tts_volume,
                "--pitch",
                args.tts_pitch,
                "--gap-sec",
                str(args.tts_gap_sec),
                "--crossfade-sec",
                str(args.tts_crossfade_sec),
                "--device",
                args.tts_device,
                "--timing-policy",
                args.tts_timing_policy,
                "--timing-tolerance-ratio",
                str(args.tts_timing_tolerance_ratio),
                "--target-lufs",
                str(args.tts_target_lufs),
                "--target-lra",
                str(args.tts_target_lra),
                "--target-true-peak",
                str(args.tts_target_true_peak),
            ]
            if args.tts_voice:
                tts_cmd.extend(["--voice", args.tts_voice])
            if args.offline_strict:
                tts_cmd.append("--offline-strict")
            if args.tts_model_id:
                tts_cmd.extend(["--model-id", args.tts_model_id])
            if args.tts_model_dir:
                tts_cmd.extend(["--model-dir", str(args.tts_model_dir)])
            if args.tts_speaker:
                tts_cmd.extend(["--speaker", args.tts_speaker])
            if args.tts_speaker_wav:
                tts_cmd.extend(["--speaker-wav", str(args.tts_speaker_wav)])
            if args.tts_no_cache:
                tts_cmd.append("--no-cache")
            if args.tts_trim_silence:
                tts_cmd.append("--trim-silence")
            if args.tts_disable_loudnorm:
                tts_cmd.append("--disable-loudnorm")
            tts_out = await _arun(tts_cmd)
            print(tts_out.strip())
            return prepro_dir / "voiceover_master_tts.wav"

        return args.voiceover

    # Run manifest and TTS in parallel
    manifest_result, tts_result = await asyncio.gather(_run_manifest(), _run_tts())

    if manifest_result is not None:
        shot_manifest = manifest_result
    voiceover_path = tts_result

    if not args.render:
        print("[OK] render step skipped (--render not set)")
        print(f"[OK] prepro manifest: {prepro_manifest}")
        if shot_manifest:
            print(f"[OK] shot manifest: {shot_manifest}")
        if voiceover_path:
            print(f"[OK] voiceover: {voiceover_path}")
        if tts_timing_report_path.exists():
            print(f"[OK] tts timing report: {tts_timing_report_path}")
        if tts_quality_report_path.exists():
            print(f"[OK] tts quality report: {tts_quality_report_path}")
        return 0

    if not _should_run_stage("render", active_stages, args.resume_from):
        print("[OK] render stage skipped by --stages/--resume-from")
        return 0

    if shot_manifest is None:
        raise SystemExit("[FAIL] shot manifest not available for render stage")

    # --- Stage: render + package (via e2e pipeline) ---
    e2e_cmd = [
        "python3",
        str(e2e_py),
        "--manifest",
        str(shot_manifest),
        "--workflow",
        str(args.workflow),
        "--bindings",
        str(args.bindings),
        "--video-root",
        str(args.video_root),
        "--server",
        args.server,
        "--teaser-sec",
        str(args.teaser_sec),
    ]
    if args.no_sync_keyframes:
        e2e_cmd.append("--no-sync-keyframes")
    for d in args.keyframe_search_dir or []:
        e2e_cmd.extend(["--keyframe-search-dir", d])
    if voiceover_path:
        e2e_cmd.extend(["--voiceover", str(voiceover_path)])
    if args.bgm:
        e2e_cmd.extend(["--bgm", str(args.bgm)])
    if args.blog_source:
        e2e_cmd.extend(["--blog-source", str(args.blog_source)])
    else:
        e2e_cmd.extend(["--blog-source", str(args.blog)])
    if args.twitter_queue:
        e2e_cmd.extend(["--twitter-queue", str(args.twitter_queue)])
    if args.title:
        e2e_cmd.extend(["--title", args.title])
    e2e_cmd.extend(["--voiceover-volume", str(args.voiceover_volume)])
    e2e_cmd.extend(["--bgm-volume", str(args.bgm_volume)])
    if args.checklist_strict:
        e2e_cmd.append("--checklist-strict")
    if args.no_transitions:
        e2e_cmd.append("--no-transitions")
    else:
        e2e_cmd.extend(["--transition", args.transition])
        e2e_cmd.extend(["--transition-duration", str(args.transition_duration)])
    if args.intro_text:
        e2e_cmd.extend(["--intro-text", args.intro_text])
    if args.outro_text:
        e2e_cmd.extend(["--outro-text", args.outro_text])
    if args.subtitles:
        e2e_cmd.append("--subtitles")
        e2e_cmd.extend(["--subtitle-lang", args.subtitle_lang])
    if args.subtitle_text_ko:
        e2e_cmd.extend(["--subtitle-text-ko", args.subtitle_text_ko])
    if args.subtitle_text_en:
        e2e_cmd.extend(["--subtitle-text-en", args.subtitle_text_en])
    if args.subtitle_font_ko:
        e2e_cmd.extend(["--subtitle-font-ko", args.subtitle_font_ko])
    if args.subtitle_font_en:
        e2e_cmd.extend(["--subtitle-font-en", args.subtitle_font_en])
    if args.subtitle_fonts_dir:
        e2e_cmd.extend(["--subtitle-fonts-dir", str(args.subtitle_fonts_dir)])
    if args.skip_subtitle_font_bootstrap:
        e2e_cmd.append("--skip-subtitle-font-bootstrap")
    if args.audio_ducking:
        e2e_cmd.append("--audio-ducking")
        e2e_cmd.extend(["--duck-threshold", str(args.duck_threshold)])
        e2e_cmd.extend(["--duck-ratio", str(args.duck_ratio)])
    if args.color_normalize:
        e2e_cmd.append("--color-normalize")
        e2e_cmd.extend(["--color-method", args.color_method])
    if args.color_reference:
        e2e_cmd.extend(["--color-reference", str(args.color_reference)])
    if args.final_quality_check:
        e2e_cmd.append("--final-quality-check")
    if args.quality_check_strict:
        e2e_cmd.append("--quality-check-strict")
    if args.scene_chapters:
        e2e_cmd.append("--scene-chapters")
    e2e_cmd.extend(["--silence-duration", str(args.silence_duration)])
    e2e_cmd.extend(["--silence-noise-db", str(args.silence_noise_db)])
    e2e_cmd.extend(["--evaluate-assets-guide", str(args.evaluate_assets_guide)])
    e2e_cmd.extend(["--evaluate-min-score", str(args.evaluate_min_score)])
    if args.evaluate_label:
        e2e_cmd.extend(["--evaluate-label", args.evaluate_label])
    if args.evaluate_overwrite:
        e2e_cmd.append("--evaluate-overwrite")

    e2e_out = await _arun(e2e_cmd)
    print(e2e_out.strip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
