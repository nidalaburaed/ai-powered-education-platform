"""
AI Chat endpoint — lets users ask questions about a specific podcast video.
Claude answers in the context of the video's transcript and subject matter.
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from anthropic import Anthropic

from app.core.config import settings
from app.core.database import supabase
from app.core.security import get_current_user_id

router = APIRouter()
client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)


class ChatMessage(BaseModel):
    role: str       # "user" or "assistant"
    content: str


class AskRequest(BaseModel):
    video_id: str
    question: str
    history: Optional[List[ChatMessage]] = []


class AskResponse(BaseModel):
    answer: str


def _build_system_prompt(video: dict) -> str:
    title     = video.get("title", "Unknown")
    subject   = video.get("subject", "General")
    grade     = video.get("grade_level", "Unknown")
    transcript_raw = video.get("transcript", "[]")

    if isinstance(transcript_raw, str):
        transcript_lines = json.loads(transcript_raw)
    else:
        transcript_lines = transcript_raw or []

    transcript_text = "\n".join(
        f"{line.get('speaker','')}: {line.get('text','')}"
        for line in transcript_lines
    ) if transcript_lines else "No transcript available."

    return f"""You are a helpful, warm AI tutor for an educational platform called EduCast.

The student is asking questions about a podcast episode they just watched:
- Title: {title}
- Subject: {subject}
- Grade Level: {grade}

PODCAST TRANSCRIPT:
{transcript_text[:6000]}

Answer the student's question clearly and helpfully based on the content above.
- Keep answers concise (2-5 sentences for simple questions, more for complex ones).
- Use a friendly, encouraging tone — like a great teacher, not a textbook.
- If the answer isn't covered in the transcript, say so honestly and give a general answer.
- For math/science questions, show steps when helpful.
- Never make things up."""


@router.post("/ask", response_model=AskResponse)
def ask_question(
    req: AskRequest,
    user_id: str = Depends(get_current_user_id),
):
    # Fetch video (verify ownership)
    result = (
        supabase.table("podcast_videos")
        .select("title, subject, grade_level, transcript")
        .eq("id", req.video_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Video not found")

    system_prompt = _build_system_prompt(result.data)

    # Build message history for Claude
    messages = []
    for msg in (req.history or []):
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    # Add current question
    messages.append({"role": "user", "content": req.question})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )

    return AskResponse(answer=response.content[0].text)
