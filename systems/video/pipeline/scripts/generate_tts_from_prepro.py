#!/usr/bin/env python3
"""Generate narration audio from prepro beats with pluggable TTS backends."""

from __future__ import annotations

import argparse
import json
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple

from audio_postprocess import (
    apply_loudnorm_two_pass,
    apply_silence_trim,
    build_quality_report,
    concat_segments_wav,
)
from tts_backends import backend_info, list_backend_names, make_backend
from tts_backends.base import (
    SynthOptions,
    TTSError,
    cache_key,
    copy_file,
    default_voice,
    ffprobe_duration_sec,
    generate_silence,
)


def _json_load(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _json_dump(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _backend_chain(primary: str, fallback: str | None) -> List[str]:
    chain = [primary]
    if fallback and fallback != "none" and fallback not in chain:
        chain.append(fallback)
    return chain


def _load_backends(chain: List[str], offline_strict: bool) -> Tuple[List[Tuple[str, Any]], Dict[str, Any]]:
    info = backend_info()
    loaded: List[Tuple[str, Any]] = []
    health: Dict[str, Any] = {}
    for name in chain:
        b = make_backend(name)
        if offline_strict and not b.is_local:
            health[name] = {"ok": False, "msg": "rejected by --offline-strict (non-local backend)"}
            continue
        ok, msg = b.healthcheck()
        health[name] = {"ok": ok, "msg": msg, "is_local": b.is_local, "registry": info.get(name, {})}
        if ok:
            loaded.append((name, b))
    return loaded, health


def _check_timing(beats: List[Dict[str, Any]], tolerance_ratio: float) -> Dict[str, Any]:
    rows = []
    violations = 0
    max_ratio = 0.0
    for beat in beats:
        expected = float(beat.get("expected_duration_sec", 0.0))
        actual = float(beat.get("actual_duration_sec", 0.0))
        ratio = abs(actual - expected) / max(0.001, expected)
        max_ratio = max(max_ratio, ratio)
        over = ratio > tolerance_ratio
        if over:
            violations += 1
        rows.append(
            {
                "beat_id": beat.get("beat_id"),
                "scene_id": beat.get("scene_id"),
                "expected_duration_sec": round(expected, 4),
                "actual_duration_sec": round(actual, 4),
                "mismatch_sec": round(actual - expected, 4),
                "mismatch_ratio": round(ratio, 4),
                "over_tolerance": over,
            }
        )
    return {
        "summary": {
            "total": len(rows),
            "violations": violations,
            "violation_rate": round((violations / len(rows)) if rows else 0.0, 6),
            "max_mismatch_ratio": round(max_ratio, 6),
            "tolerance_ratio": tolerance_ratio,
        },
        "rows": rows,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate TTS voiceover from prepro manifest")
    parser.add_argument("--prepro-manifest", required=True, type=Path)
    parser.add_argument("--out-audio", type=Path, default=None)
    parser.add_argument("--out-report", type=Path, default=None, help="generation report")
    parser.add_argument("--timing-report", type=Path, default=None)
    parser.add_argument("--quality-report", type=Path, default=None)

    parser.add_argument("--tts-backend", default="edge", choices=list_backend_names() + ["none"])
    parser.add_argument("--tts-fallback", default="none", choices=list_backend_names() + ["none"])
    parser.add_argument("--offline-strict", action="store_true")
    parser.add_argument("--voice", default=None)
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--volume", default="+0%")
    parser.add_argument("--pitch", default="+0Hz")
    parser.add_argument("--sample-rate", type=int, default=48000)
    parser.add_argument("--model-id", default=None)
    parser.add_argument("--model-dir", type=Path, default=None)
    parser.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    parser.add_argument("--speaker", default=None)
    parser.add_argument("--speaker-wav", type=Path, default=None)
    parser.add_argument("--cache-dir", type=Path, default=None)
    parser.add_argument("--no-cache", action="store_true")

    parser.add_argument("--gap-sec", type=float, default=0.15)
    parser.add_argument("--crossfade-sec", type=float, default=0.0)
    parser.add_argument("--trim-silence", action="store_true")
    parser.add_argument("--silence-db", type=float, default=-45.0)
    parser.add_argument("--silence-min-sec", type=float, default=0.2)
    parser.add_argument("--disable-loudnorm", action="store_true")
    parser.add_argument("--target-lufs", type=float, default=-16.0)
    parser.add_argument("--target-lra", type=float, default=11.0)
    parser.add_argument("--target-true-peak", type=float, default=-1.5)

    parser.add_argument("--timing-tolerance-ratio", type=float, default=0.35)
    parser.add_argument("--timing-policy", default="warn", choices=["ignore", "warn", "fail"])
    parser.add_argument("--segment-fail-policy", default="silence", choices=["silence", "error"])
    args = parser.parse_args()

    if args.tts_backend == "none":
        raise SystemExit("[FAIL] --tts-backend none is not valid for TTS generation command")
    if args.sample_rate <= 0:
        raise SystemExit("[FAIL] --sample-rate must be positive")
    if args.gap_sec < 0 or args.crossfade_sec < 0:
        raise SystemExit("[FAIL] --gap-sec and --crossfade-sec must be >= 0")
    if args.timing_tolerance_ratio < 0:
        raise SystemExit("[FAIL] --timing-tolerance-ratio must be >= 0")
    if args.speaker_wav and not args.speaker_wav.exists():
        raise SystemExit(f"[FAIL] speaker wav not found: {args.speaker_wav}")
    if not args.prepro_manifest.exists():
        raise SystemExit(f"[FAIL] prepro manifest not found: {args.prepro_manifest}")

    prepro = _json_load(args.prepro_manifest)
    beats_src = prepro.get("beats", [])
    if not beats_src:
        raise SystemExit("[FAIL] prepro manifest has no beats")

    prepro_dir = args.prepro_manifest.parent
    language = str(prepro.get("language", "auto"))
    voice = args.voice or default_voice(language, backend=args.tts_backend)

    out_audio = args.out_audio or (prepro_dir / "voiceover_master_tts.wav")
    out_report = args.out_report or (prepro_dir / "voiceover_tts_report.json")
    timing_report = args.timing_report or (prepro_dir / "timing_alignment_report.json")
    quality_report = args.quality_report or (prepro_dir / "voiceover_quality_report.json")

    chain = _backend_chain(args.tts_backend, args.tts_fallback)
    backends, backend_health = _load_backends(chain, offline_strict=args.offline_strict)
    if not backends:
        raise SystemExit(
            "[FAIL] no usable backend after healthcheck/offline policy: "
            + ", ".join(f"{k}={v.get('msg')}" for k, v in backend_health.items())
        )

    cache_dir = args.cache_dir or (prepro_dir / ".tts_cache")
    if not args.no_cache:
        cache_dir.mkdir(parents=True, exist_ok=True)

    opts = SynthOptions(
        language=language,
        voice=voice,
        rate=args.rate,
        volume=args.volume,
        pitch=args.pitch,
        sample_rate=args.sample_rate,
        model_id=args.model_id,
        model_dir=args.model_dir,
        device=args.device,
        speaker=args.speaker,
        speaker_wav=args.speaker_wav,
        cache_dir=cache_dir if not args.no_cache else None,
    )

    segments: List[Dict[str, Any]] = []
    failed_beats: List[str] = []
    synth_counts: Dict[str, int] = {name: 0 for name, _ in backends}
    cache_hits = 0
    used_backend_order: List[str] = []

    with tempfile.TemporaryDirectory(prefix="tts_prepro_") as td:
        tmp = Path(td)
        segment_paths: List[Path] = []
        seg_idx = 1

        for i, beat in enumerate(beats_src, start=1):
            beat_id = str(beat.get("beat_id", f"B{i:03d}"))
            scene_id = str(beat.get("scene_id", f"S{i:03d}"))
            text = str(beat.get("narration_text", beat.get("text", ""))).strip()
            expected = float(beat.get("duration_sec", 2.5))

            seg_wav = tmp / f"{seg_idx:04d}_{beat_id}.wav"
            seg_idx += 1
            attempts: List[Dict[str, Any]] = []
            chosen_backend: str | None = None
            used_cache = False

            if not text:
                generate_silence(seg_wav, 0.25, args.sample_rate)
                chosen_backend = "silence"
            else:
                success = False
                for name, backend in backends:
                    # Re-resolve voice per backend so fallback uses correct voice
                    be_opts = SynthOptions(
                        language=opts.language,
                        voice=args.voice or default_voice(language, backend=name),
                        rate=opts.rate,
                        volume=opts.volume,
                        pitch=opts.pitch,
                        sample_rate=opts.sample_rate,
                        model_id=opts.model_id,
                        model_dir=opts.model_dir,
                        device=opts.device,
                        speaker=opts.speaker,
                        speaker_wav=opts.speaker_wav,
                        cache_dir=opts.cache_dir,
                        exaggeration=opts.exaggeration,
                        cfg_weight=opts.cfg_weight,
                    )
                    try:
                        if not args.no_cache:
                            key = cache_key(text, name, be_opts)
                            cached = cache_dir / name / f"{key}.wav"
                            if cached.exists():
                                copy_file(cached, seg_wav)
                                success = True
                                chosen_backend = name
                                used_cache = True
                                cache_hits += 1
                                attempts.append({"backend": name, "ok": True, "cache_hit": True})
                                break

                        meta = backend.synthesize_to_wav(text, seg_wav, be_opts)
                        if not args.no_cache:
                            key = cache_key(text, name, be_opts)
                            cached = cache_dir / name / f"{key}.wav"
                            copy_file(seg_wav, cached)
                        success = True
                        chosen_backend = name
                        synth_counts[name] = synth_counts.get(name, 0) + 1
                        used_backend_order.append(name)
                        attempts.append({"backend": name, "ok": True, "cache_hit": False, "meta": meta})
                        break
                    except Exception as exc:  # noqa: BLE001
                        attempts.append({"backend": name, "ok": False, "error": str(exc)})

                if not success:
                    failed_beats.append(beat_id)
                    if args.segment_fail_policy == "error":
                        raise SystemExit(
                            f"[FAIL] synthesis failed for beat={beat_id}. attempts={attempts}"
                        )
                    generate_silence(seg_wav, expected, args.sample_rate)
                    chosen_backend = "silence_fallback"

            actual = ffprobe_duration_sec(seg_wav)
            segments.append(
                {
                    "order": i,
                    "beat_id": beat_id,
                    "scene_id": scene_id,
                    "text": text,
                    "expected_duration_sec": expected,
                    "actual_duration_sec": round(actual, 4),
                    "backend": chosen_backend,
                    "cache_hit": used_cache,
                    "attempts": attempts,
                    "segment_path": str(seg_wav),
                }
            )
            segment_paths.append(seg_wav)

            if args.gap_sec > 0 and i < len(beats_src):
                gap_wav = tmp / f"{seg_idx:04d}_gap.wav"
                seg_idx += 1
                generate_silence(gap_wav, args.gap_sec, args.sample_rate)
                segment_paths.append(gap_wav)

        assembled_raw = tmp / "voiceover_raw.wav"
        concat_segments_wav(segment_paths, assembled_raw, crossfade_sec=args.crossfade_sec)

        processed = assembled_raw
        if args.trim_silence:
            trimmed = tmp / "voiceover_trimmed.wav"
            apply_silence_trim(
                assembled_raw,
                trimmed,
                silence_db=args.silence_db,
                min_silence_sec=args.silence_min_sec,
            )
            processed = trimmed

        out_audio.parent.mkdir(parents=True, exist_ok=True)
        loudnorm_measure = None
        if args.disable_loudnorm:
            copy_file(processed, out_audio)
        else:
            loudnorm_measure = apply_loudnorm_two_pass(
                processed,
                out_audio,
                target_i=args.target_lufs,
                target_lra=args.target_lra,
                target_tp=args.target_true_peak,
            )

    timing = _check_timing(segments, tolerance_ratio=args.timing_tolerance_ratio)
    timing["policy"] = args.timing_policy
    timing["generated_at"] = datetime.now().isoformat()
    timing["prepro_manifest"] = str(args.prepro_manifest)
    timing["voiceover_audio"] = str(out_audio)
    _json_dump(timing_report, timing)

    violations = int(timing["summary"]["violations"])
    if violations > 0 and args.timing_policy == "warn":
        print(
            "[WARN] timing mismatch violations:",
            violations,
            "tolerance_ratio=",
            args.timing_tolerance_ratio,
        )
    if violations > 0 and args.timing_policy == "fail":
        raise SystemExit(
            f"[FAIL] timing violations={violations} exceed tolerance={args.timing_tolerance_ratio}"
        )

    quality = build_quality_report(
        out_audio,
        target_i=args.target_lufs,
        target_lra=args.target_lra,
        target_tp=args.target_true_peak,
    )
    quality["generated_at"] = datetime.now().isoformat()
    quality["loudnorm_applied"] = not args.disable_loudnorm
    quality["loudnorm_first_pass"] = loudnorm_measure
    quality["trim_silence"] = args.trim_silence
    _json_dump(quality_report, quality)

    # Feedback: write actual_duration back to prepro manifest beats
    actual_map = {seg["beat_id"]: seg["actual_duration_sec"] for seg in segments}
    updated = False
    for beat in beats_src:
        bid = str(beat.get("beat_id", ""))
        if bid in actual_map:
            beat["actual_duration_sec"] = actual_map[bid]
            updated = True
    if updated:
        _json_dump(args.prepro_manifest, prepro)
        print(f"[OK] actual_duration feedback written to {args.prepro_manifest}")

    report = {
        "project_id": prepro.get("project_id"),
        "prepro_manifest": str(args.prepro_manifest),
        "generated_at": datetime.now().isoformat(),
        "backend_chain": chain,
        "offline_strict": args.offline_strict,
        "backend_health": backend_health,
        "used_backend_synthesis_counts": synth_counts,
        "cache_hits": cache_hits,
        "failed_count": len(failed_beats),
        "failed_beat_ids": failed_beats,
        "out_audio": str(out_audio),
        "timing_report": str(timing_report),
        "quality_report": str(quality_report),
        "segments": segments,
    }
    _json_dump(out_report, report)

    print(f"[OK] tts voiceover: {out_audio}")
    print(f"[OK] tts report: {out_report}")
    print(f"[OK] timing report: {timing_report}")
    print(f"[OK] quality report: {quality_report}")
    print(f"[OK] failed beats: {len(failed_beats)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
