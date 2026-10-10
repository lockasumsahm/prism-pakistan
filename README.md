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
