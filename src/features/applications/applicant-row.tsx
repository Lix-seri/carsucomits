import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvailabilityBadge, VerifiedBadge } from "@/components/ui/badge";
import { ApplicationStatusBadge } from "@/components/ui/badge";
import { ApplicantDecisionButtons } from "./applicant-decision-buttons";

type Application = {
  id: string;
  status: string;
  coverLetter: string | null;
  applicant: { id: string; fullName: string; avatarUrl: string | null; verifiedAt?: Date | null };
  commission: { id: string; title: string; status: string };
};

/** One applicant: who, how they're rated, what they said, and the decision. Stacks on phones. */
export function ApplicantRow({ a, avg, activeJobs, showCommission = true }: { a: Application; avg: number | null | undefined; activeJobs?: number; showCommission?: boolean }) {
  const decidable = a.status === "PENDING" && a.commission.status === "OPEN";
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <Link href={`/u/${a.applicant.id}`} className="shrink-0">
          <Avatar name={a.applicant.fullName} src={a.applicant.avatarUrl} size="sm" />
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/u/${a.applicant.id}`} className="font-semibold hover:text-brand-700">{a.applicant.fullName}</Link>
            {a.applicant.verifiedAt && <VerifiedBadge />}
            {activeJobs !== undefined && <AvailabilityBadge activeJobs={activeJobs} />}
            {avg != null ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold">
                <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" /> {avg.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs text-muted">No reviews yet</span>
            )}
            {!decidable && <ApplicationStatusBadge status={a.status} />}
          </div>
          {showCommission && (
            <p className="text-sm text-muted">
              for <Link href={`/commission/${a.commission.id}`} className="font-medium text-brand-700 hover:underline">{a.commission.title}</Link>
            </p>
          )}
          {a.coverLetter && <p className="mt-2 max-w-prose text-sm text-ink">&ldquo;{a.coverLetter}&rdquo;</p>}
        </div>
      </div>
      {decidable && (
        <div className="shrink-0">
          <ApplicantDecisionButtons applicationId={a.id} applicantName={a.applicant.fullName} />
        </div>
      )}
    </li>
  );
}
