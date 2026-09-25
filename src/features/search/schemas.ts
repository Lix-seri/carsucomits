import { z } from "zod";

export const searchSchema = z.object({ q: z.string().trim().max(100).catch("").default("") });
