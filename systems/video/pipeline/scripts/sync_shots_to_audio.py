#!/usr/bin/env python3
import json
import argparse
from pathlib import Path

def sync_manifests(shots_path, timing_path, output_path, padding=0.2):
    """Update shot durations based on actual TTS audio length."""
    with open(shots_path, 'r', encoding='utf-8') as f:
        shots_data = json.load(f)
    with open(timing_path, 'r', encoding='utf-8') as f:
        timing_data = json.load(f)
    
    # Create a mapping of beat_id -> duration
    timing_map = {t['beat_id']: t['duration_sec'] for t in timing_data}
    
    print(f"[SYNC] Synchronizing {len(shots_data['shots'])} shots with audio timings...")
    
    total_dur = 0.0
    for shot in shots_data['shots']:
        shot_id = shot['shot_id']
        if shot_id in timing_map:
            # Update to actual audio duration + small safety padding
            actual_dur = timing_map[shot_id]
            synced_dur = round(actual_dur + padding, 3)
            shot['duration_sec'] = synced_dur
            print(f"  - {shot_id}: {synced_dur}s (Audio: {actual_dur}s + {padding}s padding)")
        else:
            print(f"  - [WARN] No timing found for {shot_id}, keeping original: {shot['duration_sec']}s")
        
        total_dur += shot['duration_sec']
    
    shots_data['total_duration_sec'] = round(total_dur, 1)
    shots_data['synchronized_with_audio'] = True
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(shots_data, f, indent=2, ensure_ascii=False)
    
    print(f"[OK] Synchronized manifest saved to: {output_path}")
    print(f"[OK] New total duration: {shots_data['total_duration_sec']}s")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--shots", required=True, help="shots_planned.json")
    parser.add_argument("--timing", required=True, help="timing_alignment.json")
    parser.add_argument("--output", required=True, help="shots_synchronized.json")
    parser.add_argument("--padding", type=float, default=0.2)
    args = parser.parse_args()
    
    sync_manifests(args.shots, args.timing, args.output, args.padding)
