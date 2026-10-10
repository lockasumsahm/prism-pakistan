import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
const directory='.vercel-upload';
await mkdir(directory+'/api',{recursive:true});
const worker=(await readFile('dist/server/index.js','utf8')).replace('export default {','const prismWorker = {').replace(/^const STATIC_ASSETS = .*;\n/m,'const STATIC_ASSETS = {};\n');
const adapter=`
export default async function handler(req, res) {
 try {
  const incoming = new URL(req.url, 'https://prism.local');
  const path = incoming.searchParams.get('prism_path') || incoming.pathname;
  incoming.searchParams.delete('prism_path');
  const target = new URL(path, 'https://prism.local');
  for (const [key, value] of incoming.searchParams) target.searchParams.append(key,value);
  const headers = new Headers();
  for (const [key,value] of Object.entries(req.headers)) if(value!==undefined)headers.set(key, Array.isArray(value)?value.join(','):String(value));
  headers.set('cf-connecting-ip',String(req.headers['x-forwarded-for']||'vercel').split(',')[0].trim());
  const init = { method:req.method, headers };
  if(!['GET','HEAD'].includes(req.method)) {
   if(req.body !== undefined) init.body = typeof req.body==='string'?req.body:JSON.stringify(req.body);
   else { init.body=req; init.duplex='half'; }
  }
  const response=await prismWorker.fetch(new Request(target,init),process.env);
  res.statusCode=response.status;
  for(const [key,value] of response.headers)res.setHeader(key,value);
  if(response.body)for await(const chunk of response.body)res.write(Buffer.from(chunk));
  res.end();
 } catch {
  res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'INTERNAL_ERROR',message:'Request could not be processed. No data generated.'}));
 }
}
`;
await writeFile(directory+'/api/prism.mjs',worker+adapter);
for(const file of await readdir('web'))await writeFile(directory+'/'+file,await readFile('web/'+file));
const pageRoutes=['map','dashboard','officer','briefings','watch','widget','sources','ops','methodology','auth','reset-password','settings.connectors','settings.developer','alerts','privacy','terms','changelog','contact'];
const config={version:2,functions:{'api/prism.mjs':{maxDuration:60}},rewrites:[
 {source:'/api/public/v1/:path*',destination:'/api/prism?prism_path=/api/public/v1/:path*'},
 {source:'/api/tiles/:path*',destination:'/api/prism?prism_path=/api/tiles/:path*'},
 {source:'/api/officer',destination:'/api/prism?prism_path=/api/officer'},
 {source:'/[.mcp]/list-tools',destination:'/api/prism?prism_path=/[.mcp]/list-tools'},
 {source:'/[.mcp]/invoke-tool/:tool',destination:'/api/prism?prism_path=/[.mcp]/invoke-tool/:tool'},
 {source:'/mcp',destination:'/api/prism?prism_path=/mcp'},
 {source:'/sources/:source',destination:'/index.html'},
 {source:'/flood-risk/:location',destination:'/index.html'},
 {source:'/river/:river',destination:'/index.html'},
 ...pageRoutes.map(page=>({source:'/'+page,destination:'/index.html'})),
],headers:[{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://basemaps.cartocdn.com; connect-src 'self' https://esm.sh https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://raw.githubusercontent.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}]}]};
await writeFile(directory+'/vercel.json',JSON.stringify(config,null,2));
await writeFile(directory+'/package.json',JSON.stringify({name:'prism-pakistan',version:'0.1.0',type:'module',private:true,engines:{node:'24.x'}}));
console.log('Prepared dependency-free Vercel upload');
