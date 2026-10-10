# Validation record

## Passed locally

- Dependency-free Worker artifact generation.
- Syntax validation of the Worker and browser modules.
- 41 automated tests covering failure envelopes, cache expiry, historical-data separation, breaker recovery, half-open deduplication, non-transient HTTP behavior, key redaction, numeric validation, independent-family consensus, incompatible inputs, staleness, primary routes, point snapshots, briefing tracks, officer responses, request size limits, advisory missingness and MCP calls.
- Fixture telemetry is explicitly test-only. It is absent from the production build.

## Not verified

- Additional upstream integration testing beyond the live checks recorded below. The terminal itself still cannot resolve external domains.
- Browser UI end-to-end or visual QA: this environment denies binding a local preview port (`listen EPERM`). A direct Worker Request/Response harness verifies route/API behavior, not browser rendering.
- Cloudflare Sites deployment: source publication remains blocked by DNS. The Vercel fallback has deployed successfully.
- Git CLI networking remains unavailable; GitHub source upload and reads were verified through the connected integration.
- Optional SQL migration: no database is provisioned; migration is unapplied.
- Real keys, account sign-in, model tool calling, official warnings, schedules, push delivery or production rate protection.

The isolate-local limiter is a best-effort safeguard, not distributed enforcement. Cross-isolate caching and circuit state are not durable. The optional key-dependent feeds have implementation contracts but require live testing before operational use.

## Live Vercel verification

Production deployment `dpl_EVRTF3peMAt7HGomnWzJTpYTYFwy` is READY at https://prism-pakistan.vercel.app. The home, dashboard, briefing page, browser script, stylesheet, health endpoint, Karachi snapshot, source ledger and 12-reference-point overview returned HTTP 200. All 12 reference points returned valid weather forecast envelopes. Karachi weather, discharge, air quality and elevation came from real upstream responses.

The source ledger returned valid responses for weather, discharge, modelled air, elevation, USGS, RainViewer past metadata and NASA EONET. The NOAA one-minute response could not be decoded and correctly remained offline; no replacement Kp value was produced. Key-dependent and unimplemented feeds remained explicitly unavailable.

These HTTP checks do not establish browser rendering, installability, calibrated hazard prediction or production readiness.

Update: deployment dpl_Bm7xUXTXexQ3jCaKzHcKK936njBU is READY. NASA POWER and MCP discovery returned HTTP 200; POWER returned real archive humidity/temperature while missing solar remained null. GitHub access was subsequently corrected: all 32 source files uploaded to main; package, worker and CI workflow verified through GitHub.

## Flood atlas upgrade

Preview dpl_AS7vPJm46T6fzL4GuF8bbEyWNcSB returned real NASA metadata and a valid decoded point pixel at Sukkur. Earlier preview dpl_25mAc1YRtuKgyA38nH99SQReNGUw returned HTTP 200 for NASA flood PNG and VIIRS JPEG tiles, arbitrary-coordinate telemetry, map HTML and AI module. GloFAS returned a real fourteen-day hindcast/forecast series.

Local Chrome launch exited 134 without rendering; browser interactions, responsive visuals, WebGPU model download and generation remain unverified. AI selection validation, PNG decoding, coordinate bounds and current-day discharge indexing are covered by automated tests.
