// Display labels and option lists shared by several features.

export const ROLE_LABEL: Record<string, string> = {
  STUDENT_EMPLOYEE: "Student Employee",
  COMMISSIONER: "Commissioner",
  ADMIN: "Admin",
};

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export const CATEGORY_OPTIONS = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "GENERAL_ERRANDS", label: "General Errands" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
];

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABEL).map(([value, label]) => ({ value, label }));

export const LEVEL_PILL: Record<string, string> = {
  BEGINNER: "bg-sunken text-ink",
  INTERMEDIATE: "bg-warning-100 text-warning-800",
  ADVANCED: "bg-info-100 text-info-800",
  EXPERT: "bg-info-100 text-info-800",
};

export const REPORT_REASONS = [
  "Ghosting",
  "Scam",
  "Fraud Report",
  "Payment Dispute",
  "Inappropriate Content",
  "Off-platform Solicitation",
  "Other",
] as const;
