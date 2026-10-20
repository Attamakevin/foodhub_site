import {getMenu} from '../lib/store.js';
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');res.status(200).json(await getMenu())}
