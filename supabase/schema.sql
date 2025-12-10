-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories Table
create table if not exists public.categories (
  id uuid not null default uuid_generate_v4(),
  name text not null,
  slug text not null,
  image_url text null,
  created_at timestamp with time zone not null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug)
);

-- Products Table
create table if not exists public.products (
  id uuid not null default uuid_generate_v4(),
  category_id uuid null,
  name text not null,
  description text null,
  price numeric not null,
  sale_price numeric null,
  stock integer not null default 0,
  images text[] null,
  is_featured boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign key (category_id) references categories (id) on delete set null
);

-- Orders Table
create table if not exists public.orders (
  id uuid not null default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  total_amount numeric not null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id)
);

-- Order Items Table
create table if not exists public.order_items (
  id uuid not null default uuid_generate_v4(),
  order_id uuid not null,
  product_id uuid null,
  quantity integer not null,
  price numeric not null,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign key (order_id) references orders (id) on delete cascade,
  constraint order_items_product_id_fkey foreign key (product_id) references products (id) on delete set null
);

-- Profiles Table (For Auth & Roles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null default 'user',
  created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;

-- Policies (Public Read for Storefront)
create policy "Enable read access for all users" on public.categories for select using (true);
create policy "Enable read access for all users" on public.products for select using (true);

-- Policies (Public Insert for Orders)
create policy "Enable insert for all users" on public.orders for insert with check (true);
create policy "Enable insert for all users" on public.order_items for insert with check (true);
create policy "Enable read access for all users" on public.orders for select using (true);
create policy "Enable read access for all users" on public.order_items for select using (true);

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cart Items Table (Added for Live Cart Feature)
create table if not exists public.cart_items (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamp with time zone not null default now(),
  constraint cart_items_pkey primary key (id),
  constraint cart_items_user_product_unique unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "Users can view own cart items" on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart items" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart items" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart items" on public.cart_items for delete using (auth.uid() = user_id);

create policy "Admins can view all cart items" on public.cart_items for select using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
