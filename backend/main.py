import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import homework, jobs, videos, chat

os.makedirs(settings.TEMP_DIR, exist_ok=True)

app = FastAPI(
    title="ai Education API",
    description="Homework to educational podcast video platform",
    version="1.0.0",
)

allow_origins = [settings.FRONTEND_URL]

# Allow localhost:3000 as a fallback for local development
if "localhost" not in settings.FRONTEND_URL:
    allow_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(homework.router, prefix="/api/homework", tags=["homework"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(chat.router,   prefix="/api/chat",   tags=["chat"])



@app.get("/health")
def health():
    return {"status": "ok"}
