create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
select cron.schedule('aldim-reminders', '0 7-18 * * *', $job$
 select net.http_post(
   url := 'https://ugzlqubolpjosspuncoy.supabase.co/functions/v1/reminder-dispatch',
   headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='aldim_reminder_cron')),
   body := '{}'::jsonb,
   timeout_milliseconds := 120000
 );
$job$);
revoke insert,update,delete,truncate,references,trigger on public.notification_deliveries,public.notification_channels from authenticated,anon;
