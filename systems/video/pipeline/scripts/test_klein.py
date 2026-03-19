#!/usr/bin/env python3
"""Flux 2 Klein 9B — 스타일 테스트 렌더.

Usage:
    python test_klein.py [--comfy-url http://127.0.0.1:8188] [--with-lora LORA_NAME]

Renders 3 test images (same prompts as Vee3 test for comparison):
  1. Klein_flat_front  — 정면 전신
  2. Klein_flat_expr   — 표정 6종
  3. Klein_flat_desk   — 3/4 데스크 장면

Without --with-lora: uses nolora workflow (pure Klein output).
With --with-lora: uses LoRA workflow.
"""

import argparse
import json
import os
import time
import urllib.request

WORKFLOW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "workflows", "api")
WF_LORA = "flux2_klein_9b_t2i.json"
WF_NOLORA = "flux2_klein_9b_t2i_nolora.json"

# Same Vee prompts as Vee3 test for direct comparison
TESTS = [
    {
        "name": "Klein_flat_front",
        "prompt": (
            "a cute young woman standing, front view full body, "
            "yellow oversized hoodie, round black glasses, brown bob hair, cream skin, "
            "gentle smile, hands in hoodie pockets, plain white background"
        ),
        "width": 832,
        "height": 1216,
        "seed": 42,
    },
    {
        "name": "Klein_flat_expr",
        "prompt": (
            "character expression sheet, 6 expressions in grid, same character, "
            "young woman, yellow oversized hoodie, round black glasses, brown bob hair, "
            "cream skin, expressions: happy smile, surprised, thinking, frustrated, "
            "excited, calm, white background, clean design, consistent style"
        ),
        "width": 832,
        "height": 1216,
        "seed": 123,
    },
    {
        "name": "Klein_flat_desk",
        "prompt": (
            "a young woman sitting at a desk, three-quarter view, typing on keyboard, "
            "yellow oversized hoodie, round black glasses, brown bob hair, cream skin, "
            "focused expression, dual monitors showing code, desk lamp warm glow, "
            "coffee mug, potted succulent, cozy home office"
        ),
        "width": 1216,
        "height": 832,
        "seed": 456,
    },
]


def load_workflow(use_lora):
    wf_file = WF_LORA if use_lora else WF_NOLORA
    path = os.path.join(WORKFLOW_DIR, wf_file)
    with open(path) as f:
        return json.load(f), wf_file


def build_prompt(wf_data, test, lora_name=None, lora_trigger=None):
    prompt = json.loads(json.dumps(wf_data["prompt"]))

    # Prepend LoRA trigger word if provided
    text = test["prompt"]
    if lora_trigger:
        text = f"{lora_trigger}, {text}"

    # Set positive prompt
    prompt["6"]["inputs"]["text"] = text
    # Set resolution (both Flux2Scheduler and EmptyFlux2LatentImage)
    prompt["22"]["inputs"]["width"] = test["width"]
    prompt["22"]["inputs"]["height"] = test["height"]
    prompt["25"]["inputs"]["width"] = test["width"]
    prompt["25"]["inputs"]["height"] = test["height"]
    # Set seed
    prompt["23"]["inputs"]["noise_seed"] = test["seed"]
    # Set filename
    prompt["9"]["inputs"]["filename_prefix"] = test["name"]
    # Set LoRA if present
    if lora_name and "40" in prompt:
        prompt["40"]["inputs"]["lora_name"] = lora_name

    return prompt


def queue_prompt(comfy_url, prompt):
    data = json.dumps({"prompt": prompt}).encode("utf-8")
    req = urllib.request.Request(
        f"{comfy_url}/prompt",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def wait_for_completion(comfy_url, prompt_id, timeout=600):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(f"{comfy_url}/history/{prompt_id}") as resp:
                history = json.loads(resp.read())
            if prompt_id in history:
                return history[prompt_id]
        except Exception:
            pass
        time.sleep(3)
    raise TimeoutError(f"Render timeout after {timeout}s")


def main():
    parser = argparse.ArgumentParser(description="Klein 9B test render")
    parser.add_argument("--comfy-url", default="http://127.0.0.1:8188")
    parser.add_argument("--with-lora", default=None, help="LoRA filename (e.g. flat_anime_klein.safetensors)")
    parser.add_argument("--lora-trigger", default=None, help="LoRA trigger word (e.g. F14TV3CT0R)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    use_lora = args.with_lora is not None
    wf_data, wf_file = load_workflow(use_lora)
    print(f"Loaded workflow: {wf_file}")
    print(f"ComfyUI: {args.comfy_url}")
    print(f"LoRA: {args.with_lora or 'None'}")
    print(f"Trigger: {args.lora_trigger or 'None'}")
    print(f"Tests: {len(TESTS)}\n")

    for i, test in enumerate(TESTS, 1):
        prompt = build_prompt(wf_data, test, args.with_lora, args.lora_trigger)

        print(f"[{i}/{len(TESTS)}] {test['name']}")
        print(f"  Resolution: {test['width']}x{test['height']}")
        print(f"  Seed: {test['seed']}")

        if args.dry_run:
            out_path = f"/tmp/klein_test_{test['name']}.json"
            with open(out_path, "w") as f:
                json.dump({"prompt": prompt}, f, indent=2)
            print(f"  Dry-run → {out_path}\n")
            continue

        try:
            result = queue_prompt(args.comfy_url, prompt)
            prompt_id = result["prompt_id"]
            print(f"  Queued: {prompt_id}")

            history = wait_for_completion(args.comfy_url, prompt_id)
            outputs = history.get("outputs", {})
            for node_id, output in outputs.items():
                if "images" in output:
                    for img in output["images"]:
                        print(f"  ✅ {img['filename']}")
        except Exception as e:
            print(f"  ❌ Error: {e}")

        print()

    print("Done. Check ComfyUI/app/output/ for results.")
    if not use_lora:
        print("\nTo test with LoRA:")
        print("  python test_klein.py --with-lora flat_anime_klein.safetensors --lora-trigger F14TV3CT0R")


if __name__ == "__main__":
    main()
