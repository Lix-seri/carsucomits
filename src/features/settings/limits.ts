/** The settings admins can change, with their defaults (claude/decisions/0010). */
export const SETTINGS = {
  MAX_PENDING_APPLICATIONS: {
    label: "Pending applications per student",
    hint: "Applications still waiting for the poster's decision.",
    default: 5,
  },
  MAX_ACTIVE_JOBS: {
    label: "Jobs a student can hold at once",
    hint: "Hired commissions that aren't finished yet.",
    default: 2,
  },
} as const;

export type SettingKey = keyof typeof SETTINGS;
export type Limits = Record<SettingKey, number>;

/** Why a student can't apply right now, or null if they can. */
export function applyBlockedReason(counts: { pending: number; active: number }, limits: Limits): string | null {
  if (counts.active >= limits.MAX_ACTIVE_JOBS) {
    return `You're already working on ${counts.active} commission${counts.active === 1 ? "" : "s"}, the most you can hold at once. Finish one before applying to more.`;
  }
  if (counts.pending >= limits.MAX_PENDING_APPLICATIONS) {
    return `You have ${counts.pending} application${counts.pending === 1 ? "" : "s"} waiting for a decision, the most allowed at once. Withdraw one or wait for a reply.`;
  }
  return null;
}
