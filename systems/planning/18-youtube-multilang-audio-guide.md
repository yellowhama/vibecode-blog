# YouTube Multi-Language Audio & Channel Localization Guide

## 1. Multi-Language Audio Tracks (다국어 오디오)

YouTube now supports multiple audio tracks per video. One video gets all views combined, better for algorithm.

### Upload Workflow
1. **YouTube Studio** → 자막 (Subtitles)
2. Select video → **언어 추가 (Add Language)**
3. In the **오디오 (Audio)** column → **추가 (Add)**
4. Upload prepared audio file (MP3, WAV)

### Sync Requirements (Critical)
- Audio file length must **exactly match** original video length
- If original is 6:03, alternate audio must also be exactly 6:03
- Match any leading silence/intro precisely
- Test sync in editor (Premiere/CapCut) before upload

### Pipeline Integration
For our 4-episode setup:
- EP01/02/04 are **English primary** → upload as main video
- EP03 is **Korean primary** → option A: separate video, option B: Korean audio track on EN video
- Each episode exports two audio files:
  - `output/epXX/audio/mixed_audio_v4_en.wav` (English)
  - `output/epXX/audio/mixed_audio_v4_ko.wav` (Korean)
- Both must be padded/trimmed to identical duration as final video

### Viewer Experience
- Settings gear → Audio Track → select language
- Auto-selects based on viewer's YouTube language setting

## 2. Channel Name Localization (채널명 다국어)

### Setup Steps
1. **YouTube Studio** → **맞춤설정 (Customization)**
2. **기본 정보 (Basic Info)** tab
3. Below channel name → **언어 추가 (Add Language)** (blue link)
4. Left: **원본 언어** (Original: Korean) → Right: **번역 언어** (Translation: English, Japanese, etc.)
5. Enter translated **channel name** + **channel description**
6. **완료 (Done)** → **게시 (Publish)**

### Result
Foreign viewers see channel name in their language automatically.

## 3. Video Title/Description Localization

Same workflow as channel localization but per-video:
1. YouTube Studio → select video → **Details**
2. **Add Language** under title/description
3. Enter translated title + description per language
4. Helps with international search/discover

## 4. AI Dubbing Tools (Reference)

For automated multi-language dubbing:
- **ElevenLabs Dubbing** — best quality, voice cloning
- **Rask.ai** — auto-translate + dub + lip sync
- **Papercup** — enterprise-grade
- **HeyGen** — video translation with avatar lip sync
- Our pipeline: Chatterbox (EN) + Edge TTS (KO) already covers bilingual

## 5. Vibecode Pipeline Checklist

- [ ] Final video rendered (same visual for both languages)
- [ ] EN mixed audio exported (narration_en + bgm)
- [ ] KO mixed audio exported (narration_ko + bgm)
- [ ] Both audio files same duration as video
- [ ] Upload primary language video
- [ ] Add alternate audio track via Studio
- [ ] Add translated title/description
- [ ] Add SRT subtitles for both languages
- [ ] Set channel name translations
