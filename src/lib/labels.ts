/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
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
  BEGINNER: "bg-slate-100 text-slate-700",
  INTERMEDIATE: "bg-amber-100 text-amber-800",
  ADVANCED: "bg-blue-100 text-blue-800",
  EXPERT: "bg-purple-100 text-purple-800",
};
