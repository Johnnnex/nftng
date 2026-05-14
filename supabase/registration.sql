-- Drop and recreate the registration table
-- Run this in Supabase SQL editor after confirming the old table can be dropped

DROP TABLE IF EXISTS registration;

CREATE TABLE registration (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  alias               TEXT        NOT NULL,
  email               TEXT        NOT NULL UNIQUE,
  phone               TEXT,                        -- optional, re-enable when WhatsApp is approved
  gender              TEXT        NOT NULL,
  country             TEXT        NOT NULL,
  city                TEXT        NOT NULL,
  twitter_handle      TEXT,                        -- optional
  what_describes_you  TEXT        NOT NULL,
  topics_of_interest  TEXT[]      NOT NULL DEFAULT '{}',
  looking_forward_to  TEXT,
  first_time_attendee TEXT        NOT NULL,
  how_did_you_hear    TEXT,
  agree_to_terms      BOOLEAN     NOT NULL DEFAULT false,
  events              TEXT[]      NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE registration ENABLE ROW LEVEL SECURITY;

-- Anon users can insert (registration form)
CREATE POLICY "anon_insert" ON registration
  FOR INSERT TO anon
  WITH CHECK (true);

-- Service role has full access (admin dashboard reads)
CREATE POLICY "service_role_all" ON registration
  USING (auth.role() = 'service_role');
