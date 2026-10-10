import test from 'node:test';
import assert from 'node:assert/strict';
import {SolarConnector,ReportsConnector,configureEnvironment} from '../lib/climate/connectors/feeds.ts';
import {operationalClocks} from '../web/time-status.js';
import {sourceGuideHTML} from '../web/source-guide.js';
const record=(time:string,energy='0.1-0.8nm',flux=0.000001,flag=false)=>({time_tag:time,energy,flux,observed_flux:flux+0.0000001,satellite:18,electron_contaminaton:flag});
test('GOES keeps observation times, units and bands; contaminated values are excluded',async()=>{
 const connector=new SolarConnector(async()=>Response.json([record('2026-10-10T14:00:00Z'),record('2026-10-10T14:02:00Z','0.1-0.8nm',0.9,true),record('2026-10-10T14:01:00Z','0.05-0.4nm')]));
 const envelope=await connector.execute();assert.equal(envelope.ok,true);
 if(envelope.ok){assert.equal(envelope.data.channels.length,2);assert.equal(envelope.source.updated_at,'2026-10-10T14:01:00Z');assert.equal(envelope.data.channels[0].flux_w_m2,0.000001);assert.equal(envelope.data.channels[0].satellite,18);assert.match(envelope.source.endpoint!,/xrays-6-hour/);assert.equal(envelope.data.record_count,2);}
});
test('unusable solar records never become zero measurements',async()=>{
 for(const data of [[record('invalid')],[record('2026-10-10T14:00:00Z','0.1-0.8nm',-1)],[record('2026-10-10T14:00:00Z','0.1-0.8nm',1,true)]]){
  const envelope=await new SolarConnector(async()=>Response.json(data)).execute();assert.equal(envelope.ok,false);assert.equal(envelope.data,null);
 }
});
test('operational clock shows UTC and PKT across the local date boundary',()=>{
 assert.equal(operationalClocks(Date.parse('2026-10-10T19:05:00Z')),'19:05 UTC · 00:05 PKT');assert.equal(operationalClocks(null),'SERVER TIME UNAVAILABLE');
 assert.match(sourceGuideHTML({id:'usgs'},String),/Catalog generation time/);assert.match(sourceGuideHTML({id:'noaa'},String),/three-hour/);
});
test('ReliefWeb approved appname is sent in the required query parameter',async()=>{
 configureEnvironment({RELIEFWEB_APPNAME:'TEST APPROVED'});let requestedURL='',payload;
 const old=globalThis.fetch;globalThis.fetch=async(input,init)=>{requestedURL=String(input);payload=JSON.parse(String(init?.body));return Response.json({data:[]});};
 try{const envelope=await new ReportsConnector().execute();assert.equal(envelope.ok,true);assert.equal(new URL(requestedURL).searchParams.get('appname'),'TEST APPROVED');assert.equal(payload.appname,undefined);assert.ok(!JSON.stringify(envelope).includes('TEST APPROVED'));}
 finally{globalThis.fetch=old;configureEnvironment({RELIEFWEB_APPNAME:''});}
});
