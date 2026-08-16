-- ============================================
-- TAB ADS (PUBLISITE)
-- ============================================
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  eyebrow text,
  title text not null,
  subtitle text,
  link text default 'boutik.html',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TAB PWODWI (VÈSYON SENP POU ADMIN)
-- ============================================
create table public.admin_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price decimal(10,2) not null,
  category text,
  stock int default 0,
  image_url text,
  created_at timestamptz default now()
);

-- ============================================
-- TAB LÒD (POU JESYON ADMIN)
-- ============================================
create table public.admin_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  customer_address text,
  total decimal(10,2),
  status text default 'pending',
  created_at timestamptz default now()
);

-- ============================================
-- AKTIVE ROW LEVEL SECURITY (RLS)
-- ============================================
alter table public.ads enable row level security;
alter table public.admin_products enable row level security;
alter table public.admin_orders enable row level security;

-- Politk lekti piblik
create policy "Piblik ka li ads" on public.ads for select using (true);
create policy "Piblik ka li pwodwi admin" on public.admin_products for select using (true);
create policy "Piblik ka li lòd admin" on public.admin_orders for select using (true);

-- Politik ekriti (sèlman admin)
create policy "Admin ka jere ads" on public.ads
  for all using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin ka jere pwodwi" on public.admin_products
  for all using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin ka jere lòd" on public.admin_orders
  for all using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
