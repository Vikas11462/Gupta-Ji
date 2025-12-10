-- Create Cart Items Table
create table if not exists public.cart_items (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamp with time zone not null default now(),
  constraint cart_items_pkey primary key (id),
  constraint cart_items_user_product_unique unique (user_id, product_id)
);

-- Enable RLS
alter table public.cart_items enable row level security;

-- Policies
-- Users can view their own cart items
create policy "Users can view own cart items" 
on public.cart_items for select 
using (auth.uid() = user_id);

-- Users can insert their own cart items
create policy "Users can insert own cart items" 
on public.cart_items for insert 
with check (auth.uid() = user_id);

-- Users can update their own cart items
create policy "Users can update own cart items" 
on public.cart_items for update 
using (auth.uid() = user_id);

-- Users can delete their own cart items
create policy "Users can delete own cart items" 
on public.cart_items for delete 
using (auth.uid() = user_id);

-- Admins can view ALL cart items (for Spy Cart)
create policy "Admins can view all cart items" 
on public.cart_items for select 
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
