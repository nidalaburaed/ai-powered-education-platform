import os
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from redis import Redis
from rq import Queue

from app.core.config import settings
from app.core.database import supabase
from app.core.security import get_current_user_id, security
from app.models.schemas import UploadResponse
from app.services.storage import upload_bytes_to_storage, ensure_bucket_exists

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".heic", ".webp"}
MAX_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


def get_queue() -> Queue:
    redis_conn = Redis.from_url(settings.REDIS_URL)
    return Queue("homework", connection=redis_conn)


@router.post("/upload", response_model=UploadResponse)
async def upload_homework(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {suffix} not supported. Use: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB")

    ensure_bucket_exists()

    # Upload original file to storage
    file_id = str(uuid.uuid4())
    storage_path = f"uploads/{user_id}/{file_id}{suffix}"
    content_type = "application/pdf" if suffix == ".pdf" else f"image/{suffix.lstrip('.')}"
    file_url = upload_bytes_to_storage(content, storage_path, content_type)

    # Create homework record
    hw_record = supabase.table("homework_uploads").insert({
        "user_id": user_id,
        "file_url": file_url,
        "file_name": file.filename,
        "status": "pending",
    }).execute()

    homework_id = hw_record.data[0]["id"]

    # Create job record
    job_record = supabase.table("jobs").insert({
        "homework_id": homework_id,
        "user_id": user_id,
        "status": "queued",
        "progress": 0,
    }).execute()

    job_id = job_record.data[0]["id"]

    # Enqueue background job
    queue = get_queue()
    queue.enqueue(
        "app.workers.pipeline.process_homework",
        job_timeout=settings.HOMEWORK_JOB_TIMEOUT_SECONDS,
        kwargs={
            "job_id": job_id,
            "homework_id": homework_id,
            "user_id": user_id,
            "file_url": file_url,
            "file_name": file.filename,
        },
    )

    return UploadResponse(job_id=job_id, homework_id=homework_id, status="queued")
