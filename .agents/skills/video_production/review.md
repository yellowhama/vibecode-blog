# /video-review — Render Result Review

Review rendered shots, approve passes, and guide corrections for failures.

## Steps

### 1. Load Evaluation Summary
Find the latest evaluation summary:

```bash
# Find most recent render run
ls -td /mnt/e/vibecode-blog/systems/video/output/renders/*/ | head -5
```

Read the evaluation summary JSON to understand pass/fail status.

### 2. Present Results Dashboard
For each shot, show:
- Shot ID, scene, purpose
- Score (0-100) and status (PASS/FAIL)
- Failed metrics (if any)
- Feedback text from vision QA

### 3. Visual Review (Failed Shots)
For each FAIL shot:
- Read the extracted frame images (jpg/png in the shot directory)
- Compare against the intended prompt
- Classify the failure type:
  - Hallucination (unwanted elements)
  - Missing element
  - Style mismatch
  - Expression/costume wrong

### 4. Correction Decision
For each failed shot, ask the user:
- **Auto-correct**: Run `qa_correction_agent.py` to auto-fix and re-render
- **Manual fix**: User provides specific prompt edits
- **Accept**: Mark as acceptable despite failure
- **Skip**: Defer to later

### 5. Run Corrections (if approved)

```bash
python3 pipeline/scripts/qa_correction_agent.py \
  --evaluations <run_dir>/evaluations_summary.json \
  --manifest <manifest_path> \
  --output <manifest_path_corrected> \
  --re-render \
  --server http://127.0.0.1:8188
```

### 6. Re-evaluate
After corrections, re-run evaluation on corrected shots only.
Present updated pass rate. Repeat cycle if needed (max 3 attempts).
