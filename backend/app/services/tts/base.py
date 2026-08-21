"""Shared helpers and interface for text-to-speech providers."""

from abc import ABC, abstractmethod
import subprocess


class TTSProvider(ABC):
    """Interface implemented by all podcast text-to-speech providers."""

    name: str
    output_extension: str = "wav"

    @abstractmethod
    def synthesize_line(self, text: str, speaker: str, output_path: str) -> float:
        """Generate audio for one script line and return its duration in seconds."""


def get_audio_duration(path: str) -> float:
    """Get duration of an audio file in seconds using ffprobe."""
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())
