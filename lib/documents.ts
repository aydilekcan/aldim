import type { AldimDocument } from '@/shared/types';
export async function downloadDocument(url: string, doc: AldimDocument) {
 const response=await fetch(url); if(!response.ok) throw new Error('Belge indirilemedi. Tekrar dene.');
 const bytes=await response.arrayBuffer();const isPdf=doc.storagePath?.toLowerCase().endsWith('.pdf');let output: Uint8Array|ArrayBuffer=bytes;
 if(!isPdf) {
  const { PDFDocument } = await import('pdf-lib');
  const blob=new Blob([bytes],{type:response.headers.get('content-type')??'image/jpeg'});
  const bitmap=await createImageBitmap(blob);const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Görsel dönüştürülemedi.');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0);bitmap.close();
  const pdf=await PDFDocument.create();const image=await pdf.embedJpg(canvas.toDataURL('image/jpeg',0.92));const landscape=image.width>image.height;const page=pdf.addPage(landscape?[842,595]:[595,842]);const size=image.scaleToFit(page.getWidth()-48,page.getHeight()-48);page.drawImage(image,{x:(page.getWidth()-size.width)/2,y:(page.getHeight()-size.height)/2,...size});output=await pdf.save();
 }
 const blob=new Blob([new Uint8Array(output)],{type:'application/pdf'});const local=URL.createObjectURL(blob);const link=document.createElement('a');link.href=local;link.download=doc.name.replace(/\.[^.]+$/,'')+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(local),1000);
}
