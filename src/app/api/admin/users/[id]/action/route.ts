import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { moderateUser } from "@/features/admin/server";
import { moderateUserSchema } from "@/features/admin/schemas";

// POST /api/admin/users/[id]/action — { action: "WARN" | "SUSPEND" | "BAN" | "REINSTATE" }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return moderateUser(session, (await ctx.params).id, moderateUserSchema.parse(await readJson(req)).action);
});
