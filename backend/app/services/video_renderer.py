import os
import json
import shutil
import subprocess
from urllib.parse import urlparse

from app.core.config import settings
from app.models.schemas import PodcastScript


def build_render_props(script: PodcastScript, audio_url: str) -> dict:
    """Build the props object that Remotion will use to render the video."""
    lines = []
    for segment in script.segments:
        for line in segment.lines:
            lines.append({
                "speaker": line.speaker,
                "text": line.text,
                "visual_cue": line.visual_cue,
                "equation": line.equation,
                "chart_data": line.chart_data,
                "bullet_points": line.bullet_points,
                "audio_start": line.audio_start,
                "audio_duration": line.audio_duration,
            })

    return {
        "title": script.title,
        "subject": script.subject,
        "grade_level": script.grade_level,
        "audio_url": audio_url,
        "lines": lines,
        "flashcards": [f.dict() for f in script.flashcards],
        "quiz": [q.dict() for q in script.quiz],
    }


def _verify_remotion_install(remotion_dir: str) -> None:
    """Fail fast with an actionable error if the Remotion workspace is missing dependencies."""
    package_json_path = os.path.join(remotion_dir, "package.json")
    remotion_bin_path = os.path.join(remotion_dir, "node_modules", ".bin", "remotion")

    if not os.path.isdir(remotion_dir):
        raise RuntimeError(
            f"Remotion directory does not exist: {remotion_dir}. "
            "Set REMOTION_DIR to the video-renderer directory."
        )

    if not os.path.isfile(package_json_path):
        raise RuntimeError(
            f"Remotion package.json was not found in {remotion_dir}. "
            "Set REMOTION_DIR to the video-renderer directory."
        )

    if not os.path.isfile(remotion_bin_path):
        raise RuntimeError(
            "Remotion CLI is not installed. Run `npm install` in the video-renderer "
            "directory, then rebuild/restart the backend and worker containers."
        )


def _is_remote_url(src: str) -> bool:
    parsed = urlparse(src)
    return parsed.scheme in {"http", "https"}


def _prepare_local_audio_asset(
    audio_path: str,
    remotion_dir: str,
    job_dir: str,
) -> tuple[str, str | None]:
    """
    Copy generated audio into Remotion's public directory and return a staticFile path.

    Remotion can render remote audio URLs, but doing so inside Docker makes every
    render depend on external storage latency and availability. Using the local
    MP3 that was already generated for this job keeps the render self-contained.
    """
    if not audio_path or _is_remote_url(audio_path):
        return audio_path, None

    if not os.path.isfile(audio_path):
        raise RuntimeError(f"Generated podcast audio file was not found: {audio_path}")

    job_name = os.path.basename(os.path.normpath(job_dir)) or "job"
    extension = os.path.splitext(audio_path)[1] or ".mp3"
    public_asset_dir = os.path.join(remotion_dir, "public", "generated-audio", job_name)
    os.makedirs(public_asset_dir, exist_ok=True)

    public_audio_path = os.path.join(public_asset_dir, f"podcast_audio{extension}")
    shutil.copyfile(audio_path, public_audio_path)

    remotion_static_path = f"generated-audio/{job_name}/podcast_audio{extension}"
    return remotion_static_path, public_asset_dir


def render_video(script: PodcastScript, audio_src: str, job_dir: str) -> str:
    """
    Render the podcast video using Remotion CLI.
    Returns the path to the rendered MP4 file.
    """
    output_path = os.path.join(job_dir, "podcast_video.mp4")
    remotion_dir = os.path.abspath(settings.REMOTION_DIR)
    _verify_remotion_install(remotion_dir)

    remotion_audio_src, public_asset_dir = _prepare_local_audio_asset(
        audio_src,
        remotion_dir,
        job_dir,
    )
    props = build_render_props(script, remotion_audio_src)

    props_path = os.path.join(job_dir, "render_props.json")
    with open(props_path, "w") as f:
        json.dump(props, f)

    # The Remotion composition calculates its own duration from the timed
    # script props. Do not pass --frames here: Remotion validates that the
    # requested frame range already fits inside the composition duration.

    try:
        result = subprocess.run(
            [
                "npm", "exec", "--", "remotion", "render",
                "src/index.ts",
                "HomeworkPodcast",
                output_path,
                f"--props={props_path}",
            ],
            cwd=remotion_dir,
            stderr=subprocess.PIPE,
            text=True,
            timeout=settings.REMOTION_RENDER_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(
            "Remotion render timed out after "
            f"{settings.REMOTION_RENDER_TIMEOUT_SECONDS} seconds. "
            "This usually means video rendering is too slow for the generated podcast length "
            "or the renderer is waiting on an audio asset. Try increasing "
            "REMOTION_RENDER_TIMEOUT_SECONDS, reducing the generated script length, or checking "
            "the worker container CPU/memory."
        ) from exc
    finally:
        if public_asset_dir:
            shutil.rmtree(public_asset_dir, ignore_errors=True)

    if result.returncode != 0:
        raise RuntimeError(f"Remotion render failed: {result.stderr}")

    return output_path
