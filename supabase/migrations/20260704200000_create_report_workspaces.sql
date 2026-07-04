create table if not exists public.report_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_workspaces_name_not_empty check (length(trim(name)) > 0),
  constraint report_workspaces_user_name_unique unique (user_id, name)
);

create index if not exists report_workspaces_user_id_created_at_idx
  on public.report_workspaces (user_id, created_at desc);

alter table public.reports
add column if not exists workspace_id uuid references public.report_workspaces(id) on delete restrict;

alter table public.report_workspaces enable row level security;

create or replace function public.set_report_workspaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_report_workspaces_updated_at on public.report_workspaces;

create trigger set_report_workspaces_updated_at
before update on public.report_workspaces
for each row
execute function public.set_report_workspaces_updated_at();

drop policy if exists "Users can read own workspaces" on public.report_workspaces;
drop policy if exists "Users can insert own workspaces" on public.report_workspaces;
drop policy if exists "Users can update own workspaces" on public.report_workspaces;
drop policy if exists "Users can delete own workspaces" on public.report_workspaces;

create policy "Users can read own workspaces"
on public.report_workspaces
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own workspaces"
on public.report_workspaces
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own workspaces"
on public.report_workspaces
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own workspaces"
on public.report_workspaces
for delete
to authenticated
using (
  auth.uid() = user_id
  and not exists (
    select 1
    from public.reports
    where reports.workspace_id = report_workspaces.id
  )
);

insert into public.report_workspaces (user_id, name)
select distinct reports.user_id, 'General'
from public.reports
where reports.workspace_id is null
on conflict (user_id, name) do nothing;

update public.reports
set workspace_id = report_workspaces.id
from public.report_workspaces
where reports.workspace_id is null
  and report_workspaces.user_id = reports.user_id
  and report_workspaces.name = 'General';

alter table public.reports
alter column workspace_id set not null;

create index if not exists reports_workspace_id_created_at_idx
  on public.reports (workspace_id, created_at desc);

drop policy if exists "Users can insert own reports" on public.reports;
drop policy if exists "Users can update own reports" on public.reports;

create policy "Users can insert own reports"
on public.reports
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.report_workspaces
    where report_workspaces.id = reports.workspace_id
      and report_workspaces.user_id = auth.uid()
  )
);

create policy "Users can update own reports"
on public.reports
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.report_workspaces
    where report_workspaces.id = reports.workspace_id
      and report_workspaces.user_id = auth.uid()
  )
);
