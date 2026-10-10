# Release 0.2 validation — 2026-10-10

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

70 local tests pass. Added tests cover the 160-record sourced registry, 162 preserved named routes, GDACS country attribution/geometry/report validation, CHIRPS zero/missing/duplicate/date/epoch/publication-lag contracts, real job polling, district-name overlap resolution and Officer streaming. Initial daily archive collection successfully retrieved ten live source-backed briefings.

Live upstream investigation used official ClimateSERV submit/progress/result endpoints and GDACS GeoJSON. ClimateSERV returned a successful job with older rainfall granules and missing newer days; PRISM therefore selects the archive end from returned usable days and shows archive lag. This is not a claim that current rainfall observations are available. The local proxy exceeded short connector timeouts, so production HTTP validation is separate from parser verification.
