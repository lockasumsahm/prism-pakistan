// Keep cancellation available on browsers without AbortSignal.timeout.
// The deadline covers both fetching headers and consuming JSON/stream bodies.
export async function withTimeout(milliseconds, operation) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
