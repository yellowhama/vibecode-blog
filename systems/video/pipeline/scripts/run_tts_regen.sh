#!/bin/bash
# run_tts_regen.sh — Batch TTS regeneration for all episodes.
# Usage: ./run_tts_regen.sh <ep_dir1> <ep_dir2> ...
# Example: ./run_tts_regen.sh ../../preproduction/ep0{1,2,3,4}
set -euo pipefail

VENV="/home/hugh/.venvs/chatterbox/bin/activate"
SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
RULES="$SCRIPTS/../config/tts_rules.yaml"

if [ $# -eq 0 ]; then
  echo "[FAIL] Usage: $0 <ep_dir1> [ep_dir2] ..."
  exit 1
fi

for EP_DIR in "$@"; do
  EP_DIR="$(realpath "$EP_DIR")"
  EP_NAME="$(basename "$EP_DIR")"
  echo ""
  echo "=============================="
  echo "[START] $EP_NAME"
  echo "=============================="

  # Find latest manifest
  MANIFEST="$(ls -t "$EP_DIR"/ep*_prepro_manifest_v*.json 2>/dev/null | head -1)"
  if [ -z "$MANIFEST" ]; then
    echo "[SKIP] No prepro manifest found in $EP_DIR"
    continue
  fi
  echo "[INFO] manifest: $MANIFEST"

  # Detect language
  LANG=$(python3 -c "import json; print(json.load(open('$MANIFEST')).get('language','en'))")
  echo "[INFO] language: $LANG"

  # Step 1: Pre-process (pronunciation, pauses, emotion curves)
  echo "[STEP 1/3] Pre-processing TTS text..."
  python3 "$SCRIPTS/prepare_tts_script.py" --prepro-manifest "$MANIFEST" --rules "$RULES"

  # Step 2: Select TTS backend based on language
  if [ "$LANG" = "ko" ]; then
    BACKEND="edge"
    FALLBACK="none"
    echo "[INFO] Korean → Edge TTS (no exaggeration support)"
  else
    # Activate Chatterbox venv for English
    if [ -f "$VENV" ]; then
      source "$VENV"
    else
      echo "[WARN] Chatterbox venv not found at $VENV, trying system python"
    fi
    BACKEND="chatterbox"
    FALLBACK="edge"
    echo "[INFO] English → Chatterbox (fallback: Edge)"
  fi

  # Step 3: Generate TTS
  echo "[STEP 2/3] Generating TTS ($BACKEND)..."
  python3 "$SCRIPTS/generate_tts_from_prepro.py" \
    --prepro-manifest "$MANIFEST" \
    --tts-backend "$BACKEND" --tts-fallback "$FALLBACK" \
    --no-cache --trim-silence

  # Step 3: Validate reports
  echo "[STEP 3/3] Checking reports..."
  TTS_DIR="$(dirname "$MANIFEST")/tts_full_v7"
  if [ ! -d "$TTS_DIR" ]; then
    TTS_DIR="$(dirname "$MANIFEST")/tts_full_v6"
  fi

  for REPORT in voiceover_tts_report.json timing_alignment_report.json voiceover_quality_report.json; do
    RPATH="$TTS_DIR/$REPORT"
    if [ -f "$RPATH" ]; then
      echo "  [OK] $REPORT"
    else
      echo "  [WARN] $REPORT not found in $TTS_DIR"
    fi
  done

  # Quick timing violation check
  TIMING="$TTS_DIR/timing_alignment_report.json"
  if [ -f "$TIMING" ]; then
    VIOLATIONS=$(python3 -c "import json; r=json.load(open('$TIMING')); print(r.get('violations',r.get('total_violations','?')))" 2>/dev/null || echo "?")
    echo "  [INFO] timing violations: $VIOLATIONS"
  fi

  echo "[DONE] $EP_NAME"
done

echo ""
echo "=============================="
echo "[COMPLETE] All episodes processed"
echo "=============================="
