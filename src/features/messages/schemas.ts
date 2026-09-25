import { z } from "zod";

export const sendMessageSchema = z.object({
  recipientId: z.string({ error: "Recipient is required." }).min(1, "Recipient is required."),
  body: z.string({ error: "Write a message." }).trim().min(1, "Write a message.").max(2000, "Keep messages under 2,000 characters."),
  commissionId: z.string().min(1).nullish().transform((v) => v ?? null),
});
