#!/usr/bin/env python3
import asyncio
import json
import argparse
import os
from pathlib import Path
import edge_tts
import subprocess

async def generate_voiceover(manifest_path, output_dir, voice="en-US-AndrewNeural"):
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    output_dir = Path(output_dir)
    audio_dir = output_dir / "audio_segments"
    audio_dir.mkdir(parents=True, exist_ok=True)
    
    segments = []
    cursor = 0.0
    
    print(f"[TTS] Generating segments using voice: {voice}")
    
    # 1. Generate individual WAV segments
    for phase in manifest.get('phases', []):
        for beat in phase.get('beats', []):
            beat_id = beat['beat_id']
            text = beat['narration_text']
            
            # Temporary MP3 path (edge-tts default)
            mp3_path = audio_dir / f"{beat_id}.mp3"
            wav_path = audio_dir / f"{beat_id}.wav"
            
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(mp3_path)
            
            # Convert MP3 to WAV using ffmpeg for consistent quality
            subprocess.run([
                "ffmpeg", "-y", "-i", str(mp3_path),
                "-ar", "48000", "-ac", "1", str(wav_path)
            ], check=True, capture_output=True)
            
            # Get actual duration
            result = subprocess.run([
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", str(wav_path)
            ], capture_output=True, text=True)
            actual_dur = float(result.stdout.strip())
            
            segments.append({
                "beat_id": beat_id,
                "text": text,
                "start_sec": round(cursor, 3),
                "end_sec": round(cursor + actual_dur, 3),
                "duration_sec": round(actual_dur, 3),
                "path": str(wav_path)
            })
            
            cursor += actual_dur + 0.2  # 0.2s gap
            mp3_path.unlink() # Cleanup mp3
            print(f"  - {beat_id}: {actual_dur}s")

    # 2. Concatenate all WAVs into one master file
    master_wav = output_dir / "voiceover_master.wav"
    concat_list = audio_dir / "concat.txt"
    with open(concat_list, 'w') as f:
        for s in segments:
            f.write(f"file '{Path(s['path']).name}'\n")
            # Intersperse tiny silence gap if needed
    
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list), "-c", "copy", str(master_wav)
    ], check=True, capture_output=True)
    
    # 3. Generate SRT Subtitles
    srt_path = output_dir / "subtitles.srt"
    with open(srt_path, 'w', encoding='utf-8') as f:
        for i, s in enumerate(segments, 1):
            start = format_srt_time(s['start_sec'])
            end = format_srt_time(s['end_sec'])
            f.write(f"{i}\n{start} --> {end}\n{s['text']}\n\n")
            
    # 4. Save timing report
    with open(output_dir / "timing_alignment.json", 'w', encoding='utf-8') as f:
        json.dump(segments, f, indent=2)
        
    print(f"[OK] Master audio: {master_wav}")
    print(f"[OK] Subtitles: {srt_path}")
    return segments

def format_srt_time(seconds):
    td = float(seconds)
    hours = int(td // 3600)
    minutes = int((td % 3600) // 60)
    secs = int(td % 60)
    millis = int((td % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--voice", default="en-US-AndrewNeural")
    args = parser.parse_args()
    
    asyncio.run(generate_voiceover(args.manifest, args.output_dir, args.voice))
