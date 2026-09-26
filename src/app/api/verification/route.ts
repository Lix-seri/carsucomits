import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { submitVerification } from "@/features/verification/server";
import { submitVerificationSchema } from "@/features/verification/schemas";

// POST /api/verification — multipart { studentIdNumber, ccis: "on", proof: File }
export const POST = jsonRoute(async (req: Request) => {
  const session = await requireSession();
  const form = await req.formData();
  return submitVerification(session, submitVerificationSchema.parse(Object.fromEntries(form)));
});
