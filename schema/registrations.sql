-- Unchain Summer: event registrations
-- Free registration — no payment. Paid tickets are a future addition.

create table if not exists event_registrations (
  id                    uuid primary key default gen_random_uuid(),

  -- identity
  alias                 text not null,            -- web3 alias / display name
  email                 text not null,

  -- optional contact
  phone                 text,
  twitter_handle        text,

  -- demographics
  gender                text not null,
  country               text not null,
  city                  text not null,

  -- event profile
  what_describes_you    text not null,
  topics_of_interest    text[] not null default '{}',
  looking_forward_to    text,
  first_time_attendee   text not null,            -- 'yes' | 'no'
  how_did_you_hear      text,

  -- consent
  agree_to_terms        boolean not null default false,

  -- which events they registered for
  events                text[] not null,           -- ['soccer_tournament', 'unchain_summer_conference']

  -- attendance tracking (admin marks when registrant checks in at the event)
  attended              boolean not null default false,
  attended_at           timestamptz,

  -- meta
  created_at            timestamptz default now()
);

create index if not exists event_registrations_email_idx      on event_registrations (email);
create index if not exists event_registrations_created_at_idx on event_registrations (created_at desc);
create index if not exists event_registrations_attended_idx   on event_registrations (attended);

-- RLS: anyone can INSERT, nobody reads via client key
alter table event_registrations enable row level security;

create policy "allow_public_insert" on event_registrations
  for insert with check (true);

-- Admins use service role key which bypasses RLS
