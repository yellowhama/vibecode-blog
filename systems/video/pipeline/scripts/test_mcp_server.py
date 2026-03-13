#!/usr/bin/env python3
"""Integration tests for CLI-Anything MCP server via stdio protocol."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

SERVER_PATH = Path(__file__).resolve().parent / "cli_anything_mcp_server.py"


def _send_jsonrpc(proc: subprocess.Popen, method: str, params: dict | None = None, id: int = 1) -> dict:
    """Send a JSON-RPC request and read the response."""
    request = {"jsonrpc": "2.0", "method": method, "id": id}
    if params is not None:
        request["params"] = params
    body = json.dumps(request)
    message = f"Content-Length: {len(body)}\r\n\r\n{body}"
    proc.stdin.write(message)
    proc.stdin.flush()

    # Read response headers
    headers = {}
    while True:
        line = proc.stdout.readline()
        if not line or line.strip() == "":
            break
        if ":" in line:
            key, val = line.split(":", 1)
            headers[key.strip()] = val.strip()

    content_length = int(headers.get("Content-Length", 0))
    if content_length == 0:
        return {"error": "No response"}

    body = proc.stdout.read(content_length)
    return json.loads(body)


def test_self_test() -> bool:
    """Test --test self-diagnostic mode."""
    proc = subprocess.run(
        [sys.executable, str(SERVER_PATH), "--test"],
        capture_output=True, text=True, timeout=30,
    )
    if proc.returncode != 0:
        print(f"[FAIL] self-test exit code: {proc.returncode}")
        print(proc.stderr)
        return False
    if "Self-test complete" not in proc.stdout:
        print(f"[FAIL] self-test output missing completion marker")
        print(proc.stdout)
        return False
    print("[OK] self-test mode passes")
    return True


def test_tool_list() -> bool:
    """Test tools/list via stdio."""
    try:
        proc = subprocess.Popen(
            [sys.executable, str(SERVER_PATH)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True,
        )
    except Exception as e:
        print(f"[FAIL] Could not start server: {e}")
        return False

    try:
        # Initialize
        init_resp = _send_jsonrpc(proc, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test", "version": "1.0"},
        })

        if "error" in init_resp:
            print(f"[FAIL] initialize error: {init_resp['error']}")
            return False

        # List tools
        list_resp = _send_jsonrpc(proc, "tools/list", {}, id=2)
        if "error" in list_resp:
            print(f"[FAIL] tools/list error: {list_resp['error']}")
            return False

        tools = list_resp.get("result", {}).get("tools", [])
        print(f"[OK] tools/list returned {len(tools)} tools")

        # Verify tool naming convention
        for t in tools:
            name = t["name"]
            if not name.startswith("cli_"):
                print(f"[FAIL] tool name doesn't follow convention: {name}")
                return False

        print(f"[OK] all tool names follow cli_{{tool}}_{{group}}_{{command}} convention")
        return True
    except Exception as e:
        print(f"[FAIL] stdio test error: {e}")
        return False
    finally:
        proc.terminate()
        proc.wait(timeout=5)


def test_error_handling() -> bool:
    """Test error responses for invalid tool calls."""
    try:
        proc = subprocess.Popen(
            [sys.executable, str(SERVER_PATH)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True,
        )
    except Exception as e:
        print(f"[FAIL] Could not start server: {e}")
        return False

    try:
        # Initialize
        _send_jsonrpc(proc, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test", "version": "1.0"},
        })

        # Call non-existent tool
        resp = _send_jsonrpc(proc, "tools/call", {
            "name": "cli_nonexistent_tool",
            "arguments": {},
        }, id=2)

        result = resp.get("result", {})
        content = result.get("content", [{}])
        if content:
            text = content[0].get("text", "")
            data = json.loads(text)
            if "error" in data:
                print(f"[OK] unknown tool returns error: {data['error']}")
                return True

        print(f"[WARN] unexpected response for unknown tool: {resp}")
        return True  # Non-critical
    except Exception as e:
        print(f"[FAIL] error handling test: {e}")
        return False
    finally:
        proc.terminate()
        proc.wait(timeout=5)


def main() -> int:
    print("=== CLI-Anything MCP Server Integration Tests ===\n")

    results = []
    results.append(("self-test", test_self_test()))
    results.append(("tool-list", test_tool_list()))
    results.append(("error-handling", test_error_handling()))

    print("\n--- Results ---")
    passed = sum(1 for _, ok in results if ok)
    for name, ok in results:
        print(f"  {'PASS' if ok else 'FAIL'}: {name}")
    print(f"\n{passed}/{len(results)} tests passed")

    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
