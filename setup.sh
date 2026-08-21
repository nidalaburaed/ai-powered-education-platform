#!/usr/bin/env bash
# EduCast — One-time project setup
set -e

echo "==> Setting up EduCast..."

# ── Backend ──────────────────────────────────────────────────────────────────
echo ""
echo "[1/4] Installing Python backend dependencies..."
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp -n .env.example .env || true
echo "  --> Edit backend/.env with your API keys before running"
cd ..

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "[2/4] Installing frontend dependencies..."
cd frontend
npm install
cp -n .env.local.example .env.local || true
echo "  --> Edit frontend/.env.local with your Supabase URL and anon key"
cd ..

# ── Video renderer ────────────────────────────────────────────────────────────
echo ""
echo "[3/4] Installing Remotion video renderer dependencies..."
cd video-renderer
npm install
cd ..

# ── Database ─────────────────────────────────────────────────────────────────
echo ""
echo "[4/4] Database setup..."
echo "  --> Run the SQL in database/schema.sql in your Supabase project's SQL editor"
echo "  --> Create a public storage bucket named 'homework-videos' in Supabase"

echo ""
echo "====================================================="
echo " Setup complete! Start the project:"
echo ""
echo "  Terminal 1 (Redis):   docker run -p 6379:6379 redis:alpine"
echo "  Terminal 2 (API):     cd backend && uvicorn main:app --reload"
echo "  Terminal 3 (Worker):  cd backend && python worker.py"
echo "  Terminal 4 (Frontend): cd frontend && npm run dev"
echo ""
echo "  Or with Docker:       docker-compose up --build"
echo "====================================================="
