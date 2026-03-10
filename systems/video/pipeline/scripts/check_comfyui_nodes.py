#!/usr/bin/env python3
"""Check ComfyUI node availability for advanced workflows.

Queries ComfyUI /object_info API to detect installed custom nodes
needed for IP-Adapter, ControlNet, VACE, and other advanced features.

Usage:
    python check_comfyui_nodes.py --server http://127.0.0.1:8188
    python check_comfyui_nodes.py --server http://127.0.0.1:8188 --json
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
import urllib.error

# Node classes to check and their feature groups
REQUIRED_NODES = {
    "ip_adapter": {
        "description": "IP-Adapter (character consistency)",
        "install": "git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git",
        "nodes": [
            "IPAdapterAdvanced",
            "IPAdapterModelLoader",
            "IPAdapterUnifiedLoader",
        ],
    },
    "controlnet": {
        "description": "ControlNet (pose/depth control)",
        "install": "git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git",
        "nodes": [
            "ControlNetLoader",
            "ControlNetApplyAdvanced",
        ],
    },
    "vace": {
        "description": "Wan VACE (video joining/editing)",
        "install": "git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git",
        "nodes": [
            "WanVaceToVideo",
        ],
    },
    "frame_interpolation": {
        "description": "RIFE Frame Interpolation",
        "install": "git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git",
        "nodes": [
            "RIFE VFI",
        ],
    },
    "video_helper": {
        "description": "Video Helper Suite (video I/O)",
        "install": "git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git",
        "nodes": [
            "VHS_VideoCombine",
            "VHS_LoadVideo",
        ],
    },
}

# Core nodes that should always exist
CORE_NODES = [
    "KSampler",
    "CLIPTextEncode",
    "VAEDecode",
    "LoadImage",
    "SaveImage",
]


def check_nodes(server: str) -> dict:
    """Query ComfyUI for available node types."""
    url = f"{server}/object_info"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return data
    except urllib.error.URLError as e:
        return {"_error": f"Cannot connect to ComfyUI at {server}: {e}"}
    except Exception as e:
        return {"_error": f"Error: {e}"}


def analyze_availability(node_info: dict) -> dict:
    """Check which feature groups are available."""
    if "_error" in node_info:
        return {"error": node_info["_error"], "features": {}}

    available_nodes = set(node_info.keys())

    # Check core
    core_ok = all(n in available_nodes for n in CORE_NODES)

    features = {}
    for feature_id, feature in REQUIRED_NODES.items():
        found = [n for n in feature["nodes"] if n in available_nodes]
        missing = [n for n in feature["nodes"] if n not in available_nodes]
        features[feature_id] = {
            "description": feature["description"],
            "available": len(missing) == 0,
            "found_nodes": found,
            "missing_nodes": missing,
            "install_command": feature["install"] if missing else None,
        }

    return {
        "server": True,
        "core_nodes": core_ok,
        "total_nodes": len(available_nodes),
        "features": features,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Check ComfyUI custom node availability")
    parser.add_argument("--server", default="http://127.0.0.1:8188", help="ComfyUI server")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--feature", default=None, help="Check specific feature only")
    args = parser.parse_args()

    node_info = check_nodes(args.server)
    result = analyze_availability(node_info)

    if args.json:
        print(json.dumps(result, indent=2))
        return

    if "error" in result:
        print(f"[ERROR] {result['error']}")
        sys.exit(1)

    print(f"ComfyUI Server: {args.server}")
    print(f"Total nodes: {result['total_nodes']}")
    print(f"Core nodes OK: {'YES' if result['core_nodes'] else 'NO'}")
    print()

    for fid, finfo in result["features"].items():
        if args.feature and fid != args.feature:
            continue
        status = "AVAILABLE" if finfo["available"] else "MISSING"
        icon = "[OK]" if finfo["available"] else "[!!]"
        print(f"  {icon} {finfo['description']}: {status}")
        if finfo["found_nodes"]:
            print(f"      Found: {', '.join(finfo['found_nodes'])}")
        if finfo["missing_nodes"]:
            print(f"      Missing: {', '.join(finfo['missing_nodes'])}")
            print(f"      Install: cd ComfyUI/custom_nodes && {finfo['install_command']}")
        print()


if __name__ == "__main__":
    main()
