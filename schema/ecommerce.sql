-- ecommerce schema: products, variants, stock, faqs, reviews, transactions, orders, order_items, ecommerce_config, promo_codes
-- run in: supabase dashboard → sql editor
-- depends on: admin-auth.sql (references admins), logistics-geo.sql (orders references countries/states/cities)
-- run order: admin-auth.sql → logistics-geo.sql → ecommerce.sql → logistics-ops.sql

-- ─── ENUMs ────────────────────────────────────────────────────────────────────
-- Drop + recreate so a partial previous run with old values doesn't silently persist.
-- CASCADE drops any columns using the type — safe on a fresh setup.

drop type if exists order_status cascade;
create type order_status as enum (
  'pending_payment',
  'paid',
  'in_progress',
  'complete',
  'cancelled',
  'refunded'
);
-- Live-DB migration (run this instead of the drop/recreate above on an existing database):
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid' AFTER 'pending_payment';

-- item_status: items start as 'pending' (not 'paid'); no at_destination (trip system handles it)
drop type if exists item_status cascade;
create type item_status as enum (
  'pending',
  'packaged',
  'enroute',
  'delivered',
  'returned'
);

drop type if exists payment_method_type cascade;
create type payment_method_type as enum ('paystack', 'flutterwave');

drop type if exists discount_type cascade;
create type discount_type as enum ('percent', 'flat');

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────
-- base_image: default hero shown on cards and initial product detail load
-- base_price: used when no price-influencing variant group exists or is selected
-- sales_open_at / sales_close_at: per-product window; null = open immediately / never closes
-- BOTH global ecommerce_config window AND per-product window must be open for purchase

-- run in supabase sql editor if products table already exists:
-- alter table products add column if not exists about text;

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  about          text,                         -- short plain-text summary shown on cards / checkout
  description    text,                         -- stored as markdown, rendered via <RichText />
  base_price     numeric(10, 2) not null,
  base_image     text,                         -- cloudflare images url
  is_active      boolean not null default false,
  sales_open_at  timestamptz,                  -- null = treat as -∞ (always open)
  sales_close_at timestamptz,                  -- null = treat as +∞ (never closes)
  created_by     uuid references admins(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── PRODUCT VARIANT GROUPS ───────────────────────────────────────────────────
-- each group is a named dimension of choice (e.g. 'Size', 'Color', 'Material')
-- influences_price: only ONE group per product may have this true
-- influences_image: only ONE group per product may have this true
-- partial unique indexes enforce the one-group-per-flag constraint at db level

create table if not exists product_variant_groups (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  name            text not null,               -- e.g. 'Size', 'Color', 'Material'
  influences_price boolean not null default false,
  influences_image boolean not null default false,
  display_order   int not null default 0,
  created_at      timestamptz not null default now()
);

-- enforce: only one group per product can influence price / image
create unique index if not exists one_price_group_per_product
  on product_variant_groups (product_id) where influences_price = true;

create unique index if not exists one_image_group_per_product
  on product_variant_groups (product_id) where influences_image = true;

create index if not exists product_variant_groups_product_id_idx
  on product_variant_groups (product_id);

-- ─── PRODUCT VARIANTS ─────────────────────────────────────────────────────────
-- each row is one entry (choice) within a group
-- price_override: populated only when group.influences_price = true
-- image_url: populated only when group.influences_image = true (cloudflare images url)
-- group name cannot be changed once any product_stocks row references it (api enforced)

create table if not exists product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  group_id       uuid not null references product_variant_groups(id) on delete cascade,
  value          text not null,                -- e.g. 'M', 'Red', 'Cotton'
  price_override numeric(10, 2),
  image_url      text,
  display_order  int not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on product_variants (product_id);
create index if not exists product_variants_group_id_idx   on product_variants (group_id);

-- ─── PRODUCT STOCKS ───────────────────────────────────────────────────────────
-- one row per available variant combination; keys are group names, values are variant values
-- e.g. combo = '{"Size": "M", "Color": "Red", "Material": "Cotton"}'
-- combo = '{}' for products with no variant groups (global stock)
--
-- semantics:
--   row exists, qty > 0  → available for purchase
--   row exists, qty = 0  → sold out (was offered)
--   no row               → this combination is not offered by the vendor at all
--
-- greying logic (all client-side — api returns all rows in one query):
--   stage 1 (initial): grey any variant entry not referenced in any qty > 0 row
--   stage 2 (per selection): after picking a value, grey remaining entries that have
--     no qty > 0 row matching the full partial selection + that candidate value
--
-- group names are the combo keys. group names must not be renamed once stock rows exist.
-- api must reject group name changes if any product_stocks row references this product.

create table if not exists product_stocks (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  combo      jsonb not null default '{}',
  quantity   int not null default 0,
  constraint product_stocks_unique unique (product_id, combo)
);

create index if not exists product_stocks_product_id_idx on product_stocks (product_id);

-- ─── PRODUCT FAQS ─────────────────────────────────────────────────────────────

create table if not exists product_faqs (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  question      text not null,
  answer        text not null,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_faqs_product_id_idx on product_faqs (product_id);

-- ─── PRODUCT REVIEWS ──────────────────────────────────────────────────────────
-- is_approved: admin must approve before review is visible on storefront
-- is_verified: admin marks as verified purchase

create table if not exists product_reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  reviewer_name text not null,
  rating        smallint not null check (rating between 1 and 5),
  content       text not null,
  is_verified   boolean not null default false,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx on product_reviews (product_id);
create index if not exists product_reviews_approved_idx   on product_reviews (is_approved);

-- ─── ECOMMERCE CONFIG ─────────────────────────────────────────────────────────
-- global sales window. one row only — insert once, admin only ever updates it.
-- null open_at = always open; null close_at = never closes

create table if not exists ecommerce_config (
  id             uuid primary key default gen_random_uuid(),
  sales_open_at  timestamptz,
  sales_close_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
-- one row per payment attempt; orders.transaction_id fks here
-- use this table for financial dashboard charts (revenue/volume over time)
-- never query orders table for financial data

create table if not exists transactions (
  id                  uuid primary key default gen_random_uuid(),
  amount              numeric(10, 2) not null,    -- grand total = items + delivery_fee
  delivery_fee        numeric(10, 2) not null default 0,
  currency            text not null default 'NGN',
  payment_method      payment_method_type not null,
  external_reference  text,                       -- gateway's own tx reference
  status              text not null default 'pending', -- 'pending' | 'success' | 'failed'
  webhook_verified_at timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists transactions_status_idx     on transactions (status);
create index if not exists transactions_created_at_idx on transactions (created_at);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
-- order_ref: 'ORD-' + 9 random digits, generated in api via nanoid (lib/utils.ts)
-- unique constraint on order_ref handles collision — retry once in api
-- structured address references logistics-geo.sql geo tables (logistics-geo.sql must run first)
-- delivery confirmation is trip-based (see logistics-ops.sql trips + trip_orders tables)

create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_ref        text unique not null,
  transaction_id   uuid references transactions(id),
  user_email       text not null,
  user_name        text not null,
  user_phone       text not null,
  -- structured address (country/state/city fk populated for Nigerian orders)
  user_country_id  uuid references countries(id) on delete set null,
  user_state_id    uuid references states(id) on delete set null,
  user_city_id     uuid references cities(id) on delete set null,
  user_address_line text not null,                   -- street / floor / apartment
  user_address      text not null,                   -- assembled display string
  delivery_method   text,                            -- 'park' | 'gig' | 'direct' | null (intl)
  status           order_status not null default 'pending_payment',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_email_idx  on orders (user_email);
create index if not exists orders_order_ref_idx   on orders (order_ref);
create index if not exists orders_status_idx      on orders (status);
create index if not exists orders_transaction_idx on orders (transaction_id);
create index if not exists orders_city_idx        on orders (user_city_id);
create index if not exists orders_state_idx       on orders (user_state_id);

-- ─── ORDER ITEMS ──────────────────────────────────────────────────────────────
-- variant_combo: snapshot of selected variants at purchase time
--   e.g. '{"Size": "M", "Color": "Red"}' — group names as keys, variant values as values
-- product_title, product_image, unit_price: permanent snapshots; never change after purchase
-- product_image: whichever image was shown at add-to-cart time
--   (variant image_url if an image-influencing group was selected, else products.base_image)
-- unit_price: price_override of the price-influencing group entry, else base_price
-- logistics_ready: bool set by products admin after 'packaged' — gates logistics queue visibility
-- delivery confirmation via trips system (see schema/logistics-ops.sql: trips, trip_items, trip_orders)
-- order status auto-update enforced in api (not db triggers):
--   after any item → 'delivered': if all items in order delivered → order 'complete'

create table if not exists order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      uuid references products(id) on delete set null,
  product_title   text not null,
  product_image   text,
  variant_combo   jsonb not null default '{}',
  quantity        integer not null default 1,
  unit_price      numeric(10, 2) not null,
  status          item_status not null default 'pending',
  logistics_ready boolean not null default false,     -- set by products admin after packaged
  refund_amount   numeric(10, 2),                     -- only set when status = 'returned'
  packaged_at     timestamptz,
  enroute_at      timestamptz,
  delivered_at    timestamptz,
  returned_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists order_items_order_id_idx       on order_items (order_id);
create index if not exists order_items_status_idx         on order_items (status);
create index if not exists order_items_logistics_ready_idx on order_items (logistics_ready) where logistics_ready = true;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
-- service role key used for all admin api ops (bypasses rls)
-- anon key used for public storefront reads/writes

alter table products               enable row level security;
alter table product_variant_groups enable row level security;
alter table product_variants       enable row level security;
alter table product_stocks         enable row level security;
alter table product_faqs           enable row level security;
alter table product_reviews        enable row level security;
alter table ecommerce_config       enable row level security;
alter table transactions           enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;

-- storefront: read active products and all their supporting data
create policy "public_read_active_products" on products
  for select using (is_active = true);

create policy "public_read_variant_groups" on product_variant_groups
  for select using (true);  -- filtered by product_id join; inactive products excluded above

create policy "public_read_variants" on product_variants
  for select using (true);

create policy "public_read_stocks" on product_stocks
  for select using (true);

create policy "public_read_faqs" on product_faqs
  for select using (true);

create policy "public_read_approved_reviews" on product_reviews
  for select using (is_approved = true);

create policy "public_read_ecommerce_config" on ecommerce_config
  for select using (true);

-- storefront: create and track own orders
create policy "public_insert_orders" on orders
  for insert with check (true);

create policy "public_read_own_order" on orders
  for select using (true);  -- further scoped in api by order_ref param

create policy "public_read_own_order_items" on order_items
  for select using (true);  -- further scoped in api by order_id join

-- ─── Promo Codes ──────────────────────────────────────────────────────────────

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null,
  code text unique not null,
  discount_type discount_type not null,
  discount_value numeric(10,2) not null check (discount_value > 0),
  is_active boolean not null default true,
  usage_count integer not null default 0,
  max_usage integer check (max_usage > 0),        -- null = unlimited
  starts_at timestamptz,                           -- null = active immediately
  expires_at timestamptz,                          -- null = never expires
  created_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_promo_codes_code on promo_codes(code);

alter table promo_codes enable row level security;

-- storefront: validate active codes only (admin writes go through service_role, bypass RLS)
create policy "public_read_active_promo_codes" on promo_codes
  for select using (is_active = true);
