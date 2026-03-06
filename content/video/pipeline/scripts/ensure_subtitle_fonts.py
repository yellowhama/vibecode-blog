#!/usr/bin/env python3
"""Ensure repo-local subtitle fonts are available."""

from __future__ import annotations

import argparse
import shutil
import urllib.request
from pathlib import Path


DEFAULT_FONTS_DIR = Path("/mnt/e/vibecode-blog/content/video/assets/fonts")
NOTO_KR_URL = "https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf"
NOTO_KR_NAME = "NotoSansCJKkr-Regular.otf"


def _download(url: str, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=60) as response, output_path.open("wb") as out:
        shutil.copyfileobj(response, out)


def ensure_default_subtitle_fonts(fonts_dir: Path = DEFAULT_FONTS_DIR) -> list[Path]:
    ensured: list[Path] = []

    target = fonts_dir / NOTO_KR_NAME
    if target.exists() and target.stat().st_size > 0:
        ensured.append(target)
        return ensured

    print(f"[INFO] downloading Korean subtitle font -> {target}")
    _download(NOTO_KR_URL, target)
    if not target.exists() or target.stat().st_size == 0:
        raise RuntimeError(f"[FAIL] font download failed: {target}")
    ensured.append(target)
    return ensured


def main() -> int:
    parser = argparse.ArgumentParser(description="Ensure subtitle fonts exist in repo-local assets directory")
    parser.add_argument("--fonts-dir", type=Path, default=DEFAULT_FONTS_DIR)
    args = parser.parse_args()

    ensured = ensure_default_subtitle_fonts(args.fonts_dir)
    for path in ensured:
        print(f"[OK] subtitle font ready: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
