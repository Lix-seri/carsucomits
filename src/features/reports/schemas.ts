import { z } from "zod";
import { REPORT_REASONS } from "@/lib/labels";


export const fileReportSchema = z.object({
  reporteeEmail: z.email("Enter the reported user's email address.").trim().toLowerCase(),
  reason: z.enum(REPORT_REASONS, "Choose a reason."),
  details: z.string({ error: "Describe what happened." }).trim().min(10, "Describe what happened in at least 10 characters.").max(2000, "Keep the details under 2,000 characters."),
});

export const reportActionSchema = z.object({ action: z.enum(["RESOLVE", "ESCALATE", "REOPEN"], "Invalid action.") });
