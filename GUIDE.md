# EduCast — Full Feature Guide

> AI-powered education platform that turns homework into podcast videos.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Running the Project](#2-running-the-project)
3. [Pages Reference](#3-pages-reference)
4. [Feature Deep-Dives](#4-feature-deep-dives)
5. [Backend API Reference](#5-backend-api-reference)
6. [Frontend API Client](#6-frontend-api-client)
7. [Data Storage](#7-data-storage)
8. [Design System](#8-design-system)
9. [Adding New Features](#9-adding-new-features)
10. [Environment Variables](#10-environment-variables)

---

## 1. Architecture Overview

```
EduCast/
├── frontend/          # Next.js 14 (App Router) + Tailwind CSS
├── backend/           # FastAPI + RQ (Redis Queue) workers
│   ├── app/api/       # HTTP route handlers
│   ├── app/services/  # OCR, script generation, audio, video, storage
│   ├── app/workers/   # Background pipeline (RQ)
│   └── app/core/      # Config, DB, security
├── video-renderer/    # Remotion video renderer (Node.js)
└── GUIDE.md           # This file
```

### Request flow

```
Browser → Next.js → FastAPI → Redis Queue → RQ Worker
                                               │
                          OCR (Claude vision) ─┤
                          Script (Claude)      ─┤
                          Audio (TTS provider) ─┤
                          Video (Remotion)     ─┤
                          Upload (Supabase)    ─┘
                                               │
                          Supabase DB ←────────┘
                          ↓
                        Browser polls job status → redirect to /video/[id]
```

---

## 2. Running the Project

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or 20 (via nvm) |
| Python | 3.11+ |
| Redis | Running on localhost:6379 |

### Frontend

```bash
# Activate correct Node version (required every new terminal)
source ~/.nvm/nvm.sh && nvm use 18

cd frontend
npm install
npm run dev          # → http://localhost:3000
```

> **Tip:** Add `source ~/.nvm/nvm.sh` to your `~/.bashrc` so it loads automatically.

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Worker (RQ)

In a **separate terminal**:

```bash
cd backend
rq worker homework
```

The worker must be running for podcast generation to work. It picks up jobs from Redis and runs the full OCR → Script → Audio → Video pipeline.

### Video Renderer (Remotion)

```bash
cd video-renderer
npm install
# The backend calls this automatically via subprocess
```

---

## 3. Pages Reference

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Landing page — hero, how it works, features, pricing |
| `/auth` | No | Sign in / Sign up (split layout) |
| `/dashboard` | Yes | Video library with search, filter, sort |
| `/upload` | Yes | Upload homework → generates podcast |
| `/video/[id]` | Yes | Watch + Transcript + Flashcards + Quiz + Notes + Ask AI |
| `/subjects` | Yes | Browse all videos grouped by subject |
| `/stats` | Yes | Learning stats, heatmap, quiz history |
| `/settings` | Yes | Display name, language preference, local data |

---

## 4. Feature Deep-Dives

### 4.1 Podcast Generation Pipeline

1. **Upload** — User uploads PDF / JPG / PNG / HEIC / WEBP (max 50 MB).
2. **OCR** — Claude Vision extracts subject, grade level, concepts, equations, and raw text.
3. **Script** — Claude writes a two-host podcast script:
   - **HOST_ALEX** — experienced, enthusiastic teacher
   - **HOST_SAM** — curious student who asks questions
   - Segments: `hook → concept → example → mistake → recap`
4. **Audio** — the configured TTS provider (`piper`, `espeak`, or optional `elevenlabs`) generates two distinct voices and merges them into a single MP3.
5. **Video** — Remotion renders a video syncing visuals (equations, bullet points, charts) to the audio.
6. **Upload** — Video and audio uploaded to Supabase Storage.
7. **Done** — Job marked `done`, user redirected to `/video/[id]`.

---

### 4.2 Video Page Tabs

| Tab | Description |
|-----|-------------|
| **Watch** | Custom video player with amber progress bar, download, fullscreen |
| **Transcript** | Full dialogue with speaker colour-coding (gold = Alex, sage = Sam) |
| **Flashcards** | Flip-card study mode with "Know it / Still learning" sorting |
| **Quiz** | Multiple-choice with instant colour feedback and explanations |
| **Notes** | Personal notes with optional video timestamp stamping + export |
| **Ask AI** | Live chat with Claude, grounded in the video transcript |

---

### 4.3 Flashcards — Know It / Still Learning

Cards are split into two buckets as you study:

- **Know it** (green) — cards you understand
- **Still learning** (red) — cards to review again

Progress is saved to `localStorage` per video. When you finish a round, a summary screen shows your score and lets you review only the "still learning" cards.

Dot indicators in the navigation bar change colour:
- Gold = current card
- Green = known
- Red = still learning

---

### 4.4 Notes

- Write freeform notes while watching.
- Enable **Stamp time** to attach the current video playback position to a note.
- Timestamped notes display a clickable badge (e.g. `2:34`).
- **Export** downloads all notes for the video as a `.txt` file.
- Notes are stored in `localStorage` under the key `notes_{videoId}`.
- Shortcut: `Ctrl+Enter` to save a note.

---

### 4.5 Ask AI

- Sends your question + the video's full transcript to Claude.
- Supports multi-turn conversation (chat history is kept in component state).
- Quick-suggestion chips for common questions.
- `Enter` to send, `Shift+Enter` for a new line.
- Powered by `POST /api/chat/ask`.

---

### 4.6 Dashboard — Search, Filter & Sort

**Search:** Full-text search on video title and subject. Clears with the × button.

**Subject chips:** Filter to one subject at a time. Click again to deselect.

**Sort dropdown:**
- Newest first (default)
- Oldest first
- By subject (alphabetical)
- Longest first (by duration)

Result count updates dynamically. "Clear filters" resets both search and subject.

---

### 4.7 Stats Page (`/stats`)

| Section | Data source |
|---------|-------------|
| Videos watched | Supabase `podcast_videos` table |
| Total watch time | Sum of `duration_seconds` |
| Study streak | `localStorage` — `study_days` key |
| Avg quiz score | `localStorage` — `quiz_scores` key |
| Subject breakdown | Bar chart from video subjects |
| Study heatmap | 52-week grid from `study_days` |
| Quiz history | Last 20 scores with % badge |

Study days are recorded automatically every time you visit `/dashboard` or `/video/[id]`.

---

### 4.8 Settings Page (`/settings`)

| Field | Stored in |
|-------|-----------|
| Display name | Supabase `auth.users.user_metadata.display_name` |
| Preferred language | Supabase `auth.users.user_metadata.preferred_language` |
| Local data (notes, flashcard progress, quiz scores) | `localStorage` |

The language setting is intended to be read by the backend's script generator to produce podcasts in the user's preferred language (requires backend integration — see §9).

---

## 5. Backend API Reference

Base URL: `http://localhost:8000`

All authenticated routes require `Authorization: Bearer <supabase_access_token>`.

### Homework

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/homework/upload` | Upload a homework file. Returns `{ job_id, homework_id, status }` |

**Request:** `multipart/form-data` with field `file`.

---

### Jobs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/jobs/{job_id}` | Get job status and progress |
| `GET` | `/api/jobs/` | List all jobs for the current user |

**Job status values:** `queued → ocr → scripting → audio → video → uploading → done / failed`

**Response:**
```json
{
  "job_id": "uuid",
  "status": "scripting",
  "progress": 35,
  "video_id": null,
  "error": null
}
```

---

### Videos

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/videos/` | List all videos for the current user |
| `GET` | `/api/videos/{video_id}` | Get a single video with full data |
| `DELETE` | `/api/videos/{video_id}` | Delete a video |

**Video response includes:** `id, title, subject, grade_level, video_url, audio_url, transcript, flashcards, quiz, duration_seconds, created_at`

---

### Chat (AI)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat/ask` | Ask Claude a question about a video |

**Request body:**
```json
{
  "video_id": "uuid",
  "question": "What is the quadratic formula?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{ "answer": "The quadratic formula is..." }
```

Claude answers using the video's transcript as context. The `history` array enables multi-turn conversations.

---

## 6. Frontend API Client

All functions are in `frontend/lib/api.ts`.

### Video functions
```ts
listVideos()                    // → Video[]
getVideo(videoId)               // → Video
deleteVideo(videoId)            // → void
uploadHomework(file)            // → { job_id, homework_id, status }
getJobStatus(jobId)             // → JobStatus
pollJobStatus(jobId, callback)  // → stopFn — polls every 3s
```

### AI Chat
```ts
askQuestion(videoId, question, history?)  // → { answer: string }
```

### Notes (localStorage)
```ts
getNotes(videoId)                     // → Note[]
saveNote(videoId, text, timestamp?)   // → Note
deleteNote(videoId, noteId)           // → void
exportNotes(videoTitle, notes)        // downloads .txt file
```

### Quiz scores (localStorage)
```ts
saveQuizScore(score)   // saves to quiz_scores
getQuizScores()        // → QuizScore[]
```

### Flashcard progress (localStorage)
```ts
getFlashcardProgress(videoId)          // → { known: number[], learning: number[] }
saveFlashcardProgress(videoId, prog)   // saves
clearFlashcardProgress(videoId)        // removes
```

### Study streak (localStorage)
```ts
recordStudyDay()    // call on page visit to track streak
getStudyStreak()    // → number of consecutive days
getStudyDays()      // → string[] of ISO date strings
```

---

## 7. Data Storage

### Supabase (server-side, persistent)

| Table | Description |
|-------|-------------|
| `homework_uploads` | Original file uploads and their processing status |
| `jobs` | Background job status, progress, error, video_id |
| `podcast_videos` | Generated videos with transcript, flashcards, quiz |

**Storage buckets:**
- `homework-videos` — contains `uploads/`, `audio/`, `videos/` folders

### localStorage (client-side, per browser)

| Key | Content |
|-----|---------|
| `notes_{videoId}` | Array of Note objects |
| `flashcards_{videoId}` | `{ known: number[], learning: number[] }` |
| `quiz_scores` | Array of QuizScore objects (last 100) |
| `study_days` | Array of ISO date strings (last 365 days) |

> **Note:** localStorage data is private to the user's browser. It is not synced across devices. A future enhancement could persist this to Supabase.

---

## 8. Design System

### Fonts
| Role | Font |
|------|------|
| Display / headings | DM Serif Display |
| Body | Plus Jakarta Sans |
| Code / metadata | JetBrains Mono |

### Color palette

| Token | Hex | Usage |
|-------|-----|-------|
| `ink-900` | `#16120e` | Page background |
| `gold-400` | `#e8a838` | Primary accent, CTAs |
| `clay-500` | `#c96442` | Secondary accent, error states |
| `sage-500` | `#7ea87e` | Tertiary accent, success states |
| `parchment-100` | `#fdf6e3` | Primary text |
| `parchment-500` | `#a89070` | Muted text |

### CSS utility classes (globals.css)

| Class | Description |
|-------|-------------|
| `.btn-gold` | Primary amber CTA button with gradient |
| `.btn-ghost` | Outline/ghost button |
| `.paper-card` | Warm surface card with hover lift |
| `.glass` | Dark glass-morphism panel |
| `.input-warm` | Warm text input with gold focus ring |
| `.tab-warm` | Navigation tab with active state |
| `.section-label` | Small uppercase amber pill label |
| `.squiggle` | Animated squiggle underline (hero) |
| `.dot-grid` | Amber dot grid background pattern |
| `.ornament-divider` | Decorative horizontal rule with text |
| `.step-num` | Numbered circle for step indicators |
| `.text-warm` | Gold→amber→clay text gradient |

---

## 9. Adding New Features

### Add a new backend route

1. Create `backend/app/api/myfeature.py` with a FastAPI `APIRouter`.
2. Register it in `backend/main.py`:
   ```python
   from app.api import myfeature
   app.include_router(myfeature.router, prefix="/api/myfeature", tags=["myfeature"])
   ```
3. Add the frontend function to `frontend/lib/api.ts`.

### Add a new page

1. Create `frontend/app/mypage/page.tsx` with `"use client"`.
2. Use `Navbar` at the top and wrap content in `bg-ink-900 min-h-screen`.
3. Add the route to `Navbar.tsx` if it should appear in navigation.

### Persist Notes/Flashcards to Supabase

Currently these live in `localStorage`. To sync across devices:

1. Add a `user_notes` table to Supabase with columns: `id, user_id, video_id, text, timestamp, created_at`.
2. Add `GET /api/notes/{video_id}` and `POST /api/notes` endpoints.
3. Replace `getNotes` / `saveNote` in `api.ts` with `apiFetch` calls.

### Add language support to pipeline

The settings page saves `preferred_language` to Supabase user metadata. To use it:

1. In `backend/app/api/homework.py`, fetch the user's metadata after auth.
2. Pass `language` to `generate_podcast_script(extracted, language=language)`.
3. Update the `SCRIPT_PROMPT` in `script_generator.py` to include language instruction.

---

## 10. Environment Variables

### Backend (`backend/.env`)

```env
ANTHROPIC_API_KEY=sk-ant-...
TTS_PROVIDER=piper
TTS_FALLBACK_PROVIDER=espeak
TTS_CACHE_DIR=/tmp/ai-edu/tts-cache
PIPER_BINARY=piper
PIPER_TEACHER_MODEL=/models/piper/en_US-lessac-medium.onnx
PIPER_STUDENT_MODEL=/models/piper/en_US-ryan-medium.onnx
ESPEAK_BINARY=espeak-ng
ESPEAK_TEACHER_VOICE=en-us+m3
ESPEAK_STUDENT_VOICE=en-us+f3
ELEVENLABS_API_KEY=
ELEVENLABS_TEACHER_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_STUDENT_VOICE_ID=AZnzlk1XvdvUeBnXmlld
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
REDIS_URL=redis://localhost:6379
BUCKET_NAME=homework-videos
REMOTION_DIR=../video-renderer
TEMP_DIR=/tmp/ai-edu
MAX_FILE_SIZE_MB=50
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Quick-start checklist

- [ ] Copy `.env` files and fill in all keys
- [ ] Start Redis: `redis-server`
- [ ] Start backend: `uvicorn main:app --reload --port 8000`
- [ ] Start RQ worker: `rq worker homework`
- [ ] Start Remotion renderer (if needed): `cd video-renderer && npm run build`
- [ ] Start frontend: `source ~/.nvm/nvm.sh && nvm use 18 && npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] Sign up, upload a homework file, wait ~3 minutes
