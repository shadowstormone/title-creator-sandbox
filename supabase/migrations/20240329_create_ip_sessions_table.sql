create table if not exists ip_sessions (
  user_id uuid references auth.users(id) on delete cascade,
  ip_address text not null,
  last_active timestamp with time zone not null default now(),
  primary key (user_id, ip_address)
);

-- Add RLS policies
alter table ip_sessions enable row level security;

create policy "Users can only access their own IP sessions"
  on ip_sessions for all
  using (auth.uid() = user_id);