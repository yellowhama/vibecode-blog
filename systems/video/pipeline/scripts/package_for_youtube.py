#!/usr/bin/env python3
"""Create a YouTube-ready package from a validated Comfy render run.

Package contents:
- assembled final mp4 with xfade transitions (or hardcut fallback)
- teaser clip (default: 30s)
- thumbnail image (best-frame selection with optional title overlay)
- youtube metadata json/md (title, description, scene-based chapters)
- package manifest json
- optional narrated mix (voiceover + optional bgm with sidechain ducking)
- optional burned-in subtitles (ko/en/dual via stable-ts alignment)
- optional color normalization across clips
- final quality check (blackdetect, freezedetect, silencedetect)
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".webm"}
CHECK_STATUS_PASS = "pass"
CHECK_STATUS_FAIL = "fail"
CHECK_STATUS_NA = "na"


@dataclass
class Clip:
    shot_id: str
    source_path: Path
    local_path: Path
    duration_sec: float


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _json_load_if_exists(path: Path) -> Dict[str, Any] | None:
    if not path.exists():
        return None
    return _json_load(path)


def _run(cmd: List[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )


def _run_out(cmd: List[str]) -> str:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            "Command failed:\n"
            + " ".join(cmd)
            + f"\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )
    return proc.stdout.strip()


def _probe_duration_sec(path: Path) -> float:
    out = _run_out(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ]
    )
    try:
        return max(0.0, float(out))
    except ValueError:
        return 0.0


def _render_teaser(source_video: Path, output_path: Path, teaser_sec: int) -> Path:
    _run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(source_video),
            "-t",
            str(max(1, teaser_sec)),
            "-c",
            "copy",
            str(output_path),
        ]
    )
    return output_path


def _fmt_ts(sec: float) -> str:
    s = int(max(0, round(sec)))
    hh = s // 3600
    mm = (s % 3600) // 60
    ss = s % 60
    return f"{hh:02d}:{mm:02d}:{ss:02d}"


def _pick_video_file(saved_files: List[str]) -> Path | None:
    for raw in saved_files:
        p = Path(raw)
        if p.exists() and p.suffix.lower() in VIDEO_EXTS:
            return p
    return None


def _validate_and_collect_clips(
    manifest: Dict[str, Any],
    render_log: Dict[str, Any],
    learning: Dict[str, Any] | None,
) -> List[Clip]:
    shot_to_rec: Dict[str, Dict[str, Any]] = {}
    for rec in render_log.get("shots", []):
        shot_to_rec[str(rec.get("shot_id", ""))] = rec

    learning_shot: Dict[str, Dict[str, Any]] = {}
    if learning:
        for rec in learning.get("shots", []):
            learning_shot[str(rec.get("shot_id", ""))] = rec

    clips: List[Clip] = []
    for idx, shot in enumerate(manifest.get("shots", []), start=1):
        shot_id = str(shot.get("shot_id"))
        rec = shot_to_rec.get(shot_id)
        if not rec:
            raise RuntimeError(f"missing shot in render_log: {shot_id}")
        if rec.get("status") != "ok":
            raise RuntimeError(f"shot not ok: {shot_id} status={rec.get('status')}")
        if int(rec.get("artifact_count", 0)) <= 0:
            raise RuntimeError(f"shot artifact_count invalid: {shot_id}")

        media = _pick_video_file(rec.get("saved_files", []))
        if media is None:
            raise RuntimeError(f"no saved video file for shot: {shot_id}")

        if learning:
            lrec = learning_shot.get(shot_id)
            if not lrec:
                raise RuntimeError(f"missing shot in learning_analysis: {shot_id}")
            if bool(lrec.get("noise_collapse", False)):
                raise RuntimeError(f"noise collapse detected: {shot_id}")
            if bool(lrec.get("black_collapse", False)):
                raise RuntimeError(f"black collapse detected: {shot_id}")

        clips.append(
            Clip(
                shot_id=shot_id,
                source_path=media,
                local_path=Path(f"{idx:02d}_{shot_id}{media.suffix.lower()}"),
                duration_sec=_probe_duration_sec(media),
            )
        )

    return clips


def _build_chapters(manifest: Dict[str, Any]) -> List[Dict[str, Any]]:
    chapters: List[Dict[str, Any]] = []
    cursor = 0.0
    for shot in manifest.get("shots", []):
        shot_id = str(shot.get("shot_id"))
        purpose = str(shot.get("purpose", "")).strip()
        chapters.append(
            {
                "time_sec": round(cursor, 3),
                "timecode": _fmt_ts(cursor),
                "title": f"{shot_id} - {purpose}" if purpose else shot_id,
            }
        )
        cursor += float(shot.get("duration_sec", 0))
    return chapters


def _as_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _contains_placeholder(text: str | None) -> bool:
    if not text:
        return False
    return ("<" in text and ">" in text) or ("<blog_url_here>" in text) or ("<twitter_thread_url_here>" in text)


def _add_check(
    checks: List[Dict[str, Any]],
    *,
    check_id: str,
    title: str,
    result: str,
    required: bool,
    expected: str,
    actual: str,
    details: str,
) -> None:
    if result not in {CHECK_STATUS_PASS, CHECK_STATUS_FAIL, CHECK_STATUS_NA}:
        raise ValueError(f"invalid check result: {result}")
    checks.append(
        {
            "id": check_id,
            "title": title,
            "required": required,
            "result": result,
            "expected": expected,
            "actual": actual,
            "details": details,
        }
    )


def _build_upload_checklist(
    *,
    package_dir: Path,
    meta: Dict[str, Any],
    render_log: Dict[str, Any],
    learning: Dict[str, Any] | None,
    evaluations: Dict[str, Any] | None,
    voiceover_quality: Dict[str, Any] | None,
    voiceover_timing: Dict[str, Any] | None,
    args: argparse.Namespace,
) -> Dict[str, Any]:
    checks: List[Dict[str, Any]] = []

    # 1. Technical Render Check
    render_summary = render_log.get("summary") or {}
    render_errors = int(render_summary.get("errors", 0))
    _add_check(
        checks,
        check_id="render_summary_errors",
        title="Render summary has zero errors",
        result=CHECK_STATUS_PASS if render_errors == 0 else CHECK_STATUS_FAIL,
        required=True,
        expected="errors == 0",
        actual=f"errors == {render_errors}",
        details="Derived from render_log.json summary.",
    )

    # 2. BadCut Detection (Hard Gate)
    bad_cuts: List[str] = []
    if evaluations:
        for shot_id, eval_data in evaluations.get("shots", {}).items():
            failed_metrics = eval_data.get("failed_metrics", [])
            if "BadCut" in failed_metrics:
                bad_cuts.append(shot_id)
    
    _add_check(
        checks,
        check_id="bad_cut_gate",
        title="Zero BadCuts detected by PySceneDetect",
        result=CHECK_STATUS_PASS if not bad_cuts else CHECK_STATUS_FAIL,
        required=True,
        expected="bad_cuts == 0",
        actual=f"bad_cuts == {len(bad_cuts)} ({', '.join(bad_cuts)})",
        details="Automated scene detection found unintended cuts within single shots.",
    )

    invalid_shots: List[str] = []
    for shot in render_log.get("shots", []):
        shot_id = str(shot.get("shot_id", "unknown"))
        status_ok = shot.get("status") == "ok"
        artifact_ok = int(shot.get("artifact_count", 0)) > 0
        if not status_ok or not artifact_ok:
            invalid_shots.append(f"{shot_id}(status={shot.get('status')},artifact={shot.get('artifact_count')})")
    _add_check(
        checks,
        check_id="shot_integrity",
        title="All shots have status=ok and artifact_count>0",
        result=CHECK_STATUS_PASS if not invalid_shots else CHECK_STATUS_FAIL,
        required=True,
        expected="all shots valid",
        actual="all valid" if not invalid_shots else ", ".join(invalid_shots),
        details="False positive render protection gate.",
    )

    if learning:
        lsum = learning.get("summary") or {}
        visual_fail_rate = float(lsum.get("visual_fail_rate", 0.0))
        noise_rate = float(lsum.get("noise_collapse_rate", 0.0))
        black_rate = float(lsum.get("black_collapse_rate", 0.0))
        visual_ok = visual_fail_rate <= args.check_max_visual_fail_rate
        noise_ok = noise_rate <= args.check_max_noise_collapse_rate
        black_ok = black_rate <= args.check_max_black_collapse_rate
        _add_check(
            checks,
            check_id="visual_quality_gate",
            title="Visual QA collapse gates pass",
            result=CHECK_STATUS_PASS if (visual_ok and noise_ok and black_ok) else CHECK_STATUS_FAIL,
            required=True,
            expected=(
                f"visual<={args.check_max_visual_fail_rate:.3f},"
                f" noise<={args.check_max_noise_collapse_rate:.3f},"
                f" black<={args.check_max_black_collapse_rate:.3f}"
            ),
            actual=f"visual={visual_fail_rate:.3f}, noise={noise_rate:.3f}, black={black_rate:.3f}",
            details="Derived from learning_analysis.json summary.",
        )
    else:
        _add_check(
            checks,
            check_id="visual_quality_gate",
            title="Visual QA collapse gates pass",
            result=CHECK_STATUS_FAIL,
            required=True,
            expected="learning_analysis.json exists and rates under threshold",
            actual="learning_analysis.json missing",
            details="Run learn_from_run.py before publishing.",
        )

    required_files = [
        Path(str(meta.get("final_video", ""))),
        Path(str(meta.get("teaser_video", ""))),
        Path(str(meta.get("thumbnail", ""))),
        package_dir / "metadata" / "youtube_metadata.json",
        package_dir / "metadata" / "youtube_metadata.md",
    ]
    missing_files = [str(p) for p in required_files if not str(p) or not p.exists()]
    _add_check(
        checks,
        check_id="package_assets",
        title="Required package assets exist",
        result=CHECK_STATUS_PASS if not missing_files else CHECK_STATUS_FAIL,
        required=True,
        expected="final/teaser/thumbnail/metadata present",
        actual="all present" if not missing_files else ", ".join(missing_files),
        details="File-system existence gate.",
    )

    title = str(meta.get("title", "")).strip()
    description = str(meta.get("description", "")).strip()
    title_desc_ok = bool(
        title
        and description
        and not _contains_placeholder(title)
        and "<blog_url_here>" not in description
    )
    _add_check(
        checks,
        check_id="metadata_fields",
        title="Title/description are non-empty and non-placeholder",
        result=CHECK_STATUS_PASS if title_desc_ok else CHECK_STATUS_FAIL,
        required=True,
        expected="real title + description without placeholders",
        actual="valid" if title_desc_ok else "missing/placeholder detected",
        details="Prevents accidental placeholder upload text.",
    )

    blog_source = str(meta.get("blog_source") or "").strip()
    blog_ok = bool(blog_source and not _contains_placeholder(blog_source))
    _add_check(
        checks,
        check_id="blog_source_link",
        title="Blog source reference is set",
        result=CHECK_STATUS_PASS if blog_ok else CHECK_STATUS_FAIL,
        required=True,
        expected="blog_source set",
        actual=blog_source or "<empty>",
        details="YouTube description should map back to source post.",
    )

    chapters = meta.get("chapters") or []
    chapter_ok = bool(chapters) and str((chapters[0] or {}).get("timecode", "")) == "00:00:00"
    _add_check(
        checks,
        check_id="chapter_integrity",
        title="Chapter list exists and starts at 00:00:00",
        result=CHECK_STATUS_PASS if chapter_ok else CHECK_STATUS_FAIL,
        required=True,
        expected="chapters[0].timecode == 00:00:00",
        actual=(chapters[0] or {}).get("timecode", "<missing>") if chapters else "<none>",
        details="Basic chapter formatting gate.",
    )

    twitter_ref = str(meta.get("twitter_queue") or "").strip()
    if twitter_ref:
        twitter_ok = not _contains_placeholder(twitter_ref)
        _add_check(
            checks,
            check_id="twitter_reference",
            title="Twitter/X thread reference is non-placeholder",
            result=CHECK_STATUS_PASS if twitter_ok else CHECK_STATUS_FAIL,
            required=False,
            expected="twitter reference without placeholders",
            actual=twitter_ref,
            details="Optional but recommended for cross-channel funnel.",
        )
    else:
        _add_check(
            checks,
            check_id="twitter_reference",
            title="Twitter/X thread reference is non-placeholder",
            result=CHECK_STATUS_NA,
            required=False,
            expected="twitter reference optional",
            actual="<not set>",
            details="No twitter queue link provided.",
        )

    if meta.get("voiceover"):
        timing_summary = (voiceover_timing or {}).get("summary") if voiceover_timing else None
        if timing_summary:
            violation_rate = float(timing_summary.get("violation_rate", 0.0))
            timing_ok = violation_rate <= args.check_max_tts_violation_rate
            _add_check(
                checks,
                check_id="voiceover_timing_gate",
                title="Voiceover timing violations are under threshold",
                result=CHECK_STATUS_PASS if timing_ok else CHECK_STATUS_FAIL,
                required=True,
                expected=f"violation_rate <= {args.check_max_tts_violation_rate:.3f}",
                actual=f"violation_rate == {violation_rate:.3f}",
                details="Derived from timing_alignment_report.json summary.",
            )
        else:
            _add_check(
                checks,
                check_id="voiceover_timing_gate",
                title="Voiceover timing violations are under threshold",
                result=CHECK_STATUS_NA,
                required=False,
                expected="timing report present",
                actual="timing report missing",
                details="Voiceover provided without timing report.",
            )

        vdetect = (voiceover_quality or {}).get("volumedetect") if voiceover_quality else None
        mean_db = _as_float((vdetect or {}).get("mean_volume_db"))
        max_db = _as_float((vdetect or {}).get("max_volume_db"))
        if mean_db is not None and max_db is not None:
            mean_ok = args.check_audio_mean_db_min <= mean_db <= args.check_audio_mean_db_max
            peak_ok = max_db <= args.check_audio_peak_db_max
            _add_check(
                checks,
                check_id="voiceover_loudness_gate",
                title="Voiceover loudness/peak in target range",
                result=CHECK_STATUS_PASS if (mean_ok and peak_ok) else CHECK_STATUS_FAIL,
                required=False,
                expected=(
                    f"mean in [{args.check_audio_mean_db_min:.1f}, {args.check_audio_mean_db_max:.1f}] dB, "
                    f"max <= {args.check_audio_peak_db_max:.1f} dB"
                ),
                actual=f"mean={mean_db:.1f} dB, max={max_db:.1f} dB",
                details="Advisory audio gate from voiceover_quality_report.json.",
            )
        else:
            _add_check(
                checks,
                check_id="voiceover_loudness_gate",
                title="Voiceover loudness/peak in target range",
                result=CHECK_STATUS_NA,
                required=False,
                expected="quality report with mean/max volume",
                actual="quality report missing/incomplete",
                details="Voiceover provided without quality report.",
            )
    else:
        _add_check(
            checks,
            check_id="voiceover_timing_gate",
            title="Voiceover timing violations are under threshold",
            result=CHECK_STATUS_NA,
            required=False,
            expected="voiceover optional",
            actual="<no voiceover>",
            details="Narration not included in this package.",
        )
        _add_check(
            checks,
            check_id="voiceover_loudness_gate",
            title="Voiceover loudness/peak in target range",
            result=CHECK_STATUS_NA,
            required=False,
            expected="voiceover optional",
            actual="<no voiceover>",
            details="Narration not included in this package.",
        )

    manual_checks: List[Dict[str, Any]] = [
        {
            "id": "manual_thumbnail_review",
            "title": "Thumbnail readability and face/object clarity checked",
            "status": "todo",
        },
        {
            "id": "manual_metadata_tone",
            "title": "Title/description/hashtags tone matched to channel style",
            "status": "todo",
        },
        {
            "id": "manual_rights_clearance",
            "title": "Music/asset usage rights verified for upload",
            "status": "todo",
        },
        {
            "id": "manual_subtitles",
            "title": "Subtitles (ko/en as needed) generated and attached",
            "status": "todo",
        },
        {
            "id": "manual_cards_endscreen",
            "title": "Cards/end-screen links configured in YouTube Studio",
            "status": "todo",
        },
        {
            "id": "manual_pinned_comment",
            "title": "Pinned comment and blog link CTA prepared",
            "status": "todo",
        },
    ]

    blocking_failures = sum(1 for c in checks if c["required"] and c["result"] == CHECK_STATUS_FAIL)
    optional_failures = sum(1 for c in checks if (not c["required"]) and c["result"] == CHECK_STATUS_FAIL)
    auto_passed = sum(1 for c in checks if c["result"] == CHECK_STATUS_PASS)
    auto_na = sum(1 for c in checks if c["result"] == CHECK_STATUS_NA)
    upload_gate_passed = blocking_failures == 0

    next_actions: List[str] = []
    for c in checks:
        if c["required"] and c["result"] == CHECK_STATUS_FAIL:
            next_actions.append(f"[REQUIRED] {c['title']}: {c['actual']}")
    for c in checks:
        if (not c["required"]) and c["result"] == CHECK_STATUS_FAIL:
            next_actions.append(f"[OPTIONAL] {c['title']}: {c['actual']}")
    if not next_actions:
        next_actions.append("Auto gates passed. Complete manual checklist before upload.")

    return {
        "generated_at": datetime.now().isoformat(),
        "package_dir": str(package_dir),
        "strict_mode": bool(args.checklist_strict),
        "thresholds": {
            "max_visual_fail_rate": args.check_max_visual_fail_rate,
            "max_noise_collapse_rate": args.check_max_noise_collapse_rate,
            "max_black_collapse_rate": args.check_max_black_collapse_rate,
            "max_tts_violation_rate": args.check_max_tts_violation_rate,
            "audio_mean_db_min": args.check_audio_mean_db_min,
            "audio_mean_db_max": args.check_audio_mean_db_max,
            "audio_peak_db_max": args.check_audio_peak_db_max,
        },
        "overview": {
            "auto_total": len(checks),
            "auto_passed": auto_passed,
            "auto_na": auto_na,
            "auto_failed_total": len(checks) - auto_passed - auto_na,
            "blocking_failures": blocking_failures,
            "optional_failures": optional_failures,
            "upload_gate_passed": upload_gate_passed,
            "manual_todo_count": len(manual_checks),
        },
        "auto_checks": checks,
        "manual_checks": manual_checks,
        "next_actions": next_actions,
    }


def _checklist_to_markdown(data: Dict[str, Any]) -> str:
    ov = data["overview"]
    lines = [
        "# YouTube Upload Checklist",
        "",
        "## Gate Summary",
        f"- generated_at: `{data['generated_at']}`",
        f"- strict_mode: `{data['strict_mode']}`",
        f"- upload_gate_passed: `{ov['upload_gate_passed']}`",
        f"- blocking_failures: `{ov['blocking_failures']}`",
        f"- optional_failures: `{ov['optional_failures']}`",
        f"- auto_checks: `{ov['auto_passed']}/{ov['auto_total']}` pass (`na={ov['auto_na']}`)",
        "",
        "## Auto Checks",
        "| id | required | result | expected | actual | details |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for c in data.get("auto_checks", []):
        details = str(c.get("details", "")).replace("|", "/")
        lines.append(
            f"| {c['id']} | {c['required']} | {c['result']} | {c['expected']} | {c['actual']} | {details} |"
        )
    lines.extend(
        [
            "",
            "## Manual Checklist",
        ]
    )
    for m in data.get("manual_checks", []):
        lines.append(f"- [ ] {m['title']} (`{m['id']}`)")
    lines.extend(
        [
            "",
            "## Next Actions",
        ]
    )
    for item in data.get("next_actions", []):
        lines.append(f"- {item}")
    lines.append("")
    return "\n".join(lines)


def _assemble_with_mlt(
    clips: List[Path],
    output_path: Path,
    transition: str = "fade",
    transition_dur: float = 1.0,
    color_grade: dict | None = None,
) -> Path:
    """Assemble clips using Shotcut/melt via CLI-Anything harness.

    Falls back to FFmpeg xfade if the harness is unavailable or fails.
    """
    try:
        from cli_anything_bridge import AVAILABLE_TOOLS, ShotcutSession
    except ImportError:
        print("[WARN] cli_anything_bridge not found — falling back to FFmpeg")
        from video_assembler import assemble_with_transitions
        assemble_with_transitions(clips=clips, transition=transition,
                                  transition_duration=transition_dur, output_path=output_path)
        return output_path

    if "shotcut" not in AVAILABLE_TOOLS:
        print("[WARN] Shotcut harness not available — falling back to FFmpeg")
        from video_assembler import assemble_with_transitions
        assemble_with_transitions(clips=clips, transition=transition,
                                  transition_duration=transition_dur, output_path=output_path)
        return output_path

    print(f"[POST] mlt assembly ({len(clips)} clips, transition={transition}, dur={transition_dur}s)...")
    try:
        with ShotcutSession() as sess:
            sess.project_new(profile="hd1080p30")
            sess.track_add("video")
            for clip_path in clips:
                sess.clip_add(str(clip_path), track=1)
            if len(clips) > 1:
                sess.transition_add(transition, duration=transition_dur)
            if color_grade:
                brightness = color_grade.get("brightness", 1.05)
                sess.filter_add("brightness", level=brightness)
            sess.export_render(str(output_path), preset="h264-high")

        if output_path.exists():
            print(f"[OK] mlt assembly → {output_path}")
            return output_path

        raise RuntimeError("mlt output not found")
    except Exception as e:
        print(f"[WARN] mlt assembly failed ({e}) — falling back to FFmpeg")
        from video_assembler import assemble_with_transitions
        assemble_with_transitions(clips=clips, transition=transition,
                                  transition_duration=transition_dur, output_path=output_path)
        return output_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Package render run for YouTube publishing")
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--run-dir", required=True, type=Path)
    parser.add_argument(
        "--package-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "output" / "youtube_packages",
    )
    parser.add_argument("--blog-source", type=Path, default=None)
    parser.add_argument("--twitter-queue", type=Path, default=None)
    parser.add_argument("--title", default=None)
    parser.add_argument("--channel-name", default="MUSU")
    parser.add_argument("--teaser-sec", type=int, default=30)
    parser.add_argument("--voiceover", type=Path, default=None, help="Narration audio file (wav/mp3/m4a)")
    parser.add_argument("--bgm", type=Path, default=None, help="Optional background music audio file (path or catalog ID)")
    parser.add_argument("--bgm-id", default=None, help="BGM catalog ID (looked up in audio_catalog.json)")
    parser.add_argument("--voiceover-volume", type=float, default=1.0)
    parser.add_argument("--bgm-volume", type=float, default=0.18)
    parser.add_argument("--checklist-strict", action="store_true", help="Fail packaging if required upload gates fail")
    parser.add_argument("--upload", action="store_true", help="Upload to YouTube after packaging")
    parser.add_argument(
        "--upload-privacy",
        default="unlisted",
        choices=["unlisted", "public", "private"],
        help="YouTube upload privacy status (default: unlisted for safety)",
    )
    parser.add_argument("--youtube-credentials", type=Path, default=None, help="Path to YouTube OAuth credentials.json")
    parser.add_argument("--check-max-visual-fail-rate", type=float, default=0.0)
    parser.add_argument("--check-max-noise-collapse-rate", type=float, default=0.0)
    parser.add_argument("--check-max-black-collapse-rate", type=float, default=0.0)
    parser.add_argument("--check-max-tts-violation-rate", type=float, default=0.35)
    parser.add_argument("--check-audio-mean-db-min", type=float, default=-30.0)
    parser.add_argument("--check-audio-mean-db-max", type=float, default=-8.0)
    parser.add_argument("--check-audio-peak-db-max", type=float, default=-0.5)

    # --- Phase A: Transitions ---
    parser.add_argument("--assembler", choices=["ffmpeg", "mlt", "kdenlive"], default="ffmpeg", help="Video assembly backend (default: ffmpeg)")
    parser.add_argument("--gimp-thumbnail", action="store_true", help="Use GIMP harness for thumbnail generation")
    parser.add_argument("--transition", default="fade", help="xfade transition type (default: fade)")
    parser.add_argument("--transition-duration", type=float, default=1.0, help="Transition duration in seconds")
    parser.add_argument("--intro-text", default=None, help="Text overlay on first clip (3s fade)")
    parser.add_argument("--outro-text", default=None, help="Text overlay on last clip (3s fade)")
    parser.add_argument("--no-transitions", action="store_true", help="Use hardcut concat (no xfade)")

    # --- Phase B: Subtitles ---
    parser.add_argument("--subtitles", action="store_true", help="Enable subtitle burn-in")
    parser.add_argument("--subtitle-lang", choices=["ko", "en", "dual"], default="ko", help="Subtitle language")
    parser.add_argument("--subtitle-text-ko", default=None, help="Korean text for subtitle alignment")
    parser.add_argument("--subtitle-text-en", default=None, help="English text for subtitle alignment")
    parser.add_argument("--subtitle-font-ko", default="Noto Sans CJK KR", help="Korean subtitle font")
    parser.add_argument("--subtitle-font-en", default="DejaVu Sans", help="English subtitle font")
    parser.add_argument(
        "--subtitle-fonts-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent.parent / "assets" / "fonts",
        help="Directory containing repo-local subtitle fonts",
    )
    parser.add_argument(
        "--skip-subtitle-font-bootstrap",
        action="store_true",
        help="Do not auto-download repo-local subtitle fonts before subtitle burn-in",
    )
    parser.add_argument(
        "--subtitle-format",
        choices=["ass", "srt", "both"],
        default="ass",
        help="Subtitle output format: ass (burn-in only), srt (external file), both",
    )

    # --- Phase C: Audio ducking ---
    parser.add_argument("--audio-ducking", action="store_true", help="Enable sidechain ducking for BGM")
    parser.add_argument("--duck-threshold", type=float, default=0.02, help="Sidechain compressor threshold")
    parser.add_argument("--duck-ratio", type=float, default=6.0, help="Sidechain compressor ratio")
    parser.add_argument("--simple-audio", action="store_true", help="Skip narrative audio assembly, use simple VO+BGM amix fallback")

    # --- Phase D: Color normalization ---
    parser.add_argument("--color-normalize", action="store_true", help="Enable color normalization across clips")
    parser.add_argument("--color-method", choices=["mkl", "reinhard", "pdf"], default="mkl", help="Color matching method")
    parser.add_argument("--color-reference", type=Path, default=None, help="Reference frame for color matching")

    # --- Phase E: Quality checks ---
    parser.add_argument("--final-quality-check", action="store_true", help="Run blackdetect/freezedetect/silencedetect")
    parser.add_argument("--quality-check-strict", action="store_true", help="Fail if quality check finds issues")
    parser.add_argument("--scene-chapters", action="store_true", help="Group chapters by scene instead of per-shot")
    parser.add_argument("--silence-duration", type=float, default=2.0, help="silencedetect minimum duration in seconds")
    parser.add_argument("--silence-noise-db", type=float, default=-55.0, help="silencedetect noise floor in dB")

    args = parser.parse_args()

    if args.audio_ducking and not args.bgm:
        raise SystemExit("[FAIL] --audio-ducking requires --bgm")
    if args.subtitles and not args.voiceover:
        raise SystemExit("[FAIL] --subtitles requires --voiceover for alignment")
    if args.subtitles and args.subtitle_lang == "ko" and not args.subtitle_text_ko:
        raise SystemExit("[FAIL] --subtitle-lang ko requires --subtitle-text-ko")
    if args.subtitles and args.subtitle_lang == "en" and not args.subtitle_text_en:
        raise SystemExit("[FAIL] --subtitle-lang en requires --subtitle-text-en")
    if args.subtitles and args.subtitle_lang == "dual" and not (args.subtitle_text_ko or args.subtitle_text_en):
        raise SystemExit("[FAIL] --subtitle-lang dual requires at least one of --subtitle-text-ko/--subtitle-text-en")
    if args.quality_check_strict and not args.final_quality_check:
        args.final_quality_check = True

    # Resolve BGM from catalog ID if provided
    if args.bgm_id and not args.bgm:
        from audio_catalog import load_catalog, select_bgm

        catalog = load_catalog()
        bgm_entry = select_bgm(catalog, bgm_id=args.bgm_id)
        if bgm_entry is None:
            raise SystemExit(f"[FAIL] BGM catalog ID not found: {args.bgm_id}")
        args.bgm = Path(bgm_entry["path"])

    manifest = _json_load(args.manifest)
    render_log_path = args.run_dir / "render_log.json"
    if not render_log_path.exists():
        raise SystemExit(f"[FAIL] missing render_log.json: {render_log_path}")
    render_log = _json_load(render_log_path)

    learning_path = args.run_dir / "learning_analysis.json"
    learning = _json_load(learning_path) if learning_path.exists() else None

    evaluations_path = args.run_dir / "evaluations_summary.json"
    evaluations = _json_load(evaluations_path) if evaluations_path.exists() else None

    clips = _validate_and_collect_clips(manifest, render_log, learning)
    chapters = _build_chapters(manifest)

    package_dir = args.package_root / args.run_dir.name
    clips_dir = package_dir / "clips"
    final_dir = package_dir / "final"
    meta_dir = package_dir / "metadata"
    thumbs_dir = package_dir / "thumbnails"
    for p in (clips_dir, final_dir, meta_dir, thumbs_dir):
        p.mkdir(parents=True, exist_ok=True)

    local_clips: List[Path] = []
    for clip in clips:
        dst = clips_dir / clip.local_path
        shutil.copy2(clip.source_path, dst)
        local_clips.append(dst)

    project_id = str(manifest.get("project_id", "project"))
    final_video = final_dir / f"{project_id}_youtube_full.mp4"
    final_video_narrated = final_dir / f"{project_id}_youtube_full_narrated.mp4"
    teaser_video = final_dir / f"{project_id}_teaser_{args.teaser_sec}s.mp4"
    teaser_video_delivery = final_dir / f"{project_id}_teaser_{args.teaser_sec}s_delivery.mp4"
    thumbnail = thumbs_dir / f"{project_id}_thumbnail.jpg"

    # --- Phase D: Color normalization (before assembly) ---
    assembly_clips = local_clips
    if args.color_normalize:
        from color_normalize import normalize_clips_color

        print("[POST] color normalization...")
        assembly_clips = normalize_clips_color(
            local_clips,
            reference_frame=args.color_reference,
            method=args.color_method,
        )

    # --- Phase A: Assembly with transitions ---
    if args.no_transitions:
        from video_assembler import concat_hardcut

        print("[POST] hardcut concat (no transitions)...")
        concat_hardcut(assembly_clips, final_video)
    elif args.assembler == "mlt":
        final_video = _assemble_with_mlt(
            assembly_clips, final_video,
            transition=args.transition,
            transition_dur=args.transition_duration,
        )
    elif args.assembler == "kdenlive":
        from kdenlive_assembly import assemble_with_fallback as _kdenlive_assemble

        print(f"[POST] KDEnlive assembly ({len(assembly_clips)} clips)...")
        final_video = _kdenlive_assemble(
            clips=assembly_clips,
            output_path=final_video,
            manifest=manifest,
            transition_type=args.transition,
            transition_duration=args.transition_duration,
            bgm_path=args.bgm,
            voiceover_path=args.voiceover,
        )
    else:
        from video_assembler import assemble_with_transitions

        print(f"[POST] xfade assembly (transition={args.transition}, duration={args.transition_duration}s)...")
        assemble_with_transitions(
            clips=assembly_clips,
            transition=args.transition,
            transition_duration=args.transition_duration,
            intro_text=args.intro_text,
            outro_text=args.outro_text,
            output_path=final_video,
        )

    _render_teaser(final_video, teaser_video, args.teaser_sec)

    duration = _probe_duration_sec(final_video)

    delivery_video = final_video
    delivery_teaser = teaser_video
    if args.voiceover:
        if not args.voiceover.exists():
            raise RuntimeError(f"voiceover file not found: {args.voiceover}")

        import tempfile as _tmpmod

        # Validate audio catalog and decide assembly mode
        use_simple = args.simple_audio
        if not use_simple:
            from audio_catalog import validate_catalog
            missing = validate_catalog()
            if missing:
                print(f"[WARN] {len(missing)} audio files missing — falling back to simple audio mode")
                use_simple = True

        with _tmpmod.TemporaryDirectory(prefix="audio_engine_") as _dtd:
            master_audio = Path(_dtd) / "master_mix.wav"

            if use_simple:
                # Simple fallback: VO only (or VO + BGM amix if --bgm provided)
                print("[POST] simple audio mode (VO-only or VO+BGM amix)...")
                if args.bgm and args.bgm.exists():
                    _run([
                        "ffmpeg", "-y",
                        "-i", str(args.voiceover),
                        "-stream_loop", "-1", "-i", str(args.bgm),
                        "-filter_complex",
                        f"[0:a]volume={args.voiceover_volume}[vo];"
                        f"[1:a]volume={args.bgm_volume}[bg];"
                        "[vo][bg]amix=inputs=2:duration=first:normalize=0[out]",
                        "-map", "[out]",
                        str(master_audio),
                    ])
                else:
                    _run(["ffmpeg", "-y", "-i", str(args.voiceover), "-c:a", "pcm_s16le", str(master_audio)])
            else:
                from video_assembler import assemble_narrative_audio
                print("[POST] advanced narrative audio assembly (BGM acts + SFX keywords)...")
                assemble_narrative_audio(
                    manifest=manifest,
                    vo_path=args.voiceover,
                    output_path=master_audio,
                    vo_volume=args.voiceover_volume,
                    bgm_volume=args.bgm_volume,
                    duck_threshold=args.duck_threshold,
                    duck_ratio=args.duck_ratio,
                )

            # Mux master audio with video
            _run([
                "ffmpeg", "-y",
                "-i", str(final_video),
                "-i", str(master_audio),
                "-map", "0:v",
                "-map", "1:a",
                "-c:v", "copy",
                "-c:a", "aac",
                "-movflags", "+faststart",
                str(final_video_narrated),
            ])

        delivery_video = final_video_narrated

    # --- Phase B: Subtitle burn-in (after assembly, before thumbnail) ---
    if args.subtitles and args.voiceover:
        if not args.skip_subtitle_font_bootstrap:
            from ensure_subtitle_fonts import ensure_default_subtitle_fonts

            for font_path in ensure_default_subtitle_fonts(args.subtitle_fonts_dir):
                print(f"[POST] subtitle font ready: {font_path}")
        from subtitle_pipeline import subtitle_pipeline

        text_ko = args.subtitle_text_ko
        text_en = args.subtitle_text_en

        if args.subtitle_lang in ("ko", "dual") and not text_ko:
            print("[WARN] --subtitles with ko/dual but no --subtitle-text-ko provided, skipping KO")
        if args.subtitle_lang in ("en", "dual") and not text_en:
            print("[WARN] --subtitles with en/dual but no --subtitle-text-en provided, skipping EN")

        if text_ko or text_en:
            print(f"[POST] subtitle burn-in (lang={args.subtitle_lang}, format={args.subtitle_format})...")
            subtitled_video = final_dir / f"{project_id}_youtube_full_subtitled.mp4"
            subtitle_pipeline(
                video_path=delivery_video,
                audio_path=args.voiceover,
                text_ko=text_ko if args.subtitle_lang in ("ko", "dual") else None,
                text_en=text_en if args.subtitle_lang in ("en", "dual") else None,
                language=args.subtitle_lang if args.subtitle_lang != "dual" else "ko",
                output_path=subtitled_video,
                font_ko=args.subtitle_font_ko,
                font_en=args.subtitle_font_en,
                fonts_dir=args.subtitle_fonts_dir,
                output_format=args.subtitle_format,
                srt_output_dir=meta_dir,
            )
            delivery_video = subtitled_video

    if delivery_video == final_video:
        delivery_teaser = teaser_video
    else:
        delivery_teaser = _render_teaser(delivery_video, teaser_video_delivery, args.teaser_sec)

    # --- Phase E: Improved thumbnail (best-frame selection) ---
    _thumb_done = False
    if getattr(args, "gimp_thumbnail", False):
        try:
            from cli_anything_bridge import AVAILABLE_TOOLS, GimpSession

            if "gimp" in AVAILABLE_TOOLS:
                print("[POST] GIMP harness thumbnail generation...")
                # Extract best frame first
                mid = max(0.0, duration / 2.0)
                _raw_frame = thumbs_dir / "_raw_frame.png"
                _run([
                    "ffmpeg", "-y", "-ss", f"{mid:.3f}",
                    "-i", str(delivery_video),
                    "-frames:v", "1", "-q:v", "2",
                    str(_raw_frame),
                ])
                with GimpSession() as _gs:
                    _gs.project_new(width=1280, height=720)
                    _gs.open_image(str(_raw_frame))
                    _gs.canvas_scale(1280, 720)
                    _gs.color_correct(brightness=5, contrast=10, saturation=10)
                    _title = args.title or project_id
                    _gs.watermark(text=_title, x=40, y=620, font_size=48, opacity=1.0)
                    _gs.flatten()
                    _gs.export(str(thumbnail), fmt="jpg", quality=95)
                _raw_frame.unlink(missing_ok=True)
                if thumbnail.exists():
                    print(f"[OK] GIMP thumbnail → {thumbnail}")
                    _thumb_done = True
        except Exception as _e:
            print(f"[WARN] GIMP thumbnail failed ({_e}) — falling back")

    if not _thumb_done:
        try:
            from evaluate_renders import select_best_thumbnail_frame

            select_best_thumbnail_frame(
                delivery_video, thumbnail, sample_count=20,
                title_text=args.title,
            )
        except Exception:
            # Fallback: middle frame extraction
            mid = max(0.0, duration / 2.0)
            _run([
                "ffmpeg", "-y",
                "-ss", f"{mid:.3f}",
                "-i", str(delivery_video),
                "-frames:v", "1", "-q:v", "2",
                str(thumbnail),
            ])

    title = args.title or f"{project_id} | Fury-Driven Development | Claymation"

    # --- Phase E: Scene-based chapters ---
    if args.scene_chapters:
        from evaluate_renders import build_scene_chapters

        clip_durations = [c.duration_sec for c in clips]
        overlap_sec = 0.0 if args.no_transitions else max(0.0, args.transition_duration)
        chapters = build_scene_chapters(
            manifest,
            clip_durations,
            transition_overlap_sec=overlap_sec,
        )

    chapters_text = "\n".join(f"{c['timecode']} {c['title']}" for c in chapters)
    blog_hint = str(args.blog_source) if args.blog_source else "<blog_url_here>"
    twitter_hint = str(args.twitter_queue) if args.twitter_queue else "<twitter_thread_url_here>"
    description = (
        f"Source blog: {blog_hint}\n"
        f"Thread: {twitter_hint}\n"
        f"Render run: {args.run_dir}\n"
        f"Workflow: {render_log.get('workflow')}\n"
        f"Bindings: {render_log.get('bindings')}\n\n"
        "Chapters\n"
        f"{chapters_text}\n\n"
        f"Generated by {args.channel_name} pipeline on {datetime.now().isoformat()}"
    )

    voiceover_quality_path = None
    voiceover_timing_path = None
    voiceover_quality = None
    voiceover_timing = None
    if args.voiceover:
        pdir = args.voiceover.parent
        voiceover_quality_path = pdir / "voiceover_quality_report.json"
        voiceover_timing_path = pdir / "timing_alignment_report.json"
        voiceover_quality = _json_load_if_exists(voiceover_quality_path)
        voiceover_timing = _json_load_if_exists(voiceover_timing_path)

    meta = {
        "title": title,
        "description": description,
        "chapters": chapters,
        "hashtags": ["#AI", "#Claymation", "#ComfyUI", "#FDD"],
        "privacy": "private",
        "made_for_kids": False,
        "blog_source": str(args.blog_source) if args.blog_source else None,
        "twitter_queue": str(args.twitter_queue) if args.twitter_queue else None,
        "render_run_dir": str(args.run_dir),
        "manifest": str(args.manifest),
        "final_video": str(delivery_video),
        "teaser_video": str(delivery_teaser),
        "final_video_raw": str(final_video),
        "teaser_video_raw": str(teaser_video),
        "voiceover": str(args.voiceover) if args.voiceover else None,
        "bgm": str(args.bgm) if args.bgm else None,
        "voiceover_quality_report": str(voiceover_quality_path) if voiceover_quality_path and voiceover_quality else None,
        "voiceover_timing_report": str(voiceover_timing_path) if voiceover_timing_path and voiceover_timing else None,
        "voiceover_quality_summary": {
            "duration_sec": voiceover_quality.get("duration_sec"),
            "mean_volume_db": (voiceover_quality.get("volumedetect") or {}).get("mean_volume_db"),
            "max_volume_db": (voiceover_quality.get("volumedetect") or {}).get("max_volume_db"),
            "measured_input_i": (voiceover_quality.get("loudnorm_measurement") or {}).get("input_i"),
        }
        if voiceover_quality
        else None,
        "voiceover_timing_summary": voiceover_timing.get("summary") if voiceover_timing else None,
        "thumbnail": str(thumbnail),
        "duration_sec": round(duration, 3),
    }
    _json_dump(meta_dir / "youtube_metadata.json", meta)
    (meta_dir / "youtube_metadata.md").write_text(
        f"# {title}\n\n## Description\n{description}\n",
        encoding="utf-8",
    )

    package_manifest = {
        "project_id": project_id,
        "generated_at": datetime.now().isoformat(),
        "clip_count": len(local_clips),
        "clips": [str(p) for p in local_clips],
        "final_video": str(delivery_video),
        "teaser_video": str(delivery_teaser),
        "final_video_raw": str(final_video),
        "teaser_video_raw": str(teaser_video),
        "voiceover": str(args.voiceover) if args.voiceover else None,
        "bgm": str(args.bgm) if args.bgm else None,
        "voiceover_quality_report": str(voiceover_quality_path) if voiceover_quality_path and voiceover_quality else None,
        "voiceover_timing_report": str(voiceover_timing_path) if voiceover_timing_path and voiceover_timing else None,
        "thumbnail": str(thumbnail),
        "metadata_json": str(meta_dir / "youtube_metadata.json"),
        "metadata_md": str(meta_dir / "youtube_metadata.md"),
    }

    checklist = _build_upload_checklist(
        package_dir=package_dir,
        meta=meta,
        render_log=render_log,
        learning=learning,
        evaluations=evaluations,
        voiceover_quality=voiceover_quality,
        voiceover_timing=voiceover_timing,
        args=args,
    )
    checklist_json = meta_dir / "youtube_upload_checklist.json"
    checklist_md = meta_dir / "youtube_upload_checklist.md"
    _json_dump(checklist_json, checklist)
    checklist_md.write_text(_checklist_to_markdown(checklist), encoding="utf-8")

    meta["upload_checklist_json"] = str(checklist_json)
    meta["upload_checklist_md"] = str(checklist_md)
    meta["upload_gate_passed"] = checklist["overview"]["upload_gate_passed"]
    _json_dump(meta_dir / "youtube_metadata.json", meta)

    package_manifest["upload_checklist_json"] = str(checklist_json)
    package_manifest["upload_checklist_md"] = str(checklist_md)
    package_manifest["upload_gate_passed"] = checklist["overview"]["upload_gate_passed"]
    package_manifest["upload_gate_blocking_failures"] = checklist["overview"]["blocking_failures"]
    _json_dump(package_dir / "package_manifest.json", package_manifest)

    # --- Phase E: Final quality check ---
    if args.final_quality_check:
        from evaluate_renders import run_final_quality_check

        print("[POST] final quality check (blackdetect/freezedetect/silencedetect)...")
        qc_report = run_final_quality_check(
            video_path=delivery_video,
            output_path=meta_dir / "final_quality_check.json",
            silence_duration=args.silence_duration,
            silence_noise_db=args.silence_noise_db,
            strict=args.quality_check_strict,
        )
        package_manifest["final_quality_check"] = str(meta_dir / "final_quality_check.json")
        package_manifest["final_quality_passed"] = qc_report["pass"]
        _json_dump(package_dir / "package_manifest.json", package_manifest)

    if args.checklist_strict and not checklist["overview"]["upload_gate_passed"]:
        raise RuntimeError(
            "Upload checklist gate failed in strict mode. "
            f"See: {checklist_json}"
        )

    print(f"[OK] package dir: {package_dir}")
    print(f"[OK] final video: {delivery_video}")
    print(f"[OK] thumbnail: {thumbnail}")
    print(f"[OK] upload checklist: {checklist_json}")

    # --- YouTube upload ---
    if args.upload:
        from youtube_upload import upload_video

        yt_meta_path = meta_dir / "youtube_metadata.json"
        if not yt_meta_path.exists():
            raise RuntimeError(f"YouTube metadata not found: {yt_meta_path}")

        yt_meta = _json_load(yt_meta_path)
        video_id = upload_video(
            video_path=delivery_video,
            title=yt_meta.get("title", project_id),
            description=yt_meta.get("description", ""),
            tags=yt_meta.get("tags", []),
            privacy_status=args.upload_privacy,
            thumbnail_path=thumbnail if thumbnail.exists() else None,
            credentials_path=args.youtube_credentials,
        )
        print(f"[OK] YouTube upload: https://youtu.be/{video_id}")

        # Update publish log
        publish_log_path = Path("/mnt/e/vibecode-blog/content/publish_log.json")
        if publish_log_path.exists():
            plog = _json_load(publish_log_path)
            entries = plog.get("entries", {})
            entry = entries.setdefault(project_id, {})
            entry["youtube_url"] = f"https://youtu.be/{video_id}"
            entry["youtube_uploaded_at"] = datetime.now().isoformat()
            entry["youtube_privacy"] = args.upload_privacy
            _json_dump(publish_log_path, plog)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
