import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { addWord } from "@/features/moderation/server";
import { addWordSchema } from "@/features/moderation/schemas";

// POST /api/admin/words — { term, category: "GENERAL" | "ACADEMIC_DISHONESTY" }
export const POST = jsonRoute(async (req: Request) => {
  const session = await requireSession();
  return addWord(session, addWordSchema.parse(await readJson(req)));
});
