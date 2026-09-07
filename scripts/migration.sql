-- Violentómetro Database Schema
-- Run this against your Neon DB.
-- Safe to re-run: every statement is idempotent.

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- People/Aggressors table.
-- brendapoints are weekly and computed at query time from situations, not stored.
CREATE TABLE IF NOT EXISTS aggressors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop the stored brendapoints column from previous schema versions.
ALTER TABLE aggressors DROP COLUMN IF EXISTS brendapoints;

-- Situations table
CREATE TABLE IF NOT EXISTS situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  aggressor_id UUID REFERENCES aggressors(id) ON DELETE SET NULL,
  aggression_type TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_situations_user_id ON situations(user_id);
CREATE INDEX IF NOT EXISTS idx_situations_aggressor_id ON situations(aggressor_id);
CREATE INDEX IF NOT EXISTS idx_situations_created_at ON situations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aggressors_user_id ON aggressors(user_id);
