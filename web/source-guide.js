// Provider semantics are documentation, never replacement measurements.
export const sourceGuides={
 'open-meteo-weather':['Hourly forecast valid time','Numerical weather model; rainfall and soil moisture are model output, not local gauge measurements.'],
 'open-meteo-detail':['Forecast valid time','Hourly point forecasts. Provider model selection and publication schedules apply.'],
 'open-meteo-flood':['Provider issue time not supplied','Daily GloFAS grid-cell forecast, not a live river gauge. The selected cell may miss the intended river.'],
 'open-meteo-air':['Model valid time','CAMS modelled air quality; physical ground measurements are listed separately under OpenAQ.'],
 elevation:['Release time not supplied','Static Copernicus terrain elevation. A retrieval today does not make the terrain dataset new.'],
 usgs:['Catalog generation time','Each earthquake has its own event time. The monitoring rectangle includes neighbouring countries.'],
 rainviewer:['Latest radar frame time','Past two hours at ten-minute intervals. Public future nowcast was discontinued January 2026; local radar coverage varies.'],
 firms:['Latest retained detection time','VIIRS satellite thermal detections carry individual acquisition times. Not confirmed wildfire perimeters.'],
 chirps:['Archive data-window date','Delayed satellite/gauge rainfall archive. Publication lag applies; not an hourly live sensor.'],
 gdacs:['Latest retained Pakistan report update','Provider event dates and report updates are separate. Recent reports and earlier archives do not establish local safety.'],
 reliefweb:['Latest report creation time','Human-curated reports. Report publication does not mean the described incident is still active. Approved appname required.'],
 openaq:['Latest retained ground measurement','Station readings carry their own UTC timestamps. Availability and age differ by station; no guaranteed coverage of every city.'],
 noaa:['Estimated Kp record time','Estimated three-hour planetary Kp refreshed every minute. Global geomagnetic context, not local flood danger.'],
 'noaa-goes':['Satellite observation time','GOES one-minute solar X-ray averages. Flagged contaminated records excluded; no flare impact inferred.'],
 worldpop:['Dataset release year','Estimated population in the query square. Flood exposure requires a verified inundation boundary and spatial intersection.'],
 osm:['Map publication time not supplied','Mapped facilities in a query square. No confirmation of opening status, safe routes or flood impacts.'],
 'nasa-gibs':['Imagery catalog issue time not supplied','Inspect each selected layer’s publication date separately. Daily imagery and three-day flood composites can hide floodwater under clouds or missing pixels.'],
 power:['Archive publication time not supplied','Daily NASA POWER archive; each data day is separate from retrieval time.'],
 'daily-archive':['Derived briefing generation time','PRISM scheduled briefings inherit original provider timestamps and limitations. This archive is not an independent upstream source.'],
 ndma:['Publication date only','Official NDMA document titles and links. Open the PDF for affected areas and validity; no time of day invented.'],
 eonet:['Catalog update time not supplied','Curated event geometries and upstream references; coverage is not complete hazard detection.']
};
export function sourceGuideHTML(source,esc){const guide=sourceGuides[source.id]??['Provider timestamp','Inspect provider methodology for time and coverage semantics.'];return `<div class="source-time-guide"><strong>${esc(guide[0])}</strong><p>${esc(guide[1])}</p></div>`;}
export function sourcesIntroduction(){return `<section class="source-integrity-intro"><div><span class="eyebrow">THE DATA CONTRACT</span><h2>Real sources. Exact meanings.</h2><p>Measurements, forecasts, archives and reports have different clocks. Each source below shows what its timestamp means, its original endpoint, retrieval time, latency and current availability. Missing timestamps remain missing.</p></div><div class="source-integrity-rules"><p><strong>Observed:</strong> the sensor or satellite measurement time.</p><p><strong>Forecast:</strong> the model valid time, which can be in the future.</p><p><strong>Retrieved:</strong> when PRISM received the response; not a new observation.</p><p><strong>Static / archive:</strong> a dataset release or data window; never labelled live.</p></div></section><div class="source-official-links"><strong>Pakistan official river reports</strong><p>PMD / FFD publishes river flows and hydrological reports. Automatic ingestion is not connected: the source returned HTTP 403 to the verification client. Consult the official page directly; no gauge values are substituted.</p><a href="https://ffd.pmd.gov.pk/river-state" target="_blank" rel="noopener">PMD river flows ↗</a> · <a href="https://ffd.pmd.gov.pk/staff/discharge-report-carousel" target="_blank" rel="noopener">Official discharge report ↗</a></div>`;}
