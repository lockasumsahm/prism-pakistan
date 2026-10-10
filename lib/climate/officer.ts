import { briefing } from './service.ts';
import { locationFor } from './locations.ts';
import { quakes, firms } from './connectors/feeds.ts';
import { gdacs } from './connectors/extended.ts';
export async function officerBrief(message:string,slug:string,kind:string,onEvent:(event:unknown)=>void=()=>{}){
 const location=locationFor(slug);if(!location)throw new Error('Unknown location');
 onEvent({type:'status',text:'Retrieving point weather, discharge, air and terrain evidence…'});
 const b=await briefing(kind,slug);onEvent({type:'evidence',evidence:b.evidence});
 const consultations:any[]=[];const calls:any[]=[{tool:'district_snapshot',arguments:{slug},sources:b.evidence.map(e=>e.source.id)}];
 if(/earthquake|seismic|tremor|fault/i.test(message)){onEvent({type:'status',text:'Consulting the USGS catalog…'});const e=await quakes.execute();consultations.push(e);calls.push({tool:'earthquakes',arguments:{slug},sources:[e.source.id]});if(e.ok)b.sections[1].text+=` USGS regional catalog: ${e.data.events.length} M2.5+ events in the monitoring rectangle during seven days. ${e.data.events[0]?`Latest: M${e.data.events[0].magnitude}, ${e.data.events[0].place}, ${e.data.events[0].time}, depth ${e.data.events[0].depth_km} km.`:'No matching events returned; this is not a prediction.'}`;}
 if(/fire|wildfire|thermal/i.test(message)){onEvent({type:'status',text:'Consulting NASA FIRMS…'});const e=await firms.execute();consultations.push(e);calls.push({tool:'active_fires',arguments:{},sources:[e.source.id]});if(e.ok)b.sections[1].text+=` NASA FIRMS returned ${e.data.detections.length} thermal anomalies in the monitoring rectangle. These are not confirmed wildfire perimeters or district impacts.`;}
 if(/gdacs|disaster report|official alert|warning|situation report/i.test(message)){onEvent({type:'status',text:'Consulting GDACS reports…'});const e=await gdacs.execute();consultations.push(e);calls.push({tool:'gdacs_alerts',arguments:{},sources:[e.source.id]});if(e.ok)b.sections[1].text+=` GDACS returned ${e.data.events.length} Pakistan-attributed reports for ${e.data.window.start}–${e.data.window.end}. ${e.data.note}`;}
 for(const e of consultations){if(!e.ok){b.sections[1].text+=` ${e.source.name}: unavailable (${e.error.code} — ${e.error.message}).`;b.missing_data.push({source:e.source.name,code:e.error.code,reason:e.error.message});}onEvent({type:'evidence',evidence:[e]});}
 b.evidence.push(...consultations);b.coverage.available=b.evidence.filter(e=>e.ok).length;b.coverage.total=b.evidence.length;
 b.sections[4].text=`INSUFFICIENT for critical alerts. ${b.coverage.available}/${b.coverage.total} consulted connectors returned data. Availability is not a calibrated confidence score or independent hazard consensus.`;
 b.sections[6].text=b.evidence.map(e=>`${e.source.name}: ${e.ok?'retrieved '+e.source.retrieved_at:e.error.code}`).join(' · ');
 for(const section of b.sections)onEvent({type:'section',section});
 return {...b,tool_calls:calls,question:message,resolved_location:slug,notice:'Deterministic tool-backed evidence routing. A hosted conversational LLM is not configured; no generated measurements or safety decisions.'};
}
