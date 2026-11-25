/* Shared fetch helper for the public map services: an 8-second timeout per
   attempt, and one retry with backoff for network failures and 5xx responses.
   Callers receive a plain-language Error they can show directly. */
export const REQUEST_TIMEOUT_MS = 8000;

export async function fetchWithRetry(url, { headers, signal, retries = 1, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal?.aborted) throw new DOMException('Request cancelled.', 'AbortError');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    try {
      const response = await fetch(url, { headers, signal: controller.signal });
      if (response.ok || (response.status >= 400 && response.status < 500)) return response;
      lastError = new Error(`Service responded with ${response.status}.`);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    } finally {
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
    if (attempt < retries) await new Promise((resolve) => window.setTimeout(resolve, 400 * 2 ** attempt));
  }
  throw lastError || new Error('The map service did not respond.');
}

/** Turn any low-level failure into a sentence a user can act on. */
export function friendlyServiceMessage(error, fallback) {
  if (error?.name === 'AbortError') return fallback;
  const text = String(error?.message || '');
  if (/fetch|network|timed? ?out|did not respond|responded with 5/i.test(text) || error?.name === 'TypeError') {
    return "We can't reach the road service right now. Check your connection and try again.";
  }
  return text && !/https?:\/\//.test(text) ? text : fallback;
}
