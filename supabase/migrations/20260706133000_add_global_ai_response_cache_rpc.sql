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
