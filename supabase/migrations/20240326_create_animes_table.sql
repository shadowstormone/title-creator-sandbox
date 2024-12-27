-- Drop existing objects if they exist
drop policy if exists "Give public access to anime-images" on storage.objects;
drop policy if exists "Enable image uploads for authenticated users only" on storage.objects;
drop table if exists public.animes;

-- Create the animes table with snake_case column names
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.animes enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.animes
  for select using (true);

create policy "Enable insert for authenticated users only" on public.animes
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.animes
  for update using (auth.role() = 'authenticated');

-- Create indexes
create index animes_title_en_idx on public.animes (title_en);
create index animes_created_at_idx on public.animes (created_at);

-- Create storage bucket for anime images if it doesn't exist
insert into storage.buckets (id, name, public)
select 'anime-images', 'anime-images', true
where not exists (
  select 1 from storage.buckets where id = 'anime-images'
);

-- Set up storage policies
create policy "Give public access to anime-images"
on storage.objects for select
using ( bucket_id = 'anime-images' );

create policy "Enable image uploads for authenticated users only"
on storage.objects for insert
with check (
  bucket_id = 'anime-images' 
  and auth.role() = 'authenticated'
);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.animes to anon, authenticated;
grant all on public.animes_id_seq to anon, authenticated;