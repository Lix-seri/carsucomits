import type { FlagCategory, FlaggedKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit, statusChange } from "@/lib/audit";
import { findFlaggedTerms, normalize } from "@/lib/flagged-words";
import { HttpError } from "@/lib/http";
import { assertAdmin, type Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";

// Flagged words and the admin review queue (decision 0011, items 5 and 9).

export type Screening = { terms: string[]; category: FlagCategory } | null;

/** Which listed terms the text contains. Academic dishonesty wins if both categories match. */
export async function screenText(text: string): Promise<Screening> {
  const words = await prisma.flaggedWord.findMany({ select: { term: true, category: true } });
  const hits = findFlaggedTerms(text, words);
  if (hits.length === 0) return null;
  return { terms: hits.map((h) => h.term), category: hits.some((h) => h.category === "ACADEMIC_DISHONESTY") ? "ACADEMIC_DISHONESTY" : "GENERAL" };
}

/** Put a match in the review queue and the audit log. Nothing is deleted automatically. */
export async function recordFlag(authorId: string, kind: FlaggedKind, refId: string, text: string, hit: NonNullable<Screening>) {
  await prisma.$transaction([
    prisma.flaggedContent.create({ data: { kind, refId, authorId, text: text.slice(0, 4000), terms: hit.terms, category: hit.category } }),
    audit({ actorId: authorId, action: "CONTENT_FLAGGED", target: refId, after: { kind, terms: hit.terms, category: hit.category } }),
  ]);
}

export async function listFlags(session: Session, status: "PENDING" | "APPROVED" | "REMOVED" = "PENDING") {
  assertAdmin(session);
  const flags = await prisma.flaggedContent.findMany({
    where: { status },
    orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
    take: 100,
    include: { author: { select: { id: true, fullName: true, email: true } } },
  });
  return { flags };
}

/** Admin: publish the flagged content, or remove it. Each decision is audit-logged. */
export async function decideFlag(session: Session, id: string, { decision, note }: { decision: "APPROVE" | "REMOVE"; note?: string }) {
  assertAdmin(session);
  const flag = await prisma.flaggedContent.findUnique({ where: { id } });
  if (!flag) throw new HttpError(404, "Flag not found.");
  if (flag.status !== "PENDING") throw new HttpError(400, "This flag has already been reviewed.");
  const approve = decision === "APPROVE";
  const status = approve ? "APPROVED" : "REMOVED";

  const effects = [];
  if (flag.kind === "COMMISSION") {
    const c = await prisma.commission.findUnique({ where: { id: flag.refId }, select: { status: true } });
    if (c && approve) effects.push(prisma.commission.update({ where: { id: flag.refId }, data: { heldForReview: false } }));
    if (c && !approve && c.status !== "CANCELLED") {
      effects.push(prisma.commission.update({ where: { id: flag.refId }, data: { status: "CANCELLED" } }));
      effects.push(audit(statusChange(session.userId, flag.refId, c.status, "CANCELLED")));
    }
  }
  // A removed message simply stays held, so the recipient never sees it.
  if (flag.kind === "MESSAGE" && approve) effects.push(prisma.message.updateMany({ where: { id: flag.refId }, data: { heldForReview: false } }));
  if (flag.kind === "APPLICATION" && !approve) effects.push(prisma.application.updateMany({ where: { id: flag.refId }, data: { coverLetter: null } }));
  if (flag.kind === "SKILL" && !approve) effects.push(prisma.skill.deleteMany({ where: { id: flag.refId } }));

  await prisma.$transaction([
    prisma.flaggedContent.update({ where: { id }, data: { status, reviewerId: session.userId, reviewNote: note, reviewedAt: new Date() } }),
    audit({ actorId: session.userId, action: approve ? "CONTENT_APPROVED" : "CONTENT_REMOVED", target: flag.refId, before: { status: "PENDING" }, after: { status }, meta: { kind: flag.kind, terms: flag.terms, note } }),
    ...effects,
  ]);
  await notify({
    userId: flag.authorId,
    type: "ACCOUNT_FLAGGED",
    title: approve ? "Your post passed review" : "An admin removed something you posted",
    body: approve ? "It's visible again." : note ?? `It broke the rules (${flag.category === "ACADEMIC_DISHONESTY" ? "no academic work for someone else" : "language or scams"}).`,
    link: flag.kind === "COMMISSION" ? `/commission/${flag.refId}` : undefined,
  });
  return { status };
}

export async function listWords(session: Session) {
  assertAdmin(session);
  return { words: await prisma.flaggedWord.findMany({ orderBy: [{ category: "asc" }, { term: "asc" }] }) };
}

export async function addWord(session: Session, { term, category }: { term: string; category: FlagCategory }) {
  assertAdmin(session);
  if (normalize(term).length < 3) throw new HttpError(400, "Use at least 3 letters; shorter terms would match almost everything.");
  const exists = await prisma.flaggedWord.findUnique({ where: { term } });
  if (exists) throw new HttpError(409, "That term is already on the list.");
  const [word] = await prisma.$transaction([
    prisma.flaggedWord.create({ data: { term, category, createdById: session.userId } }),
    audit({ actorId: session.userId, action: "WORD_ADDED", target: term, after: { term, category } }),
  ]);
  return { word };
}

export async function removeWord(session: Session, id: string) {
  assertAdmin(session);
  const word = await prisma.flaggedWord.findUnique({ where: { id } });
  if (!word) throw new HttpError(404, "Term not found.");
  await prisma.$transaction([
    prisma.flaggedWord.delete({ where: { id } }),
    audit({ actorId: session.userId, action: "WORD_REMOVED", target: word.term, before: { term: word.term, category: word.category } }),
  ]);
  return {};
}
