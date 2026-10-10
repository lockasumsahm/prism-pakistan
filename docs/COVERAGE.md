# Blueprint coverage

| Area | Current status | Remaining dependency/work |
| --- | --- | --- |
| National/dashboard/location UI | Implemented | Browser QA and live-provider validation |
| Reference atlas | Implemented raster basemap and point markers | Validated district polygons, MapLibre layer rendering, river shapes |
| Connector envelopes/resilience | Implemented and tested | Durable cross-isolate cache/circuit coordination at production scale |
| Weather/flood/air/elevation/USGS/radar/NOAA/EONET | Implemented | Live API and schema drift verification |
| OpenAQ/FIRMS/ReliefWeb | Implemented with explicit configuration gating | Server keys and live integration validation |
| CHIRPS/WorldPop/GDACS/Overpass | Explicitly unavailable | Dedicated implementations and spatial/temporal validation |
| Consensus | Implemented/tested comparability and family independence | Calibrated source independence registry and real matched observations |
| Hazard profiles | Context archetypes only | Approved formula resolution, local calibration, validated terrain/threshold inputs |
| Four briefing tracks | Implemented deterministic reference-point aggregation | Administrative coverage and official bulletin integration |
| Officer | Implemented deterministic evidence mode | Authenticated LLM gateway, bounded tool loop, citation-output validation |
| Watch/widget | Implemented browser-local preferences and briefing cache | Cloud persistence, push delivery, installability tests |
| MCP | Implemented stateless JSON-RPC and five evidence tools | SDK conformance testing and production gateway authentication if restricted |
| Public APIs | Implemented for available contracts | Full river basin/station and district registry |
| Auth/database/roles | Unconfigured; optional unapplied SQL migration | Backend provisioning, identity wiring, RLS execution tests |
| Alerts/webhooks/schedules | Not active | Authenticated scheduler, idempotency and delivery audit design |
| Settings/developer keys | Clearly unconfigured pages | Server-owned secrets and authenticated management endpoints |
| Terms/privacy/contact | Truthful current-state pages | Legal review, operational contact channel and organisation-specific policy |
| GitHub/publishing | Vercel production deployment READY; source prepared | GitHub repository creation/access still required |

The implementation is a pilot. No production-readiness or complete-blueprint claim is made.

NASA POWER daily archive is implemented and live-verified. Solar missing values remain null; no climatological anomaly or baseline is inferred.
