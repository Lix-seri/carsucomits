import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Thrown by feature services; the route wrapper turns it into a JSON error response. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Wraps an API route handler. The handler returns a plain object, which is sent as
 * `{ ok: true, ...object }`, or a Response, which is passed through.
 * - HttpError → `{ error }` with its status.
 * - ZodError (invalid input) → 400 `{ error, field }`, so forms can show the message next to the field.
 * - Anything else is a real 500.
 */
export function jsonRoute<Ctx>(fn: (req: Request, ctx: Ctx) => Promise<Record<string, unknown> | Response>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      const out = await fn(req, ctx);
      return out instanceof Response ? out : NextResponse.json({ ok: true, ...out });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        const issue = e.issues[0];
        return NextResponse.json({ error: issue.message, field: issue.path.join(".") || undefined }, { status: 400 });
      }
      throw e;
    }
  };
}

/** Reads a JSON body; a missing or malformed body is treated as `{}`. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const body = await req.json().catch(() => ({}));
  return body && typeof body === "object" ? body : {};
}
