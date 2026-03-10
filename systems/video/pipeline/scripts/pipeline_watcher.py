#!/usr/bin/env python3
"""Watch blog content for changes and auto-trigger prepro pipeline.

Uses watchdog to monitor content/blog/phase1/ for .md file changes.
Debounces events (5s) to avoid triggering on partial saves.

Usage:
    python pipeline_watcher.py --watch-dir /path/to/content/blog/phase1
    python pipeline_watcher.py  # uses default paths

Runs in foreground. Use `nohup ... &` or systemd user unit for background.
"""

from __future__ import annotations

import argparse
import subprocess
import threading
import time
from pathlib import Path
from typing import Callable


def _try_import_watchdog():
    try:
        from watchdog.events import FileSystemEventHandler
        from watchdog.observers import Observer
        return FileSystemEventHandler, Observer
    except ImportError:
        raise SystemExit(
            "[FAIL] watchdog not installed. Run: pip install watchdog"
        )


def _run_prepro(blog_path: Path, video_root: Path, prepro_out_root: Path) -> None:
    """Trigger the prepro stage for a changed blog file."""
    scripts_dir = video_root / "pipeline" / "scripts"
    prepro_py = scripts_dir / "build_blog_to_video_prepro.py"

    cmd = [
        "python3",
        str(prepro_py),
        "--blog",
        str(blog_path),
        "--out-root",
        str(prepro_out_root),
    ]
    print(f"[TRIGGER] prepro for {blog_path.name}")
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode == 0:
            print(f"[OK] prepro completed for {blog_path.name}")
        else:
            print(f"[WARN] prepro failed for {blog_path.name}: {proc.stderr[:200]}")
    except subprocess.TimeoutExpired:
        print(f"[WARN] prepro timed out for {blog_path.name}")


class DebouncedHandler:
    """Debounce file system events and trigger callback."""

    def __init__(self, callback: Callable[[Path], None], debounce_sec: float = 5.0):
        self._callback = callback
        self._debounce_sec = debounce_sec
        self._timers: dict[str, threading.Timer] = {}
        self._lock = threading.Lock()

    def on_change(self, path: Path) -> None:
        key = str(path)
        with self._lock:
            existing = self._timers.get(key)
            if existing:
                existing.cancel()
            timer = threading.Timer(self._debounce_sec, self._fire, args=[path])
            self._timers[key] = timer
            timer.start()

    def _fire(self, path: Path) -> None:
        with self._lock:
            self._timers.pop(str(path), None)
        self._callback(path)


def main() -> int:
    FileSystemEventHandler, Observer = _try_import_watchdog()

    parser = argparse.ArgumentParser(description="Watch blog files and auto-trigger prepro")
    parser.add_argument(
        "--watch-dir",
        type=Path,
        default=Path("/mnt/e/vibecode-blog/content/blog/phase1"),
    )
    parser.add_argument(
        "--video-root",
        type=Path,
        default=Path("/mnt/e/vibecode-blog/content/video"),
    )
    parser.add_argument(
        "--prepro-out-root",
        type=Path,
        default=Path("/mnt/e/vibecode-blog/content/video/preproduction"),
    )
    parser.add_argument("--debounce-sec", type=float, default=5.0)
    parser.add_argument("--extensions", default=".md", help="Comma-separated extensions to watch")
    args = parser.parse_args()

    extensions = {e.strip() for e in args.extensions.split(",")}

    def on_blog_changed(path: Path) -> None:
        _run_prepro(path, args.video_root, args.prepro_out_root)

    debouncer = DebouncedHandler(on_blog_changed, debounce_sec=args.debounce_sec)

    class MarkdownHandler(FileSystemEventHandler):
        def on_modified(self, event):
            if event.is_directory:
                return
            p = Path(event.src_path)
            if p.suffix.lower() in extensions:
                debouncer.on_change(p)

        def on_created(self, event):
            self.on_modified(event)

    observer = Observer()
    observer.schedule(MarkdownHandler(), str(args.watch_dir), recursive=True)
    observer.start()

    print(f"[WATCH] monitoring {args.watch_dir} for {extensions} changes (debounce={args.debounce_sec}s)")
    print("[WATCH] press Ctrl+C to stop")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
