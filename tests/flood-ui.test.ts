import test from 'node:test';
import assert from 'node:assert/strict';
import {floodEvidenceHTML} from '../web/flood-ui.js';
const helpers={esc:(v:any)=>String(v??'').replace(/</g,'&lt;').replace(/>/g,'&gt;'),fmt:(v:any)=>String(v),time:(v:any)=>v??'Not supplied',provenance:()=>'<details>Source ledger</details>'};
const snapshot=(values:number[])=>({flood:{ok:true,cached:false,source:{retrieved_at:'2026-10-10T13:00:00Z',updated_at:null},data:{discharge_cms:values[1],peak_7d_cms:Math.max(...values.slice(1)),model_day:'2026-10-10',model_grid:{lat:24.85,lon:67},requested_point:{lat:24.86,lon:67.01},change_24h_pct:values[0]>0?(values[1]-values[0])/values[0]*100:null,trend:'steady',days:values.map((discharge,i)=>({time:`2026-10-${String(9+i).padStart(2,'0')}`,period:i===0?'hindcast':'forecast',discharge}))}},risk:{reason:'Local hazard thresholds unavailable.'}});
test('all-zero provider series is retained but never presented as a steady river',()=>{
 const html=floodEvidenceHTML(snapshot([0,0,0]),helpers);
 assert.match(html,/No modelled flow in this cell/);assert.doesNotMatch(html,/STEADY|>steady</);
 assert.match(html,/RAW SEVEN-DAY MODEL PEAK/);assert.match(html,/Provider-reported zero/);
 assert.match(html,/Not supplied by this endpoint/);assert.match(html,/2026-10-10T13:00:00Z/);
 assert.match(html,/Inspect all 3 provider model values/);assert.match(html,/<td>0<\/td>/);
});
test('nonzero forecast compares real model days and labels daily cadence',()=>{
 const html=floodEvidenceHTML(snapshot([100,110,130]),helpers);
 assert.match(html,/10% versus the previous UTC model day/);assert.match(html,/130 <small>m³\/s/);
 assert.match(html,/NOT A LIVE GAUGE/);assert.match(html,/24.86, 67.01 \/ 24.85, 67/);
 assert.doesNotMatch(html,/No modelled flow in this cell/);
});
test('source outage displays the actual failure and no numeric substitution',()=>{
 const html=floodEvidenceHTML({flood:{ok:false,data:null,source:{retrieved_at:'2026-10-10T13:00:00Z'},error:{code:'HTTP_ERROR',message:'HTTP 503 · unavailable'}}},helpers);
 assert.match(html,/DATA SOURCE OFFLINE · HTTP_ERROR · HTTP 503/);
 assert.match(html,/— <small>m³\/s/);assert.doesNotMatch(html,/Inspect all|<td>0/);
});
