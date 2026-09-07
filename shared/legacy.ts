import type { AldimItem, AldimDocument, ItemCategory } from './types';
import { CATEGORIES } from './categories';
/** Stable UUIDs let an interrupted import resume without creating duplicate records. */
export function legacyId(input:string):string {
 if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input))return input;
 const parts=[0x811c9dc5,0x12345678,0xabcdef01,0x10203040];
 for(const char of input)for(let i=0;i<4;i++)parts[i]=Math.imul(parts[i]^char.charCodeAt(0),16777619+i*2)>>>0;
 const h=parts.map(n=>n.toString(16).padStart(8,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20)}`;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function convertLegacy(raw:unknown,userId:string):AldimItem[]{
 if(!object(raw))throw new Error('Yedek dosyası geçersiz.');
 const source=Array.isArray(raw.items)?raw.items:Array.isArray(raw.products)?raw.products:[];
 return source.filter(object).filter(p=>!p.userId||p.userId===userId).flatMap(p=>{
  if(typeof p.id!=='string'||typeof(p.title??p.name)!=='string')return[];
  const now=new Date().toISOString();const id=legacyId(userId+':'+p.id);const category=typeof p.category==='string'&&p.category in CATEGORIES?p.category as ItemCategory:'electronics';
  const item:AldimItem={id,userId,category,title:String(p.title??p.name),brand:typeof p.brand==='string'?p.brand:undefined,store:typeof p.store==='string'?p.store:undefined,model:typeof p.model==='string'?p.model:undefined,price:typeof p.price==='number'?p.price:undefined,purchaseDate:typeof p.purchaseDate==='string'?p.purchaseDate:undefined,notes:typeof p.notes==='string'?p.notes:undefined,status:p.status==='archived'?'archived':'active',fields:object(p.fields)?p.fields as AldimItem['fields']:{warrantyEndDate:p.warrantyEndDate as string|undefined,returnDeadline:p.returnDeadline as string|undefined,invoiceNumber:p.invoiceNumber as string|undefined},documents:[],serviceRecords:[],createdAt:now,updatedAt:now};
  // Existing mobile UUIDs must retain identity across devices.
  if(p.userId===userId)item.id=legacyId(p.id);
  if(p.returnProcess)item.notes=[item.notes,'Önceki iade kaydı: '+JSON.stringify(p.returnProcess)].filter(Boolean).join('\n\n');
  if(Array.isArray(p.serviceRecords))item.serviceRecords=p.serviceRecords.filter(object).map((r,n)=>({id:legacyId(`${userId}:${p.id}:service:${r.id??n}`),itemId:item.id,date:String(r.date??now.slice(0,10)),company:String(r.company??'Servis'),description:String(r.description??''),status:r.status==='resolved'?'resolved':r.status==='in_progress'?'in_progress':'open',nextFollowUpDate:typeof r.nextFollowUpDate==='string'?r.nextFollowUpDate:undefined}));
  if(Array.isArray(p.documents))item.documents=p.documents.filter(object).map((d,n)=>({id:legacyId(`${userId}:${p.id}:doc:${d.id??n}`),userId,itemId:item.id,itemTitle:item.title,itemCategory:category,name:String(d.name??'Eski belge'),type:(d.type??'other') as AldimDocument['type'],date:String(d.date??now.slice(0,10)),fileUri:typeof d.fileUri==='string'?d.fileUri:undefined,storagePath:typeof d.storagePath==='string'?d.storagePath:undefined,createdAt:now,updatedAt:now}));
  return[item];
 });
}
