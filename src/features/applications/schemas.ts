import { z } from "zod";
import { peso } from "@/features/commissions/schemas";

export const applySchema = z.object({
  coverLetter: z.string().trim().max(500, "Keep the cover letter under 500 characters.").nullish().transform((v) => v || null),
  proposedRate: peso("Proposed rate").nullish().transform((v) => v ?? null),
});
export type ApplyInput = z.infer<typeof applySchema>;
