#!/usr/bin/env python3
"""Generate background music using ACE-Step 1.5 (local, GPU).

ACE-Step runs in its own uv-managed venv at /home/hugh/ACE-Step-1.5.
Two modes:
  1. API mode: connects to running ACE-Step server (http://127.0.0.1:8790)
  2. Inline mode: starts server, generates, shuts down
"""
import argparse, json, subprocess, sys, shutil, time, urllib.request, urllib.error
from pathlib import Path

ACESTEP_API = "http://127.0.0.1:8790"


def main():
    parser = argparse.ArgumentParser(description="ACE-Step BGM generator")
    parser.add_argument("--prompt", required=True, help="Music description prompt")
    parser.add_argument("--duration", type=int, default=300, help="Duration in seconds")
    parser.add_argument("--output", required=True, help="Output WAV path")
    parser.add_argument("--acestep-dir", default="/home/hugh/ACE-Step-1.5", help="ACE-Step install dir")
    parser.add_argument("--lyrics", default="[inst]", help="Lyrics (default: instrumental)")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--api-url", default=ACESTEP_API, help="ACE-Step API URL")
    args = parser.parse_args()

    acestep_dir = Path(args.acestep_dir)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not acestep_dir.exists():
        print("ACE-Step not found. Install:", file=sys.stderr)
        print(f"  git clone https://github.com/ACE-Step/ACE-Step-1.5 {acestep_dir}", file=sys.stderr)
        print(f"  cd {acestep_dir} && uv sync", file=sys.stderr)
        _generate_silence(output_path, args.duration)
        return

    print(f"Generating {args.duration}s BGM...")
    print(f"Prompt: {args.prompt}")

    # Try API if server is running
    if _try_api_generate(args, output_path):
        return

    # Start API server and generate
    if _try_start_server_and_generate(args, acestep_dir, output_path):
        return

    # Final fallback: silence
    print("All methods failed. Generating silence placeholder...")
    _generate_silence(output_path, args.duration)


def _try_api_generate(args, output_path: Path) -> bool:
    """Try generating via already-running ACE-Step API server."""
    try:
        urllib.request.urlopen(f"{args.api_url}/health", timeout=3)
    except Exception:
        return False

    print(f"ACE-Step API server detected at {args.api_url}")
    return _api_generate(args, output_path)


def _api_generate(args, output_path: Path) -> bool:
    """Submit generation task to ACE-Step API and download result."""
    payload = json.dumps({
        "caption": args.prompt,
        "lyrics": args.lyrics,
        "duration": args.duration,
        "seed": args.seed,
    }).encode()

    req = urllib.request.Request(
        f"{args.api_url}/release_task",
        data=payload,
        headers={"Content-Type": "application/json"},
    )

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        task_id = data.get("task_id")
        if not task_id:
            print(f"No task_id in response: {data}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"API submit failed: {e}", file=sys.stderr)
        return False

    print(f"Task submitted: {task_id}")

    # Poll for completion
    start = time.time()
    timeout = max(args.duration * 2, 120)
    while time.time() - start < timeout:
        try:
            poll_payload = json.dumps({"task_ids": [task_id]}).encode()
            poll_req = urllib.request.Request(
                f"{args.api_url}/query_result",
                data=poll_payload,
                headers={"Content-Type": "application/json"},
            )
            resp = urllib.request.urlopen(poll_req, timeout=10)
            results = json.loads(resp.read())

            for r in results if isinstance(results, list) else [results]:
                status = r.get("status", "")
                if status == "completed":
                    audio_url = r.get("audio_url", "")
                    if audio_url:
                        if not audio_url.startswith("http"):
                            audio_url = f"{args.api_url}{audio_url}"
                        urllib.request.urlretrieve(audio_url, str(output_path))
                        print(f"BGM: {output_path}")
                        return True
                elif status == "failed":
                    print(f"Generation failed: {r}", file=sys.stderr)
                    return False
        except Exception as e:
            print(f"Poll error: {e}", file=sys.stderr)

        time.sleep(5)

    print("Generation timed out", file=sys.stderr)
    return False


def _try_start_server_and_generate(args, acestep_dir: Path, output_path: Path) -> bool:
    """Start ACE-Step API server, generate, and shut down."""
    uv_bin = shutil.which("uv")
    if not uv_bin:
        return False

    print("Starting ACE-Step API server...")
    server_proc = subprocess.Popen(
        [uv_bin, "run", "python", "-m", "acestep.api_server",
         "--host", "127.0.0.1", "--port", "8790"],
        cwd=str(acestep_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Wait for server to start
    for _ in range(60):
        try:
            urllib.request.urlopen(f"{args.api_url}/health", timeout=2)
            print("ACE-Step server started")
            break
        except Exception:
            time.sleep(2)
    else:
        print("Server failed to start", file=sys.stderr)
        server_proc.terminate()
        return False

    try:
        result = _api_generate(args, output_path)
    finally:
        server_proc.terminate()
        server_proc.wait(timeout=10)

    return result


def _generate_silence(output_path: Path, duration: int):
    """Generate silence WAV as fallback."""
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "anullsrc=r=48000:cl=mono",
        "-t", str(duration), "-c:a", "pcm_s16le",
        str(output_path),
    ], capture_output=True)
    if output_path.exists():
        print(f"BGM (silence placeholder): {output_path}")


if __name__ == "__main__":
    main()
