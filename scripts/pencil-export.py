#!/usr/bin/env python3
"""High-resolution PNG export from individual single-frame .pen files.

Each .pen contains exactly one top-level frame at (0,0). `pencil --export
--export-scale 2` rasterizes that frame's bbox into a 2400×1260 PNG
(2× the 1200×630 design).
"""
import subprocess
from pathlib import Path

ROOT = Path("/mnt/f/Aisaak/Projects/vibecode-blog")
DESIGNS = ROOT / "designs"

EXPORTS = [
    ("d1-codebase-jungle.pen", "public/images/blog/10847-lines/codebase-jungle.png"),
    ("d2-three-defaults.pen", "public/images/blog/three-defaults/before-after.png"),
    ("d3-pipeline-failure.pen", "public/images/blog/6-ai-agents/pipeline-failure.png"),
    ("d4-flywheel.pen", "public/images/blog/wiki-starving/flywheel.png"),
    ("d5-island-map.pen", "public/images/about/island-map.png"),
]

SCALE = 2  # 1200×630 → 2400×1260

for src_pen, out_rel in EXPORTS:
    src = DESIGNS / src_pen
    out = ROOT / out_rel
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[{src_pen}] -> {out_rel}", flush=True)
    proc = subprocess.run(
        ["pencil",
         "--in", str(src),
         "--out", "/tmp/pencil-export-out.pen",
         "--export", str(out),
         "--export-scale", str(SCALE),
         "--prompt", "noop"],
        capture_output=True, text=True, timeout=180,
    )
    if out.exists():
        print(f"  saved: {out.stat().st_size}B", flush=True)
    else:
        print(f"  FAILED. stderr={proc.stderr[-300:]}", flush=True)
