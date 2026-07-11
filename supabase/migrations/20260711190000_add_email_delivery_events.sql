create table if not exists public.email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  purpose text not null,
  subject text not null,
  provider_message_id text,
  status text not null,
  attempts integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint email_delivery_events_status_valid
    check (status in ('sent', 'failed', 'skipped')),
  constraint email_delivery_events_purpose_valid
    check (
      purpose in (
        'email_verification',
        'password_reset',
        'welcome',
        'workspace_invitation',
        'report_ready',
        'billing_receipt',
        'subscription',
        'security_alert'
      )
    )
);

create index if not exists email_delivery_events_user_created_idx
  on public.email_delivery_events (user_id, created_at desc);

create index if not exists email_delivery_events_purpose_created_idx
  on public.email_delivery_events (purpose, created_at desc);

create index if not exists email_delivery_events_status_created_idx
  on public.email_delivery_events (status, created_at desc);

alter table public.email_delivery_events enable row level security;

drop policy if exists "Users can read own email delivery events" on public.email_delivery_events;

create policy "Users can read own email delivery events"
on public.email_delivery_events
for select
to authenticated
using (auth.uid() = user_id);
