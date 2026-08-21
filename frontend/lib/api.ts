import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeader();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Homework ──────────────────────────────────────────────────────────────────

export interface UploadResponse {
  job_id: string;
  homework_id: string;
  status: string;
}

export async function uploadHomework(file: File): Promise<UploadResponse> {
  const authHeaders = await getAuthHeader();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/homework/upload`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface JobStatus {
  job_id: string;
  status: string;
  progress: number;
  error?: string;
  video_id?: string;
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  return apiFetch<JobStatus>(`/api/jobs/${jobId}`);
}

export async function listJobs(): Promise<JobStatus[]> {
  return apiFetch<JobStatus[]>("/api/jobs/");
}

// ── Videos ───────────────────────────────────────────────────────────────────

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  start: number;
  duration: number;
}

export interface Video {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  video_url: string;
  audio_url?: string;
  transcript?: TranscriptLine[];
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  duration_seconds?: number;
  created_at: string;
}

export async function listVideos(): Promise<Video[]> {
  return apiFetch<Video[]>("/api/videos/");
}

export async function getVideo(videoId: string): Promise<Video> {
  return apiFetch<Video>(`/api/videos/${videoId}`);
}

export async function deleteVideo(videoId: string): Promise<void> {
  await apiFetch(`/api/videos/${videoId}`, { method: "DELETE" });
}

// ── Polling helper ────────────────────────────────────────────────────────────

export function pollJobStatus(
  jobId: string,
  onUpdate: (status: JobStatus) => void,
  intervalMs = 3000
): () => void {
  const id = setInterval(async () => {
    try {
      const status = await getJobStatus(jobId);
      onUpdate(status);
      if (status.status === "done" || status.status === "failed") {
        clearInterval(id);
      }
    } catch {
      // Continue polling on transient errors
    }
  }, intervalMs);

  return () => clearInterval(id);
}

// ── AI Chat ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AskResponse {
  answer: string;
}

export async function askQuestion(
  videoId: string,
  question: string,
  history: ChatMessage[] = []
): Promise<AskResponse> {
  return apiFetch<AskResponse>("/api/chat/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId, question, history }),
  });
}

// ── Notes (localStorage) ──────────────────────────────────────────────────────

export interface Note {
  id: string;
  text: string;
  timestamp: number;        // video playback time in seconds (0 if not applicable)
  createdAt: string;        // ISO date string
}

export function getNotes(videoId: string): Note[] {
  try {
    const raw = localStorage.getItem(`notes_${videoId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNote(videoId: string, text: string, timestamp = 0): Note {
  const notes = getNotes(videoId);
  const note: Note = {
    id: crypto.randomUUID(),
    text,
    timestamp,
    createdAt: new Date().toISOString(),
  };
  notes.unshift(note);
  localStorage.setItem(`notes_${videoId}`, JSON.stringify(notes));
  return note;
}

export function deleteNote(videoId: string, noteId: string): void {
  const notes = getNotes(videoId).filter((n) => n.id !== noteId);
  localStorage.setItem(`notes_${videoId}`, JSON.stringify(notes));
}

export function exportNotes(videoTitle: string, notes: Note[]): void {
  const lines = [
    `Notes: ${videoTitle}`,
    `Exported: ${new Date().toLocaleDateString()}`,
    "─".repeat(50),
    "",
    ...notes.map((n) => {
      const ts = n.timestamp > 0 ? `[${Math.floor(n.timestamp / 60)}:${String(Math.floor(n.timestamp % 60)).padStart(2, "0")}] ` : "";
      return `${ts}${n.text}\n  — ${new Date(n.createdAt).toLocaleString()}`;
    }),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `notes-${videoTitle.replace(/\s+/g, "-").toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Quiz scores (localStorage) ────────────────────────────────────────────────

export interface QuizScore {
  videoId: string;
  videoTitle: string;
  subject: string;
  score: number;
  total: number;
  date: string;
}

export function saveQuizScore(score: QuizScore): void {
  const scores = getQuizScores();
  scores.unshift(score);
  // Keep last 100 scores
  localStorage.setItem("quiz_scores", JSON.stringify(scores.slice(0, 100)));
}

export function getQuizScores(): QuizScore[] {
  try {
    const raw = localStorage.getItem("quiz_scores");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Flashcard progress (localStorage) ────────────────────────────────────────

export interface FlashcardProgress {
  known: number[];
  learning: number[];
}

export function getFlashcardProgress(videoId: string): FlashcardProgress {
  try {
    const raw = localStorage.getItem(`flashcards_${videoId}`);
    return raw ? JSON.parse(raw) : { known: [], learning: [] };
  } catch {
    return { known: [], learning: [] };
  }
}

export function saveFlashcardProgress(videoId: string, progress: FlashcardProgress): void {
  localStorage.setItem(`flashcards_${videoId}`, JSON.stringify(progress));
}

export function clearFlashcardProgress(videoId: string): void {
  localStorage.removeItem(`flashcards_${videoId}`);
}

// ── Study streak (localStorage) ───────────────────────────────────────────────

export function recordStudyDay(): void {
  const today = new Date().toISOString().split("T")[0];
  const raw   = localStorage.getItem("study_days");
  const days: string[] = raw ? JSON.parse(raw) : [];
  if (!days.includes(today)) {
    days.unshift(today);
    localStorage.setItem("study_days", JSON.stringify(days.slice(0, 365)));
  }
}

export function getStudyStreak(): number {
  const raw  = localStorage.getItem("study_days");
  const days: string[] = raw ? JSON.parse(raw) : [];
  if (days.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (days.includes(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getStudyDays(): string[] {
  try {
    const raw = localStorage.getItem("study_days");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
