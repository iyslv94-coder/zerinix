alter table public.ai_messages
drop constraint if exists ai_messages_status_valid;

alter table public.ai_messages
add constraint ai_messages_status_valid
check (status in ('streaming', 'complete', 'failed'));
