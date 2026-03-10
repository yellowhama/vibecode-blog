#!/usr/bin/env python3
"""Pipeline shim — delegates to the mature batch renderer.

This file exists so that pipeline DAG scripts (run_blog_to_video_pipeline,
run_end_to_end_video_pipeline, qa_correction_agent, character_sheet_generator)
can call ``python comfy_batch_render.py`` from this directory without changes.

All real logic lives in systems/video/scripts/comfy_batch_render.py.
"""

from __future__ import annotations

import os
import subprocess
import sys

# Resolve the canonical batch renderer
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_CANONICAL = os.path.normpath(
    os.path.join(_THIS_DIR, os.pardir, os.pardir, "scripts", "comfy_batch_render.py")
)


def main() -> int:
    # Translate legacy argument names used by pipeline callers
    args = sys.argv[1:]
    translated: list[str] = []
    skip_next = False

    for i, arg in enumerate(args):
        if skip_next:
            skip_next = False
            continue

        # --output-root → --output-dir
        if arg == "--output-root":
            translated.append("--output-dir")
            continue
        if arg.startswith("--output-root="):
            translated.append(arg.replace("--output-root=", "--output-dir=", 1))
            continue

        # --timeout-sec / --poll-sec: not supported by canonical script, drop them
        if arg in ("--timeout-sec", "--poll-sec"):
            skip_next = True  # skip the value too
            continue
        if arg.startswith(("--timeout-sec=", "--poll-sec=")):
            continue

        translated.append(arg)

    cmd = [sys.executable, _CANONICAL] + translated
    result = subprocess.run(cmd)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
