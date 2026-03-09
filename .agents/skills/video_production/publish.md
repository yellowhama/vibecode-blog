# /video-publish — Final Review and YouTube Upload

Final quality check and YouTube publishing workflow.

## Steps

### 1. Locate Final Package
Find the YouTube package directory:

```bash
ls -td /mnt/e/vibecode-blog/systems/video/output/youtube_packages/*/ | head -3
```

### 2. Review Package Contents
Check that all required files exist:
- `final_assembled.mp4` — the full video
- `teaser_*.mp4` — teaser clip
- `thumbnail.png` — YouTube thumbnail
- `youtube_metadata.json` — title, description, tags
- `youtube_chapters.txt` — chapter markers
- `youtube_upload_checklist.json` — quality gates

### 3. Quality Gate Check
Read `youtube_upload_checklist.json`:
- Black frame detection: should be PASS
- Freeze frame detection: should be PASS
- Silence detection: should be PASS or WARN (acceptable)
- Duration: matches target

### 4. Metadata Review
Present to user for approval:
- **Title**: should be engaging, under 100 chars
- **Description**: includes key points, links, hashtags
- **Tags**: relevant keywords
- **Chapters**: timestamp markers match content

### 5. Upload (if approved)
Run YouTube upload:

```bash
python3 pipeline/scripts/youtube_upload.py \
  --package-dir <youtube_package_dir> \
  --privacy unlisted \
  --credentials ~/.youtube_credentials.json
```

Default to `unlisted` for first review. Change to `public` after user confirms.

### 6. Update Publish Log
After successful upload, update `content/publish_log.json` with:
- YouTube video URL
- Upload timestamp
- Privacy setting
