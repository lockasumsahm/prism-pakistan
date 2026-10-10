export function validatePublishedBriefing(value,now=Date.now()){
 const generated=Date.parse(value?.generated_at);
 if(!Number.isFinite(generated)||generated>now+60000||now-generated>3600000||!Array.isArray(value.sections)||value.sections.length!==7||value.sections.some(s=>typeof s.title!=='string'||typeof s.text!=='string')||!Array.isArray(value.evidence)||!value.evidence.length)throw new Error('Briefing contract or generation freshness failure');
 for(const e of value.evidence){const retrieved=Date.parse(e.source?.retrieved_at);if(typeof e.ok!=='boolean'||!Number.isFinite(retrieved)||retrieved>now+60000||now-retrieved>3600000||e.ok&&(e.data===null||e.data===undefined)||!e.ok&&(e.data!==null||typeof e.error?.code!=='string'))throw new Error('Briefing evidence contract or retrieval freshness failure');}
 return value;
}
