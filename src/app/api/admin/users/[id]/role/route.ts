import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { setUserRole } from "@/features/admin/server";
import { setRoleSchema } from "@/features/admin/schemas";

// POST /api/admin/users/[id]/role — { role: "STUDENT_EMPLOYEE" | "USED" } (admin only)
export const POST = jsonRoute(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return setUserRole(session, (await ctx.params).id, setRoleSchema.parse(await readJson(req)).role);
});
