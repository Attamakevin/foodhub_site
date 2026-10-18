import {createHmac,timingSafeEqual} from 'crypto';
import {recordOrder} from '../lib/orders.js';
export const config={api:{bodyParser:false}};
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).end();
  const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks);
  const sig=Buffer.from(String(req.headers['x-paystack-signature']||''),'hex'),mine=createHmac('sha512',process.env.PAYSTACK_SECRET_KEY||'').update(raw).digest();
  if(sig.length!==mine.length||!timingSafeEqual(sig,mine))return res.status(401).end();
  try{
    const e=JSON.parse(raw.toString()),d=e.data;
    if(e.event==='charge.success'&&d&&d.status==='success'&&d.currency==='NGN'&&d.metadata&&d.metadata.total&&d.amount>=d.metadata.total*100)await recordOrder(d);
    res.status(200).json({ok:true});
  }catch(err){res.status(500).json({error:'retry'})}
}
