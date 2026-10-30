import {put,list} from '@vercel/blob';
import seed from './seed.js';
function migrate(s){const calc=k=>Math.max(+s.min||0,Math.ceil(((+s.base||0)+k*(+s.rate||0))/50)*50);s.areas=(s.areas||[]).map(a=>a.p!==undefined?a:{n:a.n,p:calc(+a.k||0)});return s}
function norm(m){
  if(!m||m.v!==2){const s={...seed.s};for(const k of ['wa','addr','hrs','rate','min','base','areas'])if(m&&m.s&&m.s[k]!==undefined)s[k]=m.s[k];return {...seed,s:migrate(s)}}
  migrate(m.s);m.discounts=m.discounts||[];m.reviews=m.reviews||[];m.team=m.team||[];m.s.teamTitle=m.s.teamTitle||seed.s.teamTitle;m.s.teamIntro=m.s.teamIntro||seed.s.teamIntro;m.s.packs=m.s.packs||seed.s.packs;m.s.story=m.s.story||seed.s.story;return m;
}
export async function getMenu(){
  try{const {blobs}=await list({prefix:'menu.json'});const b=blobs.find(x=>x.pathname==='menu.json');
    if(b){const r=await fetch(b.url+'?t='+Date.now());if(r.ok)return norm(await r.json())}}catch(e){}
  return norm(null);
}
export const saveMenu=d=>put('menu.json',JSON.stringify(d),{access:'public',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:60});
export {put};