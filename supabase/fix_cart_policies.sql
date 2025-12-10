-- 1. Drop existing policies to avoid "already exists" errors
drop policy if exists "Users can view own cart items" on public.cart_items;
drop policy if exists "Users can insert own cart items" on public.cart_items;
drop policy if exists "Users can update own cart items" on public.cart_items;
drop policy if exists "Users can delete own cart items" on public.cart_items;
drop policy if exists "Admins can view all cart items" on public.cart_items;

-- 2. Re-create policies
create policy "Users can view own cart items" on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart items" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart items" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart items" on public.cart_items for delete using (auth.uid() = user_id);

-- 3. Admin Policy (Crucial for Live Carts)
create policy "Admins can view all cart items" on public.cart_items for select using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- 4. Ensure you are an admin (Replace with your email if needed)
-- update public.profiles set role = 'admin' where email = 'your_email@example.com';
