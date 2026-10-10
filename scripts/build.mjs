import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const modules=['lib/climate/connectors/base.ts','lib/climate/locations.ts','lib/climate/consensus.ts','lib/climate/connectors/feeds.ts','lib/climate/service.ts'];
const assets={};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
for(const file of await readdir('web')){const extension=file.slice(file.lastIndexOf('.'));assets['/'+file]={body:await readFile('web/'+file,'utf8'),type:types[extension]??'text/plain'};}
let output='// PRISM reproducible Worker artifact. Generated from authored source.\nconst STATIC_ASSETS = '+JSON.stringify(assets)+';\n';
for(const file of modules){let text=stripTypeScriptTypes(await readFile(file,'utf8'),{mode:'transform'});text=text.replace(/^import .*?;\s*$/gm,'').replace(/^export \{.*?\};?\s*$/gm,'').replace(/\bexport (?=(?:abstract )?(?:class|function|async|const|let))/g,'');output+='\n// '+file+'\n'+text;}
let entry=stripTypeScriptTypes(await readFile('worker/index.ts','utf8'),{mode:'transform'}).replace(/^import .*?;\s*$/gm,'');output+='\n'+entry;
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});await writeFile('dist/server/index.js.tmp',output);await rename('dist/server/index.js.tmp','dist/server/index.js');await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'));
console.log('Built dist/server/index.js · '+Object.keys(assets).length+' embedded assets · zero runtime dependencies');
