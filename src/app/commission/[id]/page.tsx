import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, User, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Avatar } from "@/components/avatar";
import { ApplyButton } from "@/components/apply-button";

const CAT_COLOR: Record<string, string> = {
  ACADEMIC: "bg-emerald-100 text-emerald-700",
  TECHNICAL: "bg-blue-100 text-blue-700",
  GENERAL_ERRANDS: "bg-amber-100 text-amber-700",
  ADMINISTRATIVE: "bg-purple-100 text-purple-700",
};
const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: "bg-slate-100 text-slate-700",
  INTERMEDIATE: "bg-amber-100 text-amber-800",
  ADVANCED: "bg-blue-100 text-blue-800",
  EXPERT: "bg-purple-100 text-purple-800",
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function CommissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const commission = await prisma.commission.findUnique({
    where: { id },
    include: {
      commissioner: {
        select: { id: true, fullName: true, avatarUrl: true, _count: { select: { postedCommissions: true } } },
      },
      _count: { select: { applications: true } },
    },
  });
  if (!commission) notFound();

  const commissionerRating = await prisma.rating.aggregate({
    where: { rateeId: commission.commissionerId },
    _avg: { stars: true },
  });

  const isOwner = session?.userId === commission.commissionerId;
  const alreadyApplied = session
    ? !!(await prisma.application.findUnique({
        where: {
          commissionId_applicantId: { commissionId: commission.id, applicantId: session.userId },
        },
      }))
    : false;

  const fareDisplay = commission.fareMax
    ? `₱${commission.fareMin}–${commission.fareMax}${commission.fareUnit ?? ""}`
    : `₱${commission.fareMin}${commission.fareUnit ?? ""}`;

  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>

          <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`pill ${CAT_COLOR[commission.category] ?? "bg-slate-100 text-slate-700"}`}>
                {commission.category.replace("_", " ")}
              </span>
              {commission.subcategory && (
                <span className="pill bg-slate-100 text-slate-700">{commission.subcategory}</span>
              )}
              <span className={`pill ${LEVEL_COLOR[commission.requiredLevel]}`}>{commission.requiredLevel}</span>
              <span className={`pill ${STATUS_COLOR[commission.status]}`}>{commission.status.replace("_", " ")}</span>
            </div>

            <h1 className="text-3xl font-bold">{commission.title}</h1>
            <p className="mt-2 text-2xl font-bold text-brand-600">{fareDisplay}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
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

            <div className="my-6 border-t border-slate-100" />

            <h2 className="mb-2 text-lg font-bold">Description</h2>
            <p className="whitespace-pre-line text-sm text-slate-700">{commission.description}</p>

            <div className="my-6 border-t border-slate-100" />

            <h2 className="mb-3 text-lg font-bold">Posted by</h2>
            <Link href={`/u/${commission.commissioner.id}`} className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
              <Avatar name={commission.commissioner.fullName} src={commission.commissioner.avatarUrl} size="md" />
              <div>
                <p className="font-semibold hover:text-brand-600">{commission.commissioner.fullName}</p>
                <p className="text-xs text-slate-500">
                  {commission.commissioner._count.postedCommissions} commissions posted
                  {commissionerRating._avg.stars != null && (
                    <span className="ml-2">
                      <Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400" />
                      {commissionerRating._avg.stars.toFixed(1)}
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
              ) : alreadyApplied ? (
                <ApplyButton commissionId={commission.id} disabled label="Already applied ✓" />
              ) : (
                <ApplyButton commissionId={commission.id} />
              )}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
