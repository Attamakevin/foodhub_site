import {isAdmin} from '../lib/auth.js';
import {saveMenu,getMenu} from '../lib/store.js';
const cleanD=a=>(Array.isArray(a)?a:[]).slice(0,50).map(r=>({id:String(r.id||'').slice(0,40),name:String(r.name||'').slice(0,60),pct:Math.min(100,Math.max(0,+r.pct||0)),scope:r.scope==='select'?'select':'all',ids:Array.isArray(r.ids)?r.ids.map(String).slice(0,400):[],from:/^\d{4}-\d{2}-\d{2}$/.test(r.from||'')?r.from:'',to:/^\d{4}-\d{2}-\d{2}$/.test(r.to||'')?r.to:'',on:!!r.on}));
export default async function handler(req,res){
  if(!process.env.ADMIN_PASSWORD)return res.status(503).json({error:'not_configured'});
  if(!isAdmin(req))return res.status(401).json({error:'Unauthorised'});
  if(req.method==='GET')return res.status(200).json({ok:true});
  if(req.method!=='POST')return res.status(405).end();
  const b=req.body;
  try{
    if(b&&b.op==='avail'){
      const m=await getMenu(),it=m.items.find(i=>i.id===b.id);
      if(!it)return res.status(404).json({error:'Item not found. Save and publish first.'});
      it.on=!!b.on;await saveMenu(m);return res.status(200).json({ok:true});
    }
    if(!b||!b.s||!Array.isArray(b.items)||!Array.isArray(b.s.areas)||!Array.isArray(b.s.packs)||b.items.length>300)return res.status(400).json({error:'Invalid menu data'});
    await saveMenu({v:2,s:b.s,items:b.items,reviews:Array.isArray(b.reviews)?b.reviews.slice(0,100):[],team:Array.isArray(b.team)?b.team.slice(0,100):[],discounts:cleanD(b.discounts)});
    res.status(200).json({ok:true});
  }catch(e){res.status(500).json({error:String(e&&e.message||e).slice(0,200)})}
}