import hashlib
import os
import shutil
import subprocess

from app.core.config import settings
from app.models.schemas import PodcastScript
from app.services.tts import get_tts_provider
from app.services.tts.base import TTSProvider, get_audio_duration


def _cache_key(provider: TTSProvider, speaker: str, text: str) -> str:
    """Build a stable cache key for repeated TTS requests."""
    voice_fingerprint = ""
    if hasattr(provider, "voice_map"):
        voice_fingerprint = str(getattr(provider, "voice_map").get(speaker, ""))
    raw_key = f"{provider.name}:{speaker}:{voice_fingerprint}:{text}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def _cache_path(provider: TTSProvider, speaker: str, text: str) -> str:
    """Return the cache path for a provider/speaker/text combination."""
    return os.path.join(
        settings.TTS_CACHE_DIR,
        f"{_cache_key(provider, speaker, text)}.{provider.output_extension}",
    )


def _synthesize_with_fallback(
    provider: TTSProvider,
    text: str,
    speaker: str,
    output_path: str,
) -> tuple[TTSProvider, float]:
    """Generate one line, falling back to a secondary free provider when configured."""
    try:
        return provider, provider.synthesize_line(text, speaker, output_path)
    except Exception:
        fallback_name = settings.TTS_FALLBACK_PROVIDER
        if not fallback_name or fallback_name.lower().strip() == provider.name:
            raise

        fallback_provider = get_tts_provider(fallback_name)
        fallback_output_path = os.path.splitext(output_path)[0] + f".{fallback_provider.output_extension}"
        duration = fallback_provider.synthesize_line(text, speaker, fallback_output_path)
        return fallback_provider, duration


def _generate_or_copy_cached_line(
    provider: TTSProvider,
    text: str,
    speaker: str,
    output_path: str,
) -> tuple[str, float]:
    """Generate one line of audio, reusing a persistent cache when enabled."""
    if not settings.TTS_CACHE_DIR:
        used_provider, duration = _synthesize_with_fallback(provider, text, speaker, output_path)
        used_path = output_path
        if used_provider.output_extension != provider.output_extension:
            used_path = os.path.splitext(output_path)[0] + f".{used_provider.output_extension}"
        return used_path, duration

    os.makedirs(settings.TTS_CACHE_DIR, exist_ok=True)
    cached_path = _cache_path(provider, speaker, text)

    if os.path.isfile(cached_path):
        shutil.copyfile(cached_path, output_path)
        return output_path, get_audio_duration(output_path)

    used_provider, duration = _synthesize_with_fallback(provider, text, speaker, output_path)
    used_path = output_path
    if used_provider.output_extension != provider.output_extension:
        used_path = os.path.splitext(output_path)[0] + f".{used_provider.output_extension}"
        cached_path = _cache_path(used_provider, speaker, text)

    shutil.copyfile(used_path, cached_path)
    return used_path, duration


def generate_all_audio(script: PodcastScript, job_dir: str) -> tuple[PodcastScript, str]:
    """
    Generate audio for every line in the script.
    Returns the script with timing data + path to merged audio file.
    """
    provider = get_tts_provider()
    audio_dir = os.path.join(job_dir, "audio_lines")
    os.makedirs(audio_dir, exist_ok=True)

    line_files = []
    current_time = 0.0
    line_index = 0

    for segment in script.segments:
        for line in segment.lines:
            audio_path = os.path.join(
                audio_dir,
                f"line_{line_index:04d}.{provider.output_extension}",
            )
            audio_path, duration = _generate_or_copy_cached_line(
                provider,
                line.text,
                line.speaker,
                audio_path,
            )

            line.audio_start = current_time
            line.audio_duration = duration

            line_files.append(audio_path)
            current_time += duration
            line_index += 1

    merged_path = os.path.join(job_dir, "podcast_audio.mp3")
    _merge_audio_files(line_files, merged_path)

    return script, merged_path


def _merge_audio_files(file_paths: list[str], output_path: str) -> None:
    """Concatenate line audio and encode a normalized MP3 podcast track."""
    concat_list = os.path.join(os.path.dirname(output_path), "concat_list.txt")
    with open(concat_list, "w") as f:
        for path in file_paths:
            safe_path = path.replace("'", "'\\''")
            f.write(f"file '{safe_path}'\n")

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list,
            "-af", "loudnorm=I=-16:LRA=11:TP=-1.5",
            "-codec:a", "libmp3lame",
            "-b:a", "128k",
            output_path,
        ],
        check=True,
        capture_output=True,
    )
