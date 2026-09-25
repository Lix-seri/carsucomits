import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { moderateUser } from "@/features/admin/server";
import { moderateUserSchema } from "@/features/admin/schemas";

// POST /api/admin/users/[id]/action — { action: "WARN" | "SUSPEND" | "BAN" | "REINSTATE", reason }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  const { action, reason } = moderateUserSchema.parse(await readJson(req));
  return moderateUser(session, (await ctx.params).id, action, reason);
});
