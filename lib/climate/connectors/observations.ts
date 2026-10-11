import { BaseConnector, FeedError, numeric } from './base.ts';

export function distanceKm(a:{lat:number;lon:number},b:{lat:number;lon:number}) {
 const rad=Math.PI/180,dl=(b.lat-a.lat)*rad,dn=(b.lon-a.lon)*rad;
 const h=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));
}
// Airport references only select a reporting station; returned coordinates are retained.
const airportReferences=[{id:'OPLA',lat:31.522,lon:74.404},{id:'OPKC',lat:24.906,lon:67.161},{id:'OPIS',lat:33.549,lon:72.826},{id:'OPPS',lat:33.994,lon:71.515},{id:'OPQT',lat:30.251,lon:66.938}];
export function metarStationFor(lat:number,lon:number){return airportReferences.map(s=>({...s,distance:distanceKm({lat,lon},s)})).sort((a,b)=>a.distance-b.distance)[0];}
export function pktDayStart(now:number){const offset=5*3600000;return Math.floor((now+offset)/86400000)*86400000-offset;}
export function parseMetar(raw:unknown,id:string,point:{lat:number;lon:number},now=Date.now()){
 if(!Array.isArray(raw))throw new FeedError('INVALID_PAYLOAD','METAR collection missing');
 const rows=raw.filter(r=>r.icaoId===id).map(r=>{
  const ts=numeric(r.obsTime,'METAR observation time')*1000;
  if(ts>now+60000||ts<now-25*3600000)throw new FeedError('INVALID_PAYLOAD','METAR time outside requested window');
  const lat=numeric(r.lat,'station latitude'),lon=numeric(r.lon,'station longitude');
  if(Math.abs(lat)>90||Math.abs(lon)>180)throw new FeedError('INVALID_PAYLOAD','Invalid METAR station coordinates');
  if(typeof r.rawOb!=='string')throw new FeedError('INVALID_PAYLOAD','Raw station report missing');
  // wxString describes observed weather. Do not read TEMPO forecast text as an observation.
  const wx=typeof r.wxString==='string'?r.wxString:'';
  const tokens=wx.split(/\s+/),rain=tokens.some(t=>/^(?:[-+])?(?:VC)?(?:MI|PR|BC|DR|BL|SH|TS|FZ)*(?:DZ|RA)/.test(t)&&!t.includes('VC'));
  return {observed_at:new Date(ts).toISOString(),lat,lon,weather_code:wx||null,rain_reported:rain,thunderstorm_reported:tokens.some(t=>t.includes('TS')&&!t.includes('VC')),temperature_c:typeof r.temp==='number'&&Number.isFinite(r.temp)?r.temp:null,raw_report:r.rawOb};
 }).sort((a,b)=>Date.parse(b.observed_at)-Date.parse(a.observed_at));
 if(!rows.length)throw new FeedError('NO_COVERAGE','No airport observations returned');
 const latest=rows[0],distance=distanceKm(point,latest);
 if(distance>100)throw new FeedError('NO_NEARBY_STATION','Reporting airport is more than 100 km from this point');
 const today=rows.filter(r=>Date.parse(r.observed_at)>=pktDayStart(now));
 const rain=today.filter(r=>r.rain_reported);
 return {station:{id,name:id==='OPLA'?'Lahore · Allama Iqbal International Airport':id,lat:latest.lat,lon:latest.lon,distance_km:distance},latest,reports:rows,today:{date:new Date(now+5*3600000).toISOString().slice(0,10),timezone:'Asia/Karachi',report_count:today.length,rain_report_count:rain.length,rain_reported:rain.length>0?true:null,first_rain_at:rain.at(-1)?.observed_at??null,last_rain_at:rain[0]?.observed_at??null,rainfall_total_mm:null},note:'Airport station observations, not district-wide coverage. METAR weather codes identify rain events, not accumulated millimetres. No reported rain does not establish no rain elsewhere. Times retain the actual observation time; forecast TEMPO groups are excluded.'};
}
export class MetarConnector extends BaseConnector<ReturnType<typeof parseMetar>>{
 constructor(transport:typeof fetch=fetch){super({id:'airport-weather',name:'NOAA AWC · Airport Weather Observations',url:'https://aviationweather.gov/data/api/',endpoint:'https://aviationweather.gov/api/data/metar',tier:1,family:'airport-metar',temporal_kind:'observation',stale_after_minutes:90,methodology:'Last 24 hours of airport METAR observations; rain events are counted within the current Pakistan calendar day. Point station coverage, no invented rainfall accumulation.',license:'US government aviation weather service; originating station reports retain their own terms'},{ttl:300000,timeout:10000,retries:1,threshold:5,cooldown:60000},transport);}
 protected async load(a:Record<string,unknown>){const point={lat:numeric(a.lat,'latitude'),lon:numeric(a.lon,'longitude')};if(point.lat<23.5||point.lat>37.5||point.lon<60.5||point.lon>78)throw new FeedError('INVALID_COORDINATES','Outside monitoring area');const nearest=metarStationFor(point.lat,point.lon);if(nearest.distance>100)throw new FeedError('NO_NEARBY_STATION','No configured reporting airport within 100 km');const raw=await this.json('https://aviationweather.gov/api/data/metar?ids='+nearest.id+'&format=json&hours=24');const data=parseMetar(raw,nearest.id,point);return {updated_at:data.latest.observed_at,data};}
}
const ffdSpec={name:'PMD · Flood Forecasting Division',url:'https://ffd.pmd.gov.pk/',tier:1 as const,family:'pmd-ffd',license:'Pakistan Meteorological Department public reports; attribution retained'};
export function parseRiverRegistry(raw:any){
 if(raw?.ok!==true||!Array.isArray(raw.rivers)||!raw.rivers.length||raw.rivers.length>50)throw new FeedError('INVALID_PAYLOAD','Official river registry missing');
 return {rivers:raw.rivers.map((r:any)=>{if(typeof r.river!=='string'||!Array.isArray(r.stations)||r.stations.length>300)throw new FeedError('INVALID_PAYLOAD','Invalid river group');return {slug:r.river.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''),name:r.river,stations:r.stations.map((s:any)=>{if(!Number.isInteger(s.id)||s.id<1||typeof s.name!=='string')throw new FeedError('INVALID_PAYLOAD','Invalid station reference');return {id:s.id,name:s.name,is_dam:s.is_dam===true};})};}),note:'Official public FFD station roster. A station can be listed under several river groups; group membership alone does not establish the river of its primary gauge.'};
}
export class RiverRegistryConnector extends BaseConnector<ReturnType<typeof parseRiverRegistry>>{
 constructor(transport:typeof fetch=fetch){super({...ffdSpec,id:'pmd-river-registry',endpoint:'https://ffd.pmd.gov.pk/flood-assistant/rivers',temporal_kind:'static',stale_after_minutes:1440,methodology:'Official public flood-assistant river and station directory; no protected map endpoint is accessed.'},{ttl:3600000,timeout:10000,retries:1,threshold:5,cooldown:60000},transport);}
 protected async load(){return {updated_at:null,data:parseRiverRegistry(await this.json('https://ffd.pmd.gov.pk/flood-assistant/rivers'))};}
}
function optionalReading(value:unknown,label:string){if(value===null||value===undefined)return null;const n=numeric(value,label);if(n<0)throw new FeedError('INVALID_PAYLOAD','Negative '+label);return n;}
export function parseRiverStation(raw:any,id:number,now=Date.now()){
 const s=raw?.station;if(raw?.ok!==true||!s||s.id!==id||typeof s.name!=='string'||typeof s.river!=='string')throw new FeedError('INVALID_PAYLOAD','Official station identity does not match');
 if(s.unit!=='cusecs'&&s.unit!=='ft')throw new FeedError('INVALID_UNITS','Unknown official station unit');
 const c=s.current;let current=null;
 if(c){if(typeof c.timestamp!=='string'||!/(Z|[+-]\d\d:\d\d)$/.test(c.timestamp)||!Number.isFinite(Date.parse(c.timestamp))||Date.parse(c.timestamp)>now+60000)throw new FeedError('INVALID_PAYLOAD','Station observation timestamp missing or invalid');current={observed_at:new Date(c.timestamp).toISOString(),inflow_cusecs:optionalReading(c.inflow_discharge,'inflow'),outflow_cusecs:optionalReading(c.outflow_discharge,'outflow'),flow_cusecs:s.metric==='discharge'?optionalReading(c.flow,'flow'):null,dam_level_ft:optionalReading(c.dam_level,'reservoir level'),is_stale:c.is_stale===true||now-Date.parse(c.timestamp)>12*3600000,provider_source:typeof c.source==='string'?c.source:null};}
 const series=Array.isArray(s.series)?s.series.slice(-60).map((r:any)=>{if(typeof r.t!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.t)||!Number.isFinite(Date.parse(r.t)))throw new FeedError('INVALID_PAYLOAD','Invalid station history date');return {date:r.t,value:optionalReading(r.v,'history value')};}):[];
 const thresholds=Array.isArray(s.thresholds)?s.thresholds.map((t:any)=>({label:typeof t.label==='string'?t.label:'Unlabelled',min_cusecs:optionalReading(t.min_discharge,'official threshold')})):[];
 return {id,name:s.name,river:s.river,is_dam:s.is_dam===true,metric:s.metric==='discharge'?'discharge':'level',unit:s.unit,status:typeof s.status==='string'?s.status:null,status_label:typeof s.status_label==='string'?s.status_label:null,current,thresholds,history:series,trend_label:typeof s.trend_display?.label==='string'?s.trend_display.label:null,forecast:s.forecast?{qualitative:typeof s.forecast.qualitative==='string'?s.forecast.qualitative:null,quantitative:typeof s.forecast.quantitative==='string'?s.forecast.quantitative:null,metric_label:typeof s.forecast.metric_label==='string'?s.forecast.metric_label:null,issued_label:typeof s.forecast.forecast_time==='string'?s.forecast.forecast_time:null,valid_to_label:typeof s.forecast.valid_to==='string'?s.forecast.valid_to:null}:null,note:'Official published station report, not a PRISM prediction. Gauge status applies to this station, not city drainage or every point on the river. cusecs means cubic feet per second; reservoir levels are feet. Provider forecast labels are preserved separately from observed values.'};
}
export class RiverStationConnector extends BaseConnector<ReturnType<typeof parseRiverStation>>{
 constructor(transport:typeof fetch=fetch){super({...ffdSpec,id:'pmd-river-station',endpoint:'https://ffd.pmd.gov.pk/flood-assistant/station',temporal_kind:'observation',stale_after_minutes:720,methodology:'Official FFD public station report: actual report time, inflow/outflow, station classification and separately labelled outlook. Not instantaneous telemetry.'},{ttl:300000,timeout:10000,retries:1,threshold:5,cooldown:60000},transport);}
 protected async load(a:Record<string,unknown>){const id=numeric(a.id,'station id');if(!Number.isInteger(id)||id<1||id>10000)throw new FeedError('INVALID_STATION','Invalid station identifier');const raw=await this.json('https://ffd.pmd.gov.pk/flood-assistant/station/'+id+'?lang=en');const data=parseRiverStation(raw,id);return {updated_at:data.current?.observed_at??null,data};}
}
export const airportWeather=new MetarConnector(),riverRegistry=new RiverRegistryConnector(),riverStation=new RiverStationConnector();
