#!/usr/bin/env python3
"""
Export .excalidraw files to PNG using Playwright.
Loads excalidraw.com, injects scene data, screenshots the canvas.

Usage:
  python3 scripts/excalidraw-to-png.py public/images/blog/wiki-starving/flywheel.excalidraw
  python3 scripts/excalidraw-to-png.py --all
"""

import sys
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright


def export_excalidraw_to_png(excalidraw_path: str) -> str:
    path = Path(excalidraw_path)
    if not path.exists():
        raise FileNotFoundError(f"{path} not found")

    png_path = path.with_suffix(".png")
    scene_data = path.read_text(encoding="utf-8")

    # Validate JSON
    scene = json.loads(scene_data)
    elements = scene.get("elements", [])
    app_state = scene.get("appState", {})

    print(f"  Elements: {len(elements)}, Background: {app_state.get('viewBackgroundColor', 'default')}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1200, "height": 800})
        page = context.new_page()

        # Load excalidraw.com
        page.goto("https://excalidraw.com", wait_until="networkidle", timeout=45000)
        time.sleep(3)

        # Dismiss any welcome screen by clicking
        page.keyboard.press("Escape")
        time.sleep(1)

        # Inject the scene data via Excalidraw's internal API
        injected = page.evaluate(f"""
            () => {{
                const sceneData = {scene_data};
                // Try to find the Excalidraw API
                const api = window.excalidrawAPI || window.__EXCALIDRAW_API__;
                if (api && api.updateScene) {{
                    api.updateScene({{
                        elements: sceneData.elements || [],
                        appState: {{
                            ...sceneData.appState,
                            zoom: {{ value: 1 }},
                        }}
                    }});
                    // Fit to content
                    if (api.scrollToContent) {{
                        api.scrollToContent(sceneData.elements, {{ fitToContent: true, animate: false }});
                    }}
                    return "api";
                }}

                // Fallback: try localStorage
                try {{
                    const key = Object.keys(localStorage).find(k => k.includes('excalidraw'));
                    if (key) {{
                        localStorage.setItem(key, JSON.stringify(sceneData));
                        return "localStorage";
                    }}
                }} catch(e) {{}}

                return "none";
            }}
        """)

        print(f"  Injection method: {injected}")

        if injected == "none":
            # Last resort: paste JSON via clipboard
            page.evaluate(f"""
                () => {{
                    const data = JSON.stringify({scene_data});
                    navigator.clipboard.writeText(data).catch(() => {{}});
                }}
            """)
            # Ctrl+V to paste
            page.keyboard.press("Control+v")
            time.sleep(2)

        time.sleep(2)

        # Screenshot the canvas
        canvas = page.query_selector("canvas.excalidraw__canvas")
        if not canvas:
            canvas = page.query_selector("canvas")

        if canvas:
            canvas.screenshot(path=str(png_path), type="png")
            print(f"  ✅ Saved: {png_path} ({png_path.stat().st_size // 1024}KB)")
        else:
            # Full page screenshot as fallback
            page.screenshot(path=str(png_path), full_page=False, clip={"x": 0, "y": 50, "width": 1200, "height": 700})
            print(f"  ⚠️ Canvas not found, saved full page: {png_path}")

        browser.close()

    return str(png_path)


def find_all_excalidraw(root: str = "public/images") -> list:
    return sorted(Path(root).rglob("*.excalidraw"))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 excalidraw-to-png.py <file.excalidraw> | --all")
        sys.exit(1)

    if sys.argv[1] == "--all":
        files = find_all_excalidraw()
        print(f"Found {len(files)} .excalidraw files")
        for f in files:
            print(f"\nExporting: {f}")
            try:
                export_excalidraw_to_png(str(f))
            except Exception as e:
                print(f"  ❌ ERROR: {e}")
    else:
        export_excalidraw_to_png(sys.argv[1])
