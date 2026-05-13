-- Unchain Summer: event registrations
-- Free registration — no payment. Paid tickets are a future addition.

create table if not exists registrations (
  id                    uuid primary key default gen_random_uuid(),

  -- personal
  full_name             text not null,
  email                 text not null,
  phone                 text not null,
  gender                text not null,

  -- location
  country               text not null,
  city                  text not null,

  -- social (optional)
  twitter_handle        text,

  -- event profile
  what_describes_you    text not null,
  topics_of_interest    text[] not null default '{}',
  looking_forward_to    text,
  first_time_attendee   text not null,   -- 'yes' | 'no'
  how_did_you_hear      text,

  -- consent
  agree_to_terms        boolean not null default false,

  -- which events they picked
  events                text[] not null,  -- ['soccer_tournament', 'unchain_summer_conference']

  -- meta
  created_at            timestamptz default now()
);

create index if not exists registrations_email_idx      on registrations (email);
create index if not exists registrations_created_at_idx on registrations (created_at desc);

-- RLS: anyone can INSERT, nobody reads via client key
alter table registrations enable row level security;

create policy "allow_public_insert" on registrations
  for insert with check (true);

-- Admins use service role key which bypasses RLS
