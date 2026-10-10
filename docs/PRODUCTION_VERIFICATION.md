# PRISM production verification — 2026-10-10

**Verdict: improved operational pilot; NOT certified production-ready.**

The newer upstream commit `3350186` was merged and preserved: interactive Leaflet atlas, NASA MODIS/VIIRS layers, visualization-pixel checks, river hindcast/forecast trends and optional free browser-local AI fact selection. These coexist with the seven-section server briefing and the evidence continuity improvements. Local AI download/generation remains unverified.

The supplied statement that sections 1–5 and 7 all pass is not supported by this repository. This update preserves the existing application, strengthens working features, and records the remaining requirements without claiming unavailable science or integrations.

## Results against the requested checklist

| Section | Verified implementation | Remaining requirement |
| --- | --- | --- |
| 1. Scientific integrity | No random hazard values or runtime telemetry fixtures. Null failure envelopes, HTTP diagnostic codes, source identity, provider endpoint paths, timestamps, latency, five-failure breaker, 60-second cooldown and visible HALF-OPEN state. Automated failure/recovery tests pass. | Circuit/quarantine/cache state is per instance, not durable or shared. Provider endpoint paths are redacted templates, not credential-bearing request URLs. Browser display does not establish upstream scientific accuracy. |
| 2. Weather | Modelled past-24-hour precipitation when 24 samples exist; next 24h and seven-day precipitation; 0–7 cm soil moisture. Correct preceding-hour accumulation boundaries; duplicate/nonhourly timestamps rejected. | Past weather model values are not measured rainfall. Provider availability and licensing still apply. |
| 2. GloFAS | Real model discharge, seven-day hindcast/forecast series, current-day indexing and model trend. | Gauge observations and validated 2/5/20-year return-period thresholds unavailable. |
| 2. Elevation | Real Open-Meteo/Copernicus point elevation connector. | Point elevation cannot establish slope or inundation. |
| 2. RainViewer | Past-frame metadata connector; future nowcast unavailable is disclosed. | No Pakistan coverage guarantee or ten-frame future nowcast mosaic. Requiring discontinued upstream output is not a passing criterion. |
| 2. CHIRPS | Explicit unavailable integration envelope. | ClimateSERV job contract, publication-lag polling and geographic extraction not implemented. |
| 2. FIRMS / OpenAQ / ReliefWeb | Credential-dependent ingestion exists; secrets remain server-side. | Production credentials and station/source coverage require live validation. ReliefWeb appname approval required. |
| 2. USGS | M2.5+ seven-day catalog in a monitoring rectangle. | Rectangle includes neighbouring countries; no validated fault/district spatial joins. |
| 2. NOAA | Real planetary Kp parser, UTC time normalization; connector cache TTL 60 seconds. | This is request-driven refresh, not a scheduler guaranteeing a minute cadence. Kp is global geomagnetic context, not local flood evidence. |
| 3. Hazard profiles | Named contextual reference profiles and null/unassessed risk. Comparable-reading consensus algorithm is separately tested. | No calibrated four-profile hazard formulas, GLOF melt anomaly, slope model, district polygons or live rainfall consensus from three independent products. |
| 4. Officer | Seven source-backed sections; named-location and audience routing; ambiguity refusal; inspectable source ledger and device-coordinate evidence request. | Deterministic seven-section mode plus optional WebLLM/Qwen fact selection on the device; no hosted conversational tool-calling agent. Device coordinates do not establish district membership or basin attribution. |
| 5. Briefings | Four distinct request-driven tracks, point/province scope, source ledger, explicit missing-data and uncertainty footer. | No scheduled national production briefing generation or route/school closure authority. |
| 6. Watch / widget | Browser-local saved places; remembered selection; per-location/per-track historical storage; cached age label; last verified history is not overwritten by all-offline data. PWA shell and shortcuts for widget/watch/officer. | Coverage remains 12 reference locations rather than 160 verified districts. Cache logic is tested with storage fixtures; actual flight-mode/installability validation needs browser/device testing. No automated critical push service. |
| 7. Operations | Source health ledger, fresh-response median latency, HALF-OPEN reporting, authenticated manual instance quarantine. Unconfigured operator access returns 503; unauthorized requests return 401. | Distributed quarantine, durable metrics, historical SLO compliance and distributed rate enforcement unavailable. |
| 7. Routes / SEO | 20 named pages plus registered dynamic pages. `/api`, `robots.txt`, `llms.txt`, generated sitemap; server-rendered title, description, canonical and OpenGraph. Unknown dynamic paths return 404. | Live deployment/browser checks are recorded separately. Successful HTTP does not certify behavior or emergency accuracy. |
| 7. Documentation | Privacy, terms and methodology describe current behavior and limitations. | Jurisdiction-specific legal review and operational service agreement are not established by written pages. |

The live browser inspection identified a token-required CARTO basemap image. It was replaced by standard OpenStreetMap viewport tiles with attribution, an origin Referer and normal browser HTTP caching. Tiles are not prefetched or stored by the offline service worker. The offline widget caches briefings, not maps. A dedicated tile service remains necessary for guaranteed operational map availability at scale.

## Automated validation

59 tests pass in the dependency-free Node 24 build, including original regressions and new tests for geographic/track cache isolation, cache age and retention, storage failures, precipitation boundary correctness, duplicate timestamps, HALF-OPEN reporting, authenticated quarantine, device-coordinate validation, named-location routing and route metadata. Test transports contain explicit fixtures; those fixtures do not enter production artifacts.

## Operator configuration

`PRISM_OPERATOR_TOKEN` must be a server-side secret of at least 32 characters. The operations page accepts it for one request and clears the input; it does not persist it in browser storage. Manual controls affect only the current function/Worker instance. They are a diagnostic pilot control, not a global emergency operations control plane.

## Prerequisites for full certification

1. Obtain and version a verified administrative district registry with boundaries and district reference semantics.
2. Integrate official gauge/threshold data and independently validate hazard models against historical Pakistan flood events.
3. Complete publication-aware CHIRPS ingestion and comparable, independent rainfall consensus.
4. Configure and validate key-dependent upstream sources; use a supported radar product when future nowcasting is required.
5. Configure and evaluate a real LLM tool-calling officer while retaining deterministic evidence and missing-data safeguards.
6. Add durable operational state, distributed rate protection, scheduled briefings and tested push delivery.
7. Verify offline and PWA behavior on real devices, accessibility, load/failure behavior and external operational/legal review.
