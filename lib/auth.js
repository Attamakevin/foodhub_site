import {createHash,timingSafeEqual} from 'crypto';
const h=v=>createHash('sha256').update(String(v||'').trim()).digest();
export const isAdmin=req=>!!process.env.ADMIN_PASSWORD&&timingSafeEqual(h(req.headers['x-admin-key']),h(process.env.ADMIN_PASSWORD));
