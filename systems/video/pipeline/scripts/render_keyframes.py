#!/usr/bin/env python3
"""Generate keyframes via ComfyUI API.

Auto-selects workflow per shot:
  - Character shots (kontext_prompt set) → Flux Kontext Edit
  - Infographic/other shots → Flux LoRA T2I (simplevectorflux)
"""
import argparse, json, sys, time, urllib.request, urllib.error
from pathlib import Path

COMFYUI_WORKFLOWS = Path("/mnt/e/vibecode-blog/systems/video/workflows/api")
KONTEXT_WF = "flux_kontext_edit.json"
LORA_T2I_WF = "flux_lora_t2i.json"


def main():
    parser = argparse.ArgumentParser(description="ComfyUI keyframe renderer")
    parser.add_argument("--manifest", required=True, help="Shot manifest JSON")
    parser.add_argument("--output", required=True, help="Output directory for keyframes")
    parser.add_argument("--workflow", default="auto", help="ComfyUI workflow (auto|kontext|lora|path)")
    parser.add_argument("--comfyui-url", default="http://127.0.0.1:8188")
    parser.add_argument("--character-ref", help="Character reference image path")
    parser.add_argument("--only-missing", action="store_true", help="Only render missing keyframes")
    args = parser.parse_args()

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(Path(args.manifest).read_text())
    shots = manifest.get("shots", manifest if isinstance(manifest, list) else [])

    # Pre-load both workflow templates
    workflows = {}
    for wf_name in (KONTEXT_WF, LORA_T2I_WF):
        wf_path = COMFYUI_WORKFLOWS / wf_name
        if wf_path.exists():
            raw = json.loads(wf_path.read_text())
            workflows[wf_name] = raw.get("prompt", raw)

    # Also handle explicit workflow override
    if args.workflow not in ("auto", "kontext", "lora"):
        wf_path = COMFYUI_WORKFLOWS / args.workflow
        if not wf_path.exists():
            wf_path = Path(args.workflow)
        if wf_path.exists():
            raw = json.loads(wf_path.read_text())
            workflows["override"] = raw.get("prompt", raw)

    # Check ComfyUI
    try:
        urllib.request.urlopen(f"{args.comfyui_url}/system_stats", timeout=5)
    except (urllib.error.URLError, ConnectionError):
        print(f"ComfyUI not running at {args.comfyui_url}", file=sys.stderr)
        sys.exit(1)

    rendered = 0
    skipped = 0
    failed = 0

    print(f"Rendering {len(shots)} keyframes...")
    for i, shot in enumerate(shots):
        shot_id = shot.get("shot_id", f"shot_{i:03d}")
        output_file = output_dir / f"{shot_id}_keyframe.png"

        if output_file.exists():
            print(f"  [{i+1}/{len(shots)}] {shot_id}: CACHED")
            skipped += 1
            continue

        # Select workflow and prompt per shot
        kontext_prompt = shot.get("kontext_prompt")
        positive_prompt = shot.get("prompt_positive", "")
        has_characters = bool(shot.get("characters"))

        if args.workflow == "override" and "override" in workflows:
            wf_key = "override"
            prompt = kontext_prompt or positive_prompt
        elif args.workflow == "kontext" or (args.workflow == "auto" and kontext_prompt and has_characters):
            wf_key = KONTEXT_WF
            prompt = kontext_prompt or positive_prompt
        elif args.workflow == "lora" or (args.workflow == "auto" and not kontext_prompt):
            wf_key = LORA_T2I_WF
            prompt = positive_prompt
            # Prepend v3ct0r trigger if not present
            if prompt and "v3ct0r" not in prompt.lower():
                prompt = f"v3ct0r style, {prompt}"
        else:
            wf_key = KONTEXT_WF
            prompt = kontext_prompt or positive_prompt

        if not prompt:
            print(f"  [{i+1}/{len(shots)}] {shot_id}: SKIP (no prompt)")
            skipped += 1
            continue

        if wf_key not in workflows:
            print(f"  [{i+1}/{len(shots)}] {shot_id}: SKIP (workflow {wf_key} not found)")
            skipped += 1
            continue

        wf_label = "Kontext" if wf_key == KONTEXT_WF else "LoRA T2I"
        print(f"  [{i+1}/{len(shots)}] {shot_id} [{wf_label}]: {prompt[:60]}...")

        wf = json.loads(json.dumps(workflows[wf_key]))  # deep copy
        _inject_prompt(wf, prompt, shot)

        result = _queue_and_wait(args.comfyui_url, wf)
        if result:
            _download_output(args.comfyui_url, result, output_file)
            print(f"    -> {output_file}")
            rendered += 1
        else:
            print(f"    -> FAILED")
            failed += 1

    print(f"\nKeyframes: {rendered} rendered, {skipped} cached/skipped, {failed} failed")
    print(f"Output: {output_dir}")


def _inject_prompt(workflow: dict, prompt: str, shot: dict):
    """Inject prompt text into workflow nodes."""
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        class_type = node.get("class_type", "")
        inputs = node.get("inputs", {})

        # CLIPTextEncode — inject positive prompt (not negative)
        if "text" in inputs and class_type in ("CLIPTextEncode",):
            title = node.get("_meta", {}).get("title", "").lower()
            if "negative" not in title:
                inputs["text"] = prompt

        # Seed injection
        if "seed" in inputs and "seed" in shot:
            inputs["seed"] = shot["seed"]
        if "noise_seed" in inputs and "seed" in shot:
            inputs["noise_seed"] = shot["seed"]


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
