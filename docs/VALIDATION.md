# PRISM validation history — 2026-10-10

Latest verified release: **0.5.0**, 100 tests, READY production deployment. Historical release evidence follows; current details are in the final section and DEPLOYMENT.json.

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

Post-deployment verification: source commit `8f39b49d944126f89c95be94107d51b5c50baa3f`, READY deployment `dpl_43ikyf3rBxgEHpHS7h14gydmUosU`. All 21 primary pages and five public discovery files returned HTTP 200. Fresh Karachi South, Sukkur, Gilgit and Quetta snapshots plus Lahore detailed weather returned HTTP 200. Browser clock showed 10 October 2026 in PKT, anchored to server time. The ledger retained CHIRPS’s actual 31 August archive date. Verify PRISM run 38024420240 and daily publication run 38024420245 succeeded. Evidence summaries and screenshot are in REAL_DATE_AUDIT.json and screenshots/prism-realdate-release.jpg. Fourteen of nineteen source interfaces returned data; five remained explicitly unavailable. Readiness applies only to four core Karachi point connectors.

## Public community connectors (0.5.0)
100 automated tests pass, including WorldPop real-zero/year/geometry contracts, failed population jobs, OSM node-to-way geometry joins, incomplete geometry rejection, bounded coordinates, public FIRMS region filtering and community Officer/API flows. Live provider calls returned a WorldPop 2025 query-square estimate, seven mapped Karachi facilities and 143 VIIRS thermal detections; the latter retained their actual older observation date. The official OSM v0.6 map API was used after public Overpass services returned 406/500 or timed out. ReliefWeb was migrated from retired v1 to v2, but its approved application identity and OpenAQ’s key are absent. Calibrated hazard classification, confirmed facility opening status and route safety are not established by these connectors. Post-deployment verification follows in DEPLOYMENT.json.

Production verification returned data from 17/19 registered source interfaces. Only OpenAQ and ReliefWeb remained CONFIGURATION_REQUIRED. Karachi and Lahore community endpoints returned both envelopes; the live Officer returned seven sections and consulted district_snapshot, population_context and nearby_facilities (six source envelopes). Sukkur zero model days returned STEADY with null percentage change. All 21 primary pages returned HTTP 200 with route metadata on the final deployment. Verify PRISM run 38035286869 passed for final code commit 9e46dd9d025fef758a9095e7841fd69e1b9d8fac. Final READY deployment: dpl_Hdg4jwiHccJh6Yh8r69Sfkc5KSbA. Full evidence summaries are in CONNECTOR_AUDIT.json. Source availability does not establish freshness, independent consensus or flood safety; the actual FIRMS observation date remained older than retrieval.

## Official advisories and status clarity (0.5.1)

104 tests pass, including official NDMA index parsing, date-only timestamps, HTTP failure preservation, changed/empty HTML rejection, malicious URL rejection and real Officer tool routing. The new `/api/public/v1/advisories` contract is a ConnectorEnvelope rather than the previous placeholder. NDMA first-page titles and official PDFs are connected without credentials; PRISM does not infer PDF validity, affected districts, school closure or evacuation decisions.

Final source commit 5933bb8c499387ba861f6709ed3731a72bf48d3e, READY deployment dpl_8sAnXJ4bhiPBSiMzJg7ySsYhhxcU. Production returned 18/20 source interfaces; only OpenAQ and ReliefWeb remained CONFIGURATION_REQUIRED. The Officer consulted district_snapshot and official_advisories and returned seven sections. All 21 primary pages returned HTTP 200 with title, canonical and OpenGraph tags. The browser followed Sukkur's official-advisory link, verified 4/4 core feeds with a separate flood-risk limitation, and displayed nine NDMA source documents, latest publication 9 October 2026. Source timestamps and scope are in NDMA_AUDIT.json; final browser evidence is screenshots/prism-ndma-advisories.jpg. Console errors inspected were extension metadata messages. This is targeted operational evidence, not certification of all hazards or all devices.

## Browser timeout compatibility

Location registry, Officer streaming, and server clock synchronization now use AbortController deadlines instead of AbortSignal.timeout. Cancellation covers response bodies and timers are released on success or failure. The helper is fingerprinted and included in the offline shell. 111 automated tests pass, including a location JSON regression with AbortSignal.timeout unavailable and stalled-operation cancellation. Browser compatibility does not change upstream feed availability or missing-data semantics.

## Daily discharge and zero-cell interpretation

The flood feed explicitly requests GMT daily boundaries and validates consecutive daily values. API data now exposes requested and provider grid coordinates, current UTC model day, daily cadence and an all-zero flag. All-zero model series are labelled no modelled flow rather than steady; original zero values remain visible. The panel exposes retrieval time separately from the unknown provider issue time, daily model cadence, raw values and the absence of connected live gauges. 114 tests pass, including all-zero, positive-change and upstream-outage UI cases. This does not establish calibrated flood risk or add a river-gauge connection.

## Source timing and NOAA GOES integration

The header shows server-synchronized UTC and PKT. Sources explain observation times, forecast valid times, catalog generation, publication dates, static release years and retrieval times separately. RainViewer public future nowcast is discontinued; WorldPop query-square population is not flood exposure. PMD river pages currently reject this server with HTTP 403; official links are provided, not substituted gauge data. OpenAQ and ReliefWeb require production credentials.

GET /api/public/v1/solar-weather provides NOAA SWPC GOES primary one-minute solar X-ray observations, preserving bands, satellite identity, corrected/observed flux in W/m² and observation times. Electron-contaminated readings are excluded. Solar questions in the Officer consult NOAA Kp and GOES evidence. ReliefWeb now sends the approved appname in the URL as required. 119 automated tests pass for the release.
