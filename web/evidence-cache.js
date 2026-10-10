// History is stored separately from live transport responses. Never change envelope.ok.
export const CACHE_PREFIX='prism.evidence.v2.';
export function historyKey(path){return CACHE_PREFIX+encodeURIComponent(path);}
export function writeHistory(storage,path,value,now=Date.now()){
 if(path!=='locations'&&!/^districts\/[a-z-]+$/.test(path)&&!/^briefings\?/.test(path))return;
 const envelopes=value?.evidence??[value?.weather,value?.flood,value?.air,value?.elevation].filter(Boolean);
 if(path!=='locations' && !envelopes.some(e=>e.ok===true&&e.source?.retrieved_at))return;
 try{storage.setItem(historyKey(path),JSON.stringify({stored_at:now,value}));
 const keys=Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(k=>k?.startsWith(CACHE_PREFIX));
 if(keys.length>40){const sorted=keys.map(k=>({key:k,time:JSON.parse(storage.getItem(k)).stored_at})).sort((a,b)=>a.time-b.time);for(const row of sorted.slice(0,keys.length-40))storage.removeItem(row.key);}
 }catch{/* Storage can be disabled or full; the live response still works. */}
}
export function readHistory(storage,path,now=Date.now()){
 try{const row=JSON.parse(storage.getItem(historyKey(path))??'null');
 if(!row||!Number.isFinite(row.stored_at)||now<row.stored_at||now-row.stored_at>7*86400000)return null;
 if(path==='locations'&&!Array.isArray(row.value?.locations))return null;
 return {...row.value,_historical:{stored_at:row.stored_at,age_minutes:Math.floor((now-row.stored_at)/60000)}};
 }catch{return null;}
}
