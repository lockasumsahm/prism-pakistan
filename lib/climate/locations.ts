export const locations = [
{ slug: 'karachi', name: 'Karachi', province: 'Sindh', lat: 24.8607, lon: 67.0011, profile: 'Urban & coastal' },
{ slug: 'lahore', name: 'Lahore', province: 'Punjab', lat: 31.5204, lon: 74.3587, profile: 'Urban & coastal' },
{ slug: 'islamabad', name: 'Islamabad', province: 'ICT', lat: 33.6844, lon: 73.0479, profile: 'Urban & coastal' },
{ slug: 'peshawar', name: 'Peshawar', province: 'Khyber Pakhtunkhwa', lat: 34.0151, lon: 71.5249, profile: 'Riverine' },
{ slug: 'quetta', name: 'Quetta', province: 'Balochistan', lat: 30.1798, lon: 66.9750, profile: 'Arid & flash basin' },
{ slug: 'sukkur', name: 'Sukkur', province: 'Sindh', lat: 27.7052, lon: 68.8574, profile: 'Riverine' },
{ slug: 'multan', name: 'Multan', province: 'Punjab', lat: 30.1575, lon: 71.5249, profile: 'Riverine' },
{ slug: 'gilgit', name: 'Gilgit', province: 'Gilgit-Baltistan', lat: 35.9208, lon: 74.3089, profile: 'Mountain & GLOF' },
{ slug: 'skardu', name: 'Skardu', province: 'Gilgit-Baltistan', lat: 35.2971, lon: 75.6333, profile: 'Mountain & GLOF' },
{ slug: 'muzaffarabad', name: 'Muzaffarabad', province: 'AJK', lat: 34.3700, lon: 73.4711, profile: 'Mountain & GLOF' },
{ slug: 'gwadar', name: 'Gwadar', province: 'Balochistan', lat: 25.1264, lon: 62.3225, profile: 'Urban & coastal' },
{ slug: 'chitral', name: 'Chitral', province: 'Khyber Pakhtunkhwa', lat: 35.8518, lon: 71.7864, profile: 'Mountain & GLOF' },
] as const;
export type Location = typeof locations[number];
export function locationFor(slug: string) { return locations.find(d => d.slug === slug); }
export function coordinates(args: Record<string, unknown>) { const lat = Number(args.lat), lon = Number(args.lon); if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 23.5 || lat > 37.5 || lon < 60.5 || lon > 78) throw new Error('Coordinates must fall within the Pakistan monitoring bounding box'); return { lat, lon }; }
