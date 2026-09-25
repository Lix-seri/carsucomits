import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Star, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { formatFare } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge, CategoryBadge, CommissionStatusBadge, LevelBadge } from "@/components/ui/badge";
import { getCommissionDetail } from "@/features/commissions/server";
import { listDeliverables } from "@/features/deliverables/server";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { ApplyButton } from "@/features/applications/apply-button";
import { BookmarkButton } from "@/features/commissions/bookmark-button";
import { CoverImageUploader } from "@/features/commissions/cover-image-uploader";
import { CommissionProgress } from "@/features/commissions/commission-progress";
import { WithdrawButton } from "@/features/applications/withdraw-button";
import { DeliverableSection } from "@/features/deliverables/deliverable-section";
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

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <article className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {commission.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={commission.coverImageUrl} alt="" className="aspect-video max-h-72 w-full object-cover" />
        )}
        <div className="space-y-6 p-5 sm:p-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <CommissionStatusBadge status={commission.status} />
              <CategoryBadge category={commission.category} />
              {commission.subcategory && <Badge>{commission.subcategory}</Badge>}
              <LevelBadge level={commission.requiredLevel} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{commission.title}</h1>
            <p className="tabular text-2xl font-semibold text-brand-700">{formatFare(commission)}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <li className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {commission.deadline ? `Due ${new Date(commission.deadline).toLocaleDateString("en-PH", { dateStyle: "medium" })}` : "No deadline"}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {applicants} applicant{applicants === 1 ? "" : "s"}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> CSU Caraga
              </li>
            </ul>
          </header>

          <CommissionProgress status={commission.status} />

          <div className="flex flex-wrap items-center gap-3">
            {!session ? (
              <Link href={`/login?next=${encodeURIComponent(`/commission/${commission.id}`)}`} className="btn-primary">Sign in to apply</Link>
            ) : isOwner ? (
              <Link href={`/commissioner/applicants?commissionId=${commission.id}`} className="btn-primary">
                Review applicants ({applicants})
              </Link>
            ) : commission.status !== "OPEN" ? (
              <ApplyButton commissionId={commission.id} disabled label={`${COMMISSION_STATUS[commission.status]?.label ?? commission.status}: not taking applications`} />
            ) : alreadyApplied && !canWithdraw ? (
              <ApplyButton commissionId={commission.id} disabled label={`Application ${APPLICATION_STATUS[myApplication!.status]?.label.toLowerCase()}`} />
            ) : alreadyApplied ? (
              <>
                <ApplyButton commissionId={commission.id} disabled label="Application sent" />
                <WithdrawButton applicationId={myApplication!.id} />
              </>
            ) : (
              <ApplyButton commissionId={commission.id} />
            )}
            {session && !isOwner && <BookmarkButton commissionId={commission.id} initialSaved={initialSaved} />}
          </div>

          <section className="border-t border-line pt-6">
            <h2 className="mb-2 font-semibold">Description</h2>
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-ink">{commission.description}</p>
          </section>

          <section className="border-t border-line pt-6">
            <h2 className="mb-3 font-semibold">Posted by</h2>
            <Link href={`/u/${commission.commissioner.id}`} className="-mx-2 inline-flex items-center gap-3 rounded-lg p-2 hover:bg-sunken">
              <Avatar name={commission.commissioner.fullName} src={commission.commissioner.avatarUrl} size="md" />
              <span>
                <span className="block font-semibold">{isOwner ? "You" : commission.commissioner.fullName}</span>
                <span className="flex items-center gap-2 text-xs text-muted">
                  {commissionerAvg != null ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" /> {commissionerAvg.toFixed(1)}
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

          {isOwner && (
            <section className="border-t border-line pt-6">
              <h2 className="mb-3 font-semibold">Cover image</h2>
              <CoverImageUploader commissionId={commission.id} initialUrl={commission.coverImageUrl} />
            </section>
          )}

          {(isOwner || isAwardedStudent) && commission.awardedToId && (
            <section className="border-t border-line pt-6">
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
    </div>
  );
}
