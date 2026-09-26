// Display labels, option lists and status tones shared by several features.
// One vocabulary: a "commission" is posted by a student and done by a student.

export type Tone = "brand" | "info" | "warning" | "danger" | "neutral";

// Posting and doing aren't separate account types, so both show as "Student".
export const ROLE_LABEL: Record<string, string> = {
  STUDENT_EMPLOYEE: "Student",
  COMMISSIONER: "Student",
  ADMIN: "Admin",
  USED: "USED officer",
};

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: "Academic",
  TECHNICAL: "Technical",
  GENERAL_ERRANDS: "General Errands",
  ADMINISTRATIVE: "Administrative",
};
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }));

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABEL).map(([value, label]) => ({ value, label }));

/** Commission lifecycle. Colour means state: open = brand, working = info, needs you = warning. */
export const COMMISSION_STATUS: Record<string, { label: string; tone: Tone }> = {
  OPEN: { label: "Open", tone: "brand" },
  AGREEMENT_PENDING: { label: "Agreement pending", tone: "warning" },
  IN_PROGRESS: { label: "In progress", tone: "info" },
  AWAITING_REVIEW: { label: "Awaiting review", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  DISPUTED: { label: "Disputed", tone: "danger" },
};

/** Hired and not finished: these count as someone's current job. */
export const UNFINISHED_STATUSES = ["AGREEMENT_PENDING", "IN_PROGRESS", "AWAITING_REVIEW"] as const;
/** Still on the poster's plate: open for applications or unfinished. */
export const LIVE_STATUSES = ["OPEN", ...UNFINISHED_STATUSES] as const;

export const APPLICATION_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "warning" },
  ACCEPTED: { label: "Accepted", tone: "brand" },
  REJECTED: { label: "Not selected", tone: "neutral" },
  WITHDRAWN: { label: "Withdrawn", tone: "neutral" },
};

export const REPORT_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "warning" },
  UNDER_INVESTIGATION: { label: "Investigating", tone: "info" },
  RESOLVED: { label: "Resolved", tone: "brand" },
  ESCALATED: { label: "Escalated", tone: "danger" },
};

export const ACCOUNT_STATUS: Record<string, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "brand" },
  WARNED: { label: "Warned", tone: "warning" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
  BANNED: { label: "Banned", tone: "danger" },
};

export const DELIVERABLE_STATUS: Record<string, { label: string; tone: Tone }> = {
  SUBMITTED: { label: "Waiting for review", tone: "warning" },
  APPROVED: { label: "Approved", tone: "brand" },
  REVISION_REQUESTED: { label: "Revision requested", tone: "danger" },
};

export const REPORT_REASONS = [
  "Ghosting",
  "Scam",
  "Fraud Report",
  "Payment Dispute",
  "Inappropriate Content",
  "Off-platform Solicitation",
  "Academic dishonesty (thesis or graded work)",
  "Other",
] as const;
