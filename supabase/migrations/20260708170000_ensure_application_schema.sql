create extension if not exists "pgcrypto";

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'user',
  content text not null default '',
  mode text,
  status text not null default 'complete',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists title text not null default 'New conversation',
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

alter table public.ai_messages
add column if not exists conversation_id uuid references public.ai_conversations(id) on delete cascade,
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists role text not null default 'user',
add column if not exists content text not null default '',
add column if not exists mode text,
add column if not exists status text not null default 'complete',
add column if not exists attachments jsonb not null default '[]'::jsonb,
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

alter table public.ai_messages
drop constraint if exists ai_messages_role_valid,
drop constraint if exists ai_messages_status_valid,
drop constraint if exists ai_messages_mode_valid;

alter table public.ai_messages
add constraint ai_messages_role_valid check (role in ('user', 'assistant')),
add constraint ai_messages_status_valid check (status in ('streaming', 'complete', 'failed')),
add constraint ai_messages_mode_valid check (mode is null or mode in ('plan', 'market', 'chat'));

alter table public.ai_conversations
drop constraint if exists ai_conversations_title_not_empty;

alter table public.ai_conversations
add constraint ai_conversations_title_not_empty check (length(trim(title)) > 0);

create index if not exists ai_conversations_user_id_updated_at_idx
  on public.ai_conversations (user_id, updated_at desc);

create index if not exists ai_messages_user_conversation_created_at_idx
  on public.ai_messages (user_id, conversation_id, created_at asc);

create or replace function public.set_ai_conversations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_ai_messages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_conversations_updated_at on public.ai_conversations;
create trigger set_ai_conversations_updated_at
before update on public.ai_conversations
for each row
execute function public.set_ai_conversations_updated_at();

drop trigger if exists set_ai_messages_updated_at on public.ai_messages;
create trigger set_ai_messages_updated_at
before update on public.ai_messages
for each row
execute function public.set_ai_messages_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "Users can read own AI conversations" on public.ai_conversations;
drop policy if exists "Users can insert own AI conversations" on public.ai_conversations;
drop policy if exists "Users can update own AI conversations" on public.ai_conversations;
drop policy if exists "Users can delete own AI conversations" on public.ai_conversations;

create policy "Users can read own AI conversations"
on public.ai_conversations
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own AI conversations"
on public.ai_conversations
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own AI conversations"
on public.ai_conversations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own AI conversations"
on public.ai_conversations
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own AI messages" on public.ai_messages;
drop policy if exists "Users can insert own AI messages" on public.ai_messages;
drop policy if exists "Users can update own AI messages" on public.ai_messages;
drop policy if exists "Users can delete own AI messages" on public.ai_messages;

create policy "Users can read own AI messages"
on public.ai_messages
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own AI messages"
on public.ai_messages
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.ai_conversations
    where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
  )
);

create policy "Users can update own AI messages"
on public.ai_messages
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.ai_conversations
    where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
  )
);

create policy "Users can delete own AI messages"
on public.ai_messages
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.ai_chat_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_country text,
  preferred_industries text[] not null default '{}'::text[],
  investment_budget_ranges text[] not null default '{}'::text[],
  preferred_language text,
  experience_level text,
  available_time text,
  business_interests text[] not null default '{}'::text[],
  risk_tolerance text,
  long_term_goals text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_ai_chat_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_chat_profiles_updated_at on public.ai_chat_profiles;
create trigger set_ai_chat_profiles_updated_at
before update on public.ai_chat_profiles
for each row
execute function public.set_ai_chat_profiles_updated_at();

alter table public.ai_chat_profiles enable row level security;

drop policy if exists "Users can read own AI chat profile" on public.ai_chat_profiles;
drop policy if exists "Users can insert own AI chat profile" on public.ai_chat_profiles;
drop policy if exists "Users can update own AI chat profile" on public.ai_chat_profiles;
drop policy if exists "Users can delete own AI chat profile" on public.ai_chat_profiles;

create policy "Users can read own AI chat profile"
on public.ai_chat_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own AI chat profile"
on public.ai_chat_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own AI chat profile"
on public.ai_chat_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own AI chat profile"
on public.ai_chat_profiles
for delete
to authenticated
using (auth.uid() = user_id);

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

alter table public.reports
add column if not exists prompt text,
add column if not exists report_type text not null default 'Business Plan',
add column if not exists status text not null default 'completed',
add column if not exists sections jsonb not null default '{}'::jsonb,
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

create table if not exists public.report_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'report_workspaces_name_not_empty'
      and conrelid = 'public.report_workspaces'::regclass
  ) then
    alter table public.report_workspaces
    add constraint report_workspaces_name_not_empty check (length(trim(name)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'report_workspaces_user_name_unique'
      and conrelid = 'public.report_workspaces'::regclass
  ) then
    alter table public.report_workspaces
    add constraint report_workspaces_user_name_unique unique (user_id, name);
  end if;
end;
$$;

alter table public.reports
add column if not exists workspace_id uuid references public.report_workspaces(id) on delete restrict;

create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);

create index if not exists report_workspaces_user_id_created_at_idx
  on public.report_workspaces (user_id, created_at desc);

create index if not exists reports_workspace_id_created_at_idx
  on public.reports (workspace_id, created_at desc);

create or replace function public.set_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_report_workspaces_updated_at()
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

drop trigger if exists set_report_workspaces_updated_at on public.report_workspaces;
create trigger set_report_workspaces_updated_at
before update on public.report_workspaces
for each row
execute function public.set_report_workspaces_updated_at();

alter table public.reports enable row level security;
alter table public.report_workspaces enable row level security;

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
with check (
  auth.uid() = user_id
  and (
    workspace_id is null
    or exists (
      select 1
      from public.report_workspaces
      where report_workspaces.id = reports.workspace_id
        and report_workspaces.user_id = auth.uid()
    )
  )
);

create policy "Users can update own reports"
on public.reports
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    workspace_id is null
    or exists (
      select 1
      from public.report_workspaces
      where report_workspaces.id = reports.workspace_id
        and report_workspaces.user_id = auth.uid()
    )
  )
);

create policy "Users can delete own reports"
on public.reports
for delete
to authenticated
using (auth.uid() = user_id);

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

create table if not exists public.user_billing_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'business')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  report_field text,
  prompt_hash text not null,
  model text not null,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'business')),
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  cache_hit boolean not null default false,
  status text not null default 'completed',
  response_time_ms integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_response_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cache_key text not null,
  prompt_hash text not null,
  endpoint text not null,
  report_field text,
  language text not null,
  model text not null,
  response_text text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  hit_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  unique (user_id, cache_key)
);

create index if not exists ai_usage_events_user_created_idx
  on public.ai_usage_events (user_id, created_at desc);

create index if not exists ai_usage_events_endpoint_created_idx
  on public.ai_usage_events (endpoint, created_at desc);

create index if not exists ai_usage_events_prompt_hash_idx
  on public.ai_usage_events (prompt_hash);

create index if not exists ai_response_cache_user_key_idx
  on public.ai_response_cache (user_id, cache_key);

create index if not exists ai_response_cache_expires_idx
  on public.ai_response_cache (expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_billing_profiles_updated_at on public.user_billing_profiles;
create trigger set_user_billing_profiles_updated_at
before update on public.user_billing_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_ai_response_cache_updated_at on public.ai_response_cache;
create trigger set_ai_response_cache_updated_at
before update on public.ai_response_cache
for each row
execute function public.set_updated_at();

alter table public.user_billing_profiles enable row level security;
alter table public.ai_usage_events enable row level security;
alter table public.ai_response_cache enable row level security;

drop policy if exists "Users can read own billing profile" on public.user_billing_profiles;
drop policy if exists "Users can create own billing profile" on public.user_billing_profiles;
drop policy if exists "Users can read own ai usage" on public.ai_usage_events;
drop policy if exists "Users can create own ai usage" on public.ai_usage_events;
drop policy if exists "Users can read own ai cache" on public.ai_response_cache;
drop policy if exists "Users can create own ai cache" on public.ai_response_cache;
drop policy if exists "Users can update own ai cache" on public.ai_response_cache;
drop policy if exists "Users can delete own ai cache" on public.ai_response_cache;

create policy "Users can read own billing profile"
on public.user_billing_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own billing profile"
on public.user_billing_profiles
for insert
to authenticated
with check (auth.uid() = user_id and plan_tier = 'free');

create policy "Users can read own ai usage"
on public.ai_usage_events
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own ai usage"
on public.ai_usage_events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can read own ai cache"
on public.ai_response_cache
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own ai cache"
on public.ai_response_cache
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own ai cache"
on public.ai_response_cache
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own ai cache"
on public.ai_response_cache
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.get_global_ai_response_cache_entry(
  request_cache_key text
)
returns table (
  response_text text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  estimated_cost_usd numeric,
  model text,
  hit_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_response_cache
  set hit_count = hit_count + 1
  where id = (
    select id
    from public.ai_response_cache
    where cache_key = request_cache_key
      and expires_at > now()
    order by updated_at desc
    limit 1
  );

  return query
  select
    c.response_text,
    c.prompt_tokens,
    c.completion_tokens,
    c.total_tokens,
    c.estimated_cost_usd,
    c.model,
    c.hit_count
  from public.ai_response_cache c
  where c.cache_key = request_cache_key
    and c.expires_at > now()
  order by c.updated_at desc
  limit 1;
end;
$$;

create or replace function public.upsert_global_ai_response_cache_entry(
  request_cache_key text,
  request_prompt_hash text,
  request_endpoint text,
  request_report_field text,
  request_language text,
  request_model text,
  request_response_text text,
  request_prompt_tokens integer,
  request_completion_tokens integer,
  request_total_tokens integer,
  request_estimated_cost_usd numeric,
  request_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_cache_id uuid;
begin
  select id
  into existing_cache_id
  from public.ai_response_cache
  where cache_key = request_cache_key
  order by updated_at desc
  limit 1;

  if existing_cache_id is null then
    insert into public.ai_response_cache (
      user_id,
      cache_key,
      prompt_hash,
      endpoint,
      report_field,
      language,
      model,
      response_text,
      prompt_tokens,
      completion_tokens,
      total_tokens,
      estimated_cost_usd,
      expires_at
    )
    values (
      auth.uid(),
      request_cache_key,
      request_prompt_hash,
      request_endpoint,
      request_report_field,
      request_language,
      request_model,
      request_response_text,
      request_prompt_tokens,
      request_completion_tokens,
      request_total_tokens,
      request_estimated_cost_usd,
      request_expires_at
    );
  else
    update public.ai_response_cache
    set
      prompt_hash = request_prompt_hash,
      endpoint = request_endpoint,
      report_field = request_report_field,
      language = request_language,
      model = request_model,
      response_text = request_response_text,
      prompt_tokens = request_prompt_tokens,
      completion_tokens = request_completion_tokens,
      total_tokens = request_total_tokens,
      estimated_cost_usd = request_estimated_cost_usd,
      expires_at = request_expires_at
    where id = existing_cache_id;
  end if;
end;
$$;

revoke all on function public.get_global_ai_response_cache_entry(text) from public;
revoke all on function public.upsert_global_ai_response_cache_entry(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  integer,
  numeric,
  timestamptz
) from public;

grant execute on function public.get_global_ai_response_cache_entry(text) to authenticated;
grant execute on function public.upsert_global_ai_response_cache_entry(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  integer,
  integer,
  numeric,
  timestamptz
) to authenticated;
