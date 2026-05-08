#!/usr/bin/env python3
"""Use a PTY so the interactive shell doesn't see EOF and close readline early."""
import base64, os, pty, re, select, sys, time
from pathlib import Path

PEN_FILE = "/mnt/f/Aisaak/Projects/vibecode-blog/designs/blog-diagrams.pen"
ROOT = Path("/mnt/f/Aisaak/Projects/vibecode-blog")

EXPORTS = [
    ("KcIl4", "public/images/blog/10847-lines/codebase-jungle.png"),
    ("kCBNn", "public/images/blog/three-defaults/before-after.png"),
    ("WKzfH", "public/images/blog/6-ai-agents/pipeline-failure.png"),
    ("XZNXW", "public/images/blog/wiki-starving/flywheel.png"),
    ("39gCL", "public/images/about/island-map.png"),
]


def export_one(node_id, out_rel):
    pid, fd = pty.fork()
    if pid == 0:
        os.execvp("pencil", ["pencil", "interactive", "--app", "desktop",
                              "--in", PEN_FILE])
    out = b""
    deadline = time.time() + 90
    state = "wait_prompt"
    sent = False
    sent_exit = False
    while time.time() < deadline:
        rlist, _, _ = select.select([fd], [], [], 0.5)
        if rlist:
            try:
                chunk = os.read(fd, 65536)
            except OSError:
                break
            if not chunk:
                break
            out += chunk
            if state == "wait_prompt" and b"pencil" in out and b">" in out and not sent:
                os.write(fd, f'get_screenshot({{nodeId: "{node_id}"}})\n'.encode())
                sent = True
                state = "wait_image"
            elif state == "wait_image":
                if b'"image":' in out:
                    state = "got_image"
                    if not sent_exit:
                        # give time for full base64 to flush
                        pass
            if state == "got_image" and not sent_exit and out.count(b'"') >= 4:
                # have at least one complete json after image:
                os.write(fd, b'exit()\n')
                sent_exit = True
        else:
            if state == "wait_prompt" and not sent and (b"pencil" in out and b">" in out):
                os.write(fd, f'get_screenshot({{nodeId: "{node_id}"}})\n'.encode())
                sent = True
                state = "wait_image"
    try:
        os.close(fd)
    except Exception:
        pass
    try:
        os.waitpid(pid, 0)
    except Exception:
        pass
    text = out.decode("utf-8", errors="replace")
    m = re.search(r'"image":\s*"([A-Za-z0-9+/=]+)"', text)
    if not m:
        sys.stderr.write(f"  no image; tail={text[-300:]}\n")
        return False
    out_path = ROOT / out_rel
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(base64.b64decode(m.group(1)))
    print(f"  saved: {out_path} ({out_path.stat().st_size}B)", flush=True)
    return True


for i, (nid, out) in enumerate(EXPORTS, 1):
    print(f"[{i}/{len(EXPORTS)}] {nid} -> {out}", flush=True)
    export_one(nid, out)
    time.sleep(1)
