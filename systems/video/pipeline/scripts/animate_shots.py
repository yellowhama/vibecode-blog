#!/usr/bin/env python3
"""Animate keyframes to video clips via ComfyUI (Wan 2.1 I2V)."""
import argparse, json, sys, time, urllib.request, urllib.error
from pathlib import Path

COMFYUI_WORKFLOWS = Path("/mnt/e/vibecode-blog/systems/video/workflows/api")

def main():
    parser = argparse.ArgumentParser(description="ComfyUI I2V animator")
    parser.add_argument("--keyframes", required=True, help="Keyframes directory")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--output", required=True, help="Output directory for clips")
    parser.add_argument("--workflow", default="wan22_moe_i2v_full.json", help="I2V workflow")
    parser.add_argument("--comfyui-url", default="http://127.0.0.1:8188")
    parser.add_argument("--draft", action="store_true", help="Use short workflow (2s instead of 5s)")
    args = parser.parse_args()

    keyframes_dir = Path(args.keyframes)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(Path(args.manifest).read_text())
    shots = manifest.get("shots", manifest if isinstance(manifest, list) else [])

    wf_name = "wan22_moe_i2v_short.json" if args.draft else args.workflow
    wf_path = COMFYUI_WORKFLOWS / wf_name
    if not wf_path.exists():
        print(f"Workflow not found: {wf_path}", file=sys.stderr)
        sys.exit(1)
    workflow = json.loads(wf_path.read_text())

    # Check ComfyUI
    try:
        urllib.request.urlopen(f"{args.comfyui_url}/system_stats", timeout=5)
    except (urllib.error.URLError, ConnectionError):
        print(f"ComfyUI not running at {args.comfyui_url}", file=sys.stderr)
        sys.exit(1)

    print(f"Animating {len(shots)} shots...")
    for i, shot in enumerate(shots):
        shot_id = shot.get("shot_id", f"shot_{i:03d}")
        mode = shot.get("mode", "i2v")

        # Only process I2V shots (explainer segments go to Motion Canvas)
        if mode != "i2v":
            print(f"  [{i+1}/{len(shots)}] {shot_id}: SKIP (mode={mode})")
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
                continue

        output_file = output_dir / f"{shot_id}.mp4"
        if output_file.exists():
            print(f"  [{i+1}/{len(shots)}] {shot_id}: CACHED")
            continue

        # Upload keyframe to ComfyUI input
        _upload_image(args.comfyui_url, kf)

        # Inject into workflow
        wf = json.loads(json.dumps(workflow))
        _inject_i2v(wf, kf.name, shot)

        print(f"  [{i+1}/{len(shots)}] {shot_id}: rendering...")
        result = _queue_and_wait(args.comfyui_url, wf, timeout=600)

        if result:
            _download_video(args.comfyui_url, result, output_file)
            print(f"    -> {output_file}")
        else:
            print(f"    -> FAILED")

    print(f"Animation complete: {output_dir}")


def _upload_image(base_url: str, image_path: Path):
    """Upload image to ComfyUI input folder."""
    import mimetypes
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


def _inject_i2v(workflow: dict, image_filename: str, shot: dict):
    """Inject image and prompt into I2V workflow."""
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        class_type = node.get("class_type", "")
        inputs = node.get("inputs", {})

        # LoadImage node
        if class_type == "LoadImage" and "image" in inputs:
            inputs["image"] = image_filename

        # Text prompt
        if "text" in inputs and class_type in ("CLIPTextEncode",):
            prompt = shot.get("prompt_positive", shot.get("kontext_prompt", ""))
            if prompt and "negative" not in node.get("_meta", {}).get("title", "").lower():
                inputs["text"] = prompt

        # Seed
        if "seed" in inputs and "seed" in shot:
            inputs["seed"] = shot["seed"]


def _queue_and_wait(base_url: str, workflow: dict, timeout: int = 600) -> dict | None:
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
        # Check for video outputs (gifs or videos)
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
