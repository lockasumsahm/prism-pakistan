// Server time is anchored to a monotonic clock, never to the user's wall clock.
export class ServerClock {
 constructor(monotonic=()=>performance.now()){this.monotonic=monotonic;this.anchor=null;}
 synchronize(iso){const value=Date.parse(iso);if(typeof iso!=='string'||!Number.isFinite(value))throw new Error('Invalid server clock response');this.anchor={unix:value,tick:this.monotonic()};}
 now(){return this.anchor?this.anchor.unix+Math.max(0,this.monotonic()-this.anchor.tick):null;}
}
export function cacheDeadline(now,ttl=300000){return Math.min(now+ttl,(Math.floor(now/3600000)+1)*3600000);}
export function evidenceStatus(envelope,now){
 if(!envelope?.ok)return envelope?.error?.code==='JOB_PENDING'?'PROCESSING':'OFFLINE';
 const s=envelope.source;
 if(['chirps','power','daily-archive'].includes(s.id))return 'ARCHIVE';
 if(s.temporal_kind==='static')return 'STATIC';
 if(now===null||!Number.isFinite(now))return 'TIME UNVERIFIED';
 const retrieved=Date.parse(s.retrieved_at),valid=Date.parse(s.updated_at);
 if(!Number.isFinite(retrieved)||retrieved>now+60000)return 'TIME UNVERIFIED';
 const ttl=Number.isFinite(s.stale_after_minutes)?s.stale_after_minutes*60000:5400000;
 if(now-retrieved>ttl)return 'STALE';
 if(s.temporal_kind==='forecast')return 'FORECAST';
 if(s.temporal_kind==='report')return 'REPORT';
 if(!Number.isFinite(valid))return 'UNDATED';
 if(valid>now+60000)return 'TIME UNVERIFIED';
 return now-valid>ttl?'STALE':envelope.cached?'CACHED':'AVAILABLE';
}
