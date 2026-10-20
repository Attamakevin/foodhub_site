import {isAdmin} from '../lib/auth.js';
import {put} from '../lib/store.js';
export const config={api:{bodyParser:false}};
export default async function handler(req,res){
  if(!isAdmin(req))return res.status(401).json({error:'Unauthorised'});
  if(req.method!=='POST')return res.status(405).end();
  const chunks=[];let size=0;
  for await(const c of req){size+=c.length;if(size>4e6)return res.status(413).json({error:'Photo too large'});chunks.push(c)}
  let blob;try{blob=await put('photos/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg',Buffer.concat(chunks),{access:'public',contentType:'image/jpeg',addRandomSuffix:false})}catch(e){return res.status(500).json({error:String(e&&e.message||e).slice(0,200)})}
  res.status(200).json({url:blob.url});
}
