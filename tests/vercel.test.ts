import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/build-vercel.mjs']);
const {default:handler}=await import('../.vercel-upload/api/prism.mjs');
async function invoke(url:string,method='GET',body?:unknown){const chunks:Buffer[]=[];const headers:Record<string,string>={};const res={statusCode:200,setHeader(key:string,value:string){headers[key]=value;},write(chunk:Uint8Array){chunks.push(Buffer.from(chunk));},end(){}};await handler({url,method,headers:{'x-forwarded-for':'192.0.2.1'},body},res);return {status:res.statusCode,headers,text:Buffer.concat(chunks).toString()};}
test('Vercel rewrite adapter returns original point registry',async()=>{const r=await invoke('/api/prism?prism_path=/api/public/v1/locations');assert.equal(r.status,200);assert.equal(JSON.parse(r.text).locations.length,12);assert.equal(r.headers['x-content-type-options'],'nosniff');});
test('Vercel adapter handles parsed JSON POST bodies for MCP',async()=>{const r=await invoke('/api/prism?prism_path=/mcp','POST',{jsonrpc:'2.0',id:7,method:'tools/list'});assert.equal(r.status,200);assert.equal(JSON.parse(r.text).result.tools.length,5);});
test('Vercel adapter preserves query arguments and rejects unknown locations',async()=>{const r=await invoke('/api/prism?prism_path=/api/public/v1/briefings&location=missing&kind=family');assert.equal(r.status,400);assert.equal(JSON.parse(r.text).error,'INVALID_REQUEST');});
