import { z } from "zod";

export const declineAgreementSchema = z.object({
  reason: z.string().trim().max(500, "Keep the reason under 500 characters.").optional(),
});
