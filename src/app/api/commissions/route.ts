import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { createCommission, listCommissions } from "@/features/commissions/server";
import { createCommissionSchema, listCommissionsSchema } from "@/features/commissions/schemas";

// GET /api/commissions?category=ACADEMIC&level=INTERMEDIATE&q=tutor&status=OPEN
export const GET = jsonRoute(async (req) =>
  listCommissions(listCommissionsSchema.parse(Object.fromEntries(new URL(req.url).searchParams))),
);

// POST /api/commissions — create a listing
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return createCommission(session, createCommissionSchema.parse(await readJson(req)));
});
