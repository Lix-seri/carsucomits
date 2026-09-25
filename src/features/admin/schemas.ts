import { z } from "zod";

export const moderateUserSchema = z.object({ action: z.enum(["WARN", "SUSPEND", "BAN", "REINSTATE"], "Invalid action.") });
