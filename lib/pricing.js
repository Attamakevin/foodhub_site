export const feeFor=(s,n)=>{const a=(s.areas||[]).find(x=>x.n===n);if(!a)return null;return +a.p||0};
export const naira=n=>'\u20A6'+Number(n).toLocaleString('en-NG');
export const lagosToday=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Africa/Lagos'});
const active=(r,t)=>!!r&&!!r.on&&+r.pct>0&&(!r.from||t>=r.from)&&(!r.to||t<=r.to);
export const bestDiscount=(m,it,t=lagosToday())=>{let b=null;for(const r of (m.discounts||[])){if(!active(r,t))continue;if(r.scope!=='all'&&!(r.ids||[]).includes(it.id))continue;if(!b||+r.pct>+b.pct)b=r}return b};
export const discounted=(p,pct)=>Math.round(p*(100-pct)/100);