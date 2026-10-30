import {getMenu} from '../lib/store.js';
import {feeFor,naira,bestDiscount,discounted} from '../lib/pricing.js';
function siteUrl(req){let u=String(process.env.SITE_URL||'').trim();if(u&&!/^https?:\/\//i.test(u))u='https://'+u;try{return new URL(u).origin}catch(e){return 'https://'+req.headers.host}}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).end();
  const b=req.body||{},m=await getMenu(),bad=e=>res.status(400).json({error:e});
  let sub=0,food=0,needPack=false,packQty=0;const items=[];
  for(const l of Array.isArray(b.cart)?b.cart:[]){
    const q=Math.floor(+l.q);
    if(!(q>0&&q<=100))return bad('Some items are no longer available. Please review your order.');
    if(l.id==='__p'){
      const pk=(m.s.packs||[]).find(x=>x.n===l.n);
      if(!pk)return bad('A pack in your order is no longer available. Please review your order.');
      packQty+=q;sub+=pk.p*q;items.push(`${q} x ${pk.n} - ${naira(pk.p*q)}`);continue;
    }
    const it=m.items.find(i=>i.id===l.id),o=it&&it.opts[+l.o];
    if(!it||!it.on||!o)return bad('Some items are no longer available. Please review your order.');
    food++;if(['Main Meals','Proteins','Sides'].includes(it.cat))needPack=true;const dsc=bestDiscount(m,it),pu=dsc?discounted(o.p,+dsc.pct):o.p;sub+=pu*q;items.push(`${q} x ${it.name} (${o.l}${dsc?', '+dsc.pct+'% off':''}) - ${naira(pu*q)}`);
  }
  if(!food)return bad('Please add a meal to your order.');
  if(needPack&&(m.s.packs||[]).length&&!packQty)return bad('Please add at least one pack for your meals.');
  if(!items.length)return bad('Your order is empty.');
  const name=String(b.name||'').trim().slice(0,80),phone=String(b.phone||'').trim().slice(0,30),email=String(b.email||'').trim().slice(0,120);
  if(!name||!phone||!/^\S+@\S+\.\S+$/.test(email))return bad('Please enter your name, phone number and a valid email address.');
  const type=['Delivery','Pickup','Dine in at our restaurant'].includes(b.type)?b.type:'Pickup',dv=type==='Delivery';
  const address=String(b.address||'').trim().slice(0,300);let fee=0;
  if(dv){fee=feeFor(m.s,b.area);if(fee==null||!address)return bad('Please enter your address and choose a listed delivery area.')}
  const total=sub+fee,note=String(b.note||'').slice(0,300);
  const r=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',
    headers:{Authorization:'Bearer '+process.env.PAYSTACK_SECRET_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({email,amount:total*100,currency:'NGN',callback_url:siteUrl(req),
      metadata:{name,phone,type,address,area:dv?b.area:'',note,items,subtotal:sub,fee,total,
        custom_fields:[{display_name:'Customer',variable_name:'name',value:name},{display_name:'Phone',variable_name:'phone',value:phone},{display_name:'Order type',variable_name:'type',value:type},{display_name:'Address',variable_name:'address',value:address||'-'}]}})});
  const d=await r.json().catch(()=>({}));
  if(!d.status){console.error('paystack initialize failed',r.status,JSON.stringify(d));return res.status(502).json({error:'Payment could not be started: '+(d.message||'no response from Paystack (check PAYSTACK_SECRET_KEY)')})}
  res.status(200).json({url:d.data.authorization_url});
}