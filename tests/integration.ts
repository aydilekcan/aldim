import { readFileSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createAldimApi } from '../shared/api';
import { todayIso,addDaysIso,addMonthsIso } from '../shared/date-utils';
import type { AldimItem } from '../shared/types';
if (!process.env.ALDIM_TEST_USERS_FILE) throw new Error('Set ALDIM_TEST_USERS_FILE to a JSON fixture with two disposable test accounts.');
const users=JSON.parse(readFileSync(process.env.ALDIM_TEST_USERS_FILE,'utf8')) as {id:string;email:string;password:string}[];
const clients=users.map(()=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}}));
const checks:string[]=[];
const pass=(message:string)=>{checks.push(message);console.log('PASS',message);};
async function main(){
 for(let i=0;i<2;i++){const {error}=await clients[i].auth.signInWithPassword(users[i]);assert.equal(error,null,error?.message);}
 pass('Both isolated test users authenticate through Supabase Auth');
 const [a,b]=clients.map(createAldimApi);const now=new Date().toISOString();
 const make=(patch:Partial<AldimItem>):AldimItem=>({id:crypto.randomUUID(),userId:users[0].id,title:'Test kayıt',category:'electronics',fields:{},documents:[],serviceRecords:[],status:'active',createdAt:now,updatedAt:now,...patch});
 const product=make({title:'Kahve makinesi',brand:'Philips',store:'Teknosa',price:8450,purchaseDate:todayIso(),fields:{warrantyEndDate:addDaysIso(todayIso(),7)}});
 await a.saveItem(product,[]);let snap=await a.load(users[0].id);let saved=snap.items.find(i=>i.id===product.id)!;assert.ok(saved);assert.equal(snap.reminders.filter(r=>r.itemId===product.id).length,1);pass('Record and reminder save atomically and reload on another client');
 assert.equal((await b.load(users[1].id)).items.length,0);await assert.rejects(()=>b.saveItem({...saved,userId:users[1].id},[]));pass('RLS blocks reading and overwriting another account’s record');
 const foreign=await clients[1].from('documents').insert({id:crypto.randomUUID(),user_id:users[1].id,item_id:product.id,name:'forbidden'});assert.ok(foreign.error);pass('Child record policies reject cross-account document attachment');
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
 const doc=await a.upload({id:crypto.randomUUID(),userId:users[0].id,itemId:product.id,itemTitle:product.title,itemCategory:product.category,name:'Test faturası.png',type:'invoice',date:todayIso(),createdAt:now,updatedAt:now},image,'image/png');
 const url=await a.documentUrl(doc.storagePath!);const response=await fetch(url);assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,image.byteLength);await assert.rejects(()=>b.documentUrl(doc.storagePath!));pass('Private file upload, signed download and cross-account denial');
 await a.saveItem({...saved,notes:'Güncel not'},snap.reminders);await assert.rejects(()=>a.saveItem({...saved,notes:'Eski cihaz'},snap.reminders));pass('Stale edits are rejected instead of overwriting newer changes');
 snap=await a.load(users[0].id);saved=snap.items.find(i=>i.id===product.id)!;
 await a.saveItem({...saved,serviceRecords:[{id:crypto.randomUUID(),itemId:saved.id,company:'Yetkili servis',date:todayIso(),description:'Periyodik bakım',status:'open',nextFollowUpDate:addDaysIso(todayIso(),3)}]},snap.reminders);
 snap=await a.load(users[0].id);assert.equal(snap.items.find(i=>i.id===product.id)!.serviceRecords.length,1);assert.ok(snap.reminders.some(r=>r.sourceField.startsWith('service:')));pass('Service history persists and creates a follow-up reminder');
 const subscription=make({title:'Yıllık abonelik testi',category:'subscription',fields:{renewalDate:todayIso(),billingCycle:'yearly',monthlyAmount:1200}});await a.saveItem(subscription,[]);snap=await a.load(users[0].id);const reminder=snap.reminders.find(r=>r.itemId===subscription.id)!;
 await Promise.all([a.completeReminder(reminder.id),a.completeReminder(reminder.id)]);snap=await a.load(users[0].id);assert.equal(snap.payments.filter(p=>p.itemId===subscription.id).length,1);assert.equal(snap.items.find(i=>i.id===subscription.id)?.fields.renewalDate,addMonthsIso(todayIso(),12));pass('Concurrent payment completion records one payment and renews one period');
 await a.deleteItem(subscription.id);snap=await a.load(users[0].id);assert.ok(!snap.items.some(i=>i.id===subscription.id));await assert.rejects(()=>a.saveItem(subscription,[]));pass('Deleted records cannot be resurrected by stale devices');
 const invoice=make({title:'İnternet faturası',category:'home_bill',fields:{amount:499,dueDate:addDaysIso(todayIso(),3),recurring:true}});await a.saveItem(invoice,[]);
 const spotify=make({title:'Spotify Premium',category:'subscription',fields:{monthlyAmount:99,billingCycle:'monthly',renewalDate:addDaysIso(todayIso(),12)}});await a.saveItem(spotify,[]);
 await a.saveSettings({notificationsEnabled:true,onboardingComplete:true,emailEnabled:false,smsEnabled:false},users[0].id);assert.equal((await a.load(users[0].id)).settings.emailEnabled,false);pass('Notification preferences persist across clients');
 const periodic=make({category:'home_bill',title:'İki aylık test faturası',fields:{amount:80,dueDate:'2026-01-31',recurring:true,recurrencePeriod:'bimonthly'}});
 await a.saveItem(periodic,[]);snap=await a.load(users[0].id);await a.completeReminder(snap.reminders.find(r=>r.itemId===periodic.id)!.id);snap=await a.load(users[0].id);assert.equal(snap.items.find(i=>i.id===periodic.id)!.fields.dueDate,'2026-03-31');await a.deleteItem(periodic.id);pass('Database advances two-month bills using the selected recurrence');
 writeFileSync('/tmp/aldim-integration-result.json',JSON.stringify({checks,userId:users[0].id,productId:product.id,document:doc,invoiceId:invoice.id,subscriptionId:spotify.id},null,2));
 console.log(`${checks.length} live integration checks passed. Test records retained for browser verification.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
