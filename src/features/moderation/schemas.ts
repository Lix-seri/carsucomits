import { z } from "zod";

export const decideFlagSchema = z.object({
  decision: z.enum(["APPROVE", "REMOVE"], "Choose approve or remove."),
  note: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
});

export const addWordSchema = z.object({
  term: z.string({ error: "Enter a word or phrase." }).trim().toLowerCase().min(3, "Use at least 3 letters.").max(60, "Keep it under 60 characters."),
  category: z.enum(["GENERAL", "ACADEMIC_DISHONESTY"], "Choose a category."),
});
