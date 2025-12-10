-- Drop existing table to ensure clean schema
drop table if exists public.cart_items;

-- Create cart_items table with product_id as TEXT
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  product_id text not null, -- Changed from UUID to TEXT to match mock data
  quantity integer not null default 1,
  unique(user_id, product_id)
);

-- Enable RLS
alter table public.cart_items enable row level security;

-- Policies
create policy "Users can view own cart items" on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart items" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart items" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart items" on public.cart_items for delete using (auth.uid() = user_id);

-- Admin Policy
create policy "Admins can view all cart items" on public.cart_items for select using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
