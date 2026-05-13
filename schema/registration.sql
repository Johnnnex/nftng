-- Run this in: Supabase Dashboard → SQL Editor → paste → Run

create table if not exists registration (
  id                    uuid primary key default gen_random_uuid(),
  first_name            text not null,
  last_name             text not null,
  email                 text not null,
  phone                 text not null,
  gender                text not null,
  country               text not null,
  city                  text not null,
  twitter_handle        text,
  what_describes_you    text not null,
  topics_of_interest    text[] not null default '{}',
  looking_forward_to    text,
  first_time_attendee   text not null,
  how_did_you_hear      text,
  agree_to_terms        boolean not null default false,
  events                text[] not null,
  created_at            timestamptz default now()
);

create index if not exists registration_email_idx      on registration (email);
create index if not exists registration_created_at_idx on registration (created_at desc);

alter table registration enable row level security;

create policy "allow_public_insert" on registration
  for insert with check (true);
