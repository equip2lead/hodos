-- Hodos lives in its own schema so it never touches Let's Talk tables.
create schema if not exists hodos;

create type hodos.user_role as enum ('customer','vendor','admin','super_admin');
create type hodos.business_kind as enum ('order','book','list');
create type hodos.business_status as enum ('pending','approved','rejected','suspended');
create type hodos.plan as enum ('free','featured');
create type hodos.order_mode as enum ('delivery','pickup');
create type hodos.payment_method as enum ('momo','orange_money','cash');
create type hodos.order_status as enum ('sent','accepted','preparing','ready','on_the_way','delivered','declined','cancelled');
create type hodos.booking_status as enum ('requested','confirmed','done','declined','cancelled');
create type hodos.sub_status as enum ('paid','due','late','cancelled');

create table hodos.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  lang text not null default 'fr' check (lang in ('fr','en')),
  city text not null default 'Yaoundé',
  role hodos.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table hodos.categories (
  id serial primary key,
  kind hodos.business_kind not null,
  slug text not null unique,
  name_en text not null,
  name_fr text not null,
  image_url text,
  sort int not null default 0,
  is_active boolean not null default true
);

create table hodos.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references hodos.profiles(id) on delete restrict,
  category_id int references hodos.categories(id),
  kind hodos.business_kind not null,
  name text not null,
  slug text unique,
  description text,
  photo_url text,
  city text not null default 'Yaoundé',
  quartier text,
  address text,
  lat double precision,
  lng double precision,
  phone text,
  whatsapp text,
  delivery_zones text[] not null default '{}',
  delivery_fee_fcfa int not null default 0 check (delivery_fee_fcfa >= 0),
  plan hodos.plan not null default 'free',
  status hodos.business_status not null default 'pending',
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create index on hodos.businesses (status, category_id);
create index on hodos.businesses (owner_id);

create table hodos.business_hours (
  id serial primary key,
  business_id uuid not null references hodos.businesses(id) on delete cascade,
  label_en text not null,
  label_fr text not null,
  detail_en text,
  detail_fr text,
  sort int not null default 0
);

create table hodos.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references hodos.businesses(id) on delete cascade,
  section text,
  name_en text not null,
  name_fr text not null,
  price_fcfa int not null check (price_fcfa >= 0),
  image_url text,
  in_stock boolean not null default true,
  needs_prescription boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index on hodos.products (business_id);

create table hodos.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('HD-' || lpad((floor(random()*10000))::int::text, 4, '0') || substr(md5(random()::text),1,2)),
  customer_id uuid not null references hodos.profiles(id),
  business_id uuid not null references hodos.businesses(id),
  mode hodos.order_mode not null,
  address text,
  zone text,
  payment hodos.payment_method not null,
  status hodos.order_status not null default 'sent',
  subtotal_fcfa int not null default 0,
  delivery_fee_fcfa int not null default 0,
  total_fcfa int generated always as (subtotal_fcfa + delivery_fee_fcfa) stored,
  note text,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on hodos.orders (business_id, status);
create index on hodos.orders (customer_id);

create table hodos.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references hodos.orders(id) on delete cascade,
  product_id uuid references hodos.products(id) on delete set null,
  name text not null,
  qty int not null check (qty > 0),
  unit_price_fcfa int not null check (unit_price_fcfa >= 0)
);
create index on hodos.order_items (order_id);

create table hodos.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references hodos.profiles(id),
  business_id uuid not null references hodos.businesses(id),
  package text not null,
  price_fcfa int not null default 0,
  starts_at timestamptz not null,
  status hodos.booking_status not null default 'requested',
  note text,
  created_at timestamptz not null default now()
);
create index on hodos.bookings (business_id, starts_at);

create table hodos.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references hodos.businesses(id) on delete cascade,
  plan hodos.plan not null default 'featured',
  amount_fcfa int not null default 5000,
  period_start date not null,
  period_end date not null,
  status hodos.sub_status not null default 'due',
  created_at timestamptz not null default now()
);

create table hodos.saved_places (
  customer_id uuid not null references hodos.profiles(id) on delete cascade,
  business_id uuid not null references hodos.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, business_id)
);

-- helpers (security definer so RLS policies can call them without recursion)
create or replace function hodos.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from hodos.profiles p where p.id = (select auth.uid()) and p.role in ('admin','super_admin'));
$$;

create or replace function hodos.owns_business(b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from hodos.businesses x where x.id = b and x.owner_id = (select auth.uid()));
$$;

-- RLS on everything
alter table hodos.profiles enable row level security;
alter table hodos.categories enable row level security;
alter table hodos.businesses enable row level security;
alter table hodos.business_hours enable row level security;
alter table hodos.products enable row level security;
alter table hodos.orders enable row level security;
alter table hodos.order_items enable row level security;
alter table hodos.bookings enable row level security;
alter table hodos.subscriptions enable row level security;
alter table hodos.saved_places enable row level security;

-- profiles: you see and edit yourself; you cannot promote yourself
create policy profiles_self_read on hodos.profiles for select to authenticated using (id = (select auth.uid()) or hodos.is_admin());
create policy profiles_self_insert on hodos.profiles for insert to authenticated with check (id = (select auth.uid()) and role = 'customer');
create policy profiles_self_update on hodos.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = (select p.role from hodos.profiles p where p.id = (select auth.uid())));
create policy profiles_admin_all on hodos.profiles for all to authenticated using (hodos.is_admin()) with check (hodos.is_admin());

-- categories: public read, admin write
create policy categories_read on hodos.categories for select to anon, authenticated using (is_active or hodos.is_admin());
create policy categories_admin on hodos.categories for all to authenticated using (hodos.is_admin()) with check (hodos.is_admin());

-- businesses: public sees approved; owner sees own; owner can create (always pending, free); admin all
create policy businesses_public_read on hodos.businesses for select to anon, authenticated using (status = 'approved' or owner_id = (select auth.uid()) or hodos.is_admin());
create policy businesses_owner_insert on hodos.businesses for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'pending' and plan = 'free');
create policy businesses_owner_update on hodos.businesses for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy businesses_admin on hodos.businesses for all to authenticated using (hodos.is_admin()) with check (hodos.is_admin());

-- owners may not change status/plan themselves
create or replace function hodos.guard_business_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not hodos.is_admin() then
    new.status := old.status;
    new.plan := old.plan;
    new.approved_at := old.approved_at;
    new.owner_id := old.owner_id;
  end if;
  return new;
end; $$;
create trigger businesses_guard before update on hodos.businesses for each row execute function hodos.guard_business_fields();

-- hours & products: public read when business approved; owner manages
create policy hours_read on hodos.business_hours for select to anon, authenticated using (exists (select 1 from hodos.businesses b where b.id = business_id and (b.status = 'approved' or b.owner_id = (select auth.uid()))) or hodos.is_admin());
create policy hours_owner on hodos.business_hours for all to authenticated using (hodos.owns_business(business_id) or hodos.is_admin()) with check (hodos.owns_business(business_id) or hodos.is_admin());
create policy products_read on hodos.products for select to anon, authenticated using (exists (select 1 from hodos.businesses b where b.id = business_id and (b.status = 'approved' or b.owner_id = (select auth.uid()))) or hodos.is_admin());
create policy products_owner on hodos.products for all to authenticated using (hodos.owns_business(business_id) or hodos.is_admin()) with check (hodos.owns_business(business_id) or hodos.is_admin());

-- orders: customer sees/creates own; business owner sees and updates theirs
create policy orders_read on hodos.orders for select to authenticated using (customer_id = (select auth.uid()) or hodos.owns_business(business_id) or hodos.is_admin());
create policy orders_customer_insert on hodos.orders for insert to authenticated with check (customer_id = (select auth.uid()) and status = 'sent');
create policy orders_update on hodos.orders for update to authenticated using (customer_id = (select auth.uid()) or hodos.owns_business(business_id) or hodos.is_admin()) with check (customer_id = (select auth.uid()) or hodos.owns_business(business_id) or hodos.is_admin());
create policy order_items_read on hodos.order_items for select to authenticated using (exists (select 1 from hodos.orders o where o.id = order_id and (o.customer_id = (select auth.uid()) or hodos.owns_business(o.business_id) or hodos.is_admin())));
create policy order_items_insert on hodos.order_items for insert to authenticated with check (exists (select 1 from hodos.orders o where o.id = order_id and o.customer_id = (select auth.uid()) and o.status = 'sent'));

-- bookings
create policy bookings_read on hodos.bookings for select to authenticated using (customer_id = (select auth.uid()) or hodos.owns_business(business_id) or hodos.is_admin());
create policy bookings_insert on hodos.bookings for insert to authenticated with check (customer_id = (select auth.uid()) and status = 'requested');
create policy bookings_update on hodos.bookings for update to authenticated using (customer_id = (select auth.uid()) or hodos.owns_business(business_id) or hodos.is_admin()) with check (customer_id = (select auth.uid()) or hodos.owns_business(business_id) or hodos.is_admin());

-- subscriptions: owner reads own, admin manages
create policy subs_read on hodos.subscriptions for select to authenticated using (hodos.owns_business(business_id) or hodos.is_admin());
create policy subs_admin on hodos.subscriptions for all to authenticated using (hodos.is_admin()) with check (hodos.is_admin());

-- saved places
create policy saved_self on hodos.saved_places for all to authenticated using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));

-- API access (tables still protected by RLS)
grant usage on schema hodos to anon, authenticated, service_role;
grant select on all tables in schema hodos to anon;
grant select, insert, update, delete on all tables in schema hodos to authenticated;
grant all on all tables in schema hodos to service_role;
grant usage, select on all sequences in schema hodos to authenticated, service_role;
revoke execute on all functions in schema hodos from public, anon;
grant execute on function hodos.is_admin(), hodos.owns_business(uuid) to authenticated;
