import type { ScriptLine } from "../types";

export const FPS = 30;
export const MIN_DURATION_SECONDS = 10;
export const TRAILING_PADDING_SECONDS = 1;

/**
 * Total duration in seconds based on the latest timed script line.
 */
export function totalDurationSeconds(lines: ScriptLine[]): number {
  if (lines.length === 0) {
    return MIN_DURATION_SECONDS;
  }

  return Math.max(
    ...lines.map((line) => (line.audio_start ?? 0) + (line.audio_duration ?? 2)),
  );
}

/**
 * Calculate the Remotion composition duration for a generated podcast.
 */
export function getDurationInFrames(lines: ScriptLine[], fps = FPS): number {
  const totalSeconds = totalDurationSeconds(lines);
  const durationWithPadding = totalSeconds + TRAILING_PADDING_SECONDS;
  return Math.max(Math.ceil(durationWithPadding * fps), fps * MIN_DURATION_SECONDS);
}
