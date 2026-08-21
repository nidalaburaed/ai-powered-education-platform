import json
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import supabase
from app.core.security import get_current_user_id
from app.models.schemas import VideoResponse

router = APIRouter()


def _parse_video(v: dict) -> VideoResponse:
    return VideoResponse(
        id=v["id"],
        title=v["title"] or "Untitled Podcast",
        subject=v["subject"] or "General",
        grade_level=v["grade_level"] or "Unknown",
        video_url=v["video_url"],
        audio_url=v.get("audio_url"),
        transcript=json.loads(v["transcript"]) if isinstance(v.get("transcript"), str) else v.get("transcript"),
        flashcards=json.loads(v["flashcards"]) if isinstance(v.get("flashcards"), str) else v.get("flashcards"),
        quiz=json.loads(v["quiz"]) if isinstance(v.get("quiz"), str) else v.get("quiz"),
        duration_seconds=v.get("duration_seconds"),
        created_at=str(v["created_at"]),
    )


@router.get("/", response_model=list[VideoResponse])
def list_videos(user_id: str = Depends(get_current_user_id)):
    result = (
        supabase.table("podcast_videos")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [_parse_video(v) for v in result.data]


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, user_id: str = Depends(get_current_user_id)):
    result = (
        supabase.table("podcast_videos")
        .select("*")
        .eq("id", video_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Video not found")

    return _parse_video(result.data)


@router.delete("/{video_id}")
def delete_video(video_id: str, user_id: str = Depends(get_current_user_id)):
    result = (
        supabase.table("podcast_videos")
        .select("id")
        .eq("id", video_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Video not found")

    supabase.table("podcast_videos").delete().eq("id", video_id).execute()
    return {"deleted": True}
