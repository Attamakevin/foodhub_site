export const feeFor=(s,n)=>{const a=(s.areas||[]).find(x=>x.n===n);if(!a)return null;return +a.p||0};
export const naira=n=>'\u20A6'+Number(n).toLocaleString('en-NG');