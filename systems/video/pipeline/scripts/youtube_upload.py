#!/usr/bin/env python3
"""YouTube Data API v3 upload helper.

Requires:
    pip install google-api-python-client google-auth-oauthlib

Setup:
    1. Create OAuth2 credentials at https://console.cloud.google.com
    2. Download credentials.json
    3. First run will open browser for OAuth consent
    4. Token cached at ~/.youtube_upload_token.json

Usage:
    python youtube_upload.py --video path/to/video.mp4 --title "Title" --privacy unlisted
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


def _get_credentials(credentials_path: Optional[Path] = None):
    """Get or refresh YouTube API credentials."""
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        raise SystemExit(
            "[FAIL] Install: pip install google-api-python-client google-auth-oauthlib"
        )

    SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
    token_path = Path.home() / ".youtube_upload_token.json"

    creds = None
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            from google.auth.transport.requests import Request
            creds.refresh(Request())
        else:
            cred_file = credentials_path or Path("credentials.json")
            if not cred_file.exists():
                cred_file = Path.home() / ".youtube_credentials.json"
            if not cred_file.exists():
                raise SystemExit(
                    "[FAIL] YouTube credentials not found. "
                    "Provide --youtube-credentials or place credentials.json in CWD or ~/.youtube_credentials.json"
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(cred_file), SCOPES)
            creds = flow.run_local_server(port=0)

        token_path.write_text(creds.to_json(), encoding="utf-8")

    return creds


def upload_video(
    video_path: Path,
    title: str,
    description: str = "",
    tags: Optional[List[str]] = None,
    privacy_status: str = "unlisted",
    thumbnail_path: Optional[Path] = None,
    credentials_path: Optional[Path] = None,
    category_id: str = "22",  # People & Blogs
) -> str:
    """Upload video to YouTube and return video ID."""
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
    except ImportError:
        raise SystemExit(
            "[FAIL] Install: pip install google-api-python-client google-auth-oauthlib"
        )

    creds = _get_credentials(credentials_path)
    youtube = build("youtube", "v3", credentials=creds)

    body: Dict[str, Any] = {
        "snippet": {
            "title": title[:100],  # YouTube max 100 chars
            "description": description[:5000],  # YouTube max 5000 chars
            "tags": (tags or [])[:500],
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(
        str(video_path),
        mimetype="video/mp4",
        resumable=True,
        chunksize=10 * 1024 * 1024,  # 10MB chunks
    )

    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    print(f"[UPLOAD] uploading {video_path.name} ({video_path.stat().st_size / 1024 / 1024:.1f}MB)...")
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            print(f"[UPLOAD] {pct}%", end="\r")

    video_id = response["id"]
    print(f"\n[OK] uploaded: https://youtu.be/{video_id}")

    # Set thumbnail if provided
    if thumbnail_path and thumbnail_path.exists():
        try:
            youtube.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(str(thumbnail_path), mimetype="image/jpeg"),
            ).execute()
            print(f"[OK] thumbnail set for {video_id}")
        except Exception as exc:
            print(f"[WARN] thumbnail upload failed (may require channel verification): {exc}")

    return video_id


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload video to YouTube")
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", default="")
    parser.add_argument("--tags", default="", help="Comma-separated tags")
    parser.add_argument("--privacy", default="unlisted", choices=["unlisted", "public", "private"])
    parser.add_argument("--thumbnail", type=Path, default=None)
    parser.add_argument("--credentials", type=Path, default=None)
    args = parser.parse_args()

    if not args.video.exists():
        raise SystemExit(f"[FAIL] video not found: {args.video}")

    tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else []
    video_id = upload_video(
        video_path=args.video,
        title=args.title,
        description=args.description,
        tags=tags,
        privacy_status=args.privacy,
        thumbnail_path=args.thumbnail,
        credentials_path=args.credentials,
    )
    print(f"[OK] video_id: {video_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
