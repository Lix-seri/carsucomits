import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

type Db = Prisma.TransactionClient | typeof prisma;

export type AuditEntry = {
  actorId: string;
  action: string;
  /** The id of what was acted on: usually a user, commission or report. */
  target?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  /** Context that isn't a field change, such as a reason. */
  meta?: Record<string, unknown>;
};

/**
 * Append one entry to the audit log (append-only: a database trigger rejects UPDATE and DELETE).
 * Pass the transaction client so the entry commits or rolls back with the change it describes.
 */
export function audit(entry: AuditEntry, db: Db = prisma) {
  const { meta, ...rest } = entry;
  return db.auditLog.create({ data: { ...rest, meta: meta ? JSON.stringify(meta) : undefined } });
}

/** The audit entry for a commission moving from one status to another. */
export const statusChange = (actorId: string, commissionId: string, from: string, to: string): AuditEntry => ({
  actorId,
  action: "COMMISSION_STATUS",
  target: commissionId,
  before: { status: from },
  after: { status: to },
});
