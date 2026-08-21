"""Local eSpeak NG fallback TTS provider."""

import subprocess

from app.core.config import settings
from app.services.tts.base import TTSProvider, get_audio_duration


class EspeakTTSProvider(TTSProvider):
    """Generate speech locally with eSpeak NG."""

    name = "espeak"
    output_extension = "wav"

    def synthesize_line(self, text: str, speaker: str, output_path: str) -> float:
        """Generate a WAV file for one podcast line using eSpeak NG."""
        voice = (
            settings.ESPEAK_TEACHER_VOICE
            if speaker == "HOST_ALEX"
            else settings.ESPEAK_STUDENT_VOICE
        )
        subprocess.run(
            [settings.ESPEAK_BINARY, "-v", voice, "-w", output_path, text],
            check=True,
            capture_output=True,
        )
        return get_audio_duration(output_path)
