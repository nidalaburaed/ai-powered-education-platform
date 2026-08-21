import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  ocr: "Reading homework...",
  scripting: "Writing podcast script...",
  audio: "Generating voices...",
  video: "Rendering video...",
  uploading: "Uploading...",
  done: "Done",
  failed: "Failed",
};

export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics:       "bg-gold-400/10 text-gold-300 border-gold-400/20",
  Physics:           "bg-clay-500/10 text-clay-300 border-clay-500/20",
  Chemistry:         "bg-sage-500/10 text-sage-300 border-sage-500/20",
  Biology:           "bg-sage-500/10 text-sage-400 border-sage-500/25",
  History:           "bg-gold-500/10 text-gold-200 border-gold-500/20",
  Geography:         "bg-sage-600/10 text-sage-300 border-sage-600/20",
  Economics:         "bg-clay-400/10 text-clay-300 border-clay-400/20",
  "Computer Science":"bg-gold-400/10 text-gold-300 border-gold-400/20",
  Philosophy:        "bg-clay-500/10 text-clay-400 border-clay-500/20",
  Language:          "bg-sage-500/10 text-sage-300 border-sage-500/20",
  Other:             "bg-parchment-600/10 text-parchment-400 border-parchment-600/20",
};
