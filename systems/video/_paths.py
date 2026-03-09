"""Central path constants for the video production pipeline.

All pipeline scripts should import paths from here instead of hardcoding.
Override VIDEO_ROOT env var to relocate the entire tree.
"""

from pathlib import Path
import os

VIDEO_ROOT = Path(os.environ.get("VIDEO_ROOT", str(Path(__file__).resolve().parent)))

PIPELINE_SCRIPTS = VIDEO_ROOT / "pipeline" / "scripts"
PIPELINE_PROMPTS = VIDEO_ROOT / "pipeline" / "prompts"
PIPELINE_BINDINGS = VIDEO_ROOT / "pipeline" / "bindings"
PIPELINE_MANIFESTS = VIDEO_ROOT / "pipeline" / "manifests"
PIPELINE_LEARNING = VIDEO_ROOT / "pipeline" / "learning"

PREPRODUCTION = VIDEO_ROOT / "preproduction"
OUTPUT = VIDEO_ROOT / "output"
OUTPUT_RENDERS = OUTPUT / "renders"
OUTPUT_YOUTUBE = OUTPUT / "youtube_packages"
OUTPUT_QA = OUTPUT / "qa_frames"
OUTPUT_LOGS = OUTPUT / "logs"

ASSETS = VIDEO_ROOT / "assets"
ASSETS_AUDIO_BGM = ASSETS / "audio" / "bgm"
ASSETS_AUDIO_SFX = ASSETS / "audio" / "sfx"
ASSETS_FONTS = ASSETS / "fonts"
ASSETS_CHARACTERS = ASSETS / "characters"

PLANNING = VIDEO_ROOT / "planning"
VISUAL_ASSETS_GUIDE = PLANNING / "03-visual_assets_guide.md"
CONTENT_EVAL_FRAMEWORK = PLANNING / "CONTENT_EVALUATION_FRAMEWORK.md"

WORKFLOWS = VIDEO_ROOT / "workflows"

# Blog content (relative to repo root, two levels up from VIDEO_ROOT)
REPO_ROOT = VIDEO_ROOT.parent.parent
BLOG_CONTENT = REPO_ROOT / "content" / "blog"
AUDIO_CATALOG = VIDEO_ROOT / "pipeline" / "audio_catalog.json"
