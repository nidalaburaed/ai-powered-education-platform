from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ScriptLine(BaseModel):
    speaker: str  # HOST_ALEX or HOST_SAM
    text: str
    visual_cue: str  # show_text | show_equation | show_chart | show_list
    equation: Optional[str] = None
    chart_data: Optional[dict] = None
    bullet_points: Optional[List[str]] = None
    # Populated after audio generation
    audio_start: Optional[float] = None
    audio_duration: Optional[float] = None


class ScriptSegment(BaseModel):
    id: str
    type: str  # hook | concept | example | mistake | recap
    lines: List[ScriptLine]


class Flashcard(BaseModel):
    question: str
    answer: str


class QuizOption(BaseModel):
    text: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int
    explanation: str


class PodcastScript(BaseModel):
    title: str
    subject: str
    grade_level: str
    duration_estimate: str
    segments: List[ScriptSegment]
    flashcards: List[Flashcard]
    quiz: List[QuizQuestion]


class ExtractedContent(BaseModel):
    subject: str
    grade_level: str
    topics: List[str]
    questions: List[str]
    equations: List[str]
    key_concepts: List[str]
    raw_text: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    error: Optional[str] = None
    video_id: Optional[str] = None


class VideoResponse(BaseModel):
    id: str
    title: str
    subject: str
    grade_level: str
    video_url: str
    audio_url: Optional[str] = None
    transcript: Optional[Any] = None
    flashcards: Optional[Any] = None
    quiz: Optional[Any] = None
    duration_seconds: Optional[int] = None
    created_at: str


class UploadResponse(BaseModel):
    job_id: str
    homework_id: str
    status: str
