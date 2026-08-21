"""ElevenLabs TTS provider kept as an optional premium fallback."""

from elevenlabs import save
from elevenlabs.client import ElevenLabs

from app.core.config import settings
from app.services.tts.base import TTSProvider, get_audio_duration


class ElevenLabsTTSProvider(TTSProvider):
    """Generate speech with ElevenLabs when explicitly selected."""

    name = "elevenlabs"
    output_extension = "mp3"

    def __init__(self) -> None:
        if not settings.ELEVENLABS_API_KEY:
            raise RuntimeError("ELEVENLABS_API_KEY is required when TTS_PROVIDER=elevenlabs.")
        self.client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        self.voice_map = {
            "HOST_ALEX": settings.ELEVENLABS_TEACHER_VOICE_ID,
            "HOST_SAM": settings.ELEVENLABS_STUDENT_VOICE_ID,
        }

    def synthesize_line(self, text: str, speaker: str, output_path: str) -> float:
        """Generate an MP3 file for one podcast line using ElevenLabs."""
        voice_id = self.voice_map.get(speaker, self.voice_map["HOST_ALEX"])
        if not voice_id:
            raise RuntimeError(f"No ElevenLabs voice ID configured for speaker '{speaker}'.")

        audio = self.client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )
        save(audio, output_path)
        return get_audio_duration(output_path)
