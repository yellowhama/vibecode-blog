#!/usr/bin/env python3
"""MCP server exposing CLI-Anything harnesses as tools for Claude Code.

Registers tools dynamically based on AVAILABLE_TOOLS from cli_anything_bridge.
Each tool call is stateless — project state is maintained via --project path args.

Usage:
    # Normal stdio MCP server (launched by Claude Code):
    python3 cli_anything_mcp_server.py

    # Self-test mode:
    python3 cli_anything_mcp_server.py --test
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

# Ensure sibling imports work
sys.path.insert(0, str(Path(__file__).resolve().parent))

from cli_anything_bridge import AVAILABLE_TOOLS, run_harness


# ---------------------------------------------------------------------------
# Tool registry — defines MCP tool schemas per harness
# ---------------------------------------------------------------------------

_TOOL_DEFS: dict[str, dict[str, Any]] = {}


def _reg(tool: str, group: str, command: str, description: str,
         params: dict[str, dict[str, Any]], required: list[str] | None = None) -> None:
    """Register a tool definition."""
    name = f"cli_{tool}_{group}_{command}"
    _TOOL_DEFS[name] = {
        "tool": tool,
        "group": group,
        "command": command,
        "description": description,
        "params": params,
        "required": required or [],
    }


# --- Audacity tools ---
_reg("audacity", "project", "new", "Create a new Audacity project",
     {"name": {"type": "string", "description": "Project name"},
      "path": {"type": "string", "description": "Working directory path"}},
     required=["path"])
_reg("audacity", "track", "add", "Add an audio track",
     {"type": {"type": "string", "description": "Track type: mono or stereo", "default": "mono"}})
_reg("audacity", "clip", "add", "Add audio clip to track",
     {"audio_path": {"type": "string", "description": "Path to audio file"},
      "track": {"type": "integer", "description": "Track number", "default": 1}},
     required=["audio_path"])
_reg("audacity", "effect", "add", "Apply audio effect",
     {"effect_name": {"type": "string", "description": "Effect name (normalize, compress, eq, etc.)"},
      "params": {"type": "object", "description": "Effect parameters as key-value pairs", "default": {}}},
     required=["effect_name"])
_reg("audacity", "export", "render", "Export/render audio project",
     {"output_path": {"type": "string", "description": "Output file path"},
      "format": {"type": "string", "description": "Audio format (wav, mp3, flac)", "default": "wav"}},
     required=["output_path"])

# --- Blender tools ---
_reg("blender", "scene", "new", "Create a new Blender scene",
     {"engine": {"type": "string", "description": "Render engine (CYCLES, EEVEE)", "default": "CYCLES"},
      "samples": {"type": "integer", "description": "Render samples", "default": 64},
      "path": {"type": "string", "description": "Working directory path"}},
     required=["path"])
_reg("blender", "object", "add", "Add object to scene",
     {"obj_type": {"type": "string", "description": "Object type (sphere, cube, camera, light, etc.)"},
      "location": {"type": "string", "description": "Location as 'x,y,z'", "default": "0,0,0"},
      "params": {"type": "object", "description": "Extra parameters", "default": {}}},
     required=["obj_type"])
_reg("blender", "material", "create", "Create and assign material",
     {"name": {"type": "string", "description": "Material name"},
      "color": {"type": "string", "description": "Color as 'r,g,b' (0-1 range)", "default": "0.8,0.8,0.8"}},
     required=["name"])
_reg("blender", "render", "execute", "Render the scene to file",
     {"output_path": {"type": "string", "description": "Output image path"},
      "width": {"type": "integer", "description": "Render width", "default": 1920},
      "height": {"type": "integer", "description": "Render height", "default": 1080}},
     required=["output_path"])

# --- Inkscape tools ---
_reg("inkscape", "document", "new", "Create a new SVG document",
     {"width": {"type": "integer", "description": "Canvas width", "default": 832},
      "height": {"type": "integer", "description": "Canvas height", "default": 480},
      "background": {"type": "string", "description": "Background color", "default": "#0D1B2A"},
      "path": {"type": "string", "description": "Working directory path"}},
     required=["path"])
_reg("inkscape", "object", "add", "Add SVG object",
     {"obj_type": {"type": "string", "description": "Object type (rect, circle, path, etc.)"},
      "params": {"type": "object", "description": "Object attributes", "default": {}}},
     required=["obj_type"])
_reg("inkscape", "layer", "add", "Add a layer",
     {"name": {"type": "string", "description": "Layer name"}},
     required=["name"])
_reg("inkscape", "text", "add", "Add text element",
     {"text": {"type": "string", "description": "Text content"},
      "x": {"type": "integer", "description": "X position", "default": 0},
      "y": {"type": "integer", "description": "Y position", "default": 0},
      "params": {"type": "object", "description": "Font/style parameters", "default": {}}},
     required=["text"])
_reg("inkscape", "export", "png", "Export document as PNG",
     {"output_path": {"type": "string", "description": "Output PNG path"},
      "width": {"type": "integer", "description": "Export width", "default": 832},
      "height": {"type": "integer", "description": "Export height", "default": 480}},
     required=["output_path"])

# --- Shotcut tools ---
_reg("shotcut", "project", "new", "Create a new Shotcut/melt project",
     {"profile": {"type": "string", "description": "Video profile", "default": "hd1080p30"},
      "path": {"type": "string", "description": "Working directory path"}},
     required=["path"])
_reg("shotcut", "track", "add", "Add timeline track",
     {"type": {"type": "string", "description": "Track type (video, audio)", "default": "video"}})
_reg("shotcut", "clip", "add", "Add clip to timeline",
     {"clip_path": {"type": "string", "description": "Path to media file"},
      "track": {"type": "integer", "description": "Track number", "default": 1}},
     required=["clip_path"])
_reg("shotcut", "transition", "add", "Add transition between clips",
     {"type": {"type": "string", "description": "Transition type (fade, dissolve, etc.)", "default": "fade"},
      "duration": {"type": "number", "description": "Duration in seconds", "default": 1.0}})
_reg("shotcut", "filter", "add", "Apply filter to clip/track",
     {"filter_name": {"type": "string", "description": "Filter name"},
      "params": {"type": "object", "description": "Filter parameters", "default": {}}},
     required=["filter_name"])
_reg("shotcut", "export", "render", "Render project to video file",
     {"output_path": {"type": "string", "description": "Output video path"},
      "preset": {"type": "string", "description": "Encoding preset", "default": "h264-high"}},
     required=["output_path"])

# --- GIMP tools ---
_reg("gimp", "project", "new", "Create a new GIMP image",
     {"width": {"type": "integer", "description": "Canvas width", "default": 1920},
      "height": {"type": "integer", "description": "Canvas height", "default": 1080},
      "background": {"type": "string", "description": "Background color", "default": "white"},
      "path": {"type": "string", "description": "Working directory path"}},
     required=["path"])
_reg("gimp", "image", "open", "Open image as layer",
     {"image_path": {"type": "string", "description": "Path to image file"}},
     required=["image_path"])
_reg("gimp", "canvas", "scale", "Scale/resize canvas",
     {"width": {"type": "integer", "description": "New width"},
      "height": {"type": "integer", "description": "New height"}},
     required=["width", "height"])
_reg("gimp", "filter", "add", "Apply image filter/adjustment",
     {"filter_name": {"type": "string", "description": "Filter name (brightness-contrast, levels, blur, etc.)"},
      "params": {"type": "object", "description": "Filter parameters", "default": {}}},
     required=["filter_name"])
_reg("gimp", "draw", "text", "Draw text on image",
     {"text": {"type": "string", "description": "Text content"},
      "x": {"type": "integer", "description": "X position", "default": 0},
      "y": {"type": "integer", "description": "Y position", "default": 0},
      "font_size": {"type": "integer", "description": "Font size", "default": 48},
      "params": {"type": "object", "description": "Extra parameters (color, font, opacity)", "default": {}}},
     required=["text"])
_reg("gimp", "layer", "flatten", "Flatten all layers",
     {})
_reg("gimp", "media", "probe", "Get image metadata",
     {"image_path": {"type": "string", "description": "Path to image file"}},
     required=["image_path"])
_reg("gimp", "export", "render", "Export image to file",
     {"output_path": {"type": "string", "description": "Output file path"},
      "format": {"type": "string", "description": "Output format (png, jpg, webp)", "default": "png"},
      "quality": {"type": "integer", "description": "Quality (1-100 for lossy formats)", "default": 95}},
     required=["output_path"])

# --- KDEnlive tools ---
_reg("kdenlive", "project", "new", "Create a new KDEnlive project",
     {"profile": {"type": "string", "description": "Video profile", "default": "hd1080p30"},
      "path": {"type": "string", "description": "Working directory path"}},
     required=["path"])
_reg("kdenlive", "bin", "import", "Import media into project bin",
     {"media_path": {"type": "string", "description": "Path to media file"}},
     required=["media_path"])
_reg("kdenlive", "track", "add", "Add timeline track",
     {"name": {"type": "string", "description": "Track name"},
      "type": {"type": "string", "description": "Track type (video, audio)", "default": "video"}},
     required=["name"])
_reg("kdenlive", "clip", "add", "Add clip to timeline track",
     {"track_id": {"type": "string", "description": "Target track"},
      "clip_id": {"type": "string", "description": "Bin clip ID"},
      "position": {"type": "number", "description": "Position in seconds", "default": 0},
      "in_point": {"type": "number", "description": "In point in seconds", "default": 0},
      "out_point": {"type": "number", "description": "Out point in seconds (0=full)", "default": 0}},
     required=["track_id", "clip_id"])
_reg("kdenlive", "clip", "trim", "Trim a clip on timeline",
     {"track_id": {"type": "string", "description": "Track containing clip"},
      "clip_index": {"type": "integer", "description": "Clip index on track"},
      "in_point": {"type": "number", "description": "New in point"},
      "out_point": {"type": "number", "description": "New out point"}},
     required=["track_id", "clip_index"])
_reg("kdenlive", "transition", "add", "Add transition between tracks",
     {"type": {"type": "string", "description": "Transition type (dissolve, wipe, etc.)", "default": "dissolve"},
      "track_a": {"type": "string", "description": "First track ID"},
      "track_b": {"type": "string", "description": "Second track ID"},
      "position": {"type": "number", "description": "Position in seconds", "default": 0},
      "duration": {"type": "number", "description": "Duration in seconds", "default": 1.0}},
     required=["track_a", "track_b"])
_reg("kdenlive", "filter", "add", "Apply filter to clip",
     {"track_id": {"type": "string", "description": "Track ID"},
      "clip_index": {"type": "integer", "description": "Clip index"},
      "filter_name": {"type": "string", "description": "Filter name"},
      "params": {"type": "object", "description": "Filter parameters", "default": {}}},
     required=["track_id", "clip_index", "filter_name"])
_reg("kdenlive", "guide", "add", "Add timeline guide/marker",
     {"position": {"type": "number", "description": "Position in seconds"},
      "comment": {"type": "string", "description": "Guide label/comment", "default": ""}},
     required=["position"])
_reg("kdenlive", "export", "xml", "Export project as MLT XML",
     {"output_path": {"type": "string", "description": "Output XML path"}},
     required=["output_path"])


# ---------------------------------------------------------------------------
# Harness argument builders — translate MCP params to CLI args
# ---------------------------------------------------------------------------

def _build_args(tool_name: str, tdef: dict[str, Any], params: dict[str, Any]) -> list[str]:
    """Build CLI arguments from tool definition and call parameters."""
    tool = tdef["tool"]
    group = tdef["group"]
    command = tdef["command"]

    # Base sub-command
    if tool == "audacity":
        return _build_audacity(group, command, params)
    elif tool == "blender":
        return _build_blender(group, command, params)
    elif tool == "inkscape":
        return _build_inkscape(group, command, params)
    elif tool == "shotcut":
        return _build_shotcut(group, command, params)
    elif tool == "gimp":
        return _build_gimp(group, command, params)
    elif tool == "kdenlive":
        return _build_kdenlive(group, command, params)
    else:
        raise ValueError(f"Unknown tool: {tool}")


def _build_audacity(group: str, command: str, p: dict) -> list[str]:
    if group == "project" and command == "new":
        args = ["project", "new", "--path", p.get("path", "/tmp")]
        if p.get("name"):
            args.extend(["--name", p["name"]])
        return args
    elif group == "track" and command == "add":
        return ["track", "add", "--type", p.get("type", "mono")]
    elif group == "clip" and command == "add":
        args = ["clip", "add", p["audio_path"]]
        if p.get("track"):
            args.extend(["--track", str(p["track"])])
        return args
    elif group == "effect" and command == "add":
        args = ["effect", "add", p["effect_name"]]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "export" and command == "render":
        return ["export", p["output_path"], "--format", p.get("format", "wav")]
    raise ValueError(f"Unknown audacity command: {group}/{command}")


def _build_blender(group: str, command: str, p: dict) -> list[str]:
    if group == "scene" and command == "new":
        args = ["scene", "new", "--engine", p.get("engine", "CYCLES"),
                "--samples", str(p.get("samples", 64))]
        if p.get("path"):
            args.extend(["--path", p["path"]])
        return args
    elif group == "object" and command == "add":
        loc = p.get("location", "0,0,0")
        args = ["object", "add", p["obj_type"], "--location", loc]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "material" and command == "create":
        return ["material", "create", p["name"], "--color", p.get("color", "0.8,0.8,0.8")]
    elif group == "render" and command == "execute":
        return ["render", "execute", "--output", p["output_path"],
                "--width", str(p.get("width", 1920)), "--height", str(p.get("height", 1080))]
    raise ValueError(f"Unknown blender command: {group}/{command}")


def _build_inkscape(group: str, command: str, p: dict) -> list[str]:
    if group == "document" and command == "new":
        args = ["document", "new", "--width", str(p.get("width", 832)),
                "--height", str(p.get("height", 480)),
                "--background", p.get("background", "#0D1B2A")]
        if p.get("path"):
            args.extend(["--path", p["path"]])
        return args
    elif group == "object" and command == "add":
        args = ["object", "add", p["obj_type"]]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "layer" and command == "add":
        return ["layer", "add", "--name", p["name"]]
    elif group == "text" and command == "add":
        args = ["text", "add", p["text"], "--x", str(p.get("x", 0)), "--y", str(p.get("y", 0))]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "export" and command == "png":
        return ["export", "png", p["output_path"],
                "--width", str(p.get("width", 832)), "--height", str(p.get("height", 480))]
    raise ValueError(f"Unknown inkscape command: {group}/{command}")


def _build_shotcut(group: str, command: str, p: dict) -> list[str]:
    if group == "project" and command == "new":
        args = ["project", "new", "--profile", p.get("profile", "hd1080p30")]
        if p.get("path"):
            args.extend(["--path", p["path"]])
        return args
    elif group == "track" and command == "add":
        return ["timeline", "add-track", "--type", p.get("type", "video")]
    elif group == "clip" and command == "add":
        args = ["timeline", "add-clip", p["clip_path"]]
        if p.get("track"):
            args.extend(["--track", str(p["track"])])
        return args
    elif group == "transition" and command == "add":
        return ["transitions", "add", p.get("type", "fade"),
                "--duration", str(p.get("duration", 1.0))]
    elif group == "filter" and command == "add":
        args = ["filters", "add", p["filter_name"]]
        for k, v in (p.get("params") or {}).items():
            args.extend(["--param", f"{k}={v}"])
        return args
    elif group == "export" and command == "render":
        return ["export", "render", p["output_path"],
                "--preset", p.get("preset", "h264-high")]
    raise ValueError(f"Unknown shotcut command: {group}/{command}")


def _build_gimp(group: str, command: str, p: dict) -> list[str]:
    if group == "project" and command == "new":
        args = ["project", "new", "--width", str(p.get("width", 1920)),
                "--height", str(p.get("height", 1080)),
                "--background", p.get("background", "white")]
        if p.get("path"):
            args.extend(["--path", p["path"]])
        return args
    elif group == "image" and command == "open":
        return ["layer", "add-from-file", p["image_path"]]
    elif group == "canvas" and command == "scale":
        return ["canvas", "resize", "--width", str(p["width"]), "--height", str(p["height"])]
    elif group == "filter" and command == "add":
        args = ["filter", "add", p["filter_name"]]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "draw" and command == "text":
        args = ["draw", "text", p["text"],
                "--x", str(p.get("x", 0)), "--y", str(p.get("y", 0)),
                "--font-size", str(p.get("font_size", 48))]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "layer" and command == "flatten":
        return ["layer", "flatten"]
    elif group == "media" and command == "probe":
        return ["media", "probe", p["image_path"]]
    elif group == "export" and command == "render":
        args = ["export", "render", p["output_path"],
                "--format", p.get("format", "png")]
        if p.get("quality"):
            args.extend(["--quality", str(p["quality"])])
        return args
    raise ValueError(f"Unknown gimp command: {group}/{command}")


def _build_kdenlive(group: str, command: str, p: dict) -> list[str]:
    if group == "project" and command == "new":
        args = ["project", "new", "--profile", p.get("profile", "hd1080p30")]
        if p.get("path"):
            args.extend(["--path", p["path"]])
        return args
    elif group == "bin" and command == "import":
        return ["bin", "import", p["media_path"]]
    elif group == "track" and command == "add":
        args = ["track", "add", "--name", p["name"],
                "--type", p.get("type", "video")]
        return args
    elif group == "clip" and command == "add":
        args = ["clip", "add", "--track", p["track_id"], "--clip", p["clip_id"],
                "--position", str(p.get("position", 0))]
        if p.get("in_point"):
            args.extend(["--in", str(p["in_point"])])
        if p.get("out_point"):
            args.extend(["--out", str(p["out_point"])])
        return args
    elif group == "clip" and command == "trim":
        args = ["clip", "trim", "--track", p["track_id"],
                "--index", str(p["clip_index"])]
        if p.get("in_point") is not None:
            args.extend(["--in", str(p["in_point"])])
        if p.get("out_point") is not None:
            args.extend(["--out", str(p["out_point"])])
        return args
    elif group == "transition" and command == "add":
        return ["transition", "add", "--type", p.get("type", "dissolve"),
                "--track-a", p["track_a"], "--track-b", p["track_b"],
                "--position", str(p.get("position", 0)),
                "--duration", str(p.get("duration", 1.0))]
    elif group == "filter" and command == "add":
        args = ["filter", "add", "--track", p["track_id"],
                "--index", str(p["clip_index"]),
                "--filter", p["filter_name"]]
        for k, v in (p.get("params") or {}).items():
            args.extend([f"--{k.replace('_', '-')}", str(v)])
        return args
    elif group == "guide" and command == "add":
        return ["guide", "add", "--position", str(p["position"]),
                "--comment", p.get("comment", "")]
    elif group == "export" and command == "xml":
        return ["export", "xml", p["output_path"]]
    raise ValueError(f"Unknown kdenlive command: {group}/{command}")


# ---------------------------------------------------------------------------
# MCP server implementation
# ---------------------------------------------------------------------------

def _get_available_tools() -> list[dict[str, Any]]:
    """Return MCP tool list filtered by available harnesses."""
    tools = []
    for name, tdef in _TOOL_DEFS.items():
        if tdef["tool"] not in AVAILABLE_TOOLS:
            continue

        # Build JSON Schema for inputSchema
        properties: dict[str, Any] = {}
        required: list[str] = list(tdef["required"])
        for pname, pinfo in tdef["params"].items():
            prop: dict[str, Any] = {"type": pinfo.get("type", "string")}
            if "description" in pinfo:
                prop["description"] = pinfo["description"]
            if "default" in pinfo:
                prop["default"] = pinfo["default"]
            properties[pname] = prop

        tools.append({
            "name": name,
            "description": f"[{tdef['tool']}] {tdef['description']}",
            "inputSchema": {
                "type": "object",
                "properties": properties,
                "required": required,
            },
        })
    return tools


def _call_tool(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Execute a tool call and return result."""
    tdef = _TOOL_DEFS.get(name)
    if not tdef:
        return {"error": f"Unknown tool: {name}", "available": sorted(_TOOL_DEFS.keys())}

    tool = tdef["tool"]
    if tool not in AVAILABLE_TOOLS:
        return {"error": f"Tool {tool!r} harness not installed",
                "available_harnesses": sorted(AVAILABLE_TOOLS)}

    # Check required params
    for req in tdef["required"]:
        if req not in arguments:
            return {"error": f"Missing required parameter: {req}",
                    "required": tdef["required"]}

    try:
        cli_args = _build_args(name, tdef, arguments)
        timeout = 300 if tdef["group"] in ("render", "export") else 30
        result = run_harness(tool, cli_args, timeout=timeout)
        return {"status": "ok", "tool": name, "result": result}
    except Exception as e:
        return {"status": "error", "tool": name, "error": str(e)}


def run_mcp_server() -> None:
    """Run stdio MCP server using the mcp SDK."""
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import TextContent, Tool
    import asyncio

    app = Server("cli-anything")

    @app.list_tools()
    async def list_tools() -> list[Tool]:
        tools = _get_available_tools()
        return [
            Tool(
                name=t["name"],
                description=t["description"],
                inputSchema=t["inputSchema"],
            )
            for t in tools
        ]

    @app.call_tool()
    async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        result = _call_tool(name, arguments)
        return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

    async def _main():
        async with stdio_server() as (read_stream, write_stream):
            await app.run(read_stream, write_stream, app.create_initialization_options())

    asyncio.run(_main())


def run_self_test() -> int:
    """Run self-diagnostic test."""
    print("=== CLI-Anything MCP Server Self-Test ===\n")

    print(f"Available harnesses: {sorted(AVAILABLE_TOOLS) or '(none)'}")
    print(f"Total tool definitions: {len(_TOOL_DEFS)}")

    available = _get_available_tools()
    print(f"Registered MCP tools (available): {len(available)}")

    for t in available:
        req = t["inputSchema"].get("required", [])
        print(f"  {t['name']:40s}  required={req}")

    # Test tool call with missing required param
    print("\n--- Error handling tests ---")
    r1 = _call_tool("nonexistent_tool", {})
    assert "error" in r1, f"Expected error for unknown tool: {r1}"
    print(f"  [OK] Unknown tool → {r1['error']}")

    r2 = _call_tool("cli_audacity_clip_add", {})
    if "error" in r2:
        print(f"  [OK] Missing required → {r2['error']}")
    else:
        print(f"  [SKIP] audacity harness executed (harness available)")

    print(f"\n=== Self-test complete: {len(available)} tools ready ===")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        raise SystemExit(run_self_test())
    run_mcp_server()
