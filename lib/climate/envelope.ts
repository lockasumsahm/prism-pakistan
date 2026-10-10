export type EvidenceTier = 1 | 2 | 3 | 4;
export interface Provenance { id: string; name: string; url: string; license: string; tier: EvidenceTier; family: string; methodology: string; latency_ms: number; updated_at: string | null; retrieved_at: string; stale_after_minutes: number; temporal_kind: 'observation' | 'forecast' | 'report' | 'static'; }
export type Envelope<T> = { ok: true; data: T; source: Provenance; trace_id: string; cached: boolean; error: null } | { ok: false; data: null; source: Provenance; trace_id: string; cached: boolean; error: { code: string; message: string }; last_success?: { data: T; retrieved_at: string } };
export type SourceSpec = Omit<Provenance, 'latency_ms' | 'updated_at' | 'retrieved_at'>;
