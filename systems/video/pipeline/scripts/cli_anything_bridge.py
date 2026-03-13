#!/usr/bin/env python3
"""Python bridge to CLI-Anything harnesses for video pipeline integration.

Provides session-based context managers for Audacity, Shotcut/melt, Blender,
and Inkscape via their CLI-Anything harness wrappers. Each session manages
temp files and project lifecycle automatically.

Usage:
    from cli_anything_bridge import AVAILABLE_TOOLS, run_harness, AudacitySession

    if "audacity" in AVAILABLE_TOOLS:
        with AudacitySession() as sess:
            sess.project_new()
            sess.track_add("mono")
            sess.clip_add("input.wav")
            sess.effect_add("normalize", level=-1)
            sess.export("output.wav")
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Tool availability check
# ---------------------------------------------------------------------------

_HARNESS_NAMES = {
    "audacity": "cli-anything-audacity",
    "shotcut": "cli-anything-shotcut",
    "blender": "cli-anything-blender",
    "inkscape": "cli-anything-inkscape",
    "gimp": "cli-anything-gimp",
    "kdenlive": "cli-anything-kdenlive",
}

AVAILABLE_TOOLS: set[str] = set()
for _tool, _binary in _HARNESS_NAMES.items():
    if shutil.which(_binary):
        AVAILABLE_TOOLS.add(_tool)


# ---------------------------------------------------------------------------
# Low-level harness runner
# ---------------------------------------------------------------------------

def run_harness(
    tool: str,
    args: list[str],
    json_mode: bool = True,
    timeout: int = 30,
    env: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Run a CLI-Anything harness command and return parsed output.

    Args:
        tool: Tool name (e.g. "audacity", "blender").
        args: Sub-command arguments.
        json_mode: If True, append --json and parse output as JSON.
        timeout: Command timeout in seconds.
        env: Extra environment variables.

    Returns:
        Parsed JSON dict, or {"stdout": ..., "stderr": ...} if not json_mode.
    """
    binary = _HARNESS_NAMES.get(tool)
    if not binary:
        raise ValueError(f"Unknown tool: {tool!r}. Known: {sorted(_HARNESS_NAMES)}")
    if tool not in AVAILABLE_TOOLS:
        raise RuntimeError(f"Tool {tool!r} not available (binary {binary!r} not found in PATH)")

    cmd = [binary] + list(args)
    if json_mode:
        cmd.append("--json")

    run_env = {**os.environ, **(env or {})}

    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
        env=run_env,
    )

    if proc.returncode != 0:
        raise RuntimeError(
            f"Harness {tool!r} failed (rc={proc.returncode}):\n"
            f"  cmd: {' '.join(cmd)}\n"
            f"  stderr: {proc.stderr[-500:]}"
        )

    if json_mode:
        try:
            return json.loads(proc.stdout)
        except json.JSONDecodeError:
            return {"stdout": proc.stdout, "stderr": proc.stderr, "_json_error": True}

    return {"stdout": proc.stdout, "stderr": proc.stderr}


# ---------------------------------------------------------------------------
# Session base class
# ---------------------------------------------------------------------------

class _HarnessSession:
    """Base context manager for CLI-Anything tool sessions."""

    tool: str = ""
    _render_timeout: int = 300
    _default_timeout: int = 30

    def __init__(self) -> None:
        self._tmpdir: tempfile.TemporaryDirectory | None = None
        self._workdir: Path | None = None

    def __enter__(self):
        self._tmpdir = tempfile.TemporaryDirectory(prefix=f"cli_anything_{self.tool}_")
        self._workdir = Path(self._tmpdir.name)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._tmpdir:
            self._tmpdir.cleanup()
            self._tmpdir = None
        return False

    @property
    def workdir(self) -> Path:
        if self._workdir is None:
            raise RuntimeError("Session not entered — use 'with' statement")
        return self._workdir

    def _run(self, args: list[str], timeout: int | None = None, **kw) -> dict[str, Any]:
        return run_harness(self.tool, args, timeout=timeout or self._default_timeout, **kw)

    def _run_render(self, args: list[str], **kw) -> dict[str, Any]:
        return run_harness(self.tool, args, timeout=self._render_timeout, **kw)


# ---------------------------------------------------------------------------
# Audacity Session
# ---------------------------------------------------------------------------

class AudacitySession(_HarnessSession):
    """Context manager for Audacity CLI-Anything harness.

    Usage:
        with AudacitySession() as sess:
            sess.project_new()
            sess.track_add("mono")
            sess.clip_add("input.wav")
            sess.effect_add("compress", threshold=-20, ratio=4)
            sess.effect_add("normalize", level=-1)
            result = sess.export("output.wav")
    """

    tool = "audacity"

    def project_new(self, name: str = "session") -> dict:
        return self._run(["project", "new", "--name", name, "--path", str(self.workdir)])

    def track_add(self, track_type: str = "mono") -> dict:
        return self._run(["track", "add", "--type", track_type])

    def clip_add(self, audio_path: str, track: int = 1) -> dict:
        return self._run(["clip", "add", str(audio_path), "--track", str(track)])

    def effect_add(self, effect_name: str, **params) -> dict:
        args = ["effect", "add", effect_name]
        for k, v in params.items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return self._run(args)

    def export(self, output_path: str, fmt: str = "wav") -> dict:
        return self._run_render(["export", str(output_path), "--format", fmt])


# ---------------------------------------------------------------------------
# Shotcut / melt Session
# ---------------------------------------------------------------------------

class ShotcutSession(_HarnessSession):
    """Context manager for Shotcut/melt CLI-Anything harness.

    Usage:
        with ShotcutSession() as sess:
            sess.project_new(profile="hd1080p30")
            sess.track_add("video")
            sess.clip_add("clip1.mp4", track=1)
            sess.clip_add("clip2.mp4", track=1)
            sess.transition_add("fade", duration=1.0)
            result = sess.export_render("output.mp4", preset="h264-high")
    """

    tool = "shotcut"

    def project_new(self, profile: str = "hd1080p30") -> dict:
        return self._run(["project", "new", "--profile", profile, "--path", str(self.workdir)])

    def track_add(self, track_type: str = "video") -> dict:
        return self._run(["timeline", "add-track", "--type", track_type])

    def clip_add(self, clip_path: str, track: int = 1) -> dict:
        return self._run(["timeline", "add-clip", str(clip_path), "--track", str(track)])

    def transition_add(self, transition_type: str = "fade", duration: float = 1.0) -> dict:
        return self._run(["transitions", "add", transition_type, "--duration", str(duration)])

    def filter_add(self, filter_name: str, **params) -> dict:
        args = ["filters", "add", filter_name]
        for k, v in params.items():
            args.extend([f"--param", f"{k}={v}"])
        return self._run(args)

    def export_render(self, output_path: str, preset: str = "h264-high") -> dict:
        env = {"QT_QPA_PLATFORM": "offscreen"}
        return self._run_render(
            ["export", "render", str(output_path), "--preset", preset],
            env=env,
        )


# ---------------------------------------------------------------------------
# Blender Session
# ---------------------------------------------------------------------------

class BlenderSession(_HarnessSession):
    """Context manager for Blender CLI-Anything harness.

    Usage:
        with BlenderSession() as sess:
            sess.scene_new(engine="CYCLES", samples=64)
            sess.object_add("sphere", location=(0, 0, 1))
            sess.material_create("clay", color=(0.8, 0.7, 0.6))
            sess.object_add("camera", location=(0, -5, 3))
            sess.object_add("light", light_type="AREA", location=(2, -2, 4))
            result = sess.render_execute("output.png", width=832, height=480)
    """

    tool = "blender"

    def scene_new(self, engine: str = "CYCLES", samples: int = 64) -> dict:
        return self._run([
            "scene", "new",
            "--engine", engine,
            "--samples", str(samples),
            "--path", str(self.workdir),
        ])

    def object_add(self, obj_type: str, location: tuple = (0, 0, 0), **params) -> dict:
        args = [
            "object", "add", obj_type,
            "--location", f"{location[0]},{location[1]},{location[2]}",
        ]
        for k, v in params.items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return self._run(args)

    def material_create(self, name: str, color: tuple = (0.8, 0.8, 0.8), **params) -> dict:
        args = [
            "material", "create", name,
            "--color", f"{color[0]},{color[1]},{color[2]}",
        ]
        for k, v in params.items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return self._run(args)

    def render_execute(self, output_path: str, width: int = 1920, height: int = 1080) -> dict:
        return self._run_render([
            "render", "execute",
            "--output", str(output_path),
            "--width", str(width),
            "--height", str(height),
        ])


# ---------------------------------------------------------------------------
# Inkscape Session
# ---------------------------------------------------------------------------

class InkscapeSession(_HarnessSession):
    """Context manager for Inkscape CLI-Anything harness.

    Usage:
        with InkscapeSession() as sess:
            sess.document_new(width=832, height=480, background="#0D1B2A")
            sess.object_add("rect", x=0, y=0, width=832, height=480)
            sess.object_add("circle", cx=416, cy=240, r=60)
            sess.layer_add("foreground")
            result = sess.export_png("output.png", width=832, height=480)
    """

    tool = "inkscape"

    def document_new(self, width: int = 832, height: int = 480, background: str = "#0D1B2A") -> dict:
        return self._run([
            "document", "new",
            "--width", str(width),
            "--height", str(height),
            "--background", background,
            "--path", str(self.workdir),
        ])

    def object_add(self, obj_type: str, **params) -> dict:
        args = ["object", "add", obj_type]
        for k, v in params.items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return self._run(args)

    def layer_add(self, name: str) -> dict:
        return self._run(["layer", "add", "--name", name])

    def text_add(self, text: str, x: int = 0, y: int = 0, **params) -> dict:
        args = ["text", "add", text, "--x", str(x), "--y", str(y)]
        for k, v in params.items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return self._run(args)

    def export_png(self, output_path: str, width: int = 832, height: int = 480) -> dict:
        return self._run_render([
            "export", "png",
            str(output_path),
            "--width", str(width),
            "--height", str(height),
        ])
