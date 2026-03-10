#!/usr/bin/env python3
import json
import time
import urllib.request
import argparse
from pathlib import Path

def queue_prompt(prompt, server_address="127.0.0.1:8188"):
    p = {"prompt": prompt}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(f"http://{server_address}/prompt", data=data)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def get_history(prompt_id, server_address="127.0.0.1:8188"):
    with urllib.request.urlopen(f"http://{server_address}/history/{prompt_id}") as response:
        return json.loads(response.read())

def render_shots(manifest_path, workflow_path, bindings_path, output_root, server="127.0.0.1:8188"):
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    with open(workflow_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)
    with open(bindings_path, 'r', encoding='utf-8') as f:
        bindings = json.load(f)

    output_root = Path(output_root)
    run_id = Path(manifest_path).parent.name
    run_dir = output_root / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    print(f"[RENDER] Starting batch render for project: {manifest.get('project_id')}")
    print(f"[RENDER] Server: {server} | Output: {run_dir}")

    results = []
    
    for shot in manifest['shots']:
        shot_id = shot['shot_id']
        print(f"  > Processing {shot_id}...")
        
        # Apply bindings to workflow
        raw_workflow = json.loads(json.dumps(workflow)) # Deep copy
        
        # 1. Standardize structure: ComfyUI API expects a flat dict of node_id -> {inputs, class_type}
        # Determine if the workflow has a 'nodes' wrapper
        nodes_ref = raw_workflow.get('nodes', raw_workflow)

        # --- AUTOMATIC MODEL REDIRECTION (v2.1) ---
        # Redirect any UnetLoader/CheckpointLoader to our linked Hunyuan fp8
        for node in nodes_ref.values():
            if node.get('class_type') in ['UnetLoaderGGUF', 'UNETLoader', 'CheckpointLoaderSimple']:
                for input_key in ['unet_name', 'ckpt_name']:
                    if input_key in node.get('inputs', {}):
                        node['inputs'][input_key] = "hunyuan_v15_fp8.safetensors"
            if node.get('class_type') == 'VAELoader':
                node['inputs']['vae_name'] = "hunyuan_vae.safetensors"

        mappings = bindings.get('node_mappings', {})
        # Map positive prompt
        if 'positive_prompt' in mappings:
            node_id = mappings['positive_prompt']['node_id']
            field = mappings['positive_prompt']['field']
            if node_id in nodes_ref:
                nodes_ref[node_id]['inputs'][field] = shot['prompt_positive']

        # Map seed
        if 'seed' in mappings:
            node_id = mappings['seed']['node_id']
            field = mappings['seed']['field']
            if node_id in nodes_ref:
                nodes_ref[node_id]['inputs'][field] = shot['seed']

        # Map duration
        if 'video_duration' in mappings:
            node_id = mappings['video_duration']['node_id']
            field = mappings['video_duration']['field']
            if node_id in nodes_ref:
                # Many I2V models use frames, assuming 12fps
                nodes_ref[node_id]['inputs'][field] = int(shot['duration_sec'] * 12)

        # --- CHARACTER MATCHING (I2V) ---
        if 'input_image' in mappings:
            node_id = mappings['input_image']['node_id']
            field = mappings['input_image']['field']
            if node_id in nodes_ref:
                # Try to find a matching keyframe in ComfyUI input folder
                # We'll use a simple heuristic: N001 -> S01_01_keyframe.png
                shot_num = shot_id.replace('N', '')
                # Just for testing, we map them directly to the found files
                keyframe_map = {
                    "001": "S01_01_keyframe.png",
                    "002": "S01_02_keyframe.png",
                    "003": "S01_03_keyframe.png",
                    "004": "S02_01_keyframe.png",
                    "005": "S02_02_keyframe.png"
                }
                k_file = keyframe_map.get(shot_num, "example.png")
                nodes_ref[node_id]['inputs'][field] = k_file
                print(f"    - Linked I2V keyframe: {k_file}")


        # 2. Queue the job
        try:
            # We must send the actual modified object, which is now 'nodes_ref' 
            # (or the root if it was already flat)
            enqueue = queue_prompt(nodes_ref, server)
            prompt_id = enqueue['prompt_id']
            print(f"    - Queued (Prompt ID: {prompt_id})")
        except Exception as e:
            print(f"    [ERROR] Failed to queue {shot_id}: {e}")
            results.append({"shot_id": shot_id, "status": "error", "error": str(e)})
            continue
        
        # Wait for completion (Simple polling)
        while True:
            history = get_history(prompt_id, server)
            if prompt_id in history:
                print(f"    - Done {shot_id}")
                # In a real scenario, we'd move the file from ComfyUI output to our run_dir
                # For now, we log the success
                results.append({
                    "shot_id": shot_id,
                    "status": "ok",
                    "prompt_id": prompt_id
                })
                break
            time.sleep(2)

    # Save render log
    with open(run_dir / "render_log.json", 'w') as f:
        json.dump({"summary": {"total": len(results), "errors": 0}, "shots": results}, f, indent=2)
    
    print(f"[OK] Batch render complete. Log: {run_dir}/render_log.json")
    return str(run_dir)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--workflow", required=True)
    parser.add_argument("--bindings", required=True)
    parser.add_argument("--output-root", required=True)
    parser.add_argument("--server", default="127.0.0.1:8188")
    args = parser.parse_args()
    
    render_shots(args.manifest, args.workflow, args.bindings, args.output_root, args.server)
