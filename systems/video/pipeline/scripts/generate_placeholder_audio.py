#!/usr/bin/env python3
"""Generate placeholder audio files for all entries in audio_catalog.json.

Creates silent WAV files (or sine-tone markers) so the full pipeline can run
end-to-end before real BGM/SFX assets are produced.

Usage:
    python generate_placeholder_audio.py
    python generate_placeholder_audio.py --catalog ../audio_catalog.json --tone
    python generate_placeholder_audio.py --dry-run
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Any

# Reuse catalog loader
sys.path.insert(0, str(Path(__file__).resolve().parent))
from audio_catalog import DEFAULT_ASSETS_ROOT, DEFAULT_CATALOG_PATH, load_catalog


BGM_PLACEHOLDER_DURATION = 30.0  # seconds — enough for one loop iteration
SAMPLE_RATE = 44100


def _generate_wav(
    output: Path,
    duration: float,
    use_tone: bool = False,
    frequency: float = 440.0,
) -> bool:
    """Generate a WAV file using FFmpeg. Returns True on success."""
    output.parent.mkdir(parents=True, exist_ok=True)

    if use_tone:
        source = f"sine=frequency={frequency}:sample_rate={SAMPLE_RATE}:duration={duration}"
    else:
        source = f"anullsrc=r={SAMPLE_RATE}:cl=stereo"

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", source,
        "-t", f"{duration:.3f}",
        "-c:a", "pcm_s16le",
        str(output),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def generate_placeholders(
    catalog_path: Path = DEFAULT_CATALOG_PATH,
    assets_root: Path = DEFAULT_ASSETS_ROOT,
    use_tone: bool = False,
    dry_run: bool = False,
) -> tuple[int, int]:
    """Generate placeholder WAVs for all catalog entries.

    Returns (created_count, skipped_count).
    """
    catalog = load_catalog(catalog_path, validate_files=False)
    created = 0
    skipped = 0

    for entry in catalog.get("bgm", []):
        out_path = assets_root / entry["path"]
        duration = BGM_PLACEHOLDER_DURATION
        if out_path.exists():
            print(f"  [SKIP] {entry['id']} — already exists")
            skipped += 1
            continue
        if dry_run:
            print(f"  [DRY] bgm/{entry['id']} → {out_path} ({duration:.1f}s)")
            created += 1
            continue
        freq = float(entry.get("bpm", 110))  # use BPM as tone freq for variety
        if _generate_wav(out_path, duration, use_tone=use_tone, frequency=freq):
            print(f"  [OK]  bgm/{entry['id']} → {out_path} ({duration:.1f}s)")
            created += 1
        else:
            print(f"  [ERR] bgm/{entry['id']} — ffmpeg failed", file=sys.stderr)

    for entry in catalog.get("sfx", []):
        out_path = assets_root / entry["path"]
        duration = float(entry.get("duration_sec", 1.0))
        if out_path.exists():
            print(f"  [SKIP] {entry['id']} — already exists")
            skipped += 1
            continue
        if dry_run:
            print(f"  [DRY] sfx/{entry['id']} → {out_path} ({duration:.1f}s)")
            created += 1
            continue
        freq = 880.0 if entry.get("category") == "error" else 440.0
        if _generate_wav(out_path, duration, use_tone=use_tone, frequency=freq):
            print(f"  [OK]  sfx/{entry['id']} → {out_path} ({duration:.1f}s)")
            created += 1
        else:
            print(f"  [ERR] sfx/{entry['id']} — ffmpeg failed", file=sys.stderr)

    return created, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate placeholder audio for audio_catalog.json")
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG_PATH)
    parser.add_argument("--assets-root", type=Path, default=DEFAULT_ASSETS_ROOT)
    parser.add_argument("--tone", action="store_true", help="Use sine tones instead of silence")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without generating")
    args = parser.parse_args()

    print("[PLACEHOLDER AUDIO] Generating from catalog...")
    created, skipped = generate_placeholders(
        catalog_path=args.catalog,
        assets_root=args.assets_root,
        use_tone=args.tone,
        dry_run=args.dry_run,
    )
    print(f"[PLACEHOLDER AUDIO] Done — {created} created, {skipped} skipped")


if __name__ == "__main__":
    main()
