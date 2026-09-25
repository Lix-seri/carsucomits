"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function ApplicantDecisionButtons({ applicationId, applicantName }: { applicationId: string; applicantName: string }) {
  const router = useRouter();

  async function decide(kind: "accept" | "decline") {
    const res = await api(`/api/applications/${applicationId}/${kind}`, { method: "POST" });
    if (!res.ok) return res.error;
    router.refresh();
    return null;
  }

  return (
    <div className="flex gap-2">
      <ConfirmButton
        title={`Accept ${applicantName}?`}
        message="The other pending applicants will be declined, and the commission moves to In Progress."
        confirmLabel="Accept applicant"
        onConfirm={() => decide("accept")}
        className="btn-primary !px-4 !py-1.5"
      >
        Accept
      </ConfirmButton>
      <ConfirmButton
        title={`Decline ${applicantName}?`}
        message="They'll be told their application wasn't selected."
        confirmLabel="Decline"
        danger
        onConfirm={() => decide("decline")}
        className="rounded-lg border border-danger-100 bg-white px-4 py-1.5 text-sm font-semibold text-danger-600 hover:bg-danger-50"
      >
        Decline
      </ConfirmButton>
    </div>
  );
}
