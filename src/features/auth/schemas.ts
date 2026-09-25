import { z } from "zod";

const email = z.string({ error: "Email is required." }).trim().toLowerCase().pipe(z.email("Enter a valid email address."));

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Password is required." }).min(1, "Password is required.").max(200),
  expectedRole: z.enum(["STUDENT", "ADMIN"]).optional(),
  mfaCode: z.string().trim().max(20).optional(),
});

export const registerSchema = z.object({
  fullName: z.string({ error: "Full name is required." }).trim().min(2, "Enter your full name.").max(80, "Keep your name under 80 characters."),
  email: email.refine((e) => e.endsWith("@carsu.edu.ph"), "Use your @carsu.edu.ph email."),
  password: z.string({ error: "Password is required." }).min(8, "Password must be at least 8 characters.").max(200, "Password is too long."),
});

export const mfaCodeSchema = z.object({ code: z.string({ error: "Code required." }).trim().min(1, "Code required.").max(20) });
export const passwordSchema = z.object({ password: z.string({ error: "Password required." }).min(1, "Password required.").max(200) });
