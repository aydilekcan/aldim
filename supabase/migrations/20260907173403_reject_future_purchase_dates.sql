-- Validate new purchase dates without rewriting existing records.
create or replace function public.validate_aldim_purchase_date()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if new.purchase_date > (now() at time zone 'Europe/Istanbul')::date then
  raise exception 'Satın alma tarihi bugünden sonra olamaz.' using errcode = '22007';
 end if;
 return new;
end $$;
revoke all on function public.validate_aldim_purchase_date() from public, anon, authenticated;
drop trigger if exists validate_aldim_purchase_date on public.items;
create trigger validate_aldim_purchase_date before insert or update of purchase_date on public.items
for each row execute function public.validate_aldim_purchase_date();
