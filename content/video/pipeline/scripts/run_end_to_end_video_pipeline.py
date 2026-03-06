#!/usr/bin/env python3
"""Run end-to-end video pipeline: render -> QA analysis -> YouTube package."""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path


RUN_DIR_PATTERN = re.compile(r"\[OK\] run dir:\s*(.+)")
DEFAULT_EVALUATE_ASSETS_GUIDE = Path("/mnt/e/vibecode-blog/content/video/planning/03-visual_assets_guide.md")


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
        default=Path("/mnt/e/vibecode-blog/content/video/output/renders"),
    )
    parser.add_argument(
        "--server",
        default="http://127.0.0.1:8188",
    )
    parser.add_argument(
        "--video-root",
        type=Path,
        default=Path("/mnt/e/vibecode-blog/content/video"),
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
    parser.add_argument("--evaluate-label", default=None, help="Optional suffix for evaluation output files")
    parser.add_argument("--evaluate-overwrite", action="store_true", help="Overwrite existing evaluation outputs")
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
    parser.add_argument("--subtitle-fonts-dir", type=Path, default=Path("/mnt/e/vibecode-blog/content/video/assets/fonts"))
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
    args = parser.parse_args()

    video_root = args.video_root
    run_server_sh = video_root / "scripts" / "run_comfy_server.sh"
    sync_keyframes_py = video_root / "pipeline" / "scripts" / "sync_manifest_keyframes_to_comfy_input.py"
    render_py = video_root / "scripts" / "comfy_batch_render.py"
    learn_py = video_root / "pipeline" / "scripts" / "learn_from_run.py"
    evaluate_py = video_root / "pipeline" / "scripts" / "evaluate_renders.py"
    package_py = video_root / "pipeline" / "scripts" / "package_for_youtube.py"

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
        render_out = _run(
            [
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
            ]
        )
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

    package_out = _run(package_cmd)

    print(f"[OK] render run dir: {run_dir}")
    print(package_out.strip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
