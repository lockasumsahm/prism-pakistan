import { airportWeather,riverStation } from './connectors/observations.ts';
import { ndma } from './connectors/advisories.ts';
import { population, infrastructure } from './connectors/spatial.ts';
import { detailedForecast } from './connectors/forecast.ts';
import { briefing } from './service.ts';
import { locationFor } from './locations.ts';
import { quakes, firms, space, solar } from './connectors/feeds.ts';
import { gdacs } from './connectors/extended.ts';
export async function officerBrief(message:string,slug:string,kind:string,onEvent:(event:unknown)=>void=()=>{}){
 const location=locationFor(slug);if(!location)throw new Error('Unknown location');
 onEvent({type:'status',text:'Retrieving point weather, discharge, air and terrain evidence…'});
 const b=await briefing(kind,slug);onEvent({type:'evidence',evidence:b.evidence});
 const w=b.evidence.find(e=>e.source.id==='open-meteo-weather');
 if(w?.ok&&/rain|weather|temperature|forecast/i.test(message))b.sections[0].text=`${location.name}: model forecast valid ${w.source.updated_at}, temperature ${w.data.temp_c.toFixed(1)} °C; rainfall ${w.data.rain_next_24h_mm.toFixed(1)} mm over the next 24 hours and ${w.data.rain_next_7d_mm.toFixed(1)} mm over seven days. These are forecast readings, not a flood-warning classification.`;
 if(/flood|risk|safe|close|evacuat/i.test(message))b.sections[0].text=`${location.name}: PRISM cannot determine local flood danger, route safety, school closures or evacuation needs from the available model evidence. Check the dated official advisories below and confirm instructions with local authorities. Available source-backed readings follow; missing calibration is not an API outage.`;
 const consultations:any[]=[];const calls:any[]=[{tool:'district_snapshot',arguments:{slug},sources:b.evidence.map(e=>e.source.id)}];
 if(/rain|weather|temperature|forecast/i.test(message)){const e=await airportWeather.execute({lat:location.lat,lon:location.lon});consultations.push(e);calls.push({tool:'observed_weather',arguments:{slug},sources:[e.source.id]});b.sections[0].text+=(e.ok?` Today's airport observations (${e.data.today.date} PKT): ${e.data.today.rain_reported?'rain reported, most recently '+e.data.today.last_rain_at:'rain not confirmed by available airport reports'}. ${e.data.station.id} is ${e.data.station.distance_km.toFixed(1)} km from the point. Accumulated rainfall millimetres are not supplied.`:` Observed weather unavailable: ${e.error.code}. Forecast rainfall does not confirm today's rain.`);}
 if(/river|ravi|shahdara|barrage|gauge/i.test(message)&&slug==='lahore'){const e=await riverStation.execute({id:74});consultations.push(e);calls.push({tool:'river_station',arguments:{id:74},sources:[e.source.id]});if(e.ok){const c=e.data.current;b.sections[1].text+=` Official PMD ${e.data.name} (${e.data.river}): ${e.data.status_label??'classification unavailable'}; ${c?'observed '+c.observed_at+', inflow '+(c.inflow_cusecs??'missing')+' cusecs, outflow '+(c.outflow_cusecs??'missing')+' cusecs'+(c.is_stale?' (stale reading)':''):'current reading missing'}. This gauge does not assess street flooding.`;}else b.sections[1].text+=` Official river station unavailable: ${e.error.code}.`;}
 if(/wind|gust|humidity|feels.like|apparent.temperature|rain.probability/i.test(message)){onEvent({type:'status',text:'Consulting detailed hourly weather…'});const e=await detailedForecast.execute({lat:location.lat,lon:location.lon});consultations.push(e);calls.push({tool:'weather_detail',arguments:{slug},sources:[e.source.id]});if(e.ok){const h=e.data.hours[0],reading=(v:number|null,unit:string)=>v===null?'missing':v.toFixed(1)+' '+unit;b.sections[1].text+=` First future model hour ${h.time}: wind at 10 m ${reading(h.wind_kmh,'km/h')}, gust ${reading(h.gust_kmh,'km/h')}, humidity ${reading(h.humidity_pct,'%')}, feels-like temperature ${reading(h.feels_like_c,'°C')}, precipitation probability ${reading(h.rain_probability_pct,'%')}. This is not independent of the core weather model or a flood probability.`;}}
 if(/earthquake|seismic|tremor|fault/i.test(message)){onEvent({type:'status',text:'Consulting the USGS catalog…'});const e=await quakes.execute();consultations.push(e);calls.push({tool:'earthquakes',arguments:{slug},sources:[e.source.id]});if(e.ok)b.sections[1].text+=` USGS regional catalog: ${e.data.events.length} M2.5+ events in the monitoring rectangle during seven days. ${e.data.events[0]?`Latest: M${e.data.events[0].magnitude}, ${e.data.events[0].place}, ${e.data.events[0].time}, depth ${e.data.events[0].depth_km} km.`:'No matching events returned; this is not a prediction.'}`;}
 if(/fire|wildfire|thermal/i.test(message)){onEvent({type:'status',text:'Consulting NASA FIRMS…'});const e=await firms.execute();consultations.push(e);calls.push({tool:'active_fires',arguments:{},sources:[e.source.id]});if(e.ok)b.sections[1].text+=` NASA FIRMS returned ${e.data.detections.length} thermal anomalies in the monitoring rectangle. These are not confirmed wildfire perimeters or district impacts.`;}
 if(/gdacs|disaster report|official alert|warning|situation report/i.test(message)){onEvent({type:'status',text:'Consulting GDACS reports…'});const e=await gdacs.execute();consultations.push(e);calls.push({tool:'gdacs_alerts',arguments:{},sources:[e.source.id]});if(e.ok)b.sections[1].text+=` GDACS returned ${e.data.events.length} Pakistan-attributed reports for ${e.data.window.start}–${e.data.window.end}; ${e.data.archive.length} older event reports are available in the separate 90-day archive. ${e.data.note}`;}
 if(/flood|risk|warning|alert|advisory|advisories|school|close|evacuat/i.test(message)){
  onEvent({type:'status',text:'Consulting official NDMA advisory publications…'});const e=await ndma.execute();consultations.push(e);calls.push({tool:'official_advisories',arguments:{},sources:[e.source.id]});
  if(e.ok){b.sections[1].text+=` NDMA latest listed publication: ${e.data.advisories[0].title}, published ${e.data.latest_published_date} (date only). Source: ${e.data.advisories[0].url}. ${e.data.note}`;b.sections[5].text+=` Read the latest NDMA source document: ${e.data.advisories[0].url}. PRISM has not interpreted its PDF or verified that it applies to ${location.name}.`;}
 }
 if(/solar|sun|flare|space.weather|geomagnetic|\bkp\b/i.test(message)){
  onEvent({type:'status',text:'Consulting NOAA planetary Kp and GOES solar observations…'});
  const [k,x]=await Promise.all([space.execute(),solar.execute()]);consultations.push(k,x);calls.push({tool:'space_weather',arguments:{},sources:[k.source.id]},{tool:'solar_weather',arguments:{},sources:[x.source.id]});
  const facts=[];
  if(k.ok)facts.push(`NOAA estimated three-hour planetary Kp ${k.data.kp}, record ${k.data.time}.`);
  if(x.ok)facts.push(...x.data.channels.map(c=>`GOES-${c.satellite} ${c.energy} corrected X-ray flux ${c.flux_w_m2.toExponential(3)} W/m², observed ${c.observed_at}.`));
  b.sections[0].text=`NOAA global solar and geomagnetic evidence: ${facts.length?facts.join(' '):'No usable readings returned.'} These readings do not establish a local climate hazard or confirmed flare impact.`;
  b.sections[1].text+=' '+facts.join(' ');
 }
 if(/population|people|exposure|school|hospital|clinic|facilit|infrastructure/i.test(message)){
  onEvent({type:'status',text:'Retrieving dated population context and mapped nearby facilities…'});
  const args={lat:location.lat,lon:location.lon};const [p,i]=await Promise.all([population.execute(args),infrastructure.execute(args)]);consultations.push(p,i);calls.push({tool:'population_context',arguments:{slug},sources:[p.source.id]},{tool:'nearby_facilities',arguments:{slug},sources:[i.source.id]});
  if(p.ok)b.sections[3].text+=` WorldPop ${p.data.data_year} estimates ${p.data.total_population.toFixed(0)} people in the ${p.data.area_km2.toFixed(3)} km² query square around this reference point. This is not district population or the number exposed to flooding.`;
  if(i.ok){const kinds=/hospital|clinic/i.test(message)?['hospital','clinic']:/school/i.test(message)?['school']:['school','hospital','clinic','fire_station'];const matches=i.data.features.filter(f=>kinds.includes(f.kind));const named=matches.slice(0,8).map(f=>`${f.name??'Unnamed '+f.kind} (${f.lat.toFixed(5)}, ${f.lon.toFixed(5)}; ${f.url})`).join('; ');b.sections[3].text+=` OpenStreetMap returned ${matches.length} mapped facilities matching the requested type in this reference-point query square.${named?' Mapped listings: '+named+'.':' No matching listing establishes neither absence of facilities nor availability elsewhere in the district.'} Their opening status, flood impact and safe access are not verified. This is not a district-wide directory.`;}

 }
 for(const e of consultations){if(!e.ok){b.sections[1].text+=` ${e.source.name}: unavailable (${e.error.code} — ${e.error.message}).`;b.missing_data.push({source:e.source.name,code:e.error.code,reason:e.error.message});}onEvent({type:'evidence',evidence:[e]});}
 b.evidence.push(...consultations);b.coverage.available=b.evidence.filter(e=>e.ok).length;b.coverage.total=b.evidence.length;
 b.sections[4].text=`INSUFFICIENT for critical alerts. ${b.coverage.available}/${b.coverage.total} consulted connectors returned data. Availability is not a calibrated confidence score or independent hazard consensus.`;
 b.sections[6].text=b.evidence.map(e=>`${e.source.name}: ${e.ok?'retrieved '+e.source.retrieved_at:e.error.code}`).join(' · ');
 for(const section of b.sections)onEvent({type:'section',section});
 return {...b,tool_calls:calls,question:message,resolved_location:slug,notice:'Deterministic tool-backed evidence routing. A hosted conversational LLM is not configured; no generated measurements or safety decisions.'};
}
