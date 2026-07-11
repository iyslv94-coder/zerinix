create table if not exists public.user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_type text not null,
  content text not null,
  source text not null default 'explicit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_memories_type_valid
    check (
      memory_type in (
        'name',
        'company',
        'preference',
        'writing_style',
        'language',
        'long_term_goal',
        'general'
      )
    ),
  constraint user_memories_source_valid
    check (source in ('explicit', 'profile', 'system')),
  constraint user_memories_content_not_empty
    check (length(trim(content)) > 0)
);

create index if not exists user_memories_user_updated_idx
on public.user_memories (user_id, updated_at desc);

create unique index if not exists user_memories_user_type_content_unique
on public.user_memories (user_id, memory_type, lower(content));

alter table public.user_memories enable row level security;

create or replace function public.set_user_memories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_memories_updated_at on public.user_memories;

create trigger set_user_memories_updated_at
before update on public.user_memories
for each row
execute function public.set_user_memories_updated_at();

drop policy if exists "Users can read own memories" on public.user_memories;
drop policy if exists "Users can insert own memories" on public.user_memories;
drop policy if exists "Users can update own memories" on public.user_memories;
drop policy if exists "Users can delete own memories" on public.user_memories;

create policy "Users can read own memories"
on public.user_memories
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own memories"
on public.user_memories
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own memories"
on public.user_memories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own memories"
on public.user_memories
for delete
to authenticated
using (auth.uid() = user_id);
