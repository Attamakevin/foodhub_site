import {put,list} from '@vercel/blob';
import {naira} from './pricing.js';
const byRef=async ref=>(await list({prefix:'orders/'+ref+'-'})).blobs;
async function notify(o){
  const k=process.env.RESEND_API_KEY,to=process.env.OWNER_EMAIL;if(!k||!to)return;
  const text=`New paid order\n\nName: ${o.name}\nPhone: ${o.phone}\nType: ${o.type}${o.type==='Delivery'?`\nAddress: ${o.address} (${o.area})`:''}\n\n${(o.items||[]).join('\n')}\n\nSubtotal: ${naira(o.subtotal)}${o.type==='Delivery'?`\nDelivery fee: ${naira(o.fee)}`:''}\nTotal paid: ${naira(o.total)}${o.note?`\nNote: ${o.note}`:''}\n\nRef: ${o.ref}`;
  await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+k,'Content-Type':'application/json'},
    body:JSON.stringify({from:process.env.MAIL_FROM||'Foodhub Orders <onboarding@resend.dev>',to:[to],subject:`New paid order: ${o.name}, ${naira(o.total)}`,text})}).catch(()=>{});
}
export async function recordOrder(d){
  if((await byRef(d.reference)).length)return false;
  const m=d.metadata||{},o={ref:d.reference,at:d.paid_at||new Date().toISOString(),email:d.customer&&d.customer.email,name:m.name,phone:m.phone,type:m.type,address:m.address,area:m.area,note:m.note,items:m.items,subtotal:m.subtotal,fee:m.fee,total:m.total,status:'new'};
  await put(`orders/${d.reference}-${Math.random().toString(36).slice(2,10)}.json`,JSON.stringify(o),{access:'public',contentType:'application/json',addRandomSuffix:false});
  await notify(o);return true;
}
export async function listOrders(){
  const {blobs}=await list({prefix:'orders/',limit:1000});
  const top=blobs.sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt)).slice(0,500);
  const all=[];for(let i=0;i<top.length;i+=25)all.push(...await Promise.all(top.slice(i,i+25).map(b=>fetch(b.url+'?t='+Date.now()).then(r=>r.ok?r.json():null).catch(()=>null))));
  const seen=new Set();
  return all.filter(o=>o&&!seen.has(o.ref)&&seen.add(o.ref)).sort((a,b)=>new Date(b.at)-new Date(a.at));
}
export async function setStatus(ref,status){
  const [b]=await byRef(ref);if(!b)return false;
  const o=await (await fetch(b.url+'?t='+Date.now())).json();o.status=status==='done'?'done':'new';if(o.status==='done')o.doneAt=new Date().toISOString();else delete o.doneAt;
  await put(b.pathname,JSON.stringify(o),{access:'public',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true});return {doneAt:o.doneAt};
}
