import { z } from "zod";
import { Category, CommissionStatus, SkillLevel } from "@prisma/client";

/** Whole pesos from a number or a numeric string; empty means missing. */
export const peso = (label: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : typeof v === "string" ? Number(v) : v),
    z
      .number({ error: (iss) => (iss.input === undefined ? `${label} is required.` : `${label} must be a number.`) })
      .int(`${label} must be whole pesos.`)
      .min(0, `${label} can't be negative.`)
      .max(1_000_000, `${label} is too high.`),
  );

const today = () => new Date().toISOString().slice(0, 10);

export const createCommissionSchema = z
  .object({
    title: z.string({ error: "Title is required." }).trim().min(5, "Give it a title of at least 5 characters.").max(120, "Keep the title under 120 characters."),
    description: z
      .string({ error: "Description is required." })
      .trim()
      .min(20, "Describe the task in at least 20 characters.")
      .max(5000, "Keep the description under 5,000 characters."),
    category: z.enum(Category, "Pick a category."),
    subcategory: z.string().trim().max(60, "Keep the subcategory under 60 characters.").nullish().transform((v) => v || null),
    requiredLevel: z.enum(SkillLevel, "Pick a skill level."),
    fareMin: peso("Minimum fare"),
    fareMax: peso("Maximum fare").nullish().transform((v) => v ?? null),
    fareUnit: z.enum(["/hr", "/day", "/errand"], "Pick a fare unit.").nullish().transform((v) => v ?? null),
    deadline: z.iso.date("Pick a valid deadline.").nullish().transform((v) => v ?? null),
  })
  .refine((d) => d.fareMax == null || d.fareMax >= d.fareMin, { path: ["fareMax"], error: "Maximum fare must be at least the minimum fare." })
  .refine((d) => !d.deadline || d.deadline >= today(), { path: ["deadline"], error: "The deadline can't be in the past." });
export type CreateCommissionInput = z.infer<typeof createCommissionSchema>;

/** Browse filters. Unknown values are ignored rather than rejected, as before. */
export const listCommissionsSchema = z.object({
  category: z.enum(Category).optional().catch(undefined),
  level: z.enum(SkillLevel).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(CommissionStatus).catch("OPEN").default("OPEN"),
});

export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export const coverImageSchema = z
  .instanceof(File, { error: "No file uploaded." })
  .refine((f) => IMAGE_TYPES[f.type], "Use JPG, PNG, or WebP.")
  .refine((f) => f.size <= 5 * 1024 * 1024, "Max file size is 5 MB.");
