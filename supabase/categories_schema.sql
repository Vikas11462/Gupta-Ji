-- Create categories table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies

-- Everyone can view categories
create policy "Public can view categories" on public.categories
  for select using (true);

-- Only admins can insert/update/delete
create policy "Admins can insert categories" on public.categories
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update categories" on public.categories
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete categories" on public.categories
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Insert default categories
insert into public.categories (name) values 
  ('Groceries'), ('Snacks'), ('Beverages'), ('Personal Care'), ('Household')
on conflict (name) do nothing;
