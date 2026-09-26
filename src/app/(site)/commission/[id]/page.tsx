import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, Star, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { dueLabel, formatFare } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/layout/back-button";
import { Badge, CommissionStatusBadge } from "@/components/ui/badge";
import { CategoryBadge, CategoryIcon, LevelPips, categoryStyle } from "@/components/ui/category";
import { getCommissionDetail } from "@/features/commissions/server";
import { listDeliverables } from "@/features/deliverables/server";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { ApplyButton } from "@/features/applications/apply-button";
import { BookmarkButton } from "@/features/commissions/bookmark-button";
import { CoverImageUploader } from "@/features/commissions/cover-image-uploader";
import { CommissionProgress } from "@/features/commissions/commission-progress";
import { WithdrawButton } from "@/features/applications/withdraw-button";
import { DeliverableSection } from "@/features/deliverables/deliverable-section";
import { getAgreement } from "@/features/agreements/server";
import { AgreementPanel } from "@/features/agreements/agreement-panel";
import { snapshotTerms, type AgreementTerms } from "@/features/agreements/agreement";
import { ReportCommissionButton } from "@/features/reports/report-commission-button";
import { APPLICATION_STATUS, COMMISSION_STATUS } from "@/lib/labels";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getCommissionDetail((await params).id, null);
  return { title: detail?.commission.title ?? "Commission not found" };
}

export default async function CommissionDetail({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const detail = await getCommissionDetail(id, session);
  if (!detail) notFound();
  const { commission, commissionerAvg, myApplication, saved: initialSaved, awardeeName } = detail;

  const isOwner = session?.userId === commission.commissionerId;
  const alreadyApplied = !!myApplication && myApplication.status !== "WITHDRAWN";
  const canWithdraw = !!myApplication && myApplication.status === "PENDING";
  const isAwardedStudent = session?.userId === commission.awardedToId;
  const deliverables = isOwner || isAwardedStudent ? await listDeliverables(commission.id) : [];
  const posted = commission.commissioner._count.postedCommissions;
  const applicants = commission._count.applications;
  const agreement = commission.awardedToId ? await getAgreement(session, commission.id) : null;
  const acceptedAt = (userId: string | null) => agreement?.acceptances.find((a) => a.userId === userId)?.acceptedAt.toISOString() ?? null;

  // The one action this person can take here.
  const action = !session ? (
    <Link href={`/login?next=${encodeURIComponent(`/commission/${commission.id}`)}`} className="btn-primary w-full">Sign in to apply</Link>
  ) : isOwner ? (
    <Link href={`/hiring/applicants?commissionId=${commission.id}`} className="btn-primary w-full">Review applicants ({applicants})</Link>
  ) : commission.status !== "OPEN" ? (
    <ApplyButton commissionId={commission.id} disabled label={`${COMMISSION_STATUS[commission.status]?.label ?? commission.status}: not taking applications`} />
  ) : !session.verified && !alreadyApplied ? (
    <>
      <Link href="/verify" className="btn-primary w-full">Verify to apply</Link>
      <p className="text-sm text-muted">Only verified CCIS students can take on commissions.</p>
    </>
  ) : alreadyApplied && !canWithdraw ? (
    <ApplyButton commissionId={commission.id} disabled label={`Application ${APPLICATION_STATUS[myApplication!.status]?.label.toLowerCase()}`} />
  ) : alreadyApplied ? (
    <>
      <ApplyButton commissionId={commission.id} disabled label="Application sent" />
      <WithdrawButton applicationId={myApplication!.id} />
    </>
  ) : (
    <ApplyButton commissionId={commission.id} />
  );

  return (
    <div className="mx-auto max-w-6xl">
      <BackButton fallback="/browse" label="Back" />

      <div className="mt-4 grid grid-cols-1 items-start gap-6 lg:grid-cols-content-aside">
        <article className="min-w-0 overflow-hidden rounded-3xl border-2 border-line bg-surface shadow-card">
          <span aria-hidden className={cn("block h-2 w-full", categoryStyle(commission.category).strip)} />
          {commission.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={commission.coverImageUrl} alt="" className="aspect-video max-h-80 w-full object-cover" />
          )}
          <div className="space-y-8 p-5 sm:p-8">
            <header>
              <div className="flex items-center gap-3">
                <CategoryIcon category={commission.category} size="lg" />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <CategoryBadge category={commission.category} icon={false} />
                  {commission.subcategory && <Badge>{commission.subcategory}</Badge>}
                  <LevelPips level={commission.requiredLevel} />
                  <CommissionStatusBadge status={commission.status} />
                </div>
              </div>
              <h1 className="display mt-4 text-3xl sm:text-4xl">{commission.title}</h1>
            </header>

            {commission.heldForReview && (
              <p role="status" className="rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">
                <span className="font-semibold">Under review.</span> Something in this post matched the flagged-words list, so only you and the admins can see it until an admin checks it.
              </p>
            )}

            <CommissionProgress status={commission.status} />

            {agreement && session && commission.awardedToId && (
              <AgreementPanel
                commissionId={commission.id}
                pending={commission.status === "AGREEMENT_PENDING"}
                meId={session.userId}
                // What they accepted, once someone has; until then, the terms as they stand.
                terms={(agreement.acceptances[0]?.terms as AgreementTerms | undefined) ?? snapshotTerms(commission)}
                parties={[
                  { id: commission.commissionerId, name: commission.commissioner.fullName, role: "poster", acceptedAt: acceptedAt(commission.commissionerId) },
                  { id: commission.awardedToId, name: awardeeName ?? "The hired student", role: "hired", acceptedAt: acceptedAt(commission.awardedToId) },
                ]}
              />
            )}

            <section aria-labelledby="description">
              <h2 id="description" className="mb-2 font-display text-xl font-bold">What needs doing</h2>
              <p className="max-w-prose whitespace-pre-line leading-relaxed text-ink">{commission.description}</p>
            </section>

            {isOwner && (
              <section aria-labelledby="cover">
                <h2 id="cover" className="mb-3 font-display text-xl font-bold">Cover image</h2>
                <CoverImageUploader commissionId={commission.id} initialUrl={commission.coverImageUrl} />
              </section>
            )}

            {(isOwner || isAwardedStudent) && commission.awardedToId && (
              <section>
                <DeliverableSection
                  commissionId={commission.id}
                  isOwner={isOwner}
                  isAwardedStudent={isAwardedStudent}
                  commissionStatus={commission.status}
                  initialDeliverables={deliverables.map((d) => ({
                    id: d.id,
                    fileUrl: d.fileUrl,
                    fileName: d.fileName,
                    fileSize: d.fileSize,
                    message: d.message,
                    status: d.status,
                    reviewerNotes: d.reviewerNotes,
                    submittedAt: d.submittedAt.toISOString(),
                    reviewedAt: d.reviewedAt?.toISOString() ?? null,
                    submitter: { fullName: d.submitter.fullName, avatarUrl: d.submitter.avatarUrl },
                  }))}
                />
                {isOwner && (commission.status === "IN_PROGRESS" || commission.status === "AWAITING_REVIEW") && (
                  <div className="mt-6 max-w-xs">
                    <MarkCompleteButton commissionId={commission.id} commissionTitle={commission.title} awardedToName={awardeeName} />
                  </div>
                )}
              </section>
            )}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-label="Fare and deadline" className="rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
            <p className="font-display text-4xl font-extrabold tabular text-brand-700">{formatFare(commission)}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              <li className="flex items-center gap-2"><CalendarClock aria-hidden className="h-4 w-4" /> <span className="font-semibold text-ink">{dueLabel(commission.deadline)}</span></li>
              <li className="flex items-center gap-2"><Users aria-hidden className="h-4 w-4" /> {applicants === 0 ? "No applicants yet" : `${applicants} applicant${applicants === 1 ? "" : "s"}`}</li>
              <li className="flex items-center gap-2"><MapPin aria-hidden className="h-4 w-4" /> CSU Main</li>
            </ul>
            <div className="mt-5 flex flex-col gap-2">{action}</div>
            {session && !isOwner && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <BookmarkButton commissionId={commission.id} initialSaved={initialSaved} />
                <ReportCommissionButton commissionId={commission.id} />
              </div>
            )}
          </section>

          <section aria-labelledby="poster" className="rounded-3xl border-2 border-line bg-surface p-5">
            <h2 id="poster" className="mb-3 text-sm font-bold text-muted">Posted by</h2>
            <Link href={`/u/${commission.commissioner.id}`} className="-m-2 flex items-center gap-3 rounded-2xl p-2 hover:bg-sunken">
              <Avatar name={commission.commissioner.fullName} src={commission.commissioner.avatarUrl} size="md" />
              <span className="min-w-0">
                <span className="block font-semibold">{isOwner ? "You" : commission.commissioner.fullName}</span>
                <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  {commissionerAvg != null ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <Star aria-hidden className="h-3.5 w-3.5 fill-gold-400 text-gold-500" /> {commissionerAvg.toFixed(1)}
                    </span>
                  ) : (
                    <span>No ratings yet</span>
                  )}
                  <span aria-hidden>·</span>
                  {posted} commission{posted === 1 ? "" : "s"} posted
                </span>
              </span>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
