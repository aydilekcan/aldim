create table if not exists public.device_tokens (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 token text not null unique, platform text not null check(platform in ('ios','android')),
 enabled boolean not null default true,last_seen_at timestamptz not null default now()
);
alter table public.device_tokens enable row level security;
create index if not exists device_tokens_user_idx on public.device_tokens(user_id);
create policy device_tokens_own on public.device_tokens for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
grant select,insert,update,delete on public.device_tokens to authenticated;
create table if not exists public.notification_deliveries (
 id uuid primary key default gen_random_uuid(),reminder_id uuid not null references public.reminders(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 delivery_date date not null,channel text not null check(channel in ('push','email','sms')),
 target_key text not null,status text not null default 'pending',attempts integer not null default 0,
 provider_id text,error text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(reminder_id,delivery_date,channel,target_key)
);
alter table public.notification_deliveries enable row level security;
create index if not exists deliveries_user_idx on public.notification_deliveries(user_id);
create index if not exists deliveries_reminder_idx on public.notification_deliveries(reminder_id);
create policy deliveries_read_own on public.notification_deliveries for select to authenticated using((select auth.uid())=user_id);
grant select on public.notification_deliveries to authenticated;
revoke all on public.notification_deliveries from anon;
create table if not exists public.notification_channels (
 id boolean primary key default true check(id),push boolean not null default true,email boolean not null default false,sms boolean not null default false,checked_at timestamptz not null default now()
);
alter table public.notification_channels enable row level security;
create policy channels_read on public.notification_channels for select to authenticated using(true);
grant select on public.notification_channels to authenticated;
insert into public.notification_channels(id) values(true) on conflict do nothing;

-- Compare-and-set claim; concurrent workers cannot send the same attempt.
create or replace function public.claim_aldim_delivery(delivery_id uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.notification_deliveries set status='sending',attempts=attempts+1,updated_at=now() where id=delivery_id and status in ('pending','blocked','failed') and attempts<5;
 return found;
end $$;
revoke all on function public.claim_aldim_delivery(uuid) from public,anon,authenticated;
grant execute on function public.claim_aldim_delivery(uuid) to service_role;
