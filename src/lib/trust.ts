import type { Tone } from "./labels";

// Trust badge tiers based on a user's average rating + review volume.
// Used on profile pages, public profiles, and the dashboard sidebar card.

export type TrustTier = {
  level: "HIGHLY_TRUSTED" | "TRUSTED" | "RISING" | "NEW" | "CAUTION";
  label: string;
  description: string;
  tone: Tone;
};

const reviews = (n: number) => `${n} review${n === 1 ? "" : "s"}`;

export function trustTier(avg: number | null, reviewCount: number): TrustTier {
  if (reviewCount === 0 || avg == null) {
    return { level: "NEW", label: "New member", description: "No reviews yet.", tone: "neutral" };
  }
  const summary = `${avg.toFixed(1)} stars over ${reviews(reviewCount)}`;
  if (reviewCount >= 2 && avg < 3.0) {
    return { level: "CAUTION", label: "Use caution", description: `${summary}, flagged for low ratings.`, tone: "danger" };
  }
  if (avg >= 4.5 && reviewCount >= 5) {
    return { level: "HIGHLY_TRUSTED", label: "Highly trusted", description: `${summary}.`, tone: "brand" };
  }
  if (avg >= 4.0 && reviewCount >= 3) {
    return { level: "TRUSTED", label: "Trusted", description: `${summary}.`, tone: "info" };
  }
  return { level: "RISING", label: "Rising", description: `${summary}, still building a reputation.`, tone: "neutral" };
}

export type RatingDistribution = { stars: number; count: number; percent: number }[];

export function ratingDistributionFromCounts(
  byStar: Record<number, number>
): RatingDistribution {
  const total = Object.values(byStar).reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = byStar[stars] ?? 0;
    return { stars, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  });
}
