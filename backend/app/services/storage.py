import os
from pathlib import Path
from app.core.database import supabase
from app.core.config import settings


def upload_file_to_storage(local_path: str, storage_path: str, content_type: str = "application/octet-stream") -> str:
    """Upload a local file to Supabase Storage and return its public URL."""
    with open(local_path, "rb") as f:
        data = f.read()

    supabase.storage.from_(settings.BUCKET_NAME).upload(
        path=storage_path,
        file=data,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    result = supabase.storage.from_(settings.BUCKET_NAME).get_public_url(storage_path)
    return result


def upload_bytes_to_storage(data: bytes, storage_path: str, content_type: str = "application/octet-stream") -> str:
    """Upload bytes to Supabase Storage and return its public URL."""
    supabase.storage.from_(settings.BUCKET_NAME).upload(
        path=storage_path,
        file=data,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    result = supabase.storage.from_(settings.BUCKET_NAME).get_public_url(storage_path)
    return result


def ensure_bucket_exists():
    """Create the storage bucket if it doesn't exist."""
    try:
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        if settings.BUCKET_NAME not in bucket_names:
            supabase.storage.create_bucket(
                settings.BUCKET_NAME,
                options={"public": True},
            )
    except Exception:
        pass  # Bucket may already exist
