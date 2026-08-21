"""Local Piper TTS provider."""

import os
import subprocess

from app.core.config import settings
from app.services.tts.base import TTSProvider, get_audio_duration


class PiperTTSProvider(TTSProvider):
    """Generate speech locally with Piper voice models."""

    name = "piper"
    output_extension = "wav"

    def __init__(self) -> None:
        self.voice_map = {
            "HOST_ALEX": settings.PIPER_TEACHER_MODEL,
            "HOST_SAM": settings.PIPER_STUDENT_MODEL,
        }

    def synthesize_line(self, text: str, speaker: str, output_path: str) -> float:
        """Generate a WAV file for one podcast line using the configured Piper model."""
        model_path = self.voice_map.get(speaker, self.voice_map["HOST_ALEX"])
        if not model_path:
            raise RuntimeError(
                f"No Piper model configured for speaker '{speaker}'. "
                "Set PIPER_TEACHER_MODEL and PIPER_STUDENT_MODEL."
            )
        if not os.path.isfile(model_path):
            raise RuntimeError(
                f"Piper model not found at {model_path}. Download a Piper .onnx voice "
                "model or set TTS_PROVIDER=elevenlabs/espeak."
            )

        subprocess.run(
            [
                settings.PIPER_BINARY,
                "--model", model_path,
                "--output_file", output_path,
            ],
            input=text,
            text=True,
            check=True,
            capture_output=True,
        )
        return get_audio_duration(output_path)
