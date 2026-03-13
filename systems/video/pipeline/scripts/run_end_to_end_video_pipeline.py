#!/usr/bin/env python3
"""Run end-to-end video pipeline: prepro -> TTS -> render -> QA -> audio/subtitle -> YouTube package."""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path


RUN_DIR_PATTERN = re.compile(r"\[OK\] run dir:\s*(.+)")
DEFAULT_EVALUATE_ASSETS_GUIDE = Path(__file__).resolve().parent.parent.parent / "planning" / "03-visual_assets_guide.md"


def _run(cmd: list[str], cwd: Path | None = None) -> str:
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(cwd) if cwd else None)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )
    return proc.stdout


def _extract_run_dir(stdout: str) -> Path:
    for line in stdout.splitlines():
        m = RUN_DIR_PATTERN.search(line.strip())
        if m:
            return Path(m.group(1).strip())
    raise RuntimeError("Could not parse run dir from comfy_batch_render output")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run full video pipeline for production")
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--workflow", required=True, type=Path)
    parser.add_argument("--bindings", required=True, type=Path)
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "output" / "renders",
    )
    parser.add_argument(
        "--server",
        default="http://127.0.0.1:8188",
    )
    parser.add_argument(
        "--video-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent,
    )
    parser.add_argument("--blog-source", type=Path, default=None)
    parser.add_argument("--twitter-queue", type=Path, default=None)
    parser.add_argument("--title", default=None)
    parser.add_argument("--teaser-sec", type=int, default=30)
    parser.add_argument("--voiceover", type=Path, default=None)
    parser.add_argument("--bgm", type=Path, default=None)
    parser.add_argument("--voiceover-volume", type=float, default=1.0)
    parser.add_argument("--bgm-volume", type=float, default=0.18)
    parser.add_argument("--checklist-strict", action="store_true", help="Fail if required upload checklist gates fail")
    parser.add_argument("--run-dir", type=Path, default=None, help="Use existing render run directory")
    parser.add_argument("--skip-render", action="store_true", help="Skip render and package an existing run")
    parser.add_argument("--force-render", action="store_true", help="Ignore render cache and re-render all shots")
    parser.add_argument("--render-timeout-sec", type=int, default=10800, help="Per-job timeout for comfy_batch_render (default 10800)")
    parser.add_argument("--render-poll-sec", type=int, default=5, help="Poll interval for comfy_batch_render (default 5)")
    parser.add_argument(
        "--no-sync-keyframes",
        action="store_true",
        help="Skip keyframe sync step before render",
    )
    parser.add_argument(
        "--keyframe-search-dir",
        action="append",
        default=None,
        help="Directory to resolve manifest input_image files (repeatable)",
    )
    parser.add_argument(
        "--skip-evaluate",
        action="store_true",
        help="Skip vision QA evaluation step",
    )
    parser.add_argument(
        "--evaluate-strict",
        action="store_true",
        help="Fail pipeline if any shot evaluation is FAIL",
    )
    parser.add_argument(
        "--evaluate-provider",
        default="auto",
        choices=["auto", "gemini", "openai", "mock"],
        help="Vision QA provider for evaluate_renders",
    )
    parser.add_argument("--evaluate-assets-guide", type=Path, default=DEFAULT_EVALUATE_ASSETS_GUIDE)
    parser.add_argument("--evaluate-min-score", type=int, default=75)
    parser.add_argument("--evaluate-frames", type=int, default=4)
    parser.add_argument("--evaluate-timeout-sec", type=int, default=120)
    parser.add_argument("--evaluate-retries", type=int, default=2)
    parser.add_argument("--evaluate-retry-delay-sec", type=float, default=2.0)
    parser.add_argument("--evaluate-label", default=None, help="Optional suffix for evaluation output files")
    parser.add_argument("--evaluate-overwrite", action="store_true", help="Overwrite existing evaluation outputs")
    parser.add_argument("--evaluate-temperature", type=float, default=0.0, help="Vision model temperature (0.0 for deterministic)")
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
    parser.add_argument("--auto-correct", action="store_true", help="Auto-correct failed shots after evaluation (QA correction agent)")
    parser.add_argument("--auto-correct-max-attempts", type=int, default=3, help="Max correction attempts per shot (default: 3)")

    # --- CLI-Anything integration ---
    parser.add_argument("--audio-master", choices=["none", "podcast", "youtube"], default="none",
                        help="Audio mastering preset via Audacity harness (default: none)")
    parser.add_argument("--assembler", choices=["ffmpeg", "mlt", "kdenlive"], default="ffmpeg",
                        help="Video assembly backend (default: ffmpeg)")
    parser.add_argument("--gimp-thumbnail", action="store_true", default=False,
                        help="Use GIMP harness for thumbnail generation")
    parser.add_argument("--image-postprocess", action="store_true", default=False,
                        help="Run image post-processing on renders before packaging")
    parser.add_argument("--ab-test", action="store_true", default=False,
                        help="Run A/B comparison after pipeline (legacy vs harness)")
    parser.add_argument("--use-claymation-harness", action="store_true", default=False,
                        help="Use CLI-Anything Blender harness for claymation scenes")
    parser.add_argument("--no-claymation-harness", dest="use_claymation_harness", action="store_false")
    parser.add_argument("--use-explainer-harness", action="store_true", default=False,
                        help="Use CLI-Anything Inkscape harness for explainer graphics")
    parser.add_argument("--no-explainer-harness", dest="use_explainer_harness", action="store_false")

    # --- Stage 0: Preproduction (TTS + timing reconciliation) ---
    parser.add_argument("--prepro-manifest", type=Path, default=None, help="Preproduction manifest for Stage 0 (TTS + timing sync)")
    parser.add_argument("--skip-tts", action="store_true", help="Skip TTS generation (reuse existing WAV)")
    parser.add_argument("--tts-backend", default="edge", help="TTS backend (edge, eleven_labs, google, xtts, mms)")
    parser.add_argument("--tts-voice", default=None, help="TTS voice name")
    parser.add_argument("--tts-language", default="ko", help="TTS language (default: ko)")

    # --- Stage 0c: Kontext keyframe generation ---
    parser.add_argument("--golden-ref", default=None, help="Golden reference image for Kontext keyframe generation (filename in ComfyUI input/)")
    parser.add_argument("--skip-kontext", action="store_true", help="Skip Kontext keyframe generation stage")
    parser.add_argument("--kontext-guidance", type=float, default=2.5, help="Kontext guidance value (default: 2.5)")
    parser.add_argument("--kontext-output-dir", type=Path, default=None, help="Output directory for Kontext keyframes")

    # --- Stage 5: Subtitle format ---
    parser.add_argument("--subtitle-format", choices=["ass", "srt", "both"], default="both", help="Subtitle output format")

    # --- Audio catalog ---
    parser.add_argument("--bgm-id", default=None, help="BGM catalog ID (resolves via audio_catalog.json)")

    args = parser.parse_args()

    video_root = args.video_root
    run_server_sh = video_root / "scripts" / "run_comfy_server.sh"
    sync_keyframes_py = video_root / "pipeline" / "scripts" / "sync_manifest_keyframes_to_comfy_input.py"
    render_py = video_root / "scripts" / "comfy_batch_render.py"
    learn_py = video_root / "pipeline" / "scripts" / "learn_from_run.py"
    evaluate_py = video_root / "pipeline" / "scripts" / "evaluate_renders.py"
    package_py = video_root / "pipeline" / "scripts" / "package_for_youtube.py"
    tts_py = video_root / "pipeline" / "scripts" / "generate_tts_from_prepro.py"
    build_manifest_py = video_root / "pipeline" / "scripts" / "build_shot_manifest_from_prepro.py"
    kontext_py = video_root / "pipeline" / "scripts" / "generate_kontext_keyframes.py"

    # ── Stage 0: Preproduction (TTS → timing-synced manifest) ──────────
    if args.prepro_manifest:
        print(f"[STAGE 0] Preproduction from {args.prepro_manifest}")

        if not args.prepro_manifest.exists():
            raise RuntimeError(f"Prepro manifest not found: {args.prepro_manifest}")

        # Step 0a: Generate TTS narration (writes actual_duration_sec back to prepro manifest)
        if not args.skip_tts:
            tts_cmd = [
                "python3", str(tts_py),
                "--prepro-manifest", str(args.prepro_manifest),
                "--backend", args.tts_backend,
                "--language", args.tts_language,
            ]
            if args.tts_voice:
                tts_cmd.extend(["--voice", args.tts_voice])
            print("[STAGE 0a] Generating TTS narration...")
            tts_out = _run(tts_cmd)
            print(tts_out.strip())

            # Extract voiceover path from TTS output
            for line in tts_out.splitlines():
                if "[OK] master voiceover:" in line:
                    vo_path = Path(line.split("[OK] master voiceover:")[-1].strip())
                    if vo_path.exists() and not args.voiceover:
                        args.voiceover = vo_path
                        print(f"[STAGE 0a] Auto-detected voiceover: {vo_path}")

        # Step 0b: Rebuild shot manifest with TTS-actual timing
        print("[STAGE 0b] Rebuilding shot manifest with TTS timing...")
        rebuild_cmd = [
            "python3", str(build_manifest_py),
            "--prepro-manifest", str(args.prepro_manifest),
            "--timing-source", "tts_actual",
            "--out-manifest", str(args.manifest),
        ]
        rebuild_out = _run(rebuild_cmd)
        print(rebuild_out.strip())

    # Resolve BGM from catalog
    if args.bgm_id and not args.bgm:
        import sys
        sys.path.insert(0, str(video_root / "pipeline" / "scripts"))
        from audio_catalog import load_catalog, select_bgm

        catalog = load_catalog(video_root / "pipeline" / "audio_catalog.json")
        bgm_entry = select_bgm(catalog, bgm_id=args.bgm_id, assets_root=video_root)
        if bgm_entry is None:
            raise RuntimeError(f"BGM catalog ID not found: {args.bgm_id}")
        args.bgm = Path(bgm_entry["path"])
        print(f"[OK] BGM from catalog: {args.bgm_id} → {args.bgm}")

    # ── Stage 0c: Kontext Keyframe Generation ────────────────────────
    if args.golden_ref and not args.skip_kontext:
        print(f"[STAGE 0c] Generating Kontext keyframes (golden_ref={args.golden_ref})")
        kontext_output = args.kontext_output_dir or (args.output_root / "kontext_keyframes")
        kontext_cmd = [
            "python3", str(kontext_py),
            "--manifest", str(args.manifest),
            "--golden-ref", args.golden_ref,
            "--output-dir", str(kontext_output),
            "--server", args.server,
            "--guidance", str(args.kontext_guidance),
        ]
        # Default ComfyUI input dir
        comfy_input = Path("/home/hugh/ComfyUI/app/input")
        if comfy_input.exists():
            kontext_cmd.extend(["--comfy-input", str(comfy_input)])
        kontext_out = _run(kontext_cmd)
        print(kontext_out.strip())

    # ── Stage 0d: 3D Scene Pre-render (claymation via Blender harness) ──
    claymation_py = video_root / "pipeline" / "scripts" / "generate_claymation_scenes.py"
    if args.use_claymation_harness and claymation_py.exists():
        print("[STAGE 0d] Claymation pre-render via Blender harness...")
        clay_output = args.output_root / "claymation"
        clay_cmd = [
            "python3", str(claymation_py),
            "--manifest", str(args.manifest),
            "--output-dir", str(clay_output),
        ]
        if args.use_claymation_harness:
            clay_cmd.append("--use-harness")
        clay_out = _run(clay_cmd)
        print(clay_out.strip())

    # ── Stage 0e: Explainer Pre-render (via Inkscape harness) ─────────
    explainer_py = video_root / "pipeline" / "scripts" / "generate_explainer_graphics.py"
    if args.use_explainer_harness and explainer_py.exists():
        print("[STAGE 0e] Explainer pre-render via Inkscape harness...")
        expl_output = args.output_root / "explainer"
        expl_cmd = [
            "python3", str(explainer_py),
            "--manifest", str(args.manifest),
            "--output-dir", str(expl_output),
        ]
        if args.use_explainer_harness:
            expl_cmd.append("--use-harness")
        expl_out = _run(expl_cmd)
        print(expl_out.strip())

    # ── Stage 1: Render ────────────────────────────────────────────────
    if args.skip_render:
        if args.run_dir is None:
            raise RuntimeError("--skip-render requires --run-dir")
        run_dir = args.run_dir
    else:
        _run(["bash", str(run_server_sh), "--detach"])
        if not args.no_sync_keyframes:
            sync_cmd = [
                "python3",
                str(sync_keyframes_py),
                "--manifest",
                str(args.manifest),
            ]
            for d in args.keyframe_search_dir or []:
                sync_cmd.extend(["--search-dir", d])
            _run(sync_cmd)
        render_cmd = [
                "python3",
                str(render_py),
                "--manifest",
                str(args.manifest),
                "--workflow",
                str(args.workflow),
                "--bindings",
                str(args.bindings),
                "--output-root",
                str(args.output_root),
                "--server",
                args.server,
                "--timeout-sec",
                str(args.render_timeout_sec),
                "--poll-sec",
                str(args.render_poll_sec),
        ]
        if args.force_render:
            render_cmd.append("--force-render")
        render_out = _run(render_cmd)
        run_dir = _extract_run_dir(render_out)

    _run(
        [
            "python3",
            str(learn_py),
            "--run-dir",
            str(run_dir),
            "--duration-policy",
            "unchanged",
        ]
    )

    # ── Stage 1b: Image Post-process ────────────────────────────────
    if args.image_postprocess:
        print("[STAGE 1b] Image post-processing on renders...")
        image_pp_py = video_root / "pipeline" / "scripts" / "image_postprocess.py"
        if image_pp_py.exists():
            pp_output = run_dir / "postprocessed"
            pp_cmd = [
                "python3", str(image_pp_py),
                "--input-dir", str(run_dir),
                "--output-dir", str(pp_output),
            ]
            pp_out = _run(pp_cmd)
            print(pp_out.strip())

    # --- Vision QA evaluation ---
    if not args.skip_evaluate:
        evaluate_cmd = [
            "python3",
            str(evaluate_py),
            "--run-dir",
            str(run_dir),
            "--manifest",
            str(args.manifest),
            "--provider",
            args.evaluate_provider,
            "--assets-guide",
            str(args.evaluate_assets_guide),
            "--min-score",
            str(args.evaluate_min_score),
            "--frames",
            str(args.evaluate_frames),
            "--timeout-sec",
            str(args.evaluate_timeout_sec),
            "--retries",
            str(args.evaluate_retries),
            "--retry-delay-sec",
            str(args.evaluate_retry_delay_sec),
            "--temperature",
            str(args.evaluate_temperature),
        ]
        if args.evaluate_label:
            evaluate_cmd.extend(["--evaluation-label", args.evaluate_label])
        if args.evaluate_overwrite:
            evaluate_cmd.append("--overwrite")
        eval_out = _run(evaluate_cmd)
        print(eval_out.strip())

        if args.evaluate_strict:
            import json as _json

            summary_name = "evaluations_summary.json"
            if args.evaluate_label:
                safe_label = re.sub(r"[^a-zA-Z0-9._-]+", "_", args.evaluate_label.strip()).strip("._-")
                summary_name = f"evaluations_summary_{safe_label}.json"
            eval_summary_path = run_dir / summary_name
            if eval_summary_path.exists():
                with eval_summary_path.open("r", encoding="utf-8") as _f:
                    eval_summary = _json.load(_f)
                fail_count = int(eval_summary.get("fail", 0))
                if fail_count > 0:
                    raise RuntimeError(
                        f"[FAIL] --evaluate-strict: {fail_count} shot(s) failed vision QA. "
                        f"See {eval_summary_path}"
                    )

    # ── Auto-correct failed shots (opt-in) ──────────────────────
    if args.auto_correct and not args.skip_evaluate:
        qa_agent_py = video_root / "pipeline" / "scripts" / "qa_correction_agent.py"
        if qa_agent_py.exists():
            summary_name = "evaluations_summary.json"
            if args.evaluate_label:
                safe_label = re.sub(r"[^a-zA-Z0-9._-]+", "_", args.evaluate_label.strip()).strip("._-")
                summary_name = f"evaluations_summary_{safe_label}.json"
            eval_summary_path = run_dir / summary_name
            if eval_summary_path.exists():
                corrected_manifest = run_dir / "corrected_manifest.json"
                qa_cmd = [
                    "python3", str(qa_agent_py),
                    "--evaluations", str(eval_summary_path),
                    "--manifest", str(args.manifest),
                    "--output", str(corrected_manifest),
                    "--max-attempts", str(args.auto_correct_max_attempts),
                    "--re-render",
                    "--server", args.server,
                    "--workflow", str(args.workflow),
                    "--bindings", str(args.bindings),
                    "--output-root", str(args.output_root),
                ]
                print(f"[QA] Running auto-correction agent...")
                qa_out = _run(qa_cmd)
                print(qa_out.strip())

    # ── Stage 3b: Audio Mastering (Audacity harness) ────────────────────
    if args.audio_master != "none" and args.voiceover and args.voiceover.exists():
        print(f"[STAGE 3b] Audio mastering ({args.audio_master}) via Audacity harness...")
        import sys as _sys
        _sys.path.insert(0, str(video_root / "pipeline" / "scripts"))
        from audio_postprocess import apply_podcast_master, apply_youtube_voice_master
        mastered_vo = args.voiceover.parent / f"{args.voiceover.stem}_mastered{args.voiceover.suffix}"
        if args.audio_master == "podcast":
            result = apply_podcast_master(args.voiceover, mastered_vo)
        else:
            result = apply_youtube_voice_master(args.voiceover, mastered_vo)
        if mastered_vo.exists():
            print(f"[STAGE 3b] Mastered: {mastered_vo} ({result.get('engine', 'unknown')})")
            args.voiceover = mastered_vo
        else:
            print(f"[WARN] Mastering output not found, using original VO")

    package_cmd = [
        "python3",
        str(package_py),
        "--manifest",
        str(args.manifest),
        "--run-dir",
        str(run_dir),
        "--teaser-sec",
        str(max(1, args.teaser_sec)),
    ]
    if args.blog_source:
        package_cmd.extend(["--blog-source", str(args.blog_source)])
    if args.twitter_queue:
        package_cmd.extend(["--twitter-queue", str(args.twitter_queue)])
    if args.title:
        package_cmd.extend(["--title", args.title])
    if args.voiceover:
        package_cmd.extend(["--voiceover", str(args.voiceover)])
    if args.bgm:
        package_cmd.extend(["--bgm", str(args.bgm)])
    package_cmd.extend(["--voiceover-volume", str(args.voiceover_volume)])
    package_cmd.extend(["--bgm-volume", str(args.bgm_volume)])
    if args.assembler != "ffmpeg":
        package_cmd.extend(["--assembler", args.assembler])
    if args.checklist_strict:
        package_cmd.append("--checklist-strict")
    if args.no_transitions:
        package_cmd.append("--no-transitions")
    else:
        package_cmd.extend(["--transition", args.transition])
        package_cmd.extend(["--transition-duration", str(args.transition_duration)])
    if args.intro_text:
        package_cmd.extend(["--intro-text", args.intro_text])
    if args.outro_text:
        package_cmd.extend(["--outro-text", args.outro_text])
    if args.subtitles:
        package_cmd.append("--subtitles")
        package_cmd.extend(["--subtitle-lang", args.subtitle_lang])
    if args.subtitle_text_ko:
        package_cmd.extend(["--subtitle-text-ko", args.subtitle_text_ko])
    if args.subtitle_text_en:
        package_cmd.extend(["--subtitle-text-en", args.subtitle_text_en])
    if args.subtitle_font_ko:
        package_cmd.extend(["--subtitle-font-ko", args.subtitle_font_ko])
    if args.subtitle_font_en:
        package_cmd.extend(["--subtitle-font-en", args.subtitle_font_en])
    if args.subtitle_fonts_dir:
        package_cmd.extend(["--subtitle-fonts-dir", str(args.subtitle_fonts_dir)])
    if args.skip_subtitle_font_bootstrap:
        package_cmd.append("--skip-subtitle-font-bootstrap")
    package_cmd.extend(["--subtitle-format", args.subtitle_format])
    if args.bgm_id:
        package_cmd.extend(["--bgm-id", args.bgm_id])
    if args.audio_ducking:
        package_cmd.append("--audio-ducking")
        package_cmd.extend(["--duck-threshold", str(args.duck_threshold)])
        package_cmd.extend(["--duck-ratio", str(args.duck_ratio)])
    if args.color_normalize:
        package_cmd.append("--color-normalize")
        package_cmd.extend(["--color-method", args.color_method])
    if args.color_reference:
        package_cmd.extend(["--color-reference", str(args.color_reference)])
    if args.final_quality_check:
        package_cmd.append("--final-quality-check")
    if args.quality_check_strict:
        package_cmd.append("--quality-check-strict")
    if args.scene_chapters:
        package_cmd.append("--scene-chapters")
    package_cmd.extend(["--silence-duration", str(args.silence_duration)])
    package_cmd.extend(["--silence-noise-db", str(args.silence_noise_db)])
    if args.gimp_thumbnail:
        package_cmd.append("--gimp-thumbnail")

    package_out = _run(package_cmd)

    print(f"[OK] render run dir: {run_dir}")
    print(package_out.strip())

    # ── A/B Test (opt-in) ──────────────────────────────────────────
    if args.ab_test:
        print("[A/B] Running harness vs legacy comparison...")
        ab_py = video_root / "pipeline" / "scripts" / "ab_test_stages.py"
        if ab_py.exists():
            ab_output = run_dir / "ab_test_results"
            ab_cmd = [
                "python3", str(ab_py),
                "--all",
                "--input-dir", str(run_dir),
                "--output-dir", str(ab_output),
            ]
            if args.title:
                ab_cmd.extend(["--title", args.title])
            try:
                ab_out = _run(ab_cmd)
                print(ab_out.strip())
            except Exception as e:
                print(f"[WARN] A/B test failed (non-fatal): {e}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
