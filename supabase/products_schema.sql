-- Drop existing table if it exists (be careful with data loss, but we are migrating)
drop table if exists public.products cascade;

-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null, -- Primary price
  price_2 decimal(10,2),        -- Option 2
  price_3 decimal(10,2),        -- Option 3
  image text,
  category text not null,
  popular boolean default false,
  stock integer default 0
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies
-- Everyone can view products
create policy "Public can view products" on public.products
  for select using (true);

-- Only admins can insert/update/delete
create policy "Admins can insert products" on public.products
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update products" on public.products
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete products" on public.products
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
