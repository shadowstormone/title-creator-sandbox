create table public.animes (
  id bigint primary key generated always as identity,
  title text not null,
  titleEn text not null,
  description text,
  genres text[] default '{}',
  totalEpisodes integer default 0,
  uploadedEpisodes integer default 0,
  year integer,
  season text,
  studio text,
  voiceActing text,
  timing text,
  imageUrl text,
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
create index animes_titleEn_idx on public.animes (titleEn);
create index animes_created_at_idx on public.animes (created_at);