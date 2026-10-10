export function evidenceFacts(s,imagery,satellite){
 if(!s)return [];
 const facts=[`Flood risk at ${s.location.name} is unassessed. No calibrated local warning threshold or verified inundation calculation is available.`];
 const w=s.weather,f=s.flood;
 if(w.ok){facts.push(`Open-Meteo forecasts ${w.data.rain_next_24h_mm.toFixed(1)} mm precipitation in the next 24 hours and ${w.data.rain_next_7d_mm.toFixed(1)} mm over seven days at this coordinate. These are model forecasts, not measured rainfall.`);facts.push(`Peak forecast hourly precipitation over 48 hours is ${w.data.peak_hourly_next_48h_mm.toFixed(1)} mm. Forecast valid ${w.source.updated_at}; retrieved ${w.source.retrieved_at}.`);}else facts.push(`Weather unavailable: ${w.error.code}. ${w.error.message}`);
 if(f.ok){facts.push(`GloFAS model discharge is ${f.data.discharge_cms.toFixed(1)} m³/s, with a seven-day model peak of ${f.data.peak_7d_cms.toFixed(1)} m³/s. This represents the largest river within 5 km, not a gauging station.`);facts.push(`Model discharge trend is ${f.data.trend}. Historical return-period thresholds are unavailable; rising discharge alone does not establish flooding.`);}else facts.push(`River model unavailable: ${f.error.code}. ${f.error.message}`);
 if(imagery?.ok){facts.push(`NASA MODIS flood imagery is published through ${imagery.data.layers.find(l=>l.key==='flood')?.latest_date??'unknown date'}. The three-day composite can contain clouds and artifacts; no pixel-based flood extent has been calculated for this coordinate.`);}else facts.push(`NASA imagery metadata unavailable: ${imagery?.error?.code??'not retrieved'}. Satellite coverage is unknown.`);
 if(satellite?.ok)facts.push(`Nearest displayed NASA MODIS pixel at this coordinate is classified ${satellite.data.classification} in the ${satellite.data.date} three-day composite. This is visualization sampling, not a verified flood boundary or ground confirmation. Transparent pixels do not establish no flooding.`);
 facts.push('Check PMD and NDMA official warnings. Satellite or model data cannot establish road safety, water depth or evacuation orders.');return facts;
}
export function validateSelection(content,count){let parsed;try{parsed=JSON.parse(content);}catch{throw new Error('AI did not return a valid evidence selection. Original facts remain available.');}const selected=parsed.indices;if(!Array.isArray(selected)||selected.length<1||selected.length>4||selected.some(i=>!Number.isInteger(i)||i<0||i>=count)||new Set(selected).size!==selected.length)throw new Error('AI selected invalid evidence. No generated claims are displayed.');return selected;}
export class FreeSummarizer {
 async load(progress){if(this.engine)return;if(!navigator.gpu)throw new Error('This browser does not support WebGPU. Use a WebGPU-enabled browser for local AI. The evidence brief remains available.');const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('No compatible GPU is available. The evidence brief remains available.');
  const webllm=await import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm');
  this.engine=await webllm.CreateMLCEngine('Qwen2.5-0.5B-Instruct-q4f32_1-MLC',{initProgressCallback:p=>progress(p.text)});
 }
 async summarize(facts,question,progress){await this.load(progress);progress('Selecting the evidence most relevant to your question…');
  const output=await this.engine.chat.completions.create({messages:[{role:'system',content:'You select evidence from a list. Return only JSON with an indices array of 1 to 4 distinct zero-based indices, ordered by relevance. Never write or infer facts, numbers, risk levels or instructions. Always include index 0, which describes assessment limitations.'},{role:'user',content:JSON.stringify({question,facts:facts.map((text,index)=>({index,text}))})}],temperature:0,max_tokens:96,response_format:{type:'json_object'}});
  const indices=validateSelection(output.choices[0].message.content,facts.length);if(!indices.includes(0))indices.unshift(0);return indices.map(i=>facts[i]);
 }
}
