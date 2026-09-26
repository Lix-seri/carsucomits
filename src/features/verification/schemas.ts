import { z } from "zod";

export const PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const PROOF_MAX_BYTES = 2 * 1024 * 1024;

export const submitVerificationSchema = z.object({
  studentIdNumber: z
    .string({ error: "Enter your student ID number." })
    .trim()
    .regex(/^[0-9][0-9-]{4,13}[0-9]$/, "Enter the ID number as printed on your student ID (digits and dashes)."),
  ccis: z.literal("on", { error: "Confirm that you're enrolled in a CCIS program." }),
  proof: z
    .instanceof(File, { error: "Upload a photo or scan of your student ID or registration form." })
    .refine((f) => f.size > 0, "Upload a photo or scan of your student ID or registration form.")
    .refine((f) => PROOF_TYPES.includes(f.type), "Use a JPG, PNG, WebP or PDF file.")
    .refine((f) => f.size <= PROOF_MAX_BYTES, "The file must be 2 MB or smaller."),
});

export const decideVerificationSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"], "Choose approve or reject."),
  note: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
});

export const sellerActionSchema = z.object({
  action: z.enum(["SUSPEND", "REINSTATE"], "Choose suspend or reinstate."),
  reason: z.string({ error: "Give a reason." }).trim().min(5, "Give a reason of at least 5 characters; it's recorded in the activity log.").max(500, "Keep the reason under 500 characters."),
});
