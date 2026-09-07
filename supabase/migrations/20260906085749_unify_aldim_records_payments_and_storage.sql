-- ========================================================================
-- Aldım — Supabase schema
--
-- Tablolar:
--   profiles, items, reminders, documents, settings
--
-- Tüm tablolarda Row Level Security aktif; kullanıcı yalnız kendi
-- verisini select/insert/update/delete edebilir.
--
-- Çalıştırma:
--   Supabase Dashboard → SQL Editor → New query → bu dosyayı yapıştır → Run.
--   Idempotent — tekrar çalıştırılırsa hata vermez.
-- ========================================================================

-- ---------- grants ----------
-- RLS aktif olsa bile, PostgreSQL önce table-level GRANT kontrol eder.
-- Supabase'in `authenticated` rolüne CRUD izni vermezsek policy'lere
-- bakılmadan "permission denied for table ..." döner.
grant usage on schema public to anon, authenticated;



-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_self" on public.profiles;
create policy "profiles_delete_self" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

-- ---------- items ----------
create table if not exists public.items (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  brand text,
  model text,
  store text,
  price numeric,
  purchase_date date,
  notes text,
  status text not null default 'active',
  fields jsonb not null default '{}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  service_records jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists items_user_id_idx on public.items(user_id);
create index if not exists items_updated_at_idx on public.items(updated_at desc);

alter table public.items enable row level security;

drop policy if exists "items_select_own" on public.items;
create policy "items_select_own" on public.items
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- reminders ----------
create table if not exists public.reminders (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  item_title text,
  item_category text,
  source_field text,
  title text,
  type text,
  due_date date,
  notify_before_days jsonb not null default '[]'::jsonb,
  notification_ids jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists reminders_user_id_idx on public.reminders(user_id);
create index if not exists reminders_item_id_idx on public.reminders(item_id);
create index if not exists reminders_due_date_idx on public.reminders(due_date);

alter table public.reminders enable row level security;

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own" on public.reminders
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own" on public.reminders
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own" on public.reminders
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own" on public.reminders
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- documents ----------
create table if not exists public.documents (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  item_title text,
  item_category text,
  name text,
  type text,
  date date,
  file_uri text,
  remote_url text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_item_id_idx on public.documents(item_id);

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- settings ----------
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications_enabled boolean not null default true,
  daily_notify_hour integer not null default 10,
  reminder_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select_own" on public.settings;
create policy "settings_select_own" on public.settings
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "settings_insert_own" on public.settings;
create policy "settings_insert_own" on public.settings
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "settings_update_own" on public.settings;
create policy "settings_update_own" on public.settings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ========================================================================
-- Storage bucket — aldim-documents
--
-- Önce Supabase Dashboard → Storage → "New bucket" → adı "aldim-documents",
-- public = false olarak oluştur. Bu SQL sonra çalıştırılırsa policy'ler
-- bucket üzerine kurulur.
--
-- Path formatı: {userId}/{itemId}/{documentId}.{ext}
-- Kullanıcı sadece kendi userId klasörünü görür/yazar/siler.
-- ========================================================================

-- Bucket var mı garanti et (idempotent)
insert into storage.buckets (id, name, public)
values ('aldim-documents', 'aldim-documents', false)
on conflict (id) do nothing;

drop policy if exists "aldim_docs_select_own" on storage.objects;
create policy "aldim_docs_select_own" on storage.objects
  for select using (
    bucket_id = 'aldim-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "aldim_docs_insert_own" on storage.objects;
create policy "aldim_docs_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'aldim-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "aldim_docs_update_own" on storage.objects;
create policy "aldim_docs_update_own" on storage.objects
  for update using (
    bucket_id = 'aldim-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "aldim_docs_delete_own" on storage.objects;
create policy "aldim_docs_delete_own" on storage.objects
  for delete using (
    bucket_id = 'aldim-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Table grants are deliberately scoped to this application.
grant select, insert, update, delete on public.profiles, public.items, public.reminders, public.documents, public.settings to authenticated;
-- Child ownership also requires ownership of the parent record.
drop policy if exists reminders_insert_own on public.reminders;
create policy reminders_insert_own on public.reminders for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.items where id = item_id and user_id = (select auth.uid()) and deleted_at is null));
drop policy if exists documents_insert_own on public.documents;
create policy documents_insert_own on public.documents for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.items where id = item_id and user_id = (select auth.uid()) and deleted_at is null));
drop policy if exists documents_update_own on public.documents;
create policy documents_update_own on public.documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.items where id = item_id and user_id = (select auth.uid())));
drop policy if exists reminders_update_own on public.reminders;
create policy reminders_update_own on public.reminders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.items where id = item_id and user_id = (select auth.uid())));
update storage.buckets set public=false, file_size_limit=6291456, allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf'] where id='aldim-documents';

create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 item_id uuid not null references public.items(id) on delete cascade,
 item_title text not null,
 reminder_id uuid unique references public.reminders(id),
 amount numeric(14,2) not null check(amount >= 0),
 due_date date not null,
 paid_at date not null default (now() at time zone 'Europe/Istanbul')::date,
 created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create index if not exists payments_user_idx on public.payments(user_id);
create index if not exists payments_item_idx on public.payments(item_id);
drop policy if exists payments_own on public.payments;
create policy payments_own on public.payments for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and exists(select 1 from public.items where id=item_id and user_id=(select auth.uid())));
grant select,insert,update,delete on public.payments to authenticated;

-- One transaction saves the record and replaces its generated reminders.
-- Optimistic concurrency prevents a stale device overwriting a newer edit.
create or replace function public.save_aldim_item(item_data jsonb, reminder_data jsonb, expected_updated_at timestamptz)
returns void language plpgsql security invoker set search_path = '' as $$
declare current_row public.items; r jsonb; target uuid := (item_data->>'id')::uuid; owner uuid := auth.uid();
begin
 if owner is null or (item_data->>'user_id')::uuid is distinct from owner then raise exception 'Yetkisiz işlem'; end if;
 if nullif(trim(item_data->>'title'),'') is null then raise exception 'Kayıt adı gerekli'; end if;
 if (item_data->>'price')::numeric < 0 then raise exception 'Tutar negatif olamaz'; end if;
 select * into current_row from public.items where id=target for update;
 if found then
  if current_row.deleted_at is not null then raise exception 'Kayıt silinmiş. Listeyi yenile.'; end if;
  if expected_updated_at is distinct from current_row.updated_at then raise exception 'Kayıt başka bir cihazda değişti. Yenileyip tekrar dene.'; end if;
 end if;
 insert into public.items(id,user_id,category,title,brand,model,store,price,purchase_date,notes,status,fields,documents,service_records,created_at,updated_at)
 values(target,owner,item_data->>'category',trim(item_data->>'title'),item_data->>'brand',item_data->>'model',item_data->>'store',(item_data->>'price')::numeric,(item_data->>'purchase_date')::date,item_data->>'notes',coalesce(item_data->>'status','active'),coalesce(item_data->'fields','{}'), '[]',coalesce(item_data->'service_records','[]'),coalesce((item_data->>'created_at')::timestamptz,now()),now())
 on conflict(id) do update set category=excluded.category,title=excluded.title,brand=excluded.brand,model=excluded.model,store=excluded.store,price=excluded.price,purchase_date=excluded.purchase_date,notes=excluded.notes,status=excluded.status,fields=excluded.fields,service_records=excluded.service_records,documents='[]',updated_at=now();
 update public.reminders set deleted_at=now(),updated_at=now() where item_id=target and user_id=owner and deleted_at is null;
 for r in select value from jsonb_array_elements(reminder_data) loop
  if (r->>'user_id')::uuid is distinct from owner or (r->>'item_id')::uuid is distinct from target then raise exception 'Geçersiz hatırlatma'; end if;
  insert into public.reminders(id,user_id,item_id,item_title,item_category,source_field,title,type,due_date,notify_before_days,notification_ids,status,updated_at)
  values((r->>'id')::uuid,owner,target,r->>'item_title',r->>'item_category',r->>'source_field',r->>'title',r->>'type',(r->>'due_date')::date,r->'notify_before_days','[]',coalesce(r->>'status','active'),now())
  on conflict(id) do update set item_title=excluded.item_title,title=excluded.title,due_date=excluded.due_date,notify_before_days=excluded.notify_before_days,status=excluded.status,deleted_at=null,updated_at=now();
 end loop;
end $$;

create or replace function public.delete_aldim_item(target_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
 update public.items set deleted_at=now(),updated_at=now() where id=target_id and user_id=auth.uid();
 if not found then raise exception 'Kayıt bulunamadı'; end if;
 update public.reminders set deleted_at=now(),updated_at=now() where item_id=target_id and user_id=auth.uid();
 update public.documents set deleted_at=now(),updated_at=now() where item_id=target_id and user_id=auth.uid();
end $$;

create or replace function public.complete_aldim_reminder(target_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare r public.reminders; i public.items; next_due date; months integer;
begin
 select * into r from public.reminders where id=target_id and user_id=auth.uid() and deleted_at is null for update;
 if not found then raise exception 'Hatırlatma bulunamadı'; end if;
 if r.status='completed' then return; end if;
 select * into i from public.items where id=r.item_id and deleted_at is null for update;
 if not found then raise exception 'Kayıt bulunamadı'; end if;
 update public.reminders set status='completed',updated_at=now() where id=r.id;
 if r.type in ('bill_due','subscription_renewal') then
  insert into public.payments(user_id,item_id,item_title,reminder_id,amount,due_date)
  values(auth.uid(),i.id,i.title,r.id,coalesce((i.fields->>'monthlyAmount')::numeric,(i.fields->>'amount')::numeric,i.price,0),r.due_date) on conflict(reminder_id) do nothing;
  if i.category='subscription' or (i.category='home_bill' and i.fields->>'recurring'='true') then
   months := case i.fields->>'billingCycle' when 'yearly' then 12 when 'quarterly' then 3 else 1 end;
   next_due := (r.due_date + make_interval(months=>months))::date;
   update public.items set fields=jsonb_set(fields,array[r.source_field],to_jsonb(next_due::text)),updated_at=now() where id=i.id;
   insert into public.reminders(id,user_id,item_id,item_title,item_category,source_field,title,type,due_date,notify_before_days,status)
   values(gen_random_uuid(),r.user_id,r.item_id,r.item_title,r.item_category,r.source_field,r.title,r.type,next_due,r.notify_before_days,'active');
  end if;
 end if;
end $$;
revoke all on function public.save_aldim_item(jsonb,jsonb,timestamptz), public.delete_aldim_item(uuid), public.complete_aldim_reminder(uuid) from public,anon;
grant execute on function public.save_aldim_item(jsonb,jsonb,timestamptz), public.delete_aldim_item(uuid), public.complete_aldim_reminder(uuid) to authenticated;
