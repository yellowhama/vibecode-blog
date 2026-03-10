#!/usr/bin/env python3
"""Build Preproduction Manifest from Blog Markdown (v2.1).

Parses blog MD into semantic beats, extracts images, and estimates duration.
Standardizes input for the Agent-Mediated Script Adaptation stage.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


def _estimate_duration(text: str, language: str) -> float:
    """Estimate duration based on char/word count."""
    if language == "ko":
        # Avg 5.5 chars per second for Korean narration
        return max(1.5, round(len(text) / 5.5, 1))
    else:
        # Avg 2.5 words per second for English narration
        words = len(text.split())
        return max(1.5, round(words / 2.5, 1))


def detect_language(text: str) -> str:
    """Simple heuristic to detect KO or EN."""
    if re.search(r"[가-힣]", text):
        return "ko"
    return "en"


def parse_blog_to_beats(content: str, language: str) -> List[Dict[str, Any]]:
    """Convert MD content into a list of raw beats."""
    # Remove headers and code blocks for clean text analysis
    content = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
    
    # Extract images: ![alt](path)
    image_pattern = re.compile(r"!\[(.*?)\]\((.*?)\)")
    
    lines = content.split("\n")
    beats = []
    beat_idx = 1
    
    current_text = []
    current_images = []
    
    for line in lines:
        line = line.strip()
        if not line:
            if current_text:
                text_blob = " ".join(current_text)
                beats.append({
                    "beat_id": f"B{beat_idx:03d}",
                    "text": text_blob,
                    "duration_sec": _estimate_duration(text_blob, language),
                    "images": list(current_images)
                })
                beat_idx += 1
                current_text = []
                current_images = []
            continue
            
        # Check for images in this line
        img_matches = image_pattern.findall(line)
        for alt, path in img_matches:
            current_images.append({"alt": alt, "path": path})
            
        # Remove MD image syntax from text
        line_clean = image_pattern.sub("", line).strip()
        # Remove other MD (bold, etc)
        line_clean = re.sub(r"[\*#_>]", "", line_clean).strip()
        
        if line_clean:
            current_text.append(line_clean)
            
    # Final beat
    if current_text:
        text_blob = " ".join(current_text)
        beats.append({
            "beat_id": f"B{beat_idx:03d}",
            "text": text_blob,
            "duration_sec": _estimate_duration(text_blob, language),
            "images": current_images
        })
        
    return beats


def main():
    parser = argparse.ArgumentParser(description="Blog to Prepro Manifest")
    parser.add_argument("--blog", type=Path, required=True)
    parser.add_argument("--out-root", type=Path, required=True)
    parser.add_argument("--language", default="auto")
    parser.add_argument("--project-id", default=None)
    # Ignored but kept for compatibility with run_blog_to_video_pipeline.py
    parser.add_argument("--max-beats", type=int, default=24)
    parser.add_argument("--target-duration-sec", type=float, default=180.0)
    args = parser.parse_args()

    content = args.blog.read_text(encoding="utf-8")
    lang = args.language if args.language != "auto" else detect_language(content)
    
    project_id = args.project_id or args.blog.stem
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = args.out_root / f"{project_id}_{timestamp}"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    beats = parse_blog_to_beats(content, lang)
    
    manifest = {
        "project_id": project_id,
        "language": lang,
        "source_file": str(args.blog),
        "created_at": datetime.now().isoformat(),
        "total_raw_beats": len(beats),
        "total_estimated_duration_sec": sum(b["duration_sec"] for b in beats),
        "beats": beats
    }
    
    out_path = out_dir / "prepro_manifest.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        
    print(f"[OK] prepro dir: {out_dir}")
    print(f"[OK] prepro manifest: {out_path}")

if __name__ == "__main__":
    main()
