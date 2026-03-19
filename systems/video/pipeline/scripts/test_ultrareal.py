#!/usr/bin/env python3
"""UltraReal Fine-Tune v4 — 실사 테스트 렌더 (Pro Grade 아키텍처).

Usage:
    python test_ultrareal.py [--comfy-url http://127.0.0.1:8188]

Renders 3 test images using BasicGuider + SamplerCustomAdvanced:
  1. UltraReal_Pro_portrait  — 정면 인물 (실사 퀄리티 확인)
  2. UltraReal_Pro_desk      — 3/4 데스크 장면 (라이팅/텍스처)
  3. UltraReal_Pro_vee       — Vee 캐릭터 실사 버전
"""

import argparse
import json
import os
import time
import urllib.request

WORKFLOW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "workflows", "api")
WORKFLOW_FILE = "flux1_ultrareal_t2i.json"

TESTS = [
    {
        "name": "UltraReal_Pro_portrait",
        "prompt": (
            "high-resolution, professional portrait photography, a young woman, "
            "front view, soft studio lighting, warm skin tones, detailed eyes with "
            "natural reflections, brown bob hair with subtle highlights, round black "
            "glasses, gentle confident smile, shallow depth of field, 85mm lens, "
            "clean cream background, photorealistic, detailed skin texture"
        ),
        "width": 832,
        "height": 1216,
        "seed": 42,
    },
    {
        "name": "UltraReal_Pro_desk",
        "prompt": (
            "high-resolution, candid photography, a young woman sitting at a modern desk, "
            "three-quarter view, typing on laptop, warm ambient lighting from window, "
            "golden hour, yellow oversized hoodie, round black glasses, brown bob hair, "
            "focused expression, coffee cup on desk, potted plant, bokeh background, "
            "natural shadows, professional photography, 50mm lens"
        ),
        "width": 1216,
        "height": 832,
        "seed": 123,
    },
    {
        "name": "UltraReal_Pro_vee",
        "prompt": (
            "high-resolution, editorial photography, a cheerful young woman standing, "
            "full body shot, bright yellow oversized hoodie with hood down, round black "
            "glasses, brown bob hair at shoulder length, warm cream skin, hands in hoodie "
            "pockets, gentle smile, detailed clothing folds, studio lighting with soft fill, "
            "white seamless background, photorealistic, sharp focus, 70mm lens"
        ),
        "width": 832,
        "height": 1216,
        "seed": 456,
    },
]


def load_workflow():
    path = os.path.join(WORKFLOW_DIR, WORKFLOW_FILE)
    with open(path) as f:
        return json.load(f)


def build_prompt(wf_data, test):
    prompt = json.loads(json.dumps(wf_data["prompt"]))
    # Set positive prompt
    prompt["6"]["inputs"]["text"] = test["prompt"]
    # Set resolution
    prompt["5"]["inputs"]["width"] = test["width"]
    prompt["5"]["inputs"]["height"] = test["height"]
    # Set seed (RandomNoise node)
    prompt["23"]["inputs"]["noise_seed"] = test["seed"]
    # Set filename
    prompt["9"]["inputs"]["filename_prefix"] = test["name"]
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
    parser = argparse.ArgumentParser(description="UltraReal v4 Pro Grade test render")
    parser.add_argument("--comfy-url", default="http://127.0.0.1:8188")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without queuing")
    args = parser.parse_args()

    wf_data = load_workflow()
    print(f"Loaded workflow: {WORKFLOW_FILE}")
    print(f"Architecture: BasicGuider + SamplerCustomAdvanced (Pro Grade)")
    print(f"Sampler: dpmpp_2m + beta, 30 steps")
    print(f"ComfyUI: {args.comfy_url}")
    print(f"Tests: {len(TESTS)}\n")

    for i, test in enumerate(TESTS, 1):
        prompt = build_prompt(wf_data, test)

        print(f"[{i}/{len(TESTS)}] {test['name']}")
        print(f"  Resolution: {test['width']}x{test['height']}")
        print(f"  Seed: {test['seed']}")
        print(f"  Prompt: {test['prompt'][:80]}...")

        if args.dry_run:
            out_path = f"/tmp/ultrareal_test_{test['name']}.json"
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


if __name__ == "__main__":
    main()
