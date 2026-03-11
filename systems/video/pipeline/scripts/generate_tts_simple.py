#!/usr/bin/env python3
"""Multi-voice TTS generator with dialogue support.

Supports two modes:
1. Legacy: Single voice for all beats (phases/beats structure)
2. Multi-voice: Per-speaker voice from dialogue fields in shot manifest

Usage (legacy):
    python generate_tts_simple.py --manifest prepro.json --output-dir out/ --voice en-US-AndrewNeural

Usage (multi-voice from shot manifest):
    python generate_tts_simple.py --manifest shots.json --output-dir out/ --multi-voice
"""
import asyncio
import json
import argparse
import os
from pathlib import Path
from typing import Any

import edge_tts
import subprocess


# ---------------------------------------------------------------------------
# Voice mapping per character
# ---------------------------------------------------------------------------
VOICE_MAP_KO = {
    "vee": "ko-KR-SunHiNeural",       # Female, bright, energetic
    "bee": "ko-KR-InJoonNeural",       # Male, low, grumpy
    "narrator": "ko-KR-HyunsuNeural",  # Male, calm, informative
}

VOICE_MAP_EN = {
    "vee": "en-US-JennyNeural",
    "bee": "en-US-GuyNeural",
    "narrator": "en-US-AriaNeural",
}

SILENCE_GAP = 0.2  # seconds between segments


def _get_voice_map(lang: str) -> dict[str, str]:
    if lang.startswith("ko"):
        return VOICE_MAP_KO
    return VOICE_MAP_EN


def _get_voice(speaker: str, lang: str, fallback_voice: str) -> str:
    voice_map = _get_voice_map(lang)
    return voice_map.get(speaker.lower(), fallback_voice)


async def _tts_segment(text: str, voice: str, mp3_path: Path, wav_path: Path) -> float:
    """Generate one TTS segment. Returns actual duration in seconds."""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(mp3_path))

    subprocess.run([
        "ffmpeg", "-y", "-i", str(mp3_path),
        "-ar", "48000", "-ac", "1", str(wav_path)
    ], check=True, capture_output=True)

    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(wav_path)
    ], capture_output=True, text=True)
    actual_dur = float(result.stdout.strip())

    mp3_path.unlink(missing_ok=True)
    return actual_dur


async def generate_voiceover(manifest_path, output_dir, voice="en-US-AndrewNeural"):
    """Legacy single-voice mode: reads phases/beats structure."""
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    output_dir = Path(output_dir)
    audio_dir = output_dir / "audio_segments"
    audio_dir.mkdir(parents=True, exist_ok=True)

    segments = []
    cursor = 0.0

    print(f"[TTS] Generating segments using voice: {voice}")

    for phase in manifest.get('phases', []):
        for beat in phase.get('beats', []):
            beat_id = beat['beat_id']
            text = beat['narration_text']

            mp3_path = audio_dir / f"{beat_id}.mp3"
            wav_path = audio_dir / f"{beat_id}.wav"

            actual_dur = await _tts_segment(text, voice, mp3_path, wav_path)

            segments.append({
                "beat_id": beat_id,
                "text": text,
                "speaker": "narrator",
                "voice": voice,
                "start_sec": round(cursor, 3),
                "end_sec": round(cursor + actual_dur, 3),
                "duration_sec": round(actual_dur, 3),
                "path": str(wav_path)
            })

            cursor += actual_dur + SILENCE_GAP
            print(f"  - {beat_id}: {actual_dur:.2f}s")

    return _finalize(segments, output_dir, audio_dir)


async def generate_multivoice(manifest_path: str, output_dir: str, lang: str = "ko", fallback_voice: str = "ko-KR-HyunsuNeural"):
    """Multi-voice mode: reads shots with dialogue fields."""
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    output_dir = Path(output_dir)
    audio_dir = output_dir / "audio_segments"
    audio_dir.mkdir(parents=True, exist_ok=True)

    segments = []
    cursor = 0.0
    seg_idx = 0

    shots = manifest.get("shots", [])
    if not shots:
        print("[WARN] No shots in manifest. Trying legacy phases/beats format...")
        return await generate_voiceover(manifest_path, str(output_dir), fallback_voice)

    print(f"[TTS-MULTI] {len(shots)} shots, lang={lang}")

    for shot in shots:
        shot_id = shot.get("shot_id", "unknown")
        visual_type = shot.get("visual_type", "sitcom")
        dialogue = shot.get("dialogue", [])

        if not dialogue:
            # Fallback: use purpose/narration as narrator line
            text = shot.get("narration_text") or shot.get("purpose", "")
            if not text:
                continue
            dialogue = [{"speaker": "narrator", "text": text}]

        for line in dialogue:
            speaker = line.get("speaker", "narrator")
            text = line.get("text", "").strip()
            emotion = line.get("emotion", "")

            if not text:
                continue

            seg_idx += 1
            seg_id = f"{shot_id}_L{seg_idx:03d}"
            voice = _get_voice(speaker, lang, fallback_voice)

            mp3_path = audio_dir / f"{seg_id}.mp3"
            wav_path = audio_dir / f"{seg_id}.wav"

            actual_dur = await _tts_segment(text, voice, mp3_path, wav_path)

            segments.append({
                "beat_id": seg_id,
                "shot_id": shot_id,
                "speaker": speaker,
                "emotion": emotion,
                "text": text,
                "voice": voice,
                "visual_type": visual_type,
                "start_sec": round(cursor, 3),
                "end_sec": round(cursor + actual_dur, 3),
                "duration_sec": round(actual_dur, 3),
                "path": str(wav_path)
            })

            cursor += actual_dur + SILENCE_GAP
            print(f"  - {seg_id} [{speaker}/{voice}]: {actual_dur:.2f}s — {text[:50]}...")

    return _finalize(segments, output_dir, audio_dir)


def _finalize(segments: list[dict[str, Any]], output_dir: Path, audio_dir: Path) -> list[dict[str, Any]]:
    """Concatenate WAVs, generate SRT, save timing report."""
    if not segments:
        print("[WARN] No segments generated.")
        return []

    # 1. Concatenate all WAVs
    master_wav = output_dir / "voiceover_master.wav"
    concat_list = audio_dir / "concat.txt"
    with open(concat_list, 'w') as f:
        for s in segments:
            f.write(f"file '{Path(s['path']).name}'\n")

    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list), "-c", "copy", str(master_wav)
    ], check=True, capture_output=True)

    # 2. Generate SRT
    srt_path = output_dir / "subtitles.srt"
    with open(srt_path, 'w', encoding='utf-8') as f:
        for i, s in enumerate(segments, 1):
            start = format_srt_time(s['start_sec'])
            end = format_srt_time(s['end_sec'])
            speaker = s.get('speaker', '')
            prefix = f"[{speaker}] " if speaker and speaker != "narrator" else ""
            f.write(f"{i}\n{start} --> {end}\n{prefix}{s['text']}\n\n")

    # 3. Save timing report
    with open(output_dir / "timing_alignment.json", 'w', encoding='utf-8') as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)

    # 4. Summary
    speakers = set(s.get("speaker", "unknown") for s in segments)
    total_dur = segments[-1]["end_sec"] if segments else 0
    print(f"\n[OK] Master audio: {master_wav} ({total_dur:.1f}s)")
    print(f"[OK] Subtitles: {srt_path}")
    print(f"[OK] Speakers: {', '.join(sorted(speakers))}")
    print(f"[OK] Segments: {len(segments)}")
    return segments


def format_srt_time(seconds):
    td = float(seconds)
    hours = int(td // 3600)
    minutes = int((td % 3600) // 60)
    secs = int(td % 60)
    millis = int((td % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-voice TTS generator")
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--voice", default="en-US-AndrewNeural",
                        help="Default voice (legacy single-voice mode)")
    parser.add_argument("--multi-voice", action="store_true",
                        help="Enable multi-voice mode (reads dialogue fields from shots)")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"],
                        help="Language for voice selection (default: ko)")
    args = parser.parse_args()

    if args.multi_voice:
        fallback = VOICE_MAP_KO["narrator"] if args.lang == "ko" else VOICE_MAP_EN["narrator"]
        asyncio.run(generate_multivoice(args.manifest, args.output_dir, args.lang, fallback))
    else:
        asyncio.run(generate_voiceover(args.manifest, args.output_dir, args.voice))
