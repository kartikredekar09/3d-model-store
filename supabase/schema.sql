-- 3D Model Store — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It creates all tables, Row Level Security policies, an auto-profile
-- trigger, and seeds the categories + the 10 demo products.
--
-- Prices are integer rupees (₹). The store code (lib/) mirrors these tables.

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- SECURITY DEFINER so it can read profiles without triggering RLS recursion.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user. Created automatically on sign-up.
-- To make someone an admin: update profiles set role = 'admin' where email = '...';
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products — physical 3D-printed products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price > 0),
  sale_price integer check (sale_price is null or sale_price > 0),
  category_id uuid references public.categories (id) on delete set null,
  material text,
  formats text[] not null default '{}',
  preview_glb_url text,
  images text[] not null default '{}',
  weight_grams integer,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  fulfilment_type text not null default 'made_to_order'
    check (fulfilment_type in ('made_to_order', 'ready_stock')),
  stock_quantity integer not null default 0,
  dispatch_days integer not null default 3,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- addresses — saved delivery addresses (user_id null for guest checkouts)
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders
-- status: pending → confirmed → printing → packed → shipped →
--         out_for_delivery → delivered (or cancelled / refunded)
-- payment_status: pending / paid / failed / refunded
-- payment_method: prepaid (Razorpay) / cod
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  address_id uuid references public.addresses (id) on delete set null,
  subtotal integer not null default 0,
  shipping_charge integer not null default 0,
  total integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'printing', 'packed', 'shipped',
                      'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text not null default 'cod'
    check (payment_method in ('prepaid', 'cod')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- order_items — price is snapshotted at purchase time
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  title text not null,
  price integer not null,
  quantity integer not null default 1 check (quantity > 0)
);

-- ---------------------------------------------------------------------------
-- shipments — one per order; created by the admin after booking the
-- courier manually in Shiprocket (see the Physical Products Addendum)
-- ---------------------------------------------------------------------------
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  courier_name text,
  tracking_number text,
  tracking_url text,
  status text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- return_requests
-- ---------------------------------------------------------------------------
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  reason text not null,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected', 'completed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- reviews (Phase 2 feature — table ready now)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- coupons (Phase 2 feature — table ready now)
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null check (discount_percent between 1 and 100),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.return_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;

-- profiles: users read/update their own row; admins read all; new users can
-- insert their own row (the trigger normally does this).
create policy "profiles: owner read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: owner insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = id);

-- categories: public read; admins manage.
create policy "categories: public read" on public.categories
  for select using (true);
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products: anyone reads published products; admins see and manage all.
create policy "products: public read published" on public.products
  for select using (is_published = true or public.is_admin());
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- addresses: owners manage their own; admins read all.
create policy "addresses: owner read" on public.addresses
  for select using (auth.uid() = user_id or public.is_admin());
create policy "addresses: owner insert" on public.addresses
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "addresses: owner update" on public.addresses
  for update using (auth.uid() = user_id);
create policy "addresses: owner delete" on public.addresses
  for delete using (auth.uid() = user_id);

-- orders: owners read their own; admins read all and update. Inserts are
-- allowed for checkout (the API uses the service-role key in production,
-- which bypasses RLS; the policy covers anon-key setups and guest checkout).
create policy "orders: owner read" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders: checkout insert" on public.orders
  for insert with check (true);
create policy "orders: admin update" on public.orders
  for update using (public.is_admin());

-- order_items: readable by the order owner or an admin.
create policy "order_items: owner read" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );
create policy "order_items: checkout insert" on public.order_items
  for insert with check (true);

-- shipments: readable by the order owner or an admin; admins manage.
create policy "shipments: owner read" on public.shipments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = shipments.order_id
        and orders.user_id = auth.uid()
    )
  );
create policy "shipments: admin write" on public.shipments
  for all using (public.is_admin()) with check (public.is_admin());

-- return_requests: owners read/insert their own; admins manage all.
create policy "return_requests: owner read" on public.return_requests
  for select using (auth.uid() = user_id or public.is_admin());
create policy "return_requests: owner insert" on public.return_requests
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "return_requests: admin update" on public.return_requests
  for update using (public.is_admin());

-- reviews: public read; signed-in users add their own; admins delete.
create policy "reviews: public read" on public.reviews
  for select using (true);
create policy "reviews: owner insert" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews: admin delete" on public.reviews
  for delete using (public.is_admin());

-- coupons: admins manage; anyone can read active, unexpired coupons.
create policy "coupons: public read active" on public.coupons
  for select using (
    public.is_admin()
    or (is_active = true and (expires_at is null or expires_at > now()))
  );
create policy "coupons: admin write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed data: categories + the 10 demo products (same as lib/demo-products.ts).
-- Safe to re-run: conflicts are ignored.
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Figurines', 'figurines'),
  ('Home Decor', 'home-decor'),
  ('Prototypes', 'prototypes'),
  ('Jewellery', 'jewellery'),
  ('Accessories', 'accessories')
on conflict (slug) do nothing;

insert into public.products
  (title, slug, description, price, sale_price, category_id, material,
   formats, preview_glb_url, images, weight_grams, length_cm, width_cm,
   height_cm, fulfilment_type, stock_quantity, dispatch_days, is_published,
   is_featured)
values
  ('Geometric Faceted Vase', 'geometric-faceted-vase',
   'A striking low-poly vase with crisp faceted panels. Printed in matte PLA, it looks great with dried flowers or on its own as a shelf piece.',
   449, 349, (select id from public.categories where slug = 'home-decor'),
   'PLA', array['STL', 'OBJ'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80'],
   180, 12, 12, 22, 'made_to_order', 0, 3, true, true),
  ('Articulated Dragon Figurine', 'articulated-dragon-figurine',
   'A fully articulated dragon with movable joints, printed in one piece — no assembly needed. A favourite desk companion and gift.',
   899, null, (select id from public.categories where slug = 'figurines'),
   'Silk PLA', array['STL'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=900&q=80'],
   220, 28, 8, 10, 'made_to_order', 0, 2, true, true),
  ('Honeycomb Desk Organiser', 'honeycomb-desk-organiser',
   'A modular honeycomb desk organiser with slots for pens, cables and cards. The cells link together, so you can start small and expand your set later.',
   599, null, (select id from public.categories where slug = 'home-decor'),
   'PLA', array['STL'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80'],
   310, 24, 12, 9, 'ready_stock', 5, 1, true, false),
  ('Low-Poly Fox Sculpture', 'low-poly-fox-sculpture',
   'A bold geometric fox sculpture that catches the light from every angle. Printed in wood-fill PLA with a smooth sanded finish.',
   749, 649, (select id from public.categories where slug = 'figurines'),
   'Wood-fill PLA', array['STL', 'OBJ'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=900&q=80'],
   260, 18, 10, 20, 'made_to_order', 0, 3, true, true),
  ('Mechanical Gear Wall Clock', 'mechanical-gear-wall-clock',
   'A working wall clock with exposed 3D-printed gears that turn as time passes. Ships with a silent quartz movement and wall-mounting hardware included.',
   1499, null, (select id from public.categories where slug = 'home-decor'),
   'PLA + quartz movement', array['STL'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=900&q=80'],
   420, 30, 30, 5, 'made_to_order', 0, 3, true, true),
  ('Personalised Name Plate', 'personalised-name-plate',
   'A custom 3D name plate for your door or desk. Share the name after ordering and it is printed in two-tone lettering.',
   399, null, (select id from public.categories where slug = 'home-decor'),
   'PLA (dual colour)', array['STL'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'],
   150, 25, 8, 2, 'made_to_order', 0, 2, true, false),
  ('Phone Stand Pro', 'phone-stand-pro',
   'A sturdy adjustable phone stand with a cable slot for charging while you watch. Fits all phone sizes, with non-slip feet.',
   299, 249, (select id from public.categories where slug = 'accessories'),
   'PETG', array['STL'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80'],
   90, 10, 8, 12, 'ready_stock', 12, 1, true, false),
  ('Miniature Taj Mahal Model', 'miniature-taj-mahal-model',
   'A detailed miniature Taj Mahal, printed in marble-white PLA with fine dome and minaret detail. A beautiful showpiece and a thoughtful gift.',
   1299, null, (select id from public.categories where slug = 'figurines'),
   'Marble PLA', array['STL', 'OBJ'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=900&q=80'],
   480, 22, 22, 18, 'made_to_order', 0, 3, true, true),
  ('Geometric Pendant Necklace', 'geometric-pendant-necklace',
   'A lightweight geometric pendant on an adjustable cord, printed in silk-finish resin. Hypoallergenic and comfortable for all-day wear.',
   349, null, (select id from public.categories where slug = 'jewellery'),
   'Resin', array['STL'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=80'],
   25, 4, 4, 1, 'ready_stock', 8, 1, true, false),
  ('Electronics Prototype Enclosure', 'electronics-prototype-enclosure',
   'A rugged snap-fit enclosure for Arduino and Raspberry Pi prototype boards, with vent slots and mounting posts. Ideal for students, makers and product teams.',
   999, null, (select id from public.categories where slug = 'prototypes'),
   'PETG', array['STL', 'STEP'],
   'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
   array['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=80',
         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
   200, 16, 11, 5, 'made_to_order', 0, 2, true, false)
on conflict (slug) do nothing;
