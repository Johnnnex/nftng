-- logistics-ops schema: trips, trip_items, trip_orders, outside-nigeria orders, refunds
-- run in: supabase dashboard → sql editor
-- depends on: admin-auth.sql (references admins), ecommerce.sql (references orders, order_items)
-- run AFTER ecommerce.sql
-- run order: admin-auth.sql → logistics-geo.sql → ecommerce.sql → logistics-ops.sql

-- ─── TRIPS ────────────────────────────────────────────────────────────────────
-- a trip = one rider, one dispatch, one code
-- code is shared across all customer orders on this trip
-- rider receives code + manifest; customers receive unique URL (no code in customer email)

create table if not exists trips (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,             -- 8 alphanumeric (upper+lower, nanoid)
  rider_name    text not null,
  rider_phone   text not null,
  rider_email   text,                             -- if set, rider gets email with code + manifest
  rider_company text,
  status        text not null default 'draft',    -- 'draft' | 'dispatched' | 'completed'
  created_by    uuid references admins(id) on delete set null,
  dispatched_at timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists trips_status_idx on trips (status);

-- ─── TRIP ITEMS ───────────────────────────────────────────────────────────────
-- junction: which order_items are on which trip

create table if not exists trip_items (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references trips(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  constraint trip_items_unique unique (trip_id, order_item_id)
);

create index if not exists trip_items_trip_idx        on trip_items (trip_id);
create index if not exists trip_items_order_item_idx  on trip_items (order_item_id);

-- ─── TRIP ORDERS ──────────────────────────────────────────────────────────────
-- one row per unique (trip, order) pair — holds the per-customer confirmation token
-- customer receives url /confirm-delivery/:confirmation_token
-- they enter the trip code (given by rider in person) to confirm receipt

create table if not exists trip_orders (
  id                  uuid primary key default gen_random_uuid(),
  trip_id             uuid not null references trips(id) on delete cascade,
  order_id            uuid not null references orders(id) on delete cascade,
  confirmation_token  text unique not null,        -- nanoid 10 lowercase alphanumeric
  confirmed_at        timestamptz,                 -- set on confirmation; null = not yet confirmed
  constraint trip_orders_unique unique (trip_id, order_id)
);

create index if not exists trip_orders_token_idx on trip_orders (confirmation_token);
create index if not exists trip_orders_trip_idx  on trip_orders (trip_id);
create index if not exists trip_orders_order_idx on trip_orders (order_id);

-- ─── OUTSIDE NIGERIA ORDERS ───────────────────────────────────────────────────
-- international orders saved separately — NOT in the main orders table
-- no payment, no tracking, fully manual process
-- user gets preview url /preview-order/:preview_token to view their order

-- patch for existing DBs:
-- alter table outside_nigeria_orders add column if not exists reverted_by uuid references admins(id) on delete set null;
-- alter table outside_nigeria_orders add column if not exists reverted_at timestamptz;
-- alter table outside_nigeria_orders drop constraint if exists outside_nigeria_orders_status_check;
-- alter table outside_nigeria_orders add constraint outside_nigeria_orders_status_check check (status in ('pending', 'resolved', 'reverted'));

create table if not exists outside_nigeria_orders (
  id              uuid primary key default gen_random_uuid(),
  preview_token   text unique not null,            -- nanoid 10 lowercase alphanumeric
  user_name       text not null,
  user_email      text not null,
  user_phone      text not null,
  user_country_id uuid references countries(id) on delete set null,
  user_address    text not null,
  items           jsonb not null,                  -- snapshot: [{productId, productTitle, variantCombo, qty, unitPrice, productImage}]
  status          text not null default 'pending'
                  constraint outside_nigeria_orders_status_check check (status in ('pending', 'resolved', 'reverted')),
  resolved_by     uuid references admins(id) on delete set null,
  resolved_at     timestamptz,
  reverted_by     uuid references admins(id) on delete set null,
  reverted_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists outside_nigeria_orders_token_idx  on outside_nigeria_orders (preview_token);
create index if not exists outside_nigeria_orders_status_idx on outside_nigeria_orders (status);
create index if not exists outside_nigeria_orders_email_idx  on outside_nigeria_orders (user_email);

-- ─── REFUNDS ──────────────────────────────────────────────────────────────────
-- records manual refunds processed off-app (customer emails team for payout)
-- order_item_id = null means full order refund
-- net_revenue = SUM(transactions.amount WHERE status='success') - SUM(refunds.amount)
-- never mutate transactions.amount

create table if not exists refunds (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,  -- null = full order
  amount        numeric(10, 2) not null,
  processed_by  uuid references admins(id) on delete set null,
  processed_at  timestamptz not null default now(),
  notes         text
);

create index if not exists refunds_order_idx      on refunds (order_id);
create index if not exists refunds_order_item_idx on refunds (order_item_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
-- service role key (admin api) bypasses rls
-- anon key (public) gets scoped read access

alter table trips                  enable row level security;
alter table trip_items             enable row level security;
alter table trip_orders            enable row level security;
alter table outside_nigeria_orders enable row level security;
alter table refunds                enable row level security;

-- public reads own outside-nigeria order by token (token = secret url — no other auth needed)
create policy "public_read_own_preview" on outside_nigeria_orders
  for select using (true);  -- further scoped in api by preview_token param

-- public reads trip_orders for confirmation (scoped by token in api)
create policy "public_read_trip_orders" on trip_orders
  for select using (true);  -- scoped by confirmation_token in api

-- public can submit outside-nigeria orders
create policy "public_insert_outside_orders" on outside_nigeria_orders
  for insert with check (true);
