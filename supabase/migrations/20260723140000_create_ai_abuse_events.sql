create table if not exists public.ai_abuse_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null
    check (type in ('rate_limit', 'duplicate_request', 'oversized_input', 'suspicious_activity')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_abuse_events_user_created_idx
  on public.ai_abuse_events (user_id, created_at desc);

create index if not exists ai_abuse_events_type_created_idx
  on public.ai_abuse_events (type, created_at desc);

alter table public.ai_abuse_events enable row level security;

create policy "Users can insert own ai abuse events"
  on public.ai_abuse_events
  for insert
  with check (auth.uid() = user_id);

create policy "Users can read own ai abuse events"
  on public.ai_abuse_events
  for select
  using (auth.uid() = user_id);
