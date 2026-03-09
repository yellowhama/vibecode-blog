#!/usr/bin/env python3
"""Evaluate Comfy batch render outputs and write per-shot evaluation.json.

Supports:
- Gemini vision evaluation (when GEMINI_API_KEY is set)
- OpenAI vision evaluation (when OPENAI_API_KEY is set)
- Mock fallback mode for pipeline wiring checks

Output files:
- <run_dir>/<shot_id>/evaluation.json
- <run_dir>/evaluations_summary.json
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import subprocess
import tempfile
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


SUPPORTED_MEDIA_EXTS = {".webp", ".mp4", ".webm", ".gif", ".png", ".jpg", ".jpeg"}
STATIC_IMAGE_EXTS = {".png", ".jpg", ".jpeg"}
DEFAULT_ASSETS_GUIDE = Path(__file__).resolve().parent.parent.parent / "planning" / "03-visual_assets_guide.md"


def _normalize_label(label: str | None) -> str | None:
    if label is None:
        return None
    normalized = re.sub(r"[^a-zA-Z0-9._-]+", "_", label.strip()).strip("._-")
    if not normalized:
        raise ValueError("evaluation label must contain at least one alphanumeric character")
    return normalized


def _evaluation_file_name(label: str | None) -> str:
    return "evaluation.json" if not label else f"evaluation_{label}.json"


def _evaluations_summary_name(label: str | None) -> str:
    return "evaluations_summary.json" if not label else f"evaluations_summary_{label}.json"


def _quality_summary_name(label: str | None) -> str:
    return "quality_summary.json" if not label else f"quality_summary_{label}.json"


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _load_text(path: Path) -> str:
    with path.open("r", encoding="utf-8") as f:
        return f.read()


def _extract_json_object(raw_text: str) -> Dict[str, Any]:
    decoder = json.JSONDecoder()
    for idx, ch in enumerate(raw_text):
        if ch != "{":
            continue
        try:
            obj, _ = decoder.raw_decode(raw_text[idx:])
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            return obj
    raise ValueError("No JSON object found in model output")


def _extract_output_text(api_response: Dict[str, Any]) -> str:
    direct = api_response.get("output_text")
    if isinstance(direct, str) and direct.strip():
        return direct

    parts: List[str] = []
    for item in api_response.get("output", []):
        for content in item.get("content", []):
            ctype = content.get("type")
            if ctype in {"output_text", "text"}:
                text = content.get("text")
                if isinstance(text, str):
                    parts.append(text)
                elif isinstance(text, dict):
                    value = text.get("value")
                    if isinstance(value, str):
                        parts.append(value)

    if parts:
        return "\n".join(parts)

    # Compatibility fallback if responses are proxied through chat-style payloads.
    choices = api_response.get("choices", [])
    if choices:
        msg = choices[0].get("message", {})
        content = msg.get("content")
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            text_parts = []
            for block in content:
                if isinstance(block, dict) and block.get("type") == "text":
                    t = block.get("text")
                    if isinstance(t, str):
                        text_parts.append(t)
            if text_parts:
                return "\n".join(text_parts)

    return ""


def _find_primary_media(shot_record: Dict[str, Any], shot_dir: Path) -> Path | None:
    saved_files = shot_record.get("saved_files") or []
    for raw in saved_files:
        p = Path(raw)
        if p.exists() and p.suffix.lower() in SUPPORTED_MEDIA_EXTS:
            return p

    if not shot_dir.exists():
        return None

    candidates = sorted(
        [
            p
            for p in shot_dir.iterdir()
            if p.is_file() and p.suffix.lower() in SUPPORTED_MEDIA_EXTS
        ]
    )
    return candidates[0] if candidates else None


def _run_cmd(cmd: List[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def _probe_duration_seconds(media_path: Path) -> float | None:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=nokey=1:noprint_wrappers=1",
        str(media_path),
    ]
    try:
        out = _run_cmd(cmd).stdout.strip()
        val = float(out)
        if val > 0:
            return val
    except Exception:
        return None
    return None


def _extract_frames(media_path: Path, temp_dir: Path, frame_count: int) -> List[Path]:
    ext = media_path.suffix.lower()
    if ext in STATIC_IMAGE_EXTS:
        return [media_path]

    duration = _probe_duration_seconds(media_path)
    if duration and duration > 0.2:
        step = duration / (frame_count + 1)
        timestamps = [max(0.0, step * (i + 1)) for i in range(frame_count)]
    else:
        timestamps = [0.0]

    frames: List[Path] = []
    for idx, ts in enumerate(timestamps, start=1):
        frame_path = temp_dir / f"frame_{idx:02d}.jpg"
        cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]
        if ts > 0:
            cmd += ["-ss", f"{ts:.3f}"]
        cmd += ["-i", str(media_path), "-frames:v", "1", "-q:v", "2", str(frame_path)]
        try:
            _run_cmd(cmd)
            if frame_path.exists() and frame_path.stat().st_size > 0:
                frames.append(frame_path)
        except Exception:
            continue

    # Fallback: if ffmpeg is unavailable or WEBP decode fails, use Pillow for WEBP.
    if not frames and ext == ".webp":
        frames = _extract_webp_frames_with_pillow(media_path, temp_dir, frame_count)
    return frames


def _extract_webp_frames_with_pillow(media_path: Path, temp_dir: Path, frame_count: int) -> List[Path]:
    try:
        from PIL import Image, ImageSequence  # type: ignore
    except Exception:
        return []

    out_paths: List[Path] = []
    try:
        with Image.open(media_path) as img:
            pil_frames = [frame.convert("RGB") for frame in ImageSequence.Iterator(img)]
    except Exception:
        return []

    if not pil_frames:
        return []

    if len(pil_frames) <= frame_count:
        idxs = list(range(len(pil_frames)))
    else:
        idxs = [int(round(i * (len(pil_frames) - 1) / (frame_count - 1))) for i in range(frame_count)]

    for out_idx, frame_idx in enumerate(idxs, start=1):
        out_path = temp_dir / f"frame_{out_idx:02d}.jpg"
        pil_frames[frame_idx].save(out_path, format="JPEG", quality=95)
        if out_path.exists() and out_path.stat().st_size > 0:
            out_paths.append(out_path)

    return out_paths


def _to_data_uri(image_path: Path) -> str:
    mime = mimetypes.guess_type(str(image_path))[0] or "image/jpeg"
    b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def _build_system_prompt(assets_guide: str, min_score: int) -> str:
    return (
        "You are a strict video QA evaluator for claymation generation results.\n"
        "Evaluate visual consistency, prompt adherence, and hallucination issues.\n"
        "CRITICAL RULE: any visible text, subtitle, watermark, speech bubble, or logo is immediate FAIL.\n"
        f"Use score range 0-100. PASS should usually be >= {min_score}.\n"
        "Return only JSON object with keys: "
        "status, score, feedback, failed_metrics.\n"
        "status must be PASS or FAIL.\n\n"
        "Visual Asset Guide:\n"
        f"{assets_guide}"
    )


def _build_user_prompt(shot: Dict[str, Any], media_file: Path) -> str:
    return (
        "Evaluate this rendered shot against the specification.\n\n"
        f"shot_id: {shot.get('shot_id', 'UNKNOWN')}\n"
        f"scene: {shot.get('scene', '')}\n"
        f"purpose: {shot.get('purpose', '')}\n"
        f"prompt_positive: {shot.get('prompt_positive', '')}\n"
        f"prompt_negative: {shot.get('prompt_negative', '')}\n"
        f"output_file: {media_file.name}\n\n"
        "Output JSON format example:\n"
        '{"status":"FAIL","score":62,"feedback":"...","failed_metrics":["Hallucination","Prompt Adherence"]}'
    )


def _call_openai_vision(
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    frame_paths: List[Path],
    timeout_sec: int,
) -> Dict[str, Any]:
    content: List[Dict[str, Any]] = [{"type": "input_text", "text": user_prompt}]
    for frame in frame_paths:
        content.append({"type": "input_image", "image_url": _to_data_uri(frame)})

    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
            {"role": "user", "content": content},
        ],
    }

    req = urllib.request.Request(
        url="https://api.openai.com/v1/responses",
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            body = resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error ({exc.code}): {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"OpenAI connection error: {exc}") from exc

    data = json.loads(body.decode("utf-8"))
    text = _extract_output_text(data)
    if not text.strip():
        raise RuntimeError("OpenAI response did not include parsable output text")
    return _extract_json_object(text)


def _call_gemini_vision(
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    frame_paths: List[Path],
    timeout_sec: int,
) -> Dict[str, Any]:
    parts = []
    for frame in frame_paths:
        mime = mimetypes.guess_type(str(frame))[0] or "image/jpeg"
        b64 = base64.b64encode(frame.read_bytes()).decode("ascii")
        parts.append({"inline_data": {"mime_type": mime, "data": b64}})
    
    parts.append({"text": user_prompt})

    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [{
            "parts": parts
        }],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    req = urllib.request.Request(
        url=url,
        method="POST",
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            body = resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini API error ({exc.code}): {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Gemini connection error: {exc}") from exc

    data = json.loads(body.decode("utf-8"))
    
    # Extract text from Gemini response format
    text = ""
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise RuntimeError(f"Unexpected Gemini response format: {json.dumps(data)}")
        
    if not text.strip():
        raise RuntimeError("Gemini response did not include parsable output text")
    return _extract_json_object(text)


def _normalize_failed_metrics(raw_metrics: Any) -> List[str]:
    if not isinstance(raw_metrics, list):
        return []
    out = []
    seen = set()
    for item in raw_metrics:
        s = str(item).strip()
        if s and s not in seen:
            out.append(s)
            seen.add(s)
    return out


def _normalize_status(raw_status: Any) -> str:
    status = str(raw_status or "").strip().upper()
    if status in {"PASS", "FAIL"}:
        return status
    return "REVIEW_REQUIRED"


def _normalize_score(raw_score: Any, status: str) -> int:
    try:
        score = int(float(raw_score))
    except Exception:
        score = 80 if status == "PASS" else 40
    return max(0, min(100, score))


def _contains_hallucination_keywords(text: str) -> bool:
    lowered = text.lower()
    keywords = ("text", "texts", "watermark", "watermarks", "logo", "logos", "subtitle", "subtitles", "speech bubble", "speech bubbles", "letter", "letters")
    negation_re = re.compile(r"\b(no|without|absent|none)\b")
    for keyword in keywords:
        for match in re.finditer(re.escape(keyword), lowered):
            prefix = lowered[max(0, match.start() - 32):match.start()]
            if negation_re.search(prefix):
                continue
            return True
    return False


def _normalize_evaluation(
    raw_eval: Dict[str, Any],
    shot_id: str,
    min_score: int,
) -> Dict[str, Any]:
    status = _normalize_status(raw_eval.get("status"))
    feedback = str(raw_eval.get("feedback") or "").strip()
    failed_metrics = _normalize_failed_metrics(raw_eval.get("failed_metrics"))
    score = _normalize_score(raw_eval.get("score"), status)

    hallucination_hit = _contains_hallucination_keywords(
        " ".join(failed_metrics + [feedback])
    )
    if hallucination_hit:
        status = "FAIL"
        if "Hallucination" not in failed_metrics:
            failed_metrics.append("Hallucination")

    if status == "PASS" and score < min_score:
        status = "FAIL"
        failed_metrics.append("ScoreBelowThreshold")

    if status == "FAIL" and not failed_metrics:
        failed_metrics = ["UnspecifiedFailure"]

    return {
        "shot_id": shot_id,
        "status": status,
        "score": score,
        "feedback": feedback or "No feedback provided.",
        "failed_metrics": failed_metrics,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate rendered shots with vision QA")
    parser.add_argument("--run-dir", required=True, type=Path)
    parser.add_argument("--manifest", type=Path, default=None)
    parser.add_argument("--assets-guide", type=Path, default=DEFAULT_ASSETS_GUIDE)
    parser.add_argument("--provider", choices=("auto", "gemini", "openai", "mock"), default="auto")
    parser.add_argument("--model", default="gemini-2.5-flash")
    parser.add_argument("--frames", type=int, default=4)
    parser.add_argument("--min-score", type=int, default=75)
    parser.add_argument("--timeout-sec", type=int, default=120)
    parser.add_argument("--evaluation-label", default=None, help="Optional suffix for evaluation outputs")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    try:
        evaluation_label = _normalize_label(args.evaluation_label)
    except ValueError as exc:
        raise SystemExit(f"[FAIL] {exc}") from exc

    evaluation_file_name = _evaluation_file_name(evaluation_label)
    evaluations_summary_name = _evaluations_summary_name(evaluation_label)
    quality_summary_name = _quality_summary_name(evaluation_label)

    run_dir = args.run_dir
    render_log_path = run_dir / "render_log.json"
    if not render_log_path.exists():
        raise SystemExit(f"[FAIL] render_log.json not found: {render_log_path}")

    render_log = _json_load(render_log_path)

    manifest_path = args.manifest
    if manifest_path is None:
        m = render_log.get("manifest")
        if not m:
            raise SystemExit("[FAIL] --manifest missing and render_log.manifest is empty")
        manifest_path = Path(m)
    if not manifest_path.exists():
        raise SystemExit(f"[FAIL] manifest not found: {manifest_path}")
    manifest = _json_load(manifest_path)
    manifest_shot_map = {str(s.get("shot_id")): s for s in manifest.get("shots", [])}

    guide_text = ""
    if args.assets_guide.exists():
        guide_text = _load_text(args.assets_guide)

    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    
    provider = args.provider
    if provider == "auto":
        if gemini_api_key:
            provider = "gemini"
        elif openai_api_key:
            provider = "openai"
        else:
            provider = "mock"
            
    if provider == "openai" and not openai_api_key:
        raise SystemExit("[FAIL] provider=openai but OPENAI_API_KEY is not set")
    if provider == "gemini" and not gemini_api_key:
        raise SystemExit("[FAIL] provider=gemini but GEMINI_API_KEY is not set")

    summary = {
        "run_dir": str(run_dir),
        "manifest": str(manifest_path),
        "assets_guide": str(args.assets_guide),
        "min_score_gate": int(args.min_score),
        "evaluation_label": evaluation_label,
        "provider": provider,
        "model": args.model if provider in ("openai", "gemini") else "mock",
        "evaluated_at": datetime.now().isoformat(),
        "shots_total": 0,
        "pass": 0,
        "fail": 0,
        "review_required": 0,
        "shots": [],
    }

    for shot_record in render_log.get("shots", []):
        shot_id = str(shot_record.get("shot_id", "UNKNOWN"))
        shot_cfg = manifest_shot_map.get(shot_id, {"shot_id": shot_id})
        shot_dir = run_dir / shot_id
        eval_path = shot_dir / evaluation_file_name
        if eval_path.exists() and not args.overwrite:
            existing = _json_load(eval_path)
            status = str(existing.get("status", "REVIEW_REQUIRED")).upper()
            summary["shots_total"] += 1
            summary["shots"].append(
                {
                    "shot_id": shot_id,
                    "status": status,
                    "evaluation_file": str(eval_path),
                    "skipped": True,
                }
            )
            if status == "PASS":
                summary["pass"] += 1
            elif status == "FAIL":
                summary["fail"] += 1
            else:
                summary["review_required"] += 1
            continue

        media_path = _find_primary_media(shot_record, shot_dir)
        if media_path is None:
            raw_eval = {
                "status": "FAIL",
                "score": 0,
                "feedback": "No render output file found for this shot.",
                "failed_metrics": ["RenderOutputMissing"],
            }
        elif provider == "mock":
            raw_eval = {
                "status": "REVIEW_REQUIRED",
                "score": 50,
                "feedback": "Mock evaluator mode. Configure OPENAI_API_KEY for vision QA.",
                "failed_metrics": [],
            }
        else:
            system_prompt = _build_system_prompt(guide_text, args.min_score)
            user_prompt = _build_user_prompt(shot_cfg, media_path)
            with tempfile.TemporaryDirectory(prefix="eval_frames_") as td:
                frames = _extract_frames(media_path, Path(td), max(1, args.frames))
                if not frames:
                    raw_eval = {
                        "status": "FAIL",
                        "score": 0,
                        "feedback": "Frame extraction failed (ffmpeg/ffprobe issue).",
                        "failed_metrics": ["FrameExtractionError"],
                    }
                else:
                    try:
                        if provider == "gemini":
                            raw_eval = _call_gemini_vision(
                                api_key=gemini_api_key,
                                model=args.model,
                                system_prompt=system_prompt,
                                user_prompt=user_prompt,
                                frame_paths=frames,
                                timeout_sec=args.timeout_sec,
                            )
                        else:
                            raw_eval = _call_openai_vision(
                                api_key=openai_api_key,
                                model=args.model,
                                system_prompt=system_prompt,
                                user_prompt=user_prompt,
                                frame_paths=frames,
                                timeout_sec=args.timeout_sec,
                            )
                    except Exception as exc:  # noqa: BLE001
                        raw_eval = {
                            "status": "REVIEW_REQUIRED",
                            "score": 40,
                            "feedback": f"Vision API call failed: {exc}",
                            "failed_metrics": ["VisionApiError"],
                        }

        normalized = _normalize_evaluation(
            raw_eval=raw_eval,
            shot_id=shot_id,
            min_score=args.min_score,
        )
        normalized.update(
            {
                "media_file": str(media_path) if media_path else None,
                "provider": provider,
                "model": args.model if provider in ("openai", "gemini") else "mock",
                "evaluated_at": datetime.now().isoformat(),
            }
        )
        _json_dump(eval_path, normalized)

        status = normalized["status"]
        summary["shots_total"] += 1
        summary["shots"].append(
            {
                "shot_id": shot_id,
                "status": status,
                "evaluation_file": str(eval_path),
                "media_file": str(media_path) if media_path else None,
            }
        )
        if status == "PASS":
            summary["pass"] += 1
        elif status == "FAIL":
            summary["fail"] += 1
        else:
            summary["review_required"] += 1

    summary_path = run_dir / evaluations_summary_name
    _json_dump(summary_path, summary)
    print(f"[OK] wrote {summary_path}")
    print(
        "[SUMMARY] total={total} pass={pass_n} fail={fail_n} review_required={rr}".format(
            total=summary["shots_total"],
            pass_n=summary["pass"],
            fail_n=summary["fail"],
            rr=summary["review_required"],
        )
    )

    # --- Quality statistics aggregation ---
    quality_stats: Dict[str, Any] = {
        "run_dir": str(run_dir),
        "assets_guide": str(args.assets_guide),
        "min_score_gate": int(args.min_score),
        "evaluation_label": evaluation_label,
        "evaluated_at": datetime.now().isoformat(),
        "total": summary["shots_total"],
        "pass_count": summary["pass"],
        "fail_count": summary["fail"],
        "review_count": summary["review_required"],
        "pass_rate": round(summary["pass"] / max(1, summary["shots_total"]), 4),
    }

    # Collect scores and failure patterns
    scores: List[int] = []
    fail_metric_counts: Dict[str, int] = {}
    for shot_info in summary["shots"]:
        shot_dir = run_dir / shot_info["shot_id"]
        eval_file = shot_dir / evaluation_file_name
        if eval_file.exists():
            eval_data = _json_load(eval_file)
            if "score" in eval_data:
                scores.append(int(eval_data["score"]))
            for metric in eval_data.get("failed_metrics", []):
                fail_metric_counts[metric] = fail_metric_counts.get(metric, 0) + 1

    if scores:
        quality_stats["avg_score"] = round(sum(scores) / len(scores), 1)
        quality_stats["min_score"] = min(scores)
        quality_stats["max_score"] = max(scores)

    if fail_metric_counts:
        quality_stats["failure_patterns"] = dict(
            sorted(fail_metric_counts.items(), key=lambda x: -x[1])
        )
        # Flag repeated failure patterns
        top_pattern = max(fail_metric_counts, key=fail_metric_counts.get)
        if fail_metric_counts[top_pattern] >= 3:
            quality_stats["repeated_failure_warning"] = (
                f"'{top_pattern}' failed {fail_metric_counts[top_pattern]} times. "
                "Consider adjusting prompts or model parameters."
            )
            print(f"[WARN] {quality_stats['repeated_failure_warning']}")

    quality_stats_path = run_dir / quality_summary_name
    _json_dump(quality_stats_path, quality_stats)
    print(f"[OK] quality stats: {quality_stats_path}")

    return 0


# ---------------------------------------------------------------------------
# Phase E: Final video quality checks
# ---------------------------------------------------------------------------

def _parse_ffmpeg_detect(stderr: str, pattern: str) -> List[Dict[str, Any]]:
    """Parse FFmpeg detect filter output (blackdetect/freezedetect/silencedetect)."""
    import re as _re

    results: List[Dict[str, Any]] = []
    for match in _re.finditer(pattern, stderr):
        results.append(match.groupdict())
    return results


def run_final_quality_check(
    video_path: Path,
    output_path: Path | None = None,
    black_duration: float = 0.5,
    black_threshold: float = 0.10,
    freeze_duration: float = 2.0,
    freeze_noise: float = 0.003,
    silence_duration: float = 2.0,
    silence_noise_db: float = -55.0,
    strict: bool = False,
) -> Dict[str, Any]:
    """Run blackdetect, freezedetect, silencedetect on a final assembled video.

    Args:
        video_path: Path to the final video.
        output_path: Where to write the JSON report (default: alongside video).
        black_duration: Minimum black screen duration to flag (seconds).
        black_threshold: Pixel threshold for black detection (0.0-1.0).
        freeze_duration: Minimum frozen frame duration to flag (seconds).
        freeze_noise: Noise tolerance for freeze detection.
        silence_duration: Minimum silence duration to flag (seconds).
        silence_noise_db: Noise floor in dB for silence detection.
        strict: If True, raise on any detection.

    Returns:
        Quality check report dict.
    """
    import re as _re

    report: Dict[str, Any] = {
        "video": str(video_path),
        "checks": {},
        "pass": True,
        "warnings": [],
    }

    # --- blackdetect ---
    try:
        proc = subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-i", str(video_path),
                "-vf", f"blackdetect=d={black_duration}:pix_th={black_threshold}",
                "-an", "-f", "null", "-",
            ],
            capture_output=True, text=True,
        )
        black_matches = _re.findall(
            r"black_start:(?P<start>[\d.]+)\s+black_end:(?P<end>[\d.]+)\s+black_duration:(?P<dur>[\d.]+)",
            proc.stderr,
        )
        black_segments = [
            {"start": float(m[0]), "end": float(m[1]), "duration": float(m[2])}
            for m in black_matches
        ]
        report["checks"]["blackdetect"] = {
            "count": len(black_segments),
            "segments": black_segments,
            "threshold_sec": black_duration,
        }
        if black_segments:
            report["warnings"].append(
                f"blackdetect: {len(black_segments)} segment(s) >= {black_duration}s"
            )
    except Exception as exc:
        report["checks"]["blackdetect"] = {"error": str(exc)}

    # --- freezedetect ---
    try:
        proc = subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-i", str(video_path),
                "-vf", f"freezedetect=n={freeze_noise}:d={freeze_duration}",
                "-an", "-f", "null", "-",
            ],
            capture_output=True, text=True,
        )
        freeze_starts = _re.findall(r"freeze_start:\s*([\d.]+)", proc.stderr)
        freeze_durations = _re.findall(r"freeze_duration:\s*([\d.]+)", proc.stderr)
        freeze_segments = [
            {"start": float(s), "duration": float(d)}
            for s, d in zip(freeze_starts, freeze_durations)
        ]
        report["checks"]["freezedetect"] = {
            "count": len(freeze_segments),
            "segments": freeze_segments,
            "threshold_sec": freeze_duration,
        }
        if freeze_segments:
            report["warnings"].append(
                f"freezedetect: {len(freeze_segments)} segment(s) >= {freeze_duration}s"
            )
    except Exception as exc:
        report["checks"]["freezedetect"] = {"error": str(exc)}

    # --- silencedetect ---
    try:
        proc = subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-i", str(video_path),
                "-af", f"silencedetect=n={silence_noise_db}dB:d={silence_duration}",
                "-vn", "-f", "null", "-",
            ],
            capture_output=True, text=True,
        )
        silence_starts = _re.findall(r"silence_start:\s*([\d.]+)", proc.stderr)
        silence_ends = _re.findall(r"silence_end:\s*([\d.]+)", proc.stderr)
        silence_durations = _re.findall(r"silence_duration:\s*([\d.]+)", proc.stderr)
        silence_segments = [
            {"start": float(s), "end": float(e), "duration": float(d)}
            for s, e, d in zip(silence_starts, silence_ends, silence_durations)
        ]
        report["checks"]["silencedetect"] = {
            "count": len(silence_segments),
            "segments": silence_segments,
            "threshold_sec": silence_duration,
        }
        if silence_segments:
            report["warnings"].append(
                f"silencedetect: {len(silence_segments)} segment(s) >= {silence_duration}s"
            )
    except Exception as exc:
        report["checks"]["silencedetect"] = {"error": str(exc)}

    report["pass"] = len(report["warnings"]) == 0

    if strict and not report["pass"]:
        raise RuntimeError(
            "Final quality check failed in strict mode:\n"
            + "\n".join(report["warnings"])
        )

    if output_path is None:
        output_path = video_path.parent / "final_quality_check.json"
    _json_dump(output_path, report)

    for w in report["warnings"]:
        print(f"[WARN] {w}")
    if report["pass"]:
        print(f"[OK] final quality check passed: {output_path}")
    else:
        print(f"[WARN] final quality check has warnings: {output_path}")

    return report


def select_best_thumbnail_frame(
    video_path: Path,
    output_path: Path,
    sample_count: int = 20,
    title_text: str | None = None,
) -> Path:
    """Select the most visually interesting frame as thumbnail.

    Samples N frames evenly across the video, picks the one with
    highest color variance (most visual complexity).
    Optionally overlays title text using Pillow.

    Args:
        video_path: Source video.
        output_path: Where to save the thumbnail JPEG.
        sample_count: Number of candidate frames to evaluate.
        title_text: Optional title text to overlay on the thumbnail.

    Returns:
        Path to the thumbnail image.
    """
    duration = _probe_duration_seconds(video_path)
    if not duration or duration < 0.1:
        # Fallback: extract first frame
        _run_cmd([
            "ffmpeg", "-y", "-i", str(video_path),
            "-frames:v", "1", "-q:v", "2", str(output_path),
        ])
        return output_path

    with tempfile.TemporaryDirectory(prefix="thumb_") as td:
        td_path = Path(td)
        step = duration / (sample_count + 1)
        candidates: List[tuple[float, Path]] = []

        for i in range(1, sample_count + 1):
            ts = step * i
            frame_path = td_path / f"thumb_{i:03d}.jpg"
            try:
                _run_cmd([
                    "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-ss", f"{ts:.3f}",
                    "-i", str(video_path),
                    "-frames:v", "1", "-q:v", "2",
                    str(frame_path),
                ])
                if not frame_path.exists() or frame_path.stat().st_size == 0:
                    continue
            except Exception:
                continue

            # Compute color variance score
            try:
                from PIL import Image  # type: ignore
                import numpy as np  # type: ignore

                img = np.array(Image.open(frame_path).convert("RGB"), dtype=np.float32)
                # Variance across all channels = visual complexity proxy
                score = float(np.var(img))
                candidates.append((score, frame_path))
            except ImportError:
                # Without Pillow/numpy, just use file size as proxy
                candidates.append((float(frame_path.stat().st_size), frame_path))

        if not candidates:
            # Fallback: middle frame
            mid = max(0.0, duration / 2.0)
            _run_cmd([
                "ffmpeg", "-y", "-ss", f"{mid:.3f}",
                "-i", str(video_path),
                "-frames:v", "1", "-q:v", "2", str(output_path),
            ])
            return output_path

        # Pick highest scoring frame
        candidates.sort(key=lambda x: x[0], reverse=True)
        best_frame = candidates[0][1]

        # Optional title overlay
        if title_text:
            try:
                from PIL import Image, ImageDraw, ImageFont  # type: ignore

                img = Image.open(best_frame)
                draw = ImageDraw.Draw(img)
                # Try to load a decent font, fallback to default
                try:
                    font = ImageFont.truetype("Inter", 64)
                except Exception:
                    font = ImageFont.load_default()

                # Draw text with shadow
                w, h = img.size
                bbox = draw.textbbox((0, 0), title_text, font=font)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                x = (w - tw) // 2
                y = h - th - 60

                # Shadow
                draw.text((x + 2, y + 2), title_text, fill=(0, 0, 0), font=font)
                # Main text
                draw.text((x, y), title_text, fill=(255, 255, 255), font=font)

                img.save(output_path, "JPEG", quality=95)
                return output_path
            except ImportError:
                pass

        # Copy best frame to output
        import shutil
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best_frame, output_path)

    return output_path


def build_scene_chapters(
    manifest: Dict[str, Any],
    clip_durations: List[float] | None = None,
    transition_overlap_sec: float = 0.0,
) -> List[Dict[str, Any]]:
    """Build chapter markers grouped by scene instead of per-shot.

    Args:
        manifest: Shot manifest with shots containing "scene" field.
        clip_durations: Actual clip durations (if None, uses manifest duration_sec).
        transition_overlap_sec: Seconds of overlap between adjacent clips.
            Use the xfade duration when transitions are enabled.

    Returns:
        List of chapter dicts with time_sec, timecode, title.
    """
    shots = manifest.get("shots", [])
    if not shots:
        return []

    chapters: List[Dict[str, Any]] = []
    cursor = 0.0
    seen_scenes: set[str] = set()

    for idx, shot in enumerate(shots):
        scene = str(shot.get("scene", "")).strip()
        if not scene:
            scene = f"Shot {idx + 1}"

        duration = (
            clip_durations[idx]
            if clip_durations and idx < len(clip_durations)
            else float(shot.get("duration_sec", 0))
        )

        if scene not in seen_scenes:
            seen_scenes.add(scene)
            # Format timecode
            s = int(max(0, round(cursor)))
            hh = s // 3600
            mm = (s % 3600) // 60
            ss = s % 60
            timecode = f"{hh:02d}:{mm:02d}:{ss:02d}"

            chapters.append({
                "time_sec": round(cursor, 3),
                "timecode": timecode,
                "title": scene,
            })

        # With xfade, the next clip starts early by the overlap amount.
        if idx < len(shots) - 1 and transition_overlap_sec > 0:
            duration = max(0.0, duration - transition_overlap_sec)

        cursor += duration

    return chapters


if __name__ == "__main__":
    raise SystemExit(main())
