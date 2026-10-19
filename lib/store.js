import {put,list} from '@vercel/blob';
import seed from './seed.js';
function norm(m){
  if(!m||m.v!==2){const s={...seed.s};for(const k of ['wa','addr','hrs','rate','min','areas'])if(m&&m.s&&m.s[k]!==undefined)s[k]=m.s[k];return {...seed,s}}
  m.reviews=m.reviews||[];m.team=m.team||[];m.s.teamTitle=m.s.teamTitle||seed.s.teamTitle;m.s.teamIntro=m.s.teamIntro||seed.s.teamIntro;m.s.packs=m.s.packs||seed.s.packs;m.s.story=m.s.story||seed.s.story;return m;
}
export async function getMenu(){
  try{const {blobs}=await list({prefix:'menu.json'});const b=blobs.find(x=>x.pathname==='menu.json');
    if(b){const r=await fetch(b.url+'?t='+Date.now());if(r.ok)return norm(await r.json())}}catch(e){}
  return norm(null);
}
export const saveMenu=d=>put('menu.json',JSON.stringify(d),{access:'public',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:60});
export {put};