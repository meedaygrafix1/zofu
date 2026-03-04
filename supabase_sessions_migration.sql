-- ============================================
-- Migration: Create sessions table for ZOFU
-- Run this SQL in your Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create the sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Session',
    created_at BIGINT NOT NULL,  -- timestamp in milliseconds (matches JS Date.now())
    resume_text TEXT NOT NULL DEFAULT '',
    resume_file_name TEXT NOT NULL DEFAULT '',
    job_description TEXT NOT NULL DEFAULT '',
    amplified_text TEXT NOT NULL DEFAULT '',
    ats_score INTEGER,
    keywords JSONB,   -- { found: string[], missing: string[], added: string[] }
    changes JSONB NOT NULL DEFAULT '[]'::jsonb  -- array of { section, original, amplified, reason }
);

-- 2. Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.sessions FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON public.sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
    ON public.sessions FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- 8. Index for ordering by creation time
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
