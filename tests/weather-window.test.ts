import test from 'node:test';
import assert from 'node:assert/strict';
import { WeatherConnector } from '../lib/climate/connectors/feeds.ts';
const now=Math.floor(Date.now()/3600000)*3600;
const hours=Array.from({length:193},(_,i)=>now-24*3600+i*3600);
let duplicate=false;
globalThis.fetch=async()=>Response.json({hourly_units:{precipitation:'mm',temperature_2m:'°C'},hourly:{time:duplicate?hours.map((t,i)=>i===5?hours[4]:t):hours,precipitation:hours.map(t=>t<=now?10:1),temperature_2m:hours.map(()=>25),soil_moisture_0_to_7cm:hours.map(()=>.25)}});
test('preceding-hour accumulation windows keep past rainfall out of future sums',async()=>{const e=await new WeatherConnector().execute({lat:24.8,lon:67});assert.equal(e.ok,true);if(e.ok){assert.equal(e.data.rain_past_24h_mm,240);assert.equal(e.data.rain_next_24h_mm,24);assert.equal(e.data.rain_next_7d_mm,168);assert.equal(e.data.hours[0].time,new Date((now+3600)*1000).toISOString());}});
test('duplicated timestamps cannot masquerade as a complete forecast',async()=>{duplicate=true;const e=await new WeatherConnector().execute({lat:24.8,lon:67});assert.equal(e.ok,false);assert.equal(e.error?.code,'INVALID_PAYLOAD');});
