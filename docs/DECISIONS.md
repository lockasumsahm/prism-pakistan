# Implementation decisions

The user's two dossiers are the design reference. The following conflicts and unsupported assumptions are resolved explicitly.

| Blueprint issue | Implemented resolution |
| --- | --- |
| Breaker threshold is both three and five failures | Five failed executions; 60-second cooldown; deduplicated half-open probe |
| Failure envelope requires null data but stale fallback implies live payload | Live `data` remains null; separate `last_success` is labelled historical |
| Hourly extraction assumes index zero is current | UTC timestamps select exact next-24-hour and seven-day windows |
| River discharge assumed to be a station reading | Labelled GloFAS model output at the largest river within 5 km |
| Return-period thresholds not supplied | Null return period; no invented historical threshold |
| Elevation assumed to establish slope | Null slope; a point DEM elevation is insufficient |
| Independent provider assumption | Consensus counts upstream families, not connector brands |
| CHIRPS lagged data compared to current forecasts | No consensus without equal windows, units, and temporal kind |
| Radar metadata assumed to quantify rainfall or establish Pakistan coverage | Metadata-only status; no fabricated reflectivity-to-rainfall conversion |
| Public two-hour RainViewer nowcast promised | Removed; transition notice says future frames discontinued January 2026 |
| Mountain/arid profile formulas contradict each other | No arbitrary selection of weights; calibrated operational risk remains unassessed |
| 160-district registry missing | Explicit 12-reference-coordinate coverage, no district polygon claims |
| Public alert history contains unstructured factors | Optional future schema keeps raw audit data service-only; public advisory view is deliberately limited |
| Native package installation denied by DNS | Dependency-free Worker/native-browser implementation; framework difference disclosed |

## Provider references checked during implementation

- Open-Meteo Flood: https://open-meteo.com/en/docs/flood-api
- RainViewer transition: https://www.rainviewer.com/api/transition-faq.html
- OpenAQ station metadata: https://docs.openaq.org/resources/locations
- OpenAQ latest readings: https://docs.openaq.org/resources/latest
- NASA FIRMS area API: https://firms.modaps.eosdis.nasa.gov/api/area/
- NASA EONET v3: https://eonet.gsfc.nasa.gov/docs/v3
- ClimateSERV async API: https://climateserv2.servirglobal.net/develop-api

These documentation checks do not constitute live end-to-end validation. Local upstream network access was unavailable.
