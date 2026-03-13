#!/usr/bin/env python3
"""Generate 3D claymation scene renders via Blender CLI.

Reads a shot manifest, filters for visual_type: "sitcom" shots, and generates
Blender Python scripts to set up claymation-style scenes (character placement,
camera, lighting). Renders headless via `blender --background --python`.

Output: 832x480 PNGs → storyboard pipeline directory.

Usage:
    python generate_claymation_scenes.py \
        --manifest ep01_shot_manifest.json \
        --output-dir output/renders/ep01_claymation \
        --dry-run

Requires: Blender 4.x (set BLENDER_PATH or add to PATH)
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


def find_blender() -> str:
    """Find Blender binary via env var or PATH."""
    env_path = os.environ.get("BLENDER_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path
    path = shutil.which("blender")
    if path:
        return path
    raise RuntimeError(
        "Blender not found. Set BLENDER_PATH or add to PATH.\n"
        "  Download: https://www.blender.org/download/"
    )


def _json_load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _build_blender_script(shot: dict[str, Any], output_path: Path) -> str:
    """Generate a Blender Python script for a single claymation scene."""
    characters = shot.get("characters", [])
    prompt = shot.get("prompt_positive", "")
    width = shot.get("width", 832)
    height = shot.get("height", 480)

    return f'''
import bpy
import math

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# --- Scene setup ---
scene = bpy.context.scene
scene.render.resolution_x = {width}
scene.render.resolution_y = {height}
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.device = 'GPU'
scene.render.filepath = r"{output_path.as_posix()}"
scene.render.image_settings.file_format = 'PNG'

# --- Claymation material ---
def make_clay_material(name, color):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.85
    bsdf.inputs['Subsurface Weight'].default_value = 0.15
    noise = nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 50.0
    noise.inputs['Detail'].default_value = 8.0
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.05

    links.new(noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

# --- Ground plane (clay table) ---
bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "ClayTable"
ground_mat = make_clay_material("GroundClay", (0.76, 0.70, 0.65))
ground.data.materials.append(ground_mat)

# --- Character placeholders ---
char_colors = {{
    "vee": (0.95, 0.85, 0.2),       # yellow hoodie
    "default": (0.4, 0.6, 0.8),
}}
char_positions = [(0, 0, 0.75), (-1.5, 0, 0.75), (1.5, 0, 0.75)]

characters = {characters!r}
for i, char_name in enumerate(characters):
    pos = char_positions[i % len(char_positions)]
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(pos[0], pos[1], pos[2] + 0.5))
    head = bpy.context.active_object
    head.name = f"{{char_name}}_head"
    color = char_colors.get(char_name, char_colors["default"])
    head.data.materials.append(make_clay_material(f"{{char_name}}_clay", color))

    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.0, location=pos)
    body = bpy.context.active_object
    body.name = f"{{char_name}}_body"
    body.data.materials.append(make_clay_material(f"{{char_name}}_body_clay", color))

# --- Camera ---
bpy.ops.object.camera_add(location=(0, -5, 3))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(70), 0, 0)
cam.data.lens = 35
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 2.8
if characters:
    target = bpy.data.objects.get(f"{{characters[0]}}_head")
    if target:
        cam.data.dof.focus_object = target
scene.camera = cam

# --- Lighting (warm 3-point) ---
bpy.ops.object.light_add(type='AREA', location=(2, -2, 4))
key = bpy.context.active_object
key.data.energy = 200
key.data.color = (1.0, 0.95, 0.85)
key.data.size = 3

bpy.ops.object.light_add(type='AREA', location=(-3, -1, 3))
fill = bpy.context.active_object
fill.data.energy = 80
fill.data.color = (0.85, 0.9, 1.0)
fill.data.size = 4

bpy.ops.object.light_add(type='AREA', location=(0, 3, 2))
rim = bpy.context.active_object
rim.data.energy = 120
rim.data.color = (1.0, 0.98, 0.9)
rim.data.size = 2

# --- World background ---
world = bpy.data.worlds.new("ClayWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.85, 0.82, 0.78, 1.0)
bg.inputs["Strength"].default_value = 0.5

# --- Render ---
bpy.ops.render.render(write_still=True)
print("RENDER_COMPLETE: " + scene.render.filepath)
'''


def render_shot(blender: str, shot: dict[str, Any], output_dir: Path, dry_run: bool = False) -> Path | None:
    """Render a single shot scene."""
    shot_id = shot["shot_id"]
    output_path = output_dir / f"{shot_id}_claymation.png"

    if output_path.exists():
        print(f"  [skip] {shot_id} — already rendered")
        return output_path

    script_content = _build_blender_script(shot, output_path)

    if dry_run:
        print(f"  [dry-run] {shot_id} → {output_path}")
        return None

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(script_content)
        script_path = f.name

    try:
        result = subprocess.run(
            [blender, "--background", "--python", script_path],
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode != 0:
            print(f"  [FAIL] {shot_id}: {result.stderr[-500:]}", file=sys.stderr)
            return None
        if output_path.exists():
            print(f"  [OK] {shot_id} → {output_path}")
            return output_path
        else:
            print(f"  [FAIL] {shot_id}: render output not found", file=sys.stderr)
            return None
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {shot_id}", file=sys.stderr)
        return None
    finally:
        os.unlink(script_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate claymation scene renders via Blender CLI")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--output-dir", required=True, help="Output directory for rendered PNGs")
    parser.add_argument("--visual-type", default="sitcom", help="Filter shots by visual_type (default: sitcom)")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be rendered without actually rendering")
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = _json_load(manifest_path)
    shots = [s for s in manifest.get("shots", []) if s.get("visual_type") == args.visual_type]

    if not shots:
        print(f"No shots with visual_type={args.visual_type!r} found.")
        return

    print(f"Found {len(shots)} {args.visual_type} shots")

    blender = find_blender()
    print(f"Using Blender: {blender}")

    rendered = []
    for shot in shots:
        result = render_shot(blender, shot, output_dir, dry_run=args.dry_run)
        if result:
            rendered.append(str(result))

    print(f"\nRendered {len(rendered)}/{len(shots)} shots")

    # Write render report
    report_path = output_dir / "claymation_render_report.json"
    report = {
        "manifest": str(manifest_path),
        "visual_type": args.visual_type,
        "total_shots": len(shots),
        "rendered": len(rendered),
        "files": rendered,
    }
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
