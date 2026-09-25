import { jsonRoute } from "@/lib/http";
import { getSession } from "@/lib/session";
import { search } from "@/features/search/server";

// GET /api/search?q=jefferson — matching users + open commissions
export const GET = jsonRoute(async (req) => {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  return search(q, q ? await getSession() : null);
});
