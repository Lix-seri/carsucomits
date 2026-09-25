import { z } from "zod";
import { SkillLevel } from "@prisma/client";

export const AVATAR_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export const avatarSchema = z
  .instanceof(File, { error: "No file uploaded." })
  .refine((f) => AVATAR_TYPES[f.type], "Use JPG, PNG, WebP, or GIF.")
  .refine((f) => f.size <= 5 * 1024 * 1024, "Max file size is 5 MB.");

export const skillSchema = z.object({
  name: z.string({ error: "Skill name is required." }).trim().min(2, "Skill name needs at least 2 characters.").max(60, "Keep the skill name under 60 characters."),
  level: z.enum(SkillLevel, "Pick a skill level."),
});
