# PRISM

**Pakistan Real-Time Intelligence & Situational Monitoring**

An evidence-first climate intelligence pilot for Pakistan. A responsive institutional interface pairs model forecasts with explicit provenance, source health, and missing-data diagnostics. Every displayed measurement comes from a server-side connector. Runtime fixtures and fabricated hazard scores are prohibited.

**Live pilot:** https://prism-pakistan.vercel.app

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

## What works

- Responsive national overview, geographic reference atlas, location comparison dashboard, hourly forecast charts, and location detail pages.
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

- Complete 160-district coverage, verified administrative polygons or river station/basin digital twins. The registry contains 12 reference coordinates across seven regions.
- Calibrated risk scores, flood return periods, district inundation, GLOF prediction, population exposure, road safety, evacuation advice or validated alert thresholds.
- Conversational LLM tool calling; the officer is explicitly deterministic.
- Hosted PostgreSQL, cloud sign-in, user-role workflows, email/push notification delivery, scheduled monitoring or deployed public developer keys.
- Implemented CHIRPS async jobs, WorldPop zonal statistics, GDACS XML geography, NASA POWER historical baselines or Overpass infrastructure intersection. CHIRPS, WorldPop, GDACS and Overpass have explicit offline envelopes. NASA POWER daily archive is implemented; calibrated historical baselines remain unavailable.

The referenced React/TanStack/Lovable stack was adapted to a standalone Cloudflare Worker and native browser modules after npm/DNS access failed in the build environment. This keeps the current implementation runnable without network installation. It is not a React or TanStack Start implementation. The domain contracts are isolated so a future framework client can reuse them.

See [implementation decisions](docs/DECISIONS.md), [coverage matrix](docs/COVERAGE.md), and [validation record](docs/VALIDATION.md).

## Server configuration

Use deployment secrets or the process environment, never client-side settings or tracked files:

- `OPENAQ_KEY`: OpenAQ v3 key.
- `NASA_FIRMS_KEY`: NASA FIRMS MAP_KEY.
- `RELIEFWEB_APPNAME`: approved ReliefWeb application name.

For local use, export required variables in your shell before `npm run dev`. The app does not automatically load `.env`. Cloudflare `env` bindings are passed into the connector configuration. Public responses never include keys or credential-bearing request URLs.

Open-Meteo's free endpoint is subject to its non-commercial limits. Review provider licences and obtain the appropriate usage plan before a commercial or high-traffic launch.

## API

| Endpoint | Contract |
| --- | --- |
| `GET /api/public/v1/locations` | Explicit reference-coordinate registry |
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
