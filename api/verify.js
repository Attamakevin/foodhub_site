import {getMenu} from '../lib/store.js';
import {naira} from '../lib/pricing.js';
import {recordOrder} from '../lib/orders.js';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const ref=String(req.query.reference||'');
  if(!/^[A-Za-z0-9_.=-]{6,100}$/.test(ref))return res.status(400).json({status:'invalid'});
  const r=await fetch('https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref),{headers:{Authorization:'Bearer '+process.env.PAYSTACK_SECRET_KEY}});
  const j=await r.json().catch(()=>({})),d=j.data;
  if(!j.status||!d){console.error('verify failed',JSON.stringify(j));return res.status(200).json({status:'invalid',reason:j.message||''})}
  const m=d.metadata||{};
  if(d.status!=='success'||!(d.amount>=(m.total||0)*100)||d.currency!=='NGN'){console.error('verify not successful',d.status,d.gateway_response);return res.status(200).json({status:d.status==='success'?'failed':d.status,reason:d.gateway_response||''})}
  try{await recordOrder(d)}catch(e){}
  const menu=await getMenu();
  const msg=`Hello Foodhub, I have just paid for an order (ref ${ref}).\n\nName: ${m.name}\nPhone: ${m.phone}\nType: ${m.type}${m.type==='Delivery'?`\nAddress: ${m.address}\nDelivery area: ${m.area}`:''}\n\nOrder:\n${(m.items||[]).join('\n')}\n\nSubtotal: ${naira(m.subtotal)}${m.type==='Delivery'?`\nDelivery fee: ${naira(m.fee)}`:''}\nTotal paid: ${naira(m.total)}${m.note?`\nNote: ${m.note}`:''}`;
  res.status(200).json({status:'success',total:m.total,wa:'https://wa.me/'+menu.s.wa+'?text='+encodeURIComponent(msg)});
}
