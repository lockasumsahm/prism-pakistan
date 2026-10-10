# Map and local AI release verification

Source commit: `61c5f68dbe1b9282f7ebadc9f31f68404079a7c3`.
Production deployment: `dpl_HqBMrjPNgNzuGc8wizcgKUgeoyah` (READY).
URL: https://prism-pakistan.vercel.app

108 automated tests pass after preserving the current 0.6 hazard desk changes.
Production Chromium checks confirm the interactive Leaflet map, radar Play enabling its layer, Sukkur selection, NASA publication metadata, and automatic verified evidence fallback on a browser without a GPU. The hazard desk fits a 390 px viewport without horizontal overflow. The live Officer returned all seven sections for a Sukkur flood question. A real Leaflet marker click invoked exactly one location selection and zero coordinate inspections. No page errors occurred in these checks. WebLLM 0.2.85 imports successfully; actual GPU model inference was not verified in this CPU sandbox.

Marker events no longer bubble into coordinate inspection. Radar layers start with a valid frame URL. Flood date controls explicitly describe the flood composite rather than implying the VIIRS image uses the same date. Local AI errors preserve already-retrieved exact facts.

These checks establish the tested flows, not calibrated flood safety or official warning authority. OpenAQ and ReliefWeb configuration and independent local hazard calibration remain separate completion requirements.
