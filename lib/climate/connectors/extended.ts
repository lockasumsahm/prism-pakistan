import { BaseConnector, FeedError, numeric } from './base.ts';
import { coordinates } from '../locations.ts';
import type { SourceSpec } from '../envelope.ts';
const gdacsSpec:SourceSpec={id:'gdacs',name:'GDACS Disaster Alerts',url:'https://www.gdacs.org/feed_reference.aspx',endpoint:'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH',tier:4,family:'gdacs',methodology:'GDACS reported events explicitly naming Pakistan as an affected country. Explicit Green/Orange/Red and hazard-type filters. Seven-day event-end search plus a separate ninety-day event archive, bounded pagination; no district impact inference. No reported events does not establish safety.',temporal_kind:'report',stale_after_minutes:30,license:'GDACS attribution required; provider disclaimer applies'};
export function parseGdacs(raw:any){
 if(raw?.type!=='FeatureCollection'||!Array.isArray(raw.features)||raw.features.length>100)throw new FeedError('INVALID_PAYLOAD','Invalid GDACS feature collection');
 return raw.features.map((f:any)=>{
  const p=f.properties,c=f.geometry?.coordinates;
  if(!p||f.geometry?.type!=='Point'||!Array.isArray(c)||c.length<2)throw new FeedError('INVALID_PAYLOAD','Missing GDACS event point');
  const lon=numeric(c[0],'GDACS longitude'),lat=numeric(c[1],'GDACS latitude');
  if(Math.abs(lat)>90||Math.abs(lon)>180||!['Green','Orange','Red'].includes(p.alertlevel)||typeof p.eventtype!=='string'||!Number.isInteger(p.eventid)||!Array.isArray(p.affectedcountries))throw new FeedError('INVALID_PAYLOAD','Invalid GDACS event fields');
  const utc=(s:unknown)=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(s))throw new FeedError('INVALID_PAYLOAD','Missing GDACS timestamp');const d=new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(s)?s:s+'Z');if(!Number.isFinite(d.getTime()))throw new FeedError('INVALID_PAYLOAD','Invalid GDACS timestamp');return d.toISOString();};
  const url=p.url?.report;if(typeof url!=='string'||!/^https:\/\/(?:www\.)?gdacs\.org\//.test(url))throw new FeedError('INVALID_PAYLOAD','Invalid GDACS report link');
  return {id:p.eventtype+'-'+p.eventid,episode:p.episodeid,name:String(p.name??p.description??p.eventtype),type:p.eventtype,level:p.alertlevel,lat,lon,url,from:utc(p.fromdate),to:utc(p.todate),updated_at:utc(p.datemodified),pakistan:p.iso3==='PAK'||p.affectedcountries.some((x:any)=>x.iso3==='PAK')};
 });
}
export function gdacsPartition(recent:ReturnType<typeof parseGdacs>,history:ReturnType<typeof parseGdacs>,start:string){
 const unique=new Map<string,ReturnType<typeof parseGdacs>[number]>();
 for(const e of [...recent,...history].filter(e=>e.pakistan)){const old=unique.get(e.id);if(!old||e.updated_at>old.updated_at||(e.updated_at===old.updated_at&&Number(e.episode)>Number(old.episode)))unique.set(e.id,e);}
 const all=[...unique.values()].sort((a,b)=>b.to.localeCompare(a.to));
 return {events:all.filter(e=>e.to.slice(0,10)>=start),archive:all.filter(e=>e.to.slice(0,10)<start),updated_at:all.map(e=>e.updated_at).sort().at(-1)??null};
}
export class GdacsConnector extends BaseConnector<{events:ReturnType<typeof parseGdacs>;archive:ReturnType<typeof parseGdacs>;scope:string;complete:boolean;window:{start:string;end:string};archive_window:{start:string;end:string;types:string[];complete:boolean};note:string}> {
 constructor(transport:typeof fetch=fetch){super(gdacsSpec,{ttl:300_000,timeout:12_000,retries:0,threshold:5,cooldown:60_000},transport);}
 protected async load(){
  const end=new Date().toISOString().slice(0,10),start=new Date(Date.now()-7*86400000).toISOString().slice(0,10),archiveStart=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
  const all:ReturnType<typeof parseGdacs>=[];let complete=false;
  for(let page=1;page<=5;page++){const query=new URLSearchParams({fromdate:archiveStart,todate:end,country:'PAK',eventlist:'EQ;FL;TC;DR;WF;VO',alertlevel:'green;orange;red',pagenumber:String(page),pagesize:'100'});const events=parseGdacs(await this.json(gdacsSpec.endpoint+'?'+query));all.push(...events);if(events.length<100){complete=true;break;}}
  const partition=gdacsPartition([],all,start);
  return {updated_at:partition.updated_at,data:{events:partition.events,archive:partition.archive,scope:'GDACS country attribution: Pakistan; event points need not lie inside Pakistan',complete,window:{start,end},archive_window:{start:archiveStart,end:new Date(Date.parse(start)-86400000).toISOString().slice(0,10),types:['EQ','FL','TC','DR','WF','VO'],complete},note:'Recent reports are selected by provider event-end date, not confirmed active incidents. Green is a GDACS impact classification, not local safety. Empty results never establish absence of hazards.'+(!complete?' Country search reached its 500-record cap; recent and historical coverage may be incomplete.':'')}};
 }
}
const chirpsSpec:SourceSpec={id:'chirps',name:'CHIRPS · ClimateSERV',url:'https://climateserv.servirglobal.net/develop-api',endpoint:'https://climateserv.servirglobal.net/api/submitDataRequest/',tier:2,family:'chirps-station-satellite-blend',methodology:'Daily CHIRPS area-mean rainfall over a 0.05° square around the selected point. Latest thirty usable calendar days within a ninety-day query ending ten days before retrieval; publication lag and missing granules remain explicit. Not a forecast or gauge reading.',temporal_kind:'observation',stale_after_minutes:43200,license:'UCSB CHIRPS / ClimateSERV provider terms; attribution required'};
export function chirpsWindow(now=Date.now()){const end=new Date(now-10*86400000).toISOString().slice(0,10),start=new Date(Date.parse(end)-29*86400000).toISOString().slice(0,10);return {start,end};}
export function parseChirps(raw:any,window:{start:string;end:string}){
 if(!Array.isArray(raw?.data)||raw.data.length>31)throw new FeedError('INVALID_PAYLOAD','Missing or oversized CHIRPS granule collection');
 const found=new Map<string,number>();
 for(const row of raw.data){if(typeof row.date!=='string')throw new FeedError('INVALID_PAYLOAD','Missing CHIRPS date');const match=row.date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(!match)throw new FeedError('INVALID_PAYLOAD','Invalid CHIRPS date');
  // ClimateSERV's production output uses month/day/year (verified against epochTime).
  const date=match[3]+'-'+match[1].padStart(2,'0')+'-'+match[2].padStart(2,'0');const day=Date.parse(date+'T00:00:00Z');
  if(!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==date||date<window.start||date>window.end||found.has(date))throw new FeedError('INVALID_PAYLOAD','Duplicate or out-of-window CHIRPS day');
  if(row.epochTime!==undefined){const epoch=Number(row.epochTime);if(!Number.isFinite(epoch)||Math.abs(epoch*1000-day)>12*3600000)throw new FeedError('INVALID_PAYLOAD','CHIRPS date and epoch disagree');}
  const n=row.value?.avg;if(n===undefined||n===null||n===-9999)continue;const rain=numeric(n,'CHIRPS daily rainfall');if(rain<0)throw new FeedError('INVALID_PAYLOAD','Negative CHIRPS rainfall');found.set(date,rain);
 }
 const days=Array.from({length:30},(_,i)=>{const date=new Date(Date.parse(window.start)+i*86400000).toISOString().slice(0,10);return {date,rain_mm:found.get(date)??null};});
 if(!found.size)throw new FeedError('NO_COVERAGE','CHIRPS job returned no usable rainfall days');
 return {days,window,available_days:found.size,total_30d_mm:found.size===30?days.reduce((sum,d)=>sum+d.rain_mm!,0):null,available_sum_mm:[...found.values()].reduce((sum,v)=>sum+v,0),area:'0.05° square around reference coordinate',publication_time:null,note:'Archive window excludes the newest ten days. A partial sum is not a thirty-day total; source time is the latest data day, not publication time.'};
}
export function parseChirpsArchive(raw:any,queryWindow:{start:string;end:string},now=Date.now()){
 if(!Array.isArray(raw?.data)||raw.data.length>90)throw new FeedError('INVALID_PAYLOAD','Missing or oversized CHIRPS archive');
 const rows=raw.data;const dates=rows.map((r:any)=>{const m=typeof r.date==='string'?r.date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/):null;if(!m)throw new FeedError('INVALID_PAYLOAD','Invalid CHIRPS archive date');const d=m[3]+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0');if(d<queryWindow.start||d>queryWindow.end)throw new FeedError('INVALID_PAYLOAD','Out-of-window CHIRPS archive day');return d;});
 const usable=rows.map((r:any,i:number)=>({r,date:dates[i]})).filter((x:any)=>typeof x.r.value?.avg==='number'&&x.r.value.avg>=0).sort((a:any,b:any)=>a.date.localeCompare(b.date));
 if(!usable.length)throw new FeedError('NO_COVERAGE','No published rainfall days returned in the ninety-day query');
 const end=usable.at(-1)!.date,start=new Date(Date.parse(end)-29*86400000).toISOString().slice(0,10);
 if(start<queryWindow.start)throw new FeedError('NO_COVERAGE','Insufficient archive lookback for a thirty-day calendar window');
 // Validate ALL returned dates/values before trimming, including duplicates and epoch disagreement.
 if(new Set(dates).size!==dates.length)throw new FeedError('INVALID_PAYLOAD','Duplicate CHIRPS archive date');
 for(let i=0;i<rows.length;i++){const r=rows[i],day=Date.parse(dates[i]);if(!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==dates[i]||r.epochTime!==undefined&&(!Number.isFinite(Number(r.epochTime))||Math.abs(Number(r.epochTime)*1000-day)>12*3600000)||r.value?.avg!=null&&r.value.avg!==-9999&&(typeof r.value.avg!=='number'||!Number.isFinite(r.value.avg)||r.value.avg<0))throw new FeedError('INVALID_PAYLOAD','Invalid CHIRPS archive granule');}
 const data=parseChirps({data:rows.filter((r:any,i:number)=>dates[i]>=start&&dates[i]<=end)},{start,end});return {...data,query_window:queryWindow,lag_days:Math.floor((now-Date.parse(end))/86400000),note:'Window ends on the most recent usable day returned by the archive query; it is not a publication timestamp or a claim of current rainfall. Missing calendar days stay missing.'};
}
export class ChirpsConnector extends BaseConnector<ReturnType<typeof parseChirpsArchive>> {
 private jobs=new Map<string,{id:string;created:number}>();
 constructor(){super(chirpsSpec,{ttl:6*3600000,timeout:8_000,retries:0,threshold:5,cooldown:60_000});}
 protected async load(a:Record<string,unknown>){
  const {lat,lon}=coordinates(a),window={end:chirpsWindow().end,start:new Date(Date.parse(chirpsWindow().end)-89*86400000).toISOString().slice(0,10)},key=JSON.stringify({lat,lon,window});let job=this.jobs.get(key);
  if(job&&Date.now()-job.created>3600000){this.jobs.delete(key);job=undefined;}
  if(!job){const fmt=(d:string)=>d.slice(5,7)+'/'+d.slice(8,10)+'/'+d.slice(0,4);const geometry={type:'Polygon',coordinates:[[[lon-.025,lat-.025],[lon+.025,lat-.025],[lon+.025,lat+.025],[lon-.025,lat+.025],[lon-.025,lat-.025]]]};
   const params=new URLSearchParams({datatype:'0',intervaltype:'0',operationtype:'5',begintime:fmt(window.start),endtime:fmt(window.end),geometry:JSON.stringify(geometry)});
   const raw=await this.json(chirpsSpec.endpoint+'?'+params);const id=Array.isArray(raw)?raw[0]:raw;if(typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))throw new FeedError('INVALID_PAYLOAD','ClimateSERV did not return a valid processing job');
   if(this.jobs.size>=128)this.jobs.delete(this.jobs.keys().next().value!);job={id,created:Date.now()};this.jobs.set(key,job);
  }
  for(let i=0;i<4;i++){
   const raw=await this.json('https://climateserv.servirglobal.net/api/getDataRequestProgress/?id='+job.id),progress=Array.isArray(raw)?raw[0]:raw;
   if(typeof progress!=='number'||progress<0||progress>100){this.jobs.delete(key);throw new FeedError('UPSTREAM_JOB_FAILED','ClimateSERV processing failed; no rainfall substituted');}
   if(progress===100){const raw=await this.json('https://climateserv.servirglobal.net/api/getDataFromRequest/?id='+job.id),data=parseChirpsArchive(raw,window);return {updated_at:data.days.filter(d=>d.rain_mm!==null).at(-1)!.date+'T00:00:00Z',data};}
   if(i<3)await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw new FeedError('JOB_PENDING','ClimateSERV archive processing is still running. Retry after 30 seconds; job state is retained in this server instance for one hour.');
 }
}
export const gdacs=new GdacsConnector(),chirps=new ChirpsConnector();
