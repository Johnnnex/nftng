-- admin roles, admins, invites, and refresh token tables
-- run in: supabase dashboard → sql editor

create table if not exists admin_roles (
  id                  uuid primary key default gen_random_uuid(),
  name                text unique not null,
  module_permissions  jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists admins (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  password_hash       text not null,
  first_name          text not null,
  last_name           text not null,
  is_super            boolean not null default false,
  is_active           boolean not null default true,
  initial_role_id     uuid references admin_roles(id) on delete set null,  -- template assigned at creation, audit only
  created_by          uuid references admins(id) on delete set null,
  last_login_at       timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- live permission config — one-to-one with admins, single source of truth
-- always read this; never merge role + overrides at login
create table if not exists admin_configs (
  id                  uuid primary key default gen_random_uuid(),
  admin_id            uuid unique not null references admins(id) on delete cascade,
  module_permissions  jsonb not null default '{}',
  updated_by          uuid references admins(id) on delete set null,
  updated_at          timestamptz not null default now()
);

create index if not exists admin_configs_admin_id_idx on admin_configs (admin_id);

do $$ begin
  create type invite_status as enum ('pending', 'accepted', 'expired');
exception when duplicate_object then null;
end $$;

create table if not exists admin_invites (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  first_name          text not null,
  last_name           text not null,
  token               text unique not null,
  status              invite_status not null default 'pending',
  role_id             uuid references admin_roles(id) on delete set null,
  module_permissions  jsonb not null default '{}',
  created_by          uuid not null references admins(id) on delete cascade,
  expires_at          timestamptz not null,
  accepted_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists admin_invites_token_idx on admin_invites (token);
create index if not exists admin_invites_email_idx on admin_invites (email);

create table if not exists refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references admins(id) on delete cascade,
  token_hash  text not null,
  family_id   uuid not null,
  expires_at  timestamptz not null,
  revoked     boolean not null default false,
  user_agent  text,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index if not exists refresh_tokens_admin_id_idx  on refresh_tokens (admin_id);
create index if not exists refresh_tokens_family_id_idx on refresh_tokens (family_id);

-- all tables use service role for admin ops; RLS blocks direct client access
alter table admin_roles    enable row level security;
alter table admins         enable row level security;
alter table admin_configs  enable row level security;
alter table admin_invites  enable row level security;
alter table refresh_tokens enable row level security;
