import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, User, Star } from "lucide-react";
import { getCommissionDetail } from "@/features/commissions/server";
import { listDeliverables } from "@/features/deliverables/server";
import { MarkCompleteButton } from "@/features/ratings/mark-complete-button";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar } from "@/components/ui/avatar";
import { ApplyButton } from "@/features/applications/apply-button";
import { BookmarkButton } from "@/features/commissions/bookmark-button";
import { CoverImageUploader } from "@/features/commissions/cover-image-uploader";
import { WithdrawButton } from "@/features/applications/withdraw-button";
import { DeliverableSection } from "@/features/deliverables/deliverable-section";
import { formatFare } from "@/lib/format";
import { LEVEL_PILL } from "@/lib/labels";

const CAT_COLOR: Record<string, string> = {
  ACADEMIC: "bg-brand-100 text-brand-700",
  TECHNICAL: "bg-info-100 text-info-700",
  GENERAL_ERRANDS: "bg-warning-100 text-warning-700",
  ADMINISTRATIVE: "bg-info-100 text-info-700",
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-brand-100 text-brand-700",
  IN_PROGRESS: "bg-warning-100 text-warning-700",
  COMPLETED: "bg-sunken text-ink",
  CANCELLED: "bg-danger-100 text-danger-700",
};

export default async function CommissionDetail({ params }: { params: Promise<{ id: string }> }) {
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

  const fareDisplay = formatFare(commission);

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-sunken">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>

          <article className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {commission.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={commission.coverImageUrl} alt="" className="h-56 w-full object-cover" />
            )}
            <div className="p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`pill ${CAT_COLOR[commission.category] ?? "bg-sunken text-ink"}`}>
                {commission.category.replace("_", " ")}
              </span>
              {commission.subcategory && (
                <span className="pill bg-sunken text-ink">{commission.subcategory}</span>
              )}
              <span className={`pill ${LEVEL_PILL[commission.requiredLevel]}`}>{commission.requiredLevel}</span>
              <span className={`pill ${STATUS_COLOR[commission.status]}`}>{commission.status.replace("_", " ")}</span>
            </div>

            <h1 className="text-3xl font-bold">{commission.title}</h1>
            <p className="mt-2 text-2xl font-bold text-brand-600">{fareDisplay}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {commission.deadline
                  ? `Deadline: ${new Date(commission.deadline).toLocaleDateString()}`
                  : "No deadline set"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" /> {commission._count.applications} applicant{commission._count.applications === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> CSU Caraga
              </span>
            </div>

            <div className="my-6 border-t border-line" />

            <h2 className="mb-2 text-lg font-bold">Description</h2>
            <p className="whitespace-pre-line text-sm text-ink">{commission.description}</p>

            <div className="my-6 border-t border-line" />

            <h2 className="mb-3 text-lg font-bold">Posted by</h2>
            <Link href={`/u/${commission.commissioner.id}`} className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-sunken">
              <Avatar name={commission.commissioner.fullName} src={commission.commissioner.avatarUrl} size="md" />
              <div>
                <p className="font-semibold hover:text-brand-600">{commission.commissioner.fullName}</p>
                <p className="text-xs text-muted">
                  {commission.commissioner._count.postedCommissions} commissions posted
                  {commissionerAvg != null && (
                    <span className="ml-2">
                      <Star className="mr-1 inline h-3 w-3 fill-warning-400 text-warning-400" />
                      {commissionerAvg.toFixed(1)}
                    </span>
                  )}
                </p>
              </div>
            </Link>

            <div className="mt-8 flex flex-wrap gap-3">
              {!session ? (
                <Link href="/login" className="btn-primary">Login to apply</Link>
              ) : isOwner ? (
                <Link href="/commissioner/applicants" className="btn-primary">Manage applicants</Link>
              ) : commission.status !== "OPEN" ? (
                <ApplyButton commissionId={commission.id} disabled label={`This commission is ${commission.status.replace("_", " ").toLowerCase()}`} />
              ) : alreadyApplied && !canWithdraw ? (
                <ApplyButton commissionId={commission.id} disabled label={`Application ${myApplication?.status.toLowerCase()}`} />
              ) : alreadyApplied ? (
                <>
                  <ApplyButton commissionId={commission.id} disabled label="Application pending" />
                  <WithdrawButton applicationId={myApplication!.id} />
                </>
              ) : (
                <ApplyButton commissionId={commission.id} />
              )}
              {session && !isOwner && (
                <BookmarkButton commissionId={commission.id} initialSaved={initialSaved} />
              )}
            </div>

            {isOwner && (
              <div className="mt-8 border-t border-line pt-6">
                <h2 className="mb-3 text-lg font-bold">Cover Image</h2>
                <CoverImageUploader commissionId={commission.id} initialUrl={commission.coverImageUrl} />
              </div>
            )}

            {(isOwner || isAwardedStudent) && commission.awardedToId && (
              <div className="mt-8 border-t border-line pt-6">
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
              </div>
            )}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
