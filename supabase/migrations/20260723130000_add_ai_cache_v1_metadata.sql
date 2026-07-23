alter table public.ai_response_cache
  add column if not exists operation_type text not null default 'chat',
  add column if not exists input_hash text,
  add column if not exists response_data jsonb not null default '{}'::jsonb,
  add column if not exists token_savings integer not null default 0;

update public.ai_response_cache
set
  input_hash = coalesce(input_hash, prompt_hash),
  response_data = case
    when response_data = '{}'::jsonb and response_text is not null
      then jsonb_build_object('text', response_text)
    else response_data
  end,
  token_savings = case
    when token_savings = 0 then coalesce(total_tokens, 0)
    else token_savings
  end
where input_hash is null
  or response_data = '{}'::jsonb
  or token_savings = 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ai_response_cache_operation_type_check'
      and conrelid = 'public.ai_response_cache'::regclass
  ) then
    alter table public.ai_response_cache
      add constraint ai_response_cache_operation_type_check
      check (operation_type in ('chat', 'plan_report', 'market_report', 'executive_report'));
  end if;
end $$;

create index if not exists ai_response_cache_user_operation_created_idx
  on public.ai_response_cache (user_id, operation_type, created_at desc);

create index if not exists ai_response_cache_input_hash_idx
  on public.ai_response_cache (input_hash);
