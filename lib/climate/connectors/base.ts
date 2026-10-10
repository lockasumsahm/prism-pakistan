import type { Envelope, SourceSpec } from '../envelope.ts';
export class FeedError extends Error { constructor(public code: string, message: string) { super(message); } }
type State<T> = { failures: number; opened: number; probing: boolean; cache?: { expires: number; envelope: Envelope<T> }; pending?: Promise<Envelope<T>> };
export abstract class BaseConnector<T> {
  private quarantined=false;
  setQuarantined(value:boolean){this.quarantined=value;}
  private states = new Map<string, State<T>>();
  constructor(public spec: SourceSpec, private options = { ttl: 300_000, timeout: 4_000, retries: 1, threshold: 5, cooldown: 60_000 }, private transport: typeof fetch = fetch, private clock: () => number = Date.now) {}
  protected abstract load(args: Record<string, unknown>): Promise<{ data: T; updated_at: string | null }>;
  protected async request(url: string, init: RequestInit = {}): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await this.transport(url, { ...init, signal: AbortSignal.timeout(this.options.timeout), redirect: 'error', headers: { Accept: 'application/json', ...init.headers } });
        if (!response.ok) throw new FeedError('HTTP_' + response.status, 'Upstream returned HTTP ' + response.status);
        const length = Number(response.headers.get('content-length'));
        if (length > 5_000_000) throw new FeedError('PAYLOAD_LIMIT', 'Upstream payload exceeded the 5 MB limit');
        const reader = response.body?.getReader();
        if (!reader) throw new FeedError('INVALID_PAYLOAD', 'Upstream returned an empty body');
        const parts: Uint8Array[] = []; let total = 0;
        while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > 5_000_000) { await reader.cancel(); throw new FeedError('PAYLOAD_LIMIT', 'Upstream payload exceeded the 5 MB limit'); } parts.push(value); }
        const bytes = new Uint8Array(total); let offset = 0; for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
        return new Response(bytes, { status: response.status, headers: response.headers });
      } catch (error) {
        const transient = error instanceof FeedError ? /^HTTP_5/.test(error.code) || error.code === 'HTTP_429' : true;
        if (!transient || attempt >= this.options.retries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.min(2000, 250 * 2 ** attempt)));
      }
    }
  }
  protected async json(url: string, init?: RequestInit): Promise<any> { return (await this.request(url, init)).json(); }
  async execute(args: Record<string, unknown> = {}): Promise<Envelope<T>> {
    const key = JSON.stringify(args); const now = this.clock();
    let state = this.states.get(key);
    if (!state) { if (this.states.size >= 256) this.states.delete(this.states.keys().next().value!); state = { failures: 0, opened: 0, probing: false }; this.states.set(key, state); }
    if(this.quarantined)return this.offline(state,'MANUAL_QUARANTINE','An operator paused this connector in the current server instance');
    if (state.cache && now < state.cache.expires) return { ...state.cache.envelope, cached: true, trace_id: crypto.randomUUID() };
    if (state.pending) return state.pending;
    if (state.opened && (now - state.opened < this.options.cooldown || state.probing)) return this.offline(state, 'CIRCUIT_OPEN', 'Repeated upstream failures; retry after the circuit cooldown');
    state.probing = !!state.opened;
    state.pending = this.run(args, state);
    try { return await state.pending; } finally { state.pending = undefined; state.probing = false; }
  }
  private offline(state: State<T>, code: string, message: string): Envelope<T> {
    const previous = state.cache?.envelope;
    return { ok: false, data: null, source: { ...this.spec, latency_ms: 0, updated_at: null, retrieved_at: new Date(this.clock()).toISOString() }, trace_id: crypto.randomUUID(), cached: false, error: { code, message }, ...(previous?.ok ? { last_success: { data: previous.data, retrieved_at: previous.source.retrieved_at } } : {}) };
  }
  private async run(args: Record<string, unknown>, state: State<T>): Promise<Envelope<T>> {
    const start = this.clock();
    try {
      const result = await this.load(args);
      const envelope: Envelope<T> = { ok: true, data: result.data, source: { ...this.spec, latency_ms: this.clock() - start, updated_at: result.updated_at, retrieved_at: new Date(this.clock()).toISOString() }, trace_id: crypto.randomUUID(), cached: false, error: null };
      state.failures = 0; state.opened = 0; state.cache = { expires: this.clock() + this.options.ttl, envelope }; return envelope;
    } catch (error) {
      state.failures++; if (state.failures >= this.options.threshold || state.opened) state.opened = this.clock();
      const code = error instanceof FeedError ? error.code : error instanceof Error && /timeout|abort/i.test(error.name) ? 'TIMEOUT' : error instanceof SyntaxError ? 'INVALID_PAYLOAD' : 'NETWORK_ERROR';
      // Never include credential-bearing URLs or raw upstream errors in the public ledger.
      const message = error instanceof FeedError ? error.message : code === 'TIMEOUT' ? 'Upstream request exceeded its timeout' : code === 'INVALID_PAYLOAD' ? 'Upstream response could not be decoded' : 'Upstream could not be reached';
      const envelope = this.offline(state, code, message); envelope.source.latency_ms = this.clock() - start; return envelope;
    }
  }
  health() { return { id: this.spec.id, ...this.spec, quarantined:this.quarantined, circuit: [...this.states.values()].some(s => s.probing) ? 'HALF-OPEN' : [...this.states.values()].some(s => s.opened && this.clock() - s.opened < this.options.cooldown) ? 'OPEN' : [...this.states.values()].some(s => s.opened) ? 'HALF-OPEN' : 'CLOSED', failures: Math.max(0, ...[...this.states.values()].map(s => s.failures)), cached_locations: this.states.size }; }
}
export function numeric(value: unknown, field: string): number { if (typeof value !== 'number' || !Number.isFinite(value)) throw new FeedError('INVALID_PAYLOAD', 'Missing or invalid ' + field); return value; }
export function series(values: unknown, field: string): number[] { if (!Array.isArray(values) || values.length === 0) throw new FeedError('NO_COVERAGE', 'No coverage for ' + field); return values.map(v => numeric(v, field)); }
