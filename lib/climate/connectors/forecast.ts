import { BaseConnector, FeedError, numeric, series } from './base.ts';
export const forecastFields = {
 temperature_c:{upstream:'temperature_2m',unit:'°C',min:-100,max:70},
 feels_like_c:{upstream:'apparent_temperature',unit:'°C',min:-150,max:100},
 precipitation_mm:{upstream:'precipitation',unit:'mm',min:0,max:Infinity},
 rain_probability_pct:{upstream:'precipitation_probability',unit:'%',min:0,max:100},
 humidity_pct:{upstream:'relative_humidity_2m',unit:'%',min:0,max:100},
 wind_kmh:{upstream:'wind_speed_10m',unit:'km/h',min:0,max:Infinity},
 gust_kmh:{upstream:'wind_gusts_10m',unit:'km/h',min:0,max:Infinity},
} as const;
export type ForecastHour = {time:string} & Record<keyof typeof forecastFields,number|null>;
export function parseDetailedForecast(raw:any,nowMs=Date.now()) {
 const times=series(raw.hourly?.time,'forecast timestamps');
 if(!times.length||times.length>400||new Set(times).size!==times.length||times.some((t,i)=>!Number.isInteger(t)||t%3600!==0||(i>0&&t-times[i-1]!==3600)))throw new FeedError('INVALID_PAYLOAD','Detailed forecast must have unique, contiguous UTC hours');
 const now=Math.floor(nowMs/3600000)*3600;
 const selected=times.map((t,i)=>({t,i})).filter(x=>x.t>now&&x.t<=now+168*3600);
 if(selected.length!==168)throw new FeedError('NO_COVERAGE','Detailed forecast has fewer than 168 future hourly slots');
 const arrays:Record<string,(number|null)[]>={};
 for(const [key,field] of Object.entries(forecastFields)){
  const values=raw.hourly?.[field.upstream];
  if(!Array.isArray(values)||values.length!==times.length)throw new FeedError('INVALID_PAYLOAD','Missing or inconsistent '+field.upstream+' array');
  if(raw.hourly_units?.[field.upstream]!==field.unit)throw new FeedError('INVALID_UNITS','Expected '+field.unit+' for '+field.upstream);
  arrays[key]=values.map((v:any)=>{if(v===null)return null;const n=numeric(v,field.upstream);if(n<field.min||n>field.max)throw new FeedError('INVALID_PAYLOAD','Out-of-range '+field.upstream);return n;});
 }
 const hours:ForecastHour[]=selected.map(x=>Object.assign({time:new Date(x.t*1000).toISOString()},Object.fromEntries(Object.entries(arrays).map(([key,values])=>[key,values[x.i]])))) as ForecastHour[];
 if(hours.every(h=>Object.keys(forecastFields).every(k=>h[k as keyof typeof forecastFields]===null)))throw new FeedError('NO_COVERAGE','All detailed forecast values are missing');
 const complete=(rows:ForecastHour[],key:keyof typeof forecastFields,op:'sum'|'max'|'min')=>{const values=rows.map(h=>h[key]);if(values.some(v=>v===null))return null;const numbers=values as number[];return op==='sum'?numbers.reduce((s,n)=>s+n,0):op==='max'?Math.max(...numbers):Math.min(...numbers);};
 const windows=Array.from({length:7},(_,i)=>{const rows=hours.slice(i*24,(i+1)*24);return {start:new Date((now+i*86400)*1000).toISOString(),end:rows.at(-1)!.time,precipitation_mm:complete(rows,'precipitation_mm','sum'),min_temperature_c:complete(rows,'temperature_c','min'),max_temperature_c:complete(rows,'temperature_c','max'),max_feels_like_c:complete(rows,'feels_like_c','max'),max_gust_kmh:complete(rows,'gust_kmh','max'),max_rain_probability_pct:complete(rows,'rain_probability_pct','max')};});
 return {hours,windows,coverage:Object.fromEntries(Object.keys(forecastFields).map(key=>[key,{available:hours.filter(h=>h[key as keyof typeof forecastFields]!==null).length,total:168}])),window_start:new Date(now*1000).toISOString(),note:'Point model forecasts, not ground observations or district averages. Rolling 24-hour windows start at the current UTC hour; precipitation timestamps end the preceding-hour accumulation. Rain probability is a model probability of precipitation, not flood risk. Missing hourly values and incomplete aggregates remain null. This shares the weather model family with the core snapshot and is not independent consensus.'};
}
export class DetailedForecastConnector extends BaseConnector<ReturnType<typeof parseDetailedForecast>> {
 constructor(){super({id:'open-meteo-detail',name:'Open-Meteo · Detailed Forecast',url:'https://open-meteo.com/en/docs',endpoint:'https://api.open-meteo.com/v1/forecast',tier:3,family:'numerical-weather-models',methodology:'Seven-day point model outlook with hourly humidity, apparent temperature, precipitation probability and 10 m wind/gusts. Same upstream family as the core weather snapshot.',temporal_kind:'forecast',stale_after_minutes:90,license:'CC BY 4.0; free API subject to non-commercial limits'});}
 protected async load(a:Record<string,unknown>){const lat=numeric(a.lat,'latitude'),lon=numeric(a.lon,'longitude');if(lat<23.5||lat>37.5||lon<60.5||lon>78)throw new FeedError('INVALID_COORDINATES','Outside the Pakistan monitoring rectangle');const variables=Object.values(forecastFields).map(f=>f.upstream).join(',');const raw=await this.json(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${variables}&forecast_days=8&timezone=UTC&timeformat=unixtime&wind_speed_unit=kmh&temperature_unit=celsius&precipitation_unit=mm`);const data=parseDetailedForecast(raw);return {updated_at:data.hours[0].time,data};}
}
export const detailedForecast=new DetailedForecastConnector();
