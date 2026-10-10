export interface Reading { id: string; family: string; value: number | null; unit: string; parameter: string; window: string; kind: string; updated_at: string | null; stale_after_minutes: number; }
export function consensus(readings: Reading[], now = Date.now(), absoluteTolerance = 0.5) {
  const fresh = (r: Reading) => r.updated_at && Number.isFinite(Date.parse(r.updated_at)) && now - Date.parse(r.updated_at) <= r.stale_after_minutes * 60_000 && Date.parse(r.updated_at) <= now + 60_000;
  const reference = readings.find(r => r.value !== null && Number.isFinite(r.value) && fresh(r));
  const qualified = readings.map(r => ({ ...r, status: r.value === null || !Number.isFinite(r.value) ? 'unavailable' : !fresh(r) ? 'stale' : reference && (r.unit !== reference.unit || r.parameter !== reference.parameter || r.window !== reference.window || r.kind !== reference.kind) ? 'incomparable' : 'active' }));
  const active = qualified.filter(r => r.status === 'active');
  const values = active.map(r => r.value!).sort((a,b) => a-b);
  const median = values.length ? values.length % 2 ? values[Math.floor(values.length / 2)] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2 : null;
  const feeds = qualified.map(r => ({ ...r, status: r.status === 'active' ? Math.abs(r.value! - median!) <= absoluteTolerance + .35 * Math.abs(median!) ? 'agrees' : 'disagrees' : r.status }));
  const independent = new Set(feeds.filter(r => r.status === 'agrees').map(r => r.family)).size;
  const families = new Set(readings.map(r => r.family)).size;
  const coverage = families ? new Set(active.map(r => r.family)).size / families * 100 : 0;
  const level = !active.length ? 'INSUFFICIENT' : independent >= 2 && coverage >= 66 ? 'HIGH' : feeds.some(r => r.status === 'disagrees') ? 'LOW' : 'MEDIUM';
  return { level, coverage, median, independent_sources: independent, feeds, critical_alert_eligible: level === 'HIGH' };
}
