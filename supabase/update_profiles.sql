-- Add new columns to profiles table
alter table public.profiles 
add column if not exists full_name text,
add column if not exists phone text,
add column if not exists address text,
add column if not exists avatar_url text;

-- Update the handle_new_user function to include metadata if available
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    'user',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;
