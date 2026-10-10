# PRISM operations runbook

## Service identity

Existing repository: https://github.com/lockasumsahm/prism-pakistan
Existing production: https://prism-pakistan.vercel.app
Runtime: dependency-free Node 24 Vercel adapter of the same authored Worker.

## Release a change

1. Fetch the current main branch and preserve concurrent edits. Build with `npm run check`; this validates the generated Worker and every browser JavaScript module.
2. Run `npm test`. Fixtures are confined to test processes. Record test count and evidence, rather than checking production boxes by assertion.
3. Prepare the existing Vercel project with `node scripts/build-vercel.mjs`. The adapter must include the same authored source, fingerprinted modules and route rewrites. Never deploy an older upload directory.
4. Commit and push to the existing GitHub repository. Confirm the Verify PRISM workflow passes. Deployment uses the existing Vercel project and production alias.
5. Confirm READY, then verify health, readiness, the changed API, its source envelope, browser rendering and export. Inspect original retrieval/valid timestamps. Update DEPLOYMENT.json with the actual deployment ID and source commit.

## Health and evidence checks

- `/api/public/v1/health`: application reachability and version. A reachable application can have offline providers.
- `/api/public/v1/readiness`: four core Karachi reference feeds. HTTP 503 means at least one core envelope is unavailable. HTTP 200 does not certify nationwide availability, hazard modelling or an SLO.
- `/api/public/v1/sources`: source envelopes and instance-local circuits. This probes real providers and can take longer, especially asynchronous archives.
- `/api/public/v1/weather-detail?location=karachi`: 168 future hourly slots, seven rolling 24-hour windows and variable coverage. Zero is valid; null means missing. Partial aggregates remain null.
- `/ops`: current request latency, source diagnostics and optional authenticated manual quarantine. Historical SLOs and shared circuit state are not configured.

## An upstream feed fails

Inspect the envelope's error code, reason, retrieval timestamp, source ID and trace ID. HTTP_503 is an upstream status; a public evidence API can return HTTP 200 with `ok:false,data:null`. Do not turn an offline payload into zero. Do not relabel last_success or daily archives as current.

Five consecutive failures open a per-instance circuit for 60 seconds, followed by one HALF-OPEN probe. Valid recovery clears the failure counter. JOB_PENDING is archive progress rather than an upstream failure. Different Vercel instances can have different circuit/cache state.

An authorized operator may quarantine a connector using a server token of at least 32 characters and `/api/ops/quarantine`. The UI clears the entered token after submission. The action affects the handling instance only; it is not a global kill switch. Never paste credentials into issues, public reports or repository files.

## Daily briefing publication

The existing GitHub workflow runs at 01:17 UTC and supports manual dispatch. GitHub scheduling may be delayed. Inspect the workflow outcome and `data/daily-briefings.json.generated_at`; the archive endpoint retains original evidence timestamps and exposes age. A failed collection must not publish fabricated or stale-live replacement data. The published selection covers ten specific national/provincial/family/agricultural briefs, not every district.

## Browser reports

Start at District forecast, select/search a registered place, and verify its name and coordinates before export. Chart switches show the first 48 hours; CSV and JSON include all 168 hourly slots. CSV timestamps are UTC; interface/print times are PKT. JSON includes the location and complete provenance envelope. The printed table contains the first 48 hours; the export contains the full seven days.

The widget's explicitly labelled historical fallback is browser-local. Clear storage to remove saved places and cached briefs. Device coordinates and satellite/map tiles are not written into that evidence cache.

## Rollback and launch gates

If the new release breaks a previously working flow, restore the last verified deployment on the same Vercel project and production alias; record the restored source commit and run targeted smoke checks. A GitHub revert preserves history and must not erase concurrent user edits.

Before a commercial operational launch: provision suitable provider usage plans, verify FIRMS/OpenAQ/ReliefWeb credentials and coverage, commission locally calibrated hydrology and independent impact validation, configure durable monitoring/rate enforcement and required identity/notification services, and test real-device PWA/offline behavior. A polished interface and passing software tests cannot certify an emergency decision system. PRISM remains independent of PMD/NDMA.
