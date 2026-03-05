-- ============================================
-- Migration: Add cover_letter column to sessions
-- ============================================

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS cover_letter TEXT NOT NULL DEFAULT '';
