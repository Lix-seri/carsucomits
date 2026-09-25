import { z } from "zod";

const withFeedback = <T extends { stars: number; comment: string | null }>(d: T) => d.stars > 3 || (d.comment?.length ?? 0) >= 10;
const feedbackError = { path: ["comment"], error: "Please leave at least 10 characters of feedback for ratings of 3 or below." };

const fields = {
  stars: z.coerce.number({ error: "Pick a rating from 1 to 5 stars." }).int("Pick a rating from 1 to 5 stars.").min(1, "Pick a rating from 1 to 5 stars.").max(5, "Pick a rating from 1 to 5 stars."),
  comment: z.string().trim().max(1000, "Keep the feedback under 1,000 characters.").nullish().transform((v) => v || null),
};

export const ratingSchema = z.object(fields).refine(withFeedback, feedbackError);
export type RatingInput = z.infer<typeof ratingSchema>;

export const commissionerRatingSchema = z
  .object({ ...fields, commissionId: z.string({ error: "Commission is required." }).min(1, "Commission is required.") })
  .refine(withFeedback, feedbackError);
