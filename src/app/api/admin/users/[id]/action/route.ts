import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { moderateUser } from "@/features/admin/server";

// POST /api/admin/users/[id]/action — body: { action: "WARN" | "SUSPEND" | "BAN" | "REINSTATE" }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) =>
  moderateUser(await requireSession(), (await ctx.params).id, (await readJson(req)).action),
);
