import { z } from "zod";

export const moderateUserSchema = z.object({
  action: z.enum(["WARN", "SUSPEND", "BAN", "REINSTATE"], "Choose an action."),
  reason: z.string({ error: "Give a reason." }).trim().min(5, "Give a reason of at least 5 characters; it's recorded in the activity log.").max(500, "Keep the reason under 500 characters."),
});
