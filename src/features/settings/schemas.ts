import { z } from "zod";

const limit = z.coerce.number({ error: "Enter a number." }).int("Use a whole number.").min(1, "The lowest allowed value is 1.").max(50, "The highest allowed value is 50.");

export const updateSettingsSchema = z.object({
  MAX_PENDING_APPLICATIONS: limit,
  MAX_ACTIVE_JOBS: limit,
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
