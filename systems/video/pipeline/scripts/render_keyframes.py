#!/usr/bin/env python3
"""Generate character keyframes via ComfyUI API (Flux + LoRA + IPAdapter)."""
import argparse, json, sys, time, urllib.request, urllib.error
from pathlib import Path

COMFYUI_WORKFLOWS = Path("/mnt/e/vibecode-blog/systems/video/workflows/api")

def main():
    parser = argparse.ArgumentParser(description="ComfyUI keyframe renderer")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--output", required=True, help="Output directory for keyframes")
    parser.add_argument("--workflow", default="flux_kontext_edit.json", help="ComfyUI workflow file")
    parser.add_argument("--comfyui-url", default="http://127.0.0.1:8188")
    parser.add_argument("--character-ref", help="Character reference image path")
    args = parser.parse_args()

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load manifest
    manifest = json.loads(Path(args.manifest).read_text())
    shots = manifest.get("shots", manifest if isinstance(manifest, list) else [])

    # Load workflow template
    wf_path = COMFYUI_WORKFLOWS / args.workflow
    if not wf_path.exists():
        # Try the pipeline scripts directory
        wf_path = Path(args.workflow)
    if not wf_path.exists():
        print(f"Workflow not found: {wf_path}", file=sys.stderr)
        sys.exit(1)

    workflow = json.loads(wf_path.read_text())

    # Check ComfyUI is running
    try:
        urllib.request.urlopen(f"{args.comfyui_url}/system_stats", timeout=5)
    except (urllib.error.URLError, ConnectionError):
        print(f"ComfyUI not running at {args.comfyui_url}", file=sys.stderr)
        print("Start with: python ComfyUI/main.py --listen --port 8188", file=sys.stderr)
        sys.exit(1)

    print(f"Rendering {len(shots)} keyframes...")
    for i, shot in enumerate(shots):
        shot_id = shot.get("shot_id", f"shot_{i:03d}")
        prompt = shot.get("kontext_prompt", shot.get("prompt_positive", ""))
        if not prompt:
            continue

        # Clone workflow and inject prompt
        wf = json.loads(json.dumps(workflow))  # deep copy
        _inject_prompt(wf, prompt, shot)

        # Submit to ComfyUI
        output_file = output_dir / f"{shot_id}_keyframe.png"
        if output_file.exists():
            print(f"  [{i+1}/{len(shots)}] {shot_id}: CACHED")
            continue

        print(f"  [{i+1}/{len(shots)}] {shot_id}: {prompt[:60]}...")
        result = _queue_and_wait(args.comfyui_url, wf)

        if result:
            _download_output(args.comfyui_url, result, output_file)
            print(f"    -> {output_file}")
        else:
            print(f"    -> FAILED")

    print(f"Keyframes complete: {output_dir}")


def _inject_prompt(workflow: dict, prompt: str, shot: dict):
    """Inject prompt text into workflow nodes."""
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        class_type = node.get("class_type", "")
        inputs = node.get("inputs", {})

        # CLIPTextEncode or similar text input nodes
        if "text" in inputs and class_type in ("CLIPTextEncode", "FluxGuidance"):
            if "negative" not in node.get("_meta", {}).get("title", "").lower():
                inputs["text"] = prompt

        # Seed injection
        if "seed" in inputs and "seed" in shot:
            inputs["seed"] = shot["seed"]


def _queue_and_wait(base_url: str, workflow: dict, timeout: int = 300) -> dict | None:
    """Queue a prompt on ComfyUI and wait for completion."""
    import uuid
    client_id = str(uuid.uuid4())

    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode()
    req = urllib.request.Request(
        f"{base_url}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"},
    )

    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        prompt_id = data.get("prompt_id")
    except Exception as e:
        print(f"    Queue failed: {e}", file=sys.stderr)
        return None

    # Poll for completion
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = urllib.request.urlopen(f"{base_url}/history/{prompt_id}", timeout=5)
            history = json.loads(resp.read())
            if prompt_id in history:
                return history[prompt_id].get("outputs", {})
        except Exception:
            pass
        time.sleep(2)

    print(f"    Timeout after {timeout}s", file=sys.stderr)
    return None


def _download_output(base_url: str, outputs: dict, save_path: Path):
    """Download the first image output from ComfyUI."""
    for node_id, node_output in outputs.items():
        images = node_output.get("images", [])
        for img in images:
            filename = img.get("filename", "")
            subfolder = img.get("subfolder", "")
            url = f"{base_url}/view?filename={filename}&subfolder={subfolder}&type=output"
            try:
                urllib.request.urlretrieve(url, str(save_path))
                return
            except Exception as e:
                print(f"    Download failed: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
