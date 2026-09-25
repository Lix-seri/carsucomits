/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
// Trust badge tiers based on a user's average rating + review volume.
// Used on profile pages, public profiles, and the dashboard sidebar card.

export type TrustTier = {
  level: "HIGHLY_TRUSTED" | "TRUSTED" | "RISING" | "NEW" | "CAUTION";
  label: string;
  description: string;
  color: string; // tailwind classes
  emoji: string;
};

export function trustTier(avg: number | null, reviewCount: number): TrustTier {
  if (reviewCount === 0) {
    return {
      level: "NEW",
      label: "New Member",
      description: "No reviews yet — give them a chance to prove themselves.",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      emoji: "✨",
    };
  }
  if (avg == null) {
    return {
      level: "NEW",
      label: "New Member",
      description: "No ratings yet.",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      emoji: "✨",
    };
  }
  if (reviewCount >= 2 && avg < 3.0) {
    return {
      level: "CAUTION",
      label: "Use Caution",
      description: `Average ${avg.toFixed(1)}★ over ${reviewCount} reviews — flagged for low ratings.`,
      color: "bg-red-100 text-red-700 border-red-200",
      emoji: "⚠️",
    };
  }
  if (avg >= 4.5 && reviewCount >= 5) {
    return {
      level: "HIGHLY_TRUSTED",
      label: "Highly Trusted",
      description: `Outstanding ${avg.toFixed(1)}★ over ${reviewCount} reviews.`,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      emoji: "🏆",
    };
  }
  if (avg >= 4.0 && reviewCount >= 3) {
    return {
      level: "TRUSTED",
      label: "Trusted",
      description: `Solid ${avg.toFixed(1)}★ over ${reviewCount} reviews.`,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      emoji: "✓",
    };
  }
  return {
    level: "RISING",
    label: "Rising",
    description: `${avg.toFixed(1)}★ over ${reviewCount} review${reviewCount === 1 ? "" : "s"} — building reputation.`,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    emoji: "📈",
  };
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
