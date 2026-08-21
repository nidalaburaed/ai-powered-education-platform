from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Anthropic
    ANTHROPIC_API_KEY: str

    # Text-to-speech
    TTS_PROVIDER: str = "piper"  # piper | elevenlabs | espeak
    TTS_FALLBACK_PROVIDER: str | None = "espeak"
    TTS_CACHE_DIR: str | None = None

    # Piper (free/local)
    PIPER_BINARY: str = "piper"
    PIPER_TEACHER_MODEL: str | None = None
    PIPER_STUDENT_MODEL: str | None = None

    # eSpeak NG (free/local fallback)
    ESPEAK_BINARY: str = "espeak-ng"
    ESPEAK_TEACHER_VOICE: str = "en-us+m3"
    ESPEAK_STUDENT_VOICE: str = "en-us+f3"

    # ElevenLabs (optional premium fallback)
    ELEVENLABS_API_KEY: str | None = None
    ELEVENLABS_TEACHER_VOICE_ID: str | None = "pNInz6obpgDQGcFmaJgB"
    ELEVENLABS_STUDENT_VOICE_ID: str | None = "hpp4J3VqNfWAUOO0d1Us"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    SUPABASE_JWT_SECRET: str | None = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # App
    BUCKET_NAME: str = "homework-videos"
    REMOTION_DIR: str = "../video-renderer"
    REMOTION_RENDER_TIMEOUT_SECONDS: int = 1800
    HOMEWORK_JOB_TIMEOUT_SECONDS: int = 2400
    TEMP_DIR: str = "/tmp/ai-edu"
    MAX_FILE_SIZE_MB: int = 50
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
