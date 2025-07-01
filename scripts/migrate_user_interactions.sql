-- Migration: Update user_interactions table
-- Add is_saved and is_seen boolean columns

ALTER TABLE user_interactions
  ADD COLUMN is_saved BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_seen BOOLEAN DEFAULT FALSE;
