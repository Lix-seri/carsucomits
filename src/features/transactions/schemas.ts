import { z } from "zod";
import { CommissionStatus } from "@prisma/client";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date.").optional().or(z.literal("").transform(() => undefined));

/** Admin filters on /admin/transactions, read from the query string. */
export const transactionFilterSchema = z.object({
  status: z.enum(CommissionStatus).optional().or(z.literal("").transform(() => undefined)),
  from: day,
  to: day,
  q: z.string().trim().max(100).optional(),
});
export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
