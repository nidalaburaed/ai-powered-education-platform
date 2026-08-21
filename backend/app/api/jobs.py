from fastapi import APIRouter, HTTPException, Depends
from app.core.database import supabase
from app.core.security import get_current_user_id
from app.models.schemas import JobStatusResponse

router = APIRouter()


@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, user_id: str = Depends(get_current_user_id)):
    result = supabase.table("jobs").select("*").eq("id", job_id).eq("user_id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = result.data
    return JobStatusResponse(
        job_id=job["id"],
        status=job["status"],
        progress=job["progress"],
        error=job.get("error"),
        video_id=job.get("video_id"),
    )


@router.get("/", response_model=list[JobStatusResponse])
def list_user_jobs(user_id: str = Depends(get_current_user_id)):
    result = (
        supabase.table("jobs")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return [
        JobStatusResponse(
            job_id=j["id"],
            status=j["status"],
            progress=j["progress"],
            error=j.get("error"),
            video_id=j.get("video_id"),
        )
        for j in result.data
    ]
