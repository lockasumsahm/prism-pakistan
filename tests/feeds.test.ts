import test from 'node:test';
import assert from 'node:assert/strict';
// Only test-process fixtures; this transport never enters the deployed app.
let csv='latitude,longitude,bright_ti4,confidence,acq_date,acq_time\n24.8,67.0,310.4,n,2026-10-09,0905\n';
globalThis.fetch=async()=>new Response(csv,{headers:{'Content-Type':'text/csv'}});
const {parseCsv,FirmsConnector,configureEnvironment,OpenAQConnector,FloodConnector}=await import('../lib/climate/connectors/feeds.ts');
test('CSV quoted fields and zero-valued fields parse without losing columns',()=>{const rows=parseCsv('latitude,longitude,description\n0,67,"A, B"\n');assert.equal(rows[0].latitude,'0');assert.equal(rows[0].description,'A, B');});
test('malformed CSV and missing geographic headers are rejected',()=>{assert.throws(()=>parseCsv('latitude,longitude\n"24,67'));assert.throws(()=>parseCsv('value\n10'));assert.throws(()=>parseCsv('latitude,longitude\n24,67,extra'));});
test('missing key returns an explicit offline envelope',async()=>{const e=await new OpenAQConnector().execute();assert.equal(e.ok,false);assert.equal(e.error?.code,'CONFIGURATION_REQUIRED');});
test('configured thermal detection keeps units, UTC time and source scope',async()=>{configureEnvironment({NASA_FIRMS_KEY:'TEST_FIXTURE_KEY'});const e=await new FirmsConnector().execute();assert.equal(e.ok,true);if(e.ok){assert.equal(e.data.detections[0].brightness_k,310.4);assert.equal(e.data.detections[0].observed_at,'2026-10-09T09:05:00Z');assert.match(e.data.scope,/Rectangular/);assert.ok(!JSON.stringify(e).includes('TEST_FIXTURE_KEY'));}});
test('blank satellite latitude does not become a fabricated zero coordinate',async()=>{csv='latitude,longitude,bright_ti4,confidence,acq_date,acq_time\n,67.0,310.4,n,2026-10-09,0905\n';const e=await new FirmsConnector().execute();assert.equal(e.ok,false);assert.equal(e.data,null);assert.equal(e.error?.code,'INVALID_PAYLOAD');});

test("public FIRMS file filters neighbouring detections while retaining actual timestamps",async()=>{csv="latitude,longitude,bright_ti4,confidence,acq_date,acq_time\n24.8,67,310.4,n,2026-10-09,0905\n8.8,80.7,330,n,2026-10-09,1000\n";const e=await new FirmsConnector().execute();assert.equal(e.ok,true);if(e.ok){assert.equal(e.data.detections.length,1);assert.match(e.source.endpoint!,/South_Asia_24h.csv/);}});

test("zero model days produce steady trend without dividing by zero or claiming gauge flow",async()=>{globalThis.fetch=async()=>Response.json({daily_units:{river_discharge:"m³/s"},daily:{time:Array.from({length:8},(_,i)=>new Date(Date.now()+(i-1)*86400000).toISOString().slice(0,10)),river_discharge:Array(8).fill(0)}});const e=await new FloodConnector().execute({lat:27.5,lon:69});assert.equal(e.ok,true);if(e.ok){assert.equal(e.data.trend,"steady");assert.equal(e.data.change_24h_pct,null);assert.equal(e.data.discharge_cms,0);assert.equal(e.data.return_period,null);}});
