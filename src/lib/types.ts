// Application-layer constraints for the String fields in prisma/schema.prisma.
// SQLite doesn't support enums, so we keep the type safety here.

export type Role = "STUDENT_EMPLOYEE" | "COMMISSIONER" | "ADMIN";
export type SkillLevelDB = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type CategoryDB = "ACADEMIC" | "TECHNICAL" | "GENERAL_ERRANDS" | "ADMINISTRATIVE";
export type CommissionStatusDB = "OPEN" | "IN_PROGRESS" | "AWAITING_REVIEW" | "COMPLETED" | "CANCELLED" | "DISPUTED";
export type ApplicationStatusDB = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type ReportStatus = "PENDING" | "UNDER_INVESTIGATION" | "RESOLVED" | "ESCALATED";
export type AccountStatus = "ACTIVE" | "WARNED" | "SUSPENDED" | "BANNED";

export const ROLES: Role[] = ["STUDENT_EMPLOYEE", "COMMISSIONER", "ADMIN"];
export const SKILL_LEVELS: SkillLevelDB[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
export const CATEGORIES_DB: CategoryDB[] = ["ACADEMIC", "TECHNICAL", "GENERAL_ERRANDS", "ADMINISTRATIVE"];
