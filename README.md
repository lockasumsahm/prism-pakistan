# PRISM
### Pakistan Real-Time Intelligence & Situational Monitoring

**An evidence-first climate intelligence pilot for Pakistan.** PRISM brings forecasts, public reports, and map context into an interface that makes source provenance, data freshness, and missing inputs visible.

[Live pilot](https://prism-pakistan.vercel.app) · [Design decisions](docs/DECISIONS.md) · [Coverage](docs/COVERAGE.md) · [Validation record](docs/VALIDATION.md) · [Operations](docs/OPERATIONS_RUNBOOK.md)

![PRISM forecast interface](docs/screenshots/prism-forecast-release.jpg)

*Repository screenshot; the current deployment and provider availability may differ.*

## The engineering question

How can a climate dashboard remain useful when upstream sources are delayed, unavailable, or measuring different things?

PRISM treats a missing measurement as missing. It separates forecasts from observations and keeps uncertainty alongside the evidence. A successful provider response does not establish independent agreement, and a zero model value does not establish the absence of flooding.

## Technical highlights

| Area | Approach | Inspect |
| :--- | :--- | :--- |
| Provider integration | Server-side connectors with bounded requests, retries, caching, and circuit behavior | [Connectors](lib/climate/connectors/) |
| Evidence contracts | Provenance envelopes with source and missing-data context | [Envelope](lib/climate/envelope.ts) |
| Agreement logic | Comparable units and windows, with upstream-family independence | [Consensus](lib/climate/consensus.ts) |
| Briefings | Deterministic evidence summaries and explicit data boundaries | [Officer](lib/climate/officer.ts) |
| Public interfaces | Envelope APIs, OpenAPI, and a stateless MCP interface | [Implementation notes](docs/IMPLEMENTATION_NOTES.md#api) |
| Evaluation | Tests for source integrity, time semantics, weather windows, and failure behavior | [Tests](tests/) |

## Pilot capabilities

- National overview, district-centre forecasts, location comparisons, and seven-day forecast detail.
- Interactive imagery and radar context, point inspection, and explicit classification limitations.
- Weather, discharge, air-quality, seismic, fire, and public-report connectors, subject to provider availability and configuration.
- Evidence briefings, saved places, export tools, and source-health diagnostics.
- Historical daily briefing publication with original data age visible.

See the [coverage matrix](docs/COVERAGE.md) and [implementation notes](docs/IMPLEMENTATION_NOTES.md) for exact scope and remaining gaps.

## Run locally

Requires **Node.js 24 or newer**. This edition builds without installing dependencies.

```bash
git clone https://github.com/lockasumsahm/prism-pakistan.git
cd prism-pakistan
npm run dev
```

Open [localhost:4173](http://127.0.0.1:4173). To use another port:

```bash
PORT=3000 npm run dev
```

## Validate

```bash
npm run build
npm test
npm run check
```

Build before running tests. Fixtures remain in `tests/` and do not enter the deployed artifact. Historical verification is recorded in [VALIDATION.md](docs/VALIDATION.md); no fresh application test result is claimed by this README update.

## Configuration

Set credentials as server environment variables or deployment secrets:

| Variable | Purpose |
| :--- | :--- |
| `OPENAQ_KEY` | OpenAQ v3 station and measurement access |
| `RELIEFWEB_APPNAME` | Approved ReliefWeb application name |
| `PRISM_OPERATOR_TOKEN` | Optional token of at least 32 characters for instance-local operations controls |

NASA FIRMS uses public regional CSV data in this edition. The application does **not** automatically load `.env`; export local variables in the shell. Never place private credentials in browser settings or tracked files.

## Scientific boundaries

**PRISM is a pilot, not a validated warning or evacuation system.**

Point forecasts do not establish district-wide conditions. Provider discharge cells are not river gauges. Thermal anomalies are not verified fire perimeters. Missing evidence is not evidence of safety.

Calibrated hazard scores, inundation assessment, exposure analysis, and operational alert thresholds remain outside the validated scope. Consult official PMD and NDMA advisories for consequential decisions.

The [production verification matrix](docs/PRODUCTION_VERIFICATION.md) documents remaining release requirements.

## Build and deployment

The primary artifact is a standalone Cloudflare Worker with embedded browser assets. A Vercel adapter is available through `node scripts/build-vercel.mjs`. Review the [implementation notes](docs/IMPLEMENTATION_NOTES.md#deployment) and [operations runbook](docs/OPERATIONS_RUNBOOK.md) before deployment; a local build does not prove a successful release.

## Project context

**Abdullah Amir** · [GitHub](https://github.com/lockasumsahm)  
Independent project; no government affiliation is claimed.

Provider data, maps, and imagery carry their own attribution and usage terms. References and provider notes are retained in the [detailed implementation record](docs/IMPLEMENTATION_NOTES.md).

## Latest source integration

NOAA GOES solar X-ray observations are available at `/api/public/v1/solar-weather` and consulted by the Officer. The header displays synchronized UTC and PKT; the source ledger explains each provider’s timestamp semantics. PMD / FFD published river station readings and nearby airport observations are now connected. Production OpenAQ/ReliefWeb credentials remain unconfigured.

### Observed weather and official river monitoring (0.7)

The location snapshot and forecast workspace show nearby airport observations separately from future model rainfall. Rain reported today uses the Pakistan calendar day and observed METAR weather codes; TEMPO forecast groups are excluded. Airport coverage is limited to points within 100 km of configured reporting stations. Accumulated rainfall millimetres are not supplied by this feed.

`/rivers` and the six main `/river/<name>` pages now use the official public PMD / FFD station directory and station reports. Select a barrage or reservoir to inspect its published observation time, classification, flows or reservoir level, daily history, thresholds and separately labelled official outlook. The Lahore entry links to Ravi / Shahdara. No protected map endpoint is accessed.

| Endpoint | Evidence |
| --- | --- |
| `/api/public/v1/observed-weather?location=lahore` | Airport observations and today's reported rain events |
| `/api/public/v1/rivers` | Official river/station directory |
| `/api/public/v1/river-station?id=74` | Shahdara report with original observation time and units |

Upstream failures return explicit unavailable envelopes. Missing values stay null; stale station readings are flagged. River classifications apply to the named station and do not establish urban drainage conditions or route safety.
