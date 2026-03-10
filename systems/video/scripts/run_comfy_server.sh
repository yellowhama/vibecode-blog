#!/usr/bin/env bash
set -euo pipefail

COMFY_DIR="/home/hugh/ComfyUI"
LOG_FILE="$COMFY_DIR/comfy_server.log"
PORT=8188

usage() {
  echo "Usage: $0 [--detach] [--stop]"
  echo "  --detach   Run in background (nohup, BrokenPipe-safe)"
  echo "  --stop     Kill running ComfyUI server"
  exit 0
}

stop_server() {
  if pkill -f "main.py --listen 0.0.0.0 --port $PORT" 2>/dev/null; then
    echo "[OK] ComfyUI server stopped"
  else
    echo "[INFO] No running ComfyUI server found"
  fi
  exit 0
}

MODE="foreground"
for arg in "$@"; do
  case "$arg" in
    --detach) MODE="detach" ;;
    --stop)   stop_server ;;
    --help|-h) usage ;;
  esac
done

if curl -s -o /dev/null -w "" http://127.0.0.1:$PORT/queue 2>/dev/null; then
  echo "[WARN] ComfyUI already running on port $PORT"
  exit 1
fi

if [ "$MODE" = "detach" ]; then
  nohup bash "$COMFY_DIR/run_comfy.sh" > "$LOG_FILE" 2>&1 &
  COMFY_PID=$!
  echo "[OK] ComfyUI started in background (PID=$COMFY_PID)"
  echo "[LOG] $LOG_FILE"

  # Wait for server to be ready
  for i in $(seq 1 15); do
    sleep 2
    if curl -s -o /dev/null -w "" http://127.0.0.1:$PORT/queue 2>/dev/null; then
      echo "[OK] Server ready at http://127.0.0.1:$PORT"
      exit 0
    fi
  done
  echo "[WARN] Server started but not responding yet. Check log: tail -f $LOG_FILE"
else
  echo "[INFO] Starting ComfyUI (foreground) on port $PORT..."
  exec bash "$COMFY_DIR/run_comfy.sh"
fi
