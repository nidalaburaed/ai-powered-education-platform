"""Text-to-speech provider factory."""

from app.core.config import settings
from app.services.tts.base import TTSProvider


def get_tts_provider(provider_name: str | None = None) -> TTSProvider:
    """Return a configured text-to-speech provider by name."""
    provider = (provider_name or settings.TTS_PROVIDER).lower().strip()

    if provider == "piper":
        from app.services.tts.piper_provider import PiperTTSProvider

        return PiperTTSProvider()

    if provider == "elevenlabs":
        from app.services.tts.elevenlabs_provider import ElevenLabsTTSProvider

        return ElevenLabsTTSProvider()

    if provider == "espeak":
        from app.services.tts.espeak_provider import EspeakTTSProvider

        return EspeakTTSProvider()

    raise ValueError(
        f"Unsupported TTS provider '{provider}'. "
        "Expected one of: piper, elevenlabs, espeak."
    )
