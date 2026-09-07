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
   months := case when i.category='subscription' then
    case i.fields->>'billingCycle' when 'yearly' then 12 when 'quarterly' then 3 else 1 end
   else case i.fields->>'recurrencePeriod' when 'bimonthly' then 2 when 'quarterly' then 3 else 1 end end;
   next_due := (r.due_date + make_interval(months=>months))::date;
   update public.items set fields=jsonb_set(fields,array[r.source_field],to_jsonb(next_due::text)),updated_at=now() where id=i.id;
   insert into public.reminders(id,user_id,item_id,item_title,item_category,source_field,title,type,due_date,notify_before_days,status)
   values(gen_random_uuid(),r.user_id,r.item_id,r.item_title,r.item_category,r.source_field,r.title,r.type,next_due,r.notify_before_days,'active');
  end if;
 end if;
end $$;
