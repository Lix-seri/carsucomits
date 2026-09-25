import { z } from "zod";

export const markReadSchema = z.object({ ids: z.array(z.string()).max(100).optional() });
