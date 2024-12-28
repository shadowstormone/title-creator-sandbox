-- First, drop existing tables and policies
drop policy if exists "Give public access to anime-images" on storage.objects;
drop policy if exists "Enable image uploads for authenticated users only" on storage.objects;
drop table if exists public.animes cascade;
drop table if exists public.profiles cascade;

-- Create profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text not null,
    role text check (role in ('creator', 'admin', 'moderator', 'technician', 'dubber', 'vip', 'subscriber', 'user')) default 'user',
    is_superadmin boolean default false,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create animes table
create table public.animes (
    id bigint primary key generated always as identity,
    title text not null,
    title_en text not null,
    description text,
    genres text[] default '{}',
    total_episodes integer default 0,
    uploaded_episodes integer default 0,
    year integer,
    season text,
    studio text,
    voice_acting text,
    timing text,
    image_url text,
    views integer default 0,
    rating numeric(3,2) default 0.00,
    status text check (status in ('ongoing', 'completed', 'announced')) default 'announced',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id)
);

-- Set up RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile"
    on profiles for update using (
        auth.uid() = id
    );

-- Set up RLS for animes
alter table public.animes enable row level security;

create policy "Animes are viewable by everyone"
    on animes for select
    using ( true );

create policy "Only authorized users can insert animes"
    on animes for insert
    with check (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and (
                profiles.is_superadmin = true
                or profiles.role in ('creator', 'admin')
            )
        )
    );

create policy "Only authorized users can update animes"
    on animes for update
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and (
                profiles.is_superadmin = true
                or profiles.role in ('creator', 'admin')
            )
        )
    );

-- Create updated_at triggers
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

create trigger handle_animes_updated_at
    before update on public.animes
    for each row
    execute procedure public.handle_updated_at();

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', 'User'),
        coalesce(new.raw_user_meta_data->>'role', 'user')
    );
    return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists and create it again
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Set up storage
insert into storage.buckets (id, name, public)
select 'anime-images', 'anime-images', true
where not exists (
    select 1 from storage.buckets where id = 'anime-images'
);

create policy "Give public access to anime-images"
    on storage.objects for select
    using ( bucket_id = 'anime-images' );

create policy "Enable image uploads for authenticated users only"
    on storage.objects for insert
    with check (
        bucket_id = 'anime-images'
        and auth.role() = 'authenticated'
    );

-- Create indexes
create index if not exists animes_title_en_idx on public.animes (title_en);
create index if not exists animes_created_at_idx on public.animes (created_at);
create index if not exists animes_rating_idx on public.animes (rating desc);
create index if not exists animes_views_idx on public.animes (views desc);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.animes to anon, authenticated;
grant all on public.animes_id_seq to anon, authenticated;