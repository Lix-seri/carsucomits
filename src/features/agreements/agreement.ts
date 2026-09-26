// The work agreement both parties accept before a commission starts (decision 0013).
// Changing any clause means bumping AGREEMENT_VERSION; stored acceptances keep the version they saw.

export const AGREEMENT_VERSION = "2026-09-26";

export const AGREEMENT_CLAUSES = [
  "The work is what the description says. Anything extra is agreed in Messages first.",
  "The fare below is the price. The two of you settle payment directly; CarsuComits doesn't handle money.",
  "The deadline below is when the work is due, unless you both agree to change it.",
  "No academic work done for someone else: no thesis, capstone, research paper, graded assignment, quiz or exam. Tutoring and feedback on your own work are fine.",
  "Either of you can report a problem. Admins can see this agreement and the activity on the commission.",
] as const;

export type AgreementTerms = {
  title: string;
  scope: string;
  fare: string;
  deadline: string | null;
};

/** The terms as they stand when someone accepts, stored with the acceptance. */
export function snapshotTerms(c: { title: string; description: string; fareMin: number; fareMax: number | null; fareUnit: string | null; deadline: Date | null }): AgreementTerms {
  const fare = c.fareMax ? `₱${c.fareMin}–${c.fareMax}${c.fareUnit ?? ""}` : `₱${c.fareMin}${c.fareUnit ?? ""}`;
  return { title: c.title, scope: c.description, fare, deadline: c.deadline ? c.deadline.toISOString().slice(0, 10) : null };
}

/** Work starts only when the poster and the hired student have both accepted this version. */
export function bothAccepted(acceptances: { userId: string; version: string }[], parties: { commissionerId: string; awardedToId: string | null }) {
  const current = new Set(acceptances.filter((a) => a.version === AGREEMENT_VERSION).map((a) => a.userId));
  return !!parties.awardedToId && current.has(parties.commissionerId) && current.has(parties.awardedToId);
}
