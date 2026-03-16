#!/usr/bin/env python3
"""Animate keyframes to video clips via ComfyUI.

v5 pipeline defaults:
- Model: Wan 2.2 MoE GGUF (not HunyuanVideo)
- Resolution: 1280x720 (not 832x480)
- T2I workflow: flux_simplevector_t2i.json (Flux dev + SimpleVectorFlux LoRA)
- Edit workflow: flux_kontext_2d_edit.json (character consistency)
- I2V workflow: wan22_moe_i2v_full.json
- Prompt style: v3ct0r trigger word, 2D flat vector

Usage:
    python animate_shots.py \
        --keyframes path/to/keyframes/ \
        --manifest ep01_shot_manifest_v5.json \
        --output path/to/clips/
"""
import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

COMFYUI_WORKFLOWS = Path("/mnt/e/vibecode-blog/systems/video/workflows/api")

# v5 workflow files
WORKFLOW_T2I = "flux_simplevector_t2i.json"
WORKFLOW_KONTEXT = "flux_kontext_2d_edit.json"
WORKFLOW_I2V_FULL = "wan22_moe_i2v_full.json"
WORKFLOW_I2V_SHORT = "wan22_moe_i2v_short.json"

# v5 default resolution
DEFAULT_WIDTH = 1280
DEFAULT_HEIGHT = 720

# v3ct0r style trigger for prompt injection
V3CT0R_PREFIX = "v3ct0r style, simple flat vector art"


def main():
    parser = argparse.ArgumentParser(description="ComfyUI I2V animator (v5 pipeline)")
    parser.add_argument("--keyframes", required=True, help="Keyframes directory")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON (v5 format)")
    parser.add_argument("--output", required=True, help="Output directory for clips")
    parser.add_argument("--workflow", default=WORKFLOW_I2V_FULL, help="I2V workflow file")
    parser.add_argument("--comfyui-url", default="http://127.0.0.1:8188")
    parser.add_argument("--draft", action="store_true", help="Use short workflow (2s instead of 5s)")
    parser.add_argument("--skip-diagrams", action="store_true",
                        help="Skip diagram/motion_graphic shots (they go to Motion Canvas)")
    parser.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument("--timeout", type=int, default=600, help="Per-shot render timeout in seconds")
    args = parser.parse_args()

    keyframes_dir = Path(args.keyframes)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(Path(args.manifest).read_text())
    shots = manifest.get("shots", manifest if isinstance(manifest, list) else [])

    # Read resolution from manifest header if available
    resolution_str = manifest.get("resolution", f"{args.width}x{args.height}")
    try:
        res_w, res_h = resolution_str.split("x")
        width = int(res_w)
        height = int(res_h)
    except (ValueError, AttributeError):
        width = args.width
        height = args.height

    # Load workflow
    wf_name = WORKFLOW_I2V_SHORT if args.draft else args.workflow
    wf_path = COMFYUI_WORKFLOWS / wf_name
    if not wf_path.exists():
        print(f"Workflow not found: {wf_path}", file=sys.stderr)
        sys.exit(1)
    workflow_raw = json.loads(wf_path.read_text())
    # Extract the 'prompt' sub-object if present (ComfyUI API format)
    workflow = workflow_raw.get("prompt", workflow_raw)

    # Check ComfyUI is running
    try:
        urllib.request.urlopen(f"{args.comfyui_url}/system_stats", timeout=5)
    except (urllib.error.URLError, ConnectionError):
        print(f"ComfyUI not running at {args.comfyui_url}", file=sys.stderr)
        sys.exit(1)

    print(f"Animating {len(shots)} shots @ {width}x{height} (Wan 2.2 MoE GGUF)")
    rendered = 0
    skipped = 0
    failed = 0

    for i, shot in enumerate(shots):
        shot_id = shot.get("shot_id", f"shot_{i:03d}")
        visual_type = shot.get("visual_type", "character_reaction")
        segment = shot.get("segment", "")

        # Skip diagram shots if requested (they go to Motion Canvas pipeline)
        if args.skip_diagrams and visual_type in ("diagram", "motion_graphic"):
            if not _has_characters(shot):
                print(f"  [{i+1}/{len(shots)}] {shot_id}: SKIP (diagram → Motion Canvas)")
                skipped += 1
                continue

        # Find keyframe
        kf = keyframes_dir / f"{shot_id}_keyframe.png"
        if not kf.exists():
            # Try alternative naming
            candidates = list(keyframes_dir.glob(f"{shot_id}*"))
            if candidates:
                kf = candidates[0]
            else:
                print(f"  [{i+1}/{len(shots)}] {shot_id}: NO KEYFRAME")
                skipped += 1
                continue

        output_file = output_dir / f"{shot_id}.mp4"
        if output_file.exists():
            print(f"  [{i+1}/{len(shots)}] {shot_id}: CACHED")
            skipped += 1
            continue

        # Upload keyframe to ComfyUI input
        _upload_image(args.comfyui_url, kf)

        # Inject into workflow
        wf = json.loads(json.dumps(workflow))
        _inject_i2v(wf, kf.name, shot, width, height)

        print(f"  [{i+1}/{len(shots)}] {shot_id} [{segment}:{visual_type}]: rendering...")
        result = _queue_and_wait(args.comfyui_url, wf, timeout=args.timeout)

        if result:
            _download_video(args.comfyui_url, result, output_file)
            print(f"    -> {output_file}")
            rendered += 1
        else:
            print(f"    -> FAILED")
            failed += 1

    print(f"\nAnimation complete: {output_dir}")
    print(f"  Rendered: {rendered}, Skipped: {skipped}, Failed: {failed}")


def _has_characters(shot: dict) -> bool:
    """Check if shot has character content (needs I2V, not Motion Canvas)."""
    characters = shot.get("characters", [])
    return len(characters) > 0


def _upload_image(base_url: str, image_path: Path):
    """Upload image to ComfyUI input folder."""
    boundary = "----PipelineBoundary"
    filename = image_path.name

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + image_path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{base_url}/upload/image",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        urllib.request.urlopen(req, timeout=30)
    except Exception as e:
        print(f"    Upload failed: {e}", file=sys.stderr)


def _inject_i2v(workflow: dict, image_filename: str, shot: dict, width: int, height: int):
    """Inject image, prompt, seed, and resolution into I2V workflow.

    Uses v3ct0r style prompt injection — ensures the trigger word is present
    in positive prompts for style consistency.
    """
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        class_type = node.get("class_type", "")
        inputs = node.get("inputs", {})

        # LoadImage node — set the keyframe
        if class_type == "LoadImage" and "image" in inputs:
            inputs["image"] = image_filename

        # Text prompt — inject v3ct0r style positive prompt
        if "text" in inputs and class_type in ("CLIPTextEncode",):
            meta_title = node.get("_meta", {}).get("title", "").lower()
            if "negative" in meta_title:
                # Inject negative prompt
                neg = shot.get("prompt_negative", "")
                if neg:
                    inputs["text"] = neg
            else:
                # Inject positive prompt with v3ct0r prefix
                prompt = shot.get("prompt_positive", "")
                if prompt:
                    # Ensure v3ct0r trigger is present
                    if V3CT0R_PREFIX.split(",")[0] not in prompt.lower():
                        prompt = f"{V3CT0R_PREFIX}, {prompt}"
                    inputs["text"] = prompt

        # Seed
        if "seed" in inputs and "seed" in shot:
            inputs["seed"] = shot["seed"]

        # Resolution — WanImageToVideo or similar video generation node
        if class_type in ("WanImageToVideo", "Wan21_I2V", "WanVideoGeneration"):
            inputs["width"] = width
            inputs["height"] = height

        # Also handle generic width/height in sampler nodes
        if class_type in ("KSampler", "KSamplerAdvanced", "SamplerCustomAdvanced"):
            # Don't override sampler resolution — it comes from latent
            pass

        # EmptyLatentVideo or similar — set resolution
        if class_type in ("EmptyLatentVideo", "EmptySD3LatentImage"):
            inputs["width"] = width
            inputs["height"] = height


def _queue_and_wait(base_url: str, workflow: dict, timeout: int = 600) -> dict | None:
    """Queue a workflow to ComfyUI and wait for completion."""
    import uuid
    client_id = str(uuid.uuid4())
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode()
    req = urllib.request.Request(
        f"{base_url}/prompt", data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        prompt_id = data.get("prompt_id")
    except Exception as e:
        print(f"    Queue failed: {e}", file=sys.stderr)
        return None

    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = urllib.request.urlopen(f"{base_url}/history/{prompt_id}", timeout=5)
            history = json.loads(resp.read())
            if prompt_id in history:
                return history[prompt_id].get("outputs", {})
        except Exception:
            pass
        time.sleep(5)
    return None


def _download_video(base_url: str, outputs: dict, save_path: Path):
    """Download video output from ComfyUI."""
    for node_id, node_output in outputs.items():
        for key in ("gifs", "videos", "images"):
            items = node_output.get(key, [])
            for item in items:
                filename = item.get("filename", "")
                if filename.endswith((".mp4", ".gif", ".webm")):
                    subfolder = item.get("subfolder", "")
                    url = f"{base_url}/view?filename={filename}&subfolder={subfolder}&type=output"
                    try:
                        urllib.request.urlretrieve(url, str(save_path))
                        return
                    except Exception as e:
                        print(f"    Download failed: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
