#!/usr/bin/env python3
"""Refactored Script Adaptor: The High-Context Prompt Generator (v2.1).

Instead of calling APIs, this script packages the Blog, Storyform, and YouTube
retention rules into a single .prompt file for Agent execution (Gemini/Claude).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict


SCRIPTS_DIR = Path(__file__).resolve().parent
PIPELINE_DIR = SCRIPTS_DIR.parent
STORYFORM_PATH = Path(__file__).resolve().parent.parent.parent.parent / "branding" / "storyform.json"

# YouTube Retention v2.1 Rules
RETENTION_RULES = """
### YOUTUBE RETENTION RULES (v2.1)
1. **Stage 0: The Result Hook (0-10s)**: Start at the CLIMAX. Show the working solution or the end result first.
   - Example: "My 3 computers finally act like one. This took 6 months of hell."
2. **Open Loop**: After the hook, immediately drop into the FURY (The Problem) to create a curiosity gap.
3. **The 3-Second Rule**: Every beat must have a visual change or a punchy movement description.
4. **The Nike Rule**: Action > Dialogue. Minimal talking, maximum visual "Proof of Work".
"""

# Larry/Bukowski Persona
PERSONA_RULES = """
### TONE & PERSONA: BUKOWSKI + LARRY
- **Bukowski Grit (60%)**: Raw, coarse, short sentences. "Monday morning crash. 3 hours wasted."
- **Indie Hacker (30%)**: Bold, technical, no-BS. "Implementation is free. Orchestration is everything."
- **Product Philosopher (10%)**: The insight at the end.
- **Strictly Prohibited**: "Game-changer", "Deep dive", "Unpack", "In conclusion".
"""

def load_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")

def generate_prompt_file(
    blog_path: Path,
    storyform_path: Path,
    output_path: Path,
    language: str = "en"
) -> str:
    blog_text = load_text(blog_path)
    storyform = load_text(storyform_path)
    
    prompt_content = f"""# TASK: ADAPT BLOG TO FOUNTAIN SCRIPT (NCP v2.1)

You are an expert Script Doctor and Screenwriter. Your goal is to convert the following blog post into a high-retention YouTube script in **Fountain (.fountain)** format.

{PERSONA_RULES}

{RETENTION_RULES}

## BRANDING DNA (NCP STORYFORM)
{storyform}

## SOURCE BLOG CONTENT
{blog_text}

---

## OUTPUT REQUIREMENTS
1. **Format**: Valid Fountain screenplay markup.
2. **Structure**: 
   - == act: hook == (Result First)
   - == act: fury == (The Frustration)
   - == act: mess == (The Yak Shaving)
   - == act: insight == (The Declaration)
3. **Visuals**: Detailed descriptions for Claymation generation (No text in visuals).
4. **Dialogue**: First-person NARRATOR dialogue only. Max 2 sentences per shot.
5. **Citation & Research**: Any statistics, quotes, or factual claims MUST include a brief inline source verification or context from the original blog. Do not hallucinate facts.

Please output the `.fountain` content first, then a `narration_manifest.json` following the established schema.
"""
    output_path.write_text(prompt_content, encoding="utf-8")
    return str(output_path)

def main():
    parser = argparse.ArgumentParser(description="Generate high-context script prompt")
    parser.add_argument("--blog", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("script_generation.prompt"))
    parser.add_argument("--language", default="en")
    args = parser.parse_args()

    prompt_file = generate_prompt_file(args.blog, STORYFORM_PATH, args.output, args.language)
    print(f"[OK] High-context prompt generated: {prompt_file}")
    print(f"     Next: Run 'gemini {prompt_file}' or feed to Claude Code.")

if __name__ == "__main__":
    main()
