import {isAdmin} from '../lib/auth.js';
import {listOrders,setStatus} from '../lib/orders.js';
export default async function handler(req,res){
  if(!isAdmin(req))return res.status(401).json({error:'Unauthorised'});
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json({orders:await listOrders()});
  if(req.method==='POST'){
    const b=req.body||{};
    if(!/^[A-Za-z0-9_.=-]{6,100}$/.test(String(b.ref||'')))return res.status(400).json({error:'Invalid order'});
    const r=await setStatus(b.ref,b.status);return res.status(200).json({ok:!!r,doneAt:r?r.doneAt:undefined});
  }
  res.status(405).end();
}