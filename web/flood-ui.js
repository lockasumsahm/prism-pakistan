export function floodEvidenceHTML(snapshot, {esc, fmt, time, provenance}) {
  const envelope = snapshot?.flood;
  const data = envelope?.ok ? envelope.data : null;
  const days = data?.days ?? [];
  const allZero = days.length > 0 && days.every(day => day.discharge === 0);
  const today = data?.model_day ?? days.find(day => day.period === 'forecast')?.time;
  const previous = days.find(day => Date.parse(day.time+'T00:00:00Z') === Date.parse(today+'T00:00:00Z') - 86400000);
  const change = data?.change_24h_pct;
  const trend = !data ? 'Model unavailable' : allZero ? 'No modelled flow in this cell' : data.trend;
  const comparison = !data ? 'A discharge comparison cannot be calculated while the source is offline.'
    : allZero ? 'The provider returned zero for every day. This cell does not provide a usable signal for assessing the intended river.'
    : typeof change === 'number' ? `${fmt(change)}% versus the previous UTC model day`
    : previous?.discharge === 0 ? 'Previous model day was zero; a percentage change cannot be calculated.'
    : 'Previous model day is missing; a percentage change cannot be calculated.';
  const grid = data?.model_grid;
  const point = data?.requested_point ?? snapshot?.location;
  const coordinates = value => value && Number.isFinite(value.lat) && Number.isFinite(value.lon) ? `${fmt(value.lat,4)}, ${fmt(value.lon,4)}` : 'Not supplied';
  const max = Math.max(1,...days.map(day => day.discharge));
  const x = index => 30+index*650/Math.max(1,days.length-1);
  const y = value => 120-value/max*90;
  const chart = days.length ? `<div class="chart-panel"><div class="forecast-tag">Daily discharge · previous model days and forecast · m³/s</div><svg class="chart" viewBox="0 0 720 150" role="img" aria-label="Daily model discharge; not live river gauge observations"><line x1="30" y1="120" x2="690" y2="120" stroke="#dfe7ec"/><polyline points="${days.map((day,index)=>x(index)+','+y(day.discharge)).join(' ')}" fill="none" stroke="#2874a6" stroke-width="2.5"/>${days.map((day,index)=>`<circle cx="${x(index)}" cy="${y(day.discharge)}" r="3" fill="${day.period==='hindcast'?'#81949e':'#2874a6'}"><title>${esc(day.time)} UTC · ${esc(day.period)}: ${fmt(day.discharge)} m³/s</title></circle>`).join('')}</svg><div class="chart-caption"><span>${esc(days[0].time)} UTC</span><span>${esc(days.at(-1).time)} UTC</span></div></div>` : '';
  const raw = days.length ? `<details class="flood-raw"><summary>Inspect all ${days.length} provider model values</summary><div class="table-scroll"><table><thead><tr><th>UTC model day</th><th>Period</th><th>Discharge · m³/s</th></tr></thead><tbody>${days.map(day=>`<tr><td>${esc(day.time)}</td><td>${esc(day.period)}</td><td>${fmt(day.discharge,3)}</td></tr>`).join('')}</tbody></table></div></details>` : '';
  return `<section class="panel flood-outlook" id="flood-outlook"><div class="panel-header"><div class="panel-title">Flood evidence check</div><span class="badge neutral">DAILY MODEL · NOT A LIVE GAUGE</span></div>
    <div class="flood-feed-note"><strong>Latest available GloFAS model</strong><p>PRISM retrieves the provider feed automatically. GloFAS updates daily; refreshing this page does not create new hourly river readings.</p></div>
    ${!data && envelope ? `<div class="error-box">DATA SOURCE OFFLINE · ${esc(envelope.error?.code)} · ${esc(envelope.error?.message)}</div>` : ''}
    <div class="signal-grid"><div><span class="eyebrow">MODEL DISCHARGE SIGNAL</span><h3>${esc(trend)}</h3><p>${esc(comparison)}</p></div><div><span class="eyebrow">${allZero?'RAW ':''}SEVEN-DAY MODEL PEAK</span><h3>${data?fmt(data.peak_7d_cms):'—'} <small>m³/s</small></h3><p>${allZero?'Provider-reported zero · actual river flow remains unverified':'Daily grid-cell forecast · not a gauge measurement'}</p></div></div>
    <dl class="flood-feed-meta"><div><dt>Current model day</dt><dd>${today?esc(today)+' UTC':'Unavailable'}</dd></div><div><dt>Feed retrieved</dt><dd>${envelope?esc(time(envelope.source.retrieved_at)):'Awaiting retrieval'}${envelope?.cached?' · cached':''}</dd></div><div><dt>Provider issue time</dt><dd>${envelope?.source.updated_at?esc(time(envelope.source.updated_at)):'Not supplied by this endpoint'}</dd></div><div><dt>Requested point / model grid</dt><dd>${esc(coordinates(point))} / ${esc(coordinates(grid))}</dd></div></dl>
    ${chart}${raw}${envelope?provenance(envelope):''}
    <div class="query-description">${esc(snapshot?.risk?.reason??'Choose a location to inspect evidence.')} The roughly 5 km model grid can miss the intended river. PRISM does not move the sample to a different river or substitute a larger number. Live barrage/gauge telemetry is not connected. Zero model output and a rising trend do not establish local safety or flooding.</div>
    <div class="outlook-actions"><a class="button" href="https://ndma.gov.pk" target="_blank" rel="noopener">NDMA official warnings ↗</a><a class="button" href="https://pmd.gov.pk" target="_blank" rel="noopener">Pakistan Meteorological Department ↗</a></div></section>`;
}
