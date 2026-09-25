import { z } from "zod";

// Extension → the MIME types browsers send for it. Both must match: an empty or
// mismatched type is rejected instead of skipping the check.
export const DELIVERABLE_TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"], webp: ["image/webp"], gif: ["image/gif"],
  pdf: ["application/pdf"],
  zip: ["application/zip", "application/x-zip-compressed"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  txt: ["text/plain"], csv: ["text/csv", "application/vnd.ms-excel"],
};
const extension = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

export const deliverableSchema = z.object({
  file: z
    .instanceof(File, { error: "Pick a file to upload." })
    .refine((f) => DELIVERABLE_TYPES[extension(f.name)]?.includes(f.type), "Use a common image, PDF, doc, spreadsheet, or zip file.")
    .refine((f) => f.size <= 20 * 1024 * 1024, "Max file size is 20 MB."),
  message: z.string().trim().max(1000, "Keep the message under 1,000 characters.").nullish().transform((v) => v || null),
});

export const decisionSchema = z
  .object({
    action: z.enum(["APPROVE", "REQUEST_REVISION"], "Invalid action."),
    notes: z.string().trim().max(1000, "Keep the notes under 1,000 characters.").nullish().transform((v) => v || null),
  })
  .refine((d) => d.action === "APPROVE" || (d.notes?.length ?? 0) >= 5, { path: ["notes"], error: "Please describe what needs to change." });
