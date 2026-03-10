# ByteDance Server Info Analysis (2026-03-10)

Target Node: `ByteDanceImageToVideoNode`, `ByteDanceTextToVideoNode`, etc.

## 1. Resolution (resolution)
Exact allowed strings (as per ComfyUI /object_info):
- `"480p"` 
- `"720p"` 
- `"1080p"` 

*Note: `ByteDanceImageReferenceNode` only supports `"480p"` and `"720p"`.*

## 2. Aspect Ratio (aspect_ratio)
- `"adaptive"` (ImageToVideo only)
- `"16:9"` 
- `"4:3"` 
- `"1:1"` 
- `"3:4"` 
- `"9:16"` 
- `"21:9"` 

## 3. Duration (duration)
- Min: 3 seconds
- Max: 12 seconds
- Step: 1 second

**CRITICAL FIX NEEDED**: Current `comfy_batch_render.py` multiplies duration by 12 (assuming frames), which causes durations over 36 (e.g. 60) for 5s clips. This leads to **HTTP Error 400: Bad Request** from the ByteDance API.

## 4. Models (model)
- `"seedance-1-5-pro-251215"` 
- `"seedance-1-0-pro-250528"` 
- `"seedance-1-0-lite-i2v-250428"` (ImageToVideo)
- `"seedance-1-0-lite-t2v-250428"` (TextToVideo)
- `"seedance-1-0-pro-fast-251015"` (Recommended)
