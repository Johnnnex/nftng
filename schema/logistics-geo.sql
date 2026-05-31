-- logistics-geo schema: countries, states, cities, delivery configs
-- run in: supabase dashboard → sql editor
-- depends on: nothing
-- run BEFORE ecommerce.sql (ecommerce.sql references countries/states/cities via FK)
-- run order: admin-auth.sql → logistics-geo.sql → ecommerce.sql → logistics-ops.sql

-- ─── COUNTRIES ────────────────────────────────────────────────────────────────

create table if not exists countries (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null,
  code text unique not null   -- iso 3166-1 alpha-2, e.g. 'NG', 'GB'
);

-- ─── STATES ───────────────────────────────────────────────────────────────────
-- only Nigerian states are seeded; non-Nigeria countries have no state rows

create table if not exists states (
  id         uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  name       text not null,
  constraint states_country_name_unique unique (country_id, name)
);

create index if not exists states_country_idx on states (country_id);

-- ─── CITIES ───────────────────────────────────────────────────────────────────
-- covers both Nigerian cities/towns and Lagos LGA delivery zones
-- Lagos zones (e.g. "Somolu/Yaba/Bariga") are stored here under Lagos state — no is_zone flag needed

create table if not exists cities (
  id       uuid primary key default gen_random_uuid(),
  state_id uuid not null references states(id) on delete cascade,
  name     text not null,
  constraint cities_state_name_unique unique (state_id, name)
);

create index if not exists cities_state_idx on cities (state_id);

-- ─── DELIVERY CONFIGS ─────────────────────────────────────────────────────────
-- one row per (city, method) combination
-- method: 'park' = park delivery, 'gig' = gig/fez delivery, 'direct' = Lagos local delivery
-- price is flat (no min/max) — irrespective of number of items ordered

create table if not exists delivery_configs (
  id             uuid primary key default gen_random_uuid(),
  city_id        uuid not null references cities(id) on delete cascade,
  method         text not null,                   -- 'park' | 'gig' | 'direct'
  price          numeric(10, 2) not null,
  estimated_days text,                            -- e.g. '3-10 business days'
  constraint delivery_configs_unique unique (city_id, method)
);

create index if not exists delivery_configs_city_idx on delivery_configs (city_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
-- service role key (admin api) bypasses rls
-- anon key (public) gets read access to geo data for checkout form

alter table countries        enable row level security;
alter table states           enable row level security;
alter table cities           enable row level security;
alter table delivery_configs enable row level security;

create policy "public_read_countries"        on countries        for select using (true);
create policy "public_read_states"           on states           for select using (true);
create policy "public_read_cities"           on cities           for select using (true);
create policy "public_read_delivery_configs" on delivery_configs for select using (true);
