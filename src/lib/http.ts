import { NextResponse } from "next/server";

/** Thrown by feature services; the route wrapper turns it into a JSON error response. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Wraps an API route handler. The handler returns a plain object, which is sent as
 * `{ ok: true, ...object }`, or a Response, which is passed through. An HttpError
 * becomes `{ error }` with its status; anything else is a real 500.
 */
export function jsonRoute<Ctx>(fn: (req: Request, ctx: Ctx) => Promise<Record<string, unknown> | Response>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      const out = await fn(req, ctx);
      return out instanceof Response ? out : NextResponse.json({ ok: true, ...out });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      throw e;
    }
  };
}

/** Reads a JSON body; a missing or malformed body is treated as `{}`. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const body = await req.json().catch(() => ({}));
  return body && typeof body === "object" ? body : {};
}
