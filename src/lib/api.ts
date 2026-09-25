// Client-side calls to our JSON API. Every route answers { ok: true, ... } or
// { error, field? }; this turns both, plus network failures, into one shape.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; field?: string; status: number };

export async function api<T = Record<string, unknown>>(
  url: string,
  opts: { method?: string; json?: unknown; form?: FormData } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: opts.method ?? (opts.json !== undefined || opts.form ? "POST" : "GET"),
      headers: opts.json !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: opts.form ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok !== false) return { ok: true, data };
    return { ok: false, error: data.error ?? "Something went wrong. Please try again.", field: data.field, status: res.status };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again.", status: 0 };
  }
}
