import type { ScriptLine } from "../types";

/**
 * Given the current time in seconds, find which script line is active.
 */
export function getCurrentLine(lines: ScriptLine[], currentTimeSec: number): ScriptLine | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const start = line.audio_start ?? 0;
    const duration = line.audio_duration ?? 2;
    if (currentTimeSec >= start && currentTimeSec < start + duration) {
      return line;
    }
  }
  return null;
}

/**
 * Convert seconds to frames at a given fps.
 */
export function secToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}
