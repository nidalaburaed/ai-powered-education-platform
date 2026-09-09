-- ============================================================
-- EduCast — initial schema migration
-- Mirrors database/schema.sql (kept as the human-readable reference)
-- plus the public "homework-videos" storage bucket.
-- ============================================================

-- Homework uploads table
CREATE TABLE IF NOT EXISTS homework_uploads (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_url    TEXT NOT NULL,
    file_name   TEXT NOT NULL,
    status      TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Podcast videos table
CREATE TABLE IF NOT EXISTS podcast_videos (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    homework_id      UUID REFERENCES homework_uploads(id) ON DELETE SET NULL,
    user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title            TEXT,
    subject          TEXT,
    grade_level      TEXT,
    video_url        TEXT NOT NULL,
    audio_url        TEXT,
    transcript       JSONB,
    flashcards       JSONB,
    quiz             JSONB,
    duration_seconds INTEGER,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (tracks pipeline progress)
CREATE TABLE IF NOT EXISTS jobs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    homework_id UUID REFERENCES homework_uploads(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status      TEXT DEFAULT 'queued'
                    CHECK (status IN ('queued', 'ocr', 'scripting', 'audio', 'video', 'uploading', 'done', 'failed')),
    progress    INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error       TEXT,
    video_id    UUID REFERENCES podcast_videos(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on jobs
-- search_path pinned to empty: the body only touches NEW and NOW() (pg_catalog,
-- always resolvable), so this closes the mutable-search_path warning without
-- changing behaviour.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE homework_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_videos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs             ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users see own homework" ON homework_uploads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own videos" ON podcast_videos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own jobs" ON jobs
    FOR ALL USING (auth.uid() = user_id);

-- Service role bypasses RLS (used by backend)
-- (Supabase service key has this automatically)

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_homework_user ON homework_uploads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_user   ON podcast_videos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user     ON jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_homework ON jobs(homework_id);

-- ── Storage bucket ───────────────────────────────────────────────────────────
-- Public bucket for generated homework/podcast videos. ON CONFLICT makes this
-- statement safe if the bucket was already created by hand. The trigger and
-- policy statements above are not re-runnable; this migration is for an empty DB.

INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-videos', 'homework-videos', true)
ON CONFLICT (id) DO NOTHING;
