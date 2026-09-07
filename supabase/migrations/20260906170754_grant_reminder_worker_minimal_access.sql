-- The dispatcher has no write access to user records, documents or payments.
grant select(id,status,deleted_at) on public.items to service_role;
grant select on public.reminders to service_role;
grant select(user_id,notifications_enabled,reminder_preferences) on public.settings to service_role;
grant select(id,user_id,token,platform,enabled,last_seen_at),update(enabled) on public.device_tokens to service_role;
grant select,insert,update(status,attempts,provider_id,error,updated_at) on public.notification_deliveries to service_role;
grant select,insert,update(push,email,sms,checked_at) on public.notification_channels to service_role;
