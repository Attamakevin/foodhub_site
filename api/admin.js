import {isAdmin} from '../lib/auth.js';
import {saveMenu} from '../lib/store.js';
export default async function handler(req,res){
  if(!process.env.ADMIN_PASSWORD)return res.status(503).json({error:'not_configured'});
  if(!isAdmin(req))return res.status(401).json({error:'Unauthorised'});
  if(req.method==='GET')return res.status(200).json({ok:true});
  if(req.method!=='POST')return res.status(405).end();
  const b=req.body;
  if(!b||!b.s||!Array.isArray(b.items)||!Array.isArray(b.s.areas)||!Array.isArray(b.s.packs)||b.items.length>300)return res.status(400).json({error:'Invalid menu data'});
  try{await saveMenu({v:2,s:b.s,items:b.items,reviews:Array.isArray(b.reviews)?b.reviews.slice(0,100):[]})}catch(e){return res.status(500).json({error:String(e&&e.message||e).slice(0,200)})}
  res.status(200).json({ok:true});
}
