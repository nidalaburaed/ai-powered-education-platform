"""
RQ worker pipeline — runs as a background job.
Each step updates the job status in Supabase.
"""
import os
import uuid
import shutil
from pathlib import Path

from app.core.config import settings
from app.core.database import supabase
from app.services.ocr import extract_content_from_image, extract_content_from_pdf_url
from app.services.script_generator import generate_podcast_script
from app.services.audio_generator import generate_all_audio
from app.services.video_renderer import render_video
from app.services.storage import upload_file_to_storage, ensure_bucket_exists


def _update_job(job_id: str, status: str, progress: int, error: str = None, video_id: str = None):
    update = {"status": status, "progress": progress}
    if error:
        update["error"] = error
    if video_id:
        update["video_id"] = video_id
    supabase.table("jobs").update(update).eq("id", job_id).execute()


def process_homework(job_id: str, homework_id: str, user_id: str, file_url: str, file_name: str):
    """
    Full pipeline: OCR → Script → Audio → Video → Upload → Done
    This function is executed by the RQ worker.
    """
    job_dir = os.path.join(settings.TEMP_DIR, f"job_{job_id}")
    os.makedirs(job_dir, exist_ok=True)

    try:
        ensure_bucket_exists()

        # ── Step 1: OCR ────────────────────────────────────────────────
        _update_job(job_id, "ocr", 10)
        suffix = Path(file_name).suffix.lower()

        if suffix == ".pdf":
            extracted = extract_content_from_pdf_url(file_url)
        else:
            # Download the image first
            import httpx
            img_path = os.path.join(job_dir, f"homework{suffix}")
            response = httpx.get(file_url, timeout=30)
            response.raise_for_status()
            with open(img_path, "wb") as f:
                f.write(response.content)
            extracted = extract_content_from_image(img_path)

        # ── Step 2: Script generation ──────────────────────────────────
        _update_job(job_id, "scripting", 25)
        script = generate_podcast_script(extracted)

        # ── Step 3: Audio generation ───────────────────────────────────
        _update_job(job_id, "audio", 45)
        script_with_timing, merged_audio_path = generate_all_audio(script, job_dir)

        # Upload audio to storage
        audio_storage_path = f"audio/{user_id}/{job_id}/podcast_audio.mp3"
        audio_url = upload_file_to_storage(merged_audio_path, audio_storage_path, "audio/mpeg")

        # ── Step 4: Video rendering ────────────────────────────────────
        _update_job(job_id, "video", 60)
        video_path = render_video(script_with_timing, merged_audio_path, job_dir)

        # ── Step 5: Upload video ───────────────────────────────────────
        _update_job(job_id, "uploading", 85)
        video_storage_path = f"videos/{user_id}/{job_id}/podcast_video.mp4"
        video_url = upload_file_to_storage(video_path, video_storage_path, "video/mp4")

        # Calculate total duration
        total_seconds = 0
        for seg in script_with_timing.segments:
            for line in seg.lines:
                if line.audio_start is not None and line.audio_duration is not None:
                    total_seconds = max(total_seconds, int(line.audio_start + line.audio_duration))

        # ── Step 6: Save to database ───────────────────────────────────
        import json

        video_record = supabase.table("podcast_videos").insert({
            "homework_id": homework_id,
            "user_id": user_id,
            "title": script_with_timing.title,
            "subject": script_with_timing.subject,
            "grade_level": script_with_timing.grade_level,
            "video_url": video_url,
            "audio_url": audio_url,
            "transcript": json.dumps([
                {"speaker": line.speaker, "text": line.text,
                 "start": line.audio_start, "duration": line.audio_duration}
                for seg in script_with_timing.segments
                for line in seg.lines
            ]),
            "flashcards": json.dumps([f.dict() for f in script_with_timing.flashcards]),
            "quiz": json.dumps([q.dict() for q in script_with_timing.quiz]),
            "duration_seconds": total_seconds,
        }).execute()

        video_id = video_record.data[0]["id"]

        # Update homework status
        supabase.table("homework_uploads").update({"status": "done"}).eq("id", homework_id).execute()

        _update_job(job_id, "done", 100, video_id=video_id)

    except Exception as e:
        _update_job(job_id, "failed", 0, error=str(e))
        supabase.table("homework_uploads").update({"status": "failed"}).eq("id", homework_id).execute()
        raise
    finally:
        # Clean up temp files
        try:
            shutil.rmtree(job_dir, ignore_errors=True)
        except Exception:
            pass
