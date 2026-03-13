#!/usr/bin/env python3
"""A/B test runner: compare legacy (FFmpeg/Pillow) vs CLI-Anything harness pipelines.

Measures file size, processing time, and quality metrics (SSIM, LUFS, blackdetect)
to produce comparison reports in JSON and HTML.

Usage:
    python3 ab_test_runner.py --stage audio_postprocess --input voice.wav --output-dir results/
    python3 ab_test_runner.py --all --input-dir pipeline_assets/ --output-dir results/
"""

from __future__ import annotations

import json
import os
import subprocess
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Callable


@dataclass
class ABResult:
    """Result of a single A/B comparison."""
    stage: str
    test_case: str
    legacy: dict[str, Any] = field(default_factory=dict)
    harness: dict[str, Any] = field(default_factory=dict)
    delta: dict[str, Any] = field(default_factory=dict)
    winner: str | None = None  # "legacy", "harness", or None (tie)
    error: str | None = None


class ABTestRunner:
    """Orchestrates A/B comparisons between legacy and harness pipelines."""

    def __init__(self) -> None:
        self._stages: dict[str, dict[str, Any]] = {}

    def register_stage(
        self,
        name: str,
        legacy_fn: Callable[..., dict[str, Any]],
        harness_fn: Callable[..., dict[str, Any]],
        metrics: list[str] | None = None,
        description: str = "",
    ) -> None:
        """Register a comparison stage.

        Args:
            name: Stage identifier.
            legacy_fn: Function(input_path, output_path) → metrics dict.
            harness_fn: Function(input_path, output_path) → metrics dict.
            metrics: List of metric names to compare.
            description: Human-readable description.
        """
        self._stages[name] = {
            "legacy_fn": legacy_fn,
            "harness_fn": harness_fn,
            "metrics": metrics or ["time_sec", "file_size_kb"],
            "description": description,
        }

    def run_stage(self, name: str, test_cases: list[dict[str, Any]]) -> list[ABResult]:
        """Run A/B comparison for a single stage.

        Args:
            name: Registered stage name.
            test_cases: List of dicts with 'name', 'input_path', 'output_dir'.
        """
        if name not in self._stages:
            return [ABResult(stage=name, test_case="", error=f"Unknown stage: {name}")]

        stage = self._stages[name]
        results = []

        for tc in test_cases:
            tc_name = tc.get("name", "unnamed")
            input_path = Path(tc["input_path"])
            output_dir = Path(tc["output_dir"])
            output_dir.mkdir(parents=True, exist_ok=True)

            legacy_out = output_dir / f"{input_path.stem}_legacy{input_path.suffix}"
            harness_out = output_dir / f"{input_path.stem}_harness{input_path.suffix}"

            result = ABResult(stage=name, test_case=tc_name)

            # Run legacy
            try:
                t0 = time.perf_counter()
                legacy_metrics = stage["legacy_fn"](input_path, legacy_out, **tc.get("extra", {}))
                t1 = time.perf_counter()
                legacy_metrics["time_sec"] = round(t1 - t0, 3)
                if legacy_out.exists():
                    legacy_metrics["file_size_kb"] = round(os.path.getsize(legacy_out) / 1024, 1)
                result.legacy = legacy_metrics
            except Exception as e:
                result.legacy = {"error": str(e)}

            # Run harness
            try:
                t0 = time.perf_counter()
                harness_metrics = stage["harness_fn"](input_path, harness_out, **tc.get("extra", {}))
                t1 = time.perf_counter()
                harness_metrics["time_sec"] = round(t1 - t0, 3)
                if harness_out.exists():
                    harness_metrics["file_size_kb"] = round(os.path.getsize(harness_out) / 1024, 1)
                result.harness = harness_metrics
            except Exception as e:
                result.harness = {"error": str(e)}

            # Compute deltas
            if "error" not in result.legacy and "error" not in result.harness:
                result.delta = _compute_delta(result.legacy, result.harness, stage["metrics"])
                result.winner = _determine_winner(result.delta, stage["metrics"])

            results.append(result)

        return results

    def run_all(self, test_cases_by_stage: dict[str, list[dict[str, Any]]]) -> list[ABResult]:
        """Run all registered stages."""
        all_results = []
        for name in self._stages:
            cases = test_cases_by_stage.get(name, [])
            if cases:
                all_results.extend(self.run_stage(name, cases))
        return all_results

    def generate_report(self, results: list[ABResult]) -> dict[str, Any]:
        """Generate summary report from results."""
        harness_wins = sum(1 for r in results if r.winner == "harness")
        legacy_wins = sum(1 for r in results if r.winner == "legacy")
        ties = sum(1 for r in results if r.winner is None and r.error is None)
        errors = sum(1 for r in results if r.error is not None
                     or "error" in r.legacy or "error" in r.harness)

        # Find stages where harness wins
        harness_stages = set()
        legacy_stages = set()
        for r in results:
            if r.winner == "harness":
                harness_stages.add(r.stage)
            elif r.winner == "legacy":
                legacy_stages.add(r.stage)

        recommendation_parts = []
        if harness_stages:
            recommendation_parts.append(f"harness recommended: {', '.join(sorted(harness_stages))}")
        if legacy_stages:
            recommendation_parts.append(f"legacy preferred: {', '.join(sorted(legacy_stages))}")

        return {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": len(results),
                "harness_wins": harness_wins,
                "legacy_wins": legacy_wins,
                "ties": ties,
                "errors": errors,
                "recommendation": "; ".join(recommendation_parts) if recommendation_parts else "insufficient data",
            },
            "results": [asdict(r) for r in results],
        }


def _compute_delta(
    legacy: dict[str, Any],
    harness: dict[str, Any],
    metrics: list[str],
) -> dict[str, Any]:
    """Compute percentage deltas between legacy and harness metrics."""
    delta = {}
    for m in metrics:
        lv = legacy.get(m)
        hv = harness.get(m)
        if isinstance(lv, (int, float)) and isinstance(hv, (int, float)) and lv != 0:
            pct = round((hv - lv) / abs(lv) * 100, 1)
            delta[m] = {"legacy": lv, "harness": hv, "delta_pct": pct}
    return delta


def _determine_winner(delta: dict[str, Any], metrics: list[str]) -> str | None:
    """Determine winner based on metric deltas.

    Rules:
        - time_sec: lower is better
        - file_size_kb: lower is better (if quality comparable)
        - ssim: higher is better
        - lufs_integrated: closer to -14 is better (YouTube target)
    """
    scores = {"legacy": 0, "harness": 0}

    for m, info in delta.items():
        pct = info.get("delta_pct", 0)
        if abs(pct) < 5:  # Within 5% = tie for this metric
            continue

        if m in ("time_sec", "file_size_kb"):
            # Lower is better
            if pct < 0:
                scores["harness"] += 1
            else:
                scores["legacy"] += 1
        elif m in ("ssim",):
            # Higher is better
            if pct > 0:
                scores["harness"] += 1
            else:
                scores["legacy"] += 1
        elif m == "lufs_integrated":
            # Closer to -14 is better
            l_dist = abs(info["legacy"] - (-14))
            h_dist = abs(info["harness"] - (-14))
            if h_dist < l_dist:
                scores["harness"] += 1
            else:
                scores["legacy"] += 1

    if scores["harness"] > scores["legacy"]:
        return "harness"
    elif scores["legacy"] > scores["harness"]:
        return "legacy"
    return None


# ---------------------------------------------------------------------------
# Quality metric helpers
# ---------------------------------------------------------------------------

def measure_ssim(file_a: Path, file_b: Path) -> float | None:
    """Measure SSIM between two video/image files using FFmpeg."""
    try:
        out = subprocess.run(
            ["ffmpeg", "-i", str(file_a), "-i", str(file_b),
             "-lavfi", "ssim", "-f", "null", "-"],
            capture_output=True, text=True, timeout=60,
        )
        for line in out.stderr.splitlines():
            if "All:" in line:
                # Parse "All:0.987654"
                idx = line.index("All:") + 4
                val = line[idx:].split()[0].rstrip("()")
                return float(val)
    except Exception:
        pass
    return None


def measure_lufs(audio_path: Path) -> dict[str, float] | None:
    """Measure LUFS loudness using FFmpeg loudnorm filter."""
    try:
        out = subprocess.run(
            ["ffmpeg", "-i", str(audio_path), "-af",
             "loudnorm=print_format=json", "-f", "null", "-"],
            capture_output=True, text=True, timeout=30,
        )
        # Extract JSON block from stderr
        stderr = out.stderr
        start = stderr.rfind("{")
        end = stderr.rfind("}") + 1
        if start >= 0 and end > start:
            data = json.loads(stderr[start:end])
            return {
                "integrated": float(data.get("input_i", -70)),
                "true_peak": float(data.get("input_tp", -70)),
                "lra": float(data.get("input_lra", 0)),
            }
    except Exception:
        pass
    return None


def measure_blackdetect(video_path: Path) -> list[dict[str, float]]:
    """Detect black frames using FFmpeg blackdetect filter."""
    blacks = []
    try:
        out = subprocess.run(
            ["ffmpeg", "-i", str(video_path), "-vf",
             "blackdetect=d=0.5:pix_th=0.10", "-f", "null", "-"],
            capture_output=True, text=True, timeout=60,
        )
        for line in out.stderr.splitlines():
            if "black_start:" in line:
                parts = {}
                for token in line.split():
                    if ":" in token:
                        k, v = token.split(":", 1)
                        try:
                            parts[k] = float(v)
                        except ValueError:
                            pass
                if "black_start" in parts:
                    blacks.append(parts)
    except Exception:
        pass
    return blacks


def generate_html_report(report: dict[str, Any], output_path: Path) -> None:
    """Generate a simple HTML comparison report."""
    summary = report["summary"]
    results = report["results"]

    rows = []
    for r in results:
        winner_class = ""
        if r.get("winner") == "harness":
            winner_class = "style='background:#d4edda'"
        elif r.get("winner") == "legacy":
            winner_class = "style='background:#f8d7da'"

        legacy_time = r.get("legacy", {}).get("time_sec", "—")
        harness_time = r.get("harness", {}).get("time_sec", "—")
        legacy_size = r.get("legacy", {}).get("file_size_kb", "—")
        harness_size = r.get("harness", {}).get("file_size_kb", "—")
        winner = r.get("winner", "—") or "tie"

        rows.append(
            f"<tr {winner_class}>"
            f"<td>{r['stage']}</td><td>{r['test_case']}</td>"
            f"<td>{legacy_time}</td><td>{harness_time}</td>"
            f"<td>{legacy_size}</td><td>{harness_size}</td>"
            f"<td><b>{winner}</b></td></tr>"
        )

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>A/B Test Report</title>
<style>
body {{ font-family: system-ui, sans-serif; max-width: 900px; margin: 2em auto; }}
table {{ border-collapse: collapse; width: 100%; }}
th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
th {{ background: #0E1117; color: white; }}
.summary {{ background: #f8f9fa; padding: 1em; border-radius: 8px; margin-bottom: 1em; }}
</style></head><body>
<h1>A/B Test Report</h1>
<div class="summary">
<p><b>Total:</b> {summary['total_tests']} |
<b>Harness wins:</b> {summary['harness_wins']} |
<b>Legacy wins:</b> {summary['legacy_wins']} |
<b>Ties:</b> {summary['ties']}</p>
<p><b>Recommendation:</b> {summary['recommendation']}</p>
</div>
<table>
<tr><th>Stage</th><th>Test Case</th><th>Legacy Time (s)</th><th>Harness Time (s)</th>
<th>Legacy Size (KB)</th><th>Harness Size (KB)</th><th>Winner</th></tr>
{''.join(rows)}
</table>
<p><small>Generated {report['timestamp']}</small></p>
</body></html>"""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
