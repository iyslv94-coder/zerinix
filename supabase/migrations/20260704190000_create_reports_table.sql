create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  prompt text,
  report_type text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sections jsonb not null default '{}'::jsonb
);

create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);

alter table public.reports enable row level security;

create or replace function public.set_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_reports_updated_at on public.reports;

create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_reports_updated_at();

drop policy if exists "Users can read own reports" on public.reports;
drop policy if exists "Users can insert own reports" on public.reports;
drop policy if exists "Users can update own reports" on public.reports;
drop policy if exists "Users can delete own reports" on public.reports;

create policy "Users can read own reports"
on public.reports
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own reports"
on public.reports
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own reports"
on public.reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own reports"
on public.reports
for delete
to authenticated
using (auth.uid() = user_id);
