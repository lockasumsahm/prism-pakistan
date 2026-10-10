# Blueprint coverage

| Area | Current status | Remaining dependency/work |
| --- | --- | --- |
| National/dashboard/location UI | Implemented | Browser QA and live-provider validation |
| Flood atlas | Leaflet pan/zoom, NASA MODIS flood and VIIRS imagery, past-radar playback, date/opacity controls, arbitrary coordinate queries | Browser visual QA; validated district polygons and river shapes |
| Connector envelopes/resilience | Implemented and tested | Durable cross-isolate cache/circuit coordination at production scale |
| Weather/flood/air/elevation/USGS/radar/NOAA/EONET | Implemented | Live API and schema drift verification |
| OpenAQ/FIRMS/ReliefWeb | Implemented with explicit configuration gating | Server keys and live integration validation |
| CHIRPS/WorldPop/GDACS/Overpass | Explicitly unavailable | Dedicated implementations and spatial/temporal validation |
| Consensus | Implemented/tested comparability and family independence | Calibrated source independence registry and real matched observations |
| Hazard profiles | Context archetypes only | Approved formula resolution, local calibration, validated terrain/threshold inputs |
| Four briefing tracks | Implemented deterministic reference-point aggregation | Administrative coverage and official bulletin integration |
| Officer | Free on-device WebLLM evidence selection; verified facts only; deterministic fallback | Browser WebGPU/model-download and generation QA; hosted gateway optional |
| Watch/widget | Implemented browser-local preferences and briefing cache | Cloud persistence, push delivery, installability tests |
| MCP | Implemented stateless JSON-RPC and five evidence tools | SDK conformance testing and production gateway authentication if restricted |
| Public APIs | Implemented for available contracts | Full river basin/station and district registry |
| Auth/database/roles | Unconfigured; optional unapplied SQL migration | Backend provisioning, identity wiring, RLS execution tests |
| Alerts/webhooks/schedules | Not active | Authenticated scheduler, idempotency and delivery audit design |
| Settings/developer keys | Clearly unconfigured pages | Server-owned secrets and authenticated management endpoints |
| Terms/privacy/contact | Truthful current-state pages | Legal review, operational contact channel and organisation-specific policy |
| GitHub/publishing | Source uploaded and verified; Vercel deployments verified | Browser visual and local-AI QA remain |

The implementation is a pilot. No production-readiness or complete-blueprint claim is made.

NASA POWER daily archive is implemented and live-verified. Solar missing values remain null; no climatological anomaly or baseline is inferred.

NASA flood observation endpoint samples the nearest displayed visualization pixel and preserves transparent/no-data ambiguity. It is not a scientific flood-extent analysis or ground confirmation.
