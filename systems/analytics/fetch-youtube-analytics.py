#!/usr/bin/env python3
"""Fetch YouTube channel analytics and save weekly metrics.

Reuses credentials from the existing youtube_upload.py pipeline
(~/.youtube_credentials.json or ~/.youtube_upload_token.json).

Requires:
    pip install google-api-python-client google-auth-oauthlib

Usage:
    python systems/analytics/fetch-youtube-analytics.py
    python systems/analytics/fetch-youtube-analytics.py --week 2026-w10
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = ROOT / "systems" / "analytics" / "youtube"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
]


def get_credentials():
    """Get or refresh YouTube API credentials."""
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        raise SystemExit(
            "[FAIL] Install: pip install google-api-python-client google-auth-oauthlib"
        )

    token_path = Path.home() / ".youtube_analytics_token.json"
    creds = None

    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            from google.auth.transport.requests import Request
            creds.refresh(Request())
        else:
            # Look for credentials file in standard locations
            cred_file = None
            for candidate in [
                Path("credentials.json"),
                Path.home() / ".youtube_credentials.json",
            ]:
                if candidate.exists():
                    cred_file = candidate
                    break

            if not cred_file:
                raise SystemExit(
                    "[FAIL] No credentials.json found. "
                    "Download from Google Cloud Console → ~/.youtube_credentials.json"
                )

            flow = InstalledAppFlow.from_client_secrets_file(str(cred_file), SCOPES)
            creds = flow.run_local_server(port=0)

        token_path.write_text(creds.to_json())

    return creds


def get_iso_week(dt: datetime) -> str:
    """Return ISO week string like '2026-w10'."""
    iso = dt.isocalendar()
    return f"{iso[0]}-w{iso[1]:02d}"


def fetch_channel_videos(youtube) -> list[dict[str, Any]]:
    """Fetch all videos from the authenticated user's channel."""
    videos = []

    # Get uploads playlist
    channels_resp = youtube.channels().list(
        part="contentDetails",
        mine=True,
    ).execute()

    if not channels_resp.get("items"):
        print("[WARN] No channel found for authenticated user")
        return videos

    uploads_id = channels_resp["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # Paginate through uploads
    next_page = None
    while True:
        playlist_resp = youtube.playlistItems().list(
            part="contentDetails,snippet",
            playlistId=uploads_id,
            maxResults=50,
            pageToken=next_page,
        ).execute()

        for item in playlist_resp.get("items", []):
            videos.append({
                "video_id": item["contentDetails"]["videoId"],
                "title": item["snippet"]["title"],
                "published_at": item["snippet"]["publishedAt"],
            })

        next_page = playlist_resp.get("nextPageToken")
        if not next_page:
            break

    return videos


def fetch_video_stats(youtube, video_ids: list[str]) -> dict[str, dict]:
    """Fetch statistics for a batch of video IDs."""
    stats = {}

    # YouTube API: max 50 IDs per request
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i : i + 50]
        resp = youtube.videos().list(
            part="statistics",
            id=",".join(batch),
        ).execute()

        for item in resp.get("items", []):
            s = item["statistics"]
            stats[item["id"]] = {
                "view_count": int(s.get("viewCount", 0)),
                "like_count": int(s.get("likeCount", 0)),
                "comment_count": int(s.get("commentCount", 0)),
                "favorite_count": int(s.get("favoriteCount", 0)),
            }

    return stats


def main():
    parser = argparse.ArgumentParser(description="Fetch YouTube analytics")
    parser.add_argument("--week", help="Target week (e.g. 2026-w10). Default: current week.")
    args = parser.parse_args()

    target_week = args.week or get_iso_week(datetime.now(timezone.utc))

    try:
        from googleapiclient.discovery import build
    except ImportError:
        raise SystemExit("[FAIL] Install: pip install google-api-python-client")

    creds = get_credentials()
    youtube = build("youtube", "v3", credentials=creds)

    print(f"[INFO] Fetching channel videos...")
    videos = fetch_channel_videos(youtube)
    print(f"[INFO] Found {len(videos)} videos")

    if not videos:
        print("[INFO] No videos to analyze")
        return

    # Fetch stats
    video_ids = [v["video_id"] for v in videos]
    print(f"[INFO] Fetching statistics...")
    stats = fetch_video_stats(youtube, video_ids)

    # Build per-video metrics
    metrics = []
    for v in videos:
        vid = v["video_id"]
        s = stats.get(vid, {})
        metrics.append({
            "video_id": vid,
            "title": v["title"],
            "published_at": v["published_at"],
            "view_count": s.get("view_count", 0),
            "like_count": s.get("like_count", 0),
            "comment_count": s.get("comment_count", 0),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        })

    # Write output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{target_week}-metrics.json"

    report = {
        "week": target_week,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "total_videos": len(metrics),
        "videos": metrics,
    }

    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"[INFO] Wrote {out_path} ({len(metrics)} videos)")


if __name__ == "__main__":
    main()
