import { BaseConnector, FeedError, numeric } from './base.ts';
import type { SourceSpec } from '../envelope.ts';

function spatialPoint(a:Record<string,unknown>){const lat=numeric(a.lat,'latitude'),lon=numeric(a.lon,'longitude');if(lat<23.5||lat>37.5||lon<60.5||lon>78)throw new FeedError('INVALID_COORDINATES','Outside the Pakistan monitoring rectangle');return {lat,lon};}
const spatialOptions={ttl:3600000,timeout:10000,retries:0,threshold:5,cooldown:60000};
const populationSpec:SourceSpec={id:'worldpop',name:'WorldPop Population Context',url:'https://api.worldpop.org/v2/',endpoint:'https://api.worldpop.org/v2/population',tier:3,family:'worldpop-global2',methodology:'Provider-calculated 2025 population estimate in a 0.01-degree square around the selected point, using 100 m WorldPop data. Not district population, current census or flood-exposed population.',temporal_kind:'static',stale_after_minutes:1440,license:'CC BY 4.0 · WorldPop'};
export class PopulationConnector extends BaseConnector<{total_population:number;area_km2:number;data_year:number;data_source:string;geometry:{type:string;coordinates:number[][][]};scope:string}> {
 private jobs=new Map<string,string>();
 constructor(transport:typeof fetch=fetch){super(populationSpec,spatialOptions,transport);}
 protected async load(a:Record<string,unknown>){
  const {lat,lon}=spatialPoint(a),key=JSON.stringify([lat,lon]);
  const west=lon-.005,east=lon+.005,south=lat-.005,north=lat+.005;
  const geometry={type:'Polygon',coordinates:[[[west,south],[east,south],[east,north],[west,north],[west,south]]]};
  let id=this.jobs.get(key);
  if(!id){const submitted=await this.json(populationSpec.endpoint!,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({geojson:geometry,year:2025,resolution:'100m'})});if(typeof submitted.task_id!=='string'||!/^[-\w]{1,80}$/.test(submitted.task_id))throw new FeedError('INVALID_PAYLOAD','WorldPop task identifier missing');id=submitted.task_id;if(this.jobs.size>=128)this.jobs.delete(this.jobs.keys().next().value!);this.jobs.set(key,id);}
  for(let i=0;i<4;i++){
   const task=await this.json('https://api.worldpop.org/v2/tasks/'+encodeURIComponent(id));
   if(task.status==='success'){
    this.jobs.delete(key);const r=task.result;
    const total=numeric(r?.total_population,'population'),area=numeric(r?.area_km2,'area'),year=numeric(r?.data_year,'dataset year');
    if(total<0||area<=0||year!==2025||typeof r.data_source!=='string')throw new FeedError('INVALID_PAYLOAD','WorldPop result does not match requested area/year');
    return {updated_at:null,data:{total_population:total,area_km2:area,data_year:year,data_source:r.data_source,geometry,scope:'2025 gridded population estimate for the displayed query square; no hazard footprint intersection or district aggregation'}};
   }
   if(task.status==='failure'){this.jobs.delete(key);throw new FeedError('UPSTREAM_JOB_FAILED','WorldPop could not calculate the requested area');}
   if(!['pending','received','started','progress','retry'].includes(task.status))throw new FeedError('INVALID_PAYLOAD','WorldPop returned an unrecognized task status');
   if(i<3)await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw new FeedError('JOB_PENDING','WorldPop calculation is processing. Refresh to resume this instance’s existing task; no population estimate substituted.');
 }
}
const infrastructureSpec:SourceSpec={id:'osm',name:'OpenStreetMap Nearby Facilities',url:'https://wiki.openstreetmap.org/wiki/API_v0.6',endpoint:'https://api.openstreetmap.org/api/0.6/map.json',tier:4,family:'openstreetmap',methodology:'Mapped school, hospital, clinic and fire-station nodes and ways in a 0.01-degree query square. Way coordinates are bounding-box centres, not entrances. Relations, mapping completeness, opening status and route safety are not assessed.',temporal_kind:'static',stale_after_minutes:1440,license:'ODbL · © OpenStreetMap contributors'};
export class InfrastructureConnector extends BaseConnector<{features:{id:string;name:string|null;kind:string;lat:number;lon:number;url:string;coordinate_kind:string}[];bounds:number[];scope:string}> {
 constructor(transport:typeof fetch=fetch){super(infrastructureSpec,{...spatialOptions,ttl:86400000},transport);}
 protected async load(a:Record<string,unknown>){
  const {lat,lon}=spatialPoint(a),bounds=[lon-.005,lat-.005,lon+.005,lat+.005];
  const raw=await this.json(infrastructureSpec.endpoint!+'?bbox='+bounds.join(','),{headers:{'User-Agent':'PRISM/0.5 (+https://prism-pakistan.vercel.app/contact)'}});
  if(!Array.isArray(raw.elements)||raw.version!=='0.6')throw new FeedError('INVALID_PAYLOAD','OSM map feature collection missing');
  const nodes=new Map<number,{lat:number;lon:number}>();
  for(const e of raw.elements)if(e.type==='node'){const y=numeric(e.lat,'map latitude'),x=numeric(e.lon,'map longitude');if(Math.abs(y)>90||Math.abs(x)>180||!Number.isSafeInteger(e.id))throw new FeedError('INVALID_PAYLOAD','Invalid map node');nodes.set(e.id,{lat:y,lon:x});}
  const selected=raw.elements.filter((e:any)=>['node','way'].includes(e.type)&&['hospital','clinic','school','fire_station'].includes(e.tags?.amenity));
  if(selected.length>500)throw new FeedError('PAYLOAD_LIMIT','More than 500 mapped facilities returned; query cannot be displayed');
  const features=selected.map((e:any)=>{
   if(!Number.isSafeInteger(e.id))throw new FeedError('INVALID_PAYLOAD','Invalid mapped facility identity');
   let p=nodes.get(e.id);
   if(e.type==='way'){
    if(!Array.isArray(e.nodes)||!e.nodes.length)throw new FeedError('INVALID_PAYLOAD','Missing facility geometry');
    const points=e.nodes.map((id:number)=>nodes.get(id));if(points.some((p:any)=>!p))throw new FeedError('INCOMPLETE_QUERY','Facility geometry is incomplete; no inferred location displayed');
    p={lat:(Math.min(...points.map((p:any)=>p.lat))+Math.max(...points.map((p:any)=>p.lat)))/2,lon:(Math.min(...points.map((p:any)=>p.lon))+Math.max(...points.map((p:any)=>p.lon)))/2};
   }
   if(!p)throw new FeedError('INVALID_PAYLOAD','Facility coordinate missing');
   return {id:e.type+'/'+e.id,name:typeof e.tags.name==='string'?e.tags.name:null,kind:e.tags.amenity,lat:p.lat,lon:p.lon,url:'https://www.openstreetmap.org/'+e.type+'/'+e.id,coordinate_kind:e.type==='node'?'mapped point':'geometry bounding-box centre'};
  });
  return {updated_at:null,data:{features,bounds,scope:'Nodes and ways returned by the small OSM query square; relations and mapping completeness unverified. Missing mapping never establishes that no facilities exist. No evacuation, operating-status or flood-impact assessment.'}};
 }
}
export const population=new PopulationConnector(),infrastructure=new InfrastructureConnector();
