-- Shared board storage for Release the Tickets.
-- One row per "room" (share code). State is the whole app state as JSON.
create table if not exists public.boards (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.boards enable row level security;

-- The room code is the secret. Anyone with the code can read/write that room.
create policy "boards are open by room code" on public.boards
  for all using (true) with check (true);

-- Realtime so both phones update live.
alter publication supabase_realtime add table public.boards;
