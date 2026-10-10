import {mkdir,writeFile} from 'node:fs/promises';
const origin='https://prism-pakistan.vercel.app';
const jobs=[['national','karachi'],['regional','karachi'],['regional','lahore'],['regional','islamabad'],['regional','peshawar'],['regional','quetta'],['regional','gilgit'],['regional','muzaffarabad'],['family','karachi'],['agriculture','sukkur']];
const briefings=[];
for(const [kind,location] of jobs){
 const response=await fetch(`${origin}/api/public/v1/briefings?kind=${kind}&location=${location}`,{signal:AbortSignal.timeout(65000)});
 if(!response.ok)throw new Error(`Briefing HTTP ${response.status}: ${kind}/${location}`);
 const value=await response.json();
 if(!Array.isArray(value.sections)||value.sections.length!==7||!Array.isArray(value.evidence)||!Number.isFinite(Date.parse(value.generated_at))||Date.now()-Date.parse(value.generated_at)>3600000||value.evidence.some(e=>!e.source?.retrieved_at||e.ok===false&&e.data!==null))throw new Error('Briefing contract or freshness failure');
 for(const envelope of value.evidence)if(envelope.ok){if(envelope.source.id==='open-meteo-weather')delete envelope.data.hours;if(envelope.source.id==='open-meteo-flood')delete envelope.data.days;}
 value.archive_projection='Summary measurements and full provenance retained; hourly/daily series omitted';
 briefings.push(value);
}
await mkdir('data',{recursive:true});
await writeFile('data/daily-briefings.json',JSON.stringify({schema:'prism-daily-v1',generated_at:new Date().toISOString(),scope:'Daily snapshot of twelve city reference points; point evidence, not all-district warnings',briefings},null,2)+'\n');
console.log(`Stored ${briefings.length} source-backed briefings; no missing readings substituted.`);
