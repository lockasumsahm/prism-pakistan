import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
const modules=['lib/climate/connectors/base.ts','lib/climate/districts.ts','lib/climate/locations.ts','lib/climate/consensus.ts','lib/climate/connectors/extended.ts','lib/climate/connectors/archive.ts','lib/climate/connectors/forecast.ts','lib/climate/connectors/spatial.ts','lib/climate/connectors/feeds.ts','lib/climate/connectors/imagery.ts','lib/climate/service.ts','lib/climate/officer.ts','lib/climate/pages.ts'];
const assets={};
const types={'.json':'application/json; charset=utf-8','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
for(const file of await readdir('web')){const extension=file.slice(file.lastIndexOf('.'));assets['/'+file]={body:await readFile('web/'+file,'utf8'),type:types[extension]??'text/plain'};}
// Fingerprint browser assets so a new deployment cannot execute an older cached module.
const fingerprint=body=>createHash('sha256').update(body).digest('hex').slice(0,12);
const cachePath='/evidence-cache.js?v='+fingerprint(assets['/evidence-cache.js'].body);
assets['/app.js'].body=assets['/app.js'].body.replace("'/evidence-cache.js'",JSON.stringify(cachePath));
for(const name of ['live-map','free-ai','forecast-ui','time-status'])assets['/app.js'].body=assets['/app.js'].body.replace("'./"+name+".js'",JSON.stringify('/'+name+'.js?v='+fingerprint(assets['/'+name+'.js'].body)));
const appPath='/app.js?v='+fingerprint(assets['/app.js'].body);
const stylePath='/styles.css?v='+fingerprint(assets['/styles.css'].body);
assets['/index.html'].body=assets['/index.html'].body.replace('src="/app.js"','src="'+appPath+'"').replace('href="/styles.css"','href="'+stylePath+'"');
assets['/sw.js'].body=assets['/sw.js'].body.replace("prism-shell-v2","prism-shell-"+fingerprint(appPath+stylePath)).replace("'/app.js'",JSON.stringify(appPath)).replace("'/styles.css'",JSON.stringify(stylePath)).replace("'/evidence-cache.js'",JSON.stringify(cachePath));
for(const name of ['live-map','free-ai','forecast-ui','time-status'])assets['/sw.js'].body=assets['/sw.js'].body.replace("'/"+name+".js'",JSON.stringify('/'+name+'.js?v='+fingerprint(assets['/'+name+'.js'].body)));
await mkdir('dist/public',{recursive:true});
for(const [path,asset] of Object.entries(assets)){await writeFile('dist/public'+path,asset.body);if(path.endsWith('.js'))execFileSync(process.execPath,['--check','dist/public'+path]);}
let output='// PRISM reproducible Worker artifact. Generated from authored source.\nconst STATIC_ASSETS = '+JSON.stringify(assets)+';\n';
for(const file of modules){let text=stripTypeScriptTypes(await readFile(file,'utf8'),{mode:'transform'});text=text.replace(/^import .*?;\s*$/gm,'').replace(/^export \{.*?\};?\s*$/gm,'').replace(/\bexport (?=(?:abstract )?(?:class|function|async|const|let))/g,'');output+='\n// '+file+'\n'+text;}
let entry=stripTypeScriptTypes(await readFile('worker/index.ts','utf8'),{mode:'transform'}).replace(/^import .*?;\s*$/gm,'');output+='\n'+entry;
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});await writeFile('dist/server/index.js.tmp',output);await rename('dist/server/index.js.tmp','dist/server/index.js');await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'));
console.log('Built dist/server/index.js · '+Object.keys(assets).length+' embedded assets · zero runtime dependencies');
