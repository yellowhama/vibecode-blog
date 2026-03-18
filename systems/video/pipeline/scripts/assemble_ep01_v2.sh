#!/bin/bash
# EP01 v2 Assembly Script — Run after I2V renders complete
# Merges I2V character clips + improved diagram clips + audio → final video
#
# Usage: bash assemble_ep01_v2.sh [--skip-i2v]
#   --skip-i2v: Use existing clips/ (Ken Burns + diagrams) without I2V

set -e

BASE="/mnt/e/vibecode-blog/systems/video"
SCRIPTS="$BASE/pipeline/scripts"
EP="$BASE/output/ep01"
MANIFEST="$BASE/preproduction/ep01/ep01_shot_manifest_v6.json"

CLIPS_FINAL="$EP/clips"
CLIPS_I2V="$EP/clips_i2v"
CLIPS_DIAGRAM="$EP/clips_diagram"
AUDIO_DIR="$EP/audio"
SUB_FILE="$EP/subtitles/subtitles.srt"
FINAL_DIR="$EP/final"

SKIP_I2V=false
if [[ "$1" == "--skip-i2v" ]]; then
  SKIP_I2V=true
fi

echo "=== EP01 v2 Assembly ==="
echo "Date: $(date)"
echo ""

# Step 1: Merge clips — I2V for characters, diagram presets for diagrams
echo "--- Step 1: Merge Clips ---"

if [ "$SKIP_I2V" = true ]; then
  echo "Skipping I2V merge (using existing clips/)"
else
  # Copy I2V character clips over Ken Burns originals
  I2V_COUNT=0
  if [ -d "$CLIPS_I2V" ]; then
    for f in "$CLIPS_I2V"/*.mp4; do
      [ -f "$f" ] || continue
      cp "$f" "$CLIPS_FINAL/$(basename $f)"
      I2V_COUNT=$((I2V_COUNT + 1))
    done
    echo "Copied $I2V_COUNT I2V character clips"
  else
    echo "WARNING: No I2V clips directory. Using Ken Burns fallback."
  fi
fi

# Diagram clips are already copied in clips/
TOTAL=$(ls "$CLIPS_FINAL"/*.mp4 2>/dev/null | wc -l)
echo "Total clips in assembly: $TOTAL"

# Step 2: Remix audio with existing BGM
echo ""
echo "--- Step 2: Audio Mix ---"

NARRATION="$AUDIO_DIR/narration_v2.wav"
BGM="$AUDIO_DIR/bgm_v2.wav"
MIXED="$AUDIO_DIR/mixed_v3.wav"

SFX_ARGS=$(python3 -c "
import json
from pathlib import Path
import sys

manifest = json.loads(Path('$MANIFEST').read_text(encoding='utf-8'))
shots = manifest.get('shots', [])
current_time = 0.0
sfx_args = []
catalog_files = {}

sys.path.append('$SCRIPTS')
import audio_catalog
cat = audio_catalog.load_catalog()
for entry in cat.get('sfx', []):
    catalog_files[entry['id']] = str(Path(audio_catalog.DEFAULT_ASSETS_ROOT) / entry['path'])

for shot in shots:
    for sfx_id in shot.get('sfx', []):
        sfx_path = catalog_files.get(sfx_id)
        if sfx_path:
            sfx_args.extend(['--sfx', f\"{current_time:.2f}:{sfx_path}\"])
    current_time += shot.get('duration_sec', 0)

print(' '.join(sfx_args))
")

if [ -f "$NARRATION" ] && [ -f "$BGM" ]; then
  eval "python3 '$SCRIPTS/mix_audio.py' \
    --narration '$NARRATION' \
    --bgm '$BGM' \
    --output '$MIXED' \
    --bgm-volume 0.12 $SFX_ARGS"
else
  echo "WARNING: Missing narration or BGM. Using existing mix."
  MIXED="$AUDIO_DIR/mixed_v2.wav"
fi

# Step 3: Build concat list from manifest order
echo ""
echo "--- Step 3: Build Concat List ---"

python3 -c "
import json
from pathlib import Path

manifest = json.loads(Path('$MANIFEST').read_text(encoding='utf-8'))
shots = manifest.get('shots', [])
clips_dir = Path('$CLIPS_FINAL')

concat_lines = []
for shot in shots:
    shot_id = shot['shot_id']
    clip = clips_dir / f'{shot_id}.mp4'
    if clip.exists():
        concat_lines.append(f\"file '{clip.as_posix()}'\")
    else:
        print(f'WARNING: Missing clip {shot_id}')

with open('$EP/concat_v2.txt', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(concat_lines) + '\n')
print(f'Concat list: {len(concat_lines)} clips')
"

# Step 4: Concat + scale all clips to 1280x720
echo ""
echo "--- Step 4: FFmpeg Assembly ---"

mkdir -p "$FINAL_DIR"

# First pass: scale all clips to uniform resolution
SCALED_DIR="$EP/clips_scaled"
mkdir -p "$SCALED_DIR"


while IFS= read -r line; do
  FILE=$(echo "$line" | sed "s/file '//;s/'//")
  BASENAME=$(basename "$FILE")
  SCALED="$SCALED_DIR/$BASENAME"

  if [ ! -f "$SCALED" ]; then
    ffmpeg -y -i "$FILE" \
      -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black" \
      -r 30 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \
      "$SCALED"
  fi
done < "$EP/concat_v2.txt"

# Build scaled concat list
python3 -c "
from pathlib import Path
original = Path('$EP/concat_v2.txt').read_text(encoding='utf-8').strip().split('\n')
scaled = []
for line in original:
    f = line.replace(\"file '\", '').rstrip(\"'\")
    basename = Path(f).name
    scaled_path = Path('$SCALED_DIR') / basename
    scaled.append(f\"file '{scaled_path.as_posix()}'\")
with open('$EP/concat_v2_scaled.txt', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(scaled) + '\n')
"

# Concat video
CONCAT_VIDEO="$EP/concat_v2_video.mp4"
ffmpeg -y -f concat -safe 0 -i "$EP/concat_v2_scaled.txt" -c copy "$CONCAT_VIDEO"

# Step 5: Add audio + subtitles
echo ""
echo "--- Step 5: Final Merge ---"

FINAL="$FINAL_DIR/EP01_v3_FINAL.mp4"

if [ -f "$SUB_FILE" ]; then
  ffmpeg -y \
    -i "$CONCAT_VIDEO" \
    -i "$MIXED" \
    -vf "subtitles=$SUB_FILE:force_style='FontSize=22,PrimaryColour=&H00FFFFFF,BorderStyle=3,BackColour=&H80000000'" \
    -map 0:v -map 1:a \
    -c:v libx264 -preset medium -crf 18 \
    -c:a aac -b:a 192k \
    -shortest \
    "$FINAL" 2>/dev/null
else
  ffmpeg -y \
    -i "$CONCAT_VIDEO" \
    -i "$MIXED" \
    -map 0:v -map 1:a \
    -c:v libx264 -preset medium -crf 18 \
    -c:a aac -b:a 192k \
    -shortest \
    "$FINAL" 2>/dev/null
fi

# Step 6: Generate shorts
echo ""
echo "--- Step 6: Shorts ---"

# Hook short (first 15s)
SHORTS_HOOK="$FINAL_DIR/EP01_v3_SHORT_hook.mp4"
ffmpeg -y -i "$FINAL" -t 15 \
  -vf "crop=ih*9/16:ih,scale=1080:1920" \
  -c:v libx264 -preset medium -crf 20 \
  -c:a aac -b:a 128k \
  "$SHORTS_HOOK" 2>/dev/null

# Collapse short (around 1:10-1:30)
SHORTS_COLLAPSE="$FINAL_DIR/EP01_v3_SHORT_collapse.mp4"
ffmpeg -y -i "$FINAL" -ss 70 -t 20 \
  -vf "crop=ih*9/16:ih,scale=1080:1920" \
  -c:v libx264 -preset medium -crf 20 \
  -c:a aac -b:a 128k \
  "$SHORTS_COLLAPSE" 2>/dev/null

# Step 7: QC
echo ""
echo "=== QC Report ==="

DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL" 2>/dev/null)
SIZE=$(du -h "$FINAL" 2>/dev/null | cut -f1)
RES=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$FINAL" 2>/dev/null)
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$FINAL" 2>/dev/null)

echo "Final: $FINAL"
echo "Duration: ${DUR}s"
echo "Size: $SIZE"
echo "Resolution: $RES"
echo "FPS: $FPS"

# Cleanup temp
rm -rf "$SCALED_DIR" "$CONCAT_VIDEO" "$EP/concat_v2_scaled.txt"

echo ""
echo "=== Assembly Complete ==="
