-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  role text check (role in ('creator', 'admin', 'moderator', 'technician', 'dubber', 'vip', 'subscriber', 'user')),
  is_superadmin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to set updated_at on update
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, new.raw_user_meta_data->>'username', coalesce(new.raw_user_meta_data->>'role', 'user'));
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create a profile for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();