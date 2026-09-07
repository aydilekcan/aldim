import { createClient } from 'npm:@supabase/supabase-js@2.106.1';
import { CRON_SECRET_SHA256 } from './config.ts';
const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
const day=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
async function request(url:string,body:unknown,headers:Record<string,string>={}){
 return fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
}
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const secret=req.headers.get('x-cron-secret')??'';
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==CRON_SECRET_SHA256)return json({error:'unauthorized'},401);
 const today=day();const counts={accepted:0,blocked:0,failed:0,skipped:0};
 const resend=Deno.env.get('RESEND_API_KEY');const from=Deno.env.get('REMINDER_FROM_EMAIL');
 const twilioSid=Deno.env.get('TWILIO_ACCOUNT_SID'),twilioToken=Deno.env.get('TWILIO_AUTH_TOKEN'),twilioFrom=Deno.env.get('TWILIO_FROM_NUMBER');
 const capabilities={id:true,push:true,email:!!(resend&&from),sms:!!(twilioSid&&twilioToken&&twilioFrom),checked_at:new Date().toISOString()};
 try {
  const {id: _id,...channelUpdate}=capabilities;
  const channelResult=await client.from('notification_channels').update(channelUpdate).eq('id',true);if(channelResult.error)throw channelResult.error;
  // A worker interrupted after provider acceptance must never blindly retry a send.
  await client.from('notification_deliveries').update({status:'unknown',error:'Worker interrupted; verify provider before retry.'}).eq('status','sending').lt('updated_at',new Date(Date.now()-15*60000).toISOString());
  const {data:receipts}=await client.from('notification_deliveries').select('*').eq('channel','push').eq('status','accepted').lt('updated_at',new Date(Date.now()-15*60000).toISOString()).limit(100);
  if(receipts?.length){
   const response=await request('https://exp.host/--/api/v2/push/getReceipts',{ids:receipts.map(r=>r.provider_id)});
   if(response.ok){const result=await response.json();for(const row of receipts){const receipt=result.data?.[row.provider_id];if(!receipt)continue;await client.from('notification_deliveries').update({status:receipt.status==='ok'?'delivered':'failed',error:receipt.details?.error??null,updated_at:new Date().toISOString()}).eq('id',row.id);if(receipt.details?.error==='DeviceNotRegistered')await client.from('device_tokens').update({enabled:false}).eq('id',row.target_key);}}
  }
  const dryRun=new URL(req.url).searchParams.get('dry_run')==='true';
  let candidates=0;
  for(let page=0;page<100;page++){
   const {data:reminders,error}=await client.from('reminders').select('*,items!inner(status,deleted_at)').eq('status','active').is('deleted_at',null).eq('items.status','active').is('items.deleted_at',null).gte('due_date',today).lte('due_date',day(new Date(Date.now()+31*86400000))).order('id').range(page*250,page*250+249);
   if(error)throw error;if(!reminders?.length)break;
   for(const reminder of reminders){
    const offset=Math.round((Date.parse(reminder.due_date)-Date.parse(today))/86400000);
    if(![...(reminder.notify_before_days??[]),0].includes(offset))continue;candidates++;
    const {data:settings}=await client.from('settings').select('user_id,notifications_enabled,reminder_preferences').eq('user_id',reminder.user_id).maybeSingle();
    const prefs=settings?.reminder_preferences??{};
    const {data:devices}=await client.from('device_tokens').select('*').eq('user_id',reminder.user_id).eq('enabled',true).gte('last_seen_at',new Date(Date.now()-30*86400000).toISOString());
    const targets:{channel:'push'|'email'|'sms';key:string;address:string}[]=[];
    if(settings?.notifications_enabled!==false&&devices?.length)for(const device of devices)targets.push({channel:'push',key:device.id,address:device.token});
    else {
     if(prefs.emailEnabled!==false){const {data}=await client.auth.admin.getUserById(reminder.user_id);if(data.user?.email&&data.user.email_confirmed_at)targets.push({channel:'email',key:'email',address:data.user.email});}
     if(prefs.smsEnabled===true&&/^\+[1-9]\d{7,14}$/.test(prefs.phone??''))targets.push({channel:'sms',key:'sms',address:prefs.phone});
    }
    if(dryRun){counts.skipped+=targets.length;continue;}
    for(const target of targets){
     // Unique key survives retries and concurrent cron invocations.
     await client.from('notification_deliveries').upsert({reminder_id:reminder.id,user_id:reminder.user_id,delivery_date:today,channel:target.channel,target_key:target.key},{onConflict:'reminder_id,delivery_date,channel,target_key',ignoreDuplicates:true});
     const {data:delivery,error:deliveryError}=await client.from('notification_deliveries').select('*').eq('reminder_id',reminder.id).eq('delivery_date',today).eq('channel',target.channel).eq('target_key',target.key).single();if(deliveryError)throw deliveryError;
     if(!capabilities[target.channel]){if(['pending','blocked'].includes(delivery.status))await client.from('notification_deliveries').update({status:'blocked',error:'Provider is not configured',updated_at:new Date().toISOString()}).eq('id',delivery.id);counts.blocked++;continue;}
     const {data:claimed,error:claimError}=await client.rpc('claim_aldim_delivery',{delivery_id:delivery.id});if(claimError)throw claimError;if(!claimed){counts.skipped++;continue;}
     const body=offset===0?`${reminder.item_title}: ${reminder.title}. Son gün bugün.`:`${reminder.item_title}: ${reminder.title}. ${offset} gün kaldı.`;
     let status='accepted',providerId:string|null=null,failure:string|null=null;
     try{
      if(target.channel==='push'){
       const response=await request('https://exp.host/--/api/v2/push/send',{to:target.address,title:'Aldım · Hatırlatma',body,sound:'default',data:{itemId:reminder.item_id},channelId:'default'});
       const result=await response.json();if(!response.ok||result.data?.status!=='ok'){status='failed';failure=result.data?.details?.error??`Expo HTTP ${response.status}`;if(failure==='DeviceNotRegistered')await client.from('device_tokens').update({enabled:false}).eq('id',target.key);}else providerId=result.data.id;
      }else if(target.channel==='email'){
       const response=await request('https://api.resend.com/emails',{from,to:[target.address],subject:'Aldım · '+reminder.title,text:`${body}\n\nKaydını aç: https://aldim.vercel.app/app/items/${reminder.item_id}\n\nHatırlatma tercihlerini Aldım ayarlarından değiştirebilirsin.`},{Authorization:`Bearer ${resend}`,'Idempotency-Key':delivery.id});
       const result=await response.json();if(!response.ok){status='failed';failure=`Resend HTTP ${response.status}`;}else providerId=result.id;
      }else{
       const form=new URLSearchParams({To:target.address,From:twilioFrom!,Body:`Aldım: ${body} aldim.vercel.app`});
       const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,'Content-Type':'application/x-www-form-urlencoded'},body:form,signal:AbortSignal.timeout(15000)});
       const result=await response.json();if(!response.ok){status=response.status>=500?'unknown':'failed';failure=`Twilio HTTP ${response.status}`;}else providerId=result.sid;
      }
     }catch{status='unknown';failure='Provider response unavailable; manual reconciliation required.';}
     await client.from('notification_deliveries').update({status,provider_id:providerId,error:failure,updated_at:new Date().toISOString()}).eq('id',delivery.id);
     if(status==='accepted')counts.accepted++;else counts.failed++;
    }
   }
   if(reminders.length<250)break;
  }
  return json({ok:true,date:today,dry_run:dryRun,candidates,channels:capabilities,...counts});
 }catch(error){console.error('Reminder dispatch failed',error instanceof Error?error.message:'database_error');return json({ok:false,error:'dispatch_failed'},500);}
});
