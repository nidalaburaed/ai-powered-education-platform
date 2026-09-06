# EduCast — AI Education Platform

Turn homework photos into educational podcast videos using AI.

---

## How It Works

1. Student uploads a homework photo
2. Claude AI extracts and explains the content
3. A configurable text-to-speech provider generates teacher/student dialogue audio
4. Remotion renders an animated video
5. Video is stored in Supabase and shown to the student

---

## Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Docker Desktop | Latest | https://docker.com |
| FFmpeg | Latest | https://ffmpeg.org/download.html |

> **Windows users:** Add FFmpeg to your PATH after installing it.

---

## Step 1 — External Accounts & API Keys

You need accounts on these services:

### 1. Supabase (Database + Storage + Auth)
1. Go to https://supabase.com and create a free project
2. From your project dashboard, collect:
   - **Project URL** → `https://your-project.supabase.co`
   - **Anon Key** → Settings → API → `anon public`
   - **Service Role Key** → Settings → API → `service_role` (keep this secret)
3. Run the database schema:
   - Go to **SQL Editor** in your Supabase dashboard
   - Paste and run the contents of `database/schema.sql`
4. Create the storage bucket:
   - Go to **Storage** → **New bucket**
   - Name: `homework-videos`
   - Toggle **Public bucket: ON**
   - Click **Save**
5. Enable Email Auth:
   - Go to **Authentication** → **Providers** → **Email**
   - Make sure it is enabled

### 2. Anthropic (Claude AI)
1. Go to https://console.anthropic.com and create an account
2. Go to **API Keys** and create a new key
3. Save it — it starts with `sk-ant-...`

### 3. Text-to-Speech

The backend now supports provider-based text-to-speech:

- `piper` — free/local neural TTS. Recommended for cost-free podcast generation.
- `espeak` — free/local fallback. Lower quality, but useful when Piper models are not installed.
- `elevenlabs` — optional premium fallback if you still want ElevenLabs quality for selected deployments.

For free local generation, install the Piper CLI and download two `.onnx` voice models. Point `PIPER_TEACHER_MODEL` and `PIPER_STUDENT_MODEL` at those model files. The Docker image also installs `espeak-ng`, so `TTS_FALLBACK_PROVIDER=espeak` can generate no-cost fallback audio if Piper is unavailable.

If you choose `TTS_PROVIDER=elevenlabs`, go to https://elevenlabs.io, create an account, and set `ELEVENLABS_API_KEY` plus the voice IDs.

---

## Step 2 — Configure Environment Files

### Backend — `backend/.env`

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your values:

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Text-to-speech
TTS_PROVIDER=piper
TTS_FALLBACK_PROVIDER=espeak
TTS_CACHE_DIR=/tmp/ai-edu/tts-cache

# Piper free/local TTS
PIPER_BINARY=piper
PIPER_TEACHER_MODEL=/models/piper/en_US-lessac-medium.onnx
PIPER_STUDENT_MODEL=/models/piper/en_US-ryan-medium.onnx

# eSpeak NG free/local fallback
ESPEAK_BINARY=espeak-ng
ESPEAK_TEACHER_VOICE=en-us+m3
ESPEAK_STUDENT_VOICE=en-us+f3

# ElevenLabs optional premium provider
ELEVENLABS_API_KEY=
ELEVENLABS_TEACHER_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_STUDENT_VOICE_ID=AZnzlk1XvdvUeBnXmlld

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Redis (leave as-is for local/Docker)
REDIS_URL=redis://localhost:6379

# App settings (leave as-is for local dev)
BUCKET_NAME=homework-videos
REMOTION_DIR=../video-renderer
TEMP_DIR=/tmp/ai-edu
MAX_FILE_SIZE_MB=50
FRONTEND_URL=http://localhost:3000
```

### Frontend — `frontend/.env.local`

Copy the example file:
```bash
cp frontend/.env.local.example frontend/.env.local
```

Then open `frontend/.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 3 — Run the Project

You have two options:

---

### Option A — Docker (Recommended)

Runs everything in containers. Requires Docker Desktop to be running.

```bash
docker-compose up --build
```

That's it. All four services (Redis, Backend, Worker, Frontend) start automatically.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

To stop:
```bash
docker-compose down
```

---

### Option B — Manual (4 terminals)

Use this if you want to run services individually without Docker.

**Terminal 1 — Redis**
```bash
docker run -p 6379:6379 redis:alpine
```

**Terminal 2 — Backend API**
```bash
cd backend
python -m venv venv

# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload
```

**Terminal 3 — Background Worker**
```bash
cd backend
# Activate the same venv as Terminal 2, then:
python worker.py
```

**Terminal 4 — Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 5 — Video Renderer (install only, no server needed)**
```bash
cd video-renderer
npm install
```

---

## Step 4 — Verify Everything Works

1. Open http://localhost:3000 — you should see the login page
2. Create an account (uses Supabase Auth)
3. Upload a homework image
4. Watch the job progress in real time
5. View and download your generated video

Check the backend health endpoint anytime:
```
http://localhost:8000/health
```
Should return: `{"status": "ok"}`

---

## Deploy to Railway (showcase)

This is a showcase deployment, not a production setup. It exists so reviewers can see the app running without a local install.

### Prerequisites

| Tool | Install |
|------|---------|
| Railway CLI | `bash <(curl -fsSL railway.com/install.sh) -y`, then `railway login` |
| Supabase CLI | `npm i -D supabase`, then `npx supabase login` and `npx supabase link --project-ref <ref>` |
| Docker | Not required — Railway builds the images |

### Services

| Service | What it runs | Domain | Notes |
|---------|---------------|--------|-------|
| `frontend` | Next.js app | Public | Built with the backend domain inlined |
| `backend` | FastAPI API | Public | Healthcheck: `/health` |
| `worker` | Same image as `backend` | None | Start command: `python worker.py` |
| `Redis` | Railway database | None | Provides `REDIS_URL` |

### One-time project setup

```bash
railway init            # or: railway link (to an existing project)

railway add --service backend
railway add --service worker
railway add --service frontend
railway add --database redis

railway domain --service backend
railway domain --service frontend
```

The worker needs a custom start command instead of the backend's default. Set it in the dashboard: `worker` service → Settings → Deploy → **Custom Start Command** → `python worker.py`.
The CLI equivalent (`railway environment edit --service-config worker deploy.startCommand "python worker.py"`) can report "No changes to apply" in Railway CLI 5.49 even though nothing was set — if so, use `railway api` with the `serviceInstanceUpdate` GraphQL mutation instead.

### Config-as-code

Each service reads its build/deploy settings from a checked-in `railway.json`:

| File | Used by | Carries |
|------|---------|---------|
| `backend/railway.json` | `backend` | Healthcheck path `/health`, 300s timeout, restart policy `ON_FAILURE` |
| `backend/railway.worker.json` | `worker` | Start command `python worker.py`, restart policy `ON_FAILURE` |
| `frontend/railway.json` | `frontend` | Restart policy `ON_FAILURE` |

### Database

Push the schema and storage bucket with the Supabase CLI:
```bash
npx supabase db push --linked
```
Sign-up confirmation emails redirect to the project's auth **Site URL**, which defaults to `localhost:3000`. Point it at the deployed frontend and allow that origin (Supabase dashboard → Authentication → URL Configuration, or the Management API `PATCH /v1/projects/<ref>/config/auth` with `site_url` and `uri_allow_list`):

```
site_url        = https://<frontend-domain>
uri_allow_list  = https://<frontend-domain>,https://<frontend-domain>/**
```

This applies everything in `supabase/migrations/` — it creates the schema **and** the public `homework-videos` bucket, so the manual bucket step in Step 1 is not needed for this path.

### Variables

Secrets below are placeholders — use your real values. Set them with:
```bash
railway variable set --service backend --skip-deploys ANTHROPIC_API_KEY=<your-key>
```
Quote any value containing `${{...}}` in single quotes so your shell doesn't expand it.

| Service | Variable | Value |
|---------|----------|-------|
| backend | `ANTHROPIC_API_KEY` | `<your-key>` |
| backend | `SUPABASE_URL` | `https://<ref>.supabase.co` |
| backend | `SUPABASE_SERVICE_KEY` | `<your-key>` |
| backend | `SUPABASE_ANON_KEY` | `<your-key>` |
| backend | `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| backend | `REMOTION_DIR` | `/app/video-renderer` |
| backend | `TTS_PROVIDER` | `espeak` (the Railway image has no Piper `.onnx` voice models) |
| backend | `FRONTEND_URL` | `https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}` |
| worker | `ANTHROPIC_API_KEY` | `<your-key>` |
| worker | `SUPABASE_URL` | `https://<ref>.supabase.co` |
| worker | `SUPABASE_SERVICE_KEY` | `<your-key>` |
| worker | `SUPABASE_ANON_KEY` | `<your-key>` |
| worker | `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| worker | `REMOTION_DIR` | `/app/video-renderer` |
| worker | `TTS_PROVIDER` | `espeak` |
| frontend | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| frontend | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<your-key>` |
| frontend | `NEXT_PUBLIC_API_URL` | `https://${{backend.RAILWAY_PUBLIC_DOMAIN}}` |

### Deploy

Deploy in this order — the frontend build inlines the backend's public domain, so backend must exist first:
```bash
railway up ./backend --service backend --path-as-root --ci
railway up ./backend --service worker --path-as-root --ci
railway up ./frontend --service frontend --path-as-root --ci
```

### Verify

```bash
curl https://<backend-domain>/health
railway logs --service worker
```
Then open the frontend domain in a browser and upload a homework image.

---

## Project Structure

```
AI-Education/
├── backend/            # FastAPI Python API + RQ worker
│   ├── app/            # Routes, services, models
│   ├── video-renderer/ # Remotion video renderer
│   │   └── src/        # Video compositions
│   ├── main.py         # API entry point
│   ├── worker.py       # Background job worker
│   ├── railway.json        # Railway config for the backend service
│   ├── railway.worker.json # Railway config for the worker service
│   └── .env.example    # Environment template
├── frontend/           # Next.js 14 React app
│   ├── app/            # Pages and layouts
│   ├── components/     # UI components
│   ├── railway.json    # Railway config for the frontend service
│   └── .env.local.example
├── database/
│   └── schema.sql      # Run this in Supabase SQL editor
├── supabase/
│   └── migrations/     # Schema + storage bucket, applied via `supabase db push`
├── docker-compose.yml  # Runs all services together
└── setup.sh            # One-time setup helper (Mac/Linux)
```

---

## Troubleshooting

**FFmpeg not found**
- Make sure FFmpeg is installed and on your PATH: `ffmpeg -version`

**Redis connection refused**
- Make sure Redis is running (Terminal 1 or Docker)

**Supabase errors**
- Double-check your `SUPABASE_SERVICE_KEY` — it must be the **service_role** key, not the anon key

**Video not rendering**
- Make sure `video-renderer/` dependencies are installed: `cd video-renderer && npm install`
- On Windows, check that `REMOTION_DIR` in `backend/.env` points to the correct path
- If Docker logs show `chrome-headless-shell: error while loading shared libraries` (for example `libnss3.so`), rebuild the backend/worker image so the Remotion browser runtime libraries from `backend/Dockerfile` are installed: `docker compose build --no-cache backend worker && docker compose up`

**CORS errors in browser**
- Make sure `FRONTEND_URL=http://localhost:3000` is set in `backend/.env`
