import test from 'node:test';
import assert from 'node:assert/strict';
import {PowerConnector} from '../lib/climate/connectors/feeds.ts';
// Test-only upstream fixture, never bundled in the application.
let missing=false;
globalThis.fetch=async(input)=>{const u=new URL(String(input));const date=u.searchParams.get('start')!;return Response.json({header:{fill_value:-999},parameters:{T2M:{units:'C'},RH2M:{units:'%'},ALLSKY_SFC_SW_DWN:{units:'kW-hr/m^2/day'}},properties:{parameter:{T2M:{[date]:missing?-999:0},RH2M:{[date]:-999},ALLSKY_SFC_SW_DWN:{[date]:-999}}}});};
test('archive keeps real zero, missing cells and upstream units separate',async()=>{const e=await new PowerConnector().execute({lat:24.86,lon:67});assert.equal(e.ok,true);if(e.ok){assert.equal(e.data.days[0].temperature,0);assert.equal(e.data.days[0].humidity,null);assert.equal(e.source.updated_at,null);assert.equal(e.data.units.T2M,'C');}});
test('all missing archive values produce offline rather than fabricated history',async()=>{missing=true;const e=await new PowerConnector().execute({lat:24.86,lon:67});assert.equal(e.ok,false);assert.equal(e.error?.code,'NO_COVERAGE');assert.equal(e.data,null);});
