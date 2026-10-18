export const feeFor=(s,n)=>{const a=(s.areas||[]).find(x=>x.n===n);if(!a)return null;return Math.max(+s.min||0,Math.ceil(a.k*(+s.rate||0)/50)*50)};
export const naira=n=>'\u20A6'+Number(n).toLocaleString('en-NG');
