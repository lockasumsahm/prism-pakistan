# PRISM

**Pakistan Real-Time Intelligence & Situational Monitoring**

An evidence-first climate intelligence pilot for Pakistan. A responsive institutional interface pairs model forecasts with explicit provenance, source health, and missing-data diagnostics. Every displayed measurement comes from a server-side connector. Runtime fixtures and fabricated hazard scores are prohibited.

**Live pilot:** https://prism-pakistan.vercel.app

## Existing-site completion update

Adds scoped historical widget caching, remembered places, PWA shortcuts, per-reading provenance inspection, missing-data briefing footers, GPS point evidence, named-question location routing, server-rendered route metadata, public API documentation and crawler files. Rainfall aggregation now respects Open-Meteo preceding-hour intervals. The operations ledger reports recovery state and supports authenticated, instance-local quarantine.

See [the production verification matrix](docs/PRODUCTION_VERIFICATION.md) for the supplied checklist and remaining certification requirements. 100 automated tests pass. The dated OCHA/WFP registry includes 160 district names, while national comparison samples 12 city references; hazard scores remain unassessed.

## Run

Requires Node.js 24 or newer. No dependency installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Optional local port: `PORT=3000 npm run dev`.

```sh
npm run build
npm test
npm run check
```

`npm test` assumes the Worker has been built. Fixtures live only in `tests/`; they never enter the deployed artifact. The build uses Node's experimental TypeScript transformation and emits one dependency-free Cloudflare Worker at `dist/server/index.js`, with embedded HTML, CSS, JavaScript, and PWA assets.

## Latest additions

- Detailed district forecast workspace (`/forecast`): 168 hourly slots, seven rolling 24-hour windows, temperature/apparent temperature, humidity, precipitation probability, wind/gusts, chart switches, accessible text table, CSV/JSON export and print report. Missing inputs invalidate only affected aggregates; this remains the same upstream weather model family.
- Principal OpenAPI 3.1 specification (`/openapi.json`), a scoped core-feed readiness probe (HTTP 503 when degraded), and the tenth MCP tool (`weather_detail`). Officer wind/humidity questions consult that real connector.

- 160 sourced OCHA/WFP district records with PCodes, provider centre coordinates and dated attribution; district search, centre forecasts and saved-place routes.
- GDACS country-attributed reports and a real USGS hazard-report page.
- ClimateSERV asynchronous CHIRPS jobs, bounded polling, retained instance job IDs and a publication-lag-aware thirty-day archive selected from actual returned granules. Incomplete totals remain null.
- Streaming NDJSON Officer status/evidence/seven sections, with inspected tool consultations for seismic, fire and GDACS questions; deterministic routing remains explicit.
- Daily public briefing archive: ten national/provincial/family/agricultural briefs, GitHub scheduled collection at approximately 06:17 Pakistan time. Schedules can be delayed; data age is always shown. See `.github/workflows/daily-briefings.yml`.
- Working developer/configuration pages and private device-workspace watchlist JSON import/export.

## What works

- Leaflet interactive map: pan/zoom, NASA MODIS three-day flood imagery, VIIRS true colour, date and opacity controls, RainViewer past-radar playback, and arbitrary Pakistan coordinate inspection. NASA GIBS does not require a key.
- Nearest NASA visualization pixel flood classification, with explicit transparent/no-data ambiguity. This is not scientific inundation analysis.
- Free browser-local AI summaries via WebLLM 0.2.85 / Qwen2.5 0.5B. Opt-in model download, WebGPU required; validated output selects only original evidence facts. Browser inference is not yet end-to-end verified.
- Five-minute automatic telemetry refresh with original provider timestamps; upstream cadence is hourly/daily, not second-by-second sensors.

- Responsive national overview, interactive flood atlas, location comparison dashboard, hourly forecast charts, and location detail pages.
- Weather, GloFAS discharge, CAMS air quality, elevation, USGS earthquakes, RainViewer past-radar metadata, NOAA planetary Kp and NASA EONET connectors.
- Implemented credential-dependent OpenAQ station/sensor joins, NASA FIRMS CSV detection ingestion, and ReliefWeb reports. These remain offline until configured and live-tested.
- Standard provenance envelopes, HTTP timeouts, bounded response size, transient retries, bounded per-location caching, request deduplication, five-failure circuits and a single cooldown probe.
- Comparable-unit/window consensus with explicit independence by upstream family; no automatic critical hazard assessment from a single source.
- Deterministic seven-section evidence officer and four briefing tracks. National/regional briefs aggregate **reference points only**. Family and agricultural briefs expose modelled air and soil context without unsupported impact claims.
- Downloadable JSON evidence briefings, browser-local saved places, a PWA widget, explicit historical briefing fallback, source ledger and operations diagnostics.
- Public envelope APIs, stateless JSON-RPC MCP at `/mcp`, tool discovery and invocation convenience endpoints.
- Source-origin validation, response security headers, constrained body parsing, provider-key redaction, and an isolate-local request limiter.

## Important boundaries

This is **a working pilot, not the complete production blueprint**. It intentionally does not claim:

- Current legal boundary certification, district-wide raster aggregates or river station/basin digital twins. The 160 district records are the published 2022 OCHA/WFP reference, reviewed in 2024; the original city coordinates remain in national comparison; matching district detail routes now use published centre coordinates.
- Calibrated risk scores, flood return periods, district inundation, GLOF prediction, population exposure, road safety, evacuation advice or validated alert thresholds.
- Hosted conversational LLM tool calling. Free local WebLLM selects existing evidence facts; generated factual claims are never displayed.
- Hosted PostgreSQL, cloud sign-in, user-role workflows, email/push notification delivery, minute-level scheduled monitoring or deployed public developer keys.
- WorldPop zonal statistics, Overpass infrastructure intersection or calibrated NASA POWER historical baselines. WorldPop query-square estimates and small OSM v0.6 facility lookups are connected; district exposure and hazard-footprint intersections remain unavailable. CHIRPS asynchronous polling and GDACS GeoJSON reports are implemented; their live availability remains subject to the providers.

The referenced React/TanStack/Lovable stack was adapted to a standalone Cloudflare Worker and native browser modules after npm/DNS access failed in the build environment. This keeps the current implementation runnable without network installation. It is not a React or TanStack Start implementation. The domain contracts are isolated so a future framework client can reuse them.

See [implementation decisions](docs/DECISIONS.md), [coverage matrix](docs/COVERAGE.md), and [validation record](docs/VALIDATION.md).

## Server configuration

Use deployment secrets or the process environment, never client-side settings or tracked files:

- `OPENAQ_KEY`: OpenAQ v3 key.
- NASA FIRMS: public regional CSV download; no key required.
- `RELIEFWEB_APPNAME`: approved ReliefWeb application name.
- `PRISM_OPERATOR_TOKEN`: optional server-side token of at least 32 characters for instance-local quarantine controls.

For local use, export required variables in your shell before `npm run dev`. The app does not automatically load `.env`. Cloudflare `env` bindings are passed into the connector configuration. Public responses never include keys or credential-bearing request URLs.

Open-Meteo's free endpoint is subject to its non-commercial limits. Review provider licences and obtain the appropriate usage plan before a commercial or high-traffic launch.

## API

| Endpoint | Contract |
| --- | --- |
| `GET /api/public/v1/weather-detail?location=karachi` | Seven-day detailed forecast envelope and per-variable coverage |
| `GET /api/public/v1/readiness` | Four core Karachi feeds; HTTP 503 when degraded, not nationwide certification |
| `GET /openapi.json` | Principal public API OpenAPI 3.1 specification |
| `GET /api/public/v1/imagery` | NASA published imagery domains and classification legend |
| `GET /api/public/v1/flood-observation?lat=27.7056&lon=68.8574` | Nearest displayed NASA flood pixel and limitations |
| `GET /api/public/v1/snapshot?lat=27.7056&lon=68.8574` | Arbitrary coordinate forecast/discharge/elevation envelopes |
| `GET /api/public/v1/locations` | District centres and preserved city references |
| `GET /api/public/v1/district-registry` | 160 district records and OCHA/WFP provenance |
| `GET /api/public/v1/gdacs` | Country-attributed seven-day GDACS reports |
| `GET /api/public/v1/chirps?location=karachi` | Asynchronously polled satellite rainfall archive |
| `GET /api/public/v1/scheduled-briefings` | Historical daily published evidence archive |
| `GET /api/public/v1/capabilities` | Configuration presence; never secret values |
| `GET /api/public/v1/districts` | Reference-point forecasts and unassessed risk |
| `GET /api/public/v1/districts/:slug` | Point snapshot with four envelopes |
| `GET /api/public/v1/briefings?kind=family&location=karachi` | Seven-section evidence brief |
| `GET /api/public/v1/sources` | All registered source envelopes and current health |
| `GET /api/public/v1/earthquakes` | USGS events in the monitoring rectangle |
| `GET /api/public/v1/radar` | Past frames; not a quantitative Pakistan nowcast |
| `GET /api/public/v1/space-weather` | Global Kp context |
| `GET /api/public/v1/reliefweb` | Configured report feed |
| `GET /api/public/v1/power?location=karachi` | NASA POWER daily archive with missing cells preserved |
| `GET /api/public/v1/openaq` | Up to five fixed Pakistan stations and PM2.5 measurements |
| `GET /api/public/v1/active-fires` | Thermal anomalies, not verified wildfire extent |
| `GET /api/public/v1/events` | NASA EONET event metadata |
| `GET /api/public/v1/advisories` | Explicit unavailable official-advisory status |
| `GET /api/public/v1/point?lat=24.8607&lon=67.0011` | Device-coordinate model evidence; no district attribution |
| `POST /api/ops/quarantine` | Operator-authorized instance-local pause/release |
| `POST /api/officer` | `{ "message": "...", "location": "karachi" }` |
| `POST /mcp` | Stateless MCP JSON-RPC initialize / tools/list / tools/call |

The historical `districts` path is retained for blueprint compatibility, but responses clearly identify reference-point coverage. Unavailable advisories return `alerts: null`, never an empty list interpreted as safety.

## Deployment

A Vercel direct-upload adapter is available with `node scripts/build-vercel.mjs`. It emits a standalone Node.js function and static assets into `.vercel-upload/`. This is the fallback when the terminal cannot push to the Sites source host. The adapter reuses the same Worker logic and preserves the public paths.


The Worker artifact has a standard `default.fetch(request, env)` export. The Sites hosting manifest and project identity live in `.openai/hosting.json`. Source synchronization and private publication use the Sites workflow helper; the saved archive must match the pushed commit. A local build alone is not evidence of deployment.

`database/001_optional_supabase.sql` is an optional, unapplied starting migration for a future Supabase backend. It is not connected to this edition. Review and test it on a disposable database before applying.

## Scientific position

Forecast output is not a ground observation. Forecast valid time is not source issuance time. A point elevation is not a slope. A thermal anomaly is not a fire perimeter. A provider's API success is not independent multi-source agreement. Missing evidence is not safety.

Consult official PMD and NDMA advisories for operational decisions. PRISM is independent and does not represent a government authority.

## Open-source references

- NASA GIBS API and examples: https://nasa-gibs.github.io/gibs-api-docs/ and https://github.com/nasa-gibs/gibs-web-examples
- NASA classification colours: https://gibs.earthdata.nasa.gov/colormaps/v1.3/output/MODIS_Flood.html
- Leaflet stable 1.9.4: https://leafletjs.com and https://github.com/Leaflet/Leaflet
- WebLLM API and model configuration: https://github.com/mlc-ai/web-llm and https://webllm.mlc.ai/docs/

Browser mapping and local AI use pinned CDN modules. The server still builds without npm installation. Inference runs on the visitor device; first use consumes download bandwidth and GPU memory.

For release checks, incidents, rollback and remaining launch gates, see [the operations runbook](docs/OPERATIONS_RUNBOOK.md).

## Real-date correction (0.4.1)

The clock/date use uncached server time, shown in PKT, rather than trusting device wall-clock settings. Server forecast and browser evidence caches expire at UTC hour rollover. Freshness labels distinguish model outlooks, historical archives, static data and stale/undated observations. Daily publication validates both generation and evidence retrieval timestamps. Tests cover PKT midnight, UTC midnight, future/old timestamps and honest archive semantics.

## Connected community data (0.5)
NASA FIRMS now downloads the public South Asia VIIRS SNPP file and filters detections to the monitoring rectangle without a map key. Observation timestamps can lag. WorldPop v2 calculates a 2025 population estimate for a small query square. The OSM v0.6 API supplies mapped facility nodes and ways for the same square, cached for 24 hours. New community-context API and Officer tools keep separate provenance; these are not flood-exposure, facility operating-status or route-safety assessments. ReliefWeb v2 requires approved RELIEFWEB_APPNAME; ground monitors require OPENAQ_KEY. Never commit these credentials.
