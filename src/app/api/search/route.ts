import { jsonRoute } from "@/lib/http";
import { getSession } from "@/lib/session";
import { search } from "@/features/search/server";
import { searchSchema } from "@/features/search/schemas";

// GET /api/search?q=jefferson — matching users + open commissions
export const GET = jsonRoute(async (req) => {
  const { q } = searchSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return search(q, q ? await getSession() : null);
});
