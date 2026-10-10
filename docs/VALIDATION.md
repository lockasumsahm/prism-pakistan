# PRISM validation history — 2026-10-10

Latest verified release: **0.4**, 84 tests, READY production deployment. Historical release evidence follows; current details are in the final section and DEPLOYMENT.json.

## Current result

59 combined tests pass after merging upstream commit `3350186`. Node 24 Worker generation, browser-module syntax and Vercel adapter checks pass. Tests cover the existing NASA imagery decoder/AI selection constraints and the new history isolation, precipitation time boundaries, half-open recovery, quarantine authorization, coordinate assessment, metadata and asset fingerprints.

The existing production project `prj_1SpCnkoqrkq0D0xpKcz8mLVO3DKm` was updated in place. Deployment `dpl_7P4uxamcftR854pxjLsg2fqsr3RJ` is READY at https://prism-pakistan.vercel.app.

## Live evidence

- HTTP checks on the release returned 200 for named pages, crawler files, manifest, core APIs and metadata. Unknown dynamic paths are separately tested as 404.
- The browser loaded real weather forecasts for all 12 reference locations and real Karachi weather, discharge, air and elevation.
- The merged atlas loaded Leaflet, NASA publication dates and a NASA MODIS visualization-pixel result. River hindcast/forecast trends and a fourteen-day discharge chart rendered.
- A Lahore school-safety question returned seven evidence sections with real connector values, source timestamps and explicit unassessed road/school impacts.
- Saving Karachi in the browser watchlist persisted across navigation.
- The original CARTO basemap displayed a token-required watermark. Standard OSM viewport tiles with attribution and normal HTTP caching replaced it.
- Browser asset fingerprints now prevent older cached JS from running after a deployment. The service worker precaches the matching local module versions.

## Verification limits

Local WebGPU model download/generation, actual flight-mode behavior, PWA installation and a representative mobile-device matrix remain unverified. Cache isolation, retention, privacy and failure behavior have automated coverage; that is not the same as a real-device test. Browser metadata errors emitted by the automation extension are not evidence of an application failure.

NASA visualization classes are not a validated inundation model or a ground confirmation. Model discharge is not a river gauge. No calibrated hazard scores, 160-district coverage or unsupported emergency directives were added.

Source ledger probes returned real data for weather, discharge, modelled air, elevation, USGS, radar metadata, NOAA, EONET and NASA POWER on the earlier release during this session. FIRMS/OpenAQ/ReliefWeb remained CONFIGURATION_REQUIRED; CHIRPS/WorldPop/GDACS/OSM infrastructure joins remained INTEGRATION_UNAVAILABLE. The merged edition retains those semantics and adds NASA GIBS.

See `PRODUCTION_VERIFICATION.md` for the detailed checklist verdict. **This is an improved operational pilot, not a full production certification.**

## District / archive completion pass

73 local tests pass. Added tests cover the 160-record sourced registry, 162 preserved named routes, GDACS country attribution/geometry/report validation, CHIRPS zero/missing/duplicate/date/epoch/publication-lag contracts, real job polling, district-name overlap resolution and Officer streaming. Initial daily archive collection successfully retrieved ten live source-backed briefings.

Live upstream investigation used official ClimateSERV submit/progress/result endpoints and GDACS GeoJSON. ClimateSERV returned a successful job with older rainfall granules and missing newer days; PRISM therefore selects the archive end from returned usable days and shows archive lag. This is not a claim that current rainfall observations are available. The local proxy exceeded short connector timeouts, so production HTTP validation is separate from parser verification.

Hosted verification: GitHub CI run `38021299636` succeeded; daily publication run `38021299646` succeeded and published a refreshed archive commit. Production GDACS, CHIRPS and scheduled archive all returned successful envelopes. CHIRPS contained all 30 archive days, with the latest returned data day in August 2026 and lag disclosed. Browser testing verified Sujawal search/save and a streaming seven-section South Karachi response with a four-source ledger.

Final release: 73 tests pass, including all 206 published sitemap routes checked locally for HTTP 200 and canonical/OpenGraph metadata, plus packed-palette and transparent grayscale PNG decoding. Production deployment `dpl_Fy1hjhAoCjvSVwpLpcFEeHS8pEh8` is READY. Targeted production health, Sujawal NASA pixel and archive checks passed. The broad external route sweep was interrupted by network approval cancellation; it is not reported as a completed live 206-route sweep. The Sujawal live pixel subsequently returned transparent/no-visible classification; the initial transient unsupported format was not captured, so the PNG extension is covered by explicit format tests rather than an asserted root cause.

## Detailed forecast release 0.4 — local/upstream baseline

84 automated checks pass, including scoped readiness, the detailed forecast API/MCP/Officer flow, null/zero/incomplete aggregates, CSV provenance and formula-injection protection, disconnected line segments, 208 local sitemap routes with metadata, and the OpenAPI contract. The build syntax-checks every emitted browser module as well as the Worker. A fresh official Open-Meteo request returned HTTP 200 and parsed into 168 future slots, all seven variables usable, plus seven complete rolling windows.

District detail selection now navigates to the chosen district. Changing an overview/map point updates the consulted source ledger alongside measurements. NDJSON section events render progressively. Live deployed browser/export evidence is recorded separately after release; this baseline is not a real-device/offline or commercial certification.

## Release 0.4 live evidence

Production deployment `dpl_GuBeryJF94QCbcgotKNp6rUVuAbv` is READY on the existing alias. Source commit `1076a6600d20a91176c468ef827714bb171bb8b0`; GitHub Verify PRISM run `38023693352` passed. Targeted live health (version 0.4), readiness (four core feeds available), detailed weather (168 hours/seven windows), forecast metadata and OpenAPI checks returned HTTP 200. These are targeted live checks; the 208-route sweep is local.

The browser searched Sukkur, rendered real detailed fields, switched to its 48-hour wind curve, and downloaded CSV plus evidence JSON. Both files contain 168 hourly rows, Sukkur coordinates and the same trace/source provenance. The screenshot is `screenshots/prism-forecast-release.jpg`. Browser console errors inspected were extension metadata messages, not application errors. Print styling and responsive breakpoints are implemented; physical-device, print-output, local WebGPU and flight-mode QA remain unverified.

Further live browser checks verified forecast → river/satellite navigation, switching a district detail page from Sukkur to Lahore, and a Lahore wind/humidity question returning all seven Officer sections with actual district_snapshot/weather_detail consultations and five evidence envelopes. Availability is explicitly distinct from independent hazard confidence.

## Real-date audit and correction (0.4.1)

Live audit on 2026-10-10 found fourteen successful registered evidence interfaces and five explicit configuration/integration gaps. Core readiness succeeded. Weather/CAMS valid times, USGS generation, past radar, NOAA Kp and GDACS report timestamps matched current-day provider data. CHIRPS was genuine August 31 archive data; scheduled briefings were generated today. Historical archives are not replaced with current-day invented dates.

Corrections anchor the displayed date/clock to server UTC and monotonic elapsed time, expire forecast caches at UTC hour boundaries, distinguish stale/undated/forecast/archive/static statuses, and reject future or old generation/retrieval timestamps in daily collection. Regression coverage includes PKT midnight and UTC midnight; all 91 tests pass after correction.
