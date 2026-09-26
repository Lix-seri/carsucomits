import Link from "next/link";
import { BadgeCheck, Clock } from "lucide-react";
import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { getMyVerification } from "@/features/verification/server";
import { VerifyForm } from "@/features/verification/verify-form";

export const metadata = { title: "Verification" };

export default async function VerifyPage() {
  const session = await pageSession();
  const { verifiedAt, latest } = await getMyVerification(session);
  const when = (d: Date) => d.toLocaleDateString("en-PH", { dateStyle: "medium" });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="CCIS verification"
        description="Only verified CCIS students can apply to and work on commissions. Anyone can browse and post."
      />
      {verifiedAt ? (
        <section className="flex gap-3 rounded-xl border border-line bg-white p-5">
          <BadgeCheck className="h-6 w-6 shrink-0 text-brand-600" />
          <div>
            <p className="font-semibold">You&apos;re verified</p>
            <p className="text-sm text-muted">Since {when(verifiedAt)}. Your profile shows the CCIS verified badge.</p>
            <Link href="/browse" className="btn-primary mt-4">Find commissions</Link>
          </div>
        </section>
      ) : latest?.status === "PENDING" ? (
        <section className="flex gap-3 rounded-xl border border-line bg-white p-5">
          <Clock className="h-6 w-6 shrink-0 text-warning-600" />
          <div>
            <p className="font-semibold">Waiting for review</p>
            <p className="text-sm text-muted">
              Sent {when(latest.createdAt)} with student ID {latest.studentIdNumber}. You&apos;ll get a notification when it&apos;s decided.
            </p>
          </div>
        </section>
      ) : (
        <>
          {latest?.status === "REJECTED" && (
            <p role="status" className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              Your last request wasn&apos;t approved{latest.reviewNote ? `: ${latest.reviewNote}` : "."} Fix it and send a new one.
            </p>
          )}
          {latest?.status === "REVOKED" && (
            <p role="status" className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              Your seller status is suspended{latest.reviewNote ? `: ${latest.reviewNote}` : "."} Contact the USED office to be reinstated.
            </p>
          )}
          {latest?.status !== "REVOKED" && <VerifyForm />}
        </>
      )}
    </div>
  );
}
