# District registry provenance

PRISM includes all 160 Admin 2 records from OCHA/WFP Pakistan COD-AB v01. Source: https://data.humdata.org/dataset/cod-ab-pak . Attribution: World Food Programme SDI; quality assurance/publication OCHA Field Information Services. License: CC BY 3.0 IGO, https://creativecommons.org/licenses/by/3.0/igo/legalcode .

The source states valid use from 9 September 2022 and review on 27 September 2024. These records do not establish the current legal district count in 2026. Registry records preserve provider PCodes, names and centre coordinates. The file hash is recorded in `lib/climate/districts.ts`; no telemetry is embedded in this dataset.

Forecasts at district centres are point estimates, not district-wide aggregations. The original 12 city reference coordinates are preserved for national comparison. Ten share district names; their named detail routes now use published district centre coordinates, while Karachi and Chitral remain separate city reference aliases. The selector exposes 162 unique routes: 160 published district names plus these two city references. National comparison continues to sample 12 city reference points to avoid claiming 160-point live acquisition on every page request. No district polygon inference is performed for GPS.
